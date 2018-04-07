/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import { CreateElement, indexOptionTable } from '../utils';
import * as CommandLine from './commandLine';
import * as Menu from './menu';

export const module: Module<*> = new Module('customToggles');

module.moduleName = 'customTogglesName';
module.category = 'coreCategory';
module.description = 'customTogglesDesc';

module.options = {
	toggle: {
		description: 'customTogglesToggleDesc',
		title: 'customTogglesToggleTitle',
		type: 'table',
		fields: [{
			key: 'name',
			name: 'name',
			type: 'text',
		}, {
			key: 'enabled',
			name: 'enabled',
			type: 'boolean',
			value: true,
		}, {
			key: 'menuItem',
			name: 'menuItem',
			type: 'text',
		}],
		value: ([]: Array<[string, boolean, string]>),
	},
};

module.go = () => {
	createToggleMenuItems();
	registerCommandLine();
};

const togglesByName = _.once(() => indexOptionTable(module.options.toggle, 0));
const togglesByMenuItem = _.once(() => indexOptionTable(module.options.toggle, 2));

function anyTogglesEnabled(toggles) {
	return toggles
		.map(([, enabled]) => enabled)
		.some(enabled => enabled);
}

function registerCommandLine() {
	const notFoundErr = 'Could not find any matching toggle';

	const getName = value => Object.entries(togglesByName())
		.map(([name]) => name)
		.filter(name => name.toLowerCase().match(value.toLowerCase()))
		.sort()[0];

	CommandLine.registerCommand(/^tog$|^toggle$/, ' tog[gle] [name] - toggles a custom toggle',
		(command, value) => {
			const match = getName(value);

			// On empty state return nothing, otherwise the command description will never show
			if (value.trim() !== '') {
				return match ? `Open custom toggle ${match}` : notFoundErr;
			}
		},
		(command, value) => {
			const match = getName(value);

			return match ? onClickToggleMenuItem($(`#${match}`).parents().eq(1), match) : notFoundErr;
		}
	);
}

export function toggleActive(name?: string): boolean {
	if (!name || !Modules.isRunning(module)) return false;

	const toggles = togglesByName()[name];
	return !!toggles && anyTogglesEnabled(toggles);
}

function createToggleMenuItems() {
	for (const [menuItemId, toggles] of Object.entries(togglesByMenuItem())) {
		const $toggle = $('<div>', { text: menuItemId || '\u00A0' /* nbsp */, title: `Toggle ${menuItemId}` })
			.append(CreateElement.toggleButton(undefined, menuItemId, anyTogglesEnabled(toggles)));

		Menu.addMenuItem($toggle, function() { onClickToggleMenuItem(this, menuItemId); });
	}
}

function onClickToggleMenuItem(menuItem, menuItemID) {
	const enabled = toggleMenuItem(menuItemID);
	$(menuItem).find('.toggleButton').toggleClass('enabled', enabled);
}

function toggleMenuItem(menuItemID) {
	const toggles = togglesByMenuItem()[menuItemID];
	return toggleToggle(toggles);
}

function toggleToggle(toggles) {
	const newEnabled = !anyTogglesEnabled(toggles);

	// Update cached settings
	toggles.forEach(toggle => { toggle[1] = newEnabled; });

	// Update settings in storage
	module.options.toggle.value
		.filter(toggle => toggles.some(t => t[0] === toggle[0]))
		.forEach(toggle => { toggle[1] = newEnabled; });

	Options.set(module, 'toggle', module.options.toggle.value);

	// Notify listeners
	toggles.forEach(([toggle]) => {
		if (newEnabled) {
			$(module).trigger($.Event('activated', { target: toggle })); // eslint-disable-line new-cap
		} else {
			$(module).trigger($.Event('deactivated', { target: toggle })); // eslint-disable-line new-cap
		}
	});

	return newEnabled;
}
