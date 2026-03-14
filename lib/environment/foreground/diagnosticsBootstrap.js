/* @flow */

import { getExecutionContextSource, installGlobalDiagnosticHandlers, installURLDiagnosticGuard, reportDiagnostic } from '../utils/diagnostics';

const source = getExecutionContextSource();

installGlobalDiagnosticHandlers(source);
installURLDiagnosticGuard(source);
reportDiagnostic({
	level: 'info',
	message: 'Page diagnostics bootstrap installed.',
	source,
	stage: 'startup',
});
