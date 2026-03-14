/* @flow */

import { installGlobalDiagnosticHandlers, reportDiagnostic } from '../utils/diagnostics';

installGlobalDiagnosticHandlers('background');
reportDiagnostic({
	level: 'info',
	message: 'Background diagnostics bootstrap installed.',
	source: 'background',
	stage: 'startup',
});
