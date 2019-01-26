/* @flow */

import { isURLVisited } from '../../../environment';
import * as NewCommentCount from '../../newCommentCount';
import { Case } from '../Case';

export class CommentsOpened extends Case {
	static text = 'Comments opened';

	static fields = ['comments page has been visited'];
	static slow = 2;

	static unique = true;

	trueText = 'comments opened';

	async evaluate(thing: *) {
		if (await NewCommentCount.hasEntry(thing)) return true;

		const link = thing.getCommentsLink();
		if (!link) return null;
		return isURLVisited(link.href);
	}
}
