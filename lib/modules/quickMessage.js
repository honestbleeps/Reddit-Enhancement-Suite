addModule('quickMessage', function(module, moduleID) {
	module.moduleName = 'Quick Message';
	module.category = 'Editing';
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
		quickModeratorMessage: {
			type: 'boolean',
			value: true,
			description: 'Open the quick message dialog when clicking on "message the moderators" instead of going straight to reddit\'s message page.'
		}
	};
	module.beforeLoad = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			RESTemplates.load('quickMessage');
			RESTemplates.load('quickMessageCSS', function(template) {
				RESUtils.addCSS(template.text());
			});
		}
	};
	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			module.quickMessageDialog = RESUtils.createElementWithID('div', 'quickMessage');
			$(module.quickMessageDialog).html(RESTemplates.getSync('quickMessage').html());
			document.body.appendChild(module.quickMessageDialog);

			module.attachEventListeners();

			var subreddit = RESUtils.currentSubreddit(),
				messageTheMods = document.querySelector('.side a.helplink');
			if (module.options.quickModeratorMessage.value && subreddit && messageTheMods) {
				messageTheMods.addEventListener('click', function(e) {
					if (e.which === 1) {
						e.preventDefault();
						module.openQuickMessageDialog({'to': '/r/' + subreddit});
					}
				});
			}

			modules['commandLine'].registerCommand('qm', 'qm [recipient [message]] - open quick message dialog',
				function(command, val, match) {
					var message = module.parseCommandLine(val);
					if (message.body) {
						return 'quick message to ' + message.to + ': ' + message.body;
					} else if (message.to) {
						return 'quick message to ' + val;
					}
					return 'quick message';
				}, function(command, val, match, e) {
					var message = module.parseCommandLine(val);
					module.openQuickMessageDialog(message);
				}
			);
		}
	};
	module.parseCommandLine = function(val) {
		var parts = {};
		var vals = val.match(/^([^\s]+)(?:\s(.*))?$/);

		if (vals) {
			parts.to = vals[1];
			parts.body = vals[2];
		}

		return parts;
	};
	module.attachEventListeners = function() {
		//keyboard shortcut
		window.addEventListener('keydown', function(e) {
			if (RESUtils.checkKeysForEvent(e, module.options.openQuickMessage.value)) {
				e.preventDefault();
				module.openQuickMessageDialog();
			}
		}, true);

		// close dialog with "x" button
		module.quickMessageDialog.querySelector('#quickMessageDialogClose').addEventListener('click', function(e) {
			e.preventDefault();
			module.closeQuickMessageDialog();
		}, false);
		// close dialog with escape key
		module.quickMessageDialog.addEventListener('keydown', function(e) {
			if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
				e.preventDefault();
				module.closeQuickMessageDialog();
			}
		}, true);

		// send with "send message" button (we would use a 'submit' event listener, but then the user could accidentally send the message by pressing enter)
		module.quickMessageDialog.querySelector('#quickMessageDialogSend').addEventListener('click', function(e) {
			e.preventDefault();
			module.sendMessage();
		}, true);
		// send with control-enter
		modules['commentTools'].onCtrlEnter(
			'#quickMessageDialog',
			module.sendMessage
		);

		// open full message form
		var fullMessageForm = module.quickMessageDialog.querySelector('a.fullMessageForm');
		fullMessageForm.addEventListener('mousedown', function(e) {
			// For accessibility reasons, update the link instead of simulating browser behavior with JavaScript
			this.href = module.getFullMessageFormUrl();
		});
		fullMessageForm.addEventListener('click', function(e) {
			module.closeQuickMessageDialog();
		});

		$(module.quickMessageDialog).find('a').on('keypress', function(e) {
			if ((e.keyCode || e.which) === 13) {
				$(e.target).trigger('click');
			}
		});
	};
	module.getValidSendFrom = function(callback) {
		var username = RESUtils.loggedInUser();
		if (!username) {
			callback([]);
			return;
		}
		var senders = ['/u/' + username],
			sendFromCacheKey = 'RESUtils.sendFromCache.' + username;
		// We moderate a subreddit
		if (RESUtils.isModeratorAnywhere()) {
			callback(senders); // return initial data early
			RESUtils.cache.fetch({
				key: sendFromCacheKey,
				endpoint: 'subreddits/mine/moderator.json?limit=100&show=all',
				handleData: function (response) {
					return senders.concat(response.data.children.map(function (e) {
						return e.data.url.slice(0, -1);
					}));
				},
				callback: callback
			});
		// We don't moderate anything
		} else {
			RESUtils.cache.expire({ key: sendFromCacheKey });
			callback(senders);
		}
	};
	var setUpSendFromDropdownDone = false;
	module.setUpSendFromDropdown = function() {
		if (setUpSendFromDropdownDone) return;
		setUpSendFromDropdownDone = true;
		module.getValidSendFrom(function(senders) {
			var selectElement = module.quickMessageDialog.querySelector('select#quickMessageDialogFrom'),
				currentOption;
			senders.forEach(function(elem) {
				currentOption = document.createElement('option');
				currentOption.text = elem;
				selectElement.add(currentOption);
			});
		});
	};
	module.focusFirstEmpty = function() {
		var elems = module.quickMessageDialog.querySelectorAll('input, textarea');
		for(var len = elems.length, i = 0; i < len; i++) {
			if (!elems[i].value || i === len - 1) {
				elems[i].focus();
				break;
			}
		}
	};
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

		module.setUpSendFromDropdown();

		if (!fields) {
			fields = {};
		}

		var quickMessageDialogFrom = module.quickMessageDialog.querySelector('select#quickMessageDialogFrom'),
			indexToSelect = 0;
		for(var i = 0, len = quickMessageDialogFrom.options.length; i < len; i++) {
			if (quickMessageDialogFrom.options[i].textContent === fields.from) {
				indexToSelect = i;
				break;
			}
		}
		quickMessageDialogFrom.selectedIndex = indexToSelect;

		module.quickMessageDialog.querySelector('input#quickMessageDialogTo').value = fields.to || '';
		module.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value = fields.subject || module.options.defaultSubject.value;
		module.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value = fields.body || '';

		RESUtils.fadeElementIn(module.quickMessageDialog, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'quickMessage');

		module.focusFirstEmpty();
	};
	module.closeQuickMessageDialog = function() {
		RESUtils.fadeElementOut(module.quickMessageDialog, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'quickMessage');

		if (modules['keyboardNav'].isEnabled()) {
			var inputs = module.quickMessageDialog.querySelectorAll('INPUT, TEXTAREA, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	};
	module.getCurrentFieldValues = function() {
		return {
			from: module.quickMessageDialog.querySelector('select#quickMessageDialogFrom').value,
			to: module.quickMessageDialog.querySelector('input#quickMessageDialogTo').value,
			subject: module.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value,
			body: module.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value
		};
	};
	module.getFullMessageFormUrl = function() {
		var fields = module.getCurrentFieldValues(),
			subreddit = (fields.from.substring(0, 3) === '/r/') ? fields.from : '';
		return location.protocol + '//' + location.hostname + subreddit + '/message/compose?to=' + encodeURIComponent(fields.to) + '&subject=' + encodeURIComponent(fields.subject) + '&message=' + encodeURIComponent(fields.body);
	};
	module.presetSendErrors = {
		'NO_USER': 'No recipient specified.',
		'NO_SUBJECT': 'No subject specified.',
		'NO_TEXT': 'Message body is empty.',
		'BAD_CAPTCHA': '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>',
		'TOO_LONG': 'Either your subject (max 100 characters) or body (max 10,000 characters) is too long.'
	};
	module.sendMessage = function() {
		var fields = module.getCurrentFieldValues(),
			fromSubreddit = (fields.from.substring(0, 3) === '/r/') ? ('&from_sr=' + fields.from.substring(3)) : '';
		BrowserStrategy.ajax({
			method: 'POST',
			url: 'https://' + location.hostname + '/api/compose',
			data: 'api_type=json' + fromSubreddit + '&subject=' + encodeURIComponent(fields.subject) + '&text=' + encodeURIComponent(fields.body) + '&to=' + encodeURIComponent(fields.to),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Modhash': RESUtils.loggedInUserHash()
			},
			onload: function(response) {
				if (response.status === 200) {
					var data = safeJSON.parse(response.responseText).json;

					if (data.errors[0]) {
						console.log(data);

						modules['notifications'].showNotification({
							moduleID: 'quickMessage',
							notificationID: 'quickMessageSendError',
							header: 'Message not sent.',
							closeDelay: 15000,
							message: module.presetSendErrors[data.errors[0][0]] || (data.errors[0][0] + ' : ' + data.errors[0][1]) // errors[0][0] is the error name, [1] is reddit's description of the error
						});
					} else {
						module.closeQuickMessageDialog();
					}
				} else {
					console.log(response);

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
	};
});
