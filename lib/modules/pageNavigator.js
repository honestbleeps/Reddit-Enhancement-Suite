import { $ } from '../vendor';
import { scrollTo } from '../utils';

export const module = {};
{ // eslint-disable-line no-lone-blocks
	module.moduleID = 'pageNavigator';
	module.moduleName = 'Page Navigator';
	module.category = 'Browsing';
	module.description = 'Adds an icon to every page that takes you to the top when clicked.';
	module.go = function() {
		addElements();
	};

	function addElements() {
		const $backToTop = $('<a class="pageNavigator res-icon" data-id="top" href="#header" title="back to top">&#xF148;</a>');
		$backToTop.on('click', '[data-id="top"]', e => {
			e.preventDefault();
			scrollTo(0, 0);
		});
		modules['floater'].addElement($backToTop);
	}
}
