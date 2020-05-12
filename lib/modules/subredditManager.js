/* @flow */

import $ from 'jquery';
import _ from 'lodash';
import { Module } from '../core/module';
import {
	Alert,
	CreateElement,
	DAY,
	NAMED_KEYS,
	PagePhases,
	Table,
	click,
	currentSubreddit,
	empty,
	formatDate,
	formatRelativeTime,
	fullLocation,
	isCurrentSubreddit,
	isModeratorAnywhere,
	loggedInUser,
	regexes,
	string,
	waitForDescendant,
	waitForEvent,
	watchForThings,
} from '../utils';
import { Session, Storage, ajax, isPrivateBrowsing, i18n } from '../environment';
import type { RedditListing, RedditSubreddit } from '../types/reddit';
import * as Notifications from './notifications';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('subredditManager');

module.moduleName = 'subredditManName';
module.category = 'subredditsCategory';
module.description = 'subredditManDesc';
module.include = ['r2'];
module.bodyClass = true;
module.options = {
	subredditShortcut: {
		title: 'subredditManagerSubredditShortcutTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerSubredditShortcutDesc',
	},
	shortcutsPerAccount: {
		title: 'subredditManagerShortcutsPerAccountTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerShortcutsPerAccountDesc',
	},
	alwaysApplySuffixToMulti: {
		title: 'subredditManagerAlwaysApplySuffixToMultiTitle',
		type: 'boolean',
		value: false,
		description: 'subredditManagerAlwaysApplySuffixToMultiDesc',
	},
	dropdownEditButton: {
		title: 'subredditManagerDropdownEditButtonTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerDropdownEditButtonDesc',
	},
	shortcutDropdownDelay: {
		title: 'subredditManagerShortcutDropdownDelayTitle',
		type: 'text',
		value: '200',
		description: 'subredditManagerShortcutDropdownDelayDesc',
	},
	shortcutEditDropdownDelay: {
		title: 'subredditManagerShortcutEditDropdownDelayTitle',
		dependsOn: options => options.dropdownEditButton.value,
		type: 'text',
		value: '3000',
		description: 'subredditManagerShortcutEditDropdownDelayDesc',
	},
	allowLowercase: {
		title: 'subredditManagerAllowLowercaseTitle',
		type: 'boolean',
		value: false,
		description: 'subredditManagerAllowLowercaseDesc',
		bodyClass: true,
	},
	linkDashboard: {
		title: 'subredditManagerLinkDashboardTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkDashboardDesc',
	},
	linkAll: {
		title: 'subredditManagerLinkAllTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkAllDesc',
	},
	linkFront: {
		title: 'subredditManagerLinkFrontTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkFrontDesc',
	},
	linkPopular: {
		title: 'subredditManagerLinkPopularTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkPopularDesc',
	},
	linkProfilePosts: {
		title: 'subredditManagerLinkProfilePostsTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkProfilePostsDesc',
	},
	linkRandom: {
		title: 'subredditManagerLinkRandomTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkRandomDesc',
	},
	linkMyRandom: {
		title: 'subredditManagerLinkMyRandomTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkMyRandomDesc',
	},
	linkRandNSFW: {
		title: 'subredditManagerLinkRandNSFWTitle',
		type: 'boolean',
		value: false,
		description: 'subredditManagerLinkRandNSFWDesc',
	},
	linkUsers: {
		title: 'subredditManagerLinkUsersTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkUsersDesc',
	},
	linkFriends: {
		title: 'subredditManagerLinkFriendsTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkFriendsDesc',
	},
	linkMod: {
		title: 'subredditManagerLinkModTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkModDesc',
	},
	linkModqueue: {
		title: 'subredditManagerLinkModqueueTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkModqueueDesc',
	},
	linkSaved: {
		title: 'subredditManagerLinkSavedTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLinkSavedDesc',
	},
	buttonEdit: {
		title: 'subredditManagerButtonEditTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerButtonEditDesc',
	},
	lastUpdate: {
		title: 'subredditManagerLastUpdateTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerLastUpdateDesc',
	},
	storeSubredditVisit: {
		title: 'subredditManagerStoreSubredditVisitTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerStoreSubredditVisitDesc',
		advanced: true,
	},
	storeSubredditVisitIncognito: {
		title: 'subredditManagerStoreSubredditVisitIncognitoTitle',
		dependsOn: options => options.storeSubredditVisit.value,
		type: 'boolean',
		value: false,
		description: 'subredditManagerStoreSubredditVisitIncognitoDesc',
		advanced: true,
	},
	dragDropDelete: {
		title: 'subredditManagerDragDropDeleteTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerDragDropDeleteDesc',
		advanced: true,
	},
	displayMultiCounts: {
		title: 'subredditManagerDisplayMultiCountsTitle',
		type: 'boolean',
		value: true,
		description: 'subredditManagerDisplayMultiCountsDesc',
	},
};

let shortcutsContainer, $subredditGroupDropdown, subredditGroupDropdownUL, subredditGroupDropdownRefItem,
	$editShortcutDialog, deleteButton;

let mySubredditShortcuts = [];

const subredditsLastViewedStorage = Storage.wrap(() => `RESmodules.subredditManager.subredditsLastViewed.${loggedInUser() || 'null'}`, ({}: { [subreddit: string]: {|
	last_visited: number,
|} }));

const subredditShortcutsStorage = Storage.wrap(() => {
	const username = module.options.shortcutsPerAccount.value ? loggedInUser() : null;
	return `RESmodules.subredditManager.subredditShortcuts.${username || 'null'}`;
}, ([]: Array<{|
	subreddit: string,
	displayName: string,
	addedDate: number,
|}>));

