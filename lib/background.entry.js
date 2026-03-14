/* @flow */

import './environment/background/diagnosticsBootstrap';

// load environment listeners
import './environment/background/ajax';
import './environment/background/auth';
import './environment/background/download';
import './environment/background/history';
import './environment/background/i18n';
import './environment/background/loadScript';
import './environment/background/localePersistor';
import { addListener } from './environment/background/messaging';
import './environment/background/multicast';
import './environment/background/pageAction';
import './environment/background/permissions';
import './environment/background/session';
import './environment/background/storage';
import './environment/background/tabs';
import './environment/background/xhrCache';

import { migrate } from './core/migrate';
import { reportDiagnostic } from './environment/utils/diagnostics';


try {
	reportDiagnostic({
		level: 'info',
		message: 'Running background migrations.',
		source: 'background',
		stage: 'startup',
	});
	migrate();
	reportDiagnostic({
		level: 'info',
		message: 'Background entry initialized.',
		source: 'background',
		stage: 'startup',
	});
} catch (error) {
	reportDiagnostic({
		level: 'error',
		message: error.message || 'Background startup failed.',
		source: 'background',
		stack: error.stack || '',
		stage: 'startup',
	});
	throw error;
}

// Restoring a backup may require migrations to be run
addListener('runMigrations', migrate);
