/* @flow */

import type { DiagnosticEntry } from '../environment/utils/diagnostics';

export type DiagnosticReportContext = {|
	buildTarget: string,
	browser: string,
	browserVersion: string,
	extensionId: string,
	generatedAt?: number,
	issueURL?: string,
	os: string,
	pageURL: string,
	userAgent: string,
	version: string,
|};

function formatReportTimestamp(timestamp: number): string {
	try {
		return new Date(timestamp).toISOString();
	} catch (error) {
		return String(timestamp);
	}
}

export function formatDiagnosticReport(
	{
		buildTarget,
		browser,
		browserVersion,
		extensionId,
		generatedAt = Date.now(),
		issueURL = '',
		os,
		pageURL,
		userAgent,
		version,
	}: DiagnosticReportContext,
	entries: DiagnosticEntry[],
): string {
	const lines = [
		'RES Safari Diagnostics Report',
		`Generated: ${formatReportTimestamp(generatedAt)}`,
		'',
		'Environment',
		`- RES Version: ${version}`,
		`- Build Target: ${buildTarget}`,
		`- Extension ID: ${extensionId}`,
		`- Browser: ${browser} ${browserVersion}`,
		`- OS: ${os}`,
		`- Page: ${pageURL}`,
		`- User Agent: ${userAgent}`,
	];

	if (issueURL) {
		lines.push(`- GitHub Safari Beta Issue Template: ${issueURL}`);
	}

	lines.push('', 'Diagnostics');

	if (!entries.length) {
		lines.push('- No diagnostics have been recorded.');
		return lines.join('\n');
	}

	for (const entry of entries) {
		lines.push(`[${entry.level}] ${formatReportTimestamp(entry.timestamp)} ${entry.source}/${entry.stage}: ${entry.message}`);

		if (entry.stack) {
			lines.push(entry.stack);
		}

		lines.push('');
	}

	return lines.join('\n').trimEnd();
}
