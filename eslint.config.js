/* @flow */
/* eslint-disable import/no-nodejs-modules */

import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import ava from 'eslint-plugin-ava';
import dollarSign from 'eslint-plugin-dollar-sign';
import filenames from 'eslint-plugin-filenames';
import importPlugin from 'eslint-plugin-import-x';
import noUselessAssign from 'eslint-plugin-no-useless-assign';
import preferSpread from 'eslint-plugin-prefer-spread';
import lodash from 'eslint-plugin-you-dont-need-lodash-underscore';
import globals from 'globals';
import * as hermesParser from 'hermes-eslint';

// hermes-eslint is Flow's official ESLint parser and supports current Flow syntax (`as` casts, `readonly`, `keyof`, ...).
// Its scope manager predates a few ESLint 10 expectations, which are bridged here without changing the AST.
const flowParser = {
	meta: { name: 'hermes-eslint-compat' },
	parseForESLint(code /*: string */, options /*: any */) /*: any */ {
		const result /*: any */ = hermesParser.parseForESLint(code, options);
		const { globalScope, scopes } = result.scopeManager;
		// ESLint 10 reads implicit globals from `scope.implicit`.
		if (globalScope && globalScope.implicit === undefined && globalScope.__implicit) {
			// $FlowFixMe[object-this-reference] the getter is only ever invoked on `globalScope`
			Object.defineProperty(globalScope, 'implicit', { get() { return this.__implicit; } });
		}
		// ESLint 10's no-unused-vars expects every `ClassName` definition to have a class body; `declare class` has an object type body.
		for (const scope of scopes) {
			for (const variable of scope.variables) {
				for (const def of variable.defs) {
					if (def.type === 'ClassName' && def.node.type === 'DeclareClass' && !def.node.body.body) {
						Object.defineProperty(def.node.body, 'body', { value: [], enumerable: false });
					}
				}
			}
		}
		// Global Flow types (e.g. `Iterable`, `Class`, `TimeoutID`) come from libdefs, not JS globals. Like the previous
		// `flowtype/define-flow-type` rule, keep unresolved type-only references from being reported by `no-undef`.
		if (globalScope) {
			globalScope.through = globalScope.through.filter(reference => !(reference.isTypeReference && !reference.isValueReference));
		}
		return result;
	},
};

// Every file must opt in to (`@flow`) or out of (`@noflow`) Flow checking in a comment before any code.
const flowFileAnnotation = {
	meta: {
		schema: [],
		messages: { missing: 'Flow file annotation is missing; start the file with `/* @flow */` or `/* @noflow */`.' },
	},
	create: (context /*: any */) /*: any */ => ({
		Program(program /*: any */) {
			const { sourceCode } = context;
			const firstToken = sourceCode.getFirstToken(program);
			const annotated = sourceCode.getAllComments().some(comment =>
				(!firstToken || comment.range[1] <= firstToken.range[0]) && (/^\s*@(?:no)?flow\b/).test(comment.value),
			);
			if (!annotated) context.report({ loc: { line: 1, column: 0 }, messageId: 'missing' });
		},
	}),
};

const restrictedSyntax = [{
	selector: 'ForStatement',
	message: 'No C-style for-loops; use for..of or Array.prototype methods.',
}, {
	selector: 'AssignmentExpression[left.property.name=\'options\'] > ObjectExpression > Property > Literal.key[value=/ /]',
	message: 'No spaces in option names.',
}, {
	selector: 'Property[key.name=\'options\'] > ObjectExpression > Property > Literal.key[value=/ /]',
	message: 'No spaces in option names.',
}, {
	selector: 'ForInStatement',
	message: 'No for-in loops; use for..of with Object.keys/values/entries.',
}, {
	selector: 'BinaryExpression[operator=\'in\']',
	message: 'No in keyword; use Set/Map or hasOwnProperty.',
}, {
	selector: 'GenericTypeAnnotation > Identifier.id[name=/^(Boolean|Number|String)$/]',
	message: 'Use the primitive type (`boolean`, `number`, `string`) instead of its constructor type.',
}, {
	selector: 'ImportDeclaration[importKind=\'value\'] > ImportSpecifier[importKind=\'type\']',
	message: 'Import types with an `import type { ... }` declaration.',
}];

const restrictedWeakTypes = {
	selector: 'GenericTypeAnnotation > Identifier.id[name=/^(Function|Object)$/]',
	message: 'Unexpected weak type; use a specific function or object type.',
};

const restrictedTypeNames = {
	selector: ':matches(TypeAlias, OpaqueType) > Identifier.id:not([name=/^([A-Z][a-z0-9]+)+$/])',
	message: 'Type names must be PascalCase.',
};

