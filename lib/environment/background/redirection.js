/* @flow */

import { addListener } from './messaging';

const state = {
	enabled: false,
	options: {},
};

addListener('redirection', ({ type, data }) => {
	if (type === 'updateState') {
		state.enabled = data.enabled;
		state.options = { ...data.options };

		return true;
	} else {
		throw new Error(`Invalid redirection operation: ${type}`);
	}
});
