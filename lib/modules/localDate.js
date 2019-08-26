/* @flow */

import $ from 'jquery';
import { Module } from '../core/module';

export const module: Module<*> = new Module('localDate');

module.moduleName = 'localDateName';
module.category = 'myAccountCategory';
module.description = 'localDateDesc';

module.contentStart = () => {
	$(document.body)
		.on('mouseenter', 'time', function() {
			const $this = $(this);
			if (!$this.data('originalTitle')) {
				$this.data('originalTitle', $this.attr('title'));
			}
			$this.attr('title', new Date($this.attr('datetime')));
		})
		.on('mouseleave', 'time', function() {
			const $this = $(this);
			$this.attr('title', $this.data('originalTitle'));
		});
};
