/* @flow */

import { AuthType, createClient } from 'webdav/web';
import { Provider } from './Provider';

const FILE = '/res-storage.json';

export class WebDAV extends Provider {
	static key = 'webdav';
	static text = 'WebDAV';
	static supportsAutomaticBackups = true;

	client: string;

	// eslint-disable-next-line require-await
	async init({ webDAVUrl, webDAVDigest, webDAVUsername, webDAVPassword }: *): Promise<Provider> { // eslint-disable-line no-empty-pattern
		this.client = createClient(webDAVUrl, {
			authType: webDAVDigest ? AuthType.digest : AuthType.password,
			username: webDAVUsername,
			password: webDAVPassword,
		});

		return this;
	}

	async read() {
		try {
			return await this.client.getFileContents(FILE);
		} catch (e) {
			throw new Error('Could not find backup.');
		}
	}

	async write(data: string) {
		await this.client.putFileContents(FILE, data);
	}
}
