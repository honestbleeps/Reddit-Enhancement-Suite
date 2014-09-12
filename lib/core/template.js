var RESTemplates;
(function() {
	RESTemplates = {
		load: function(name, callback) {
			if (name && callback) {
				loadTemplatesDeferred.done(function() {
					var templateInterface = getTemplateInterface(name);
					callback(templateInterface);
				});
			}
		},
		getSync: function(name) {
			return getTemplateInterface(name);
		}
	};

	var loadTemplatesDeferred = $.Deferred();
	function loadTemplates() {
		if (typeof RESLoadResourceAsText !== 'function') {
			setTimeout(loadTemplates, 10);
		} else {
			RESLoadResourceAsText('core/templates.html', function(html) {
				templateElements = BrowserStrategy.parseHtmlAsDocument(html);
				loadTemplatesDeferred.resolve();
			});
		}
	}
	loadTemplates();

	var templateElements;
	var templateInterfaces = {};
	function getTemplateInterface(name) {
		if (templateInterfaces[name] === void 0) {
			var compiled = compileTemplate(name);
			if (!compiled) {
				console.warn('RES could not compile template "' + name + '"');
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

		var template = templateElements.querySelector('[id="' + name + '"]')
		if (!template) {
			console.warn('Could not find template', name);
		}
		var templateSource = template.innerHTML;
		var compiled = Hogan.compile(templateSource);
		return compiled;
	}

})();
