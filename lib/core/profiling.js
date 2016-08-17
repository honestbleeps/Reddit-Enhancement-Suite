import _ from 'lodash';
import { flow, keyBy, mapValues, zip } from 'lodash/fp';
import { MODULE_PROFILING_KEY, PERF_PROFILING_KEY } from '../constants/sessionStorage';
import { Alert, now, projectInto } from '../utils';
import {
	headReady,
	bodyStart,
	bodyReady,
	contentLoaded,
	loadOptions,
	beforeLoad,
	go,
	afterLoad,
} from './init';

export function startProfiling() {
	if (sessionStorage.getItem(PERF_PROFILING_KEY)) setupPerf();
	if (sessionStorage.getItem(MODULE_PROFILING_KEY)) setupModulePerf();
}

function setupPerf() {
	const end = {};

	const promises = {
		headReady,
		bodyStart,
		bodyReady,
		contentLoaded,
		loadOptions,
		beforeLoad,
		go,
	};

	for (const [key, promise] of Object.entries(promises)) {
		promise.then(() => { end[key] = now(); });
	}

	function diff(a, b) {
		const time = (end[b] - end[a]) | 0;
		return `<span style="color: ${time < 0 ? 'green' : 'red'}">${time}</span>ms`;
	}

	afterLoad.then(() => {
		Alert.open([
			`beforeLoad stalled for ${diff('headReady', 'loadOptions')}`,
			`go stalled for ${diff('bodyReady', 'beforeLoad')}`,
			`afterLoad stalled for ${diff('contentLoaded', 'go')}`,
			`addModuleBodyClasses was late by ${diff('bodyStart', 'loadOptions')}`,
		].reduce((acc, line) => `${acc}<div>${line}</div>`, ''));
	});
}

let recordTiming = false;
const timingInfo = {};

export function moduleStageStart(stage, modId) {
	if (!recordTiming) return;

	timingInfo[stage] = timingInfo[stage] || {};
	timingInfo[stage][modId] = timingInfo[stage][modId] || {};

	timingInfo[stage][modId].start = now();
}

export function moduleStageEnd(stage, modId) {
	if (!recordTiming) return;

	timingInfo[stage][modId].end = now();
}

function setupModulePerf() {
	recordTiming = true;

	afterLoad.then(() => {
		prettyPrintTiming(timingInfo);
	});
}

function prettyPrintTiming(stages) {
	const WIDTH = 120;
	const SYNC_COLOR = 'blue';
	const SYNC_CHAR = '#';
	const IDLE_COLOR = 'grey';
	const IDLE_CHAR = '-';
	const ASYNC_COLOR = 'red';
	const ASYNC_CHAR = '@';

	console.log(
		`%c${SYNC_CHAR} Synchronous ${SYNC_CHAR} %c${IDLE_CHAR} Idle ${IDLE_CHAR} %c${ASYNC_CHAR} Asynchronous ${ASYNC_CHAR}`,
		`color: ${SYNC_COLOR}`,
		`color: ${IDLE_COLOR}`,
		`color: ${ASYNC_COLOR}`
	);

	for (const [stage, data] of Object.entries(stages)) {
		const nameWidth = [...Object.keys(data), stage].map(s => s.length).reduce(_.ary(Math.max, 2), 0) + 1;
		const dataWidth = WIDTH - nameWidth;

		const earliestEnd = Object.values(data).map(d => d.end).reduce(_.ary(Math.min, 2), Number.MAX_SAFE_INTEGER);
		const latestEnd = Object.values(data).map(d => d.end).reduce(_.ary(Math.max, 2), 0);
		const earliestStart = Object.values(data).map(d => d.start).reduce(_.ary(Math.min, 2), Number.MAX_SAFE_INTEGER);

		const headerPrefix = `${_.padEnd(stage, nameWidth)}<- ${earliestStart | 0}ms`;
		console.log(`%c${headerPrefix}${_.padStart(`${latestEnd | 0}ms (+${latestEnd - earliestStart | 0}ms) ->`, WIDTH - headerPrefix.length)}`, 'background-color: #333; color: white');

		const normalized = flow(
			zip,
			keyBy(([[modId]]) => modId),
			mapValues(([[, a], [, b]]) => ({
				start: projectInto(earliestStart, latestEnd, 0, dataWidth, a.start) | 0,
				idleStart: projectInto(earliestStart, latestEnd, 0, dataWidth, b.start) | 0,
				asyncStart: projectInto(earliestStart, latestEnd, 0, dataWidth, earliestEnd) | 0,
				end: projectInto(earliestStart, latestEnd, 0, dataWidth, a.end) | 0,
			}))
		)(Object.entries(data), [...Object.entries(data).slice(1), ['dummy', { start: earliestEnd }]]);

		for (const [name, { start, idleStart, asyncStart, end }] of Object.entries(normalized)) {
			console.log(
				[
					_.padEnd(name, nameWidth),
					' '.repeat(start),
					`%c${SYNC_CHAR.repeat(idleStart - start)}`,
					`%c${IDLE_CHAR.repeat(asyncStart - idleStart)}`,
					`%c${ASYNC_CHAR.repeat(end - asyncStart)}`,
				].join(''),
				`color: ${SYNC_COLOR}`,
				`color: ${IDLE_COLOR}`,
				`color: ${ASYNC_COLOR}`
			);
		}
	}
}
