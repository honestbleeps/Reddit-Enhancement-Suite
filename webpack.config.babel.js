/* @noflow */

/* eslint-disable import/no-nodejs-modules */

import path from 'path';

import InertEntryPlugin from 'inert-entry-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ZipPlugin from 'zip-webpack-plugin';
import sass from 'sass';

const browserConfig = {
	chrome: {
		target: 'chrome',
		entry: 'chrome/manifest.json',
		output: 'chrome',
	},
	chromebeta: {
		target: 'chrome',
		entry: 'chrome/beta/manifest.json',
		output: 'chrome-beta',
	},
	edge: {
		target: 'edge',
		entry: 'edge/appxmanifest.xml',
		output: 'edgeextension/manifest',
		noZip: true,
	},
	firefox: {
		target: 'firefox',
		entry: 'firefox/manifest.json',
		output: 'firefox',
		noSourcemap: true,
	},
	firefoxbeta: {
		target: 'firefox',
		entry: 'firefox/beta/manifest.json',
		output: 'firefox-beta',
	},
};

export default (env = {}, argv = {}) => {
	const isProduction = argv.mode === 'production';
	const browsers = (
		typeof env.browsers !== 'string' ? ['chrome'] :
		env.browsers === 'all' ? Object.keys(browserConfig) :
		env.browsers.split(',')
	);

	const configs = browsers.map(b => browserConfig[b]).map(conf => ({
		entry: `extricate-loader!interpolate-loader!./${conf.entry}`,
		output: {
			path: path.join(__dirname, 'dist', conf.output),
			filename: path.basename(conf.entry),
		},
		devtool: (() => {
			if (!isProduction) return 'cheap-source-map';
			if (!conf.noSourcemap) return 'source-map';
			return false;
		})(),
		node: false,
		performance: false,
		module: {
			rules: [{
				test: /\.entry\.js$/,
				use: [
					{ loader: 'spawn-loader' },
				],
			}, {
				test: /\.js$/,
				exclude: path.join(__dirname, 'node_modules'),
				use: [
					{
						loader: 'babel-loader',
						options: {
							plugins: [
								'@babel/plugin-proposal-export-namespace-from',
								['@babel/plugin-proposal-class-properties', { loose: true }],
								['@babel/plugin-proposal-object-rest-spread', { loose: true, useBuiltIns: true }],
								'@babel/plugin-transform-flow-strip-types',
								'minify-dead-code-elimination',
								['transform-define', {
									'process.env.BUILD_TARGET': conf.target,
									'process.env.NODE_ENV': argv.mode,
								}],
								'lodash',
							],
							comments: !isProduction,
							babelrc: false,
						},
					},
				],
			}, {
				test: /\.js$/,
				include: path.join(__dirname, 'node_modules'),
				use: [
					{
						loader: 'babel-loader',
						options: {
							plugins: [
								'minify-dead-code-elimination',
								['transform-define', {
									'process.env.NODE_ENV': argv.mode,
								}],
							],
							compact: true,
							comments: false,
							babelrc: false,
						},
					},
				],
			}, {
				test: /\.scss$/,
				use: [
					{ loader: 'file-loader', options: { name: '[name].css' } },
					{ loader: 'extricate-loader', options: { resolve: '\\.js$' } },
					{ loader: 'css-loader' },
					{ loader: 'postcss-loader' },
					{ loader: 'sass-loader', options: { implementation: sass } },
				],
			}, {
				test: /\.html$/,
				use: [
					{ loader: 'file-loader', options: { name: '[name].[ext]' } },
					{ loader: 'extricate-loader' },
					{ loader: 'html-loader', options: { attrs: ['link:href', 'script:src'] } },
				],
			}, {
				test: /\.(png|gif|svg)$/,
				exclude: path.join(__dirname, 'lib', 'images'),
				use: [
					{ loader: 'file-loader', options: { name: '[name].[ext]' } },
				],
			}, {
				test: /\.(png|gif|svg)$/,
				include: path.join(__dirname, 'lib', 'images'),
				use: [
					{ loader: 'url-loader' },
				],
			}, {
				test: /\.woff$/,
				use: [
					conf.target === 'edge' ?
						{ loader: 'url-loader' } :
						{ loader: 'file-loader', options: { name: '[name].[ext]' } },
				],
			}],
		},
		optimization: {
			minimize: false,
			concatenateModules: true,
		},
		plugins: [
			new InertEntryPlugin(),
			new LodashModuleReplacementPlugin(),
			(env.zip && !conf.noZip && new ZipPlugin({
				path: path.join('..', 'zip'),
				filename: conf.output,
			})),
		].filter(x => x),
	}));

	return (configs.length === 1 ? configs[0] : configs);
};
