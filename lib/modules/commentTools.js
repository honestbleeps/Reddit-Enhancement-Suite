modules['commentTools'] = {
	moduleID: 'commentTools',
	moduleName: 'Comment Tools',
	category: 'Comments',
	options: {
		commentingAs: {
			type: 'boolean',
			value: true,
			description: 'Shows your currently logged in username to avoid posting from the wrong account.'
		},
		highlightIfAltAccount: {
			type: 'boolean',
			value: true,
			description: 'Put in bold the "Commenting As" part if you are using an alt account. The first account in the Account Switcher module is considered as your main account.'
		},
		userAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show user autocomplete tool when typing in posts, comments and replies'
		},
		subredditAutocomplete: {
			type: 'boolean',
			value: true,
			description: 'Show subreddit autocomplete tool when typing in posts, comments and replies'
		},
		showInputLength: {
			type: 'boolean',
			value: true,
			description: 'When submitting, display the number of characters entered in the title and text fields and indicate when you go over the 300 character limit for titles.'
		},
		keyboardShortcuts: {
			type: 'boolean',
			value: true,
			description: 'Use keyboard shortcuts to apply styles to selected text'
		},
		macros: {
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
			value: [],
			description: "Add buttons to insert frequently used snippets of text."
		},
		keepMacroListOpen: {
			type: 'boolean',
			value: false,
			description: 'After selecting a macro from the dropdown list, do not hide the list.'
		},
		macroPlaceholders: {
			type: 'boolean',
			value: true,
			description: "When using macro, replace placeholders in text via pop-up prompt.\
			<p>Example macro text:<br>\
			The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!\
			</p>\
			<br><br>Special placeholders:\
			<dl>\
			<dt>{{now}}</dt><dd>The current date and time in your locale</dd>\
			<dt>{{selection}}</dt><dd>The currently selected text in the text area</dd>\
			<dt>{{my_username}}</dt><dd>/u/your_username</dd>\
			<dt>{{subreddit}}</dt><dd>/r/current_subreddit</dd>\
			<dt>{{url}}</dt><dd>URL (web address) for the current page</dd>\
			<dt>{{escaped}}</dt><dd>Escape markdown characters in the selected text; e.g. <code>**</code> becomes <code>\\*\\*</code></dd>\
			</dl>\
			"
		}
	},
	description: 'Provides shortcuts for easier markdown.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'comments',
		'inbox',
		'submit',
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/user\/[-\w\.\/]*\/?/i,
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/edit/i,
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/wiki\/create(\/\w+)?/i,
		/^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/wiki\/edit(\/\w+)?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.markdownEditor-wrapper { max-height: 60px; }');
			RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
			RESUtils.addCSS('.RESMacroWrappingSpan { white-space: normal;  }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
			RESUtils.addCSS('.markdownEditor .RESMacroDropdown {font-size: 10px; }');
			RESUtils.addCSS('.selectedItem { color: #fff; background-color: #5f99cf; }');
			RESUtils.addCSS('.RESMacroDropdownTitle, .RESMacroDropdownTitleOverlay { cursor: pointer; display: inline-block; font-size: 11px; text-decoration: underline; color: gray; padding-left: 2px; padding-right: 21px; background-image: url(//www.redditstatic.com/droparrowgray.gif); background-position: 100% 50%; background-repeat: no-repeat; }');
			RESUtils.addCSS('.RESMacroDropdownTitleOverlay { cursor: pointer; }');
			RESUtils.addCSS('.RESMacroDropdownContainer { display: none; position: absolute; }');
			RESUtils.addCSS('.RESMacroDropdown { display: none; position: absolute; z-index: 2001; }');
			RESUtils.addCSS('.RESMacroDropdownList { margin-top: 0; width: auto; max-width: 300px; }');
			RESUtils.addCSS('.RESMacroDropdownList a, .RESMacroDropdownList li { font-size: 10px; }');
			RESUtils.addCSS('.RESMacroDropdown li { padding-right: 10px; height: 25px; line-height: 24px; }');
			RESUtils.addCSS('.viewSource>.bottom-area:before{ display:none; }');
			RESUtils.addCSS('.viewSource textarea{ background:repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(166,166,166,.05) 40px, rgba(166,166,166,.05) 80px), white; }');
			RESUtils.addCSS('.viewSource textarea[readonly]{ background:repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(166,166,166,.1) 40px, rgba(166,166,166,.1) 80px), white; }');

			RESUtils.addCSS('.markdownEditor .edit-btn:not(.btn-macro) { \
				padding: 0px; \
				width: 32px; \
				height: 20px; \
				display: block; \
				overflow: hidden; \
				text-indent: 50px; \
				position: relative; \
				margin-right: 4px; \
				border: 1px solid #ccc; \
				float: left; \
				background-color: #fff; \
				background-image: url("data:image/png;base64,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"); \
				background-repeat: no-repeat; \
			}');
			RESUtils.addCSS('.RESDropdownList.RESMacroDropdownList { \
				background-color: #fff; \
			}');
			RESUtils.addCSS('.RESDropdownList.RESMacroDropdownList a, .RESDropdownList.RESMacroDropdownList li { \
				color: #000; \
			}');
			RESUtils.addCSS('.RESDropdownList.RESMacroDropdownList a:hover, .RESDropdownList.RESMacroDropdownList li:hover { \
				background-color: #ddd; \
				color: #222; \
			}');
			RESUtils.addCSS('.commentingAs { \
				float: left; \
				margin-top: 10px; \
				margin-bottom: 3px; \
			}');
			RESUtils.addCSS('.RESMacroWrappingSpan { \
				float: right; \
				margin-top: 10px; \
				margin-bottom: 3px; \
			}');
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
			RESUtils.addCSS('.clearfix { \
				clear: both; \
			}');



			RESUtils.addCSS('#alert_message table.commentPreview td{border:1px solid black;padding:1px;min-width:25px;}');
			RESUtils.addCSS('#alert_message table.commentPreview tr:first-child	td{font-weight:bold;}');
			RESUtils.addCSS('#alert_message .buttonContainer { width: 100%; display: block; height: 30px; margin-bottom: 10px; }');
		}
	},
	SUBMIT_LIMITS: {
		STYLESHEET: 128 * 1024,
		SIDEBAR: 5120,
		DESCRIPTION: 500,
		WIKI: 256 * 1024,
		COMMENT: 10000,
		POST: 15000,
		POST_SELFONLY: 40000,
		POST_TITLE: 300
	},
	//Moved this out of go() because the large commentPreview may need it.
	macroCallbackTable: [],
	macroKeyTable: [],
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = $(document.body).is(".wiki-page");
			this.migrateData();

			var $body = $("body");

			$body.on("click", "li.viewSource a", function(e) {
				e.preventDefault();
				modules["commentTools"].viewSource(this);
			}).on("click", ".usertext-edit.viewSource .cancel", function() {
				$(this).parents(".usertext-edit.viewSource").hide();
			}).on("click", "div.markdownEditor-wrapper a", function(e) {
				e.preventDefault();

				var index = $(this).data("macro-index");
				var box = modules["commentTools"].findTextareaForElement(this)[0];
				// var box = $(this).closest(".usertext-edit, .RESDialogContents, .wiki-page-content").find("textarea[name=text], textarea[name=description], textarea[name=public_description]")[0];
				if (box == null) {
					console.error("Failed to locate textarea.");
					return;
				}
				var handler = modules["commentTools"].macroCallbackTable[index];
				if (box == null) {
					console.error("Failed to locate find callback.");
					return;
				}
				handler.call(modules["commentTools"], this, box);

				box.focus();
				//Fire an input event to refresh the preview
				var inputEvent = document.createEvent("HTMLEvents");
				inputEvent.initEvent("input", true, true);
				box.dispatchEvent(inputEvent);
			}).on("click", ".RESMacroDropdownTitle", function(e) {
				var pos = $(this).position();
				var titleHeight = $(this).height();
				$(this).next().css({
					top: (pos.top + titleHeight + 2) + "px",
					left: (pos).left + "px"
				}).show();
				modules['styleTweaks'].setSRStyleToggleVisibility(false, 'commentTools-macroDropdown');
			}).on("mouseleave", ".RESMacroDropdown", function(e) {
				$(this).hide();
				modules['styleTweaks'].setSRStyleToggleVisibility(true, 'commentTools-macroDropdown');
			});

			if (this.options.showInputLength.value) {
				$body.on("input", ".usertext-edit textarea, #title-field textarea, #BigEditor textarea, #wiki_page_content", function(e) {
					modules['commentTools'].updateCounter(this);
				});
			}

			if (this.options.keyboardShortcuts.value) {
				$body.on("keydown", ".usertext-edit textarea, #BigEditor textarea, #wiki_page_content", function(e) {
					if (e.keyCode === modules["commentTools"].KEYS.ESCAPE) {
						if (!modules["commentTools"].autoCompletePop.is(':visible')) {
							// Blur from the editor on escape, so we can return to using the keyboard nav.
							// NOTE: The big editor closes on ESC so this won't be reached in that case.
							$(this).blur();
							e.preventDefault();
						}

						return;
					}

					for (var i = 0; i < modules["commentTools"].macroKeyTable.length; i++) {
						var row = modules["commentTools"].macroKeyTable[i];
						var testedKeyArray = row[0],
							macroIndex = row[1];
						if (RESUtils.checkKeysForEvent(e, testedKeyArray)) {
							var handler = modules["commentTools"].macroCallbackTable[macroIndex];
							handler.call(modules["commentTools"], null, this);

							// Fire an input event to refresh the preview
							var inputEvent = document.createEvent("HTMLEvents");
							inputEvent.initEvent("input", true, true);
							this.dispatchEvent(inputEvent);

							e.preventDefault();
							return;
						}
					}
				});
			}
			if (this.options.subredditAutocomplete.value || this.options.userAutocomplete.value) {
				this.addAutoCompletePop();
			}

			//Perform initial setup of tools over the whole page
			this.attachCommentTools();
			this.attatchViewSourceButtons();
			/*
			//These are no longer necessary but I am saving them in case Reddit changes how they make their reply forms.
			// Wireup reply editors
			RESUtils.watchForElement("newCommentsForms", modules["commentTools"].attachCommentTools);
			// Wireup edit editors (usertext-edit already exists in the page)
			RESUtils.watchForElement("newComments", modules["commentTools"].attachCommentTools);
			*/
			RESUtils.watchForElement("newComments", modules["commentTools"].attatchViewSourceButtons);

			if(RESUtils.pageType() === 'submit' && document.getElementById('sr-autocomplete')) {
				document.getElementById('sr-autocomplete').addEventListener('blur', function() {
					GM_xmlhttpRequest({
						method: "GET",
						url: location.protocol + "//" + location.hostname + "/r/"+this.value+"/about.json",
						onload: function(response) {
							var thisResponse;
							try {
								thisResponse = JSON.parse(response.responseText);
							} catch (e) {
								return false;
							}
							if(thisResponse.data && thisResponse.data.submission_type)
							{
								$("textarea[name=text]").each(function() {
									modules["commentTools"].updateLimit(this, thisResponse.data.submission_type === 'self');
								});
							}
						}
					});
				}, false);
			}
		}
	},
	migrateData: function() {
		var LATEST_MACRO_DATA_VERSION = "2";
		var macroVersion = RESStorage.getItem("RESmodules.commentTools.macroDataVersion");
		if (macroVersion == null || macroVersion === "0") {
			//In this case it is unmigrated or uncreated
			var previewOptionString = RESStorage.getItem("RESoptions.commentPreview");
			var previewOptions = safeJSON.parse(previewOptionString, "commentPreview");
			if (previewOptions != null) {
				if (typeof previewOptions.commentingAs !== "undefined") {
					this.options.commentingAs.value = previewOptions.commentingAs.value;
					delete previewOptions.commentingAs;
				}
				if (typeof previewOptions.keyboardShortcuts !== "undefined") {
					this.options.keyboardShortcuts.value = previewOptions.keyboardShortcuts.value;
					delete previewOptions.keyboardShortcuts;
				}
				if (typeof previewOptions.subredditAutocomplete !== "undefined") {
					this.options.subredditAutocomplete.value = previewOptions.subredditAutocomplete.value;
					delete previewOptions.subredditAutocomplete;
				}
				if (typeof previewOptions.macros !== "undefined") {
					var macros;
					macros = this.options.macros.value = previewOptions.macros.value;
					for (var i = 0; i < macros.length; i++) {
						while (macros[i].length < 4) {
							macros[i].push("");
						}
					}
					delete previewOptions.macros;
				}
				RESStorage.setItem("RESoptions.commentTools", JSON.stringify(this.options));
				RESStorage.setItem("RESoptions.commentPreview", JSON.stringify(previewOptions));
				RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
			} else {
				//No migration will be performed
				RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
			}
		}
		if (macroVersion === "1") {
			var macros = this.options.macros.value;
			for (var i = 0; i < macros.length; i++) {
				while (macros[i].length < 4) {
					macros[i].push("");
				}
			}
			RESStorage.setItem("RESmodules.commentTools.macroDataVersion", LATEST_MACRO_DATA_VERSION);
		}
	},
	attatchViewSourceButtons: function(entry) {
		var entries = entry == null ? $(".entry", document.body) : $(entry);
		if (RESUtils.pageType() === "comments" || RESUtils.pageType() === "inbox") {
			// Disabled synchronous version
			// $(".flat-list.buttons", entries).find("li:nth-child(2), li:only-child").after('<li class="viewSource"><a href="javascript:void(0)">source</a></li>');
			var menus = $(".flat-list.buttons li.first", entries);
			RESUtils.forEachChunked(menus, 30, 500, function(item, i, array) {
				$(item).after('<li class="viewSource"><a class="noCtrlF" href="javascript:void(0)" data-text="source"></a></li>');
			});
		}
	},
	viewSource: function(button) {
		var buttonList = $(button).parent().parent();
		if ($(button).data('source-open')) {
			var sourceDiv = $(button).closest('.thing').find(".usertext-edit.viewSource:first");
			sourceDiv.toggle();
		} else {
			var permaLink = buttonList.find(".first a");
			var jsonURL = permaLink.attr("href");
			var urlSplit = jsonURL.split('/');
			var postID = urlSplit[urlSplit.length - 1];

			var isSelfText = permaLink.is(".comments");
			if (jsonURL.indexOf('?context') !== -1) {
				jsonURL = jsonURL.replace('?context=3', '.json?');
			} else {
				jsonURL += '/.json';
			}
			this.gettingSource = this.gettingSource || {};
			if (this.gettingSource[postID]) {
				return;
			}
			this.gettingSource[postID] = true;

			GM_xmlhttpRequest({
				method: "GET",
				url: jsonURL,
				onload: function(response) {
					var thisResponse = JSON.parse(response.responseText);
					var userTextForm = $('<div class="usertext-edit viewSource"><div><textarea rows="1" cols="1" name="text" readonly></textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div></div>');
					$(userTextForm).find("textarea").bind('dblclick',function() {
						$(this).unbind('dblclick');
						$(this).removeAttr('readonly');
					});
					if (!isSelfText) {
						var sourceText = null;
						if (typeof thisResponse[1] !== 'undefined') {
							sourceText = thisResponse[1].data.children[0].data.body;
						} else {
							var thisData = thisResponse.data.children[0].data;
							if (thisData.id == postID) {
								sourceText = thisData.body;
							} else {
								// The message we want is a reply to a PM/modmail, but reddit returns the whole thread.
								// So, we have to dig into the replies to find the message we want.
								for (var i = 0, len = thisData.replies.data.children.length; i < len; i++) {
									var replyData = thisData.replies.data.children[i].data;
									if (replyData.id == postID) {
										sourceText = replyData.body;
										break;
									}
								}
							}
						}
						// sourceText in this case is reddit markdown. escaping it would screw it up.
						userTextForm.find("textarea[name=text]").html(sourceText);
					} else {
						var sourceText = thisResponse[0].data.children[0].data.selftext;
						//						console.log(sourceText);
						// sourceText in this case is reddit markdown. escaping it would screw it up.
						userTextForm.find("textarea[name=text]").html(sourceText);
					}
					buttonList.before(userTextForm);
					$(button).data('source-open',true);
				}
			});
		}
	},
	attachCommentTools: function(elem) {
		if (elem == null) {
			elem = document.body;
		}
		$(elem).find("textarea[name][name!=share_to][name!=message]").each(modules["commentTools"].attachEditorToUsertext);
	},
	getFieldLimit: function(name) {
		switch (name) {
			case "title":
				return modules['commentTools'].SUBMIT_LIMITS.POST_TITLE;
				break;
			case "text": // https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/829
				if(RESUtils.pageType() === 'submit') {
					if(document.getElementsByClassName('formtab').length) {
						return modules['commentTools'].SUBMIT_LIMITS.POST;
					}
					return modules['commentTools'].SUBMIT_LIMITS.POST_SELFONLY;
				}
				return modules['commentTools'].SUBMIT_LIMITS.COMMENT;
				break;
			case "description":
				return modules['commentTools'].SUBMIT_LIMITS.SIDEBAR;
				break;
			case "public_description":
				return modules['commentTools'].SUBMIT_LIMITS.DESCRIPTION;
				break;
			case "content":
				return modules['commentTools'].SUBMIT_LIMITS.WIKI;
				break;
			case "description_conflict_old":
				return;
			case "public_description_conflict_old":
				return;
			default:
				// console.warn("unhandled form", this);
				return;
		}
	},
	attachEditorToUsertext: function() {
		if (this.hasAttribute("data-max-length")) {
			return;
		}
		var limit = modules['commentTools'].getFieldLimit(this.name);

		this.setAttribute('data-limit', limit);

		if (this.name === "title") {
			return;
		}

		var bar = modules['commentTools'].makeEditBar();
		if (this.id === "wiki_page_content") {
			$(this).parent().prepend(bar);
		} else {
			$(this).parent().before(bar);
		}
		modules['commentTools'].updateCounter(this);
	},
	updateLimit: function(textarea, selfOnly) {
		if (textarea.hasAttribute("data-max-length")) {
			return;
		}
		var limit = selfOnly ? modules['commentTools'].SUBMIT_LIMITS.POST_SELFONLY : modules['commentTools'].SUBMIT_LIMITS.POST;

		textarea.setAttribute('data-limit', limit);
		this.updateCounter(textarea);
	},
	updateCounter: function(textarea) {
		var length = $(textarea).val().length;
		var limit = textarea.getAttribute('data-limit');
		var counter = $(textarea).parent().parent().find(".RESCharCounter");
		counter.attr('title', 'character limit: ' + length + '/' + limit);
		counter.text(length + '/' + limit);
		if (length > limit) {
			counter.addClass('tooLong');
		} else {
			counter.removeClass('tooLong');
		}
	},
	makeEditBar: function() {
		if (this.cachedEditBar != null) {
			return $(this.cachedEditBar).clone();
		}

		var editBar = $('<div class="markdownEditor">');
		// Wrap the edit bar in a <div> of its own
		var wrappedEditBar = $('<div class="markdownEditor-wrapper">').append(editBar);

		if (this.options.commentingAs.value && (!modules['usernameHider'].isEnabled())) {
			// show who we're commenting as...
			var commentingAs = $('<div class="commentingAs">').text('Commenting as: ' + RESUtils.loggedInUser());
			if(this.options.highlightIfAltAccount.value && modules['accountSwitcher'].options.accounts.value.length && RESUtils.loggedInUser().toLowerCase() !== modules['accountSwitcher'].options.accounts.value[0][0].toLowerCase()) {
				commentingAs.addClass('highlightedAltAccount');
			}
			wrappedEditBar.append(commentingAs);
		}

		editBar.append(this.makeEditButton("<b>Bold</b>", "bold (ctrl-b)", [66, false, true, false, false], 'btn-bold', function(button, box) {
			this.wrapSelection(box, "**", "**");
		}));
		editBar.append(this.makeEditButton("<i>Italic</i>", "italic (ctrl-i)", [73, false, true, false, false], 'btn-italic', function(button, box) {
			this.wrapSelection(box, "*", "*");
		}));
		editBar.append(this.makeEditButton("<del>strike</del>", "strike (ctrl-s)", [83, false, true, false, false], 'btn-strike', function(button, box) {
			this.wrapSelection(box, "~~", "~~");
		}));
		editBar.append(this.makeEditButton("<sup>sup</sup>", "super", null, 'btn-superscript', function(button, box) {
			this.wrapSelectedWords(box, "^");
		}));
		editBar.append(this.makeEditButton("Link", "link", null, 'btn-link', function(button, box) {
			this.linkSelection(box);
		}));
		editBar.append(this.makeEditButton(">Quote", "quote", null, 'btn-quote', function(button, box) {
			this.wrapSelectedLines(box, "> ", "");
		}));
		editBar.append(this.makeEditButton("<span style=\"font-family: Courier New\">Code</span>", "code", null, 'btn-code', function(button, box) {
			this.wrapSelectedLines(box, "    ", "");
		}));
		editBar.append(this.makeEditButton("&bull;Bullets", "bullet list", null, 'btn-list-unordered', function(button, box) {
			this.wrapSelectedLines(box, "* ", "");
		}));
		editBar.append(this.makeEditButton("1.Numbers", "number list", null, 'btn-list-ordered', function(button, box) {
			this.wrapSelectedLines(box, "1. ", "");
		}));
		editBar.append(this.makeEditButton('<span style="border:1px solid;">Table</span>', 'table', null, 'btn-table', function(button, box) {
			// First check if the selected text is a table, this also clean the selection
			var selectedText = box.value.substring(box.selectionStart,box.selectionEnd).replace(/^[\s]+/,"").replace(/[\s]+$/,"").split('\n'); // In fact, if the header start by "   |" this is not a table. But it's better to accept it then after editing the table it will work
			if (selectedText.length >= 2) {
				if (selectedText[0].indexOf('|') !== -1) {	// Check if there is at least one "|" to check if it's a table
					selectedText[0] = selectedText[0].replace(/^\|/,"").replace(/\|\s+$/,""); // Avoid "| foo | bar |" instead of "foo | bar"
					var numSeparator = selectedText[0].split('|').length;
					/*
						numSeparator can be 0 for example with :
							foo |
							----|
							bar |
						but it's important to check for each line before removing starting/ending "|" if there is at least one "|" to check if it's really a table
					*/
					var isTable = true;

					// Check the HEADER/BODY separator
					selectedText[1] = selectedText[1].replace(/\|[^|\-]+$/,""); // "-|-|-|ILOVECOOKIE" is correct, so clean it. But "-|-|-ILOVECOOKIE" is not correct if there is 3 column (okay if there is less though, but will not be detected). Also "-      |     -    |   -" is correct and will not be detected.
					selectedText[1] = selectedText[1].replace(/-/g,"--"); // Required to allow -|-|- to work (else the split would give ["", "|-"])
					if (selectedText[1].indexOf('-|') === -1 && selectedText[1].indexOf('|-') === -1) {
						isTable = false;
					}
					selectedText[1] = selectedText[1].replace(/^\]+/,"").replace(/[\s|]+$/,"");
					if (selectedText[1].split('-|-').length < numSeparator) { // Check if there is enough "-|-"
						isTable = false;
					}
					if (/[^|\-]/.test(selectedText[1])) { // If the separator contain an other character than | or -
						isTable = false;
					}

					// Now check the BODY
					if (isTable) {
						for (var i = 2, len = selectedText.length; i<len; i++) {
							if (selectedText[i].indexOf('|') === -1) {
								var isTable = false;
								break;
							}
							selectedText[i] = selectedText[i].replace(/^\|/,"").replace(/[\s|]+$/,"");
							if (selectedText[i].split('|').length !== numSeparator)	{ // Check if there is the same "|" number
								// In fact this should be >= but that would means make disappear some content, so I will consider this is not a table
								// in fact this is useless, because if we omit last cell they will be void. But this would complicate the generation part by managing void cell and the code is enough complicate.
								var isTable = false;
								break;
							}
						}
					}
				}
			}
			if (isTable) {
				// The selected text is a table, now transform it to html !
				var startTable = '<tr><td>' + escapeHTML(selectedText[0]).replace(/\|/g,'</td><td>') + '</td></tr>';
				for(var i = 2, len = selectedText.length; i < len; i++)
				{
					startTable += '<tr><td>' + escapeHTML(selectedText[i]).replace(/\|/g,'</td><td>') + '</td></tr>';
				}
			} else {
				var startTable = '<tr><td>Foo</td><td>Bar</td></tr><tr><td>Foo</td><td>Bar</td></tr>';
			}
			alert(	'<div class="buttonContainer"></div><table class="commentPreview" contenteditable="true">' + startTable + '</table>',
				 function() {
					var generatedTable = '\n\n';
					var generatedTableSeparation = '';
					$('#alert_message tr:first td').each(function(){
						generatedTable += $(this).text().replace(new RegExp('[\n|]','g'),'') + ' | ';
						for(var i = 0, len = $(this).text().replace(new RegExp('[\n|]','g'),'').length; i<len; i++) {
							generatedTableSeparation += '-';
						}
						generatedTableSeparation += '|';
					});
					generatedTableSeparation = generatedTableSeparation.substr(0,generatedTableSeparation.length - 1);
					generatedTable = generatedTable.substr(0,generatedTable.length - 3) + '\n' + generatedTableSeparation + '\n';
					$('#alert_message tr:gt(0)').each(function(){
						$(this).find('td').each(function(){
							generatedTable += $(this).text().replace(new RegExp('[\n|]','g'),'') + ' | ';
						});
						generatedTable = generatedTable.substr(0,generatedTable.length - 3) + '\n';
					});
					if(isTable) {
						modules['commentTools'].replaceSelection(box, generatedTable);
					} else {
						modules['commentTools'].wrapSelection(box, generatedTable,'');
					}
					$(box).trigger('input'); // update preview
				});

			var addRow = gdAlert.makeButton("+ Row");
			var remRow = gdAlert.makeButton("- Row");
			var addCol = gdAlert.makeButton("+ Col");
			var remCol = gdAlert.makeButton("- Col");
			addRow.addEventListener('click', function() {
				var nbCol = $('#alert_message tr:first td').length;
				for(var i = 0, newRow = ''; i<nbCol; i++) {
					newRow += '<td>text</td>';
				}
				$('#alert_message table').append('<tr>' + newRow + '</tr>');
			}, false);
			remRow.addEventListener('click', function() {
				if($('#alert_message tr').length > 1)
				{
					$('#alert_message table tr:last').remove();
				}
			}, false);
			addCol.addEventListener('click', function() {
				$('#alert_message table tr').append('<td>text</td>');
			}, false);
			remCol.addEventListener('click', function() {
				if($('#alert_message tr:first td').length > 1)
				{
					$('#alert_message table tr td:last-of-type').remove();
				}
			}, false);

			var $buttonContainer = $('#alert_message .buttonContainer');
			$buttonContainer.append(addRow);
			$buttonContainer.append(remRow);
			$buttonContainer.append(addCol);
			$buttonContainer.append(remCol);
		}));

		if (modules["commentTools"].options.showInputLength.value) {
			var counter = $('<span class="RESCharCounter" title="character limit: 0/?????">0/?????</span>');
			editBar.append(counter);
			$('.submit-page #title-field .title').append($('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>'));
		}

		this.addButtonToMacroGroup("", this.makeEditButton("reddiquette", "", null, 'btn-macro btn-rediquette', function(button, box) {
			this.macroSelection(box, "[reddiquette](http://www.reddit.com/wiki/reddiquette) ", "");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("[Promote]", "", null, 'btn-macro btn-promote', function(button, box) {
			var $button = $(button),
				clickCount = $button.data("clickCount") || 0;
			clickCount++;
			$button.data("clickCount", clickCount);
			if (clickCount > 2) {
				$button.parent().hide();
				modules["commentTools"].lod();
			}
			this.macroSelection(box, "[Reddit Enhancement Suite](http://redditenhancementsuite.com/) ");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("&#3232;\_&#3232;", "Look of disaproval", null, 'btn-macro btn-lod', function(button, box) {
			this.macroSelection(box, "&#3232;\_&#3232;");
		}));

		this.addButtonToMacroGroup("", this.makeEditButton("Current timestamp", "", null, 'btn-macro btn-current-timestamp', function(button, box) {
			var currentDate = new Date();
			this.macroSelection(box, currentDate.toTimeString());
		}));

		this.buildMacroDropdowns(wrappedEditBar);
		wrappedEditBar.append('<div class="clearfix">');

		var addMacroButton = modules['commentTools'].makeEditButton(modules['commentTools'].options.macros.addRowText, null, null, 'btn-macro btn-macro-add', function() {
			modules['settingsNavigation'].loadSettingsPage(this.moduleID, 'macros');
			$('.RESMacroDropdown').fadeOut(100);
		});
		modules['commentTools'].addButtonToMacroGroup('', addMacroButton);

		this.cachedEditBar = wrappedEditBar;
		return this.cachedEditBar;
	},
	macroDropDownTable: {},
	getMacroGroup: function(groupName) {
		// Normalize and supply a default group name{}
		groupName = (groupName || "").toString().trim() || "macros";
		var macroGroup;
		if (groupName in this.macroDropDownTable) {
			macroGroup = this.macroDropDownTable[groupName];
		} else {
			macroGroup = this.macroDropDownTable[groupName] = {};
			macroGroup.titleButton = $('<span class="RESMacroDropdownTitle">' + groupName + '</span>');
			macroGroup.container = $('<span class="RESMacroDropdown"></span>').hide();
			macroGroup.dropdown = $('<ul class="RESMacroDropdownList RESDropdownList"></ul>');
			macroGroup.container.append(macroGroup.dropdown);
		}
		return macroGroup;
	},
	addButtonToMacroGroup: function(groupName, button) {
		var group = this.getMacroGroup(groupName);
		group.dropdown.append($("<li>").append(button));
	},
	buildMacroDropdowns: function(editBar) {
		var macros = this.options.macros.value;

		for (var i = 0; i < macros.length; i++) {
			var macro = macros[i];

			//Confound these scoping rules
			(function(title, text, category, key) {
				var button = this.makeEditButton(title, null, key, 'btn-macro', function(button, box) {
					this.macroSelection(box, text, "");
				});
				this.addButtonToMacroGroup(category, button);
			}).apply(this, macro);
		}

		var macroWrapper = $('<span class="RESMacroWrappingSpan">');
		if ("macros" in this.macroDropDownTable) {
			macroWrapper.append(this.macroDropDownTable["macros"].titleButton);
			macroWrapper.append(this.macroDropDownTable["macros"].container);
		}
		for (var category in this.macroDropDownTable) {
			if (category === "macros") {
				continue;
			}
			macroWrapper.append(this.macroDropDownTable[category].titleButton);
			macroWrapper.append(this.macroDropDownTable[category].container);
		}
		editBar.append(macroWrapper);
	},
	makeEditButton: function(label, title, key, cls, handler) {
		if (label == null) {
			label = "unlabeled";
		}
		if (title == null) {
			title = "";
		}
		var macroButtonIndex = this.macroCallbackTable.length;
		var button = $("<a>").html(label).attr({
			class: 'edit-btn '+cls,
			title: title,
			href: "javascript:void(0)",
			tabindex: 1,
			"data-macro-index": macroButtonIndex
		});

		if (key != null && key[0] != null) {
			this.macroKeyTable.push([key, macroButtonIndex]);
		}
		this.macroCallbackTable[macroButtonIndex] = handler;
		return button;
	},
	linkSelection: function(box) {
		var url = prompt("Enter the URL:", "");
		if (url != null) {
			//escape parens in url
			url = url.replace(/\(/, "\\(");
			url = url.replace(/\)/, "\\)");
			this.wrapSelection(box, "[", "](" + url + ")", function(text) {
				//escape brackets and parens in text
				text = text.replace(/\[/, "\\[");
				text = text.replace(/\]/, "\\]");
				text = text.replace(/\(/, "\\(");
				text = text.replace(/\)/, "\\)");
				return text;
			});
		}
	},
	macroSelection: function(box, macroText) {
		if (!this.options.keepMacroListOpen.value) {
			$('.RESMacroDropdown').fadeOut(100);
		}
		if (modules['commentTools'].options['macroPlaceholders'].value) {
			var formatText = this.fillPlaceholders.bind(this, box, macroText);
			this.wrapSelection(box, "", "", formatText);
		} else {
			this.wrapSelection(box, macroText, "");
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

				var value = this.getMagicPlaceholderValue(placeholder, macroText, selectedText, box);
				if (value === void 0) {
					value = this.promptForPlaceholderValue(placeholder, macroText);
				}

				if (value == null) {
					// user cancelled
					break;
				}

				// Replace placeholder with value
				macroText = macroText.replace(new RegExp(placeholder, "g"), value);
			}
		}


		return macroText;
	},
	getMagicPlaceholderValue: function (placeholder, macroText, selectedText, box) {
		var sanitized = placeholder.substring(2, placeholder.length - 2).toLowerCase();
		switch (sanitized) {
			case "subreddit":
				var subreddit = RESUtils.currentSubreddit();
				if (subreddit) {
					subreddit = '/r/' + subreddit;
					return subreddit;
				}
				break;
			case "my_username":
				var username = RESUtils.loggedInUser();
				if (username) {
					username = '/u/' + username;
					return username;
				}
				break;
			case "op":
			case "op_username":
				var username = null;
				if (username) {
					username = '/u/' + username;
					return username;
				}
				break;
			case "url":
				return document.location.href;
				break;
			case "recipient":
			case "reply_to_user":
				// TODO
				break;
			case "selected":
			case "selection":
				return selectedText;
				break;
			case "now":
				var date = new Date();
				return date.toTimeString();
				break;
			case "today":
				var date = new Date();
				return date.toDateString();
				break;
			case "escaped":
				var escaped = selectedText.replace(/[\[\]()\\\*^~\-_.]/g, '\\$&');
				return escaped;
				break;
		}
	},
	promptForPlaceholderValue: function (placeholder, macroText) {
		var value;
		// Get value for placeholder
		var display = macroText
			+ "\n\n\n"
			+ "Enter replacement for " + placeholder + ":"
			;
		var value = placeholder;
		value = prompt(display, value);

		return value;
	},
	wrapSelection: function(box, prefix, suffix, escapeFunction) {
		if (box == null) {
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
		var trailingSpace = "";
		var cursor = selectedText.length - 1;
		while (cursor > 0 && selectedText[cursor] === " ") {
			trailingSpace += " ";
			cursor--;
		}
		selectedText = selectedText.substring(0, cursor + 1);

		if (escapeFunction != null) {
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
		if (box == null) {
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
		var lines = text.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var lineStart = startPosition;
			var lineEnd = lineStart + lines[i].length;
			//Check if either end of the line is within the selection
			if (selectionStart <= lineStart && lineStart <= selectionEnd || selectionStart <= lineEnd && lineEnd <= selectionEnd
				//Check if either end of the selection is within the line
				|| lineStart <= selectionStart && selectionStart <= lineEnd || lineStart <= selectionEnd && selectionEnd <= lineEnd) {
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

		box.value = lines.join("\n");
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
		var selectedWords = text.substring(selectionStart, selectionEnd).split(" ");
		var afterSelection = text.substring(selectionEnd);

		var selectionModify = 0;

		for (i = 0; i < selectedWords.length; i++) {
			if (selectedWords[i] !== "") {
				if (selectedWords[i].indexOf("\n") !== -1) {
					newLinePosition = selectedWords[i].lastIndexOf("\n") + 1;
					selectedWords[i] = selectedWords[i].substring(0, newLinePosition) + prefix + selectedWords[i].substring(newLinePosition);
					selectionModify += prefix.length;
				}
				if (selectedWords[i].charAt(0) !== "\n") {
					selectedWords[i] = prefix + selectedWords[i];
				}
				selectionModify += prefix.length;
			}
			// If nothing is selected, stick the prefix in there and move the cursor to the right side.
			else if (selectedWords[i] === "" && selectedWords.length === 1) {
				selectedWords[i] = prefix + selectedWords[i];
				selectionModify += prefix.length;
				selectionStart += prefix.length;
			}
		}

		box.value = beforeSelection + selectedWords.join(" ") + afterSelection;
		box.selectionStart = selectionStart;
		box.selectionEnd = selectionEnd + selectionModify;
		box.scrollTop = scrollTop;
	},
	lod: function() {
		if (typeof this.firstlod === 'undefined') {
			this.firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #ddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;\_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
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
		this.autoCompletePop.on("click mousedown", ".choice", function() {
			modules["commentTools"].autoCompleteHideDropdown();
			modules["commentTools"].autoCompleteInsert(this.innerHTML);
		});
		$("body").append(this.autoCompletePop);

		$("body").on({
			keyup: this.autoCompleteTrigger,
			keydown: this.autoCompleteNavigate,
			blur: this.autoCompleteHideDropdown
		}, ".usertext .usertext-edit textarea, #BigText, #wiki_page_content");
	},
	autoCompleteLastTarget: null,
	autoCompleteTrigger: function(e) {
		var mod = modules["commentTools"];
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
		var match = matchRE.exec(" " + prefixText);
		if (match != null) {
			if (match[1] === "r" && mod.options.subredditAutocomplete.value == false) {
				return;
			}
			if (match[1] === "u" && mod.options.userAutocomplete.value == false) {
				return;
			}
		}

		if (match == null || match[2] === "" || match[2].length > 10) {
			if (e.keyCode === KEYS.SPACE || e.keyCode === KEYS.ENTER) {
				var match = matchSkipRE.exec(" " + prefixText);
				if (match) {
					mod.autoCompleteInsert(match[2]);
				}
			}
			return mod.autoCompleteHideDropdown();
		}

		var type = match[1];
		var query = match[2].toLowerCase();
		var queryId = type + "/" + query;
		var cache = mod.autoCompleteCache;
		if (queryId in cache) {
			return mod.autoCompleteUpdateDropdown(cache[queryId]);
		}

		RESUtils.debounce("autoComplete", 300, function() {
			if (type === "r") {
				mod.getSubredditCompletions(query);
			} else if (type === "u") {
				mod.getUserCompletions(query);
			}
		});
	},
	getSubredditCompletions: function(query) {
		var mod = modules['commentTools'];
		if (this.options.subredditAutocomplete.value) {
			$.ajax({
				type: "POST",
				url: "/api/search_reddit_names.json",
				data: {
					query: query,
					app: "res"
				},
				dataType: "json",
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
			var tags = JSON.parse(RESStorage.getItem("RESmodules.userTagger.tags"));
			var tagNames = Object.keys(tags);
			var pageNames = [].map.call($(".author"), function(e) {
				return e.innerHTML;
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
		var mod = modules["commentTools"];
		var KEYS = mod.KEYS;
		var entries = mod.autoCompletePop.find("a.choice");
		var index = +mod.autoCompletePop.find(".selectedItem").data("index");
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
					break;
			}
		}
	},
	autoCompleteSetNavIndex: function(index) {
		var entries = modules["commentTools"].autoCompletePop.find("a.choice");
		entries.removeClass("selectedItem");
		entries.eq(index).addClass("selectedItem");
	},
	autoCompleteHideDropdown: function() {
		modules["commentTools"].autoCompletePop.hide();
	},
	autoCompleteUpdateDropdown: function(names) {
		var mod = modules["commentTools"];

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
		var textarea = modules["commentTools"].autoCompleteLastTarget,
			caretPos = textarea.selectionStart,
			left = textarea.value.substr(0, caretPos),
			right = textarea.value.substr(caretPos);
		left = left.replace(/\/?([ru])\/(\w*)\ ?$/, '/$1/' + inputValue + ' ');
		textarea.value = left + right;
		textarea.selectionStart = textarea.selectionEnd = left.length;
		textarea.focus()
	},
	findTextareaForElement: function(elem) {
		return $(elem)
			.closest(".usertext-edit, .RESDialogContents, .wiki-page-content")
			.find("textarea")
			.filter("#BigText, [name=text], [name=description], [name=public_description], #wiki_page_content")
			.first();
	}
};
