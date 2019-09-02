/* @flow */

import _ from 'lodash';
import * as Modules from '../modules';
import { storage } from './storage';

export async function prune() {
	for (const [moduleID, storedOptions] of Object.entries(await storage.getAll())) {
		if (!storedOptions) continue;

		const module = Modules.get(moduleID);

		const _def = Object.entries(storedOptions).filter(([key, value]) => {
			if (!module.options[key]) {
				console.warn('Could not find option', module.moduleID, key);
				return true; // No option -> any value is default
			}

			return _.isEqual(module.options[key].default, value);
		});

		if (_def.length === storedOptions.length) {
			await storage.delete(moduleID); // eslint-disable-line no-await-in-loop
		} else {
			for (const [key] of _def) {
				await storage.deletePath(moduleID, key); // eslint-disable-line no-await-in-loop
			}
		}
	}
}
