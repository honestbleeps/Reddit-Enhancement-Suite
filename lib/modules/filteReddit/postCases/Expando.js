/* @flow */

import * as ShowImages from '../../showImages';
import { Expando as E /* avoids name conflict */ } from '../../showImages/expando';
import { Case } from '../Case';

export class Expando extends Case {
	static text = 'Expando';

	static parseCriterion(input: string) { return { types: input.split(/[\s|]/).filter(Boolean) }; }
	static thingToCriterion(thing: *) {
		const entryExpando = E.getEntryExpandoFrom(thing);
		return entryExpando && entryExpando.getTypes().join(' & ') || '';
	}

	static defaultConditions = { types: [] };
	static fields = ['post has expando, and (if specified) expando types intersects with ', { type: 'checkset', items: ShowImages.types, id: 'types' }];
	static slow = 9; // If this filter causes a thing to be hidden, the expando won't be deferred and mediainfo will be fetched, which in some instances causes extra bandwidth usage

	static pattern = `[(${ShowImages.types.join('|')})]`;
	static criterionOperators = true;

	trueText = this.value.types.length ? `expando ${this.value.types.join('|')}` : 'expando';
	falseText = this.value.types.length ? `¬ expando ${this.value.types.join('|')}` : '¬ expando';

	validator() { return ShowImages.matchesTypes(this.value.types); }

	_matches(e: ?E) {
		// Treat non-loaded expando as non-existing
		if (!e || !e.isLoaded()) return false;
		return ShowImages.matchesTypes(this.value.types, e.getTypes());
	}

	evaluate(thing: *) {
		const expando = E.getEntryExpandoFrom(thing);
		return this._matches(expando);
	}

	onObserve() {
		ShowImages.thingExpandoBuildListeners.add(this.refreshThing.bind(this));
		return true;
	}
}
