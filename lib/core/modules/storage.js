/* @flow */

import { Storage } from '../../environment';

export const storage = Storage.wrapBlob('RES.modulePrefs',
	(): boolean => { throw new Error('Default module enabled state should never be accessed'); });

export function setEnabled(moduleId: string, enable: boolean) {
	return storage.set(moduleId, enable);
}
