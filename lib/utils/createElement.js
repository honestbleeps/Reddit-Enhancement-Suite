/* @flow */

import { $ } from '../vendor';
import { i18n } from '../environment';
import type { Iteratee } from './array';
import { downcast, isPageType, string } from './';

export function toggleButton(
	onClick?: (enabling: boolean) => void = () => {},
	fieldID: string,
	enabled?: boolean = false,
	onText?: string = i18n('toggleOn'),
	offText?: string = i18n('toggleOff'),
	isTable?: boolean = false,
	usesBatch?: boolean = false,
) {
	const toggle = string.html`
		<div id="${fieldID}Container" class="toggleButton ${enabled && 'enabled'}">
			<span class="toggleThumb"></span>
			<div class="toggleLabel ${usesBatch && 'res-icon'}"
				${onText && string._html`data-enabled-text="${onText}"`}
				${offText && string._html`data-disabled-text="${offText}"`}
			></div>
			<input id="${fieldID}" name="${fieldID}" type="checkbox" ${enabled && 'checked'}
				${isTable && string._html`tableOption="true"`}
			/>
		</div>
	`;

	toggle.addEventListener('click', () => {
		const checkbox = downcast(toggle.querySelector('input[type=checkbox]'), HTMLInputElement);
		const enabling = !checkbox.checked;
		checkbox.checked = enabling;
		toggle.classList.toggle('enabled', enabling);
		onClick(enabling);
	});

	return toggle;
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

export function tabMenuItem({ text, aftercontent, className, title, checked, prepend }: {|
	text: string,
	aftercontent?: string,
	className?: string,
	title?: string,
	checked?: boolean,
	prepend?: boolean,
|}): HTMLElement {
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

	const element = string.html`
		<li class="res-tabmenu-button ${checked && 'selected'} ${className}">
			<a
				${title && string._html`title="${title}"`}
				${aftercontent && string._html`aftercontent="${aftercontent}"`}
			>${text}</a>
		</li>
	`;

	if (prepend) $(menu).prepend(element);
	else menu.appendChild(element);

	const a = element.querySelector('a');
	a.addEventListener('click', () => {
		checked = !checked;
		element.classList.toggle('selected', checked);
		a.dispatchEvent(new CustomEvent('change', { detail: checked }));
	});

	return a;
}
