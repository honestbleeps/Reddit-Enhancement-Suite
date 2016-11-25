import _ from 'lodash';

const localesContext = require.context('./locales', false, /\.json$/);
const validLocaleKeys = localesContext.keys();

const DEFAULT_TRANSIFEX_LOCALE = 'en';

function localeNameToPath(localeName) {
	return `./${localeName}.json`;
}

// `en-ca` -> `en_CA`
function redditLocaleToTransifexLocale(redditLocale) {
	switch (redditLocale) {
		case 'leet':
			return DEFAULT_TRANSIFEX_LOCALE; // doesn't appear to exist
		case 'lol':
			return 'en@lolcat';
		case 'pir':
			return 'en@pirate';
		default: {
			// `es-ar` -> `es_ar`
			const normalized = redditLocale.replace('-', '_');
			const inx = normalized.indexOf('_');
			if (inx === -1) {
				// `zh` -> `zh`
				return normalized;
			} else {
				// `en_au` -> `en_AU`
				return `${normalized.slice(0, inx)}_${normalized.slice(inx + 1).toUpperCase()}`;
			}
		}
	}
}

const getLocale = _.memoize(localeName => {
	const path = localeNameToPath(localeName);
	if (validLocaleKeys.includes(path)) {
		return localesContext(path);
	}
});

const getLookupFunction = _.memoize(localeName => {
	const transifexLocale = redditLocaleToTransifexLocale(localeName);
	const locales = _.compact([
		// 1. Exact match (en_CA -> en_CA)
		getLocale(transifexLocale),
		// 2. Match without region (en_CA -> en)
		getLocale(transifexLocale.slice(0, transifexLocale.indexOf('_'))),
		// 3. Default (en)
		getLocale(DEFAULT_TRANSIFEX_LOCALE),
	]);

	return messageName => {
		for (let i = 0; i < locales.length; ++i) { // eslint-disable-line no-restricted-syntax
			const entry = locales[i][messageName];
			if (entry) {
				return entry.message;
			}
		}
	};
});

// Behaves like https://developer.chrome.com/extensions/i18n#method-getMessage
// if it accepted a locale name
export function getMessage(localeName: string, messageName: string, substitutions: Array<string | number>): string {
	// Transifex will fill in missing translations from partially-translated languages
	// with strings from the base locale (en).
	// So we don't need to do multiple checks here.
	const message = getLookupFunction(localeName)(messageName) || '';

	// Replace direct references to substitutions, e.g. `First substitution: $1`
	// Maximum of 9 substitutions allowed, i.e. only one number after the `$`
	return message.replace(/\$(\d)\b(?!\$)/g, (match, number) => substitutions[number - 1]);

	// Chrome also supports named placeholders, e.g. `Error: $error_message$`
	// but Transifex does not create the `placeholders` field in exported JSON
	// https://developer.chrome.com/extensions/i18n#examples-getMessage
}
