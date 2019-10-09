/* @flow */

import { isEqual } from 'lodash-es';
import * as Modules from '../modules';
import { multicast } from '../../environment';
import type { ModuleOption } from '../module';
import { batch, shouldPrune } from '../../utils';
import { storage, set } from './storage';

export function _loadModuleOptions() {
	const shouldPrunePromise = shouldPrune('RESoptions');

	return Promise.all(Modules.all().map(async module => {
		if (!Object.values(module.options).some(v => v.hasOwnProperty('value'))) return;

		const storedOptions = await storage.get(module.moduleID);

		// copy over default values
		for (const opt of Object.values(module.options)) {
			opt.default = opt.value;
		}

		if (!storedOptions) {
			// no stored options, there's nothing to copy over
			return;
		}

		for (const [key, storedValue] of Object.entries(storedOptions)) {
			// skip unsaved options (keep default value)
			if (!storedValue) continue;

			if (storedValue.value === undefined) {
				console.error(`Option ${module.moduleID} ${key}'s value is \`undefined\`. Ignoring.`);
				continue;
			}

			// skip obsolete options
			if (!module.options[key]) continue;

			// normal option, copy in the value from storage
			module.options[key].value = storedValue.value;
		}

		shouldPrunePromise.then(should => { if (should) prune(module, storedOptions); });
	}));
}

function prune(module, storedOptions) {
	if (!storedOptions || !Object.entries(storedOptions).length) {
		storage.delete(module.moduleID);
		return;
	}

	for (const [key, { value }] of Object.entries(storedOptions)) {
		const option = module.options[key];
		if (!module.options[key]) {
			console.warn('Could not find option', module.moduleID, key);
			storage.deletePath(module.moduleID, key); // eslint-disable-line no-await-in-loop
			continue;
		}

		if (isEqual(option.default, value)) {
			console.warn('Stored option', module.moduleID, key, 'has the default value. Deleting.');
			storage.deletePath(module.moduleID, key); // eslint-disable-line no-await-in-loop
			continue;
		}
	}
}

const modifiedOptions = new Set();

const notifyModified = multicast(
	batch(keys => { for (const key of keys) modifiedOptions.add(key); }, { size: Infinity }),
	{ name: 'modifiedOptions', local: false },
);

export function save(option: ModuleOption<*>) {
	// Perform a search for the option to find its module and key
	// Doing this isn't especially expensive
	for (const module of Modules.all()) {
		for (const [key, _option] of Object.entries(module.options)) {
			if (option === _option) {
				if (option.value === undefined) {
					throw new Error('Option type can not be saved');
				}

				// Saving certain option types may ignore changes done in other tabs,
				// e.g. if a user is ignored in a tab while this tab is active and used to update the same option
				if (option.type === 'list' || option.type === 'builder' || option.type === 'table') {
					const id = `${module.moduleID}-${key}`;
					if (modifiedOptions.has(id)) {
						console.warn('Overwriting option', module.moduleID, key, 'saved in another tab');
					}

					notifyModified(id);
				}

				if (option.onChange) {
					option.onChange();
				}

				return set(module.moduleID, key, option.value);
			}
		}
	}

	throw new Error('Option not found in module');
}
