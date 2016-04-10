import quickMessageTemplate from '../templates/quickMessage.hbs';

addModule('quickMessage', (module, moduleID) => {
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

	const quickMessageFields = {};
	let quickMessageDialog;

	module.beforeLoad = function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;

		quickMessageDialog = RESUtils.createElement('div', 'quickMessage');
		$(quickMessageDialog).html(quickMessageTemplate());

		quickMessageFields.from = quickMessageDialog.querySelector('#quickMessageDialogFrom');
		quickMessageFields.to = quickMessageDialog.querySelector('#quickMessageDialogTo');
		quickMessageFields.subject = quickMessageDialog.querySelector('#quickMessageDialogSubject');
		quickMessageFields.body = quickMessageDialog.querySelector('#quickMessageDialogBody');
	};

	module.go = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			modules['commandLine'].registerCommand(
				(cmd, val) => cmd === 'qm' && (/^(?:([^\s]+)(?:\s(.*))?)?$/).exec(val),
				'qm [recipient [message]] - open quick message dialog',
				(command, val, [, to, body]) => {
					if (body) {
						return `quick message to ${to}: ${body}`;
					} else if (to) {
						return `quick message to ${to}`;
					}
					return 'quick message';
				},
				(command, val, [, to, body]) => {
					module.openQuickMessageDialog({ to, body });
				}
			);

			document.body.appendChild(quickMessageDialog);

			attachEventListeners();
		}
	};

	let sendFromLabel;
	function updateModeratorIcon(state) {
		sendFromLabel = sendFromLabel || quickMessageDialog.querySelector('label[for=quickMessageDialogFrom]');
		sendFromLabel.classList.toggle('moderator', state);
	}

	function attachEventListeners() {
		// keyboard shortcut
		window.addEventListener('keydown', e => {
			if (RESUtils.checkKeysForEvent(e, module.options.openQuickMessage.value)) {
				e.preventDefault();
				module.openQuickMessageDialog();
			}
		}, true);

		// close dialog with "x" button
		quickMessageDialog.querySelector('#quickMessageDialogClose').addEventListener('click', e => {
			e.preventDefault();
			module.closeQuickMessageDialog();
		}, false);
		// close dialog with escape key
		quickMessageDialog.addEventListener('keydown', e => {
			if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
				e.preventDefault();
				module.closeQuickMessageDialog();
			}
		}, true);

		// send with "send message" button (we would use a 'submit' event listener, but then the user could accidentally send the message by pressing enter)
		quickMessageDialog.querySelector('#quickMessageDialogSend').addEventListener('click', e => {
			e.preventDefault();
			sendMessage();
		}, true);
		// send with control-enter
		modules['commentTools'].onCtrlEnter(
			'#quickMessageDialog',
			sendMessage
		);

		// open full message form
		const fullMessageForm = quickMessageDialog.querySelector('a.fullMessageForm');
		const updateUrl = e => (e.target.href = getFullMessageFormUrl());
		fullMessageForm.addEventListener('mousedown', updateUrl);
		fullMessageForm.addEventListener('focus', updateUrl); // mousedown isn't fired if you tab over to the button
		fullMessageForm.addEventListener('click', module.closeQuickMessageDialog);

		$(quickMessageDialog).find('a').on('keypress', e => {
			if ((e.keyCode || e.which) === 13) {
				$(e.target).trigger('click');
			}
		});

		// show moderator shield when sending from subreddit and store the user's selection
		quickMessageFields.from.addEventListener('change', ({ target }) => {
			updateModeratorIcon(target.value.substr(0, 3) === '/r/');
			RESEnvironment.storage.set(`RESmodules.quickMessage.lastSentAs.${RESUtils.loggedInUser()}`, target.value);
		});

		if (module.options.handleContentLinks.value) {
			$('div.content[role="main"]').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
		}
		if (module.options.handleSideLinks.value) {
			$('div.side').on('click', 'a[href*="/message/compose"]', messageLinkEventHandler);
		}
	}

	function messageLinkEventHandler(event) {
		const linkRe = /^(?:https?:\/\/(?:[\-\w\.]+\.)?reddit\.com)?(?:\/r\/[\-\w\.]+)?\/message\/compose/i;
		const url = event.target.href;
		if (event.which === 1 && linkRe.test(url)) {
			event.preventDefault();

			const { to, subject, message: body } = RESUtils.getUrlParams(url);
			const srMatch = RESUtils.regexes.subreddit.exec(url);

			module.openQuickMessageDialog({
				from: srMatch ? `/r/${srMatch[1]}` : undefined,
				to,
				subject,
				body
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

	// Resolves an array of objects:
	// { name: '/u/realUsername' /* or '/r/subreddit' */,
	//   displayText: '/u/anonymous' /* optional */ }
	async function getValidSendFrom() {
		const username = RESUtils.loggedInUser();

		if (!username) {
			return [];
		}

		const users = [{
			name: `/u/${username}`,
			displayText: `/u/${modules['usernameHider'].isEnabled() ? modules['usernameHider'].getDisplayText(username) : username}`
		}];

		if (RESUtils.isModeratorAnywhere()) {
			const { data } = await RESEnvironment.ajax({
				url: '/subreddits/mine/moderator.json',
				data: {
					limit: 1000,
					show: 'all',
					user: RESUtils.loggedInUser() // for the cache
				},
				type: 'json',
				cacheFor: RESUtils.HOUR
			});
			const modSubs = data.children.map(({ data }) => ({ name: data.url.slice(0, -1) }));
			users.push(...modSubs);
		}

		return users;
	}

	const setUpSendFromDropdown = RESUtils.once(async () => {
		const senders = await getValidSendFrom();
		senders.forEach(({ name, displayText }) => {
			const currentOption = document.createElement('option');
			currentOption.value = name;
			currentOption.text = displayText || name;
			quickMessageFields.from.add(currentOption);
		});
		quickMessageFields.from.disabled = (senders.length < 2);
	});

	function focusFirstEmpty() {
		Array.from(quickMessageDialog.querySelectorAll('input, textarea'))
			.find((ele, i, { length }) => !ele.value || i === length - 1)
			.focus();
	}

	async function updateSelectedSender(desiredUser = '') {
		const sendAsOptions = Array.from(quickMessageFields.from.options).map(ele => ele.textContent.toLowerCase());
		let indexToSelect = sendAsOptions.indexOf(desiredUser.toLowerCase());

		if (indexToSelect === -1) {
			switch (module.options.sendAs.value) {
				case 'sub':
					const subreddit = `/r/${RESUtils.currentSubreddit()}`;
					indexToSelect = sendAsOptions.indexOf(subreddit.toLowerCase());
					break;
				case 'last':
					const lastSelected = await RESEnvironment.storage.get(`RESmodules.quickMessage.lastSentAs.${RESUtils.loggedInUser()}`);
					if (lastSelected) {
						indexToSelect = sendAsOptions.indexOf(lastSelected.toLowerCase());
					}
					break;
				case 'temporary':
					indexToSelect = quickMessageFields.from.selectedIndex;
					break;
				// case 'user':
				default:
					indexToSelect = 0;
					break;
			}
		}

		quickMessageFields.from.selectedIndex = (indexToSelect !== -1 ? indexToSelect : 0);
		updateModeratorIcon(quickMessageFields.from.value.substr(0, 3) === '/r/');
	}

	module.openQuickMessageDialog = async ({ from = '', to = '', subject = module.options.defaultSubject.value, body = module.options.linkToCurrentPage.value ? location.href : '' } = {}) => {
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

		await setUpSendFromDropdown();

		await updateSelectedSender(from);
		quickMessageFields.to.value = to;
		quickMessageFields.subject.value = subject;
		quickMessageFields.body.value = body;

		RESUtils.fadeElementIn(quickMessageDialog, 0.3);

		focusFirstEmpty();
	};

	module.closeQuickMessageDialog = function() {
		RESUtils.fadeElementOut(quickMessageDialog, 0.3);

		// remove focus from any input fields
		Array.from(quickMessageDialog.querySelectorAll('input, textarea, button'))
			.forEach(ele => ele.blur());
	};

	function getFullMessageFormUrl() {
		const subreddit = (quickMessageFields.from.value.substring(0, 3) === '/r/') ? quickMessageFields.from.value : '';
		return subreddit +
			RESUtils.string.encode`/message/compose?to=${quickMessageFields.to.value}&subject=${quickMessageFields.subject.value}&message=${quickMessageFields.body.value}`;
	}

	const presetSendErrors = {
		NO_USER: 'No recipient specified.',
		NO_SUBJECT: 'No subject specified.',
		NO_TEXT: 'Message body is empty.',
		BAD_CAPTCHA: '<p>Sorry, reddit requires you to enter a captcha to send messages. This is usually because your account is brand new or has low karma.</p><b>Click on "open full message form" and try again (your message will be preserved).</b>',
		TOO_LONG: 'Either your subject (max 100 characters) or body (max 10,000 characters) is too long.'
	};

	async function sendMessage() {
		const from = quickMessageFields.from.value;

		try {
			const { json: { errors } } = await RESEnvironment.ajax({
				method: 'POST',
				url: '/api/compose',
				data: {
					api_type: 'json',
					from_sr: from.includes('/r/') ? from.slice(3) : '',
					subject: quickMessageFields.subject.value,
					text: quickMessageFields.body.value,
					to: quickMessageFields.to.value
				},
				type: 'json'
			});

			if (errors[0]) {
				modules['notifications'].showNotification({
					moduleID: 'quickMessage',
					notificationID: 'quickMessageSendError',
					header: 'Message not sent.',
					closeDelay: 15000,
					message: presetSendErrors[errors[0][0]] || `${errors[0][0]} : ${errors[0][1]}` // errors[0][0] is the error name, [1] is reddit's description of the error
				});
			} else {
				module.closeQuickMessageDialog();
			}
		} catch (e) {
			modules['notifications'].showNotification({
				moduleID: 'quickMessage',
				notificationID: 'failedToSendQuickMessage',
				header: 'Sending Failed!',
				closeDelay: 15000,
				message: 'Reddit is likely under heavy load. Either wait a minute or click on "open full message form" and try again (your message will be preserved).'
			});
			throw e;
		}
	}
});
