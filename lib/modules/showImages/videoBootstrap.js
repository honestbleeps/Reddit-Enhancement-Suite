/* @flow */

export const VIDEO_BOOTSTRAP_TIMEOUT_MS = 5000;
export const EXPANDO_INIT_TIMEOUT_MS = 7000;
export const VIDEO_STALL_GRACE_MS = 1500;
export const VIDEO_MIN_READY_STATE = 3;

export function getVideoTransport(
	sources: Array<{| type: string |}> = [],
): 'mp4' | 'hls' | 'dash' | 'unknown' {
	if (sources.some(({ type }) => /mpegurl/i.test(type))) return 'hls';
	if (sources.some(({ type }) => type === 'application/dash+xml')) return 'dash';
	if (sources.length && sources.every(({ type }) => type === 'video/mp4')) return 'mp4';
	return 'unknown';
}

export function shouldTreatStalledVideoAsFailure({
	currentTime = 0,
	ended = false,
	paused = true,
	readyState = 0,
	minimumReadyState = VIDEO_MIN_READY_STATE,
}: {|
	currentTime?: number,
	ended?: boolean,
	paused?: boolean,
	readyState?: number,
	minimumReadyState?: number,
|} = {}): boolean {
	return !ended && paused && currentTime <= 0 && readyState < minimumReadyState;
}

export function createVideoBootstrapPromise({
	waitForPlayable,
	waitForFailure,
	timeoutMs = VIDEO_BOOTSTRAP_TIMEOUT_MS,
	setTimeoutFn = setTimeout,
	clearTimeoutFn = clearTimeout,
	timeoutMessage = 'Video did not become playable before the bootstrap timeout.',
}: {|
	waitForPlayable: Promise<mixed>,
	waitForFailure: Promise<mixed>,
	timeoutMs?: number,
	setTimeoutFn?: (callback: () => void, timeout: number) => mixed,
	clearTimeoutFn?: (timeoutId: mixed) => void,
	timeoutMessage?: string,
|}): Promise<void> {
	let timeoutId;

	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeoutFn(() => {
			reject(new Error(timeoutMessage));
		}, timeoutMs);
	});

	return Promise.race([
		waitForPlayable.then(() => {}),
		waitForFailure,
		timeoutPromise,
	]).finally(() => {
		if (timeoutId !== undefined) clearTimeoutFn(timeoutId);
	});
}

export function withBootstrapTimeout<T>(
	promise: Promise<T>,
	{
		timeoutMs = EXPANDO_INIT_TIMEOUT_MS,
		setTimeoutFn = setTimeout,
		clearTimeoutFn = clearTimeout,
		timeoutMessage = 'Expando initialization did not finish before the bootstrap timeout.',
	}: {|
		timeoutMs?: number,
		setTimeoutFn?: (callback: () => void, timeout: number) => mixed,
		clearTimeoutFn?: (timeoutId: mixed) => void,
		timeoutMessage?: string,
	|} = {},
): Promise<T> {
	let timeoutId;

	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeoutFn(() => {
			reject(new Error(timeoutMessage));
		}, timeoutMs);
	});

	return Promise.race([promise, timeoutPromise]).finally(() => {
		if (timeoutId !== undefined) clearTimeoutFn(timeoutId);
	});
}
