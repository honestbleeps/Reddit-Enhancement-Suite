/* @flow */

import hljs from 'highlight.js';
import { Module } from '../core/module';

export const module: Module<*> = new Module('syntaxHighlighting');

module.moduleName = 'syntaxHighlightingName';
module.category = 'appearanceCategory';
module.description = 'syntaxHighlightingDesc';
module.options = {
	auto: {
		title: 'syntaxHighlightingEnableTitle',
		type: 'boolean',
		value: true,
		description: 'syntaxHighlightingEnableDesc',
		bodyClass: true,
	},
};

module.contentStart = () => {
	if (module.options.auto.value) {
		hljs.highlightAll();
	}
};
