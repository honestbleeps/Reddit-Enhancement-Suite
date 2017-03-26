/* eslint-disable import/no-nodejs-modules */

import path from 'path';

import HappyPack from 'happypack';
import InertEntryPlugin from 'inert-entry-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ZipPlugin from 'zip-webpack-plugin';
import webpack from 'webpack';

const browserConfig = {
	chrome: {
		target: 'chrome',
		entry: 'chrome/manifest.json',
		output: 'chrome',
	},
	edge: {
		target: 'edge',
		entry: 'edge/appxmanifest.xml',
		output: 'edgeextension/manifest',
		noZip: true,
	},
	firefox: {
		target: 'firefox',
		entry: 'firefox/package.json',
		output: 'firefox',
	},
	firefoxbeta: {
		target: 'firefox',
		entry: 'firefox/beta/package.json',
		output: 'firefox-beta',
	},
};

const threadPool = HappyPack.ThreadPool({ size: 4 });

function job(id, loaders) {
	return new HappyPack({
		id,
		loaders,
		threadPool,
		tempDir: path.join('dist', '.happypack'),
		cache: false,
		verbose: false,
	});
}

function runJob(id) {
	return `happypack/loader?id=${id}`;
}

export default (env = {}) => {
	const browsers = (
		typeof env.browsers !== 'string' ? ['chrome'] :
		env.browsers === 'all' ? Object.keys(browserConfig) :
		env.browsers.split(',')
	);

	const isProduction = process.env.NODE_ENV !== 'development';

	const configs = browsers.map(b => browserConfig[b]).map(conf => ({
		entry: `extricate-loader!interpolate-loader!./${conf.entry}`,
		output: {
			path: path.join(__dirname, 'dist', conf.output),
			filename: path.basename(conf.entry),
		},
		devtool: isProduction ? 'source-map' : 'cheap-source-map',
		bail: isProduction,
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
					{ loader: runJob('lib_js') },
				],
			}, {
				test: /\.js$/,
				include: path.join(__dirname, 'node_modules'),
				use: [
					{ loader: runJob('node_modules_js') },
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
			job('lib_js', [{
				loader: 'babel-loader',
			}]),
			job('node_modules_js', [{
				loader: 'babel-loader',
				options: {
					plugins: ['transform-dead-code-elimination', 'transform-node-env-inline'],
					compact: true,
					babelrc: false,
				},
			}]),
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
	}));

	return (configs.length === 1 ? configs[0] : configs);
};
