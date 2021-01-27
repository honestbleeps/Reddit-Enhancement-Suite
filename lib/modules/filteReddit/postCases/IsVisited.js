/* @flow */

import { Case } from '../Case';
import { isURLVisited } from '../../../environment';

export class IsVisited extends Case {
	static text = 'Visited';

	static fields = ['link has been visited'];
	static slow = 2;

	static unique = true;

	trueText = 'visited';

	evaluate(thing: *) {
		if (thing.element.classList.contains('visited')) return true;

		const link = thing.getPostLink();
		const dataUrl = thing.element.getAttribute('data-url');
		if (!link && !dataUrl) return null;
		return (link && isURLVisited(link.href)) || (dataUrl !== link.href && isURLVisited(dataUrl));
	}
}
