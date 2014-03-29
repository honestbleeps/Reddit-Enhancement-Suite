module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-listfiles');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Generate manifests
		// Create resource listings for manifests
		listfiles: {
			options: {
				banner: '',
				footer: '',
				prefix: '',
				postfix: '',
				postfixLastLine: '',
				replacements: [{
					pattern: /^lib\/(.*)$/,
					replacement: '$1'
				}]
			},
			js: {
				files: {
					"temp/ls/js.txt": [
						"lib/{,*/,**/}*.js",
					]
				}
			},
			css: {
				files: {
					"temp/ls/css.txt": [
						"lib/{,*/,**/}*.css",
					]
				}
			},
			resources: {
				files: {
					"temp/ls/resources.txt": [
						"lib/{,*/,**/}*.{html,png,map}"
					]
				}
			}
		},



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

	// Generate manifests

};
