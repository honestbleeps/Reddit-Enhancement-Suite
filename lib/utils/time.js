/* @flow */

export const MINUTE = 1000 * 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function fromSecondsToTime(timeInSeconds: number) {
	const hours = Math.floor(timeInSeconds / 3600);
	const minutes = Math.floor((timeInSeconds - (hours * 3600)) / 60);
	const seconds = timeInSeconds - (hours * 3600) - (minutes * 60);
	let time = '';

	if (hours !== 0) {
		time += String(hours).padStart(2, '0');
		time += ':';
	}

	time += String(minutes).padStart(2, '0');
	time += ':';
	time += String(seconds).padStart(2, '0');

	return time;
}

export function fromYoutubeTimecodeToSeconds(tc: string) {
	let timeSeconds = Number(tc);
	if (Number.isNaN(timeSeconds)) {
		const tcobj = (tc.split(/(\d+[hms])/)
			.filter(Boolean)
			.reduce((acc, match) => {
				acc[match.slice(-1)] = Number(match.slice(0, -1));
				return acc;
			}, {}));
		timeSeconds = (tcobj.h || 0) * 3600 + (tcobj.m || 0) * 60 + (tcobj.s || 0);
	}
	return timeSeconds;
}
