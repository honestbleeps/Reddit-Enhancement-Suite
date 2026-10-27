/* @flow */
/* eslint-disable import/no-nodejs-modules */

import { fileURLToPath } from 'node:url';
import test from 'ava';

import { loadModule } from './helpers/loadModule.js';

test('module loader converts encoded file URLs to native paths', async t => {
	const entry = new URL('./mock%20entry.js', import.meta.url);
	const result = await loadModule(entry, {
		[fileURLToPath(entry)]: 'export const value = 42;',
	}, {});

	t.is(result.value, 42);
});
