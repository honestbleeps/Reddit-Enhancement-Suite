/* @noflow */

/* eslint-disable import/no-nodejs-modules */

import fs from 'fs';
import path from 'path'; // eslint-disable-line import/no-extraneous-dependencies
import { parse } from 'hermes-parser';
import _ from 'lodash';

// recast cannot print newer Flow syntax (`as` casts, `keyof`, ...); hermes-parser's Babel mode lowers it to an AST recast understands.
export const parser = {
	parse: source => parse(source, { babel: true, sourceType: 'module', tokens: true }),
};


export default function i18nTransformer(file, api) {
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
		.find(j.ObjectProperty, { value: { properties: [] } })
		.filter(path => path.parentPath.parentPath.parentPath.node === modOptionsPath.get().node)
		.forEach(optionPath => {
			const optName = optionPath.node.key.name;

			const titleKey = `${modName}${upCase(optName)}Title`;
			newI18nKeys[titleKey] = _.startCase(optName);
			optionPath.node.value.properties.unshift(j.objectProperty(j.identifier('title'), j.stringLiteral(titleKey)));

			j(optionPath)
				.find(j.ObjectProperty, { key: { name: 'description' } })
				.filter(path => path.parentPath.parentPath.parentPath.node === optionPath.node)
				.replaceWith(descPath => {
					const descKey = `${modName}${upCase(optName)}Desc`;
					newI18nKeys[descKey] = descPath.node.value.type === 'TemplateLiteral' ?
						descPath.node.value.quasis[0].value.raw.trim() :
						descPath.node.value.value;
					return j.objectProperty(j.identifier('description'), j.stringLiteral(descKey));
				});
		});

	const enJsonLocation = path.join(__dirname, '../locales/locales/en.json');

	const enJson = fs.readFileSync(enJsonLocation, { encoding: 'utf8' });

	const enJsonObj = JSON.parse(enJson);
	Object.assign(enJsonObj, _.mapValues(newI18nKeys, message => ({ message })));
	const newEnJson = JSON.stringify(enJsonObj, null, '\t');

	fs.writeFileSync(enJsonLocation, newEnJson);

	return basePath.toSource({
		tabWidth: 4,
		quote: 'single',
		trailingComma: true,
	});
}
