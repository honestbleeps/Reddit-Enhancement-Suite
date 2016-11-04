import { sendMessage, sendSynchronous, addListener, addInterceptor } from '../chrome/environment';

export {
	sendMessage,
	sendSynchronous,
	addListener,
};

// Edge does not have a permissions API
addInterceptor('permissions', () => true);
