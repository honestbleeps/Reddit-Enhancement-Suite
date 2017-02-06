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
		type: 'boolean',
		value: true,
		description: 'RESTipsMenuItemDesc',
	},
	dailyTip: {
		type: 'boolean',
		value: true,
		description: 'RESTipsDailyTipDesc',
	},
	newFeatureTips: {
		type: 'boolean',
		value: true,
		description: 'Show tips about new features when they appear for the first time.',
	},
};

const featureTipsStorage = Storage.wrapDomain(id => `RESTips.featureTips.${id}`, { enabled: true });
const lastTooltipStorage = Storage.wrap('RESLastToolTip', 0);

module.go = () => {
	if (module.options.menuItem.value) {
		const $menuItem = $('<div>', {
			id: 'RESTipsMenuItem',
			text: 'tips & tricks',
		});

		Menu.addMenuItem($menuItem, () => { showOrdinaryTip('random'); });
	}
};

let allowFeatureTips;
const featureTipReadyPromise = new Promise(resolve => { allowFeatureTips = resolve; });

module.afterLoad = async () => {
	if (module.options.dailyTip.value) {
		await dailyTip();
	}

	allowFeatureTips();
};

const newFeatureTipsCheckbox = _.once(() =>
	$('<label><input type="checkbox" name="disableNewFeatureTipsCheckbox" checked />Show these tips when new features appear</label>')
		.click((e: Event) => Options.set(module, 'newFeatureTips', (e.target: any).checked))
);

// memoize: prevent the same tip from being added multiple times
export const showFeatureTip = _.memoize(mutex(async (id: string, tip: Tip) => {
	if (!Modules.isRunning(module) || !module.options.newFeatureTips.value) return;

	await featureTipReadyPromise;

	const { enabled } = await featureTipsStorage.get(id);
	if (!enabled) return;

	// Also make the tip accessible via daily tips / tips & tricks
	tips.push(tip);

	if (tip.attachTo instanceof Element && !elementInViewport(tip.attachTo)) {
		// Usually happens when subreddit CSS for some reason hides the element
		console.log('Ignoring feature tip whose attachment element is not visible:', tip);
		return;
	}

	const guiderObj = {
		description: generateContent(tip),
		title: 'New feature',
		onClose() {
			featureTipsStorage.set(id, { enabled: false });
		},
		buttonCustomHTML: newFeatureTipsCheckbox(),
		...tip,
	};

	const { continuation } = tip;
	if (continuation) {
		guiderObj.buttons = [{
			name: 'Continue',
			onclick() {
				continuation();
				$(this).parents('.guider').find('.guiders_x_button').click();
			},
		}];
	}

	await showTip(guiderObj);
}));

async function dailyTip() {
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
	}
}

function generateContent({ message, keyboard, options }: Tip) {
	const description = [];

	if (message) description.push(message);

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
	message: string,
	title?: string,
	attachTo?: string | HTMLElement,
	position?: number,
	keyboard?: string,
	continuation?: () => void,
	options?: Array<{|
		moduleID: string,
		key?: string,
	|}>,
|};

const tips: Array<Tip> = [{
	message: `
		Welcome to RES! You can turn on, turn off, or change options for RES features using the gear icon link at the top right.
		<p>For feature requests, or just help getting a question answered, be sure to subscribe to <a href="/r/Enhancement">/r/Enhancement</a>.</p>
		<p>If RES has enhanced your reddit experience, please show your appreciation by <a href="#res:settings/contribute">donating or contributing!</a></p>
		`,
	attachTo: '#openRESPrefs',
	position: 5,
}, {
	message: 'Click the tag icon next to a user to tag that user with any name you like - you can also color code the tag.',
	attachTo: '.RESUserTagImage:visible',
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
	message: 'Did you know you can configure the appearance of a number of things in RES? For example: keyboard navigation lets you configure the look of the "selected" box, and commentBoxes lets you configure the borders / shadows.',
	options: [{
		moduleID: 'keyboardNav',
		key: 'focusBGColor',
	}, {
		moduleID: 'styleTweaks',
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
		moduleID: 'userTagger',
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
		key: 'vwTooltip',
	}],
}];

const dailyTipsCheckbox = _.once(() =>
	$(`<label> <input type="checkbox" name="disableDailyTipsCheckbox" ${module.options.dailyTip.value ? 'checked' : ''} />Show these tips once every 24 hours</label>`)
		.click((e: Event) => Options.set(module, 'dailyTip', (e.target: any).checked))
);

let currTipIndex = 0;

function showOrdinaryTip(change?: 'random' | 'prev' | 'next') {
	let tip;

	PenaltyBox.alterFeaturePenalty(module.moduleID, 'dailyTip', -20);

	while (!tip || (tip.attachTo && !$(tip.attachTo).is(':visible'))) {
		if (change === 'random') currTipIndex = _.random(tips.length);
		else if (change === 'prev') currTipIndex -= 1;
		else if (change === 'next') currTipIndex += 1;
		else change = 'next'; // For next iteration
		currTipIndex = positiveModulo(currTipIndex, tips.length);
		tip = tips[currTipIndex];
	}

	const $description = generateContent(tip);
	$description.on('click', 'a', () => { PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', -20); });

	return showTip({
		buttons: [{
			name: 'Prev',
			onclick: () => showOrdinaryTip('prev'),
		}, {
			name: 'Next',
			onclick: () => showOrdinaryTip('next'),
		}],
		onClose: () => { PenaltyBox.alterFeaturePenalty(module.moduleID, 'sectionMenu', 15); },
		description: $description,
		buttonCustomHTML: dailyTipsCheckbox(),
		title: 'RES Tips and Tricks',
		...tip,
	});
}

function showTip(guiderObj) {
	return new Promise(resolve => {
		guiders.hideAll();
		guiders.createGuider({ closeOnEscape: true, xButton: true, ...guiderObj, onHide: resolve });
		guiders.show();
	});
}
