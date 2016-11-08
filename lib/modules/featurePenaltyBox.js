import * as Options from '../core/options';
import * as Modules from '../core/modules';

export const module = {};
export const MIN_PENALTY = 1;
export const MAX_PENALTY = 100;

module.moduleID = 'resPenaltyBox';
module.moduleName = 'RES Feature Tracker';
module.category = 'Core';
module.description = 'Automatically throttle or disable RES features which go unused.';
module.options = {
	delayFeatures: {
		type: 'boolean',
		value: true,
		description: 'Throttle showing features which have a high penalty.',
	},
	suspendFeatures: {
		type: 'boolean',
		value: false,
		description: `Turn off features which exceed the maximum penalty (${MAX_PENALTY}).`,
	},
	features: {
		description: 'Track usage of different features',
		type: 'table',
		advanced: true,
		addRowText: 'manually register feature',
		fields: [
			{
				name: 'moduleID',
				type: 'text',
			},
			{
				name: 'featureID',
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
				value: 0,
			},
		],
		value: [],
	},
};

export function alterFeaturePenalty(moduleID, featureID, valueDelta) {
	if (isNaN(parseInt(valueDelta, 10))) {
		console.warn('Could not alter penalty for', moduleID, featureID, ' - bad value:', valueDelta);
		return MIN_PENALTY;
	}
	if (!Modules.isEnabled(module.moduleID)) return MIN_PENALTY;
	const value = getOrAddFeatures(moduleID, featureID);
	if (!value.monitoring) return MIN_PENALTY;
	value.penalty = Math.min(Math.max(value.penalty + valueDelta, MIN_PENALTY), MAX_PENALTY);
	Options.set(module, 'features', module.options.features.value);
	if (value.penalty >= MAX_PENALTY) {
		disableFeature(moduleID, featureID);
	}
	return value.penalty;
}

export function getFeaturePenalty(moduleID, featureID) {
	if (!Modules.isEnabled(module.moduleID)) return MIN_PENALTY;
	const value = getOrAddFeatures(moduleID, featureID);
	if (!value.monitoring) return MIN_PENALTY;
	return value.penalty;
}

export function penalizedDelay(moduleID, featureID, delay) {
	if (!module.options.delayFeatures.value) {
		return delay.value;
	}
	if (delay.value !== delay.default) {
		return delay.value;
	}
	const penalty = getFeaturePenalty(moduleID, featureID);
	if (!penalty || MIN_PENALTY >= penalty) {
		return delay.value;
	}

	const max = delay.penalizedValue || delay.value * 6;
	const initial = delay.default;
	const position = penalty / 100;

	return Math.min(max, (max - initial) * position + initial);
}

function getOrAddFeatures(moduleID, featureID) {
	const value = Options.table.getMatchingValueOrAdd(module, 'features', { moduleID, featureID });
	const obj = Options.table.mapValueToObject(module.options.features, value);
	obj.penalty = parseInt(obj.penalty, 10) || 0;
	return obj;
}

function disableFeature(moduleID, featureID) {
	if (!module.options.suspendFeatures.value) {
		return;
	}

	const featureModule = Modules.get(moduleID);
	const optionKey = featureID;
	const option = featureModule.options[optionKey];
	if (!option) {
		console.warn('Could not find option', moduleID, featureID, optionKey);
		return;
	}
	if (option.type !== 'boolean') {
		console.warn(`${module.moduleID} could not disable option`, moduleID, featureID, optionKey);
		return;
	}
	Options.set(moduleID, optionKey, !option.value);
}
