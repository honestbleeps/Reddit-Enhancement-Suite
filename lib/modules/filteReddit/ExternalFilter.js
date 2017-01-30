/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import * as Options from '../../core/options';
import type { Thing } from '../../utils';
import * as FilteReddit from '../filteReddit';
import filterlineExternalFilterTemplate from '../../templates/filterlineExternalFilter.mustache';
import Filter from './Filter';

export default class ExternalFilter extends Filter {
	settingsHtml: string = '';

	createElement() {
		this.element = $(filterlineExternalFilterTemplate(this))[0];
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
