import _ from 'lodash';
import { $ } from '../../vendor';
import {
	randomHash,
} from '../../utils';
import { Storage } from '../../environment';
import filterlineFilterTemplate from '../../templates/filterlineFilter.mustache';
import * as Notifications from '../notifications';
import * as SelectedEntry from '../selectedEntry';
import * as FilteReddit from '../filteReddit';

export default class Filter {
	disabled = false;
	matchesCount = 0;
	state = null; // FilterState
	criterion = null; // ?string;

	id // string;
	key // string;
	filterlineKey // string;

	parse // ?Function;
	parsed // ?Object;
	evaluate // Function;

	parent // Filterline;

	clearCache // ?Function;
	fromSelected // ?Function;
	onChange // ?Function;

	settingsHtml // ?string;
	alwaysShow // ?boolean;
	pattern // ?string;

	trueText // string;
	falseText // string;

	element // ?HTMLElement;
	inner // ?HTMLElement;

	constructor(options, id) {
		// An id is necessary when saving / removing
		this.id = id || randomHash();

		Object.assign(this, options);

		this.createElement();
		this.updateMatchesCount();
	}

	createElement() {
		this.element = $(filterlineFilterTemplate(this))[0];
		this.inner = this.element.querySelector('.res-filterline-filter-name');
		this.refreshElement();

		this.element.addEventListener('click', () => {
			this.update(this.getNextState());
		});

		this.element.addEventListener('contextmenu', e => { // Right click
			// Destroy / reset filter
			this.update(null, null);
			e.preventDefault(); // Do not show context menu
		});
	}

	refreshElement() {
		this.inner.setAttribute('name', this.getStateName());

		if (this.criterion) this.inner.setAttribute('criterion', this.criterion);
		else this.inner.removeAttribute('criterion');

		this.element.classList.toggle('res-filterline-filter-active', this.state !== null);
	}

	getNextState() {
		if (this.state === null) return true; // Active inverse -- hide those that match
		if (this.state === true) return false; // Active -- hide those that  don't match
		if (this.state === false) return null; // Inactive -- disregard filter
	}

	getStateName() {
		return this.state === false ? this.falseText : this.trueText;
	}

	getInvertedStateName() {
		return this.state === false ? this.trueText : this.falseText;
	}

	save() {
		Storage.patch(
			this.filterlineKey,
			{ filters: { [this.id]: _.pick(this, ['state', 'criterion', 'key']) } }
		);
	}

	delete() {
		this.element.remove();
		Storage.deletePath(this.filterlineKey, 'filters', this.id);
	}

	update(state, criterion, { save = true } = {}) {
		this.state = state;

		if (criterion !== undefined && criterion !== this.criterion) {
			if (this.parse.length) this.criterion = criterion;
			else if (criterion) console.log('Filter does not support criterion. Ignoring criterion', criterion);
			this.parsed = this.parse(criterion);
		} else if (!this.parsed) {
			this.parsed = this.parse(criterion);
		}

		this.parent.updateFilter(this);
		// Remove if filter is no longer used by parent
		const remove = !this.parent.filters.includes(this);

		if (remove) this.delete();
		else if (save) this.save();

		this.refreshElement();

		if (this.onChange) this.onChange({ remove });
	}

	updateFromSelectedEntryValue(reverseActive) {
		const selected = SelectedEntry.selectedThing();
		const criterion = this.fromSelected(selected);

		try {
			if (criterion === null) throw new Error('Could not retrieve selected entry\'s value');

			const state = this.evaluate(selected, this.parse(criterion));
			if (state === null) throw new Error('Could not evaluate selected entry\'s value');
			else this.update(reverseActive ? !state : state, criterion);
		} catch (e) {
			console.error(e);

			Notifications.showNotification({
				moduleID: FilteReddit.module.moduleID,
				notificationID: 'selectedEntry value parse error',
				message: `Selected entry's ${this.key} value is invalid; ignoring`,
			});

			this.update(null, null);
		}
	}

	updateByInputConstruction({ criterion, clearCriterion, reverseActive, fromSelected }) {
		if (clearCriterion) {
			this.update(this.state, null);
			return;
		} else if (fromSelected && this.fromSelected) {
			this.updateFromSelectedEntryValue(reverseActive);
			return;
		}

		const state = reverseActive ? new Map([[false, true], [null, false], [true, false]]).get(this.state) :
			new Map([[false, false], [null, true], [true, false]]).get(this.state) ||
			criterion ? true : null;

		if (criterion) {
			this.update(state, criterion);
		} else {
			this.update(state);
		}
	}

	updateMatchesCount(delta = 0) {
		this.matchesCount += delta;
		this.element.title = `${this.state === null ? 'Inactive' : 'Active'} — filters ${this.matchesCount} posts`;

		if (this.element) {
			if (this.matchesCount) this.element.setAttribute('matches-count', this.matchesCount);
			else this.element.removeAttribute('matches-count');
		}
	}

	async matchesFilter(thing, mutateThingWithResult) {
		const result = await this.evaluate(thing, this.parsed);
		if (mutateThingWithResult) thing.filterResult = result;
		return this.state === !result;
	}

	setThingFilterReason(thing) {
		thing.element.setAttribute(
			'filter-reason',
			`${this.getInvertedStateName()} ${this.criterion ? ` ${this.criterion}` : ''}`
		);
	}

	removeThingFilterReason(thing) {
		thing.element.removeAttribute('filter-reason');
	}
}
