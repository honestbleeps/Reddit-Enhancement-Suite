/* @flow */

import { Module } from '../core/module';
import {
	Alert,
	addCSS,
	hashCode,
	watchForThings,
} from '../utils';
import { i18n } from '../environment';
import * as SettingsConsole from './settingsConsole';
import * as UserInfo from './userInfo';

export const module: Module<*> = new Module('userHighlight');

module.moduleName = 'userHighlightName';
module.category = 'usersCategory';
module.description = 'userHighlightDesc';
module.bodyClass = true;
module.options = {
	highlightOP: {
		type: 'boolean',
		value: true,
		description: 'Highlight OP\'s comments',
	},
	OPColor: {
		type: 'color',
		value: '#0055DF',
		description: 'Color to use to highlight OP. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightOP.value,
	},
	OPColorHover: {
		type: 'color',
		value: '#4E7EAB',
		description: 'Color used to highlight OP on hover.',
		advanced: true,
		dependsOn: options => options.highlightOP.value,
	},
	highlightAdmin: {
		type: 'boolean',
		value: true,
		description: 'Highlight Admin\'s comments',
	},
	adminColor: {
		type: 'color',
		value: '#FF0011',
		description: 'Color to use to highlight Admins. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightAdmin.value,
	},
	adminColorHover: {
		type: 'color',
		value: '#B3000C',
		description: 'Color used to highlight Admins on hover.',
		advanced: true,
		dependsOn: options => options.highlightAdmin.value,
	},
	highlightAlum: {
		type: 'boolean',
		value: true,
		description: 'Highlight Alum\'s comments',
	},
	alumColor: {
		type: 'color',
		value: '#BE1337',
		description: 'Color to use to highlight Alums. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightAlum.value,
	},
	alumColorHover: {
		type: 'color',
		value: '#8F0E29',
		description: 'Color used to highlight Alums on hover.',
		advanced: true,
		dependsOn: options => options.highlightAlum.value,
	},
	highlightFriend: {
		type: 'boolean',
		value: true,
		description: 'Highlight Friends\' comments',
	},
	friendColor: {
		type: 'color',
		value: '#FF4500',
		description: 'Color to use to highlight Friends. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightFriend.value,
	},
	friendColorHover: {
		type: 'color',
		value: '#B33000',
		description: 'Color used to highlight Friends on hover.',
		advanced: true,
		dependsOn: options => options.highlightFriend.value,
	},
	highlightMod: {
		type: 'boolean',
		value: true,
		description: 'Highlight Mod\'s comments',
	},
	modColor: {
		type: 'color',
		value: '#228822',
		description: 'Color to use to highlight Mods. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightMod.value,
	},
	modColorHover: {
		type: 'color',
		value: '#134913',
		description: 'Color used to highlight Mods on hover. Defaults to gray.',
		advanced: true,
		dependsOn: options => options.highlightMod.value,
	},
	highlightFirstCommenter: {
		type: 'boolean',
		value: false,
		description: 'Highlight the person who has the first comment in a tree, within that tree',
	},
	dontHighlightFirstComment: {
		type: 'boolean',
		value: true,
		description: 'Don\'t highlight the "first commenter" on the first comment in a tree',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	firstCommentColor: {
		type: 'color',
		value: '#46B6CC',
		description: 'Color to use to highlight the first-commenter. Defaults to original text color',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	firstCommentColorHover: {
		type: 'color',
		value: '#72D2E5',
		description: 'Color used to highlight the first-commenter on hover.',
		advanced: true,
		dependsOn: options => options.highlightFirstCommenter.value,
	},
	fontColor: {
		type: 'color',
		value: '#FFFFFF',
		description: 'Color for highlighted text.',
		advanced: true,
	},
	autoColorUsernames: {
		type: 'boolean',
		value: false,
		description: 'Automatically set a special color for each username',
	},
	autoColorUsing: {
		description: 'Select a method for setting colors for usernames',
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
		type: 'button',
		text: 'Generate',
		callback: generateHoverColors,
		description: 'Automatically generate hover color based on normal color.',
		advanced: true,
	},
};

let colorTable;

module.beforeLoad = () => {
	// Run these immediately since they add styles.
	// Adding styles would cause style recalculation at the end of every chunk, which is very expensive

	if (module.options.autoColorUsernames.value) {
		watchForThings(['post', 'comment', 'message'], updateNewUsernames, { immediate: true });
	}

	if (module.options.highlightFirstCommenter.value) {
		watchForThings(['comment'], updateFirstComments, { immediate: true });
	}

	colorTable = {
		admin: {
			color: module.options.adminColor.value,
			hoverColor: module.options.adminColorHover.value,
		},
		alum: {
			color: module.options.alumColor.value,
			hoverColor: module.options.alumColorHover.value,
		},
		firstComment: {
			color: module.options.firstCommentColor.value,
			hoverColor: module.options.firstCommentColorHover.value,
		},
		friend: {
			color: module.options.friendColor.value,
			hoverColor: module.options.friendColorHover.value,
		},
		moderator: {
			color: module.options.modColor.value,
			hoverColor: module.options.modColorHover.value,
		},
		submitter: {
			color: module.options.OPColor.value,
			hoverColor: module.options.OPColorHover.value,
		},
		user: {
			color: UserInfo.module.options.highlightColor.value,
			hoverColor: UserInfo.module.options.highlightColorHover.value,
		},
	};
	if (module.options.highlightFriend.value) {
		highlight('friend');
	}
	if (module.options.highlightOP.value) {
		highlight('submitter');
	}
	if (module.options.highlightMod.value) {
		highlight('moderator');
	}
	if (module.options.highlightAdmin.value) {
		highlight('admin');
	}
	if (module.options.highlightAlum.value) {
		highlight('alum');
	}
};

function updateFirstComments(thing) {
	if (!thing.isTopLevelComment()) return;

	const idClass = Array.from(thing.element.classList).find(cls => /*:: cls && */ cls.startsWith('id-t1_'));
	if (!idClass) return;

	const author = thing.getAuthorElement();
	if (!author) return;

	const authorClass = Array.from(author.classList).find(cls => /*:: cls && */ cls.startsWith('id-t2_'));

	if (authorClass) {
		const container = `.${idClass}${module.options.dontHighlightFirstComment.value ? ' .child' : ''}`;
		highlight('firstComment', authorClass, container);
	}
}

function updateNewUsernames(thing) {
	const element = thing.getAuthorElement();
	if (!element) return;

	const colorGetter = autoColorUsing[module.options.autoColorUsing.value];

	// Get identifiers
	const idClass = Array.from(element.classList).find(cls => /*:: cls && */ cls.startsWith('id-t2_'));

	if (idClass) {
		const color = colorGetter(idClass, element, thing.getAuthor());
		doTextColor(`.${idClass}`, color);
	}
}

const autoColorTemplate = `
	{{selector}} {
		color: {{color}} !important;
	}
	.res-nightmode {{selector}} {
		color: {{nightmodecolor}} !important;
	}
`;

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
			template: autoColorTemplate,
			color,
			nightmodecolor: nightmodeColor,
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
			template: autoColorTemplate,
			color: 'black',
			nightmodecolor: '#ccc',
		};
	},
};

