/* @flow */

import _ from 'lodash';
import locales from './locales';

// `en-ca` -> `en_CA`
function redditLocaleToTransifexLocale(redditLocale) {
	switch(redditLocale) {
		case 'leet':
			return 'en'; // doesn't appear to exist
		case 'lol':
			return 'en_lolcat';
		case 'pir':
			return 'en_pirate';
		case 'es-ar': // argentina
		case 'es-cl': // chile
			return 'es_419'; // latin america
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

export function getLocaleDictionary(localeName: string): { [string]: string } {
	const transifexLocale = redditLocaleToTransifexLocale(localeName);

	const mergedLocales = {
		// 3. Default (en)
		...locales.en,
		// 2. Match without region (en_CA -> en)
		...locales[transifexLocale.slice(0, transifexLocale.indexOf('_'))],
		// 1. Exact match (en_CA -> en_CA)
		...locales[transifexLocale],
	};

	return _.mapValues(mergedLocales, x => x.message);
}
