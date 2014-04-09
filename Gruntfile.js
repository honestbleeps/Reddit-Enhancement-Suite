module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Move CSS & JS
		copy: {
			chrome: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'Chrome/'}]
			},
			opera: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'Opera/'}]
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
			opera: {
				files: ['lib/*', 'lib/*/*'], tasks: ['copy:opera']
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
		},

		// Run QUnit tests
		qunit: {
			all: ['tests/qunit/tests.html']
		},

		// Run NodeUnit tests
		nodeunit: {
			all: ['tests/selenium/all.js']
		}
	});

	// Build all with "grunt"
	grunt.registerTask('default', ['copy']);

	// Run tests
	grunt.registerTask('test', ['qunit:all', 'nodeunit:all']);

	// Setup for development with "grunt chrome" or "grunt firefox" (enables watch task)
	grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
	grunt.registerTask('opera', ['copy:opera', 'watch:opera']);
	grunt.registerTask('operablink', ['copy:operablink', 'watch:operablink']);
	grunt.registerTask('safari', ['copy:safari', 'watch:safari']);
	grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);
};
