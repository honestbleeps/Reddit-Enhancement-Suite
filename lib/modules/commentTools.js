/* eslint no-unused-vars: [2, { "argsIgnorePattern": "^(moduleID|macroText|selectedText|box)$" }] */

addModule('commentTools', (module, moduleID) => {
	module.moduleName = 'Comment Tools';
	module.category = ['Comments'];
	module.description = 'Provides shortcuts for easier markdown.';
	module.options = {
		userAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show user autocomplete tool when typing in posts, comments and replies',
			advanced: true
		},
		subredditAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show subreddit autocomplete tool when typing in posts, comments and replies',
			advanced: true
		},
		formattingToolButtons: {
			type: 'boolean',
			value: true,
			description: 'Show formatting tools (bold, italic, tables, etc.) to the edit form for posts, comments, and other snudown/markdown areas.'
		},
		keyboardShortcuts: {
			dependsOn: 'formattingToolButtons',
			type: 'boolean',
			value: true,
			description: 'Use keyboard shortcuts to apply styles to selected text'
		},
		boldKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [66, false, true, false, false], // ctrl-b
			description: 'Keyboard shortcut to make text bold.'
		},
		italicKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [73, false, true, false, false], // ctrl-i
			description: 'Keyboard shortcut to make text italic.'
		},
		strikeKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [83, false, true, false, false], // ctrl-s
			description: 'Keyboard shortcut to add a strikethrough.'
		},
		superKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [187, false, true, true, false], // ctrl-+ (ctrl-shift-=)
			description: 'Keyboard shortcut to make text superscript.'
		},
		linkKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [75, false, true, false, false], // ctrl-k
			description: 'Keyboard shortcut to add a link.'
		},
		quoteKey: {
			dependsOn: 'keyboardShortcuts',
			type: 'keycode',
			value: [190, false, true, true, false], // ctrl-> (strl-shift-.)
			description: 'Keyboard shortcut to quote text.'
		},
		ctrlEnterSubmitsComments: {
			type: 'boolean',
			value: true,
			description: 'Pressing Ctrl+Enter or Cmd+Enter will submit your comment/wiki edit.'
		},
		ctrlEnterSubmitsPosts: {
			type: 'boolean',
			value: true,
			description: 'Pressing Ctrl+Enter or Cmd+Enter will submit your post.'
		},
		commentingAs: {
			type: 'boolean',
			value: true,
			description: 'Shows your currently logged in username to avoid posting from the wrong account.'
		},
		highlightIfAltAccount: {
			dependsOn: 'commentingAs',
			type: 'boolean',
			value: true,
			description: 'Put in bold the "Commenting As" part if you are using an alt account. The first account in the Account Switcher module is considered as your main account.'
		},
		showInputLength: {
			type: 'boolean',
			value: true,
			description: 'When submitting, display the number of characters entered in the title and text fields and indicate when you go over the 300 character limit for titles.',
			advanced: true
		},
		macroButtons: {
			type: 'boolean',
			value: true,
			description: 'Add macro buttons to the edit form for posts, comments, and other snudown/markdown areas.',
			bodyClass: true
		},
		macros: {
			dependsOn: 'macroButtons',
			type: 'table',
			addRowText: '+add shortcut',
			fields: [{
				name: 'label',
				type: 'text'
			}, {
				name: 'text',
				type: 'textarea'
			}, {
				name: 'category',
				type: 'text'
			}, {
				name: 'key',
				type: 'keycode'
			}],
			value: [
				['reddiquette', '[reddiquette](/wiki/reddiquette) '],
				['Promote RES', '[Reddit Enhancement Suite](http://redditenhancementsuite.com "also /r/Enhancement") '],
				['Current timestamp', '{{now}} ']
			],
			description: 'Add buttons to insert frequently used snippets of text.'
		},
		keepMacroListOpen: {
			dependsOn: 'macroButtons',
			type: 'boolean',
			value: false,
			description: 'After selecting a macro from the dropdown list, do not hide the list.',
			advanced: true
		},
		macroPlaceholders: {
			dependsOn: 'macroButtons',
			type: 'boolean',
			value: true,
			description: `
				When using macro, replace placeholders in text via pop-up prompt.
				<p>Example macro text:<br>
				The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!
				</p>
			`
		},
		enabledOnBanMessages: {
			type: 'boolean',
			value: true,
			description: 'Show the comment tools on the ban note textbox.',
			advanced: true
		}
	};
	module.include = [
		'comments',
		'inbox',
		'submit',
		'profile',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:edit|modqueue|reports|spam|banned)\/?/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/wiki\/(?:create|edit)(\/\w+)?/i
	];
	module.loadDynamicOptions = function() {
		if (magicPlaceholders.length) {
			module.options['macroPlaceholders'].description += `
				<br><br>Some placeholders are automatically filled in when you use the macro:
				<dl>
				${magicPlaceholders.map(({ matches, description }) => `
					<dt>${matches.map(token => `{{${token}}}`).join('<br>')}</dt>
					${description ? `<dd>${description}</dd>` : ''}
				`).join('')}
				</dl>
			`;
		}
	};

	const SUBMIT_LIMITS = {
		STYLESHEET: 128 * 1024,
		SIDEBAR: 5120,
		DESCRIPTION: 500,
		WIKI: 512 * 1024,
		COMMENT: 10000,
		POST: 40000,
		POST_TITLE: 300,
		BAN_MESSAGE: 1000
	};
	const macroCallbackTable = [];
	const macroKeyTable = [];

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			const $body = $('body');

			$body.on('click', 'div.markdownEditor-wrapper a:not(.userTagLink)', function(e) {
				e.preventDefault();

				const index = $(this).data('macro-index');
				const box = findTextareaForElement(this)[0];
				// const box = $(this).closest('.usertext-edit, .RESDialogContents, .wiki-page-content').find('textarea[name=text], textarea[name=description], textarea[name=public_description]')[0];
				if (box === null) {
					console.error('Failed to locate textarea.');
					return;
				}
				const handler = macroCallbackTable[index];
				if (handler === null) {
					console.error('Failed to locate find callback.');
					return;
				}

				Reflect.apply(handler, module, [this, box]);

				box.focus();
				// Fire an input event to refresh the preview
				const inputEvent = document.createEvent('HTMLEvents');
				inputEvent.initEvent('input', true, true);
				box.dispatchEvent(inputEvent);
			}).on('click', '.RESMacroDropdownTitle', function(e) {
				const thisCat = e.target;
				if (thisCat.classList.contains('openMacro')) {
					thisCat.classList.remove('openMacro');
					modules['styleTweaks'].setSRStyleToggleVisibility(true, 'commentTools-macroDropdown');
				} else {
					$('.RESMacroWrappingSpan span').removeClass('openMacro');
					thisCat.classList.add('openMacro');
					modules['styleTweaks'].setSRStyleToggleVisibility(false, 'commentTools-macroDropdown');
				}
				// position the drop down so it's flush with the right of the category button.
				$(this).next().css({
					top: `${thisCat.offsetTop + thisCat.offsetHeight}px`,
					left: `${thisCat.offsetLeft + thisCat.offsetWidth - thisCat.nextSibling.offsetWidth}px`
				});
			});

			if (this.options.showInputLength.value) {
				$body.on('input', '.usertext-edit textarea, #title-field textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function() {
					module.updateCounter(this);
				});
			}

			if (this.options.keyboardShortcuts.value) {
				$body.on('keydown', '.usertext-edit textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function(e) {
					if (e.keyCode === module.KEYS.ESCAPE) {
						if (!$autoCompletePop.is(':visible')) {
							// Blur from the editor on escape, so we can return to using the keyboard nav.
							// NOTE: The big editor closes on ESC so this won't be reached in that case.
							$(this).blur();
							e.preventDefault();
						}

						return;
					}

					for (const [testedKeyArray, macroIndex] of macroKeyTable) {
						if (RESUtils.checkKeysForEvent(e, testedKeyArray)) {
							const handler = macroCallbackTable[macroIndex];
							Reflect.apply(handler, module, [null, this]);

							// Fire an input event to refresh the preview
							const inputEvent = document.createEvent('HTMLEvents');
							inputEvent.initEvent('input', true, true);
							this.dispatchEvent(inputEvent);

							e.preventDefault();
							return;
						}
					}
				});
			}
			if (this.options.ctrlEnterSubmitsComments.value) {
				module.onCtrlEnter(
					'.usertext-edit textarea, #BigEditor textarea, #wiki_page_content',
					e => {
						const currentForm = $(e.target).closest('form');
						const saveButton = currentForm.find('.save')[0] || currentForm.find('#wiki_save_button')[0] || $('.BEFoot button')[0];
						RESUtils.click(saveButton);
					}
				);
			}
			if (this.options.ctrlEnterSubmitsPosts.value) {
				module.onCtrlEnter(
					'#title-field textarea, #text-field textarea, #url, #sr-autocomplete, input.captcha',
					() => {
						const $captcha = $('input.captcha:not(.cap-text)');
						if ($captcha.length && $captcha.val() === '') {
							$captcha.focus();
						} else {
							RESUtils.click($('.spacer .btn')[0]);
						}
					}
				);
			}

			if (this.options.subredditAutocomplete.value || this.options.userAutocomplete.value) {
				addAutoCompletePop();
			}

			// Perform initial setup of tools over the whole page
			attachCommentTools();

			/*
			//These are no longer necessary but I am saving them in case Reddit changes how they make their reply forms.
			// Wireup reply editors
			RESUtils.watchForElement('newCommentsForms', attachCommentTools);
			// Wireup edit editors (usertext-edit already exists in the page)
			RESUtils.watchForElement('newComments', attachCommentTools);
			*/
		}
	};

	module.getCommentTextarea = function(elem) {
		return $(elem || document.body).find('textarea[name][name!=share_to][name!=message]');
	};

	function attachCommentTools(elem) {
		module.getCommentTextarea(elem).each(attachEditorToUsertext);
	}

	function getFieldLimit(elem) {
		switch (elem.name) {
			case 'title':
				return SUBMIT_LIMITS.POST_TITLE;
			case 'text': // https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/829
				if (RESUtils.pageType() === 'submit' || $(elem).closest('.thing').hasClass('self')) {
					return SUBMIT_LIMITS.POST;
				}
				return SUBMIT_LIMITS.COMMENT;
			case 'description':
				return SUBMIT_LIMITS.SIDEBAR;
			case 'public_description':
				return SUBMIT_LIMITS.DESCRIPTION;
			case 'content':
				return SUBMIT_LIMITS.WIKI;
			case 'ban_message':
				return SUBMIT_LIMITS.BAN_MESSAGE;
			// case 'description_conflict_old':
			// case 'public_description_conflict_old':
			default:
				return 1337; // should be easier to debug than 0
		}
	}

	function attachEditorToUsertext() {
		if (this.hasAttribute('data-max-length')) {
			return;
		}
		const limit = getFieldLimit(this);

		this.setAttribute('data-limit', limit);

		if (this.name === 'title') {
			return;
		}

		if (this.id === 'ban_message' && !module.options.enabledOnBanMessages.value) {
			return;
		}

		if (this.id === 'ban_message') {
			this.style.width = '500px';
			this.style.height = '100px';
		}

		const bar = module.makeEditBar();
		if (this.id === 'wiki_page_content' || this.id === 'ban_message') {
			$(this).parent().prepend(bar);
		} else {
			$(this).parent().before(bar);
		}
		module.updateCounter(this);
	}

	module.updateCounter = function(textarea) {
		const length = $(textarea).val().length;
		const limit = textarea.getAttribute('data-limit');
		const counter = $(textarea).parent().parent().find('.RESCharCounter');
		counter.attr('title', `character limit: ${length}/${limit}`);
		counter.text(`${length}/${limit}`);
		if (length > limit) {
			counter.addClass('tooLong');
		} else {
			counter.removeClass('tooLong');
		}
	};

	let cachedEditBar;

	module.makeEditBar = function() {
		if (cachedEditBar) {
			return $(cachedEditBar).clone();
		}

		const $editBar = $('<div class="markdownEditor">');
		// Wrap the edit bar in a <div> of its own
		const wrappedEditBar = $('<div class="markdownEditor-wrapper">').append($editBar);

		if (module.options.commentingAs.value && (!modules['usernameHider'].isEnabled())) {
			// show who we're commenting as...
			const commentingAsMessage = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned\/?/i) ? 'Moderating as' : 'Commenting as';

			const commentingAs = $('<div class="commentingAs">').html(`${commentingAsMessage}: <span class="commentingAsUser" data-user="${RESUtils.loggedInUser()}">${RESUtils.loggedInUser()}</span>`);
			if (modules['userTagger'].isEnabled()) {
				modules['userTagger'].applyTagToAuthor(commentingAs.find('.commentingAsUser')[0], true);
			}
			if (module.options.highlightIfAltAccount.value && modules['accountSwitcher'].options.accounts.value.length && typeof RESUtils.loggedInUser() === 'string' && RESUtils.loggedInUser().toLowerCase() !== modules['accountSwitcher'].options.accounts.value[0][0].toLowerCase()) {
				commentingAs.addClass('highlightedAltAccount');
			}
			wrappedEditBar.append(commentingAs);
		}

		if (module.options.formattingToolButtons.value) {
			const shortcuts = module.options.keyboardShortcuts.value;
			$editBar.append(makeEditButton('<b>Bold</b>', `bold${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.boldKey.value)})` : ''}`, module.options.boldKey.value, 'btn-bold', (button, box) => {
				wrapSelection(box, '**', '**');
			}));
			$editBar.append(makeEditButton('<i>Italic</i>', `italic${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.italicKey.value)})` : ''}`, module.options.italicKey.value, 'btn-italic', (button, box) => {
				wrapSelection(box, '*', '*');
			}));
			$editBar.append(makeEditButton('<del>strike</del>', `strike${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.strikeKey.value)})` : ''}`, module.options.strikeKey.value, 'btn-strike', (button, box) => {
				wrapSelection(box, '~~', '~~');
			}));
			$editBar.append(makeEditButton('<sup>sup</sup>', `super${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.superKey.value)})` : ''}`, module.options.superKey.value, 'btn-superscript', (button, box) => {
				wrapSelectedWords(box, '^');
			}));
			$editBar.append(makeEditButton('Link', `link${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.linkKey.value)})` : ''}`, module.options.linkKey.value, 'btn-link', (button, box) => {
				linkSelection(box);
			}));
			$editBar.append(makeEditButton('>Quote', `quote${shortcuts ? ` (${RESUtils.niceKeyCode(module.options.quoteKey.value)})` : ''}`, module.options.quoteKey.value, 'btn-quote', (button, box) => {
				wrapSelectedLines(box, '> ', '');
			}));
			$editBar.append(makeEditButton('<span style="font-family: monospace">Code</span>', 'code', null, 'btn-code', (button, box) => {
				wrapSelectedLines(box, '    ', '');
			}));
			$editBar.append(makeEditButton('&bull;Bullets', 'bullet list', null, 'btn-list-unordered', (button, box) => {
				wrapSelectedLines(box, '* ', '');
			}));
			$editBar.append(makeEditButton('1.Numbers', 'number list', null, 'btn-list-ordered', (button, box) => {
				wrapSelectedLines(box, '1. ', '');
			}));
			$editBar.append(makeEditButton('<span style="border: 1px black solid;">Table</span>', 'table', null, 'btn-table', (button, box) => {
				// First check if the selected text is a table, this also clean the selection
				const selectedText = box.value.substring(box.selectionStart, box.selectionEnd).replace(/^[\s]+/, '').replace(/[\s]+$/, '').split('\n'); // In fact, if the header start by '   |' this is not a table. But it's better to accept it then after editing the table it will work
				let isTable;
				if (selectedText.length >= 2) {
					if (selectedText[0].indexOf('|') !== -1) {	// Check if there is at least one '|' to check if it's a table
						selectedText[0] = selectedText[0].replace(/^\|/, '').replace(/\|\s+$/, ''); // Avoid '| foo | bar |' instead of 'foo | bar'
						const numSeparator = selectedText[0].split('|').length;
						/*
							numSeparator can be 0 for example with :
								foo |
								----|
								bar |
							but it's important to check for each line before removing starting/ending '|' if there is at least one '|' to check if it's really a table
						*/
						isTable = true;

						// Check the HEADER/BODY separator
						selectedText[1] = selectedText[1].replace(/\|[^|\-]+$/, ''); // '-|-|-|ILOVECOOKIE' is correct, so clean it. But '-|-|-ILOVECOOKIE' is not correct if there is 3 column (okay if there is less though, but will not be detected). Also '-      |     -    |   -' is correct and will not be detected.
						selectedText[1] = selectedText[1].replace(/-/g, '--'); // Required to allow -|-|- to work (else the split would give ['', '|-'])
						if (selectedText[1].indexOf('-|') === -1 && selectedText[1].indexOf('|-') === -1) {
							isTable = false;
						}
						selectedText[1] = selectedText[1].replace(/^\]+/, '').replace(/[\s|]+$/, '');
						if (selectedText[1].split('-|-').length < numSeparator) { // Check if there is enough '-|-'
							isTable = false;
						}
						if (/[^|\-]/.test(selectedText[1])) { // If the separator contain an other character than | or -
							isTable = false;
						}

						// Now check the BODY
						if (isTable) {
							for (const i of RESUtils.gen.range(2, selectedText.length)) {
								if (selectedText[i].indexOf('|') === -1) {
									isTable = false;
									break;
								}
								selectedText[i] = selectedText[i].replace(/^\|/, '').replace(/[\s|]+$/, '');
								if (selectedText[i].split('|').length !== numSeparator)	{ // Check if there is the same '|' number
									// In fact this should be >= but that would means make disappear some content, so I will consider this is not a table
									// in fact this is useless, because if we omit last cell they will be void. But this would complicate the generation part by managing void cell and the code is enough complicate.
									isTable = false;
									break;
								}
							}
						}
					}
				}
				let startTable;
				if (isTable) {
					// The selected text is a table, now transform it to HTML!
					startTable = selectedText.reduce((prevTable, currText, i) => {
						if (i === 1) {
							return prevTable;
						}

						return `${prevTable}<tr><td>${escapeHTML(currText).replace(/\|/g, '</td><td>')}</td></tr>`;
					}, '');
				} else {
					startTable = '<tr><td>Foo</td><td>Bar</td></tr><tr><td>Foo</td><td>Bar</td></tr>';
				}
				alert(`<div class="buttonContainer"></div><table class="commentPreview" contenteditable="true">${startTable}</table>`,
					() => {
						let generatedTable = '\n\n';
						let generatedTableSeparation = '';
						$('#alert_message tr:first td').each(function() {
							const text = $(this).text().replace(/[\n|]/g, '');
							generatedTable += `${text} | `;
							generatedTableSeparation += '-'.repeat(text.length);
							generatedTableSeparation += '|';
						});
						generatedTableSeparation = generatedTableSeparation.substr(0, generatedTableSeparation.length - 1);
						generatedTable = `${generatedTable.substr(0, generatedTable.length - 3)}\n${generatedTableSeparation}\n`;
						$('#alert_message tr:gt(0)').each(function() {
							$(this).find('td').each(function() {
								generatedTable += `${$(this).text().replace(/[\n|]/g, '')} | `;
							});
							generatedTable = `${generatedTable.substr(0, generatedTable.length - 3)}\n`;
						});
						if (isTable) {
							replaceSelection(box, generatedTable);
						} else {
							wrapSelection(box, generatedTable, '');
						}
						$(box).trigger('input'); // update preview
					});

				const addRow = gdAlert.makeButton('+ Row');
				const remRow = gdAlert.makeButton('- Row');
				const addCol = gdAlert.makeButton('+ Col');
				const remCol = gdAlert.makeButton('- Col');
				addRow.addEventListener('click', () => {
					const nbCol = $('#alert_message tr:first td').length;
					const newRow = '<td>text</td>'.repeat(nbCol);
					$('#alert_message table').append(`<tr>${newRow}</tr>`);
				}, false);
				remRow.addEventListener('click', () => {
					if ($('#alert_message tr').length > 1) {
						$('#alert_message table tr:last').remove();
					}
				}, false);
				addCol.addEventListener('click', () => {
					$('#alert_message table tr').append('<td>text</td>');
				}, false);
				remCol.addEventListener('click', () => {
					if ($('#alert_message tr:first td').length > 1) {
						$('#alert_message table tr td:last-of-type').remove();
					}
				}, false);

				const $buttonContainer = $('#alert_message .buttonContainer');
				$buttonContainer.append(addRow);
				$buttonContainer.append(remRow);
				$buttonContainer.append(addCol);
				$buttonContainer.append(remCol);
			}));
		}

		if (module.options.showInputLength.value) {
			const $counter = $('<span class="RESCharCounter" title="character limit: 0/?????">0/?????</span>');
			$editBar.prepend($counter); // prepend for more reliable css floating.
			$('.submit-page #title-field .title').prepend($('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>'));
		}

		if (module.options.macroButtons.value) {
			buildMacroDropdowns(wrappedEditBar);

			const addMacroButton = makeEditButton(module.options.macros.addRowText, null, null, 'btn-macro btn-macro-add', () => {
				modules['settingsNavigation'].loadSettingsPage(moduleID, 'macros');
				$('.RESMacroWrappingSpan span').removeClass('openMacro');
			});
			addButtonToMacroGroup('', addMacroButton);
		}

		cachedEditBar = wrappedEditBar;
		return cachedEditBar;
	};

	const macroDropDownTable = {};

	function getMacroGroup(groupName) {
		// Normalize and supply a default group name{}
		groupName = (groupName || '').toString().trim() || 'macros';
		if (groupName in macroDropDownTable) {
			return macroDropDownTable[groupName];
		} else {
			const macroGroup = macroDropDownTable[groupName] = {};
			macroGroup.titleButton = $(`<span class="RESMacroDropdownTitle">${groupName}</span>`);
			macroGroup.container = $('<span class="RESMacroDropdown"></span>');
			macroGroup.dropdown = $('<ul class="RESMacroDropdownList"></ul>');
			macroGroup.container.append(macroGroup.dropdown);
			return macroGroup;
		}
	}

	function addButtonToMacroGroup(groupName, button) {
		const group = getMacroGroup(groupName);
		group.dropdown.append($('<li>').append(button));
	}

	function buildMacroDropdowns(editBar) {
		const macros = module.options.macros.value;

		for (const [title, text, category, key] of macros) {
			const button = makeEditButton(title, null, key, 'btn-macro', (button, box) => {
				macroSelection(box, text, '');
			});
			addButtonToMacroGroup(category, button);
		}

		const $macroWrapper = $('<span class="RESMacroWrappingSpan">');

		const defaultGroup = getMacroGroup('');
		$macroWrapper.append(defaultGroup.titleButton);
		$macroWrapper.append(defaultGroup.container);

		for (const category in macroDropDownTable) {
			if (category === 'macros') {
				continue;
			}
			$macroWrapper.append(macroDropDownTable[category].titleButton);
			$macroWrapper.append(macroDropDownTable[category].container);
		}
		editBar.append($macroWrapper);
	}

	function makeEditButton(label, title, key, cls, handler) {
		if (label === null) {
			label = 'unlabeled';
		}
		if (title === null) {
			title = '';
		}
		const macroButtonIndex = macroCallbackTable.length;
		const button = $('<a>').html(RESUtils.sanitizeHTML(label)).attr({
			class: `edit-btn ${cls}`,
			title,
			href: '#',
			tabindex: 1,
			'data-macro-index': macroButtonIndex
		});

		if (key && key[0] !== null) {
			macroKeyTable.push([key, macroButtonIndex]);
		}
		macroCallbackTable[macroButtonIndex] = handler;
		return button;
	}

	function linkSelection(box) {
		let url = prompt('Enter the URL:', '');
		if (url !== null) {
			// escape parens in url
			url = url.replace(/[\(\)]/g, '\\$&');
			wrapSelection(box, '[', `](${url})`, text => {
				// escape brackets and parens in text
				text = text.replace(/[\[\]\(\)]/g, '\\$&');
				return text;
			});
		}
	}

	function macroSelection(box, macroText) {
		if (!module.options.keepMacroListOpen.value) {
			$('.RESMacroWrappingSpan span').removeClass('openMacro');
		}
		if (module.options['macroPlaceholders'].value) {
			const formatText = fillPlaceholders.bind(this, box, macroText);
			wrapSelection(box, '', '', formatText);
		} else {
			wrapSelection(box, macroText, '');
		}
	}

	function fillPlaceholders(box, macroText, selectedText) {
		const placeholders = macroText.match(/\{\{\w+\}\}/g);

		if (placeholders) {
			const completedPlaceholders = {};

			for (const placeholder of placeholders) {
				if (completedPlaceholders.hasOwnProperty(placeholder)) {
					continue;
				}
				completedPlaceholders[placeholder] = true;

				const placeholderInnerText = placeholder.substring(2, placeholder.length - 2).toLowerCase();
				let value = getMagicPlaceholderValue(placeholderInnerText, macroText, selectedText, box);
				if (value === undefined) {
					value = promptForPlaceholderValue(placeholder, macroText);
				}

				if (value === null) {
					// user cancelled
					break;
				}

				// Replace placeholder with value
				macroText = macroText.replace(new RegExp(placeholder, 'g'), value);
			}
		}

		return macroText;
	}

	function getMagicPlaceholderValue(placeholder, macroText, selectedText, box) {
		const handler = magicPlaceholders.find(current => current.matches.indexOf(placeholder) !== -1);

		if (handler) {
			return handler.handle(macroText, selectedText, box);
		}
	}

	const magicPlaceholders = [
		{
			matches: ['subreddit'],
			description: 'The current subreddit, in the form /r/subreddit',
			handle(macroText, selectedText, box) {
				const subredditName = RESUtils.subredditForElement(box) || RESUtils.currentSubreddit();

				if (subredditName) {
					return `/r/${subredditName}`;
				}
			}
		}, {
			matches: ['me', 'my_username'],
			description: 'Your username, in the form /u/username',
			handle(macroText, selectedText, box) {
				const username = RESUtils.loggedInUser();
				if (username) {
					return `/u/${username}`;
				}
			}
		}, {
			matches: ['op', 'op_username'],
			description: 'The username of the "original poster", in the form /u/username. On a post\'s comments page, this the person who made the post; on a PM / modmail, this is the person who started the conversation',
			handle(macroText, selectedText, box) {
				let profile;
				if (RESUtils.pageType() === 'comments') {
					profile = document.querySelector('.sitetable .author');
				} else {
					let $next = $(box);
					let furthest;
					do {
						if ($next && $next.length) furthest = $next;
						$next = $next.parent().closest('.sitetable');
					} while ($next.length);

					profile = furthest.find('.author')[0];
				}

				if (profile) {
					return `/u/${profile.href.match(RESUtils.regexes.profile)[1]}`;
				}
			}
		}, {
			matches: ['url'],
			description: 'The current page\'s URL, like http://www.reddit.com/r/Enhancement/comments/123abc/example_post',
			handle(macroText, selectedText, box) {
				return document.location.href;
			}
		}, {
			matches: ['reply_to', 'reply_to_username'],
			description: 'The username of person you\'re replying to, in the form /u/username. ',
			handle(macroText, selectedText, box) {
				let $base = $(box);
				const isEditing = $base.closest('.thing, .entry').hasClass('entry');

				if (isEditing) {
					$base = $base.closest('.thing').parent();
				}

				const profile = $base.closest('.thing').find('.entry .author')[0];

				if (!profile) {
					return getMagicPlaceholderValue('op', macroText, selectedText, box);
				} else {
					return `/u/${profile.href.match(RESUtils.regexes.profile)[1]}`;
				}
			}
		}, {
			matches: ['selected', 'selection'],
			description: 'The text which is currently selected (highlighted)',
			handle(macroText, selectedText, box) {
				return selectedText;
			}
		}, {
			matches: ['now'],
			description: 'The current date and time in your locale',
			handle(macroText, selectedText, box) {
				const date = new Date();
				return date.toTimeString();
			}
		}, {
			matches: ['today'],
			description: 'The current date in your locale',
			handle(macroText, selectedText, box) {
				const date = new Date();
				return date.toDateString();
			}
		}, {
			matches: ['escaped'],
			description: 'The selected text, escaped for snudown/markdown. Useful for text emoji like ¯\\_(ツ)_/¯',
			handle(macroText, selectedText, box) {
				return selectedText.replace(/[\[\]()\\\*\^~\-_.]/g, '\\$&');
			}
		}
	];

	function promptForPlaceholderValue(placeholder, macroText) {
		// Get value for placeholder
		const display = `${macroText}\n\n\nEnter replacement for ${placeholder}:`;
		const value = placeholder;

		return prompt(display, value);
	}

	function wrapSelection(box, prefix, suffix, escapeFunction) {
		if (box === null) {
			return;
		}
		// record scroll top to restore it later.
		const scrollTop = box.scrollTop;

		// We will restore the selection later, so record the current selection.
		const selectionStart = box.selectionStart;
		const selectionEnd = box.selectionEnd;

		const text = box.value;
		const beforeSelection = text.substring(0, selectionStart);
		let selectedText = text.substring(selectionStart, selectionEnd);
		const afterSelection = text.substring(selectionEnd);

		// Markdown doesn't like it when you tag a word like **this **. The space messes it up. So we'll account for that because Firefox selects the word, and the followign space when you double click a word.
		let trailingSpace = '';
		let cursor = selectedText.length - 1;
		while (cursor > 0 && selectedText[cursor] === ' ') {
			trailingSpace += ' ';
			cursor--;
		}
		selectedText = selectedText.substring(0, cursor + 1);

		if (typeof escapeFunction === 'function') {
			selectedText = escapeFunction(selectedText);
		}

		box.value = beforeSelection + prefix + selectedText + suffix + trailingSpace + afterSelection;

		box.selectionEnd = beforeSelection.length + prefix.length + selectedText.length;
		if (selectionStart === selectionEnd) {
			box.selectionStart = box.selectionEnd;
		} else {
			box.selectionStart = beforeSelection.length + prefix.length;
		}

		box.scrollTop = scrollTop;
	}

	function replaceSelection(box, replacement) {
		if (box === null) {
			return;
		}
		// record scroll top to restore it later.
		const scrollTop = box.scrollTop;

		// We will restore the selection later, so record the current selection.
		const selectionStart = box.selectionStart;
		const selectionEnd = box.selectionEnd;

		const text = box.value;
		const beforeSelection = text.substring(0, selectionStart);
		const afterSelection = text.substring(selectionEnd);


		box.value = beforeSelection + replacement + afterSelection;

		box.selectionEnd = beforeSelection.length + replacement.length;

		box.scrollTop = scrollTop;
	}

	function wrapSelectedLines(box, prefix, suffix) {
		const scrollTop = box.scrollTop;
		let selectionStart = box.selectionStart;
		let selectionEnd = box.selectionEnd;

		const text = box.value;
		let startPosition = 0;
		const lines = text.split('\n');
		for (const i of RESUtils.gen.range(0, lines.length)) {
			let lineStart = startPosition;
			let lineEnd = lineStart + lines[i].length;
			// Check if either end of the line is within the selection
			if (selectionStart <= lineStart && lineStart <= selectionEnd || selectionStart <= lineEnd && lineEnd <= selectionEnd ||
					// Check if either end of the selection is within the line
					lineStart <= selectionStart && selectionStart <= lineEnd || lineStart <= selectionEnd && selectionEnd <= lineEnd) {
				lines[i] = prefix + lines[i] + suffix;
				// Move the offsets separately so we don't throw off detection for the other end
				let startMovement = 0;
				let endMovement = 0;
				if (lineStart < selectionStart) {
					startMovement += prefix.length;
				}
				if (lineEnd < selectionStart) {
					startMovement += suffix.length;
				}
				if (lineStart < selectionEnd) {
					endMovement += prefix.length;
				}
				if (lineEnd < selectionEnd) {
					endMovement += suffix.length;
				}

				selectionStart += startMovement;
				selectionEnd += endMovement;
				lineStart += prefix.length;
				lineEnd += prefix.length + suffix.length;
			}
			// Remember the newline
			startPosition = lineEnd + 1;
		}

		box.value = lines.join('\n');
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd;
		box.scrollTop = scrollTop;
	}

	function wrapSelectedWords(box, prefix) {
		const scrollTop = box.scrollTop;
		let selectionStart = box.selectionStart;
		const selectionEnd = box.selectionEnd;

		const text = box.value;
		const beforeSelection = text.substring(0, selectionStart);
		const selectedWords = text.substring(selectionStart, selectionEnd).split(' ');
		const afterSelection = text.substring(selectionEnd);

		let selectionModify = 0;

		for (const i of RESUtils.gen.range(0, selectedWords.length)) {
			if (selectedWords[i] !== '') {
				if (selectedWords[i].indexOf('\n') !== -1) {
					const newLinePosition = selectedWords[i].lastIndexOf('\n') + 1;
					selectedWords[i] = selectedWords[i].substring(0, newLinePosition) + prefix + selectedWords[i].substring(newLinePosition);
					selectionModify += prefix.length;
				}
				if (selectedWords[i].charAt(0) !== '\n') {
					selectedWords[i] = prefix + selectedWords[i];
				}
				selectionModify += prefix.length;
			} else if (selectedWords[i] === '' && selectedWords.length === 1) {
				// If nothing is selected, stick the prefix in there and move the cursor to the right side.
				selectedWords[i] = prefix + selectedWords[i];
				selectionModify += prefix.length;
				selectionStart += prefix.length;
			}
		}

		box.value = beforeSelection + selectedWords.join(' ') + afterSelection;
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd + selectionModify;
		box.scrollTop = scrollTop;
	}

	// Unused, kept for posterity (?)
	/* const firstlod;
	function lod() {
		if (!firstlod) {
			firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #ddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
		}
		$('#RESlod').fadeIn('slow', function() {
			setTimeout(function() {
				$('#RESlod').fadeOut('slow');
			}, 5000);
		});
	} */

	module.KEYS = {
		BACKSPACE: 8,
		TAB: 9,
		ENTER: 13,
		ESCAPE: 27,
		SPACE: 32,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		NUMPAD_ENTER: 108,
		COMMA: 188
	};

	const autoCompleteCache = {};
	let $autoCompletePop;

	function addAutoCompletePop() {
		$autoCompletePop = $('<div id="autocomplete_dropdown" class="drop-choices srdrop inuse" style="display:none;">');
		$autoCompletePop.on('click mousedown', '.choice', function() {
			autoCompleteHideDropdown();
			autoCompleteInsert(this.innerHTML);
		});
		$('body').append($autoCompletePop);

		$('body').on({
			keyup: autoCompleteTrigger,
			keydown: autoCompleteNavigate,
			blur: autoCompleteHideDropdown
		}, '.usertext .usertext-edit textarea, #BigText, #wiki_page_content');
	}

	let autoCompleteLastTarget;

	const autoCompleteDebounce = RESUtils.debounce((type, query) => {
		if (type === 'r') {
			getSubredditCompletions(query);
		} else if (type === 'u') {
			getUserCompletions(query);
		}
	}, 300);

	function autoCompleteTrigger(e) {
		const KEYS = module.KEYS;
		// \0x08 is backspace
		if (/[^A-Za-z0-9 \x08]/.test(String.fromCharCode(e.keyCode))) {
			return true;
		}
		autoCompleteLastTarget = e.target;
		const matchRE = /\W\/?([ru])\/([\w\.]*)$/;
		const matchSkipRE = /\W\/?([ru])\/([\w\.]*)\ $/;
		const fullText = $(this).val();
		const prefixText = fullText.slice(0, this.selectionStart);
		let match = matchRE.exec(` ${prefixText}`);
		if (match !== null) {
			if (match[1] === 'r' && !module.options.subredditAutocomplete.value) {
				return undefined;
			}
			if (match[1] === 'u' && !module.options.userAutocomplete.value) {
				return undefined;
			}
		}

		if (match === null || match[2] === '' || match[2].length > 10) {
			if (e.keyCode === KEYS.SPACE || e.keyCode === KEYS.ENTER) {
				match = matchSkipRE.exec(` ${prefixText}`);
				if (match) {
					autoCompleteInsert(match[2]);
				}
			}
			return autoCompleteHideDropdown();
		}

		const type = match[1];
		const query = match[2].toLowerCase();
		const queryId = `${type}/${query}`;
		const cache = autoCompleteCache;
		if (queryId in cache) {
			return autoCompleteUpdateDropdown(cache[queryId]);
		}

		autoCompleteDebounce(type, query);
	}

	function getSubredditCompletions(query) {
		if (module.options.subredditAutocomplete.value) {
			$.ajax({
				type: 'POST',
				url: '/api/search_reddit_names.json',
				data: {
					query,
					app: 'res'
				},
				dataType: 'json',
				success(data) {
					autoCompleteCache[`r/${query}`] = data.names;
					autoCompleteUpdateDropdown(data.names);
					autoCompleteSetNavIndex(0);
				}
			});
		}
	}

	async function getUserCompletions(query) {
		if (module.options.userAutocomplete.value) {
			const tags = await RESEnvironment.storage.get('RESmodules.userTagger.tags') || {};
			const tagNames = Object.keys(tags);
			const pageNames = Array.from(document.querySelectorAll('.author')).map(e => e.textContent);
			const names = tagNames
				.concat(pageNames)
				.filter(e => e.toLowerCase().indexOf(query) === 0)
				.sort()
				.reduce((prev, current) => {
					// Removing duplicates
					if (prev[prev.length - 1] !== current) {
						prev.push(current);
					}
					return prev;
				}, []);

			autoCompleteCache[`u/${query}`] = names;
			autoCompleteUpdateDropdown(names);
			autoCompleteSetNavIndex(0);
		}
	}

	function autoCompleteNavigate(e) {
		// Don't mess with shortcuts for fancier cursor movement
		if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return undefined;
		const KEYS = module.KEYS;
		const entries = $autoCompletePop.find('a.choice');
		let index = +$autoCompletePop.find('.selectedItem').data('index');
		if ($autoCompletePop.is(':visible')) {
			switch (e.keyCode) {
				case KEYS.DOWN:
				case KEYS.RIGHT:
					e.preventDefault();
					if (index < entries.length - 1) index++;
					autoCompleteSetNavIndex(index);
					break;
				case KEYS.UP:
				case KEYS.LEFT:
					e.preventDefault();
					if (index > 0) index--;
					autoCompleteSetNavIndex(index);
					break;
				case KEYS.TAB:
				case KEYS.ENTER:
					e.preventDefault();
					$(entries[index]).click();
					break;
				case KEYS.ESCAPE:
					e.preventDefault();
					autoCompleteHideDropdown();
					return false;
				default:
					break;
			}
		}
	}

	function autoCompleteSetNavIndex(index) {
		const entries = $autoCompletePop.find('a.choice');
		entries.removeClass('selectedItem');
		entries.eq(index).addClass('selectedItem');
	}

	function autoCompleteHideDropdown() {
		$autoCompletePop.hide();
	}

	function autoCompleteUpdateDropdown(names) {
		if (!names.length) return autoCompleteHideDropdown();
		$autoCompletePop.empty();
		$.each(names.slice(0, 20), (i, e) => {
			$autoCompletePop.append(`<a class="choice" data-index="${i}">${e}</a>`);
		});

		const textareaOffset = $(autoCompleteLastTarget).offset();
		textareaOffset.left += $(autoCompleteLastTarget).width();
		$autoCompletePop.css(textareaOffset).show();

		autoCompleteSetNavIndex(0);
	}

	function autoCompleteInsert(inputValue) {
		const textarea = autoCompleteLastTarget;
		const caretPos = textarea.selectionStart;
		let left = textarea.value.substr(0, caretPos);
		const right = textarea.value.substr(caretPos);
		left = left.replace(/\/?([ru])\/(\w*)\ ?$/, `/$1/${inputValue} `);
		textarea.value = left + right;
		textarea.selectionStart = textarea.selectionEnd = left.length;
		textarea.focus();
	}

	function findTextareaForElement(elem) {
		return $(elem)
			.closest('.usertext-edit, .RESDialogContents, .wiki-page-content, .ban-details')
			.find('textarea')
			.filter('#BigText, [name=text], [name=description], [name=public_description], #wiki_page_content, #ban_message')
			.first();
	}

	module.onCtrlEnter = function(selector, handler) {
		$(document.body).on('keydown', selector, e => {
			if (e.keyCode === module.KEYS.ENTER && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handler(e);
			}
		});
	};
});
