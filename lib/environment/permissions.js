/**
 * @param {...string} perms Optional Chrome permissions to request.
 * @returns {Promise<void, *>} Resolves if the permissions are granted, rejects otherwise.
 */
export function request(...perms) { // eslint-disable-line no-unused-vars
	return Promise.resolve();
}

/**
 * @param {...string} perms Optional Chrome permissions to remove.
 * @returns {Promise<void, *>} Resolves if the permissions are removed, rejects otherwise.
 */
export function remove(...perms) { // eslint-disable-line no-unused-vars
	return Promise.resolve();
}
