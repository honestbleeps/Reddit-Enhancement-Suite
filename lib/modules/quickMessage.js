modules['quickMessage'] = {
	moduleID: 'quickMessage',
	moduleName: 'Quick Message',
	category: 'UI',
	description: 'A pop-up dialog that allows you to send messages from anywhere on reddit.\
		Messages can be sent from the quick message dialog by pressing control-enter or command-enter.',
	options: {
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
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESTemplates.load('quickMessage');
			RESTemplates.load('quickMessageCSS', function(template) {
				RESUtils.addCSS(template.text());
			});
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.quickMessageDialog = RESUtils.createElementWithID('div', 'quickMessage');
			$(this.quickMessageDialog).html(RESTemplates.getSync('quickMessage').html());
			document.body.appendChild(this.quickMessageDialog);

			this.attachEventListeners();
			this.setUpSendFromDropdown();

			var subreddit = RESUtils.currentSubreddit(),
				messageTheMods = document.querySelector('.side a.helplink');
			if (this.options.quickModeratorMessage.value && subreddit && messageTheMods) {
				messageTheMods.addEventListener('click', function(e) {
					if (e.which === 1) {
						e.preventDefault();
						modules['quickMessage'].openQuickMessageDialog({'to': '/r/' + subreddit});
					}
				});
			}

			modules['commandLine'].registerCommand('qm', 'qm [recipient [message]] - open quick message dialog',
				function(command, val, match) {
					var message = modules['quickMessage'].parseCommandLine(val);
					if (message.body) {
						return 'quick message to ' + message.to + ': ' + message.body;
					} else if (message.to) {
						return 'quick message to ' + val;
					}
					return 'quick message';
				}, function(command, val, match, e) {
					var message = modules['quickMessage'].parseCommandLine(val);
					modules['quickMessage'].openQuickMessageDialog(message);
				}
			);
		}
	},
	parseCommandLine: function(val) {
		var parts = {};
		var vals = val.match(/^([^\s]+)(?:\s(.*))?$/);

		if (vals) {
			parts.to = vals[1];
			parts.body = vals[2];
		}

		return parts;
	},
	attachEventListeners: function() {
		//keyboard shortcut
		window.addEventListener('keydown', function(e) {
			if (RESUtils.checkKeysForEvent(e, modules['quickMessage'].options.openQuickMessage.value)) {
				e.preventDefault();
				modules['quickMessage'].openQuickMessageDialog();
			}
		}, true);

		// close dialog with "x" button
		this.quickMessageDialog.querySelector('#quickMessageDialogClose').addEventListener('click', function(e) {
			e.preventDefault();
			modules['quickMessage'].closeQuickMessageDialog();
		}, false);
		// close dialog with escape key
		this.quickMessageDialog.addEventListener('keydown', function(e) {
			if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
				e.preventDefault();
				modules['quickMessage'].closeQuickMessageDialog();
			}
		}, true);

		// send with "send message" button (we would use a 'submit' event listener, but then the user could accidentally send the message by pressing enter)
		this.quickMessageDialog.querySelector('#quickMessageDialogSend').addEventListener('click', function(e) {
			e.preventDefault();
			modules['quickMessage'].sendMessage();
		}, true);
		// send with control-enter
		modules['commentTools'].onCtrlEnter(
			'#quickMessageDialog',
			modules['quickMessage'].sendMessage
		);

		// open full message form
		var fullMessageForm = this.quickMessageDialog.querySelector('a.fullMessageForm');
		fullMessageForm.addEventListener('mousedown', function(e) {
			// For accessibility reasons, update the link instead of simulating browser behavior with JavaScript
			this.href = modules['quickMessage'].getFullMessageFormUrl();
		});
		fullMessageForm.addEventListener('click', function(e) {
			modules['quickMessage'].closeQuickMessageDialog();
		});

		$(this.quickMessageDialog).find('a').on('keypress', function(e) {
			if ((e.keyCode || e.which) === 13) {
				$(e.target).trigger('click');
			}
		});
	},
	getValidSendFrom: function(callback) {
		var username = RESUtils.loggedInUser();
		if (!username) {
			callback([]);
			return;
		}

		var cacheData = RESStorage.getItem('RESUtils.sendFromCache.' + username) || '{}',
			sendFromCache = safeJSON.parse(cacheData),
			lastCheck = (sendFromCache !== null) ? parseInt(sendFromCache.lastCheck, 10) || 0 : 0,
			now = Date.now();

		if ((now - lastCheck) > 300000 || lastCheck > now) {
			sendFromCache.senders = [];
			sendFromCache.senders.push('/u/' + username);

			BrowserStrategy.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/subreddits/mine/moderator.json?app=res',
				data: 'limit=100&show=all',
				onload: function(response) {
					var thisResponse;
					try {
						thisResponse = JSON.parse(response.responseText);
					} catch (e) {
						console.log('quickMessage: Error parsing response from reddit');
						console.log(response.responseText);
						return false;
					}
					sendFromCache.lastCheck = now;
					thisResponse.data.children.forEach(function(elem) {
						sendFromCache.senders.push(elem.data.url.slice(0, -1));
					});

					RESStorage.setItem('RESUtils.sendFromCache.' + username, JSON.stringify(sendFromCache));
					callback(sendFromCache.senders);
				}
			});
		} else {
			callback(sendFromCache.senders);
		}
	},
	setUpSendFromDropdown: function() {
		this.getValidSendFrom(function(senders) {
			var selectElement = modules['quickMessage'].quickMessageDialog.querySelector('select#quickMessageDialogFrom'),
				currentOption;
			senders.forEach(function(elem) {
				currentOption = document.createElement('option');
				currentOption.text = elem;
				selectElement.add(currentOption);
			});
		});
	},
	focusFirstEmpty: function() {
		var elems = this.quickMessageDialog.querySelectorAll('input, textarea');
		for(var len = elems.length, i = 0; i < len; i++) {
			if (!elems[i].value || i === len - 1) {
				elems[i].focus();
				break;
			}
		}
	},
	openQuickMessageDialog: function(fields) {
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

		if (!fields) {
			fields = {};
		}

		var quickMessageDialogFrom = this.quickMessageDialog.querySelector('select#quickMessageDialogFrom'),
			indexToSelect = 0;
		for(var i = 0, len = quickMessageDialogFrom.options.length; i < len; i++) {
			if (quickMessageDialogFrom.options[i].textContent === fields.from) {
				indexToSelect = i;
				break;
			}
		}
		quickMessageDialogFrom.selectedIndex = indexToSelect;

		this.quickMessageDialog.querySelector('input#quickMessageDialogTo').value = fields.to || '';
		this.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value = fields.subject || this.options.defaultSubject.value;
		this.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value = fields.body || '';

		RESUtils.fadeElementIn(this.quickMessageDialog, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'quickMessage');

		this.focusFirstEmpty();
	},
	closeQuickMessageDialog: function() {
		RESUtils.fadeElementOut(this.quickMessageDialog, 0.3);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'quickMessage');

		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.quickMessageDialog.querySelectorAll('INPUT, TEXTAREA, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	},
	getCurrentFieldValues: function() {
		return {
			from: this.quickMessageDialog.querySelector('select#quickMessageDialogFrom').value,
			to: this.quickMessageDialog.querySelector('input#quickMessageDialogTo').value,
			subject: this.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value,
			body: this.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value
		};
	},
	getFullMessageFormUrl: function() {
		var fields = this.getCurrentFieldValues(),
			subreddit = (fields.from.substring(0, 3) === '/r/') ? fields.from : '';
		return location.protocol + '//' + location.hostname + subreddit + '/message/compose?to=' + encodeURIComponent(fields.to) + '&subject=' + encodeURIComponent(fields.subject) + '&message=' + encodeURIComponent(fields.body);
	},
	presetSendErrors: {
		'NO_USER': 'No recipient specified.',
		'NO_SUBJECT': 'No subject specified.',
		'NO_TEXT': 'Message body is empty.',
		'BAD_CAPTCHA': '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>'
	},
	sendMessage: function() {
		var fields = modules['quickMessage'].getCurrentFieldValues(),
			fromSubreddit = (fields.from.substring(0, 3) === '/r/') ? ('&from_sr=' + fields.from.substring(3)) : '';
		BrowserStrategy.ajax({
			method: 'POST',
			url: 'https://' + location.hostname + '/api/compose',
			data: 'api_type=json' + fromSubreddit + '&subject=' + fields.subject.substring(0, 100) + '&text=' + fields.body + '&to=' + fields.to, // subject is max 100 characters
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Modhash': RESUtils.loggedInUserHash()
			},
			onload: function(response) {
				if (response.status === 200) {
					var data = safeJSON.parse(response.responseText).json;

					if (data.errors[0]) {
						console.log(response);

						modules['notifications'].showNotification({
							moduleID: 'quickMessage',
							notificationID: 'quickMessageSendError',
							header: 'Message not sent.',
							closeDelay: 15000,
							message: modules['quickMessage'].presetSendErrors[data.errors[0][0]] || (data.errors[0][0] + ' : ' + data.errors[0][1]) // errors[0][0] is the error name, [1] is reddit's description of the error
						});
					} else {
						modules['quickMessage'].closeQuickMessageDialog();
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
	}
};