const loadShortcuts = async () => { mySubredditShortcuts = await subredditShortcutsStorage.get(); };

// depends on loggedInUser; must be called after the username is available
const initialShortcutsLoad = _.once(() => PagePhases.sitetableStarted.then(loadShortcuts));

module.beforeLoad = () => {
	waitForDescendant(document.documentElement, '#sr-header-area').then(createSubredditBar);
};

module.contentStart = async () => {
	createSidebarShortcutToggle();

	await initialShortcutsLoad();

	watchForThings(['subreddit'], thing => {
		const titleElement = thing.getTitleElement();
		const container = thing.element.querySelector('.midcol');
		if (!titleElement || !container) return;
		const [, subreddit] = regexes.subreddit.exec(titleElement.pathname) || [];
		if (!subreddit) return;
		container.append(createShortcutToggleButton(subreddit));
	});
};

module.afterLoad = () => {
	if (module.options.lastUpdate.value && document.getElementsByClassName('listing-chooser').length) {
		lastUpdate();
	}

	const subreddit = currentSubreddit();
	if (subreddit) {
		requestAnimationFrame(() => { setLastViewtime(subreddit); });
	}
};

function createSidebarShortcutToggle() {
	// also, add a +/- shortcut button...
	const subreddit = currentSubreddit();
	if (subreddit && module.options.subredditShortcut.value) {
		const subButtons = document.querySelectorAll('.side .fancy-toggle-button');
		for (const subButton of subButtons) {
			let thisSubredditFragment, isMulti;
			if (!subreddit.includes('+') && !isCurrentSubreddit('mod')) {
				thisSubredditFragment = subreddit;
				isMulti = false;
			} else if ($(subButton).parent().hasClass('subButtons')) {
				thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
				isMulti = true;
			} else {
				thisSubredditFragment = $(subButton).next().text();
				isMulti = true;
			}
			if ($(`#subButtons-${thisSubredditFragment}`).length === 0) {
				const $subButtonsWrapper = $(`<div id="subButtons-${thisSubredditFragment}" class="subButtons"></div>`);
				$(subButton).wrap($subButtonsWrapper);
				getMultiCounts(thisSubredditFragment).then(multiCount => {
					$(subButton).append(multiCount);
				});
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					const theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			subButton.addEventListener('click', () => {
				// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
				ajax.invalidate({
					url: '/subreddits/mine.json',
					query: {
						after: '',
						limit: 100,
						user: loggedInUser(),
					},
				});
			});

			const $subButtons = $(`#subButtons-${thisSubredditFragment}`);
			const button = createShortcutToggleButton(subreddit);
			initialShortcutsLoad().then(() => button.dispatchEvent(new CustomEvent('refresh')));
			button.classList.add('RESshortcutside'); // custom subreddit styles uses this
			$subButtons.append(button);
			const $next = $subButtons.next();
			if ($next.hasClass('title') && !$subButtons.hasClass('swapped')) {
				$subButtons.before($next);
				$subButtons.addClass('swapped');
			}
		}
	}
}

export function createShortcutToggleButton(subreddit: string) {
	return CreateElement.fancyToggleButton(
		i18n('subredditInfoAddRemoveShortcut'),
		i18n('subredditInfoAddThisSubredditToShortcuts'),
		() => mySubredditShortcuts.some(shortcut => shortcut.subreddit.toLowerCase() === subreddit.toLowerCase()),
		state => {
			if (state) addSubredditShortcut(subreddit);
			else removeSubredditShortcut(subreddit);
			redrawShortcuts();
		},
	);
}

let hideSubredditGroupDropdownTimer, showSubredditGroupDropdownTimer;

function redrawShortcuts() {
	shortcutsContainer.textContent = '';

	// Reddit seems to redirect to randomly reorder multi links, so need to sort and compare
	const currentSub = (currentSubreddit() || '').toLowerCase().split('+').sort().join('+');
	const isCurrent = sub => {
		const sortedSubs = sub.replace(/\?\+/g, '+').split('+').sort();
		return sortedSubs.some(v => isCurrentSubreddit(v)) || currentSub === sortedSubs.join('+');
	};

	let i = 0;
	for (const shortcut of mySubredditShortcuts) {
		const thisShortCut = document.createElement('a');
		thisShortCut.setAttribute('orderIndex', String(i++));
		thisShortCut.setAttribute('data-subreddit', shortcut.subreddit);
		thisShortCut.classList.add('subbarlink');
		if (isCurrent(shortcut.subreddit)) thisShortCut.classList.add('RESShortcutsCurrentSub');

		thisShortCut.setAttribute('href', `/r/${shortcut.subreddit.replace(/(?:\?\+.*|\?$)/, '')}`);
		thisShortCut.textContent = shortcut.displayName;
		thisShortCut.addEventListener('click', (e: MouseEvent) => {
			if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
				// open in new tab, let the browser handle it
				return true;
			} else {
				e.preventDefault();
				followSubredditShortcut(((e.currentTarget: any): HTMLAnchorElement).href);
			}
		});

		thisShortCut.addEventListener('dblclick', (e: MouseEvent) => {
			e.preventDefault();
			followSubredditShortcut.cancel();
			hideSubredditGroupDropdown();
			editSubredditShortcut(e.currentTarget, e);
		});

		thisShortCut.addEventListener('mouseover', (e: Event) => {
			clearTimeout(hideSubredditGroupDropdownTimer);
			showSubredditGroupDropdown(e.currentTarget);
		});

		thisShortCut.addEventListener('mouseout', () => {
			clearTimeout(showSubredditGroupDropdownTimer);
			hideSubredditGroupDropdownTimer = setTimeout(() => hideSubredditGroupDropdown(), 500);
		});

		thisShortCut.addEventListener('dragstart', subredditDragStart);
		thisShortCut.addEventListener('dragenter', subredditDragEnter);
		thisShortCut.addEventListener('dragover', subredditDragOver);
		thisShortCut.addEventListener('dragleave', subredditDragLeave);
		thisShortCut.addEventListener('drop', subredditDrop);
		thisShortCut.addEventListener('dragend', subredditDragEnd);

		const sep = document.createElement('span');
		sep.setAttribute('class', 'separator');
		sep.textContent = '-';
		shortcutsContainer.append(sep);

		shortcutsContainer.append(thisShortCut, sep);
	}

	if (mySubredditShortcuts.length) {
		shortcutsContainer.style.textTransform = '';
	} else {
		shortcutsContainer.style.textTransform = 'none';
		shortcutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
	}
}

