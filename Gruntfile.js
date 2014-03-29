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
					"temp/ls/js.txt": resourceFiles("js")
				}
			},
			css: {
				files: {
					"temp/ls/css.txt": resourceFiles("css")
				}
			},
			resources: {
				files: {
					"temp/ls/resources.txt": resourceFiles("resources", "{html,png,map}")
				}
			}
		},

		replace: {
			chrome: {
				src: "manifests/Chrome/manifest.json",
				dest: "temp/manifests/Chrome/",
				replacements: replacements()
			},
			operablink: {
				src: "manifests/OperaBlink/manifest.json",
				dest: "temp/manifests/OperaBlink/",
				replacements: replacements()
			},
			safari: {
				src: "manifests/RES.safariextension/Info.plist",
				dest: "temp/manifests/RES.safariextension/",
				replacements: replacements(formatFileListingsForSafari)
			}, firefox: {
				src: "manifests/XPI/package.json",
				dest: "temp/manifests/XPI/",
				replacements: replacements()
			}
		},


		// Move CSS & JS
		copy: {
			chrome: {
				files: [
					{ expand: true, cwd: 'Chrome/', src: ['**'], dest: 'temp/ext/Chrome/'},
					{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/Chrome/'},
					{ expand: true, cwd: 'temp/manifests/Chrome/', src: ['**'], dest: 'temp/ext/Chrome/'}
				]
			},
			operablink: {
				fires: [
					{ expand: true, cwd: 'OperaBlink/', src: ['**'], dest: 'temp/ext/OperaBlink/'},
					{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/OperaBlink/'},
					{ expand: true, cwd: 'temp/manifests/OperaBlink/', src: ['**'], dest: 'temp/ext/OperaBlink/'}
				]
			},
			safari: {
				files: [
					{ expand: true, cwd: 'RES.safariextension/', src: ['**'], dest: 'temp/ext/RES.safariextension/'},
					{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/RES.safariextension/'},
					{ expand: true, cwd: 'temp/manifests/RES.safariextension/', src: ['**'], dest: 'temp/ext/RES.safariextension/'}
				]
			},
			firefox: {
				files: [
					{ expand: true, cwd: 'XPI/', src: ['**'], dest: 'temp/ext/XPI/'},
					{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/XPI/data/'},
					{ expand: true, cwd: 'temp/manifests/XPI/data/', src: ['**'], dest: 'temp/ext/XPI/data/'}
				]
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

	function resourceFiles(group, extension) {
		extension = extension || group;
		var libdirs = ["vendors/base", "vendors", "core", "app", "", "modules"];
		var allpaths = [];
		libdirs.forEach(function(dir) {
			var paths = [];
			if (package.files[group] && package.files[group][dir]) {
				paths = package.files[group][dir].map(function(filename) { return "lib/" + dir + "/" + filename; });
			} else {
				paths = [ "lib/" + dir + "/{,*/,**/}*." + extension ];
			}

			allpaths = allpaths.concat(paths);
		});

		return allpaths;
	}

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
