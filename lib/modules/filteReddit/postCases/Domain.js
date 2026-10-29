/* @flow */

import { PatternCase } from '../Case';
import type { CaseFields } from '../Case';

export class Domain extends PatternCase {
	static text = 'Link domain name';

	static thingToCriterion(thing: any): string { return thing.getPostDomain(); }

	static fields: CaseFields = ['post links to the domain ', { type: 'text', id: 'patt' }];

	trueText: string = `domain ${this.conditions.patt}`;

	value: Array<RegExp> = this.build(true);

	evaluate(thing: any): null | boolean {
		const domain = thing.getPostDomain();
		if (!domain) return null;
		return this.value.some(v => v.test(domain));
	}
}
