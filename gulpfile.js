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
	gulp.start('chrome', 'safari', 'firefox', 'oblink', 'opera');
});

// Browser task runs subtasks
gulp.task('chrome', function() { return copyBrowserFiles('chrome'); });
gulp.task('safari', function() { return copyBrowserFiles('safari'); });
gulp.task('firefox', function() { return copyBrowserFiles('firefox'); });
gulp.task('oblink', function() { return copyBrowserFiles('oblink'); });
gulp.task('opera', function() { return copyBrowserFiles('opera'); });

// This kills the CPU
gulp.task('zipall', ['chrome-zip', 'safari-zip', 'firefox-zip', 'oblink-zip', 'opera-zip']);

// Add new modules to browser manifests
gulp.task('add-module', [ 'add-module-chrome', 'add-module-safari', 'add-module-firefox', 'add-module-oblink', 'add-module-opera' ]);
gulp.task('add-host', [ 'add-host-chrome', 'add-host-safari', 'add-host-firefox', 'add-host-oblink', 'add-host-opera' ]);

// Watch tasks
gulp.task('watch', [ 'watch-chrome', 'watch-safari', 'watch-firefox', 'watch-oblink', 'watch-opera' ]);

gulp.task('watch-chrome', function() {
	gulp.watch([ 'lib/**/*', 'Chrome/**/*' ], [ 'chrome' ]);
});

gulp.task('watch-safari', function() {
	gulp.watch([ 'lib/**/*', 'RES.safariextension/**/*' ], [ 'safari' ]);
});

gulp.task('watch-firefox', function() {
	gulp.watch([ 'lib/**/*', 'XPI/**/*' ], [ 'firefox' ]);
});

gulp.task('watch-oblink', function() {
	gulp.watch([ 'lib/**/*', 'OperaBlink/**/*', 'Chrome/browsersupport-chrome.js' ], [ 'oblink' ]);
});


gulp.task('watch-opera', function() {
	gulp.watch([ 'lib/**/*', 'Opera/**/*' ], [ 'opera' ]);
});

// Paths
var zipDir = '../../../var/www/html/res/dl',
	rootBuildDir = 'dist',
	buildDir = {
		chrome:  path.join(rootBuildDir, 'chrome'),
		safari:  path.join(rootBuildDir, 'RES.safariextension'),
		firefox: path.join(rootBuildDir, 'XPI'),
		oblink:  path.join(rootBuildDir, 'oblink'),
		opera:   path.join(rootBuildDir, 'opera')
	},
	libFiles = ['lib/**/*.js', 'lib/**/*.json', 'lib/**/*.css', 'lib/**/*.html'],
	// dest is relative to the browser's buildDir, src is relative to the root of the project
	browserSpecificFiles = {
		chrome: [
			{ dest: 'images', src: 'Chrome/images/*.png' },
			{ dest: '/',      src: ['Chrome/*.js', 'Chrome/*.png', 'Chrome/*.html', 'package.json', 'Chrome/manifest.json'] },
			{ dest: '/',      src: libFiles }
		],
		safari: [
			{ dest: '/', src: ['RES.safariextension/*.js', 'RES.safariextension/*.png', 'RES.safariextension/*.html', 'package.json', 'RES.safariextension/info.plist'] },
			{ dest: '/', src: libFiles }
		],
		firefox: [
			{ dest: 'data', src: 'XPI/data/**/*' },
			{ dest: 'data', src: libFiles },
			{ dest: 'lib',  src: 'XPI/lib/**/*' },
			{ dest: '/',    src: ['*.png', 'XPI/package.json'] }
		],
		oblink: [
			{ dest: 'images', src: 'OperaBlink/images/*.png' },
			{ dest: '/',      src: ['OperaBlink/*.js', 'Chrome/browsersupport-chrome.js', 'OperaBlink/*.png', 'OperaBlink/*.json', 'package.json'] },
			{ dest: '/',      src: libFiles }
		],
		opera: [
			{ dest: 'includes', src: 'Opera/includes/*.js' },
			{ dest: '/',        src: ['Opera/*.js', 'OperaBlink/*.gif', 'Opera/*.html', 'Opera/*.xml', 'package.json'] },
			{ dest: '/',        src: libFiles }
		]
	};

function copyBrowserFiles(browser) {
	return browserSpecificFiles[browser].every(function(paths) {
		return gulp.src(paths.src)
			.pipe(gulp.dest(path.join(buildDir[browser], paths.dest)));
	});
}

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

function getFileParam() {
	return process.env['file'];
}

function getRefModule() {
	return 'commandLine.js';
}
function getRefHost() {
	return 'imgur.js';
}
// Chrome low-level tasks
gulp.task('add-module-chrome', function() {
	return addModuleToManifest('Chrome/manifest.json');
});

gulp.task('add-host-chrome', function() {
	return addHostToManifest('Chrome/manifest.json');
});

// Safari low-level tasks
gulp.task('add-module-safari', function() {
	return addModuleToManifest('RES.safariextension/Info.plist');
});
gulp.task('add-host-safari', function() {
	return addHostToManifest('RES.safariextension/Info.plist');
});

// Firefox low-level tasks
gulp.task('add-module-firefox', function() {
	return addModuleToManifest('XPI/lib/main.js');
});
gulp.task('add-host-firefox', function() {
	return addHostToManifest('XPI/lib/main.js');
});

// OperaBlink low-level tasks
gulp.task('add-module-oblink', function() {
	return addModuleToManifest('OperaBlink/manifest.json');
});
gulp.task('add-host-oblink', function() {
	return addHostToManifest('OperaBlink/manifest.json');
});

// Opera low-level tasks
gulp.task('add-module-opera', function() {
	return addModuleToManifest('Opera/includes/loader.js');
});
gulp.task('add-host-opera', function() {
	return addHostToManifest('Opera/includes/loader.js');
});

// Zip tasks
gulp.task('chrome-zip', function() {
	return gulp.src(path.join(buildDir.chrome, '**/*'))
		.pipe(zip('chrome.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('safari-zip', function() {
	return gulp.src(path.join(buildDir.safari, '**/*'))
		.pipe(zip('safari.safariextension.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('firefox-zip', function() {
	return gulp.src(path.join(buildDir.firefox, '**/*'))
		.pipe(zip('firefox.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('oblink-zip', function() {
	return gulp.src(path.join(buildDir.oblink, '**/*'))
		.pipe(zip('operablink.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('opera-zip', function() {
	return gulp.src(path.join(buildDir.opera, '**/*'))
		.pipe(zip('opera.zip'))
		.pipe(gulp.dest(zipDir));
});

// Other
gulp.task('clean', function(cb) {
	del(['dist/**/*'], cb);
});
