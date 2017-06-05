/* @flow */

import * as Metadata from '../../../core/metadata';
import { click } from '../../../utils';
import Provider from './Provider';

export default class File extends Provider {
	static key = 'file';
	static text = 'File';
	static notifyBackupDone = false; // Browser indicates it by downloading the file

	read() {
		return new Promise(resolve => {
			const link = document.createElement('input');
			link.type = 'file';
			link.accept = '.resbackup';
			link.addEventListener('change', () => {
				const file = link.files[0];
				const reader = new FileReader();
				reader.onload = () => {
					resolve({
						data: reader.result,
						// $FlowIssue no File.prototype.lastModified
						modified: file.lastModified,
					});
				};
				reader.readAsText(file);
			});
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
		return Promise.resolve(date.valueOf() /* convert to number */);
	}
}
