/* @flow */

import { PatternCase } from '../Case';

export class Domain extends PatternCase {
	static text = 'Link domain name';

	static thingToCriterion(thing: *) { return thing.getPostDomain(); }

	static fields = ['post links to the domain ', { type: 'text', id: 'patt' }];

	trueText = `domain ${this.conditions.patt}`;

	value = this.build(true);

	evaluate(thing: *) {
		const domain = thing.getPostDomain();
		if (!domain) return null;
		return this.value.some(v => v.test(domain));
	}
}
