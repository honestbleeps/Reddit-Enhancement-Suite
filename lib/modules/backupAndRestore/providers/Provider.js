/* @flow */
/* eslint-disable no-unused-vars */

type ModifiedTime = number;

export default class Provider {
	static key = 'abstract';
	static text = 'Abstract';
	static notifyBackupDone = true;
	static supportsAutomaticBackups = false;

	init(): Promise<this> {
		return Promise.resolve(this);
	}

	readLastModified(): Promise<ModifiedTime> {
		return Promise.reject(new Error('This provider does not support retrieving last modified date without a backup.'));
	}

	read(): Promise<{| data: string, modified: ModifiedTime |}> { throw new Error('unimplemented'); }

	write(data: string): Promise<ModifiedTime> { throw new Error('unimplemented'); }
}
