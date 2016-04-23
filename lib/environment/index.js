// allow the reexports to be overridden
/* eslint-disable import/export */

// export these first so default implementations can use them
export * from 'browserEnvironment';

export { addURLToHistory } from './history';
export { ajax } from './ajax';
export { deleteCookies } from './cookies';
export { isPrivateBrowsing } from './privateBrowsing';
export { multicast } from './multicast';
export { openNewTab, openNewTabs } from './tabs';
export * as PageAction from './pageAction';
export * as Permissions from './permissions';
export * as Session from './session';
export * as Storage from './storage';
export * as XhrCache from './xhrCache';

// and export them again to override any default implementations
export * from 'browserEnvironment';
