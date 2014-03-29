module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-listfiles');
	grunt.loadNpmTasks('grunt-text-replace');

	var buildify = require('buildify');
	var package = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: package,

		// Populate manifests


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
						["vendors/base", "vendors", "core", "app", "", "modules"].map(function(dir) { return "lib/" + dir + "{,*/,**/}*." + "js"; })
					]
				}
			},
			css: {
				files: {
					"temp/ls/css.txt": [
						["vendors", "core", "app", "", "modules"].map(function(dir) { return "lib/" + dir + "{,*/,**/}*." + "css"; })
					]
				}
			},
			resources: {
				files: {
					"temp/ls/resources.txt": [
						["vendors", "core", "app", "", "modules"].map(function(dir) { return "lib/" + dir + "{,*/,**/}*." + "{html,png,map}" })
					]
				}
			}
		},

		replace: {
			chrome: {
				src: "manifests/Chrome/manifest.json",
				dest: "Chrome/manifest.json",
				replacements: replacements()
			},
			operablink: {
				src: "manifests/OperaBlink/manifest.json",
				dest: "OperaBlink/manifest.json",
				replacements: replacements()
			},
			safari: {
				src: "manifests/RES.safariextension/Info.plist",
				dest: "RES.safariextension/Info.plist",
				replacements: replacements(formatFileListingsForSafari)
			}, firefox: {
				src: "manifests/XPI/package.json",
				dest: "XPI/package.json",
				replacements: replacements()
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

	function replacements(formatOptions) {
		var replacements = [ {
				from: "/* version */",
				to: package.version
			}, {
				from: "/* name */",
				to: package.name
			}];
		replacements = replacements.concat(
			"js css resources".split(' ').map(function(name) {
					return  {
						from: "/* " + name + " */",
						to: function(match) {
							return formatFileListings(name, formatOptions);
						}
					};
				})
			);

		return replacements;
	}


	function formatFileListings(name, options) {
		options = options || {};
		options.prefix = options.prefix || '\t\t\t\t"';
		options.prefixFirstLine = options.prefixFirstLine || '"';
		options.postfix = options.postfix || '",';
		options.postfixLastLine = options.postfixLastLine || '"';

		var filename = "temp/ls/" + name + ".txt";
		var contents = buildify().load(filename).getContent();
		var lines = contents.split("\n");

		var formatted = lines.map(function(line, index, array) {
			return  ""
				+ (index > 0 ? options.prefix  : options.prefixFirstLine)
				+ line
				+ (index < array.length - 1 ? options.postfix : options.postfixLastLine);
		});

		var result = formatted.join("\n");
		return result;
	}

	var formatFileListingsForSafari = {
		prefix: '\t\t\t\t<string>',
		prefixFirstLine: '<string>',
		postfix: '</string>',
		prefixLastLine: '</string>',
	};




	// Build all with "grunt"
	grunt.registerTask('default', [ 'manifests', 'copy']);

	// Setup for devlopment with "grunt chrome" or "grunt firefox" (enables watch task)
	grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
	grunt.registerTask('operablink', ['copy:operablink', 'watch:operablink']);
	grunt.registerTask('safari', ['copy:safari', 'watch:safari']);
	grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);

	// Generate manifests

	grunt.registerTask('manifests', ['listfiles', 'replace'])
};
