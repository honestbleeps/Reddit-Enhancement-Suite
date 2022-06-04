/* @flow */

import $ from 'jquery';
import { Sortable } from '../vendor';
import { i18n } from '../environment';
import { undo } from './createElement';
import { Alert, downcast, string } from './';

export function drawOptionBuilder(options: *, mod: *, optionName: *) {
	const option = options[optionName];
	const $addRowButton = $('<button class="addRowButton">');
	const $itemContainer = $('<div class="optionBuilder">');

	$itemContainer.attr({
		'data-module-id': mod.moduleID,
		'data-option-name': optionName,
	});
	$addRowButton
		.text(i18n(option.addItemText) || '+add item')
		.on('click', function() {
			const $newBody = drawBuilderItem(option.defaultTemplate(), option.customOptionsFields, option.cases);
			$(this).siblings('.optionBuilder:first').trigger('change').append($newBody);
			const firstText = $newBody.find('input[type=text], textarea')[0];
			if (firstText) {
				setTimeout(() => firstText.focus(), 200);
			}
		});
	option.value.forEach(item => drawBuilderItem(item, option.customOptionsFields, option.cases).appendTo($itemContainer));

	Sortable.create($itemContainer.get(0), { handle: '.handle' });

	return $('<div>').append($itemContainer, $addRowButton)[0];
}

function drawBuilderItem(data: *, customOptionsFields: * = [], cases: *) {
	const $item = $('<div class="builderItem">');

	const $editButton = $('<div>')
		.addClass('res-icon-button res-icon builderControls builderTrailingControls')
		.html('&#xF061;')
		.attr('title', 'copy and share, or update your settings with a new version')
		.on('click', async () => {
			const data = readBuilderItem($item, customOptionsFields, cases);
			const element = string.html`<div>Copy this and share it, or update your settings with a new version: <br><br><textarea rows="5" cols="50"></textarea></div>`;
			const textarea = downcast(element.querySelector('textarea'), HTMLTextAreaElement);
			textarea.value = JSON.stringify(data);
			const newData = await Alert.open(element, { cancelable: true })
				.then(() => JSON.parse(textarea.value));
			$item.replaceWith(drawBuilderItem(newData, customOptionsFields, cases)).trigger('change');
		});

	const $deleteButton = drawDeleteButton()
		.addClass('builderTrailingControls')
		.on('click', () => {
			const parent = $item.parent();
			$item.trigger('change').detach();
			undo('Restore deleted item').then(() => { parent.append($item).trigger('change'); });
		});

	const customOptions = string.html`<ul class="builderCustomOptions"></ul>`;
	for (const fields of customOptionsFields) {
		const li = document.createElement('li');
		$(li).append(drawFields(fields, data.opts || {}));
		customOptions.append(li);
	}

	const $header = $('<div class="builderItemControls">')
		.append(
			drawHandle(),
			$('<input type="hidden" name="version">').val(data.ver),
			$('<input type="hidden" name="id">').val(data.id),
			customOptions,
			$('<textarea name="builderNote" rows="1" cols="40" placeholder="Write a description/note for this">').val(data.note),
			$('<div class="pushRight">').append($editButton, $deleteButton),
		);

	const $body = drawBuilderBlock(data.body, cases, false);

	return $item.append($header, $body);
}

function drawHandle() {
	return $('<div>')
		.addClass('res-icon-button res-icon handle builderControls')
		.html('&#xF0AA;')
		.attr('title', 'drag and drop to move this condition');
}

function drawDeleteButton() {
	return $('<div>')
		.addClass('res-icon-button res-icon builderControls')
		.html('&#xF056;')
		.attr('title', 'remove this condition');
}

export function drawBuilderBlock(data: *, cases: *, addBaseControls: boolean = true) {
	if (!cases.hasOwnProperty(data.type)) {
		console.error(`Case type ${data.type} is not available. Ignoring block.`, data);
		// This also prevents the data from being read, i.e. it will be trashed
		return $();
	}

	const $block = $('<div class="builderBlock">')
		.attr('data-type', data.type)
		.append(drawFields(cases[data.type].fields, data, cases));

	if (!addBaseControls) return $block;

	const $wrap = $('<div class="builderWrap">');

	const $deleteButton = drawDeleteButton()
		.addClass('builderTrailingControls')
		.on('click', () => {
			const parent = $wrap.parent();
			$wrap.trigger('change').detach();
			undo('Restore deleted block').then(() => { parent.append($wrap).trigger('change'); });
		});

	return $wrap
		.append(
			drawHandle(),
			$block,
			$deleteButton,
		);
}

export function readBuilderItem(item: *, customOptionsFields: * = [], cases: *) {
	const $firstBlock = $(item).find('> .builderBlock');
	const $header = $(item).find('.builderItemControls');

	return {
		note: $header.find('textarea[name=builderNote]').val(),
		ver: parseInt($header.find('input[name=version]').val(), 10),
		id: $header.find('input[name=id]').val(),
		body: readBuilderBlock($firstBlock, cases),
		// $FlowIssue Array#flat
		opts: readFields($header.find('.builderCustomOptions li'), customOptionsFields.flat(Infinity), cases),
	};
}

export function readBuilderBlock($element: *, cases: *) {
	const type = $element.attr('data-type');
	const BlockClass = cases[type];

	const data = { type, ...readFields($element, BlockClass.fields, cases) };

	const multiType = BlockClass.fields.find(({ type }) => type === 'multi');
	if (!multiType) { // `multi`-types cannot have errors, so avoid duplicating error messages by not validating them
		try {
			BlockClass.validate(data);
			$element.removeClass('builderBlock-error');
		} catch (e) {
			$element
				.attr('error', e.message)
				.addClass('builderBlock-error');
			throw e;
		}
	}

	return data;
}

