/* @flow */

import _ from 'lodash';
import { markdown, markdownWiki } from 'snudown-js';
import { $ } from '../vendor';
import { Module } from '../core/module';
import type { RedditStylesheet } from '../types/reddit';
import { ajax } from '../environment';
import * as Modules from '../core/modules';
import {
	checkKeysForEvent,
	currentSubreddit,
	downcast,
	isPageType,
	string,
	empty,
} from '../utils';
import * as CommentTools from './commentTools';
import * as KeyboardNav from './keyboardNav';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('commentPreview');

module.moduleName = 'commentPrevName';
module.category = 'commentsCategory';
module.description = 'commentPrevDesc';
module.options = {
	enableBigEditor: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableBigEditorDesc',
		title: 'commentPreviewEnableBigEditorTitle',
	},
	swapBigEditorLayout: {
		type: 'boolean',
		value: false,
		description: 'commentPreviewSwapBigEditorLayoutDesc',
		title: 'commentPreviewSwapBigEditorLayoutTitle',
		bodyClass: true,
	},
	openBigEditor: {
		type: 'keycode',
		value: [69, false, true, false, false], // control-e
		description: 'commentPreviewOpenBigEditorDesc',
		title: 'commentPreviewOpenBigEditorTitle',
	},
	draftStyle: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewDraftStyleDesc',
		title: 'commentPreviewDraftStyleTitle',
		advanced: true,
		bodyClass: true,
	},
	enableForComments: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableForCommentsDesc',
		title: 'commentPreviewEnableForCommentsTitle',
		advanced: true,
	},
	enableForPosts: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableForPostsDesc',
		title: 'commentPreviewEnableForPostsTitle',
		advanced: true,
	},
	enableForWiki: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableForWikiDesc',
		title: 'commentPreviewEnableForWikiTitle',
		advanced: true,
	},
	enableForSubredditConfig: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableForSubredditConfigDesc',
		title: 'commentPreviewEnableForSubredditConfigTitle',
		advanced: true,
	},
	enableForBanMessages: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewEnableForBanMessagesDesc',
		title: 'commentPreviewEnableForBanMessagesTitle',
		advanced: true,
	},
	sidebarPreview: {
		type: 'boolean',
		value: true,
		description: 'commentPreviewSidebarPreviewDesc',
		title: 'commentPreviewSidebarPreviewTitle',
		advanced: true,
	},
};
module.include = [
	'comments',
	'inbox',
	'submit',
	'profile',
	'modqueue',
	'subredditAbout',
	'wiki',
];
module.exclude = [
	/^\/(?:r\/[\-\w\.]+\/)?wiki\/edit\/config\/automoderator\b/i,
];

const subredditImages = new Map();
let isWiki, isBan;

module.beforeLoad = () => {
	isWiki = isPageType('wiki');
	isBan = (/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned/i).test(location.href);

	const subreddit = currentSubreddit();
	if (isWiki && subreddit) initWikiImages(subreddit);
};

module.go = () => {
	if (module.options.enableBigEditor.value) {
		// Install the 2 column editor
		$('body').on('click', '.RESBigEditorPop', showBigEditor);

		if (Modules.isRunning(KeyboardNav)) {
			$('body').on('keydown', '.usertext-edit textarea, #wiki_page_content', (e: KeyboardEvent) => {
				if (checkKeysForEvent(e, module.options.openBigEditor.value)) {
					showBigEditor(e);
				}
			});
		}
	}

	// Close the preview on submit
	$('body').on('submit', 'form', function() {
		$(this).find('.livePreview').hide();
	});

	if (isWiki) {
		attachWikiPreview();
		addBigEditorButton(document.querySelector('.markhelp'));
	} else {
		$(document.body).on('focus', CommentTools.commentTextareaSelector, e => {
			addBigEditorButton(e.target);
			attachPreview(e.target);
		});
	}
};

async function initWikiImages(subreddit) {
	const { data } = (await ajax({
		url: `/r/${subreddit}/about/stylesheet.json`,
		type: 'json',
	}): RedditStylesheet);

	if (data && data.images) {
		for (const { name, url } of data.images) {
			subredditImages.set(name, url);
		}
	}
}

