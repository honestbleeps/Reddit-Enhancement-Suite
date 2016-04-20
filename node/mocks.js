import { nativeRequire } from '../lib/environment/_nativeRequire';

const jsdom = nativeRequire('jsdom');

global.document = jsdom.jsdom(undefined, { url: 'https://www.reddit.com/' });
global.window = document.defaultView;
global.location = window.location;
global.navigator = window.navigator;
global.DOMParser = window.DOMParser;

global.sessionStorage = {
	getItem() {}
};
