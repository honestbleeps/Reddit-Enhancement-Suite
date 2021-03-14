/* @flow */

import { memoize, pull, escapeRegExp } from 'lodash-es';
import { downcast, empty, frameThrottle, positiveModulo, string } from '../utils';

const RESTables = new Map();

export class RESTable {
	_data: Array<{ [id: string]: HTMLElement | mixed }>;
	getRow: mixed => {};
	page: number = 0;
	pageSize: number = 100;
	tbody: HTMLTableSectionElement;
	element: HTMLTableElement;
	columns = []; // columns in shown order
	filters = [];
	onRowsChanges = [];
	sortBy: string;
	sortDirection: 'asc' | 'desc' = 'asc';

	data = memoize(() => {
		const data = this._data.filter(v => this.filters.every(filter => filter(v)));

		if (this.sortBy) {
			const getValue = memoize(r => {
				const v = this.getRow(r)[this.sortBy];
				return v instanceof HTMLElement ?
					(v.hasAttribute('sort-value') ? v.getAttribute('sort-value') : v.textContent) :
					String(v);
			});
			data.sort((a, b) => getValue(a).localeCompare(getValue(b), undefined, { numeric: true }));
		}

		if (this.sortDirection === 'desc') {
			data.reverse();
		}

		return data;
	});

	constructor(headers: { [id: string]: string }, data: *, getRow: *, opts: *) {
		this._data = data;
		this.getRow = getRow;
		Object.assign(this, opts);

		const table = this.element = document.createElement('table');
		table.style.width = '100%';

		const thead = document.createElement('thead');
		const tbody = this.tbody = downcast(document.createElement('tbody'), HTMLTableSectionElement);
		table.append(thead, tbody);

		const tr = document.createElement('tr');
		thead.append(tr);

		for (const [id, label] of Object.entries(headers)) {
			const th = document.createElement('th');
			th.addEventListener('click', sortByColumn);
			th.style.cursor = 'pointer';
			th.textContent = label;
			this.columns.push(id);
			tr.append(th);

			if (this.sortBy === id) th.classList.add(`sort-${this.sortDirection}`);
		}

		RESTables.set(table, this);

		this.refresh();
	}

	refresh() {
		this.data.cache.clear();
		this.updatePage();
	}

	start() {
		this.page = 0;
		this.refresh();
	}

	updatePage = frameThrottle(() => {
		this.page = positiveModulo(this.page, Math.ceil(this.data().length / this.pageSize)) || 0;
		const start = this.page * this.pageSize || 0;
		empty(this.tbody);
		for (const rawRow of this.data().slice(start, start + this.pageSize)) {
			const tr = document.createElement('tr');
			this.tbody.append(tr);
			const row = this.getRow(rawRow);

			for (const id of this.columns) {
				const td = document.createElement('td');
				const content = (row[id]: any);
				if (content instanceof HTMLElement) td.append(content);
				else td.textContent = content;
				tr.append(td);
			}
		}

		for (const observer of this.onRowsChanges) observer();
	});

	createSearchElement(valueGetter: * => string, placeholder: string, focus: boolean = false) {
		const search = document.createElement('input');

		search.setAttribute('placeholder', placeholder);

		// focus on open (delay to allow render)
		if (focus) requestAnimationFrame(() => { search.focus(); });

		let lastFilter;
		// Filter subreddit list
		search.addEventListener('input', () => {
			let regex;
			if (string.regexRegex.test(search.value)) {
				const [, str, flags = ''] = (string.regexRegex.exec(search.value): any); // guaranteed to match due to `.test()` above
				regex = new RegExp(str, flags);
			} else {
				regex = new RegExp(escapeRegExp(search.value), 'i');
			}

			if (lastFilter) pull(this.filters, lastFilter);
			if (search.value) this.filters.push(lastFilter = (data: *) => regex.test(valueGetter(data)));
			this.start();
		});

		return search;
	}

	createSelectFilterElement(filters: Array<{ name: string, initialSelected?: boolean, filter: * }>) {
		const ele = string.html`<div>
			Show only:
			<select>${filters.map(({ name, initialSelected }) => string._html`<option ${initialSelected ? 'selected' : ''}>${name}</option>`)}</select>
		</div>`;
		const filterSelect = downcast(ele.querySelector('select'), HTMLSelectElement);

		let lastFilter;
		this.filters.push(lastFilter = filters[filterSelect.selectedIndex].filter);

		filterSelect.addEventListener('change', () => {
			pull(this.filters, lastFilter);
			const filter = filters[filterSelect.selectedIndex].filter;
			this.filters.push(lastFilter = filter);
			this.start();
		});

		return ele;
	}

	createPaginationElement() {
		const ele = string.html`<div class="res-step-container">
			<div class="res-step res-step-previous" role="button"></div>
			<div class="res-step-progress">
				<span class="res-step-position"></span> of <span class="res-step-total"></span>
			</div>
			<div class="res-step res-step-next" role="button"></div>
		</div>`;

		ele.querySelector('.res-step-previous').addEventListener('click', () => { this.page--; this.updatePage(); });
		ele.querySelector('.res-step-next').addEventListener('click', () => { this.page++; this.updatePage(); });

		const position = ele.querySelector('.res-step-position');
		const total = ele.querySelector('.res-step-total');

		const refresh = () => {
			const pages = Math.ceil(this.data().length / this.pageSize);
			ele.setAttribute('first-piece', String(this.page === 0));
			ele.setAttribute('last-piece', String(this.page === pages - 1));

			position.textContent = String(this.page + 1);
			total.textContent = String(pages || 1);
		};

		this.onRowsChanges.push(refresh);

		return ele;
	}

	sort(by: string | number, reverseCurrent: boolean) {
		this.sortBy = typeof by === 'number' ? this.columns[by] : by;
		this.sortDirection = reverseCurrent ? (this.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc';
		this.start();
	}
}

export function sortByColumn({ target: sortColumn }: MouseEvent) {
	const table = downcast(sortColumn.closest('table'), HTMLTableElement);

	const reverseCurrent = sortColumn.classList.contains('sort-asc') || sortColumn.classList.contains('sort-asc');

	const tableRES = RESTables.get(table);
	if (tableRES) {
		const index = [...downcast(sortColumn.parentElement, HTMLElement).children].indexOf(sortColumn);
		tableRES.sort(index, reverseCurrent);
	} else {
		const tbody = table.querySelector('tbody');
		const columns = Array.from(table.querySelectorAll('thead th'));
		const rows = Array.from(tbody.querySelectorAll('tr'));

		if (reverseCurrent) {
			rows.reverse();
		} else {
			const index = columns.indexOf(sortColumn);
			const getCellValue = memoize(row => { const cell = row.querySelectorAll('td')[index]; return cell.textContent; });
			rows.sort((rowA, rowB) => getCellValue(rowA).localeCompare(getCellValue(rowB), undefined, { numeric: true }));
		}

		tbody.append(...rows);
	}

	if (reverseCurrent) {
		sortColumn.classList.toggle('sort-asc');
		sortColumn.classList.toggle('sort-desc');
	} else {
		const previous = table.querySelector('.sort-asc, .sort-desc');
		if (previous) previous.classList.remove('sort-asc');
		if (previous) previous.classList.remove('sort-desc');
		sortColumn.classList.add('sort-asc');
	}
}
