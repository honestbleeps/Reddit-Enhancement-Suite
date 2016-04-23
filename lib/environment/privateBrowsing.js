import _ from 'lodash';
import { _sendMessage } from './';

/**
 * @returns {Promise<boolean, *>}
 */
export const isPrivateBrowsing = _.once(() => _sendMessage('isPrivateBrowsing'));
