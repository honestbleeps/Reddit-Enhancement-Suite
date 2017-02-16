/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	Alert,
	DAY,
	Thing,
	checkKeysForEvent,
	click,
	currentSubreddit,
	escapeHTML,
	isPageType,
	loggedInUser,
	niceKeyCode,
	range,
	regexes,
} from '../utils';
import type { KeyArray } from '../utils/keycode';
import { ajax, i18n } from '../environment';
import type { RedditSearchSubredditNames, RedditSearchWikiNames } from '../types/reddit';
import * as AccountSwitcher from './accountSwitcher';
import * as SettingsNavigation from './settingsNavigation';
import * as UserTagger from './userTagger';

export const module: Module<*> = new Module('commentTools');

module.moduleName = 'commentToolsName';
module.category = 'commentsCategory';
module.description = 'commentToolsDesc';
module.options = {
	userAutocomplete: {
		type: 'boolean',
		value: true,
		description: 'commentToolsUserAutoCompleteDesc',
		title: 'commentToolsUserAutoCompleteTitle',
		keywords: ['autosuggest'],
		advanced: true,
	},
	subredditAutocomplete: {
		type: 'boolean',
		value: true,
		description: 'commentToolsSubredditAutocompleteDesc',
		title: 'commentToolsSubredditAutocompleteTitle',
		keywords: ['autosuggest'],
		advanced: true,
	},
	wikiAutocomplete: {
		type: 'boolean',
		value: true,
		description: 'commentToolsWikiAutocompleteDesc',
		title: 'commentToolsWikiAutocompleteTitle',
		advanced: true,
	},
	formattingToolButtons: {
		type: 'boolean',
		value: true,
		description: 'commentToolsFormattingToolButtonsDesc',
		title: 'commentToolsFormattingToolButtonsTitle',
	},
	keyboardShortcuts: {
		dependsOn: options => options.formattingToolButtons.value,
		type: 'boolean',
		value: true,
		description: 'commentToolsKeyboardShortcutsDesc',
		title: 'commentToolsKeyboardShortcutsTitle',
	},
	boldKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [66, false, true, false, false], // ctrl-b
		description: 'commentToolsBoldKeyDesc',
		title: 'commentToolsBoldKeyTitle',
	},
	italicKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [73, false, true, false, false], // ctrl-i
		description: 'commentToolsItalicKeyDesc',
		title: 'commentToolsItalicKeyTitle',
	},
	strikeKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [83, false, true, false, false], // ctrl-s
		description: 'commentToolsStrikeKeyDesc',
		title: 'commentToolsStrikeKeyTitle',
	},
	superKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [187, false, true, true, false], // ctrl-+ (ctrl-shift-=)
		description: 'commentToolsSuperKeyDesc',
		title: 'commentToolsSuperKeyTitle',
	},
	linkKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [75, false, true, false, false], // ctrl-k
		description: 'commentToolsLinkKeyDesc',
		title: 'commentToolsLinkKeyTitle',
	},
	quoteKey: {
		dependsOn: options => options.keyboardShortcuts.value,
		type: 'keycode',
		value: [190, false, true, true, false], // ctrl-> (strl-shift-.)
		description: 'commentToolsQuoteKeyDesc',
		title: 'commentToolsQuoteKeyTitle',
	},
	ctrlEnterSubmitsComments: {
		type: 'boolean',
		value: true,
		description: 'commentToolsCtrlEnterSubmitsCommentsDesc',
		title: 'commentToolsCtrlEnterSubmitsCommentsTitle',
	},
	ctrlEnterSavesLiveThreads: {
		type: 'boolean',
		value: true,
		description: 'commentToolsCtrlEnterSavesLiveThreadsDesc',
		title: 'commentToolsCtrlEnterSavesLiveThreadsTitle',
	},
	ctrlEnterSubmitsPosts: {
		type: 'boolean',
		value: true,
		description: 'commentToolsCtrolEnterSubmitsPostsDesc',
		title: 'commentToolsCtrolEnterSubmitsPostsTitle',
	},
	commentingAs: {
		type: 'boolean',
		value: true,
		description: 'commentToolsCommentingAsDesc',
		title: 'commentToolsCommentingAsTitle',
	},
	highlightIfAltAccount: {
		dependsOn: options => options.commentingAs.value,
		type: 'boolean',
		value: true,
		description: 'commentToolsHighlightIfAltAccountDesc',
		title: 'commentToolsHighlightIfAltAccountTitle',
	},
	showInputLength: {
		type: 'boolean',
		value: true,
		description: 'commentToolsShowInputLengthDesc',
		title: 'commentToolsShowInputLengthTitle',
		advanced: true,
		bodyClass: true,
	},
	macroButtons: {
		type: 'boolean',
		value: true,
		description: 'commentToolsMacroButtonsDesc',
		title: 'commentToolsMacroButtonsTitle',
		bodyClass: true,
	},
	macros: {
		dependsOn: options => options.macroButtons.value,
		type: 'table',
		addRowText: 'commentToolsAddShortcut',
		fields: [{
			key: 'label',
			name: 'commentToolsLabel',
			type: 'text',
		}, {
			key: 'text',
			name: 'commentToolsText',
			type: 'textarea',
		}, {
			key: 'category',
			name: 'commentToolsCategory',
			type: 'text',
		}, {
			key: 'key',
			name: 'commentToolsKey',
			type: 'keycode',
		}],
		value: ([
			['reddiquette', '[reddiquette](/wiki/reddiquette) '],
			['Promote RES', '[Reddit Enhancement Suite](http://redditenhancementsuite.com "also /r/Enhancement") '],
			['Current timestamp', '{{now}} '],
		]: Array<[string, string, string | void, KeyArray | void]>),
		description: 'commentToolsMacrosDesc',
		title: 'commentToolsMacrosTitle',
	},
	keepMacroListOpen: {
		dependsOn: options => options.macroButtons.value,
		type: 'boolean',
		value: false,
		description: 'commentToolsKeepMacroListOpenDesc',
		title: 'commentToolsKeepMacroListOpenTitle',
		advanced: true,
	},
	macroPlaceholders: {
		dependsOn: options => options.macroButtons.value,
		type: 'boolean',
		value: true,
		description: `
			When using macro, replace placeholders in text via pop-up prompt.
			<p>Example macro text:<br>
			The {{adj1}} {{adj2}} {{animal}} jumped over the lazy {{dog_color}} dog. The {{animal}} is so {{adj1}}!
			</p>
		`,
		title: 'commentToolsMacroPlaceholdersTitle',
	},
	enabledOnBanMessages: {
		type: 'boolean',
		value: true,
		description: 'commentToolsEnableOnBanMessagesDesc',
		title: 'commentToolsEnableOnBanMessagesTitle',
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
	'liveThread',
	/^\/r\/[\-\w\.]+\/wiki\/(?:create|edit)(\/\w+)?/i,
];

