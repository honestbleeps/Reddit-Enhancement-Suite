import { flow, memoize } from 'lodash/fp';
import * as ShowImages from '../showImages';
import { ajax } from '../../environment';
import { batch, string } from '../../utils';

const imgur = {
	moduleID: 'imgur',
	name: 'imgur',
	domains: ['imgur.com'],
	logo: '//i.imgur.com/favicon.ico',
	options: {
		'prefer RES albums': {
			description: 'Prefer RES support for imgur albums rather than reddit\'s built in support',
			value: true,
			type: 'boolean',
		},
		preferredImgurLink: {
			description: 'Which view to request when following a link to imgur.',
			type: 'enum',
			value: 'share',
			values: [{
				name: 'full page (imgur.com)',
				value: 'share',
			}, {
				name: 'direct image (i.imgur.com)',
				value: 'direct',
			}],
		},
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
	detect({ pathname, href }) {
		if (pathname === '/rules' || pathname === '/inbox') return null;

		href = href.split('?')[0];

		let groups;

		if ((groups = this.galleryHashRe.exec(href))) {
			const hash = groups[1];
			return () => this._api(string.encode`gallery/${hash}`);
		} else if ((groups = this.albumHashRe.exec(href))) {
			if (ShowImages.module.options['prefer RES albums'].value) {
				const hash = groups[1];
				return () => this._api(string.encode`album/${hash}`);
			}
		} else if ((groups = this.hostedHashRe.exec(href))) {
			const hash = groups[2];
			return () => this._handleImage(hash, href);
		} else if ((groups = this.hashRe.exec(href))) {
			const hash = groups[1];
			if (hash.search(/[&,]/) > -1) {
				// handle separated list of IDs
				return () => this._handleImageCollection(hash.split(/[&,]/), href);
			} else {
				return () => this._handleImage(hash, href);
			}
		}
	},
	async _api(endpoint) {
		const { data } = await ajax({
			url: this.apiPrefix + endpoint,
			type: 'json',
			headers: {
				Authorization: `Client-ID ${this.apiID}`,
			},
		});

		if (data.error) {
			throw new Error(`Imgur API error: ${data.error}`);
		}

		return data;
	},

	async handleLink(href, getInfo) {
		const info = await getInfo();

		if (info.images && info.images.length) {
			return this._handleAlbum(href, info);
		} else if (info.gifv) {
			return this._handleGifv(href, info);
		} else if (info.link) {
			return this._handleSingleImage(href, info);
		}

		throw new Error('could not handle info');
	},

	_handleImage: memoize(flow(
		(hash, url) => ({ hash, url }),
		batch(queue => queue.map(({ hash, url }) => {
			let extension;
			extension = (extension = imgur.hashRe.exec(url)) && extension[2];

			if (['.gif', '.gifv', '.png'].includes(extension)) {
				// Extension is given and hopefully correct, so we can intuit the mimetype
				// removed caption API calls as they don't seem to exist/matter for single images, only albums...
				// If we don't show captions and know the mimetype, then we can skip the API call.
				return imgur._hashMockAPI(hash, url);
			} else if (imgur.hostedHashRe.test(url)) {
				return imgur._hashMockAPI(hash, url);
			} else {
				// Check if image is gifv
				return imgur._api(`image/${hash}`);
			}
		}))
	)),

	_hashMockAPI(hash, url) {
		let cdnURL = this.cdnURL;
		let matches, extension;

		if ((matches = this.hostedHashRe.exec(url))) {
			cdnURL = matches[1];
			extension = matches[3];
		} else if ((matches = this.hashRe.exec(url))) {
			extension = matches[2];
		}

		if (!extension) {
			// Imgur doesn't really care about the extension except video and the browsers don't seem to either.
			extension = '.jpg';
		}

		const mimeType = (extension === '.jpg') ? 'image/jpeg' : `image/${extension.substr(1)}`;

		if (extension === '.gifv' || extension === '.gif') {
			return {
				id: hash,
				looping: true,
				animated: true,
				ext: extension,
				type: 'image/gif',
				gifv: `${cdnURL}${hash}.gifv`,
				webm: `${cdnURL}${hash}.webm`,
				mp4: `${cdnURL}${hash}.mp4`,
				link: `${cdnURL}${hash}.gifv`,
				download: `${cdnURL}download/${hash}`,
			};
		} else {
			return {
				id: hash,
				animated: false,
				looping: false,
				ext: extension,
				link: `${cdnURL}${hash}${extension}`,
				type: mimeType,
			};
		}
	},

	_handleImageCollection(hashes, url) {
		return {
			is_album: true,
			images: hashes.map(hash => this._hashMockAPI(hash, url)),
		};
	},
	_handleSingleImage(href, info) {
		return {
			src: info.link.replace('http:', 'https:'),
			href: ShowImages.module.options.preferredImgurLink.value === 'share' ? `${imgur.baseURL}${info.id}` : `${info.link}`,
			type: 'IMAGE',
			caption: info.description,
			title: info.title,
		};
	},
	_handleAlbum(href, info) {
		const expandoInfo = {
			type: 'GALLERY',
			title: info.title,
			caption: info.description,
		};

		expandoInfo.src = info.images.map(info => {
			const expandoInfo = imgur._handleSingleImage(href, info);
			expandoInfo.href = ShowImages.module.options.preferredImgurLink.value === 'share' ? `${href.split('#')[0]}#${info.id}` : `${info.link}`;
			return expandoInfo;
		});

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
	_handleGifv(href, info) {
		return {
			type: 'VIDEO',
			controls: false,
			href: ShowImages.module.options.preferredImgurLink.value === 'share' ? `${imgur.baseURL}${info.id}` : `${info.link}`,
			downloadurl: info.download,
			fallback: info.link,
			loop: true,
			muted: true,
			sources: [{
				source: info.webm,
				type: 'video/webm',
			}, {
				source: info.mp4,
				type: 'video/mp4',
			}],
		};
	},
};

export default imgur;