function markdownToHTML(md) {
	if (isBan && md.length) {
		md = generateBanMessage(md, currentSubreddit() || '');
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

		// SnuOwnd created this HTML from markdown so it is safe.
		const $doc = $('<body>').html(markdownWiki(md));

		for (const img: HTMLImageElement of ($doc.find('img'): any)) {
			const src = img.getAttribute('src');
			const imgKey = src && src.startsWith('%%') && src.endsWith('%%') && src.slice('%%'.length, -'%%'.length);
			const resolvedSrc = imgKey && subredditImages.get(imgKey);

			if (resolvedSrc) {
				// convert %%subredditImages%% to their resolved URLs
				img.src = resolvedSrc;
			} else {
				// remove external/unresolved images
				img.remove();
			}
		}

		const headerIds = new Map();
		const headers = $doc.find('h1, h2, h3, h4, h5, h6');
		const tocDiv = $('<div>').addClass('toc');
		let $parent = $('<ul>');
		$parent.data('level', 1);
		tocDiv.append($parent);
		let level = 1;
		let previous = 1;
		const prefix = 'wiki';
		headers.each(function() {
			const contents = $(this).text();
			let aid = $('<div>').html(contents).text();
			aid = `${prefix}_${aid.replace(/ /g, '_').toLowerCase()}`;
			aid = aid.replace(/[^\w\.\-]/g, s => `.${s.charCodeAt(0).toString(16).toUpperCase()}`);
			const idNum = (headerIds.get(aid) || 0) + 1;
			headerIds.set(aid, idNum);

			if (idNum > 1) {
				aid += idNum;
			}

			$(this).attr('id', aid);

			const li = $('<li>').addClass(aid);
			const a = $('<a>').attr('href', `#${aid}`).text(contents);
			li.append(a);

			const thisLevel = +this.tagName.slice(-1);
			if (thisLevel > previous) {
				const $newUL = $('<ul>');
				$newUL.data('level', thisLevel);
				$parent.append($newUL);
				$parent = $newUL;
				level++;
			} else if (thisLevel < previous) {
				while (level > 1 && $parent.data('level') > thisLevel) {
					$parent = $parent.parent();
					level--;
				}
			}
			previous = thisLevel;
			$parent.append(li);
		});
		$doc.prepend(tocDiv);
		return $doc.html();
	}
}

function addBigEditorButton(ele) {
	if (!module.options.enableBigEditor.value) return;

	if (ele.hasAttribute('res-bigEditorButton-initialized')) return;
	ele.setAttribute('res-bigEditorButton-initialized', '');

	const bigEditorButton = string.html`
		<button type="button" class="RESBigEditorPop" tabIndex="3">
			<span class="res-icon res-icon-12">&#xF0A4;</span> big editor
		</button>
	`;

	if (isBan || isWiki) {
		ele.after(bigEditorButton);
	} else {
		const container = ele.closest('.usertext-edit');
		if (!container) return;
		const bottom = container.querySelector('.bottom-area');
		bottom.prepend(bigEditorButton);
	}
}

function attachPreview(ele) {
	switch (ele.getAttribute('res-commentPreview-state')) {
		case 'disabled':
			// previously disabled
			return;
		case 'enabled':
			// previously enabled
			break;
		default:
			if (
				!module.options.enableForComments.value && ele.closest('.commentarea, .message') ||
				!module.options.enableForPosts.value && (isPageType('submit') || ele.closest('.link')) ||
				!module.options.enableForSubredditConfig.value && (/^\/r\/[\-\w.]+\/about\/edit/i).test(location.pathname) ||
				!module.options.enableForBanMessages.value && isBan
			) {
				// avoid repeating this (potentially expensive) check
				ele.setAttribute('res-commentPreview-state', 'disabled');
				return;
			} else {
				ele.setAttribute('res-commentPreview-state', 'enabled');
			}
			break;
	}

	const container = ele.closest('.usertext-edit, #banned');
	if (!container) return;

	const preview = container.querySelector('.livePreview') || container.appendChild(makePreviewBox());
	const elements = [preview.querySelector('.RESDialogContents')];
	if (module.options.sidebarPreview.value && ele.getAttribute('name') === 'description') {
		elements.push(document.querySelector('.side .usertext-body .md'));
	}

	$(ele)
		.off('input')
		.on('input', e => onTextareaInput(e, preview, elements));

	// trigger initial render in case the textarea already has text in it
	// e.g. if it was copied from the top-level textarea into a comment reply
	setTimeout(() => $(ele).trigger('input'), 1);
}

