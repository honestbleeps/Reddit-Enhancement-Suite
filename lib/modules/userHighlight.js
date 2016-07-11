import { $ } from '../vendor';
import {
	Alert,
	addCSS,
	forEachChunked,
	hashCode,
	watchForElement,
} from '../utils';
import * as SettingsConsole from './settingsConsole';
import * as UserInfo from './userInfo';

export const module = {};

module.moduleID = 'userHighlight';
module.moduleName = 'User Highlighter';
module.category = ['Users', 'Appearance'];
module.description = 'Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk';
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
		dependsOn: 'highlightOP',
	},
	OPColorHover: {
		type: 'color',
		value: '#4E7EAB',
		description: 'Color used to highlight OP on hover.',
		advanced: true,
		dependsOn: 'highlightOP',
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
		dependsOn: 'highlightAdmin',
	},
	adminColorHover: {
		type: 'color',
		value: '#B3000C',
		description: 'Color used to highlight Admins on hover.',
		advanced: true,
		dependsOn: 'highlightAdmin',
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
		dependsOn: 'highlightFriend',
	},
	friendColorHover: {
		type: 'color',
		value: '#B33000',
		description: 'Color used to highlight Friends on hover.',
		advanced: true,
		dependsOn: 'highlightFriend',
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
		dependsOn: 'highlightMod',
	},
	modColorHover: {
		type: 'color',
		value: '#134913',
		description: 'Color used to highlight Mods on hover. Defaults to gray.',
		advanced: true,
		dependsOn: 'highlightMod',
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
		dependsOn: 'highlightFirstCommenter',
	},
	firstCommentColor: {
		type: 'color',
		value: '#46B6CC',
		description: 'Color to use to highlight the first-commenter. Defaults to original text color',
		advanced: true,
		dependsOn: 'highlightFirstCommenter',
	},
	firstCommentColorHover: {
		type: 'color',
		value: '#72D2E5',
		description: 'Color used to highlight the first-commenter on hover.',
		advanced: true,
		dependsOn: 'highlightFirstCommenter',
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
		values: [],
		advanced: true,
		dependsOn: 'autoColorUsernames',
	},
	generateHoverColors: {
		type: 'button',
		text: 'Generate',
		callback: generateHoverColors,
		description: 'Automatically generate hover color based on normal color.',
		advanced: false, // TODO: true after release after 2014-06-30
	},
};

module.loadDynamicOptions = function() {
	const autoColorUsingOption = module.options.autoColorUsing;

	autoColorUsingOption.values.push(...autoColorUsing.map(strategy => ({
		value: strategy.name,
		name: strategy.description,
	})));

	const defaultStrategy = autoColorUsingOption.values[0];
	if (defaultStrategy) {
		autoColorUsingOption.value = defaultStrategy.value;
	}
};

let colorTable;

module.go = function() {
	colorTable = {
		admin: {
			color: this.options.adminColor.value,
			hoverColor: this.options.adminColorHover.value,
		},
		firstComment: {
			color: this.options.firstCommentColor.value,
			hoverColor: this.options.firstCommentColorHover.value,
		},
		friend: {
			color: this.options.friendColor.value,
			hoverColor: this.options.friendColorHover.value,
		},
		moderator: {
			color: this.options.modColor.value,
			hoverColor: this.options.modColorHover.value,
		},
		submitter: {
			color: this.options.OPColor.value,
			hoverColor: this.options.OPColorHover.value,
		},
		user: {
			color: UserInfo.module.options.highlightColor.value,
			hoverColor: UserInfo.module.options.highlightColorHover.value,
		},
	};
	if (this.options.highlightFriend.value) {
		highlight('friend');
	}
	if (this.options.highlightOP.value) {
		highlight('submitter');
	}
	if (this.options.highlightMod.value) {
		highlight('moderator');
	}
	if (this.options.highlightAdmin.value) {
		highlight('admin');
	}

	if (this.options.autoColorUsernames.value) {
		watchForElement('newComments', scanPageForNewUsernames);
		watchForElement('siteTable', scanPageForNewUsernames);
		scanPageForNewUsernames();
	}

	if (this.options.highlightFirstCommenter.value) {
		watchForElement('newComments', scanPageForFirstComments);
		scanPageForFirstComments();
	}
};

