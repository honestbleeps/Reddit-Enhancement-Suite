import contributeTemplate from '../templates/contributePanel.mustache';
import { openNewTab } from '../environment';
import * as Menu from './menu';

export const module = {};

module.moduleID = 'contribute';
module.moduleName = 'Donate and Contribute';
module.category = 'About RES';
module.sort = -9;
module.alwaysEnabled = true;
module.description = contributeTemplate();

module.go = () => {
	Menu.addMenuItem(
		'<div class="RES-donate">donate to RES &#8679;</div>',
		() => openNewTab('https://redditenhancementsuite.com/contribute/')
	);
};
