import { $ } from '../../vendor';

export default {
	moduleID: 'miiverse',
	name: 'Miiverse',
	attribution: false,
	domains: ['miiverse.nintendo.net'],

	detect: ({ href }) => href.includes('miiverse.nintendo.net/posts/'),

	handleLink(href) {
		return {
			type: 'GENERIC_EXPANDO',
			expandoClass: 'selftext miiverse',
			muted: true,
			generate() {
				const $expando = $('<div>', { class: 'expando' });

				if (process.env.BUILD_TARGET !== 'firefox') {
					// generate code needed for Miiverse's embed script.
					const miiversePost = document.createElement('div');
					miiversePost.className = 'miiverse-post';
					miiversePost.setAttribute('lang', 'en');
					miiversePost.setAttribute('data-miiverse-embedded-version', '1');
					miiversePost.setAttribute('data-miiverse-cite', href);

					const miiverseScript = document.createElement('script');
					miiverseScript.setAttribute('async', 'async');
					miiverseScript.setAttribute('src', 'https://miiverse.nintendo.net/js/embedded.min.js');
					miiverseScript.setAttribute('charset', 'utf-8');

					$expando.append(miiversePost);
					$expando.append(miiverseScript);
				} else {
					// create the miiverse post manually. Just an iframe with the
					// original post URL plus '/embed'
					let postID = 'unknown';

					const matches = href.match(/\/posts\/([0-9A-Za-z\-_]+)$/);
					if (matches) {
						[, postID] = matches;
					}

					const frame = document.createElement('iframe');
					frame.className = `miiverse-post-frame miiverse-post-${postID}`;
					frame.src = `${href}/embed`;

					// give it some basic style
					frame.style.minWidth = '220px';
					frame.style.maxWidth = '500px';
					frame.style.width = '98%';
					frame.style.border = '1px solid #dddddd';

					$expando.append(frame);

					window.addEventListener('message', event => {
						// see if we can get the proper height.
						const matches = event.data.match(/(?:^|,)height:([0-9]+)(?:,|$)/);

						if (matches) {
							frame.style.height = `${matches[1]}px`;
							frame.scrolling = 'no';
						} else {
							frame.style.height = '500px';
						}
					});
				}

				return $expando.get(0);
			},
		};
	},
};
