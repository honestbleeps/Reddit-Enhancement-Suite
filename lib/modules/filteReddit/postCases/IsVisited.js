/* @flow */

import { Case } from '../Case';
import { isURLVisited } from '../../../environment';

export class IsVisited extends Case {
	/* Not available for Edge, it lacks isURLVisited */
	static text = 'Visited';

	static fields = ['link has been visited'];
	static slow = 2;
	static get disabled(): boolean {
		return process.env.BUILD_TARGET === 'edge';
	}

	static unique = true;

	evaluate(thing: *) {
		if (thing.element.classList.contains('visited')) return true;

		const link = thing.getPostLink();
		return !!link && isURLVisited(link.href);
	}
}
