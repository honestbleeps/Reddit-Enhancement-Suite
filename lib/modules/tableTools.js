modules['tableTools'] = {
	moduleID: 'tableTools',
	moduleName: 'Table Tools',
	category: 'UI',
	description: 'Include additional functionality to Reddit Markdown tables (only sorting at the moment).',
	options: {
		sort: {
			type: 'boolean',
			value: true,
			description: 'Enable column sorting.'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			/* Add sorting styles if enabled */
			if (modules['tableTools'].options.sort.value) {
				RESUtils.addCSS('.md th { cursor: pointer; }');
				RESUtils.addCSS('.sort-asc:after { content: "\u0020\u25B4" }');
				RESUtils.addCSS('.sort-desc:after { content: "\u0020\u25BE" }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['tableTools'].options.sort.value) {
				$(document).on('click', '.md th', function(e) {
					modules['tableTools'].sortTableColumn(e.target);
				});
			}
		}
	},
	// Add sorting to a column
	sortTableColumn: function(target) {
		var $columnHeader = $(target),
			table = $columnHeader.closest('table'),
			rows = table.find('tr:gt(0)').toArray(),
			column = $columnHeader.index();

		rows.sort(modules['tableTools'].sortFunction(column));
		$columnHeader.siblings().removeClass('sort-desc sort-asc');
		if ($columnHeader.hasClass('sort-asc')) {
			// Sort asc. leave the rows in the order they are
			rows = rows.reverse();
			$columnHeader.removeClass('sort-asc');
			$columnHeader.addClass('sort-desc');
		} else {
			// Sort desc. Reverse the array of rows
			$columnHeader.removeClass('sort-desc');
			$columnHeader.addClass('sort-asc');
		}
		table.append(rows);
	},
	// If numeric, compare numbers; otherwise, compare locale strings
	sortFunction: function(column) {
		return function(rowA, rowB) {
			var a = modules['tableTools'].getCellValue(rowA, column),
				b = modules['tableTools'].getCellValue(rowB, column);
			return $.isNumeric(a) && $.isNumeric(b) ? a - b : a.localeCompare(b);
		};
	},
	// Get HTML of cell given row and column
	getCellValue: function(row, column) {
		return $(row).children('td').eq(column).text();
	}
};
