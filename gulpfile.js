//Please Read README.md or gulpreadme.md to understand what is going on!

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    bump = require('gulp-bump'),
    zip = require('gulp-zip');
    
// What happens when you do gulp without any arguments

gulp.task('default', ['clean'], function() {
    gulp.start('chrome', 'safari', 'firefox', 'oblink', 'opera');
});

//Browser task runs subtasks

gulp.task('chrome', ['chrome-css', 'chrome-js', 'chrome-img', 'chrome-move']);

gulp.task('safari', ['safari-css', 'safari-js', 'safari-img', 'safari-move']);

gulp.task('firefox', ['firefox-css', 'firefox-js', 'firefox-img', 'firefox-move']);

gulp.task('oblink', ['oblink-css', 'oblink-js', 'oblink-img', 'oblink-move']);

gulp.task('opera', ['opera-css', 'opera-js', 'opera-img', 'opera-move']);

//Chrome subtasks. They run subsubtasks

gulp.task('chrome-move', ['chrome-move-1', 'chrome-move-2', 'chrome-move-3', 'chrome-move-4']);

gulp.task('chrome-css', ['module-css-chrome', 'core-css-chrome', 'vendor-css-chrome']);

gulp.task('chrome-js', ['lib-js-chrome', 'chrome-js-chrome', 'vendor-js-chrome', 'core-js-chrome', 'modules-js-chrome']);

gulp.task('chrome-img', ['root-images-chrome', 'images-images-chrome']);

//Safari subtasks

gulp.task('safari-css', ['module-css-safari', 'core-css-safari', 'vendor-css-safari']);

gulp.task('safari-js', ['lib-js-safari', 'safari-js-safari', 'vendor-js-safari', 'core-js-safari', 'modules-js-safari']);

gulp.task('safari-img', ['root-images-safari']);

gulp.task('safari-move', ['safari-move-1', 'safari-move-2', 'safari-move-3', 'safari-move-4']);

//Firefox subtasks

gulp.task('firefox-css', ['module-css-firefox', 'core-css-firefox', 'vendor-css-firefox']);

gulp.task('firefox-js', ['modules-js-firefox', 'core-js-firefox', 'vendor-js-firefox', 'data-js-firefox', 'lib-js-firefox-2', 'lib-js-firefox']);

gulp.task('firefox-img', ['root-images-firefox']);

gulp.task('firefox-move', ['firefox-move-1', 'firefox-move-2']);

//OperaBlink subtasks

gulp.task('oblink-css', ['module-css-oblink', 'core-css-oblink', 'vendor-css-oblink']);

gulp.task('oblink-js', ['lib-js-oblink', 'vendor-js-oblink', 'core-js-oblink', 'modules-js-oblink', 'oblink-js-oblink']);

gulp.task('oblink-img', ['root-images-oblink', 'images-images-oblink']);

gulp.task('oblink-move', ['oblink-move-1', 'oblink-move-2', 'oblink-move-3']);

//Opera subtasks

gulp.task('opera-css', ['module-css-opera', 'core-css-opera', 'vendor-css-opera']);

gulp.task('opera-js', ['lib-js-opera', 'vendor-js-opera', 'core-js-opera', 'modules-js-opera', 'opera-js-opera', 'includes-js-opera']);

gulp.task('opera-img', ['root-images-opera']);

gulp.task('opera-move', ['opera-move-1', 'opera-move-2', 'opera-move-3', 'opera-move-4']);

//This kills the CPU

gulp.task('zipall', ['chrome-zip', 'safari-zip', 'firefox-zip', 'oblink-zip', 'opera-zip']);

//Chrome Low-Level Tasks

gulp.task('module-css-chrome', function() {
	return gulp.src('lib/modules/*.css')
   		.pipe(gulp.dest('dist/chrome/modules'))
});

gulp.task('core-css-chrome', function() {
	return gulp.src('lib/core/*.css')
   		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('vendor-css-chrome', function() {
	return gulp.src('lib/vendor/*.css')
   		.pipe(gulp.dest('dist/chrome/vendor'))
});

gulp.task('lib-js-chrome', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chrome-js-chrome', function() { //loltaskname
	return gulp.src('Chrome/*.js')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('vendor-js-chrome', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/chrome/vendor'))
});

gulp.task('core-js-chrome', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('modules-js-chrome', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/chrome/modules'))
});

gulp.task('root-images-chrome', function() {
  return gulp.src('Chrome/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/chrome'))
});

gulp.task('images-images-chrome', function() { //yo dog
  return gulp.src('Chrome/images/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/chrome/images'))
});

gulp.task('chrome-move-1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('chrome-move-2', function() { 
	return gulp.src('Chrome/*.html')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chrome-move-3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chrome-move-4', function() { 
	return gulp.src('Chrome/manifest.json')
		.pipe(gulp.dest('dist/chrome'))
});

// Safari Low-Level Tasks

gulp.task('module-css-safari', function() {
	return gulp.src('lib/modules/*.css')
   		.pipe(gulp.dest('dist/safari/modules'))
});

