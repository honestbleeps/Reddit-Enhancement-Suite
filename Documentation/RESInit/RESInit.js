function RESInit() {
	if (typeof(self.on) == 'function') {
		// firefox addon sdk... we've included jQuery... 
		// also, for efficiency, we're going to try using unsafeWindow for "less secure" (but we're not going 2 ways here, so that's OK) but faster DOM node access...
		// console.log('faster?');
		document = unsafeWindow.document;
		window = unsafeWindow;
		if (typeof($) != 'function') {
			console.log('Uh oh, something has gone wrong loading jQuery...');
		}
	} else if ((typeof(unsafeWindow) != 'undefined') && (unsafeWindow.jQuery)) {
		// greasemonkey -- should load jquery automatically because of @require line
		// in this file's header
		if (typeof($) == 'undefined') {
			// greasemonkey-like userscript
			$ = unsafeWindow.jQuery;
			jQuery = $;
		}
	} else if (typeof(window.jQuery) == 'function') {
		// opera...
		$ = window.jQuery;
		jQuery = $;
	} else {
		// chrome and safari...
		if (typeof($) != 'function') {
			console.log('Uh oh, something has gone wrong loading jQuery...');
		}
	}
