/* @flow */

import _ from 'lodash';
import * as ShowImages from '../../showImages';
import { Expando as E /* avoids name conflict */ } from '../../showImages/expando';
import { Case } from '../Case';

export class Expando extends Case {
	static text = 'Expando';

	static parseCriterion(input: string) { return { types: input.split(/[\s|]/).filter(Boolean) }; }
	static thingToCriterion(thing: *) {
		const expando = thing.isPost() ? E.getEntryExpandoFrom(thing) : E.getTextExpandosFrom(thing)[0];
		return expando && expando.types.join(' & ') || '';
	}

	static defaultConditions = { types: [] };
	static fields = ['post has expando, and (if specified) expando types intersects with ', { type: 'checkset', items: ShowImages.types, id: 'types' }];
	static slow = 9; // In order to evaluate whether an expando matches, the expando must be built first (which is slow due to API requests)

	static pattern = `[(${ShowImages.types.join('|')})]`;
	static criterionOperators = true;

	trueText = this.conditions.types.length ? `expando ${this.conditions.types.join('|')}` : 'expando';

	isValid() { return ShowImages.matchesTypes(this.value.types); }

	_matches(e: ?E) {
		if (!e) return false;
		if (!e.ready) return null;
		return ShowImages.matchesTypes(this.value.types, e.types);
	}

	// Memoized in order to add only one observer to each promise
	_waitTillReady = _.memoize(thing => {
		const completeTask = thing.tasks.byId.get(ShowImages.module);
		if (completeTask) {
			const promise = completeTask();
			// Wait at most 1 s for the task; if it takes longer, refresh this filter when it's done
			return Promise.race([
				promise,
				new Promise(rej => setTimeout(rej, 1000)),
			]).catch(() => {
				promise.finally(() => { this.refresh(); });
			});
		}
	});

	async evaluate(thing: *) {
		await this._waitTillReady(thing);

		if (thing.isPost()) {
			const expando = E.getEntryExpandoFrom(thing);
			return this._matches(expando);
		} else {
			const expandos = E.getTextExpandosFrom(thing);
			const res = expandos.map(this._matches.bind(this));
			if (res.some(Boolean)) return true;
			if (res.some(v => v === null)) return null;
			return false;
		}
	}

	onObserve() {
		return true;
	}
}
