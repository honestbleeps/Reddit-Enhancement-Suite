addModule('quickMessage', function(module, moduleID) {
	module.moduleName = 'Quick Message';
	module.category = ['Users', 'My account'];
	module.description = 'A pop-up dialog that allows you to send messages from anywhere on reddit. Messages can be sent from the quick message dialog by pressing control-enter or command-enter.';
	module.options = {
		openQuickMessage: {
			type: 'keycode',
			value: [77, false, true, false], // control-m
			description: 'Keyboard shortcut to open the quick message dialog.'
		},
		defaultSubject: {
			type: 'text',
			value: '',
			description: 'Text that will automatically be inserted into the subject field, unless it is auto-filled by context.'
		},
		sendAs: {
			type: 'enum',
			values: [{
				name: 'Current user',
				value: 'user'
			}, {
				name: 'Current subreddit',
				value: 'sub'
			}, {
				name: 'Last selected',
				value: 'last'
			}, {
				name: 'Last selected (this page load)',
				value: 'temporary'
			}],
			value: 'user',
			description: 'The default user or subreddit to select when the "from" field is unspecified.<p>Reverts to the current user if the selected option can\'t be used (i.e. you aren\'t a moderator of the current subreddit).</p>'
		},
		handleContentLinks: {
			type: 'boolean',
			value: true,
			description: 'Open the quick message dialog when clicking on reddit.com/message/compose links in comments, selftext, or wiki pages.'
		},
		handleSideLinks: {
			type: 'boolean',
			value: true,
			description: 'Open the quick message dialog when clicking on reddit.com/message/compose links in the sidebar. (e.g. "message the moderators")'
		},
		linkToCurrentPage: {
			type: 'boolean',
			value: true,
			description: 'Automatically start with a link to the current page in the message body (or, if opened from the user info popup, a link to the current post or comment).'
		}
	};
	module.beforeLoad = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			RESTemplates.load('quickMessageCSS', function(template) {
				RESUtils.addCSS(template.text());
			});
		}
	};
	var quickMessageFields = {},
		quickMessageDialog;
	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			RESTemplates.load('quickMessage', function(template) {
				quickMessageDialog = RESUtils.createElement('div', 'quickMessage');
				$(quickMessageDialog).html(template.html());
				document.body.appendChild(quickMessageDialog);

				quickMessageFields.from = quickMessageDialog.querySelector('#quickMessageDialogFrom');
				quickMessageFields.to = quickMessageDialog.querySelector('#quickMessageDialogTo');
				quickMessageFields.subject = quickMessageDialog.querySelector('#quickMessageDialogSubject');
				quickMessageFields.body = quickMessageDialog.querySelector('#quickMessageDialogBody');

				attachEventListeners();
			});

			modules['commandLine'].registerCommand('qm', 'qm [recipient [message]] - open quick message dialog',
				function(command, val, match) {
					var message = parseCommandLine(val);
					if (message.body) {
						return 'quick message to ' + message.to + ': ' + message.body;
					} else if (message.to) {
						return 'quick message to ' + val;
					}
					return 'quick message';
				}, function(command, val, match, e) {
					var message = parseCommandLine(val);
					module.openQuickMessageDialog(message);
				}
			);
		}
	};
	function parseCommandLine(val) {
		var parts = {};
		var vals = val.match(/^([^\s]+)(?:\s(.*))?$/);

		if (vals) {
			parts.to = vals[1];
			parts.body = vals[2];
		}

		return parts;
	}
	var sendFromLabel;
	function updateModeratorIcon(state) {
		sendFromLabel = sendFromLabel || quickMessageDialog.querySelector('label[for=quickMessageDialogFrom]');
		sendFromLabel.classList.toggle('moderator', state);
	}
	function attachEventListeners() {
		//keyboard shortcut
		window.addEventListener('keydown', function(e) {
			if (RESUtils.checkKeysForEvent(e, module.options.openQuickMessage.value)) {
				e.preventDefault();
				module.openQuickMessageDialog();
			}
		}, true);

		// close dialog with "x" button
		quickMessageDialog.querySelector('#quickMessageDialogClose').addEventListener('click', function(e) {
			e.preventDefault();
			module.closeQuickMessageDialog();
		}, false);
		// close dialog with escape key
		quickMessageDialog.addEventListener('keydown', function(e) {
			if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
				e.preventDefault();
				module.closeQuickMessageDialog();
			}
		}, true);

		// send with "send message" button (we would use a 'submit' event listener, but then the user could accidentally send the message by pressing enter)
		quickMessageDialog.querySelector('#quickMessageDialogSend').addEventListener('click', function(e) {
			e.preventDefault();
			sendMessage();
		}, true);
		// send with control-enter
		modules['commentTools'].onCtrlEnter(
			'#quickMessageDialog',
			sendMessage
		);

		// open full message form
		var fullMessageForm = quickMessageDialog.querySelector('a.fullMessageForm');
		function updateUrl(e) { e.target.href = getFullMessageFormUrl(); }
		fullMessageForm.addEventListener('mousedown', updateUrl);
		fullMessageForm.addEventListener('focus', updateUrl); // mousedown isn't fired if you tab over to the button
		fullMessageForm.addEventListener('click', module.closeQuickMessageDialog);

		$(quickMessageDialog).find('a').on('keypress', function(e) {
			if ((e.keyCode || e.which) === 13) {
				$(e.target).trigger('click');
			}
		});

		// show moderator shield when sending from subreddit and store the user's selection
		quickMessageFields.from.addEventListener('change', function (e) {
			updateModeratorIcon(this.value.substr(0, 3) === '/r/');
			RESStorage.setItem('RESmodules.quickMessage.lastSentAs.' + RESUtils.loggedInUser(), this.value);
		});

		if (module.options.handleContentLinks.value) {
			$('div.content[role="main"]').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
		}
		if (module.options.handleSideLinks.value) {
			$('div.side').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
		}
	}
	function messageLinkEventHandler(event) {
		var url = event.target.href;
		var linkRe = /^(?:https?:\/\/(?:[\-\w\.]+\.)?reddit\.com)?(?:\/r\/[\-\w\.]+)?\/message\/compose/i;
		if (event.which === 1 && linkRe.test(url)) {
			event.preventDefault();

			var params = RESUtils.getUrlParams(url),
				srMatch = RESUtils.regexes.subreddit.exec(url);

			module.openQuickMessageDialog({
				from: srMatch ? ('/r/' + srMatch[1]) : undefined,
				to: params.to,
				subject: params.subject,
				body: params.message
			});
			return true;
		}
	}
	module.onClickMessageLink = function(event) {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return false;
		}
		return messageLinkEventHandler(event);
	};
	// Executes the callback with an array of objects as the only argument; each object is formatted as follows:
	// { name: '/u/realUsername' /* or '/r/subreddit' */,
	//   displayText: '/u/anonymous' /* optional */ }
	function getValidSendFrom(callback) {
		var username = RESUtils.loggedInUser();
		if (username) {
			callback([{
				name: '/u/' + username,
				displayText: '/u/' + (modules['usernameHider'].isEnabled() ? modules['usernameHider'].getDisplayText(username) : username)
			}]);
			var cacheKey = 'RESUtils.moderatedSubCache.' + username;
			if (RESUtils.isModeratorAnywhere()) {
				RESUtils.cache.fetch({
					key: cacheKey,
					endpoint: 'subreddits/mine/moderator.json?limit=100&show=all',
					handleData: function (response) {
						return response.data.children.map(function (e) {
							return { name: e.data.url.slice(0, -1) };
						});
					},
					callback: callback
				});
			} else {
				RESUtils.cache.expire({key: cacheKey});
			}
		} else {
			callback([]);
		}
	}
	var setUpSendFromDropdownDone = false;
	function setUpSendFromDropdown() {
		if (setUpSendFromDropdownDone) return;
		setUpSendFromDropdownDone = true;
		getValidSendFrom(function(senders) {
			senders.forEach(function(userOrSubreddit) {
				var currentOption = document.createElement('option');
				currentOption.value = userOrSubreddit.name;
				currentOption.text = userOrSubreddit.displayText || userOrSubreddit.name;
				quickMessageFields.from.add(currentOption);
			});
			quickMessageFields.from.disabled = (senders.length < 2);
		});
	}
	function focusFirstEmpty() {
		var elems = quickMessageDialog.querySelectorAll('input, textarea');
		for(var len = elems.length, i = 0; i < len; i++) {
			if (!elems[i].value || i === len - 1) {
				elems[i].focus();
				break;
			}
		}
	}
	function updateSelectedSender(desiredUser) {
		var sendAsOptions = Array.prototype.slice.apply(quickMessageFields.from.options)
				.map(function(e) { return e.textContent.toLowerCase(); }),
			indexToSelect = sendAsOptions.indexOf(desiredUser.toLowerCase());

		if (indexToSelect === -1) {
			indexToSelect = 0;
			switch(module.options.sendAs.value) {
				case 'sub':
					var subreddit = '/r/' + RESUtils.currentSubreddit();
					indexToSelect = sendAsOptions.indexOf(subreddit.toLowerCase());
					break;
				case 'last':
					var lastSelected = RESStorage.getItem('RESmodules.quickMessage.lastSentAs.' + RESUtils.loggedInUser());
					if (lastSelected) {
						indexToSelect = sendAsOptions.indexOf(lastSelected.toLowerCase());
					}
					break;
				case 'temporary':
					indexToSelect = quickMessageFields.from.selectedIndex;
					break;
				//case 'user':
				default:
					indexToSelect = 0;
					break;
			}
		}

		quickMessageFields.from.selectedIndex = (indexToSelect !== -1 ? indexToSelect : 0);
		updateModeratorIcon(quickMessageFields.from.value.substr(0, 3) === '/r/');
	}
	module.openQuickMessageDialog = function(fields) {
		if (!RESUtils.loggedInUser()) {
			modules['notifications'].showNotification({
				moduleID: 'quickMessage',
				notificationID: 'quickMessageNoUser',
				header: 'Not Logged In.',
				closeDelay: 3000,
				message: 'You must log in to use the quick message dialog.'
			});
			return;
		}

		setUpSendFromDropdown();

		if (!fields) {
			fields = {};
		}

		updateSelectedSender(fields.from || '');
		quickMessageFields.to.value = fields.to || '';
		quickMessageFields.subject.value = fields.subject || module.options.defaultSubject.value;
		quickMessageFields.body.value = fields.body || (module.options.linkToCurrentPage.value ? location.href : '');

		RESUtils.fadeElementIn(quickMessageDialog, 0.3);

		focusFirstEmpty();
	};
	module.closeQuickMessageDialog = function() {
		RESUtils.fadeElementOut(quickMessageDialog, 0.3);

		if (modules['keyboardNav'].isEnabled()) {
			var inputs = quickMessageDialog.querySelectorAll('INPUT, TEXTAREA, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	};
	function getFullMessageFormUrl() {
		var subreddit = (quickMessageFields.from.value.substring(0, 3) === '/r/') ? quickMessageFields.from.value : '';
		return location.protocol + '//' + location.hostname + subreddit + '/message/compose?to=' + encodeURIComponent(quickMessageFields.to.value) +
			'&subject=' + encodeURIComponent(quickMessageFields.subject.value) +
			'&message=' + encodeURIComponent(quickMessageFields.body.value);
	}
	var presetSendErrors = {
		'NO_USER': 'No recipient specified.',
		'NO_SUBJECT': 'No subject specified.',
		'NO_TEXT': 'Message body is empty.',
		'BAD_CAPTCHA': '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>',
		'TOO_LONG': 'Either your subject (max 100 characters) or body (max 10,000 characters) is too long.'
	};
	function sendMessage() {
		var from = quickMessageFields.from.value,
			fromSubreddit = (from.substring(0, 3) === '/r/') ? ('&from_sr=' + from.substring(3)) : '';
		RESEnvironment.ajax({
			method: 'POST',
			url: 'https://' + location.hostname + '/api/compose',
			data: 'api_type=json' + fromSubreddit +
				'&subject=' + encodeURIComponent(quickMessageFields.subject.value) +
				'&text=' + encodeURIComponent(quickMessageFields.body.value) +
				'&to=' + encodeURIComponent(quickMessageFields.to.value),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Modhash': RESUtils.loggedInUserHash()
			},
			onload: function(response) {
				if (response.status === 200) {
					var data = safeJSON.parse(response.responseText).json;

					if (data.errors[0]) {
						console.error(data);

						modules['notifications'].showNotification({
							moduleID: 'quickMessage',
							notificationID: 'quickMessageSendError',
							header: 'Message not sent.',
							closeDelay: 15000,
							message: presetSendErrors[data.errors[0][0]] || (data.errors[0][0] + ' : ' + data.errors[0][1]) // errors[0][0] is the error name, [1] is reddit's description of the error
						});
					} else {
						module.closeQuickMessageDialog();
					}
				} else {
					console.error(response);

					modules['notifications'].showNotification({
						moduleID: 'quickMessage',
						notificationID: 'failedToSendQuickMessage',
						header: 'Sending Failed!',
						closeDelay: 15000,
						message: 'Reddit is likely under heavy load. Either wait a minute or click on "open full message form" and try again (your message will be preserved).'
					});
				}
			}
		});
	}
});
