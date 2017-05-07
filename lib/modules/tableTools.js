/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import { isCurrentSubreddit } from '../utils';

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

module.go = () => {
	if (module.options.sort.value) {
		$(document).on('click', '.md th', (e: Event) => sortTableColumn(e.currentTarget));
	}
};

// Add sorting to a column
function sortTableColumn(target) {
	const $columnHeader = $(target);
	const table = $columnHeader.closest('table');
	const rows = table.find('tr:gt(0)').toArray();
	const column = $columnHeader.index();

	rows.sort(sortFunction(column));
	$columnHeader.siblings().removeClass('sort-desc sort-asc');
	if ($columnHeader.hasClass('sort-asc')) {
		// Sort asc. leave the rows in the order they are
		rows.reverse();
		$columnHeader.removeClass('sort-asc');
		$columnHeader.addClass('sort-desc');
	} else {
		// Sort desc. Reverse the array of rows
		$columnHeader.removeClass('sort-desc');
		$columnHeader.addClass('sort-asc');
	}
	table.append(rows);
}
// If numeric, compare numbers; otherwise, compare locale strings
function sortFunction(column) {
	return (rowA, rowB) => {
		const a = getCellValue(rowA, column);
		const b = getCellValue(rowB, column);
		return $.isNumeric(a) && $.isNumeric(b) ? +a - +b : a.localeCompare(b);
	};
}
// Get HTML of cell given row and column
function getCellValue(row, column) {
	return $(row).children('td').eq(column).text();
}
