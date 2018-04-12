/* @flow */

export const MINUTE = 1000 * 60;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function fromSecondsToTime(timeInSeconds: number) {
	const seconds = timeInSeconds % 60;
	const minutes = Math.floor(timeInSeconds / 60) % 60;
	const hours = Math.floor(timeInSeconds / 3600);

	const time = [minutes, seconds];
	if (hours > 0) {
		time.unshift(hours);
	}

	return time.map(part => String(part).padStart(2, '0')).join(':');
}
