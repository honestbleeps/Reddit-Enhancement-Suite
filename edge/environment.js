import { sendMessage, addListener, addInterceptor } from '../chrome/environment';

export {
	sendMessage,
	addListener,
};

// Edge does not have a permissions API
addInterceptor('permissions', () => true);
