/* @flow */

import { Case } from '../Case';
import { isURLVisited } from '../../../environment';

export class IsVisited extends Case {
	/* Not available for Edge, it lacks isURLVisited */
	static text = 'Visited';

	static fields = ['link has been visited'];
	static slow = 2;

	static unique = true;

	trueText = 'visited';

	evaluate(thing: *) {
		if (thing.element.classList.contains('visited')) return true;

		const link = thing.getPostLink();
		if (!link) return null;
		return isURLVisited(link.href);
	}
}
