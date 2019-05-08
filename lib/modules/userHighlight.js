/* @flow */

import { Module } from '../core/module';
import * as Options from '../core/options';
import {
	Alert,
	Thing,
	addCSS,
	throttle,
	hashCode,
	isPageType,
	loggedInUser,
	getUsernameFromLink,
	watchForElements,
	watchForThings,
} from '../utils';
import { i18n } from '../environment';
import * as UserInfo from './userInfo';

export const module: Module<*> = new Module('userHighlight');

module.moduleName = 'userHighlightName';
module.category = 'usersCategory';
module.description = 'userHighlightDesc';
module.bodyClass = true;
module.options = {
	highlightSelf: {
		title: 'userHighlightHighlightSelfTitle',
		type: 'boolean',
		value: false,
		description: 'userHighlightHighlightSelfDesc',
	},
	selfColor: {
		title: 'userHighlightSelfColorTitle',
		type: 'color',
		value: '#B8860B',
		description: 'userHighlightSelfColorDesc',
		advanced: true,
		dependsOn: options => options.highlightSelf.value,
	},
	selfColorHover: {
		title: 'userHighlightSelfColorHoverTitle',
		type: 'color',
		value: '#8A6508',
		description: 'userHighlightSelfColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightSelf.value,
	},
	highlightOP: {
		title: 'userHighlightHighlightOPTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightHighlightOPDesc',
	},
	OPColor: {
		title: 'userHighlightOPColorTitle',
		type: 'color',
		value: '#0055DF',
		description: 'userHighlightOPColorDesc',
		advanced: true,
		dependsOn: options => options.highlightOP.value,
	},
	OPColorHover: {
		title: 'userHighlightOPColorHoverTitle',
		type: 'color',
		value: '#4E7EAB',
		description: 'userHighlightOPColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightOP.value,
	},
	highlightAdmin: {
		title: 'userHighlightHighlightAdminTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightHighlightAdminDesc',
	},
	adminColor: {
		title: 'userHighlightAdminColorTitle',
		type: 'color',
		value: '#FF0011',
		description: 'userHighlightAdminColorDesc',
		advanced: true,
		dependsOn: options => options.highlightAdmin.value,
	},
	adminColorHover: {
		title: 'userHighlightAdminColorHoverTitle',
		type: 'color',
		value: '#B3000C',
		description: 'userHighlightAdminColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightAdmin.value,
	},
	highlightAlum: {
		title: 'userHighlightHighlightAlumTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightHighlightAlumDesc',
	},
	alumColor: {
		title: 'userHighlightAlumColorTitle',
		type: 'color',
		value: '#BE1337',
		description: 'userHighlightAlumColorDesc',
		advanced: true,
		dependsOn: options => options.highlightAlum.value,
	},
	alumColorHover: {
		title: 'userHighlightAlumColorHoverTitle',
		type: 'color',
		value: '#8F0E29',
		description: 'userHighlightAlumColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightAlum.value,
	},
	highlightFriend: {
		title: 'userHighlightHighlightFriendTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightHighlightFriendDesc',
	},
	friendColor: {
		title: 'userHighlightFriendColorTitle',
		type: 'color',
		value: '#FF4500',
		description: 'userHighlightFriendColorDesc',
		advanced: true,
		dependsOn: options => options.highlightFriend.value,
	},
	friendColorHover: {
		title: 'userHighlightFriendColorHoverTitle',
		type: 'color',
		value: '#B33000',
		description: 'userHighlightFriendColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightFriend.value,
	},
	highlightMod: {
		title: 'userHighlightHighlightModTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightHighlightModDesc',
	},
	modColor: {
		title: 'userHighlightModColorTitle',
		type: 'color',
		value: '#228822',
		description: 'userHighlightModColorDesc',
		advanced: true,
		dependsOn: options => options.highlightMod.value,
	},
	modColorHover: {
		title: 'userHighlightModColorHoverTitle',
		type: 'color',
		value: '#134913',
		description: 'userHighlightModColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightMod.value,
	},
	highlightOpMentions: {
		title: 'userHighlightOpMentionsTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightOpMentionsDesc',
	},
	opMentionsColor: {
		title: 'userHighlightOpMentionsColorTitle',
		type: 'color',
		value: '#6D4731',
		description: 'userHighlightOpMentionsColorDesc',
		advanced: true,
		dependsOn: options => options.highlightOpMentions.value,
	},
	opMentionsHover: {
		title: 'userHighlightOpMentionsHoverTitle',
		type: 'color',
		value: '#C4946E',
		description: 'userHighlightOpMentionsHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightOpMentions.value,
	},
	highlightFirstCommenter: {
		title: 'userHighlightHighlightFirstCommenterTitle',
		type: 'boolean',
		value: false,
		description: 'userHighlightHighlightFirstCommenterDesc',
	},
	dontHighlightFirstComment: {
		title: 'userHighlightDontHighlightFirstCommentTitle',
		type: 'boolean',
		value: true,
		description: 'userHighlightDontHighlightFirstCommentDesc',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	firstCommentColor: {
		title: 'userHighlightFirstCommentColorTitle',
		type: 'color',
		value: '#46B6CC',
		description: 'userHighlightFirstCommentColorDesc',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	firstCommentColorHover: {
		title: 'userHighlightFirstCommentColorHoverTitle',
		type: 'color',
		value: '#72D2E5',
		description: 'userHighlightFirstCommentColorHoverDesc',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	fontColor: {
		title: 'userHighlightFontColorTitle',
		type: 'color',
		value: '#FFFFFF',
		description: 'userHighlightFontColorDesc',
		advanced: true,
	},
	autoColorUsernames: {
		title: 'userHighlightAutoColorUsernamesTitle',
		type: 'boolean',
		value: false,
		description: 'userHighlightAutoColorUsernamesDesc',
	},
	autoColorUsing: {
		title: 'userHighlightAutoColorUsingTitle',
		description: 'userHighlightAutoColorUsingDesc',
		type: 'enum',
		value: 'hash-userid-notbright',
		values: [{
			name: 'Random color, not too bright, consistent for each user; night mode-friendly',
			value: 'hash-userid-notbright',
		}, {
			name: 'Simple random color, consistent for each user. (original)',
			value: 'hash-userid',
		}, {
			name: 'All black or, in night mode, all light gray.',
			value: 'monochrome',
		}],
		advanced: true,
		dependsOn: options => options.autoColorUsernames.value,
	},
	generateHoverColors: {
		title: 'userHighlightGenerateHoverColorsTitle',
		type: 'button',
		text: 'Generate',
		callback: generateHoverColors,
		description: 'userHighlightGenerateHoverColorsDesc',
		advanced: true,
	},
};

module.beforeLoad = () => {
	// Run these immediately since they add styles.
	// Adding styles would cause style recalculation at the end of every chunk, which is very expensive

	if (module.options.autoColorUsernames.value) {
		watchForThings(['post', 'comment', 'message'], updateNewUsernames, { immediate: true });
	}

	if (module.options.highlightFirstCommenter.value) {
		watchForThings(['comment'], updateFirstComments, { immediate: true });
	}

	if (module.options.highlightFriend.value) {
		highlight('friend', module.options.friendColor.value, module.options.friendColorHover.value);
	}
	if (module.options.highlightOP.value) {
		highlight('submitter', module.options.OPColor.value, module.options.OPColorHover.value);
	}
	if (module.options.highlightMod.value) {
		highlight('moderator', module.options.modColor.value, module.options.modColorHover.value);
	}
	if (module.options.highlightAdmin.value) {
		highlight('admin', module.options.adminColor.value, module.options.adminColorHover.value);
	}
	if (module.options.highlightAlum.value) {
		highlight('alum', module.options.alumColor.value, module.options.alumColorHover.value);
	}

	if (module.options.highlightOpMentions.value && isPageType('comments')) {
		watchForElements(['selfText'], null, selftext => {
			const thing = Thing.from(selftext);
			const author = thing && thing.getAuthor();
			highlightMentionedUsers(selftext, module.options.opMentionsColor.value, module.options.opMentionsHover.value, author);
		}, { immediate: true });
	}
};

module.contentStart = () => {
	const username = loggedInUser();
	if (module.options.highlightSelf.value && username) {
		highlight(`author[href$="/${username}"]`, module.options.selfColor.value, module.options.selfColorHover.value);
	}
};

function highlightMentionedUsers(element, color, hoverColor, ...exclude) {
	Array.from(element.querySelectorAll('a'))
		.map(getUsernameFromLink)
		.filter(Boolean)
		.filter(user => !exclude.includes(user))
		.forEach(user => highlight(`author[href$="/${user}" i]`, color, hoverColor));
}

function updateFirstComments(thing) {
	if (!thing.isTopLevelComment()) return;

	const idClass = Array.from(thing.element.classList).find(cls => cls.startsWith('id-t1_'));
	if (!idClass) return;

	const author = thing.getAuthorElement();
	if (!author) return;

	const authorClass = Array.from(author.classList).find(cls => cls.startsWith('id-t2_'));

	if (authorClass) {
		const container = `.${idClass}${module.options.dontHighlightFirstComment.value ? ' .child' : ''}`;
		highlight(
			authorClass,
			module.options.firstCommentColor.value,
			module.options.firstCommentColorHover.value,
			container
		);
	}
}

function updateNewUsernames(thing) {
	const element = thing.getAuthorElement();
	if (!element) return;

	const idClass = Array.from(element.classList).find(cls => cls.startsWith('id-t2_'));
	if (!idClass) return;

	const colorGetter = autoColorUsing[module.options.autoColorUsing.value];
	const color = colorGetter(idClass);

	doTextColor(idClass, color);
}

const autoColorUsing = {
	'hash-userid-notbright'(idClass) {
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
	},
	'hash-userid'(idClass) {
		// Choose color
		let hash = 5381;
		for (const char of idClass) {
			hash = ((hash << 5) + hash) + char.charCodeAt(0);
			/* hash * 33 + c */
		}

		const r = (hash & 0xFF0000) >> 16;
		const g = (hash & 0x00FF00) >> 8;
		const b = hash & 0x0000FF;
		const color = `rgb(${[r, g, b].join(',')})`;

		return {
			color,
		};
	},
	monochrome() {
		return {
			color: 'black',
			nightmodeColor: '#ccc',
		};
	},
};

export function highlightUser(userid: string) {
	return highlight(
		`author.id-t2_${userid}`,
		UserInfo.module.options.highlightColor.value,
		UserInfo.module.options.highlightColorHover.value
	);
}

const css = [];
const throttled = throttle(() => { addCSS(css.splice(0, css.length).join('\n')); });
const batch = v => { css.push(v); throttled(); };

function highlight(selector, color, hoverColor, container = '') {
	batch(`
${container} .tagline .author.${selector},
${container} .crosspost-preview-tagline .author.${selector} {
	color: ${module.options.fontColor.value} !important;
	font-weight: bold;
	padding: 0 2px 0 2px;
	border-radius: 3px;
	background-color: ${color} !important;
}
${container} .collapsed .tagline .author.${selector},
${container} .collapsed .crosspost-preview-tagline .author.${selector} {
	color: white !important;
	background-color: #AAA !important;
}
${container} .tagline .author.${selector}:hover,
${container} .crosspost-preview-tagline .author.${selector}:hover {
	background-color: ${hoverColor} !important;
	text-decoration: none !important;
}
	`);
}

function doTextColor(selector, colorData) {
	const color = colorData.color;
	const nightmodeColor = colorData.nightmodeColor || colorData.color;
	batch(`
.tagline .author.${selector} {
	color: ${color} !important;
}
.res-nightmode .tagline .author.${selector} {
	color: ${nightmodeColor} !important;
}
	`);
}

function generateHoverColor(color) { // generate a darker color
	if (!(/^#[0-9A-F]{6}$/i).test(color)) throw new Error('Input color must be a six digit hex value');
	let R = parseInt(color.substr(1, 2), 16);
	let G = parseInt(color.substr(3, 2), 16);
	let B = parseInt(color.substr(5, 2), 16);
	// R = R + 0.25 *(255-R); // 25% lighter
	R = Math.round(0.75 * R) + 256; // we add 256 to add a 1 before the color in the hex format
	G = Math.round(0.75 * G) + 256; // then we remove the 1, this have for effect to
	B = Math.round(0.75 * B) + 256; // add a 0 before one char color in hex format (i.e. 0xA -> 0x10A -> 0x0A)
	return `#${R.toString(16).substr(1)}${G.toString(16).substr(1)}${B.toString(16).substr(1)}`;
}

function generateHoverColors() { // apply generateHoverColor on all option
	try {
		for (const option of ['selfColor', 'OPColor', 'adminColor', 'friendColor', 'modColor', 'firstCommentColor', 'alumColor']) {
			const current = (Options.stage.get(module.moduleID) || module.options)[option].value;
			Options.set(module.moduleID, option, generateHoverColor(current));
		}
		Alert.open('Saved, but not yet updated in settings console. Reload page without saving to see new values.');
	} catch (e) {
		Alert.open(i18n('userHighlightColorCouldNotBeGenerated'));
	}
}
