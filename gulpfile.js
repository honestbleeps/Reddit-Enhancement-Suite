/* global require */
'use strict';

var gulp = require('gulp'),
	imagemin = require('gulp-imagemin'),
	del = require('del'),
	zip = require('gulp-zip');

// What happens when you do gulp without any arguments
gulp.task('default', ['clean'], function() {
	gulp.start('chrome', 'safari', 'firefox', 'oblink', 'opera');
});

// Browser task runs subtasks
gulp.task('chrome', ['chrome-css', 'chrome-js', 'chrome-img', 'chrome-move']);
gulp.task('safari', ['safari-css', 'safari-js', 'safari-img', 'safari-move']);
gulp.task('firefox', ['firefox-css', 'firefox-js', 'firefox-img', 'firefox-move']);
gulp.task('oblink', ['oblink-css', 'oblink-js', 'oblink-img', 'oblink-move']);
gulp.task('opera', ['opera-css', 'opera-js', 'opera-img', 'opera-move']);

// Chrome subtasks
gulp.task('chrome-move', ['chrome-move-1', 'chrome-move-2', 'chrome-move-3', 'chrome-move-4']);
gulp.task('chrome-css', ['module-css-chrome', 'core-css-chrome', 'vendor-css-chrome']);
gulp.task('chrome-js', ['lib-js-chrome', 'chrome-js-chrome', 'vendor-js-chrome', 'core-js-chrome', 'modules-js-chrome']);
gulp.task('chrome-img', ['root-images-chrome', 'images-images-chrome']);

// Safari subtasks
gulp.task('safari-css', ['module-css-safari', 'core-css-safari', 'vendor-css-safari']);
gulp.task('safari-js', ['lib-js-safari', 'safari-js-safari', 'vendor-js-safari', 'core-js-safari', 'modules-js-safari']);
gulp.task('safari-img', ['root-images-safari']);
gulp.task('safari-move', ['safari-move-1', 'safari-move-2', 'safari-move-3', 'safari-move-4']);

// Firefox subtasks
gulp.task('firefox-css', ['module-css-firefox', 'core-css-firefox', 'vendor-css-firefox']);
gulp.task('firefox-js', ['modules-js-firefox', 'core-js-firefox', 'vendor-js-firefox', 'data-js-firefox', 'lib-js-firefox-2', 'lib-js-firefox']);
gulp.task('firefox-img', ['root-images-firefox']);
gulp.task('firefox-move', ['firefox-move-1', 'firefox-move-2']);

// OperaBlink subtasks
gulp.task('oblink-css', ['module-css-oblink', 'core-css-oblink', 'vendor-css-oblink']);
gulp.task('oblink-js', ['lib-js-oblink', 'vendor-js-oblink', 'core-js-oblink', 'modules-js-oblink', 'oblink-js-oblink']);
gulp.task('oblink-img', ['root-images-oblink', 'images-images-oblink']);
gulp.task('oblink-move', ['oblink-move-1', 'oblink-move-2', 'oblink-move-3']);

// Opera subtasks
gulp.task('opera-css', ['module-css-opera', 'core-css-opera', 'vendor-css-opera']);
gulp.task('opera-js', ['lib-js-opera', 'vendor-js-opera', 'core-js-opera', 'modules-js-opera', 'opera-js-opera', 'includes-js-opera']);
gulp.task('opera-img', ['root-images-opera']);
gulp.task('opera-move', ['opera-move-1', 'opera-move-2', 'opera-move-3', 'opera-move-4']);

// This kills the CPU
gulp.task('zipall', ['chrome-zip', 'safari-zip', 'firefox-zip', 'oblink-zip', 'opera-zip']);


// Paths
var buildDir = 'dist';
var chromeBuildDir = [ buildDir, 'chrome' ];
var safariBuildDir = [ buildDir, 'safari' ];
var firefoxBuildDir = [ buildDir, 'firefox' ];
var oblinkBuildDir = [ buildDir, 'oblink' ];
var operaBuildDir = [ buildDir, 'opera' ];
var zipDir = '../../../var/www/html/res/dl';


function path() {
	var path = Array.prototype.slice.call(arguments)
		.reduce(function(prev, next) {
			return prev.concat(next);
		}, [])
		.join('/');
	return path;
}



// Chrome low-level tasks
gulp.task('module-css-chrome', function() {
	return gulp.src('lib/modules/*.css')
		.pipe(gulp.dest(path(chromeBuildDir, 'modules')));
});

gulp.task('core-css-chrome', function() {
	return gulp.src('lib/core/*.css')
		.pipe(gulp.dest(path(chromeBuildDir, 'core')));
});

gulp.task('vendor-css-chrome', function() {
	return gulp.src('lib/vendor/*.css')
		.pipe(gulp.dest(path(chromeBuildDir, 'vendor')));
});

gulp.task('lib-js-chrome', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest(path(chromeBuildDir)));
});

