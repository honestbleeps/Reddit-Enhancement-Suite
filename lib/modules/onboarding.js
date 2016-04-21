import { Storage, openNewTab } from 'environment';
import { metadata } from '../core';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'onboarding';
	module.moduleName = 'RES Welcome Wagon';
	module.category = 'About RES';
	module.description = 'Learn more about RES at /r/Enhancement';
	module.alwaysEnabled = true;
	module.hidden = true;

	module.go = async function() {
		const storageKey = `RES.firstRun.${metadata.version}`;
		// if this is the first time this version has been run, pop open the what's new tab, background focused.
		if (!(await Storage.has(storageKey))) {
			Storage.set(storageKey, true);
			openNewTab(metadata.updatedURL, false);
		}
	};
}
