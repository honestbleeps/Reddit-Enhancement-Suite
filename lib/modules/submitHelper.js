/* @flow */

import _ from 'lodash';
import repostWarningTemplate from '../templates/repostWarning.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { ajax, i18n } from '../environment';
import {
	formatDateDiff,
	string,
} from '../utils';
import type { RedditListing, RedditLink } from '../types/reddit';
import * as CommandLine from './commandLine';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('submitHelper');

module.moduleName = 'submitHelperName';
module.category = 'submissionsCategory';
module.description = 'submitHelperDesc';
module.options = {
	warnAlreadySubmitted: {
		type: 'boolean',
		value: true,
		description: 'Show a warning when the current URL has already been submitted to the selected subreddit. <p><i>Not 100% accurate, due to search limitations and different ways to format the same URL.</i></p>',
	},
	uncheckSendRepliesToInbox: {
		type: 'boolean',
		value: false,
		description: 'Uncheck "send replies to my inbox" by default, when submitting a new post.',
	},
	postFromCommandLine: {
		type: 'boolean',
		value: true,
	};
};
module.include = [
	'submit',
];

const $repostWarning = _.once(() => $(repostWarningTemplate({ settingsUrl: SettingsNavigation.makeUrlHash(module.moduleID, 'warnAlreadySubmitted') })));
let urlField, srField;

module.go = () => {
	if (module.options.warnAlreadySubmitted.value) {
		const urlFieldDiv = document.querySelector('#url-field');
		if (urlFieldDiv) {
			$(urlFieldDiv).parent().after($repostWarning());
			urlField = ((urlFieldDiv.querySelector('#url'): any): HTMLInputElement);
			srField = ((document.querySelector('#sr-autocomplete'): any): HTMLInputElement);
			$([srField, urlField]).on('input keydown', _.debounce(updateRepostWarning, 300));
			// No event is fired when reddit's js changes the subreddit field, so update whenever the user clicks
			$('#suggested-reddits a, #sr-drop-down').on('click', updateRepostWarning);
			// We would allow reddit to show/hide the message for link/text posts with #link-desc
			// but some subreddits hide this box, so we'll do it manually.
			const linkButton = document.querySelector('a.link-button');
			const textButton = document.querySelector('a.text-button');
			if (linkButton && textButton) {
				linkButton.addEventListener('click', () => { updateRepostWarning(); });
				textButton.addEventListener('click', () => { $repostWarning().hide(); });
			}
		}
	}

	if (module.options.uncheckSendRepliesToInbox.value) {
		const sendReplies: ?HTMLInputElement = (document.querySelector('#sendreplies'): any);
		if (sendReplies) {
			sendReplies.checked = false;
		}
	}

	if (module.options.postFromCommandLine.value) {
		commandLine.registerCommand('/^post (?:\/?r\/)(\w)+\s*(.+)?\s*(\w+:\/\/.+)?', 'post [subreddit] [title] [url] - submit a post to a subreddit',
			(command, val) => {
				if (val && !val[1]) {
					return 'Post to which subreddit?';
				} else if (val[3]) {
					return `Post ${val[3]} to /r/${val[1]}: ${val[2]}`;
				} else {
					return `Post to /r/${val[1]}: ${val[2]}`;
				}
			},
			(command, val) => {
				let redirect = '/submit';
				if (val[3]) {
					redirect = `/r/${val[1]}/submit?title=${encodeURI(val[2])}&url=${encodeURI(val[3])}`;
				} else if (val[2]) {
					redirect = `/r/${val[1]}/submit?title=${encodeURI(val[2])}`;
				} else if (val[1]) {
					redirect = `/r/${val[1]}/submit`;
				}

				window.location = redirect;
			}
		});
	}
};

function showRepostWarning(sr, url, date) {
	$repostWarning()
		.find('.subredditLink').attr('href', `/r/${sr}`).text(`/r/${sr}`).end()
		.find('.seeMore').attr('href', string.encode`/r/${sr}/search?restrict_sr=on&sort=relevance&q=url%3A${url}`).end()
		.find('.time').text(` ${i18n('submitHelperTimeAgo', formatDateDiff(date))} `).end()
		.fadeIn(300);
}

function hideRepostWarning() {
	$repostWarning().fadeOut(300);
}

async function updateRepostWarning() {
	if (!urlField.value) return;
	const stripUrlRe = /^(?:https?:\/\/)?(?:(?:www|i|m)\.)?(.+?)\/?(?:\.\w+)?(?:#[^\/]*)?$/i;
	const subreddit = srField.value;
	const userUrl = stripUrlRe.exec(urlField.value)[1];

	if (subreddit && userUrl) {
		try {
			const { data } = (await ajax({
				url: string.encode`/r/${subreddit}/search.json`,
				data: {
					restrict_sr: 'on',
					sort: 'relevance',
					limit: 1,
					q: `url:${userUrl}`,
				},
				type: 'json',
			}): RedditListing<RedditLink>);

			if (data && data.children.length && (data.children[0].data.url.match(stripUrlRe): any)[1] === userUrl) {
				showRepostWarning(subreddit, userUrl, new Date(data.children[0].data.created_utc * 1000));
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
