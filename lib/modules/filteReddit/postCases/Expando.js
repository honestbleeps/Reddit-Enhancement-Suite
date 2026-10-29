/* @flow */

import * as ShowImages from '../../showImages';
import { Expando as E /* avoids name conflict */ } from '../../showImages/expando';
import { Case } from '../Case';
import type { CaseConditions, CaseFields } from '../Case';

export class Expando extends Case {
	static text = 'Expando';

	static parseCriterion(input: string): CaseConditions { return { types: input.split(/[\s|]/).filter(Boolean) }; }
	static thingToCriterion(thing: any): string {
		const expando = thing.isPost() ? E.getEntryExpandoFrom(thing) : E.getTextExpandosFrom(thing)[0];
		return expando && expando.types.join(' & ') || '';
	}

	static defaultConditions: CaseConditions = { types: [] };
	static fields: CaseFields = ['post has expando, and (if specified) expando types intersects with ', { type: 'checkset', items: ShowImages.types, id: 'types' }];
	static slow = 9; // In order to evaluate whether an expando matches, the expando must be built first (which is slow due to API requests)

	static pattern: string = `[(${ShowImages.types.join('|')})]`;
	static criterionOperators = true;

	trueText: string = this.conditions.types.length ? `expando ${this.conditions.types.join('|')}` : 'expando';

	isValid(): boolean { return ShowImages.matchesTypes(this.value.types); }

	_matches(e: ?E): null | boolean {
		if (!e) return false;
		if (!e.ready) return null;
		return ShowImages.matchesTypes(this.value.types, e.types);
	}

	_waitTillReady(thing: any): void | Promise<unknown> {
		const completeTask = thing.tasks.byId.get(ShowImages.module);
		if (completeTask) {
			const promise = completeTask();
			if (!(promise instanceof Promise)) return;
			// Wait at most 1.5 s for the task; if it takes longer, refresh this filter when it's done
			return Promise.race([
				promise.catch(() => { /* resolve also when it rejects */ }),
				new Promise((res, rej) => { setTimeout(rej, 1500); }),
			]).catch(() => {
				promise.finally(() => { this.refresh(); });
			});
		}
	}

	async evaluate(thing: any): Promise<null | boolean> {
		await this._waitTillReady(thing);

		if (thing.isPost()) {
			const expando = E.getEntryExpandoFrom(thing);
			return this._matches(expando);
		} else {
			const expandos = E.getTextExpandosFrom(thing);
			// $FlowFixMe[invalid-tuple-arity] `_matches` ignores the extra index/array arguments passed by `map`
			const res = expandos.map(this._matches.bind(this));
			if (res.some(Boolean)) return true;
			if (res.some(v => v === null)) return null;
			return false;
		}
	}

	onObserve(): boolean {
		return true;
	}
}
