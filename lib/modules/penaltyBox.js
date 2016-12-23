/* @flow */

import { $ } from '../vendor';
import * as Options from '../core/options';
import * as Modules from '../core/modules';
import { Module } from '../core/module';
import { i18n } from '../environment';
import { mapScalarToObject } from '../utils';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('penaltyBox');
export const MIN_PENALTY = 1;
export const MAX_PENALTY = 100;

module.moduleName = 'penaltyBoxName';
module.category = 'coreCategory';
module.description = 'penaltyBoxDesc';
module.options = {
	delayFeatures: {
		type: 'boolean',
		value: true,
		description: 'penaltyBoxDelayFeaturesDesc',
	},
	suspendFeatures: {
		type: 'boolean',
		value: false,
		description: 'penaltyBoxSuspendFeaturesDesc',
	},
	features: {
		description: 'penaltyBoxFeaturesDesc',
		type: 'table',
		advanced: true,
		addRowText: 'manually register feature',
		fields: [
			{
				name: 'moduleID',
				type: 'text',
			},
			{
				name: 'optionKey',
				type: 'text',
			},
			{
				id: 'monitoring',
				name: 'penaltyBoxFeaturesMonitoring',
				type: 'boolean',
				value: true,
			},
			{
				id: 'penalty',
				name: 'penaltyBoxFeaturesPenalty',
				type: 'text',
				value: '0',
			},
		],
		value: [],
	},
};

export function alterFeaturePenalty(moduleID: string, optionKey: string, valueDelta: number) {
	if (isNaN(parseInt(valueDelta, 10))) {
		console.warn('Could not alter penalty for', moduleID, optionKey, ' - bad value:', valueDelta);
		return MIN_PENALTY;
	}
	if (!Modules.isEnabled(module.moduleID)) return MIN_PENALTY;
	const value = getOrAddFeatures(moduleID, optionKey);
	if (!value.monitoring) return MIN_PENALTY;
	value.penalty = Math.min(Math.max(value.penalty + valueDelta, MIN_PENALTY), MAX_PENALTY);
	Options.set(module, 'features', module.options.features.value);
	if (value.penalty >= MAX_PENALTY) {
		suspendFeature(moduleID, optionKey);
	}
	return value.penalty;
}

function stopMonitoringFeature(moduleID, optionKey) {
	const value = getOrAddFeatures(moduleID, optionKey);
	value.monitoring = false;
	value.penalty = MIN_PENALTY;
	Options.set(module, 'features', module.options.features.value);
}

export function getFeaturePenalty(moduleID: string, optionKey: string) {
	if (!Modules.isEnabled(module.moduleID)) {
		return MIN_PENALTY;
	}
	if (!module.options.delayFeatures.value) {
		return MIN_PENALTY;
	}

	const value = getOrAddFeatures(moduleID, optionKey);
	if (!value.monitoring) {
		return MIN_PENALTY;
	}

	if (!value.penalty || MIN_PENALTY >= value.penalty) {
		return MIN_PENALTY;
	}

	return value.penalty;
}

type DelayOption = {
	value: number | string,
	default?: number | string,
	penalizedValue?: number,
};

export function penalizedDelay(moduleID: string, optionKey: string, delayOption: DelayOption): number {
	const penalty = getFeaturePenalty(moduleID, optionKey);
	if (!penalty || penalty === MIN_PENALTY) {
		return parseInt(delayOption.value, 10);
	}

	const max = parseInt(delayOption.penalizedValue || delayOption.value, 10) * 6;
	const initial = parseInt(delayOption.default, 10);
	const position = penalty / 100;

	return Math.min(max, (max - initial) * position + initial);
}

function getOrAddFeatures(moduleID, optionKey) {
	const value = Options.table.getMatchingValueOrAdd(module, 'features', { moduleID, optionKey });
	const obj = mapScalarToObject(module.options.features, value);
	obj.penalty = parseInt(obj.penalty, 10) || 0;
	return obj;
}

async function suspendFeature(moduleID, optionKey) {
	if (!module.options.suspendFeatures.value) {
		return;
	}

	const featureModule = Modules.get(moduleID);
	const option = featureModule.options[optionKey];
	if (!option) {
		console.warn('Could not find option', moduleID, optionKey);
		return;
	}

	if (option.type !== 'boolean') {
		console.warn(`${module.moduleID} could not disable option`, moduleID, optionKey);
		return;
	}
	const oldValue = option.value;
	const newValue = !option.value;

	Options.set(moduleID, optionKey, newValue);
	stopMonitoringFeature(moduleID, optionKey);

	const featureOptionLink = SettingsNavigation.makeUrlHashLink(moduleID, optionKey);
	const notification = await Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'suspendFeatures',
		header: i18n('penaltyBoxSuspendFeaturesNotificationHeader'),
		message: `${i18n('penaltyBoxSuspendFeaturesNotificationMessage', featureOptionLink)}
			<p><a class="RESNotificationButtonBlue" id="penaltyBoxEnableFeature" href="#">${i18n('penaltyBoxSuspendFeaturesUndoButton')}</a></p>`,
	});

	$(notification.element).on('click', '#penaltyBoxEnableFeature', e => {
		e.preventDefault();
		notification.close();
		pardonSuspendedFeature(moduleID, optionKey, oldValue);
	});
}

function pardonSuspendedFeature(moduleID, optionKey, oldValue) {
	Options.set(moduleID, optionKey, oldValue);
	stopMonitoringFeature(moduleID, optionKey);
	const featureOptionLink = SettingsNavigation.makeUrlHashLink(moduleID, optionKey);
	Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'suspendFeatures',
		header: i18n('penaltyBoxSuspendFeaturesRevertNotificationHeader'),
		message: i18n('penaltyBoxSuspendFeaturesRevertNotificationMessage', featureOptionLink),
	});
}
