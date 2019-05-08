/* @flow */

import { keyedMutex } from '../../utils/async';
import { apiToPromise } from '../utils/api';
import { addListener } from './messaging';

const __set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));
const _set = (key, value) => __set({ [key]: value });
const __get = apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback));
const _get = async (key, defaultValue = null) => (await __get({ [key]: defaultValue }))[key];

addListener('storage-cas', keyedMutex(async ([key, defaultValue, oldValue, newValue]) => {
	const storedValue = await _get(key, defaultValue);
	if (storedValue !== oldValue) return false;
	await _set(key, newValue);
	return true;
}, ([key]) => key));