function showSubredditGroupDropdown(obj) {
	let subreddits = [];
	let suffix = '';

	if (obj.getAttribute && obj.getAttribute('data-subreddit').includes('+')) {
		let cleanSubreddits = obj.getAttribute('data-subreddit');

		if (cleanSubreddits.indexOf('/') > cleanSubreddits.lastIndexOf('+') || module.options.alwaysApplySuffixToMulti.value) {
			// for shortcuts like a+b/x, use subreddits=a+b ; suffix = x
			// for shortcuts like a/x+b/y, just split them a la pre-4.5.0
			let pos;
			if ((pos = cleanSubreddits.lastIndexOf('?')) > cleanSubreddits.lastIndexOf('+')) {
				suffix = cleanSubreddits.substr(pos);
				cleanSubreddits = cleanSubreddits.substr(0, pos);
			}
			if ((pos = cleanSubreddits.lastIndexOf('/')) > cleanSubreddits.lastIndexOf('+')) { // check both existance and correct form (i.e. not foo/new+bar)
				suffix = cleanSubreddits.substr(pos) + suffix;
				cleanSubreddits = cleanSubreddits.substr(0, pos);
			}
		}
		subreddits = cleanSubreddits.replace(/\?\+/g, '+').split('+');
	}

	if (!(subreddits.length || module.options.dropdownEditButton.value)) {
		return;
	}

	let delay;

	if (subreddits.length) {
		delay = parseInt(module.options.shortcutDropdownDelay.value, 10);
	} else {
		delay = parseInt(module.options.shortcutEditDropdownDelay.value, 10);
	}

	clearTimeout(showSubredditGroupDropdownTimer);
	showSubredditGroupDropdownTimer = setTimeout(
		() => _showSubredditGroupDropdown(obj, subreddits, suffix),
		delay,
	);
}

function _showSubredditGroupDropdown(obj, subreddits, suffix) {
	// Updates source object referenced on the 'click' events
	subredditGroupDropdownRefItem = obj;
	// Show dropdown after an appropriate delay
	if (!$subredditGroupDropdown) {
		$subredditGroupDropdown = $('<div>', { id: 'RESSubredditGroupDropdown' });
		subredditGroupDropdownUL = document.createElement('ul');
		$subredditGroupDropdown.append(subredditGroupDropdownUL);

		if (module.options.dropdownEditButton.value) {
			$subredditGroupDropdown.append(`
				<div class="RESShortcutsEditButtons">
					<a href="#" class="delete res-icon" title="delete">&#xF155;</a>
					<a href="#" class="edit res-icon" title="edit">&#xF139;</a>
				</div>
			`);
		}
		$subredditGroupDropdown.appendTo(document.body);

		$subredditGroupDropdown.on('mouseout', () => {
			hideSubredditGroupDropdownTimer = setTimeout(() => {
				hideSubredditGroupDropdown();
			}, 500);
		});

		$subredditGroupDropdown.on('mouseover', () => {
			clearTimeout(hideSubredditGroupDropdownTimer);
		});

		$subredditGroupDropdown.on('click', '.edit', (e: MouseEvent) => {
			e.preventDefault();
			hideSubredditGroupDropdown();
			editSubredditShortcut(subredditGroupDropdownRefItem, e);
		});

		$subredditGroupDropdown.on('click', '.delete', (e: MouseEvent) => {
			e.preventDefault();
			hideSubredditGroupDropdown();
			editSubredditShortcut(subredditGroupDropdownRefItem, e);
			deleteButton.click();
		});
	}

	$(subredditGroupDropdownUL).find('li:not(.RESShortcutsEditButtons)').remove();

	if (subreddits) {
		const $rows = subreddits.reduce(($collection, subreddit) => {
			const $thisLI = $(`<li><a href="/r/${subreddit}${suffix}">${subreddit}<span class="shortcutSuffix">${suffix}</span></a></li>`);
			if (isCurrentSubreddit(subreddit)) {
				$thisLI.addClass('RESShortcutsCurrentSub');
			}
			return $collection.add($thisLI);
		}, $());

		$(subredditGroupDropdownUL).prepend($rows);
	}

	const { left } = $(obj).offset();
	const { bottom } = document.querySelector('#sr-header-area').getBoundingClientRect();
	$subredditGroupDropdown
		.css({ top: `${bottom}px`, left: `${left}px` })
		.show();
}

function hideSubredditGroupDropdown() {
	hideSubredditGroupDropdownTimer = undefined;
	if ($subredditGroupDropdown) {
		$subredditGroupDropdown.hide();
	}
}

