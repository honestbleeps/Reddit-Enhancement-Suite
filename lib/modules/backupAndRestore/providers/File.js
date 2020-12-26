/* @flow */

import * as Metadata from '../../../core/metadata';
import { click, waitForEvent } from '../../../utils';
import { Provider } from './Provider';

export class File extends Provider {
	static key = 'file';
	static text = 'backupAndRestoreProvidersFile';
	static notifyBackupDone = false; // Browser indicates it by downloading the file

	read(): Promise<string> {
		return new Promise((resolve, reject) => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup, .json';
			let loading = false;
			link.addEventListener('change', () => {
				loading = true;
				const file = link.files[0];
				const reader = new FileReader();
				reader.onload = () => {
					resolve((reader.result: any));
				};
				reader.readAsText(file);
			});
			// There is no proper way to detect when a file dialog is closed.
			// We must use requestIdleCallback so that the change event has time to fire first.
			Promise.all([waitForEvent(window, 'mousemove'), waitForEvent(window, 'focus')]).then(() => requestIdleCallback(() => {
				if (loading) return; // Reader has started loading
				if (!link.files.length) reject(new Error('No file selected.'));
			}));
			link.click();
		});
	}

	write(data: string): Promise<void> {
		const blob = new Blob([data], { type: 'application/json' });
		// Create element to trigger download
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		const date = new Date();
		link.download = `RES-${date.getUTCFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${Math.round(date.getTime() / 1000)}-${Metadata.version.replace(/\./g, '_')}.resbackup`;
		click(link);
		return Promise.resolve();
	}
}
