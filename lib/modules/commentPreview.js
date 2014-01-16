modules['commentPreview'] = {
	moduleID: 'commentPreview',
	moduleName: 'Live Comment Preview',
	category: 'Comments',
	options: {
		enableBigEditor: {
			type: 'boolean',
			value: true,
			description: 'Enable the 2 column editor.'
		},
		draftStyle: {
			type: 'boolean',
			value: true,
			description: 'Apply a \'draft\' style  background to the preview to differentiate it from the comment textarea.'
		}
	},
	description: 'Provides a live preview of comments, as well as a two column editor for writing walls of text.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[-\w\.]*\/submit\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.\/]*\/?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/about\/edit/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/create(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/r\/[\-\w\.]+\/wiki\/edit(\/\w+)?/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/submit\/?/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');
			if (modules['commentPreview'].options.draftStyle.value) {
				RESUtils.addCSS('.livePreview, .livePreview .md { background: repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(166,166,166,.07) 40px, rgba(166,166,166,.07) 80px); }');
			}
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = $(document.body).is(".wiki-page");
			if (!this.isWiki) {
				this.converter = window.SnuOwnd.getParser();
			} else {
				//We need to configure non-default renderers here
				var SnuOwnd = window.SnuOwnd;
				var redditCallbacks = SnuOwnd.getRedditCallbacks();
				var rendererConfig = SnuOwnd.defaultRenderState();
				rendererConfig.flags = SnuOwnd.DEFAULT_WIKI_FLAGS;
				rendererConfig.html_element_whitelist = SnuOwnd.DEFAULT_HTML_ELEMENT_WHITELIST;
				rendererConfig.html_attr_whitelist = SnuOwnd.DEFAULT_HTML_ATTR_WHITELIST;
				this.converter = SnuOwnd.getParser({
					callbacks: redditCallbacks,
					context: rendererConfig
				});

				this.tocConverter = SnuOwnd.getParser(SnuOwnd.getTocRenderer());
			}

			this.bigTextTarget = null;
			if (this.options.enableBigEditor.value) {
				// Install the 2 column editor
				modules['commentPreview'].addBigEditor();

				if (modules['keyboardNav'].isEnabled()) {
					$("body").on("keydown", ".usertext-edit textarea, #wiki_page_content", function(e) {
						if (RESUtils.checkKeysForEvent(e, modules["keyboardNav"].options.openBigEditor.value)) {
							modules["commentPreview"].showBigEditor.call(this, e);
						}
					});
				}
			}

			//Close the preview on submit
			$("body").on("submit", "form", function() {
				$(this).find(".livePreview").hide();
			});

			if (!this.isWiki) {
				//Perform initial setup of tools over the whole page}
				this.attachPreview();
				// Wireup reply editors
				RESUtils.watchForElement("newCommentsForms", modules["commentPreview"].attachPreview);
				// Wireup edit editors (usertext-edit already exists in the page)
				RESUtils.watchForElement("newComments", modules["commentPreview"].attachPreview);
			} else {
				this.attachWikiPreview();
			}
		}
	},
	markdownToHTML: function(md) {
		var body = this.converter.render(md);
		if (this.isWiki) {
			/*
			<s>Snudown, and therefore SnuOwnd, is a bit funny about how it generates its table of contents entries.
			To when it encounters a header it tries to perform some of the usual inline formatting such as emphasis, strikethoughs, or superscript in headers. The text containing generated HTML then gets passed into cb_toc_header which escapes all of the passed HTML. When reddit gets it escaped tags are stripped.

			It would be nicer if they just used different functions for rendering the emphasis when making headers.</s>

			It seems that my understanding was wrong, for some reason reddit doesn't even use snudown's TOC renderer.
			*/
			var doc = $('<body>').html(body);
			var header_ids = {};
			var headers = doc.find('h1, h2, h3, h4, h5, h6');
			var tocDiv = $('<div>').addClass('toc');
			var parent = $('<ul>');
			parent.data('level', 0);
			tocDiv.append(parent);
			var level = 0,
				previous = 0;
			var prefix = 'wiki';
			headers.each(function(i, e) {
				var contents = $(this).text();
				var aid = $('<div>').html(contents).text();
				aid = prefix + '_' + aid.replace(/ /g, '_').toLowerCase();
				aid = aid.replace(/[^\w.-]/g, function(s) {
					return '.' + s.charCodeAt(0).toString(16).toUpperCase();
				});
				if (!(aid in header_ids)) {
					header_ids[aid] = 0;
				}
				var id_num = header_ids[aid] + 1;
				header_ids[aid] += 1;

				if (id_num > 1) {
					aid = aid + id_num;
				}

				$(this).attr('id', aid);

				var li = $('<li>').addClass(aid);
				var a = $('<a>').attr('href', '#' + aid).text(contents);
				li.append(a);

				var thisLevel = +this.tagName.slice(-1);
				if (previous && thisLevel > previous) {
					var newUL = $('<ul>');
					newUL.data('level', thisLevel);
					parent.append(newUL);
					parent = newUL;
					level++;
				} else if (level && thisLevel < previous) {
					while (level && parent.data('level') > thisLevel) {
						parent = parent.closest('ul');
						level -= 1;
					}
				}
				previous = thisLevel;
				parent.append(li);
			});
			doc.prepend(tocDiv);
			return doc.html();
		} else {
			return body;
		}
	},
	makeBigEditorButton: function() {
		return $('<button class="RESBigEditorPop" tabIndex="3">big editor</button>');
	},
	attachPreview: function(usertext) {
		if (usertext == null) {
			usertext = document.body;
		}
		if (modules['commentPreview'].options.enableBigEditor.value) {
			modules['commentPreview'].makeBigEditorButton().prependTo($('.bottom-area:not(:has(.RESBigEditorPop))', usertext));
		}
		$(usertext).find(".usertext-edit").each(function() {
			var preview = $(this).find(".livePreview");
			if (preview.length === 0) {
				preview = modules["commentPreview"].makePreviewBox();
				$(this).append(preview);
			}
			var contents = preview.find(".RESDialogContents");
			$(this).find("textarea[name=text], textarea[name=description], textarea[name=public_description]").on("input", function() {
				var textarea = $(this);
				RESUtils.debounce('refreshPreview', 250, function() {
					var markdownText = textarea.val();
					if (markdownText.length > 0) {
						var html = modules["commentPreview"].markdownToHTML(markdownText);
						preview.show();
						contents.html(html);
					} else {
						preview.hide();
						contents.html("");
					}
				});
			});
		});
	},
	attachWikiPreview: function() {
		if (modules['commentPreview'].options.enableBigEditor.value) {
			modules['commentPreview'].makeBigEditorButton().insertAfter($('.pageactions'));
		}
		var preview = modules["commentPreview"].makePreviewBox();
		preview.find(".md").addClass("wiki");
		preview.insertAfter($("#editform > br").first());

		var contents = preview.find(".RESDialogContents");
		$("#wiki_page_content").on("input", function() {

			var textarea = $(this);
			RESUtils.debounce('refreshPreview', 250, function() {
				var markdownText = textarea.val();
				if (markdownText.length > 0) {
					var html = modules["commentPreview"].markdownToHTML(markdownText);
					preview.show();
					contents.html(html);
				} else {
					preview.hide();
					contents.html("");
				}
			});
		});
	},
	makePreviewBox: function() {
		return $("<div style=\"display: none\" class=\"RESDialogSmall livePreview\"><h3>Live Preview</h3><div class=\"md RESDialogContents\"></div></div>");
	},
	addBigEditor: function() {
		var editor = $('<div id="BigEditor">').hide();
		var left = $('<div class="BELeft RESDialogSmall"><h3>Editor</h3></div>');
		var contents = $('<div class="RESDialogContents"><textarea id="BigText" name="text" class=""></textarea></div>');
		var foot = $('<div class="BEFoot">');
		foot.append($('<button style="float:left;">save</button>').on('click', function() {
			var len = $('#BigText').val().length;
			var max = $('#BigText').data("max-length");
			if (len > max) {
				$('#BigEditor .errorList .error').hide().filter('.TOO_LONG').text('this is too long (max: ' + max + ')').show();
			} else if (len === 0) {
				$('#BigEditor .errorList .error').hide().filter('.NO_TEXT').show();
			} else if (modules['commentPreview'].bigTextTarget) {
				modules['commentPreview'].bigTextTarget.submit();
				modules['commentPreview'].bigTextTarget.parents('.usertext-edit:first').find('.livePreview .md').html('');
				modules.commentPreview.hideBigEditor(false, true);
			} else {
				$('#BigEditor .errorList .error').hide().filter('.NO_TARGET').show();
			}

		}));
		foot.append($('<button style="float:left;">close</button>').on('click', modules.commentPreview.hideBigEditor));

		foot.append($('<span class="errorList">\
			<span style="display: none;" class="error NO_TEXT">we need something here</span>\
			<span style="display: none;" class="error TOO_LONG">this is too long (max: 10000)</span>\
			<span style="display: none;" class="error NO_TARGET">there is no associated textarea</span>\
			</span>'));

		contents.append(foot);
		left.append(contents);

		var right = $('<div class="BERight RESDialogSmall"><h3>Preview</h3><div class="RESCloseButton RESFadeButton">&#xf04e;</div><div class="RESCloseButton close">X</div>\
			<div class="RESDialogContents"><div id="BigPreview" class=" md"></div></div></div>');
		editor.append(left).append(right);

		$(document.body).append(editor);

		$('.BERight .RESCloseButton.close').on("click", modules.commentPreview.hideBigEditor);
		$('.BERight .RESFadeButton').on({
			click: function(e) {
				$("#BigEditor").fadeTo(300, 0.3);
				$(document.body).removeClass("RESScrollLock");
				this.isFaded = true;
			},
			mouseout: function(e) {
				if (this.isFaded) {
					$("#BigEditor").fadeTo(300, 1.0);
				}
				$(document.body).addClass("RESScrollLock");
				this.isFaded = false;
			}
		});
		$('body').on('click', '.RESBigEditorPop', modules.commentPreview.showBigEditor);

		$('#BigText').on('input', function() {
			RESUtils.debounce('refreshBigPreview', 250, function() {
				var text = $('#BigText').val();
				var html = modules['commentPreview'].markdownToHTML(text);
				$('#BigPreview').html(html);
				if (modules['commentPreview'].bigTextTarget) {
					modules['commentPreview'].bigTextTarget.val(text);
				}
			});
		}).on("keydown", function(e) {
			//Close big editor on escape
			if (e.keyCode === modules["commentTools"].KEYS.ESCAPE) {
				modules["commentPreview"].hideBigEditor();
				e.preventDefault();
				return false;
			}
		});
		if (modules['commentTools'].isEnabled()) {
			contents.prepend(modules['commentTools'].makeEditBar());
		}
	},
	showBigEditor: function(e) {
		e.preventDefault();
		// modules.commentPreview.bigTextTarget = null;
		modules.commentPreview.hideBigEditor(true);
		$('.side').addClass('BESideHide');
		$('body').addClass('RESScrollLock');
		RESUtils.fadeElementIn(document.getElementById('BigEditor'), 0.3);
		var baseText;
		if (!modules['commentPreview'].isWiki) {
			baseText = $(this).parents('.usertext-edit:first').find('textarea');
			$("#BigPreview").removeClass("wiki");
			$(".BERight .RESDialogContents").removeClass("wiki-page-content");
		} else {
			baseText = $('#wiki_page_content');
			$("#BigPreview").addClass("wiki");
			$(".BERight .RESDialogContents").addClass("wiki-page-content");
		}

		var markdown = baseText.val();
		var maxLength = baseText.data("max-length");
		$("#BigText").data("max-length", maxLength).val(markdown).focus();
		modules['commentTools'].updateCounter($("#BigText")[0]);
		$('#BigPreview').html(modules['commentPreview'].markdownToHTML(markdown));
		modules.commentPreview.bigTextTarget = baseText;
	},
	hideBigEditor: function(quick, submitted) {
		if (quick === true) {
			$('#BigEditor').hide();
		} else {
			RESUtils.fadeElementOut(document.getElementById('BigEditor'), 0.3);
		}
		$('.side').removeClass('BESideHide');
		$('body').removeClass('RESScrollLock');
		var target = modules['commentPreview'].bigTextTarget;

		if (target != null) {
			target.val($('#BigText').val());
			target.focus();
			if (submitted !== true) {
				var inputEvent = document.createEvent("HTMLEvents");
				inputEvent.initEvent("input", true, true);
				target[0].dispatchEvent(inputEvent);
			}
			modules['commentPreview'].bigTextTarget = null;
		}
	},
};
