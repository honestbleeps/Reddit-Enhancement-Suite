const fs = require('fs');
const path = require('path');
const _ = require('lodash');

export default function transformer(file, api) {
	const j = api.jscodeshift;

	const basePath = j(file.source);

	const modName = basePath
		.find(j.NewExpression, { callee: { name: 'Module' } })
		.get().node.arguments[0].value;

	const newI18nKeys = {};

	const modOptionsPath = basePath
		.find(j.AssignmentExpression, {
			left: {
				type: 'MemberExpression',
				object: { name: 'module' },
				property: { name: 'options' },
			},
		})
		.at(0);


	function upCase(str) {
		return str.slice(0, 1).toUpperCase() + str.slice(1);
	}

	modOptionsPath
		.find(j.Property, { value: { properties: [] } })
		.filter(path => path.parentPath.parentPath.parentPath.node === modOptionsPath.get().node)
		.forEach(optionPath => {
			const optName = optionPath.node.key.name;

			const titleKey = `${modName}${upCase(optName)}Title`;
			newI18nKeys[titleKey] = _.startCase(optName);
			optionPath.node.value.properties.unshift(j.property('init', j.identifier('title'), j.literal(titleKey)));

			j(optionPath)
				.find(j.Property, { kind: 'init', key: { name: 'description' } })
				.filter(path => path.parentPath.parentPath.parentPath.node === optionPath.node)
				.replaceWith(descPath => {
					const descKey = `${modName}${upCase(optName)}Desc`;
					newI18nKeys[descKey] = descPath.node.value.type === 'TemplateLiteral' ?
						descPath.node.value.quasis[0].value.raw.trim() :
						descPath.node.value.value;
					return j.property('init', j.identifier('description'), j.literal(descKey));
				});
		});

	const enJsonLocation = path.join(__dirname, '../locales/locales/en.json');
	const enJson = fs.readFileSync(enJsonLocation, { encoding: 'utf8' });
	const enJsonObj = JSON.parse(enJson);
	Object.assign(enJsonObj, newI18nKeys);
	const newEnJson = JSON.stringify(enJsonObj, null, '\t');
	fs.writeFileSync(enJsonLocation, newEnJson);

	return basePath.toSource();
}
