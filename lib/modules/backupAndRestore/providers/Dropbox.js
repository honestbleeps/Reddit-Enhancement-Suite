/* @flow */

import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { Alert } from '../../../utils';
import Provider from './Provider';

const FILE = '/res-storage.json';

export default class Dropbox extends Provider {
	static key = 'dropbox';
	static text = 'Dropbox';
	static supportsAutomaticBackups = true;

	accessToken: string;

	async init(): Promise<this> {
		await Permissions.request(['https://www.dropbox.com/oauth2/authorize']);

		this.accessToken = await launchAuthFlow({
			domain: 'https://www.dropbox.com/oauth2/authorize',
			clientId: 'tdevom9o5xn0hnt',
		}, () => Alert.open('RES needs your permission to connect to Dropbox.', { cancelable: true }));

		return this;
	}

	async readLastModified() {
		const { server_modified: modified } = await ajax({
			method: 'POST',
			url: 'https://api.dropboxapi.com/2/files/get_metadata',
			data: JSON.stringify({ path: FILE }),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
		return Date.parse(modified);
	}

	async read() {
		try {
			const { text, headers } = await ajax({
				method: 'POST',
				url: 'https://content.dropboxapi.com/2/files/download',
				query: { arg: JSON.stringify({ path: FILE }) },
				headers: { Authorization: `Bearer ${this.accessToken}` },
				type: 'raw',
			});
			const modified = JSON.parse(headers['dropbox-api-result']).server_modified;
			return { data: text, modified: Date.parse(modified) };
		} catch (e) {
			if (e.status === 409) {
				throw new Error('Could not find backup.');
			} else {
				throw e;
			}
		}
	}

	async write(data: string) {
		const { server_modified: modified } = await ajax({
			method: 'POST',
			url: 'https://content.dropboxapi.com/2/files/upload',
			query: { arg: JSON.stringify({ path: FILE, mode: 'overwrite', mute: true }) },
			data,
			headers: { 'Content-Type': 'application/octet-stream', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
		return Date.parse(modified);
	}
}
