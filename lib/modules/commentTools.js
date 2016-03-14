addModule('commentTools', {
	moduleID: 'commentTools',
	moduleName: 'Editing Tools',
	category: ['Comments', 'Submissions' ],
	options: {
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
			description: 'Add macro buttons to the edit form for posts, comments, and other snudown/markdown text areas.'
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
	},
	description: 'Provides tools and shortcuts for composing comments, text posts, wiki pages, and other markdown text areas.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'comments',
		'inbox',
		'submit',
		'profile',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:edit|modqueue|reports|spam|banned)\/?/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/wiki\/(?:create|edit)(\/\w+)?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		if (modules['commentTools'].magicPlaceholders.length) {
			var macroPlaceholdersDescription = '<br><br>Some placeholders are automatically filled in when you use the macro:<dl>';
			macroPlaceholdersDescription += modules['commentTools'].magicPlaceholders.map(function(placeholder) {
				var description = '<dt>' + placeholder.matches.map(function(placeholder) { return '{{' + placeholder + '}}'; }).join('<br>') + '</dt>';
				if (placeholder.description) {
					description += '<dd>' + placeholder.description + '</dd>';
				}
				return description;
			}).join('');
			macroPlaceholdersDescription += '</dl>';
			modules['commentTools'].options['macroPlaceholders'].description += macroPlaceholdersDescription;
		}
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.markdownEditor-wrapper { width: 500px; }'); // same as textarea.

			//  Formatting tools container
			RESUtils.addCSS('.markdownEditor { white-space: nowrap; float: none; }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');

			// Formatting tools
			RESUtils.addCSS('.markdownEditor .edit-btn:not(.btn-macro) { \
				padding: 0px; \
				width: 32px; \
				height: 20px; \
				display: inline-block; \
				overflow: hidden; \
				text-indent: 50px; \
				position: relative; \
				margin-right: 4px; \
				border: 1px solid #ccc; \
				float: none; \
				background-color: #fff; \
				background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAADECAYAAACWXKFYAAAHeklEQVRoQ+1aC2wURRi+bUsVrdVqtRBDTUjUErGIUq2iTYEqjQ1ajFbjA06xIuiJVMtVbLFArZZWEatWbCyKjyhBrNEajLQQY+ILwVejGDVaohRtrFSUKn34fevMubfs3OwWSM7mJvkyszvzf/fP7Ox3/8ys4TvIZBykvS/6CM5Al5YquvUL7t8H/Gytd+rCVDQIiEYVyL8ArgGuBl4GXtIRZKJBtWi0GPlnwLUCLyInQsnJgwmoXaHoxiLc/1RHcBYarBSNapB3AiT1i/Ic5H9KEicPzkZlvWjAsdgGON0zmzgRXIb7SwTBrci3AtZ7HNBvnDwYiZsXAE2K/vP2GmC16MIeuwckSAJGRCBg1aCKQGPnXB1974LnbsS64DyVPQ1kdA+ikz5SE9utfdR1YTwaLwe+Be52GhwdgdTHe2D8+VAIboHRpUCh6tHoPGiB4RtAw1AIpA7eDuPtQyF4HkYZgNRFRw6nLlyEljS2Jo7FJ8BvwF+6x3g0GiQDdvJ+twTD6F1w1RXdRNKSxAgOo6heiOGfC/Avn4kyRokrATp07wLrGYn9BMhobSHKlLeZ9ueqeowyyKIhU5ogaHVLQINyYB/wELBbNaPsHmzSTr1/G+TJdrqZOAoNqchHAYzcdrntQgEaMj6UBozOmG50S0ARJUGZMHgUeTowWUfA587HtQHgH8mZwuAP5HXifg/yPtUYkIB6GG//JXHdizwigcJOfVv3FLSEMYLDKCja0VdNJNeG/w8CGRfNE+5yTU1hpcAyXjSTaiaegjoqMF/hO4EfRPsc5NcBVOyIBFydUg+5Zn4VeFoYZiF/AAhppMqDtcLN65GfCswCuJ7mEpgptIZ2IhiLBvcCXP5yHT0boEffSbetuRMB18tc3loT9wzkejqswongdbTgH4pcH9P1ccAMnQcM76i+5wEfABx9auJTwpD32J2/AYZ8ZrJ6oIoPuVamAQ0ZZCoJnDzU3otJWkzS7DNRO2l078LQCQoLC8+Jj48fPzg4eGToJTGM3v7+fm4F+lR1zc3NHxv5+flZ6enp+X6/f1ZaWtrYxMTEOBgOdHZ2fl9WVmbualVXV/vtdU1NTc90dHRsNPLy8oqXLCkPtrZu3l1fX/9hT0/P/qqqqtKUlJSwLnV3d/vKy8trk5OTRwQCgXOnTZuStmxZVY2RnZ1d0tjYWF1QUPAgGCsTEhJWtLW1lqampvpSU0/0GYbho3FXV5cvJyentq+vbxE8rmxpaSkrLi5ebGRmZt6xfHnNwq1bP/qyvv7hTfBgZGlpaZXTiNbW1pbDg32BQEnepElZ4yoqgiuNpKSkqWPGpF9ZUrJ4RkbG+NEpKSfE7927t7+9ffuuuroqyptPVbdzZ8d66sHxGOWL4Sr/dUJPAeVePJUd5mQxjNMd6tox2G+TgKHdMUCCx4nAWPH3mCLFFCmKFMnjFA5rHp1TeRRe7xfg51q8rs8it19H7kJcXFwQLSYMDAwwRvTZr+3jdcAY4NffQaM1+HVztWq/1hJAfd4XKrQNXsy3X7shCO0dQtImgiDsOhIBV6s84QjAyA9jDiBj5Dm4ni2uH6OMAY5LX0nApb5qfjAAVxIMaUJG50z01JVYF4b1/0IRJkMuMF9MiieQbwHWaV9nNOCSbwrAI2N5xnwSyjwq2QxEPDamjPHcmQtP+xYgtwjvB9qA0NGxdSZymcttPmqiav+QJDwJ5raheYQgCbjE5V4ZT3J4jhAphbW1esCtvnyAC84D9g0F42jkjwAbAVN07S8TF9ncS7zNgYTGjwM8uKHUmcnpbeTmwuVAMfCjaHcy8kbgNYDHxqFkJWCcyJiRmsjnfwkwXfwIXX4LeBKgLnJ/0RRWFUEc6vYDXCezDckTAa6jlQRWz1yXY4o0rBSJCkRQcQ5QnUiTQs6DDcFgcGZNTQ33za4QBuvFLGQbgrPTWuaqNigJKGME5SpMsnRTMnpm4g1wlZpInXtO57a1XnZh07x5C6Y1NKziKY48P3nTMngcQCdMlgTUQ260MTKTxyGuHImeQaSQUkQpnGGiqeuH7MKOoqK5p61bt/prGHClfhzAM3frwDEQPQLgCp/4CrhKEtyFC4LHYgQJqM66tC96BlHnqrI+1oX/ZH0pRonbQJyN3V5G1DqIPCK8GfhVEHjSRNo0AzdZCFw5Ij3g+TIPKqm0/CLQdTpk84BnCPzuht8i8vjDdbJ6wAiVY0BxZfKkiX4YZAOVAL9HdJ2kB6tgwQiUiYGm8tsbO/MhG0QeizESJXjG4jpJDybBgtOZU5nfHXjWRP4iP05YAOQKAk+a+AqM+HklQ36Kqut0yAbR9S8etsc4DDyQmui2K6GD21CcCEsZH1IbXZclAfVQfn/nqSwJzGMAkawfb6jKbGqegEoCqg+/AmTyVJYEXNJxicfkqRyKEy1doLBSYJlUZdaZ8aQk2IJyrjDyVJYE78KYX0ExeSpLgvcsXaCgThTXqjKrz7d2gR92U9aYPJVDcSIMGR8y8WTHdZkE/MaA0ak82bf0Rlnk1/OMbjtIcCzAZT+jUrdpAA25it9z0Jr4Dwb5++kvFqMVAAAAAElFTkSuQmCC"); \
				background-repeat: no-repeat; \
			}');
			RESUtils.addCSS('.res-nightmode .markdownEditor .edit-btn:not(.btn-macro) { background-color: #999; }');

			RESUtils.addCSS('.markdownEditor .btn-bold { \
				background-position: 8px 2px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-italic { \
				background-position: 8px -18px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-strike { \
				background-position: 8px -38px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-superscript { \
				background-position: 8px -58px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-link { \
				background-position: 8px -78px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-quote { \
				background-position: 8px -98px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-code { \
				background-position: 8px -118px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-list-unordered { \
				background-position: 8px -138px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-list-ordered { \
				background-position: 8px -158px; \
			}');
			RESUtils.addCSS('.markdownEditor .btn-table { \
				background-position: 8px -178px; \
			}');

			// Macros
			RESUtils.addCSS('.markdownEditor .RESMacroDropdown {font-size: 10px; }');
			RESUtils.addCSS('.RESMacroDropdownTitle { cursor: pointer; display: inline-block; font-size: 11px; color: gray; padding-left: 2px; padding-right: 21px; background-image: url(//www.redditstatic.com/droparrowgray.gif); background-position: 100% 50%; background-repeat: no-repeat; }');
			RESUtils.addCSS('.RESMacroWrappingSpan { white-space: normal; display: block; text-align: right; margin: 10px 0 3px 0; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.RESMacroWrappingSpan .openMacro { color: rgb(0,0,0); background-color: rgb(235,240,245); }');
			RESUtils.addCSS('.RESMacroWrappingSpan .openMacro + span { display: block; }');
			RESUtils.addCSS('.RESMacroDropdown { display: none; position: absolute; z-index: 2001; font-size: 10px; line-height: 2; border: 1px solid rgb(200,200,200); background-color: rgb(255,255,255); text-align: left; }');
			RESUtils.addCSS('.RESMacroDropdown li a { display: block; padding: 0 10px; color: rgb(0,0,0); border-bottom: 1px solid rgb(230,230,230); }');
			RESUtils.addCSS('.RESMacroDropdown li a:hover { color: rgb(0,0,0); background-color: rgb(245,250,255); text-decoration: none; }');

			RESUtils.addCSS('.res-nightmode .RESMacroWrappingSpan .openMacro { color: rgb(200,200,200); background-color: rgb(50,50,50); }');
			RESUtils.addCSS('.res-nightmode .RESMacroWrappingSpan .openMacro + span { background-color: rgb(50,50,50); border-color: rgb(0,0,0); }');
			RESUtils.addCSS('.res-nightmode .RESMacroWrappingSpan .openMacro + span li a { color: rgb(200,200,200); border-color: rgb(0,0,0); }');
			RESUtils.addCSS('.res-nightmode .RESMacroWrappingSpan .openMacro + span li a:hover { background-color: rgb(60,60,60); }');

			// "Commenting as"
			RESUtils.addCSS('.commentingAs { clear: left; margin-top: 10px; margin-bottom: 3px; }');
			if (modules['commentTools'].options['macroButtons'].value) {
				RESUtils.addCSS('.commentingAs { float: left; }');
			}
			RESUtils.addCSS('.commentingAs a.userTagLink { cursor:default; display: inline; }');

			// Table editor
			RESUtils.addCSS('#alert_message table.commentPreview td{border:1px solid black;padding:1px;min-width:25px;}');
			RESUtils.addCSS('#alert_message table.commentPreview tr:first-child	td{font-weight:bold;}');
			RESUtils.addCSS('#alert_message .buttonContainer { width: 100%; display: block; height: 30px; margin-bottom: 10px; }');

			// Autocomplete
			RESUtils.addCSS('.selectedItem { color: #fff; background-color: #5f99cf; }');

			return RESStorage.loadItem('RESmodules.commentTools.macroDataVersion');
		}
	},
	SUBMIT_LIMITS: {
		STYLESHEET: 128 * 1024,
		SIDEBAR: 5120,
		DESCRIPTION: 500,
		WIKI: 512 * 1024,
		COMMENT: 10000,
		POST: 40000,
		POST_TITLE: 300,
		BAN_MESSAGE: 10000
	},
	//Moved this out of go() because the large commentPreview may need it.
	macroCallbackTable: [],
	macroKeyTable: [],
	curSubreddit: null,
	curSubredditTitle: null,
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = $(document.body).is('.wiki-page');
			this.migrateData();

			var $body = $('body');

			if (location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned\/?/i)) {
				var subreddit = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\-\w\.]+)/i)[1];

				this.SUBMIT_LIMITS.BAN_MESSAGE = 10000 - modules['commentTools'].generateBanMessage(null, subreddit).length;
				this.curSubreddit = subreddit;

				this.fetchTitle();
			}


			$body.on('click', 'div.markdownEditor-wrapper a:not(.userTagLink)', function(e) {
				e.preventDefault();

				var index = $(this).data('macro-index');
				var box = modules['commentTools'].findTextareaForElement(this)[0];
				// var box = $(this).closest('.usertext-edit, .RESDialogContents, .wiki-page-content').find('textarea[name=text], textarea[name=description], textarea[name=public_description]')[0];
				if (box === null) {
					console.error('Failed to locate textarea.');
					return;
				}
				var handler = modules['commentTools'].macroCallbackTable[index];
				if (handler === null) {
					console.error('Failed to locate find callback.');
					return;
				}
				handler.call(modules['commentTools'], this, box);

				box.focus();
				//Fire an input event to refresh the preview
				var inputEvent = document.createEvent('HTMLEvents');
				inputEvent.initEvent('input', true, true);
				box.dispatchEvent(inputEvent);
			}).on('click', '.RESMacroDropdownTitle', function(e) {
				var thisCat = e.target;
				if (thisCat.classList.contains('openMacro')) {
					thisCat.classList.remove('openMacro');
				} else {
					$('.RESMacroWrappingSpan span').removeClass('openMacro');
					thisCat.classList.add('openMacro');
				}
				// position the drop down so it's flush with the right of the category button.
				$(this).next().css({
					top: thisCat.offsetTop + thisCat.offsetHeight + 'px',
					left: (thisCat.offsetLeft + thisCat.offsetWidth) - thisCat.nextSibling.offsetWidth + 'px'
				});
			});

			if (this.options.showInputLength.value) {
				$body.on('input', '.usertext-edit textarea, #title-field textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function(e) {
					modules['commentTools'].updateCounter(this);
				});
			}

			if (this.options.keyboardShortcuts.value) {
				$body.on('keydown', '.usertext-edit textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function(e) {
					if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
						if (!modules['commentTools'].autoCompletePop.is(':visible')) {
							// Blur from the editor on escape, so we can return to using the keyboard nav.
							// NOTE: The big editor closes on ESC so this won't be reached in that case.
							$(this).blur();
							e.preventDefault();
						}

						return;
					}

					for (var i = 0; i < modules['commentTools'].macroKeyTable.length; i++) {
						var row = modules['commentTools'].macroKeyTable[i];
						var testedKeyArray = row[0],
							macroIndex = row[1];
						if (RESUtils.checkKeysForEvent(e, testedKeyArray)) {
							var handler = modules['commentTools'].macroCallbackTable[macroIndex];
							handler.call(modules['commentTools'], null, this);

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
				modules['commentTools'].onCtrlEnter(
					'.usertext-edit textarea, #BigEditor textarea, #wiki_page_content',
					function(e) {
						var currentForm = $(e.target).closest('form');
						var saveButton = currentForm.find('.save')[0] || currentForm.find('#wiki_save_button')[0] || $('.BEFoot button')[0];
						RESUtils.click(saveButton);
					}
				);
			}
			if (this.options.ctrlEnterSubmitsPosts.value) {
				modules['commentTools'].onCtrlEnter(
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
				this.addAutoCompletePop();
			}

			//Perform initial setup of tools over the whole page
			modules['commentTools'].attachCommentTools();

			/*
			//These are no longer necessary but I am saving them in case Reddit changes how they make their reply forms.
			// Wireup reply editors
			RESUtils.watchForElement('newCommentsForms', modules['commentTools'].attachCommentTools);
			// Wireup edit editors (usertext-edit already exists in the page)
			RESUtils.watchForElement('newComments', modules['commentTools'].attachCommentTools);
			*/
		}
	},
	migrateData: function() {
		var LATEST_MACRO_DATA_VERSION = '2';
		var macroVersion = RESStorage.getItem('RESmodules.commentTools.macroDataVersion');
		if (macroVersion === null || macroVersion === '0') {
			//In this case it is unmigrated or uncreated
			var previewOptionString = RESStorage.getItem('RESoptions.commentPreview');
			var previewOptions = safeJSON.parse(previewOptionString, 'commentPreview');
			if (previewOptions !== null) {
				if (typeof previewOptions.commentingAs !== 'undefined') {
					this.options.commentingAs.value = previewOptions.commentingAs.value;
					delete previewOptions.commentingAs;
				}
				if (typeof previewOptions.keyboardShortcuts !== 'undefined') {
					this.options.keyboardShortcuts.value = previewOptions.keyboardShortcuts.value;
					delete previewOptions.keyboardShortcuts;
				}
				if (typeof previewOptions.subredditAutocomplete !== 'undefined') {
					this.options.subredditAutocomplete.value = previewOptions.subredditAutocomplete.value;
					delete previewOptions.subredditAutocomplete;
				}
				if (typeof previewOptions.macros !== 'undefined') {
					this.options.macros.value = previewOptions.macros.value;
					this.options.macros.value.forEach(function(macro) {
						while (macro.length < 4) {
							macro.push('');
						}
					});
					delete previewOptions.macros;
				}
				RESUtils.options.saveModuleOptions('commentTools');
				RESUtils.options.saveModuleOptions('commentPreview', previewOptions);
				RESStorage.setItem('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
			} else {
				//No migration will be performed
				RESStorage.setItem('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
			}
		}
		if (macroVersion === '1') {
			this.options.macros.value.forEach(function(macro) {
				while (macro.length < 4) {
					macro.push('');
				}
			});
			RESStorage.setItem('RESmodules.commentTools.macroDataVersion', LATEST_MACRO_DATA_VERSION);
		}
	},
	getCommentTextarea: function(elem) {
		return $(elem || document.body).find('textarea[name][name!=share_to][name!=message]');
	},
	attachCommentTools: function(elem) {
		modules['commentTools'].getCommentTextarea(elem).each(modules['commentTools'].attachEditorToUsertext);
	},
	getFieldLimit: function(elem) {
		switch (elem.name) {
			case 'title':
				return modules['commentTools'].SUBMIT_LIMITS.POST_TITLE;
			case 'text': // https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/829
				if (RESUtils.pageType() === 'submit' || $(elem).closest('.thing').hasClass('self')) {
					return modules['commentTools'].SUBMIT_LIMITS.POST;
				}
				return modules['commentTools'].SUBMIT_LIMITS.COMMENT;
			case 'description':
				return modules['commentTools'].SUBMIT_LIMITS.SIDEBAR;
			case 'public_description':
				return modules['commentTools'].SUBMIT_LIMITS.DESCRIPTION;
			case 'content':
				return modules['commentTools'].SUBMIT_LIMITS.WIKI;
			case 'ban_message':
				return modules['commentTools'].SUBMIT_LIMITS.BAN_MESSAGE;
			//case 'description_conflict_old':
			//case 'public_description_conflict_old':
			default:
				// console.warn('unhandled form', this);
				return;
		}
	},
	attachEditorToUsertext: function() {
		if (this.hasAttribute('data-max-length')) {
			return;
		}
		var limit = modules['commentTools'].getFieldLimit(this);

		this.setAttribute('data-limit', limit);

		if (this.name === 'title') {
			return;
		}

		if (this.id === 'ban_message' && !modules['commentTools'].options.enabledOnBanMessages.value) {
			return;
		}

		if (this.id === 'ban_message') {
			this.style.width = '500px';
			this.style.height = '100px';
		}

		var bar = modules['commentTools'].makeEditBar();
		if (this.id === 'wiki_page_content' || this.id === 'ban_message') {
			$(this).parent().prepend(bar);
		} else {
			$(this).parent().before(bar);
		}
		modules['commentTools'].updateCounter(this);
	},
	updateCounter: function(textarea) {
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
	},
	makeEditBar: function() {
		if (this.cachedEditBar) {
			return $(this.cachedEditBar).clone();
		}

		var editBar = $('<div class="markdownEditor">');
		// Wrap the edit bar in a <div> of its own
		var wrappedEditBar = $('<div class="markdownEditor-wrapper">').append(editBar);

		if (this.options.commentingAs.value && (!modules['usernameHider'].isEnabled())) {
			// show who we're commenting as...
			var commentingAsMessage = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned\/?/i) ? 'Moderating as' : 'Speaking as';

			var commentingAs = $('<div class="commentingAs">').html(commentingAsMessage + ': <span class="commentingAsUser" data-user="'+ RESUtils.loggedInUser() +'">' + RESUtils.loggedInUser() + '</span>');
			if (modules['userTagger'].isEnabled()) {
				modules['userTagger'].applyTagToAuthor(commentingAs.find('.commentingAsUser')[0], true);
			}
			if (this.options.highlightIfAltAccount.value && modules['accountSwitcher'].options.accounts.value.length && typeof RESUtils.loggedInUser() === 'string' && RESUtils.loggedInUser().toLowerCase() !== modules['accountSwitcher'].options.accounts.value[0][0].toLowerCase()) {
				commentingAs.addClass('highlightedAltAccount');
			}
			wrappedEditBar.append(commentingAs);
		}

		if (this.options.formattingToolButtons.value) {
			var shortcuts = this.options.keyboardShortcuts.value;
			editBar.append(this.makeEditButton('<b>Bold</b>', 'bold' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.boldKey.value) + ')' : ''), this.options.boldKey.value, 'btn-bold', function(button, box) {
				this.wrapSelection(box, '**', '**');
			}));
			editBar.append(this.makeEditButton('<i>Italic</i>', 'italic' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.italicKey.value) + ')' : ''), this.options.italicKey.value, 'btn-italic', function(button, box) {
				this.wrapSelection(box, '*', '*');
			}));
			editBar.append(this.makeEditButton('<del>strike</del>', 'strike' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.strikeKey.value) + ')' : ''), this.options.strikeKey.value, 'btn-strike', function(button, box) {
				this.wrapSelection(box, '~~', '~~');
			}));
			editBar.append(this.makeEditButton('<sup>sup</sup>', 'super' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.superKey.value) + ')' : ''), this.options.superKey.value, 'btn-superscript', function(button, box) {
				this.wrapSelectedWords(box, '^');
			}));
			editBar.append(this.makeEditButton('Link', 'link' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.linkKey.value) + ')' : ''), this.options.linkKey.value, 'btn-link', function(button, box) {
				this.linkSelection(box);
			}));
			editBar.append(this.makeEditButton('>Quote', 'quote' + (shortcuts ? ' (' + RESUtils.niceKeyCode(this.options.quoteKey.value) + ')' : ''), this.options.quoteKey.value, 'btn-quote', function(button, box) {
				this.wrapSelectedLines(box, '> ', '');
			}));
			editBar.append(this.makeEditButton('<span style="font-family: monospace">Code</span>', 'code', null, 'btn-code', function(button, box) {
				this.wrapSelectedLines(box, '    ', '');
			}));
			editBar.append(this.makeEditButton('&bull;Bullets', 'bullet list', null, 'btn-list-unordered', function(button, box) {
				this.wrapSelectedLines(box, '* ', '');
			}));
			editBar.append(this.makeEditButton('1.Numbers', 'number list', null, 'btn-list-ordered', function(button, box) {
				this.wrapSelectedLines(box, '1. ', '');
			}));
			editBar.append(this.makeEditButton('<span style="border: 1px black solid;">Table</span>', 'table', null, 'btn-table', function(button, box) {
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

						return prevTable + '<tr><td>' + escapeHTML(currText).replace(/\|/g,'</td><td>') + '</td></tr>';
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
						generatedTableSeparation = generatedTableSeparation.substr(0,generatedTableSeparation.length - 1);
						generatedTable = generatedTable.substr(0, generatedTable.length - 3) + '\n' + generatedTableSeparation + '\n';
						$('#alert_message tr:gt(0)').each(function() {
							$(this).find('td').each(function() {
								generatedTable += $(this).text().replace(/[\n|]/g, '') + ' | ';
							});
							generatedTable = generatedTable.substr(0, generatedTable.length - 3) + '\n';
						});
						if (isTable) {
							modules['commentTools'].replaceSelection(box, generatedTable);
						} else {
							modules['commentTools'].wrapSelection(box, generatedTable,'');
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

		if (modules['commentTools'].options.showInputLength.value) {
			var counter = $('<span class="RESCharCounter" title="character limit: 0/?????">0/?????</span>');
			editBar.prepend(counter); // prepend for more reliable css floating.
			$('.submit-page #title-field .title').prepend($('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>'));
		}

		if (this.options.macroButtons.value) {
			this.buildMacroDropdowns(wrappedEditBar);

			var addMacroButton = modules['commentTools'].makeEditButton(modules['commentTools'].options.macros.addRowText, null, null, 'btn-macro btn-macro-add', function() {
				modules['settingsNavigation'].loadSettingsPage(this.moduleID, 'macros');
				$('.RESMacroWrappingSpan span').removeClass('openMacro');
			});
			modules['commentTools'].addButtonToMacroGroup('', addMacroButton);
		}

		this.cachedEditBar = wrappedEditBar;
		return this.cachedEditBar;
	},
	macroDropDownTable: {},
	getMacroGroup: function(groupName) {
		// Normalize and supply a default group name{}
		groupName = (groupName || '').toString().trim() || 'macros';
		var macroGroup;
		if (groupName in this.macroDropDownTable) {
			macroGroup = this.macroDropDownTable[groupName];
		} else {
			macroGroup = this.macroDropDownTable[groupName] = {};
			macroGroup.titleButton = $('<span class="RESMacroDropdownTitle">' + groupName + '</span>');
			macroGroup.container = $('<span class="RESMacroDropdown"></span>');
			macroGroup.dropdown = $('<ul class="RESMacroDropdownList"></ul>');
			macroGroup.container.append(macroGroup.dropdown);
		}
		return macroGroup;
	},
	addButtonToMacroGroup: function(groupName, button) {
		var group = this.getMacroGroup(groupName);
		group.dropdown.append($('<li>').append(button));
	},
	buildMacroDropdowns: function(editBar) {
		var macros = this.options.macros.value;

		for (var i = 0; i < macros.length; i++) {
			var macro = macros[i];

			// Confound these scoping rules
			(function(title, text, category, key) {
				var button = this.makeEditButton(title, null, key, 'btn-macro', function(button, box) {
					this.macroSelection(box, text, '');
				});
				this.addButtonToMacroGroup(category, button);
			}).apply(this, macro);
		}

		var macroWrapper = $('<span class="RESMacroWrappingSpan">');

		var defaultGroup = this.getMacroGroup('');
		macroWrapper.append(defaultGroup.titleButton);
		macroWrapper.append(defaultGroup.container);

		for (var category in this.macroDropDownTable) {
			if (category === 'macros') {
				continue;
			}
			macroWrapper.append(this.macroDropDownTable[category].titleButton);
			macroWrapper.append(this.macroDropDownTable[category].container);
		}
		editBar.append(macroWrapper);
	},
	makeEditButton: function(label, title, key, cls, handler) {
		if (label === null) {
			label = 'unlabeled';
		}
		if (title === null) {
			title = '';
		}
		var macroButtonIndex = this.macroCallbackTable.length;
		var button = $('<a>').html(RESUtils.sanitizeHTML(label)).attr({
			class: 'edit-btn '+cls,
			title: title,
			href: '#',
			tabindex: 1,
			'data-macro-index': macroButtonIndex
		});

		if (key && key[0] !== null) {
			this.macroKeyTable.push([key, macroButtonIndex]);
		}
		this.macroCallbackTable[macroButtonIndex] = handler;
		return button;
	},
	linkSelection: function(box) {
		var url = prompt('Enter the URL:', '');
		if (url !== null) {
			//escape parens in url
			url = url.replace(/[\(\)]/g, '\\$&');
			this.wrapSelection(box, '[', '](' + url + ')', function(text) {
				//escape brackets and parens in text
				text = text.replace(/[\[\]\(\)]/g, '\\$&');
				return text;
			});
		}
	},
	macroSelection: function(box, macroText) {
		if (!this.options.keepMacroListOpen.value) {
			$('.RESMacroWrappingSpan span').removeClass('openMacro');
		}
		if (modules['commentTools'].options['macroPlaceholders'].value) {
			var formatText = this.fillPlaceholders.bind(this, box, macroText);
			this.wrapSelection(box, '', '', formatText);
		} else {
			this.wrapSelection(box, macroText, '');
		}
	},
	fillPlaceholders: function(box, macroText, selectedText) {
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
				var value = this.getMagicPlaceholderValue(placeholderInnerText, macroText, selectedText, box);
				if (value === undefined) {
					value = this.promptForPlaceholderValue(placeholder, macroText);
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
	},
	getMagicPlaceholderValue: function(placeholder, macroText, selectedText, box) {
		var handler = modules['commentTools'].magicPlaceholders.find(function(current) {
			return current.matches.indexOf(placeholder) !== -1;
		});

		if (handler) {
			return handler.handle(macroText, selectedText, box);
		}
	},
	magicPlaceholders: [
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
		},
		{
			matches: [ 'me', 'my_username' ],
			description: 'Your username, in the form /u/username',
			handle: function(macroText, selectedText, box) {
				var username = RESUtils.loggedInUser();
				if (username) {
					username = '/u/' + username;
					return username;
				}
			}
		},
		{
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
		},
		{
			matches: [ 'url' ],
			description: 'The current page\'s URL, like http://www.reddit.com/r/Enhancement/comments/123abc/example_post',
			handle: function(macroText, selectedText, box) {
				return document.location.href;
			}
		},
		{
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
					return modules['commentTools'].getMagicPlaceholderValue('op', macroText, selectedText, box) ;
				} else {
					return '/u/' + profile.href.match(RESUtils.regexes.profile)[1];
				}
			}
		},
		{
			matches: [ 'selected', 'selection' ],
			description: 'The text which is currently selected (highlighted)',
			handle: function(macroText, selectedText, box) {
				return selectedText;
			}
		},
		{
			matches: [ 'now' ],
			description: 'The current date and time in your locale',
			handle: function(macroText, selectedText, box) {
				var date = new Date();
				return date.toTimeString();
			}
		},
		{
			matches: [ 'today' ],
			description: 'The current date in your locale',
			handle: function(macroText, selectedText, box) {
				var date = new Date();
				return date.toDateString();
			}
		},
		{
			matches: [ 'escaped' ],
			description: 'The selected text, escaped for snudown/markdown. Useful for text emoji like ¯\\_(ツ)_/¯',
			handle: function(macroText, selectedText, box) {
				var escaped = selectedText.replace(/[\[\]()\\\*\^~\-_.]/g, '\\$&');
				return escaped;
			}
		}
	],
	promptForPlaceholderValue: function (placeholder, macroText) {
		// Get value for placeholder
		var display = macroText + '\n\n\n' +
			'Enter replacement for ' + placeholder + ':';
		var value = placeholder;
		value = prompt(display, value);

		return value;
	},
	wrapSelection: function(box, prefix, suffix, escapeFunction) {
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
	},
	replaceSelection: function(box, replacement) {
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
	},
	wrapSelectedLines: function(box, prefix, suffix) {
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
	},
	wrapSelectedWords: function(box, prefix) {
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
			}
			// If nothing is selected, stick the prefix in there and move the cursor to the right side.
			else if (selectedWords[i] === '' && selectedWords.length === 1) {
				selectedWords[i] = prefix + selectedWords[i];
				selectionModify += prefix.length;
				selectionStart += prefix.length;
			}
		}

		box.value = beforeSelection + selectedWords.join(' ') + afterSelection;
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd + selectionModify;
		box.scrollTop = scrollTop;
	},
	lod: function() {
		if (typeof this.firstlod === 'undefined') {
			this.firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #ddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
		}
		$('#RESlod').fadeIn('slow', function() {
			setTimeout(function() {
				$('#RESlod').fadeOut('slow');
			}, 5000);
		});
	},
	KEYS: {
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
	},
	addAutoCompletePop: function() {

		this.autoCompleteCache = {};
		this.autoCompletePop = $('<div id="autocomplete_dropdown" \
			class="drop-choices srdrop inuse" \
			style="display:none;">');
		this.autoCompletePop.on('click mousedown', '.choice', function() {
			modules['commentTools'].autoCompleteHideDropdown();
			modules['commentTools'].autoCompleteInsert(this.innerHTML);
		});
		$('body').append(this.autoCompletePop);

		$('body').on({
			keyup: this.autoCompleteTrigger,
			keydown: this.autoCompleteNavigate,
			blur: this.autoCompleteHideDropdown
		}, '.usertext .usertext-edit textarea, #BigText, #wiki_page_content');
	},
	autoCompleteLastTarget: null,
	autoCompleteTrigger: function(e) {
		var mod = modules['commentTools'];
		var KEYS = mod.KEYS;
		//\0x08 is backspace
		if (/[^A-Za-z0-9 \x08]/.test(String.fromCharCode(e.keyCode))) {
			return true;
		}
		mod.autoCompleteLastTarget = this;
		var matchRE = /\W\/?([ru])\/([\w\.]*)$/;
		var matchSkipRE = /\W\/?([ru])\/([\w\.]*)\ $/;
		var fullText = $(this).val();
		var prefixText = fullText.slice(0, this.selectionStart);
		var match = matchRE.exec(' ' + prefixText);
		if (match !== null) {
			if (match[1] === 'r' && !mod.options.subredditAutocomplete.value) {
				return;
			}
			if (match[1] === 'u' && !mod.options.userAutocomplete.value) {
				return;
			}
		}

		if (match === null || match[2] === '' || match[2].length > 10) {
			if (e.keyCode === KEYS.SPACE || e.keyCode === KEYS.ENTER) {
				match = matchSkipRE.exec(' ' + prefixText);
				if (match) {
					mod.autoCompleteInsert(match[2]);
				}
			}
			return mod.autoCompleteHideDropdown();
		}

		var type = match[1];
		var query = match[2].toLowerCase();
		var queryId = type + '/' + query;
		var cache = mod.autoCompleteCache;
		if (queryId in cache) {
			return mod.autoCompleteUpdateDropdown(cache[queryId]);
		}

		RESUtils.debounce('autoComplete', 300, function() {
			if (type === 'r') {
				mod.getSubredditCompletions(query);
			} else if (type === 'u') {
				mod.getUserCompletions(query);
			}
		});
	},
	getSubredditCompletions: function(query) {
		var mod = modules['commentTools'];
		if (this.options.subredditAutocomplete.value) {
			$.ajax({
				type: 'POST',
				url: '/api/search_reddit_names.json',
				data: {
					query: query,
					app: 'res'
				},
				dataType: 'json',
				success: function(data) {
					mod.autoCompleteCache['r/' + query] = data.names;
					mod.autoCompleteUpdateDropdown(data.names);
					mod.autoCompleteSetNavIndex(0);
				}
			});
		}
	},
	getUserCompletions: function(query) {
		if (this.options.userAutocomplete.value) {
			var tags = JSON.parse(RESStorage.getItem('RESmodules.userTagger.tags'));
			var tagNames = Object.keys(tags);
			var pageNames = Array.prototype.map.call($('.author'), function(e) {
				return e.textContent;
			});
			var names = tagNames.concat(pageNames);
			names = names.filter(function(e, i, a) {
				return e.toLowerCase().indexOf(query) === 0;
			}).sort().reduce(function(prev, current, i, a) {
				//Removing duplicates
				if (prev[prev.length - 1] != current) {
					prev.push(current);
				}
				return prev;
			}, []);

			this.autoCompleteCache['u/' + query] = names;
			this.autoCompleteUpdateDropdown(names);
			this.autoCompleteSetNavIndex(0);
		}
	},
	autoCompleteNavigate: function(e) {
		//Don't mess with shortcuts for fancier cursor movement
		if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return;
		var mod = modules['commentTools'];
		var KEYS = mod.KEYS;
		var entries = mod.autoCompletePop.find('a.choice');
		var index = +mod.autoCompletePop.find('.selectedItem').data('index');
		if (mod.autoCompletePop.is(':visible')) {
			switch (e.keyCode) {
				case KEYS.DOWN:
				case KEYS.RIGHT:
					e.preventDefault();
					if (index < entries.length - 1) index++;
					mod.autoCompleteSetNavIndex(index);
					break;
				case KEYS.UP:
				case KEYS.LEFT:
					e.preventDefault();
					if (index > 0) index--;
					mod.autoCompleteSetNavIndex(index);
					break;
				case KEYS.TAB:
				case KEYS.ENTER:
					e.preventDefault();
					$(entries[index]).click();
					break;
				case KEYS.ESCAPE:
					e.preventDefault();
					mod.autoCompleteHideDropdown();
					return false;
			}
		}
	},
	autoCompleteSetNavIndex: function(index) {
		var entries = modules['commentTools'].autoCompletePop.find('a.choice');
		entries.removeClass('selectedItem');
		entries.eq(index).addClass('selectedItem');
	},
	autoCompleteHideDropdown: function() {
		modules['commentTools'].autoCompletePop.hide();
	},
	autoCompleteUpdateDropdown: function(names) {
		var mod = modules['commentTools'];

		if (!names.length) return mod.autoCompleteHideDropdown();
		mod.autoCompletePop.empty();
		$.each(names.slice(0, 20), function(i, e) {
			mod.autoCompletePop.append('<a class="choice" data-index="' + i + '">' + e + '</a>');
		});

		var textareaOffset = $(mod.autoCompleteLastTarget).offset();
		textareaOffset.left += $(mod.autoCompleteLastTarget).width();
		mod.autoCompletePop.css(textareaOffset).show();

		mod.autoCompleteSetNavIndex(0);

	},
	autoCompleteInsert: function(inputValue) {
		var textarea = modules['commentTools'].autoCompleteLastTarget,
			caretPos = textarea.selectionStart,
			left = textarea.value.substr(0, caretPos),
			right = textarea.value.substr(caretPos);
		left = left.replace(/\/?([ru])\/(\w*)\ ?$/, '/$1/' + inputValue + ' ');
		textarea.value = left + right;
		textarea.selectionStart = textarea.selectionEnd = left.length;
		textarea.focus();
	},
	findTextareaForElement: function(elem) {
		return $(elem)
			.closest('.usertext-edit, .RESDialogContents, .wiki-page-content, .ban-details')
			.find('textarea')
			.filter('#BigText, [name=text], [name=description], [name=public_description], #wiki_page_content, #ban_message')
			.first();
	},
	onCtrlEnter: function(selector, handler) {
		$(document.body).on('keydown', selector, function(e) {
			if (e.keyCode === modules['commentTools'].KEYS.ENTER && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handler(e);
			}
		});
	},
	generateBanMessage: function(message, subreddit, title) {
		if (!message) {
			message = '';
		}

		if (!title) {
			title = '/r/' + subreddit;
		}

		return ['you have been banned from posting to [/r/' + subreddit + ': ' + title + '](/r/' + subreddit + ').',
				'',
				'note from the moderators:',
				'',
				'"' + message + '"'].join('\r\n');
	},
	fetchTitle: function() {
		RESEnvironment.ajax({
			method: 'GET',
			url: location.protocol + '//' + location.hostname + '/r/' + modules['commentTools'].curSubreddit + '/about.json?app=res',
			onload: function(response) {
				var thisResponse;
				try {
					thisResponse = JSON.parse(response.responseText);
				} catch (e) {
					return false;
				}
				if (thisResponse.data && thisResponse.data.submission_type) {
					modules['commentTools'].curSubredditTitle = thisResponse.data.title;
					modules['commentTools'].SUBMIT_LIMITS.BAN_MESSAGE = 10000 - modules['commentTools'].generateBanMessage(null, modules['commentTools'].curSubreddit, modules['commentTools'].curSubredditTitle).length;

					$('textarea[name=ban_message]').each(function() {
						this.setAttribute('data-limit', modules['commentTools'].SUBMIT_LIMITS.BAN_MESSAGE);
						modules['commentTools'].updateCounter(this);
					});
				}
			}
		});
	}
});
