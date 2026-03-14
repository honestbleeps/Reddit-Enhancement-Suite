/* global chrome */
/* @flow */

import '../environment/foreground/diagnosticsBootstrap';
import * as Metadata from '../core/metadata';
import { buildTarget } from '../environment/utils/capabilities';
import { clearDiagnostics, getDiagnostics } from '../environment/utils/diagnostics';
import { getExtensionId, getURL } from '../environment';
import { OS, browser, version as browserVersion } from '../utils/browserDetect';
import { formatDiagnosticReport } from './report';

const body = document.body;
let latestEntries = [];
let lastStatusMessage = '';

function formatTimestamp(timestamp: number): string {
	try {
		return new Date(timestamp).toLocaleString();
	} catch (error) {
		return String(timestamp);
	}
}

function getExtensionInfo() {
	try {
		return getExtensionId();
	} catch (error) {
		return 'Unavailable';
	}
}

function getReportContext() {
	return {
		buildTarget,
		browser,
		browserVersion: String(browserVersion),
		extensionId: getExtensionInfo(),
		issueURL: Metadata.safariBetaIssueURL,
		os: OS,
		pageURL: location.href,
		userAgent: navigator.userAgent || 'Unavailable',
		version: Metadata.version,
	};
}

function createMetadataRow(label: string, value: string | HTMLElement) {
	const item = document.createElement('li');
	const strong = document.createElement('strong');
	strong.textContent = `${label}: `;
	item.append(strong);

	if (typeof value === 'string') {
		item.append(value);
	} else {
		item.append(value);
	}

	return item;
}

function fallbackCopyText(text: string) {
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', 'readonly');
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	document.body.append(textarea);
	textarea.select();
	textarea.setSelectionRange(0, textarea.value.length);

	const copied = typeof document.execCommand === 'function' && document.execCommand('copy');
	textarea.remove();

	if (!copied) throw new Error('The browser rejected the fallback clipboard copy request.');
}

function setStatusMessage(message: string) {
	lastStatusMessage = message;
}

async function copyReport() {
	const report = formatDiagnosticReport(getReportContext(), latestEntries);

	try {
		if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
			await navigator.clipboard.writeText(report);
		} else {
			fallbackCopyText(report);
		}
		setStatusMessage('Copied the diagnostics report to the clipboard.');
	} catch (error) {
		try {
			fallbackCopyText(report);
			setStatusMessage('Copied the diagnostics report to the clipboard.');
		} catch (fallbackError) {
			setStatusMessage(`Could not copy the diagnostics report automatically: ${fallbackError.message}`);
		}
	}

	renderDiagnostics(latestEntries);
}

function downloadReport() {
	const report = formatDiagnosticReport(getReportContext(), latestEntries);
	const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
	const href = URL.createObjectURL(blob);
	const downloadLink = document.createElement('a');
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

	downloadLink.href = href;
	downloadLink.download = `res-safari-diagnostics-${timestamp}.txt`;
	downloadLink.click();

	setStatusMessage('Downloaded a diagnostics report.');
	renderDiagnostics(latestEntries);

	setTimeout(() => URL.revokeObjectURL(href), 0);
}

function renderDiagnostics(entries) {
	latestEntries = entries;
	body.replaceChildren();

	const container = document.createElement('main');
	const title = document.createElement('h1');
	title.textContent = 'RES Safari Diagnostics';

	const intro = document.createElement('p');
	intro.textContent = 'Use this page to inspect runtime failures captured from the Safari extension and export them for GitHub bug reports.';

	const actions = document.createElement('p');
	const clearButton = document.createElement('button');
	clearButton.type = 'button';
	clearButton.textContent = 'Clear diagnostics';
	clearButton.addEventListener('click', async () => {
		await clearDiagnostics();
		setStatusMessage('Cleared stored diagnostics.');
		renderDiagnostics([]);
	});

	const copyButton = document.createElement('button');
	copyButton.type = 'button';
	copyButton.textContent = 'Copy report';
	copyButton.addEventListener('click', () => {
		copyReport().catch(error => {
			setStatusMessage(`Could not copy the diagnostics report: ${error.message}`);
			renderDiagnostics(latestEntries);
		});
	});

	const downloadButton = document.createElement('button');
	downloadButton.type = 'button';
	downloadButton.textContent = 'Download report';
	downloadButton.addEventListener('click', downloadReport);

	const optionsLink = document.createElement('a');
	optionsLink.href = getURL('options.html');
	optionsLink.textContent = 'Open RES settings';

	const issueLink = document.createElement('a');
	issueLink.href = Metadata.safariBetaIssueURL;
	issueLink.textContent = 'Open Safari beta bug report';
	issueLink.rel = 'noopener noreferrer';
	issueLink.target = '_blank';

	actions.append(
		clearButton,
		document.createTextNode(' '),
		copyButton,
		document.createTextNode(' '),
		downloadButton,
		document.createTextNode(' '),
		optionsLink,
		document.createTextNode(' '),
		issueLink,
	);
	container.append(title, intro, actions);

	const status = document.createElement('p');
	status.textContent = lastStatusMessage || 'Copy or download the report before filing a Safari beta issue.';
	container.append(status);

	const metadata = document.createElement('ul');
	metadata.append(
		createMetadataRow('RES version', Metadata.version),
		createMetadataRow('Build target', buildTarget),
		createMetadataRow('Extension ID', getExtensionInfo()),
		createMetadataRow('Browser', `${browser} ${String(browserVersion)}`),
		createMetadataRow('OS', OS),
		createMetadataRow('Current page', location.href),
	);
	container.append(metadata);

	if (!entries.length) {
		const empty = document.createElement('p');
		empty.textContent = 'No diagnostics have been recorded yet.';
		container.append(empty);
		body.append(container);
		return;
	}

	const list = document.createElement('ol');
	for (const entry of entries.slice().reverse()) {
		const item = document.createElement('li');
		const heading = document.createElement('p');
		heading.textContent = `[${entry.level}] ${formatTimestamp(entry.timestamp)} ${entry.source}/${entry.stage}: ${entry.message}`;
		item.append(heading);

		if (entry.stack) {
			const stack = document.createElement('pre');
			stack.textContent = entry.stack;
			item.append(stack);
		}

		list.append(item);
	}

	container.append(list);
	body.append(container);
}

async function refreshDiagnostics() {
	renderDiagnostics(await getDiagnostics());
}

refreshDiagnostics();

if (chrome.storage && chrome.storage.onChanged) {
	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName === 'local' && changes) refreshDiagnostics();
	});
}
