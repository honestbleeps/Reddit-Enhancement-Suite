/*
	If you would like RES to embed content from your website:

		0. Fork http://github.com/honestbleeps/Reddit-Enhancement-Suite
		1. Copy this file and create a new file: lib/modules/hosts/yourwebite.js.
		2. Edit yourwebsite.js to change the "example" code and unstub the functions.
		3. Submit a pull request with your change.

	Note: Media hosting sites must support CORS in order for expandos to work.
	This policy serves to protect users by limiting RES' access to certain websites.
*/

export default {
	moduleID: 'example',
	name: 'Example Media Host',

	// Root domain only, subdomains are ignored
	domains: ['example.com', 'example.org'],

	// Optional logo, for showing site attribution on the content
	logo: '//example.com/favicon.ico',

	// Executed if the domain matches.
	// Returns truthy/falsy to indicate whether the siteModule will attempt to handle the link.
	// Called with a single parameter: the anchor element.
	detect: ({ pathname }) => (/^\/(\d+)/i).exec(pathname),

	// Called with the link's href and the value returned from detect() (if it's truthy).
	// May throw an error if the link cannot be handled.
	// May be async if necessary.
	async handleLink(href, [, id]) {
		const { title, url } = await ajax({ // eslint-disable-line no-undef
			url: `https://example.com/api/${id}.json`,
			type: 'json',
		});

		return {
			type: 'IMAGE',
			src: url,
			title,
		};

		/*
		Embedding infomation:

		required type:
			'IMAGE' for single images | 'GALLERY' for image galleries | 'TEXT' html/text to be displayed
		required src:
			if type is TEXT then src is HTML (be careful about what is accepted here)
			if type is IMAGE then src is an image URL string
			if type is GALLERY then src is an array of objects with any type other than GALLERY
		optional title:
			string to be displayed above the image (gallery level).
		optional caption:
			string to be displayed below the title
		optional credits:
			string to be displayed below caption
		optional galleryStart:
			zero-indexed page number to open the gallery to
		*/
	},
};
