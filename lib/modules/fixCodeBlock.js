/* @flow */

import { markdown } from 'snudown-js';

import { Module } from '../core/module';

import { watchForThings, regexes } from '../utils';

import { ajax } from '../environment';

export const module: Module<*> = new Module('fixBacktickCodeBlocks');

module.moduleName = 'fixBacktickCodeBlocks'; // add the friendly name to locales/locales/en.js for i18n
module.category = 'browsingCategory'; // categories from locales/locales/en.js
module.description = 'Fix Backtick Code Blocks'; // i18n

module.beforeLoad = () => {
	watchForThings(['post', 'comment', 'message'], rewriteCodeBlocks);
};

async function rewriteCodeBlocks(thing) {
	const path = thing.element.getAttribute('data-permalink');
	// Find the <div class=md> and prepare to edit it
	const markdownBody = thing.element.querySelector('.md');
	if (!markdownBody) {
		return;
	}
	const originalMarkdown: string = markdownBody.textContent;
	if (!originalMarkdown.includes('```')) {
		return;
	}
	// Ideally, you would parse something (innerHTML?) and not have to go through the network at all.
	// Now that we have the response, we can fix triple backticks
	let sourceText;

	// Code copied from sourceSnudown module
	const response = await ajax({
		url: `${path}.json`,
		query: { raw_json: 1 },
		type: 'json',
	});

	if (regexes.commentPermalink.test(path)) {
		sourceText = response[1].data.children[0].data.body;
	} else if (regexes.comments.test(path)) {
		sourceText = response[0].data.children[0].data.selftext;
	} else {
		const postId: string = ((/\/(\w*)\/?$/).exec(path): any)[1];
		const data = response.data.children[0].data;
		if (data.id === postId) {
			sourceText = data.body;
		} else {
			// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
			// So, we have to dig into the replies to find the message we want.
			sourceText = data.replies.data.children.find(({ data: { id } }) => id === postId).data.body;
		}
	}

	// Magic regex magic from magic people on github
	const reflowedMarkdown = sourceText.replace(
		/```([\s\S]+?)```/gm,
		(_, code) => `\n${code.split('\n').map(l => `    ${l}`).join('\n')}\n`,
	);
	const htmlMarkdown = markdown(reflowedMarkdown);
	markdownBody.innerHTML = htmlMarkdown;
}
