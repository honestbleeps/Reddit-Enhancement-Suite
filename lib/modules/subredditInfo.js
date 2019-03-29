/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	CreateElement,
	HOUR,
	downcast,
	formatDate,
	formatDateDiff,
	formatNumber,
	isFakeSubreddit,
	loggedInUser,
	regexes,
	string,
} from '../utils';
import type { RedditSubreddit } from '../types/reddit';
import { ajax, i18n } from '../environment';
import * as Dashboard from './dashboard';
import * as FilteReddit from './filteReddit';
import * as Hover from './hover';
import * as SubredditManager from './subredditManager';

export const module: Module<*> = new Module('subredditInfo');

module.moduleName = 'subredditInfoName';
module.category = 'subredditsCategory';
module.description = 'subredditInfoDesc';
module.options = {
	requireDirectLink: {
		title: 'subredditInfoRequireDirectLinkTitle',
		type: 'boolean',
		value: true,
		description: 'subredditInfoRequireDirectLinkDesc',
	},
	hoverDelay: {
		title: 'subredditInfoHoverDelayTitle',
		type: 'text',
		value: '800',
		description: 'subredditInfoHoverDelayDesc',
		advanced: true,
	},
	fadeDelay: {
		title: 'subredditInfoFadeDelayTitle',
		type: 'text',
		value: '200',
		description: 'subredditInfoFadeDelayDesc',
		advanced: true,
	},
	fadeSpeed: {
		title: 'subredditInfoFadeSpeedTitle',
		type: 'text',
		value: '0.7',
		description: 'subredditInfoFadeSpeedDesc',
		advanced: true,
	},
};

module.go = () => {
	const linkSelector = [
		'a.subreddit',
		'a.search-subreddit-link',
		'.md a[href^="/r/"]',
		'.Post a[href^="/r/"]:not([href*="/comments/"])',
		'.Comment a[href^="/r/"]:not([href*="/comments/"])',
		'a[data-click-id="subreddit"]',
		!module.options.requireDirectLink.value && '.md a[href*="reddit.com/r/"]',
	].filter(x => x).join(', ');

	$(document.body).on('mouseenter', linkSelector, handleMouseEnter);
};

function handleMouseEnter(e: Event) {
	const target = downcast(e.target, HTMLAnchorElement);
	const match = regexes.subreddit.exec(target.pathname);
	if (!match) return;

	const [, subreddit] = match;

	// Don't show popup if subreddit is in fake subreddit list
	if (isFakeSubreddit(subreddit)) return;

	Hover.infocard(module.moduleID)
		.target(target)
		.options({
			width: 450,
			openDelay: parseFloat(module.options.hoverDelay.value),
			fadeDelay: parseFloat(module.options.fadeDelay.value),
			fadeSpeed: parseFloat(module.options.fadeSpeed.value),
		})
		.populateWith(card => showSubredditInfo(card, subreddit))
		.begin();
}

async function showSubredditInfo(card, subreddit) {
	const header = string.html`<div><a href="/r/${subreddit}">/r/${subreddit}</a></div>`;

	let jsonData;
	try {
		jsonData = (await ajax({
			url: `/r/${subreddit.toLowerCase()}/about.json`,
			type: 'json',
			cacheFor: HOUR,
		}): RedditSubreddit);
	} catch (e) {
		// Don't show pop up if no subreddit info
		card.remove();
		return [null, i18n('subredditInfoErrorLoadingSubredditInfo')];
	}

	if (jsonData.kind !== 't5') {
		return [null, i18n('subredditInfoSubredditNotFound')];
	}

	if (loggedInUser()) {
		const button = CreateElement.fancyToggleButton(
			i18n('subredditInfoSubscribe'),
			'',
			!!jsonData.data.user_is_subscriber,
			state => {
				SubredditManager.subscribeToSubreddit(jsonData.data.name, state);
				// Invalidate the cache
				ajax.invalidate({ url: `/r/${subreddit}/about.json` });
			}
		);
		button.style.marginLeft = '12px';
		header.appendChild(button);

		if (Modules.isEnabled(SubredditManager)) {
			SubredditManager.getMultiCounts(jsonData.data.display_name).then(v => $(button).after(v));
		}
	}

	const d = new Date(jsonData.data.created_utc * 1000);

	const $newBody = $(string.html`
		<div class="subredditInfoToolTip">
			<div class="subredditLabel">${i18n('subredditInfoSubredditCreated')}</div> <div class="subredditDetail">${formatDate(d)} (${formatDateDiff(d)})</div>
			<div class="subredditLabel">${i18n('subredditInfoSubscribers')}</div> <div class="subredditDetail">${formatNumber(jsonData.data.subscribers)}</div>
			<div class="subredditLabel">${i18n('subredditInfoTitle')}</div> <div class="subredditDetail">${jsonData.data.title}</div>
			<div class="subredditLabel">${i18n('subredditInfoOver18')}</div> <div class="subredditDetail">${jsonData.data.over18 ? i18n('yes') : i18n('no')}</div>
			<div class="clear"></div>
			<div id="subTooltipButtons" class="bottomButtons">
				<div class="clear"></div>
			</div>
		</div>
	`);

	// bottom buttons will include: +filter +shortcut +dashboard (maybe sub/unsub too?)
	if (Modules.isRunning(SubredditManager)) {
		$newBody.find('#subTooltipButtons').append(SubredditManager.createShortcutToggleButton(subreddit));
	}

	if (Modules.isEnabled(Dashboard)) {
		$newBody.find('#subTooltipButtons').append(Dashboard.createSubredditToggleButton(subreddit));
	}

	if (Modules.isEnabled(FilteReddit)) {
		const button = CreateElement.fancyToggleButton(
			i18n('subredditInfoAddRemoveFilter'),
			i18n('subredditInfoFilterFromAllAndDomain'),
			FilteReddit.listFilters.subreddits.includesString(subreddit),
			state => FilteReddit.listFilters.subreddits.toggleString(subreddit, state)
		);
		$newBody.find('#subTooltipButtons').append(button);
	}

	return [header, $newBody];
}