gulp.task('chrome-js-chrome', function() {
	return gulp.src('Chrome/*.js')
		.pipe(gulp.dest(path(chromeBuildDir)));
});

gulp.task('vendor-js-chrome', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest(path(chromeBuildDir, 'vendor')));
});

gulp.task('core-js-chrome', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest(path(chromeBuildDir, 'core')));
});

gulp.task('modules-js-chrome', function() {
	return gulp.src([ 'lib/modules/**/*.js' , 'lib/modules/**/*.json' ])
		.pipe(gulp.dest(path(chromeBuildDir, 'modules')));
});

gulp.task('root-images-chrome', function() {
	return gulp.src('Chrome/*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(chromeBuildDir)));
});

gulp.task('images-images-chrome', function() {
	return gulp.src('Chrome/images/*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(chromeBuildDir, 'images')));
});

gulp.task('chrome-move-1', function() { // move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest(path(chromeBuildDir, 'core')));
});

gulp.task('chrome-move-2', function() {
	return gulp.src('Chrome/*.html')
		.pipe(gulp.dest(path(chromeBuildDir)));
});

gulp.task('chrome-move-3', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest(path(chromeBuildDir)));
});

gulp.task('chrome-move-4', function() {
	return gulp.src('Chrome/manifest.json')
		.pipe(gulp.dest(path(chromeBuildDir)));
});

// Safari low-level tasks
gulp.task('module-css-safari', function() {
	return gulp.src('lib/modules/*.css')
		.pipe(gulp.dest(path(safariBuildDir, 'modules')));
});

gulp.task('core-css-safari', function() {
	return gulp.src('lib/core/*.css')
		.pipe(gulp.dest(path(safariBuildDir, 'core')));
});

gulp.task('vendor-css-safari', function() {
	return gulp.src('lib/vendor/*.css')
		.pipe(gulp.dest(path(safariBuildDir, 'vendor')));
});

gulp.task('lib-js-safari', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest(path(safariBuildDir)));
});

gulp.task('safari-js-safari', function() {
	return gulp.src('RES.safariextension/*.js')
		.pipe(gulp.dest(path(safariBuildDir)));
});

gulp.task('vendor-js-safari', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest(path(safariBuildDir, 'vendor')));
});

gulp.task('core-js-safari', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest(path(safariBuildDir, 'core')));
});

gulp.task('modules-js-safari', function() {
	return gulp.src([ 'lib/modules/**/*.js' , 'lib/modules/**/*.json' ])
		.pipe(gulp.dest(path(safariBuildDir, 'modules')));
});

gulp.task('root-images-safari', function() {
	return gulp.src('RES.safariextension/*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(safariBuildDir)));
});

gulp.task('safari-move-1', function() { // move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest(path(safariBuildDir, 'core')));
});

gulp.task('safari-move-2', function() {
	return gulp.src('RES.safariextension/*.html')
		.pipe(gulp.dest(path(safariBuildDir)));
});

gulp.task('safari-move-3', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest(path(safariBuildDir)));
});

gulp.task('safari-move-4', function() {
	return gulp.src('RES.safariextension/info.plist')
		.pipe(gulp.dest(path(safariBuildDir)));
});

// Firefox low-level tasks
gulp.task('module-css-firefox', function() {
	return gulp.src('lib/modules/*.css')
		.pipe(gulp.dest(path(firefoxBuildDir, 'modules')));
});

gulp.task('core-css-firefox', function() {
	return gulp.src('lib/core/*.css')
		.pipe(gulp.dest(path(firefoxBuildDir, 'core')));
});

gulp.task('vendor-css-firefox', function() {
	return gulp.src('lib/vendor/*.css')
		.pipe(gulp.dest(path(firefoxBuildDir, 'vendor')));
});

gulp.task('lib-js-firefox', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest(path(firefoxBuildDir)));
});

gulp.task('lib-js-firefox-2', function() {
	return gulp.src('XPI/lib/*.js')
		.pipe(gulp.dest(path(firefoxBuildDir, 'lib')));
});

gulp.task('data-js-firefox', function() {
	return gulp.src('XPI/data/*.js')
		.pipe(gulp.dest(path(firefoxBuildDir, 'data')));
});

gulp.task('vendor-js-firefox', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest(path(firefoxBuildDir, 'vendor')));
});

gulp.task('core-js-firefox', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest(path(firefoxBuildDir, 'core')));
});

gulp.task('modules-js-firefox', function() {
	return gulp.src([ 'lib/modules/**/*.js' , 'lib/modules/**/*.json' ])
		.pipe(gulp.dest(path(firefoxBuildDir, 'modules')));
});

