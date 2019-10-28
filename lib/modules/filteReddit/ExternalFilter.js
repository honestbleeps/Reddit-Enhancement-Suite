/* @flow */

import { string, CreateElement } from '../../utils';
import * as FilteReddit from '../filteReddit';
import * as SettingsNavigation from '../settingsNavigation';
import * as Cases from './cases';
import { Filter } from './Filter';

export class ExternalFilter extends Filter {
	toggleEffects: $ReadOnlyArray<string> = ['hide'];

	isActive() {
		// If the case will always evaluate false, prevent this filter from making Filterline believe it's being useful
		return this.case.constructor.type !== 'false' && super.isActive();
	}

	createElement() {
		this.element = string.html`
			<div class="res-filterline-external-filter" type="${this.BaseCase.type}">
				<div>${this.name || this.BaseCase.type}</div>
			</div>
		`;

		if (FilteReddit.module.options.hasOwnProperty(this.BaseCase.type)) {
			this.element.prepend(string.html`${string.safe(
				SettingsNavigation.makeUrlHashLink(FilteReddit.module.moduleID, this.BaseCase.type, ' ', 'gearIcon'),
			)}`);
		}

		const setActive = active => {
			const effects = this.toggleEffects
				.reduce((acc, val) => { acc[val] = active; return acc; }, {});
			this.update(undefined, undefined, effects);
		};

		if (Cases.isUseful(this.case.constructor.type)) {
			const t = CreateElement.toggleButton(setActive, null, this.isActive(), '', '');
			this.element.appendChild(t);
		}
	}
}
