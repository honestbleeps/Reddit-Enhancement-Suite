/* @flow */

import { $ } from '../../vendor';
import { string, CreateElement, asyncFind } from '../../utils';
import * as FilteReddit from '../filteReddit';
import * as SettingsNavigation from '../settingsNavigation';
import { Filter } from './Filter';

export class ExternalFilter extends Filter {
	createElement() {
		this.element = string.html`
			<div class="res-filterline-external-filter" type="${this.baseCase.type}">
				${string.safe(SettingsNavigation.makeUrlHashLink(FilteReddit.module.moduleID, this.baseCase.type, ' ', 'gearIcon'))}
				<div>${this.baseCase.type}</div>
			</div>
		`;
		this.element.appendChild(
			CreateElement.toggleButton(state => { this.update(state ? false : null); }, null, this.state === false, '', '')
		);
	}

	async showThingFilterReason(thing: *) {
		thing.element.setAttribute('filter-reason', `specified by filter ${this.baseCase.type}`);

		if (!Array.isArray(this.case.conditions.of)) throw new Error('Must be a group case');
		const entry = await asyncFind(this.case.conditions.of, v => this.baseCase.fromConditions(v).evaluate(thing));

		$('<span>', {
			class: 'res-filter-remove-entry',
			title: JSON.stringify(entry, null, '  '),
			click: () => {
				FilteReddit.removeExternalFilterEntry(this.baseCase.type, entry);
				this.update(this.state, null, false);
			},
		}).prependTo(thing.element);
	}
}