export default ([
	{
		ignores: ['dist/**', 'lib/vendor/*.js', '!lib/vendor/index.js'],
	},
	{
		files: ['**/*.{js,cjs,mjs}'],
		languageOptions: {
			parser: flowParser,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2015,
			},
		},
		linterOptions: {
			reportUnusedDisableDirectives: 'off',
		},
		plugins: {
			local: { rules: { 'flow-file-annotation': flowFileAnnotation } },
			ava,
			// This legacy rule supplies fixes without declaring the metadata ESLint now requires.
			'dollar-sign': fixupPluginRules({
				...dollarSign,
				rules: {
					'dollar-sign': {
						create: dollarSign.rules['dollar-sign'],
						meta: {
							schema: dollarSign.rules['dollar-sign'].schema,
							fixable: 'code',
						},
					},
				},
			}),
			'no-useless-assign': fixupPluginRules(noUselessAssign),
			'prefer-spread': fixupPluginRules(preferSpread),
			filenames: fixupPluginRules(filenames),
			import: fixupPluginRules(importPlugin),
			'you-dont-need-lodash-underscore': fixupPluginRules(lodash),
		},
		settings: {
			'import-x/ignore': [
				'node_modules',
				'\\.(json|png|gif|html|scss)$',
			],
		},
		rules: {
			...js.configs.all.rules,
			...ava.configs.recommended[0].rules,
			...lodash.configs.all.rules,
			'ava/no-ignored-test-files': 0,
			'ava/no-conditional-assertion': 0,
			'ava/no-nested-assertions': 0, // Tests intentionally assert inside callbacks passed to other assertions.

			'local/flow-file-annotation': 2,

			'you-dont-need-lodash-underscore/throttle': 0,

			'dollar-sign/dollar-sign': [2, 'ignoreProperties'],

			'no-useless-assign/no-useless-assign': 2,

			'prefer-spread/prefer-object-spread': 2,

			'function-call-argument-newline': 0,

			'filenames/match-exported': 2,

			'import/no-restricted-paths': [2, { zones: [
				{ target: './lib/core', from: './lib/modules' },
				{ target: './lib/environment', from: './lib/modules' },
				{ target: './lib/environment', from: './lib/core' },
				{ target: './lib/utils', from: './lib/modules' },
				{ target: './lib/utils', from: './lib/core' },
				{ target: './lib/vendor', from: './lib/modules' },
				{ target: './lib/vendor', from: './lib/core' },
			] }],
			'import/default': 2,
			'import/dynamic-import-chunkname': 2,
			'import/exports-last': 0,
			'import/extensions': [0, { js: 'always', json: 'always' }], // FIXME Extensions must be added
			'import/first': 2,
			'import/group-exports': 0,
			'import/imports-first': 2,
			'import/max-dependencies': 0,
			'import/newline-after-import': 2,
			'import/no-absolute-path': 2,
			'import/no-amd': 2,
			'import/no-anonymous-default-export': 0,
			'import/no-commonjs': 2,
			'import/no-cycle': 0,
			'import/no-default-export': 0,
			'import/no-deprecated': 2,
			'import/no-duplicates': 2,
			'import/no-dynamic-require': 0,
			'import/no-extraneous-dependencies': 2,
			'import/no-internal-modules': 0,
			'import/no-mutable-exports': 0,
			'import/no-named-as-default': 2,
			'import/no-named-as-default-member': 2,
			'import/no-named-default': 2,
			'import/no-namespace': 0,
			'import/no-nodejs-modules': 2,
			'import/no-self-import': 2,
			'import/no-unassigned-import': 0,
			'import/no-unresolved': [2, { ignore: ['ava'] }],
			'import/no-useless-path-segments': 0,
			'import/no-webpack-loader-syntax': 0,
			'import/order': 2,
			'import/prefer-default-export': 0,
			'import/unambiguous': 0,

			'no-alert': 0,
			'no-bitwise': 0,
			'no-case-declarations': 0,
			'no-confusing-arrow': 0,
			'no-console': 0,
			'no-continue': 0,
			'no-div-regex': 0,
			'no-duplicate-imports': 0, // see import/no-duplicates (ESLint's rule doesn't handle Flow `import type`)
			'no-else-return': 0,
			'no-empty-function': [2, { allow: ['arrowFunctions', 'methods'] }],
			'no-extra-parens': [2, 'functions'], // "all" conflicts with no-return-assign and some other rules, unfortunately
			'no-implicit-coercion': [0, { boolean: false }],
			'no-inline-comments': 0,
			'no-inner-declarations': 0, // ES6 has block-scoped functions
			'no-invalid-this': 0,
			'no-lone-blocks': 0,
			'no-lonely-if': 0,
			'no-loop-func': 0,
			'no-magic-numbers': 0,
			'no-mixed-operators': 0,
			'no-multi-assign': 0,
			'no-multi-spaces': [2, { exceptions: { SwitchCase: true } }],
			'no-negated-condition': 0,
			'no-nested-ternary': 0,
			'no-param-reassign': 0,
			'no-plusplus': 0,
			'no-process-env': 0,
			'no-process-exit': 0,
			'no-prototype-builtins': 0,
			'no-restricted-globals': [2, 'alert'],
			'no-restricted-modules': 0, // see import/no-nodejs-modules
			'no-restricted-syntax': [2, ...restrictedSyntax, restrictedWeakTypes, restrictedTypeNames],
			'no-shadow': 0,
			'no-sync': 0,
			'no-tabs': 0,
			'no-ternary': 0,
			'no-undef': [2, { typeof: true }],
			'no-undefined': 0,
			'no-underscore-dangle': 0,
			'no-unused-expressions': 2,
			'no-unused-vars': [2, { ignoreRestSiblings: true, caughtErrors: 'none' }],
			'no-use-before-define': [0, 'nofunc'],
			'no-useless-escape': 0,
			// Keep new core rules opt-in so a toolchain upgrade does not require runtime changes.
			'no-unassigned-vars': 0,
			'no-useless-assignment': 0,
			'preserve-caught-error': 0,
			'no-warning-comments': 0,
			'array-bracket-newline': [2, 'consistent'],
			'array-callback-return': 0,
			'array-element-newline': [0, { multiline: true }],
			'arrow-parens': [2, 'as-needed'],
			'brace-style': [2, '1tbs', { allowSingleLine: true }],
			'callback-return': 0,
			camelcase: [2, { properties: 'never' }],
			'capitalized-comments': 0,
			'class-methods-use-this': 0,
			'comma-dangle': [2, 'always-multiline'],
			complexity: [0, 11],
			'consistent-return': 0, // Flow effectively does this, and does a better job
			'consistent-this': [2, 'this'], // do not alias `this`, use arrow functions
			curly: [2, 'multi-line'],
			'default-param-last': 0,
			'dot-location': [2, 'property'],
			'func-names': 0, // all anonymous functions should be arrows (when this is turned on)
			'func-style': [2, 'declaration', { allowArrowFunctions: true }],
			'function-paren-newline': [0, 'consistent'],
			'generator-star-spacing': [0, { before: false, after: true }], // disabled pending https://github.com/eslint/eslint/issues/6195
			'id-blacklist': 0,
			'id-length': 0,
			'id-match': 0,
			'implicit-arrow-linebreak': 0,
			indent: [2, 'tab', { SwitchCase: 1, flatTernaryExpressions: true }],
			'init-declarations': 0,
			'linebreak-style': 0,
			'line-comment-position': 0,
			'lines-around-comment': [0, { allowBlockStart: true }],
			'lines-between-class-members': [2, 'always', { exceptAfterSingleLine: true }],
			'logical-assignment-operators': 0, // not support in used flowtype
			'max-classes-per-file': 0,
			'max-depth': 0,
			'max-len': 0,
			'max-lines': 0,
			'max-lines-per-function': 0,
			'max-nested-callbacks': [2, 5],
			'max-params': 0,
			'max-statements': 0,
			'max-statements-per-line': 0,
			'multiline-comment-style': 0,
			'multiline-ternary': 0,
			'newline-after-var': [0, 'never'],
			'newline-before-return': 0,
			'newline-per-chained-call': 0,
			'object-curly-newline': 0,
			'object-curly-spacing': [2, 'always'],
			'object-property-newline': [2, { allowMultiplePropertiesPerLine: true }],
			'one-var': [2, { initialized: 'never' }],
			'one-var-declaration-per-line': [2, 'initializations'],
			'operator-assignment': [2, 'always'],
			'operator-linebreak': [2, 'after'],
			'padded-blocks': [2, 'never'],
			'prefer-named-capture-group': 0,
			'prefer-destructuring': 0,
			'prefer-object-spread': 2,
			'prefer-reflect': [2, { exceptions: ['defineProperty', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'setPrototypeOf', 'isExtensible', 'getOwnPropertyNames', 'preventExtensions', 'delete'] }],
			'quote-props': [2, 'as-needed'],
			quotes: [2, 'single'],
			'require-atomic-updates': 0,
			'require-unicode-regexp': 0,
			'sort-imports': 0, // see import/order
			'sort-keys': 0,
			'sort-vars': 0,
			'space-before-function-paren': [2, {
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always',
			}],
			'spaced-comment': [2, 'always', { markers: [':', '::'] }],
			strict: [2, 'never'], // Babel inserts it for us
			'valid-typeof': [2, { requireStringLiterals: true }],
			'vars-on-top': 0,
			'wrap-iife': [2, 'inside'],
		},
	},
	{
		files: ['lib/environment/**/*.{js,cjs,mjs}'],
		languageOptions: {
			globals: globals.webextensions,
		},
	},
	{
		files: ['tests/**/*.{js,cjs,mjs}'],
		rules: {
			'local/flow-file-annotation': 0,
			'import/no-commonjs': 0,
		},
	},
	{
		files: ['examples/**/*.{js,cjs,mjs}'],
		rules: {
			'import/no-unresolved': 0, // Paths only resolve after examples are pasted into lib/.
		},
	},
	{
		files: ['flow/**/*.{js,cjs,mjs}'],
		rules: {
			'no-restricted-syntax': [2, ...restrictedSyntax, restrictedTypeNames], // Declarations may use weak types.
			'no-unused-vars': 0,
		},
	},
	{
		files: ['flow/lib/**/*.{js,cjs,mjs}'],
		rules: {
			'no-restricted-syntax': [2, ...restrictedSyntax], // Type names are dictated by the API.
		},
	},
] /*:: as Array<any> */);
