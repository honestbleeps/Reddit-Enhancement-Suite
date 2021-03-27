/* @noflow */

/* eslint-disable import/no-nodejs-modules */

import path from 'path'; // eslint-disable-line import/no-extraneous-dependencies

import InertEntryPlugin from 'inert-entry-webpack-plugin';
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
	firefox: {
		target: 'firefox',
		entry: 'firefox/manifest.json',
		output: 'firefox',
		noSourcemap: true,
	},
	opera: {
		target: 'opera',
		entry: 'chrome/manifest.json',
		output: 'opera',
		noSourcemap: true,
	},
	edge: {
		target: 'edge',
		entry: 'chrome/manifest.json',
		output: 'edge',
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
								'@babel/plugin-proposal-optional-chaining',
								'@babel/plugin-proposal-export-namespace-from',
								['@babel/plugin-proposal-class-properties', { loose: true }],
								'@babel/plugin-transform-flow-strip-types',
								'minify-dead-code-elimination',
								['transform-define', {
									'process.env.BUILD_TARGET': conf.target,
									'process.env.NODE_ENV': argv.mode,
								}],
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
					{ loader: 'file-loader', options: { esModule: false, name: '[name].css' } },
					{ loader: 'extricate-loader', options: { resolve: '\\.js$' } },
					{ loader: 'css-loader', options: { esModule: false } },
					{ loader: 'postcss-loader' },
					{ loader: 'sass-loader', options: { implementation: sass } },
				],
			}, {
				test: /\.html$/,
				use: [
					{ loader: 'file-loader', options: { esModule: false, name: '[name].[ext]' } },
					{ loader: 'extricate-loader' },
					{ loader: 'html-loader', options: { attrs: ['link:href', 'script:src'] } },
				],
			}, {
				test: /\.(png|gif|svg)$/,
				exclude: path.join(__dirname, 'lib', 'images'),
				use: [
					{ loader: 'file-loader', options: { esModule: false, name: '[name].[ext]' } },
				],
			}, {
				test: /\.(png|gif|svg)$/,
				include: path.join(__dirname, 'lib', 'images'),
				use: [
					{ loader: 'url-loader', options: { esModule: false } },
				],
			}, {
				test: /\.woff$/,
				use: [
					{ loader: 'url-loader', options: { esModule: false } },
				],
			}],
		},
		optimization: {
			minimize: false,
			concatenateModules: true,
		},
		resolve: {
			mainFields: ['module', 'main', 'browser'],
		},
		plugins: [
			new InertEntryPlugin(),
			(env.zip && !conf.noZip && new ZipPlugin({
				path: path.join('..', 'zip'),
				filename: conf.output,
			})),
		].filter(x => x),
	}));

	return (configs.length === 1 ? configs[0] : configs);
};
