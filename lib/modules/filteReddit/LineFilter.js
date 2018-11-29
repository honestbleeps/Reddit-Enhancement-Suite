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

	constructor(id: *, BaseCase: *, name: *, conditions: * = null, state: * = true, effects: * = {}) {
		if (BaseCase.variant === 'ondemand') {
			const externOpts = BaseCase._customFilter && BaseCase._customFilter.opts;
			if (externOpts) {
				if (!name) ({ name } = externOpts);

				if (!effects.hasOwnProperty('propagate')) {
					const { propagate } = externOpts;
					Object.assign(effects, { propagate });
				}
			}
		}

		super(id, BaseCase, name, conditions, state, effects);
	}

	update(state: * = this.state, conditions?: *, effects: *, describeOnly: *) {
		if (this.BaseCase.variant === 'ondemand' && conditions && !describeOnly) {
			FilteReddit.updateCustomFilter(this.BaseCase.getCustomFilter(), { body: conditions });
			conditions = null; // Force create new case
		}

		const message = super.update(state, conditions, effects, describeOnly);
		if (this.element) this.refreshElement();
		return message;
	}

	setParent(parent: *) {
		super.setParent(parent);
		this.getBuilder.cache.clear();
	}

	createElement() {
		this.element = string.html`<div class="res-filterline-filter" type="${this.BaseCase.type}"></div>`;
		this.refreshElement();

		this.element.addEventListener('click', () => {
			if (!this.effects.hide) this.update(undefined, undefined, { hide: true });
			else if (this.state) this.update(false, undefined, { hide: true });
			else this.update(true, undefined, { hide: false });
		});

		this.element.addEventListener('contextmenu', (e: Event) => { // Right click
			if (this.effects.hide) this.update(undefined, undefined, { hide: false });
			else this.remove();
			e.preventDefault(); // Do not show context menu
		});

		this.element.addEventListener('mouseenter', () => this.showInfocard()); // FIXME This causes the widget to be opened also when just scrolling through
		this.element.addEventListener('click', () => this.showInfocard()); // Reset timout
		this.element.addEventListener('contextmenu', () => this.showInfocard()); // Reset timeout
	}

	showInfocard(immediately: ?boolean = false) {
		const card = Hover.infocard('filterline-filter');
		card
			.target(this.element)
			.options({ width: 570, openDelay: (card.visible || immediately) ? 0 : 600, pin: Hover.pin.bottom })
			.populateWith(this.populateHover.bind(this))
			.begin();
	}

	refreshElement() {
		this.element.setAttribute('text', this.getStateText());
		this.element.classList.toggle('res-filterline-filter-disabled', !this.case.isEvaluatable());
		this.element.classList.toggle('res-filterline-filter-hiding', this.case.isEvaluatable() && !!this.effects.hide);
	}

	// Memoize in order to preserve the builder when infocard closes
	getBuilder = _.memoize((filterline, card) => {
		const builderCases = Cases.getByContext(filterline.thingType);

		let lastConditions = this.case.conditions;

		if (this.BaseCase.variant === 'ondemand') {
			Object.assign(builderCases, Cases.getByContext('browse'));

			// Use customFilter conditions
			lastConditions = this.BaseCase.getCustomFilter().body;
		}

		if (!this.initialConditions) this.initialConditions = lastConditions;

		const $builder = SettingsConsole.drawBuilderBlock(lastConditions, builderCases);

		if (this.BaseCase.variant === 'ondemand' || this.BaseCase === Cases.Group) {
			SettingsConsole.makeBuilderBlockSortable($builder);
		} else {
			// Remove controls if case isn't a group
			$builder.find('.builderControls, .addBuilderBlock').remove();
		}

		const $builderBlock = $builder.find('> .builderBlock');
		$builderBlock.on('change input', frameThrottle(() => {
			const conditions = SettingsConsole.readBuilderBlock($builderBlock, builderCases);
			if (!_.isEqual(lastConditions, conditions)) {
				lastConditions = conditions;
				this.update(undefined, conditions);
				// Keep track of what is focused when redrawing
				const lastFocus = $builder.get(0).contains(document.activeElement) && document.activeElement;
				if (lastFocus) card.refresh().then(() => lastFocus.focus());
			}
		}));

		return {
			get builder() { return $builder.get(0); },
			isCaseChanged: () => !_.isEqual(this.initialConditions, lastConditions),
		};
	});

	populateHover(card: *) {
		const { parent: filterline } = this;
		if (!filterline) throw new Error('Filter not attached');

		const redraw = () => {
			this.getBuilder.cache.clear();
			card.refresh();
		};

		const head = string.html`
			<div class="res-filterline-filter-hover-preamble">
				<span>Filter ${this.BaseCase.text}</span>
				<div class="res-filterline-filter-hover-group" group="case-actions">
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
			</div>
		`;

		const body = string.html`
			<div class="res-filterline-filter-hover">
				<span class="res-filterline-filter-hover-options"></span>
				<span>For posts (<span class="res-filterline-filter-hover-number-matches">…</span>) ${this.state ? 'not ' : ''}matching:</span>
				<div class="builderItem"></div>
				<div class="res-filterline-filter-hover-notice">${ // Keep element empty when no text due to :empty selector
	this.BaseCase.variant === 'ondemand' && 'By adding browse context conditions such as "Date", "Logged in user", and "Custom toggle", you control where and when this filter is available.'}</div>
				<div class="res-filterline-filter-hover-group" group="match-effects">
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
				<div class="res-filterline-filter-hover-group" group="match-actions" hidden>
					<div class="res-filterline-filter-hover-buttons"></div>
				</div>
		`;

		const { builder, isCaseChanged } = this.getBuilder(filterline, card);
		body.querySelector('.builderItem').appendChild(builder);

		// Focus first input in builder, since it's likely the user want to modify that condition
		setTimeout(() => {
			if (!builder.contains(document.activeElement)) {
				// If an `input` element is not found, look for `select`
				const e = [...builder.querySelectorAll('input'), ...builder.querySelectorAll('select')]
					.find(e => e.offsetParent);
				if (e) e.focus();
			}
		});

		if (filterline.thingType === 'comment') {
			const options = body.querySelector('.res-filterline-filter-hover-options');
			const propagate = string.html`<label><input type="checkbox" ${this.effects.propagate && 'checked'}>Also hide children</label>`;
			options.append(propagate);
			waitForEvent(propagate, 'change').then(() => {
				this.effects.propagate = downcast(propagate.querySelector('input'), HTMLInputElement).checked;
				this.refresh();
			}).then(redraw);
		}

		function addButton(container, text, groupName, action) {
			const button = string.html`<button class="res-filterline-filter-hover-button" action="${action}">${text}</button>`;
			const group = downcast(container.querySelector(`[group=${groupName}]`), HTMLElement);
			group.hidden = false;
			const buttons = downcast(group.querySelector('.res-filterline-filter-hover-buttons'), HTMLElement);
			buttons.appendChild(button);
			return waitForEvent(button, 'click');
		}

		if (this.BaseCase.variant === 'basic' && this.BaseCase === Cases.Group) {
			addButton(head, 'To on-demand', 'case-actions', 'to-ondemand').then(() => {
				const conditions = Cases.getGroup('all', [
					Cases.getConditions('currentLocation'),
					Cases.getGroup(this.state === false ? 'all' : 'none', [this.case.conditions]),
				]);

				if (!this.name) this.name = window.prompt('Filter name:');

				this.BaseCase = FilteReddit.addOndemandCase(
					FilteReddit.addCustomFilter({
						body: Cases.resolveGroup(conditions, false, true),
						opts: {
							ondemand: true,
							name: this.name,
						},
					})
				);

				this.update(false, null);
			}).then(redraw);
		}

		if (isCaseChanged()) {
			addButton(head, 'Reset change', 'case-actions', 'reset').then(() => {
				this.update(undefined, this.initialConditions);
			}).then(redraw);
		}

		if (this.BaseCase.variant === 'ondemand' || this.BaseCase === Cases.Group) {
			addButton(head, 'Rename', 'case-actions', 'rename').then(() => {
				const name = window.prompt('New filter name:', this.case.trueText);
				if (!name) return;

				if (this.BaseCase.variant === 'ondemand') {
					const customFilter = this.BaseCase.getCustomFilter();
					FilteReddit.updateCustomFilter(customFilter, { opts: { name } });
				}

				this.name = name;
				this.update();
			}).then(redraw);
		}

		addButton(head, 'Invert', 'case-actions', 'invert')
			.then(() => { this.update(!this.state); })
			.then(redraw);

		addButton(head, 'Remove', 'case-actions', 'remove')
			.then(() => { this.remove(); })
			.then(card.close.bind(card));

		addButton(body, this.effects.hide ? 'Don\'t hide' : 'Hide', 'match-effects', `hide-${this.effects.hide ? 'false' : 'true'}`)
			.then(() => { this.update(undefined, undefined, { hide: !this.effects.hide }); })
			.then(redraw);

		addButton(body, this.effects.highlight ? 'Don\'t highlighting' : 'Highlight', 'match-effects', 'highlight').then(() => {
			this.update(undefined, undefined, { highlight: !this.effects.highlight });
		}).then(redraw);

		if (Modules.isRunning(CommentNavigator) && !this.effects.hide) {
			addButton(body, 'Navigate by', 'match-actions', 'navigate-by').then(() => {
				CommentNavigator.updateCustomConditions(Cases.getGroup(this.state ? 'none' : 'all', [this.case.conditions]));
				CommentNavigator.setCategory('custom');
				card.close();
			});
		}

		asyncFilter(Array.from(filterline.things), async thing => await this.matches(thing)) // eslint-disable-line no-return-await
			.then(matches => {
				const numberSpan = body.querySelector('.res-filterline-filter-hover-number-matches');
				numberSpan.textContent = String(matches.length);

				if (filterline.thingType === 'post' && matches.length) {
					addButton(body, 'Permanently hide', 'match-actions', 'native-hide')
						.then(() => { filterline.hide(matches); });
				}
			});

		return [head, body];
	}
}
