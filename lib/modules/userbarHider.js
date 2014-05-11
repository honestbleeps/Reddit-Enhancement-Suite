addModule('userbarHider', function(module, moduleID) {
	module.moduleName = 'User Bar Hider';
	module.description = 'Hide the user bar (username, karma, preferences, etc.) in the top right corner. <br> Previously part of Style Tweaks';
	module.category = 'Accounts';

	module.options['userbarState'] = {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible'
		}, {
			name: 'Hidden',
			value: 'hidden'
		}],
		value: 'visible',
		description: 'Is the userbar visible?'
	};
	/*
	module.options['toggleButtonState'] = {
		type: 'enum',
		values: [{
			name: 'Visible',
			value: 'visible'
		}, {
			name: 'Hidden',
			value: 'hidden'
		}
		// TODO: "educational"
		],
		value: 'visible',
		description: 'Is the button to toggle the userbar visible?'
	};
	*/

	module.beforeLoad = function() {
		// Migrate from previous version
		var userbarState = RESStorage.getItem('RESmodules.styleTweaks.userbarState');
		if (userbarState) {
			RESUtils.setOption(moduleID, 'userbarState', userbarState)
			// TODO: if userbarState == 'hidden' then set 'toggleButtonState' to 'visible' (assuming default = educational)

			RESStorage.removeItem('RESmodules.styleTweaks.userbarState');
		}
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.userbarHider();
		}
	};

	module.userbarHider = function() {
		RESUtils.addCSS("#userbarToggle { min-height: 22px; position: absolute; top: auto; bottom: 0; left: -5px; width: 16px; padding-right: 3px; height: 100%; font-size: 15px; border-radius: 4px 0; color: #a1bcd6; display: inline-block; background-color: #dfecf9; border-right: 1px solid #cee3f8; cursor: pointer; text-align: right; line-height: 24px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { min-height: 26px; }");
		RESUtils.addCSS("#header-bottom-right .user { margin-left: 16px; }");
		// RESUtils.addCSS(".userbarHide { background-position: 0 -137px; }");
		RESUtils.addCSS("#userbarToggle.userbarShow { left: -12px; }");
		RESUtils.addCSS(".res-navTop #userbarToggle.userbarShow { top: 0; bottom: auto; }");
		this.userbar = document.getElementById('header-bottom-right');
		if (this.userbar) {
			this.userbarToggle = RESUtils.createElementWithID('div', 'userbarToggle');
			$(this.userbarToggle).html('&raquo;');
			this.userbarToggle.setAttribute('title', 'Toggle Userbar');
			this.userbarToggle.classList.add('userbarHide');
			this.userbarToggle.addEventListener('click', function(e) {
				module.toggleUserBar();
			}, false);
			this.userbar.insertBefore(this.userbarToggle, this.userbar.firstChild);
			// var currHeight = $(this.userbar).height();
			// $(this.userbarToggle).css('height',currHeight+'px');
			if (module.options['userbarState'].value === 'hidden') {
				this.toggleUserBar();
			}
		}
	};


	module.toggleUserBar = function() {
		var nextEle = this.userbarToggle.nextSibling;
		// hide userbar.
		if (this.userbarToggle.classList.contains('userbarHide')) {
			this.userbarToggle.classList.remove('userbarHide');
			this.userbarToggle.classList.add('userbarShow');
			$(this.userbarToggle).html('&laquo;');
			RESUtils.setOption(moduleID, 'userbarState', 'hidden');
			modules['accountSwitcher'].closeAccountMenu();
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				nextEle.style.display = 'none';
				nextEle = nextEle.nextSibling;
			}
			// show userbar.
		} else {
			this.userbarToggle.classList.remove('userbarShow');
			this.userbarToggle.classList.add('userbarHide');
			$(this.userbarToggle).html('&raquo;');
			RESUtils.setOption(moduleID, 'userbarState', 'visible');
			while ((typeof nextEle !== 'undefined') && (nextEle !== null)) {
				if ((/mail/.test(nextEle.className)) || (nextEle.id === 'openRESPrefs')) {
					nextEle.style.display = 'inline-block';
				} else {
					nextEle.style.display = 'inline';
				}
				nextEle = nextEle.nextSibling;
			}
		}
	};

});
