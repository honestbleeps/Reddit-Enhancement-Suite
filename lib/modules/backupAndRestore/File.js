/* @flow */

import { click } from '../../utils';
import Provider from './Provider';
import { serialize, deserialize } from './serialization';

export default class File extends Provider {
	static text = 'file';
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
					try {
						resolve(deserialize(reader.result));
					} catch (err) {
						console.error(err);
						reject(new Error('The file you uploaded did not appear to be a valid RES backup.'));
					}
				};
				reader.readAsText(file);
			});
			link.click();
		});
	}

	async write(data: *) { // eslint-disable-line require-await
		const blob = new Blob([serialize(data)], { type: 'application/json' });
		// Create element to trigger download
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = File.getFilename(data);
		click(link);
	}
}
