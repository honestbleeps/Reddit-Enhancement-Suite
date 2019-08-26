/* @flow */

import $ from 'jquery';
import { Case } from '../Case';

export class Selector extends Case {
	static text = 'Selector';

	static parseCriterion(input: *) { return { patt: input }; }

	static defaultConditions = { patt: '' };
	static fields = ['thing matches jQuery selector ', { type: 'text', id: 'patt' }];
	static slow = 10; // Can cause reflow, e.g. by using `:contains()`

	static pattern = 'string';

	trueText = `$('${this.conditions.patt.replace(/\'/g, '\\\'')}')`;
	falseText = `$(':not(${this.conditions.patt.replace(/\'/g, '\\\'')}'))`;

	isValid() { return this.value.patt && !!$(this.value.patt); }

	evaluate(thing: *) {
		return $(thing.element).is(this.value.patt) ||
			$(thing.entry).is(this.value.patt) ||
			!!$(thing.entry).has(this.value.patt).length;
	}
}
