import contributeTemplate from '../templates/contributePanel.hbs';
import * as Menu from './menu';
import { openNewTab } from '../environment';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'contribute';
	module.moduleName = 'Donate and Contribute';
	module.category = 'About RES';
	module.sort = -9;
	module.alwaysEnabled = true;
	module.description = contributeTemplate();

	module.go = function() {
		Menu.addMenuItem(
			'<div class="RES-donate">donate to RES &#8679;</div>',
			() => openNewTab('http://redditenhancementsuite.com/contribute.html')
		);
	};
}