function editSubredditShortcut(ele, event) {
	const subreddit = ele.getAttribute('data-subreddit');

	const idx = mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit === subreddit);

	if (!$editShortcutDialog) {
		$editShortcutDialog = $('<div>', { id: 'editShortcutDialog' })
			.appendTo(document.body);
	}

	const unsortable = !subreddit.includes('+');

	const thisForm = `
		<form name="editSubredditShortcut">
			<h3>Edit Shortcut</h3>
			<div id="editShortcutClose" class="RESCloseButton RESCloseButtonTopRight"></div>
			<div class="RESFormItem">
				<label for="subreddit">Subreddit:</label>
				<div class="RESFieldItem">
					<input type="text" name="subreddit" value="${subreddit}" id="shortcut-subreddit" class="${unsortable ? 'unsortable' : ''}"><!-- no whitespace
					--><button type="submit" id="sortButton" title="Sort subreddits">A-Z</button>

					<div class="RESDescription">Put a + between subreddits to make a drop-down menu.<br/>Put ?+ to make subreddits after it only show in dropdown.</div>
				</div>
			</div>
			<div class="RESFormItem">
				<label for="displayName">Display Name:</label>
				<div class="RESFieldItem">
					<input type="text" name="displayName" value="${ele.textContent}" id="shortcut-displayname">
				</div>
			</div>
			<input type="hidden" name="idx" value="${idx}">
			<button type="button" name="shortcut-save" id="shortcut-save">save</button>
			<button type="button" name="shortcut-delete" id="shortcut-delete">delete</button>
		</form>
	`;
	$editShortcutDialog.html(thisForm);

	$editShortcutDialog.find('#shortcut-subreddit').on('keyup', _.throttle(({ currentTarget: shortcut }: KeyboardEvent) => {
		if (!(shortcut: any).value.includes('+')) {
			shortcut.classList.add('unsortable');
		} else {
			shortcut.classList.remove('unsortable');
		}
	}, 500));
	const subredditInput = $editShortcutDialog.find('input[name=subreddit]').get(0);
	const displayNameInput = $editShortcutDialog.find('input[name=displayName]').get(0);

	$editShortcutDialog.find('FORM').on('submit', e => e.preventDefault());

	const saveButton = $editShortcutDialog
		.find('button[name=shortcut-save]')
		.click(() => {
			const idx = $editShortcutDialog.find('input[name=idx]').val();
			const subreddit = $editShortcutDialog.find('input[name=subreddit]').val();
			const displayName = $editShortcutDialog.find('input[name=displayName]').val();

			saveSubredditShortcut(subreddit, displayName, idx);
			$editShortcutDialog.hide();
		})
		.get(0);

	deleteButton = $editShortcutDialog.find('button[name=shortcut-delete]').get(0);
	deleteButton.addEventListener('click', () => {
		const idx = $editShortcutDialog.find('input[name=idx]').val();

		if (confirm('Are you sure you want to delete this shortcut?')) {
			saveSubredditShortcut('', '', idx);
			$editShortcutDialog.hide();
		}
	});

	// Allow the shortcut dropdown menu to be sorted
	function sortSubmenu(e) {
		const inputEl: HTMLInputElement = ($editShortcutDialog.find('input[name=subreddit]').get(0): any);
		const currStr = inputEl.value;
		// sort ASC
		const ascArr = currStr.split('+');
		ascArr.sort();
		const ascStr = ascArr.join('+');
		// sort DESC
		const descArr = ascArr;
		descArr.reverse();
		const descStr = descArr.join('+');
		let btnTxt;
		if (e.target instanceof HTMLButtonElement && e.target.type === 'submit') {
			// if sorted ASC, sort DESC. If unsorted or sorted DESC, sort ASC
			inputEl.value = (currStr === ascStr ? descStr : ascStr);
			btnTxt = (currStr === ascStr ? 'A-Z' : 'Z-A');
		} else {
			btnTxt = (currStr === ascStr ? 'Z-A' : 'A-Z');
		}
		$('#sortButton').text(btnTxt);
	}

	// handle the sort button
	$editShortcutDialog.find('#sortButton').click(sortSubmenu);

	// handle the subreddit textfield
	$editShortcutDialog.find('input[name=subreddit]').on('change', sortSubmenu);

	// handle enter and escape keys in the dialog box...
	subredditInput.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Enter) {
			e.preventDefault();
			e.stopPropagation();
		}
	});
	subredditInput.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Escape) {
			$editShortcutDialog
				.hide()
				.blur();
		} else if (e.key === NAMED_KEYS.Enter) {
			click(saveButton);
		}
	});
	displayNameInput.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Escape) {
			$editShortcutDialog
				.hide()
				.blur();
		} else if (e.key === NAMED_KEYS.Enter) {
			click(saveButton);
		}
	});

	// cancel button
	$editShortcutDialog.find('#editShortcutClose').click(() => {
		$editShortcutDialog.hide();
	});

	$editShortcutDialog.show();
	// add 20px to compensate for scrollbar
	const thisLeft = Math.min(event.clientX, window.innerWidth - ($editShortcutDialog.get(0).offsetWidth + 20));
	$editShortcutDialog.css('left', `${thisLeft}px`);

	setTimeout(() => subredditInput.focus(), 200);
}

async function saveSubredditShortcut(subreddit, displayName, idx) {
	if (subreddit === '' || displayName === '') {
		subreddit = mySubredditShortcuts[idx].subreddit;
		await removeSubredditShortcut(subreddit);
	} else {
		mySubredditShortcuts[idx] = {
			subreddit,
			displayName,
			addedDate: Date.now(),
		};

		saveLatestShortcuts();
	}

	redrawShortcuts();
}

const followSubredditShortcut = _.debounce(url => { location.href = url; }, 300);

let dragSrcEl, srDataTransfer;

