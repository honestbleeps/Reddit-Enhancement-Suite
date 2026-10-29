/* @flow */

import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';
import * as Modules from '../../../core/modules';
import * as UserTagger from '../../userTagger';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class UserVoteWeight extends Case {
	static text = 'User vote weight';

	static parseCriterion(input: any): CaseConditions { return { op: '>=', val: parseInt(input, 10) }; }
	static async thingToCriterion(thing: any): Promise<string> {
		const username = thing.getAuthor();
		if (!username) throw new Error('No username');
		return String((await UserTagger.Tag.get(username)).votes || 0);
	}

	static defaultConditions: CaseConditions = { op: '>', val: 0 };
	static fields: CaseFields = ['user\'s vote weight is ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' votes'];

	static slow = 1;
	static get disabled(): boolean {
		return !Modules.isEnabled(UserTagger) || !UserTagger.module.options.trackVoteWeight.value;
	}

	static pattern = 'integer';

	trueText: string = `vote weight ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText: string = `vote weight ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	isValid(): boolean { return Number.isInteger(this.value.val); }

	async evaluate(thing: any): Promise<null | boolean> {
		const username = thing.getAuthor();
		if (!username) return null;
		return numericalCompare(this.value.op, (await UserTagger.Tag.get(username)).votes, this.value.val);
	}
}