gulp.task('core-css-safari', function() {
	return gulp.src('lib/core/*.css')
   		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('vendor-css-safari', function() {
	return gulp.src('lib/vendor/*.css')
   		.pipe(gulp.dest('dist/safari/vendor'))
});

gulp.task('lib-js-safari', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safari-js-safari', function() {
	return gulp.src('RES.safariextension/*.js')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('vendor-js-safari', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/safari/vendor'))
});

gulp.task('core-js-safari', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('modules-js-safari', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/safari/modules'))
});

gulp.task('root-images-safari', function() {
  return gulp.src('RES.safariextension/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/safari'))
});

gulp.task('safari-move-1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('safari-move-2', function() { 
	return gulp.src('RES.safariextension/*.html')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safari-move-3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safari-move-4', function() { 
	return gulp.src('RES.safariextension/info.plist')
		.pipe(gulp.dest('dist/safari'))
});

//Firefox Low-Level Tasks

gulp.task('module-css-firefox', function() {
	return gulp.src('lib/modules/*.css')
   		.pipe(gulp.dest('dist/firefox/modules'))
});

gulp.task('core-css-firefox', function() {
	return gulp.src('lib/core/*.css')
   		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('vendor-css-firefox', function() {
	return gulp.src('lib/vendor/*.css')
   		.pipe(gulp.dest('dist/firefox/vendor'))
});

gulp.task('lib-js-firefox', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/firefox'))
});

gulp.task('lib-js-firefox-2', function() {
	return gulp.src('XPI/lib/*.js')
		.pipe(gulp.dest('dist/firefox/lib'))
});

gulp.task('data-js-firefox', function() {
	return gulp.src('XPI/data/*.js')
		.pipe(gulp.dest('dist/firefox/data'))
});

gulp.task('vendor-js-firefox', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/firefox/vendor'))
});

gulp.task('core-js-firefox', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('modules-js-firefox', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/firefox/modules'))
});

gulp.task('root-images-firefox', function() {
  return gulp.src('*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/firefox'))
});

gulp.task('firefox-move-1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('firefox-move-2', function() { 
	return gulp.src('XPI/package.json')
		.pipe(gulp.dest('dist/firefox'))
});

//OperaBlink Low-Level Tasks

gulp.task('module-css-oblink', function() {
	return gulp.src('lib/modules/*.css')
   		.pipe(gulp.dest('dist/oblink/modules'))
});

gulp.task('core-css-oblink', function() {
	return gulp.src('lib/core/*.css')
   		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('vendor-css-oblink', function() {
	return gulp.src('lib/vendor/*.css')
   		.pipe(gulp.dest('dist/oblink/vendor'))
});

gulp.task('lib-js-oblink', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('vendor-js-oblink', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/oblink/vendor'))
});

gulp.task('core-js-oblink', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('modules-js-oblink', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/oblink/modules'))
});

gulp.task('oblink-js-oblink', function() {
	return gulp.src('OperaBlink/*.js')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('root-images-oblink', function() {
  return gulp.src('OperaBlink/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/oblink'))
});

gulp.task('images-images-oblink', function() { 
  return gulp.src('OperaBlink/images/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/oblink/images'))
});

gulp.task('oblink-move-1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('oblink-move-2', function() {
	return gulp.src('OperaBlink/*.json')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('oblink-move-3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/oblink'))
});

//Opera Low-Level Tasks (Old)

gulp.task('module-css-opera', function() {
	return gulp.src('lib/modules/*.css')
   		.pipe(gulp.dest('dist/opera/modules'))
});

gulp.task('core-css-opera', function() {
	return gulp.src('lib/core/*.css')
   		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('vendor-css-opera', function() {
	return gulp.src('lib/vendor/*.css')
   		.pipe(gulp.dest('dist/opera/vendor'))
});

gulp.task('lib-js-opera', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('vendor-js-opera', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/opera/vendor'))
});

gulp.task('core-js-opera', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('modules-js-opera', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/opera/modules'))
});

gulp.task('opera-js-opera', function() {
	return gulp.src('Opera/*.js')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('includes-js-opera', function() {
	return gulp.src('Opera/includes/*.js')
		.pipe(gulp.dest('dist/opera/includes'))
});

gulp.task('root-images-opera', function() {
  return gulp.src('OperaBlink/*.gif')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/opera'))
});

gulp.task('opera-move-1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('opera-move-2', function() {
	return gulp.src('Opera/*.html')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('opera-move-3', function() {
	return gulp.src('Opera/*.xml')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('opera-move-4', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/opera'))
});


//Zip Tasks

gulp.task('chrome-zip', function() {
	return gulp.src('dist/chrome/**/*')
		.pipe(zip('chrome.zip'))
		.pipe(gulp.dest('../../../var/www/html/res/dl'))
});

gulp.task('safari-zip', function() {
	return gulp.src('dist/safari/**/*')
		.pipe(zip('safari.safariextension.zip'))
		.pipe(gulp.dest('../../../var/www/html/res/dl'))
});

gulp.task('firefox-zip', function() {
	return gulp.src('dist/firefox/**/*')
		.pipe(zip('firefox.zip'))
		.pipe(gulp.dest('../../../var/www/html/res/dl'))
});

gulp.task('oblink-zip', function() {
	return gulp.src('dist/oblink/**/*')
		.pipe(zip('operablink.zip'))
		.pipe(gulp.dest('../../../var/www/html/res/dl'))
});

gulp.task('opera-zip', function() {
	return gulp.src('dist/opera/**/*')
		.pipe(zip('opera.zip'))
		.pipe(gulp.dest('../../../var/www/html/res/dl'))
});

//Other

gulp.task('clean', function(cb) {
    del(['dist/**/*'], cb)
});
