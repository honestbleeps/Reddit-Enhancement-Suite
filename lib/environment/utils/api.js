/* @flow */

export function apiToPromise(func: (...args: unknown[]) => void): (...args: unknown[]) => Promise<any> {
	return (...args) =>
		new Promise((resolve, reject) => {
			func(...args, (...results: unknown[]) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(results.length > 1 ? results : results[0]);
				}
			});
		});
}
