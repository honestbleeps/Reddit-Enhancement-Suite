/* @flow */

import * as Modules from '../modules';
import type { ModuleOption } from '../module';
import { shouldPrune } from '../../utils';
import { prune } from './prune';
import { storage, set } from './storage';

export function _loadModuleOptions() {
	shouldPrune('RESoptions').then(should => { if (should) prune(); });

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

			// skip obsolete options
			if (!module.options[key]) continue;

			// normal option, copy in the value from storage
			module.options[key].value = storedValue.value;
		}
	}));
}

export function save(option: ModuleOption<*>) {
	// Perform a search for the option to find its module and key
	// Doing this isn't especially expensive
	for (const module of Modules.all()) {
		for (const [key, _option] of Object.entries(module.options)) {
			if (option === _option) {
				if (option.value === undefined) {
					throw new Error('Option type can not be saved');
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
