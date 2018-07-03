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

	trueText = `link flair ${this.conditions.patt}`.trim();

	value = (({ patt, fullMatch = true }) => Case.buildRegex(patt || '/./', { fullMatch, allowEmptyString: true }))(this.conditions);

	evaluate(thing: *, values: * = [this.value]) {
		const text = thing.getPostFlairText();
		return values.some(v => v.test(text));
	}
}
