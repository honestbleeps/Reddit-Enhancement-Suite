/* @flow */

import { Module } from '../core/module';
import * as Metadata from '../core/metadata';
import { Storage, openNewTab } from '../environment';

export const module: Module<*> = new Module('onboarding');

module.moduleName = 'onboardingName';
module.category = 'aboutCategory';
module.description = 'onboardingDesc';
module.alwaysEnabled = true;
module.hidden = true;

const firstRunStorage = Storage.wrapDomain(version => `RES.firstRun.${version}`, (null: null | boolean));

module.go = async () => {
	// if this is the first time this version has been run, pop open the what's new tab, background focused.
	if (!(await firstRunStorage.has(Metadata.version))) {
		firstRunStorage.set(Metadata.version, true);
		openNewTab(Metadata.updatedURL, false);
	}
};
