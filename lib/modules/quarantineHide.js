/* @flow */

import { Module } from '../core/module';
import { $ } from '../vendor';

export const module: Module<*> = new Module('quarantineHide');

module.moduleName = 'qhideName'; // i18n
module.category = 'appearanceCategory';
module.description = 'qhideDesc'; // i18n
module.options = {
	hideFlair: {
		title: 'qhideFlairTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'qhideFlairDesc', // i18n
	},
	hideSidebar: {
		title: 'qhideSidebarTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'qhideSidebarDesc', // i18n
	},
	fixHeaderImg: {
		title: 'qhideFixHeaderImgTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'qhideFixHeaderImgDesc', // i18n
	},
	hideWarning: {
		title: 'qhideWarningTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'qhideWarningDesc', // i18n
	},
};

module.include = ['linklist'];

module.go = () => {
	if (module.options.hideFlair.value) {
		removeFlair();
		window.addEventListener('neverEndingLoad', removeFlair);
	}
	if (module.options.hideSidebar.value) {
		const $notice = $('.quarantine-notice');
		if (module.options.fixHeaderImg && $notice.length !== 0) {
			$('body').removeClass('quarantine');
		}
		$notice.hide();
	}
	if (module.options.hideWarning.value) {
		const $interimg = $('.interstitial-image');
		if ($interimg.length !== 0 && $interimg.attr('alt') === 'quarantined') {
			$('.c-btn').click();
		}
	}
};

function removeFlair() {
	$('.quarantine-stamp').parent().remove();
}
