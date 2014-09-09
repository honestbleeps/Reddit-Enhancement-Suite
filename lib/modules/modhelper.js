modules['modHelper'] = {
	moduleID: 'modHelper',
	moduleName: 'Mod Helper',
	category: 'UI',
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
		'general': 'For a quick overview on styling for RES users, please see [our wiki article](/r/Enhancement/wiki/subredditstyling)',
		'no-res-styles': 'It appears you haven\'t done any styling at all for RES.  If you are interested in a quick overview on styling for RES users, please see [our wiki article](/r/Enhancement/wiki/subredditstyling)',
		'keyNav': 'Styling "RES-keyNav-activeElement"?  This is the element that RES uses for Keyboard Navigation - it indicates the currently selected post, and is crucial to RES functionality. If you don\'t personally care for how it looks, please consider styling it to fit better in your subreddit. Some subs use a transparent background and only a border, for example.',
		'keyNav-benice': 'It appears that you are hiding the RES-keyNav-activeElement class. This negatively affects RES users by rendering keyboard navigation unusable. It\'s understandable that you may not care for the default appearance, but we politely request that you consider styling it to fit your subreddit, perhaps using an alternate background color, or a border. Even just a one-sided border, e.g. border-right: 3px solid blue; - thank you for your consideration.',
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
					) && (keyNavRule.indexOf('border') === -1)) {
					this.addTipToPane('keyNav-benice');
				} else {
					this.addTipToPane('keyNav');
				}
			}
		}
	},
	createTipPane: function() {
		var $sheetsDiv = $('div.sheets');

		this.tipPane = RESUtils.createElementWithID('div', 'RESStyleSheetTipPane');
		this.tipPaneHeader = RESUtils.createElementWithID('div', 'RESStyleSheetTipPane-header', null, 'RES specific styling tips');
		$(this.tipPaneHeader).click(function() {
			$(modules['modHelper'].tipPaneContents).slideToggle();
		});
		this.tipPaneContents = RESUtils.createElementWithID('div', 'RESStyleSheetTipPane-contents');
		this.tipPaneList = RESUtils.createElementWithID('ul', 'RESStyleSheetTipPane-list');
		this.tipPaneContents.appendChild(this.tipPaneList);

		this.tipPane.appendChild(this.tipPaneHeader);
		this.tipPane.appendChild(this.tipPaneContents);
		$sheetsDiv.before(this.tipPane);
	},
	addTipToPane: function(key) {
		var tipText = this.tips[key],
			tipHtml = this.converter.render(tipText),
			tip = RESUtils.createElementWithID('li', null, null);

		// this HTML is markdown -> html via SnuOwnd, and therefore safe
		tip.innerHTML = tipHtml;
		this.tipPaneList.appendChild(tip);
	}
};
