/* @flow */

import _ from 'lodash';
import submitIssueDefaultBodyTemplate from '../templates/submitIssueDefaultBody.mustache';
import submitWizardTemplate from '../templates/submitWizard.mustache';
import diagnosticsTemplate from '../templates/diagnostics.mustache';
import * as Metadata from '../core/metadata';
import { $, guiders } from '../vendor';
import { Module } from '../core/module';
import { BrowserDetect, regexes } from '../utils';
import { ajax } from '../environment';
import type { RedditWikiPage } from '../types/reddit';
import * as NightMode from './nightMode';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('submitIssue');

module.moduleName = 'submitIssueName';
module.category = 'aboutCategory';
module.alwaysEnabled = true;
module.sort = -7;

module.description = 'If you have any problems with RES, visit <a href="/r/RESissues">/r/RESissues</a>. If you have any requests or questions, visit <a href="/r/Enhancement">/r/Enhancement</a>.';
module.include = ['submit'];

const subreddits = ['enhancement', 'resissues'];
const subredditsForDiagnostics = ['beta', 'help', 'resbetatesting'];

module.go = () => {
	checkIfSubmitting();
};

const diagnostics = _.once(() => diagnosticsTemplate({
	nightMode: NightMode.isNightModeOn(),
	version: Metadata.version,
	browser: BrowserDetect.browser,
	browserVersion: BrowserDetect.version,
	cookies: navigator.cookieEnabled,
	beta: $('.beta-hint').length > 0,
}));


function checkIfSubmitting() {
	const subredditInput: ?HTMLInputElement = (document.getElementById('sr-autocomplete'): any);
	const selfText: ?HTMLTextAreaElement = (document.querySelector('.usertext-edit textarea'): any);

	if (subredditInput) {
		function check() {
			const subreddit = subredditInput.value;

			if (subreddits.includes(subreddit.toLowerCase())) {
				showWizard();
				if (!selfText.value) {
					injectTemplate();
				}
			} else {
				hideWizard();
				// User can be smart about clearing the template on their own
			}
		}

		check();

		subredditInput.addEventListener('change', e => {
			if (e.res) return;
			check();
		});
		// don't delegate, reddit cancels bubbling
		// wait a moment, reddit loads some metadata
		// really this should be a MutationObserver on subredditInput
		$('#suggested-reddits .sr-suggestion').on('click', () => setTimeout(check, 500));
	}

	if (selfText && subredditInput) {
		$(selfText).add(subredditInput).on('blur', () => {
			const subreddit = subredditInput.value;
			if ([...subreddits, ...subredditsForDiagnostics].includes(subreddit.toLowerCase())) {
				const diagnosticsStripped = diagnostics().replace(/\s/g, '');
				const selfTextStripped = selfText.value.replace(/\s/g, '');
				if (!selfTextStripped.includes(diagnosticsStripped)) {
					selfText.value += diagnostics();
				}
			} else {
				selfText.value = selfText.value.replace(diagnostics(), '');
			}
		});
	}
}


function updateSubreddit(subreddit) {
	const input: HTMLInputElement = (document.querySelector('#sr-autocomplete'): any);
	input.value = subreddit;
	const e = new Event('change');
	(e: any).res = true;
	input.dispatchEvent(e);
}

function injectTemplate() {
	const selfText: ?HTMLTextAreaElement = (document.querySelector('.usertext-edit textarea'): any);
	if (selfText && !selfText.value) {
		selfText.value = submitIssueDefaultBodyTemplate();
	}
}

function wizard() {
	return Promise.all([
		fetchLinks('/r/Enhancement/wiki/knownbugs.json'),
		fetchLinks('/r/Enhancement/wiki/knownrequests.json'),
	]).then(([bugs, requests]) => submitWizardTemplate({
		foolin: foolin(),
		bugs,
		requests,
		settings: SettingsNavigation.makeUrlHash(),
	}));
}

const guiderId = 'RESSubmitWizard';
async function showWizard() {
	const guider = guiders.get(guiderId);
	if (guider) {
		guiders.show(guider.id);
		return;
	}

	const description = await wizard();

	const buttonCustomHTML = `
		<footer>
			<small>
				<a href="/r/RESissues/wiki/knownissues">known issues</a>
				|  <a href="/r/RESissues/wiki/postanissue">troubleshooting</a>
			</small>
		</footer>
	`;

	guiders.createGuider({
		attachTo: '.submit .usertext',
		description,
		buttonCustomHTML,
		id: guiderId,
		// offset: { left: -200, top: 120 },
		position: 3,
		title: 'What are you posting about?',
	}).show();

	$(document.body).on('click', '#RESSubmitWizard a[href$="/submit/"]', e => {
		const match = e.target.pathname.match(regexes.submit);
		if (!match) return;
		updateSubreddit(match[1]);
		e.preventDefault();
	});
}

function hideWizard() {
	if (guiders.get(guiderId)) {
		// Why is there no `guiders.hide(id)`
		guiders.hideAll();
	}
}

function fetchLinks(url) {
	return (ajax({
		url,
		type: 'json',
	}): RedditWikiPage)
	.then(({ data }) => parseObjectList(data && data.content_md))
	.catch(() => []);
}

function parseObjectList(text) {
	if (!text) {
		return [];
	}

	const items = text.split(/\s*-{3,}\s*/).filter(x => x.match(/[^\s\n]/));

	return items.map(dictText => {
		const item = {};
		const dictMapping = dictText.replace(/\r/g, '').split('\n');

		for (const rawLine of dictMapping) {
			const line = $.trim(rawLine).split(':');
			if (line.length > 0) {
				const key = line.shift();
				if (key) {
					item[key] = line.join(':');
				}
			}
		}

		return item;
	});
}

function foolin() {
	const now = new Date();
	return (
		(now.getMonth() === 2 && now.getDate() > 30) ||
		(now.getMonth() === 3 && now.getDate() <= 2)
	);
}
