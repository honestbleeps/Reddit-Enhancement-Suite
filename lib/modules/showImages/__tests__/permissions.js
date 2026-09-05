/* @flow */

import test from 'ava';

import { hasOptionalPermissions } from '../permissions.js';

test('hasOptionalPermissions only returns true for non-empty permission arrays', t => {
	t.false(hasOptionalPermissions());
	t.false(hasOptionalPermissions(null));
	t.false(hasOptionalPermissions([]));
	t.true(hasOptionalPermissions(['https://example.com/*']));
});
