/* @flow */

import _ from 'lodash';
import repostWarningTemplate from '../templates/repostWarning.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { ajax, i18n } from '../environment';
import {
	formatDateDiff,
	isPageType,
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
	focusFormOnLoad: {
		type: 'boolean',
		value: true,
		description: 'Put keyboard focus into the form when the page loads.',
	},
};

const $repostWarning = _.once(() => $(repostWarningTemplate({ settingsUrl: SettingsNavigation.makeUrlHash(module.moduleID, 'warnAlreadySubmitted') })));
let urlField, srField;

module.go = () => {
	if (isPageType('submit') && module.options.warnAlreadySubmitted.value) {
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

	if (isPageType('submit') && module.options.uncheckSendRepliesToInbox.value) {
		const sendReplies: ?HTMLInputElement = (document.querySelector('#sendreplies'): any);
		if (sendReplies) {
			sendReplies.checked = false;
		}
	}

	if (isPageType('submit') && module.options.focusFormOnLoad.value) {
		$('form.submit [name=url], form.submit [name=title]').filter(':visible').first().focus();
	}

	if (!isPageType('submit')) {
		registerCommandLine();
	}
};

function registerCommandLine() {
	const trailingUrl = /(?:\s+(\w+:\/\/.+))$/;
	const cliParams = /^(?:(?:\/?r\/)?(\w+))?(?:\s+(.*))?$/;

	function commandLineParameters(val) {
		const urlResult = trailingUrl.exec(val);
		const result = cliParams.exec(urlResult ? val.slice(0, val.length - urlResult[0].length) : val);
		return result ? result.slice(1).concat(urlResult ? urlResult[1] : undefined) : [];
	}

	CommandLine.registerCommand(/^p(?:ost)?$/,
		'post [subreddit] [title] [url] - submit a post to a subreddit',
		(command, val) => {
			const [subreddit, title, url] = commandLineParameters(val);
			if (!subreddit) {
				// Use default value
			} else if (url) {
				return `Post ${url} to /r/${subreddit}: ${title}`;
			} else if (title) {
				return `Post to /r/${subreddit}: ${title || ''}`;
			} else if (subreddit) {
				return `Post to /r/${subreddit}`;
			}
		},
		(command, val) => {
			const [subreddit, title, url] = commandLineParameters(val);

			const redirect = subreddit ?
				string.encode`/r/${subreddit}/submit?title=${title || ''}&url=${url || ''}` :
				'/submit';

			window.location = redirect;
		}
	);
}

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
