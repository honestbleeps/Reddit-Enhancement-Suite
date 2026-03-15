/* @flow */

export const VIDEO_BOOTSTRAP_TIMEOUT_MS = 5000;

export function getVideoTransport(
	sources: Array<{| type: string |}> = [],
): 'mp4' | 'hls' | 'dash' | 'unknown' {
	if (sources.some(({ type }) => /mpegurl/i.test(type))) return 'hls';
	if (sources.some(({ type }) => type === 'application/dash+xml')) return 'dash';
	if (sources.length && sources.every(({ type }) => type === 'video/mp4')) return 'mp4';
	return 'unknown';
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
