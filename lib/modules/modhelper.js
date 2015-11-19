addModule('modHelper', {
	moduleID: 'modHelper',
	moduleName: 'Mod Helper',
	category: ['Core'],
	description: 'Helps moderators via tips and tricks for playing nice with RES',
	hidden: true,
	alwaysEnabled: true,
	isEnabled: function() {
		return true;
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
	},
	go: function() {
		if (RESUtils.pageType() === 'stylesheet') {
			this.converter = window.SnuOwnd.getParser();
			this.doStyleSheetCheck();
		}
	},
	tips: {
		'no-res-styles': 'It appears you haven\'t done any styling specific to RES.  If you are interested in a quick overview on styling for RES users, please see [our wiki article](/r/Enhancement/wiki/subredditstyling)',
		'keyNav': 'Styling `RES-keyNav-activeElement`? This is the element RES uses for Keyboard Navigation - it indicates the currently selected post, and is crucial to RES functionality. If you don\'t like the way it looks with your theme, you may style it however you want, as long as Keyboard Navigation remains usable for your visitors.',
		'keyNav-benice': 'It appears that you are hiding `RES-keyNav-activeElement`. This negatively affects RES users by rendering keyboard navigation unusable. It\'s understandable that you may not care for the default appearance, but we politely request that you consider styling it to fit your subreddit, perhaps using a particular background color or border. Even just a one-sided border, e.g. `border-right: 3px solid blue;` - thank you for your consideration.\n\n\ For convenience we\'ve included `RES-keyNav-activeThing` which can be used as an alternative to `RES-keyNav-activeElement`. It applies to elements with the class `thing` as opposed to `entry`. If you choose to use this, make sure keyboard navigation is usable when [commentBoxes](/r/' + RESUtils.currentSubreddit() + '/about/stylesheet/#!settings/styleTweaks/commentBoxes) is turned off.',
		'nightmode': 'Want your subreddit to be night mode friendly? Please have a look at [the night mode section of our wiki](/r/Enhancement/wiki/subredditstyling#wiki_res_night_mode_and_your_subreddit)'
	},
	doStyleSheetCheck: function() {
		var stylesheetTextarea = $('.stylesheet-customize-container textarea'),
			stylesheet = (stylesheetTextarea.length) ? $(stylesheetTextarea).val() : '',
			len = stylesheet.length,
			keyNavIdx, keyNavRule, i, thisChar;

		this.createTipPane();
		if (stylesheet.length) {
			// check if they have any RES styles at all
			if ((stylesheet.indexOf('.res') === -1) && (stylesheet.indexOf('.RES') === -1)) {
				this.addTipToPane('no-res-styles');
			}
			if (stylesheet.indexOf('.res-nightmode') === -1) {
				this.addTipToPane('nightmode');
			}

			// check if they're hiding RES-keyNav-activeElement
			keyNavIdx = stylesheet.indexOf('.RES-keyNav-activeElement');
			if (keyNavIdx !== -1) {
				keyNavRule = '';
				i = keyNavIdx;
				while (i < len) {
					thisChar = stylesheet.charAt(i);
					keyNavRule += thisChar;
					if (thisChar === '}') {
						i = len;
					}
					i++;
				}
				if ((
					(keyNavRule.indexOf('transparent') !== -1) ||
					(keyNavRule.indexOf('background: none') !== -1) ||
					(keyNavRule.indexOf('background-color: none') !== -1)
					) && (keyNavRule.indexOf('border') === -1) && (stylesheet.indexOf('.RES-keyNav-activeThing') === -1)) {
					this.addTipToPane('keyNav-benice');
				} else {
					this.addTipToPane('keyNav');
				}
			}
		}
	},
	createTipPane: function() {
		var $sheetsDiv = $('div.sheets');

		this.tipPane = RESUtils.createElement('div', 'RESStyleSheetTipPane');
		this.tipPaneHeader = RESUtils.createElement('div', 'RESStyleSheetTipPane-header', 'minimized', 'RES specific styling tips');

		this.tipPaneCloseButton = RESUtils.createElement('span', 'RESStyleSheetTipPane-close', 'RESCloseButton');
		this.tipPaneCloseButton.innerHTML = '&times;';
		this.tipPaneCloseButton.setAttribute('title', 'Close for this session');
		this.tipPaneCloseButton.addEventListener('click', modules['modHelper'].hideTipPane, false);

		this.tipPaneHeaderSpan = RESUtils.createElement('span', null, 'details', '[click for details]');

		this.tipPaneHeader.appendChild(this.tipPaneCloseButton);
		this.tipPaneHeader.appendChild(this.tipPaneHeaderSpan);
		this.tipPaneHeader.addEventListener('click', modules['modHelper'].toggleTipPane, false);
		this.tipPaneContents = RESUtils.createElement('div', 'RESStyleSheetTipPane-contents');
		this.tipPaneList = RESUtils.createElement('ul', 'RESStyleSheetTipPane-list');
		this.tipPaneContents.appendChild(this.tipPaneList);

		this.tipPane.appendChild(this.tipPaneHeader);
		this.tipPane.appendChild(this.tipPaneContents);
		$sheetsDiv.before(this.tipPane);
	},
	hideTipPane: function() {
		sessionStorage.hideTipPane = true;
		$(modules['modHelper'].tipPane).hide();
	},
	toggleTipPane: function() {
		if (modules['modHelper'].tipPaneHeader.classList.contains('minimized')) {
			modules['modHelper'].openTipPaneContents();
		} else {
			modules['modHelper'].closeTipPaneContents();
		}
	},
	openTipPaneContents: function() {
		modules['modHelper'].tipPaneHeader.classList.remove('minimized');
		$(modules['modHelper'].tipPaneContents).slideDown();
	},
	closeTipPaneContents: function() {
		modules['modHelper'].tipPaneHeader.classList.add('minimized');
		$(modules['modHelper'].tipPaneContents).slideUp();
	},
	addTipToPane: function(key) {
		var tipText = this.tips[key],
			tipHtml = this.converter.render(tipText),
			tip = RESUtils.createElement('li', null, null);

		if (!sessionStorage.hideTipPane) {
			$(this.tipPane).show();
		}
		// this HTML is markdown -> html via SnuOwnd, and therefore safe
		tip.innerHTML = tipHtml;
		this.tipPaneList.appendChild(tip);
	}
});
