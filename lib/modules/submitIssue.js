/* @flow */

import _ from 'lodash';
import * as Metadata from '../core/metadata';
import { $, guiders } from '../vendor';
import { Module } from '../core/module';
import { BrowserDetect, regexes, string } from '../utils';
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

const submitWizardTemplate = ({ foolin, settings, bugs, requests }) => string.html`
	<div>
		${foolin && string._html(`
			<h2>Enjoy April Fool's</h2>
			<p>RES can't turn off any of Reddit's shenanigans. However, <a href="/r/Enhancement/wiki/faq/srstyle" target="_blank" rel="noopener noreferer">you can turn off subreddit styles</a>.</p>
		`)}
	
		<h2>Something is broken in RES. How do I fix it?</h2>
		
		<p>Take a minute to read through other posts. Someone might have already posted a solution.</p>
		
		<ol id="RESKnownBugs">
			${bugs.map(({ url, title }) => string._html`
				<li>
					<a target="_blank" rel="noopener noreferer" href="${url}">${title}</a>
				</li>
			`)}
		</ol>
		
		<p><a href="/r/RESissues/submit/" class="blueButton">Ask how to fix RES</a></p>
		
		<p>Please write some text about:</p>
		<dl>
		
			<dt>What makes this happen?</dt>
			<dd>
				clicking a button, opening an image preview, ...
			</dd>
		
		
			<dt>Where does this happen?</dt>
			<dd>
				in a particular subreddit, on comments pages, on frontpage (reddit.com), on /r/all, ...
			</dd>
		
			<dt>Screenshot/video of problem</dt>
			<dd>
				<a href="https://www.take-a-screenshot.org/" target="_blank" rel="noreferer noopener">Take a screenshot</a>, <a href="https://imgur.com/upload">upload it</a>, and copy-paste the link here.
			</dd>
		</dl>
		
		
		<h2>How do I customize or use RES features?</h2>
		<p>If you want to disable certain features of RES, try searching in <a href="${settings}">RES settings</a>, your account's <a href="/prefs">reddit preferences</a>, or <a href="/r/Enhancement/search?q=restrict_sr=on">posts in r/Enhancement</a>.</p>
		
		<p><a href="/r/Enhancement/submit/" class="blueButton">Get guidance on using RES</a></p>
		
		
		<h2>I have a suggestion.</h2>
		
		<p>Look for similar ideas before posting:</p>
		<ol id="RESKnownFeatureRequests">
			${requests.map(({ url, title }) => string._html`
				<li>
					<a target="_blank" rel="noopener noreferer" href="${url}">${title}</a>
				</li>
			`)}
		</ol>
		<p><a href="/r/Enhancement/submit/" class="blueButton">Post a request</a></p>
		
		
		<h2>I found a security issue.</h2>
		<p>Please report security issues privately using modmail.</p>
		<p><a href="/message/compose/?to=/r/Enhancement" class="blueButton">Report a security issue</a></p>
	</div>
`;

const submitIssueDefaultBody = `
*What's up?*
???


*Where does it happen?*
???


*Screenshots or mock-ups*
???


*What browser extensions are installed?*
???
`.trim();

const diagnostics = _.once(() => `

- Night mode: ${String(NightMode.isNightModeOn())}
- RES Version: ${Metadata.version}
- Browser: ${BrowserDetect.browser}
- Browser Version: ${BrowserDetect.version}
- Cookies Enabled: ${String(navigator.cookieEnabled)}
- Reddit beta: ${String($('.beta-hint').length > 0)}

`);

function checkIfSubmitting() {
	const subredditInput: ?HTMLInputElement = (document.getElementById('sr-autocomplete'): any);
	const selfText: ?HTMLTextAreaElement = (document.querySelector('.usertext-edit textarea'): any);

	if (subredditInput) {
		function check() {
			const subreddit = subredditInput.value;

			if (subreddits.includes(subreddit.toLowerCase())) {
				showWizard();
				injectTemplate(selfText);
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
					$(selfText).trigger('input');
				}
			} else {
				selfText.value = selfText.value.replace(diagnostics(), '');
				$(selfText).trigger('input');
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

function injectTemplate(selfText) {
	if (selfText && !selfText.value) {
		selfText.value = submitIssueDefaultBody;
	}
}

async function wizard() {
	const [bugs, requests] = await Promise.all([
		fetchLinks('/r/Enhancement/wiki/knownbugs.json'),
		fetchLinks('/r/Enhancement/wiki/knownrequests.json'),
	]);

	return submitWizardTemplate({
		foolin: foolin(),
		bugs,
		requests,
		settings: SettingsNavigation.makeUrlHash(),
	});
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

	$(document.body).on('click', '#RESSubmitWizard a[href$="/submit/"]', (e: Event) => {
		const match = (e.target: any).pathname.match(regexes.submit);
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

async function fetchLinks(url) {
	try {
		const { data } = (await ajax({ url, type: 'json' }): RedditWikiPage);
		return parseObjectList(data && data.content_md);
	} catch (e) {
		return [];
	}
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
