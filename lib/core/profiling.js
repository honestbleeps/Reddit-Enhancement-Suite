/* @flow */

import { MODULE_PROFILING_KEY, PERF_PROFILING_KEY } from '../constants/sessionStorage';
import { Alert, now } from '../utils';
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
			`afterLoad stalled for ${diff('loadComplete', 'go')}`,
			`addModuleBodyClasses was late by ${diff('bodyStart', 'loadOptions')}`,
		].reduce((acc, line) => `${acc}<div>${line}</div>`, ''));
	});
}

let recordTiming = false;
function setupModulePerf() {
	recordTiming = true;
}

export function moduleStageStart(stage: string, modId: string) {
	if (!recordTiming) return;

	performance.mark(`${modId}#${stage}`);
}

export function moduleStageEnd(stage: string, modId: string) {
	if (!recordTiming) return;

	const mark = `${modId}#${stage}`;
	const measure = `${modId} (${stage})`;
	performance.measure(measure, mark);
	performance.clearMarks(mark);
	performance.clearMeasures(measure);
}
