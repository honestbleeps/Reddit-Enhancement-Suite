addModule('tableTools', function(module, moduleID) {
	module.moduleName = 'Table Tools';
	module.category = 'Content';
	module.description = 'Include additional functionality to Reddit Markdown tables (only sorting at the moment).';
	module.options = {
		sort: {
			type: 'boolean',
			value: true,
			description: 'Enable column sorting.'
		}
	};
	module.isMatchURL = function() {
		return !RESUtils.currentSubreddit('dashboard') && RESUtils.isMatchURL(moduleID);
	};
	module.beforeLoad = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.sort.value) {
				RESUtils.addCSS('.md th { cursor: pointer; }');
				RESUtils.addCSS('.sort-asc:after { content: "\u0020\u25B4" }');
				RESUtils.addCSS('.sort-desc:after { content: "\u0020\u25BE" }');
			}
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.sort.value) {
				$(document).on('click', '.md th', function(e) {
					sortTableColumn(e.target);
				});
			}
		}
	};
	// Add sorting to a column
	function sortTableColumn(target) {
		var $columnHeader = $(target),
			table = $columnHeader.closest('table'),
			rows = table.find('tr:gt(0)').toArray(),
			column = $columnHeader.index();

		rows.sort(sortFunction(column));
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
	}
	// If numeric, compare numbers; otherwise, compare locale strings
	function sortFunction(column) {
		return function(rowA, rowB) {
			var a = getCellValue(rowA, column),
				b = getCellValue(rowB, column);
			return $.isNumeric(a) && $.isNumeric(b) ? a - b : a.localeCompare(b);
		};
	}
	// Get HTML of cell given row and column
	function getCellValue(row, column) {
		return $(row).children('td').eq(column).text();
	}
});
