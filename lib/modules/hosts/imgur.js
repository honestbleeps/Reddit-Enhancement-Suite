/* @flow */

import { Host } from '../../core/host';
import { ajax } from '../../environment';
import { string } from '../../utils';

type Image = MockImage | ImgurImage | ImgurAlbum | ImageCollection;

type MockImage = {|
	objType: 'MockImage',
	id: string,
	looping: false,
	link: string,
	title: '',
	description: '',
|};

type ImgurImage = ImgurNonGif | ImgurGif;

type ImgurImageShared = {|
	id: string,
	title: string,
	description: string,
	has_sound: boolean,
	link: string,
|}

type ImgurNonGif = {|
	objType: 'ImgurNonGif',
	...ImgurImageShared,
|};

type ImgurGif = {|
	objType: 'ImgurGif',
	mp4: string,
	looping: boolean,
	...ImgurImageShared,
|}

type ImgurAlbum = {|
	objType: 'ImgurAlbum',
	id: string,
	title: string,
	description: string,
	link: string,
	images: Array<ImgurImage>,
|};

type ImageCollection = {|
	objType: 'ImageCollection',
	images: Array<MockImage>,
	title: '',
	description: '',
|};

export default new Host('imgur', {
	name: 'imgur',
	domains: ['imgur.com'],
	logo: 'https://i.imgur.com/favicon.ico',
	options: {
		preferResAlbums: {
			title: 'imgurPreferResAlbumsTitle',
			description: 'imgurPreferResAlbumsDesc',
			value: true,
			type: 'boolean',
		},
		useGifOverGifv: {
			title: 'imgurUseGifOverGifVTitle',
			description: 'imgurUseGifOverGifVDesc',
			value: false,
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
	detect({ pathname, href }): null | false | (() => Image | Promise<Image>) {
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
			return () => (_fetchGallery(hash)
				// may have been removed from the gallery, try looking up the album
				.catch(() => _fetchAlbum(hash)));
		} else if ((groups = albumHashRe.exec(href))) {
			if (this.options.preferResAlbums.value) {
				const hash = groups[1];
				return () => _fetchAlbum(hash);
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

		async function _fetchImage(hash): Promise<ImgurImage> {
			const img = await _api(`image/${hash}`);
			img.objType = (data.type === 'image/gif') ? 'ImgurGif' : 'ImgurNonGif';
			return img;
		}

		async function _fetchGallery(hash): Promise<ImgurAlbum> {
			const gallery = await _api(string.encode`gallery/${hash}`);
			gallery.objType = 'ImgurAlbum';
			return gallery;
		}

		async function _fetchAlbum(hash): Promise<ImgurAlbum> {
			const album = await _api(string.encode`album/${hash}`);
			album.objType = 'ImgurAlbum';
			return album;
		}

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

			// Cast some null strings to empty strings.
			data.title = data.title || '';
			data.description = data.description || '';

			return data;
		}

		function _mockImageAPI(hash, url): MockImage {
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

			return {
				objType: 'MockImage',
				id: hash,
				looping: false,
				link: `${thisCdnUrl}${hash}${extension}`,
				title: '',
				description: '',
			};
		}

		function _handleImage(hash, url): MockImage | Promise<ImgurImage> {
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
				return fetchImage(hash);
			}
		}

		function _handleImageCollection(hashes, url): ImageCollection {
			return {
				objType: ImageCollection,
				images: hashes.map(hash => _mockImageAPI(hash, url)),
				title: '',
				description: '',
			};
		}
	},
	async handleLink(href, getInfo: () => Image | Promise<Image>) {
		const baseUrl = 'https://imgur.com/';
		const shareLinkPreferred = this.options.preferredImgurLink.value === 'share';
		const resolutionSuffix = this.options.imgurImageResolution.value;
		const useGif = this.options.useGifOverGifv.value;

		const info = await getInfo();

		if (info.objType === 'ImgurAlbum' || info.objtype === 'ImgurCollection') {
			return _handleAlbum(href, info);
		} else if (!useGif && info.objType === 'ImgurGif') {
			return _handleGifv(info);
		} else if (info.link) {
			return _handleSingleImage(info);
		}

		throw new Error('could not handle info');

		function _handleAlbum(href, info: ImgurAlbum | ImageCollection) {
			return {
				type: 'GALLERY',
				title: info.title,
				caption: info.description,
				src: info.images.map(info => ({
					...(!useGif && info.objType === 'ImgurGif' ?
						_handleGifv(info) :
						_handleSingleImage(info)
					),
					href: shareLinkPreferred ? `${href.split('#')[0]}#${info.id}` : `${info.link}`,
				})),
				galleryStart: findGalleryStart(info),
			};

			function findGalleryStart(info: ImgurAlbum | ImageCollection) {
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

		function _handleSingleImage(info: MockImage | ImgurImage) {
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

		function _handleGifv(info: ImgurGif) {
			return {
				type: 'VIDEO',
				controls: false,
				href: shareLinkPreferred ? `${baseUrl}${info.id}` : `${info.link}`,
				fallback: info.link.replace('http:', 'https:'),
				caption: info.description,
				title: info.title,
				loop: info.looping,
				muted: !info.has_sound,
				sources: [{
					source: info.mp4.replace('http:', 'https:'),
					type: 'video/mp4',
				}],
			};
		}
	},
});
