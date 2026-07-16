/* @flow */

export function apiToPromise(func: (...args: mixed[]) => void): (...args: mixed[]) => Promise<any> {
	return (...args) =>
		new Promise((resolve, reject) => {
			let settled = false;
			const settle = (callback, value) => {
				if (settled) return;
				settled = true;
				callback(value);
			};
			const callback = (...results) => {
				if (chrome.runtime.lastError) {
					settle(reject, new Error(chrome.runtime.lastError.message));
				} else {
					settle(resolve, results.length > 1 ? results : results[0]);
				}
			};

			let result;
			try {
				result = func(...args, callback);
			} catch (error) {
				settle(reject, error);
				return;
			}

			if (result && typeof result.then === 'function') {
				result.then(
					value => {
						settle(resolve, value);
					},
					error => {
						if (chrome.runtime.lastError) {
							settle(reject, new Error(chrome.runtime.lastError.message));
						} else {
							settle(reject, error);
						}
					},
				);
			}
		});
}
