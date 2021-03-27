/* @flow */

import { downcast, waitForEvent, watchForChildren, waitForDescendant, watchForDescendants } from './';

export function stopPageContextScript(test: HTMLScriptElement => boolean, _parent: string | HTMLElement | Promise<HTMLElement>, onlyChildrenOfParent: boolean) {
	const undo = [];
	let stopped = false;

	(async () => {
		if (_parent instanceof Promise) { _parent = await _parent; }
		const parent = _parent instanceof HTMLElement ?
			_parent :
			(document.documentElement.querySelector(_parent) || await waitForDescendant(document.documentElement, _parent));
		if (stopped) return;

		(onlyChildrenOfParent ? watchForChildren : watchForDescendants)(parent, 'script', ele => {
			if (stopped) return; // TODO Stop further search
			const script = downcast(ele, HTMLScriptElement);
			if (test(script)) {
				if (process.env.BUILD_TARGET === 'firefox') {
					// Additional processing is necessary to prevent execution in Firefox
					script.addEventListener('beforescriptexecute', e => { e.preventDefault(); });
				}

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
					return waitForEvent(ele, 'load');
				});
			}
		});
	})();

	return {
		undo: () => {
			stopped = true;
			// $FlowIssue Promise.allSettled
			return Promise.allSettled(undo.map(fn => fn()));
		},
	};
}
