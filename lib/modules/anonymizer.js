/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	addCSS,
	BodyClasses,
	CreateElement,
	currentSubreddit,
	hashCode,
	watchForThings,
	Thing,
} from '../utils';
import * as Menu from './menu';
import * as StyleTweaks from './styleTweaks';

export const module: Module<*> = new Module('anonymizer');

module.moduleName = 'anonymizerName';
module.category = 'appearanceCategory';
module.description = 'anonymizerDesc';
module.options = {
	hideUsernames: {
		title: 'anonymizerHideUsernamesTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideUsernamesDesc',
	},
	defaultColor: {
		title: 'anonymizerDefaultColorTitle',
		type: 'color',
		value: '#3399cc',
		description: 'anonymizerDefaultColorDesc',
		dependsOn: options => options.hideUsernames.value && !options.autoColorUsernames.value,
	},
	autoColorUsernames: {
		title: 'anonymizerAutoColorUsernamesTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerAutoColorUsernamesDesc',
		dependsOn: options => options.hideUsernames.value,
	},
	highlightOP: {
		title: 'anonymizerHighlightOPTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHighlightOPDesc',
		dependsOn: options => options.hideUsernames.value,
	},
	OPColor: {
		title: 'anonymizerOPColorTitle',
		type: 'color',
		value: '#0055DF',
		description: 'anonymizerOPColorDesc',
		dependsOn: options => options.hideUsernames.value && options.highlightOP.value,
	},
	highlightModerator: {
		title: 'anonymizerHighlightModeratorTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHighlightModeratorDesc',
		dependsOn: options => options.hideUsernames.value,
	},
	moderatorColor: {
		title: 'anonymizerModeratorColorTitle',
		type: 'color',
		value: '#228822',
		description: 'anonymizerModeratorColorDesc',
		dependsOn: options => options.hideUsernames.value && options.highlightModerator.value,
	},
	highlightAdmin: {
		title: 'anonymizerHighlightAdminTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHighlightAdminDesc',
		dependsOn: options => options.hideUsernames.value,
	},
	adminColor: {
		title: 'anonymizerAdminColorTitle',
		type: 'color',
		value: '#FF0011',
		description: 'anonymizerAdminColorDesc',
		dependsOn: options => options.hideUsernames.value && options.highlightAdmin.value,
	},
	disableSubredditStyle: {
		title: 'anonymizerDisableSubredditStyleTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerDisableSubredditStyleDesc',
	},
	hideSidebar: {
		title: 'anonymizerHideSidebarTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideSidebarDesc',
	},
	hideSubredditNames: {
		title: 'anonymizerHideSubredditNamesTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideSubredditNamesDesc',
	},
	hideSubredditMentions: {
		title: 'anonymizerHideSubredditMentionsTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideSubredditMentionsDesc',
	},
	subredditMentionColor: {
		title: 'anonymizerSubredditMentionColorTitle',
		type: 'color',
		value: '#0079d3',
		description: 'anonymizerSubredditMentionColorDesc',
		dependsOn: options => options.hideSubredditMentions.value,
	},
	hideFlairs: {
		title: 'anonymizerHideFlairsTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideFlairsDesc',
	},
	hideTags: {
		title: 'anonymizerHideTagsTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideTagsDesc',
	},
	hideTopBar: {
		title: 'anonymizerHideTopBarTitle',
		type: 'boolean',
		value: true,
		description: 'anonymizerHideTopBarDesc',
	},
	hideTime: {
		title: 'anonymizerHideTimeTitle',
		type: 'boolean',
		value: false,
		description: 'anonymizerHideTimeDesc',
	},
};

const optionSelectors: Map<string, Array<string>> = new Map(_.toPairs({
	hideUsernames: ['.commentingAsUser', '.user'],
	hideSidebar: ['.side'],
	hideSubredditNames: ['.pagename', '.domain'],
	hideFlairs: ['.flair'],
	hideTags: ['.RESUserTag', '.userattrs'],
	hideTopBar: ['#sr-header-area'],
	hideTime: ['.tagline time'],
}));

