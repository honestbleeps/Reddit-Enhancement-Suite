import * as Metadata from '../core/metadata';
import { Storage, openNewTab } from '../environment';

export const module = {};

module.moduleID = 'onboarding';
module.moduleName = 'RES Welcome Wagon';
module.category = 'About RES';
module.description = 'Learn more about RES at /r/Enhancement';
module.alwaysEnabled = true;
module.hidden = true;

module.go = async () => {
	const storageKey = `RES.firstRun.${Metadata.version}`;
	// if this is the first time this version has been run, pop open the what's new tab, background focused.
	if (!(await Storage.has(storageKey))) {
		Storage.set(storageKey, true);
		openNewTab(Metadata.updatedURL, false);
	}
};
