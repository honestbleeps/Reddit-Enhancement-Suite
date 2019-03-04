/* @flow */

export { data as context } from './foreground/context';
export { addURLToHistory, isURLVisited } from './foreground/history';
export { ajax } from './foreground/ajax';
export { download } from './foreground/download';
export { getExtensionId, getURL, isOptionsPage, getOptionsURL } from './foreground/id';
export { locale, i18n, _loadI18n } from './foreground/i18n';
export { isPrivateBrowsing } from './foreground/privateBrowsing';
export { launchAuthFlow } from './foreground/auth';
export { multicast } from './foreground/multicast';
export { openNewTab, openNewTabs } from './foreground/tabs';
export * as PageAction from './foreground/pageAction';
export * as Permissions from './foreground/permissions';
export * as Session from './foreground/session';
export * as Storage from './foreground/storage';
export * as XhrCache from './foreground/xhrCache';
