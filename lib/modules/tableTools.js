/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';
import { Table } from '../utils';

export const module: Module<*> = new Module('tableTools');

module.moduleName = 'tableToolsName';
module.category = 'productivityCategory';
module.description = 'tableToolsDesc';
module.options = {
	sort: {
		title: 'tableToolsSortTitle',
		type: 'boolean',
		value: true,
		description: 'tableToolsSortDesc',
		bodyClass: true,
	},
};

module.contentStart = () => {
	if (module.options.sort.value) {
		$(document.body).on('click', '.md th, .Comment th, .Post th', Table.sortByColumn);
	}
};
