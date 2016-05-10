import _ from 'lodash';
import { sendMessage } from 'browserEnvironment';

/**
 * @returns {Promise<boolean, *>}
 */
export const isPrivateBrowsing = _.once(() => sendMessage('isPrivateBrowsing'));
