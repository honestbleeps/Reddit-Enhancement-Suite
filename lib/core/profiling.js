import _ from 'lodash';
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
		prettyPrintTiming(timingInfo, 120);
	});
}

function prettyPrintTiming(data, width) {
	for (const [stage, d] of Object.entries(data)) {
		const nameWidth = [...Object.keys(d), stage].map(s => s.length).reduce(_.ary(Math.max, 2), 0) + 1;
		const dataWidth = width - nameWidth;

		const latestEnd = Object.values(d).map(d => d.end).reduce(_.ary(Math.max, 2), 0);
		const earliestStart = Object.values(d).map(d => d.start).reduce(_.ary(Math.min, 2), Number.MAX_SAFE_INTEGER);

		const normalized = _.mapValues(d, v => ({
			start: projectInto(earliestStart, latestEnd, 0, dataWidth, v.start) | 0,
			end: projectInto(earliestStart, latestEnd, 0, dataWidth, v.end) | 0,
		}));

		const headerPrefix = `${_.padEnd(stage, nameWidth)}${earliestStart | 0}ms`;
		console.info(headerPrefix + _.padStart(`${latestEnd | 0}ms (+${latestEnd - earliestStart | 0}ms)`, width - headerPrefix.length));

		for (const [name, { start, end }] of Object.entries(normalized)) {
			console.log(`${_.padEnd(name, nameWidth)}${' '.repeat(start)}${'-'.repeat(end - start)}`);
		}
	}
}
