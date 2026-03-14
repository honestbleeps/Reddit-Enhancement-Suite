/* @flow */

type RuntimeTransportOptions = {|
	isSafari: boolean,
	callbackSendMessage: (payload: mixed) => Promise<any>,
	browserRuntime?: ?{|
		sendMessage?: (payload: mixed) => Promise<any>,
	|},
	chromeRuntimeSendMessage: (payload: mixed) => mixed,
|};

type TabTransportOptions = {|
	isSafari: boolean,
	callbackSendMessage: (tabId: number, payload: mixed) => Promise<any>,
	browserTabs?: ?{|
		sendMessage?: (tabId: number, payload: mixed) => Promise<any>,
	|},
	chromeTabsSendMessage: (tabId: number, payload: mixed) => mixed,
|};

export function sendRuntimeMessageForBrowser(payload: mixed, {
	isSafari,
	callbackSendMessage,
	browserRuntime,
	chromeRuntimeSendMessage,
}: RuntimeTransportOptions): Promise<any> {
	if (!isSafari) return callbackSendMessage(payload);

	if (browserRuntime && typeof browserRuntime.sendMessage === 'function') {
		return browserRuntime.sendMessage(payload);
	}

	const result = chromeRuntimeSendMessage(payload);
	if (result && typeof result.then === 'function') return result;

	return Promise.reject(new Error('Safari runtime.sendMessage did not return a Promise.'));
}

export function sendTabMessageForBrowser(tabId: number, payload: mixed, {
	isSafari,
	callbackSendMessage,
	browserTabs,
	chromeTabsSendMessage,
}: TabTransportOptions): Promise<any> {
	if (!isSafari) return callbackSendMessage(tabId, payload);

	if (browserTabs && typeof browserTabs.sendMessage === 'function') {
		return browserTabs.sendMessage(tabId, payload);
	}

	const result = chromeTabsSendMessage(tabId, payload);
	if (result && typeof result.then === 'function') return result;

	return Promise.reject(new Error('Safari tabs.sendMessage did not return a Promise.'));
}
