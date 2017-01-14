/* @flow */

import contributeTemplate from '../templates/contributePanel.mustache';
import { Module } from '../core/module';
import { openNewTab } from '../environment';
import * as Menu from './menu';

export const module: Module<*> = new Module('contribute');

module.moduleName = 'contributeName';
module.category = 'aboutCategory';
module.sort = -9;
module.alwaysEnabled = true;
module.description = contributeTemplate();

module.go = () => {
	Menu.addMenuItem(
		'<div class="RES-donate">donate to RES &#8679;</div>',
		() => { openNewTab('https://redditenhancementsuite.com/contribute/'); }
	);
};
