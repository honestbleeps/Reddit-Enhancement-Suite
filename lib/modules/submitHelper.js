import _ from 'lodash';
import repostWarningTemplate from '../templates/repostWarning.hbs';
import { $ } from '../vendor';
import { ajax } from 'environment';
import {
	fadeElementIn,
	fadeElementOut,
	niceDateDiff,
	string
} from '../utils';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'submitHelper';
	module.moduleName = 'Submission Helper';
	module.category = 'Submissions';
	module.description = 'Provides utilities to help with submitting a post.';
	module.options = {
		warnAlreadySubmitted: {
			type: 'boolean',
			value: true,
			description: 'Show a warning when the current URL has already been submitted to the selected subreddit. <p><i>Not 100% accurate, due to search limitations and different ways to format the same URL.</i></p>'
		},
		uncheckSendRepliesToInbox: {
			type: 'boolean',
			value: false,
			description: 'Uncheck "send replies to my inbox" by default, when submitting a new post.'
		}
	};
	module.include = [
		'submit'
	];

	let repostWarning, urlField, srField;

	module.beforeLoad = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			if (module.options.warnAlreadySubmitted.value) {
				repostWarning = $(repostWarningTemplate())[0];
			}
		}
	};

	module.go = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			if (module.options.warnAlreadySubmitted.value) {
				const urlFieldDiv = document.querySelector('#url-field');
				if (urlFieldDiv) {
					$(urlFieldDiv).parent().after(repostWarning);
					urlField = urlFieldDiv.querySelector('#url');
					srField = document.querySelector('#sr-autocomplete');
					$([srField, urlField]).on('input keydown', _.debounce(updateRepostWarning, 300));
					// No event is fired when reddit's js changes the subreddit field, so update whenever the user clicks
					$('#suggested-reddits a, #sr-drop-down').on('click', updateRepostWarning);
					// We would allow reddit to show/hide the message for link/text posts with #link-desc
					// but some subreddits hide this box, so we'll do it manually.
					const linkButton = document.querySelector('a.link-button');
					const textButton = document.querySelector('a.text-button');
					if (linkButton && textButton) {
						linkButton.addEventListener('click', () => (repostWarning.querySelector('.res-repost').style.display = 'block'));
						textButton.addEventListener('click', () => (repostWarning.querySelector('.res-repost').style.display = 'none'));
					}
				}
			}

			if (module.options.uncheckSendRepliesToInbox.value) {
				const sendReplies = document.querySelector('#sendreplies');
				if (sendReplies) {
					sendReplies.checked = false;
				}
			}
		}
	};

	function showRepostWarning(sr, url, date) {
		const srLink = repostWarning.querySelector('.subredditLink');
		srLink.href = `/r/${sr}`;
		$(srLink).text(`/r/${sr}`);
		repostWarning.querySelector('.seeMore').href = string.encode`/r/${sr}/search?restrict_sr=on&sort=relevance&q=url%3A${url}`;
		$(repostWarning).find('.time').text(` ${niceDateDiff(date)} ago `);
		fadeElementIn(repostWarning, 0.3);
	}

	function hideRepostWarning() {
		fadeElementOut(repostWarning, 0.3);
	}

	async function updateRepostWarning() {
		const stripUrlRe = /^(?:https?:\/\/)?(?:(?:www|i|m)\.)?(.+?)\/?(?:\.\w+)?(?:#[^\/]*)?$/i;
		const subreddit = srField.value;
		const userUrl = stripUrlRe.exec(urlField.value)[1];

		if (subreddit && userUrl) {
			try {
				const { data } = await ajax({
					url: string.encode`/r/${subreddit}/search.json`,
					data: {
						restrict_sr: 'on',
						sort: 'relevance',
						limit: 1,
						q: `url:${userUrl}`
					},
					type: 'json'
				});

				if (data && data.children.length && data.children[0].data.url.match(stripUrlRe)[1] === userUrl) {
					showRepostWarning(subreddit, userUrl, new Date(data.children[0].data.created * 1000));
				} else {
					hideRepostWarning();
				}
			} catch (e) {
				hideRepostWarning();
				throw e;
			}
		} else {
			hideRepostWarning();
		}
	}
}
