import { $ } from '../vendor';
import tabMenuLinkTemplate from '../templates/tabMenuLink.mustache';
import { isPageType } from './';

export function toggleButton(onClick = () => {}, fieldID, enabled = false, onText = 'on', offText = 'off', isTable = false) {
	const $thisToggle = $('<div>', {
		class: 'toggleButton',
		id: `${fieldID}Container`,
	});

	const onIsElement = onText.jquery || onText.tagName;
	$('<span>', {
		class: 'toggleOn noCtrlF',
		[onIsElement ? 'append' : 'data-text']: onText,
	}).appendTo($thisToggle);

	const offIsElement = offText.jquery || offText.tagName;
	$('<span>', {
		class: 'toggleOff noCtrlF',
		[offIsElement ? 'append' : 'data-text']: offText,
	}).appendTo($thisToggle);

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

export function icon(iconName, tagName = 'span', className = '', title = '') {
	iconName = iconName.match(/(\w+)/)[0];

	const icon = document.createElement(tagName);
	icon.className = className;
	icon.classList.add('res-icon');
	icon.innerHTML = `&#x${iconName};`; // sanitized above
	icon.setAttribute('title', title);
	return icon;
}

export function table(items, callback) {
	if (!items) throw new Error('items is null/undef');
	if (!callback) throw new Error('callback is null/undef');
	// Sanitize single item into items array
	if (!(items.length && typeof items !== 'string')) items = [items];

	const description = [];
	description.push('<table>');

	items
		.map(callback)
		.forEach(item => {
			if (typeof item === 'string') {
				description.push(item);
			} else if (item.length) {
				description.push(...item);
			}
		});
	description.push('</table>');

	return description.join('\n');
}

export function tabMenuItem(options) {
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
