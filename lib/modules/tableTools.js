﻿modules['tableTools'] = {
	moduleID: 'tableTools',
	moduleName: 'Table Tools',
	category: 'UI',
	// made this a generic module for tables, maybe in the future can add filtering???
	description: 'Include additional functionality to Reddit markdown tables (only sorting at the moment).',
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
			/* add sorting styles if enabled */
			if (modules['tableTools'].options.sort.value) {
				RESUtils.addCSS(".sort-asc:after { content: '\u0020\u25B4' }");
				RESUtils.addCSS(".sort-desc:after { content: '\u0020\u25BE' }");
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (modules['tableTools'].options.sort.value) {
				$(document).on("click", ".usertext-body th", function(e) {
					modules['tableTools'].sortTableColumn(e.target);
				});
			}
		}
	},
	//add sorting to a column
	sortTableColumn: function(target) {
		var $columnHeader = $(target);
		var table = $columnHeader.closest('table');
		var rows = table.find('tr:gt(0)').toArray();
		var column = $columnHeader.index();
		rows.sort(modules['tableTools'].sortFunction(column));
		$columnHeader.siblings().removeClass("sort-desc sort-asc");
		if($columnHeader.hasClass("sort-asc")) {
			//sort asc. leave the rows in the order they are
			rows = rows.reverse();
			$columnHeader.removeClass("sort-asc");
			$columnHeader.addClass("sort-desc");
		} else {
			//sort desc. reverse the array of rows
			$columnHeader.removeClass("sort-desc");
			$columnHeader.addClass("sort-asc");
		}
		table.append(rows);
	},
	//if numeric do compare numbers, otherwise do locale string compare
	sortFunction: function(column) {
		return function(rowA, rowB) {
			var a = modules['tableTools'].getCellValue(rowA, column), b = modules['tableTools'].getCellValue(rowB, column);
			return $.isNumeric(a) && $.isNumeric(b) ? a - b: a.localeCompare(b);
		}
	},
	//get html of cell given row and column
	getCellValue: function(row, column) {
		return $(row).children('td').eq(column).html();
	}
}