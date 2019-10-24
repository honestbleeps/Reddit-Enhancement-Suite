/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';
import { downcast, isCurrentSubreddit } from '../utils';

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

module.shouldRun = () => !isCurrentSubreddit('dashboard');

module.contentStart = () => {
	if (module.options.sort.value) {
		$(document).on('click', '.md th, .Comment th, .Post th', sortTableColumn);
	}
};

const sortedTables = new WeakMap();

function sortTableColumn({ target: sortColumn }: MouseEvent) {
	const table = downcast(sortColumn.closest('table'), HTMLTableElement);
	const tbody = table.querySelector('tbody');
	const columns = Array.from(table.querySelectorAll('thead th'));
	const rows = Array.from(tbody.querySelectorAll('tr'));

	const lastSortedColumn = sortedTables.get(table);
	if (lastSortedColumn === sortColumn) {
		rows.reverse();

		sortColumn.classList.toggle('sort-asc');
		sortColumn.classList.toggle('sort-desc');
	} else {
		const index = columns.indexOf(sortColumn);
		const getCellValue = row => row.querySelectorAll('td')[index].textContent;
		rows.sort((rowA, rowB) => getCellValue(rowA).localeCompare(getCellValue(rowB), undefined, { numeric: true }));

		if (lastSortedColumn) lastSortedColumn.classList.remove('sort-asc');
		if (lastSortedColumn) lastSortedColumn.classList.remove('sort-desc');
		sortColumn.classList.add('sort-asc');
	}

	sortedTables.set(table, sortColumn);

	tbody.append(...rows);
}
