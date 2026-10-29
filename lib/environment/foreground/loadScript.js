/* @flow */

import { memoize } from 'lodash-es';
import { sendMessage } from './messaging';

export const loadScript: (url: string) => Promise<any> = memoize((url: string) => sendMessage('loadScript', { url }));