function subredditDragStart(e: DragEvent) {
	followSubredditShortcut.cancel();
	// Target (this) element is the source node.
	this.style.opacity = '0.4';
	dragSrcEl = this; // eslint-disable-line consistent-this
	if (module.options.dragDropDelete.value) {
		addTrashBin(dragSrcEl);
	}

	// $FlowIssue
	e.dataTransfer.effectAllowed = 'move';
	// because Safari is stupid, we have to do this.
	srDataTransfer = `${this.getAttribute('orderIndex')},${$(this).data('subreddit')}`;
}

function subredditDragEnter() {
	this.classList.add('srOver');
	return false;
}

function subredditDragOver(e: DragEvent) {
	if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
	}

	if ($subredditGroupDropdown) {
		$subredditGroupDropdown.hide();
	}

	// $FlowIssue
	e.dataTransfer.dropEffect = 'move';
	return false;
}

function subredditDragLeave() {
	this.classList.remove('srOver');
	return false;
}

function subredditDrop(e: DragEvent) {
	if (e.stopPropagation) {
		e.stopPropagation(); // Stops some browsers from redirecting.
	}

	// Stops other browsers from redirecting.
	e.preventDefault();

	// Don't do anything if dropping the same column we're dragging.
	if (dragSrcEl !== this) {
		if (e.target.getAttribute('id') !== 'res-shortcut-trash') {
			// get the order index of the src and destination to swap...
			// const theData = e.dataTransfer.getData('text/html').split(',');
			const theData = srDataTransfer.split(',');
			const srcOrderIndex = parseInt(theData[0], 10);
			const srcSubreddit = mySubredditShortcuts[srcOrderIndex];
			const destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
			const destSubreddit = mySubredditShortcuts[destOrderIndex];
			const rearranged = [];
			let rearrangedI = 0;

			mySubredditShortcuts.forEach((shortcut, i) => {
				if ((i !== srcOrderIndex) && (i !== destOrderIndex)) {
					rearranged[rearrangedI] = shortcut;
					rearrangedI++;
				} else if (i === destOrderIndex) {
					if (destOrderIndex > srcOrderIndex) {
						// if dragging right, order dest first, src next.
						rearranged[rearrangedI] = destSubreddit;
						rearrangedI++;
						rearranged[rearrangedI] = srcSubreddit;
						rearrangedI++;
					} else {
						// if dragging left, order src first, dest next.
						rearranged[rearrangedI] = srcSubreddit;
						rearrangedI++;
						rearranged[rearrangedI] = destSubreddit;
						rearrangedI++;
					}
				}
			});

			// save the updated order...
			mySubredditShortcuts = rearranged;
			saveLatestShortcuts();
			// redraw the shortcut bar...
			redrawShortcuts();
		} else {
			const theData = srDataTransfer.split(',');
			const srcSubreddit = theData[1];
			removeSubredditShortcut(srcSubreddit);
		}
	}
	return false;
}

function subredditDragEnd() {
	this.style.opacity = '1';
	this.classList.remove('srOver');
	if (module.options.dragDropDelete.value) {
		removeTrashBin();
	}
	return false;
}

