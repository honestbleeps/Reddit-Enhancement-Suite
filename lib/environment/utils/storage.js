/* @flow */

import { apiToPromise } from '../utils/api';

export const __set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));
export const _set = (key, value) => __set({ [key]: value });
export const __get = apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback));
export const _get = async (key, defaultValue = null) => (await __get({ [key]: defaultValue }))[key];
export const _delete = apiToPromise((keys, callback) => chrome.storage.local.remove(keys, callback));
export const _clear = apiToPromise(callback => chrome.storage.local.clear(callback));
