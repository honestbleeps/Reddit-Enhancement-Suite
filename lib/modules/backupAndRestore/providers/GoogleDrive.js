/* @flow */

import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { Alert, string } from '../../../utils';
import Provider from './Provider';

const FILE = 'res-storage.json';
const FOLDER = 'appDataFolder';

export default class GoogleDrive extends Provider {
	static key = 'googledrive';
	static text = 'Google Drive';

	accessToken: string;

	async init() {
		await Permissions.request(['https://content.googleapis.com/*']);

		this.accessToken = await launchAuthFlow({
			domain: 'https://accounts.google.com/o/oauth2/v2/auth',
			clientId: '237880911304-a4040773adrek8uq6dpbg2p7308kf03u.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.appdata',
		}, message => Alert.open(`
			<p>RES needs your permission to connect to Google Drive.</p>
			<p><b>${message}</b></p>
		`, { cancelable: true }));

		return this;
	}

	async getExistingFile() {
		const { files: [file] } = await ajax({
			method: 'GET',
			url: string.encode`https://content.googleapis.com/drive/v3/files?fields=files(id,modifiedTime)&q=${`name="${FILE}"`}&spaces=${FOLDER}`,
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
			url: 'https://content.googleapis.com/drive/v3/files?fields=id',
			data: JSON.stringify({ name: FILE, parents: [FOLDER] }),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
	}

	async readLastModified() {
		const file = await this.getExistingFile();
		if (!file) throw new Error('Could not find backup.');
		return Date.parse(file.modifiedTime);
	}

	async read() {
		const file = await this.getExistingFile();
		if (!file) throw new Error('Could not find backup.');
		const data = await ajax({
			method: 'GET',
			url: `https://content.googleapis.com/drive/v3/files/${file.id}?alt=media`,
			headers: {
				'x-goog-encode-response-if-executable': 'base64', // Download immediately (Edge 15 appears to not handle the 307s properly)
				Authorization: `Bearer ${this.accessToken}`,
			},
		});
		return { data: atob(data), modified: Date.parse(file.modifiedTime) };
	}

	async write(data: string) {
		const { id } = await this.getOrCreateFile();
		const { modifiedTime } = await ajax({
			method: 'PATCH',
			url: `https://content.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,
			data,
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			type: 'json',
		});
		return Date.parse(modifiedTime);
	}
}
