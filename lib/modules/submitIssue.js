/* @flow */

import _ from 'lodash';
import submitIssueDefaultBodyTemplate from '../templates/submitIssueDefaultBody.mustache';
import submitWizardTemplate from '../templates/submitWizard.mustache';
import diagnosticsTemplate from '../templates/diagnostics.mustache';
import * as Metadata from '../core/metadata';
import { $, guiders } from '../vendor';
import { Module } from '../core/module';
import { BrowserDetect } from '../utils';
import { ajax } from '../environment';
import type { RedditWikiPage } from '../types/reddit';
import * as NightMode from './nightMode';

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
	if (subredditInput) {
		let $submittingToEnhancement;

		function check() {
			const subreddit = subredditInput.value;
			const title: HTMLTextAreaElement = (document.querySelector('textarea[name=title]'): any);
			const $selfText = $('.usertext-edit textarea');

			if (subreddits.includes(subreddit.toLowerCase())) {
				$submittingToEnhancement = createAndAddWizard();
			} else {
				if ($submittingToEnhancement) {
					$submittingToEnhancement.remove();
					if (title.value === 'Submitting a bug? Please read the box above...') {
						title.value = '';
					}
				}

				if (subredditsForDiagnostics.includes(subreddit.toLowerCase())) {
					$selfText.val(diagnostics());
				} else {
					if ($selfText.val() === diagnostics()) {
						$selfText.val('');
					}
				}
			}
		}

		check();

		subredditInput.addEventListener('change', e => {
			if (e.res) return;
			check();
		});
	}
}

function createAndAddWizard() {
	const title: HTMLTextAreaElement = (document.querySelector('textarea[name=title]'): any);

	const $wizard = $('<div>', { id: 'submittingToEnhancement', class: 'RESDialogSmall' })
		.html(submitWizardTemplate({ foolin: foolin() }))
		.on('click', '#RESSubmitBug', () => {
			$('#RESSubmitOptions').fadeOut(async () => {
				$('#RESBugReport').fadeIn();
				const { data } = (await ajax({
					url: '/r/Enhancement/wiki/knownbugs.json',
					type: 'json',
				}): RedditWikiPage);

				if (data && data.content_md) {
					const objects = parseObjectList(data.content_md);
					const listItems = createLinkList(objects);
					$('#RESKnownBugs')
						.empty()
						.append(listItems);
				}
			});
		})
		.on('click', '#RESSubmitFeatureRequest', () => {
			$('#RESSubmitOptions').fadeOut(async () => {
				$('#RESFeatureRequest').fadeIn();
				const { data } = (await ajax({
					url: '/r/Enhancement/wiki/knownrequests.json',
					type: 'json',
				}): RedditWikiPage);

				if (data && data.content_md) {
					const objects = parseObjectList(data.content_md);
					const listItems = createLinkList(objects);
					$('#RESKnownFeatureRequests')
						.empty()
						.append(listItems);
				}
			});
		})
		.on('click', '#submittingBug', () => {
			updateSubreddit('RESIssues');
			$('li a.text-button').click();
			$('#submittingToEnhancement').fadeOut();

			const body = (submitIssueDefaultBodyTemplate() + diagnostics()).trim();

			$('.usertext-edit textarea').val(body);

			title.value = '[bug]  ???';

			const guiderText = `
				<p>Summarize your problem in the title and add details in the text:</p>
				<dl>
					<dt>Screenshots!</dt> <dd>A picture is worth a thousand words.</dd>
					<dt>What makes this happen?</dt> <dd>clicked a link, clicked a button, opened an image expando, ... </dd>
					<dt>Where does this happen?</dt> <dd>in a particular subreddit, on comments posts, on frontpage (reddit.com), on /r/all, ...</dd>
				</dl>
				<p>More detail means faster fixes.  Thanks!</p>
			`;
			const buttons = `
				<footer>
					<small>
						<a href="/r/RESissues/wiki/knownissues">known issues</a>
						|  <a href="/r/RESissues/wiki/postanissue">troubleshooting</a>
					</small>
				</footer>
			`;

			guiders.createGuider({
				attachTo: '#title-field',
				description: guiderText,
				buttonCustomHTML: buttons,
				id: 'first',
				next: 'second',
				// offset: { left: -200, top: 120 },
				position: 3,
				title: 'Please fill out all the ??? questions',
			}).show();
		})
		.on('click', '#submittingFeature', () => {
			updateSubreddit('Enhancement');
			$('#submittingToEnhancement').fadeOut();
			title.value = '[feature request]    ???';
		})
		.on('click', '#RESSubmitOther', () => {
			updateSubreddit('Enhancement');
			$('#submittingToEnhancement').fadeOut();
			title.value = '';
		});


	$wizard.insertAfter('#text-desc');
	$wizard.fadeIn();

	return $wizard;
}

function updateSubreddit(subreddit) {
	const input: HTMLInputElement = (document.querySelector('#sr-autocomplete'): any);
	input.value = subreddit;
	const e = new Event('change');
	(e: any).res = true;
	input.dispatchEvent(e);
}

function parseObjectList(text) {
	const bugs = text.split('---');

	if (bugs && bugs[0].length === 0) {
		bugs.shift();
	}

	return bugs.map(bugText => {
		const bugObj = {};
		const bugData = bugText.replace(/\r/g, '').split('\n');

		for (const rawLine of bugData) {
			const line = $.trim(rawLine).split(':');
			if (line.length > 0) {
				const key = line.shift();
				if (key) {
					bugObj[key] = line.join(':');
				}
			}
		}

		return bugObj;
	});
}

function createLinkList(objects) {
	return objects.map(bugObj => {
		if (bugObj.title) {
			const $bugLI = $('<li>');
			if (bugObj.url) {
				const $bugHTML = $('<a target="_blank" rel="noopener noreferer">');
				$bugHTML.attr('href', bugObj.url).text(bugObj.title);
				$bugLI.append($bugHTML);
			} else {
				$bugLI.text(bugObj.title);
			}
			return $bugLI;
		}
	});
}

function foolin() {
	const now = new Date();
	return (
		(now.getMonth() === 2 && now.getDate() > 30) ||
		(now.getMonth() === 3 && now.getDate() <= 2)
	);
}
