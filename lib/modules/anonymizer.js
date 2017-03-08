/* @flow */

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
};

module.beforeLoad = () => {
	BodyClasses.remove('res-anonymizer');
	addCSS(`
		.res-anonymizer .side,
		.res-anonymizer .pagename,
		.res-anonymizer .domain,
		.res-anonymizer .commentingAsUser,
		.res-anonymizer .user,
		.res-anonymizer .flair,
		.res-anonymizer .RESUserTag,
		.res-anonymizer .userattrs,
		.res-anonymizer #sr-header-area {
			opacity: 0 !important;
		}
	`);
	setUserColor('', '', '#3399cc');
};

module.go = () => {
	createAnonymizerSwitch();
};

let $anonymizerSwitch;
let anonymizerOn = false;
let isInitialized = false;
let subredditStyle;
const visitedUsers = new Map();
const roles = ['submitter', 'admin', 'moderator'];

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
		for (const thing of Thing.things()) {
			if (thing.isPost() || thing.isComment() || thing.isMessage()) {
				updateNewUsernames(thing);
			}
		}
		watchForThings(['post', 'comment', 'message'], updateNewUsernames, { immediate: true });
		isInitialized = true;
	}
	if (currentSubreddit()) {
		subredditStyle = await StyleTweaks.getSubredditStyleToggle();
		if (!subredditStyle) {
			StyleTweaks.toggleSubredditStyle(false);
		}
	}
}

function undoAnonymize() {
	BodyClasses.remove('res-anonymizer');
	if (!subredditStyle) {
		StyleTweaks.toggleSubredditStyle(true);
	}
}

function updateNewUsernames(thing) {
	const element = thing.getAuthorElement();
	if (!element) return;

	const idClass = Array.from(element.classList).find(cls => cls.startsWith('id-t2_'));

	if (idClass) {
		const role = roles.filter(r => element.classList.contains(r))[0];
		if (visitedUsers.has(idClass)) {
			if (role && visitedUsers.get(idClass).role !== role) {
				visitedUsers.get(idClass).css.forEach(css => { css.remove(); });
				visitedUsers.delete(idClass);
			} else {
				return;
			}
		}
		const colorData = colorMap(idClass, role);
		console.log(`${idClass} => ${thing.getAuthor()} | ${colorData.color}`);
		const css = [];
		if (colorData.color) {
			css.push(setUserColor(`.${idClass}`, thing.getAuthor(), colorData.color));
		}
		if (colorData.nightmodeColor) {
			css.push(setUserColor(`.${idClass}`, thing.getAuthor(), colorData.nightmodeColor, '.res-nightmode'));
		}
		visitedUsers.set(idClass, { role, css });
	}
}

function setUserColor(idClass, username, color, container = '') {
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
			background-color: ${generateHoverColor(color)} !important;
			text-decoration: none !important;
		}	
	`;
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

function colorMap(idClass, role) {
	switch (role) {
		case 'submitter':
			return {
				color: '#0055DF',
			};
		case 'admin':
			return {
				color: '#FF0011',
			};
		case 'moderator':
			return {
				color: '#228822',
			};
		default:
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
