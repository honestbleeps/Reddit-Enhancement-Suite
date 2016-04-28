import * as Modules from '../core/modules';
import * as Notifications from './notifications';
import * as Options from '../core/options';
import * as Troubleshooter from './troubleshooter';
import { collect, map } from '../utils';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'presets';
	module.moduleName = 'Presets';
	module.category = 'Core';
	module.alwaysEnabled = true;
	module.description = 'Select from various preset RES configurations. Each preset turns on or off various modules/options, but does not reset your entire configuration.';

	module.options = {};

	module.options.lite = {
		description: 'RES Lite: just the popular stuff',
		type: 'button',
		text: 'apply preset',
		callback() {
			toggleModules([
				'notifications',
				'hover',
				'announcements',
				'orangered',
				'onboarding',
				'selectedEntry',
				'showImages',
				'submitHelper',
				'neverEndingReddit',
				'accountSwitcher',
				'filteReddit',
				'quickMessage',
				'subredditInfo',
				'userInfo',
				'userHighlight',
				'searchHelper',
				'betteReddit',
				'styleTweaks',
				'pageNavigator',
				'commandLine',
				'commentHidePersistor',
				'commentTools',
				'commentPreview',
				'localDate',
				'noParticipation'
			], '*');
		}
	};

	module.options.cleanSlate = {
		description: 'Turn off all the RES modules',
		type: 'button',
		text: 'apply preset',
		callback() {
			toggleModules(undefined, '*');
		}
	};

	module.options.noPopups = {
		description: 'Turn off notifications and hover pop-ups',
		type: 'button',
		text: 'apply preset',
		callback() {
			toggleModules(undefined, 'hover RESTips showParent subredditInfo '.split(/[,\s]/));
			toggleOptions(undefined, 'userTagger.hoverInfo'.split(/[,\s]/));
		}
	};

	module.loadDynamicOptions = function() {
		for (const optionName in module.options) {
			if (typeof module.options[optionName].callback !== 'function') {
				continue;
			}
			const callback = module.options[optionName].callback;
			module.options[optionName].callback = (name, opt) => confirmPreset(callback, name, opt);
		}

		module.options.resetToFactory = Troubleshooter.module.options.resetToFactory;
	};

	function confirmPreset(callback, optionName, option) {
		const confirmation = prompt(`Are you sure you want to apply the "${optionName}" preset? Type "yes" to continue.`);
		if (/^"?yes"?$/.test(confirmation)) {
			presetApplied(optionName, option);
			callback();
		} else {
			presetCancelled();
		}
	}

	function presetApplied(optionName, option) {
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: optionName,
			title: `Applied ${optionName} preset`,
			message: `Applied preset: ${option.description}\n<p>Reload page to see results.</p>`
		});
	}

	function presetCancelled(optionName) {
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: optionName,
			title: 'Preset cancelled',
			message: 'If you really wanted to apply this preset, make sure to type in "yes" when prompted.'
		});
	}


	function sanitizeModulesList(unsanitized) {
		let sanitized;
		if (unsanitized === '*') {
			sanitized = allModules();
		} else if (typeof unsanitized === 'string') {
			sanitized = unsanitized.split(/[,\s]/);
		} else if (unsanitized && unsanitized.length) {
			sanitized = unsanitized;
		}
		return sanitized ? [].concat(sanitized) : [];
	}

	function toggleModules(requestEnable, requestDisable) {
		let enable = sanitizeModulesList(requestEnable);
		let disable = sanitizeModulesList(requestDisable);

		disable = requestEnable !== '*' ?
			disable.filter(moduleID => enable.indexOf(moduleID) === -1) :
			disable;

		enable = requestDisable !== '*' ?
			enable.filter(moduleID => disable.indexOf(moduleID) === -1) :
			enable;

		disable.forEach(modId => Modules.setEnabled(modId, false));
		enable.forEach(modId => Modules.setEnabled(modId, true));
	}

	function allModules() {
		return Modules.all()::map(mod => mod.moduleID)::collect();
	}

	function toggleOptions(requestEnable, requestDisable) {
		const enable = requestEnable ? [].concat(requestEnable) : [];
		const disable = requestDisable ? [].concat(requestDisable) : [];

		enable.forEach(option => setOptionValue(true, option));
		disable.forEach(option => setOptionValue(false, option));
	}

	function setOptionValue(value, path) {
		// path = [moduleID, optionName] or 'moduleID.optionName'
		if (typeof path === 'string') {
			path = path.split('.');
		}
		const [id, optName] = path;
		Options.set(id, optName, value);
	}
}
