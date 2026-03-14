/* @flow */

type ToolbarClickOptions = {|
	openDiagnosticsPage: () => Promise<void>,
	reportError: (stage: string, error: Error) => mixed,
	sendClickMessage: (tabId: number) => Promise<void>,
	bootstrapActionClick: (tabId: number) => Promise<void>,
	supportsActionClickBootstrap: boolean,
|};

export function callActionMethod(actionApi: any, methodName: string, ...args: mixed[]): boolean {
	if (!actionApi || typeof actionApi[methodName] !== 'function') return false;
	actionApi[methodName](...args);
	return true;
}

export async function handleToolbarClick(tabId: ?number, {
	openDiagnosticsPage,
	reportError,
	sendClickMessage,
	bootstrapActionClick,
	supportsActionClickBootstrap,
}: ToolbarClickOptions): Promise<void> {
	if (!tabId) {
		reportError('toolbar-click:no-tab', new Error('Toolbar click did not include a tab id.'));

		try {
			await openDiagnosticsPage();
		} catch (openError) {
			reportError('toolbar-click:no-tab:open-diagnostics', openError);
		}

		return;
	}

	try {
		await sendClickMessage(tabId);
		return;
	} catch (error) {
		reportError('toolbar-click', error);
	}

	if (!supportsActionClickBootstrap) return;

	try {
		await bootstrapActionClick(tabId);
		await sendClickMessage(tabId);
	} catch (error) {
		reportError('toolbar-bootstrap', error);

		try {
			await openDiagnosticsPage();
		} catch (openError) {
			reportError('toolbar-bootstrap:open-diagnostics', openError);
		}
	}
}
