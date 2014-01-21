module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Move CSS & JS
		copy: {
			chrome: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'Chrome/'}]
			},
			operablink: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'OperaBlink/'}]
			},
			safari: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'RES.safariextension/'}]
			},
			firefox: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'XPI/'}]
			}
		},

		// Watch for changes
		watch: {
			chrome: {
				files: ['lib/*', 'lib/*/*'], tasks: ['copy:chrome']
			},
			operablink: {
				files: ['lib/*', 'lib/*/*'], tasks: ['copy:operablink']
			},
			safari: {
				files: ['lib/*', 'lib/*/*'], tasks: ['copy:safari']
			},
			firefox: {
				files: ['lib/*', 'lib/*/*'], tasks: ['copy:firefox']
			}
		}
	});

	// Build all with "grunt"
	grunt.registerTask('default', ['copy']);

	// Setup for devlopment with "grunt chrome" or "grunt firefox" (enables watch task)
	grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
	grunt.registerTask('operablink', ['copy:operablink', 'watch:operablink']);
	grunt.registerTask('safari', ['copy:safari', 'watch:safari']);
	grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
};
