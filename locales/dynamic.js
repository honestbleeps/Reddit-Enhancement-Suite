/* @flow */

/**
 * Emit the localization files as separate .json files.
 * Requires environment support for dynamically loading files.
 */

import { getValidLocalePaths, makeLookupFunction } from './helpers';
import type { GetMessageFn } from './helpers';

const localesContext = require.context('file?name=[name].[ext]!./locales', false, /\.json$/);

export async function makeGetMessage(localeName: string, loadFile: (path: string) => Promise<{ [key: string]: any }>): Promise<GetMessageFn> {
	const locales = await Promise.all(
		getValidLocalePaths(localeName, localesContext)
			.map(path => loadFile(path))
	);

	return makeLookupFunction(locales);
}
