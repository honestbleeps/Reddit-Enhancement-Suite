/* @flow */

import _ from 'lodash';
import { $, guiders } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import {
	CreateElement,
	elementInViewport,
	mutex,
	niceKeyCode,
	positiveModulo,
	DAY,
} from '../utils';
import { Storage, i18n } from '../environment';
import * as PenaltyBox from './penaltyBox';
import * as KeyboardNav from './keyboardNav';
import * as Menu from './menu';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('RESTips');

module.moduleName = 'resTipsName';
module.category = 'aboutCategory';
module.description = 'resTipsDesc';
module.options = {
	menuItem: {
		title: 'RESTipsMenuItemTitle',
		type: 'boolean',
		value: true,
		description: 'RESTipsMenuItemDesc',
	},
	dailyTip: {
		title: 'RESTipsDailyTipTitle',
		type: 'boolean',
		value: true,
		description: 'RESTipsDailyTipDesc',
	},
	newFeatureTips: {
		title: 'RESTipsNewFeatureTipsTitle',
		type: 'boolean',
		value: true,
		description: 'RESTipsNewFeatureTipsDesc',
	},
};

const featureTipsStorage = Storage.wrapPrefix('RESTips.featureTips.', () => ({ enabled: true }));
const lastTooltipStorage = Storage.wrap('RESLastToolTip', 0);

module.go = () => {
	if (module.options.menuItem.value) {
		const $menuItem = $('<div>', {
			id: 'RESTipsMenuItem',
			text: i18n('tipsAndTricks'),
		});

		Menu.addMenuItem($menuItem, () => { showOrdinaryTip('random'); });
	}
};

let allowFeatureTips;
const featureTips: Map<string, Tip> = new Map();
const featureTipReadyPromise = new Promise(resolve => { allowFeatureTips = () => resolve(true); });

module.afterLoad = async () => {
	const showsDailyTip = module.options.dailyTip.value && await dailyTip();
	if (module.options.newFeatureTips.value && !showsDailyTip) allowFeatureTips();
};

const newFeatureTipsCheckbox = _.once(() =>
	$('<label><input type="checkbox" name="disableNewFeatureTipsCheckbox" checked />Show these tips when new features appear</label>')
		.click((e: Event) => Options.set(module, 'newFeatureTips', (e.target: any).checked))
);

// memoize: prevent the same tip from being added multiple times
export const addFeatureTip = _.memoize(async (id: string, tip: Tip) => {
	tip.onHide = () => { featureTipsStorage.set(id, { enabled: false }); };

	featureTips.set(id, tip);
	// Make the tip accessible via daily tips / tips & tricks
	tips.push(tip);

	if (
		!tip.quiet &&
		await featureTipReadyPromise &&
		await featureTipsStorage.get(id).then(({ enabled }) => enabled)
	) showFeatureTip(id);
});

export const showFeatureTip = mutex((id: string) => {
	const tip = featureTips.get(id);

	if (!tip) {
		console.error('Feature tip is not added', id);
		return;
	}

	if (tip.attachTo instanceof Element && !elementInViewport(tip.attachTo)) {
		// Usually happens when subreddit CSS for some reason hides the element
		console.log('Ignoring feature tip whose attachment element is not visible:', tip);
		return;
	}

	return showTip(tip, {
		title: 'New feature',
		classString: 'res-featureTip',
		buttonCustomHTML: newFeatureTipsCheckbox(),
		buttons: [],
	});
});

async function dailyTip(): Promise<boolean> { // `true` if daily tip is being shown
	const lastCheck = await lastTooltipStorage.get();
	const now = Date.now();
	const delay = PenaltyBox.penalizedDelay(module.moduleID, 'dailyTip', {
		value: DAY,
		default: DAY,
	});
	if ((now - lastCheck) > delay) {
		// mark off that we've displayed a new tooltip
		lastTooltipStorage.set(now);
		if (lastCheck === 0) {
			await showOrdinaryTip();
		} else {
			PenaltyBox.alterFeaturePenalty(module.moduleID, 'dailyTip', _.clamp(PenaltyBox.MAX_PENALTY / tips.length, 3, 8));
			await showOrdinaryTip('random');
		}
		return true;
	}
	return false;
}

function generateContent({ message, keyboard, options }: Tip) {
	const description = [];

	if (typeof message === 'function') description.push(message());
	else if (typeof message === 'string') description.push(message);

	if (keyboard) {
		// TODO: microtemplate
		const disabled = !Modules.isEnabled(KeyboardNav);
		description.push(`<h2 class="keyboardNav${disabled ? 'keyboardNavDisabled' : ''}">`);
		description.push(`Keyboard Navigation${disabled ? ' (disabled)' : ''}`);
		description.push('</h2>');

		const keyboardTable = CreateElement.table(keyboard, generateContentKeyboard);
		if (keyboardTable) description.push(keyboardTable);
	}

	if (options) {
		for (const option of options) {
			description.push('<h2 class="settingsPointer">');
			description.push('<span class="gearIcon"></span> RES Settings');
			description.push('</h2>');

			const optionTable = CreateElement.table(option, generateContentOption);
			if (optionTable) description.push(optionTable);
		}
	}

	return $('<div />').html(description.join('\n'));
}

