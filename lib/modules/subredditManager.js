/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Alert,
	DAY,
	click,
	currentSubreddit,
	formatDate,
	isCurrentSubreddit,
	isModeratorAnywhere,
	loggedInUser,
	regexes,
	string,
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
module.options = {
	subredditShortcut: {
		type: 'boolean',
		value: true,
		description: 'Add +shortcut button in subreddit sidebar for easy addition of shortcuts.',
	},
	shortcutsPerAccount: {
		type: 'boolean',
		value: true,
		description: 'Show personalized shortcuts for each account',
	},
	alwaysApplySuffixToMulti: {
		type: 'boolean',
		value: false,
		description: 'For multi-subreddit shortcuts like a+b+c/x, show a dropdown like a/x, b/x, c/x',
	},
	dropdownEditButton: {
		type: 'boolean',
		value: true,
		description: 'Show "edit" and "delete" buttons in dropdown menu on subreddit shortcut bar',
	},
	shortcutDropdownDelay: {
		type: 'text',
		value: '200',
		description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown. (This particularly applies for shortcuts to multi-subreddits like sub1+sub2+sub3.)',
	},
	shortcutEditDropdownDelay: {
		dependsOn: options => options.dropdownEditButton.value,
		type: 'text',
		value: '3000',
		description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown edit buttons. (This particularly applies to just the edit/delete button dropdown.)',
	},
	allowLowercase: {
		type: 'boolean',
		value: false,
		description: 'Allow lowercase letters in shortcuts instead of forcing uppercase',
		bodyClass: true,
	},
	linkDashboard: {
		type: 'boolean',
		value: true,
		description: 'Show "DASHBOARD" link in subreddit manager',
	},
	linkAll: {
		type: 'boolean',
		value: true,
		description: 'Show "ALL" link in subreddit manager',
	},
	linkFront: {
		type: 'boolean',
		value: true,
		description: 'show "FRONT" link in subreddit manager',
	},
	linkPopular: {
		type: 'boolean',
		value: true,
		description: 'show "POPULAR" link in subreddit manager',
	},
	linkRandom: {
		type: 'boolean',
		value: true,
		description: 'Show "RANDOM" link in subreddit manager',
	},
	linkMyRandom: {
		type: 'boolean',
		value: true,
		description: 'Show "MYRANDOM" link in subreddit manager (reddit gold only)',
	},
	linkRandNSFW: {
		type: 'boolean',
		value: false,
		description: 'Show "RANDNSFW" link in subreddit manager',
	},
	linkFriends: {
		type: 'boolean',
		value: true,
		description: 'Show "FRIENDS" link in subreddit manager',
	},
	linkMod: {
		type: 'boolean',
		value: true,
		description: 'Show "MOD" link in subreddit manager',
	},
	linkModqueue: {
		type: 'boolean',
		value: true,
		description: 'Show "MODQUEUE" link in subreddit manager',
	},
	linkSaved: {
		type: 'boolean',
		value: true,
		description: 'Show "SAVED" link in subreddit manager',
	},
	buttonEdit: {
		type: 'boolean',
		value: true,
		description: 'Show "EDIT" button in subreddit manager',
	},
	lastUpdate: {
		type: 'boolean',
		value: true,
		description: 'Show last update information on the front page (work only if you have at least 50/100 subscription, see <a href="/r/help/wiki/faq#wiki_some_of_my_subreddits_keep_disappearing.__why.3F">here</a> for more info).',
	},
	storeSubredditVisit: {
		type: 'boolean',
		value: true,
		description: 'Store the last time you visited a subreddit.',
		advanced: true,
	},
	storeSubredditVisitIncognito: {
		dependsOn: options => options.storeSubredditVisit.value,
		type: 'boolean',
		value: false,
		description: 'Store the last time you visited a subreddit in incognito/private mode.',
		advanced: true,
	},
	dragDropDelete: {
		type: 'boolean',
		value: true,
		description: 'Show a trash bin while dragging subreddit shortcuts.',
		advanced: true,
	},
	displayMultiCounts: {
		type: 'boolean',
		value: true,
		description: 'Show a badge on the subscribe button counting how many multireddits include this subreddit.',
	},
};

let shortCutsContainer, $subredditGroupDropdown, subredditGroupDropdownUL, $srList,
	$editShortcutDialog, deleteButton, $sortMenu, gettingSubreddits,
	subredditsLastViewed, sortShortcutsButton;

export let mySubredditShortcuts = [];

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

