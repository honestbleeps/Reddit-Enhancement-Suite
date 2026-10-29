/* @flow */

import * as Storage from '../../environment/foreground/storage';
import type { PrefixWrapper } from '../../environment/foreground/storage';
import { getModuleId } from '../module';
import type { OpaqueModuleId } from '../module';

// Don't batch in Firefox, as that may make the storage very slow on init
export const storage: PrefixWrapper<{ [string]: any, ... }> = Storage.wrapPrefix('RESoptions.', (): { [string]: any, ... } => ({}), undefined, process.env.BUILD_TARGET !== 'firefox');

export const loadRaw = (moduleId: string): Promise<{ [string]: any, ... }> => storage.get(moduleId);

export async function get(opaqueId: OpaqueModuleId, optionKey: string): Promise<any> {
	const options = await storage.get(getModuleId(opaqueId));
	return options && options[optionKey];
}

export async function getValue(opaqueId: OpaqueModuleId, optionKey: string): Promise<any> {
	const option = await get(getModuleId(opaqueId), optionKey);
	return option && option.value;
}

export function set(opaqueId: OpaqueModuleId, optionKey: string, value: unknown): Promise<void> {
	if ((/_[\d]+$/).test(optionKey)) {
		optionKey = optionKey.replace(/_[\d]+$/, '');
	}

	return storage.patch(getModuleId(opaqueId), { [optionKey]: { value } });
}
