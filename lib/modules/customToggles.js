import _ from 'lodash';
import * as Menu from './menu';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import * as SettingsConsole from './settingsConsole';
import { $ } from '../vendor';
import { CreateElement, indexOptionTable } from '../utils';

export const module = {};

module.moduleID = 'customToggles';
module.moduleName = 'Custom Toggles';
module.category = ['Core'];
module.description = 'Set up custom on/off switches for various parts of RES.';

module.options = {};

module.options.toggle = {
	description: 'Enable or disable everything connected to this toggle; and optionally add a toggle to the RES gear dropdown menu',
	type: 'table',
	fields: [{
		name: 'name',
		type: 'text'
	}, {
		name: 'enabled',
		type: 'boolean',
		value: true
	}, {
		name: 'menuItem',
		type: 'text'
	}]
};
/*
module.options.activateToggle = {
	type: 'builder',
	advanced: true,
	description: 'Activate toggles based on complex custom criteria.'
		+ '\n<p>This is a very advanced feature, please <a href="http://www.reddit.com/r/Enhancement/wiki/customToggles">read the guide</a> before asking questions.  <p style="font-weight: bold; font-size: 16pt;">This feature is currently in beta and may break in future RES updates.</p>',
	value: [],
	addItemText: '+add custom toggle activator',
	defaultTemplate: function() {
		return {
			note: '', ver: 1,
			body: {type: 'group', op: 'all', of: [
				// empty
		]}};
	},
	cases: {
		toggleName:
		group: ...
		currentSub: ...,
		currentMultireddit: ...
		currentUserProfile: ...
		dow: ...,
		date: ...,
		time: ...
		toggles: ... // for dependent toggles
	}
}
*/

const _getByToggle = {};
function getOptionByToggleName(optionKey, toggle) {
	if (!_getByToggle[optionKey]) {
		_getByToggle[optionKey] = indexOptionTable(module.options[optionKey], 0);
	}

	return _getByToggle[optionKey](toggle);
}


const _getMenuItems = _.once(() => indexOptionTable(module.options.toggle, 2, true));
function getMenuItems(menuItemID) {
	if (typeof menuItemID === 'undefined') {
		return _getMenuItems();
	} else {
		return _getMenuItems()(menuItemID);
	}
}
function getAllMenuItems() {
	return getMenuItems().all();
}

function getTogglesForMenuItem(menuItemID) {
	const menuItems = getMenuItems(menuItemID);
	return menuItems.map(([toggle]) => toggle);
}


function anyTogglesEnabled(toggles) {
	return [].concat(toggles)
		.map(([, enabled]) => enabled)
		.some(enabled => enabled);
}


module.go = function() {
	createToggleMenuItems();
};

export function toggleActive(name) {
	if (name && Modules.isRunning(module)) {
		const toggles = getOptionByToggleName('toggle', name);
		if (toggles && !anyTogglesEnabled(toggles)) {
			return false;
		}
	}

	return true;
}

// const $menuItems = {};
function createToggleMenuItems() {
	for (const menuItem of getAllMenuItems()) {
		const menuItemID = menuItem[0][2];
		const $toggle = $('<div>', { text: menuItemID, title: `Toggle ${menuItemID}` })
			.append(CreateElement.toggleButton(
				enabled => SettingsConsole.onOptionChange(module, menuItemID, !enabled),
				menuItemID,
				anyTogglesEnabled(menuItem)
			));

		Menu.addMenuItem($toggle, function() { this::onClickToggleMenuItem(menuItemID); });
	}
}

function onClickToggleMenuItem(menuItemID) {
	if (typeof menuItemID === 'undefined') return;

	const enabled = toggleMenuItem(menuItemID);
	$(this).find('.toggleButton').toggleClass('enabled', enabled);
}

function toggleMenuItem(menuItemID) {
	const toggles = getTogglesForMenuItem(menuItemID);
	return toggleToggle(toggles);
}

function toggleToggle(toggles) {
	toggles = [].concat(toggles)
		.map(toggle => getOptionByToggleName('toggle', toggle))
		.reduce((toggles, newToggles) => toggles.concat(newToggles), []);

	const newEnabled = !anyTogglesEnabled(toggles);

	// Update cached settings
	toggles.forEach(toggle => (toggle[1] = newEnabled));

	// Update settings in storage
	module.options.toggle.value
		.filter(toggle => toggles.indexOf(toggle[0]) !== -1)
		.forEach(toggle => (toggle[1] = newEnabled));
	Options.set(module, 'toggle', module.options.toggle.value);


	// Notify listeners
	toggles.forEach(([toggle]) => {
		if (newEnabled) {
			$(module).trigger($.Event('activated', { target: toggle }));
		} else {
			$(module).trigger($.Event('deactivated', { target: toggle }));
		}
	});

	return newEnabled;
}
