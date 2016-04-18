import { DAY } from '../../utils';
import { ajax } from 'environment';

export default {
	moduleID: 'gifyoutube',
	name: 'gifyoutube',
	domains: ['gifyoutube.com', 'gifyt.com'],
	logo: '//cdn.gifs.com/resources/favicon.png',
	detect: href => (
		(/^https?:\/\/(?:beta\.|www\.)?(?:gifyoutube|gifyt)\.com\/gif\/(\w+)\.?/i).exec(href) ||
		(/^https?:\/\/share\.gifyoutube\.com\/(\w+)\.gif/i).exec(href)
	),
	handleLink(elem, [, id]) {
		elem.type = 'VIDEO';
		elem.expandoOptions = {
			autoplay: true, // gifyoutube will always be muted, so autoplay is OK
			controls: false,
			loop: true,
			fallback: `https://share.gifyoutube.com/${id}.gif`,
			muted: true,
			source: '#', // Updated on expand
			sources: [{
				source: `https://share.gifyoutube.com/${id}.webm`,
				type: 'video/webm'
			}, {
				source: `https://share.gifyoutube.com/${id}.mp4`,
				type: 'video/mp4'
			}]
		};

		elem.onExpand = async ({ wrapperDiv }) => {
			const { sauce } = await ajax({
				url: `https://gifs.com/api/${id}`,
				type: 'json',
				cacheFor: DAY
			});

			wrapperDiv.querySelector('.video-advanced-source').href = sauce;
		};
	}
};
