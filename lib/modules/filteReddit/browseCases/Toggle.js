/* @flow */

import { Case } from '../Case';
import * as CustomToggles from '../../customToggles';

function getToggles() {
	return CustomToggles.module.options.toggle.value
		.map(([name, , menuItem]) => [menuItem, name]);
}

export class Toggle extends Case {
	static text = 'Custom toggle';

	static defaultConditions = { toggleName: getToggles()[0] || '' };
	static fields = [
		'custom toggle ',
		{ type: 'select', id: 'toggleName', get options() { return getToggles(); } },
		' is enabled',
	];

	evaluate() {
		return CustomToggles.toggleActive(this.value.toggleName);
	}
}