function generateContentKeyboard(keyboardNavOption: string) {
	const keyCode = niceKeyCode(KeyboardNav.module.options[keyboardNavOption].value);
	if (!keyCode) return false;

	const description = [];
	description.push('<tr>');
	description.push(`<td><code>${keyCode.toLowerCase()}</code></td>`);
	description.push(`<td>${keyboardNavOption}</td>`);
	description.push('</tr><tr>');
	description.push('<td>&nbsp;</td>'); // for styling
	description.push(`<td>${i18n(KeyboardNav.module.options[keyboardNavOption].description)}</td>`);
	description.push('</tr>');

	return description;
}

function generateContentOption(option) {
	const mod = Modules.getUnchecked(option.moduleID);
	if (!mod) return false;

	const description = [];

	description.push('<tr>');
	description.push(`<td>${i18n(mod.category)}</td>`);

	description.push('<td>');
	description.push(SettingsNavigation.makeUrlHashLink(option.moduleID, undefined, i18n(mod.moduleName)));
	description.push('</td>');

	description.push('<td>');
	description.push(option.key ? SettingsNavigation.makeUrlHashLink(option.moduleID, option.key) : '&nbsp;');
	description.push('</td>');

	if (option.key && mod.options[option.key]) {
		description.push('</tr><tr>');
		description.push(`<td colspan="3">${i18n(mod.options[option.key].description)}</td>`);
	}
	description.push('</tr>');

	return description;
}

export type Tip = {|
	message: string | () => string,
	title?: string,
	attachTo?: string | HTMLElement,
	position?: number,
	keyboard?: string,
	continuation?: () => string,
	quiet?: boolean,
	onHide?: () => void,
	options?: Array<{|
		moduleID: string,
		key?: string,
	|}>,
|};

const tips: Array<Tip> = [{
	message: `
		Welcome to RES, a community-driven unofficial browser extension for Reddit. You can turn on, turn off, or change options for RES features using the gear icon link at the top right.
		<p>For feature requests, or just help getting a question answered, be sure to subscribe to <a href="/r/Enhancement">/r/Enhancement</a>.</p>
		<p>If RES has enhanced your reddit experience, please show your appreciation by <a href="#res:settings/contribute">donating or contributing!</a></p>
		`,
	attachTo: '#openRESPrefs',
	position: 5,
}, {
	message: 'Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.',
	attachTo: '.RESUserTagImage',
	position: 3,
	options: [{ moduleID: 'userTagger' }],
}, {
	message: 'If your RES data gets deleted or you move to a new computer, you can restore it from backup. <br><br><b>Firefox</b> especially sometimes loses your RES settings and data. <br><br><a href="/r/Enhancement/wiki/backing_up_res_settings" target="_blank" rel="noopener noreferer">Learn where RES stores your data and settings</a></p>',
	title: 'Back up your RES data!',
}, {
	message: 'Don\'t forget to subscribe to <a href="/r/Enhancement">/r/Enhancement</a> to keep up to date on the latest versions of RES or suggest features! For bug reports, submit to <a href="/r/RESIssues">/r/RESIssues</a>',
}, {
	message: 'Don\'t want to see posts containing certain keywords? Want to filter out certain subreddits from /r/all? Try the filteReddit module!',
	options: [{ moduleID: 'filteReddit' }],
}, {
	message: 'Keyboard Navigation is one of the most underutilized features in RES. You should try it!',
	options: [{ moduleID: 'keyboardNav' }],
	keyboard: 'toggleHelp',
}, {
	message: 'Did you know you can configure the appearance of a number of things in RES? For example: Selected Entry lets you configure the look of the "selected" box, and commentBoxes lets you configure the borders / shadows.',
	options: [{
		moduleID: 'selectedEntry',
		key: 'setColors',
	}, {
		moduleID: 'commentStyle',
		key: 'commentBoxes',
	}],
}, {
	message: 'Do you subscribe to a ton of subreddits? Give the subreddit tagger a try; it can make your homepage a bit more readable.',
	options: [{
		moduleID: 'subRedditTagger',
	}],
}, {
	message: 'If you haven\'t tried it yet, Keyboard Navigation is great. Just hit ? while browsing for instructions.',
	options: [{
		moduleID: 'keyboardNav',
	}],
	keyboard: 'toggleHelp',
}, {
	message: 'Roll over a user\'s name to get information about them such as their karma, and how long they\'ve been a reddit user.',
	options: [{
		moduleID: 'userInfo',
		key: 'hoverInfo',
	}],
}, {
	message: 'Hover over the "parent" link in comments pages to see the text of the parent being referred to.',
	options: [{
		moduleID: 'showParent',
	}],
}, {
	message: 'You can configure the color and style of the User Highlighter module if you want to change how the highlights look.',
	options: [{
		moduleID: 'userHighlight',
	}],
}, {
	message: 'Not a fan of how comments pages look? You can change the appearance in the Style Tweaks module',
	options: [{
		moduleID: 'styleTweaks',
	}],
}, {
	message: 'Don\'t like the style in a certain subreddit? RES gives you a checkbox to disable styles individually - check the right sidebar!',
}, {
	message: 'Looking for posts by submitter, post with photos, or posts in IAmA form? Try out the comment navigator.',
}, {
	message: 'Have you seen the <a href="/r/Dashboard">RES Dashboard</a>? It allows you to do all sorts of great stuff, like keep track of lower traffic subreddits, and manage your <a href="/r/Dashboard#userTaggerContents">user tags</a> and <a href="/r/Dashboard#newCommentsContents">thread subscriptions</a>!',
	options: [{
		moduleID: 'dashboard',
	}],
}, {
	message: 'Sick of seeing these tips?  They only show up once every 24 hours, but you can disable that in the RES Tips and Tricks preferences.',
	options: [{
		moduleID: 'RESTips',
	}],
}, {
	message: 'Did you know that there is now a "keep me logged in" option in the Account Switcher? Turn it on if you want to stay logged in to Reddit when using the switcher!',
	options: [{
		moduleID: 'accountSwitcher',
		key: 'keepLoggedIn',
	}],
}, {
	message: 'See that little [vw] next to users you\'ve voted on?  That\'s their vote weight - it moves up and down as you vote the same user up / down.',
	options: [{
		moduleID: 'userTagger',
		key: 'vwNumber',
	}],
}];

