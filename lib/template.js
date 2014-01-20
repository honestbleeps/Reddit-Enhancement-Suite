
RESLoadResourceAsText("templates.html", function(html) {
	var templates = $(html);
	window.RESTemplates = {
		load: function(name) {
			if (typeof RESTemplates['name'] !== 'undefined') {
				return RESTemplates['name'];
			}
			var template = templates.filter(function() { 
				if (!this.getAttribute) return;
				return this.getAttribute('id')  === name; 
			});
			if (!template.length) {
				console.warn("Could not find template", name);
			}
			var templateSource = template[0].innerHTML;
			var compiled = Hogan.compile(templateSource);

			return window.RESTemplates[name] = {
				html: function(model) {
					return $(compiled.render(model));
				},
				text: function(model) {
					return compiled.render(model);
				}
			};
		}
	};
});