export function highlightUser(userid: string) {
	const name = `author.id-t2_${userid}`;
	return highlight('user', name);
}

function highlight(name, selector = name, container = '.res-userHighlight .tagline') {
	const color = colorTable[name].color;
	const hoverColor = colorTable[name].hoverColor;
	const css = `
		${container} .author.${selector} {
			color: ${module.options.fontColor.value} !important;
			font-weight: bold;
			padding: 0 2px 0 2px;
			border-radius: 3px;
			background-color: ${color} !important;
		}
		${container} .collapsed .author.${selector} {
			color: white !important;
			background-color: #AAA !important;
		}
		${container} .author.${selector}:hover {
			background-color: ${hoverColor} !important;
			text-decoration: none !important;
		}
	`;
	return addCSS(css);
}

function doTextColor(selector, colorData) {
	const template = colorData.template || '{{selector}} { color: {{color}} !important; }';

	const placeholderValues = {
		...colorData,
		template: null,
		selector: `.tagline .author${selector}`,
	};

	let css = template;

	for (const [key, value] of Object.entries(placeholderValues)) {
		const search = new RegExp(`{{${key}}}`, 'g');

		if (value !== null && value !== undefined) {
			css = css.replace(search, value);
		}
	}

	return addCSS(css);
}

function generateHoverColor(color) { // generate a darker color
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

function generateHoverColors() { // apply generateHoverColor on all option
	const options = ['OPColor', 'adminColor', 'friendColor', 'modColor', 'firstCommentColor', 'alumColor'];
	let error = false;
	for (const option of options) {
		const newColor = generateHoverColor(SettingsConsole.getOptionValue('userHighlight', option));
		if (newColor !== false) {
			SettingsConsole.setOptionValue('userHighlight', `${option}Hover`, newColor);
		} else {
			error = true;
		}
	}
	if (error) {
		Alert.open(i18n('userHighlightColorCouldNotBeGenerated'));
	}
}
