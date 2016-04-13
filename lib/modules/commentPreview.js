import _ from 'lodash';
import { $ } from '../vendor';
import { ajax } from '../environment';
import {
	currentSubreddit,
	fadeElementIn,
	fadeElementOut,
	isPageType
} from '../utils';
import { markdown, markdownWiki } from 'snudown-js';

addModule('commentPreview', (module, moduleID) => {
	module.moduleName = 'Live Preview';
	module.category = ['Comments', 'Submissions'];
	module.description = 'Provides a live preview while editing comments, text submissions, messages, wiki pages, and other markdown text areas; as well as a two column editor for writing walls of text.';
	module.options = {
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
			advanced: true,
			bodyClass: true
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
	};
	module.include = [
		'comments',
		'inbox',
		'submit',
		'profile',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:edit|modqueue|reports|spam|banned)/i,
		'wiki'
	];
	module.exclude = [
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/(?:r\/[\-\w\.]+\/)?wiki\/edit\/config\/automoderator\b/i
	];

	const subredditImages = new Map();
	let isWiki, isBan;

	module.beforeLoad = function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;

		isWiki = isPageType('wiki');
		isBan = (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned/i).test(document.location.href);

		initWikiImages();
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.enableBigEditor.value) {
				// Install the 2 column editor
				addBigEditorListener();

				if (modules['keyboardNav'].isEnabled()) {
					$('body').on('keydown', '.usertext-edit textarea, #wiki_page_content', e => {
						if (RESUtils.checkKeysForEvent(e, module.options.openBigEditor.value)) {
							showBigEditor(e);
						}
					});
				}
			}

			// Close the preview on submit
			$('body').on('submit', 'form', function() {
				$(this).find('.livePreview').hide();
			});

			if (!isWiki) {
				// Perform initial setup of tools over the whole page}
				attachPreview();
				// Wireup reply editors
				RESUtils.watchForElement('newCommentsForms', attachPreview);
				// Wireup edit editors (usertext-edit already exists in the page)
				RESUtils.watchForElement('newComments', attachPreview);
			} else {
				attachWikiPreview();
			}
		}
	};

	async function initWikiImages() {
		if (isWiki) {
			const { data } = await ajax({
				url: `/r/${currentSubreddit()}/about/stylesheet.json`,
				type: 'json'
			});

			if (data && data.images) {
				data.images.forEach(({ name, url }) => subredditImages.set(name, url));
			}
		}
	}

	function markdownToHTML(md) {
		if (isBan && md.length) {
			md = generateBanMessage(md, currentSubreddit());
		}

		if (!isWiki) {
			return markdown(md);
		} else {
			/*
			<s>Snudown, and therefore SnuOwnd, is a bit funny about how it generates its table of contents entries.
			To when it encounters a header it tries to perform some of the usual inline formatting such as emphasis, strikethoughs, or superscript in headers. The text containing generated HTML then gets passed into cb_toc_header which escapes all of the passed HTML. When reddit gets it escaped tags are stripped.

			It would be nicer if they just used different functions for rendering the emphasis when making headers.</s>

			It seems that my understanding was wrong, for some reason reddit doesn't even use snudown's TOC renderer.
			*/

			const body = markdownWiki(md)
				.replace(/<img src="%%([a-z0-9\-]+)%%"/gi, (match, name) => {
					if (subredditImages.has(name)) {
						return `<img src="${subredditImages.get(name)}"`;
					}
					return match;
				});

			// SnuOwnd created this HTML from markdown so it is safe.
			const doc = $('<body>').html(body);
			const headerIds = {};
			const headers = doc.find('h1, h2, h3, h4, h5, h6');
			const tocDiv = $('<div>').addClass('toc');
			let $parent = $('<ul>');
			$parent.data('level', 0);
			tocDiv.append($parent);
			let level = 0;
			let previous = 0;
			const prefix = 'wiki';
			headers.each(function() {
				const contents = $(this).text();
				let aid = $('<div>').html(contents).text();
				aid = `${prefix}_${aid.replace(/ /g, '_').toLowerCase()}`;
				aid = aid.replace(/[^\w\.\-]/g, s => `.${s.charCodeAt(0).toString(16).toUpperCase()}`);
				if (!(aid in headerIds)) {
					headerIds[aid] = 0;
				}
				const idNum = headerIds[aid] + 1;
				headerIds[aid] += 1;

				if (idNum > 1) {
					aid += idNum;
				}

				$(this).attr('id', aid);

				const li = $('<li>').addClass(aid);
				const a = $('<a>').attr('href', `#${aid}`).text(contents);
				li.append(a);

				const thisLevel = +this.tagName.slice(-1);
				if (previous && thisLevel > previous) {
					const $newUL = $('<ul>');
					$newUL.data('level', thisLevel);
					$parent.append($newUL);
					$parent = $newUL;
					level++;
				} else if (level && thisLevel < previous) {
					while (level && $parent.data('level') > thisLevel) {
						$parent = $parent.closest('ul');
						level -= 1;
					}
				}
				previous = thisLevel;
				$parent.append(li);
			});
			doc.prepend(tocDiv);
			return doc.html();
		}
	}

	function makeBigEditorButton() {
		return $('<button type="button" class="RESBigEditorPop" tabIndex="3"><span class="res-icon res-icon-12">&#xF0A4;</span> big editor</button>');
	}

	function attachPreview(usertext) {
		if (usertext === undefined || usertext === null) {
			usertext = document.body;
		}
		if (module.options.enableBigEditor.value) {
			if (isBan) {
				makeBigEditorButton().appendTo('#banned');
			} else {
				makeBigEditorButton().prependTo($('.bottom-area:not(:has(.RESBigEditorPop))', usertext));
			}
		}
		$(usertext).find('.usertext-edit, #banned').each(function() {
			const $this = $(this);

			if ($this.closest('.commentarea, .message').length &&
					!module.options.enableForComments.value) {
				return;
			}

			if ((isPageType('submit') || $(this).closest('.link').length) &&
					!module.options.enableForPosts.value) {
				return;
			}

			if (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/edit/i.test(document.location.href) &&
					!module.options.enableForSubredditConfig.value) {
				return;
			}

			if (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned/i.test(document.location.href) &&
					!module.options.enableForBanMessages.value) {
				return;
			}

			let preview = $this.find('.livePreview');

			if (preview.length === 0) {
				preview = makePreviewBox();
				$this.append(preview);
			}

			const contents = preview.find('.RESDialogContents');
			const textareas = $this.find('textarea[name=text], textarea[name=description], textarea[name=public_description], textarea[name=ban_message]');

			if (textareas.attr('name') === 'description' && module.options.sidebarPreview.value) {
				const $sideMd = $('.side .usertext-body .md:first');

				if ($sideMd.length) {
					contents.push($sideMd[0]);
				}
			}

			textareas.on('input', e => onTextareaInput(preview, contents, e));

			// check for reply --> quoted text
			$this.closest('.thing').find('.buttons a[onclick*="reply"]') /* terrible selector */
				.on('click', () => textareas.trigger('input'));
			setTimeout(() => textareas.trigger('input'), 1);
		});
	}

	function attachWikiPreview() {
		if (module.options.enableBigEditor.value) {
			makeBigEditorButton().insertAfter('.markhelp');
		}

		if (isPageType('wiki') && module.options.enableForWiki.value) {
			const preview = makePreviewBox();
			preview.find('.md').addClass('wiki');
			preview.insertAfter($('#editform > br').first());

			const contents = preview.find('.RESDialogContents');
			$('#wiki_page_content').on('input', e => onTextareaInput(preview, contents, e));
		}
	}

	const onTextareaInput = _.debounce((preview, contents, event) => {
		const $textarea = $(event.target);
		const markdownText = $textarea.val();

		if (markdownText.length > 0) {
			preview.show();
			// SnuOwnd created this HTML from markdown so it is safe.
			contents.html(markdownToHTML(markdownText));
		} else {
			preview.hide();
			contents.html('');
		}
	}, 250);

	function makePreviewBox() {
		const $previewBox = $('<div style="display: none" class="RESDialogSmall livePreview"><h3>Live Preview</h3><div class="md RESDialogContents"></div></div>');
		const urlHashLink = modules['settingsNavigation'].makeUrlHashLink('commentPreview', null, ' ', 'gearIcon');
		$previewBox.find('h3').append(urlHashLink);

		return $previewBox;
	}

	let bigTextTarget, bigEditor;

	function createBigEditor() {
		if (bigEditor) {
			return;
		}
		const $editor = $('<div id="BigEditor" style="display: none;">');
		const $left = $('<div class="BELeft RESDialogSmall"><h3>Editor</h3></div>');
		const $contents = $('<div class="RESDialogContents"><textarea id="BigText" name="text" class=""></textarea></div>');
		const $foot = $('<div class="BEFoot">');
		if (!isBan) {
			$foot.append($('<button type="button">save</button>').on('click', () => {
				const len = $('#BigText').val().length;
				const max = $('#BigText').data('max-length');
				if (len > max) {
					$('#BigEditor .errorList .error').hide().filter('.TOO_LONG').text(`this is too long (max: ${max})`).show();
				} else if (len === 0) {
					$('#BigEditor .errorList .error').hide().filter('.NO_TEXT').show();
				} else if (bigTextTarget) {
					bigTextTarget.closest('form').find('button[type=submit]').click();
					bigTextTarget.parents('.usertext-edit:first').find('.livePreview .md').html('');
					hideBigEditor(false, true);
				} else {
					$('#BigEditor .errorList .error').hide().filter('.NO_TARGET').show();
				}
			}));
		}
		$foot.append($('<button type="button">close</button>').on('click', hideBigEditor));

		$foot.append($(`
			<span class="errorList">
				<span style="display: none;" class="error NO_TEXT">we need something here</span>
				<span style="display: none;" class="error TOO_LONG">this is too long (max: 10000)</span>
				<span style="display: none;" class="error NO_TARGET">there is no associated textarea</span>
			</span>
		`));

		$contents.append($foot);
		$left.append($contents);

		const $right = $(`
			<div class="BERight RESDialogSmall"><h3>Preview</h3><div class="RESCloseButton RESFadeButton">&#xf04e;</div><div class="RESCloseButton close">X</div>
			<div class="RESDialogContents"><div id="BigPreview" class=" md"></div></div></div>
		`);
		$editor.append($left).append($right);
		if (modules['commentTools'].isEnabled()) {
			$contents.prepend(modules['commentTools'].makeEditBar());
		}

		$(document.body).append($editor);

		$('.BERight .RESCloseButton.close').on('click', hideBigEditor);
		$('.BERight .RESFadeButton').on('click', function() {
			if (this.isFaded) {
				$('#BigEditor').fadeTo(300, 1.0).css('pointer-events', 'auto');
				$(document.body).addClass('RESScrollLock');
			} else {
				$('#BigEditor').fadeTo(300, 0.3).css('pointer-events', 'none');
				$(document.body).removeClass('RESScrollLock');
			}
			this.isFaded = !this.isFaded;
		});

		$('#BigText')
			.on('input', _.debounce(() => {
				const text = $('#BigText').val();
				// SnuOwnd created this HTML from markdown so it is safe.
				$('#BigPreview').html(markdownToHTML(text));
				if (bigTextTarget) {
					bigTextTarget.val(text);
				}
			}, 250))
			.on('keydown', e => {
				// Close big editor on escape
				if (e.keyCode === modules['commentTools'].KEYS.ESCAPE) {
					hideBigEditor();
					e.preventDefault();
					return false;
				}
			});

		bigEditor = $editor;
	}

	function addBigEditorListener() {
		$('body').on('click', '.RESBigEditorPop', showBigEditor);
	}

	function showBigEditor(e) {
		e.preventDefault();
		createBigEditor();
		// bigTextTarget = null;
		hideBigEditor(true);
		$('.side').addClass('BESideHide');
		$('body').addClass('RESScrollLock');
		fadeElementIn(document.getElementById('BigEditor'), 0.3);
		let $baseText;
		if (!isWiki && !isBan) {
			$baseText = $(this).parents('.usertext-edit:first').find('textarea');

			const limit = $baseText.attr('data-limit');
			$('#BigText').attr('data-limit', limit);
			$('#BigPreview').removeClass('wiki');
			$('.BERight .RESDialogContents').removeClass('wiki-page-content');
		} else if (isBan) {
			$baseText = $('#ban_message');

			const limit = $baseText.attr('data-limit');
			$('#BigText').attr('data-limit', limit);
			$('#BigPreview').removeClass('wiki');
			$('.BERight .RESDialogContents').removeClass('wiki-page-content');
		} else {
			$baseText = $('#wiki_page_content');
			$('#BigPreview').addClass('wiki');
			$('.BERight .RESDialogContents').addClass('wiki-page-content');
		}

		const markdown = $baseText.val();
		const maxLength = $baseText.data('max-length');
		$('#BigText').data('max-length', maxLength).val(markdown).focus();
		modules['commentTools'].updateCounter($('#BigText')[0]);
		// SnuOwnd created this HTML from markdown so it is safe.
		$('#BigPreview').html(markdownToHTML(markdown));
		bigTextTarget = $baseText;

		// dynamically set paddingBottom on .RESDialogContents to make textarea scale correctly.
		const dialogTitle = document.querySelector('.BELeft h3');
		let editorWrapperHeight = document.querySelector('.BELeft .RESDialogContents .markdownEditor-wrapper');
		editorWrapperHeight = (editorWrapperHeight ? editorWrapperHeight.offsetHeight : 0);
		const dialogFooter = document.querySelector('.BELeft .BEFoot');
		const dialogContentBox = document.querySelector('.BELeft .RESDialogContents');
		dialogContentBox.style.paddingBottom = `${
			dialogTitle.offsetHeight - 10 + // add offsetHeight and subtract margin
			editorWrapperHeight +
			dialogFooter.offsetHeight
		}px`;
	}

	function hideBigEditor(quick, submitted) {
		if (quick === true) {
			$('#BigEditor').hide();
		} else {
			fadeElementOut(document.getElementById('BigEditor'), 0.3);
		}
		$('.side').removeClass('BESideHide');
		$('body').removeClass('RESScrollLock');
		const target = bigTextTarget;

		if (target) {
			target.val($('#BigText').val());
			target.focus();
			if (submitted !== true) {
				const inputEvent = document.createEvent('HTMLEvents');
				inputEvent.initEvent('input', true, true);
				target[0].dispatchEvent(inputEvent);
			}
			bigTextTarget = null;
		}
	}

	function generateBanMessage(message, subreddit) {
		if (!message) {
			message = '';
		}

		return [
			`you have been banned from posting to [/r/${subreddit}](/r/${subreddit}).`,
			'',
			'note from the moderators:',
			'',
			message.replace(/^/gm, '> '),
			'',
			'you can contact the moderators regarding your ban by replying to this message. **warning**: using other accounts to circumvent a subreddit ban is considered a violation of reddit\'s [site rules](/rules) and can result in being banned from reddit entirely.'
		].join('\r\n');
	}
});
