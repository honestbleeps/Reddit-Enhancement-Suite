//Please Read README.md or gulpreadme.md to understand what is going on!

var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
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

gulp.task('chrome', ['chromecss', 'chromejs', 'chromeimg', 'chromemove']);

gulp.task('safari', ['safaricss', 'safarijs', 'safariimg', 'safarimove']);

gulp.task('firefox', ['firefoxcss', 'firefoxjs', 'firefoximg', 'firefoxmove']);

gulp.task('oblink', ['oblinkcss', 'oblinkjs', 'oblinkimg', 'oblinkmove']);

gulp.task('opera', ['operacss', 'operajs', 'operaimg', 'operamove']);

//Chrome subtasks. They run subsubtasks

gulp.task('chromemove', ['chromemove1', 'chromemove2', 'chromemove3', 'chromemove4']);

gulp.task('chromecss', ['modulecsschrome', 'corecsschrome', 'vendorcsschrome']);

gulp.task('chromejs', ['libjschrome', 'chromejschrome', 'vendorjschrome', 'corejschrome', 'modulesjschrome']);

gulp.task('chromeimg', ['rootimageschrome', 'imagesimageschrome']);

//Safari subtasks

gulp.task('safaricss', ['modulecsssafari', 'corecsssafari', 'vendorcsssafari']);

gulp.task('safarijs', ['libjssafari', 'safarijssafari', 'vendorjssafari', 'corejssafari', 'modulesjssafari']);

gulp.task('safariimg', ['rootimagessafari']);

gulp.task('safarimove', ['safarimove1', 'safarimove2', 'safarimove3', 'safarimove4']);

//Firefox subtasks

gulp.task('firefoxcss', ['modulecssfirefox', 'corecssfirefox', 'vendorcssfirefox']);

gulp.task('firefoxjs', ['modulesjsfirefox', 'corejsfirefox', 'vendorjsfirefox', 'datajsfirefox', 'libjsfirefox2', 'libjsfirefox']);

gulp.task('firefoximg', ['rootimagesfirefox']);

gulp.task('firefoxmove', ['firefoxmove1', 'firefoxmove2']);

//OperaBlink subtasks

gulp.task('oblinkcss', ['modulecssoblink', 'corecssoblink', 'vendorcssoblink']);

gulp.task('oblinkjs', ['libjsoblink', 'vendorjsoblink', 'corejsoblink', 'modulesjsoblink', 'oblinkjsoblink']);

gulp.task('oblinkimg', ['rootimagesoblink', 'imagesimagesoblink']);

gulp.task('oblinkmove', ['oblinkmove1', 'oblinkmove2', 'oblinkmove3']);

//Opera subtasks

gulp.task('operacss', ['modulecssopera', 'corecssopera', 'vendorcssopera']);

gulp.task('operajs', ['libjsopera', 'vendorjsopera', 'corejsopera', 'modulesjsopera', 'operajsopera', 'includesjsopera']);

gulp.task('operaimg', ['rootimagesopera']);

gulp.task('operamove', ['operamove1', 'operamove2', 'operamove3', 'operamove4']);

//This kills the CPU

gulp.task('zipall', ['chromezip', 'safarizip', 'firefoxzip', 'oblinkzip', 'operazip']);

//Chrome Low-Level Tasks

gulp.task('modulecsschrome', function() {
	return gulp.src('lib/modules/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/chrome/modules'))
});

gulp.task('corecsschrome', function() {
	return gulp.src('lib/core/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('vendorcsschrome', function() {
	return gulp.src('lib/vendor/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/chrome/vendor'))
});

gulp.task('libjschrome', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chromejschrome', function() { //loltaskname
	return gulp.src('Chrome/*.js')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('vendorjschrome', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/chrome/vendor'))
});

gulp.task('corejschrome', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('modulesjschrome', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/chrome/modules'))
});

gulp.task('rootimageschrome', function() {
  return gulp.src('Chrome/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/chrome'))
});

gulp.task('imagesimageschrome', function() { //yo dog
  return gulp.src('Chrome/images/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/chrome/images'))
});

gulp.task('chromemove1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/chrome/core'))
});

gulp.task('chromemove2', function() { 
	return gulp.src('Chrome/*.html')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chromemove3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/chrome'))
});

gulp.task('chromemove4', function() { 
	return gulp.src('Chrome/manifest.json')
		.pipe(gulp.dest('dist/chrome'))
});

// Safari Low-Level Tasks

gulp.task('modulecsssafari', function() {
	return gulp.src('lib/modules/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/safari/modules'))
});

gulp.task('corecsssafari', function() {
	return gulp.src('lib/core/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('vendorcsssafari', function() {
	return gulp.src('lib/vendor/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/safari/vendor'))
});

gulp.task('libjssafari', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safarijssafari', function() {
	return gulp.src('RES.safariextension/*.js')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('vendorjssafari', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/safari/vendor'))
});

gulp.task('corejssafari', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('modulesjssafari', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/safari/modules'))
});

gulp.task('rootimagessafari', function() {
  return gulp.src('RES.safariextension/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/safari'))
});

gulp.task('safarimove1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/safari/core'))
});

gulp.task('safarimove2', function() { 
	return gulp.src('RES.safariextension/*.html')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safarimove3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/safari'))
});

