/* @flow */

import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { Alert } from '../../../utils';
import { Provider } from './Provider';

const FILE = '/res-storage.json';

export class Dropbox extends Provider {
	static key = 'dropbox';
	static text = 'Dropbox';
	static supportsAutomaticBackups = true;

	accessToken: string;

	async init(): Promise<this> {
		this.accessToken = await launchAuthFlow({
			domain: 'https://www.dropbox.com/oauth2/authorize',
			clientId: 'tdevom9o5xn0hnt',
		}, async message => {
			await Alert.open(`
				<p><b>RES needs your permission to backup to Dropbox.</b></p>
				<p>${message}</p>
			`, { cancelable: true });
			await Permissions.request(['https://www.dropbox.com/oauth2/authorize']);
		});

		return this;
	}

	async read() {
		try {
			return await ajax({
				method: 'POST',
				url: 'https://content.dropboxapi.com/2/files/download',
				query: { arg: JSON.stringify({ path: FILE }) },
				headers: { Authorization: `Bearer ${this.accessToken}` },
			});
		} catch (e) {
			if (e.status === 409) {
				throw new Error('Could not find backup.');
			} else {
				throw e;
			}
		}
	}

	async write(data: string) {
		await ajax({
			method: 'POST',
			url: 'https://content.dropboxapi.com/2/files/upload',
			query: { arg: JSON.stringify({ path: FILE, mode: 'overwrite', mute: true }) },
			data,
			headers: { 'Content-Type': 'application/octet-stream', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}
}
