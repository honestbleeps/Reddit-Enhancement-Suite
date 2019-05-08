/* @flow */

import { Module } from '../core/module';
import { i18n, openNewTab } from '../environment';
import { string } from '../utils';
import * as Menu from './menu';

export const module: Module<*> = new Module('contribute');

module.moduleName = 'contributeName';
module.category = 'aboutCategory';
module.sort = -9;
module.alwaysEnabled = true;
module.description = 'contributeDesc';

module.contentStart = () => {
	Menu.addMenuItem(
		() => string.html`<span>${i18n('donateToRES')} &#8679;</span>`,
		() => { openNewTab('https://redditenhancementsuite.com/contribute/'); }
	);
};
