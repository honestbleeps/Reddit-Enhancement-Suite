/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { string } from '../../utils';

export default new Host('imgur', {
	name: 'imgur',
	domains: ['imgur.com'],
	logo: 'https://i.imgur.com/favicon.ico',
	options: {
		'prefer RES albums': {
			title: 'imgurPreferResAlbumsTitle',
			description: 'imgurPreferResAlbumsDesc',
			value: true,
			type: 'boolean',
		},
		preferredImgurLink: {
			title: 'imgurPreferredImgurLinkTitle',
			description: 'imgurPreferredImgurLinkDesc',
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
		imgurImageResolution: {
			title: 'imgurImageResolutionTitle',
			description: 'imgurImageResolutionDesc',
			type: 'enum',
			value: '', // image id suffix
			values: [{
				name: 'Full Resolution',
				value: '',
			}, {
				name: 'Retina (1360px)',
				value: 'r',
			}, {
				name: 'Huge (1024px)',
				value: 'h',
			}, {
				name: 'Giant (680px)',
				value: 'g',
			}, {
				name: 'Large (640px)',
				value: 'l',
			}],
		},
	},
	detect({ pathname, href }) {
		const cdnUrl = 'https://i.imgur.com/';
		const apiPrefix = 'https://api.imgur.com/3/';
		const apiId = '1d8d9b36339e0e2';
		const hashRe = /^https?:\/\/(?:i\.|m\.|edge\.|www\.)*imgur\.com\/(?:r\/\w+\/)*(?!gallery)(?!removalrequest)(?!random)(?!memegen)((?:\w{5}|\w{7})(?:[&,](?:\w{5}|\w{7}))*)(?:#\d+)?[a-z]?(\.(?:jpe?g|gifv?|png))?(\?.*)?$/i;
		const hostedHashRe = /^https?:(\/\/i\.\w+\.*imgur\.com\/)((?:\w{5}|\w{7})(?:[&,](?:\w{5}|\w{7}))*)(?:#\d+)?[a-z]?(\.(?:jpe?g|gif|png))?(\?.*)?$/i;
		const galleryHashRe = /^https?:\/\/(?:m\.|www\.)?imgur\.com\/gallery\/(\w+)(?:[/#]|$)/i;
		const albumHashRe = /^https?:\/\/(?:m\.|www\.)?imgur\.com\/a\/(\w+)(?:[/#]|$)/i;

		if (pathname === '/rules' || pathname === '/inbox') return null;

		href = href.split('?')[0];

		let groups;

		if ((groups = galleryHashRe.exec(href))) {
			const hash = groups[1];
			return () => _api(string.encode`gallery/${hash}`)
				// may have been removed from the gallery, try looking up the album
				.catch(() => _api(string.encode`album/${hash}`));
		} else if ((groups = albumHashRe.exec(href))) {
			if (this.options['prefer RES albums'].value) {
				const hash = groups[1];
				return () => _api(string.encode`album/${hash}`);
			}
		} else if ((groups = hostedHashRe.exec(href))) {
			const hash = groups[2];
			return () => _handleImage(hash, href);
		} else if ((groups = hashRe.exec(href))) {
			const hash = groups[1];
			if (hash.search(/[&,]/) > -1) {
				// handle separated list of IDs
				return () => _handleImageCollection(hash.split(/[&,]/), href);
			} else {
				return () => _handleImage(hash, href);
			}
		}

		return false;

		async function _api(endpoint) {
			const { data } = await ajax({
				url: apiPrefix + endpoint,
				type: 'json',
				headers: {
					Authorization: `Client-ID ${apiId}`,
				},
			});

			if (data.error) {
				throw new Error(`Imgur API error: ${data.error}`);
			}

			return data;
		}

		function _mockImageAPI(hash, url) {
			let thisCdnUrl = cdnUrl;
			let matches, extension;

			if ((matches = hostedHashRe.exec(url))) {
				thisCdnUrl = matches[1];
				extension = matches[3];
			} else if ((matches = hashRe.exec(url))) {
				extension = matches[2];
			}

			if (!extension) {
				// Imgur doesn't really care about the extension except video and the browsers don't seem to either.
				extension = '.jpg';
			}

			const mimeType = (extension === '.jpg') ? 'image/jpeg' : `image/${extension.slice(1)}`;

			return {
				id: hash,
				animated: false,
				looping: false,
				ext: extension,
				link: `${thisCdnUrl}${hash}${extension}`,
				type: mimeType,
				title: '',
				description: '',
			};
		}

		function _handleImage(hash, url) {
			const [,, extension] = hashRe.exec(url) || [];

			if (['.png', '.jpg', '.jpeg'].includes(extension)) {
				// Extension is given and hopefully correct, so we can intuit the mimetype
				// removed caption API calls as they don't seem to exist/matter for single images, only albums...
				// If we don't show captions and know the mimetype, then we can skip the API call.
				// We must hit the API for gif(v) even when the extension is given, to determine if it should loop
				return _mockImageAPI(hash, url);
			} else if (hostedHashRe.test(url)) {
				// Hosted images do not support gifv or albums, so we never need to hit the API
				return _mockImageAPI(hash, url);
			} else {
				// Check if image is gifv
				return _api(`image/${hash}`);
			}
		}

		function _handleImageCollection(hashes, url) {
			return {
				is_album: true,
				images: hashes.map(hash => _mockImageAPI(hash, url)),
			};
		}
	},
	async handleLink(href, getInfo) {
		const baseUrl = 'https://imgur.com/';
		const shareLinkPreferred = this.options.preferredImgurLink.value === 'share';
		const resolutionSuffix = this.options.imgurImageResolution.value;

		const info = await getInfo();

		if (info.images && info.images.length) {
			return _handleAlbum(href, info);
		} else if (info.gifv) {
			return _handleGifv(info);
		} else if (info.link) {
			return _handleSingleImage(info);
		}

		throw new Error('could not handle info');

		function _handleAlbum(href, info) {
			return {
				type: 'GALLERY',
				title: info.title,
				caption: info.description,
				src: info.images.map(info => ({
					...(info.gifv ?
							_handleGifv(info) :
							_handleSingleImage(info)
					),
					href: shareLinkPreferred ? `${href.split('#')[0]}#${info.id}` : `${info.link}`,
				})),
				galleryStart: findGalleryStart(info),
			};

			function findGalleryStart(info) {
				if (info.hash) {
					const hash = info.hash.slice(1);
					let galleryStart = parseInt(hash, 10);
					if (isNaN(galleryStart)) {
						galleryStart = info.images.findIndex((image, i) => hash === info.images[i].image.hash);

						if (galleryStart === -1) {
							galleryStart = 0;
						}
					}
					return galleryStart;
				}
			}
		}

		function _handleSingleImage(info) {
			const src = info.link
				.replace('http:', 'https:')
				.replace(`/${info.id}.`, `/${info.id}${resolutionSuffix}.`);

			return {
				src,
				href: shareLinkPreferred ? `${baseUrl}${info.id}` : `${info.link}`,
				type: 'IMAGE',
				caption: info.description,
				title: info.title,
			};
		}

		function _handleGifv(info) {
			return {
				type: 'VIDEO',
				controls: false,
				href: shareLinkPreferred ? `${baseUrl}${info.id}` : `${info.link}`,
				fallback: info.link.replace('http:', 'https:'),
				caption: info.description,
				title: info.title,
				loop: info.looping,
				muted: true,
				sources: [{
					source: info.mp4.replace('http:', 'https:'),
					type: 'video/mp4',
				}],
			};
		}
	},
});
