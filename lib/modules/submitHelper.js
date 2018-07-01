/* @flow */

import _ from 'lodash';
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
		title: 'submitHelperWarnAlreadySubmittedTitle',
		type: 'boolean',
		value: true,
		description: 'submitHelperWarnAlreadySubmittedDesc',
	},
	uncheckSendRepliesToInbox: {
		title: 'submitHelperUncheckSendRepliesToInboxTitle',
		type: 'boolean',
		value: false,
		description: 'submitHelperUncheckSendRepliesToInboxDesc',
	},
	focusFormOnLoad: {
		title: 'submitHelperFocusFormOnLoadTitle',
		type: 'boolean',
		value: true,
		description: 'submitHelperFocusFormOnLoadDesc',
	},
};

const $repostWarning = _.once(() => $(string.html`
	<div class="spacer" style="display: none">
		<div class="roundfield info-notice">
			<a style="float: right" class="gearIcon" href="${SettingsNavigation.makeUrlHash(module.moduleID, 'warnAlreadySubmitted')}"></a>
			<p>This link was submitted to <a class="subredditLink" href="#"></a>:<span class="time"></span><a class="seeMore" href="#" target="_blank" rel="noopener noreferer">(see more)</a></p>
		</div>
	</div>
`));

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
				return `Post ${url} to /r/${subreddit}: ${title || ''}`;
			} else if (title) {
				return `Post to /r/${subreddit}: ${title}`;
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
	const match = stripUrlRe.exec(urlField.value);

	if (subreddit && match) {
		const [, userUrl] = match;
		try {
			const { data } = (await ajax({
				url: string.encode`/r/${subreddit}/search.json`,
				query: {
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
