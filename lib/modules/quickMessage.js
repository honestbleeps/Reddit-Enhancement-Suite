modules['quickMessage'] = {
	moduleID: 'quickMessage',
	moduleName: 'Quick Message',
	category: 'UI',
	description: 'A pop-up dialog that allows you to send messages from anywhere on reddit.\
		It can be accessed in a few ways: with the keyboard shortcut "' + modules['keyboardNav'].getNiceKeyCode('openQuickMessage') + '" (can be changed in the Keyboard Navigation module); the "send message" button in a user\'s hover info; or the command "qm".\
		Messages can be sent from the quick message dialog by pressing control-enter or command-enter.',
	options: {
		defaultSubject: {
			type: 'text',
			value: 'Quick Message',
			description: 'Text that will automatically be inserted into the subject field, unless it is auto-filled by context.',
		},
		quickModeratorMessage: {
			type: 'boolean',
			value: false,
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

			var subreddit = RESUtils.currentSubreddit();
			if (subreddit && this.options.quickModeratorMessage.value) {
				var messageTheMods = document.querySelector('.side a.helplink');
				messageTheMods.addEventListener('click', function(e) {
					if (e.which === 1) {
						e.preventDefault();
						modules['quickMessage'].openQuickMessageDialog({'to': '/r/' + subreddit});
					}
				});
			}

			modules['commandLine'].registerCommand('qm', 'qm [recipient] - open quick message dialog',
				function(command, val, match) {
					if (val) {
						return 'quick message to ' + val;
					}
					return 'quick message';
				}, function(command, value, match, e) {
					modules['quickMessage'].openQuickMessageDialog({'to' : value});
				}
			);
		}
	},
	attachEventListeners: function() {
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
		modules['commentTools'].bindCtrlEnterAction({
			captureSelectors: '#quickMessageDialog',
			performAction: function(e) {
				modules['quickMessage'].sendMessage();
			}
		});

		// open full message form
		$(this.quickMessageDialog.querySelector('a.fullMessageForm')).click(function(e) {
			if (e.which === 1) {
				e.preventDefault();
				window.location.href = modules['quickMessage'].getFullMessageFormUrl();
			} else if (e.which === 2) {
				e.preventDefault();
				BrowserStrategy.openLinkInNewTab(modules['quickMessage'].getFullMessageFormUrl());
				modules['quickMessage'].closeQuickMessageDialog();
			}
		});
	},
	focusFirstEmpty: function() {
		var elems = this.quickMessageDialog.querySelectorAll('input, textarea');
		for(var len = elems.length, i = 0; i < len; i++) {
			if (!elems[i].value || i === len - 1) {
				elems[i].focus();
				return;
			}
		}
	},
	openQuickMessageDialog: function(fields) {
		if (!fields) {
			var fields = {};
		}

		this.quickMessageDialog.querySelector('input#quickMessageDialogTo').value = fields.to || '';
		this.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value = fields.subject || this.options.defaultSubject.value;
		this.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value = fields.body || '';

		RESUtils.fadeElementIn(this.quickMessageDialog, 0.3);

		this.focusFirstEmpty();
	},
	closeQuickMessageDialog: function() {
		RESUtils.fadeElementOut(this.quickMessageDialog, 0.3);

		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.quickMessageDialog.querySelectorAll('INPUT, TEXTAREA, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	},
	getCurrentFieldValues: function() {
		var fields = {};
		fields.to = this.quickMessageDialog.querySelector('input#quickMessageDialogTo').value;
		fields.subject = this.quickMessageDialog.querySelector('input#quickMessageDialogSubject').value;
		fields.body = this.quickMessageDialog.querySelector('textarea#quickMessageDialogBody').value;
		return fields;
	},
	getFullMessageFormUrl: function() {
		var fields = this.getCurrentFieldValues();
		return location.protocol + '//' + location.hostname + '//message/compose?to=' + encodeURIComponent(fields.to) + '&subject=' + encodeURIComponent(fields.subject) + '&message=' + encodeURIComponent(fields.body);
	},
	sendMessage: function() {
		var fields = this.getCurrentFieldValues();
		BrowserStrategy.ajax({
			method: 'POST',
			url: 'https://' + location.hostname + '/api/compose',
			data: 'api_type=json&subject=' + fields.subject.substring(0, 100) + '&text=' + fields.body + '&to=' + fields.to, //subject is max 100 characters
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-Modhash': RESUtils.loggedInUserHash()
			},
			onload: function(response) {
				if (response.status === 200) {
					var data = safeJSON.parse(response.response).json,
						errorMessage;
					if (data.errors[0]) {
						switch(data.errors[0][0]) {
							case 'NO_USER':
								errorMessage = 'No recipient specified.';
								break;
							case 'NO_SUBJECT':
								errorMessage = 'No subject specified.';
								break;
							case 'NO_TEXT':
								errorMessage = 'Message body is empty.';
								break;
							case 'BAD_CAPTCHA':
								errorMessage = '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>';
								break;
							default:
								errorMessage = data.errors[0][0] + ' : ' + data.errors[0][1];
								console.log(response);
						}

						modules['notifications'].showNotification({
							moduleID: 'quickMessage',
							notificationID: 'quickMessageSendError',
							header: 'Message not sent.',
							closeDelay: 15000,
							message: errorMessage
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