import _ from 'lodash';
import { _sendMessage } from 'environment';

/**
 * @returns {Promise<boolean, *>}
 */
export const isPrivateBrowsing = _.once(() => _sendMessage('isPrivateBrowsing'));
