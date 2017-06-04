/* @flow */
/* eslint-disable no-unused-vars */
/* eslint-disable require-await */
/* eslint-disable no-empty-function */

import * as Metadata from '../../../core/metadata';

export default class Provider {
	static text = 'Abstract';
	static notifyBackupDone = true;

	static setup() {
		const instance = new this();
		return instance.init().then(v => instance);
	}

	static getBackupDate(data): ?Date {
		const { lastBackup } = data;
		if (typeof lastBackup !== 'object') return;
		if (typeof lastBackup[this.name] === 'number') return new Date(lastBackup[this.name]);
	}

	static getFilename(data) {
		const date = this.getBackupDate(data);
		if (!date) return `unknown-date-${Date.now()}.resbackup`;
		// Make nice-ish suggested filename RES-yyyy-mm-dd-timestamp.resbackup
		return `RES-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${Math.round(date.getTime() / 1000)}-${Metadata.version.replace(/\./g, '_')}.resbackup`;
	}

	async init() {}
	async read(): * {}
	async write(data: *) {}
}
