addModule('userTagger', function(module, moduleID) {
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
	var $tagger;

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// Get user tag data...
			this.tags = safeJSON.parse(RESStorage.getItem('RESmodules.userTagger.tags'), 'RESmodules.userTagger.tags', true) || {};

			// If we're on the dashboard, add a tab to it...
			if (RESUtils.currentSubreddit('dashboard')) {
				// add tab to dashboard
				modules['dashboard'].addTab('userTaggerContents', 'My User Tags');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show </div>');
				var tagFilter = $('<select id="tagFilter"><option>tagged users</option><option>all users</option></select>');
				$(showDiv).append(tagFilter);
				$('#userTaggerContents').append(showDiv);
				$('#tagFilter').change(function() {
					drawUserTagTable();
				});

				var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
				if (tagsPerPage) {
					var controlWrapper = document.createElement('div');
					controlWrapper.id = 'tagPageControls';
					controlWrapper.className = 'RESGalleryControls';
					controlWrapper.page = 1;
					controlWrapper.pageCount = 1;

					var leftButton = document.createElement('a');
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e) {
						if (controlWrapper.page === 1) {
							controlWrapper.page = controlWrapper.pageCount;
						} else {
							controlWrapper.page--;
						}
						drawUserTagTable();
					});
					$(controlWrapper).append('Page ');
					controlWrapper.appendChild(leftButton);

					var posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					posLabel.textContent = '1 of 2';
					controlWrapper.appendChild(posLabel);

					var rightButton = document.createElement('a');
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', function(e) {
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
				var thisTable = $('<table id="userTaggerTable" />');
				$(thisTable).append('<thead><tr><th sort="username" class="active">Username <span class="sortAsc"></span></th><th sort="tag">Tag</th><th sort="ignore">Ignored</th><th sort="color">Color</th><th sort="votes">Vote Weight</th></tr></thead><tbody></tbody>');
				$('#userTaggerContents').append(thisTable);
				$('#userTaggerTable thead th').click(function(e) {
					e.preventDefault();
					var $this = $(this);

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
			addTagger();
			//console.log('before applytags: ' + Date());
			applyTags();
			//console.log('after applytags: ' + Date());
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', attachVoteHandlersToComment);
				RESUtils.watchForElement('newComments', applyTags);
			} else {
				RESUtils.watchForElement('siteTable', attachVoteHandlers);
				RESUtils.watchForElement('siteTable', applyTags);
			}

			if (RESUtils.regexes.profile.test(location.href)) {
				var friendButton = document.querySelector('.titlebox .fancy-toggle-button');
				if ((typeof friendButton !== 'undefined') && (friendButton !== null)) {
					var firstAuthor = document.querySelector('a.author'),
						thisFriendComment;
					if ((typeof firstAuthor !== 'undefined') && (firstAuthor !== null)) {
						thisFriendComment = firstAuthor.getAttribute('title');
						thisFriendComment = (thisFriendComment !== null) ? thisFriendComment.substring(8, thisFriendComment.length - 1) : '';
					} else {
						thisFriendComment = '';
					}
				}
			}

			registerCommandLine();
		}
	};

	function addTagger() {
		var ignoreToggleButton = RESUtils.createElement.toggleButton(null, 'userTaggerIgnore', false, 'yes', 'no');
		var ignoreSettingsLink = modules['settingsNavigation'].makeUrlHashLink('userTagger', 'hardIgnore', ' configure ', 'gearIcon');
		var $colorSelect;

		// Base HTML.
		RESTemplates.load('userTaggerDialog', function(template) {
			var output = template.html();
			$('body').append(output);
		});

		// Define $tagger.
		$tagger = $('#userTaggerToolTip');
		// Add generated elements.
		$tagger.find('.res-usertag-ignore').append(ignoreToggleButton).append(ignoreSettingsLink);
		// Populate color selection with options.
		$colorSelect = $tagger.find('#userTaggerColor');
		for (var color in bgToTextColorMap) {
			var bgColor = (color === 'none') ? 'transparent' : color;
			$colorSelect.append('<option style="background-color: ' + bgColor + '; color: ' + bgToTextColorMap[color] + ' !important;" value="' + color + '">' + color + '</option>');
		}
		// Add event listeners.
		$('#userTaggerTag').on('keyup', updateTagPreview);
		$('#userTaggerTag').on('keydown', function(e) {
			if (e.keyCode === 27) {
				// close on ESC key.
				closeUserTagPrompt();
			}
		});
		$('#userTaggerColor').on('change', updateTagPreview);
		$('#userTaggerLink').on('keyup', updateOpenLink);
		$tagger.find('.userTaggerOpenLink a').on('click', function(e) {
			var links = $('#userTaggerLink')[0].value.split(/\s/);
			for (var i = links.length - 1; i > 0; i--) {
				RESEnvironment.openLinkInNewTab(links[i]);
			}
		});
		$('#userTaggerSave').on('click', function(e) {
			e.preventDefault();
			saveTagForm();
		});
		$('#userTaggerClose').on('click', closeUserTagPrompt);
		$tagger.find('form').on('submit', function(e) {
			e.preventDefault();
			saveTagForm();
		});
	}

	function registerCommandLine() {
		modules['commandLine'].registerCommand('tag', 'tag [text] - tags author of currently selected link/comment as text',
			function(command, val, match) {
				var tagLink = getAuthorTagLink();
				if (tagLink) {
					var str = 'tag user ' + tagLink.getAttribute('username');
					if (val) {
						str += ' as: ' + val;
					}
					return str;
				} else {
					return 'can\'t set tag - no post/comment selected';
				}
			},
			function(command, val, match, e) {
				var tagLink = getAuthorTagLink();
				if (tagLink) {
					RESUtils.click(tagLink);
					setTimeout(function() {
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
			var selected = modules['selectedEntry'].selected();
			var searchArea = selected ? selected.entry : document.body;

			var tagLink = searchArea.querySelector('a.userTagLink');
			return tagLink;
		}
	}

	function attachVoteHandlersToComment(comment) {
		var obj = $(comment).closest('.thing')[0];
		// Attach to this comment, but not its children
		attachVoteHandlers(obj, 1);
	}

	function attachVoteHandlers(obj, maxPairs) {
		if (!RESUtils.loggedInUser()) return;

		var voteButtons = obj.querySelectorAll('.midcol .arrow');
		if (maxPairs) {
			voteButtons = Array.prototype.slice.call(voteButtons, 0, maxPairs * 2);
		} else {
			voteButtons = Array.prototype.slice.call(voteButtons);
		}
		voteButtons.forEach(function(voteButton) {
			voteButton.addEventListener('click', handleVoteClick, true);
		});
	}

	function handleVoteClick(e) {
		var tags = RESStorage.getItem('RESmodules.userTagger.tags');
		if (typeof tags !== 'undefined') {
			module.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true) || {};
		}

		var $this = $(this);
		var $otherArrow = $this.siblings('.arrow');
		var thing = new RESUtils.thing(this);
		var thisAuthor = thing.getAuthor();

		// Stop if the post is archived (unvotable) or you are voting on your own post/comment/etc.
		if ($this.hasClass('archived') || !thisAuthor || thisAuthor === RESUtils.loggedInUser()) {
			return;
		}

		var thisVWobj = thing.querySelector('.voteWeight');

		thisAuthor = thisAuthor.toLowerCase();

		var votes = 0;
		if (typeof module.tags[thisAuthor] !== 'undefined') {
			if (typeof module.tags[thisAuthor].votes !== 'undefined') {
				votes = parseInt(module.tags[thisAuthor].votes, 10);
			}
		} else {
			module.tags[thisAuthor] = {};
		}
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
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(module.tags));
		colorUser(thisVWobj, thisAuthor, votes);
	}

	var currentSortMethod, isDescending;

	function drawUserTagTable(sortMethod, descending) {
		currentSortMethod = sortMethod || currentSortMethod;
		isDescending = (typeof descending === 'undefined' || descending === null) ? isDescending : descending;
		var taggedUsers = [];
		var filterType = $('#tagFilter').val();
		for (var tagIndex in module.tags) {
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
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof module.tags[a].tag === 'undefined') ? 'zzzzz' : module.tags[a].tag.toLowerCase();
					var tagB = (typeof module.tags[b].tag === 'undefined') ? 'zzzzz' : module.tags[b].tag.toLowerCase();
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'ignore':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof module.tags[a].ignore === 'undefined') ? 'z' : 'a';
					var tagB = (typeof module.tags[b].ignore === 'undefined') ? 'z' : 'a';
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'color':
				taggedUsers.sort(function(a, b) {
					var colorA = (typeof module.tags[a].color === 'undefined') ? 'zzzzz' : module.tags[a].color.toLowerCase();
					var colorB = (typeof module.tags[b].color === 'undefined') ? 'zzzzz' : module.tags[b].color.toLowerCase();
					return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
			case 'votes':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof module.tags[a].votes === 'undefined') ? 0 : module.tags[a].votes;
					var tagB = (typeof module.tags[b].votes === 'undefined') ? 0 : module.tags[b].votes;
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
				taggedUsers.sort(function(a, b) {
					return (a.toLowerCase() > b.toLowerCase()) ? 1 : (b.toLowerCase() > a.toLowerCase()) ? -1 : 0;
				});
				if (isDescending) {
					taggedUsers.reverse();
				}
				break;
		}
		$('#userTaggerTable tbody').html('');
		var tagsPerPage = parseInt(modules['dashboard'].options['tagsPerPage'].value, 10);
		var count = taggedUsers.length;
		var start = 0;
		var end = count;

		if (tagsPerPage) {
			var tagControls = $('#tagPageControls');
			var page = tagControls.prop('page');
			var pages = Math.ceil(count / tagsPerPage);
			page = Math.min(page, pages);
			page = Math.max(page, 1);
			tagControls.prop('page', page).prop('pageCount', pages);
			tagControls.find('.RESGalleryLabel').text(page + ' of ' + pages);
			start = tagsPerPage * (page - 1);
			end = Math.min(count, tagsPerPage * page);
		}

		for (var userIndex = start; userIndex < end; userIndex++) {
			var thisUser = taggedUsers[userIndex];
			var thisTag = (typeof module.tags[thisUser].tag === 'undefined') ? '' : module.tags[thisUser].tag;
			var thisVotes = (typeof module.tags[thisUser].votes === 'undefined') ? 0 : module.tags[thisUser].votes;
			var thisColor = (typeof module.tags[thisUser].color === 'undefined') ? '' : module.tags[thisUser].color;
			var thisIgnore = (typeof module.tags[thisUser].ignore === 'undefined') ? 'no' : 'yes';

			var userTagLink = document.createElement('a');
			if (thisTag === '') {
				// thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
			} else {
				userTagLink.setAttribute('class', 'userTagLink hasTag');
			}
			$(userTagLink).text(thisTag);
			if (thisColor) {
				var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
				userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + bgToTextColorMap[thisColor] + ' !important;');
			}
			userTagLink.setAttribute('username', thisUser);
			userTagLink.setAttribute('title', 'set a tag');
			userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
			userTagLink.addEventListener('click', function(e) {
				e.preventDefault();
				openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);

			$('#userTaggerTable tbody').append('<tr><td><span class="res-icon res-right deleteIcon" data-icon="&#xf056;" user="' + thisUser + '"></span><a class="author" href="/user/' + thisUser + '">' + thisUser + '</a></td><td id="tag_' + userIndex + '"></td><td id="ignore_' + userIndex + '">' + thisIgnore + '</td><td><span style="color: ' + thisColor + '">' + thisColor + '</span></td><td>' + thisVotes + '</td></tr>');
			$('#tag_' + userIndex).append(userTagLink);
		}
		$('#userTaggerTable tbody .deleteIcon').click(function(e) {
			var thisUser = $(this).attr('user').toLowerCase();
			var button = $(this);
			alert('Are you sure you want to delete the tag for user: ' + thisUser + '?',
				function(e){
					delete module.tags[thisUser];
					RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(module.tags));
					button.closest('tr').remove();
				}
			);
		});
	}

	function saveTagForm() {
		var thisName = document.getElementById('userTaggerName').value;
		var thisTag = document.getElementById('userTaggerTag').value;
		var thisColor = document.getElementById('userTaggerColor').value;
		var thisIgnore = document.getElementById('userTaggerIgnore').checked;
		var thisLink = document.getElementById('userTaggerLink').value;
		var thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value, 10);
		if (isNaN(thisVotes)) {
			thisVotes = 0;
		}
		setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
	}

	var bgToTextColorMap = {
		'none': 'inherit',
		'aqua': 'black',
		'black': 'white',
		'blue': 'white',
		'fuchsia': 'white',
		'pink': 'black',
		'gray': 'white',
		'green': 'white',
		'lime': 'black',
		'maroon': 'white',
		'navy': 'white',
		'olive': 'white',
		'orange': 'white',
		'purple': 'white',
		'red': ' white',
		'silver': 'black',
		'teal': 'white',
		'white': 'black',
		'yellow': 'black'
	};

	var clickedTag;

	function openUserTagPrompt(obj, username) {
		username = username.toLowerCase();
		clickedTag = obj;
		$tagger.find('h3 span:last-of-type').text(username);
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
			var ignored = typeof module.tags[username].ignore !== 'undefined' ? module.tags[username].ignore : false;
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

		setTaggerPosition();

		document.getElementById('userTaggerTag').focus();
		updateOpenLink();
		updateTagPreview();
		return false;
	}

	function setLinkBasedOnTagLocation(obj) {
		var closestEntry = $(obj).closest('.entry'),
			linkTitle = '';

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
			var permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
			if (permaLink.length) {
				document.getElementById('userTaggerLink').value = $(permaLink).attr('href');
			}
		}
	}

	function updateTagPreview() {
		var $el = $('#userTaggerPreview');
		var bgcolor = $('#userTaggerColor option:selected').val();
		$el.text($('#userTaggerTag').val());
		$el.css({
			backgroundColor: (bgcolor === 'none') ? 'transparent' : bgcolor,
			color: bgToTextColorMap[bgcolor]
		});
	}

	function updateOpenLink(e) {
		var $link = $tagger.find('.userTaggerOpenLink a');
		var el = e ? e.target : $('#userTaggerLink')[0];
		if ($(el).val().length > 0) {
			$link.attr('href', $(el).val().split(/\s/)[0]);
		} else {
			$link.removeAttr('href');
		}
	}

	function setTaggerPosition() {
		var viewport = document.body.clientWidth;
		var pos = RESUtils.getXYpos(clickedTag);
		var t = pos.y, l = pos.x, r = viewport - pos.x;
		var tagger = $tagger[0];
		$tagger.show();
		tagger.style.top = t + 'px';
		if (l < r) {
			tagger.style.right = 'auto';
			tagger.style.left = l + 'px';
		} else {
			tagger.style.right = r + 'px';
			tagger.style.left = 'auto';
		}
	}

	function closeUserTagPrompt() {
		$tagger.hide();
		if (modules['keyboardNav'].isEnabled()) {
			// remove focus from any input fields from the prompt so that keyboard navigation works again.
			$tagger.find('input, button').blur();
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
			var bgColor = (color === 'none') ? 'transparent' : color;
			if (ignore) {
				module.tags[username].ignore = true;
			} else {
				delete module.tags[username].ignore;
			}
			if (!noclick) {
				clickedTag.setAttribute('class', 'userTagLink hasTag');
				clickedTag.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + bgToTextColorMap[color] + ' !important;');
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
			var thisVW = clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
			if (thisVW) {
				colorUser(thisVW, username, votes);
			}
		}
		if (RESUtils.isEmpty(module.tags[username])) {
			delete module.tags[username];
		}
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(module.tags));
		closeUserTagPrompt();
	}

	module.usernameSelector = '.contents .author, .noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a, div.wiki-page-content .author, .commentingAsUser';

	function applyTags(ele) {
		ele = ele || document;
		var authors = ele.querySelectorAll(module.usernameSelector);
		RESUtils.forEachChunked(authors, 15, 1000, function(arrayElement, index, array) {
			module.applyTagToAuthor(arrayElement);
		});
	}

	module.applyTagToAuthor = function(thisAuthorObj, noEdit) {
		var userObject = [],
			thisVotes = 0,
			thisTag = null,
			thisColor = null,
			thisIgnore = null,
			thisAuthor, thisPost, thisComment, test, noTag;

		if ((thisAuthorObj) && (!(thisAuthorObj.classList.contains('userTagged'))) && (typeof thisAuthorObj !== 'undefined') && (thisAuthorObj !== null)) {
			if (thisAuthorObj.href) {
				test = thisAuthorObj.href.match(module.usernameRE);
				if (test) {
					thisAuthor = test[1];
				}
			} else if (thisAuthorObj.getAttribute('data-user')) {
				thisAuthor = thisAuthorObj.getAttribute('data-user');
			}
			// var thisAuthor = thisAuthorObj.text;
			noTag = false;
			if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
				noTag = true;
				thisAuthor = thisAuthor.substr(3);
			}
			thisAuthor = thisAuthor.toLowerCase();
			if (!noTag) {
				thisAuthorObj.classList.add('userTagged');
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

				var userTagFrag = document.createDocumentFragment();

				if (thisTag || typeof noEdit === 'undefined' || !noEdit) {
					var userTagLink = document.createElement('a');
					if (!thisTag) {
						thisTag = '';
						userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
					} else {
						userTagLink.setAttribute('class', 'userTagLink hasTag');
					}
					$(userTagLink).text(thisTag);
					if (thisColor) {
						var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
						userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + bgToTextColorMap[thisColor] + ' !important;');
					}
					if (typeof noEdit === 'undefined' || !noEdit) {
						userTagLink.setAttribute('username', thisAuthor);
						userTagLink.setAttribute('title', 'set a tag');
						userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
						userTagLink.addEventListener('click', function(e) {
							e.preventDefault();
							openUserTagPrompt(e.target, this.getAttribute('username'));
						}, true);
					}
					var userTag = document.createElement('span');
					userTag.classList.add('RESUserTag');
					// var lp = document.createTextNode(' (');
					// var rp = document.createTextNode(')');
					userTag.appendChild(userTagLink);
					// userTagFrag.appendChild(lp);
					userTagFrag.appendChild(userTag);
					// userTagFrag.appendChild(rp);
					if (typeof noEdit === 'undefined' || !noEdit) {
						if (module.options.colorUser.value) {
							var userVoteFrag = document.createDocumentFragment();
							var spacer = document.createTextNode(' ');
							userVoteFrag.appendChild(spacer);
							var userVoteWeight = document.createElement('a');
							userVoteWeight.setAttribute('href', '#');
							userVoteWeight.setAttribute('class', 'voteWeight');
							$(userVoteWeight).text('[vw]');
							userVoteWeight.addEventListener('click', function(e) {
								e.preventDefault();
								var theTag = this.parentNode.querySelector('.userTagLink');
								openUserTagPrompt(theTag, theTag.getAttribute('username'));
							}, true);
							colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
							userVoteFrag.appendChild(userVoteWeight);
							userTagFrag.appendChild(userVoteFrag);
						}
					}
					RESUtils.insertAfter(thisAuthorObj, userTagFrag);
					if (typeof noEdit === 'undefined' || !noEdit) {
						thisIgnore = userObject[thisAuthor].ignore && thisAuthorObj.classList.contains('author');
						if (thisIgnore && (RESUtils.pageType() !== 'profile')) {
							if (module.options.hardIgnore.value) {
								if (RESUtils.pageType() === 'comments') {
									thisComment = ignoreComment(thisAuthorObj, thisAuthor);
									if (thisComment) {
										// collapse comment as well
										var toggle = thisComment.parentNode.querySelector('a.expand');
										RESUtils.click(toggle);
									}
								} else {
									thisPost = $(thisAuthorObj).closest('.thing').get(0);

									if (thisPost) {
										// hide post block first...
										thisPost.style.display = 'none';
										// hide associated voting block...
										if (thisPost.previousSibling) {
											thisPost.previousSibling.style.display = 'none';
										}
									}
								}
							} else {
								if (RESUtils.pageType() === 'comments') {
									// ignore comment
									ignoreComment(thisAuthorObj, thisAuthor);
								} else {
									var $thisPost, $thisMessage;
									if (RESUtils.pageType() === 'inbox') {
										$thisMessage = $(thisAuthorObj).closest('.thing');
										$thisPost = $thisMessage.find('.md');

										// If message, ignore message title also
										if (!$thisMessage.is('.was-comment')) {
											$thisMessage.find('.subject').text('Ignored message');
										}
									} else {
										$thisPost = $(thisAuthorObj).closest('.thing').find('p.title');
									}
									thisPost = $thisPost[0];

									if (thisPost) {
										var showLink = document.createElement('a');
										showLink.textContent = 'show anyway?';
										showLink.setAttribute('href', '#');
										showLink.addEventListener('click', function(e) {
											$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserPost').addClass('md');
											e.preventDefault();
										});
										thisPost.setAttribute('data-original', thisPost.innerHTML);
										thisPost.textContent = thisAuthor + ' is an ignored user. ';
										thisPost.appendChild(showLink);

										thisPost.setAttribute('class', 'ignoredUserPost');
									}
								}
							}
						}
					}
				}
			}
		}
	};

	function ignoreComment(thisAuthorObj, thisAuthor){
		var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
		if (thisComment) {
			var showLink = document.createElement('a');
			showLink.textContent = 'show anyway?';
			showLink.setAttribute('href', '#');
			showLink.addEventListener('click', function(e) {
				$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserComment');
				e.preventDefault();
			});
			// store original
			thisComment.setAttribute('data-original', thisComment.innerHTML);
			// remove comment
			thisComment.textContent = thisAuthor + ' is an ignored user.';
			thisComment.appendChild(showLink);
			thisComment.classList.add('ignoredUserComment');
			return thisComment;
		}
		return false;
	}

	function colorUser(obj, author, votes) {
		if (module.options.colorUser.value) {
			votes = parseInt(votes, 10);
			var red = 255;
			var green = 255;
			var blue = 255;
			var voteString = '+';
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
			var rgb = 'rgb(' + red + ',' + green + ',' + blue + ')';
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
						obj.textContent = '[' + voteString + ']';
					}
					if (module.options.vwTooltip.value) {
						obj.setAttribute('title', 'your votes for ' + escapeHTML(author) + ': ' + escapeHTML(voteString));
					}
				}
			}
		}
	}

	module.ignoreUser = function(username, ignore) {
		var thisName = username.toLowerCase(),
			thisIgnore = ignore !== false,
			thisColor, thisLink, thisVotes, thisTag;
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
		setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true /*noclick*/);
	};
});