async function createSubredditBar(headerContents) {
	const originalShortcuts: HTMLAnchorElement[] = (Array.from(document.querySelectorAll('.sr-list a.choice')): any[]);
	const myRandom = module.options.linkMyRandom.value && originalShortcuts.find(({ pathname }) => pathname === '/r/myrandom/');
	const myRandomGold = myRandom && myRandom.classList.contains('gold');
	const users = module.options.linkUsers.value && originalShortcuts.find(({ pathname }) => pathname === '/users/');
	const originalFrontpage = originalShortcuts.find(({ pathname }) => pathname === '/');
	const originalPopular = originalShortcuts.find(({ pathname }) => pathname === '/r/popular/');
	const originalProfilePosts = originalShortcuts.find(({ pathname }) => pathname === '/r/profileposts/');

	// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
	empty(headerContents);

	await initialShortcutsLoad();

	const user = loggedInUser();

	const staticShortcutsHTML = [
		module.options.linkDashboard.value && '<a class="subbarlink" href="/r/Dashboard/">Dashboard</a>',
		module.options.linkFront.value && originalFrontpage && `<a class="subbarlink" href="/">${originalFrontpage.textContent}</a>`,
		module.options.linkPopular.value && originalPopular && `<a class="subbarlink" href="/r/popular/">${originalPopular.textContent}</a>`,
		module.options.linkProfilePosts.value && originalProfilePosts && `<a class="subbarlink" href="/r/profileposts/">${originalProfilePosts.textContent}</a>`,
		module.options.linkAll.value && '<a class="subbarlink" href="/r/all/">All</a>',
		module.options.linkRandom.value && '<a class="subbarlink" href="/r/random/">Random</a>',
		module.options.linkMyRandom.value && myRandom && `<a class="subbarlink ${myRandomGold ? 'gold' : ''}" href="/r/myrandom/">MyRandom</a>`,
		module.options.linkUsers.value && users && '<a class="subbarlink" href="/users/">Users</a>',
		module.options.linkRandNSFW.value && '<a class="over18 subbarlink" href="/r/randnsfw/">RandNSFW</a>',
		user && [
			module.options.linkFriends.value && '<a class="subbarlink" href="/r/friends/">Friends</a>',
			isModeratorAnywhere() && [
				module.options.linkMod.value && '<a class="subbarlink" href="/r/mod/">Mod</a>',
				module.options.linkModqueue.value && '<a class="subbarlink" href="/r/mod/about/modqueue">Modqueue</a>',
			],
			module.options.linkSaved.value && `<a class="subbarlink" href="/user/${user}/saved">Saved</a>`,
		],
		module.options.buttonEdit.value && `${SettingsNavigation.makeUrlHashLink(module.moduleID, '', 'edit', 'subbarlink res-sr-options-link')}`,
	]
	// $FlowIssue Array#flat
		.flat(3)
		.filter(Boolean)
		.join('<span class="separator">-</span>');

	headerContents.append(...string.html`<span>
		<div id="srLeftContainer" class="sr-bar">
			<div id="srDropdown">
					<div id="srDropdownContainer"><a href="javascript:void 0">My Subreddits</a></div>
			</div>
			<div id="RESStaticShortcuts"><span class="separator">-</span>${string.safe(staticShortcutsHTML)}</div>
			<span class="srSep">|</span>
		</div>
		<div id="RESShortcutsViewport">
			<div id="RESShortcuts" class="sr-bar"></div>
		</div>
		<div id="RESShortcutsEditContainer">
			<div id="RESShortcutsSort" title="sort subreddit shortcuts">↑↓</div>
			<div id="RESShortcutsRight">&gt;</div>
			<div id="RESShortcutsAdd" class="res-icon" title="add shortcut"></div>
			<div id="RESShortcutsLeft">&lt;</div>
		</div>
	</span>`.children);

	headerContents.querySelector('#srDropdownContainer').addEventListener('click', (e: MouseEvent) => {
		e.stopImmediatePropagation();
		toggleSubredditDropdown();
	});

	shortcutsContainer = headerContents.querySelector('#RESShortcuts');

	const choice = [...headerContents.querySelectorAll('.subbarlink:not(.res-sr-options-link)')]
		.find(link => link instanceof HTMLAnchorElement && fullLocation(link.pathname) === fullLocation());
	if (choice) choice.classList.add('RESShortcutsCurrentSub');

	const shortcutsEditContainer = document.createElement('div');
	shortcutsEditContainer.classList.add('res-sr-edit');

	headerContents.querySelector('#RESShortcutsSort').addEventListener('click', async ({ currentTarget }: MouseEvent) => {
		const menu = sortMenu();
		document.body.append(menu);
		const { bottom, left } = currentTarget.getBoundingClientRect();
		menu.style.top = `${bottom}px`;
		menu.style.left = `${Math.min(document.body.getBoundingClientRect().width - menu.getBoundingClientRect().width, left)}px`;
		await waitForEvent(menu, 'mouseleave');
		menu.remove();
	});

	const addButton = headerContents.querySelector('#RESShortcutsAdd');
	addButton.addEventListener('click', () => { toggleShortCutsAddForm(); });

	const leftButton = headerContents.querySelector('#RESShortcutsLeft');
	leftButton.addEventListener('click', () => {
		const firstChild: HTMLElement = (shortcutsContainer.firstChild: any);
		const containerMargin = parseInt(firstChild.style.marginLeft, 10) || 0;
		const shiftWidth = Math.floor($('#RESShortcutsViewport').width()) - 80;
		const marginLeft = containerMargin + shiftWidth;
		if (marginLeft <= 0) {
			firstChild.style.marginLeft = `${marginLeft}px`;
		}
	});

	const rightButton = headerContents.querySelector('#RESShortcutsRight');
	rightButton.addEventListener('click', () => {
		const firstChild: HTMLElement = (shortcutsContainer.firstChild: any);
		let marginLeft = firstChild.style.marginLeft;
		marginLeft = parseInt(marginLeft.replace('px', ''), 10);

		if (isNaN(marginLeft)) marginLeft = 0;

		const shiftWidth = $('#RESShortcutsViewport').width() - 80;
		if (shortcutsContainer.offsetWidth > (shiftWidth)) {
			marginLeft -= shiftWidth;
			firstChild.style.marginLeft = `${marginLeft}px`;
		}
	});

	redrawShortcuts();
}

const trashBin = _.once(() => {
	const $title = $('<div>', { class: 'res-shortcut-trash-title' });

	const $trashZone = $('<div>', { id: 'res-shortcut-trash-zone', class: 'res-icon' });
	const shortCutsTrash = $trashZone.get(0);
	shortCutsTrash.addEventListener('dragenter', subredditDragEnter);
	shortCutsTrash.addEventListener('dragleave', subredditDragLeave);
	shortCutsTrash.addEventListener('dragover', subredditDragOver);
	shortCutsTrash.addEventListener('drop', subredditDrop);

	const $wrapper = $('<div>', { id: 'res-shortcut-trash' })
		.append(
			$title,
			$trashZone,
			$('<div>', {
				id: 'res-dragDrop-tip',
				text: 'Did you know? You can arrange shortcuts by dragging them left & right along the top bar.',
			}),
		);

	return {
		$wrapper,
		$trashZone,
		$title,
	};
});

