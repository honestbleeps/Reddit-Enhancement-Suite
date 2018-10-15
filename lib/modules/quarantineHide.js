/* @flow */

import { Module } from '../core/module';
import { $ } from '../vendor';
import { BodyClasses } from '../utils';

export const module: Module<*> = new Module('quarantineHide');

module.moduleName = 'quarantineHideName'; // i18n
module.category = 'appearanceCategory';
module.description = 'quarantineHideDesc'; // i18n
module.options = {
	hideFlair: {
		title: 'quarantineHideFlairTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'quarantineHideFlairDesc', // i18n
	},
	hideSidebar: {
		title: 'quarantineHideSidebarTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'quarantineHideSidebarDesc', // i18n
	},
	fixHeaderImg: {
		title: 'quarantineHideFixHeaderImgTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'quarantineHideFixHeaderImgDesc', // i18n
	},
	hideWarning: {
		title: 'quarantineHideWarningTitle', // i18n
		type: 'boolean',
		value: false,
		description: 'quarantineHideWarningDesc', // i18n
	},
};

module.include = ['linklist', 'comments', 'wiki'];

module.go = () => {
	if (module.options.hideFlair.value) {
		removeStamp();
		window.addEventListener('neverEndingLoad', removeStamp);
	}
	if (module.options.hideSidebar.value) {
		$('.quarantine-notice').hide();
	}
    if (module.options.fixHeaderImg && document.body.classList.contains('quarantine')) {
        BodyClasses.remove('quarantine');
    }
	if (module.options.hideWarning.value) {
		const $interimg = $('.interstitial-image');
		if ($interimg.length !== 0 && $interimg.attr('alt') === 'quarantined') {
			$('.c-btn').click();
		}
	}
};

function removeStamp() {
	$('.quarantine-stamp').parent().remove();
}
