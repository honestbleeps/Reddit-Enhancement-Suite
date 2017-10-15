/* @flow */

import { CACHED_OAUTH_LOGIN_HINT } from '../../../constants/localStorage';

/* eslint-disable no-unused-vars */
export class Provider {
	static key = 'abstract';
	static text = 'Abstract';
	static notifyBackupDone = true;
	static supportsAutomaticBackups = false;

	init(): Promise<Provider> {
		return Promise.resolve(this);
	}

	getLoginHint(): ?string {
		return localStorage.getItem(`${CACHED_OAUTH_LOGIN_HINT}.${this.constructor.key}`);
	}

	setLoginHint(value: string) {
		localStorage.setItem(`${CACHED_OAUTH_LOGIN_HINT}.${this.constructor.key}`, value);
	}

	invalidateLoginHint() {
		localStorage.removeItem(`${CACHED_OAUTH_LOGIN_HINT}.${this.constructor.key}`);
	}

	read(): Promise<string> { throw new Error('unimplemented'); }

	write(data: string): Promise<void> { throw new Error('unimplemented'); }
}
