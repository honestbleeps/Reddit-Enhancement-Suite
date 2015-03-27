/* global require */
'use strict';

var gulp = require('gulp'),
	del = require('del'),
	zip = require('gulp-zip'),
	replace = require('gulp-replace-async'),
	path = require('path');

var options = require('minimist')(process.argv.slice(2));

// What happens when you do gulp without any arguments
gulp.task('default', ['clean'], function() {
	gulp.start('build');
});

// Paths
var rootBuildDir = 'dist',
	buildDir = {
		chrome:  path.join(rootBuildDir, 'chrome'),
		safari:  path.join(rootBuildDir, 'RES.safariextension'),
		firefox: path.join(rootBuildDir, 'XPI'),
		oblink:  path.join(rootBuildDir, 'oblink'),
		opera:   path.join(rootBuildDir, 'opera')
	},
	libFiles = ['lib/**/*.js', 'lib/**/*.json', 'lib/**/*.css', 'lib/**/*.html'],
	// dest is relative to the browser's buildDir, src is relative to the root of the project
	buildFiles = {
		chrome: [
			{ dest: 'images', src: ['Chrome/images/*.png'] },
			{ dest: '/',      src: ['Chrome/*.js', 'Chrome/*.png', 'Chrome/*.html', 'package.json', 'Chrome/manifest.json'] },
			{ dest: '/',      src: libFiles }
		],
		safari: [
			{ dest: '/', src: ['RES.safariextension/*.js', 'RES.safariextension/*.png', 'RES.safariextension/*.html', 'package.json', 'RES.safariextension/info.plist'] },
			{ dest: '/', src: libFiles }
		],
		firefox: [
			{ dest: 'data', src: ['XPI/data/**/*'] },
			{ dest: 'data', src: libFiles },
			{ dest: 'lib',  src: ['XPI/lib/**/*'] },
			{ dest: '/',    src: ['*.png', 'XPI/package.json'] }
		],
		oblink: [
			{ dest: 'images', src: ['OperaBlink/images/*.png'] },
			{ dest: '/',      src: ['OperaBlink/*.js', 'Chrome/browsersupport-chrome.js', 'OperaBlink/*.png', 'OperaBlink/*.json', 'package.json'] },
			{ dest: '/',      src: libFiles }
		],
		opera: [
			{ dest: 'includes', src: ['Opera/includes/*.js'] },
			{ dest: '/',        src: ['Opera/*.js', 'OperaBlink/*.gif', 'Opera/*.html', 'Opera/*.xml', 'package.json'] },
			{ dest: '/',        src: libFiles }
		]
	},
	manifests = {
		chrome:  'Chrome/manifest.json',
		safari:  'RES.safariextension/Info.plist',
		firefox: 'XPI/lib/main.js',
		oblink:  'OperaBlink/manifest.json',
		opera:   'Opera/includes/loader.js'
	},
	// the specified `-b browser` or all browsers, if unspecified
	selectedBrowsers = options.b ? [].concat(options.b) : Object.keys(buildFiles);

gulp.task('build', function(cb) {
	selectedBrowsers.forEach(function(browser) {
		buildFiles[browser].forEach(function(paths) {
			gulp.src(paths.src)
				.pipe(gulp.dest(path.join(buildDir[browser], paths.dest)));
		});
	});
	cb();
});

gulp.task('zip', function(cb) {
	var zipDir = options.zipdir || path.join(rootBuildDir, 'zip');
	selectedBrowsers.forEach(function(browser) {
		gulp.src(path.join(buildDir[browser], '**/*'))
			.pipe(zip(browser + '.zip'))
			.pipe(gulp.dest(zipDir));
	});
	cb();
});

gulp.task('watch', function() {
	var sources = selectedBrowsers.reduce(function(previous, browser) { // combine the sources of each browser
		return previous.concat(
			buildFiles[browser].reduce(function(pre, cur) { // combine the sources within each browser
				return pre.concat(
					cur.src.filter(function(src) { // filter out repeated directories (i.e. libFiles, chrome/oblink common files)
						return previous.indexOf(src) == -1;
					})
				);
			}, [])
		);
	}, []);
	gulp.watch(sources, [ 'build' ]);
});

// Add new modules to browser manifests
gulp.task('add-module', function(cb) {
	selectedBrowsers.forEach(function(browser) {
		addModuleToManifest(manifests[browser]);
	});
	cb();
});
gulp.task('add-host', function(cb) {
	selectedBrowsers.forEach(function(browser) {
		addHostToManifest(manifests[browser]);
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
	del(['dist/*'], cb);
});
