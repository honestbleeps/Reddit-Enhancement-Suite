import InertEntryPlugin from 'inert-entry-webpack-plugin';
import autoprefixer from 'autoprefixer';
import { basename, join } from 'path';

const browserConfig = {
	default: {
		environment: 'lib/environment'
	},
	chrome: {
		entry: 'chrome/manifest.json',
		environment: 'chrome/environment',
		output: 'chrome'
	},
	safari: {
		entry: 'safari/info.plist',
		environment: 'safari/environment',
		output: 'RES.safariextension'
	},
	firefox: {
		entry: 'firefox/package.json',
		environment: 'firefox/environment',
		output: 'firefox'
	},
	node: {
		entry: 'node/files.json',
		environment: 'node/environment',
		output: 'node'
	}
};

const browser = process.env.BUILD_TARGET || 'default';

export default {
	entry: `extricate!interpolate!./${browserConfig[browser].entry}`,
	bail: process.env.NODE_ENV === 'production',
	output: {
		path: join(__dirname, 'dist', browserConfig[browser].output),
		filename: basename(browserConfig[browser].entry)
	},
	resolve: {
		alias: {
			environment$: join(__dirname, browserConfig[browser].environment)
		}
	},
	module: {
		loaders: [
			{ test: /\.entry\.js$/, loaders: ['spawn?name=[name].js', 'babel'] },
			{ test: /\.js$/, exclude: join(__dirname, 'node_modules'), loader: 'babel' },
			{ test: /\.js$/, include: join(__dirname, 'node_modules'), loader: 'babel', query: { plugins: ['transform-dead-code-elimination', 'transform-node-env-inline'], babelrc: false } },
			{ test: /\.hbs$/, loader: 'handlebars' },
			{ test: /\.scss$/, loaders: ['file?name=[name].css', 'extricate?resolve=\\.js$', 'css', 'postcss', 'sass'] },
			{ test: /\.css$/, loaders: ['file?name=[name].[ext]', 'extricate?resolve=\\.js$', 'css'] },
			{ test: /\.html$/, loaders: ['file?name=[name].[ext]', 'extricate', 'html?attrs=link:href script:src'] },
			{ test: /\.png$/, exclude: join(__dirname, 'lib', 'images'), loader: 'file?name=[name].[ext]' },
			{ test: /\.png$/, include: join(__dirname, 'lib', 'images'), loader: 'url' }
		],
		noParse: [
			// to use `require` in Firefox and Node
			/_nativeRequire\.js$/
		]
	},
	plugins: [
		new InertEntryPlugin()
	],
	postcss() {
		return [autoprefixer];
	}
};
