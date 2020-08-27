/* @flow */

import { downcast, forEachSeq, waitForDescendant, watchForDescendants, waitForEvent } from './';

if (process.env.BUILD_TARGET === 'firefox') {
	// Firefox doesn't understand 'javascript/blocked', so polyfill it
	window.addEventListener('beforescriptexecute', e => {
		if (e.target.getAttribute('type') === 'javascript/blocked') {
			e.preventDefault();
		}
	}, true);
}

export function stopPageContextScript(test: HTMLScriptElement => boolean, ...parents: Array<string>) {
	const undo = [];
	let stopped = false;

	(async () => {
		let parent = document.documentElement;
		while (!stopped && parents.length) { // eslint-disable-line no-unmodified-loop-condition
			parent = await waitForDescendant(parent, parents.splice(0, 1)[0]); // eslint-disable-line no-await-in-loop
		}

		watchForDescendants(parent, 'script', ele => {
			if (stopped) return; // TODO Stop further search
			const script = downcast(ele, HTMLScriptElement);
			if (test(script)) {
				const origType = script.type;
				script.type = 'javascript/blocked';

				undo.push(() => {
					script.type = origType;
					if (script.src) return waitForEvent(script, 'load').then(() => {});
				});
			}
		});
	})();

	return {
		undo: () => {
			stopped = true;
			return forEachSeq(undo, fn => fn());
		},
	};
}
