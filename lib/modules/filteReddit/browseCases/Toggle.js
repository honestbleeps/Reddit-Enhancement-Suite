/* @flow */

import { Case } from '../Case';
import * as CustomToggles from '../../customToggles';

const getOptions = () => CustomToggles.getToggles().map(({ key, text }) => [text, key]);

export class Toggle extends Case {
	static text = 'Custom toggle';

	static defaultConditions = { toggleName: getOptions()[0] || '' }; // TODO Migrate `toggleName` to `key`
	static fields = [
		'custom toggle ',
		{ type: 'select', id: 'toggleName', get options() { return getOptions(); } },
		' is enabled',
	];

	evaluate() {
		const key = this.value.toggleName;
		return CustomToggles.toggleActive(key);
	}
}
