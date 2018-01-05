/* @flow */

let counter = 0;
export function markStart(): string {
	const tag = (++counter).toString();
	performance.mark(tag);
	return tag;
}

export function markEnd(tag: string, name: string) {
	performance.measure(name, tag);
	performance.clearMarks(tag);
}

export function markCheckpoint(tag: string, name: string) {
	performance.measure(name, tag);
	performance.clearMarks(tag);
	performance.mark(tag);
}

export function _logPerfSummary() {
	const timestamps = [];
	// find all continguous measures
	// this corresponds to the checkpoints in init(), since it starts before everything else and is contiguous
	// this is somewhat a hack, but it's simple and it doesn't matter if this breaks completely
	let nextStart = 0;
	for (const { name, startTime, duration } of performance.getEntriesByType('measure')) {
		if (startTime < nextStart) continue;
		nextStart = startTime + duration;
		timestamps.push(`${duration | 0} ${name}`);
	}
	console.log(timestamps.join(' | '));
}
