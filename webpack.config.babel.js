/* @noflow */

/* eslint-disable import/no-nodejs-modules */

import fs from 'fs';
import path from 'path';

import webpack from 'webpack';
import InertEntryPlugin from 'inert-entry-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ZipPlugin from 'zip-webpack-plugin';

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
		devtool: false,
	},
	firefoxbeta: {
		target: 'firefox',
		entry: 'firefox/beta/manifest.json',
		output: 'firefox-beta',
	},
	greasemonkey: {
		target: 'greasemonkey',
		entry: 'lib/foreground.entry.js',
		output: 'greasemonkey',
		devtool: 'inline-source-map',
	},
};

export default (env = {}) => {
	const browsers = (
		typeof env.browsers !== 'string' ? ['chrome'] :
		env.browsers === 'all' ? Object.keys(browserConfig) :
		env.browsers.split(',')
	);

	const isProduction = process.env.NODE_ENV !== 'development';

	const configs = browsers.map(b => browserConfig[b]).map(conf => ({
		entry: (() => {
			if (conf.target === "greasemonkey") {
				return `./${conf.entry}`;
			} else {
				return `extricate-loader!interpolate-loader!./${conf.entry}`;
			}
		})(),
		output: {
			path: path.join(__dirname, 'dist', conf.output),
			filename: path.basename(conf.entry),
		},
		devtool: (() => {
			if (typeof conf.devtool !== undefined) return conf.devtool;
			if (!isProduction) return 'cheap-source-map';
			return 'source-map';
		})(),
		bail: isProduction,
		node: false,
		performance: false,
		module: {
			rules: [conf.target !== "greasemonkey" && {
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
								'transform-export-extensions',
								'transform-class-properties',
								['transform-object-rest-spread', { useBuiltIns: true }],
								'transform-flow-strip-types',
								'transform-dead-code-elimination',
								['transform-define', {
									'process.env.BUILD_TARGET': conf.target,
									'process.env.NODE_ENV': isProduction ? 'production' : 'development',
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
								'transform-dead-code-elimination',
								['transform-define', {
									'process.env.NODE_ENV': isProduction ? 'production' : 'development',
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
					...(() => {
						if (conf.target === "greasemonkey") {
							return [ { loader: 'style-loader' } ];
						} else {
							return [
								{ loader: 'file-loader', options: { name: '[name].css' } },
								{ loader: 'extricate-loader', options: { resolve: '\\.js$' } }
							];
						}
					})(),
					{ loader: 'css-loader' },
					{ loader: 'postcss-loader' },
					{
						loader: 'sass-loader',
						options: {
							includePaths: [
								path.resolve(__dirname, './node_modules'),
							]
						},
					}
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
			}].filter(x => x),
		},
		plugins: [
			new ProgressBarPlugin(),
			(conf.target === "greasemonkey" && (() => {
				const banner = fs.readFileSync("./greasemonkey/header.js", {
					encoding: 'utf8'
				});
				return new webpack.BannerPlugin({
					banner: banner,
					raw: true,
				});
			})()),
			(conf.target !== "greasemonkey" && new InertEntryPlugin()),
			(conf.target !== "greasemonkey" && new LodashModuleReplacementPlugin()),
			new webpack.optimize.ModuleConcatenationPlugin(),
			(env.zip && !conf.noZip && new ZipPlugin({
				path: path.join('..', 'zip'),
				filename: conf.output,
			})),
		].filter(x => x),
	}));

	return (configs.length === 1 ? configs[0] : configs);
};
