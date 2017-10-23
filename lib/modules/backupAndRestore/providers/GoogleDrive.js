/* @flow */

import { Base64 } from 'js-base64';
import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { Alert } from '../../../utils';
import { Provider } from './Provider';

const FILE = 'res-storage.json';
const FOLDER = 'appDataFolder';

export class GoogleDrive extends Provider {
	static key = 'googledrive';
	static text = 'Google Drive';
	static supportsAutomaticBackups = true;

	accessToken: string;

	async init({ googleLoginHint }: *): Promise<Provider> {
		this.accessToken = await launchAuthFlow({
			domain: `https://accounts.google.com/o/oauth2/v2/auth?login_hint=${googleLoginHint}`,
			clientId: '568759524377-nv0o2u4afuuulkfcjd7f6guf27qkevpt.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.appdata',
		}, async message => {
			await Alert.open(`
				<p><b>RES needs your permission to backup to Google Drive.</b></p>
				<p>${message}</p>
			`, { cancelable: true });
			await Permissions.request(['https://accounts.google.com/o/oauth2/v2/auth', 'https://content.googleapis.com/drive/v3/*']);
		});

		return this;
	}

	async getExistingFile() {
		const { files: [file] } = await ajax({
			method: 'GET',
			url: 'https://content.googleapis.com/drive/v3/files',
			query: { fields: 'files(id)', q: `name="${FILE}"`, spaces: FOLDER },
			headers: { Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
		return file;
	}

	async getOrCreateFile() {
		const existingFile = await this.getExistingFile();
		if (existingFile) return existingFile;

		// create new file
		return ajax({
			method: 'POST',
			url: 'https://content.googleapis.com/drive/v3/files',
			query: { fields: 'id' },
			data: JSON.stringify({ name: FILE, parents: [FOLDER] }),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}

	async read() {
		const file = await this.getExistingFile();
		if (!file) throw new Error('Could not find backup.');
		const data = await ajax({
			method: 'GET',
			url: `https://content.googleapis.com/drive/v3/files/${file.id}`,
			query: { alt: 'media' },
			headers: {
				'x-goog-encode-response-if-executable': 'base64', // Download immediately (Edge 15 appears to not handle the 307s properly)
				Authorization: `Bearer ${this.accessToken}`,
			},
		});
		return Base64.decode(data);
	}

	async write(data: string) {
		const { id } = await this.getOrCreateFile();
		await ajax({
			method: 'PATCH',
			url: `https://content.googleapis.com/upload/drive/v3/files/${id}`,
			query: { uploadType: 'media' },
			data,
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}
}
