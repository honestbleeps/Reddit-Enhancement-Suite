modules['accountSwitcher'] = {
	moduleID: 'accountSwitcher',
	moduleName: 'Account Switcher',
	category: 'Accounts',
	options: {
		accounts: {
			type: 'table',
			addRowText: '+add account',
			fields: [{
				name: 'username',
				type: 'text'
			}, {
				name: 'password',
				type: 'password'
			}],
			value: [
				/*
				['somebodymakethis','SMT','[SMT]'],
				['pics','pic','[pic]']
				*/
			],
			description: 'Set your usernames and passwords below. They are only stored in RES preferences.'
		},
		keepLoggedIn: {
			type: 'boolean',
			value: false,
			description: 'Keep me logged in when I restart my browser.'
		},
		showCurrentUserName: {
			type: 'boolean',
			value: false,
			description: 'Show my current user name in the Account Switcher.'
		},
		dropDownStyle: {
			type: 'enum',
			values: [{
				name: 'snoo (alien)',
				value: 'alien'
			}, {
				name: 'simple arrow',
				value: 'arrow'
			}],
			value: 'alien',
			description: 'Use the "snoo" icon, or older style dropdown?'
		}
	},
	description: 'Store username/password pairs and switch accounts instantly while browsing Reddit!',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#header-bottom-right { height: auto; padding: 4px 4px 7px }')
			RESUtils.addCSS('#RESAccountSwitcherDropdown { min-width: 110px; width: auto; display: none; position: absolute; z-index: 1000; }');
			RESUtils.addCSS('#RESAccountSwitcherDropdown li { height: auto; line-height: 20px; padding: 2px 10px; }');
			if (this.options.dropDownStyle.value === 'alien') {
				RESUtils.addCSS('#RESAccountSwitcherIcon { cursor: pointer; margin-left: 3px; display: inline-block; width: 12px; vertical-align: middle; height: 16px; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 11px; height: 22px; background-position: 2px 3px; padding-left: 2px; padding-right: 2px; padding-top: 3px; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; z-index: 100; background-repeat: no-repeat; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAPCAYAAAAyPTUwAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkQ3NTExRkExOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkQ3NTExRkEyOEYzNTExRTFBNjgzQzhEOUY2QzU2MUNFIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RDc1MTFGOUY4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RDc1MTFGQTA4RjM1MTFFMUE2ODNDOEQ5RjZDNTYxQ0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6W3fJJAAAB4ElEQVR42mJgwA4YgdgSiJUUFRXDW1tbL7Kzswsw4VDMBcRXgfgeMzPzJx4eHn4gG0MtSICPjY3NF0jLoCtglJWV1eDm5rZmZWX9k5ZbWGFmYqwhwM3B8Pn7T4bzl6/enzNlQsfrV68+srKxPWHMz89/ZmJiIunn58fA9+YKAwMHHwODlA4Dw4fHDAzPbzD8VLRhWLNuPcOzp0//MEhJSaU/f/HyPxhkyf//3xsEYa+s/f8/nOn//19f/n/98fO/jo5ONwMfH5/S27dvwfL/nt/5//8rhP3/z7f//55cgzD//PkPdK4F2N3x8fFLv3///v/d56//l69a83///v3/V65e8//+k+f///79+7+4uPgAUB0zIywUgNZEZmVlzRMTE2P78OEDA9DTDN++ffs3c+bMglOnTk0HqvkDC5p/L168+P7582cmaWlpBhUVFQZ5eXkGoPUMDx8+BMn/QQ5C1vb29r+HDx/+jwwuXLjwv7e39z8wWHkYkAOdk5OT4cePHygx9OXLF7BzgPpQo05NTS2mp6fnO7LJc+bM+a2np1eKNUFISEg0gEIFHIz//v3X1dWdDU1UYMAMYzg7O8eUlpYmXLly5dtfFm6h40cO3DU2NhYBphOea9euHQOpAQgwAKMW+Z5mJFvIAAAAAElFTkSuQmCC); }');
			} else {
				RESUtils.addCSS('#RESAccountSwitcherIcon { display: inline-block; vertical-align: middle; margin-left: 3px; }');
				RESUtils.addCSS('#RESAccountSwitcherIcon .downArrow { cursor: pointer; margin-top: 2px; display: block; width: 16px; height: 10px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0 -106px; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay { cursor: pointer; position: absolute; display: none; width: 20px; height: 22px; z-index: 100; border: 1px solid #369; border-bottom: 1px solid #5f99cf; background-color: #5f99cf; border-radius: 3px 3px 0 0; }');
				RESUtils.addCSS('#RESAccountSwitcherIconOverlay .downArrow { margin-top: 6px; margin-left: 3px; display: inline-block; width: 18px; height: 10px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-position: 0 -96px; }');
				// this.alienIMG = '<span class="downArrow"></span>';
			}
			// RESUtils.addCSS('#RESAccountSwitcherIconOverlay { display: none; position: absolute; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.userLink = document.querySelector('#header-bottom-right > span.user > a');
			if (this.userLink) {
				this.userLink.style.marginRight = '2px';
				this.loggedInUser = RESUtils.loggedInUser();
				// var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
				if (this.options.dropDownStyle.value === 'alien') {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"></span>');
				} else {
					this.downArrowOverlay = $('<span id="RESAccountSwitcherIconOverlay"><span class="downArrow"></span></span>');
					this.downArrow = $('<span id="RESAccountSwitcherIcon"><span class="downArrow"></span></span>');
				}
				this.downArrowOverlay.on('click', function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
					modules['accountSwitcher'].manageAccounts();
				}).appendTo(document.body);

				this.downArrow.on('click', function() {
					modules['accountSwitcher'].updateUserDetails();
					modules['accountSwitcher'].toggleAccountMenu(true);
				});
				this.downArrowOverlay.on('mouseleave', function() {
					modules['accountSwitcher'].dropdownTimer = setTimeout(function() {
						modules['accountSwitcher'].toggleAccountMenu(false);
					}, 1000);
				});

				// insertAfter(this.userLink, downArrow);
				$(this.userLink).after(this.downArrow);

				this.accountMenu = $('<ul id="RESAccountSwitcherDropdown" class="RESDropdownList"></ul>')
				this.accountMenu.on('mouseenter', function() {
					clearTimeout(modules['accountSwitcher'].dropdownTimer);
				});
				this.accountMenu.on('mouseleave', function() {
					modules['accountSwitcher'].toggleAccountMenu(false);
				});
				// RESUtils.addStyle(css);
				var accounts = this.options.accounts.value;
				if (accounts !== null) {
					var accountCount = 0;
					for (var i = 0, len = accounts.length; i < len; i++) {
						var thisPair = accounts[i],
							username = thisPair[0];
						if (!this.loggedInUser || username.toUpperCase() !== this.loggedInUser.toUpperCase() || this.options.showCurrentUserName.value) {
							accountCount++;
							var $accountLink = $('<li>', {
								'class': 'accountName'
							});
							// Check if user is logged in before comparing
							if (this.loggedInUser && username.toUpperCase() === this.loggedInUser.toUpperCase()) {
								$accountLink.addClass('active');
							}

							$accountLink
								.data('username', username)
								.html(username)
								.css('cursor', 'pointer')
								.on('click', function(e) {
									e.preventDefault();
									modules['accountSwitcher'].switchTo($(this).data('username'));
								})
								.appendTo(this.accountMenu);

							RESUtils.getUserInfo(function(userInfo) {
								var userDetails = username;

								// Display the karma of the user, if it is already pre-fetched
								if (userInfo && !userInfo.error && userInfo.data) {
									userDetails = username + ' (' + userInfo.data.link_karma + ' &middot; ' + userInfo.data.comment_karma + ')';
								}

								$accountLink.html(userDetails);
							}, username, false);
						}
					}
					$('<li>', {
						'class': 'addAccount'
					})
						.text('+ add account')
						.css('cursor', 'pointer')
						.on('click', function(e) {
							e.preventDefault();
							modules['accountSwitcher'].toggleAccountMenu(false);
							modules['accountSwitcher'].manageAccounts();
						})
						.appendTo(this.accountMenu);
				}
				$(document.body).append(this.accountMenu);
			}
		}
	},
	updateUserDetails: function() {
		this.accountMenu.find('.accountName').each(function(index) {
			var username = $(this).data('username'),
				that = this;

			// Ignore "+ add account"
			if (typeof username === 'undefined') {
				return;
			}

			// Leave a 500 ms delay between requests
			setTimeout(function() {
				RESUtils.getUserInfo(function(userInfo) {
					// Fail if retrieving the user's info results in an error (such as a 404)
					if (!userInfo || userInfo.error || !userInfo.data) {
						return;
					}

					// Display the karma of the user
					var userDetails = username + ' (' + userInfo.data.link_karma + ' &middot; ' + userInfo.data.comment_karma + ')';
					$(that).html(userDetails);
				}, username);
			}, 500 * index);
		});
	},
	toggleAccountMenu: function(open) {
		if ((open) || (!$(modules['accountSwitcher'].accountMenu).is(':visible'))) {
			var thisHeight = 18;
			if ($('#RESAccountSwitcherDropdown').css('position') !== 'fixed') {
				var thisX = $(modules['accountSwitcher'].userLink).offset().left;
				var thisY = $(modules['accountSwitcher'].userLink).offset().top;
			} else {
				var thisX = $('#header-bottom-right').position().left + $(modules['accountSwitcher'].userLink).position().left;
				var thisY = $(modules['accountSwitcher'].userLink).position().top;
				if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
					thisHeight += $('#sr-header-area').height();
				} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
					thisHeight += $('#sr-header-area').height();
				}
			}
			$(modules['accountSwitcher'].accountMenu).css({
				top: (thisY + thisHeight) + 'px',
				left: (thisX) + 'px'
			});
			$(modules['accountSwitcher'].accountMenu).show();
			var thisX = $(modules['accountSwitcher'].downArrow).offset().left;
			var thisY = $(modules['accountSwitcher'].downArrow).offset().top;
			$(modules['accountSwitcher'].downArrowOverlay).css({
				top: (thisY - 4) + 'px',
				left: (thisX - 3) + 'px'
			});

			$(modules['accountSwitcher'].downArrowOverlay).show();
			modules['styleTweaks'].setSRStyleToggleVisibility(false, 'accountSwitcher');

		} else {
			$(modules['accountSwitcher'].accountMenu).hide();
			$(modules['accountSwitcher'].downArrowOverlay).hide();
			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'accountSwitcher');
		}
	},
	closeAccountMenu: function() {
		// this function basically just exists for other modules to call.
		if (!this.accountMenu) return;
		$(this.accountMenu).hide();
	},
	switchTo: function(username) {
		var accounts = this.options.accounts.value;
		var password = '';
		var rem = '';
		if (this.options.keepLoggedIn.value) {
			rem = '&rem=on';
		}
		for (var i = 0, len = accounts.length; i < len; i++) {
			var thisPair = accounts[i];
			if (thisPair[0].toUpperCase() === username.toUpperCase()) {
				password = thisPair[1];
				break;
			}
		}
		var loginUrl = 'https://ssl.reddit.com/api/login';
		// unfortunately, due to 3rd party cookie issues, none of the below browsers work with ssl.
		if (BrowserDetect.isOpera()) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		} else if ((BrowserDetect.isChrome()) && (chrome.extension.inIncognitoContext)) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		} else if (BrowserDetect.isSafari()) {
			loginUrl = 'http://' + location.hostname + '/api/login';
		}

		// Remove old session cookie
		RESUtils.deleteCookie('reddit_session');

		GM_xmlhttpRequest({
			method: "POST",
			url: loginUrl,
			data: 'user=' + encodeURIComponent(username) + '&passwd=' + encodeURIComponent(password) + rem,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			onload: function(response) {
				var badData = false;
				try {
					var data = JSON.parse(response.responseText);
				} catch (error) {
					var data = {};
					badData = true;
					console.log(error);
				}

				var error = /WRONG_PASSWORD/;
				var rateLimit = /RATELIMIT/;
				if (badData) {
					modules['notifications'].showNotification({
						type: 'error',
						moduleID: 'accountSwitcher',
						message: 'Could not switch accounts. Reddit may be under heavy load. Please try again in a few moments.'
					});
				} else if (error.test(response.responseText)) {
					alert('Incorrect login and/or password. Please check your configuration.');
				} else if (rateLimit.test(response.responseText)) {
					alert('RATE LIMIT: The Reddit API is seeing too many hits from you too fast, perhaps you keep submitting a wrong password, etc?  Try again in a few minutes.');
				} else if (badData) {
					alert('An error of some unknown type has occurred. Please check the error console in your browser for details and report the issue in /r/RESIssues');
					console.log(response.responseText);
				} else {
					location.reload();
				}
			}
		});
	},
	manageAccounts: function() {
		modules['settingsNavigation'].loadSettingsPage('accountSwitcher', 'accounts');
	}
};
