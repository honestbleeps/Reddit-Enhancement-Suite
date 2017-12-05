/* @flow */

import { keyedMutex } from '../../utils';
import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

addListener('storage-cas', keyedMutex(async ([key, oldValue, newValue]) => {
	const storedValue = (await apiToPromise(chrome.storage.local.get)(key))[key];
	if (storedValue !== oldValue) return false;
	await apiToPromise(chrome.storage.local.set)({ [key]: newValue });
	return true;
}, ([key]) => key));
