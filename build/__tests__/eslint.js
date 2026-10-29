/* @noflow */
/* eslint-disable import/no-nodejs-modules */

import test from 'ava';
import { ESLint } from 'eslint';

const eslint = new ESLint();

async function lint(source, filePath = 'lib/utils/lintFixture.js') {
	const [result] = await eslint.lintText(source, { filePath });
	return result.messages;
}

test('ESLint ignores generated and vendor code but includes the vendor entry point', async t => {
	t.true(await eslint.isPathIgnored('dist/chrome/foreground.entry.js'));
	t.true(await eslint.isPathIgnored('lib/vendor/thirdParty.js'));
	t.true(await eslint.isPathIgnored('node_modules/example/index.js'));
	t.false(await eslint.isPathIgnored('lib/vendor/index.js'));
});

test('ESLint covers JavaScript tooling extensions as modules', async t => {
	const configs = await Promise.all(['build.js', 'build/i18nTransformer.cjs', 'ava.config.mjs']
		.map(file => eslint.calculateConfigForFile(file)));
	for (const config of configs) {
		t.is(config.languageOptions.sourceType, 'module');
		t.is(config.rules['no-undef'][0], 2);
		t.is(config.rules['local/flow-file-annotation'][0], 2);
	}
});

test('ESLint parses modern Flow types, casts, optional chaining and import attributes', async t => {
	const messages = await lint([
		'/* @flow */',
		'import packageInfo from \'../../package.json\' with { type: \'json\' };',
		'',
		'export type Fixture = { readonly value: ?string, keys: keyof { a: 1 }, items: ReadonlyArray<Iterable<unknown>>, ... };',
		'export function isString(value: unknown): value is string { return typeof value === \'string\'; }',
		'export function first<T extends { readonly length: number }>(value: T): T { return value; }',
		'export const fixture = (packageInfo.version as string)?.trim();',
		'',
	].join('\n'));

	t.deepEqual(messages, []);
});

test('ESLint reports undefined values but not Flow library types', async t => {
	const messages = await lint('/* @flow */\nexport const fixture: Iterable<TimeoutID> = undefinedValue;\n');

	t.deepEqual(messages.filter(message => message.ruleId === 'no-undef').map(message => message.message), ['\'undefinedValue\' is not defined.']);
});

const restrictedMessages = messages => messages.filter(message => message.ruleId === 'no-restricted-syntax').map(message => message.message);

test('ESLint still requires Flow annotations', async t => {
	const unannotated = await lint('export const fixture = 1;\n');
	const lateAnnotation = await lint('export const fixture = 1;\n/* @flow */\n');
	const annotated = await Promise.all(['/* @flow */', '// @flow', '/* @flow strict */', '/* @noflow */']
		.map(annotation => lint(`${annotation}\nexport const fixture = 1;\n`)));

	t.true(unannotated.some(message => message.ruleId === 'local/flow-file-annotation'));
	t.true(lateAnnotation.some(message => message.ruleId === 'local/flow-file-annotation'));
	for (const messages of annotated) t.deepEqual(messages, []);
});

test('ESLint enforces Flow type conventions', async t => {
	t.deepEqual(restrictedMessages(await lint('/* @flow */\nexport type Fixture = Boolean | Number | String;\n')),
		Array(3).fill('Use the primitive type (`boolean`, `number`, `string`) instead of its constructor type.'));
	t.deepEqual(restrictedMessages(await lint('/* @flow */\nexport type Fixture = Function | Object;\n')),
		Array(2).fill('Unexpected weak type; use a specific function or object type.'));
	t.deepEqual(restrictedMessages(await lint('/* @flow */\ntype fixture = string;\nopaque type FIXTURE = string;\nexport type Fixture = fixture | FIXTURE;\n')),
		Array(2).fill('Type names must be PascalCase.'));
	t.deepEqual(restrictedMessages(await lint('/* @flow */\nimport { type Fixture } from \'./lintFixture\';\nexport type Value = Fixture;\n')),
		['Import types with an `import type { ... }` declaration.']);
	t.deepEqual(restrictedMessages(await lint('/* @flow */\nimport type { Fixture } from \'./lintFixture\';\nexport type Value = Fixture;\n')), []);
});

