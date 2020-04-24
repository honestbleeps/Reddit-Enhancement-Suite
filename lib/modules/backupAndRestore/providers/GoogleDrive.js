/* @flow */

import { ajax, launchAuthFlow } from '../../../environment';
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
			domain: `https://accounts.google.com/signin/oauth?login_hint=${googleLoginHint}`,
			clientId: '568759524377-nv0o2u4afuuulkfcjd7f6guf27qkevpt.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.appdata',
			permissions: process.env.BUILD_TARGET === 'firefox' ? ['https://www.googleapis.com/drive/v3/*'] : ['https://www.googleapis.com/drive/v3/*', 'https://accounts.google.com/signin/oauth'],
		}, async message => {
			await Alert.open(`
				<p><b>RES needs your permission to backup to Google Drive.</b></p>
				<p>${message}</p>
			`, { cancelable: true });
		});

		return this;
	}

	async getExistingFile() {
		const { files: [file] } = await ajax({
			method: 'GET',
			url: 'https://www.googleapis.com/drive/v3/files',
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
			url: 'https://www.googleapis.com/drive/v3/files',
			query: { fields: 'id' },
			data: JSON.stringify({ name: FILE, parents: [FOLDER] }),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}

	async read() {
		const file = await this.getExistingFile();
		if (!file) throw new Error('Could not find backup.');
		return ajax({
			method: 'GET',
			url: `https://www.googleapis.com/drive/v3/files/${file.id}`,
			query: { alt: 'media' },
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
		});
	}

	async write(data: string) {
		const { id } = await this.getOrCreateFile();
		await ajax({
			method: 'PATCH',
			url: `https://www.googleapis.com/upload/drive/v3/files/${id}`,
			query: { uploadType: 'media' },
			data,
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}
}
