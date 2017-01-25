/* @flow */

type I18nMessageDictionary = { [key: string]: { message: string } };
export type GetMessageFn = (messageName: string, substitutions: Array<string | number>) => string;

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

export function getValidLocalePaths(localeName: string, localesContext: { keys(): string[] }): string[] {
	const transifexLocale = redditLocaleToTransifexLocale(localeName);
	const validLocaleKeys = localesContext.keys();

	return [
		// 1. Exact match (en_CA -> en_CA)
		transifexLocale,
		// 2. Match without region (en_CA -> en)
		transifexLocale.slice(0, transifexLocale.indexOf('_')),
		// 3. Default (en)
		DEFAULT_TRANSIFEX_LOCALE,
	]
		.map(localeNameToPath)
		.filter(path => validLocaleKeys.includes(path));
}

function lookupMessage(locales, messageName) {
	for (let i = 0; i < locales.length; ++i) { // eslint-disable-line no-restricted-syntax
		const entry = locales[i][messageName];
		if (entry) {
			return entry.message;
		}
	}
}

export function makeLookupFunction(locales: Array<I18nMessageDictionary>): GetMessageFn {
	// Behaves like https://developer.chrome.com/extensions/i18n#method-getMessage
	return (messageName, substitutions) => {
		// Transifex will fill in missing translations from partially-translated languages
		// with strings from the base locale (en).
		const message = lookupMessage(locales, messageName) || '';

		// Replace direct references to substitutions, e.g. `First substitution: $1`
		// Maximum of 9 substitutions allowed, i.e. only one number after the `$`
		return message.replace(/\$(\d)\b(?!\$)/g, (match, number) => substitutions[number - 1]);

		// Chrome also supports named placeholders, e.g. `Error: $error_message$`
		// but Transifex does not create the `placeholders` field in exported JSON
		// https://developer.chrome.com/extensions/i18n#examples-getMessage
	};
}
