/* @flow */

import { isEqual, memoize } from 'lodash-es';
import { Sortable } from '../../vendor';
import {
	asyncFilter,
	caseBuilder,
	string,
	waitForEvent,
	downcast,
	frameThrottle,
} from '../../utils';
import * as CommentNavigator from '../commentNavigator';
import * as Hover from '../hover';
import * as FilteReddit from '../filteReddit';
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

		this.element.addEventListener('mouseenter', async () => {
			// To prevent this from triggering and clearing other cards when moving the curser quickly through,
			// wait a little in order to be sure about the user's intent
			await new Promise(res => { setTimeout(res, 150); });
			if (this.element.matches(':hover')) this.showInfocard();
		});
		// When just clicking the button, avoid showing the infocard as it can be a nuisance
		this.element.addEventListener('click', () => Hover.infocard('filterline-filter').resetShowTimer());
		this.element.addEventListener('contextmenu', () => Hover.infocard('filterline-filter').resetShowTimer());
	}

	showInfocard(immediately: boolean = false) {
		const card = Hover.infocard('filterline-filter');
		if (card.visible) immediately = true;
		card
			.target(this.element)
			.options({ width: 570, openDelay: immediately ? 0 : 550, pin: Hover.pin.bottom })
			.populateWith(this.populateHover.bind(this))
			.begin();
	}

	refreshElement() {
		this.element.setAttribute('text', this.getStateText());
		// Don't display external filters that are not active
		this.element.classList.toggle('res-filterline-filter-disabled', this.BaseCase.variant !== 'basic' && !this.case.isEvaluatable());
		this.element.classList.toggle('res-filterline-filter-hiding', this.case.isEvaluatable() && !!this.effects.hide);
	}

	// Memoize in order to preserve the builder when infocard closes
	getBuilder = memoize((filterline, card) => {
		const builderCases = Cases.getByContext(filterline.thingType);

		let lastConditions = this.case.conditions;

		if (this.BaseCase.variant === 'ondemand') {
			Object.assign(builderCases, Cases.getByContext('browse'));

			// Use customFilter conditions
			lastConditions = this.BaseCase.getCustomFilter().body;
		}

		if (!this.initialConditions) this.initialConditions = lastConditions;

		const $builderBlock = caseBuilder.drawBuilderBlock(lastConditions, builderCases, false);
		$builderBlock.on('change input', frameThrottle(() => {
			const conditions = caseBuilder.readBuilderBlock($builderBlock, builderCases);
			if (!isEqual(lastConditions, conditions)) {
				lastConditions = conditions;
				this.update(undefined, conditions);
				// Keep track of what is focused when redrawing
				const lastFocus = $builderBlock.get(0).contains(document.activeElement) && document.activeElement;
				if (lastFocus) card.refresh().then(() => lastFocus.focus());
			}
		}));

		Sortable.create($builderBlock.get(0), { handle: '.handle' });

		return {
			get builder() { return $builderBlock.get(0); },
			isCaseChanged: () => !isEqual(this.initialConditions, lastConditions),
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
				<div class="res-filterline-filter-hover-notice">${// Keep element empty when no text due to :empty selector
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
			const propagate = string.html`<label style="display: flex; align-items: center;"><input style="margin-right: 3px;" type="checkbox" ${this.effects.propagate && 'checked'}>Also hide children</label>`;
			options.append(propagate);
			waitForEvent(propagate, 'change').then(() => {
				this.update(undefined, undefined, { propagate: downcast(propagate.querySelector('input'), HTMLInputElement).checked });
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
					Cases.getGroup(this.state ? 'all' : 'none', [this.case.conditions]),
				]);

				if (!this.name) this.name = window.prompt('Filter name:');

				this.BaseCase = FilteReddit.addOndemandCase(
					FilteReddit.addCustomFilter({
						body: Cases.resolveGroup(conditions, false, true),
						opts: {
							ondemand: true,
							name: this.name,
						},
					}),
				);

				this.update(true, null);
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
						.then(() => { filterline.hidePermanently(matches); });
				}
			});

		return [head, body];
	}
}
