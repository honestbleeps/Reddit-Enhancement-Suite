/* @flow */

import { Case } from '../Case';

export class LinkFlair extends Case {
	static text = 'Link flair';

	static parseCriterion(input: *) { return { patt: input }; }
	static thingToCriterion(thing: *) { return thing.getPostFlairText(); }

	static defaultConditions = { patt: '' };
	static fields = ['post has link flair matching ', { type: 'text', id: 'patt' }];
	static reconcilable = true;

	static pattern = '[RegEx]';

	constructor({ patt, fullMatch = true }: *) {
		super(Case.buildRegex(patt || '/./', { fullMatch, allowEmptyString: true }));
		this.trueText = `link flair ${patt}`.trim();
		this.falseText = `¬ link flair ${patt}`.trim();
	}

	evaluate(thing: *, values: * = [this.value]) {
		const text = thing.getPostFlairText();
		return values.some(v => v.test(text));
	}
}
