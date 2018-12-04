/* @flow */

import { apiToPromise } from './api';

export const __set = apiToPromise((items, callback) => chrome.storage.local.set(items, callback));
export const _set = (key: string, value: any) => __set({ [key]: value });
export const __get = apiToPromise((keys, callback) => chrome.storage.local.get(keys, callback));
export const _get = async (key: string, defaultValue: any = null) => (await __get({ [key]: defaultValue }))[key];
export const _delete = apiToPromise((keys, callback) => chrome.storage.local.remove(keys, callback));
export const _clear = apiToPromise(callback => chrome.storage.local.clear(callback));