module.beforeLoad = () => {
	BodyClasses.remove('res-anonymizer');
	const selectors = [];
	for (const option of Object.keys(module.options)) {
		if (optionSelectors.has(option) && module.options[option].value) {
			const selectorList = optionSelectors.get(option);
			if (selectorList) {
				selectors.push(...selectorList);
			}
		}
	}
	// console.log(`selectors: ${selectors}`);
	if (selectors.length > 0) {
		addCSS(`
			${selectors.map(s => `.res-anonymizer ${s}`).join(',\n')} {
				opacity: 0 !important;
			}
		`);
	}
	if (module.options.hideSubredditMentions.value) {
		const color = module.options.subredditMentionColor.value;
		const hoverColor = generateHoverColor(color) || color;
		const selector = '.res-anonymizer .usertext-body';
		addCSS(`
			${selector} a[href^="/r/"],
			${selector} a[href*="reddit.com/r/"],
			${selector} a[href*="redd.it/"] {
				color: ${color} !important;				
				padding: 0 2px 0 2px;
				border-radius: 3px;				
				background-color: ${color} !important;
			}
			${selector} a[href^="/r/"]:hover,
			${selector} a[href*="reddit.com/r/"]:hover,
			${selector} a[href*="redd.it/"]:hover {
				color: white !important;
				background-color: ${hoverColor} !important;
				text-decoration: none !important;
			}				
		`);
	}
	if (module.options.hideUsernames.value && !module.options.autoColorUsernames.value) {
		setUserColor('', '', module.options.defaultColor.value);
	}
};

module.go = () => {
	createAnonymizerSwitch();
};

let $anonymizerSwitch;
let anonymizerOn = false;
let isInitialized = false;
let subredditStyle;
type RoleType = 'submitter' | 'admin' | 'moderator';
const roles = ['submitter', 'admin', 'moderator'];
const visitedUsers: Map<string, {role: RoleType, css: Array<{remove: {(): void}}>}> = new Map();

function createAnonymizerSwitch() {
	$anonymizerSwitch = $('<div>', {
		text: 'anonymize',
		title: 'Anonymize current page',
	});

	const toggle = CreateElement.toggleButton(
		undefined,
		'anonymizerToggle',
		anonymizerOn,
		'\uF09A',
		'\uF09B',
		false,
		true
	);
	$(toggle).appendTo($anonymizerSwitch);

	Menu.addMenuItem($anonymizerSwitch, userToggledAnonymizer);
}

function updateAnonymizerSwitch(toggle) {
	if (!$anonymizerSwitch) return;
	$anonymizerSwitch.find('.toggleButton').toggleClass('enabled', toggle);
}

function userToggledAnonymizer(e) {
	if (e) {
		e.preventDefault();
	}
	if (anonymizerOn) {
		undoAnonymize();
	} else {
		doAnonymize();
	}
	anonymizerOn = !anonymizerOn;
	updateAnonymizerSwitch(anonymizerOn);
}

async function doAnonymize() {
	BodyClasses.add('res-anonymizer');
	if (!isInitialized) {
		if (module.options.hideUsernames.value) {
			for (const thing of Thing.things()) {
				if (thing.isPost() || thing.isComment() || thing.isMessage()) {
					updateNewUsernames(thing);
				}
			}
			watchForThings(['post', 'comment', 'message'], updateNewUsernames, { immediate: true });
		}
		isInitialized = true;
	}
	if (module.options.disableSubredditStyle.value && currentSubreddit()) {
		subredditStyle = await StyleTweaks.getSubredditStyleToggle();
		if (!subredditStyle) {
			StyleTweaks.toggleSubredditStyle(false);
		}
	}
}

function undoAnonymize() {
	BodyClasses.remove('res-anonymizer');
	if (module.options.disableSubredditStyle.value && !subredditStyle) {
		StyleTweaks.toggleSubredditStyle(true);
	}
}

