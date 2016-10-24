import { locales, DEFAULT_LOCALE } from '../../locales/asJson';
import { locale } from '../utils/localization';

export function getMessage(messageName, substitutions) {
	const { message } = (
		locales[locale()] && locales[locale()][messageName] ||
		DEFAULT_LOCALE[messageName] ||
		{ message: '' }
	);

	// Replace direct references to substitutions, e.g. `First substitution: $1`
	// Maximum of 9 substitutions allowed, i.e. only one number after the `$`
	return message.replace(/\$(\d)\b(?!\$)/g, (match, number) => substitutions[number - 1] || '');

	// Chrome also supports named placeholders, e.g. `Error: $error_message$`
	// but Transifex does not create the `placeholders` field in exported JSON
	// https://developer.chrome.com/extensions/i18n#examples-getMessage
}