test('ESLint limits WebExtension globals to the environment layer', async t => {
	const source = '/* @flow */\nexport const fixture = chrome.runtime;\n';
	const environment = await lint(source, 'lib/environment/background/lintFixture.js');
	const utility = await lint(source);

	t.false(environment.some(message => message.ruleId === 'no-undef'));
	t.true(utility.some(message => message.ruleId === 'no-undef'));
});

test('ESLint preserves integration, example and Flow declaration overrides', async t => {
	const integration = await eslint.calculateConfigForFile('tests/lintFixture.js');
	const example = await eslint.calculateConfigForFile('examples/lintFixture.js');
	const declaration = await eslint.calculateConfigForFile('flow/lintFixture.js');

	t.is(integration.rules['local/flow-file-annotation'][0], 0);
	t.is(integration.rules['import/no-commonjs'][0], 0);
	t.is(example.rules['import/no-unresolved'][0], 0);
	t.is(declaration.rules['no-unused-vars'][0], 0);

	const weakTypes = '/* @flow */\nexport type Fixture = Function;\n';
	const typeName = '/* @flow */\nexport type fixture = string;\n';
	t.deepEqual(restrictedMessages(await lint(weakTypes, 'flow/lintFixture.js')), []);
	t.deepEqual(restrictedMessages(await lint(typeName, 'flow/lintFixture.js')), ['Type names must be PascalCase.']);
	t.deepEqual(restrictedMessages(await lint(typeName, 'flow/lib/lintFixture.js')), []);
	t.is(restrictedMessages(await lint('/* @flow */\nexport type Fixture = String;\n', 'flow/lib/lintFixture.js')).length, 1);
});

test('ESLint continues enforcing import layer boundaries', async t => {
	const messages = await lint('/* @flow */\nimport \'../modules/nightMode\';\n');

	t.true(messages.some(message => message.ruleId === 'import/no-restricted-paths'));
});

test('ESLint compatibility wrappers preserve legacy assignment and spread rules', async t => {
	const assignment = await lint('/* @flow */\nexport function fixture() {\n\tconst value = 1;\n\treturn value;\n}\n');
	const spread = await lint('/* @flow */\nexport const fixture = Object.assign({}, { value: 1 });\n');

	t.true(assignment.some(message => message.ruleId === 'no-useless-assign/no-useless-assign'));
	t.true(spread.some(message => message.ruleId === 'prefer-spread/prefer-object-spread'));
});

test('ESLint compatibility wrappers preserve dollar, filename and lodash rules', async t => {
	const dollar = await lint('/* @flow */\nimport $ from \'jquery\';\n\nexport const element = $(document.body);\n');
	const filename = await lint('/* @flow */\nexport default function differentlyNamed() {}\n');
	const lodashMessages = await lint('/* @flow */\nimport _ from \'lodash-es\';\n\nexport const fixture = _.map([1], value => value + 1);\n');

	t.true(dollar.some(message => message.ruleId === 'dollar-sign/dollar-sign'));
	t.true(filename.some(message => message.ruleId === 'filenames/match-exported'));
	t.true(lodashMessages.some(message => message.ruleId === 'you-dont-need-lodash-underscore/map'));
});

test('ESLint keeps the previous unused catch parameter policy', async t => {
	const messages = await lint('/* @flow */\ntry {\n\tJSON.parse(\'invalid\');\n} catch (error) {\n\tconsole.log(\'invalid JSON\');\n}\n');

	t.false(messages.some(message => message.ruleId === 'no-unused-vars'));
});

test('ESLint continues enforcing AVA test rules', async t => {
	const messages = await lint('/* @flow */\nimport test from \'ava\';\n\ntest.only(\'fixture\', t => {\n\tt.true(true);\n});\n', 'build/__tests__/lintFixture.js');

	t.true(messages.some(message => message.ruleId === 'ava/no-only-test'));
});

test('ESLint can autofix legacy dollar-sign violations and their references', async t => {
	const fixer = new ESLint({ fix: true });
	const source = '/* @flow */\nimport $ from \'jquery\';\n\nconst element = $(document.body);\nconsole.log(element);\n';
	const [result] = await fixer.lintText(source, { filePath: 'lib/utils/lintFixture.js' });

	t.deepEqual(result.messages, []);
	t.is(result.output, source.replaceAll('element', '$element'));
});
