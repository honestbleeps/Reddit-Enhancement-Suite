/* @flow */

import hljs from 'highlight.js';
import { Module } from '../core/module';
import { watchForThings } from '../utils';

export const module: Module<*> = new Module('syntaxHighlighting');

module.moduleName = 'syntaxHighlightingName';
module.category = 'appearanceCategory';
module.description = 'syntaxHighlightingDesc';
module.disabledByDefault = false;

module.beforeLoad = () => {
	watchForElements(['selfText'], null, ele => hljs.highlightElement(ele));
	watchForThings(['comment', 'message'], thing => hljs.highlightElement(thing.entry));
};
