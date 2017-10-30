/* @flow */

import html from 'nanohtml';
import { $ } from '../vendor';
import { i18n } from '../environment';
import type { Iteratee } from './array';
import { downcast } from './flow';
import { isAppType, isPageType } from './location';

export function toggleButton(
	onClick?: (enabling: boolean) => void = () => {},
	fieldID?: ?string,
	enabled?: boolean = false,
	onText?: string = i18n('toggleOn'),
	offText?: string = i18n('toggleOff'),
	isTable?: boolean = false,
	usesBatch?: boolean = false,
) {
	const toggle = html`
		<div id="${fieldID ? `${fieldID}Container` : null}" class="toggleButton ${enabled ? 'enabled' : ''}">
			<span class="toggleThumb"></span>
			<div class="toggleLabel ${usesBatch ? 'res-icon' : ''}"
				data-enabled-text="${onText || null}"
				data-disabled-text="${offText || null}"
			></div>
			<input id="${fieldID}" name="${fieldID}" type="checkbox" checked="${enabled}" tableOption="${isTable || null}"/>
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

export function icon(charCode: number, tagName?: string = 'span', className?: string = '', title?: string = '') {
	const icon = document.createElement(tagName);
	icon.className = className;
	icon.classList.add('res-icon');
	icon.textContent = String.fromCharCode(charCode);
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
		if (isAppType('r2')) {
			console.warn('Could not find tab menu');
		}
		return document.createElement('a');
	}

	const element = html`
		<li class="res-tabmenu-button ${checked ? 'selected' : ''} ${className}">
			<a title="${title || null}" aftercontent="${aftercontent || null}">${text}</a>
		</li>
	`;

	if (prepend) menu.prepend(element);
	else menu.appendChild(element);

	const a = element.querySelector('a');
	a.addEventListener('click', () => {
		checked = !checked;
		element.classList.toggle('selected', checked);
		a.dispatchEvent(new CustomEvent('change', { detail: checked }));
	});

	return a;
}
