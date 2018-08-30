/* @flow */

import { i18n } from '../environment';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Options from '../core/options';
import * as Notifications from './notifications';
import * as Troubleshooter from './troubleshooter';

export const module: Module<*> = new Module('presets');

module.moduleName = 'presetsName';
module.category = 'coreCategory';
module.alwaysEnabled = true;
module.description = 'presetsDesc';

module.options = {
	lite: {
		title: 'presetsLiteTitle',
		description: 'presetsLiteDesc',
		type: 'button',
		text: 'apply preset',
		callback: confirmPreset(() => {
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
				'noParticipation',
			], '*');
		}),
	},
	cleanSlate: {
		title: 'presetsCleanSlateTitle',
		description: 'presetsCleanSlateDesc',
		type: 'button',
		text: 'apply preset',
		callback: confirmPreset(() => {
			toggleModules(undefined, '*');
		}),
	},
	noPopups: {
		title: 'presetsNoPopupsTitle',
		description: 'presetsNoPopupsDesc',
		type: 'button',
		text: 'apply preset',
		callback: confirmPreset(() => {
			toggleModules(undefined, 'hover RESTips showParent subredditInfo'.split(/[,\s]/));
			toggleOptions(undefined, 'userTagger.hoverInfo'.split(/[,\s]/));
		}),
	},
	resetToFactory: Troubleshooter.module.options.resetToFactory,
};

function confirmPreset(callback) {
	return function() {
		const confirmation = prompt(`Are you sure you want to apply the "${i18n(this.title)}" preset? Type "yes" to continue.`);
		if ((/^"?yes"?$/).test(confirmation)) {
			callback();
			const shouldReload = confirm(`Applied preset: ${i18n(this.title)}\nYou must reload the page to see results.\n\nWould you like to reload now?`);
			if (shouldReload) {
				location.reload();
			}
		} else {
			Notifications.showNotification({
				moduleID: module.moduleID,
				title: 'Preset cancelled',
				message: 'If you really wanted to apply this preset, make sure to type in "yes" when prompted.',
			});
		}
	};
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
		disable.filter(moduleID => !enable.includes(moduleID)) :
		disable;

	enable = requestDisable !== '*' ?
		enable.filter(moduleID => !disable.includes(moduleID)) :
		enable;

	disable.forEach(modId => Modules.setEnabled(modId, false));
	enable.forEach(modId => Modules.setEnabled(modId, true));
}

function allModules() {
	return Modules.all().map(mod => mod.moduleID);
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
