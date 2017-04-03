/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import * as Options from '../../core/options';
import type { Thing } from '../../utils';
import { string } from '../../utils';
import * as FilteReddit from '../filteReddit';
import Filter from './Filter';

export default class ExternalFilter extends Filter {
	settingsHtml: string = '';

	createElement() {
		this.element = string.html`
			<div class="res-filterline-external-filter" filter-key="${this.key}">
				${string.safe(this.settingsHtml)}
				<div>${this.key}</div>
			</div>
		`;
	}

	removeFilterEntry(entry: Array<*>) {
		const newValueArray = _.pull(FilteReddit.module.options[this.key].value, entry);
		Options.set(FilteReddit.module, this.key, newValueArray);
		if (this.clearCache) this.clearCache();
		this.parent.updateFilter(this);
	}

	setThingFilterReason(thing: Thing) {
		thing.element.setAttribute('filter-reason', `specified by filter ${this.key}`);
		thing.filterEntryRemover = $('<span>', {
			class: 'res-filter-remove-entry',
			title: JSON.stringify(thing.filterResult, null, '  '),
			click: () => this.removeFilterEntry(thing.filterResult),
		}).prependTo(thing.element);
	}
}