function updateNewUsernames(thing) {
	const element = thing.getAuthorElement();
	if (!element) return;

	const idClass = Array.from(element.classList).find(cls => cls && cls.startsWith('id-t2_'));

	if (idClass) {
		const role = roles.filter(r => element.classList.contains(r))[0];
		if (visitedUsers.has(idClass)) {
			const userInfo = visitedUsers.get(idClass);
			if (role && userInfo && userInfo.role !== role) {
				if (userInfo.css) {
					userInfo.css.forEach(css => { css.remove(); });
				}
				visitedUsers.delete(idClass);
			} else {
				return;
			}
		}
		const colorData = colorMap(idClass, role);
		const username = thing.getAuthor();
		if (username) {
			console.log(`${idClass} => ${username} | ${role} | ${colorData.color}`);
			const css = [];
			if (colorData.color) {
				css.push(setUserColor(`.${idClass}`, username, colorData.color));
			}
			if (colorData.nightmodeColor) {
				css.push(setUserColor(`.${idClass}`, username, colorData.nightmodeColor, '.res-nightmode'));
			}
			visitedUsers.set(idClass, { role, css });
		}
	}
}

function setUserColor(idClass, username, color, container = '') {
	const hoverColor = generateHoverColor(color) || color;
	const css = `
		.res-anonymizer${container} .tagline .author${idClass},
		.res-anonymizer${container} a[href*="/user/${username}"],
		.res-anonymizer${container} a[href*="/u/${username}"] {
			color: ${color} !important;				
			padding: 0 2px 0 2px;
			border-radius: 3px;				
			background-color: ${color} !important;
		}
		.res-anonymizer${container} .collapsed .tagline .author${idClass} {
			color: #AAA !important;
			background-color: #AAA !important;				
		}	
		.res-anonymizer${container} .tagline .author${idClass}:hover,
		.res-anonymizer${container} a[href*="/user/${username}"]:hover,
		.res-anonymizer${container} a[href*="/u/${username}"]:hover {
			color: white !important;
			background-color: ${hoverColor} !important;
			text-decoration: none !important;
		}	
	`;
	return addCSS(css);
}

function generateHoverColor(color) { // generate a darker color
	// from userHighlight module (TODO: remove code duplication)
	if (!(/^#[0-9A-F]{6}$/i).test(color)) {
		return false;
	}
	let R = parseInt(color.substr(1, 2), 16);
	let G = parseInt(color.substr(3, 2), 16);
	let B = parseInt(color.substr(5, 2), 16);
	// R = R + 0.25 *(255-R); // 25% lighter
	R = Math.round(0.75 * R) + 256; // we add 256 to add a 1 before the color in the hex format
	G = Math.round(0.75 * G) + 256; // then we remove the 1, this have for effect to
	B = Math.round(0.75 * B) + 256; // add a 0 before one char color in hex format (i.e. 0xA -> 0x10A -> 0x0A)
	return `#${R.toString(16).substr(1)}${G.toString(16).substr(1)}${B.toString(16).substr(1)}`;
}

function colorMap(idClass, role) {
	if (role === 'submitter' && module.options.highlightOP.value) {
		return {
			color: module.options.OPColor.value,
		};
	}
	if (role === 'moderator' && module.options.highlightModerator.value) {
		return {
			color: module.options.moderatorColor.value,
		};
	}
	if (role === 'admin' && module.options.highlightAdmin.value) {
		return {
			color: module.options.adminColor.value,
		};
	}

	if (!module.options.autoColorUsernames.value) {
		return {
			color: module.options.defaultColor.value,
		};
	} else {
		// from userHighlight module (TODO: remove code duplication)

		const hash = hashCode(idClass);

		// With help from /u/Rangi42

		const r = (hash & 0xFF0000) >> 16;
		const g = (hash & 0x00FF00) >> 8;
		const b = hash & 0x0000FF;
		// Luminance formula: http://stackoverflow.com/a/596243/70175
		const lum = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
		const minLum = 0x66; // Night mode background is #191919 or #222222
		const maxLum = 0xAA; // Regular background is #FFFFFF or #F7F7F8

		let color = [r, g, b];
		let nightmodeColor = [r, g, b];
		if (lum < minLum) {
			const scale = minLum / lum;
			nightmodeColor = [
				Math.round(r * scale),
				Math.round(g * scale),
				Math.round(b * scale),
			];
		} else if (lum > maxLum) {
			const scale = maxLum / lum;
			color = [
				Math.round(r * scale),
				Math.round(g * scale),
				Math.round(b * scale),
			];
		}
		color = `rgb(${color.join(',')})`;
		nightmodeColor = `rgb(${nightmodeColor.join(',')})`;

		return {
			color,
			nightmodeColor,
		};
	}
}
