/* @flow */

// include the LICENSE file
// $FlowIgnore
import 'file-loader?name=LICENSE!../LICENSE';

// load environment listeners
import 'sibling-loader!./environment/foreground/messaging';

import { RES_DISABLED_HASH, RES_SETTINGS_HASH, RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH } from './constants/urlHashes';
import { init, contentStart } from './core/init';
import * as Context from './environment/foreground/context';
import { getURL } from './environment/foreground/id';

if (location.hash === RES_DISABLED_HASH) {
	throw new Error(`Hash ${RES_DISABLED_HASH} disables RES.`);
}

// Integration tests are performed quicker when redirected to the standalone options page
if (location.hash.startsWith(RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH)) {
	location.href = getURL(`options.html${location.hash.replace(RES_SETTINGS_REDIRECT_TO_STANDALONE_HASH, RES_SETTINGS_HASH)}`);
	throw new Error('Redirecting to the options page.');
}

// Firefox reloads the extension on all active pages when upgrading
// RES doesn't handle that well
if (document.documentElement && document.documentElement.classList.contains('res')) {
	document.documentElement.setAttribute('res-warning', 'This page must be reloaded for Reddit Enhancement Suite to function correctly');
	throw new Error('RES is previously loaded on this page.');
}

init();

Context.establish(contentStart);
