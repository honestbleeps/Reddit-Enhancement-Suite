addModule('commentPreview', {
	moduleID: 'commentPreview',
	moduleName: 'Live Preview',
	category: [ 'Comments', 'Submissions' ],
	options: {
		enableBigEditor: {
			type: 'boolean',
			value: true,
			description: 'Enable the 2 column editor.'
		},
		openBigEditor: {
			type: 'keycode',
			value: [69, false, true, false], // control-e
			description: 'Open the current markdown field in the big editor. (Only when a markdown form is focused)'
		},
		draftStyle: {
			type: 'boolean',
			value: true,
			description: 'Apply a \'draft\' style  background to the preview to differentiate it from the comment textarea.',
			advanced: true
		},
		enableForComments: {
			type: 'boolean',
			value: true,
			description: 'Show preview for comments',
			advanced: true
		},
		enableForPosts: {
			type: 'boolean',
			value: true,
			description: 'Show preview for posts',
			advanced: true
		},
		enableForWiki: {
			type: 'boolean',
			value: true,
			description: 'Show preview for wiki pages',
			advanced: true
		},
		enableForSubredditConfig: {
			type: 'boolean',
			value: true,
			description: 'Show preview for editing subreddit settings',
			advanced: true
		},
		enableForBanMessages: {
			type: 'boolean',
			value: true,
			description: 'Show preview for ban notes',
			advanced: true
		},
		sidebarPreview: {
			type: 'boolean',
			value: true,
			description: 'Show the markdown live preview directly in the sidebar when editing',
			advanced: true
		}
	},
	description: 'Provides a live preview while editing comments, text submissions, messages, wiki pages, and other markdown text areas; as well as a two column editor for writing walls of text.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'comments',
		'inbox',
		'submit',
		'profile',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:edit|modqueue|reports|spam|banned)/i,
		'wiki'
	],
	exclude: [
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?wiki\/edit\/config\/automoderator\b/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview > h3 { font-weight: bold; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .gearIcon { float: right; margin-right: 1em; }');
			RESUtils.addCSS('.ban-details .RESDialogSmall.livePreview { width: 505px; }');
			RESUtils.addCSS('.ban-details { position: relative; }');
			RESUtils.addCSS('#banned .RESBigEditorPop { float: none; left: 414px; bottom: -45px; position: absolute; }');
			if (modules['commentPreview'].options.draftStyle.value) {
				RESUtils.addCSS('.livePreview { background: repeating-linear-gradient(-225deg, transparent, transparent 40px, rgba(166,166,166,.07) 40px, rgba(166,166,166,.07) 80px); }');
			}

		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.isWiki = RESUtils.pageType() === 'wiki';
			this.isBan = /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned/i.test(document.location.href);

			if (!this.isWiki) {
				this.converter = window.SnuOwnd.getParser();
			} else {
				this.subredditImages = {};
				RESEnvironment.ajax({
					method: 'GET',
					url: location.protocol + '//' + location.hostname + '/r/' + RESUtils.currentSubreddit() + '/about/stylesheet.json',
					onload: function(response) {
						var thisResponse;
						try {
							thisResponse = JSON.parse(response.responseText);
						} catch (e) {
							console.log('commentPreview: Error parsing response from reddit');
							console.log(response.responseText);
							return false;
						}
						if (thisResponse.data && thisResponse.data.images) {
							thisResponse.data.images.forEach(function(image) {
								modules['commentPreview'].subredditImages[image.name] = image.url;
							});
						}
					}
				});
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
				modules['commentPreview'].addBigEditorListener();

				if (modules['keyboardNav'].isEnabled()) {
					$('body').on('keydown', '.usertext-edit textarea, #wiki_page_content', function(e) {
						if (RESUtils.checkKeysForEvent(e, modules['commentPreview'].options.openBigEditor.value)) {
							modules['commentPreview'].showBigEditor.call(this, e);
						}
					});
				}
			}

			//Close the preview on submit
			$('body').on('submit', 'form', function() {
				$(this).find('.livePreview').hide();
			});

			if (!this.isWiki) {
				//Perform initial setup of tools over the whole page}
				this.attachPreview();
				// Wireup reply editors
				RESUtils.watchForElement('newCommentsForms', modules['commentPreview'].attachPreview);
				// Wireup edit editors (usertext-edit already exists in the page)
				RESUtils.watchForElement('newComments', modules['commentPreview'].attachPreview);
			} else {
				this.attachWikiPreview();
			}
		}
	},
	markdownToHTML: function(md) {
		if (this.isBan && md.length) {
			var subreddit = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/([\-\w\.]+)/i)[1];

			md = modules['commentTools'].generateBanMessage(md, subreddit, modules['commentTools'].curSubredditTitle);
		}

		var body = this.converter.render(md);
		if (this.isWiki) {
			/*
			<s>Snudown, and therefore SnuOwnd, is a bit funny about how it generates its table of contents entries.
			To when it encounters a header it tries to perform some of the usual inline formatting such as emphasis, strikethoughs, or superscript in headers. The text containing generated HTML then gets passed into cb_toc_header which escapes all of the passed HTML. When reddit gets it escaped tags are stripped.

			It would be nicer if they just used different functions for rendering the emphasis when making headers.</s>

			It seems that my understanding was wrong, for some reason reddit doesn't even use snudown's TOC renderer.
			*/

			body = body.replace(/<img src="%%([a-z0-9\-]+)%%"/gi, function(match, name) {
				if (modules['commentPreview'].subredditImages[name]) {
					return '<img src="' + modules['commentPreview'].subredditImages[name] + '"';
				}
				return match;
			});

			// SnuOwnd created this HTML from markdown so it is safe.
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
				aid = aid.replace(/[^\w\.\-]/g, function(s) {
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
		return $('<button type="button" class="RESBigEditorPop" tabIndex="3"><span class="res-icon res-icon-12">&#xF0A4;</span> big editor</button>');
	},
	attachPreview: function(usertext) {
		if (usertext === undefined || usertext === null) {
			usertext = document.body;
		}
		if (modules['commentPreview'].options.enableBigEditor.value) {
			if (this.isBan) {
				modules['commentPreview'].makeBigEditorButton().appendTo('#banned .ban-details:has(textarea)');
			} else {
				modules['commentPreview'].makeBigEditorButton().prependTo($('.bottom-area:not(:has(.RESBigEditorPop))', usertext));
			}
		}
		$(usertext).find('.usertext-edit, .ban-details:has(#ban_message)').each(function() {
			var $this = $(this);

			if ($this.closest('.commentarea, .message').length &&
					!modules['commentPreview'].options.enableForComments.value) {
				return;
			}

			if ((RESUtils.pageType() === 'submit' || $(this).closest('.link').length) &&
					!modules['commentPreview'].options.enableForPosts.value) {
				return;
			}

			if (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/edit/i.test(document.location.href) &&
					!modules['commentPreview'].options.enableForSubredditConfig.value) {
				return;
			}

			if (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned/i.test(document.location.href) &&
					!modules['commentPreview'].options.enableForBanMessages.value) {
				return;
			}

			var preview = $this.find('.livePreview');

			if (preview.length === 0) {
				preview = modules['commentPreview'].makePreviewBox();
				$this.append(preview);
			}

			var contents = preview.find('.RESDialogContents');
			var textareas = $this.find('textarea[name=text], textarea[name=description], textarea[name=public_description], textarea[name=ban_message]');

			if (textareas.attr('name') === 'description' && modules['commentPreview'].options.sidebarPreview.value) {
				var sideMd = $('.side .usertext-body .md:first');

				if (sideMd.length) {
					contents.push(sideMd[0]);
				}
			}

			textareas.on('input', modules['commentPreview'].onTextareaInput.bind(this, preview, contents));

			// check for reply --> quoted text
			$this.closest('.thing').find('.buttons a[onclick*="reply"]') /* terrible selector */
				.on('click', textareas.trigger.bind(textareas, 'input'));
			setTimeout(textareas.trigger.bind(textareas, 'input'), 1);
		});
	},
	attachWikiPreview: function() {
		if (modules['commentPreview'].options.enableBigEditor.value) {
			modules['commentPreview'].makeBigEditorButton().insertAfter('.markhelp');
		}

		if (RESUtils.pageType() === 'wiki' && modules['commentPreview'].options.enableForWiki.value) {
			var preview = modules['commentPreview'].makePreviewBox();
			preview.find('.md').addClass('wiki');
			preview.insertAfter($('#editform > br').first());

			var contents = preview.find('.RESDialogContents');
			$('#wiki_page_content').on('input', modules['commentPreview'].onTextareaInput.bind(this, preview, contents));
		}
	},
	onTextareaInput: function(preview, contents, event) {
		var textarea = $(event.target);
		RESUtils.debounce('refreshPreview', 250, function() {
			var markdownText = textarea.val();

			if (markdownText.length > 0) {
				var html = modules['commentPreview'].markdownToHTML(markdownText);
				preview.show();
				// SnuOwnd created this HTML from markdown so it is safe.
				contents.html(html);
			} else {
				preview.hide();
				contents.html('');
			}
		});
	},
	makePreviewBox: function() {
		var previewBox = $('<div style="display: none" class="RESDialogSmall livePreview"><h3>Live Preview</h3><div class="md RESDialogContents"></div></div>');
		var urlHashLink = modules['settingsNavigation'].makeUrlHashLink('commentPreview', null, ' ', 'gearIcon');
		previewBox.find('h3').append(urlHashLink);

		return previewBox;
	},
	createBigEditor: function() {
		if (modules['commentPreview'].bigEditor) {
			return;
		}
		var editor = $('<div id="BigEditor" style="display: none;">');
		var left = $('<div class="BELeft RESDialogSmall"><h3>Editor</h3></div>');
		var contents = $('<div class="RESDialogContents"><textarea id="BigText" name="text" class=""></textarea></div>');
		var foot = $('<div class="BEFoot">');
		if (!this.isBan) {
			foot.append($('<button type="button">save</button>').on('click', function() {
				var len = $('#BigText').val().length;
				var max = $('#BigText').data('max-length');
				if (len > max) {
					$('#BigEditor .errorList .error').hide().filter('.TOO_LONG').text('this is too long (max: ' + max + ')').show();
				} else if (len === 0) {
					$('#BigEditor .errorList .error').hide().filter('.NO_TEXT').show();
				} else if (modules['commentPreview'].bigTextTarget) {
					modules['commentPreview'].bigTextTarget.closest('form').find('button[type=submit]').click();
					modules['commentPreview'].bigTextTarget.parents('.usertext-edit:first').find('.livePreview .md').html('');
					modules.commentPreview.hideBigEditor(false, true);
				} else {
					$('#BigEditor .errorList .error').hide().filter('.NO_TARGET').show();
				}
			}));
		}
		foot.append($('<button type="button">close</button>').on('click', modules.commentPreview.hideBigEditor));

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
		if (modules['commentTools'].isEnabled()) {
			contents.prepend(modules['commentTools'].makeEditBar());
		}

		$(document.body).append(editor);

		$('.BERight .RESCloseButton.close').on('click', modules.commentPreview.hideBigEditor);
		$('.BERight .RESFadeButton').on('click', function(e) {
			if (this.isFaded) {
				$('#BigEditor').fadeTo(300, 1.0).css('pointer-events','auto');
				$(document.body).addClass('RESScrollLock');
			}
			else {
				$('#BigEditor').fadeTo(300, 0.3).css('pointer-events','none');
				$(document.body).removeClass('RESScrollLock');
			}
			this.isFaded = !this.isFaded;
		});

		$('#BigText').on('input', function() {
			RESUtils.debounce('refreshBigPreview', 250, function() {
				var text = $('#BigText').val();
				var html = modules['commentPreview'].markdownToHTML(text);

				// SnuOwnd created this HTML from markdown so it is safe.
				$('#BigPreview').html(html);
				if (modules['commentPreview'].bigTextTarget) {
					modules['commentPreview'].bigTextTarget.val(text);
				}
			});
		}).on('keydown', function(e) {
			//Close big editor on escape
			if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
				modules['commentPreview'].hideBigEditor();
				e.preventDefault();
				return false;
			}
		});

		modules['commentPreview'].bigEditor = editor;
	},
	addBigEditorListener: function() {
		$('body').on('click', '.RESBigEditorPop', modules.commentPreview.showBigEditor);
	},
	showBigEditor: function(e) {
		var limit, baseText;

		e.preventDefault();
		modules['commentPreview'].createBigEditor();
		// modules.commentPreview.bigTextTarget = null;
		modules.commentPreview.hideBigEditor(true);
		$('.side').addClass('BESideHide');
		$('body').addClass('RESScrollLock');
		RESUtils.fadeElementIn(document.getElementById('BigEditor'), 0.3);
		if (!modules['commentPreview'].isWiki && !modules['commentPreview'].isBan) {
			baseText = $(this).parents('.usertext-edit:first').find('textarea');

			limit = $(baseText).attr('data-limit');
			$('#BigText').attr('data-limit', limit);
			$('#BigPreview').removeClass('wiki');
			$('.BERight .RESDialogContents').removeClass('wiki-page-content');
		} else if (modules['commentPreview'].isBan) {
			baseText = $('#ban_message');

			limit = $(baseText).attr('data-limit');
			$('#BigText').attr('data-limit', limit);
			$('#BigPreview').removeClass('wiki');
			$('.BERight .RESDialogContents').removeClass('wiki-page-content');
		} else {
			baseText = $('#wiki_page_content');
			$('#BigPreview').addClass('wiki');
			$('.BERight .RESDialogContents').addClass('wiki-page-content');
		}

		var markdown = baseText.val();
		var maxLength = baseText.data('max-length');
		$('#BigText').data('max-length', maxLength).val(markdown).focus();
		modules['commentTools'].updateCounter($('#BigText')[0]);
		// SnuOwnd created this HTML from markdown so it is safe.
		$('#BigPreview').html(modules['commentPreview'].markdownToHTML(markdown));
		modules.commentPreview.bigTextTarget = baseText;

		// dynamically set paddingBottom on .RESDialogContents to make textarea scale correctly.
		var dialogTitle = document.querySelector('.BELeft h3');
		var editorWrapperHeight = document.querySelector('.BELeft .RESDialogContents .markdownEditor-wrapper');
		editorWrapperHeight = (editorWrapperHeight ? editorWrapperHeight.offsetHeight : 0);
		var dialogFooter = document.querySelector('.BELeft .BEFoot');
		var dialogContentBox = document.querySelector('.BELeft .RESDialogContents');
		dialogContentBox.style.paddingBottom =
			dialogTitle.offsetHeight - 10 + // add offsetHeight and subtract margin
			editorWrapperHeight +
			dialogFooter.offsetHeight +
			'px';
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

		if (target !== null) {
			target.val($('#BigText').val());
			target.focus();
			if (submitted !== true) {
				var inputEvent = document.createEvent('HTMLEvents');
				inputEvent.initEvent('input', true, true);
				target[0].dispatchEvent(inputEvent);
			}
			modules['commentPreview'].bigTextTarget = null;
		}
	}
});
