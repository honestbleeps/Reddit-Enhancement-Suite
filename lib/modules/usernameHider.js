/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { addCSS, loggedInUser, regexes } from '../utils';
import * as AccountSwitcher from './accountSwitcher';

export const module: Module<*> = new Module('usernameHider');

module.moduleName = 'usernameHiderName';
module.category = 'myAccountCategory';
module.disabledByDefault = true;
module.description = 'usernameHiderDesc';

module.options = {
	displayText: {
		title: 'usernameHiderDisplayTextTitle',
		type: 'text',
		value: '~anonymous~',
		description: 'usernameHiderDisplayTextDesc',
	},
	perAccountDisplayText: {
		title: 'usernameHiderPerAccountDisplayTextTitle',
		type: 'table',
		addRowText: '+add account',
		fields: [{
			key: 'username',
			name: 'username',
			type: 'text',
		}, {
			key: 'displayText',
			name: 'displayText',
			type: 'text',
		}],
		value: ([]: Array<[string, string]>),
		description: 'usernameHiderPerAccountDisplayTextDesc',
	},
	hideAllUsernames: {
		title: 'usernameHiderHideAllUsernamesTitle',
		advanced: true,
		type: 'boolean',
		value: true,
		description: 'usernameHiderHideAllUsernamesDesc',
	},
	hideAccountSwitcherUsernames: {
		title: 'usernameHiderHideAccountSwitcherUsernamesTitle',
		advanced: true,
		type: 'boolean',
		value: true,
		description: 'usernameHiderHideAccountSwitcherUsernamesDesc',
	},
	showUsernameOnHover: {
		title: 'usernameHiderShowUsernameOnHoverTitle',
		type: 'boolean',
		value: false,
		description: 'usernameHiderShowUsernameOnHoverDesc',
	},
};

const substitutes = _.once(() => new Map([
	[(loggedInUser() || '').toLowerCase(), module.options.displayText.value],
	...module.options.perAccountDisplayText.value.map(([username, substitute]) => [username.toLowerCase(), substitute]),
]));

export const getDisplayText = (username: string, alt: string = username): string => substitutes().get(username.toLowerCase()) || alt;

module.contentStart = () => {
	for (const username of new Set([
		loggedInUser(),
		...(module.options.hideAllUsernames.value ? module.options.perAccountDisplayText.value.map(([username]) => username) : []),
		...(module.options.hideAccountSwitcherUsernames.value ? AccountSwitcher.module.options.accounts.value.map(([username]) => username) : []),
	].filter(Boolean)).values()) {
		hideUsername(username, getDisplayText(username, module.options.displayText.value));
	}
};

function hideUsername(user, displayText) {
	if (!displayText || user === displayText) return;

	const userHref = `[href*="/user/${user}"]`;

	// Hide username
	addCSS(`
		p.tagline > a${userHref},
		#header .user > a${userHref},
		.titlebox .tagline a.author${userHref},
		.commentingAsUser a${userHref},
		a.author${userHref},
		.bottom a${userHref} {
			line-height: 0;
			font-size: 0;
		}

		p.tagline > a${userHref}::after,
		#header .user > a${userHref}::after,
		.titlebox .tagline a.author${userHref}::after,
		.commentingAsUser a${userHref}::after,
		a.author${userHref}::after,
		.bottom a${userHref}::after {
			content: "${displayText}";
			letter-spacing: normal;
			font-size: 10px;
			background-color: inherit;
			border-radius: inherit;
			padding: inherit;
		}

		a.author${userHref}::after {
			margin-right: 0.5em;
		}

		.commentingAsUser a${userHref}::after {
			font-size: small;
		}
	`);

	// Show username on hover
	if (module.options.showUsernameOnHover.value) {
		addCSS(`
			p.tagline > a${userHref}:hover,
			#header .user > a${userHref}:hover,
			.titlebox .tagline a.author${userHref}:hover,
			.commentingAsUser a${userHref}:hover,
			a.author${userHref}:hover,
			.bottom a${userHref}:hover {
				line-height: inherit;
				font-size: inherit;
			}

			p.tagline > a${userHref}:hover::after,
			#header .user > a${userHref}:hover::after,
			.titlebox .tagline a.author${userHref}:hover::after,
			.commentingAsUser a${userHref}:hover::after,
			a.author${userHref}:hover::after,
			.bottom a${userHref}:hover::after {
				content: none;
			}
		`);
	}

	const curatedBy: ?HTMLAnchorElement = (document.querySelector('.multi-details > h2 a'): any);
	if (curatedBy) {
		const curatedByUsername = curatedBy.pathname.match(regexes.profile);
		if (curatedByUsername && curatedByUsername[1].toLowerCase() === user.toLowerCase()) {
			curatedBy.textContent = curatedBy.textContent.replace(user, displayText);

			// Show username on hover
			if (module.options.showUsernameOnHover.value) {
				$(curatedBy)
					.on('mouseenter', function() {
						this.textContent = this.textContent.replace(displayText, user);
					})
					.on('mouseleave', function() {
						this.textContent = this.textContent.replace(user, displayText);
					});
			}
		}
	}
}
