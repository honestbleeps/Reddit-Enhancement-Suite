module.exports = function(grunt) {
	'use strict';

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

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
				files: [
					{ expand: true, cwd: 'lib/', src: ['**'], dest: 'OperaBlink/'},
					{ expand: true, cwd: 'Chrome/', src: ['browsersupport-chrome.js'], dest: 'OperaBlink/'}
				]
			},
			safari: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'RES.safariextension/'}]
			},
			firefox: {
				files: [{ expand: true, cwd: 'lib/', src: ['**'], dest: 'XPI/data/'}]
			}
		},

		// Watch for changes
		watch: {
			chrome: {
				files: ['lib/*', 'lib/*/*'],
				tasks: ['copy:chrome']
			},
			opera: {
				files: ['lib/*', 'lib/*/*'],
				tasks: ['copy:opera']
			},
			operablink: {
				files: ['lib/*', 'lib/*/*', 'Chrome/browsersupport-chrome.js'],
				tasks: ['copy:operablink']
			},
			safari: {
				files: ['lib/*', 'lib/*/*'],
				tasks: ['copy:safari']
			},
			firefox: {
				files: ['lib/*', 'lib/*/*'],
				tasks: ['copy:firefox']
			}
		},

		// Run QUnit tests
		qunit: {
			all: ['tests/qunit/tests.html']
		},

		// Run NodeUnit tests
		nodeunit: {
			all: ['tests/selenium/all.js']
		},

		// JSHint
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			grunt: {
				src: ['Gruntfile.js']
			},
			all: {
				src: [
					'lib/**/*.js',
					'!lib/vendor/*.js'
				]
			}
		},

		// JSCS
		jscs: {
			options: {
				config: '.jscsrc'
			},
			all: {
				src: [
					'lib/**/*.js',
					'!lib/vendor/*.js'
				]
			}
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

	// Travis
	grunt.registerTask('travis', ['jshint:all', 'jscs:all']);
};
