/* @flow */

import { Case } from '../Case';

export class Domain extends Case {
	static text = 'Link domain name';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getPostDomain(); }

	static defaultConditions = { patt: '' };
	static fields = ['post links to the domain ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = 'RegEx';

	constructor({ patt, fullMatch = true }: *) {
		super(Case.buildRegex(patt, { fullMatch }));
		this.trueText = `domain ${patt}`;
		this.falseText = `¬ domain ${patt}`;
	}

	evaluate(thing: *, values: * = [this.value]) {
		const domain = thing.getPostDomain();
		return !!domain && values.some(v => v.test(domain));
	}
}
