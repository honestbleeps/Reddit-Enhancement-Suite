/* @flow */

import { $ } from '../vendor';
import * as Options from '../core/options';
import * as Modules from '../core/modules';
import { Module } from '../core/module';
import { i18n } from '../environment';
import { mapScalarToObject } from '../utils';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('resPenaltyBox');
export const MIN_PENALTY = 1;
export const MAX_PENALTY = 100;

module.moduleName = 'resPenaltyBoxName';
module.category = 'coreCategory';
module.description = 'resPenaltyBoxDesc';
module.options = {
	delayFeatures: {
		type: 'boolean',
		value: true,
		description: 'resPenaltyBoxDelayFeaturesDesc',
	},
	suspendFeatures: {
		type: 'boolean',
		value: false,
		description: 'resPenaltyBoxSuspendFeaturesDesc',
	},
	features: {
		description: 'resPenaltyBoxFeaturesDesc',
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
				name: 'monitoring',
				type: 'boolean',
				value: true,
			},
			{
				name: 'penalty',
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
		return parseInt(delay.value, 10);
	}


	const max = parseInt(delay.penalizedValue || delay.value, 10) * 6;
	const initial = parseInt(delay.default, 10);
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
	const featureOptionLink = SettingsNavigation.makeUrlHashLink(moduleID, optionKey);
	const notification = await Notifications.showNotification({
		moduleID: module.moduleID,
		optionKey: 'suspendFeatures',
		header: i18n('resPenaltyBoxSuspendFeaturesNotificationHeader'),
		message: `${i18n('resPenaltyBoxSuspendFeaturesNotificationMessage', featureOptionLink)}
			<p><a class="RESNotificationButtonBlue" id="resPenaltyBoxEnableFeature" href="javascript:void 0">${i18n('resPenaltyBoxSuspendFeaturesUndoButton')}</a></p>`,
	});

	$(notification.element).on('click', '#resPenaltyBoxEnableFeature', () => {
		Options.set(moduleID, optionKey, oldValue);
		stopMonitoringFeature(moduleID, optionKey);
		notification.close();
		Notifications.showNotification({
			moduleID: module.moduleID,
			optionKey: 'suspendFeatures',
			header: i18n('resPenaltyBoxSuspendFeaturesRevertNotificationHeader'),
			message: i18n('resPenaltyBoxSuspendFeaturesRevertNotificationMessage', featureOptionLink),
		});
	});
}
