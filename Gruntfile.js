module.exports = (function() {
	return doGrunt;

	var package, buildify
	function doGrunt(grunt) {
		grunt.loadNpmTasks('grunt-contrib-watch');
		grunt.loadNpmTasks('grunt-contrib-copy');
		grunt.loadNpmTasks('grunt-listfiles');
		grunt.loadNpmTasks('grunt-text-replace');

		buildify = require('buildify');
		package = grunt.file.readJSON('package.json');

		grunt.initConfig({
			pkg: package,

			// Populate manifests
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
						"temp/ls/js.txt": allResourceFiles()["js"]
					}
				},
				css: {
					files: {
						"temp/ls/css.txt": allResourceFiles()["css"]
					}
				},
				resources: {
					files: {
						"temp/ls/resources.txt": allResourceFiles()["resources"]
					}
				}
			},

			replace: {
				chrome: {
					src: "manifests/Chrome/{*.*,**/*.*}",
					dest: "temp/manifests/Chrome/",
					replacements: manifestReplacements()
				},
				operablink: {
					src: [ "manifests/OperaBlink/{*.*,**/*.*}" ],
					dest: "temp/manifests/OperaBlink/",
					replacements: manifestReplacements()
				},
				safari: {
					src: [ "manifests/RES.safariextension/{*.*,**/*.*}" ],
					dest: "temp/manifests/RES.safariextension/",
					replacements:  manifestReplacements(formatFileListingsForSafari())
				},
				firefox: {
					src: [ "manifests/XPI/*.*" ],
					dest: "temp/manifests/XPI/",
					replacements: manifestReplacements()
				},
				firefox2: {
					src: [ "manifests/XPI/lib/*.*" ],
					dest: "temp/manifests/XPI/lib/",
					replacements: manifestReplacements()
				}
			},


			// Move CSS & JS
			copy: {
				chrome: {
					files: [
						{ expand: true, cwd: 'Chrome/', src: ['**'], dest: 'temp/ext/Chrome/'},
						{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/Chrome/'},
						{ expand: true, cwd: 'temp/manifests/Chrome/', src: ['**'], dest: 'temp/ext/Chrome/'},
						{ expand: true, cwd: 'temp/manifests/Chrome/', src: ['**'], dest: 'Chrome'}
					]
				},
				operablink: {
					files: [
						{ expand: true, cwd: 'OperaBlink/', src: ['**'], dest: 'temp/ext/OperaBlink/'},
						{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/OperaBlink/'},
						{ expand: true, cwd: 'temp/manifests/OperaBlink/', src: ['**'], dest: 'temp/ext/OperaBlink/'},
						{ expand: true, cwd: 'temp/manifests/OperaBlink/', src: ['**'], dest: 'OperaBlink/'}
					]
				},
				safari: {
					files: [
						{ expand: true, cwd: 'RES.safariextension/', src: ['**'], dest: 'temp/ext/RES.safariextension/'},
						{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/RES.safariextension/'},
						{ expand: true, cwd: 'temp/manifests/RES.safariextension/', src: ['**'], dest: 'temp/ext/RES.safariextension/'},
						{ expand: true, cwd: 'temp/manifests/RES.safariextension/', src: ['**'], dest: 'RES.safariextension/'}
					]
				},
				firefox: {
					files: [
						{ expand: true, cwd: 'XPI/', src: ['**'], dest: 'temp/ext/XPI/'},
						{ expand: true, cwd: 'lib/', src: ['**'], dest: 'temp/ext/XPI/data/'},
						{ expand: true, cwd: 'temp/manifests/XPI/', src: ['**'], dest: 'temp/ext/XPI/'},
						{ expand: true, cwd: 'temp/manifests/XPI/', src: ['**'], dest: 'XPI/'},
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


		// Build all with "grunt"
		grunt.registerTask('default', [ 'manifests', 'copy']);

		// Setup for devlopment with "grunt chrome" or "grunt firefox" (enables watch task)
		grunt.registerTask('chrome', ['copy:chrome', 'watch:chrome']);
		grunt.registerTask('operablink', ['copy:operablink', 'watch:operablink']);
		grunt.registerTask('safari', ['copy:safari', 'watch:safari']);
		grunt.registerTask('firefox', ['copy:firefox', 'watch:firefox']);

		// Generate manifests

		grunt.registerTask('manifests', ['listfiles', 'replace'])
	}


	var _allResourceFiles;
	function allResourceFiles() {
		if (!_allResourceFiles) {
			_allResourceFiles = {};
			_allResourceFiles["js"] = resourceFiles("js");
			_allResourceFiles["css"] = resourceFiles("css");
			_allResourceFiles["resources"] = resourceFiles("resources", "{html,png,map}");
		}

		return _allResourceFiles;
	}

	function resourceFiles(group, extension) {
		extension = extension || group;
		var libdirs = ["vendors/base", "vendors", "core", "app", "", "modules"];
		var allpaths = [];
		libdirs.forEach(function(dir) {
			var paths = [];
			if (package.files[group] && package.files[group][dir]) {
				package.files[group][dir].forEach(function(filename) {
					var path = "lib/" + ( dir ? dir + "/" : "") + filename;
					paths.push(path);
				});
			}

			var wildcards = "lib/" + (dir ? dir + "/{,*/,**/}" : "") + "*." + extension;
			paths.push(wildcards);

			allpaths = allpaths.concat(paths);
		});

		return allpaths;
	}

	function manifestReplacements(formatOptions) {
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

	function formatFileListingsForSafari() { return {
		prefix: '\t\t\t\t<string>',
		prefixFirstLine: '<string>',
		postfix: '</string>',
		postfixLastLine: '</string>',
	} };




})();