const dailyTipsCheckbox = _.once(() =>
	$(`<label> <input type="checkbox" name="disableDailyTipsCheckbox" ${module.options.dailyTip.value ? 'checked' : ''} />Show these tips once every 24 hours</label>`)
		.click((e: Event) => Options.set(module, 'dailyTip', (e.target: any).checked))
);

let lastTip;

function showOrdinaryTip(change?: 'random' | 'prev' | 'next') {
	// The more tips the user views, the more the next dailyTip can be delayed
	PenaltyBox.alterFeaturePenalty(module.moduleID, 'dailyTip', 1);

	let currTipIndex = Math.max(tips.indexOf(lastTip), 0);
	let tip: ?Tip;
	while (!tip || (tip.attachTo && !$(tip.attachTo).is(':visible'))) {
		if (change === 'random') currTipIndex = _.random(tips.length);
		else if (change === 'prev') currTipIndex -= 1;
		else if (change === 'next') currTipIndex += 1;
		else change = 'next'; // For next iteration
		currTipIndex = positiveModulo(currTipIndex, tips.length);
		tip = tips[currTipIndex];
	}

	return showTip((tip: Tip), {
		buttons: [{
			name: 'Prev',
			onclick: () => showOrdinaryTip('prev'),
		}, {
			name: 'Next',
			onclick: () => showOrdinaryTip('next'),
		}],
		onClose() { PenaltyBox.alterFeaturePenalty(module.moduleID, 'dailyTip', 4); },
		classString: 'res-ordinaryTip',
		buttonCustomHTML: dailyTipsCheckbox(),
		title: 'RES Tips and Tricks',
	});
}

function showTip(tip: Tip, guiderObj) {
	const { continuation } = lastTip = tip;
	if (continuation) {
		const origGuiderObj = { ...guiderObj };
		const onclick = async () => {
			const upcomingId = continuation();
			let nextTip;
			while (!(nextTip = featureTips.get(upcomingId))) {
				await new Promise(r => setTimeout(r, 100)); // eslint-disable-line no-await-in-loop
			}
			showTip(nextTip, origGuiderObj);
		};
		guiderObj.buttons = [...guiderObj.buttons, { name: 'More', onclick }];
	}

	const attachTo: ?HTMLElement = tip.attachTo && $(tip.attachTo).get(0) || null;

	// Make the attachTo element navigatable even when e.g. dropdowns intersect the guider
	const toggleIncreasedZIndex = state => { if (attachTo) attachTo.classList.toggle('restips-increased-z-index', state); };

	return new Promise(resolve => {
		guiders.hideAll();
		guiders.createGuider({
			id: `res-guider-${performance.now()}`, // guiders.js' randomization interval is [0..999], and merges buttons on collision
			closeOnEscape: true,
			xButton: true,
			description: generateContent(tip),
			...guiderObj,
			...tip,
			onHide() {
				if (tip.onHide) tip.onHide();
				toggleIncreasedZIndex(false);
				resolve();
			},
			attachTo,
		});
		toggleIncreasedZIndex(true);
		guiders.show();
	});
}
