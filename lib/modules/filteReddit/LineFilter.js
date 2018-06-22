/* @flow */

import _ from 'lodash';
import {
	asyncFilter,
	string,
	waitForEvent,
	downcast,
	frameThrottle,
} from '../../utils';
import * as CommentNavigator from '../commentNavigator';
import * as Hover from '../hover';
import * as FilteReddit from '../filteReddit';
import * as SettingsConsole from '../settingsConsole';
import * as Cases from './cases';
import * as Modules from './../../core/modules';
import { Filter } from './Filter';

export class LineFilter extends Filter {
	initialConditions: *;
	inner: HTMLElement;

	update(state: *, conditions?: *, describeOnly: *) {
		if (this.BaseCase.variant === 'ondemand') {
			Cases.remove(this.BaseCase.type);
			const customFilter = FilteReddit.getCustomFilter(this.BaseCase.defaultConditions);
			FilteReddit.updateCustomFilter(customFilter, conditions);
			this.BaseCase = FilteReddit.addOndemandCase(customFilter, true);
			conditions = null; // Force create new case
		}

		const message = super.update(state, conditions, describeOnly);
		if (this.element) this.refreshElement();
		return message;
	}

	setInitialConditions() {
		this.initialConditions = _.cloneDeep(
			this.BaseCase.variant === 'ondemand' ?
				FilteReddit.getCustomFilter(this.BaseCase.defaultConditions).body :
				this.case.conditions
		);
	}

	setParent(parent: *) {
		super.setParent(parent);
		this.setInitialConditions();
		this.getBuilder.cache.clear();
	}

	createElement() {
		this.element = string.html`
			<div class="res-filterline-filter" type="${this.BaseCase.type}">
				<div class="res-filterline-filter-name"></div>
			</div>
		`;
		this.inner = this.element.querySelector('.res-filterline-filter-name');
		this.refreshElement();

		this.element.addEventListener('click', () => {
			this.update(this.getNextState());
		});

		this.element.addEventListener('contextmenu', (e: Event) => { // Right click
			this.clear();
			e.preventDefault(); // Do not show context menu
		});

		this.element.addEventListener('mouseenter', () => this.showInfocard());
		this.element.addEventListener('click', () => this.showInfocard()); // Reset timout
		this.element.addEventListener('contextmenu', () => this.showInfocard()); // Reset timeout
	}

	showInfocard(immediately: ?boolean = false) {
		const card = Hover.infocard('filterline-filter');
		card
			.target(this.element)
			.options({ width: 570, openDelay: (card.visible || immediately) ? 0 : 700, pin: Hover.pin.bottom })
			.populateWith(this.populateHover.bind(this))
			.begin();
	}

	refreshElement() {
		this.inner.setAttribute('name', this.getStateText());
		this.element.classList.toggle('res-filterline-filter-active', this.state !== null);
	}

	getNextState() {
		if (this.state === null) return true; // Active inverse -- hide those that match
		if (this.state === true) return false; // Active -- hide those that  don't match
		else return null; // Inactive -- disregard filter
	}

	// Memoize in order to preserve the builder when infocard closes
	getBuilder = _.memoize((filterline, card) => {
		const builderCases = Cases.getByContext(filterline.thingType);

		let lastConditions = this.case.conditions;

		if (this.BaseCase.variant === 'ondemand') {
			Object.assign(builderCases, Cases.getByContext('browse'));

			// Use customFilter conditions
			lastConditions = FilteReddit.getCustomFilter(this.BaseCase.defaultConditions).body;
		}

		const $builder = SettingsConsole.drawBuilderBlock(lastConditions, builderCases);

		if (this.BaseCase.variant === 'ondemand' || this.BaseCase === Cases.Group) {
			SettingsConsole.makeBuilderBlockSortable($builder);
		} else {
			// Remove controls if case isn't a group
			$builder.find('.builderControls, .addBuilderBlock').remove();
		}

		// Keep track of what is focused when redrawing
		let lastFocus;

		const $builderBlock = $builder.find('> .builderBlock');
		$builderBlock.on('change input', frameThrottle(() => {
			const conditions = SettingsConsole.readBuilderBlock($builderBlock, builderCases);
			if (!_.isEqual(lastConditions, conditions)) {
				lastConditions = conditions;
				this.update(this.state, conditions);
				lastFocus = $builder.get(0).contains(document.activeElement) && document.activeElement;
				this.populateHover(card);
				if (lastFocus) lastFocus.focus();
			}
		}));

		return {
			getConditions: () => lastConditions,
			get builder() {
				return $builder.get(0);
			},
			isCaseChanged: () => !_.isEqual(this.initialConditions, lastConditions),
		};
	});

