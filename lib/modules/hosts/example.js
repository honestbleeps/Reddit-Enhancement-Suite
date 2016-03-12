/*
	If you would like RES to embed content from your website:

		0. Fork http://github.com/honestbleeps/Reddit-Enhancement-Suite
		1. Copy this file and create a new file: lib/modules/hosts/yourwebite.js.
		2. Edit yourwebsite.js to change the "example" code and unstub the functions.
		3. Add your new file to the browser manifests:   (Optional, but appreciated)
			Use `gulp add-host --file yourwebsite.js` or add the the file reference manually:

			* Chrome/manifest.json
			* XPI/lib/main.js
			* RES.safariextension/Info.plist
		4. Submit a pull request with your change.

	Note: Media hosting sites must support CORS in order for expandos to work.
	This policy serves to protect users by limiting RES' access to certain websites.
*/

/* eslint no-unused-vars: [2, { "args": "none" }] */

addLibrary('mediaHosts', 'example', {
	// Root domain only, subdomains are ignored
	domains: ['example.com', 'example.org'],

	// Optional name (if different from 'example')
	name: 'Example Media Host',

	// Executed if the domain matches.
	// Returns truthy/falsy to indicate whether the siteModule will attempt to handle the link.
	// The only parameters are the actual URL and the anchor element.
	// The returned value will be passed to handleLink, so regex doesn't need to be matched twice.
	detect(href, elem) {
		return (/example\.com\/(\d+)/i).exec(href);
	},

	// This is where XHR is performed and embedding information is added to the link.
	// The parameters are the anchor element and the value returned from detect() (if it's truthy).
	// Should throw an error if the link cannot be handled.
	// May be async if necessary.
	handleLink(elem, detectResult /* may be destructured inline, e.g. `[, id]` */) {
		/* for example:
		const { title, url } = await RESEnvironment.ajax({
			url: `https://example.com/api/${id}.json`,
			type: 'json'
		});

		elem.type = 'IMAGE';
		elem.src = url;

		... and so on
		*/

		/*
		Embedding infomation:
		All embedding information (except 'site') is to be attached to the
		html anchor in the handleInfo function.

		required type:
			'IMAGE' for single images | 'GALLERY' for image galleries | 'TEXT' html/text to be displayed
		required src:
			if type is TEXT then src is HTML (be careful about what is accepted here)
			if type is IMAGE then src is an image URL string
			if type is GALLERY then src is an array of objects with the following properties:
				required src: URL of the image
				optional href: URL of the page containing the image (per image)
				optional title: string to displayed directly above the image (per image)
				optional caption: string to be displayed directly below the image (per image)
		optional imageTitle:
			string to be displayed above the image (gallery level).
		optional caption:
			string to be displayed below the image
		optional credits:
			string to be displayed below caption
		optional galleryStart:
			zero-indexed page number to open the gallery to
		*/
	}
});
