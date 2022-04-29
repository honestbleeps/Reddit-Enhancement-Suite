/* @flow */

import hljs from 'highlight.js';
import { Module } from '../core/module';

export const module: Module<*> = new Module('syntaxHighlighting');

module.moduleName = 'syntaxHighlightingName';
module.category = 'appearanceCategory';
module.description = 'syntaxHighlightingDesc';
module.disabledByDefault = false;

module.contentStart = () => {
	hljs.highlightAll();
};