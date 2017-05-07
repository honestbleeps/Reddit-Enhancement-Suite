/* @flow */

import _ from 'lodash';
import { sendMessage } from '../../browser';

/**
 * @returns {Promise<boolean, *>}
 */
export const isPrivateBrowsing = _.once(() => sendMessage('isPrivateBrowsing'));
