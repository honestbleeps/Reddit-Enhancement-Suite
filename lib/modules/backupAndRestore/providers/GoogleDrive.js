/* @flow */

import { ajax, launchAuthFlow, Permissions } from '../../../environment';
import { string } from '../../../utils';
import Provider from './Provider';

const FILE = 'res-storage.json';
const FOLDER = 'appDataFolder';

export default class GoogleDrive extends Provider {
	static text = 'Google Drive';

	accessToken: string;
	fileId: string;

	async init() {
		await Permissions.request(['https://content.googleapis.com/*']);

		this.accessToken = await launchAuthFlow({
			domain: 'https://accounts.google.com/o/oauth2/v2/auth',
			clientId: '105571180393-8c75sktsum0rnnjl21kco5al3f1lrpsc.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.appdata',
		});

		this.fileId = await ajax({
			method: 'GET',
			type: 'json',
			headers: { Authorization: `Bearer ${this.accessToken}` },
			url: string.encode`https://content.googleapis.com/drive/v3/files?fields=files(id)&q=${`name="${FILE}"`}&spaces=${FOLDER}`,
		}).then(({ files }) => files[0] && files[0].id || this.create());
	}

	create() {
		return ajax({
			data: JSON.stringify({ name: FILE, parents: [FOLDER] }),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			method: 'POST',
			type: 'json',
			url: 'https://content.googleapis.com/drive/v3/files?fields=id',
		}).then(v => v.id);
	}

	async read() {
		const data = await ajax({
			method: 'GET',
			headers: {
				'x-goog-encode-response-if-executable': 'base64', // Download immediately (Edge 15 appears to not handle the 307s properly)
				Authorization: `Bearer ${this.accessToken}`,
			},
			url: `https://content.googleapis.com/drive/v3/files/${this.fileId}?alt=media`,
		});
		if (!data) throw new Error('Could not find backup');
		return JSON.parse(atob(data));
	}

	async write(data: *) {
		await ajax({
			data: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.accessToken}` },
			method: 'PATCH',
			url: `https://content.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=media`,
		});
	}
}
