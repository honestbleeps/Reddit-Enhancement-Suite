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

export const getLocaleDictionary = _.memoize((localeName: string): { [key: string]: string } => {
	const transifexLocale = redditLocaleToTransifexLocale(localeName);

	const mergedLocales = {
		// 3. Default (en)
		...getLocale(DEFAULT_TRANSIFEX_LOCALE),
		// 2. Match without region (en_CA -> en)
		...getLocale(transifexLocale.slice(0, transifexLocale.indexOf('_'))),
		// 1. Exact match (en_CA -> en_CA)
		...getLocale(transifexLocale),
	};

	return _.mapValues(mergedLocales, x => x.message);
});
