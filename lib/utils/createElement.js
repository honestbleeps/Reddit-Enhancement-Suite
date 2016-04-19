import { $ } from '../vendor';

export function toggleButton(onClick = () => {}, fieldID, enabled, onText, offText, isTable) {
	enabled = enabled || false;
	onText = onText || 'on';
	offText = offText || 'off';
	const $thisToggle = $('<div>', {
		class: 'toggleButton',
		id: `${fieldID}Container`
	});

	$('<span>', {
		class: 'toggleOn noCtrlF',
		'data-text': onText
	}).appendTo($thisToggle);

	$('<span>', {
		class: 'toggleOff noCtrlF',
		'data-text': offText
	}).appendTo($thisToggle);

	const $field = $('<input>', {
		id: fieldID,
		name: fieldID,
		type: 'checkbox',
		checked: enabled
	});

	if (isTable) {
		$field.attr('tableOption', 'true');
	}

	$thisToggle.append($field);

	$thisToggle.click(function() {
		const thisCheckbox = this.querySelector('input[type=checkbox]');
		const enabled = thisCheckbox.checked;
		thisCheckbox.checked = !enabled;
		if (enabled) {
			this.classList.remove('enabled');
		} else {
			this.classList.add('enabled');
		}
		onClick(enabled);
	}, false);

	if (enabled) $thisToggle.addClass('enabled');
	return $thisToggle.get(0);
}

export function icon(iconName, tagName, className, title) {
	tagName = tagName || 'span';
	className = className || '';
	iconName = iconName.match(/(\w+)/)[0];
	title = title || '';

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