module.loadDynamicOptions = () => {
	if (magicPlaceholders.length) {
		module.options.macroPlaceholders.description += `
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
	SIDEBAR: 10240,
	DESCRIPTION: 500,
	WIKI: 512 * 1024,
	COMMENT: 10000,
	LIVE_COMMENT: 4096,
	POST: 40000,
	POST_TITLE: 300,
	BAN_MESSAGE: 1000,
};
const macroCallbackTable: Array<(box: HTMLTextAreaElement) => void> = [];
const macroKeyTable: Array<[KeyArray, number]> = [];

module.go = () => {
	$(document.body).on('focus', commentTextareaSelector, attachEditorToUsertext);

	initializeCtrlEnterToSubmit();
	initializeLengthCounters();
	initializeAutocomplete();
};

function initializeCtrlEnterToSubmit() {
	if (module.options.ctrlEnterSubmitsComments.value) {
		onCtrlEnter(
			'.usertext-edit textarea, #BigEditor textarea, #wiki_page_content',
			e => {
				const currentForm = $(e.target).closest('form');
				const saveButton = currentForm.find('.save')[0] || currentForm.find('#wiki_save_button')[0] || $('.BEFoot button')[0];
				if (saveButton) click(saveButton);
			}
		);
	}

	if (module.options.ctrlEnterSavesLiveThreads.value) {
		onCtrlEnter(
			'.usertext-edit textarea',
			() => {
				const saveButton = $('#new-update-form .save-button button')[0];
				if (saveButton) click(saveButton);
			}
		);
	}

	if (module.options.ctrlEnterSubmitsPosts.value) {
		onCtrlEnter(
			'#title-field textarea, #text-field textarea, #url, #sr-autocomplete, input.captcha',
			() => {
				const $captcha = $('input.captcha:not(.cap-text)');
				if ($captcha.length && $captcha.val() === '') {
					$captcha.focus();
				} else {
					click($('.spacer .btn')[0]);
				}
			}
		);
	}
}

function initializeLengthCounters() {
	if (module.options.showInputLength.value) {
		$(document.body).on('input', '.usertext-edit textarea, #title-field textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function() {
			updateCounter(this);
		});

		// add title counter
		$('.submit-page #title-field span.title').prepend('<span class="RESCharCounter" title="character limit: 0/300">0/300</span>');
	}
}

function initializeAutocomplete() {
	if (
		module.options.subredditAutocomplete.value ||
		module.options.userAutocomplete.value ||
		module.options.wikiAutocomplete.value
	) {
		addAutoCompletePop();
	}
}

const initializeEditorTools = _.once(() => {
	$(document.body).on('click', 'div.markdownEditor-wrapper a:not(.userTagLink)', function(e: Event) {
		e.preventDefault();

		const index = $(this).attr('data-macro-index');
		const box = findTextareaForElement(this);
		if (!box) {
			console.error('Failed to locate textarea.');
			return;
		}
		const handler = macroCallbackTable[index];
		if (!handler) {
			throw new Error(`No macro callback at index: ${index}.`);
		}
		handler(box);

		box.focus();
		// Fire an input event to refresh the preview
		box.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
	}).on('click', '.RESMacroDropdownTitle', function(e: Event) {
		const thisCat = e.target;
		if (thisCat.classList.contains('openMacro')) {
			thisCat.classList.remove('openMacro');
		} else {
			$('.RESMacroWrappingSpan span').removeClass('openMacro');
			thisCat.classList.add('openMacro');
		}
		// position the drop down so it's flush with the right of the category button.
		$(this).next().css({
			top: `${thisCat.offsetTop + thisCat.offsetHeight}px`,
			left: `${thisCat.offsetLeft + thisCat.offsetWidth - (thisCat.nextSibling: any).offsetWidth}px`,
		});
	});

	if (module.options.keyboardShortcuts.value) {
		$(document.body).on('keydown', '.usertext-edit textarea, #BigEditor textarea, #wiki_page_content, #ban_message', function(e: KeyboardEvent) {
			if (e.keyCode === KEYS.ESCAPE) {
				if (!$autoCompletePop.is(':visible')) {
					// Blur from the editor on escape, so we can return to using the keyboard nav.
					// NOTE: The big editor closes on ESC so this won't be reached in that case.
					$(this).blur();
					e.preventDefault();
				}

				return;
			}

			for (const [testedKeyArray, macroIndex] of macroKeyTable) {
				if (checkKeysForEvent(e, testedKeyArray)) {
					const handler = macroCallbackTable[macroIndex];
					handler(this);

					// Fire an input event to refresh the preview
					this.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

					e.preventDefault();
					return;
				}
			}
		});
	}
});

export const commentTextareaSelector = [
	'textarea[name=text]',
	'textarea[name=description]',
	'textarea[name=public_description]',
	'textarea[name=body]',
	'textarea[name=ban_message]',
	'textarea[name=content]',
	'textarea[name=title]',
].join(':not([readonly]),');

function getFieldLimit(elem) {
	switch (elem.name) {
		case 'title':
			return SUBMIT_LIMITS.POST_TITLE;
		case 'text': // https://github.com/honestbleeps/Reddit-Enhancement-Suite/issues/829
			if (isPageType('submit') || $(elem).closest('.thing').hasClass('self')) {
				return SUBMIT_LIMITS.POST;
			}
			return SUBMIT_LIMITS.COMMENT;
		case 'description':
			return SUBMIT_LIMITS.SIDEBAR;
		case 'body':
			return SUBMIT_LIMITS.LIVE_COMMENT;
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
	if (this.hasAttribute('commentTools-initialized')) return;
	this.setAttribute('commentTools-initialized', true);

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

	const bar = makeEditBar();
	if (this.id === 'wiki_page_content' || this.id === 'ban_message') {
		$(this).parent().prepend(bar);
	} else {
		$(this).parent().before(bar);
	}
	updateCounter(this);
}

export function updateCounter(textarea: HTMLElement) {
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
}

let cachedEditBar;

export function makeEditBar() {
	initializeEditorTools();

	if (cachedEditBar) {
		return $(cachedEditBar).clone();
	}

	const $editBar = $('<div class="markdownEditor">');
	// Wrap the edit bar in a <div> of its own
	const wrappedEditBar = $('<div class="markdownEditor-wrapper">').append($editBar);

	if (module.options.commentingAs.value) {
		// show who we're commenting as...
		const commentingAsMessage = location.href.match(/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/banned\/?/i) ? 'Moderating as' : 'Speaking as';

		const commentingAs = $('<div class="commentingAs">')
			.html(`${commentingAsMessage}: `)
			.append($('#header-bottom-right .user a:first')
				.clone()
				.wrap('<span class="commentingAsUser"></span>')
				.parent()
			);
		if (Modules.isRunning(UserTagger)) {
			UserTagger.applyTagToAuthor((commentingAs.find('a')[0]: any), true);
		}
		const loggedIn = loggedInUser();
		if (
			module.options.highlightIfAltAccount.value &&
			AccountSwitcher.module.options.accounts.value.length &&
			loggedIn &&
			loggedIn.toLowerCase() !== AccountSwitcher.module.options.accounts.value[0][0].toLowerCase()
		) {
			commentingAs.addClass('highlightedAltAccount');
		}
		wrappedEditBar.append(commentingAs);
	}

	if (module.options.formattingToolButtons.value) {
		const shortcuts = module.options.keyboardShortcuts.value;
		$editBar.append(makeEditButton('<b>Bold</b>', `bold${shortcuts ? ` (${niceKeyCode(module.options.boldKey.value)})` : ''}`, module.options.boldKey.value, 'btn-bold', box => {
			wrapSelection(box, '**', '**');
		}));
		$editBar.append(makeEditButton('<i>Italic</i>', `italic${shortcuts ? ` (${niceKeyCode(module.options.italicKey.value)})` : ''}`, module.options.italicKey.value, 'btn-italic', box => {
			wrapSelection(box, '*', '*');
		}));
		$editBar.append(makeEditButton('<del>strike</del>', `strike${shortcuts ? ` (${niceKeyCode(module.options.strikeKey.value)})` : ''}`, module.options.strikeKey.value, 'btn-strike', box => {
			wrapSelection(box, '~~', '~~');
		}));
		$editBar.append(makeEditButton('<sup>sup</sup>', `super${shortcuts ? ` (${niceKeyCode(module.options.superKey.value)})` : ''}`, module.options.superKey.value, 'btn-superscript', box => {
			wrapSelectedWords(box, '^');
		}));
		$editBar.append(makeEditButton('Link', `link${shortcuts ? ` (${niceKeyCode(module.options.linkKey.value)})` : ''}`, module.options.linkKey.value, 'btn-link', box => {
			linkSelection(box);
		}));
		$editBar.append(makeEditButton('>Quote', `quote${shortcuts ? ` (${niceKeyCode(module.options.quoteKey.value)})` : ''}`, module.options.quoteKey.value, 'btn-quote', box => {
			wrapSelectedLines(box, '> ', '');
		}));
		$editBar.append(makeEditButton('<span style="font-family: monospace">Code</span>', 'code', null, 'btn-code', box => {
			wrapSelectedLines(box, '    ', '');
		}));
		$editBar.append(makeEditButton('&bull;Bullets', 'bullet list', null, 'btn-list-unordered', box => {
			wrapSelectedLines(box, '* ', '');
		}));
		$editBar.append(makeEditButton('1.Numbers', 'number list', null, 'btn-list-ordered', box => {
			wrapSelectedLines(box, '1. ', '');
		}));
		$editBar.append(makeEditButton('<span style="border: 1px black solid;">Table</span>', 'table', null, 'btn-table', box => {
			// First check if the selected text is a table, this also clean the selection
			const selectedText = box.value.substring(box.selectionStart, box.selectionEnd).replace(/^[\s]+/, '').replace(/[\s]+$/, '').split('\n'); // In fact, if the header start by '   |' this is not a table. But it's better to accept it then after editing the table it will work
			let isTable;
			if (selectedText.length >= 2) {
				if (selectedText[0].includes('|')) {	// Check if there is at least one '|' to check if it's a table
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
					if (!selectedText[1].includes('-|') && !selectedText[1].includes('|-')) {
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
						for (const i of range(2, selectedText.length)) {
							if (!selectedText[i].includes('|')) {
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
			Alert.open(`<div class="buttonContainer"></div><table class="commentPreview" contenteditable="true">${startTable}</table>`, { cancelable: true })
				.then(() => {
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

			const addRow = Alert.makeButton('+ Row');
			const remRow = Alert.makeButton('- Row');
			const addCol = Alert.makeButton('+ Col');
			const remCol = Alert.makeButton('- Col');
			addRow.addEventListener('click', () => {
				const nbCol = $('#alert_message tr:first td').length;
				const newRow = '<td>text</td>'.repeat(nbCol);
				$('#alert_message table').append(`<tr>${newRow}</tr>`);
			});
			remRow.addEventListener('click', () => {
				if ($('#alert_message tr').length > 1) {
					$('#alert_message table tr:last').remove();
				}
			});
			addCol.addEventListener('click', () => {
				$('#alert_message table tr').append('<td>text</td>');
			});
			remCol.addEventListener('click', () => {
				if ($('#alert_message tr:first td').length > 1) {
					$('#alert_message table tr td:last-of-type').remove();
				}
			});

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
	}

	if (module.options.macroButtons.value) {
		buildMacroDropdowns(wrappedEditBar);

		const addMacroButton = makeEditButton(i18n(module.options.macros.addRowText), null, null, 'btn-macro btn-macro-add', () => {
			SettingsNavigation.loadSettingsPage(module.moduleID, 'macros');
			$('.RESMacroWrappingSpan span').removeClass('openMacro');
		});
		addButtonToMacroGroup('', addMacroButton);
	}

	cachedEditBar = wrappedEditBar;
	return cachedEditBar;
}

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
		const button = makeEditButton(title, null, key, 'btn-macro', box => {
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
	const button = $('<a>').safeHtml(label).attr({
		class: `edit-btn ${cls}`,
		title,
		href: '#',
		tabindex: 1,
		'data-macro-index': macroButtonIndex,
	});

	if (key && key[0] !== null) {
		macroKeyTable.push([key, macroButtonIndex]);
	}
	macroCallbackTable[macroButtonIndex] = handler;
	return button;
}

function linkSelection(box) {
	let url = prompt('Enter the URL:', '');
	if (url) {
		// escape parens in url
		url = url.replace(/[\(\)]/g, '\\$&');
		// escape brackets and parens in text
		wrapSelection(box, '[', `](${url})`, text => text.replace(/[\[\]\(\)]/g, '\\$&'));
	}
}

function macroSelection(box, macroText) {
	if (!module.options.keepMacroListOpen.value) {
		$('.RESMacroWrappingSpan span').removeClass('openMacro');
	}
	if (module.options.macroPlaceholders.value) {
		const formatText = selectedText => fillPlaceholders(box, macroText, selectedText);
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
			let value;
			try {
				value = getMagicPlaceholderValue(placeholderInnerText, macroText, selectedText, box);
			} catch (e) {
				console.error('Error getting magic placeholder value', placeholderInnerText);
				console.error(e);
			}
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
	const handler = magicPlaceholders.find(current => current.matches.includes(placeholder));

	if (handler) {
		return handler.handle(macroText, selectedText, box);
	}
}

const magicPlaceholders = [
	{
		matches: ['subreddit'],
		description: 'The current subreddit, in the form /r/subreddit',
		handle(macroText, selectedText, box) {
			const thing = Thing.from(box);
			const subreddit = thing && thing.getSubreddit();

			if (subreddit) {
				return `/r/${subreddit}`;
			}
		},
	}, {
		matches: ['me', 'my_username'],
		description: 'Your username, in the form /u/username',
		handle() {
			const username = loggedInUser();
			if (username) {
				return `/u/${username}`;
			}
		},
	}, {
		matches: ['op', 'op_username'],
		description: 'The username of the "original poster", in the form /u/username. On a post\'s comments page, this the person who made the post; on a PM / modmail, this is the person who started the conversation',
		handle(macroText, selectedText, box) {
			let profile: ?HTMLAnchorElement;
			if (isPageType('comments')) {
				profile = (document.querySelector('.sitetable .author'): any);
			} else {
				let $next = $(box);
				let furthest = $next;
				do {
					if ($next && $next.length) furthest = $next;
					$next = $next.parent().closest('.sitetable');
				} while ($next.length);

				profile = (furthest.find('.author')[0]: any);
			}

			if (profile) {
				const match = profile.pathname.match(regexes.profile);
				if (!match) throw new Error(`Invalid profile link: ${profile.href}`);
				return `/u/${match[1]}`;
			}
		},
	}, {
		matches: ['url'],
		description: 'The current page\'s URL, like http://www.reddit.com/r/Enhancement/comments/123abc/example_post',
		handle() {
			return document.location.href;
		},
	}, {
		matches: ['reply_to', 'reply_to_username'],
		description: 'The username of person you\'re replying to, in the form /u/username. ',
		handle(macroText, selectedText, box) {
			let $base = $(box);
			const isEditing = $base.closest('.thing, .entry').hasClass('entry');

			if (isEditing) {
				$base = $base.closest('.thing').parent();
			}

			const profile: ?HTMLAnchorElement = ($base.closest('.thing').find('.entry .author')[0]: any);

			if (!profile) {
				return getMagicPlaceholderValue('op', macroText, selectedText, box);
			} else {
				const match = profile.pathname.match(regexes.profile);
				if (!match) throw new Error(`Invalid profile link: ${String(profile)}`);
				return `/u/${match[1]}`;
			}
		},
	}, {
		matches: ['selected', 'selection'],
		description: 'The text which is currently selected (highlighted)',
		handle(macroText, selectedText) {
			return selectedText;
		},
	}, {
		matches: ['now'],
		description: 'The current date and time in your locale',
		handle() {
			const date = new Date();
			return date.toTimeString();
		},
	}, {
		matches: ['today'],
		description: 'The current date in your locale',
		handle() {
			const date = new Date();
			return date.toDateString();
		},
	}, {
		matches: ['linkflair'],
		description: 'On comments pages, returns the flair text of the original link',
		handle() {
			if (isPageType('comments')) {
				return document.querySelector('.linkflairlabel').textContent;
			}
		},
	}, {
		matches: ['escaped'],
		description: 'The selected text, escaped for snudown/markdown. Useful for text emoji like ¯\\_(ツ)_/¯',
		handle(macroText, selectedText) {
			return selectedText
				.replace(/[\[\]()\\\*\^~\-_.]/g, '\\$&')
				// more than 3 spaces before a >quote starts a code block
				.replace(/^([ ]{0,3})>/gm, '$1\\>');
		},
	},
];

function promptForPlaceholderValue(placeholder, macroText) {
	// Get value for placeholder
	const display = `${macroText}\n\n\nEnter replacement for ${placeholder}:`;
	const value = placeholder;

	return prompt(display, value);
}

function wrapSelection(box, prefix, suffix, escapeFunction) {
	if (!box) {
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
	if (!box) {
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
	for (const i of range(0, lines.length)) {
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

	for (const i of range(0, selectedWords.length)) {
		if (selectedWords[i] !== '') {
			if (selectedWords[i].includes('\n')) {
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

export const KEYS = {
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
	COMMA: 188,
};

let $autoCompletePop;

function addAutoCompletePop() {
	$autoCompletePop = $('<div id="autocomplete_dropdown" class="drop-choices srdrop inuse" style="display:none;">');
	$autoCompletePop.on('click mousedown', '.choice', function() {
		autoCompleteHideDropdown();
		autoCompleteInsert(this.innerText);
	});

	$('body').append($autoCompletePop);

	$('body').on({
		keyup: autoCompleteTrigger,
		keydown: autoCompleteNavigate,
		blur: autoCompleteHideDropdown,
	}, '.usertext .usertext-edit textarea, #BigText, #wiki_page_content');
}

let autoCompleteLastTarget;

const autoCompleteDebounce = _.debounce(async (type, query, subreddit) => {
	let names;

	switch (type) {
		case 'u':
			names = await getUserCompletions(query);
			break;
		case 'r':
			names = await getSubredditCompletions(query);
			break;
		case 'w':
			names = await getWikiCompletions(query, subreddit);
			break;
		default:
			throw new Error(`Invalid autocomplete type: ${type}`);
	}

	autoCompleteUpdateDropdown(names);
	autoCompleteSetNavIndex(0);
}, 200);

/**
 * Matches the following:
 * [0]: Full match
 * [1]: preceding character
 * [2]: subreddit name (no '/r/') (optional)
 * [3]: 'r', 'u', 'w', 'wiki'
 * [4]: query
 */
const autoCompleteMatchRegExp = /(^|\W)\/?(?:r\/([\w]+)\/)?(wiki|w|r|u)\/([\w]+)$/;

function autoCompleteTrigger(e) {
	// \0x08 is backspace
	if (/[^A-Za-z0-9 \x08]/.test(String.fromCharCode(e.keyCode))) {
		return true;
	}
	autoCompleteLastTarget = e.target;

	const prefixText = this.value.slice(0, this.selectionStart);

	const match = autoCompleteMatchRegExp.exec(prefixText);
	if (!match) {
		autoCompleteHideDropdown();
		return;
	}

	const [,, subreddit, [type], query] = match;

	if (
		(type === 'r' && !module.options.subredditAutocomplete.value) ||
		(type === 'u' && !module.options.userAutocomplete.value) ||
		(type === 'w' && !module.options.wikiAutocomplete.value)
	) {
		return;
	}

	autoCompleteDebounce(type, query, subreddit || currentSubreddit());
}

async function getSubredditCompletions(query) {
	const { names } = (await ajax({
		method: 'POST',
		url: '/api/search_reddit_names.json',
		data: { query },
		type: 'json',
		cacheFor: DAY,
	}): RedditSearchSubredditNames);

	return names.map(name => `/r/${name}`);
}

async function getUserCompletions(query) {
	const tags = await UserTagger.tagStorage.get();
	const tagNames = Object.keys(tags);
	const pageNames = Array.from(document.querySelectorAll('.author')).map(e => e.textContent);
	return [...tagNames, ...pageNames]
		.filter(e => e.toLowerCase().startsWith(query.toLowerCase()))
		.sort()
		.reduce((prev, current) => {
			// Removing duplicates
			if (prev[prev.length - 1] !== current) {
				prev.push(current);
			}
			return prev;
		}, [])
		.map(user => `/u/${user}`);
}

async function getWikiCompletions(query, subreddit) {
	const { data: wikiPages } = (await ajax({
		method: 'GET',
		url: `/r/${subreddit}/wiki/pages.json`,
		type: 'json',
		cacheFor: DAY,
	}): RedditSearchWikiNames);

	return wikiPages
		.filter(wikiPage => wikiPage.toLowerCase().startsWith(query.toLowerCase()))
		.map(wikiPage => `/r/${subreddit}/wiki/${wikiPage}`);
}

function autoCompleteNavigate(e) {
	// Don't mess with shortcuts for fancier cursor movement
	if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey) return;
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
	names.slice(0, 20).forEach((name, i) => {
		$autoCompletePop.append(`<a class="choice" data-index="${i}">${name}</a>`);
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
	left = left.replace(autoCompleteMatchRegExp, `$1${inputValue} `);
	textarea.value = left + right;
	textarea.selectionStart = textarea.selectionEnd = left.length;
	textarea.focus();
}

function findTextareaForElement(elem): HTMLTextAreaElement | void {
	const textarea = $(elem)
		.closest('.usertext-edit, .RESDialogContents, .wiki-page-content, #banned')
		.find('textarea')
		.filter('#BigText, [name=text], [name=description], [name=public_description], [name=body], #wiki_page_content, #ban_message')
		.get(0);
	// guaranteed to be an HTMLTextAreaElement due to `.find('textarea')`
	return (textarea: any);
}

export function onCtrlEnter(selector: string, callback: (e: KeyboardEvent) => Promise<void> | void) {
	$(document.body).on('keydown', selector, (e: KeyboardEvent) => {
		if (e.keyCode === KEYS.ENTER && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			callback(e);
		}
	});
}
