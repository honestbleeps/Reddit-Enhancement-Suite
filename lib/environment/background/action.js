/* @flow */

type ToolbarClickOptions = {|
	sendClickMessage: (tabId: number) => Promise<void>,
	bootstrapActionClick: (tabId: number) => Promise<void>,
	supportsActionClickBootstrap: boolean,
	reportError?: (stage: string, error: Error) => mixed,
|};

export function callActionMethod(actionApi: any, methodName: string, ...args: mixed[]): boolean {
	if (!actionApi || typeof actionApi[methodName] !== 'function') return false;
	actionApi[methodName](...args);
	return true;
}

export async function handleToolbarClick(tabId: ?number, {
	sendClickMessage,
	bootstrapActionClick,
	supportsActionClickBootstrap,
	reportError,
}: ToolbarClickOptions): Promise<void> {
	const onError = reportError || ((stage, error) => {
		console.error(`Failed to handle ${stage}:`, error);
	});

	if (!tabId) {
		onError('toolbar-click:no-tab', new Error('Toolbar click did not include a tab id.'));
		return;
	}

	try {
		await sendClickMessage(tabId);
		return;
	} catch (error) {
		onError('toolbar-click', error);
	}

	if (!supportsActionClickBootstrap) return;

	try {
		await bootstrapActionClick(tabId);
		await sendClickMessage(tabId);
	} catch (error) {
		onError('toolbar-bootstrap', error);
	}
}
