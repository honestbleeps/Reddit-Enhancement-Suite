/* @flow */

import { Module } from '../core/module';
import { Redirection } from '../environment';
import { isEnabled } from '../core/modules';

export const module: Module<*> = new Module('redirect');

module.moduleName = 'redirectName';
module.category = 'usersCategory';
module.description = 'redirectDesc';
module.disabledByDefault = true;
module.keywords = ['redirect'];
module.permissions = {
	requiredPermissions: ['webRequestBlocking'],
};

module.options = {
	fromHomePage: {
		title: 'redirectFromHomePageTitle',
		description: 'redirectFromHomePageDesc',
		keywords: ['logo', 'homepage'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'Regular Reddit',
			value: 'www',
		}, {
			name: 'No-Participation Reddit',
			value: 'np',
		}, {
			name: 'Old Reddit',
			value: 'old',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromHomePage: {
		dependsOn: options => options.fromHomePage.value === 'custom',
		title: 'redirectCustomFromHomePageTitle',
		description: 'redirectCustomFromHomePageDesc',
		type: 'text',
		value: '',
	},
	fromProfileLandingPage: {
		title: 'redirectFromProfileLandingPageTitle',
		description: 'redirectFromProfileLandingPageDesc',
		keywords: ['legacy', 'overview'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'Overview (legacy)',
			value: 'overview',
		}, {
			name: 'Comments',
			value: 'comments',
		}, {
			name: 'Submitted (legacy)',
			value: 'submitted',
		}, {
			name: 'Gilded',
			value: 'gilded',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromProfileLandingPage: {
		dependsOn: options => options.fromProfileLandingPage.value === 'custom',
		title: 'redirectCustomFromProfileLandingPageTitle',
		description: 'redirectCustomFromProfileLandingPageDesc',
		type: 'text',
		value: '',
	},
	fromSubredditFrontPage: {
		title: 'redirectFromSubredditFrontPageTitle',
		description: 'redirectFromSubredditFrontPageDesc',
		keywords: ['subreddit', 'front'],
		type: 'enum',
		value: 'none',
		values: [{
			name: 'Do nothing',
			value: 'none',
		}, {
			name: 'New',
			value: 'new',
		}, {
			name: 'Rising',
			value: 'rising',
		}, {
			name: 'Controversial',
			value: 'controversial',
		}, {
			name: 'Top',
			value: 'top',
		}, {
			name: 'Gilded',
			value: 'gilded',
		}, {
			name: 'Wiki',
			value: 'wiki',
		}, {
			name: 'Custom',
			value: 'custom',
		}],
	},
	customFromSubredditFrontPage: {
		dependsOn: options => options.fromSubredditFrontPage.value === 'custom',
		title: 'redirectCustomFromSubredditFrontPageTitle',
		description: 'redirectCustomFromSubredditFrontPageDesc',
		type: 'text',
		value: '',
	},
};

module.onToggle = () => updateRedirectBackgroundState(['home', 'profile', 'subreddit']);

module.onSaveSettings = changedSettings => {
	const changedRuleNames = [];

	if (Reflect.has(changedSettings, 'fromHomePage') || Reflect.has(changedSettings, 'customFromHomePage')) {
		changedRuleNames.push('home');
	}

	if (Reflect.has(changedSettings, 'fromProfileLandingPage') || Reflect.has(changedSettings, 'customFromProfileLandingPage')) {
		changedRuleNames.push('profile');
	}

	if (Reflect.has(changedSettings, 'fromSubredditFrontPage') || Reflect.has(changedSettings, 'customFromSubredditFrontPage')) {
		changedRuleNames.push('subreddit');
	}

	updateRedirectBackgroundState(changedRuleNames);
};

function updateRedirectBackgroundState(ruleNames) {
	const rules = [];

	if (ruleNames.includes('home')) rules.push(createHomeRedirectRule());
	if (ruleNames.includes('profile')) rules.push(createProfileRedirectRule());
	if (ruleNames.includes('subreddit')) rules.push(createSubredditRedirectRule());

	Redirection.updateRedirectBackgroundState(rules);
}

function createHomeRedirectRule() {
	const moduleIsEnabled = isEnabled(module);
	const { fromHomePage: main, customFromHomePage: custom } = module.options;
	const optVal = getValueFromMainAndCustomOpts(main, custom);

	let redirectTo;
	if (!moduleIsEnabled || optVal === 'none') redirectTo = null;
	else if (main.value === 'custom') redirectTo = optVal;
	else redirectTo = `https://${optVal}.reddit.com/`;

	return {
		name: 'home',
		// TODO: this rule should apply on logo click, no matter the current subdomain
		from: (/^https:\/\/www\.reddit\.com\/?$/i).toString(),
		fromType: 'abs',
		to: redirectTo,
	};
}

function createProfileRedirectRule() {
	const moduleIsEnabled = isEnabled(module);
	const { fromProfileLandingPage: main, customFromProfileLandingPage: custom } = module.options;
	const optVal = getValueFromMainAndCustomOpts(main, custom);

	let redirectTo;
	if (!moduleIsEnabled || optVal === 'none') redirectTo = null;
	else if (main.value === 'custom') redirectTo = `/user/$1/${optVal}`;
	else redirectTo = `/user/$1/${optVal}`;

	return {
		name: 'profile',
		from: (/^\/user\/([\w-]+)\/?$/i).toString(),
		fromType: 'rel',
		to: redirectTo,
	};
}

function createSubredditRedirectRule() {
	const moduleIsEnabled = isEnabled(module);
	const { fromSubredditFrontPage: main, customFromSubredditFrontPage: custom } = module.options;
	const optVal = getValueFromMainAndCustomOpts(main, custom);

	let redirectTo;
	if (!moduleIsEnabled || optVal === 'none') redirectTo = null;
	else if (main.value === 'custom') redirectTo = `/r/$1/${optVal}`;
	else redirectTo = `/r/$1/${optVal}`;

	return {
		name: 'subreddit',
		from: (/^\/r\/(\w+)\/?$/i).toString(),
		fromType: 'rel',
		to: redirectTo,
	};
}

function getValueFromMainAndCustomOpts(main, custom) {
	return main.value === 'custom' ? custom.value : main.value;
}
