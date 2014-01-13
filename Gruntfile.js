// JS files needed for RES
var res_files = [
	'lib/jquery-1.10.2.min.js', 
	'lib/guiders-1.2.8.js', 
	'lib/tinycon.js', 
	'lib/snuownd.js', 
	'lib/jquery.dragsort-0.6.js',
	'lib/jquery.tokeninput.js',
	'lib/jquery-fieldselection.min.js',
	'lib/reddit_enhancement_suite.user.js'
];

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Move CSS
		copy: {
		  chrome:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'Chrome/', filter: 'isFile'}]
		  },
		  ie:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'IE/', filter: 'isFile'}]
		  },
		  opera:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'Opera/', filter: 'isFile'}]
		  },
		  operablink:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'OperaBlink/', filter: 'isFile'}]
		  },
		  safari:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'RES.safariextension/', filter: 'isFile'}]
		  },
		  firefox:{
			files: [{ expand: true, flatten: true, src: ['lib/*.css'], dest: 'XPI/', filter: 'isFile'}]
		  },
		},

		// Concat JS
		concat: {
		  chrome: { src: res_files, dest: ['Chrome/reddit_enhancement_suite.user.js'] },
		  ie: { src: res_files, dest: ['IE/reddit_enhancement_suite.user.js'] },
		  opera: { src: res_files, dest: ['Opera/reddit_enhancement_suite.user.js'] },
		  operablink: { src: res_files, dest: ['OperaBlink/reddit_enhancement_suite.user.js'] },
		  safari: { src: res_files, dest: ['RES.safariextension/reddit_enhancement_suite.user.js'] },
		  firefox: { src: res_files, dest: ['XPI/reddit_enhancement_suite.user.js'] } 
		},

		// Watch for changes
		watch: {
			chrome:{
				files: ['lib/*'], tasks: ['copy:chrome', 'concat:chrome']
			},
			ie:{
				files: ['lib/*'], tasks: ['copy:ie', 'concat:ie']
			},
			opera:{
				files: ['lib/*'], tasks: ['copy:opera', 'concat:opera']
			},
			operablink:{
				files: ['lib/*'], tasks: ['copy:operablink', 'concat:operablink']
			},
			safari:{
				files: ['lib/*'], tasks: ['copy:safari', 'concat:safari']
			},
			firefox:{
				files: ['lib/*'], tasks: ['copy:firefox', 'concat:firefox']
			}	
		}
	});
	
	grunt.registerTask('chrome',    ['copy:chrome', 'concat:chrome', 'watch:chrome']);
	grunt.registerTask('ie',     	['copy:ie', 'concat:ie', 'watch:ie']);
	grunt.registerTask('opera',     ['copy:opera', 'concat:opera', 'watch:opera']);
	grunt.registerTask('operablink',['copy:operablink', 'concat:operablink', 'watch:operablink']);
	grunt.registerTask('safari',    ['copy:safari', 'concat:safari', 'watch:safari']);
	grunt.registerTask('firefox',   ['copy:firefox', 'concat:firefox', 'watch:firefox']);
   
	
}