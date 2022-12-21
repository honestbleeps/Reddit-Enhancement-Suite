/* @flow */

import { markdown } from 'snudown-js';

import { Module } from '../core/module';

import { watchForThings } from '../utils';

export const module: Module<*> = new Module('myModule');

module.moduleName = 'FixBacktickCodeBlocks'; // add the friendly name to locales/locales/en.js for i18n
module.category = 'browsingCategory'; // categories from locales/locales/en.js
module.description = 'Fix Backtick Code Blocks'; // i18n

// See PageType (utils/location.js) for other page types
module.include = ['comments']; // Optional: defaults to including all pages

module.beforeLoad = () => {
	watchForThings(['post', 'comment', 'message'], rewriteCodeBlocks);
};

function rewriteCodeBlocks(thing) {
	// Find the <div class=md> and prepare to edit it
	const markdownBody = thing.element.querySelector('.md');
	const originalMarkdown: string = markdownBody.textContent;
	// Small optimization? I suspect doing regex splits, then markdown reencoding on every comment will be more taxing than two passes on code comments
	if (!originalMarkdown.includes('```')) {
		return;
	}
	// Magic regex magic from magic people on github
	const reflowedMarkdown = originalMarkdown.replace(
		/```([\s\S]+?)```/gm,
		(_, code) => `\n${code.split('\n').map(l => `    ${l}`).join('\n')}\n`,
	);
	const htmlMarkdown = markdown(reflowedMarkdown);
	markdownBody.innerHTML = htmlMarkdown;
}
