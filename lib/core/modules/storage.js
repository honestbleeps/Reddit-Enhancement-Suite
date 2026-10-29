/* @flow */

import * as Storage from '../../environment/foreground/storage';
import type { BlobWrapper } from '../../environment/foreground/storage';

export const storage: BlobWrapper<boolean> = Storage.wrapBlob('RES.modulePrefs',
	(): boolean => { throw new Error('Default module enabled state should never be accessed'); });

export function setEnabled(moduleId: string, enable: boolean): Promise<void> {
	return storage.set(moduleId, enable);
}
