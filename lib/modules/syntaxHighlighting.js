/* @flow */

import 'file-loader?name=highlight.min.js!../../node_modules/@highlightjs/cdn-assets/build/highlight.min.js'
import { Module } from '../core/module';
import { watchForElements } from '../utils';

export const module: Module<*> = new Module('syntaxHighlighting');

module.moduleName = 'syntaxHighlightingName';
module.category = 'appearanceCategory';
module.description = 'syntaxHighlightingDesc';
module.disabledByDefault = false;

module.beforeLoad = () => {
	watchForElements(['selfText', 'page'], 'pre code', highlight);
};

function highlight(thing) {
	loadScript('/highlight.min.js').then(() => {
		hljs.highlightElement(thing);
	});
}
