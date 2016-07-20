/* eslint-disable import/no-nodejs-modules */

import { basename, join } from 'path';

import InertEntryPlugin from 'inert-entry-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import autoprefixer from 'autoprefixer';
import webpack from 'webpack';
import yargs from 'yargs';

import babelrc from './.babelrc.json';

const browserConfig = {
	chrome: {
		entry: 'chrome/manifest.json',
		environment: 'chrome/environment',
		output: 'chrome',
	},
	edge: {
		entry: 'edge/manifest.json',
		environment: 'edge/environment',
		output: 'edge',
	},
	safari: {
		entry: 'safari/Info.plist',
		environment: 'safari/environment',
		output: 'RES.safariextension',
	},
	firefox: {
		entry: 'firefox/package.json',
		environment: 'firefox/environment',
		output: 'firefox',
	},
	node: {
		entry: 'node/files.json',
		environment: 'node/environment',
		output: 'node',
	},
};

const browsers = (
	typeof yargs.argv.browsers !== 'string' ? ['chrome'] :
	yargs.argv.browsers === 'all' ? Object.keys(browserConfig) :
	yargs.argv.browsers.split(',')
);

const configs = browsers.map(browser => {
	// extra transforms for Safari
	const babelConfig = {
		...babelrc,
		...(browser === 'safari' ? babelrc.env.safari : {}),
		babelrc: false,
	};

	return {
		entry: `extricate!interpolate!./${browserConfig[browser].entry}`,
		bail: process.env.NODE_ENV !== 'development',
		output: {
			path: join(__dirname, 'dist', browserConfig[browser].output),
			filename: basename(browserConfig[browser].entry),
		},
		devtool: '#cheap-module-source-map',
		resolve: {
			alias: {
				browserEnvironment$: join(__dirname, browserConfig[browser].environment),
			},
		},
		module: {
			loaders: [
				{ test: /\.entry\.js$/, loaders: ['spawn?name=[name].js', `babel?${JSON.stringify(babelConfig)}`] },
				{ test: /\.js$/, exclude: join(__dirname, 'node_modules'), loader: 'babel', query: babelConfig },
				{ test: /\.js$/, include: join(__dirname, 'node_modules'), loader: 'babel', query: { plugins: ['transform-dead-code-elimination', 'transform-node-env-inline'], compact: true, babelrc: false } },
				{ test: /\.mustache$/, loader: 'mustache' },
				{ test: /\.scss$/, loaders: ['file?name=[name].css', 'extricate?resolve=\\.js$', 'css', 'postcss', 'sass'] },
				{ test: /\.html$/, loaders: ['file?name=[name].[ext]', 'extricate', 'html?attrs=link:href script:src'] },
				{ test: /\.(png|gif)$/, exclude: join(__dirname, 'lib', 'images'), loader: 'file?name=[name].[ext]' },
				{ test: /\.(png|gif)$/, include: join(__dirname, 'lib', 'images'), loader: 'url' },
			],
			noParse: [
				// to use `require` in Firefox and Node
				/_nativeRequire\.js$/,
			],
		},
		plugins: [
			new ProgressBarPlugin(),
			new webpack.DefinePlugin({
				'process.env': {
					BUILD_TARGET: JSON.stringify(browser),
				},
			}),
			new InertEntryPlugin(),
		],
		postcss() {
			return [autoprefixer];
		},
	};
});

export default (configs.length === 1 ? configs[0] : configs);
