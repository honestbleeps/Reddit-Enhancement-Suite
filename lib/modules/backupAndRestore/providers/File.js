/* @flow */

import * as Metadata from '../../../core/metadata';
import { click, waitForEvent } from '../../../utils';
import { Provider } from './Provider';

export class File extends Provider {
	static key = 'file';
	static text = 'File';
	static notifyBackupDone = false; // Browser indicates it by downloading the file

	read() {
		return new Promise((resolve, reject) => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup';
			link.addEventListener('change', () => {
				const file = link.files[0];
				const reader = new FileReader();
				reader.onload = () => {
					resolve((reader.result: any));
				};
				reader.readAsText(file);
			});
			// There is no proper way to detect when a file dialog is closed.
			// We must use setTimeout so that the change event fires first.
			waitForEvent(window, 'mousemove').then(() => setTimeout(() => {
				if (!link.files.length) reject(new Error('No file selected.'));
			}));
			link.click();
		});
	}

	write(data: string) {
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
