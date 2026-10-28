/* @noflow */
/* eslint-disable import/no-nodejs-modules */

import { fileURLToPath } from 'node:url';
import test from 'ava';
import stylelint from 'stylelint';

const codeFilename = 'lib/css/lintFixture.scss';

test('Stylelint shared configs use only the root SCSS plugin and supported rules', async t => {
	const config = await stylelint.resolveConfig(codeFilename);
	const scssPlugins = config.plugins.filter(plugin => plugin.includes('stylelint-scss'));

	t.deepEqual([...new Set(scssPlugins)], [fileURLToPath(import.meta.resolve('stylelint-scss'))]);
	t.is(config.rules['scss/at-import-partial-extension'], undefined);
	t.deepEqual(config.rules['scss/load-partial-extension'], ['never']);
	t.deepEqual(config.rules['string-no-newline'], [true]);
});

test('Stylelint preserves SCSS syntax and existing selector naming exceptions', async t => {
	const { errored, results } = await stylelint.lint({
		code: '$fixture: 2;\n\n.CamelCase #fixture {\n\twidth: $fixture * 1px;\n}\n',
		codeFilename,
	});

	t.false(errored);
	t.deepEqual(results[0].warnings, []);
});

for (const directive of ['import', 'use', 'forward']) {
	test(`Stylelint preserves extensionless @${directive} and rejects partial extensions`, async t => {
		const valid = await stylelint.lint({
			code: `@${directive} 'fixture';\n`,
			codeFilename,
		});
		const invalid = await stylelint.lint({
			code: `@${directive} 'fixture.scss';\n`,
			codeFilename,
		});

		t.false(valid.errored);
		t.deepEqual(valid.results[0].warnings, []);
		t.true(invalid.errored);
		t.true(invalid.results[0].warnings.some(warning => warning.rule === 'scss/load-partial-extension'));
	});
}

test('Stylelint continues allowing plain CSS imports', async t => {
	const { errored, results } = await stylelint.lint({
		code: '@import \'fixture.css\';\n',
		codeFilename,
	});

	t.false(errored);
	t.deepEqual(results[0].warnings, []);
});