gulp.task('root-images-firefox', function() {
	return gulp.src('*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(firefoxBuildDir)));
});

gulp.task('firefox-move-1', function() { // move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest(path(firefoxBuildDir, 'core')));
});

gulp.task('firefox-move-2', function() {
	return gulp.src('XPI/package.json')
		.pipe(gulp.dest(path(firefoxBuildDir)));
});

// OperaBlink low-level tasks
gulp.task('module-css-oblink', function() {
	return gulp.src('lib/modules/*.css')
		.pipe(gulp.dest(path(oblinkBuildDir, 'modules')));
});

gulp.task('core-css-oblink', function() {
	return gulp.src('lib/core/*.css')
		.pipe(gulp.dest(path(oblinkBuildDir, 'core')));
});

gulp.task('vendor-css-oblink', function() {
	return gulp.src('lib/vendor/*.css')
		.pipe(gulp.dest(path(oblinkBuildDir, 'vendor')));
});

gulp.task('lib-js-oblink', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest(path(oblinkBuildDir)));
});

gulp.task('vendor-js-oblink', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest(path(oblinkBuildDir, 'vendor')));
});

gulp.task('core-js-oblink', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest(path(oblinkBuildDir, 'core')));
});

gulp.task('modules-js-oblink', function() {
	return gulp.src([ 'lib/modules/**/*.js' , 'lib/modules/**/*.json' ])
		.pipe(gulp.dest(path(oblinkBuildDir, 'modules')));
});

gulp.task('oblink-js-oblink', function() {
	return gulp.src('OperaBlink/*.js')
		.pipe(gulp.dest(path(oblinkBuildDir)));
});

gulp.task('root-images-oblink', function() {
	return gulp.src('OperaBlink/*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(oblinkBuildDir)));
});

gulp.task('images-images-oblink', function() {
	return gulp.src('OperaBlink/images/*.png')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(oblinkBuildDir, 'images')));
});

gulp.task('oblink-move-1', function() { // move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest(path(oblinkBuildDir, 'core')));
});

gulp.task('oblink-move-2', function() {
	return gulp.src('OperaBlink/*.json')
		.pipe(gulp.dest(path(oblinkBuildDir)));
});

gulp.task('oblink-move-3', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest(path(oblinkBuildDir)));
});

// Opera low-level tasks
gulp.task('module-css-opera', function() {
	return gulp.src('lib/modules/*.css')
		.pipe(gulp.dest(path(operaBuildDir, 'modules')));
});

gulp.task('core-css-opera', function() {
	return gulp.src('lib/core/*.css')
		.pipe(gulp.dest(path(operaBuildDir, 'core')));
});

gulp.task('vendor-css-opera', function() {
	return gulp.src('lib/vendor/*.css')
		.pipe(gulp.dest(path(operaBuildDir, 'vendor')));
});

gulp.task('lib-js-opera', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest(path(operaBuildDir)));
});

gulp.task('vendor-js-opera', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest(path(operaBuildDir, 'vendor')));
});

gulp.task('core-js-opera', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest(path(operaBuildDir, 'core')));
});

gulp.task('modules-js-opera', function() {
	return gulp.src([ 'lib/modules/**/*.js' , 'lib/modules/**/*.json' ])
		.pipe(gulp.dest(path(operaBuildDir, 'modules')));
});

gulp.task('opera-js-opera', function() {
	return gulp.src('Opera/*.js')
		.pipe(gulp.dest(path(operaBuildDir)));
});

gulp.task('includes-js-opera', function() {
	return gulp.src('Opera/includes/*.js')
		.pipe(gulp.dest(path(operaBuildDir, 'includes')));
});

gulp.task('root-images-opera', function() {
	return gulp.src('OperaBlink/*.gif')
		.pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
		.pipe(gulp.dest(path(operaBuildDir)));
});

gulp.task('opera-move-1', function() { // move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest(path(operaBuildDir, 'core')));
});

gulp.task('opera-move-2', function() {
	return gulp.src('Opera/*.html')
		.pipe(gulp.dest(path(operaBuildDir)));
});

gulp.task('opera-move-3', function() {
	return gulp.src('Opera/*.xml')
		.pipe(gulp.dest(path(operaBuildDir)));
});

gulp.task('opera-move-4', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest(path(operaBuildDir)));
});

// Zip tasks
gulp.task('chrome-zip', function() {
	return gulp.src(path(chromeBuildDir, '**/*'))
		.pipe(zip('chrome.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('safari-zip', function() {
	return gulp.src(path(safariBuildDir, '**/*'))
		.pipe(zip('safari.safariextension.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('firefox-zip', function() {
	return gulp.src(path(firefoxBuildDir, '**/*'))
		.pipe(zip('firefox.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('oblink-zip', function() {
	return gulp.src(path(oblinkBuildDir, '**/*'))
		.pipe(zip('operablink.zip'))
		.pipe(gulp.dest(zipDir));
});

gulp.task('opera-zip', function() {
	return gulp.src(path(operaBuildDir, '**/*'))
		.pipe(zip('opera.zip'))
		.pipe(gulp.dest());
});

// Other
gulp.task('clean', function(cb) {
	del(['dist/**/*'], cb);
});
