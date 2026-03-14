/* @flow */

import '../environment/foreground/diagnosticsBootstrap';
import { installRequestIdleCallback } from '../utils/requestIdleCallback';
import * as Context from '../environment/foreground/context';
import { getURL } from '../environment';
import { reportDiagnostic } from '../environment/utils/diagnostics';
import * as Core from '../core/init';
import { allowedModules } from '../core/modules';
import { ensureStorageAvailable } from './handleBlocking';
import * as SettingsConsole from './settingsConsole';

installRequestIdleCallback();

function renderFailure(error: Error) {
	document.body.replaceChildren();

	const container = document.createElement('main');
	const title = document.createElement('h1');
	title.textContent = 'RES settings failed to load';

	const summary = document.createElement('p');
	summary.textContent = error.message || 'An unexpected error prevented the settings console from loading.';

	const diagnostics = document.createElement('p');
	const diagnosticsLink = document.createElement('a');
	diagnosticsLink.href = getURL('debug.html');
	diagnosticsLink.textContent = 'Open Safari diagnostics';
	diagnostics.append('Inspect the Safari diagnostics page for the captured runtime error: ', diagnosticsLink);

	const stack = document.createElement('pre');
	stack.textContent = error.stack || '';

	container.append(title, summary, diagnostics, stack);
	document.body.append(container);
}

async function logStage(stage: string, message: string) {
	await reportDiagnostic({
		level: 'info',
		message,
		source: 'options',
		stage,
	});
}

async function bootstrap() {
	await logStage('storage', 'Checking extension storage availability.');
	ensureStorageAvailable();

	if (window !== window.parent) {
		await logStage('context', 'Retrieving context from the parent page.');
		const contextReceived = await Context.retrieveFromParent(1500);
		await logStage(
			'context',
			contextReceived ?
				'Context retrieved.' :
				'Context request timed out. Continuing with standalone context.',
		);
	} else {
		await logStage('context', 'No parent context is required for the standalone options page.');
	}

	allowedModules.push('nightMode', 'notifications');

	await logStage('init', 'Calling Core.init().');
	Core.init();

	await logStage('loadI18n', 'Waiting for translations to load.');
	await Core.loadI18n;
	await logStage('loadI18n', 'Translations loaded.');

	await logStage('loadOptions', 'Waiting for options to load.');
	await Core.loadOptions;
	await logStage('loadOptions', 'Options loaded.');

	await logStage('settingsConsole', 'Starting settings console.');
	SettingsConsole.start();
	await logStage('settingsConsole', 'Settings console started.');

	// Signal to settingsNavigation that it seems to be going well
	window.parent.postMessage({ loadSuccess: true }, '*');
}

bootstrap().catch(async error => {
	console.error(error);
	await reportDiagnostic({
		level: 'error',
		message: error.message || 'Options bootstrap failed.',
		source: 'options',
		stack: error.stack || '',
		stage: 'startup',
	});
	renderFailure(error);
	window.parent.postMessage({ failedToLoad: true }, '*');
});
