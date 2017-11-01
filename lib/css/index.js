/* @flow */

import { getExtensionUrl } from '../environment/getUrl';

import cssPath from './res.scss';

export function injectCss() {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = getExtensionUrl(cssPath);
	(document.head || document.documentElement).prepend(link);
}
