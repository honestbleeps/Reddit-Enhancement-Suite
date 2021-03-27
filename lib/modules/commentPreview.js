/* @flow */

import $ from 'jquery';
import { debounce, once } from 'lodash-es';
import { markdown, markdownWiki } from 'snudown-js';
import { Module } from '../core/module';
import type { RedditStylesheet } from '../types/reddit';
import { ajax } from '../environment';
import * as Modules from '../core/modules';
import {
	NAMED_KEYS,
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
	'd2x',
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

module.contentStart = () => {
	if (module.options.enableBigEditor.value) {
		if (Modules.isRunning(KeyboardNav)) {
			$(document.body).on('keydown', '.usertext-edit textarea, #wiki_page_content', (e: KeyboardEvent) => {
				if (checkKeysForEvent(e, module.options.openBigEditor.value)) {
					showBigEditor(e);
				}
			});
		}
	}

	if (isWiki) {
		attachWikiPreview();
		addBigEditorButton(document.querySelector('.markhelp'));
	} else {
		$(document.body).on('focus', CommentTools.commentTextareaSelector, e => {
			addBigEditorButton(e.currentTarget);
			attachPreview(e.currentTarget);
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

const addBigEditorButton = ele => {
	if (!module.options.enableBigEditor.value) return;

	const container = ele.closest('#editform, .usertext-edit, #banned');
	if (!container) return;

	const bigEditorButton = container.querySelector('.RESBigEditorPop') || string.html`
		<button type="button" class="RESBigEditorPop" tabIndex="3">
			<span class="res-icon res-icon-12">&#xF0A4;</span> big editor
		</button>
	`;

	if (isBan || isWiki) {
		ele.after(bigEditorButton);
	} else {
		const bottom = container.querySelector('.bottom-area');
		bottom.prepend(bigEditorButton);
	}

	bigEditorButton.addEventListener('click', showBigEditor);
};

const attachPreview = textarea => {
	if (
		!module.options.enableForComments.value && textarea.closest('.commentarea, .message') ||
		!module.options.enableForPosts.value && (isPageType('submit') || textarea.closest('.link')) ||
		!module.options.enableForSubredditConfig.value && (/^\/r\/[\-\w.]+\/about\/edit/i).test(location.pathname) ||
		!module.options.enableForBanMessages.value && isBan
	) {
		return;
	}

	const container = textarea.closest('.usertext-edit, #banned');
	if (!container) return;

	const preview = container.querySelector('.livePreview') || makePreviewBox();

	const elements = [preview.querySelector('.RESDialogContents')];
	if (module.options.sidebarPreview.value && textarea.getAttribute('name') === 'description') {
		elements.push(document.querySelector('.side .usertext-body .md'));
	}

	$(textarea).on('input', debounce(() => onTextareaInput(textarea, preview, elements), 100));

	// trigger initial render in case the textarea already has text in it
	// e.g. if it was copied from the top-level textarea into a comment reply
	onTextareaInput(textarea, preview, elements);

	// Close on submit
	$(textarea.closest('form')).on('submit', () => {
		preview.remove();
	});

	container.append(preview);
};

function attachWikiPreview() {
	if (!module.options.enableForWiki.value) return;

	const preview = makePreviewBox();
	preview.querySelector('.md').classList.add('wiki');
	document.querySelector('#editform > br').after(preview);
	const contents = preview.querySelector('.RESDialogContents');

	$('#wiki_page_content').on('input focus', debounce(e => onTextareaInput(e.currentTarget, preview, [contents]), 100));
}

function onTextareaInput(textarea, preview, elements) {
	const markdownText = downcast(textarea, HTMLTextAreaElement).value;

	if (markdownText.length) {
		if (preview) preview.hidden = false;
		// SnuOwnd created this HTML from markdown so it is safe.
		for (const ele of elements) ele.innerHTML = markdownToHTML(markdownText);
	} else {
		if (preview) preview.hidden = true;
		for (const ele of elements) empty(ele);
	}
}

function makePreviewBox() {
	return string.html`
		<div class="RESDialogSmall livePreview">
			<h3>Live Preview</h3>
			${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, ' ', 'gearIcon'))}
			<div class="md RESDialogContents"></div>
		</div>
	`;
}

const createBigEditor = once(() => {
	const $editor = $('<div id="BigEditor">');
	const $left = $('<div class="BELeft RESDialogSmall"><h3>Editor</h3></div>');
	const $contents = $('<div class="RESDialogContents"><textarea id="BigText" name="text" class=""></textarea></div>');
	const $textarea = $contents.find('textarea');
	const $foot = $('<div class="BEFoot">');
	if (!isBan) {
		$foot.append($('<button type="button">save</button>').on('click', () => {
			const len = $textarea.val().length;
			const max = $textarea.data('max-length');
			if (len > max) {
				$('#BigEditor .errorList .error').hide().filter('.TOO_LONG').text(`this is too long (max: ${max})`).show();
			} else if (len === 0) {
				$('#BigEditor .errorList .error').hide().filter('.NO_TEXT').show();
			} else {
				hideBigEditor(true);
			}
		}));
	}
	$foot.append($('<button type="button">close</button>').on('click', () => hideBigEditor()));

	$foot.append($(`
		<span class="errorList">
			<span style="display: none;" class="error NO_TEXT">we need something here</span>
			<span style="display: none;" class="error TOO_LONG">this is too long (max: 10000)</span>
		</span>
	`));

	$contents.append($foot);
	$left.append($contents);

	const $right = $(`
		<div class="BERight RESDialogSmall"><h3>Preview</h3><div class="RESCloseButton RESCloseButtonTopRight"></div>
		<div class="RESDialogContents"><div id="BigPreview" class=" md"></div></div></div>
	`);
	$editor.append($left).append($right);

	$right.find('.RESCloseButton').on('click', () => hideBigEditor());

	const $preview = $right.find('#BigPreview');
	$textarea.on('input', debounce(() => onTextareaInput($textarea.get(0), null, [$preview.get(0)]), 100));

	$editor.on('keydown', (e: KeyboardEvent) => {
		// Close big editor on escape
		if (e.key === NAMED_KEYS.Escape) {
			hideBigEditor();
			e.preventDefault();
			return false;
		}
	});

	return $editor;
});

let $bigTextTarget;

function showBigEditor(e: Event) {
	e.preventDefault();
	const $editor = createBigEditor();
	$(document.body)
		.append($editor)
		.addClass('RESScrollLock');
	const $textarea = $editor.find('textarea');
	let $baseText;
	if (!isWiki && !isBan) {
		$baseText = $(e.currentTarget).parents('.usertext-edit:first').find('textarea');

		const limit = $baseText.attr('data-limit');
		$textarea.attr('data-limit', limit);
		$('#BigPreview').removeClass('wiki');
		$('.BERight .RESDialogContents').removeClass('wiki-page-content');
	} else if (isBan) {
		$baseText = $('#ban_message');

		const limit = $baseText.attr('data-limit');
		$textarea.attr('data-limit', limit);
		$('#BigPreview').removeClass('wiki');
		$('.BERight .RESDialogContents').removeClass('wiki-page-content');
	} else {
		$baseText = $('#wiki_page_content');
		$('#BigPreview').addClass('wiki');
		$('.BERight .RESDialogContents').addClass('wiki-page-content');
	}

	const markdown = $baseText.val();
	const maxLength = $baseText.data('max-length');
	$textarea.data('max-length', maxLength).val(markdown).focus();
	$bigTextTarget = $baseText;
	$textarea.get(0).dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
}

function hideBigEditor(save: boolean = false) {
	if (!$bigTextTarget) throw new Error();

	const $editor = createBigEditor();
	const $textarea = $editor.find('textarea');

	$bigTextTarget.val($textarea.val());
	$bigTextTarget.get(0).dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

	if (save) {
		$bigTextTarget.closest('form').find('input[type=submit], button[type=submit]').click();
	} else {
		$bigTextTarget.focus();
	}

	// Use native remove method to prevent JQuery discarding event listeners
	$editor.get(0).remove();
	$(document.body).removeClass('RESScrollLock');

	$bigTextTarget = null;
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
