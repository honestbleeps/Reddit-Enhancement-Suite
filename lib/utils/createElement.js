/* @flow */

import { once } from 'lodash-es';
import { i18n } from '../environment';
import type { Iteratee } from './array';
import { downcast } from './flow';
import { addFloater } from './floater';
import { isCurrentSubreddit, currentSubreddit } from './location';
import * as string from './string';

export function toggleButton(
	onClick?: (enabling: boolean) => void = () => {},
	fieldID?: ?string,
	enabled?: boolean = false,
	onText?: string = i18n('toggleOn'),
	offText?: string = i18n('toggleOff'),
	isTable?: boolean = false,
	usesBatch?: boolean = false,
) {
	const toggle = string.html`
		<div ${fieldID && string._html`id="${fieldID}Container"`} class="toggleButton ${enabled && 'enabled'}">
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

export function tabMenuItem({ text, aftercontent, className, title, checked, onChange, order }: {|
	text: string,
	aftercontent?: string,
	className?: string,
	title?: string,
	checked?: boolean,
	onChange: boolean => any,
	order?: number,
|}): HTMLElement {
	const element = string.html`
		<li class="res-tabmenu-button ${checked && 'selected'} ${className}">
			<a
				${title && string._html`title="${title}"`}
				${aftercontent && string._html`aftercontent="${aftercontent}"`}
			>${text}</a>
		</li>
	`;

	addFloater(element, { container: 'tabMenu', order });

	const a = element.querySelector('a');
	a.addEventListener('click', () => {
		checked = !checked;
		element.classList.toggle('selected', checked);
		onChange(checked);
	});

	return a;
}

export function fancyToggleButton(text: string, title: string, getState: () => boolean, callback: boolean => any) {
	const element = document.createElement('span');
	element.className = 'res-fancy-toggle-button';
	element.title = title;

	let state;

	const refresh = _state => {
		if (state === _state) return;
		state = _state;
		if (state) {
			element.textContent = `-${text}`;
			element.classList.add('remove');
		} else {
			element.textContent = `+${text}`;
			element.classList.remove('remove');
		}
	};

	element.addEventListener('click', () => {
		callback(!state);
		refresh(!state);
	});

	element.addEventListener('refresh', () => { refresh(getState()); });

	refresh(getState());

	return element;
}

export const sidebarSubscribeButtonWrappers = once(() => {
	const subreddit = currentSubreddit();
	return [...document.querySelectorAll('.side .subscribe-button.fancy-toggle-button')].map(subButton => {
		const thisSubredditFragment = subButton.getAttribute('data-sr_name') || subreddit;
		const isMulti = subreddit.includes('+') || isCurrentSubreddit('mod');
		const wrapper = string.html`<div subreddit="${thisSubredditFragment}" class="subButtons" style="margin: 0 !important;"></div>`;
		subButton.replaceWith(wrapper);
		wrapper.append(subButton);
		// move this wrapper to the end (after any icons that may exist...)
		if (isMulti) (wrapper.parentElement: any).append(wrapper);
		return wrapper;
	});
});
