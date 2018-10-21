/* @flow */

import { Case } from '../Case';
import { loggedInUser } from '../../../utils';

const options = [
	['a friend', 'friend'],
	['a moderator', 'moderator'],
	['an admin', 'admin'],
	['me', 'me'],
	['op', 'submitter'],
];

export class UserAttr extends Case {
	static text = 'User attribute';

	static parseCriterion(input: *) { return { attr: input }; }

	static fields = ['user is ', { type: 'select', id: 'attr', options }];
	static defaultConditions = { attr: 'friend' };

	static pattern = `(${options.map(([, cls]) => cls).join('|')})`;

	trueText = `by ${this.conditions.attr}`;

	isValid() { return options.map(([, cls]) => cls).includes(this.value.attr); }

	evaluate(thing: *) {
		if (this.value.attr === 'me') {
			// No standard marker for my own posts so compare against the logged in user
			const myName = loggedInUser();
			const author = thing.getAuthor();
			if (!myName || !author) return null;
			return author.trim().toLowerCase() === myName.trim().toLowerCase();
		} else {
			// The other cases have hardcoded class names
			const element = thing.getAuthorElement();
			if (!element) return null;
			return element.classList.contains(this.value.attr);
		}
	}
}
