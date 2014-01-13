module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Move CSS & JS
		copy: {
		  chrome:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'Chrome/', filter: 'isFile'}]
		  },
		  ie:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'IE/', filter: 'isFile'}]
		  },
		  opera:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'Opera/', filter: 'isFile'}]
		  },
		  operablink:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'OperaBlink/', filter: 'isFile'}]
		  },
		  safari:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'RES.safariextension/', filter: 'isFile'}]
		  },
		  firefox:{
			files: [{ expand: true, flatten: true, src: ['lib/*'], dest: 'XPI/', filter: 'isFile'}]
		  },
		},

		// Watch for changes
		watch: {
			chrome:{
				files: ['lib/*'], tasks: ['copy:chrome']
			},
			ie:{
				files: ['lib/*'], tasks: ['copy:ie']
			},
			opera:{
				files: ['lib/*'], tasks: ['copy:opera']
			},
			operablink:{
				files: ['lib/*'], tasks: ['copy:operablink']
			},
			safari:{
				files: ['lib/*'], tasks: ['copy:safari']
			},
			firefox:{
				files: ['lib/*'], tasks: ['copy:firefox']
			}	
		}
	});
	// Build all with "grunt"
    grunt.registerTask('default', ['copy']);

    // Setup for devlopment with "grunt chrome" or "grunt firefox" (enables watch task)
	grunt.registerTask('chrome',    ['copy:chrome', 'watch:chrome']);
	grunt.registerTask('ie',     	['copy:ie', 'watch:ie']);
	grunt.registerTask('opera',     ['copy:opera', 'watch:opera']);
	grunt.registerTask('operablink',['copy:operablink', 'watch:operablink']);
	grunt.registerTask('safari',    ['copy:safari', 'watch:safari']);
	grunt.registerTask('firefox',   ['copy:firefox', 'watch:firefox']);
   
	
}