function readFields($element, fields, cases) {
	return fields.reduce((acc, field) => {
		if (typeof field === 'string') return acc;
		const $fieldElem = $element.find(`> [name=${field.id}]`);
		const fieldModule = builderFields[field.type];
		if (fieldModule && typeof fieldModule.read === 'function') {
			acc[field.id] = fieldModule.read($fieldElem, field, cases);
		} else {
			acc[field.id] = $fieldElem.val();
		}
		return acc;
	}, {});
}

function drawFields(fields, data, cases) {
	return fields.map(field => {
		if (typeof field === 'string') return field;

		const fieldModule = builderFields[field.type];
		if (fieldModule) {
			return fieldModule.draw(data, field, cases);
		} else {
			return $(`<input type="${field.type}">`)
				.attr('name', field.id)
				.val(data[field.id]);
		}
	});
}

const builderFields = {
	multi: {
		draw(data, field, cases = {}) {
			const $rowWrapper = $('<ul class="builderMulti">').attr('name', field.id);
			const addItem = itemData => drawBuilderBlock(itemData, cases).appendTo($rowWrapper).wrap('<li>');

			const items = data[field.id];
			items.forEach(addItem);

			const addCaseSelect = downcast(string.html`
				<select class="addBuilderBlock">
					<option>+ add a condition</option>
					${Object.entries(cases).map(([key, { text }]) => string._html`
						<option value="${key}">${text}</option>
					`)}
				</select>
			`, HTMLSelectElement);
			addCaseSelect.addEventListener('change', () => {
				const type = addCaseSelect.value;
				if (type !== '' && cases.hasOwnProperty(type)) {
					addItem({ type, ...cases[type].defaultConditions })
						.find('input[type=text], input[type=number], textarea').focus();
				}

				addCaseSelect.selectedIndex = 0;
			});

			Sortable.create($rowWrapper.get(0), { group: 'block', handle: '.handle' });

			return $rowWrapper.add(addCaseSelect);
		},
		read($elem, fields, cases) {
			return $elem.find('> li > .builderWrap > .builderBlock').map(function() {
				return readBuilderBlock($(this), cases);
			}).get();
		},
	},
	hidden: {
		draw(data, field) {
			const id = field.id;
			return $('<input type="hidden">').attr('name', id).val(data[id]);
		},
	},
	number: {
		draw(data, field) {
			const id = field.id;
			return $('<input type="number">').attr('name', id).val(data[id]);
		},
		read($elem) {
			return parseInt($elem.val(), 10);
		},
	},
	check: {
		draw(data, field) {
			const id = field.id;
			const $input = $('<input type="checkbox">').prop('checked', data[id]);
			return $('<label>').attr('name', id).text(field.label).prepend($input);
		},
		read($elem) {
			return $elem.find('input').get(0).checked;
		},
	},
	checkset: {
		uid: 0,
		draw(data, field) {
			const id = field.id;
			const prefixId = this.uid++;
			const $wrap = $('<span class="checkset">').attr('name', field.id);
			field.items.forEach((e, idx) => {
				const itemId = `checkset-${prefixId}-${idx}X`;
				const $box = $('<input type="checkbox" />')
					.attr('id', itemId)
					.attr('name', e);
				if (data.hasOwnProperty(id) && data[id].includes(e)) {
					$box.prop('checked', true);
				}
				const $label = $('<label>')
					.attr('for', itemId)
					.text(e);
				$wrap.append($box, $label);
			});
			return $wrap;
		},
		read($elem, fields) {
			return fields.items.filter(e => $elem.children(`[name="${e}"]`).prop('checked'));
		},
	},
	duration: {
		draw(data, field) {
			// Store as milliseconds like JavaScript Date
			let durr = data[field.id];
			durr /= 60 * 1000;
			const minutes = durr % 60;
			durr = (durr - minutes) / 60;
			const hours = durr % 24;
			durr = (durr - hours) / 24;
			const days = durr;

			return $('<span class="durationField">')
				.attr('name', field.id)
				.append([
					$('<input type="number" name="days" />').val(days), ' days ',
					$('<input type="number" name="hours" />').val(hours), ' hours ',
					$('<input type="number" name="minutes" />').val(minutes), ' minutes ',
				]);
		},
		read($elem) {
			const days = parseFloat($elem.children('[name=days]').val()) || 0;
			const hours = parseFloat($elem.children('[name=hours]').val()) || 0;
			const minutes = parseFloat($elem.children('[name=minutes]').val()) || 0;

			// Store as milliseconds like JavaScript Date
			let duration = 0;
			duration += days * 24 * 60 * 60;
			duration += hours * 60 * 60;
			duration += minutes * 60;
			duration *= 1000;

			return duration;
		},
	},
	select: {
		draw(data, field) {
			const value = data[field.id];
			let entries = field.options;

			if (typeof entries === 'string') {
				entries = this.getPredefinedChoices(entries);
			}

			const $dropdown = $('<select>').attr('name', field.id);
			entries.forEach(row => {
				let label, value;
				if (typeof row === 'string') {
					label = value = row;
				} else {
					label = row[0];
					value = row[1];
				}
				$('<option>').text(label).val(value).appendTo($dropdown);
			});
			$dropdown.val(value);
			return $dropdown;
		},
		getPredefinedChoices(name) {
			if (name === 'COMPARISON') {
				return [
					['exactly', '=='],
					['not', '!='],
					['more than', '>'],
					['less than', '<'],
					['at least', '>='],
					['at most', '<='],
				];
			} else {
				throw new Error(`Option set "${name}" is not defined`);
			}
		},
	},
};
