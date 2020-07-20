/* @flow */

import { memoize } from 'lodash-es';
import { sendMessage } from './messaging';

export const loadScript = memoize((url: string) => sendMessage('loadScript', { url }));
