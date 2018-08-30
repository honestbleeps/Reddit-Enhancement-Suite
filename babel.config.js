/* @flow */

/* eslint-disable import/no-commonjs */

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
	presets: [
		'@babel/preset-env',
	],
	plugins: [
		'@babel/plugin-proposal-export-default-from',
		'@babel/plugin-proposal-export-namespace-from',
		['@babel/plugin-proposal-class-properties', { loose: true }],
		['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
		'@babel/plugin-transform-modules-commonjs',
		'@babel/plugin-transform-flow-strip-types',
		'transform-node-env-inline',
		'lodash',
		'minify-dead-code-elimination',
	],
	comments: !isProduction,
	overrides: [
		{
			test: ['./node_modules'],
			plugins: [
				'transform-node-env-inline',
				'minify-dead-code-elimination',
			],
			compact: true,
			comments: false,
		},
	],
};
