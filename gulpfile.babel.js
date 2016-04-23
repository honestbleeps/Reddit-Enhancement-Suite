/* eslint-env node */

import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import cache from 'gulp-cached';
import del from 'del';
import filter from 'gulp-filter';
import gulp from 'gulp';
import insert from 'gulp-insert';
import map from 'through2-map';
import merge from 'merge-stream';
import minimist from 'minimist';
import path from 'path';
import pumpify from 'pumpify';
import replace from 'gulp-replace';
import sass from 'gulp-sass';
import through from 'through2';
import zip from 'gulp-zip';

const options = minimist(process.argv.slice(2));

// Paths
const baseConf = {
	sources: {
		copy: { cwd: 'lib/**', src: ['*.json', '*.css', '*.html', 'vendor/**/*.js'] },
		babel: { cwd: 'lib/**', src: ['*.js', '!vendor/**/*.js', '!**/__tests__/*.js'] },
		sass: { cwd: 'lib/**', src: ['*.scss'] }
	},
	dests: {
		root: 'dist'
	}
};

const browserConf = {
	// The name used to refer to the browser from the command line
	chrome: {
		// The file for addFileToManifest to modify when adding new hosts/modules
		manifest: 'chrome/manifest.json',
		manifestReplacements: [
			{ key: 'title', needle: /("title": ")(?:.*?)(")/ },
			{ key: 'description', needle: /("description": ")(?:.*?)(")/ },
			{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
		],
		// Browser-specific files to be copied when building the extension (paths relative to project root)
		sources: [
			{ cwd: 'chrome/**', src: ['images/*.png'] },
			{ src: ['chrome/*.js', 'chrome/*.png', 'chrome/*.html'] }
		],
		dests: {
			// Subdirectory of baseConf.dests.root that the sources will be copied to
			root: 'chrome',
			// Subdirectory of the above line that baseConf.sources will be copied to
			baseSources: '/'
		}
	},
	edge: {
		// The file for addFileToManifest to modify when adding new hosts/modules
		manifest: 'edge/manifest.json',
		manifestReplacements: [
			{ key: 'title', needle: /("title": ")(?:.*?)(")/ },
			{ key: 'description', needle: /("description": ")(?:.*?)(")/ },
			{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
		],
		// Browser-specific files to be copied when building the extension (paths relative to project root)
		sources: [
			{ cwd: 'chrome/**', src: ['images/*.png'] },
			{ src: ['edge/*.js', 'edge/*.html', 'edge/*.cmd', 'icon128.png', 'chrome/background.js', 'chrome/browsersupport-chrome.js'] }
		],
		dests: {
			// Subdirectory of baseConf.dests.root that the sources will be copied to
			root: 'edge',
			// Subdirectory of the above line that baseConf.sources will be copied to
			baseSources: '/'
		}
	},
	safari: {
		manifest: 'safari/Info.plist',
		manifestReplacements: [
			{ key: 'version', needle: /(<key>CFBundleVersion<\/key>\s*<string>)(?:.+)(<\/string>)/ },
			{ key: 'version', needle: /(<key>CFBundleShortVersionString<\/key>\s*<string>)(?:.+)(<\/string>)/ },
			{ key: 'description', needle: /(<key>Description<\/key>\s*<string>)(?:.+)(<\/string>)/ },
			{ key: 'title', needle: /(<key>CFBundleDisplayName<\/key>\s*<string>)(?:.+)(<\/string>)/ }
		],
		sources: [
			{ src: ['safari/*.js', 'safari/*.png', 'safari/*.html'] }
		],
		dests: {
			root: 'RES.safariextension',
			baseSources: '/'
		}
	},
	firefox: {
		filesList: 'firefox/index.js',
		manifest: 'firefox/package.json',
		manifestReplacements: [
			{ key: 'title', needle: /("title": ")(?:.*)(")/ },
			{ key: 'description', needle: /("description": ")(?:.*)(")/ },
			{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
		],
		sources: [
			{ cwd: 'firefox/**', src: ['data/**/*'] },
			{ src: ['*.png', 'firefox/index.js'] }
		],
		dests: {
			root: 'firefox',
			baseSources: 'data'
		}
	},
	node: {
		filesList: 'node/files.json',
		sources: [
			{ src: ['node/**/*'] }
		],
		dests: {
			root: 'node',
			baseSources: 'lib'
		}
	}
};

// the `--browsers` argument or all browsers, if unspecified
const browsers = typeof options.browsers === 'string' ? options.browsers.split(',') : Object.keys(browserConf);

function src({ src, cwd }) {
	return gulp.src(src, { cwd });
}

function dest(...paths) {
	return gulp.dest(path.join(...paths));
}

function getBuildDir(browser) {
	return path.join(baseConf.dests.root, browserConf[browser].dests.root);
}

function toBrowsers() {
	// through() with no transform as a dummy passthrough stream
	// since pumpify doesn't have reasonable default behavior for a single stream
	return pumpify.obj(through.obj(), ...browsers.map(browser =>
		dest(getBuildDir(browser), browserConf[browser].dests.baseSources)
	));
}

gulp.task('clean', () =>
	del(browsers.map(browser => getBuildDir(browser)))
);

gulp.task('watch', ['build'], () => {
	const sources = browsers.reduce(
		(acc, browser) => acc.concat(browserConf[browser].sources.reduce(
			(a, { cwd = '', src }) => a.concat(src.map(s => path.join(cwd, s))),
			browserConf[browser].manifest ? [browserConf[browser].manifest] : []
		)),
		[baseConf.sources.copy.cwd]
	);

	gulp.watch(sources, ['build']);
});

gulp.task('build', ['babel', 'sass', 'copy', 'copy-browser', 'manifests']);

function babelPipeline() {
	return pumpify.obj(
		babel().on('error', e => console.error(e.message)),
		insert.wrap('(function(exports) {\n', '\n})(typeof exports === "object" ? exports : typeof window === "object" ? window : {});')
	).on('close', function() {
		// Gulp doesn't seem to stop on close, only end...
		this.emit('end');
	});
}

gulp.task('babel', () =>
	src(baseConf.sources.babel)
		.pipe(cache('babel'))
		.pipe(babelPipeline())
		.pipe(toBrowsers())
);

gulp.task('sass', () =>
	src(baseConf.sources.sass)
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['Chrome >= 25', 'Firefox >= 30', 'Safari >= 6'],
			cascade: false
		}))
		.pipe(toBrowsers())
);