gulp.task('safarimove4', function() { 
	return gulp.src('RES.safariextension/info.plist')
		.pipe(gulp.dest('dist/safari'))
});

//Firefox Low-Level Tasks

gulp.task('modulecssfirefox', function() {
	return gulp.src('lib/modules/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/firefox/modules'))
});

gulp.task('corecssfirefox', function() {
	return gulp.src('lib/core/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('vendorcssfirefox', function() {
	return gulp.src('lib/vendor/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/firefox/vendor'))
});

gulp.task('libjsfirefox', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/firefox'))
});

gulp.task('libjsfirefox2', function() {
	return gulp.src('XPI/lib/*.js')
		.pipe(gulp.dest('dist/firefox/lib'))
});

gulp.task('datajsfirefox', function() {
	return gulp.src('XPI/data/*.js')
		.pipe(gulp.dest('dist/firefox/data'))
});

gulp.task('vendorjsfirefox', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/firefox/vendor'))
});

gulp.task('corejsfirefox', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('modulesjsfirefox', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/firefox/modules'))
});

gulp.task('rootimagesfirefox', function() {
  return gulp.src('*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/firefox'))
});

gulp.task('firefoxmove1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/firefox/core'))
});

gulp.task('firefoxmove2', function() { 
	return gulp.src('XPI/package.json')
		.pipe(gulp.dest('dist/firefox'))
});

//OperaBlink Low-Level Tasks

gulp.task('modulecssoblink', function() {
	return gulp.src('lib/modules/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/oblink/modules'))
});

gulp.task('corecssoblink', function() {
	return gulp.src('lib/core/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('vendorcssoblink', function() {
	return gulp.src('lib/vendor/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/oblink/vendor'))
});

gulp.task('libjsoblink', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('vendorjsoblink', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/oblink/vendor'))
});

gulp.task('corejsoblink', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('modulesjsoblink', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/oblink/modules'))
});

gulp.task('oblinkjsoblink', function() {
	return gulp.src('OperaBlink/*.js')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('rootimagesoblink', function() {
  return gulp.src('OperaBlink/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/oblink'))
});

gulp.task('imagesimagesoblink', function() { 
  return gulp.src('OperaBlink/images/*.png')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/oblink/images'))
});

gulp.task('oblinkmove1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/oblink/core'))
});

gulp.task('oblinkmove2', function() {
	return gulp.src('OperaBlink/*.json')
		.pipe(gulp.dest('dist/oblink'))
});

gulp.task('oblinkmove3', function() { 
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/oblink'))
});

//Opera Low-Level Tasks (Old)

gulp.task('modulecssopera', function() {
	return gulp.src('lib/modules/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/opera/modules'))
});

gulp.task('corecssopera', function() {
	return gulp.src('lib/core/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('vendorcssopera', function() {
	return gulp.src('lib/vendor/*.css')
   	 	.pipe(minifycss())
   		.pipe(gulp.dest('dist/opera/vendor'))
});

gulp.task('libjsopera', function() {
	return gulp.src('lib/*.js')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('vendorjsopera', function() {
	return gulp.src('lib/vendor/*.js')
		.pipe(gulp.dest('dist/opera/vendor'))
});

gulp.task('corejsopera', function() {
	return gulp.src('lib/core/*.js')
		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('modulesjsopera', function() {
	return gulp.src('lib/modules/*.js')
		.pipe(gulp.dest('dist/opera/modules'))
});

gulp.task('operajsopera', function() {
	return gulp.src('Opera/*.js')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('includesjsopera', function() {
	return gulp.src('Opera/includes/*.js')
		.pipe(gulp.dest('dist/opera/includes'))
});

gulp.task('rootimagesopera', function() {
  return gulp.src('OperaBlink/*.gif')
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('dist/opera'))
});

gulp.task('operamove1', function() { //move other stuff that doesn't fit elsewhere
	return gulp.src('lib/core/*.html')
		.pipe(gulp.dest('dist/opera/core'))
});

gulp.task('operamove2', function() {
	return gulp.src('Opera/*.html')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('operamove3', function() {
	return gulp.src('Opera/*.xml')
		.pipe(gulp.dest('dist/opera'))
});

gulp.task('operamove4', function() {
	return gulp.src('package.json')
		.pipe(gulp.dest('dist/opera'))
});


//Zip Tasks

gulp.task('chromezip', function() {
	return gulp.src('dist/chrome/**/*')
		.pipe(zip('chrome.zip'))
		.pipe(gulp.dest('../../../var/www/html'))
});

gulp.task('safarizip', function() {
	return gulp.src('dist/safari/**/*')
		.pipe(zip('safari.safariextension.zip'))
		.pipe(gulp.dest('../../../var/www/html'))
});

gulp.task('firefoxzip', function() {
	return gulp.src('dist/firefox/**/*')
		.pipe(zip('firefox.zip'))
		.pipe(gulp.dest('../../../var/www/html'))
});

gulp.task('oblinkzip', function() {
	return gulp.src('dist/oblink/**/*')
		.pipe(zip('operablink.zip'))
		.pipe(gulp.dest('../../../var/www/html'))
});

gulp.task('operazip', function() {
	return gulp.src('dist/opera/**/*')
		.pipe(zip('opera.zip'))
		.pipe(gulp.dest('../../../var/www/html'))
});

//Other

gulp.task('clean', function(cb) {
    del(['dist/**/*'], cb)
});
