/* @flow */
// $FlowIgnore Highlight.js is a large dependency and as such needs to be lazy loaded.
import 'file-loader?name=highlight.min.js!../../node_modules/@highlightjs/cdn-assets/highlight.js';// eslint-disable-line import/no-extraneous-dependencies
/* global hljs:readonly */
/*:: import hljs from 'highlight.js' */

import { Module } from '../core/module';
import { loadScript } from '../environment';
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
