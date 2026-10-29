/* @flow */

import $ from 'jquery';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class Selector extends Case {
	static text = 'Selector';

	static parseCriterion(input: any): CaseConditions { return { patt: input }; }

	static defaultConditions: CaseConditions = { patt: '' };
	static fields: CaseFields = ['thing matches jQuery selector ', { type: 'text', id: 'patt' }];
	static slow = 10; // Can cause reflow, e.g. by using `:contains()`

	static pattern = 'string';

	trueText: string = `$(${JSON.stringify(this.conditions.patt)})`;
	falseText: string = `$(':not(${this.conditions.patt.replace(/\'/g, '\\\'')}'))`;

	isValid(): boolean { return this.value.patt && !!$(this.value.patt); }

	evaluate(thing: any): null | boolean {
		return $(thing.element).is(this.value.patt) ||
			$(thing.entry).is(this.value.patt) ||
			!!$(thing.entry).has(this.value.patt).length;
	}
}
