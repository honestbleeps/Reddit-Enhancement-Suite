/* @flow */

import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { Alert } from '../../../utils';
import { Provider } from './Provider';

const FILE = 'res-storage.json';

export class OneDrive extends Provider {
	static key = 'onedrive';
	static text = 'OneDrive';
	static supportsAutomaticBackups = true;

	accessToken: string;

	async init(): Promise<this> {
		this.accessToken = await launchAuthFlow({
			domain: 'https://login.live.com/oauth20_authorize.srf',
			clientId: 'a1f95f80-0129-475b-9894-dfbb94f5ff1c',
			scope: 'onedrive.appfolder',
		}, async message => {
			await Alert.open(`
				<p><b>RES needs your permission to backup to OneDrive.</b></p>
				<p>${message}</p>
			`, { cancelable: true });
			await Permissions.request(['https://login.live.com/oauth20_authorize.srf']);
		});

		return this;
	}

	async getMetadata() {
		try {
			return await ajax({
				method: 'GET',
				url: `https://api.onedrive.com/v1.0/drive/special/approot:/${FILE}`,
				query: { select: 'lastModifiedDateTime,@content.downloadUrl' },
				headers: { Authorization: `Bearer ${this.accessToken}` },
				type: 'json',
			});
		} catch (e) {
			if (e.status === 404) {
				throw new Error('Could not find backup.');
			} else {
				throw e;
			}
		}
	}

	async readLastModified() {
		const file = await this.getMetadata();
		return Date.parse(file.lastModifiedDateTime);
	}

	async read() {
		const file = await this.getMetadata();
		const data = await ajax({
			method: 'GET',
			url: file['@content.downloadUrl'],
		});
		return { data, modified: Date.parse(file.lastModifiedDateTime) };
	}

	async write(data: string) {
		const file = await ajax({
			method: 'PUT',
			url: `https://api.onedrive.com/v1.0/drive/special/approot:/${FILE}:/content`,
			data,
			headers: { Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
		return Date.parse(file.lastModifiedDateTime);
	}
}
