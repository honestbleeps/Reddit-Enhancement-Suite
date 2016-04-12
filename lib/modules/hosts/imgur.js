import { $ } from '../../vendor';
import { ajax } from '../../environment';
import { string } from '../../utils';

addLibrary('mediaHosts', 'imgur', {
	domains: ['imgur.com'],
	logo: '//i.imgur.com/favicon.ico',
	options: {
		'prefer RES albums': {
			description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
			value: true,
			type: 'boolean'
		},
		preferredImgurLink: {
			description: 'Which view to request when following a link to imgur.',
			type: 'enum',
			value: 'share',
			values: [{
				name: 'full page (imgur.com)',
				value: 'share'
			}, {
				name: 'direct image (i.imgur.com)',
				value: 'direct'
			}]
		}
	},
	baseURL: 'http://imgur.com/',
	cdnURL: '//i.imgur.com/',
	apiPrefix: 'https://api.imgur.com/3/',
	apiID: '1d8d9b36339e0e2',

	// hashRe: /^https?:\/\/(?:i\.|edge\.|www\.)*imgur\.com\/(?:r\/[\w]+\/)?([\w]{5,}(?:[&,][\w]{5,})?)(\..+)?(?:#(\d*))?$/i,
	// the modified regex below fixes detection of "edited" imgur images, but imgur's edited images are broken right now actually, falling into
	// a redirect loop. preserving the old one just in case. however it also fixes detection of the extension (.jpg, for example) which
	// was too greedy a search...
	// the hashRe below was provided directly by MrGrim (well, everything after the domain was), using that now.
	// in addition to the above, the album index was moved out of the first capture group.
	hashRe: /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/\w+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)((?:\w{5}|\w{7})(?:[&,](?:\w{5}|\w{7}))*)(?:#\d+)?[a-z]?(\.(?:jpe?g|gif|png|gifv))?(\?.*)?$/i,
	hostedHashRe: /^https?:(\/\/i\.\w+\.*imgur\.com\/)((?:\w{5}|\w{7})(?:[&,](?:\w{5}|\w{7}))*)(?:#\d+)?[a-z]?(\.(?:jpe?g|gif|png))?(\?.*)?$/i,
	galleryHashRe: /^https?:\/\/(?:m\.|www\.)?imgur\.com\/gallery\/(\w+)(?:[/#]|$)/i,
	albumHashRe: /^https?:\/\/(?:m\.|www\.)?imgur\.com\/a\/(\w+)(?:[/#]|$)/i,
	detect: (href, elem) => (
		elem.pathname !== '/rules' &&
		elem.pathname !== '/inbox'
	),
	async _api(endpoint) {
		const { data } = await ajax({
			url: this.apiPrefix + endpoint,
			type: 'json',
			headers: {
				Authorization: `Client-ID ${this.apiID}`
			}
		});

		if (data.error) {
			throw new Error(`Imgur API error: ${data.error}`);
		}

		return data;
	},

	async handleLink(elem) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		const href = elem.href.split('?')[0];
		let groups, hash, getInfo;

		if ((groups = siteMod.galleryHashRe.exec(href))) {
			hash = groups[1];
			getInfo = siteMod._api(string.encode`gallery/${hash}`);
		} else if ((groups = siteMod.albumHashRe.exec(href))) {
			if (modules['showImages'].options['prefer RES albums'].value === true) {
				hash = groups[1];
				elem.imgHash = hash;
				getInfo = siteMod._api(string.encode`album/${hash}`);
			}
		} else if ((groups = siteMod.hostedHashRe.exec(href))) {
			hash = groups[2];
			getInfo = siteMod._handleImage(hash, href);
		} else if ((groups = siteMod.hashRe.exec(href))) {
			hash = groups[1];
			if (hash.search(/[&,]/) > -1) {
				// handle separated list of IDs
				getInfo = siteMod._handleImageCollection(hash.split(/[&,]/), href);
			} else {
				getInfo = siteMod._handleImage(hash, href);
			}
		}

		if (!getInfo) {
			throw new Error('image not resolved');
		}

		const info = await getInfo;

		let getExpandoInfo;

		if (info.images && info.images.length) {
			getExpandoInfo = siteMod._handleAlbum(elem, info);
		} else if (info.gifv) {
			getExpandoInfo = siteMod._handleGifv(elem, info);
		} else if (info.link) {
			getExpandoInfo = siteMod._handleSingleImage(elem, info);
		}

		if (!getExpandoInfo) {
			throw new Error('error handling expando');
		}

		$.extend(true, elem, await getExpandoInfo);
	},

	_deferredImages: new Map(),
	_handleImage(hash, url) {
		const siteMod = modules['showImages'].siteModules['imgur'];

		if (!siteMod._deferredImages.has(hash)) {
			siteMod._deferredImages.set(hash, siteMod._batchHandleImage({ url, hash }));
		}

		return siteMod._deferredImages.get(hash);
	},
	_batchHandleImage: RESUtils.batch(queue => {
		const siteMod = modules['showImages'].siteModules['imgur'];

		return queue.map(({ url, hash }) => {
			let extension;
			extension = (extension = siteMod.hashRe.exec(url)) && extension[2];

			if (['.gif', '.gifv', '.png'].indexOf(extension)) {
				// Extension is given and hopefully correct, so we can intuit the mimetype
				// removed caption API calls as they don't seem to exist/matter for single images, only albums...
				// If we don't show captions and know the mimetype, then we can skip the API call.
				return siteMod._hashMockAPI(hash, url);
			} else if (siteMod.hostedHashRe.test(url)) {
				return siteMod._hashMockAPI(hash, url);
			} else {
				// Check if image is gifv
				return siteMod._api(`image/${hash}`);
			}
		});
	}),

	_hashMockAPI(hash, url) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		let cdnURL = siteMod.cdnURL;
		let matches, extension;

		if ((matches = siteMod.hostedHashRe.exec(url))) {
			cdnURL = matches[1];
			extension = matches[3];
		} else if ((matches = siteMod.hashRe.exec(url))) {
			extension = matches[2];
		}

		if (!extension) {
			// Imgur doesn't really care about the extension except video and the browsers don't seem to either.
			extension = '.jpg';
		}

		const mimeType = (extension === '.jpg') ? 'image/jpeg' : `image/${extension.substr(1)}`;

		if (extension === '.gifv' || extension === '.gif') {
			return Promise.resolve({
				id: hash,
				looping: true,
				animated: true,
				ext: extension,
				type: 'image/gif',
				gifv: `${cdnURL}${hash}.gifv`,
				webm: `${cdnURL}${hash}.webm`,
				mp4: `${cdnURL}${hash}.mp4`,
				link: `${cdnURL}${hash}.gifv`,
				download: `${cdnURL}download/${hash}`
			});
		} else {
			return Promise.resolve({
				id: hash,
				animated: false,
				looping: false,
				ext: extension,
				link: `${cdnURL}${hash}${extension}`,
				type: mimeType
			});
		}
	},

	async _handleImageCollection(hashes, url) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		return {
			is_album: true,
			images: await Promise.all(hashes.map(hash => siteMod._hashMockAPI(hash, url)))
		};
	},
	_handleSingleImage(elem, info) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		const baseURL = siteMod.baseURL;
		return Promise.resolve({
			src: info.link.replace('http:', 'https:'),
			href: modules['showImages'].options['preferredImgurLink'].value === 'share' ? `${baseURL}${info.id}` : `${info.link}`,
			type: 'IMAGE',
			caption: info.description,
			title: info.title
		});
	},
	async _handleAlbum(elem, info) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		const base = elem.href.split('#')[0];

		const expandoInfo = {
			type: 'GALLERY',
			imageTitle: info.title,
			caption: info.description
		};

		expandoInfo.src = await Promise.all(info.images.map(async info => {
			const expandoInfo = await siteMod._handleSingleImage(elem, info);
			expandoInfo.href = modules['showImages'].options['preferredImgurLink'].value === 'share' ? `${base}#${info.id}` : `${info.link}`;
			return expandoInfo;
		}));

		if (info.hash) {
			const hash = info.hash.slice(1);
			let galleryStart = parseInt(hash, 10);
			if (isNaN(galleryStart)) {
				galleryStart = info.images.findIndex((image, i) => hash === info.images[i].image.hash);

				if (galleryStart === -1) {
					galleryStart = 0;
				}
			}
			expandoInfo.galleryStart = galleryStart;
		}

		return expandoInfo;
	},
	_handleGifv(elem, info) {
		const siteMod = modules['showImages'].siteModules['imgur'];
		const baseURL = siteMod.baseURL;
		const expandoInfo = {};

		expandoInfo.type = 'VIDEO';
		expandoInfo.expandoOptions = {
			autoplay: true, // imgurgifv will always be muted, so autoplay is OK
			controls: false,
			href: modules['showImages'].options['preferredImgurLink'].value === 'share' ? `${baseURL}${info.id}` : `${info.link}`,
			downloadurl: info.download,
			fallback: info.link,
			loop: true,
			muted: true,
			sources: [{
				source: info.webm,
				type: 'video/webm'
			}, {
				source: info.mp4,
				type: 'video/mp4'
			}]
		};

		return Promise.resolve(expandoInfo);
	}
});
