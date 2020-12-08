/* @flow */

import { downcast, waitForDescendant, watchForDescendants } from './';

export function stopPageContextScript(test: HTMLScriptElement => boolean, ...parents: Array<string>) {
	const undo = [];
	let stopped = false;

	(async () => {
		let parent = document.documentElement;
		while (parents.length) { // eslint-disable-line no-unmodified-loop-condition
			parent = parent.querySelector(parents.slice().reverse().join(' ')) || await waitForDescendant(parent, parents.splice(0, 1)[0]); // eslint-disable-line no-await-in-loop
			if (stopped) return;
		}

		watchForDescendants(parent, 'script', ele => {
			if (stopped) return; // TODO Stop further search
			const script = downcast(ele, HTMLScriptElement);
			if (test(script)) {
				const origType = script.type;
				script.type = 'javascript/blocked';
				const origSrc = script.src;
				if (origSrc) script.src = '';
				const origContent = script.innerHTML;
				if (origContent) script.innerHTML = '';

				undo.push(() => {
					const ele = document.createElement('script');
					ele.type = origType;
					if (origSrc) ele.src = origSrc;
					if (origContent) ele.innerHTML = origContent;
					script.after(ele);
				});
			}
		});
	})();

	return {
		undo: () => {
			stopped = true;
			return undo.forEach(fn => fn());
		},
	};
}
