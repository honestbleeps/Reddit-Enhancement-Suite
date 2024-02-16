/* @flow */

import { dropWhile } from 'lodash-es';
import { Case } from '../Case';
import { numericalCompare, prettyOperator, inverseOperator } from '../../../utils';

const qualifiers = [['Y', 12], ['M', 30.44], ['d', 24], ['h', 60], ['m', 60], ['s', 1000]];
const now = new Date();

function prettifyAge(remainder) {
	let remainderQualifier = '';
	for (const [qualifier, multiplier] of qualifiers.slice().reverse()) {
		if (remainder < multiplier) break;
		remainder /= multiplier;
		remainderQualifier = qualifier;
	}

	return remainder.toFixed(2) + remainderQualifier;
}

export class PostAge extends Case {
	static text = 'Post age';

	static parseCriterion(input: *) {
		let age = parseInt(input, 10);
		if (isNaN(age)) throw new Error('Invalid age');

		const ageQualifier = (input.match(/Y|M|d|h|m|s/)).at(0) || 's';
		age = dropWhile(qualifiers, ([qualifier]) => qualifier !== ageQualifier)
			.reduce((a, [, multiplier]) => a * multiplier, age);

		return { op: '<=', age };
	}

	static thingToCriterion(thing: *) {
		const remainder = (now - new Date(thing.getTimestamp()));
		if (isNaN(remainder)) throw new Error('Could not determine Thing date');
		return prettifyAge(remainder);
	}

	static defaultConditions = { op: '<=', age: 4 * 60 * 60 * 1000 };
	static fields = ['post is ', { type: 'select', options: 'COMPARISON', id: 'op' }, ' ', { type: 'duration', id: 'age' }, ' old'];

	static pattern = 'x[(Y|M|d|h|m)] — where x is the number of seconds or Y year, M month, h hour, m minute (case sensitive)';

	trueText = `age ${prettyOperator(this.conditions.op)} ${prettifyAge(this.conditions.age)}`;
	falseText = `age ${prettyOperator(inverseOperator(this.conditions.op))} ${prettifyAge(this.conditions.age)}`;

	evaluate(thing: *) {
		const postTime = thing.getTimestamp();
		if (!postTime) return null;
		return numericalCompare(this.value.op, now - postTime, this.value.age);
	}
}
