/* @flow */

import { Storage } from '../environment';
import { DAY, WEEK } from './time';

export async function maybePruneOldEntries(id: string, entryStorage: *, keepTrackDays: number = 30) {
	if (!await shouldPrune(id)) return;

	const keepTrackPeriod = DAY * keepTrackDays;
	const now = Date.now();
	for (const [id, data] of Object.entries(await entryStorage.getAll())) {
		const { updateTime } = data || {}; // data may not be `undefined` due to some older bug
		if (!updateTime || (now - updateTime) > keepTrackPeriod) {
			entryStorage.delete(id);
		}
	}
}

export async function shouldPrune(id: string, interval: number = WEEK) {
	await new Promise(res => { setTimeout(() => requestIdleCallback(res), 10000); });
	const lastStorage = Storage.wrap(`last_prune.${id}`, 0);
	const now = Date.now();
	if ((now - await lastStorage.get()) < interval) return false;
	lastStorage.set(now);
	return true;
}
