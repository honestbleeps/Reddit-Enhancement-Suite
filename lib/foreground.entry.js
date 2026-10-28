/* @flow */

import { RES_DISABLED_HASH } from './constants/urlHashes';
import { init } from './core/init';

const blockers = [];

if (location.hash === RES_DISABLED_HASH) {
	blockers.push(`Hash ${RES_DISABLED_HASH} disables RES.`);
} else {
	window.addEventListener('hashchange', () => { if (location.hash === RES_DISABLED_HASH) location.reload(); });
}

// Firefox reloads the extension on all active pages when upgrading
// RES doesn't handle that well
if (document.documentElement && document.documentElement.classList.contains('res')) {
	document.documentElement.setAttribute('res-warning', 'This page must be reloaded for Reddit Enhancement Suite to function correctly');
	blockers.push('RES is previously loaded on this page.');
}

if (window !== window.parent && (new URL(location.href)).searchParams.get('embedded') !== 'true') {
	blockers.push('Conditions for running on an embedded page are not met.');
}

if (blockers.length) {
	console.warn('Preventing initalization of RES:', blockers);
} else {
	init();
}