function toggleShortCutsAddForm() {
	let shortCutsAddFormContainer = document.querySelector('RESShortcutsAddFormContainer');

	const close = () => shortCutsAddFormContainer.remove();

	if (shortCutsAddFormContainer) {
		close();
		return;
	}

	shortCutsAddFormContainer = document.createElement('div');
	shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
	shortCutsAddFormContainer.append(string.html`
		<form id="shortCutsAddForm">
			<div><strong>Add Shortcut</strong></div>
			<div class="res-shortcuts-add-tip">Put a &plus; between subreddits to make a multireddit.</div>
			<div><label for="newShortcut">Subreddit:</label><input type="text" id="newShortcut"></div>
			<div><label for="displayName">Display Name:</label><input type="text" id="displayName"></div>
			<input type="submit" name="submit" value="add" id="addSubreddit">
			<div class="res-shortcuts-add-footer"><a href="/subreddits/">manage subscribed</a></div>
		</form>
	`);
	const shortCutsAddFormField: HTMLInputElement = (shortCutsAddFormContainer.querySelector('#newShortcut'): any);
	const shortCutsAddFormFieldDisplayName: HTMLInputElement = (shortCutsAddFormContainer.querySelector('#displayName'): any);

	shortCutsAddFormField.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Escape) close();
	});

	shortCutsAddFormFieldDisplayName.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.key === NAMED_KEYS.Escape) close();
	});

	// add the "add shortcut" form...
	const shortCutsAddForm = shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
	shortCutsAddForm.addEventListener('submit', e => {
		e.preventDefault();
		let subreddit = shortCutsAddFormField.value;
		let displayname = shortCutsAddFormFieldDisplayName.value;
		if (displayname === '') displayname = subreddit;

		subreddit = subreddit.replace(/^\/?r\//i, '');

		if (subreddit) {
			addSubredditShortcut(subreddit, displayname);
		}

		close();
	});

	document.body.append(shortCutsAddFormContainer);
	shortCutsAddFormField.focus();

	if (module.options.dragDropDelete.value) {
		const trashOpenLink = string.html`<a class="res-trash-open" href="javascript: void 0" title="Choose which shortcuts to remove"><span class="res-icon">&#xF155;</span> remove shortcuts...</a>`;
		$('#RESShortcutsAddFormContainer .res-shortcuts-add-footer').prepend(trashOpenLink, ' | ');
		trashOpenLink.addEventListener('click', () => { addTrashBin(); });
	}
}

const $pageOverlay = _.once(() => {
	const srHeaderArea = document.querySelector('#sr-header-area');

	return $('<div>', { id: 'res-trash-overlay' })
		.css({ top: `${srHeaderArea.offsetHeight}px` })
		.click(() => removeTrashBin());
});

function addTrashBin(shortcut) {
	// hide other elements.
	if ($subredditGroupDropdown) {
		$subredditGroupDropdown.hide();
	}

	// set the title.
	if (shortcut) {
		trashBin().$title.html(string.escape`Drop here to delete shortcut <strong>${$(shortcut).text()}</strong>`);
	} else {
		trashBin().$title.text('Drag and drop shortcuts to delete them');
	}

	// add trash bin
	trashBin().$wrapper
		.appendTo(document.body)
		.show();
	// add overlay
	$pageOverlay()
		.appendTo(document.body)
		.show();
}

function removeTrashBin() {
	$pageOverlay().hide();
	trashBin().$wrapper.hide();
	trashBin().$trashZone.removeClass('srOver');
}

const sortMenu = _.once(() => {
	const element = string.html`
	<div id="sort-menu" style="display: block" class="drop-choices">
		<p>&nbsp;sort by:</p>
		<a class="choice" data-field="displayName" href="javascript:void 0">display name</a>
		<a class="choice" data-field="addedDate" href="javascript:void 0">added date</a>
	</div>`;

	let lastField;

	$(element).find('a').click(({ currentTarget }) => {
		const field = currentTarget.dataset.field;
		const sameField = lastField === field;
		lastField = field;
		sortShortcuts(sameField ? null : field, sameField);
	});

	return element;
});

function sortShortcuts(field, reverse) {
	if (field) mySubredditShortcuts.sort((a, b) => String(a[field]).localeCompare(String(b[field]), undefined, { numeric: true, sensitivity: 'base' }));
	if (reverse) mySubredditShortcuts.reverse();

	// Refresh shortcuts
	redrawShortcuts();

	// Save shortcuts sort order
	saveLatestShortcuts();
}

const srList = _.once(async () => {
	const element = document.createElement('div');
	element.id = 'srList';

	const user = loggedInUser();
	if (!user) {
		element.append(string.html`<div>You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/subreddits/">browse them all</a></div>`);
		return element;
	}

	element.append(string.html`<div>Loading subreddits (may take a moment)...</div>`);

	try {
		const table = await getMySubredditsTable(user);
		empty(element);
		element.append(string.html`<a style="float: right;" href="/subreddits/">View all &raquo;</a>`, table);
	} catch (e) {
		console.error(e);
		element.append(string.html`<span>There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com'</span>`);
	}

	return element;
});

async function toggleSubredditDropdown(e?: Event) {
	const ele = await srList();
	if (ele && e && (ele.contains(e.target) || !document.contains(e.target))) return;

	if (document.body.contains(ele)) {
		ele.remove();
		document.body.removeEventListener('click', toggleSubredditDropdown);
	} else {
		document.body.append(ele);
		document.body.addEventListener('click', toggleSubredditDropdown);
	}
}