module.beforeLoad = () => {
	if (/^\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.pathname)) {
		watchForThings(['subreddit'], browsingReddits);
	}
};

module.go = async () => {
	if (module.options.lastUpdate.value && document.getElementsByClassName('listing-chooser').length) {
		lastUpdate();
	}

	// depends on loggedInUser; must be called after body is ready
	await getLatestShortcuts();

	manageSubreddits();

	const subreddit = currentSubreddit();
	if (subreddit) {
		setLastViewtime(subreddit);
	}
};

function manageSubreddits() {
	// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
	redrawSubredditBar();
	// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
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
					data: {
						after: '',
						limit: 100,
						user: loggedInUser(),
					},
				});
			});
			const theSC = document.createElement('span');
			theSC.setAttribute('class', 'res-fancy-toggle-button RESshortcut RESshortcutside');
			theSC.setAttribute('data-subreddit', thisSubredditFragment);
			const idx = mySubredditShortcuts.findIndex(shortcut =>
				shortcut.subreddit.toLowerCase() === thisSubredditFragment.toLowerCase()
			);
			if (idx !== -1) {
				theSC.textContent = '-shortcut';
				theSC.setAttribute('title', 'Remove this subreddit from your shortcut bar');
				theSC.classList.add('remove');
			} else {
				theSC.textContent = '+shortcut';
				theSC.setAttribute('title', 'Add this subreddit to your shortcut bar');
			}
			theSC.addEventListener('click', toggleSubredditShortcut);
			// subButton.parentNode.insertBefore(theSC, subButton);
			// theSubredditLink.appendChild(theSC);
			const $subButtons = $(`#subButtons-${thisSubredditFragment}`);
			$subButtons.append(theSC);
			const $next = $subButtons.next();
			if ($next.hasClass('title') && !$subButtons.hasClass('swapped')) {
				$subButtons.before($next);
				$subButtons.addClass('swapped');
			}
		}
	}
}

function browsingReddits(thing) {
	const titleElement = thing.getTitleElement();
	if (!titleElement) return;

	const subreddit = regexes.subreddit.exec(titleElement.pathname)[1];
	const $theSC = $('<span>')
			.css({ 'margin-right': '0' })
			.addClass('res-fancy-toggle-button')
			.data('subreddit', subreddit);
	const isShortcut = mySubredditShortcuts.some(shortcut => shortcut.subreddit === subreddit);

	if (isShortcut) {
		$theSC
				.attr('title', 'Remove this subreddit from your shortcut bar')
				.text('-shortcut')
				.addClass('remove');
	} else {
		$theSC
				.attr('title', 'Add this subreddit to your shortcut bar')
				.text('+shortcut')
				.removeClass('remove');
	}

	$theSC
			.on('click', toggleSubredditShortcut)
			.appendTo(thing.element.querySelector('.midcol'));
}

let hideSubredditGroupDropdownTimer, showSubredditGroupDropdownTimer;

