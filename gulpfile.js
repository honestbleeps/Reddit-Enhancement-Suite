/* global require */
'use strict';

var gulp = require('gulp'),
	del = require('del'),
	zip = require('gulp-zip'),
	replace = require('gulp-replace-async'),
	path = require('path'),
	through = require('through-gulp'),
	Promise = require('promise');

var options = require('minimist')(process.argv.slice(2));

// What happens when you do gulp without any arguments
gulp.task('default', ['clean'], function() {
	gulp.start('build');
});

// Paths
var rootBuildDir = 'dist',
	commonFiles = ['lib/**/*.js', 'lib/**/*.json', 'lib/**/*.css', 'lib/**/*.html', getPackageMetadata().path],
	config = {
		// The name used to refer to the browser from the command line, i.e. `gulp build -b chrome`
		chrome: {
			// Subfolder of rootBuildDir that the buildFiles will be copied to
			buildFolder: 'chrome',
			// The file for addFileToManifest to modify when adding new hosts/modules
			manifest: 'Chrome/manifest.json',
			manifestReplacements: [
				{ key: 'title', needle: /("title": ")(?:.*)(")$/ },
				{ key: 'description', needle: /("description": ")(?:.*)(")$/ },
				{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
			],
			// Files to be copied when building the extension
			buildFiles: [
				// dest is relative to the browser's buildFolder, src is relative to the project root
				{ dest: 'images', src: ['Chrome/images/*.png'] },
				{ dest: '/', src: ['Chrome/*.js', 'Chrome/*.png', 'Chrome/*.html'] },
				{ dest: '/', src: commonFiles }
			]
		},
		safari: {
			buildFolder: 'RES.safariextension',
			manifest: 'RES.safariextension/Info.plist',
			manifestReplacements: [
				{ key: 'version', needle: /(<key>CFBundleVersion<\/key>\s*<string>)(?:.+)(<\/string>)/ },
				{ key: 'version', needle: /(<key>CFBundleShortVersionString<\/key>\s*<string>)(?:.+)(<\/string>)/ },
				{ key: 'description', needle: /(<key>Description<\/key>\s*<string>)(?:.+)(<\/string>)/ },
				{ key: 'title', needle: /(<key>CFBundleDisplayName<\/key>\s*<string>)(?:.+)(<\/string>)/ }
			],
			buildFiles: [
				{ dest: '/', src: ['RES.safariextension/*.js', 'RES.safariextension/*.png', 'RES.safariextension/*.html'] },
				{ dest: '/', src: commonFiles }
			]
		},
		firefox: {
			buildFolder: 'XPI',
			filesList: 'XPI/index.js',
			manifest: 'XPI/package.json',
			manifestReplacements: [
				{ key: 'title', needle: /("title": ")(?:.*)(")/ },
				{ key: 'description', needle: /("description": ")(?:.*)(")/ },
				{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
			],
			buildFiles: [
				{ dest: 'data', src: ['XPI/data/**/*'] },
				{ dest: 'data', src: commonFiles },
				{ dest: '/', src: ['*.png', 'XPI/index.js'] }
			]
		},
		oblink: {
			buildFolder: 'oblink',
			manifest: 'OperaBlink/manifest.json',
			manifestReplacements: [
				{ key: 'title', needle: /("title": ")(?:.*)(")$/ },
				{ key: 'description', needle: /("description": ")(?:.*)(")$/ },
				{ key: 'version', needle: /("version": ")(?:[\d\.])+(")/ }
			],
			buildFiles: [
				{ dest: 'images', src: ['OperaBlink/images/*.png'] },
				{ dest: '/', src: ['OperaBlink/*.js', 'Chrome/browsersupport-chrome.js', 'OperaBlink/*.png', 'OperaBlink/*.json' ] },
				{ dest: '/', src: commonFiles }
			]
		},
		opera: {
			buildFolder: 'opera',
			manifest: 'Opera/config.xml',
			filesList: 'Opera/includes/loader.js',
			manifestReplacements: [
				{ key: 'title', needle: /(<name>)(?:.*)(<\/name>)/ },
				{ key: 'description', needle: /(<description>)(?:.*)(<\/description>)/ },
				{ key: 'version', needle: /(update-opera\.php\?v=)(?:[\d\.])+(")/ },
				{ key: 'version', needle: /(widgets" version=")(?:[\d\.])+(")/ }
			],
			buildFiles: [
				{ dest: 'includes', src: ['Opera/includes/*.js'] },
				{ dest: '/', src: ['Opera/*.js', 'OperaBlink/*.gif', 'Opera/*.html' ] },
				{ dest: '/', src: commonFiles }
			]
		},
		node: {
			// Subfolder of rootBuildDir that the buildFiles will be copied to
			buildFolder: 'node',
			manifest: 'manifest.json',
			// The file for addFileToManifest to modify when adding new hosts/modules
			filesList: 'node/files.json',
			// Files to be copied when building the extension
			buildFiles: [
				// dest is relative to the browser's buildFolder, src is relative to the project root
				{ dest: 'lib', src: commonFiles },
				{ dest: 'node_modules', src: [ 'node/node_modules', 'node/node_modules/**/*' ] },
				{ dest: '/', src: ['node/**/*'] }
			]
		},
	},
	// the `-b browser` argument(s) or all browsers, if unspecified
	selectedBrowsers = options.b ? [].concat(options.b) : Object.keys(config);

function getBuildDir(browser) {
	return path.join(rootBuildDir, config[browser].buildFolder);
}

gulp.task('build', function(cb) {
	Promise.all(selectedBrowsers.map(function(browser) {
		return Promise.all(config[browser].buildFiles.map(function(paths) {
			return gulp.src(paths.src)
				.pipe(gulp.dest(path.join(getBuildDir(browser), paths.dest)));
		})).then(function() {
			if (!config[browser].manifest) { 
				return new Promise(function(resolve) { resolve(); });
			}
			del(path.join(getBuildDir(browser), config[browser].manifest), undefined)
			return gulp.src(config[browser].manifest)
				.pipe(through.map(populateManifest.bind(this, browser)))
				.pipe(gulp.dest(getBuildDir(browser)))
		});
	})).done(function() { cb() });
});

function getPackageMetadata() {
	var filepath = './' + (options.p || 'package.json');
	return {
		path: filepath,
		contents: require(filepath)
	};
}

function populateManifest(browser, file) {
	var replaceConfig = config[browser].manifestReplacements;
	if (replaceConfig) {
		var values = getPackageMetadata().contents;
		var transformed = replaceConfig.reduce(function(haystack, replace) {
			return haystack.replace(replace.needle, function(match, prefix, suffix) {
				return prefix + values[replace.key] + suffix;
			});
		}, file.contents.toString());

		file.contents = new Buffer(transformed);
	}

	return file;
}

gulp.task('zip', function(cb) {
	// --zipdir argument or <rootBuildDir>/zip/
	var zipDir = options.zipdir || path.join(rootBuildDir, 'zip');
	selectedBrowsers.forEach(function(browser) {
		gulp.src(path.join(getBuildDir(browser), '**/*'))
			.pipe(zip(config[browser].buildFolder + '.zip'))
			.pipe(gulp.dest(zipDir));
	});
	cb();
});

gulp.task('watch', function() {
	var sources = selectedBrowsers.reduce(function(previous, browser) {
		return previous.concat(config[browser].buildFiles.reduce(function(pre, cur) {
			return pre.concat(cur.src);
		}, []));
	}, []);
	gulp.watch(sources, [ 'build' ]);
});

// Add new modules to browser manifests
gulp.task('add-module', function(cb) {
	selectedBrowsers.forEach(function(browser) {
		addModuleToManifest(config[browser].filesList || config[browser].manifest);
	});
	cb();
});
gulp.task('add-host', function(cb) {
	selectedBrowsers.forEach(function(browser) {
		addHostToManifest(config[browser].filesList || config[browser].manifest);
	});
	cb();
});

// "Add file to manifests" task support
function addFileToManifest(manifest, pattern) {
	var addModulename = options['file'];
	return gulp.src(manifest)
		.pipe(replace(pattern, function(match, callback) {
			var withNewFile = match[0] + '\n' +
				match[1] + addModulename + match[2];
			callback(null, withNewFile);
		}))
		.pipe(gulp.dest(path.dirname(manifest)));
}

function addModuleToManifest(manifest) {
	var pattern = new RegExp('^(.*modules/)' + getRefModule() + '(.*)$', 'm');
	return addFileToManifest(manifest, pattern);
}

// "Add file to manifests" task support
function addHostToManifest(manifest) {
	var pattern = new RegExp('^(.*modules/hosts/)' + getRefHost() + '(.*)$', 'm');
	return addFileToManifest(manifest, pattern);
}

function getRefModule() {
	return 'commandLine.js';
}
function getRefHost() {
	return 'imgur.js';
}

gulp.task('clean', function(cb) {
	del(['dist/*'], undefined, cb);
});

