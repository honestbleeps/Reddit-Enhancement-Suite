/* exported RESTemplates */

const RESTemplates = (() => {
	const loadTemplates = (async () => {
		const html = await RESEnvironment.loadResourceAsText('core/templates.html');
		return RESEnvironment.parseHtmlAsDocument(html);
	})();

	const templateInterfaces = new Map();

	function compileTemplate(name, templateElements) {
		const template = templateElements.getElementById(name);

		if (!template) {
			throw new Error(`Could not find template "${name}"`);
		}

		const compiled = Hogan.compile(template.innerHTML);

		if (!compiled) {
			throw new Error(`Could not compile template "${name}"`);
		}

		return compiled;
	}

	return {
		async load(name) {
			if (!templateInterfaces.has(name)) {
				const compiled = compileTemplate(name, await loadTemplates);

				templateInterfaces.set(name, {
					html: model => $(compiled.render(model)),
					text: model => compiled.render(model)
				});
			}

			return templateInterfaces.get(name);
		}
	};
})();

if (typeof exports === 'object') {
	exports.RESTemplates = RESTemplates;
}
