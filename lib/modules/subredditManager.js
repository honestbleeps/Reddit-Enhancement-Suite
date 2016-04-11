import { $ } from '../core/global';
import { ajax, session, storage } from '../environment';
import { gdAlert } from '../core/alert';
import { isFirefox } from '../core/browserDetect';

addModule('subredditManager', (module, moduleID) => {
	module.moduleName = 'Subreddit Manager';
	module.category = ['Subreddits'];
	module.description = 'Allows you to customize the top bar with your own subreddit shortcuts, including dropdown menus of multi-reddits and more.';
	module.options = {
		subredditShortcut: {
			type: 'boolean',
			value: true,
			description: 'Add +shortcut button in subreddit sidebar for easy addition of shortcuts.'
		},
		shortcutsPerAccount: {
			type: 'boolean',
			value: true,
			description: 'Show personalized shortcuts for each account'
		},
		alwaysApplySuffixToMulti: {
			type: 'boolean',
			value: false,
			description: 'For multi-subreddit shortcuts like a+b+c/x, show a dropdown like a/x, b/x, c/x'
		},
		dropdownEditButton: {
			type: 'boolean',
			value: true,
			description: 'Show "edit" and "delete" buttons in dropdown menu on subreddit shortcut bar'
		},
		shortcutDropdownDelay: {
			type: 'text',
			value: 200,
			description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown. (This particularly applies for shortcuts to multi-subreddits like sub1+sub2+sub3.)'
		},
		shortcutEditDropdownDelay: {
			dependsOn: 'dropdownEditButton',
			type: 'text',
			value: 3000,
			description: 'How long (in milliseconds) to wait after moving your mouse over a shortcut to show its dropdown edit buttons. (This particularly applies to just the edit/delete button dropdown.)'
		},
		allowLowercase: {
			type: 'boolean',
			value: false,
			description: 'Allow lowercase letters in shortcuts instead of forcing uppercase',
			bodyClass: true
		},
		linkDashboard: {
			type: 'boolean',
			value: true,
			description: 'Show "DASHBOARD" link in subreddit manager'
		},
		linkAll: {
			type: 'boolean',
			value: true,
			description: 'Show "ALL" link in subreddit manager'
		},
		linkFront: {
			type: 'boolean',
			value: true,
			description: 'show "FRONT" link in subreddit manager'
		},
		linkRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "RANDOM" link in subreddit manager'
		},
		linkMyRandom: {
			type: 'boolean',
			value: true,
			description: 'Show "MYRANDOM" link in subreddit manager (reddit gold only)'
		},
		linkRandNSFW: {
			type: 'boolean',
			value: false,
			description: 'Show "RANDNSFW" link in subreddit manager'
		},
		linkFriends: {
			type: 'boolean',
			value: true,
			description: 'Show "FRIENDS" link in subreddit manager'
		},
		linkMod: {
			type: 'boolean',
			value: true,
			description: 'Show "MOD" link in subreddit manager'
		},
		linkModqueue: {
			type: 'boolean',
			value: true,
			description: 'Show "MODQUEUE" link in subreddit manager'
		},
		buttonEdit: {
			type: 'boolean',
			value: true,
			description: 'Show "EDIT" button in subreddit manager'
		},
		lastUpdate: {
			type: 'boolean',
			value: true,
			description: 'Show last update information on the front page (work only if you have at least 50/100 subscription, see <a href="/r/help/wiki/faq#wiki_some_of_my_subreddits_keep_disappearing.__why.3F">here</a> for more info).'
		}
		/*		sortingField: {
			type: 'enum',
			values: [
				{ name: 'Subreddit Name', value: 'displayName' },
				{ name: 'Added date', value: 'addedDate' }
			],
			value : 'displayName',
			description: 'Field to sort subreddit shortcuts by'
		},
		sortingDirection: {
			type: 'enum',
			values: [
				{ name: 'Ascending', value: 'asc' },
				{ name: 'Descending', value: 'desc' }
			],
			value : 'asc',
			description: 'Field to sort subreddit shortcuts by'
		}
*/
	};

	let shortCutsContainer, subredditGroupDropdown, subredditGroupDropdownUL, srList,
		editShortcutDialog, deleteButton, $sortMenu, gettingSubreddits, subredditsLastViewed;

	module.go = async function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.linkMyRandom.value) {
				const originalMyRandom = document.querySelector('#sr-header-area a[href$="/r/myrandom/"]');
				if (originalMyRandom) {
					this.myRandomEnabled = true;
					if (originalMyRandom.classList.contains('gold')) {
						this.myRandomGold = true;
					}
				}
			}

			if (this.options.lastUpdate.value && document.getElementsByClassName('listing-chooser').length) {
				lastUpdate();
			}

			await getLatestShortcuts();

			manageSubreddits();

			if (RESUtils.currentSubreddit() !== null) {
				setLastViewtime();
			}
		}
	};

	function manageSubreddits() {
		// This is the init function for Manage Subreddits - it'll get your preferences and redraw the top bar.
		redrawSubredditBar();
		// Listen for subscriptions / unsubscriptions from reddits so we know to reload the JSON string...
		// also, add a +/- shortcut button...
		if (RESUtils.currentSubreddit() && module.options.subredditShortcut.value) {
			const subButtons = document.querySelectorAll('.side .fancy-toggle-button');
			Array.from(subButtons).forEach(subButton => {
				let thisSubredditFragment, isMulti;
				if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
					thisSubredditFragment = RESUtils.currentSubreddit();
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
							user: RESUtils.loggedInUser()
						}
					});
				}, false);
				const theSC = document.createElement('span');
				theSC.setAttribute('class', 'res-fancy-toggle-button RESshortcut RESshortcutside');
				theSC.setAttribute('data-subreddit', thisSubredditFragment);
				const idx = module.mySubredditShortcuts.findIndex(shortcut =>
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
				theSC.addEventListener('click', module.toggleSubredditShortcut, false);
				// subButton.parentNode.insertBefore(theSC, subButton);
				// theSubredditLink.appendChild(theSC);
				const $subButtons = $(`#subButtons-${thisSubredditFragment}`);
				$subButtons.append(theSC);
				const $next = $subButtons.next();
				if ($next.hasClass('title') && !$subButtons.hasClass('swapped')) {
					$subButtons.before($next);
					$subButtons.addClass('swapped');
				}
			});
		}

		// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
		if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
			module.browsingReddits();
		}
	}

	module.browsingReddits = function() {
		$('.subreddit').each(function() {
			// Skip subreddit links that already have a shortcut button
			if (typeof $(this).data('hasShortcutButton') !== 'undefined' && $(this).data('hasShortcutButton')) {
				return;
			}

			// Otherwise, indicate that this link now has a shortcut button
			$(this).data('hasShortcutButton', true);

			const subreddit = $(this).find('a.title').attr('href').match(/^https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i)[1];
			const $theSC = $('<span>')
				.css({ 'margin-right': '0' })
				.addClass('res-fancy-toggle-button')
				.data('subreddit', subreddit);
			const isShortcut = module.mySubredditShortcuts.some(shortcut => shortcut.subreddit === subreddit);

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
				.on('click', module.toggleSubredditShortcut)
				.appendTo($(this).find('.midcol'));
		});
	};

	let clickedShortcut, clickTimer, hideSubredditGroupDropdownTimer, showSubredditGroupDropdownTimer;

	function redrawShortcuts() {
		shortCutsContainer.textContent = '';
		// go through the list of shortcuts and print them out...
		module.mySubredditShortcuts.forEach((shortcut, i) => {
			const thisShortCut = document.createElement('a');
			thisShortCut.setAttribute('draggable', 'true');
			thisShortCut.setAttribute('orderIndex', i);
			thisShortCut.setAttribute('data-subreddit', shortcut.subreddit);
			thisShortCut.classList.add('subbarlink');

			if ((RESUtils.currentSubreddit() !== null) && (RESUtils.currentSubreddit().toLowerCase() === shortcut.subreddit.toLowerCase())) {
				thisShortCut.classList.add('RESShortcutsCurrentSub');
			}

			thisShortCut.setAttribute('href', `/r/${shortcut.subreddit}`);
			thisShortCut.textContent = shortcut.displayName;
			thisShortCut.addEventListener('click', e => {
				if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
					// open in new tab, let the browser handle it
					return true;
				} else {
					e.preventDefault();
					// use to open links in new tabs... work on this later...
					clickedShortcut = e.target.getAttribute('href');
					if (typeof clickTimer === 'undefined') {
						clickTimer = setTimeout(followSubredditShortcut, 300);
					}
				}
			}, false);

			thisShortCut.addEventListener('dblclick', e => {
				e.preventDefault();
				clearTimeout(clickTimer);
				clickTimer = undefined;
				hideSubredditGroupDropdown();
				editSubredditShortcut(e.target, e);
			}, false);

			thisShortCut.addEventListener('mouseover', e => {
				clearTimeout(hideSubredditGroupDropdownTimer);
				showSubredditGroupDropdown(e.target);
			}, false);

			thisShortCut.addEventListener('mouseout', () => {
				clearTimeout(showSubredditGroupDropdownTimer);
				hideSubredditGroupDropdownTimer = setTimeout(() => hideSubredditGroupDropdown(), 500);
			}, false);

			thisShortCut.addEventListener('dragstart', subredditDragStart, false);
			thisShortCut.addEventListener('dragenter', subredditDragEnter, false);
			thisShortCut.addEventListener('dragover', subredditDragOver, false);
			thisShortCut.addEventListener('dragleave', subredditDragLeave, false);
			thisShortCut.addEventListener('drop', subredditDrop, false);
			thisShortCut.addEventListener('dragend', subredditDragEnd, false);
			shortCutsContainer.appendChild(thisShortCut);

			if (i < module.mySubredditShortcuts.length - 1) {
				const sep = document.createElement('span');
				sep.setAttribute('class', 'separator');
				sep.textContent = '-';
				shortCutsContainer.appendChild(sep);
			}

			return shortcut;
		}, this);
		if (module.mySubredditShortcuts.length === 0) {
			shortCutsContainer.style.textTransform = 'none';
			shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
		} else {
			shortCutsContainer.style.textTransform = '';
		}
	}

	function showSubredditGroupDropdown(obj) {
		let subreddits = [];
		let suffix = '';

		if ((typeof obj.getAttribute !== 'undefined') && (obj.getAttribute('href').indexOf('+') !== -1)) {
			let cleanSubreddits = obj.getAttribute('href').replace('/r/', '').replace('/r/', '');

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

		if (typeof delay !== 'number') {
			delay = parseInt(module.options.subredditShortcutDropdownDelay.default, 10);
		}

		clearTimeout(showSubredditGroupDropdownTimer);
		showSubredditGroupDropdownTimer = setTimeout(
			() => _showSubredditGroupDropdown(obj, subreddits, suffix),
			delay
		);
	}

	function _showSubredditGroupDropdown(obj, subreddits, suffix) {
		// Show dropdown after an appropriate delay
		if (!subredditGroupDropdown) {
			subredditGroupDropdown = RESUtils.createElement('div', 'RESSubredditGroupDropdown');
			subredditGroupDropdownUL = document.createElement('ul');
			subredditGroupDropdown.appendChild(subredditGroupDropdownUL);

			if (module.options.dropdownEditButton.value) {
				$(`
					<div class="RESShortcutsEditButtons">
						<a href="#"  class="delete res-icon" title="delete">&#xF056;</a>
						<a href="#" class="edit res-icon" title="edit">&#xF139;</a>
					</div>
				`).appendTo(subredditGroupDropdown);
			}
			document.body.appendChild(subredditGroupDropdown);

			subredditGroupDropdown.addEventListener('mouseout', () => {
				hideSubredditGroupDropdownTimer = setTimeout(() => {
					hideSubredditGroupDropdown();
				}, 500);
			}, false);

			subredditGroupDropdown.addEventListener('mouseover', () => clearTimeout(hideSubredditGroupDropdownTimer), false);

			$(subredditGroupDropdown).on('click', '.edit', e => {
				e.preventDefault();
				hideSubredditGroupDropdown();
				editSubredditShortcut(obj, e);
			});

			$(subredditGroupDropdown).on('click', '.delete', e => {
				e.preventDefault();
				hideSubredditGroupDropdown();
				editSubredditShortcut(obj, e);
				deleteButton.click();
			});
		}

		$(subredditGroupDropdownUL).find('li:not(.RESShortcutsEditButtons)').remove();

		if (subreddits) {
			let $rows = $();
			subreddits.forEach(subreddit => {
				const $thisLI = $(`<li><a href="/r/${subreddit}${suffix}">${subreddit}<span class="shortcutSuffix">${suffix}</span></a></li>`);
				$rows = $rows.add($thisLI);
				if (RESUtils.currentSubreddit() === subreddit) {
					$thisLI.addClass('RESShortcutsCurrentSub');
				}
			});

			$(subredditGroupDropdownUL).prepend($rows);
		}

		const { top, left } = $(obj).offset();
		subredditGroupDropdown.style.top = `${top + 16}px`;
		// if fixed, override y to just be the height of the subreddit bar...
		// subredditGroupDropdown.style.position = 'fixed';
		// subredditGroupDropdown.style.top = '20px';
		subredditGroupDropdown.style.left = `${left}px`;
		subredditGroupDropdown.style.display = 'block';
	}

	function hideSubredditGroupDropdown() {
		hideSubredditGroupDropdownTimer = undefined;
		if (subredditGroupDropdown) {
			subredditGroupDropdown.style.display = 'none';
		}
	}

	function editSubredditShortcut(ele, event) {
		const subreddit = ele.getAttribute('href').slice(3);

		const idx = module.mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit === subreddit);

		if (!editShortcutDialog) {
			editShortcutDialog = RESUtils.createElement('div', 'editShortcutDialog');
			document.body.appendChild(editShortcutDialog);
		}

		const thisForm = `
			<form name="editSubredditShortcut">
				<h3>Edit Shortcut</h3>
				<div id="editShortcutClose" class="RESCloseButton">&times;</div>
				<div class="RESFormItem">
					<label for="subreddit">Subreddit:</label>
					<div class="RESFieldItem">
						<button type="submit" id="sortButton" title="Sort subreddits">A-Z</button><!-- no whitespace -->
						<input type="text" name="subreddit" value="${subreddit}" id="shortcut-subreddit">
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
		$(editShortcutDialog).html(thisForm);

		const subredditInput = editShortcutDialog.querySelector('input[name=subreddit]');
		const displayNameInput = editShortcutDialog.querySelector('input[name=displayName]');

		const subredditForm = editShortcutDialog.querySelector('FORM');
		subredditForm.addEventListener('submit', e => e.preventDefault(), false);

		const saveButton = editShortcutDialog.querySelector('button[name=shortcut-save]');
		saveButton.addEventListener('click', () => {
			const idx = editShortcutDialog.querySelector('input[name=idx]').value;
			const subreddit = editShortcutDialog.querySelector('input[name=subreddit]').value;
			const displayName = editShortcutDialog.querySelector('input[name=displayName]').value;

			saveSubredditShortcut(subreddit, displayName, idx);
			editShortcutDialog.style.display = 'none';
		}, false);

		deleteButton = editShortcutDialog.querySelector('button[name=shortcut-delete]');
		deleteButton.addEventListener('click', () => {
			const idx = editShortcutDialog.querySelector('input[name=idx]').value;

			if (confirm('Are you sure you want to delete this shortcut?')) {
				saveSubredditShortcut('', '', idx);
				editShortcutDialog.style.display = 'none';
			}
		}, false);

		// Allow the shortcut dropdown menu to be sorted
		function sortSubmenu(e) {
			const inputEl = editShortcutDialog.querySelector('input[name=subreddit]');
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
			if (e.target.type === 'submit') {
				// if sorted ASC, sort DESC. If unsorted or sorted DESC, sort ASC
				inputEl.value = (currStr === ascStr ? descStr : ascStr);
				btnTxt = (currStr === ascStr ? 'A-Z' : 'Z-A');
			} else {
				btnTxt = (currStr === ascStr ? 'Z-A' : 'A-Z');
			}
			$('#sortButton').text(btnTxt);
		}

		// handle the sort button
		const sortButton = editShortcutDialog.querySelector('#sortButton');
		sortButton.addEventListener('click', e => sortSubmenu(e), false);

		// handle the subreddit textfield
		const inputSubreddit = editShortcutDialog.querySelector('input[name=subreddit]');
		inputSubreddit.addEventListener('change', e => sortSubmenu(e));

		// handle enter and escape keys in the dialog box...
		subredditInput.addEventListener('keydown', e => {
			if (e.keyCode === 13) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
		subredditInput.addEventListener('keyup', e => {
			if (e.keyCode === 27) {
				editShortcutDialog.style.display = 'none';
				editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(saveButton);
			}
		}, false);
		displayNameInput.addEventListener('keyup', e => {
			if (e.keyCode === 27) {
				editShortcutDialog.style.display = 'none';
				editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(saveButton);
			}
		}, false);

		const cancelButton = editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', () => {
			editShortcutDialog.style.display = 'none';
		}, false);

		editShortcutDialog.style.display = 'block';
		// add 20px to compensate for scrollbar
		const thisLeft = Math.min(event.clientX, window.innerWidth - (editShortcutDialog.offsetWidth + 20));
		editShortcutDialog.style.left = `${thisLeft}px`;

		setTimeout(() => subredditInput.focus(), 200);
	}

	async function saveSubredditShortcut(subreddit, displayName, idx) {
		if (subreddit === '' || displayName === '') {
			// module.mySubredditShortcuts.splice(idx,1);
			subreddit = module.mySubredditShortcuts[idx].subreddit;
			await removeSubredditShortcut(subreddit);
		} else {
			module.mySubredditShortcuts[idx] = {
				subreddit,
				displayName,
				addedDate: Date.now()
			};

			saveLatestShortcuts();
		}

		redrawShortcuts();
		await populateSubredditDropdown();
	}

	function followSubredditShortcut() {
		if (isFirefox()) {
			// stupid firefox... sigh...
			location.href = `${location.protocol}//${location.hostname}${clickedShortcut}`;
		} else {
			location.href = clickedShortcut;
		}
	}

	let dragSrcEl, srDataTransfer;

	function subredditDragStart(e) {
		clearTimeout(clickTimer);
		// Target (this) element is the source node.
		this.style.opacity = '0.4';
		module.shortCutsTrash.style.display = 'block';
		dragSrcEl = this; // eslint-disable-line consistent-this

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

		// See the section on the DataTransfer object.
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

		module.shortCutsTrash.style.display = 'none';
		// Don't do anything if dropping the same column we're dragging.
		if (dragSrcEl !== this) {
			if (e.target.getAttribute('id') !== 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// const theData = e.dataTransfer.getData('text/html').split(',');
				const theData = srDataTransfer.split(',');
				const srcOrderIndex = parseInt(theData[0], 10);
				const srcSubreddit = module.mySubredditShortcuts[srcOrderIndex];
				const destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
				const destSubreddit = module.mySubredditShortcuts[destOrderIndex];
				const rearranged = [];
				let rearrangedI = 0;

				module.mySubredditShortcuts.forEach((shortcut, i) => {
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
				module.mySubredditShortcuts = rearranged;
				saveLatestShortcuts();
				// redraw the shortcut bar...
				redrawShortcuts();
				this.classList.remove('srOver');
			} else {
				const theData = srDataTransfer.split(',');
				const srcSubreddit = theData[1];
				removeSubredditShortcut(srcSubreddit);
			}
		}
		return false;
	}

	function subredditDragEnd() {
		module.shortCutsTrash.style.display = 'none';
		this.style.opacity = '1';
		return false;
	}

	function redrawSubredditBar() {
		const headerContents = document.querySelector('#sr-header-area');
		if (headerContents) {
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			$(headerContents).html('');

			const srLeftContainer = RESUtils.createElement('div', 'srLeftContainer');
			srLeftContainer.setAttribute('class', 'sr-bar');

			const srDropdown = RESUtils.createElement('div', 'srDropdown');
			const srDropdownContainer = RESUtils.createElement('div', 'srDropdownContainer');
			$(srDropdownContainer).html('<a href="javascript:void 0">My Subreddits</a>');
			srDropdownContainer.addEventListener('click', toggleSubredditDropdown, false);
			srDropdown.appendChild(srDropdownContainer);

			srList = RESUtils.createElement('table', 'srList');
			const maxHeight = $(window).height() - 40;
			$(srList).css('max-height', `${maxHeight}px`);
			// srDropdownContainer.appendChild(srList);
			document.body.appendChild(srList);

			srLeftContainer.appendChild(srDropdown);
			const sep = document.createElement('span');
			sep.setAttribute('class', 'srSep');
			sep.textContent = '|';
			srLeftContainer.appendChild(sep);

			// now put in the shortcuts...
			const staticShortCutsContainer = document.createElement('div');
			staticShortCutsContainer.setAttribute('id', 'RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			$(staticShortCutsContainer).html('');
			const specialButtonSelected = {};
			const subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';

			let shortCutsHTML = '';

			if (module.options.linkDashboard.value) shortCutsHTML += `<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ${specialButtonSelected['dashboard']}" href="/r/Dashboard/">Dashboard</a>`;
			if (module.options.linkFront.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected['home']}" href="/">Front</a>`;
			if (module.options.linkAll.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected['all']}" href="/r/all/">All</a>`;
			if (module.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">Random</a>';
			if (module.options.linkMyRandom.value && module.myRandomEnabled) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${module.myRandomGold ? 'gold' : ''}" href="/r/myrandom/">MyRandom</a>`;
			if (module.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RandNSFW</a>';

			if (RESUtils.loggedInUser()) {
				if (module.options.linkFriends.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected['friends']}" href="/r/friends/">Friends</a>`;

				if (RESUtils.isModeratorAnywhere()) {
					if (module.options.linkMod.value) shortCutsHTML += `<span class="separator">-</span><a class="subbarlink ${specialButtonSelected['mod']}" href="/r/mod/">Mod</a>`;
					if (module.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">Modqueue</a>';
				}
			}
			if (module.options.buttonEdit.value) shortCutsHTML += `<span class="separator">-</span>${modules['settingsNavigation'].makeUrlHashLink('subredditManager', '', 'edit', 'subbarlink')}`;

			$(staticShortCutsContainer).append(shortCutsHTML);

			srLeftContainer.appendChild(staticShortCutsContainer);
			srLeftContainer.appendChild(sep);
			headerContents.appendChild(srLeftContainer);

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
			module.sortShortcutsButton = document.createElement('div');
			module.sortShortcutsButton.setAttribute('id', 'RESShortcutsSort');
			module.sortShortcutsButton.setAttribute('title', 'sort subreddit shortcuts');
			module.sortShortcutsButton.innerHTML = '&uarr;&darr;';
			module.sortShortcutsButton.addEventListener('click', showSortMenu, false);
			shortCutsEditContainer.appendChild(module.sortShortcutsButton);

			// add right scroll arrow...
			const shortCutsRight = document.createElement('div');
			shortCutsRight.setAttribute('id', 'RESShortcutsRight');
			shortCutsRight.textContent = '>';
			shortCutsRight.addEventListener('click', () => {
				let marginLeft = shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				const shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (shortCutsContainer.offsetWidth > (shiftWidth)) {
					marginLeft -= shiftWidth;
					shortCutsContainer.firstChild.style.marginLeft = `${marginLeft}px`;
				}
			}, false);
			shortCutsEditContainer.appendChild(shortCutsRight);

			// add an "add shortcut" button...
			const shortCutsAdd = RESUtils.createElement('div', 'RESShortcutsAdd', 'res-icon');
			shortCutsAdd.innerHTML = '&#xF139;';
			shortCutsAdd.title = 'add shortcut';
			const shortCutsAddFormContainer = document.createElement('div');
			shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
			shortCutsAddFormContainer.style.display = 'none';
			const thisForm = `
				<form id="shortCutsAddForm">
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div>
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br>
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br>
					<input type="submit" name="submit" value="add" id="addSubreddit">
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/subreddits/">Edit frontpage subscriptions</a></div>
				</form>
			`;
			$(shortCutsAddFormContainer).html(thisForm);
			const shortCutsAddFormField = shortCutsAddFormContainer.querySelector('#newShortcut');
			const shortCutsAddFormFieldDisplayName = shortCutsAddFormContainer.querySelector('#displayName');

			shortCutsAddFormField.addEventListener('keyup', e => {
				if (e.keyCode === 27) {
					shortCutsAddFormContainer.style.display = 'none';
					shortCutsAddFormField.blur();
				}
			}, false);

			shortCutsAddFormFieldDisplayName.addEventListener('keyup', e => {
				if (e.keyCode === 27) {
					shortCutsAddFormContainer.style.display = 'none';
					shortCutsAddFormFieldDisplayName.blur();
				}
			}, false);

			// add the "add shortcut" form...
			const shortCutsAddForm = shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
			shortCutsAddForm.addEventListener('submit', e => {
				e.preventDefault();
				let subreddit = shortCutsAddFormField.value;
				let displayname = shortCutsAddFormFieldDisplayName.value;
				if (displayname === '') displayname = subreddit;

				const rMatchRegex = /^(\/r\/|r\/)(.*)/i;
				if (rMatchRegex.test(subreddit)) {
					subreddit = subreddit.match(rMatchRegex)[2];
				}

				shortCutsAddFormField.value = '';
				shortCutsAddFormFieldDisplayName.value = '';
				shortCutsAddFormContainer.style.display = 'none';

				if (subreddit) {
					addSubredditShortcut(subreddit, displayname);
				}
			}, false);
			shortCutsAdd.addEventListener('click', () => {
				if (shortCutsAddFormContainer.style.display === 'none') {
					shortCutsAddFormContainer.style.display = 'block';
					shortCutsAddFormField.focus();
				} else {
					shortCutsAddFormContainer.style.display = 'none';
					shortCutsAddFormField.blur();
				}
			}, false);
			shortCutsEditContainer.appendChild(shortCutsAdd);
			document.body.appendChild(shortCutsAddFormContainer);

			// add the "trash bin"...
			module.shortCutsTrash = RESUtils.createElement('div', 'RESShortcutsTrash', 'res-icon');
			module.shortCutsTrash.innerHTML = '&#xF056;';
			module.shortCutsTrash.addEventListener('dragenter', subredditDragEnter, false);
			module.shortCutsTrash.addEventListener('dragleave', subredditDragLeave, false);
			module.shortCutsTrash.addEventListener('dragover', subredditDragOver, false);
			module.shortCutsTrash.addEventListener('drop', subredditDrop, false);
			shortCutsEditContainer.appendChild(module.shortCutsTrash);

			// add left scroll arrow...
			const shortCutsLeft = document.createElement('div');
			shortCutsLeft.setAttribute('id', 'RESShortcutsLeft');
			shortCutsLeft.textContent = '<';
			shortCutsLeft.addEventListener('click', () => {
				let marginLeft = shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				const shiftWidth = $('#RESShortcutsViewport').width() - 80;
				marginLeft += shiftWidth;
				if (marginLeft <= 0) {
					shortCutsContainer.firstChild.style.marginLeft = `${marginLeft}px`;
				}
			}, false);
			shortCutsEditContainer.appendChild(shortCutsLeft);

			redrawShortcuts();
		}
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
		const thisXY = $(module.sortShortcutsButton).offset();
		thisXY.left = thisXY.left - $(menu).width() + $(module.sortShortcutsButton).width();
		const thisHeight = $(module.sortShortcutsButton).height();

		$(menu).css({
			top: thisXY.top + thisHeight,
			left: thisXY.left
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

		module.mySubredditShortcuts.sort((a, b) => {
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

	function toggleSubredditDropdown(e) {
		e.stopPropagation();
		if (srList.style.display === 'block') {
			srList.style.display = 'none';
			document.body.removeEventListener('click', toggleSubredditDropdown, false);
		} else {
			if (RESUtils.loggedInUser()) {
				$(srList).html('<tr><td width="360">Loading subreddits (may take a moment)...<div id="subredditPagesLoaded"></div></td></tr>');
				if (!subredditPagesLoaded) {
					subredditPagesLoaded = srList.querySelector('#subredditPagesLoaded');
				}
				srList.style.display = 'block';
				getSubreddits();
			} else {
				$(srList).html('<tr><td width="360">You must be logged in to load your own list of subreddits. <a style="display: inline; float: left;" href="/subreddits/">browse them all</a></td></tr>');
				srList.style.display = 'block';
			}
			srList.addEventListener('click', stopDropDownPropagation, false);
			document.body.addEventListener('click', toggleSubredditDropdown, false);
		}
	}

	function stopDropDownPropagation(e) {
		e.stopPropagation();
	}

	let mySubreddits = [];
	module.mySubredditShortcuts = [];

	async function getSubreddits() {
		if (gettingSubreddits) return;
		gettingSubreddits = true;

		mySubreddits = [];

		let after = '';
		let page = 0;

		do {
			const { data } = await ajax({ // eslint-disable-line babel/no-await-in-loop
				url: '/subreddits/mine.json',
				data: {
					after,
					limit: 100,
					user: RESUtils.loggedInUser() // for the cache
				},
				type: 'json',
				cacheFor: RESUtils.DAY
			});

			if (data && data.children) {
				subredditPagesLoaded.textContent = `Pages loaded: ${++page}`;

				// fields include display_name, url, over18, id, created, description
				const subreddits = data.children.map(({ data }) => data);
				mySubreddits.push(...subreddits);

				after = data.after;
			} else {
				// User is probably not logged in.. no subreddits found.
				populateSubredditDropdown(null, true);
				return;
			}
		} while (after);

		// Remove duplicate subreddits
		mySubreddits = Array.from(new Set(mySubreddits));

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
	async function populateSubredditDropdown(sortBy, badJSON) {
		module.sortBy = sortBy || 'subreddit';
		$(srList).html('');

		const tableHead = document.createElement('thead');
		const tableRow = document.createElement('tr');

		const srHeader = document.createElement('td');
		srHeader.addEventListener('click', () => {
			if (module.sortBy === 'subreddit') {
				populateSubredditDropdown('subredditDesc');
			} else {
				populateSubredditDropdown('subreddit');
			}
		}, false);
		srHeader.textContent = 'subreddit';
		srHeader.setAttribute('width', '200');

		const lvHeader = document.createElement('td');
		lvHeader.addEventListener('click', () => {
			if (module.sortBy === 'lastVisited') {
				populateSubredditDropdown('lastVisitedAsc');
			} else {
				populateSubredditDropdown('lastVisited');
			}
		}, false);
		lvHeader.textContent = 'Last Visited';
		lvHeader.setAttribute('width', '120');

		const scHeader = document.createElement('td');
		$(scHeader).width(50);
		$(scHeader).html('<a style="float: right;" href="/subreddits/">View all &raquo;</a>');
		tableRow.appendChild(srHeader);
		tableRow.appendChild(lvHeader);
		tableRow.appendChild(scHeader);
		tableHead.appendChild(tableRow);
		srList.appendChild(tableHead);

		const theBody = document.createElement('tbody');
		if (!badJSON) {
			if (typeof subredditsLastViewed === 'undefined') {
				subredditsLastViewed = await storage.get(`RESmodules.subredditManager.subredditsLastViewed.${RESUtils.loggedInUser()}`) || {};
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
				if (typeof subredditsLastViewed[thisReddit] !== 'undefined') {
					const ts = parseInt(subredditsLastViewed[thisReddit].last_visited, 10);
					const dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}

				const theRow = document.createElement('tr');
				const theSR = document.createElement('td');
				$(theSR).html(RESUtils.string.escapeHTML`<a href="${url}">${displayName}</a>`);
				theRow.appendChild(theSR);

				const theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class', 'RESvisited');
				theRow.appendChild(theLV);

				const theSC = document.createElement('td');
				theSC.setAttribute('class', 'RESshortcut');
				theSC.setAttribute('data-subreddit', displayName);

				const idx = module.mySubredditShortcuts.findIndex(shortcut => shortcut.subreddit === displayName);

				if (idx !== -1) {
					theSC.addEventListener('click', e => {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						const subreddit = $(e.target).data('subreddit');
						removeSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '-shortcut';
				} else {
					theSC.addEventListener('click', e => {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						const subreddit = $(e.target).data('subreddit');
						addSubredditShortcut(subreddit);
					}, false);

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

		srList.appendChild(theBody);
	}

	module.toggleSubredditShortcut = function(e) {
		e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

		const isShortcut = module.mySubredditShortcuts.some(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === $(this).data('subreddit').toLowerCase();
		}, this);

		if (isShortcut) {
			removeSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Add this subreddit to your shortcut bar')
				.text('+shortcut')
				.removeClass('remove');
		} else {
			addSubredditShortcut($(this).data('subreddit'));
			$(this)
				.attr('title', 'Remove this subreddit from your shortcut bar')
				.text('-shortcut')
				.addClass('remove');
		}

		redrawShortcuts();
	};

	function getShortcutsStorageKey() {
		const username = module.options.shortcutsPerAccount.value ? RESUtils.loggedInUser() : null;
		return `RESmodules.subredditManager.subredditShortcuts.${username}`;
	}

	async function getLatestShortcuts() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		const key = getShortcutsStorageKey();
		module.mySubredditShortcuts = await storage.get(key) || [];
		parseDates();
	}

	// JSON specification doesn't specify what to do with dates - so unstringify here
	function parseDates() {
		for (const shortcut of module.mySubredditShortcuts) {
			shortcut.addedDate = new Date(shortcut.addedDate || 0);
		}
	}

	function saveLatestShortcuts() {
		// Retreive the latest data to ensure we're not losing info
		if (!module.mySubredditShortcuts) {
			module.mySubredditShortcuts = [];
		}

		const key = getShortcutsStorageKey();
		storage.set(key, module.mySubredditShortcuts);
	}

	async function addSubredditShortcut(subreddit, displayname) {
		await getLatestShortcuts();

		const idx = module.mySubredditShortcuts.findIndex(shortcut =>
			shortcut.subreddit.toLowerCase() === subreddit.toLowerCase()
		);

		if (idx !== -1) {
			gdAlert.open('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			const subredditObj = {
				subreddit,
				displayName: displayname.toLowerCase(),
				addedDate: Date.now()
			};

			module.mySubredditShortcuts.push(subredditObj);

			saveLatestShortcuts();
			redrawShortcuts();
			await populateSubredditDropdown();

			modules['notifications'].showNotification({
				moduleID: 'subredditManager',
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	}

	async function removeSubredditShortcut(subreddit) {
		await getLatestShortcuts();

		const idx = module.mySubredditShortcuts.findIndex(shortcut =>
			shortcut.subreddit.toLowerCase() === subreddit.toLowerCase()
		);

		if (idx !== -1) {
			module.mySubredditShortcuts.splice(idx, 1);

			saveLatestShortcuts();
			redrawShortcuts();
			await populateSubredditDropdown();
		}
	}

	async function setLastViewtime() {
		const storageKey = `RESmodules.subredditManager.subredditsLastViewed.${RESUtils.loggedInUser()}`;
		subredditsLastViewed = await storage.get(storageKey) || {};

		const now = Date.now();
		const thisReddit = RESUtils.currentSubreddit().toLowerCase();
		subredditsLastViewed[thisReddit] = {
			last_visited: now
		};

		storage.set(storageKey, subredditsLastViewed);
	}

	module.subscribeToSubreddit = function(subredditName, subscribe = true) {
		// subredditName should look like t5_123asd
		return ajax({
			method: 'POST',
			url: '/api/subscribe',
			data: {
				sr: subredditName,
				action: subscribe ? 'sub' : 'unsub'
			}
		});
	};

	async function lastUpdate() {
		const mySubredditList = $('.drop-choices.srdrop a').map(function() { return this.textContent; }).toArray().join();
		const mySubredditListCachedObject = await session.get('RESmodules.subredditManager.mySubredditList') || {};
		const mySubredditListCached = mySubredditListCachedObject[RESUtils.loggedInUser()]; // last saved subreddit lsit + time for current user
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
			mySubredditListCachedObject[RESUtils.loggedInUser()] = {
				list: mySubredditList,
				time: new Date().getTime()
			};
			_lastUpdate = 'just now';
		}
		if (_lastUpdate !== false && mySubredditListCached !== null) { // Show only if there is cached version and the user have enough subscription
			$('.listing-chooser a:first .description').after(`<br /><span class="description"><b>last update:</b><br />${_lastUpdate}</span>`);
		}
		// we now remove inactive user
		const inactiveThreshold = new Date().getTime() - 2592000000; // one month
		for (const user in mySubredditListCachedObject) {
			if (mySubredditListCachedObject[user].time < inactiveThreshold) {
				delete mySubredditListCachedObject[user];
			}
		}
		session.set('RESmodules.subredditManager.mySubredditList', mySubredditListCachedObject);
	}
});