function redrawShortcuts() {
	shortCutsContainer.textContent = '';
	// go through the list of shortcuts and print them out...
	mySubredditShortcuts.forEach((shortcut, i) => {
		const thisShortCut = document.createElement('a');
		thisShortCut.setAttribute('draggable', 'true');
		thisShortCut.setAttribute('orderIndex', String(i));
		thisShortCut.setAttribute('data-subreddit', shortcut.subreddit);
		thisShortCut.classList.add('subbarlink');

		if (isCurrentSubreddit(shortcut.subreddit)) {
			thisShortCut.classList.add('RESShortcutsCurrentSub');
		}

		thisShortCut.setAttribute('href', `/r/${shortcut.subreddit}`);
		thisShortCut.textContent = shortcut.displayName;
		thisShortCut.addEventListener('click', (e: MouseEvent) => {
			if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
				// open in new tab, let the browser handle it
				return true;
			} else {
				e.preventDefault();
				followSubredditShortcut(((e.target: any): HTMLAnchorElement).href);
			}
		});

		thisShortCut.addEventListener('dblclick', (e: MouseEvent) => {
			e.preventDefault();
			followSubredditShortcut.cancel();
			hideSubredditGroupDropdown();
			editSubredditShortcut(e.target, e);
		});

		thisShortCut.addEventListener('mouseover', (e: Event) => {
			clearTimeout(hideSubredditGroupDropdownTimer);
			showSubredditGroupDropdown(e.target);
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
		shortCutsContainer.appendChild(thisShortCut);

		if (i < mySubredditShortcuts.length - 1) {
			const sep = document.createElement('span');
			sep.setAttribute('class', 'separator');
			sep.textContent = '-';
			shortCutsContainer.appendChild(sep);
		}

		return shortcut;
	}, this);
	if (mySubredditShortcuts.length === 0) {
		shortCutsContainer.style.textTransform = 'none';
		shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
	} else {
		shortCutsContainer.style.textTransform = '';
	}
}

function showSubredditGroupDropdown(obj) {
	let subreddits = [];
	let suffix = '';

	if (obj.getAttribute && obj.getAttribute('href').includes('+')) {
		let cleanSubreddits = obj.getAttribute('href').replace('/r/', '');

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
		subreddits = cleanSubreddits.split('+');
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
		delay
	);
}

function _showSubredditGroupDropdown(obj, subreddits, suffix) {
	// Show dropdown after an appropriate delay
	if (!$subredditGroupDropdown) {
		$subredditGroupDropdown = $('<div>', { id: 'RESSubredditGroupDropdown' });
		subredditGroupDropdownUL = document.createElement('ul');
		$subredditGroupDropdown.append(subredditGroupDropdownUL);

		if (module.options.dropdownEditButton.value) {
			$subredditGroupDropdown.append(`
				<div class="RESShortcutsEditButtons">
					<a href="#"  class="delete res-icon" title="delete">&#xF155;</a>
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
			editSubredditShortcut(obj, e);
		});

		$subredditGroupDropdown.on('click', '.delete', (e: MouseEvent) => {
			e.preventDefault();
			hideSubredditGroupDropdown();
			editSubredditShortcut(obj, e);
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
	const subreddit = ele.getAttribute('href').slice(3);

	const idx = mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit === subreddit);

	if (!$editShortcutDialog) {
		$editShortcutDialog = $('<div>', { id: 'editShortcutDialog' })
			.appendTo(document.body);
	}

	const unsortable = !subreddit.includes('+');

	const thisForm = `
		<form name="editSubredditShortcut">
			<h3>Edit Shortcut</h3>
			<div id="editShortcutClose" class="RESCloseButton">&times;</div>
			<div class="RESFormItem">
				<label for="subreddit">Subreddit:</label>
				<div class="RESFieldItem">
					<input type="text" name="subreddit" value="${subreddit}" id="shortcut-subreddit" class="${unsortable ? 'unsortable' : ''}"><!-- no whitespace
					--><button type="submit" id="sortButton" title="Sort subreddits">A-Z</button>

					<div class="RESDescription">Put a + between subreddits to make a drop-down menu.</div>
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
		if (((e.target: any): HTMLInputElement).type === 'submit') {
			// if sorted ASC, sort DESC. If unsorted or sorted DESC, sort ASC
			inputEl.value = (currStr === ascStr ? descStr : ascStr);
			btnTxt = (currStr === ascStr ? 'A-Z' : 'Z-A');
		} else {
			btnTxt = (currStr === ascStr ? 'Z-A' : 'A-Z');
		}
		$('#sortButton').text(btnTxt);
	}

	// handle the sort button
	$editShortcutDialog.find('#sortButton').click(e => sortSubmenu(e));

	// handle the subreddit textfield
	$editShortcutDialog.find('input[name=subreddit]').on('change', e => sortSubmenu(e));

	// handle enter and escape keys in the dialog box...
	subredditInput.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.keyCode === 13) {
			e.preventDefault();
			e.stopPropagation();
		}
	});
	subredditInput.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.keyCode === 27) {
			$editShortcutDialog
				.hide()
				.blur();
		} else if (e.keyCode === 13) {
			click(saveButton);
		}
	});
	displayNameInput.addEventListener('keyup', (e: KeyboardEvent) => {
		if (e.keyCode === 27) {
			$editShortcutDialog
				.hide()
				.blur();
		} else if (e.keyCode === 13) {
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
	await populateSubredditDropdown();
}

const followSubredditShortcut = _.debounce(url => { location.href = url; }, 300);

let dragSrcEl, srDataTransfer;

function subredditDragStart(e) {
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

function subredditDragOver(e) {
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

function subredditDrop(e) {
	// this/e.target is current target element.
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

function redrawSubredditBar() {
	const originalShortcuts: HTMLAnchorElement[] = (Array.from(document.querySelectorAll('.sr-list a.choice')): any[]);
	let myRandomEnabled, myRandomGold;
	if (module.options.linkMyRandom.value) {
		const originalMyRandom = originalShortcuts.find(({ pathname }) => pathname === '/r/myrandom/');
		if (originalMyRandom) {
			myRandomEnabled = true;
			if (originalMyRandom.classList.contains('gold')) {
				myRandomGold = true;
			}
		}
	}
	const originalFrontpage = originalShortcuts.find(({ pathname }) => pathname === '/');
	const originalPopular = originalShortcuts.find(({ pathname }) => pathname === '/r/popular/');

	const headerContents = document.querySelector('#sr-header-area');
	if (headerContents) {
		// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
		$(headerContents).html('');

		const $srLeftContainer = $('<div>', {
			id: 'srLeftContainer',
			class: 'sr-bar',
		});

		const $srDropdown = $('<div>', { id: 'srDropdown' });
		const $srDropdownContainer = $('<div>', {
			id: 'srDropdownContainer',
			html: '<a href="javascript:void 0">My Subreddits</a>',
			click: toggleSubredditDropdown,
		});

		$srDropdown.append($srDropdownContainer);

		$srList = $('<table>', { id: 'srList' })
			.appendTo(document.body);

		$srLeftContainer.append($srDropdown);
		const sep = document.createElement('span');
		sep.setAttribute('class', 'srSep');
		sep.textContent = '|';
		$srLeftContainer.append(sep);

		// now put in the shortcuts...
		const staticShortCutsContainer = document.createElement('div');
		staticShortCutsContainer.setAttribute('id', 'RESStaticShortcuts');
		/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
		$(staticShortCutsContainer).html('');
		const specialButtonSelected = {};
		const selectedShortcut = $(originalPopular).is('.selected .choice') ? 'popular' :
			(currentSubreddit() || 'home').toLowerCase();
		specialButtonSelected[selectedShortcut] = 'RESShortcutsCurrentSub';

		let shortCutsHTML = '';

		if (module.options.linkDashboard.value) shortCutsHTML += `<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ${specialButtonSelected.dashboard}" href="/r/Dashboard/">Dashboard</a>`;
		if (module.options.linkFront.value && originalFrontpage) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected.home}" href="/">Front</a>`;
		if (module.options.linkPopular.value && originalPopular) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected.popular}" href="/r/popular">Popular</a>`;
		if (module.options.linkAll.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected.all}" href="/r/all/">All</a>`;
		if (module.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">Random</a>';
		if (module.options.linkMyRandom.value && myRandomEnabled) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${myRandomGold ? 'gold' : ''}" href="/r/myrandom/">MyRandom</a>`;
		if (module.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RandNSFW</a>';

		if (loggedInUser()) {
			if (module.options.linkFriends.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected.friends}" href="/r/friends/">Friends</a>`;

			if (isModeratorAnywhere()) {
				if (module.options.linkMod.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected.mod}" href="/r/mod/">Mod</a>`;
				if (module.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">Modqueue</a>';
			}

			if (module.options.linkSaved.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/user/me/saved">Saved</a>';
		}
		if (module.options.buttonEdit.value) shortCutsHTML += `<span class="separator">-</span>${SettingsNavigation.makeUrlHashLink(module.moduleID, '', 'edit', 'subbarlink')}`;

		$(staticShortCutsContainer).append(shortCutsHTML);

		$srLeftContainer.append(staticShortCutsContainer);
		$srLeftContainer.append(sep);
		$srLeftContainer.appendTo(headerContents);

		const shortCutsViewport = document.createElement('div');
		shortCutsViewport.setAttribute('id', 'RESShortcutsViewport');
		headerContents.appendChild(shortCutsViewport);

		shortCutsContainer = document.createElement('div');
		shortCutsContainer.setAttribute('id', 'RESShortcuts');
		shortCutsContainer.setAttribute('class', 'sr-bar');
		shortCutsViewport.appendChild(shortCutsContainer);

		const shortCutsEditContainer = document.createElement('div');
		shortCutsEditContainer.setAttribute('id', 'RESShortcutsEditContainer');
		headerContents.appendChild(shortCutsEditContainer);

		// Add shortcut sorting arrow
		sortShortcutsButton = document.createElement('div');
		sortShortcutsButton.setAttribute('id', 'RESShortcutsSort');
		sortShortcutsButton.setAttribute('title', 'sort subreddit shortcuts');
		sortShortcutsButton.innerHTML = '&uarr;&darr;';
		sortShortcutsButton.addEventListener('click', showSortMenu);
		shortCutsEditContainer.appendChild(sortShortcutsButton);

		// add right scroll arrow...
		const shortCutsRight = document.createElement('div');
		shortCutsRight.setAttribute('id', 'RESShortcutsRight');
		shortCutsRight.textContent = '>';
		shortCutsRight.addEventListener('click', () => {
			const firstChild: HTMLElement = (shortCutsContainer.firstChild: any);
			let marginLeft = firstChild.style.marginLeft;
			marginLeft = parseInt(marginLeft.replace('px', ''), 10);

			if (isNaN(marginLeft)) marginLeft = 0;

			const shiftWidth = $('#RESShortcutsViewport').width() - 80;
			if (shortCutsContainer.offsetWidth > (shiftWidth)) {
				marginLeft -= shiftWidth;
				firstChild.style.marginLeft = `${marginLeft}px`;
			}
		});
		shortCutsEditContainer.appendChild(shortCutsRight);

		// add an "add shortcut" button...
		const $shortCutsAdd = $('<div>', {
			id: 'RESShortcutsAdd',
			class: 'res-icon',
			html: '&#xF139;',
			title: 'add shortcut',
		});

		const shortCutsAddFormContainer = document.createElement('div');
		shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
		shortCutsAddFormContainer.style.display = 'none';
		const thisForm = `
			<form id="shortCutsAddForm">
				<div><strong>Add Shortcut</strong></div>
				<div class="res-shortcuts-add-tip">Put a &plus; between subreddits to make a multireddit.</div>
				<div><label for="newShortcut">Subreddit:</label><input type="text" id="newShortcut"></div>
				<div><label for="displayName">Display Name:</label><input type="text" id="displayName"></div>
				<input type="submit" name="submit" value="add" id="addSubreddit">
				<div class="res-shortcuts-add-footer"><a href="/subreddits/">manage subscribed</a></div>
			</form>
		`;
		$(shortCutsAddFormContainer).html(thisForm);
		const shortCutsAddFormField: HTMLInputElement = (shortCutsAddFormContainer.querySelector('#newShortcut'): any);
		const shortCutsAddFormFieldDisplayName: HTMLInputElement = (shortCutsAddFormContainer.querySelector('#displayName'): any);

		shortCutsAddFormField.addEventListener('keyup', (e: KeyboardEvent) => {
			if (e.keyCode === 27) {
				shortCutsAddFormContainer.style.display = 'none';
				shortCutsAddFormField.blur();
			}
		});

		shortCutsAddFormFieldDisplayName.addEventListener('keyup', (e: KeyboardEvent) => {
			if (e.keyCode === 27) {
				shortCutsAddFormContainer.style.display = 'none';
				shortCutsAddFormFieldDisplayName.blur();
			}
		});

		// add the "add shortcut" form...
		const shortCutsAddForm = shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
		shortCutsAddForm.addEventListener('submit', e => {
			e.preventDefault();
			let subreddit = shortCutsAddFormField.value;
			let displayname = shortCutsAddFormFieldDisplayName.value;
			if (displayname === '') displayname = subreddit;

			subreddit = subreddit.replace(/^\/?r\//i, '');

			shortCutsAddFormField.value = '';
			shortCutsAddFormFieldDisplayName.value = '';
			shortCutsAddFormContainer.style.display = 'none';

			if (subreddit) {
				addSubredditShortcut(subreddit, displayname);
			}
		});
		$shortCutsAdd.click(() => {
			if (shortCutsAddFormContainer.style.display === 'none') {
				shortCutsAddFormContainer.style.display = 'block';
				shortCutsAddFormField.focus();
			} else {
				shortCutsAddFormContainer.style.display = 'none';
				shortCutsAddFormField.blur();
			}
		});
		$shortCutsAdd.appendTo(shortCutsEditContainer);
		document.body.appendChild(shortCutsAddFormContainer);

		if (module.options.dragDropDelete.value) {
			const $trashOpenLink = $('<a>', {
				class: 'res-trash-open',
				href: '#',
				title: 'Choose which shortcuts to remove',
				html: '<span class="res-icon">&#xF155;</span> remove shortcuts...',
			});
			$('#RESShortcutsAddFormContainer .res-shortcuts-add-footer').prepend(' | ').prepend($trashOpenLink);
			$trashOpenLink.click(e => {
				e.preventDefault();
				addTrashBin();
			});
		}

		// add left scroll arrow...
		const shortCutsLeft = document.createElement('div');
		shortCutsLeft.setAttribute('id', 'RESShortcutsLeft');
		shortCutsLeft.textContent = '<';
		shortCutsLeft.addEventListener('click', () => {
			const firstChild: HTMLElement = (shortCutsContainer.firstChild: any);
			let marginLeft = firstChild.style.marginLeft;
			marginLeft = parseInt(marginLeft.replace('px', ''), 10);

			if (isNaN(marginLeft)) marginLeft = 0;

			const shiftWidth = $('#RESShortcutsViewport').width() - 80;
			marginLeft += shiftWidth;
			if (marginLeft <= 0) {
				firstChild.style.marginLeft = `${marginLeft}px`;
			}
		});
		shortCutsEditContainer.appendChild(shortCutsLeft);

		redrawShortcuts();
	}
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
			})
		);

	return {
		$wrapper,
		$trashZone,
		$title,
	};
});

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
		trashBin().$title.html(string.escapeHTML`Drop here to delete shortcut <strong>${$(shortcut).text()}</strong>`);
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

function showSortMenu() {
	// Add shortcut sorting menu if it doesn't exist in the DOM yet...
	if (!$sortMenu) {
		$sortMenu = $(`
			<div id="sort-menu" class="drop-choices">
				<p>&nbsp;sort by:</p>
				<a class="choice" data-field="displayName" href="javascript:void 0">display name</a>
				<a class="choice" data-field="addedDate" href="javascript:void 0">added date</a>
			</div>
		`);

		$($sortMenu).find('a').click(sortShortcuts);

		$(document.body).append($sortMenu);
	}
	const menu = $sortMenu;
	if ($(menu).is(':visible')) {
		$(menu).hide();
		return;
	}
	const thisXY = $(sortShortcutsButton).offset();
	thisXY.left = thisXY.left - $(menu).width() + $(sortShortcutsButton).width();
	const thisHeight = $(sortShortcutsButton).height();

	$(menu).css({
		top: thisXY.top + thisHeight,
		left: thisXY.left,
	}).show();
}

function hideSortMenu() {
	$($sortMenu).hide();
}

let currentSort;

function sortShortcuts() {
	hideSortMenu();

	const sortingField = $(this).data('field');
	const asc = !currentSort;
	// toggle sort method...
	currentSort = !currentSort;

	mySubredditShortcuts.sort((a, b) => {
		// const sortingField = field; // module.options.sortingField.value;
		// const asc = order === 'asc'; // (module.options.sortingDirection.value === 'asc');
		let aField = a[sortingField];
		let bField = b[sortingField];
		if (typeof aField === 'string' && typeof bField === 'string') {
			aField = aField.toLowerCase();
			bField = bField.toLowerCase();
		}

		if (aField === bField) {
			return 0;
		} else if (aField > bField) {
			return (asc) ? 1 : -1;
		} else {
			return (asc) ? -1 : 1;
		}
	});

	// Save shortcuts sort order
	saveLatestShortcuts();

	// Refresh shortcuts
	redrawShortcuts();
}

let subredditPagesLoaded;

function toggleSubredditDropdown(e: Event) {
	e.stopPropagation();
	if ($srList.css('display') === 'block') {
		$srList.css('display', 'none');
		document.body.removeEventListener('click', toggleSubredditDropdown);
	} else {
		const user = loggedInUser();
		if (user) {
			$srList.html('<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>');
			if (!subredditPagesLoaded) {
				subredditPagesLoaded = $srList.find('#subredditPagesLoaded').get(0);
			}
			$srList.css('display', 'block');
			getSubreddits(user);
		} else {
			$srList.html('<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/subreddits/">browse them all</a></td></tr>');
			$srList.css('display', 'block');
		}
		$srList.click(stopDropDownPropagation);
		document.body.addEventListener('click', toggleSubredditDropdown);
	}
}

function stopDropDownPropagation(e) {
	e.stopPropagation();
}

let mySubreddits = [];

async function getSubreddits(user) {
	if (gettingSubreddits) return;
	gettingSubreddits = true;

	mySubreddits = [];

	let after = '';
	let page = 0;

	do {
		const { data } = (await ajax({ // eslint-disable-line no-await-in-loop
			url: '/subreddits/mine.json',
			data: {
				after,
				limit: 100,
				user, // for the cache
			},
			type: 'json',
			cacheFor: DAY,
		}): RedditListing<RedditSubreddit>);

		if (data && data.children) {
			subredditPagesLoaded.textContent = `Pages loaded: ${++page}`;

			// fields include display_name, url, over18, id, created, description
			const subreddits = data.children.map(({ data }) => data);
			mySubreddits.push(...subreddits);

			after = data.after;
		} else {
			// User is probably not logged in.. no subreddits found.
			populateSubredditDropdown(undefined, true);
			return;
		}
	} while (after);

	// Remove duplicate subreddits
	mySubreddits = _.uniqBy(mySubreddits, sr => sr.display_name);

	mySubreddits.sort((a, b) => {
		const adisp = a.display_name.toLowerCase();
		const bdisp = b.display_name.toLowerCase();
		if (adisp > bdisp) return 1;
		if (adisp === bdisp) return 0;
		return -1;
	});

	gettingSubreddits = false;
	populateSubredditDropdown();
}

// if badJSON is true, then getSubredditJSON ran into an error...
async function populateSubredditDropdown(sortBy = 'subreddit', badJSON) {
	$srList.html('');

	const tableHead = document.createElement('thead');
	const tableRow = document.createElement('tr');

	const srHeader = document.createElement('td');
	srHeader.addEventListener('click', () => {
		if (sortBy === 'subreddit') {
			populateSubredditDropdown('subredditDesc');
		} else {
			populateSubredditDropdown('subreddit');
		}
	});
	srHeader.textContent = 'subreddit';
	srHeader.setAttribute('width', '200');
	tableRow.appendChild(srHeader);

	const lvHeader = document.createElement('td');
	if (module.options.storeSubredditVisit.value) {
		lvHeader.addEventListener('click', () => {
			if (sortBy === 'lastVisited') {
				populateSubredditDropdown('lastVisitedAsc');
			} else {
				populateSubredditDropdown('lastVisited');
			}
		});
		lvHeader.textContent = 'Last Visited';
		lvHeader.setAttribute('width', '120');
		tableRow.appendChild(lvHeader);
	}

	const scHeader = document.createElement('td');
	$(scHeader).width(50);
	$(scHeader).html('<a style="float: right;" href="/subreddits/">View all &raquo;</a>');
	tableRow.appendChild(scHeader);

	tableHead.appendChild(tableRow);
	$srList.append(tableHead);

	const theBody = document.createElement('tbody');
	if (!badJSON) {
		if (typeof subredditsLastViewed === 'undefined') {
			subredditsLastViewed = await subredditsLastViewedStorage.get();
		}

		// copy mySubreddits to a placeholder array so we can sort without modifying it...
		const sortableSubreddits = mySubreddits.slice();
		if (sortBy === 'lastVisited') {
			$(lvHeader).html('Last Visited <div class="sortAsc"></div>');
			srHeader.textContent = 'subreddit';

			sortableSubreddits.sort((a, b) => {
				const adisp = a.display_name.toLowerCase();
				const bdisp = b.display_name.toLowerCase();

				const alv = (typeof subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[adisp].last_visited, 10);
				const blv = (typeof subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[bdisp].last_visited, 10);

				if (alv < blv) return 1;
				if (alv === blv) {
					if (adisp > bdisp) return 1;
					return -1;
				}
				return -1;
			});
		} else if (sortBy === 'lastVisitedAsc') {
			$(lvHeader).html('Last Visited <div class="sortDesc"></div>');
			srHeader.textContent = 'subreddit';

			sortableSubreddits.sort((a, b) => {
				const adisp = a.display_name.toLowerCase();
				const bdisp = b.display_name.toLowerCase();

				const alv = (typeof subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[adisp].last_visited, 10);
				const blv = (typeof subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[bdisp].last_visited, 10);

				if (alv > blv) return 1;
				if (alv === blv) {
					if (adisp > bdisp) return 1;
					return -1;
				}
				return -1;
			});
		} else if (sortBy === 'subredditDesc') {
			lvHeader.textContent = 'Last Visited';
			$(srHeader).html('subreddit <div class="sortDesc"></div>');

			sortableSubreddits.sort((a, b) => {
				const adisp = a.display_name.toLowerCase();
				const bdisp = b.display_name.toLowerCase();

				if (adisp < bdisp) return 1;
				if (adisp === bdisp) return 0;
				return -1;
			});
		} else {
			lvHeader.textContent = 'Last Visited';
			$(srHeader).html('subreddit <div class="sortAsc"></div>');

			sortableSubreddits.sort((a, b) => {
				const adisp = a.display_name.toLowerCase();
				const bdisp = b.display_name.toLowerCase();

				if (adisp > bdisp) return 1;
				if (adisp === bdisp) return 0;
				return -1;
			});
		}
		for (const { display_name: displayName, url } of sortableSubreddits) {
			let dateString = 'Never';
			const thisReddit = displayName.toLowerCase();
			if (subredditsLastViewed[thisReddit]) {
				const ts = parseInt(subredditsLastViewed[thisReddit].last_visited, 10);
				const dateVisited = new Date(ts);
				dateString = formatDate(dateVisited);
			}

			const theRow = document.createElement('tr');
			const theSR = document.createElement('td');
			$(theSR).html(string.escapeHTML`<a href="${url}">${displayName}</a>`);
			theRow.appendChild(theSR);

			if (module.options.storeSubredditVisit.value) {
				const theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class', 'RESvisited');
				theRow.appendChild(theLV);
			}

			const theSC = document.createElement('td');
			theSC.setAttribute('class', 'RESshortcut');
			theSC.setAttribute('data-subreddit', displayName);

			const idx = mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit === displayName);

			if (idx !== -1) {
				theSC.addEventListener('click', (e: Event) => {
					if (e.stopPropagation) {
						e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
					}

					const subreddit = $(e.target).attr('data-subreddit');
					removeSubredditShortcut(subreddit);
				});

				theSC.textContent = '-shortcut';
			} else {
				theSC.addEventListener('click', (e: Event) => {
					if (e.stopPropagation) {
						e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
					}

					const subreddit = $(e.target).attr('data-subreddit');
					addSubredditShortcut(subreddit);
				});

				theSC.textContent = '+shortcut';
			}

			theRow.appendChild(theSC);
			theBody.appendChild(theRow);
		}
	} else {
		const errorTD = document.createElement('td');
		errorTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
		errorTD.setAttribute('colspan', '3');

		const errorRow = document.createElement('tr');
		errorRow.appendChild(errorTD);
		theBody.appendChild(errorRow);
	}

	$srList.append(theBody);
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
	if (count) return string.escapeHTML`<span class="multi-count" title="${i18n('subredditManagerMultiCountTitle', displayName, count)}">${count}</span>`;
	else return '';
}

export function toggleSubredditShortcut(e: Event) {
	e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

	const isShortcut = mySubredditShortcuts.some(function(shortcut) {
		return shortcut.subreddit.toLowerCase() === $(this).attr('data-subreddit').toLowerCase();
	}, this);

	if (isShortcut) {
		removeSubredditShortcut($(this).attr('data-subreddit'));
		$(this)
			.attr('title', 'Add this subreddit to your shortcut bar')
			.text('+shortcut')
			.removeClass('remove');
	} else {
		addSubredditShortcut($(this).attr('data-subreddit'));
		$(this)
			.attr('title', 'Remove this subreddit from your shortcut bar')
			.text('-shortcut')
			.addClass('remove');
	}

	redrawShortcuts();
}

async function getLatestShortcuts() {
	// re-retreive the latest data to ensure we're not losing info between tab changes...
	mySubredditShortcuts = await subredditShortcutsStorage.get();
}

function saveLatestShortcuts() {
	subredditShortcutsStorage.set(mySubredditShortcuts || []);
}

async function addSubredditShortcut(subreddit, displayname) {
	await getLatestShortcuts();

	const idx = mySubredditShortcuts.findIndex(shortcut =>
		shortcut.subreddit.toLowerCase() === subreddit.toLowerCase()
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
		await populateSubredditDropdown();

		Notifications.showNotification({
			moduleID: 'subredditManager',
			message: 'Subreddit shortcut added. You can edit by double clicking the shortcut.',
		});
	}
}

async function removeSubredditShortcut(subreddit) {
	await getLatestShortcuts();

	const idx = mySubredditShortcuts.findIndex(shortcut =>
		shortcut.subreddit.toLowerCase() === subreddit.toLowerCase()
	);

	if (idx !== -1) {
		mySubredditShortcuts.splice(idx, 1);

		saveLatestShortcuts();
		redrawShortcuts();
		await populateSubredditDropdown();
	}
}

async function setLastViewtime(subreddit) {
	if (!module.options.storeSubredditVisit.value) return;
	if (!module.options.storeSubredditVisitIncognito.value && await isPrivateBrowsing()) return;

	subredditsLastViewed = await subredditsLastViewedStorage.get();

	subredditsLastViewed[subreddit.toLowerCase()] = {
		last_visited: Date.now(),
	};

	subredditsLastViewedStorage.set(subredditsLastViewed);
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
	for (const user in mySubredditListCachedObject) {
		if (mySubredditListCachedObject[user].time < inactiveThreshold) {
			delete mySubredditListCachedObject[user];
		}
	}
	Session.set('RESmodules.subredditManager.mySubredditList', mySubredditListCachedObject);
}