function attachWikiPreview() {
	if (!module.options.enableForWiki.value) return;

	const preview = makePreviewBox();
	preview.querySelector('.md').classList.add('wiki');
	document.querySelector('#editform > br').after(preview);
	const contents = preview.querySelector('.RESDialogContents');

	$('#wiki_page_content').on('input', e => onTextareaInput(e, preview, [contents]));
}

const onTextareaInput = _.debounce((e, preview, elements) => {
	const markdownText = downcast(e.target, HTMLTextAreaElement).value;

	if (markdownText.length > 0) {
		preview.style.display = '';
		// SnuOwnd created this HTML from markdown so it is safe.
		for (const ele of elements) ele.innerHTML = markdownToHTML(markdownText);
	} else {
		preview.style.display = 'none';
		for (const ele of elements) empty(ele);
	}
}, 250);

function makePreviewBox() {
	return string.html`
		<div style="display: none" class="RESDialogSmall livePreview">
			<h3>Live Preview</h3>
			${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
			<div class="md RESDialogContents"></div>
		</div>
	`;
}

let bigTextTarget;

const createBigEditor = _.once(() => {
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
				bigTextTarget.closest('form').find('input[type=submit], button[type=submit]')
					// Use native click method as it will throw if something's wrong
					.get(0).click();
				bigTextTarget.parents('.usertext-edit:first').find('.livePreview .md').html('');
				hideBigEditor(false, true);
			} else {
				$('#BigEditor .errorList .error').hide().filter('.NO_TARGET').show();
			}
		}));
	}
	$foot.append($('<button type="button">close</button>').on('click', () => hideBigEditor()));

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
	if (Modules.isRunning(CommentTools)) {
		$contents.prepend(CommentTools.makeEditBar());
	}

	$(document.body).append($editor);

	$('.BERight .RESCloseButton.close').on('click', () => hideBigEditor());
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
		.on('keydown', (e: KeyboardEvent) => {
			// Close big editor on escape
			if (e.keyCode === CommentTools.KEYS.ESCAPE) {
				hideBigEditor();
				e.preventDefault();
				return false;
			}
		});

	return $editor;
});

function showBigEditor(e: Event) {
	e.preventDefault();
	createBigEditor().fadeIn(300);
	$('.side').addClass('BESideHide');
	$('body').addClass('RESScrollLock');
	let $baseText;
	if (!isWiki && !isBan) {
		$baseText = $(e.target).parents('.usertext-edit:first').find('textarea');

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
	CommentTools.updateCounter($('#BigText')[0]);
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
	$('#BigEditor').fadeOut(quick ? 0 : 300);
	$('.side').removeClass('BESideHide');
	$('body').removeClass('RESScrollLock');

	const target = bigTextTarget;
	if (target) {
		target.val($('#BigText').val());
		target.focus();
		if (submitted !== true) {
			// update the non-big-editor live preview
			target[0].dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
		}
		bigTextTarget = null;
	}
}

function generateBanMessage(message, subreddit) {
	return [
		`you have been banned from posting to [/r/${subreddit}](/r/${subreddit}).`,
		'',
		'note from the moderators:',
		'',
		message.replace(/^/gm, '> '),
		'',
		'you can contact the moderators regarding your ban by replying to this message. **warning**: using other accounts to circumvent a subreddit ban is considered a violation of reddit\'s [site rules](/rules) and can result in being banned from reddit entirely.',
	].join('\r\n');
}
