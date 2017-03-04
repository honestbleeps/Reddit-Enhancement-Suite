/* eslint-disable import/no-nodejs-modules */

import path from 'path';

import InertEntryPlugin from 'inert-entry-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ZipPlugin from 'zip-webpack-plugin';
import webpack from 'webpack';

import babelrc from './.babelrc.json';

const browserConfig = {
	chrome: {
		target: 'chrome',
		entry: 'chrome/manifest.json',
		environment: 'chrome/environment',
		output: 'chrome',
	},
	edge: {
		target: 'edge',
		entry: 'edge/appxmanifest.xml',
		environment: 'edge/environment',
		output: 'edgeextension/manifest/Extension',
		outputFilename: '../appxmanifest.xml',
		noZip: true,
	},
	firefox: {
		target: 'firefox',
		entry: 'firefox/package.json',
		environment: 'firefox/environment',
		output: 'firefox',
	},
	firefoxbeta: {
		target: 'firefox',
		entry: 'firefox/beta/package.json',
		environment: 'firefox/environment',
		output: 'firefox-beta',
	},
};

export default (env = {}) => {
	const browsers = (
		typeof env.browsers !== 'string' ? ['chrome'] :
		env.browsers === 'all' ? Object.keys(browserConfig) :
		env.browsers.split(',')
	);

	const isProduction = process.env.NODE_ENV !== 'development';

	const configs = browsers.map(b => browserConfig[b]).map(conf => {
		const babelConfig = {
			...babelrc,
			babelrc: false,
		};

		if (conf.target === 'edge') {
			// Edge has problems with destructuring in arrow functions:
			// In Edge 14, object destructuring with default values in arrow functions doesn't parse
			// In Edge 15 this is fixed, but there are other issues with destructuring (soon fixed)
			babelConfig.plugins.push('transform-es2015-arrow-functions');
		} else if (conf.target === 'firefox') {
			// The Firefox API can't deal with normal array destructuring
			babelConfig.plugins.push('transform-es2015-destructuring');
		}

		return {
			entry: `extricate-loader!interpolate-loader!./${conf.entry}`,
			output: {
				path: path.join(__dirname, 'dist', conf.output),
				filename: conf.outputFilename || path.basename(conf.entry),
			},
			devtool: isProduction ? 'source-map' : 'cheap-source-map',
			bail: isProduction,
			performance: false,
			resolve: {
				alias: {
					browserEnvironment$: path.join(__dirname, conf.environment),
				},
			},
			module: {
				rules: [{
					test: /\.entry\.js$/,
					use: [
						{ loader: 'spawn-loader', options: { name: '[name].js' } },
					],
				}, {
					test: /\.js$/,
					exclude: path.join(__dirname, 'node_modules'),
					use: [
						{ loader: 'babel-loader', options: babelConfig },
					],
				}, {
					test: /\.js$/,
					include: path.join(__dirname, 'node_modules'),
					use: [
						{
							loader: 'babel-loader',
							options: {
								plugins: ['transform-dead-code-elimination', 'transform-node-env-inline'],
								compact: true,
								babelrc: false,
							},
						},
					],
				}, {
					test: /\.mustache$/,
					use: [
						{ loader: 'mustache-loader' },
					],
				}, {
					test: /\.scss$/,
					use: [
						{ loader: 'file-loader', options: { name: '[name].css' } },
						{ loader: 'extricate-loader', options: { resolve: '\\.js$' } },
						{ loader: 'css-loader' },
						{ loader: 'postcss-loader' },
						{ loader: 'sass-loader' },
					],
				}, {
					test: /\.html$/,
					use: [
						{ loader: 'file-loader', options: { name: '[name].[ext]' } },
						{ loader: 'extricate-loader' },
						{ loader: 'html-loader', options: { attrs: ['link:href', 'script:src'] } },
					],
				}, {
					test: /\.(png|gif)$/,
					exclude: path.join(__dirname, 'lib', 'images'),
					use: [
						{ loader: 'file-loader', options: { name: '[name].[ext]' } },
					],
				}, {
					test: /\.(png|gif)$/,
					include: path.join(__dirname, 'lib', 'images'),
					use: [
						{ loader: 'url-loader' },
					],
				}],
				noParse: [
					// to use `require` in Firefox
					/nativeRequire\.js$/,
				],
			},
			plugins: [
				new ProgressBarPlugin(),
				new webpack.DefinePlugin({
					'process.env': {
						BUILD_TARGET: JSON.stringify(conf.target),
					},
				}),
				new InertEntryPlugin(),
				new LodashModuleReplacementPlugin(),
				(env.zip && !conf.noZip && new ZipPlugin({
					path: path.join('..', 'zip'),
					filename: conf.output,
				})),
			].filter(x => x),
		};
	});

	return (configs.length === 1 ? configs[0] : configs);
};
