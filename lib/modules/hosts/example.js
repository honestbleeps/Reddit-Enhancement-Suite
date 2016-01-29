/*
	If you would like RES to embed content from your website:

		0. Fork http://github.com/honestbleeps/Reddit-Enhancement-Suite
		1. Copy this file and create a new file: lib/modules/hosts/yourwebite.js.
		2. Edit yourwebsite.js to change the "example" code and unstub the functions.
		3. Add your new file to the browser manifests:   (Optional, but appreciated)
			Use `gulp add-host --file yourwebsite.js` or add the the file reference manually:

			* Chrome/manifest.json
			* OperaBlink/manifest.json
			* XPI/lib/main.js
			* RES.safariextension/Info.plist
			* Opera/includes/loader.js
		4. Submit a pull request with your change.

	Note: Media hosting sites must support CORS in order for expandos to work.
	This policy serves to protect users by limiting RES' access to certain websites.
*/

addLibrary('mediaHosts', 'example', {
	domains: [ 'example.com', 'example.org' ],

	// Optional logo, for showing site attribution on the content
	logo: '//example.com/favicon.ico',

	// Optional name (if different from 'example')
	name: 'Example Media Host',

	// Returns true/false to indicate whether the siteModule will attempt to handle the link.
	// The only parameters are the actual URL and the anchor element.
	detect: function(href, elem) {
		return href.indexOf('example.com/') !== -1 || href.indexOf('example.org/') !== -1;
	},

	// This is where links are parsed, cache checks are made, and XHR is performed.
	// The only parameter is the anchor element.
	// The method is in a jQuery Deferred chain and will be followed by handleInfo.
	// A new $.Deferred object should be created and resolved/rejected as necessary and then returned.
	// If resolving, the element should be passed along with whatever data is required.
	handleLink: function(elem) {
		var def = $.Deferred();

		var info = {};
		def.resolve(elem, info);

		return def;
	},

	// This is where the embedding information is added to the link.
	// handleInfo sits in the Deferred chain after handleLink
	// and should receive both the element and a data object from handleLink.
	// The first parameter should the same anchor element passed to handleLink.
	// The second parameter should be module-specific data.
	// A new $.Deferred object should be created and resolved/rejected as necessary and then returned.
	// If resolving, the element should be passed.
	handleInfo: function(elem, info) {
		var def = $.Deferred();

		def.resolve(elem, info);

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

		return def;
	}
});
