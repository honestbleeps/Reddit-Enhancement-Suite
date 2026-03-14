/* @flow */

import test from 'ava';

import { formatDiagnosticReport } from '../report.js';

test('formatDiagnosticReport includes environment details and diagnostics', t => {
	const report = formatDiagnosticReport({
		buildTarget: 'safari',
		browser: 'Safari',
		browserVersion: '18.4',
		extensionId: 'extension-id',
		generatedAt: Date.UTC(2026, 2, 14, 0, 0, 0),
		issueURL: 'https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/new?template=safari-beta-bug.yml',
		os: 'Mac',
		pageURL: 'safari-web-extension://debug.html',
		userAgent: 'Mozilla/5.0 Safari/605.1.15',
		version: '5.24.8',
	}, [{
		level: 'error',
		message: 'Example failure',
		source: 'options',
		stack: 'Error: Example failure\n    at bootstrap',
		stage: 'startup',
		timestamp: Date.UTC(2026, 2, 14, 0, 1, 0),
	}]);

	t.true(report.includes('RES Safari Diagnostics Report'));
	t.true(report.includes('- RES Version: 5.24.8'));
	t.true(report.includes('- Build Target: safari'));
	t.true(report.includes('- Browser: Safari 18.4'));
	t.true(report.includes('- GitHub Safari Beta Issue Template: https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/new?template=safari-beta-bug.yml'));
	t.true(report.includes('[error] 2026-03-14T00:01:00.000Z options/startup: Example failure'));
	t.true(report.includes('Error: Example failure'));
});

test('formatDiagnosticReport handles an empty diagnostics buffer', t => {
	const report = formatDiagnosticReport({
		buildTarget: 'safari',
		browser: 'Safari',
		browserVersion: '18.4',
		extensionId: 'extension-id',
		os: 'Mac',
		pageURL: 'safari-web-extension://debug.html',
		userAgent: 'Mozilla/5.0 Safari/605.1.15',
		version: '5.24.8',
	}, []);

	t.true(report.includes('- No diagnostics have been recorded.'));
});
