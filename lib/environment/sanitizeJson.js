/**
 * For some reason, this is necessary in Safari...
 * @param {string} data
 * @returns {string}
 */
export function sanitizeJSON(data) {
	if (process.env.BUILD_TARGET === 'safari') {
		if (data.slice(0, 2) === 's{') {
			data = data.slice(1);
		}
		return data;
	} else {
		return data;
	}
}
