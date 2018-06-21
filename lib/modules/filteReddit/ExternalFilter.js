/* @flow */

import { string, CreateElement } from '../../utils';
import * as FilteReddit from '../filteReddit';
import * as SettingsNavigation from '../settingsNavigation';
import * as Cases from './cases';
import { Filter } from './Filter';

export class ExternalFilter extends Filter {
	createElement() {
		this.element = string.html`
			<div class="res-filterline-external-filter" type="${this.BaseCase.type}">
				<div>${this.BaseCase.type}</div>
			</div>
		`;

		if (FilteReddit.module.options.hasOwnProperty(this.BaseCase.type)) {
			this.element.prepend(string.html`${string.safe(
				SettingsNavigation.makeUrlHashLink(FilteReddit.module.moduleID, this.BaseCase.type, ' ', 'gearIcon')
			)}`);
		}

		if (Cases.isUseful(this.case.constructor.type)) {
			const t = CreateElement.toggleButton(state => { this.update(state ? false : null); }, null, this.state === false, '', '');
			this.element.appendChild(t);
		}
	}
}
