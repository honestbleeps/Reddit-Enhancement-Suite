const localesContext = require.context('json!./locales', false, /\.json$/);

export DEFAULT_LOCALE from 'json!./locales/en.json';

function localeNameFromPath(path) {
	return (/\/(\w+)\.json/).exec(path)[1];
}

export const locales = localesContext.keys().reduce((obj, key) => {
	obj[localeNameFromPath(key)] = localesContext(key);
	return obj;
}, {});
