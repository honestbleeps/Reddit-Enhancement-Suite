/* eslint no-unused-vars: [2, { "argsIgnorePattern": "^(moduleID|macroText|selectedText|box)$" }] */

addModule('commentTools', function(module, moduleID) {
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
			description: 'When using macro, replace placeholders in text via pop-up prompt.\
			<p>Example macro text:<br>\
			The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!\
			</p>\
			'
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
			var macroPlaceholdersDescription = '<br><br>Some placeholders are automatically filled in when you use the macro:<dl>';
			macroPlaceholdersDescription += magicPlaceholders.map(function(placeholder) {
				var description = '<dt>' + placeholder.matches.map(function(placeholder) { return '{{' + placeholder + '}}'; }).join('<br>') + '</dt>';
				if (placeholder.description) {
					description += '<dd>' + placeholder.description + '</dd>';
				}
				return description;
			}).join('');
			macroPlaceholdersDescription += '</dl>';
			module.options['macroPlaceholders'].description += macroPlaceholdersDescription;
		}
	};

	var SUBMIT_LIMITS = {
		STYLESHEET: 128 * 1024,
		SIDEBAR: 5120,
		DESCRIPTION: 500,
		WIKI: 512 * 1024,
		COMMENT: 10000,
		POST: 40000,
		POST_TITLE: 300,
		BAN_MESSAGE: 1000
	};
	var macroCallbackTable = [];
	var macroKeyTable = [];

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			migrateData();

			var $body = $('body');

			$body.on('click', 'div.markdownEditor-wrapper a:not(.userTagLink)', function(e) {
				e.preventDefault();

				var index = $(this).data('macro-index');
				var box = findTextareaForElement(this)[0];
				// var box = $(this).closest('.usertext-edit, .RESDialogContents, .wiki-page-content').find('textarea[name=text], textarea[name=description], textarea[name=public_description]')[0];
				if (box === null) {
					console.error('Failed to locate textarea.');
					return;
				}
				var handler = macroCallbackTable[index];
				if (handler === null) {
					console.error('Failed to locate find callback.');
					return;
				}
				handler.call(module, this, box);

				box.focus();
				//Fire an input event to refresh the preview
				var inputEvent = document.createEvent('HTMLEvents');
				inputEvent.initEvent('input', true, true);
				box.dispatchEvent(inputEvent);
			}).on('click', '.RESMacroDropdownTitle', function(e) {
				var thisCat = e.target;
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
					top: thisCat.offsetTop + thisCat.offsetHeight + 'px',
					left: (thisCat.offsetLeft + thisCat.offsetWidth) - thisCat.nextSibling.offsetWidth + 'px'
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
						if (!autoCompletePop.is(':visible')) {
							// Blur from the editor on escape, so we can return to using the keyboard nav.
							// NOTE: The big editor closes on ESC so this won't be reached in that case.
							$(this).blur();
							e.preventDefault();
						}

						return;
					}

					for (var i = 0; i < macroKeyTable.length; i++) {
						var row = macroKeyTable[i];
						var testedKeyArray = row[0],
							macroIndex = row[1];
						if (RESUtils.checkKeysForEvent(e, testedKeyArray)) {
							var handler = macroCallbackTable[macroIndex];
							handler.call(module, null, this);

							// Fire an input event to refresh the preview
							var inputEvent = document.createEvent('HTMLEvents');
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
					function(e) {
						var currentForm = $(e.target).closest('form');
						var saveButton = currentForm.find('.save')[0] || currentForm.find('#wiki_save_button')[0] || $('.BEFoot button')[0];
						RESUtils.click(saveButton);
					}
				);
			}
			if (this.options.ctrlEnterSubmitsPosts.value) {
				module.onCtrlEnter(
					'#title-field textarea, #text-field textarea, #url, #sr-autocomplete, input.captcha',
					function() {
						var captcha = $('input.captcha:not(.cap-text)');
						if (captcha.length && captcha.val() === '') {
							captcha.focus();
						} else {
							RESUtils.click($('.spacer .btn')[0]);
						}
					}
				);
			}

			if (this.options.subredditAutocomplete.value || this.options.userAutocomplete.value) {
				addAutoCompletePop();
			}

			//Perform initial setup of tools over the whole page
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

	async function migrateData() {
		var LATEST_MACRO_DATA_VERSION = '2';
		const macroVersion = await RESEnvironment.storage.getRaw('RESmodules.commentTools.macroDataVersion');
		if (macroVersion === null || macroVersion === '0') {
			//In this case it is unmigrated or uncreated
			const previewOptionString = await RESEnvironment.storage.getRaw('RESoptions.commentPreview');
			var previewOptions = safeJSON.parse(previewOptionString, 'commentPreview');
			if (previewOptions !== null) {
				if (typeof previewOptions.commentingAs !== 'undefined') {
					module.options.commentingAs.value = previewOptions.commentingAs.value;
					delete previewOptions.commentingAs;
				}
				if (typeof previewOptions.keyboardShortcuts !== 'undefined') {
					module.options.keyboardShortcuts.value = previewOptions.keyboardShortcuts.value;
					delete previewOptions.keyboardShortcuts;
				}
				if (typeof previewOptions.subredditAutocomplete !== 'undefined') {
					module.options.subredditAutocomplete.value = previewOptions.subredditAutocomplete.value;
					delete previewOptions.subredditAutocomplete;
				}
				if (typeof previewOptions.macros !== 'undefined') {
					module.options.macros.value = previewOptions.macros.value;
					module.options.macros.value.forEach(function(macro) {
						while (macro.length < 4) {
							macro.push('');
						}
					});
					delete previewOptions.macros;
				}
				RESUtils.options.saveModuleOptions('commentTools');
				RESUtils.options.saveModuleOptions('commentPreview', previewOptions);
				RESEnvironment.storage.setRaw('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
			} else {
				//No migration will be performed
				RESEnvironment.storage.setRaw('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
			}
		}
		if (macroVersion === '1') {
			module.options.macros.value.forEach(function(macro) {
				while (macro.length < 4) {
					macro.push('');
				}
			});
			RESEnvironment.storage.setRaw('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
		}
	}

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
			//case 'description_conflict_old':
			//case 'public_description_conflict_old':
			default:
				// console.warn('unhandled form', this);
				return;
		}
	}

	function attachEditorToUsertext() {
		if (this.hasAttribute('data-max-length')) {
			return;
		}
		var limit = getFieldLimit(this);

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

		var bar = module.makeEditBar();
		if (this.id === 'wiki_page_content' || this.id === 'ban_message') {
			$(this).parent().prepend(bar);
		} else {
			$(this).parent().before(bar);
		}
		module.updateCounter(this);
	}

	module.updateCounter = function(textarea) {
		var length = $(textarea).val().length;
		var limit = textarea.getAttribute('data-limit');
		var counter = $(textarea).parent().parent().find('.RESCharCounter');
		counter.attr('title', 'character limit: ' + length + '/' + limit);
		counter.text(length + '/' + limit);
		if (length > limit) {
			counter.addClass('tooLong');
		} else {
			counter.removeClass('tooLong');
		}
	};

	var cachedEditBar;

	module.makeEditBar = function() {
		if (cachedEditBar) {
			return $(cachedEditBar).clone();
		}

		var editBar = $('<div class="markdownEditor">');
		// Wrap the edit bar in a <div> of its own
		var wrappedEditBar = $('<div class="markdownEditor-wrapper">').append(editBar);

		if (module.options.commentingAs.value && (!modules['usernameHider'].isEnabled())) {
			// show who we're commenting as...
			var commentingAsMessage = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned\/?/i) ? 'Moderating as' : 'Commenting as';

			var commentingAs = $('<div class="commentingAs">').html(commentingAsMessage + ': <span class="commentingAsUser" data-user="'+ RESUtils.loggedInUser() +'">' + RESUtils.loggedInUser() + '</span>');
			if (modules['userTagger'].isEnabled()) {
				modules['userTagger'].applyTagToAuthor(commentingAs.find('.commentingAsUser')[0], true);
			}
			if (module.options.highlightIfAltAccount.value && modules['accountSwitcher'].options.accounts.value.length && typeof RESUtils.loggedInUser() === 'string' && RESUtils.loggedInUser().toLowerCase() !== modules['accountSwitcher'].options.accounts.value[0][0].toLowerCase()) {
				commentingAs.addClass('highlightedAltAccount');
			}
			wrappedEditBar.append(commentingAs);
		}

		if (module.options.formattingToolButtons.value) {
			var shortcuts = module.options.keyboardShortcuts.value;
			editBar.append(makeEditButton('<b>Bold</b>', 'bold' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.boldKey.value) + ')' : ''), module.options.boldKey.value, 'btn-bold', function(button, box) {
				wrapSelection(box, '**', '**');
			}));
			editBar.append(makeEditButton('<i>Italic</i>', 'italic' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.italicKey.value) + ')' : ''), module.options.italicKey.value, 'btn-italic', function(button, box) {
				wrapSelection(box, '*', '*');
			}));
			editBar.append(makeEditButton('<del>strike</del>', 'strike' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.strikeKey.value) + ')' : ''), module.options.strikeKey.value, 'btn-strike', function(button, box) {
				wrapSelection(box, '~~', '~~');
			}));
			editBar.append(makeEditButton('<sup>sup</sup>', 'super' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.superKey.value) + ')' : ''), module.options.superKey.value, 'btn-superscript', function(button, box) {
				wrapSelectedWords(box, '^');
			}));
			editBar.append(makeEditButton('Link', 'link' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.linkKey.value) + ')' : ''), module.options.linkKey.value, 'btn-link', function(button, box) {
				linkSelection(box);
			}));
			editBar.append(makeEditButton('>Quote', 'quote' + (shortcuts ? ' (' + RESUtils.niceKeyCode(module.options.quoteKey.value) + ')' : ''), module.options.quoteKey.value, 'btn-quote', function(button, box) {
				wrapSelectedLines(box, '> ', '');
			}));
			editBar.append(makeEditButton('<span style="font-family: monospace">Code</span>', 'code', null, 'btn-code', function(button, box) {
				wrapSelectedLines(box, '    ', '');
			}));
			editBar.append(makeEditButton('&bull;Bullets', 'bullet list', null, 'btn-list-unordered', function(button, box) {
				wrapSelectedLines(box, '* ', '');
			}));
			editBar.append(makeEditButton('1.Numbers', 'number list', null, 'btn-list-ordered', function(button, box) {
				wrapSelectedLines(box, '1. ', '');
			}));
			editBar.append(makeEditButton('<span style="border: 1px black solid;">Table</span>', 'table', null, 'btn-table', function(button, box) {
				// First check if the selected text is a table, this also clean the selection
				var selectedText = box.value.substring(box.selectionStart, box.selectionEnd).replace(/^[\s]+/, '').replace(/[\s]+$/, '').split('\n'); // In fact, if the header start by '   |' this is not a table. But it's better to accept it then after editing the table it will work
				var isTable;
				if (selectedText.length >= 2) {
					if (selectedText[0].indexOf('|') !== -1) {	// Check if there is at least one '|' to check if it's a table
						selectedText[0] = selectedText[0].replace(/^\|/, '').replace(/\|\s+$/, ''); // Avoid '| foo | bar |' instead of 'foo | bar'
						var numSeparator = selectedText[0].split('|').length;
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
							for (var i = 2, len = selectedText.length; i<len; i++) {
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
				var startTable;
				if (isTable) {
					// The selected text is a table, now transform it to HTML!
					startTable = selectedText.reduce(function(prevTable, currText, i) {
						if (i === 1) {
							return prevTable;
						}

						return prevTable + '<tr><td>' + escapeHTML(currText).replace(/\|/g, '</td><td>') + '</td></tr>';
					}, '');
				} else {
					startTable = '<tr><td>Foo</td><td>Bar</td></tr><tr><td>Foo</td><td>Bar</td></tr>';
				}
				alert('<div class="buttonContainer"></div><table class="commentPreview" contenteditable="true">' + startTable + '</table>',
					function() {
						var generatedTable = '\n\n';
						var generatedTableSeparation = '';
						$('#alert_message tr:first td').each(function(){
							var text = $(this).text().replace(/[\n|]/g, '');
							generatedTable += text + ' | ';
							for (var i = 0, len = text.length; i < len; i++) {
								generatedTableSeparation += '-';
							}
							generatedTableSeparation += '|';
						});
						generatedTableSeparation = generatedTableSeparation.substr(0, generatedTableSeparation.length - 1);
						generatedTable = generatedTable.substr(0, generatedTable.length - 3) + '\n' + generatedTableSeparation + '\n';
						$('#alert_message tr:gt(0)').each(function() {
							$(this).find('td').each(function() {
								generatedTable += $(this).text().replace(/[\n|]/g, '') + ' | ';
							});
							generatedTable = generatedTable.substr(0, generatedTable.length - 3) + '\n';
						});
						if (isTable) {
							replaceSelection(box, generatedTable);
						} else {
							wrapSelection(box, generatedTable, '');
						}
						$(box).trigger('input'); // update preview
					});

				var addRow = gdAlert.makeButton('+ Row');
				var remRow = gdAlert.makeButton('- Row');
				var addCol = gdAlert.makeButton('+ Col');
				var remCol = gdAlert.makeButton('- Col');
				addRow.addEventListener('click', function() {
					var nbCol = $('#alert_message tr:first td').length;
					for (var i = 0, newRow = ''; i<nbCol; i++) {
						newRow += '<td>text</td>';
					}
					$('#alert_message table').append('<tr>' + newRow + '</tr>');
				}, false);
				remRow.addEventListener('click', function() {
					if ($('#alert_message tr').length > 1) {
						$('#alert_message table tr:last').remove();
					}
				}, false);
				addCol.addEventListener('click', function() {
					$('#alert_message table tr').append('<td>text</td>');
				}, false);
				remCol.addEventListener('click', function() {
					if ($('#alert_message tr:first td').length > 1) {
						$('#alert_message table tr td:last-of-type').remove();
					}
				}, false);

				var $buttonContainer = $('#alert_message .buttonContainer');
				$buttonContainer.append(addRow);
				$buttonContainer.append(remRow);
				$buttonContainer.append(addCol);
				$buttonContainer.append(remCol);
			}));
		}

		if (module.options.showInputLength.value) {
			var counter = $('<span class="RESCharCounter" title="character limit: 0/?????">0/?????</span>');
			editBar.prepend(counter); // prepend for more reliable css floating.
			$('.submit-page #title-field .title').prepend($('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>'));
		}

		if (module.options.macroButtons.value) {
			buildMacroDropdowns(wrappedEditBar);

			var addMacroButton = makeEditButton(module.options.macros.addRowText, null, null, 'btn-macro btn-macro-add', function() {
				modules['settingsNavigation'].loadSettingsPage(moduleID, 'macros');
				$('.RESMacroWrappingSpan span').removeClass('openMacro');
			});
			addButtonToMacroGroup('', addMacroButton);
		}

		cachedEditBar = wrappedEditBar;
		return cachedEditBar;
	};

	var macroDropDownTable = {};

	function getMacroGroup(groupName) {
		// Normalize and supply a default group name{}
		groupName = (groupName || '').toString().trim() || 'macros';
		var macroGroup;
		if (groupName in macroDropDownTable) {
			macroGroup = macroDropDownTable[groupName];
		} else {
			macroGroup = macroDropDownTable[groupName] = {};
			macroGroup.titleButton = $('<span class="RESMacroDropdownTitle">' + groupName + '</span>');
			macroGroup.container = $('<span class="RESMacroDropdown"></span>');
			macroGroup.dropdown = $('<ul class="RESMacroDropdownList"></ul>');
			macroGroup.container.append(macroGroup.dropdown);
		}
		return macroGroup;
	}

	function addButtonToMacroGroup(groupName, button) {
		var group = getMacroGroup(groupName);
		group.dropdown.append($('<li>').append(button));
	}

	function buildMacroDropdowns(editBar) {
		var macros = module.options.macros.value;

		for (var i = 0; i < macros.length; i++) {
			var macro = macros[i];

			// Confound these scoping rules
			(function(title, text, category, key) {
				var button = makeEditButton(title, null, key, 'btn-macro', function(button, box) {
					macroSelection(box, text, '');
				});
				addButtonToMacroGroup(category, button);
			}).apply(this, macro);
		}

		var macroWrapper = $('<span class="RESMacroWrappingSpan">');

		var defaultGroup = getMacroGroup('');
		macroWrapper.append(defaultGroup.titleButton);
		macroWrapper.append(defaultGroup.container);

		for (var category in macroDropDownTable) {
			if (category === 'macros') {
				continue;
			}
			macroWrapper.append(macroDropDownTable[category].titleButton);
			macroWrapper.append(macroDropDownTable[category].container);
		}
		editBar.append(macroWrapper);
	}

	function makeEditButton(label, title, key, cls, handler) {
		if (label === null) {
			label = 'unlabeled';
		}
		if (title === null) {
			title = '';
		}
		var macroButtonIndex = macroCallbackTable.length;
		var button = $('<a>').html(RESUtils.sanitizeHTML(label)).attr({
			class: 'edit-btn '+cls,
			title: title,
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
		var url = prompt('Enter the URL:', '');
		if (url !== null) {
			//escape parens in url
			url = url.replace(/[\(\)]/g, '\\$&');
			wrapSelection(box, '[', '](' + url + ')', function(text) {
				//escape brackets and parens in text
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
			var formatText = fillPlaceholders.bind(this, box, macroText);
			wrapSelection(box, '', '', formatText);
		} else {
			wrapSelection(box, macroText, '');
		}
	}

	function fillPlaceholders(box, macroText, selectedText) {
		var placeholders = macroText.match(/\{\{\w+\}\}/g);

		if (placeholders) {
			var completedPlaceholders = {};

			for (var i = 0; i < placeholders.length; i++) {
				var placeholder = placeholders[i];
				if (completedPlaceholders.hasOwnProperty(placeholder)) {
					continue;
				}
				completedPlaceholders[placeholder] = true;

				var placeholderInnerText = placeholder.substring(2, placeholder.length - 2).toLowerCase();
				var value = getMagicPlaceholderValue(placeholderInnerText, macroText, selectedText, box);
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
		var handler = magicPlaceholders.find(function(current) {
			return current.matches.indexOf(placeholder) !== -1;
		});

		if (handler) {
			return handler.handle(macroText, selectedText, box);
		}
	}

	var magicPlaceholders = [
		{
			matches: [ 'subreddit' ],
			description: 'The current subreddit, in the form /r/subreddit',
			handle: function(macroText, selectedText, box) {
				var subredditName = RESUtils.subredditForElement(box);

				if (!subredditName) {
					subredditName = RESUtils.currentSubreddit();
				}

				if (subredditName) {
					var subreddit = '/r/' + subredditName;
					return subreddit;
				}
			}
		}, {
			matches: [ 'me', 'my_username' ],
			description: 'Your username, in the form /u/username',
			handle: function(macroText, selectedText, box) {
				var username = RESUtils.loggedInUser();
				if (username) {
					username = '/u/' + username;
					return username;
				}
			}
		}, {
			matches: [ 'op', 'op_username' ],
			description: 'The username of the "original poster", in the form /u/username. On a post\'s comments page, this the person who made the post; on a PM / modmail, this is the person who started the conversation',
			handle: function(macroText, selectedText, box) {
				var profile;
				if (RESUtils.pageType() === 'comments') {
					profile = document.querySelector('.sitetable .author');
				} else {
					var furthest;
					var next = $(box);
					do {
						if (next && next.length) furthest = next;
						next = next.parent().closest('.sitetable');
					} while (next.length);

					profile = furthest.find('.author')[0];
				}

				if (profile) {
					return '/u/' + profile.href.match(RESUtils.regexes.profile)[1];
				}
			}
		}, {
			matches: [ 'url' ],
			description: 'The current page\'s URL, like http://www.reddit.com/r/Enhancement/comments/123abc/example_post',
			handle: function(macroText, selectedText, box) {
				return document.location.href;
			}
		}, {
			matches: [ 'reply_to', 'reply_to_username' ],
			description: 'The username of person you\'re replying to, in the form /u/username. ',
			handle: function(macroText, selectedText, box) {
				var $base = $(box);
				var isEditing = $base.closest('.thing, .entry').hasClass('entry');

				if (isEditing) {
					$base = $base.closest('.thing').parent();
				}

				var profile = $base.closest('.thing').find('.entry .author')[0];

				if (!profile) {
					return getMagicPlaceholderValue('op', macroText, selectedText, box);
				} else {
					return '/u/' + profile.href.match(RESUtils.regexes.profile)[1];
				}
			}
		}, {
			matches: [ 'selected', 'selection' ],
			description: 'The text which is currently selected (highlighted)',
			handle: function(macroText, selectedText, box) {
				return selectedText;
			}
		}, {
			matches: [ 'now' ],
			description: 'The current date and time in your locale',
			handle: function(macroText, selectedText, box) {
				var date = new Date();
				return date.toTimeString();
			}
		}, {
			matches: [ 'today' ],
			description: 'The current date in your locale',
			handle: function(macroText, selectedText, box) {
				var date = new Date();
				return date.toDateString();
			}
		}, {
			matches: [ 'escaped' ],
			description: 'The selected text, escaped for snudown/markdown. Useful for text emoji like ¯\\_(ツ)_/¯',
			handle: function(macroText, selectedText, box) {
				var escaped = selectedText.replace(/[\[\]()\\\*\^~\-_.]/g, '\\$&');
				return escaped;
			}
		}
	];

	function promptForPlaceholderValue(placeholder, macroText) {
		// Get value for placeholder
		var display = macroText + '\n\n\n' +
			'Enter replacement for ' + placeholder + ':';
		var value = placeholder;
		value = prompt(display, value);

		return value;
	}

	function wrapSelection(box, prefix, suffix, escapeFunction) {
		if (box === null) {
			return;
		}
		//record scroll top to restore it later.
		var scrollTop = box.scrollTop;

		//We will restore the selection later, so record the current selection.
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var beforeSelection = text.substring(0, selectionStart);
		var selectedText = text.substring(selectionStart, selectionEnd);
		var afterSelection = text.substring(selectionEnd);

		//Markdown doesn't like it when you tag a word like **this **. The space messes it up. So we'll account for that because Firefox selects the word, and the followign space when you double click a word.
		var trailingSpace = '';
		var cursor = selectedText.length - 1;
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
		//record scroll top to restore it later.
		var scrollTop = box.scrollTop;

		//We will restore the selection later, so record the current selection.
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var beforeSelection = text.substring(0, selectionStart);
		var afterSelection = text.substring(selectionEnd);


		box.value = beforeSelection + replacement + afterSelection;

		box.selectionEnd = beforeSelection.length + replacement.length;

		box.scrollTop = scrollTop;
	}

	function wrapSelectedLines(box, prefix, suffix) {
		var scrollTop = box.scrollTop;
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var startPosition = 0;
		var lines = text.split('\n');
		for (var i = 0; i < lines.length; i++) {
			var lineStart = startPosition;
			var lineEnd = lineStart + lines[i].length;
			//Check if either end of the line is within the selection
			if (selectionStart <= lineStart && lineStart <= selectionEnd || selectionStart <= lineEnd && lineEnd <= selectionEnd ||
					// Check if either end of the selection is within the line
					lineStart <= selectionStart && selectionStart <= lineEnd || lineStart <= selectionEnd && selectionEnd <= lineEnd) {
				lines[i] = prefix + lines[i] + suffix;
				//Move the offsets separately so we don't throw off detection for the other end
				var startMovement = 0,
					endMovement = 0;
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
			//Remember the newline
			startPosition = lineEnd + 1;
		}

		box.value = lines.join('\n');
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd;
		box.scrollTop = scrollTop;
	}

	function wrapSelectedWords(box, prefix) {
		var scrollTop = box.scrollTop;
		var selectionStart = box.selectionStart;
		var selectionEnd = box.selectionEnd;

		var text = box.value;
		var beforeSelection = text.substring(0, selectionStart);
		var selectedWords = text.substring(selectionStart, selectionEnd).split(' ');
		var afterSelection = text.substring(selectionEnd);

		var selectionModify = 0;

		for (var i = 0; i < selectedWords.length; i++) {
			if (selectedWords[i] !== '') {
				if (selectedWords[i].indexOf('\n') !== -1) {
					var newLinePosition = selectedWords[i].lastIndexOf('\n') + 1;
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
	/*var firstlod;
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
	}*/

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

	var autoCompleteCache = {};
	var autoCompletePop;

	function addAutoCompletePop() {
		autoCompletePop = $('<div id="autocomplete_dropdown" \
			class="drop-choices srdrop inuse" \
			style="display:none;">');
		autoCompletePop.on('click mousedown', '.choice', function() {
			autoCompleteHideDropdown();
			autoCompleteInsert(this.innerHTML);
		});
		$('body').append(autoCompletePop);

		$('body').on({
			keyup: autoCompleteTrigger,
			keydown: autoCompleteNavigate,
			blur: autoCompleteHideDropdown
		}, '.usertext .usertext-edit textarea, #BigText, #wiki_page_content');
	}

	var autoCompleteLastTarget;

	const autoCompleteDebounce = RESUtils.debounce((type, query) => {
		if (type === 'r') {
			getSubredditCompletions(query);
		} else if (type === 'u') {
			getUserCompletions(query);
		}
	}, 300);

	function autoCompleteTrigger(e) {
		var KEYS = module.KEYS;
		//\0x08 is backspace
		if (/[^A-Za-z0-9 \x08]/.test(String.fromCharCode(e.keyCode))) {
			return true;
		}
		autoCompleteLastTarget = this;
		var matchRE = /\W\/?([ru])\/([\w\.]*)$/;
		var matchSkipRE = /\W\/?([ru])\/([\w\.]*)\ $/;
		var fullText = $(this).val();
		var prefixText = fullText.slice(0, this.selectionStart);
		var match = matchRE.exec(' ' + prefixText);
		if (match !== null) {
			if (match[1] === 'r' && !module.options.subredditAutocomplete.value) {
				return;
			}
			if (match[1] === 'u' && !module.options.userAutocomplete.value) {
				return;
			}
		}

		if (match === null || match[2] === '' || match[2].length > 10) {
			if (e.keyCode === KEYS.SPACE || e.keyCode === KEYS.ENTER) {
				match = matchSkipRE.exec(' ' + prefixText);
				if (match) {
					autoCompleteInsert(match[2]);
				}
			}
			return autoCompleteHideDropdown();
		}

		var type = match[1];
		var query = match[2].toLowerCase();
		var queryId = type + '/' + query;
		var cache = autoCompleteCache;
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
					query: query,
					app: 'res'
				},
				dataType: 'json',
				success: function(data) {
					autoCompleteCache['r/' + query] = data.names;
					autoCompleteUpdateDropdown(data.names);
					autoCompleteSetNavIndex(0);
				}
			});
		}
	}

	async function getUserCompletions(query) {
		if (module.options.userAutocomplete.value) {
			const tags = await RESEnvironment.storage.get('RESmodules.userTagger.tags') || {};
			var tagNames = Object.keys(tags);
			var pageNames = Array.prototype.map.call($('.author'), function(e) {
				return e.textContent;
			});
			var names = tagNames.concat(pageNames);
			names = names.filter(function(e) {
				return e.toLowerCase().indexOf(query) === 0;
			}).sort().reduce(function(prev, current) {
				//Removing duplicates
				if (prev[prev.length - 1] != current) {
					prev.push(current);
				}
				return prev;
			}, []);

			autoCompleteCache['u/' + query] = names;
			autoCompleteUpdateDropdown(names);
			autoCompleteSetNavIndex(0);
		}
	}

	function autoCompleteNavigate(e) {
		//Don't mess with shortcuts for fancier cursor movement
		if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return;
		var KEYS = module.KEYS;
		var entries = autoCompletePop.find('a.choice');
		var index = +autoCompletePop.find('.selectedItem').data('index');
		if (autoCompletePop.is(':visible')) {
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
			}
		}
	}

	function autoCompleteSetNavIndex(index) {
		var entries = autoCompletePop.find('a.choice');
		entries.removeClass('selectedItem');
		entries.eq(index).addClass('selectedItem');
	}

	function autoCompleteHideDropdown() {
		autoCompletePop.hide();
	}

	function autoCompleteUpdateDropdown(names) {
		if (!names.length) return autoCompleteHideDropdown();
		autoCompletePop.empty();
		$.each(names.slice(0, 20), function(i, e) {
			autoCompletePop.append('<a class="choice" data-index="' + i + '">' + e + '</a>');
		});

		var textareaOffset = $(autoCompleteLastTarget).offset();
		textareaOffset.left += $(autoCompleteLastTarget).width();
		autoCompletePop.css(textareaOffset).show();

		autoCompleteSetNavIndex(0);

	}

	function autoCompleteInsert(inputValue) {
		var textarea = autoCompleteLastTarget,
			caretPos = textarea.selectionStart,
			left = textarea.value.substr(0, caretPos),
			right = textarea.value.substr(caretPos);
		left = left.replace(/\/?([ru])\/(\w*)\ ?$/, '/$1/' + inputValue + ' ');
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
		$(document.body).on('keydown', selector, function(e) {
			if (e.keyCode === module.KEYS.ENTER && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handler(e);
			}
		});
	};
});
