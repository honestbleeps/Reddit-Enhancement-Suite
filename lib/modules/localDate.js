/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';

export const module: Module<any> = new Module('localDate');

module.moduleName = 'localDateName';
module.category = 'myAccountCategory';
module.description = 'localDateDesc';

module.contentStart = () => {
	$(document.body)
		.on('mouseenter', 'time', function(this: any) {
			const $this = $(this);
			if (!$this.data('originalTitle')) {
				$this.data('originalTitle', $this.attr('title'));
			}
			// $FlowFixMe[incompatible-type] Date is stringified by jQuery
			$this.attr('title', new Date($this.attr('datetime')));
		})
		.on('mouseleave', 'time', function(this: any) {
			const $this = $(this);
			$this.attr('title', $this.data('originalTitle'));
		});
};
