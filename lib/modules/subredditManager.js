addModule('subredditManager', function(module, moduleID) {
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

	var shortCutsContainer, hoveredSubredditShortcut, subredditGroupDropdown, subredditGroupDropdownUL, srList,
		editShortcutDialog, deleteButton, sortMenu, gettingSubreddits, subredditsLastViewed;

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			if (this.options.linkMyRandom.value) {
				var originalMyRandom = document.querySelector('#sr-header-area a[href$="/r/myrandom/"]');
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
			var subButtons = document.querySelectorAll('.side .fancy-toggle-button');
			Array.prototype.slice.call(subButtons).forEach(function(subButton) {
				var thisSubredditFragment, isMulti;
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
				if ($('#subButtons-' + thisSubredditFragment).length === 0) {
					var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important; top: 0 !important; z-index: 1 !important;"></div>');
					$(subButton).wrap(subButtonsWrapper);
					// move this wrapper to the end (after any icons that may exist...)
					if (isMulti) {
						var theWrap = $(subButton).parent();
						$(theWrap).appendTo($(theWrap).parent());
					}
				}
				subButton.addEventListener('click', function() {
					// reset the last checked time for the subreddit list so that we refresh it anew no matter what.
					RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), 0);
				}, false);
				var theSC = document.createElement('span');
				theSC.setAttribute('class', 'res-fancy-toggle-button RESshortcut RESshortcutside');
				theSC.setAttribute('data-subreddit', thisSubredditFragment);
				var idx = module.mySubredditShortcuts.findIndex(function(shortcut) {
					return shortcut.subreddit.toLowerCase() === thisSubredditFragment.toLowerCase();
				});
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
				$('#subButtons-' + thisSubredditFragment).append(theSC);
				var next = $('#subButtons-' + thisSubredditFragment).next();
				if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
					$('#subButtons-' + thisSubredditFragment).before($(next));
					$('#subButtons-' + thisSubredditFragment).addClass('swapped');
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

			var subreddit = $(this).find('a.title').attr('href').match(/^https?:\/\/(?:[a-z]+).reddit.com\/r\/([\w]+).*/i)[1],
				$theSC = $('<span>')
					.css({'margin-right': '0'})
					.addClass('res-fancy-toggle-button')
					.data('subreddit', subreddit),
				isShortcut = module.mySubredditShortcuts.some(function(shortcut) {
					return shortcut.subreddit === subreddit;
				});

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

	var clickedShortcut, clickTimer, hideSubredditGroupDropdownTimer, showSubredditGroupDropdownTimer;

	function redrawShortcuts() {
		shortCutsContainer.textContent = '';
		// Try Refresh subreddit shortcuts
		if (module.mySubredditShortcuts.length === 0) {
			getLatestShortcuts();
		}
		if (module.mySubredditShortcuts.length > 0) {
			// go through the list of shortcuts and print them out...
			module.mySubredditShortcuts = module.mySubredditShortcuts.map(function(shortcut, i) {
				if (typeof shortcut === 'string') {
					shortcut = {
						subreddit: shortcut,
						displayName: shortcut,
						addedDate: Date.now()
					};
				}

				var thisShortCut = document.createElement('a');
				thisShortCut.setAttribute('draggable', 'true');
				thisShortCut.setAttribute('orderIndex', i);
				thisShortCut.setAttribute('data-subreddit', shortcut.subreddit);
				thisShortCut.classList.add('subbarlink');

				if ((RESUtils.currentSubreddit() !== null) && (RESUtils.currentSubreddit().toLowerCase() === shortcut.subreddit.toLowerCase())) {
					thisShortCut.classList.add('RESShortcutsCurrentSub');
				}

				thisShortCut.setAttribute('href', '/r/' + shortcut.subreddit);
				thisShortCut.textContent = shortcut.displayName;
				thisShortCut.addEventListener('click', function(e) {
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

				thisShortCut.addEventListener('dblclick', function(e) {
					e.preventDefault();
					clearTimeout(clickTimer);
					clickTimer = undefined;
					hideSubredditGroupDropdown();
					editSubredditShortcut(e.target);
				}, false);

				thisShortCut.addEventListener('mouseover', function(e) {
					clearTimeout(hideSubredditGroupDropdownTimer);
					showSubredditGroupDropdown(e.target);
				}, false);

				thisShortCut.addEventListener('mouseout', function(e) {
					clearTimeout(showSubredditGroupDropdownTimer);
					hideSubredditGroupDropdownTimer = setTimeout(function() {
						hideSubredditGroupDropdown();
					}, 500);
				}, false);

				thisShortCut.addEventListener('dragstart', subredditDragStart, false);
				thisShortCut.addEventListener('dragenter', subredditDragEnter, false);
				thisShortCut.addEventListener('dragover', subredditDragOver, false);
				thisShortCut.addEventListener('dragleave', subredditDragLeave, false);
				thisShortCut.addEventListener('drop', subredditDrop, false);
				thisShortCut.addEventListener('dragend', subredditDragEnd, false);
				shortCutsContainer.appendChild(thisShortCut);

				if (i < module.mySubredditShortcuts.length - 1) {
					var sep = document.createElement('span');
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
		} else {
			shortCutsContainer.style.textTransform = 'none';
			shortCutsContainer.textContent = 'add shortcuts from the my subreddits menu at left or click the button by the subreddit name, drag and drop to sort';
			module.mySubredditShortcuts = [];
		}
	}

	function showSubredditGroupDropdown(obj) {
		var subreddits = [];
		var suffix = '';

		if ((typeof obj.getAttribute !== 'undefined') && (obj.getAttribute('href').indexOf('+') !== -1)) {
			var cleanSubreddits = obj.getAttribute('href').replace('/r/', '').replace('/r/', '');

			if (cleanSubreddits.indexOf('/') > cleanSubreddits.lastIndexOf('+') || module.options.alwaysApplySuffixToMulti.value) {
				// for shortcuts like a+b/x, use subreddits=a+b ; suffix = x
				// for shortcuts like a/x+b/y, just split them a la pre-4.5.0
				var pos;
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

		var delay;

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
			_showSubredditGroupDropdown.bind(null, obj, subreddits, suffix),
			delay);
	}

	function _showSubredditGroupDropdown(obj, subreddits, suffix) {
		hoveredSubredditShortcut = obj;

		// Show dropdown after an appropriate delay
		if (!subredditGroupDropdown) {
			subredditGroupDropdown = RESUtils.createElement('div', 'RESSubredditGroupDropdown');
			subredditGroupDropdownUL = document.createElement('ul');
			subredditGroupDropdown.appendChild(subredditGroupDropdownUL);

			if (module.options.dropdownEditButton.value) {
				$('	\
					<div class="RESShortcutsEditButtons">	\
						<a href="#"  class="delete res-icon" title="delete">&#xF056;</a>	\
						<a href="#" class="edit res-icon" title="edit">&#xF139;</a>	\
					</div>	\
					').appendTo(subredditGroupDropdown);
			}
			document.body.appendChild(subredditGroupDropdown);

			subredditGroupDropdown.addEventListener('mouseout', function(e) {
				hideSubredditGroupDropdownTimer = setTimeout(function() {
					hideSubredditGroupDropdown();
				}, 500);
			}, false);

			subredditGroupDropdown.addEventListener('mouseover', function(e) {
				clearTimeout(hideSubredditGroupDropdownTimer);
			}, false);

			$(subredditGroupDropdown).on('click', '.edit', function(e) {
				e.preventDefault();
				hideSubredditGroupDropdown();
				editSubredditShortcut(hoveredSubredditShortcut);
			});

			$(subredditGroupDropdown).on('click', '.delete', function(e) {
				e.preventDefault();
				hideSubredditGroupDropdown();
				editSubredditShortcut(hoveredSubredditShortcut);
				deleteButton.click();
			});

		}

		$(subredditGroupDropdownUL).find('li:not(.RESShortcutsEditButtons)').remove();

		if (subreddits) {
			var $rows = $();
			subreddits.forEach(function(subreddit) {
				var thisLI = $('<li><a href="/r/' + subreddit + suffix + '">' + subreddit + '<span class="shortcutSuffix">' + suffix + '</span>' + '</a></li>');
				$rows = $rows.add(thisLI);
				if (RESUtils.currentSubreddit() === subreddit) {
					thisLI.addClass('RESShortcutsCurrentSub');
				}
			});

			$(subredditGroupDropdownUL).prepend($rows);

		}

		var thisXY = RESUtils.getXYpos(obj);
		subredditGroupDropdown.style.top = (thisXY.y + 16) + 'px';
		// if fixed, override y to just be the height of the subreddit bar...
		// subredditGroupDropdown.style.position = 'fixed';
		// subredditGroupDropdown.style.top = '20px';
		subredditGroupDropdown.style.left = thisXY.x + 'px';
		subredditGroupDropdown.style.display = 'block';

		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'subredditGroupDropdown');
	}

	function hideSubredditGroupDropdown() {
		hideSubredditGroupDropdownTimer = undefined;
		if (subredditGroupDropdown) {
			subredditGroupDropdown.style.display = 'none';
			modules['styleTweaks'].setSRStyleToggleVisibility(true, 'subredditGroupDropdown');
		}
	}

	function editSubredditShortcut(ele) {
		var subreddit = ele.getAttribute('href').slice(3);

		var idx = module.mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit === subreddit;
		});

		if (!editShortcutDialog) {
			editShortcutDialog = RESUtils.createElement('div', 'editShortcutDialog');
			document.body.appendChild(editShortcutDialog);
		}

		var thisForm = '<form name="editSubredditShortcut"> \
			<h3>Edit Shortcut</h3> \
			<div id="editShortcutClose" class="RESCloseButton">&times;</div> \
			<div class="RESFormItem"> \
				<label for="subreddit">Subreddit:</label> \
				<div class="RESFieldItem"> \
					<button type="submit" id="sortButton" title="Sort subreddits">A-Z</button><!-- no whitespace \
					--><input type="text" name="subreddit" value="' + subreddit + '" id="shortcut-subreddit"> \
					<div class="RESDescription">Put a + between subreddits to make a drop-down menu.</div> \
				</div> \
			</div> \
			<div class="RESFormItem"> \
				<label for="displayName">Display Name:</label> \
				<div class="RESFieldItem"> \
					<input type="text" name="displayName" value="' + ele.textContent + '" id="shortcut-displayname"> \
				</div> \
			</div> \
			<input type="hidden" name="idx" value="' + idx + '"> \
			<button type="button" name="shortcut-save" id="shortcut-save">save</button> \
			<button type="button" name="shortcut-delete" id="shortcut-delete">delete</button> \
		</form>';
		$(editShortcutDialog).html(thisForm);

		var subredditInput = editShortcutDialog.querySelector('input[name=subreddit]');
		var displayNameInput = editShortcutDialog.querySelector('input[name=displayName]');

		var subredditForm = editShortcutDialog.querySelector('FORM');
		subredditForm.addEventListener('submit', function(e) {
			e.preventDefault();
		}, false);

		var saveButton = editShortcutDialog.querySelector('button[name=shortcut-save]');
		saveButton.addEventListener('click', function(e) {
			var idx = editShortcutDialog.querySelector('input[name=idx]').value;
			var subreddit = editShortcutDialog.querySelector('input[name=subreddit]').value;
			var displayName = editShortcutDialog.querySelector('input[name=displayName]').value;

			saveSubredditShortcut(subreddit, displayName, idx);
			editShortcutDialog.style.display = 'none';
		}, false);

		deleteButton = editShortcutDialog.querySelector('button[name=shortcut-delete]');
		deleteButton.addEventListener('click', function(e) {
			var idx = editShortcutDialog.querySelector('input[name=idx]').value;

			if (confirm('Are you sure you want to delete this shortcut?')) {
				saveSubredditShortcut('', '', idx);
				editShortcutDialog.style.display = 'none';
			}
		}, false);

		// Allow the shortcut dropdown menu to be sorted
		function sortSubmenu(e) {
			var inputEl = editShortcutDialog.querySelector('input[name=subreddit]');
			var currStr = inputEl.value;
			var ascStr, descStr, ascArr, descArr;
			// sort ASC
			ascArr = currStr.split('+');
			ascArr.sort();
			ascStr = ascArr.join('+');
			// sort DESC
			descArr = ascArr;
			descArr.reverse();
			descStr = descArr.join('+');
			var btnTxt = $('#sortButton').text();
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
		var sortButton = editShortcutDialog.querySelector('#sortButton');
		sortButton.addEventListener('click', function(e) {
			sortSubmenu(e);
		}, false);

		// handle the subreddit textfield
		var inputSubreddit = editShortcutDialog.querySelector('input[name=subreddit]');
		inputSubreddit.addEventListener('change', function(e) {
			sortSubmenu(e);
		});

		// handle enter and escape keys in the dialog box...
		subredditInput.addEventListener('keydown', function(e) {
			if (e.keyCode === 13) {
				e.preventDefault();
				e.stopPropagation();
			}
		});
		subredditInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				editShortcutDialog.style.display = 'none';
				editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(saveButton);
			}
		}, false);
		displayNameInput.addEventListener('keyup', function(e) {
			if (e.keyCode === 27) {
				editShortcutDialog.style.display = 'none';
				editShortcutDialog.blur();
			} else if (e.keyCode === 13) {
				RESUtils.click(saveButton);
			}
		}, false);

		var cancelButton = editShortcutDialog.querySelector('#editShortcutClose');
		cancelButton.addEventListener('click', function(e) {
			editShortcutDialog.style.display = 'none';
		}, false);

		editShortcutDialog.style.display = 'block';
		// add 20px to compensate for scrollbar
		var thisLeft = Math.min(RESUtils.mouseX, window.innerWidth - (editShortcutDialog.offsetWidth + 20));
		editShortcutDialog.style.left = thisLeft + 'px';

		setTimeout(function() {
			subredditInput.focus();
		}, 200);
	}

	function saveSubredditShortcut(subreddit, displayName, idx) {
		if (subreddit === '' || displayName === '') {
			// module.mySubredditShortcuts.splice(idx,1);
			subreddit = module.mySubredditShortcuts[idx].subreddit;
			removeSubredditShortcut(subreddit);
		} else {
			module.mySubredditShortcuts[idx] = {
				subreddit: subreddit,
				displayName: displayName,
				addedDate: Date.now()
			};

			saveLatestShortcuts();

			if (RESUtils.proEnabled()) {
				modules['RESPro'].saveModuleData('subredditManager');
			}
		}

		redrawShortcuts();
		populateSubredditDropdown();
	}

	function followSubredditShortcut() {
		if (BrowserDetect.isFirefox()) {
			// stupid firefox... sigh...
			location.href = location.protocol + '//' + location.hostname + clickedShortcut;
		} else {
			location.href = clickedShortcut;
		}
	}

	var dragSrcEl, srDataTransfer;

	function subredditDragStart(e) {
		clearTimeout(clickTimer);
		// Target (this) element is the source node.
		this.style.opacity = '0.4';
		module.shortCutsTrash.style.display = 'block';
		dragSrcEl = this;

		e.dataTransfer.effectAllowed = 'move';
		// because Safari is stupid, we have to do this.
		srDataTransfer = this.getAttribute('orderIndex') + ',' + $(this).data('subreddit');
	}

	function subredditDragEnter(e) {
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

	function subredditDragLeave(e) {
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
			var theData, srcOrderIndex, srcSubreddit;
			if (e.target.getAttribute('id') !== 'RESShortcutsTrash') {
				// get the order index of the src and destination to swap...
				// var theData = e.dataTransfer.getData('text/html').split(',');
				theData = srDataTransfer.split(',');
				srcOrderIndex = parseInt(theData[0], 10);
				srcSubreddit = module.mySubredditShortcuts[srcOrderIndex];
				var destOrderIndex = parseInt(this.getAttribute('orderIndex'), 10);
				var destSubreddit = module.mySubredditShortcuts[destOrderIndex];
				var rearranged = [];
				var rearrangedI = 0;

				module.mySubredditShortcuts.forEach(function(shortcut, i) {
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
				theData = srDataTransfer.split(',');
				srcOrderIndex = parseInt(theData[0], 10);
				srcSubreddit = theData[1];
				removeSubredditShortcut(srcSubreddit);
			}
		}
		return false;
	}

	function subredditDragEnd(e) {
		module.shortCutsTrash.style.display = 'none';
		this.style.opacity = '1';
		return false;
	}

	function redrawSubredditBar() {
		var headerContents = document.querySelector('#sr-header-area');
		if (headerContents) {
			// Clear out the existing stuff in the top bar first, we'll replace it with our own stuff.
			$(headerContents).html('');

			var srLeftContainer = RESUtils.createElement('div', 'srLeftContainer');
			srLeftContainer.setAttribute('class', 'sr-bar');

			var srDropdown = RESUtils.createElement('div', 'srDropdown');
			var srDropdownContainer = RESUtils.createElement('div', 'srDropdownContainer');
			$(srDropdownContainer).html('<a href="javascript:void 0">My Subreddits</a>');
			srDropdownContainer.addEventListener('click', toggleSubredditDropdown, false);
			srDropdown.appendChild(srDropdownContainer);

			srList = RESUtils.createElement('table', 'srList');
			var maxHeight = $(window).height() - 40;
			$(srList).css('max-height', maxHeight + 'px');
			// srDropdownContainer.appendChild(srList);
			document.body.appendChild(srList);

			srLeftContainer.appendChild(srDropdown);
			var sep = document.createElement('span');
			sep.setAttribute('class', 'srSep');
			sep.textContent = '|';
			srLeftContainer.appendChild(sep);

			// now put in the shortcuts...
			var staticShortCutsContainer = document.createElement('div');
			staticShortCutsContainer.setAttribute('id', 'RESStaticShortcuts');
			/* this probably isn't the best way to give the option, since the mechanic is drag/drop for other stuff..  but it's much easier for now... */
			$(staticShortCutsContainer).html('');
			var specialButtonSelected = {};
			var subLower = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : 'home';
			specialButtonSelected[subLower] = 'RESShortcutsCurrentSub';

			var shortCutsHTML = '';

			if (module.options.linkDashboard.value) shortCutsHTML += '<span class="separator">-</span><a id="RESDashboardLink" class="subbarlink ' + specialButtonSelected['dashboard'] + '" href="/r/Dashboard/">Dashboard</a>';
			if (module.options.linkFront.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['home'] + '" href="/">Front</a>';
			if (module.options.linkAll.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['all'] + '" href="/r/all/">All</a>';
			if (module.options.linkRandom.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/random/">Random</a>';
			if (module.options.linkMyRandom.value && module.myRandomEnabled) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + (module.myRandomGold ? 'gold' : '') + '" href="/r/myrandom/">MyRandom</a>';
			if (module.options.linkRandNSFW.value) shortCutsHTML += '<span class="separator over18">-</span><a class="subbarlink over18" href="/r/randnsfw/">RandNSFW</a>';

			if (RESUtils.loggedInUser()) {
				if (module.options.linkFriends.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['friends'] + '" href="/r/friends/">Friends</a>';

				if (RESUtils.isModeratorAnywhere()) {
					if (module.options.linkMod.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink ' + specialButtonSelected['mod'] + '" href="/r/mod/">Mod</a>';
					if (module.options.linkModqueue.value) shortCutsHTML += '<span class="separator">-</span><a class="subbarlink" href="/r/mod/about/modqueue">Modqueue</a>';
				}
			}
			if (module.options.buttonEdit.value) shortCutsHTML += '<span class="separator">-</span>' + modules['settingsNavigation'].makeUrlHashLink('subredditManager', '', 'edit', 'subbarlink');

			$(staticShortCutsContainer).append(shortCutsHTML);

			srLeftContainer.appendChild(staticShortCutsContainer);
			srLeftContainer.appendChild(sep);
			headerContents.appendChild(srLeftContainer);

			var shortCutsViewport = document.createElement('div');
			shortCutsViewport.setAttribute('id', 'RESShortcutsViewport');
			headerContents.appendChild(shortCutsViewport);

			shortCutsContainer = document.createElement('div');
			shortCutsContainer.setAttribute('id', 'RESShortcuts');
			shortCutsContainer.setAttribute('class', 'sr-bar');
			shortCutsViewport.appendChild(shortCutsContainer);

			var shortCutsEditContainer = document.createElement('div');
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
			var shortCutsRight = document.createElement('div');
			shortCutsRight.setAttribute('id', 'RESShortcutsRight');
			shortCutsRight.textContent = '>';
			shortCutsRight.addEventListener('click', function(e) {
				var marginLeft = shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				if (shortCutsContainer.offsetWidth > (shiftWidth)) {
					marginLeft -= shiftWidth;
					shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			shortCutsEditContainer.appendChild(shortCutsRight);

			// add an "add shortcut" button...
			var shortCutsAdd = RESUtils.createElement('div', 'RESShortcutsAdd', 'res-icon');
			shortCutsAdd.innerHTML = '&#xF139;';
			shortCutsAdd.title = 'add shortcut';
			var shortCutsAddFormContainer = document.createElement('div');
			shortCutsAddFormContainer.setAttribute('id', 'RESShortcutsAddFormContainer');
			shortCutsAddFormContainer.style.display = 'none';
			var thisForm = ' \
				<form id="shortCutsAddForm"> \
					<div>Add shortcut or multi-reddit (i.e. foo+bar+baz):</div> \
					<label for="newShortcut">Subreddit:</label> <input type="text" id="newShortcut"><br> \
					<label for="displayName">Display Name:</label> <input type="text" id="displayName"><br> \
					<input type="submit" name="submit" value="add" id="addSubreddit"> \
					<div style="clear: both; float: right; margin-top: 5px;"><a style="font-size: 9px;" href="/subreddits/">Edit frontpage subscriptions</a></div> \
				</form> \
			';
			$(shortCutsAddFormContainer).html(thisForm);
			var shortCutsAddFormField = shortCutsAddFormContainer.querySelector('#newShortcut');
			var shortCutsAddFormFieldDisplayName = shortCutsAddFormContainer.querySelector('#displayName');

			shortCutsAddFormField.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					shortCutsAddFormContainer.style.display = 'none';
					shortCutsAddFormField.blur();
				}
			}, false);

			shortCutsAddFormFieldDisplayName.addEventListener('keyup', function(e) {
				if (e.keyCode === 27) {
					shortCutsAddFormContainer.style.display = 'none';
					shortCutsAddFormFieldDisplayName.blur();
				}
			}, false);

			// add the "add shortcut" form...
			var shortCutsAddForm = shortCutsAddFormContainer.querySelector('#shortCutsAddForm');
			shortCutsAddForm.addEventListener('submit', function(e) {
				e.preventDefault();
				var subreddit = shortCutsAddFormField.value;
				var displayname = shortCutsAddFormFieldDisplayName.value;
				if (displayname === '') displayname = subreddit;

				var rMatchRegex = /^(\/r\/|r\/)(.*)/i;
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
			shortCutsAdd.addEventListener('click', function(e) {
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
			var shortCutsLeft = document.createElement('div');
			shortCutsLeft.setAttribute('id', 'RESShortcutsLeft');
			shortCutsLeft.textContent = '<';
			shortCutsLeft.addEventListener('click', function(e) {
				var marginLeft = shortCutsContainer.firstChild.style.marginLeft;
				marginLeft = parseInt(marginLeft.replace('px', ''), 10);

				if (isNaN(marginLeft)) marginLeft = 0;

				var shiftWidth = $('#RESShortcutsViewport').width() - 80;
				marginLeft += shiftWidth;
				if (marginLeft <= 0) {
					shortCutsContainer.firstChild.style.marginLeft = marginLeft + 'px';
				}
			}, false);
			shortCutsEditContainer.appendChild(shortCutsLeft);

			redrawShortcuts();
		}
	}

	function showSortMenu() {
		// Add shortcut sorting menu if it doesn't exist in the DOM yet...
		if (!sortMenu) {
			sortMenu =
				$('<div id="sort-menu" class="drop-choices">' +
					'<p>&nbsp;sort by:</p>' +
					'<a class="choice" data-field="displayName" href="javascript:void 0">display name</a>' +
					'<a class="choice" data-field="addedDate" href="javascript:void 0">added date</a>' +
					'</div>');

			$(sortMenu).find('a').click(sortShortcuts);

			$(document.body).append(sortMenu);
		}
		var menu = sortMenu;
		if ($(menu).is(':visible')) {
			$(menu).hide();
			return;
		}
		var thisXY = $(module.sortShortcutsButton).offset();
		thisXY.left = thisXY.left - $(menu).width() + $(module.sortShortcutsButton).width();
		var thisHeight = $(module.sortShortcutsButton).height();

		$(menu).css({
			top: thisXY.top + thisHeight,
			left: thisXY.left
		}).show();
	}

	function hideSortMenu() {
		$(sortMenu).hide();
	}

	var currentSort;

	function sortShortcuts(e) {
		hideSortMenu();

		var sortingField = $(this).data('field');
		var asc = !currentSort;
		// toggle sort method...
		currentSort = !currentSort;
		// Make sure we have a valid list of shortucts
		if (!module.mySubredditShortcuts) {
			getLatestShortcuts();
		}

		module.mySubredditShortcuts.sort(function(a, b) {
			// var sortingField = field; // module.options.sortingField.value;
			// var asc = order === 'asc'; // (module.options.sortingDirection.value === 'asc');
			var aField = a[sortingField];
			var bField = b[sortingField];
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

	var subredditPagesLoaded;

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

	module.mySubreddits = [];
	module.mySubredditShortcuts = [];

	async function getSubredditJSON(after = '') {
		const { data } = await RESEnvironment.ajax({
			url: '/subreddits/mine.json',
			data: { after },
			type: 'json'
		});

		if (data && data.children) {
			if (subredditPagesLoaded.innerHTML === '') {
				subredditPagesLoaded.textContent = 'Pages loaded: 1';
			} else {
				var pages = subredditPagesLoaded.innerHTML.match(/:\ ([\d]+)/);
				subredditPagesLoaded.textContent = 'Pages loaded: ' + (parseInt(pages[1], 10) + 1);
			}

			var now = Date.now();
			RESStorage.setItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser(), now);

			var subreddits = data.children;
			for (var i = 0, len = subreddits.length; i < len; i++) {
				var srObj = {
					display_name: subreddits[i].data.display_name,
					url: subreddits[i].data.url,
					over18: subreddits[i].data.over18,
					id: subreddits[i].data.id,
					created: subreddits[i].data.created,
					description: subreddits[i].data.description
				};
				module.mySubreddits.push(srObj);
			}

			if (data.after) {
				getSubredditJSON(data.after);
			} else {
				module.mySubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();
					if (adisp > bdisp) return 1;
					if (adisp === bdisp) return 0;
					return -1;
				});

				// Remove duplicate subreddits
				{
					const id = new Set();
					module.mySubreddits = module.mySubreddits.filter(sr => !id.has(sr) && id.add(sr));
				}

				RESStorage.setItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser(), JSON.stringify(module.mySubreddits));
				gettingSubreddits = false;
				populateSubredditDropdown();
			}
		} else {
			// User is probably not logged in.. no subreddits found.
			populateSubredditDropdown(null, true);
		}
	}

	function getSubreddits() {
		module.mySubreddits = [];
		var lastCheck = parseInt(RESStorage.getItem('RESmodules.subredditManager.subreddits.lastCheck.' + RESUtils.loggedInUser()), 10) || 0;
		var now = Date.now();
		var check = RESStorage.getItem('RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());

		// 86400000 = 1 day
		if (((now - lastCheck) > 86400000) || !check || (check.length === 0)) {
			if (!gettingSubreddits) {
				gettingSubreddits = true;
				getSubredditJSON();
			}
		} else {
			module.mySubreddits = safeJSON.parse(check, 'RESmodules.subredditManager.subreddits.' + RESUtils.loggedInUser());
			populateSubredditDropdown();
		}
	}

	// if badJSON is true, then getSubredditJSON ran into an error...
	function populateSubredditDropdown(sortBy, badJSON) {
		module.sortBy = sortBy || 'subreddit';
		$(srList).html('');
		// NOTE WE NEED TO CHECK LAST TIME THEY UPDATED THEIR SUBREDDIT LIST AND REPOPULATE...

		var tableHead = document.createElement('thead');
		var tableRow = document.createElement('tr');

		var srHeader = document.createElement('td');
		srHeader.addEventListener('click', function() {
			if (module.sortBy === 'subreddit') {
				populateSubredditDropdown('subredditDesc');
			} else {
				populateSubredditDropdown('subreddit');
			}
		}, false);
		srHeader.textContent = 'subreddit';
		srHeader.setAttribute('width', '200');

		var lvHeader = document.createElement('td');
		lvHeader.addEventListener('click', function() {
			if (module.sortBy === 'lastVisited') {
				populateSubredditDropdown('lastVisitedAsc');
			} else {
				populateSubredditDropdown('lastVisited');
			}
		}, false);
		lvHeader.textContent = 'Last Visited';
		lvHeader.setAttribute('width', '120');

		var scHeader = document.createElement('td');
		$(scHeader).width(50);
		$(scHeader).html('<a style="float: right;" href="/subreddits/">View all &raquo;</a>');
		tableRow.appendChild(srHeader);
		tableRow.appendChild(lvHeader);
		tableRow.appendChild(scHeader);
		tableHead.appendChild(tableRow);
		srList.appendChild(tableHead);

		var theBody = document.createElement('tbody');
		if (!badJSON) {
			var subredditCount = module.mySubreddits.length;

			if (typeof subredditsLastViewed === 'undefined') {
				var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				if (check) {
					subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
				} else {
					subredditsLastViewed = {};
				}
			}

			// copy module.mySubreddits to a placeholder array so we can sort without modifying it...
			var sortableSubreddits = module.mySubreddits;
			if (sortBy === 'lastVisited') {
				$(lvHeader).html('Last Visited <div class="sortAsc"></div>');
				srHeader.textContent = 'subreddit';

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					var alv = (typeof subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[adisp].last_visited, 10);
					var blv = (typeof subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[bdisp].last_visited, 10);

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

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					var alv = (typeof subredditsLastViewed[adisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[adisp].last_visited, 10);
					var blv = (typeof subredditsLastViewed[bdisp] === 'undefined') ? 0 : parseInt(subredditsLastViewed[bdisp].last_visited, 10);

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

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp < bdisp) return 1;
					if (adisp === bdisp) return 0;
					return -1;
				});
			} else {
				lvHeader.textContent = 'Last Visited';
				$(srHeader).html('subreddit <div class="sortAsc"></div>');

				sortableSubreddits.sort(function(a, b) {
					var adisp = a.display_name.toLowerCase();
					var bdisp = b.display_name.toLowerCase();

					if (adisp > bdisp) return 1;
					if (adisp === bdisp) return 0;
					return -1;
				});
			}
			for (var i = 0; i < subredditCount; i++) {
				var dateString = 'Never';
				var thisReddit = sortableSubreddits[i].display_name.toLowerCase();
				if (typeof subredditsLastViewed[thisReddit] !== 'undefined') {
					var ts = parseInt(subredditsLastViewed[thisReddit].last_visited, 10);
					var dateVisited = new Date(ts);
					dateString = RESUtils.niceDate(dateVisited);
				}

				var theRow = document.createElement('tr');
				var theSR = document.createElement('td');
				$(theSR).html('<a href="' + escapeHTML(module.mySubreddits[i].url) + '">' + escapeHTML(module.mySubreddits[i].display_name) + '</a>');
				theRow.appendChild(theSR);

				var theLV = document.createElement('td');
				theLV.textContent = dateString;
				theLV.setAttribute('class', 'RESvisited');
				theRow.appendChild(theLV);

				var theSC = document.createElement('td');
				theSC.setAttribute('class', 'RESshortcut');
				theSC.setAttribute('data-subreddit', module.mySubreddits[i].display_name);

				var idx = module.mySubredditShortcuts.findIndex(function(shortcut) {
					return shortcut.subreddit === shortcut.display_name;
				});

				if (idx !== -1) {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						removeSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '-shortcut';
				} else {
					theSC.addEventListener('click', function(e) {
						if (e.stopPropagation) {
							e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...
						}

						var subreddit = $(e.target).data('subreddit');
						addSubredditShortcut(subreddit);
					}, false);

					theSC.textContent = '+shortcut';
				}

				theRow.appendChild(theSC);
				theBody.appendChild(theRow);
			}
		} else {
			var errorTD = document.createElement('td');
			errorTD.textContent = 'There was an error getting your subreddits. You may have third party cookies disabled by your browser. For this function to work, you\'ll need to add an exception for cookies from reddit.com';
			errorTD.setAttribute('colspan', '3');

			var errorRow = document.createElement('tr');
			errorRow.appendChild(errorTD);
			theBody.appendChild(errorRow);
		}

		srList.appendChild(theBody);
	}

	module.toggleSubredditShortcut = function(e) {
		e.stopPropagation(); // Stops from triggering the click on the bigger box, which toggles this window closed...

		var isShortcut = module.mySubredditShortcuts.some(function(shortcut) {
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
		var username = module.options.shortcutsPerAccount.value ? RESUtils.loggedInUser() : null;
		var key = 'RESmodules.subredditManager.subredditShortcuts.' + username;
		return key;
	}

	function getLatestShortcuts() {
		// re-retreive the latest data to ensure we're not losing info between tab changes...
		var key = getShortcutsStorageKey();
		var shortCuts = RESStorage.getItem(key);
		if (!shortCuts) {
			shortCuts = '[]';
		}

		module.mySubredditShortcuts = safeJSON.parse(shortCuts, key);
		parseDates();
	}

	// JSON specification doesn't specify what to do with dates - so unstringify here
	function parseDates() {
		for (var i = 0, len = module.mySubredditShortcuts.length; i < len; i++) {
			module.mySubredditShortcuts[i].addedDate = module.mySubredditShortcuts[i].addedDate ? new Date(module.mySubredditShortcuts[i].addedDate) : new Date(0);
		}
	}

	function saveLatestShortcuts() {
		// Retreive the latest data to ensure we're not losing info
		if (!module.mySubredditShortcuts) {
			module.mySubredditShortcuts = [];
		}

		var key = getShortcutsStorageKey();
		RESStorage.setItem(key, JSON.stringify(module.mySubredditShortcuts));
	}

	function addSubredditShortcut(subreddit, displayname) {
		getLatestShortcuts();

		var idx = module.mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === subreddit.toLowerCase();
		});

		if (idx !== -1) {
			alert('Whoops, you already have a shortcut for that subreddit');
		} else {
			displayname = displayname || subreddit;
			var subredditObj = {
				subreddit: subreddit,
				displayName: displayname.toLowerCase(),
				addedDate: Date.now()
			};

			module.mySubredditShortcuts.push(subredditObj);

			saveLatestShortcuts();
			redrawShortcuts();
			populateSubredditDropdown();

			modules['notifications'].showNotification({
				moduleID: 'subredditManager',
				message: 'Subreddit shortcut added. You can edit by double clicking, or trash by dragging to the trash can.'
			});
		}
	}

	function removeSubredditShortcut(subreddit) {
		getLatestShortcuts();

		var idx = module.mySubredditShortcuts.findIndex(function(shortcut) {
			return shortcut.subreddit.toLowerCase() === subreddit.toLowerCase();
		});

		if (idx !== -1) {
			module.mySubredditShortcuts.splice(idx, 1);

			saveLatestShortcuts();
			redrawShortcuts();
			populateSubredditDropdown();
		}
	}

	function setLastViewtime() {
		var check = RESStorage.getItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());

		if (!check) {
			subredditsLastViewed = {};
		} else {
			subredditsLastViewed = safeJSON.parse(check, 'RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser());
		}

		var now = Date.now();
		var thisReddit = RESUtils.currentSubreddit().toLowerCase();
		subredditsLastViewed[thisReddit] = {
			last_visited: now
		};

		RESStorage.setItem('RESmodules.subredditManager.subredditsLastViewed.' + RESUtils.loggedInUser(), JSON.stringify(subredditsLastViewed));
	}

	module.subscribeToSubreddit = function(subredditName, subscribe = true) {
		// subredditName should look like t5_123asd
		return RESEnvironment.ajax({
			method: 'POST',
			url: '/api/subscribe',
			data: {
				sr: subredditName,
				action: subscribe ? 'sub' : 'unsub'
			}
		});
	};

	function lastUpdate() {
		var mySubredditList = $('.drop-choices.srdrop a').map(function(){return this.textContent;}).toArray().join();
		var mySubredditListCachedObject = RESStorage.getItem('RESmodules.subredditManager.mySubredditList');
		if (mySubredditListCachedObject) {
			mySubredditListCachedObject = JSON.parse(mySubredditListCachedObject); // contain last saved subreddit list + time for each user
		} else {
			mySubredditListCachedObject = {};
		}
		var mySubredditListCached = mySubredditListCachedObject[RESUtils.loggedInUser()], // last saved subreddit lsit + time for current user
			_lastUpdate;
		if (mySubredditListCached && mySubredditListCached.list === mySubredditList) {
			_lastUpdate = parseInt((new Date().getTime() - mySubredditListCached.time)/60000, 10);
			if (_lastUpdate > 31) {
				_lastUpdate = false; // the user have probably less than 50/100 subscription, this module doesn't concern him
				mySubredditListCached.time = new Date().getTime()-32*60000; // we change time to avoid deleting it just after (to don't show him again the last update)
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
			$('.listing-chooser a:first .description').after('<br /><span class="description"><b>last update:</b><br />' + _lastUpdate + '</span>');
		}
		// we now remove inactive user
		var inactiveThreshold = new Date().getTime() - 2592000000; // one month
		for (var user in mySubredditListCachedObject) {
			if (mySubredditListCachedObject[user].time < inactiveThreshold) {
				delete mySubredditListCachedObject[user];
			}
		}
		RESStorage.setItem('RESmodules.subredditManager.mySubredditList', JSON.stringify(mySubredditListCachedObject));
	}
});
