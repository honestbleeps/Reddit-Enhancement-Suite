export {
	_addListener,
	_sendMessage,
	Permissions,
	Storage,
	isPrivateBrowsing
} from './foreground';

export { addURLToHistory } from '../lib/environment/history';
export { ajax } from '../lib/environment/ajax';
export { deleteCookies } from '../lib/environment/cookies';
export { multicast } from '../lib/environment/multicast';
export { openNewTab, openNewTabs } from '../lib/environment/tabs';
export * as PageAction from '../lib/environment/pageAction';
export * as Session from '../lib/environment/session';
export * as XhrCache from '../lib/environment/xhrCache';