const firstComments = {};

function scanPageForFirstComments(ele) {
	const comments = ele ? $(ele).closest('.commentarea > .sitetable > .comment') : document.body.querySelectorAll('.commentarea > .sitetable > .comment');

	comments::forEachChunked(element => {
		// Get identifiers
		const idClass = Array.from(element.classList).find(cls => cls.substring(0, 6) === 'id-t1_');

		if (idClass === undefined || firstComments[idClass]) return;
		firstComments[idClass] = true;

		const entry = element.querySelector('.entry');
		const author = entry.querySelector('.author');
		if (!author) return;

		const authorClass = Array.from(author.classList).find(cls => cls.substring(0, 6) === 'id-t2_');

		if (authorClass === undefined) return;

		let container = `.${idClass}`;
		if (module.options.dontHighlightFirstComment.value) {
			container += ' .child';
		}
		highlight('firstComment', authorClass, container);
	});
}

const coloredUsernames = {};

function scanPageForNewUsernames(ele = document.body) {
	const autoColorUsing = getAutoColorUsingFunction(module.options.autoColorUsing.value);
	if (!autoColorUsing) {
		console.error('Could not find a usable autoColorUsing method');
		return;
	}

	const authors = ele.querySelectorAll('.author');
	authors::forEachChunked(element => {
		// Get identifiers
		const idClass = Array.from(element.classList).find(cls => cls.substring(0, 6) === 'id-t2_');

		if (idClass === undefined) return;

		const username = element.textContent;

		if (coloredUsernames[idClass]) return;
		coloredUsernames[idClass] = true;

		const color = autoColorUsing(idClass, element, username);

		// Apply color
		doTextColor(`.${idClass}`, color);
	});
}

const autoColorTemplate = `
	{{selector}} {
		color: {{color}} !important;
	}
	.res-nightmode {{selector}} {
		color: {{nightmodecolor}} !important;
	}
`;

const autoColorUsing = [
	{
		name: 'hash-userid-notbright',
		description: 'Random color, not too bright, consistent for each user; night mode-friendly',
		function(idClass) {
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
	}, {
		name: 'hash-userid',
		description: 'Simple random color, consistent for each user. (original)',
		function(idClass) {
			// Choose color
			let hash = 5381;
			for (const char of idClass) {
				hash = ((hash << 5) + hash) + char.charCodeAt(0); /* hash * 33 + c */
			}

			const r = (hash & 0xFF0000) >> 16;
			const g = (hash & 0x00FF00) >> 8;
			const b = hash & 0x0000FF;
			const color = `rgb(${[r, g, b].join(',')})`;

			return {
				color,
			};
		},
	}, {
		name: 'monochrome',
		description: 'All black or, in night mode, all light gray',
		function() {
			return {
				template: autoColorTemplate,
				color: 'black',
				nightmodecolor: '#ccc',
			};
		},
	},
];

function getAutoColorUsingFunction(name) {
	const strategy = autoColorUsing.find(strategy => strategy.name === name);
	return strategy ? strategy.function : undefined;
}

export function highlightUser(userid) {
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

	for (const key in placeholderValues) {
		if (!placeholderValues.hasOwnProperty(key)) continue;

		const search = new RegExp(`{{${key}}}`, 'g');
		const value = placeholderValues[key];

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
	const options = ['OPColor', 'adminColor', 'friendColor', 'modColor', 'firstCommentColor'];
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
		Alert.open('Some Hover color couldn\'t be generated. This is probably due to the use of color in special format.');
	}
}
