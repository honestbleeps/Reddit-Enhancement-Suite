(function() {
	window.RESTemplates = {
		load: function(name, callback) {
			if (name && callback) {
				loadFile(name).done(function() {
					var templateInterface = getTemplateInterface(name);
					callback(templateInterface);
				});
			}
		},
		getSync: function(name) {
			return getTemplateInterface(name);
		}
	}

	var loadTemplatesDeferred = {};
	function loadFile(name) {
		if (!loadTemplatesDeferred[name]) {

			var deferred = $.Deferred();
			RESLoadResourceAsText("templates/" + name + ".html", function(source) {
				templateElements[name] = source;
				deferred.resolve();
			});

			loadTemplatesDeferred[name] = deferred;
		}

		return loadTemplatesDeferred[name] ;
	}


	var templateElements = {};
	var templateInterfaces = {};
	function getTemplateInterface(name) {
		if (templateInterfaces[name] === void 0) {
			var compiled = compileTemplate(name);
			if (!compiled) {
				console.warn("RES could not compile template '" + name + "'");
			} else {
				var templateInterface = createTemplateInterface(compiled);
				templateInterfaces[name] = templateInterface;
			}
		}

		return templateInterfaces[name];
	}

	function createTemplateInterface(compiled) {
		return {
			html: function(model) {
				return $(compiled.render(model));
			},
			text: function(model) {
				return compiled.render(model);
			}
		};
	}

	function compileTemplate(name) {
		// Assumes templates are loaded already

		var source = templateElements[name];
		if (!source) {
			console.warn("Could not find template", name);
		}
		var compiled = Hogan.compile(source);
		return compiled;
	}

})();
