import _ from 'lodash';
import { _sendMessage } from './_sendMessage';

/**
 * @returns {Promise<boolean, *>}
 */
export const isPrivateBrowsing = _.once(() => {
	if (process.env.BUILD_TARGET === 'chrome') {
		return Promise.resolve(chrome.extension.inIncognitoContext);
	} else {
		return _sendMessage('isPrivateBrowsing');
	}
});
