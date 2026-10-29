/* @flow */

import { isURLVisited } from '../../../environment';
import * as NewCommentCount from '../../newCommentCount';
import { Case } from '../Case';
import type { CaseFields } from '../Case';

export class CommentsOpened extends Case {
	static text = 'Comments opened';

	static fields: CaseFields = ['comments page has been visited'];
	static slow = 2;

	static unique = true;

	trueText: string = 'comments opened';

	async evaluate(thing: any): Promise<null | boolean> {
		if (await NewCommentCount.hasEntry(thing)) return true;

		const link = thing.getCommentsLink();
		if (!link) return null;
		return isURLVisited(link.href);
	}
}