gulp.task('copy', () =>
	merge(
		src(baseConf.sources.copy),
		gulp.src(getPackageMetadata().path)
	)
		.pipe(cache('copy'))
		.pipe(toBrowsers())
);

gulp.task('copy-browser', () =>
	merge(
		browsers.map(browser => {
			const jsFilter = filter('**/*.js', { restore: true });
			return merge(browserConf[browser].sources.map(paths => src(paths)))
				.pipe(cache(browser))
				.pipe(jsFilter)
				.pipe(babelPipeline())
				.pipe(jsFilter.restore)
				.pipe(dest(getBuildDir(browser)));
		})
	)
);

gulp.task('manifests', () =>
	merge(
		browsers
			.filter(browser => browserConf[browser].manifest)
			.map(browser =>
				gulp.src(browserConf[browser].manifest)
					.pipe(cache('manifests'))
					.pipe(map.obj(file => populateManifest(browser, file)))
					.pipe(dest(getBuildDir(browser)))
			)
	)
);

function getPackageMetadata() {
	const path = `./${options.p || 'package.json'}`;
	return {
		path,
		contents: require(path) // eslint-disable-line global-require
	};
}

function populateManifest(browser, file) {
	const replaceConfig = browserConf[browser].manifestReplacements;
	if (replaceConfig) {
		const values = getPackageMetadata().contents;
		const transformed = replaceConfig.reduce(
			(haystack, { needle, key }) => haystack.replace(needle, (m, prefix, suffix) => prefix + values[key] + suffix),
			file.contents.toString()
		);

		file.contents = new Buffer(transformed);
	}

	return file;
}

// Add new modules to browser manifests
gulp.task('add-module', () =>
	merge(
		browsers
			.map(browser => browserConf[browser].filesList || browserConf[browser].manifest)
			.filter(manifest => manifest)
			.map(manifest => addModuleToManifest(manifest))
	)
);

gulp.task('add-host', () =>
	merge(
		browsers
			.map(browser => browserConf[browser].filesList || browserConf[browser].manifest)
			.filter(manifest => manifest)
			.map(manifest => addHostToManifest(manifest))
	)
);

// "Add file to manifests" task support
function addFileToManifest(manifest, pattern) {
	const addModulename = options['file'];
	return gulp.src(manifest)
		.pipe(replace(pattern, `$&\n$1${addModulename}$2`))
		.pipe(dest(path.dirname(manifest)));
}

function addModuleToManifest(manifest) {
	const pattern = new RegExp(`^(.*modules/)${getRefModule()}(.*)$`, 'm');
	return addFileToManifest(manifest, pattern);
}

// "Add file to manifests" task support
function addHostToManifest(manifest) {
	const pattern = new RegExp(`^(.*modules/hosts/)${getRefHost()}(.*)$`, 'm');
	return addFileToManifest(manifest, pattern);
}

function getRefModule() {
	return 'commandLine.js';
}
function getRefHost() {
	return 'imgur.js';
}

gulp.task('zip', () =>
	merge(
		browsers.map(browser =>
			gulp.src(path.join(getBuildDir(browser), '**/*'))
				.pipe(zip(`${browserConf[browser].dests.root}.zip`))
				.pipe(dest(baseConf.dests.root, 'zip'))
		)
	)
);
