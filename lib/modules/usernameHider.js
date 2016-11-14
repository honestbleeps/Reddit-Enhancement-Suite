import _ from 'lodash';
import { $ } from '../vendor';
import { addCSS, loggedInUser, regexes } from '../utils';
import * as AccountSwitcher from './accountSwitcher';

export const module = {};

module.moduleID = 'usernameHider';
module.moduleName = 'usernameHiderName';
module.category = 'myAccountCategory';
module.disabledByDefault = true;
module.description = 'usernameHiderDesc';

module.options = {
	displayText: {
		type: 'text',
		value: '~anonymous~',
		description: 'What to replace your username with. Default is ~anonymous~.',
	},
	perAccountDisplayText: {
		type: 'table',
		addRowText: '+add account',
		fields: [{
			name: 'username',
			type: 'text',
		}, {
			name: 'displayText',
			type: 'text',
		}],
		value: [],
		description: 'Allows you to specify the display text for a specific account. (useful in conjunction with the Account Switcher!)',
	},
	hideAllUsernames: {
		advanced: true,
		type: 'boolean',
		value: true,
		description: 'Hide all accounts listed in perAccountDisplayText, not just the logged-in user.',
	},
	hideAccountSwitcherUsernames: {
		advanced: true,
		type: 'boolean',
		value: true,
		description: `
			Hide all accounts listed in Account Switcher. <br>
			If an username isn't already listed in perAccountDisplayText, then hide that username with the default displayText.
		`,
	},
	showUsernameOnHover: {
		type: 'boolean',
		value: false,
		description: `
			Mousing over the text hiding your username reveals your real username.<br>
			This makes it easy to double check that you're commenting/posting from the correct account,
			while still keeping your username hidden from prying eyes.
		`,
	},
};

module.go = () => {
	hideUsernames();
};

export function getDisplayText(username) {
	const accounts = module.options.perAccountDisplayText.value;
	if (!username) {
		username = loggedInUser();
	}

	let displayText;
	if (username && accounts) {
		username = username.toLowerCase();

		[, displayText] = accounts.find(([user]) => user.toLowerCase() === username) || [];
	}

	if (!displayText) {
		displayText = module.options.displayText.value ||
			module.options.displayText.default;
	}

	return displayText;
}

function hideUsernames() {
	hideUsername();
	if (module.options.hideAllUsernames.value) {
		hideAllUsernames();
	}
	if (module.options.hideAccountSwitcherUsernames.value) {
		hideAccountSwitcherUsernames();
	}
}

function hideAllUsernames() {
	for (const [username] of module.options.perAccountDisplayText.value) {
		hideUsername(username);
	}
}

function hideAccountSwitcherUsernames() {
	const accounts = AccountSwitcher.module.options.accounts.value;
	if (accounts) {
		for (const [username] of accounts) {
			hideUsername(username);
		}
	}
}

const hideUsername = _.memoize((user = loggedInUser()) => {
	if (!user) return;

	const curatedBy = document.querySelector('.multi-details > h2 a');
	const displayText = getDisplayText(user);

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
}, (user = loggedInUser()) => user && user.toLowerCase());
