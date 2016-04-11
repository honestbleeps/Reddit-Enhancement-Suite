import 'babel-polyfill';

import './_browserInit';

export { addURLToHistory } from './history';
export { ajax } from './ajax';
export { deleteCookies } from './cookies';
export { isPrivateBrowsing } from './privateBrowsing';
export { multicast } from './multicast';
export { openNewTab, openNewTabs } from './tabs';
export { sanitizeJSON } from './sanitizeJson';
export * as pageAction from './pageAction';
export * as permissions from './permissions';
export * as session from './session';
export * as storage from './storage';
export * as xhrCache from './xhrCache';
