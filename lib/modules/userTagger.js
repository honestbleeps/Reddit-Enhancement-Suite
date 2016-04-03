addModule('userTagger', (module, moduleID) => {
	module.moduleName = 'User Tagger';
	module.category = 'Users';
	module.description = 'Adds a great deal of customization around users - tagging them, ignoring them, and more. You can manage tagged users on <a href="/r/Dashboard/#userTaggerContents">Manage User Tags</a>.';
	module.options = {
		/*
		defaultMark: {
			type: 'text',
			value: '_',
			description: 'clickable mark for users with no tag'
		},
		*/
		hardIgnore: {
			type: 'boolean',
			value: false,
			description: 'When "hard ignore" is off, only post titles and comment text is hidden. When it is on, the entire post is hidden (or for comments, collapsed).'
		},
		colorUser: {
			type: 'boolean',
			value: true,
			description: 'Color users based on cumulative upvotes / downvotes',
			advanced: true
		},
		storeSourceLink: {
			type: 'boolean',
			value: true,
			description: 'By default, store a link to the link/comment you tagged a user on',
			advanced: true
		},
		useCommentsLinkAsSource: {
			type: 'boolean',
			value: true,
			description: 'By default, store a link to the comments when tagging a user in a link post. Otherwise, the link (that the post refers to) will be used.',
			advanced: true
		},
		vwNumber: {
			type: 'boolean',
			value: true,
			description: 'Show the number (i.e. [+6]) rather than [vw]',
			advanced: true
		},
		vwTooltip: {
			type: 'boolean',
			value: true,
			description: 'Show the vote weight tooltip on hover (i.e. "your votes for...")',
			advanced: true
		}
	};

	module.usernameRE = /(?:u|user)\/([\w\-]+)/;
	let userTaggerToolTip, userTaggerTag, userTaggerColor, userTaggerPreview;

	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;
		module.tags = await RESEnvironment.storage.get('RESmodules.userTagger.tags') || {};
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// If we're on the dashboard, add a tab to it...
			if (RESUtils.currentSubreddit('dashboard')) {
				// add tab to dashboard
				modules['dashboard'].addTab('userTaggerContents', 'My User Tags');
				// populate the contents of the tab
				const $showDiv = $('<div class="show">Show </div>');
				const $tagFilter = $('<select id="tagFilter"><option>tagged users</option><option>all users</option></select>');
				$($showDiv).append($tagFilter);
				$('#userTaggerContents').append($showDiv);
				$('#tagFilter').change(() => drawUserTagTable());

				const tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
				if (tagsPerPage) {
					const controlWrapper = document.createElement('div');
					controlWrapper.id = 'tagPageControls';
					controlWrapper.className = 'RESGalleryControls';
					controlWrapper.page = 1;
					controlWrapper.pageCount = 1;

					const leftButton = document.createElement('a');
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', () => {
						if (controlWrapper.page === 1) {
							controlWrapper.page = controlWrapper.pageCount;
						} else {
							controlWrapper.page--;
						}
						drawUserTagTable();
					});
					$(controlWrapper).append('Page ');
					controlWrapper.appendChild(leftButton);

					const posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					posLabel.textContent = '1 of 2';
					controlWrapper.appendChild(posLabel);

					const rightButton = document.createElement('a');
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', () => {
						if (controlWrapper.page === controlWrapper.pageCount) {
							controlWrapper.page = 1;
						} else {
							controlWrapper.page++;
						}
						drawUserTagTable();
					});
					controlWrapper.appendChild(rightButton);

					$('#userTaggerContents').append(controlWrapper);
				}
				const $thisTable = $('<table id="userTaggerTable" />');
				$($thisTable).append('<thead><tr><th sort="username" class="active">Username <span class="sortAsc"></span></th><th sort="tag">Tag</th><th sort="ignore">Ignored</th><th sort="color">Color</th><th sort="votes">Vote Weight</th></tr></thead><tbody></tbody>');
				$('#userTaggerContents').append($thisTable);
				$('#userTaggerTable thead th').click(function(e) {
					e.preventDefault();
					const $this = $(this);

					if ($this.hasClass('delete')) {
						return false;
					}
					if ($this.hasClass('active')) {
						$this.toggleClass('descending');
					}
					$this.addClass('active');
					$this.siblings().removeClass('active').find('SPAN').remove();
					$this.find('.sortAsc, .sortDesc').remove();
					$this.append($(e.target).hasClass('descending') ?
						'<span class="sortDesc" />' :
						'<span class="sortAsc" />');
					drawUserTagTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				drawUserTagTable();
			}

			if (this.options.colorUser.value) {
				attachVoteHandlers(document.body);
			}
			// add tooltip to document body...
			userTaggerToolTip = RESUtils.createElement('div', 'userTaggerToolTip', 'RESDialogSmall');
			let thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
			thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
			thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
			thisHTML += '<div id="userTaggerClose" class="RESCloseButton">&times;</div>';
			thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
			for (const color in bgToTextColorMap) {
				const bgColor = (color === 'none') ? 'transparent' : color;
				thisHTML += `<option style="background-color: ${bgColor}; color: ${bgToTextColorMap[color]} !important;" value="${color}">${color}</option>`;
			}
			thisHTML += '</select>';
			thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
			thisHTML += `<label for="userTaggerIgnore">Ignore ${modules['settingsNavigation'].makeUrlHashLink('userTagger', 'hardIgnore', ' ', 'gearIcon')}</label>`;
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span> <span class="userTaggerOpenLink">- <a href="#">Open</a></span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight" title="The sum of upvotes and downvotes you have given this redditor">Vote Weight<span class="hoverHelp" title="manually edit vote weight (sum of upvotes and downvotes) for this redditor">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><a href="/r/dashboard#userTaggerContents" target="_blank">See all tags</a><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			$(userTaggerToolTip).html(thisHTML);
			const ignoreLabel = userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
			const icons = ignoreIcons();
			const ignoreToggle = RESUtils.createElement.toggleButton(null, 'userTaggerIgnore', false, icons.normal, icons.ignored);
			ignoreToggle.classList.add('reverseToggleButton');
			RESUtils.insertAfter(ignoreLabel, ignoreToggle);
			userTaggerTag = userTaggerToolTip.querySelector('#userTaggerTag');
			userTaggerTag.addEventListener('keyup', updateTagPreview, false);
			userTaggerColor = userTaggerToolTip.querySelector('#userTaggerColor');
			userTaggerColor.addEventListener('change', updateTagPreview, false);
			userTaggerPreview = userTaggerToolTip.querySelector('#userTaggerPreview');
			const userTaggerLink = userTaggerToolTip.querySelector('#userTaggerLink');
			userTaggerLink.addEventListener('keyup', () => updateOpenLink(userTaggerLink), false);
			const userTaggerOpen = userTaggerToolTip.querySelector('.userTaggerOpenLink a');
			userTaggerOpen.addEventListener('click', e => {
				e.preventDefault();
				const links = userTaggerLink.value.split(/\s/);
				RESEnvironment.openNewTabs('none', ...links);
			});
			const userTaggerSave = userTaggerToolTip.querySelector('#userTaggerSave');
			userTaggerSave.setAttribute('type', 'submit');
			userTaggerSave.setAttribute('value', '✓ save tag');
			userTaggerSave.addEventListener('click', e => {
				e.preventDefault();
				saveTagForm();
			}, false);
			const userTaggerClose = userTaggerToolTip.querySelector('#userTaggerClose');
			userTaggerClose.addEventListener('click', () => closeUserTagPrompt(), false);
			// userTaggerToolTip.appendChild(userTaggerSave);
			const userTaggerForm = userTaggerToolTip.querySelector('FORM');
			userTaggerForm.addEventListener('submit', e => {
				e.preventDefault();
				saveTagForm();
			}, true);
			document.body.appendChild(userTaggerToolTip);

			userTaggerToolTip.querySelector('#userTaggerTag').addEventListener('keydown', e => {
				if (e.keyCode === 27) {
					// close prompt.
					closeUserTagPrompt();
				}
			}, true);
			// console.log('before applytags: ' + Date());
			applyTags();
			// console.log('after applytags: ' + Date());
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', attachVoteHandlersToComment);
				RESUtils.watchForElement('newComments', applyTags);
			} else {
				RESUtils.watchForElement('siteTable', attachVoteHandlers);
				RESUtils.watchForElement('siteTable', applyTags);
			}

			registerCommandLine();
		}
	};

	function registerCommandLine() {
		modules['commandLine'].registerCommand('tag', 'tag [text] - tags author of currently selected link/comment as text',
			(command, val) => {
				const tagLink = getAuthorTagLink();
				if (tagLink) {
					let str = `tag user ${tagLink.getAttribute('username')}`;
					if (val) {
						str += ` as: ${val}`;
					}
					return str;
				} else {
					return 'can\'t set tag - no post/comment selected';
				}
			},
			(command, val) => {
				const tagLink = getAuthorTagLink();
				if (tagLink) {
					RESUtils.click(tagLink);
					setTimeout(() => {
						if (val !== '') {
							document.getElementById('userTaggerTag').value = val;
						}
					}, 20);
				} else {
					return 'can\'t set tag - no post/comment selected';
				}
			}
		);

		function getAuthorTagLink() {
			const selected = modules['selectedEntry'].selected();
			const searchArea = selected ? selected.entry : document.body;

			return searchArea.querySelector('a.userTagLink');
		}
	}

	function attachVoteHandlersToComment(comment) {
		const obj = $(comment).closest('.thing')[0];
		// Attach to this comment, but not its children
		attachVoteHandlers(obj, 1);
	}

	function attachVoteHandlers(obj, maxPairs) {
		if (!RESUtils.loggedInUser()) return;

		let voteButtons = obj.querySelectorAll('.midcol .arrow');
		if (maxPairs) {
			voteButtons = Array.from(voteButtons).slice(0, maxPairs * 2);
		} else {
			voteButtons = Array.from(voteButtons);
		}
		voteButtons.forEach(voteButton => voteButton.addEventListener('click', handleVoteClick, true));
	}

	function handleVoteClick() {
		const $this = $(this);
		const $otherArrow = $this.siblings('.arrow');
		const thing = new RESUtils.thing(this);
		let thisAuthor = thing.getAuthor();

		// Stop if the post is archived (unvotable) or you are voting on your own post/comment/etc.
		if ($this.hasClass('archived') || !thisAuthor || thisAuthor === RESUtils.loggedInUser()) {
			return;
		}

		const thisVWobj = $(thing.getAuthorElement()).nextAll('.voteWeight')[0];

		thisAuthor = thisAuthor.toLowerCase();
		module.tags[thisAuthor] = module.tags[thisAuthor] || {};

		let votes = parseInt(module.tags[thisAuthor].votes, 10) || 0;

		// there are 6 possibilities here:
		// 1) no vote yet, click upmod
		// 2) no vote yet, click downmod
		// 3) already upmodded, undoing
		// 4) already downmodded, undoing
		// 5) upmodded before, switching to downmod
		// 6) downmodded before, switching to upmod

		// classes are changed AFTER this event is triggered
		if ($this.hasClass('up')) {
			// adding an upvote
			votes++;
			if ($otherArrow.hasClass('downmod')) {
				// also removing a downvote
				votes++;
			}
		} else if ($this.hasClass('upmod')) {
			// removing an upvote directly
			votes--;
		} else if ($this.hasClass('down')) {
			// adding a downvote
			votes--;
			if ($otherArrow.hasClass('upmod')) {
				// also removing an upvote
				votes--;
			}
		} else if ($this.hasClass('downmod')) {
			// removing a downvote directly
			votes++;
		}

		module.tags[thisAuthor].votes = votes;
		RESEnvironment.storage.patch('RESmodules.userTagger.tags', { [thisAuthor]: { votes } });

		colorUser(thisVWobj, thisAuthor, module.tags[thisAuthor].votes);
	}

	let currentSortMethod, isDescending;

	function drawUserTagTable(sortMethod, descending) {
		currentSortMethod = sortMethod || currentSortMethod;
		isDescending = (typeof descending === 'undefined' || descending === null) ? isDescending : descending;
		const taggedUsers = [];
		const filterType = $('#tagFilter').val();
		for (const tagIndex in module.tags) {
			if (filterType === 'tagged users') {
				if (typeof module.tags[tagIndex].tag !== 'undefined') {
					taggedUsers.push(tagIndex);
				}
			} else {
				taggedUsers.push(tagIndex);
			}
		}
		switch (currentSortMethod) {
			case 'tag':
				taggedUsers.sort((a, b) => {
					const tagA = (typeof module.tags[a].tag === 'undefined') ? 'zzzzz' : module.tags[a].tag.toLowerCase();
					const tagB = (typeof module.tags[b].tag === 'undefined') ? 'zzzzz' : module.tags[b].tag.toLowerCase();
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'ignore':
				taggedUsers.sort((a, b) => {
					const tagA = (typeof module.tags[a].ignore === 'undefined') ? 'z' : 'a';
					const tagB = (typeof module.tags[b].ignore === 'undefined') ? 'z' : 'a';
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'color':
				taggedUsers.sort((a, b) => {
					const colorA = (typeof module.tags[a].color === 'undefined') ? 'zzzzz' : module.tags[a].color.toLowerCase();
					const colorB = (typeof module.tags[b].color === 'undefined') ? 'zzzzz' : module.tags[b].color.toLowerCase();
					return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'votes':
				taggedUsers.sort((a, b) => {
					const tagA = (typeof module.tags[a].votes === 'undefined') ? 0 : module.tags[a].votes;
					const tagB = (typeof module.tags[b].votes === 'undefined') ? 0 : module.tags[b].votes;
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : (a.toLowerCase() > b.toLowerCase());
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'username':
				/* falls through */
			default:
				// sort users, ignoring case
				taggedUsers.sort((a, b) =>
					(a.toLowerCase() > b.toLowerCase()) ? 1 : (b.toLowerCase() > a.toLowerCase()) ? -1 : 0
				);
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
		}
		$('#userTaggerTable tbody').html('');
		const tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
		const count = taggedUsers.length;
		let start = 0;
		let end = count;

		if (tagsPerPage) {
			const $tagControls = $('#tagPageControls');
			let page = $tagControls.prop('page');
			const pages = Math.ceil(count / tagsPerPage);
			page = Math.min(page, pages);
			page = Math.max(page, 1);
			$tagControls.prop('page', page).prop('pageCount', pages);
			$tagControls.find('.RESGalleryLabel').text(`${page} of ${pages}`);
			start = tagsPerPage * (page - 1);
			end = Math.min(count, tagsPerPage * page);
		}

		const icons = ignoreIcons();

		taggedUsers
			.slice(start, end)
			.forEach((thisUser, userIndex) => {
				const thisTag = (typeof module.tags[thisUser].tag === 'undefined') ? '' : module.tags[thisUser].tag;
				const thisVotes = (typeof module.tags[thisUser].votes === 'undefined') ? 0 : module.tags[thisUser].votes;
				const thisColor = (typeof module.tags[thisUser].color === 'undefined') ? '' : module.tags[thisUser].color;
				const thisIgnore = (typeof module.tags[thisUser].ignore === 'undefined') ? icons.normal : icons.ignored;

				const userTagLink = document.createElement('a');
				if (thisTag === '') {
					// thisTag = '<div class="RESUserTagImage"></div>';
					userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
				} else {
					userTagLink.setAttribute('class', 'userTagLink hasTag');
				}
				$(userTagLink).text(thisTag);
				if (thisColor) {
					const bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
					userTagLink.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[thisColor]} !important;`);
				}
				userTagLink.setAttribute('username', thisUser);
				userTagLink.setAttribute('title', 'set a tag');
				userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
				userTagLink.addEventListener('click', function(e) {
					e.preventDefault();
					openUserTagPrompt(e.target, this.getAttribute('username'));
				}, true);

				$('#userTaggerTable tbody').append(`
					<tr>
						<td><a class="author" href="/user/${thisUser}">${thisUser}</a><span class="res-icon res-right deleteIcon" data-icon="&#xf056;" user="${thisUser}"></span></td>
						<td id="tag_${userIndex}"></td>
						<td id="ignore_${userIndex}">${thisIgnore}</td>
						<td><span style="color: ${thisColor}">${thisColor}</span></td>
						<td>${thisVotes}</td>
					</tr>
				`);
				$(`#tag_${userIndex}`).append(userTagLink);
			});
		$('#userTaggerTable tbody .deleteIcon').click(function() {
			const thisUser = $(this).attr('user').toLowerCase();
			const $button = $(this);
			alert(`Are you sure you want to delete the tag for user: ${thisUser}?`,
				() => {
					delete module.tags[thisUser];
					RESEnvironment.storage.deletePath('RESmodules.userTagger.tags', thisUser);
					$button.closest('tr').remove();
				}
			);
		});
	}

	function ignoreIcons() {
		return {
			ignored: RESUtils.createElement.icon('F038'),
			normal: RESUtils.createElement.icon('F03B')
		};
	}

	function saveTagForm() {
		const thisName = document.getElementById('userTaggerName').value;
		const thisTag = document.getElementById('userTaggerTag').value;
		const thisColor = document.getElementById('userTaggerColor').value;
		const thisIgnore = document.getElementById('userTaggerIgnore').checked;
		const thisLink = document.getElementById('userTaggerLink').value;
		const thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value, 10) || 0;
		setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
	}

	const bgToTextColorMap = {
		none: 'inherit',
		aqua: 'black',
		black: 'white',
		blue: 'white',
		fuchsia: 'white',
		pink: 'black',
		gray: 'white',
		green: 'white',
		lime: 'black',
		maroon: 'white',
		navy: 'white',
		olive: 'white',
		orange: 'white',
		purple: 'white',
		red: 'white',
		silver: 'black',
		teal: 'white',
		white: 'black',
		yellow: 'black'
	};

	let clickedTag;

	function openUserTagPrompt(obj, username) {
		const thisXY = RESUtils.getXYpos(obj);
		username = username.toLowerCase();
		clickedTag = obj;
		const thisH3 = document.querySelector('#userTaggerToolTip h3');
		thisH3.textContent = `Tag ${username}`;
		document.getElementById('userTaggerName').value = username;
		if (typeof module.tags[username] !== 'undefined') {
			if (typeof module.tags[username].link !== 'undefined') {
				document.getElementById('userTaggerLink').value = module.tags[username].link;
			} else {
				document.getElementById('userTaggerLink').value = '';
			}
			if (typeof module.tags[username].tag !== 'undefined') {
				document.getElementById('userTaggerTag').value = module.tags[username].tag;
			} else {
				document.getElementById('userTaggerTag').value = '';
				if (typeof module.tags[username].link === 'undefined') {
					// since we haven't yet set a tag or a link for this user, auto populate a link for the
					// user based on where we are tagging from.
					setLinkBasedOnTagLocation(obj);
				}
			}
			const ignored = typeof module.tags[username].ignore !== 'undefined' ? module.tags[username].ignore : false;
			document.getElementById('userTaggerIgnore').checked = ignored;
			document.getElementById('userTaggerIgnoreContainer').classList.toggle('enabled', ignored);
			if (typeof module.tags[username].votes !== 'undefined') {
				document.getElementById('userTaggerVoteWeight').value = module.tags[username].votes;
			} else {
				document.getElementById('userTaggerVoteWeight').value = '';
			}
			if (typeof module.tags[username].color !== 'undefined') {
				$('#userTaggerColor').val(module.tags[username].color);
			} else {
				document.getElementById('userTaggerColor').selectedIndex = 0;
			}
		} else {
			document.getElementById('userTaggerTag').value = '';
			document.getElementById('userTaggerIgnore').checked = false;
			document.getElementById('userTaggerIgnoreContainer').classList.remove('enabled');
			document.getElementById('userTaggerVoteWeight').value = '';
			document.getElementById('userTaggerLink').value = '';
			if (module.options.storeSourceLink.value) {
				setLinkBasedOnTagLocation(obj);
			}
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		userTaggerToolTip.setAttribute('style', `display: block; top: ${thisXY.y}px; left: ${thisXY.x}px; z-index: 20;`);
		document.getElementById('userTaggerTag').focus();
		updateOpenLink(document.getElementById('userTaggerLink'));
		updateTagPreview();
		return false;
	}

	function setLinkBasedOnTagLocation(obj) {
		const closestEntry = $(obj).closest('.entry');
		let linkTitle = '';
		if (!module.options.useCommentsLinkAsSource.value) {
			linkTitle = $(closestEntry).find('a.title');
		}
		// if we didn't find anything, try a new search (works on inbox)
		if (!linkTitle.length) {
			linkTitle = $(closestEntry).find('a.bylink');
		}
		if (linkTitle.length) {
			document.getElementById('userTaggerLink').value = $(linkTitle).attr('href');
		} else {
			const permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
			if (permaLink.length) {
				document.getElementById('userTaggerLink').value = $(permaLink).attr('href');
			}
		}
	}

	function updateTagPreview() {
		$(userTaggerPreview).text(userTaggerTag.value);
		const bgcolor = userTaggerColor[userTaggerColor.selectedIndex].value;
		userTaggerPreview.style.backgroundColor = (bgcolor === 'none') ? 'transparent' : bgcolor;
		userTaggerPreview.style.color = bgToTextColorMap[bgcolor];
	}

	function updateOpenLink(userTaggerLink) {
		if (userTaggerLink.value) {
			const openLinkSpan = userTaggerToolTip.querySelector('.userTaggerOpenLink');
			openLinkSpan.style.display = 'inline';
			openLinkSpan.getElementsByTagName('a')[0].href = userTaggerLink.value.split(/\s/)[0];
		} else {
			userTaggerToolTip.querySelector('.userTaggerOpenLink').style.display = 'none';
		}
	}

	function closeUserTagPrompt() {
		userTaggerToolTip.setAttribute('style', 'display: none');
		if (modules['keyboardNav'].isEnabled()) {
			const inputs = userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			Array.from(inputs).forEach(input => input.blur());
		}
	}

	function setUserTag(username, tag, color, ignore, link, votes, noclick) {
		username = username.toLowerCase();
		if (((tag !== null) && (tag !== '')) || (ignore)) {
			if (tag === '') {
				tag = 'ignored';
			}
			if (typeof module.tags[username] === 'undefined') {
				module.tags[username] = {};
			}
			module.tags[username].tag = tag;
			module.tags[username].link = link;
			module.tags[username].color = color;
			const bgColor = (color === 'none') ? 'transparent' : color;
			if (ignore) {
				module.tags[username].ignore = true;
			} else {
				delete module.tags[username].ignore;
			}
			if (!noclick) {
				clickedTag.setAttribute('class', 'userTagLink hasTag');
				clickedTag.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[color]} !important;`);
				$(clickedTag).text(tag);
			}
		} else {
			if (typeof module.tags[username] !== 'undefined') {
				delete module.tags[username].tag;
				delete module.tags[username].color;
				delete module.tags[username].link;
				if (module.tags[username].tag === 'ignored') {
					delete module.tags[username].tag;
				}
				delete module.tags[username].ignore;
			}
			if (!noclick) {
				clickedTag.setAttribute('style', 'background-color: transparent');
				clickedTag.setAttribute('class', 'userTagLink RESUserTagImage');
				$(clickedTag).html('');
			}
		}

		if (typeof module.tags[username] !== 'undefined') {
			module.tags[username].votes = (isNaN(votes)) ? 0 : votes;
		}
		if (!noclick) {
			const thisVW = clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
			if (thisVW) {
				colorUser(thisVW, username, votes);
			}
		}
		if (RESUtils.isEmpty(module.tags[username])) {
			delete module.tags[username];
			RESEnvironment.storage.deletePath('RESmodules.userTagger.tags', username);
		} else {
			// Always need to delete the tag so deleted fields are removed
			RESEnvironment.storage.deletePath('RESmodules.userTagger.tags', username);
			RESEnvironment.storage.patch('RESmodules.userTagger.tags', { [username]: module.tags[username] });
		}
		closeUserTagPrompt();
	}

	module.usernameSelector = '.contents .author, .noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a, div.wiki-page-content .author, .commentingAsUser';

	function applyTags(ele) {
		ele = ele || document;
		const authors = ele.querySelectorAll(module.usernameSelector);
		RESUtils.forEachChunked(authors, 15, 1000, arrayElement => module.applyTagToAuthor(arrayElement));
	}

	module.applyTagToAuthor = function(thisAuthorObj, noEdit) {
		const userObject = [];

		if (thisAuthorObj && !thisAuthorObj.classList.contains('userTagged')) {
			let thisAuthor;
			if (thisAuthorObj.href) {
				const test = thisAuthorObj.href.match(module.usernameRE);
				if (test) {
					thisAuthor = test[1];
				}
			} else if (thisAuthorObj.getAttribute('data-user')) {
				thisAuthor = thisAuthorObj.getAttribute('data-user');
			}
			// const thisAuthor = thisAuthorObj.text;
			let noTag = false;
			if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
				noTag = true;
				thisAuthor = thisAuthor.substr(3);
			}
			thisAuthor = thisAuthor.toLowerCase();
			if (!noTag) {
				thisAuthorObj.classList.add('userTagged');
				let thisVotes = 0;
				let thisTag = null;
				let thisColor = null;
				let thisIgnore = null;
				if (typeof userObject[thisAuthor] === 'undefined') {
					if (module.tags && module.tags[thisAuthor]) {
						if (typeof module.tags[thisAuthor].votes !== 'undefined') {
							thisVotes = parseInt(module.tags[thisAuthor].votes, 10);
						}
						if (typeof module.tags[thisAuthor].tag !== 'undefined') {
							thisTag = module.tags[thisAuthor].tag;
						}
						if (typeof module.tags[thisAuthor].color !== 'undefined') {
							thisColor = module.tags[thisAuthor].color;
						}
						if (typeof module.tags[thisAuthor].ignore !== 'undefined') {
							thisIgnore = module.tags[thisAuthor].ignore;
						}
					}
					userObject[thisAuthor] = {
						tag: thisTag,
						color: thisColor,
						ignore: thisIgnore,
						votes: thisVotes
					};
				}

				const userTagFrag = document.createDocumentFragment();

				if (thisTag || !noEdit) {
					const userTagLink = document.createElement('a');
					if (!thisTag) {
						thisTag = '';
						userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
					} else {
						userTagLink.setAttribute('class', 'userTagLink hasTag');
					}
					$(userTagLink).text(thisTag);
					if (thisColor) {
						const bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
						userTagLink.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[thisColor]} !important;`);
					}
					if (!noEdit) {
						userTagLink.setAttribute('username', thisAuthor);
						userTagLink.setAttribute('title', 'set a tag');
						userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
						userTagLink.addEventListener('click', function(e) {
							e.preventDefault();
							openUserTagPrompt(e.target, this.getAttribute('username'));
						}, true);
					}
					const userTag = document.createElement('span');
					userTag.classList.add('RESUserTag');
					// const lp = document.createTextNode(' (');
					// const rp = document.createTextNode(')');
					userTag.appendChild(userTagLink);
					// userTagFrag.appendChild(lp);
					userTagFrag.appendChild(userTag);
					// userTagFrag.appendChild(rp);
					if (!noEdit) {
						if (module.options.colorUser.value) {
							const userVoteFrag = document.createDocumentFragment();
							const spacer = document.createTextNode(' ');
							userVoteFrag.appendChild(spacer);
							const userVoteWeight = document.createElement('a');
							userVoteWeight.setAttribute('href', '#');
							userVoteWeight.setAttribute('class', 'voteWeight');
							$(userVoteWeight).text('[vw]');
							userVoteWeight.addEventListener('click', function(e) {
								e.preventDefault();
								const theTag = this.parentNode.querySelector('.userTagLink');
								openUserTagPrompt(theTag, theTag.getAttribute('username'));
							}, true);
							colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
							userVoteFrag.appendChild(userVoteWeight);
							userTagFrag.appendChild(userVoteFrag);
						}
					}
					RESUtils.insertAfter(thisAuthorObj, userTagFrag);
					if (!noEdit) {
						thisIgnore = userObject[thisAuthor].ignore && thisAuthorObj.classList.contains('author');
						if (thisIgnore && (RESUtils.pageType() !== 'profile')) {
							if (module.options.hardIgnore.value) {
								if (RESUtils.pageType() === 'comments') {
									const thisComment = ignoreComment(thisAuthorObj, thisAuthor);
									if (thisComment) {
										// collapse comment as well
										const toggle = thisComment.parentNode.querySelector('a.expand');
										RESUtils.click(toggle);
									}
								} else {
									const thisPost = $(thisAuthorObj).closest('.thing').get(0);

									if (thisPost) {
										// hide post block first...
										thisPost.style.display = 'none';
										// hide associated voting block...
										if (thisPost.previousSibling) {
											thisPost.previousSibling.style.display = 'none';
										}
									}
								}
							} else if (RESUtils.pageType() === 'comments') {
								// ignore comment
								ignoreComment(thisAuthorObj, thisAuthor);
							} else {
								let $thisPost;
								if (RESUtils.pageType() === 'inbox') {
									const $thisMessage = $(thisAuthorObj).closest('.thing');
									$thisPost = $thisMessage.find('.md');

									// If message, ignore message title also
									if (!$thisMessage.is('.was-comment')) {
										$thisMessage.find('.subject').text('Ignored message');
									}
								} else {
									$thisPost = $(thisAuthorObj).closest('.thing').find('p.title');
								}
								const thisPost = $thisPost[0];

								if (thisPost) {
									const showLink = document.createElement('a');
									showLink.textContent = 'show anyway?';
									showLink.setAttribute('href', '#');
									showLink.addEventListener('click', function(e) {
										$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserPost').addClass('md');
										e.preventDefault();
									});
									thisPost.setAttribute('data-original', thisPost.innerHTML);
									thisPost.textContent = `${thisAuthor} is an ignored user. `;
									thisPost.appendChild(showLink);

									thisPost.setAttribute('class', 'ignoredUserPost');
								}
							}
						}
					}
				}
			}
		}
	};

	function ignoreComment(thisAuthorObj, thisAuthor) {
		const thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
		if (thisComment) {
			const showLink = document.createElement('a');
			showLink.textContent = 'show anyway?';
			showLink.setAttribute('href', '#');
			showLink.addEventListener('click', function(e) {
				$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserComment');
				e.preventDefault();
			});
			// store original
			thisComment.setAttribute('data-original', thisComment.innerHTML);
			// remove comment
			thisComment.textContent = `${thisAuthor} is an ignored user.`;
			thisComment.appendChild(showLink);
			thisComment.classList.add('ignoredUserComment');
			return thisComment;
		}
		return false;
	}

	function colorUser(obj, author, votes) {
		if (module.options.colorUser.value) {
			votes = parseInt(votes, 10);
			let red = 255;
			let green = 255;
			let blue = 255;
			let voteString = '+';
			if (votes > 0) {
				red = Math.max(0, (255 - (8 * votes)));
				green = 255;
				blue = Math.max(0, (255 - (8 * votes)));
			} else if (votes < 0) {
				red = 255;
				green = Math.max(0, (255 - Math.abs(8 * votes)));
				blue = Math.max(0, (255 - Math.abs(8 * votes)));
				voteString = '';
			}
			voteString += votes;
			const rgb = `rgb(${red}, ${green}, ${blue})`;
			if (obj !== null) {
				if (votes === 0) {
					obj.style.display = 'none';
				} else {
					obj.style.display = 'inline';
					if (modules['nightMode'].isNightModeOn()) {
						obj.style.color = rgb;
					} else {
						obj.style.backgroundColor = rgb;
					}
					if (module.options.vwNumber.value) {
						obj.textContent = `[${voteString}]`;
					}
					if (module.options.vwTooltip.value) {
						obj.setAttribute('title', RESUtils.string.escapeHTML`your votes for ${author}: ${voteString}`);
					}
				}
			}
		}
	}

	module.ignoreUser = function(username, ignore) {
		const thisName = username.toLowerCase();
		const thisIgnore = ignore !== false;
		let thisColor, thisLink, thisVotes, thisTag;
		if (module.tags && module.tags[thisName]) {
			thisColor = module.tags[thisName].color || '';
			thisLink = module.tags[thisName].link || '';
			thisVotes = module.tags[thisName].votes || 0;
			thisTag = module.tags[thisName].tag || '';
		}
		if ((thisIgnore) && (thisTag === '')) {
			thisTag = 'ignored';
		} else if ((!thisIgnore) && (thisTag === 'ignored')) {
			thisTag = '';
		}
		setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true /* noclick */);
	};
});
