/* global safari */

import 'babel-polyfill';
import { init } from './core';

if (process.env.BUILD_TARGET === 'safari') {
	// Safari has a ridiculous bug that causes it to lose access to safari.self.tab if you click the back button.
	// this stupid one liner fixes that.
	window.onunload = () => {};

	// since safari's built in extension stylesheets are treated as user stylesheets,
	// we can't inject them that way.  That makes them "user stylesheets" which would make
	// them require !important everywhere - we don't want that, so we'll inject this way instead.

	const cssFiles = ['css/res.css', 'vendor/guiders.css', 'vendor/tokenize.css'];

	init.headReady.then(() => {
		cssFiles.forEach(filename => {
			const linkTag = document.createElement('link');
			linkTag.rel = 'stylesheet';
			linkTag.href = safari.extension.baseURI + filename;
			document.head.appendChild(linkTag);
		});
	});
}

init.init();
