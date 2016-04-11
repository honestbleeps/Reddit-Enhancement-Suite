import { $ } from '../core/global';
import { markdown } from 'snudown-js';

addModule('modHelper', (module, moduleID) => {
	module.moduleName = 'Mod Helper';
	module.category = ['Core'];
	module.description = 'Helps moderators via tips and tricks for playing nice with RES';
	module.hidden = true;
	module.alwaysEnabled = true;
	module.go = function() {
		if (RESUtils.pageType() === 'stylesheet') {
			doStyleSheetCheck();
		}
	};

	const tips = {
		'no-res-styles': 'It appears you haven\'t done any styling specific to RES.  If you are interested in a quick overview on styling for RES users, please see [our wiki article](/r/Enhancement/wiki/subredditstyling)',
		keyNav: 'Styling `RES-keyNav-activeElement`? This is the element RES uses for Keyboard Navigation - it indicates the currently selected post, and is crucial to RES functionality. If you don\'t like the way it looks with your theme, you may style it however you want, as long as Keyboard Navigation remains usable for your visitors.',
		'keyNav-benice': `It appears that you are hiding \`RES-keyNav-activeElement\`. This negatively affects RES users by rendering keyboard navigation unusable. It's understandable that you may not care for the default appearance, but we politely request that you consider styling it to fit your subreddit, perhaps using a particular background color or border. Even just a one-sided border, e.g. \`border-right: 3px solid blue;\` - thank you for your consideration.\n\n For convenience we've included \`RES-keyNav-activeThing\` which can be used as an alternative to \`RES-keyNav-activeElement\`. It applies to elements with the class \`thing\` as opposed to \`entry\`. If you choose to use this, make sure keyboard navigation is usable when [commentBoxes](/r/${RESUtils.currentSubreddit()}/about/stylesheet/#!settings/styleTweaks/commentBoxes) is turned off.`,
		nightmode: 'Want your subreddit to be night mode friendly? Please have a look at [the night mode section of our wiki](/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit)'
	};

	function doStyleSheetCheck() {
		const $stylesheetTextarea = $('.stylesheet-customize-container textarea');
		const stylesheet = ($stylesheetTextarea.length) ? $($stylesheetTextarea).val() : '';

		createTipPane();
		if (stylesheet.length) {
			// check if they have any RES styles at all
			if ((stylesheet.indexOf('.res') === -1) && (stylesheet.indexOf('.RES') === -1)) {
				addTipToPane('no-res-styles');
			}
			if (stylesheet.indexOf('.res-nightmode') === -1) {
				addTipToPane('nightmode');
			}

			// check if they're hiding RES-keyNav-activeElement
			const keyNavIdx = stylesheet.indexOf('.RES-keyNav-activeElement');
			if (keyNavIdx !== -1) {
				let keyNavRule = '';
				let i = keyNavIdx;
				while (i < stylesheet.length) {
					const thisChar = stylesheet.charAt(i);
					keyNavRule += thisChar;
					if (thisChar === '}') {
						i = stylesheet.length;
					}
					i++;
				}
				if ((
					(keyNavRule.indexOf('transparent') !== -1) ||
					(keyNavRule.indexOf('background: none') !== -1) ||
					(keyNavRule.indexOf('background-color: none') !== -1)
					) && (keyNavRule.indexOf('border') === -1) && (stylesheet.indexOf('.RES-keyNav-activeThing') === -1)) {
					addTipToPane('keyNav-benice');
				} else {
					addTipToPane('keyNav');
				}
			}
		}
	}

	let tipPane, tipPaneHeader, tipPaneContents, tipPaneList;

	function createTipPane() {
		const $sheetsDiv = $('div.sheets');

		tipPane = RESUtils.createElement('div', 'RESStyleSheetTipPane');
		tipPaneHeader = RESUtils.createElement('div', 'RESStyleSheetTipPane-header', 'minimized', 'RES specific styling tips');

		const tipPaneCloseButton = RESUtils.createElement('span', 'RESStyleSheetTipPane-close', 'RESCloseButton');
		tipPaneCloseButton.innerHTML = '&times;';
		tipPaneCloseButton.setAttribute('title', 'Close for this session');
		tipPaneCloseButton.addEventListener('click', hideTipPane, false);

		const tipPaneHeaderSpan = RESUtils.createElement('span', null, 'details', '[click for details]');

		tipPaneHeader.appendChild(tipPaneCloseButton);
		tipPaneHeader.appendChild(tipPaneHeaderSpan);
		tipPaneHeader.addEventListener('click', toggleTipPane, false);
		tipPaneContents = RESUtils.createElement('div', 'RESStyleSheetTipPane-contents');
		tipPaneList = RESUtils.createElement('ul', 'RESStyleSheetTipPane-list');
		tipPaneContents.appendChild(tipPaneList);

		tipPane.appendChild(tipPaneHeader);
		tipPane.appendChild(tipPaneContents);
		$sheetsDiv.before(tipPane);
	}

	function hideTipPane() {
		sessionStorage.hideTipPane = true;
		$(tipPane).hide();
	}

	function toggleTipPane() {
		if (tipPaneHeader.classList.contains('minimized')) {
			openTipPaneContents();
		} else {
			closeTipPaneContents();
		}
	}

	function openTipPaneContents() {
		tipPaneHeader.classList.remove('minimized');
		$(tipPaneContents).slideDown();
	}

	function closeTipPaneContents() {
		tipPaneHeader.classList.add('minimized');
		$(tipPaneContents).slideUp();
	}

	function addTipToPane(key) {
		const tipText = tips[key];
		const tipHtml = markdown(tipText);
		const tip = RESUtils.createElement('li', null, null);

		if (!sessionStorage.hideTipPane) {
			$(tipPane).show();
		}
		// this HTML is markdown -> html via SnuOwnd, and therefore safe
		tip.innerHTML = tipHtml;
		tipPaneList.appendChild(tip);
	}
});
