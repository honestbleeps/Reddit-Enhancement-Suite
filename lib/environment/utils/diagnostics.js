/* @flow */

import { apiToPromise } from './api.js';
import { getBuildTarget } from './capabilities.js';

export type DiagnosticLevel = 'info' | 'warn' | 'error';

export type DiagnosticEntry = {|
	level: DiagnosticLevel,
	message: string,
	source: string,
	stack: string,
	stage: string,
	timestamp: number,
|};

type DiagnosticInput = {|
	level?: DiagnosticLevel,
	message: string,
	source?: string,
	stack?: string,
	stage: string,
	timestamp?: number,
|};

export const DIAGNOSTICS_KEY = 'RES.safariDiagnostics';
export const DIAGNOSTICS_LIMIT = 75;

export function shouldCollectDiagnostics(buildTarget: ?string = process.env.BUILD_TARGET): boolean {
	return getBuildTarget(buildTarget) === 'safari';
}

export function clearDiagnosticEntries(): DiagnosticEntry[] {
	return [];
}

export function appendDiagnosticEntry(entries: DiagnosticEntry[], entry: DiagnosticEntry, limit: number = DIAGNOSTICS_LIMIT): DiagnosticEntry[] {
	return [...entries, entry].slice(-limit);
}

export function getExecutionContextSource(): string {
	if (typeof location === 'object') {
		if (location.pathname.endsWith('/options.html')) return 'options';
		if (location.pathname.endsWith('/debug.html')) return 'debug';
		if (location.protocol.startsWith('http')) return 'foreground';
	}

	if (
		typeof self === 'object' &&
		self &&
		self.constructor &&
		self.constructor.name === 'ServiceWorkerGlobalScope'
	) {
		return 'background';
	}

	return 'extension';
}

function normalizeDiagnosticEntry({
	level = 'error',
	message,
	source = getExecutionContextSource(),
	stack = '',
	stage,
	timestamp = Date.now(),
}: DiagnosticInput): DiagnosticEntry {
	return {
		level,
		message,
		source,
		stack,
		stage,
		timestamp,
	};
}

function getStorageArea() {
	if (typeof chrome !== 'object' || !chrome.storage || !chrome.storage.local) return null;
	return chrome.storage.local;
}

async function readStoredDiagnostics(): Promise<DiagnosticEntry[]> {
	const storageArea = getStorageArea();
	if (!storageArea) return clearDiagnosticEntries();

	const get = apiToPromise((keys, callback) => storageArea.get(keys, callback));
	const stored = await get({ [DIAGNOSTICS_KEY]: clearDiagnosticEntries() });
	return Array.isArray(stored[DIAGNOSTICS_KEY]) ? stored[DIAGNOSTICS_KEY] : clearDiagnosticEntries();
}

async function writeStoredDiagnostics(entries: DiagnosticEntry[]): Promise<void> {
	const storageArea = getStorageArea();
	if (!storageArea) return;

	const set = apiToPromise((items, callback) => storageArea.set(items, callback));
	await set({ [DIAGNOSTICS_KEY]: entries });
}

function describeErrorLike(reason: mixed): {| message: string, stack: string |} {
	if (reason instanceof Error) {
		return {
			message: reason.message || reason.name || 'Unhandled error',
			stack: reason.stack || '',
		};
	}

	if (typeof reason === 'string') {
		return { message: reason, stack: '' };
	}

	if (reason && typeof reason === 'object') {
		const { message, stack } = (reason: any);
		return {
			message: typeof message === 'string' ? message : JSON.stringify(reason),
			stack: typeof stack === 'string' ? stack : '',
		};
	}

	return {
		message: String(reason || 'Unknown error'),
		stack: '',
	};
}

export async function reportDiagnostic(entryInput: DiagnosticInput): Promise<DiagnosticEntry | null> {
	if (!shouldCollectDiagnostics()) return null;

	const entry = normalizeDiagnosticEntry(entryInput);

	try {
		const diagnostics = await readStoredDiagnostics();
		await writeStoredDiagnostics(appendDiagnosticEntry(diagnostics, entry));
	} catch (error) {
		console.error('Failed to persist Safari diagnostics', error);
	}

	return entry;
}

export function getDiagnostics(): Promise<DiagnosticEntry[]> {
	if (!shouldCollectDiagnostics()) return Promise.resolve(clearDiagnosticEntries());
	return readStoredDiagnostics();
}

export async function clearDiagnostics(): Promise<void> {
	if (!shouldCollectDiagnostics()) return;
	await writeStoredDiagnostics(clearDiagnosticEntries());
}

export function installGlobalDiagnosticHandlers(source: string, stage: string = 'runtime') {
	if (!shouldCollectDiagnostics()) return;

	const target: any =
		typeof self === 'object' ? self :
		typeof window === 'object' ? window :
		null;

	if (!target || typeof target.addEventListener !== 'function') return;

	if (!target.__resDiagnosticsSources) target.__resDiagnosticsSources = new Set();
	if (target.__resDiagnosticsSources.has(source)) return;
	target.__resDiagnosticsSources.add(source);

	target.addEventListener('error', event => {
		const detail = describeErrorLike(event.error || event);
		const locationHint = [event.filename, event.lineno, event.colno].filter(v => v !== undefined && v !== null).join(':');

		reportDiagnostic({
			level: 'error',
			message: locationHint ? `${detail.message} (${locationHint})` : detail.message,
			source,
			stack: detail.stack,
			stage,
		});
	});

	target.addEventListener('unhandledrejection', event => {
		const detail = describeErrorLike(event.reason);
		reportDiagnostic({
			level: 'error',
			message: detail.message,
			source,
			stack: detail.stack,
			stage: `${stage}:unhandledrejection`,
		});
	});
}

export function installURLDiagnosticGuard(source: string) {
	if (!shouldCollectDiagnostics()) return;
	if (typeof window !== 'object' && typeof self !== 'object') return;

	const target: any =
		typeof window === 'object' ? window :
		typeof self === 'object' ? self :
		null;

	if (!target || typeof target.URL !== 'function' || target.__resURLDiagnosticGuardInstalled) return;
	target.__resURLDiagnosticGuardInstalled = true;

	const NativeURL = target.URL;
	const DiagnosticURL = new Proxy(NativeURL, {
		construct(urlConstructor, args, newTarget) {
			try {
				return Reflect.construct(urlConstructor, args, newTarget);
			} catch (error) {
				reportDiagnostic({
					level: 'error',
					message: `URL constructor failed for arguments: ${JSON.stringify(args.map(value => String(value)))}`,
					source,
					stack: error && error.stack ? error.stack : '',
					stage: 'runtime:url',
				});
				throw error;
			}
		},
	});

	target.URL = DiagnosticURL;
}
