/* @flow */

import { downcast, watchForChildren, waitForDescendant, watchForDescendants } from './';

export function stopPageContextScript(test: HTMLScriptElement => boolean, _parent: string | HTMLElement, onlyChildrenOfParent: boolean) {
	const undo = [];
	let stopped = false;

	(async () => {
		const parent = _parent instanceof HTMLElement ?
			_parent :
			(document.documentElement.querySelector(_parent) || await waitForDescendant(document.documentElement, _parent));
		if (stopped) return;

		(onlyChildrenOfParent ? watchForChildren : watchForDescendants)(parent, 'script', ele => {
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
