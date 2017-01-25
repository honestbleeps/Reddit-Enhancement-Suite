/* @flow */

/**
 * Embed the localization files in the .js bundle.
 * Inflates bundle size significantly, but does not require anything of the environment
 * and is available synchronously.
 */

import { getValidLocalePaths, makeLookupFunction } from './helpers';
import type { GetMessageFn } from './helpers';

const localesContext = require.context('json!./locales', false, /\.json$/);

export function makeGetMessage(localeName: string): GetMessageFn {
	const locales = getValidLocalePaths(localeName, localesContext)
		.map(path => localesContext(path));

	return makeLookupFunction(locales);
}
