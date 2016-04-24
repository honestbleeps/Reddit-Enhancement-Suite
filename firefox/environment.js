export {
	_addListener,
	_sendMessage
} from './foreground';

export { addURLToHistory } from '../lib/environment/history';
export { ajax } from '../lib/environment/ajax';
export { deleteCookies } from '../lib/environment/cookies';
export { isPrivateBrowsing } from '../lib/environment/privateBrowsing';
export { multicast } from '../lib/environment/multicast';
export { openNewTab, openNewTabs } from '../lib/environment/tabs';
export * as PageAction from '../lib/environment/pageAction';
export * as Permissions from '../lib/environment/permissions';
export * as Session from '../lib/environment/session';
export * as Storage from '../lib/environment/storage';
export * as XhrCache from '../lib/environment/xhrCache';
