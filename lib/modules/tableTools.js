import { $ } from '../vendor';
import { isCurrentSubreddit } from '../utils';

export const module = {};

module.moduleID = 'tableTools';
module.moduleName = 'Table Tools';
module.category = ['Productivity', 'Appearance'];
module.description = 'Include additional functionality to Reddit Markdown tables (only sorting at the moment).';
module.options = {
	sort: {
		type: 'boolean',
		value: true,
		description: 'Enable column sorting.',
		bodyClass: true,
	},
};

module.shouldRun = function() {
	return !isCurrentSubreddit('dashboard');
};

module.go = function() {
	if (this.options.sort.value) {
		$(document).on('click', '.md th', e => sortTableColumn(e.currentTarget));
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
	return function(rowA, rowB) {
		const a = getCellValue(rowA, column);
		const b = getCellValue(rowB, column);
		return $.isNumeric(a) && $.isNumeric(b) ? a - b : a.localeCompare(b);
	};
}
// Get HTML of cell given row and column
function getCellValue(row, column) {
	return $(row).children('td').eq(column).text();
}
