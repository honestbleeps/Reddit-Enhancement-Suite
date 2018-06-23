/* @flow */

import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';
import * as Modules from '../../../core/modules';
import * as UserTagger from '../../userTagger';
import { Case } from '../Case';

export class UserVoteWeight extends Case {
	static text = 'User vote weight';

	static parseCriterion(input: *) { return { op: '>=', val: parseInt(input, 10) }; }
	static async thingToCriterion(thing: *) {
		const username = thing.getAuthor();
		if (!username) throw new Error('No username');
		return String((await UserTagger.Tag.get(username)).votes || 0);
	}

	static defaultConditions = { op: '>', val: 0 };
	static fields = ['user\'s vote weight is ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'number', id: 'val' }, ' votes'];

	static slow = 1;
	static get disabled(): boolean {
		return !Modules.isRunning(UserTagger) || !UserTagger.module.options.trackVoteWeight.value;
	}

	static pattern = 'integer';

	trueText = `vote weight ${prettyOperator(this.conditions.op)} ${this.conditions.val}`;
	falseText = `vote weight ${prettyOperator(inverseOperator(this.conditions.op))} ${this.conditions.val}`;

	validator() { return Number.isInteger(this.value.val); }

	async evaluate(thing: *) {
		const username = thing.getAuthor();
		return !!username &&
			numericalCompare(this.value.op, (await UserTagger.Tag.get(username)).votes, this.value.val);
	}
}
