/* @flow */

import { Module } from '../core/module';
import { i18n, openNewTab } from '../environment';
import * as Menu from './menu';

export const module: Module<*> = new Module('contribute');

module.moduleName = 'contributeName';
module.category = 'aboutCategory';
module.sort = -9;
module.alwaysEnabled = true;
module.description = 'contributeDesc';

module.go = () => {
	Menu.addMenuItem(
		`<div class="RES-donate">${i18n('donateToRES')} &#8679;</div>`,
		() => { openNewTab('https://redditenhancementsuite.com/contribute/'); }
	);
};