async function getMySubredditsTable(user) {
	const headers = {
		subreddit: 'subreddit',
		...(module.options.storeSubredditVisit.value ? { lastVisited: 'last visited' } : {}),
		shortcutToggle: '',
	};

	const mySubreddits = new Map();
	let after = '';

	do {
		const { data } = (await ajax({ // eslint-disable-line no-await-in-loop
			url: '/subreddits/mine.json',
			query: {
				after,
				limit: 100,
				user, // for the cache
			},
			type: 'json',
			cacheFor: DAY,
		}): RedditListing<RedditSubreddit>);

		if (data && data.children) {
			// fields include display_name, url, over18, id, created, description
			for (const { data: sub } of data.children) mySubreddits.set(sub.display_name, sub);

			after = data.after;
		} else if (!after) {
			throw new Error('No subreddits feched?');
		}
	} while (after);

	const subredditsLastViewed = await subredditsLastViewedStorage.get();

	const getRow = ({ display_name: displayName, url }) => {
		const lv = subredditsLastViewed[displayName.toLowerCase()];
		const ts = lv && parseInt(lv.last_visited, 10);
		const theLV = document.createElement('span');
		if (ts) {
			const dateVisited = new Date(ts);
			theLV.textContent = formatRelativeTime(dateVisited);
			theLV.setAttribute('title', formatDate(dateVisited));
			theLV.setAttribute('sort-value', String(Number.MAX_SAFE_INTEGER - dateVisited.getTime()));
		} else {
			theLV.textContent = 'N/A';
		}

		const shortcutToggle = createShortcutToggleButton(displayName);
		shortcutToggle.style.cursor = 'pointer';
		shortcutToggle.className = '';

		return {
			subreddit: string.html`<a href="${url}">${displayName}</a>`,
			lastVisited: theLV,
			shortcutToggle,
		};
	};

	const data = [...mySubreddits.values()];
	const table = new Table.RESTable(headers, data, getRow, { pageSize: Infinity, sortBy: 'subreddit' });

	const ele = document.createElement('div');
	ele.append(
		table.createSearchElement(({ display_name: displayName }) => displayName, i18n('subredditManagerFilterPlaceholder'), true),
		table.element,
	);

	return ele;
}

export async function getMultiCounts(displayName: string): Promise<string> {
	if (!module.options.displayMultiCounts.value) return '';
	const user = loggedInUser();
	if (!user) return '';
	const multis = await ajax({
		url: `/api/multi/user/${user}`,
		type: 'json',
		cacheFor: DAY,
	});
	const count = multis.filter(multi => multi.data.subreddits.some(sr => sr.name === displayName)).length;
	if (count) return string.escape`<span class="multi-count" title="${i18n('subredditManagerMultiCountTitle', displayName, count)}">${count}</span>`;
	else return '';
}

function saveLatestShortcuts() {
	subredditShortcutsStorage.set(mySubredditShortcuts || []);
}

async function addSubredditShortcut(subreddit, displayname) {
	await loadShortcuts();

	const idx = mySubredditShortcuts.findIndex(shortcut =>
		shortcut.subreddit.toLowerCase() === subreddit.toLowerCase(),
	);

	if (idx !== -1) {
		Alert.open('Whoops, you already have a shortcut for that subreddit');
	} else {
		displayname = displayname || subreddit;
		const subredditObj = {
			subreddit,
			displayName: displayname.toLowerCase(),
			addedDate: Date.now(),
		};

		mySubredditShortcuts.push(subredditObj);

		saveLatestShortcuts();
		redrawShortcuts();

		Notifications.showNotification({
			moduleID: 'subredditManager',
			message: 'Subreddit shortcut added. You can edit by double clicking the shortcut.',
		});
	}
}

async function removeSubredditShortcut(subreddit) {
	await loadShortcuts();

	const idx = mySubredditShortcuts.findIndex(shortcut =>
		shortcut.subreddit.toLowerCase() === subreddit.toLowerCase(),
	);

	if (idx !== -1) {
		mySubredditShortcuts.splice(idx, 1);

		saveLatestShortcuts();
		redrawShortcuts();
	}
}

function setLastViewtime(subreddit) {
	if (!module.options.storeSubredditVisit.value) return;
	if (!module.options.storeSubredditVisitIncognito.value && isPrivateBrowsing()) return;

	subredditsLastViewedStorage.patch({ [subreddit.toLowerCase()]: { last_visited: Date.now() } });
}

export function subscribeToSubreddit(subredditName: string, subscribe?: boolean = true) {
	// subredditName should look like t5_123asd
	return ajax({
		method: 'POST',
		url: '/api/subscribe',
		data: {
			sr: subredditName,
			action: subscribe ? 'sub' : 'unsub',
		},
	});
}

async function lastUpdate() {
	const mySubredditList = $('.drop-choices.srdrop a').map(function() { return this.textContent; }).toArray().join();
	const mySubredditListCachedObject = await Session.get('RESmodules.subredditManager.mySubredditList') || {};
	const mySubredditListCached = mySubredditListCachedObject[loggedInUser() || 'null']; // last saved subreddit lsit + time for current user
	let _lastUpdate;
	if (mySubredditListCached && mySubredditListCached.list === mySubredditList) {
		_lastUpdate = parseInt((new Date().getTime() - mySubredditListCached.time) / 60000, 10);
		if (_lastUpdate > 31) {
			_lastUpdate = false; // the user have probably less than 50/100 subscription, this module doesn't concern him
			mySubredditListCached.time = new Date().getTime() - 32 * 60000; // we change time to avoid deleting it just after (to don't show him again the last update)
		} else {
			_lastUpdate += _lastUpdate > 1 ? ' minutes ago' : ' minute ago';
		}
	} else { // the mySubreddit list is different than the cached version, subreddit have reloaded them. We reset the cache. (Or there is no cached version)
		mySubredditListCachedObject[loggedInUser() || 'null'] = {
			list: mySubredditList,
			time: new Date().getTime(),
		};
		_lastUpdate = 'just now';
	}
	if (_lastUpdate !== false && mySubredditListCached) { // Show only if there is cached version and the user have enough subscription
		$('.listing-chooser a:first .description').after(`<br /><span class="description"><b>last update:</b><br />${_lastUpdate}</span>`);
	}
	// we now remove inactive user
	const inactiveThreshold = new Date().getTime() - 2592000000; // one month
	for (const [user, cachedObject] of Object.entries(mySubredditListCachedObject)) {
		if (cachedObject.time < inactiveThreshold) {
			delete mySubredditListCachedObject[user];
		}
	}
	Session.set('RESmodules.subredditManager.mySubredditList', mySubredditListCachedObject);
}
