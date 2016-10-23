/* @flow */

import { $ } from '../vendor';
import { i18n } from '../environment';
import tabMenuLinkTemplate from '../templates/tabMenuLink.mustache';
import type { Iteratee } from './array';
import { isPageType } from './';

export function toggleButton(
	onClick?: (enabling: boolean) => void = () => {},
	fieldID: string,
	enabled?: boolean = false,
	onText?: string = i18n('toggleOn'),
	offText?: string = i18n('toggleOff'),
	isTable?: boolean = false,
	usesBatch?: boolean = false,
) {
	const $thisToggle = $('<button>', {
		class: 'toggleButton',
		id: `${fieldID}Container`,
	});

	$('<span>', {
		class: 'toggleThumb',
	}).appendTo($thisToggle);

	const $toggleLabel = $('<div>', {
		class: 'toggleLabel',
	}).appendTo($thisToggle);

	if (usesBatch) {
		$toggleLabel.addClass('res-icon');
	}

	if (onText) {
		$toggleLabel.attr('data-enabled-text', onText);
	}
	if (offText) {
		$toggleLabel.attr('data-disabled-text', offText);
	}

	const $field = $('<input>', {
		id: fieldID,
		name: fieldID,
		type: 'checkbox',
		checked: enabled,
	});

	if (isTable) {
		$field.attr('tableOption', 'true');
	}

	$thisToggle.append($field);

	$thisToggle.click(function() {
		const checkbox = this.querySelector('input[type=checkbox]');
		const enabling = !checkbox.checked;
		checkbox.checked = enabling;
		if (enabling) {
			this.classList.add('enabled');
		} else {
			this.classList.remove('enabled');
		}
		onClick(enabling);
	});

	if (enabled) $thisToggle.addClass('enabled');
	return $thisToggle.get(0);
}

export function icon(iconName: string, tagName?: string = 'span', className?: string = '', title?: string = '') {
	iconName = iconName.split(/\W/)[0];

	const icon = document.createElement(tagName);
	icon.className = className;
	icon.classList.add('res-icon');
	icon.innerHTML = `&#x${iconName};`; // sanitized above
	icon.setAttribute('title', title);
	return icon;
}

export function table<T>(items: T | T[], callback: Iteratee<T, string | string[] | false>): string {
	// Sanitize single item into items array
	items = [].concat(items);

	const description = [];
	description.push('<table>');

	for (const item of items.map(callback)) {
		if (typeof item === 'string') {
			description.push(item);
		} else if (item) {
			description.push(...item);
		}
	}

	description.push('</table>');

	return description.join('\n');
}

type TabMenuItemOptions = {
	text: string,
	className?: string,
	title?: string,
	checked?: boolean,
};

export function tabMenuItem(options: TabMenuItemOptions): HTMLElement {
	let menu = document.querySelector('#header-bottom-left ul.tabmenu');

	// Build missing menu if on some of the sites that doesn't have one
	if (!menu && isPageType('search', 'modqueue')) {
		menu = $('<ul>', { class: 'tabmenu' })
			.appendTo('#header-bottom-left')
			.get(0);
	} else if (!menu) {
		console.error('Could not find tab menu');
		return document.createElement('a');
	}

	const element = $(tabMenuLinkTemplate(options))[0];

	if (options.prepend) $(menu).prepend(element);
	else menu.appendChild(element);

	let checked = options.checked;
	const a = element.querySelector('a');
	a.addEventListener('click', () => {
		checked = !checked;
		element.classList.toggle('selected', checked);
		a.dispatchEvent(new CustomEvent('change', { detail: checked }));
	});

	return a;
}