	async populateHover(card: *) {
		const { parent: filterline } = this;
		if (!filterline) throw new Error('Filter not attached');

		const redraw = () => this.populateHover(card);

		const head = string.html`
			<div class="res-filterline-filter-hover-preamble">
				<span>Filter ${this.BaseCase.text.toLowerCase()}</span>
				<div class="res-filterline-filter-hover-group" group="case-actions">
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
			</div>
		`;

		const body = string.html`
			<div class="res-filterline-filter-hover">
				<span class="res-filterline-filter-hover-options"></span>
				<span>${this.state !== null ? `${this.state ? 'Showing' : 'Hiding'} posts where:` : 'Match posts where:'}</span>
				<div class="builderItem"></div>
				<div class="res-filterline-filter-hover-notice">${ // Keep element empty when no text due to :empty selector
	this.BaseCase.variant === 'ondemand' && 'By adding browse context conditions such as "Date", "Logged in user", and "Custom toggle", you control where and when this filter is available.'}</div>
				<div class="res-filterline-filter-hover-group" group="state-actions">
					Modify state:
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
		`;

		card.populate([head, body]);

		const { builder, getConditions, isCaseChanged } = this.getBuilder(filterline, card);
		body.querySelector('.builderItem').appendChild(builder);

		// Focus first input in builder, since it's likely the user want to modify that condition
		setTimeout(() => {
			if (!builder.contains(document.activeElement)) {
				const e = [...builder.querySelectorAll('input'), ...builder.querySelectorAll('select')]
					.find(e => e.offsetParent);
				if (e) e.focus();
			}
		});

		function addButton(container, text, groupName, action) {
			const button = string.html`<button class="res-filterline-filter-hover-button" action="${action}">${text}</button>`;
			const group = downcast(container.querySelector(`[group=${groupName}]`), HTMLElement);
			group.hidden = false;
			const buttons = downcast(group.querySelector('.res-filterline-filter-hover-buttons'), HTMLElement);
			buttons.appendChild(button);
			return waitForEvent(button, 'click');
		}

		const update = conditions => {
			if (this.BaseCase.variant === 'basic') {
				this.update(this.state, conditions);
			} else if (this.BaseCase.variant === 'ondemand') {
				const { name } = (conditions: any);
				if (!name) throw new Error('ondemand requires name');
				this.update(this.state, conditions);
			}

			this.getBuilder.cache.clear();
		};

		if (this.BaseCase.variant === 'basic' && this.BaseCase === Cases.Group) {
			addButton(head, 'To on-demand', 'case-actions', 'to-ondemand').then(() => {
				const { name } = (getConditions(): any);
				const conditions = Cases.getGroup('all', [
					Cases.getConditions('currentLocation'),
					Cases.getGroup(this.state === false ? 'all' : 'none', [this.case.conditions]),
				], name);
				const customFilter = FilteReddit.addCustomFilter({
					body: Cases.resolveGroup(conditions, false, true),
					ondemand: true,
				});
				this.BaseCase = FilteReddit.addOndemandCase(customFilter, true);
				this.state = this.state === null ? null : false;
				update(customFilter.body);
			}).then(redraw);
		}

		if (isCaseChanged()) {
			addButton(head, 'Reset change', 'case-actions', 'reset').then(() => {
				update(this.initialConditions);
			}).then(redraw);
		}

		if (this.BaseCase.variant === 'ondemand' || this.BaseCase === Cases.Group) {
			addButton(head, 'Rename', 'case-actions', 'rename').then(() => {
				const name = window.prompt('New filter name:', this.case.trueText);
				if (name) update({ ...getConditions(), name });
				this.setInitialConditions(); // Cannot undo this conversion
			}).then(redraw);
		}

		addButton(head, this.undeletable ? 'Clear' : 'Remove', 'case-actions', 'clear')
			.then(() => { this.clear(); }).then(() => { card.close(); });

		if (this.state !== null) addButton(body, 'Do nothing', 'state-actions', 'state-null').then(() => { this.update(null); }).then(redraw);
		if (this.state !== false) addButton(body, 'Hide matching posts', 'state-actions', 'state-false').then(() => { this.update(false); }).then(redraw);
		if (this.state !== true) addButton(body, 'Show only matching posts', 'state-actions', 'state-true').then(() => { this.update(true); }).then(redraw);

		if (Modules.isRunning(CommentNavigator)) {
			addButton(body, 'Navigate by', 'state-actions', 'navigate-by').then(() => {
				this.update(null);
				CommentNavigator.updateCustomConditions(getConditions());
				CommentNavigator.setCategory('custom');
				card.close();
			});
		}

		await this.updatePromise;

		const uncertainMatches = filterline.getFiltered()
			.filter(v => v.filter !== this)
			.filter(v => filterline.getFiltersToTest(v.filter).includes(this));

		const allMatching = filterline.getFiltered(this).concat(
			this.state === null && [] ||
				await asyncFilter(uncertainMatches, async thing => await this.matches(thing)) // eslint-disable-line no-return-await
		);

		if (allMatching.length) {
			body.appendChild(string.html`
				<div class="res-filterline-filter-hover-group" group="hidden-actions" hidden>
					For posts (${allMatching.length}) hidden by filter:
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
			`);

			// TODO Make togglable, auto-apply matching things on subsequent pages
			addButton(body, 'Highlight', 'hidden-actions', 'highlight').then(() => {
				for (const e of document.querySelectorAll('.res-filterline-highlight-match')) e.classList.remove('res-filterline-highlight-match');
				for (const thing of allMatching) thing.element.classList.add('res-filterline-highlight-match');
			});

			if (filterline.thingType === 'post') {
				addButton(body, 'Permanently hide', 'hidden-actions', 'native-hide').then(() => { filterline.hide(allMatching); });
			}
		}

		return []; // Don't register any changes
	}
}
