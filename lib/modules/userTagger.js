addModule('userTagger', {
	moduleID: 'userTagger',
	moduleName: 'User Tagger',
	category: 'Users',
	options: {
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
	},
	description: 'Adds a great deal of customization around users - tagging them, ignoring them, and more. You can manage tagged users on <a href="/r/Dashboard/#userTaggerContents">Manage User Tags</a>.',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		'all'
	],
	usernameRE: /(?:u|user)\/([\w\-]+)/,
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '.comment .tagline { display: inline; }';
			css += '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
			css += '#userTaggerToolTip label { margin-top: 5px; clear: both; float: left; width: 110px; }';
			css += '#userTaggerToolTip input[type=text], #userTaggerToolTip select { margin-top: 5px; float: left; width: 195px; border: 1px solid #c7c7c7; border-radius: 3px; margin-bottom: 6px; }';
			css += '#userTaggerToolTip input[type=checkbox] { margin-top: 5px; float: left; }';
			css += '#userTaggerToolTip input[type=submit] { cursor: pointer; position: absolute; right: 16px; bottom: 16px; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; } ';
			css += '#userTaggerToolTip .toggleButton { margin-top: 5px; margin-bottom: 5px; float: left; }';
			css += '#userTaggerClose { position: absolute; right: 7px; top: 7px; z-index: 11; }';

			css += '.ignoredUserComment { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += '.ignoredUserPost { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += 'a.voteWeight { text-decoration: none; color: #369; }';
			css += 'a.voteWeight:hover { text-decoration: none; }';

			css += '#benefits { width: 200px; margin-left: 0; }';
			css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
			css += '.RESUserTag { color: black; }';
			css += '.userTagLink.RESUserTagImage:hover { text-decoration: none; }';
			css += '.RESUserTagImage::after { content: "\\F0AC"; font: normal 14px/8px "Batch"; vertical-align: middle; color: #9BD }';
			css += '.userTagLink { display: inline-block; }';
			css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #369; text-decoration: underline; }';
			css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0 4px; line-height: normal; border: 1px solid #c7c7c7; border-radius: 3px; }';
			css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
			css += '#userTaggerTable th { cursor: pointer; -moz-user-select: none; -webkit-user-select: none; -o-user-select: none; user-select: none; }';
			css += '#userTaggerTable .deleteIcon {color:#999; cursor:pointer; }#userTaggerTable .deleteIcon:hover {color:#333;}';
			css += '.userTagged { margin-right: 5px; }';
			RESUtils.addCSS(css);
		}
	},
	go: function() {
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
					modules['userTagger'].drawUserTagTable();
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
						modules['userTagger'].drawUserTagTable();
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
						modules['userTagger'].drawUserTagTable();
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
					modules['userTagger'].drawUserTagTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
				});
				this.drawUserTagTable();
			}

			// set up an array to cache user data
			this.authorInfoCache = [];
			if (this.options.colorUser.value) {
				this.attachVoteHandlers(document.body);
			}
			// add tooltip to document body...
			this.userTaggerToolTip = RESUtils.createElement('div', 'userTaggerToolTip', 'RESDialogSmall');
			var thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
			thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
			thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
			thisHTML += '<div id="userTaggerClose" class="RESCloseButton">&times;</div>';
			thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
			for (var color in this.bgToTextColorMap) {
				var bgColor = (color === 'none') ? 'transparent' : color;
				thisHTML += '<option style="background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[color] + ' !important;" value="' + color + '">' + color + '</option>';
			}
			thisHTML += '</select>';
			thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
			thisHTML += '<label for="userTaggerIgnore">Ignore ' + modules['settingsNavigation'].makeUrlHashLink('userTagger', 'hardIgnore', ' ', 'gearIcon') + '</label>'; // <input type="checkbox" id="userTaggerIgnore" value="true">';
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span> <span class="userTaggerOpenLink">- <a href="#">Open</a></span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight" title="The sum of upvotes and downvotes you have given this redditor">Vote Weight<span class="hoverHelp" title="manually edit vote weight (sum of upvotes and downvotes) for this redditor">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><a href="/r/dashboard#userTaggerContents" target="_blank">See all tags</a><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			$(this.userTaggerToolTip).html(thisHTML);
			var ignoreLabel = this.userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
			var ignoreIcons = this.ignoreIcons();
			var ignoreToggle = RESUtils.createElement.toggleButton(null, 'userTaggerIgnore', false, ignoreIcons.normal, ignoreIcons.ignored);
			ignoreToggle.classList.add('reverseToggleButton');
			RESUtils.insertAfter(ignoreLabel, ignoreToggle);
			this.userTaggerTag = this.userTaggerToolTip.querySelector('#userTaggerTag');
			this.userTaggerTag.addEventListener('keyup', modules['userTagger'].updateTagPreview, false);
			this.userTaggerColor = this.userTaggerToolTip.querySelector('#userTaggerColor');
			this.userTaggerColor.addEventListener('change', modules['userTagger'].updateTagPreview, false);
			this.userTaggerPreview = this.userTaggerToolTip.querySelector('#userTaggerPreview');
			var userTaggerLink = this.userTaggerToolTip.querySelector('#userTaggerLink');
			userTaggerLink.addEventListener('keyup', function(e) {
				modules['userTagger'].updateOpenLink(userTaggerLink);
			}, false);
			var userTaggerOpen = this.userTaggerToolTip.querySelector('.userTaggerOpenLink a');
			userTaggerOpen.addEventListener('click', function(e) {
				var links = userTaggerLink.value.split(/\s/);
				for(var i = links.length - 1; i > 0; i--) {
					RESEnvironment.openLinkInNewTab(links[i]);
				}
			});
			var userTaggerSave = this.userTaggerToolTip.querySelector('#userTaggerSave');
			userTaggerSave.setAttribute('type', 'submit');
			userTaggerSave.setAttribute('value', '✓ save tag');
			userTaggerSave.addEventListener('click', function(e) {
				e.preventDefault();
				modules['userTagger'].saveTagForm();
			}, false);
			var userTaggerClose = this.userTaggerToolTip.querySelector('#userTaggerClose');
			userTaggerClose.addEventListener('click', function(e) {
				modules['userTagger'].closeUserTagPrompt();
			}, false);
			//this.userTaggerToolTip.appendChild(userTaggerSave);
			this.userTaggerForm = this.userTaggerToolTip.querySelector('FORM');
			this.userTaggerForm.addEventListener('submit', function(e) {
				e.preventDefault();
				modules['userTagger'].saveTagForm();
			}, true);
			document.body.appendChild(this.userTaggerToolTip);

			this.userTaggerToolTip.querySelector('#userTaggerTag').addEventListener('keydown', function(e) {
				if (e.keyCode === 27) {
					// close prompt.
					modules['userTagger'].closeUserTagPrompt();
				}
			}, true);
			//console.log('before applytags: ' + Date());
			this.applyTags();
			//console.log('after applytags: ' + Date());
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', modules['userTagger'].attachVoteHandlersToComment);
				RESUtils.watchForElement('newComments', modules['userTagger'].applyTags);
			} else {
				RESUtils.watchForElement('siteTable', modules['userTagger'].attachVoteHandlers);
				RESUtils.watchForElement('siteTable', modules['userTagger'].applyTags);
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

			this.registerCommandLine();
		}
	},
	registerCommandLine: function() {
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
	},
	attachVoteHandlersToComment: function(comment) {
		var obj = $(comment).closest('.thing')[0];
		// Attach to this comment, but not its children
		modules['userTagger'].attachVoteHandlers(obj, 1);
	},
	attachVoteHandlers: function(obj, maxPairs) {
		if (!RESUtils.loggedInUser()) return;

		var voteButtons = obj.querySelectorAll('.midcol .arrow');
		if (maxPairs) {
			voteButtons = Array.prototype.slice.call(voteButtons, 0, maxPairs * 2);
		} else {
			voteButtons = Array.prototype.slice.call(voteButtons);
		}
		voteButtons.forEach(function(voteButton) {
			voteButton.addEventListener('click', modules['userTagger'].handleVoteClick, true);
		});
	},
	handleVoteClick: function(e) {
		var tags = RESStorage.getItem('RESmodules.userTagger.tags');
		if (typeof tags !== 'undefined') {
			modules['userTagger'].tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true) || {};
		}

		var $this = $(this);
		var $otherArrow = $this.siblings('.arrow');
		var thing = new RESUtils.thing(this);
		var thisAuthor = thing.getAuthor();

		// Stop if the post is archived (unvotable) or you are voting on your own post/comment/etc.
		if ($this.hasClass('archived') || !thisAuthor || thisAuthor === RESUtils.loggedInUser()) {
			return;
		}

		var thisVWobj = $(thing.getAuthorElement()).nextAll('.voteWeight')[0];

		thisAuthor = thisAuthor.toLowerCase();

		var votes = 0;
		if (typeof modules['userTagger'].tags[thisAuthor] !== 'undefined') {
			if (typeof modules['userTagger'].tags[thisAuthor].votes !== 'undefined') {
				votes = parseInt(modules['userTagger'].tags[thisAuthor].votes, 10);
			}
		} else {
			modules['userTagger'].tags[thisAuthor] = {};
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
		modules['userTagger'].tags[thisAuthor].votes = votes;
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
		modules['userTagger'].colorUser(thisVWobj, thisAuthor, votes);
	},
	drawUserTagTable: function(sortMethod, descending) {
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (typeof descending === 'undefined' || descending === null) ? this.descending : descending;
		var taggedUsers = [];
		var filterType = $('#tagFilter').val();
		for (var tagIndex in this.tags) {
			if (filterType === 'tagged users') {
				if (typeof this.tags[tagIndex].tag !== 'undefined') {
					taggedUsers.push(tagIndex);
				}
			} else {
				taggedUsers.push(tagIndex);
			}
		}
		switch (this.currentSortMethod) {
			case 'tag':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].tag === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].tag.toLowerCase();
					var tagB = (typeof modules['userTagger'].tags[b].tag === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].tag.toLowerCase();
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'ignore':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].ignore === 'undefined') ? 'z' : 'a';
					var tagB = (typeof modules['userTagger'].tags[b].ignore === 'undefined') ? 'z' : 'a';
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'color':
				taggedUsers.sort(function(a, b) {
					var colorA = (typeof modules['userTagger'].tags[a].color === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[a].color.toLowerCase();
					var colorB = (typeof modules['userTagger'].tags[b].color === 'undefined') ? 'zzzzz' : modules['userTagger'].tags[b].color.toLowerCase();
					return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
				});
				if (this.descending) {
					taggedUsers.reverse();
				}
				break;
			case 'votes':
				taggedUsers.sort(function(a, b) {
					var tagA = (typeof modules['userTagger'].tags[a].votes === 'undefined') ? 0 : modules['userTagger'].tags[a].votes;
					var tagB = (typeof modules['userTagger'].tags[b].votes === 'undefined') ? 0 : modules['userTagger'].tags[b].votes;
					return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : (a.toLowerCase() > b.toLowerCase());
				});
				if (this.descending) {
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
				if (this.descending) {
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

		var ignoreIcons = this.ignoreIcons();

		for (var userIndex = start; userIndex < end; userIndex++) {
			var thisUser = taggedUsers[userIndex];
			var thisTag = (typeof this.tags[thisUser].tag === 'undefined') ? '' : this.tags[thisUser].tag;
			var thisVotes = (typeof this.tags[thisUser].votes === 'undefined') ? 0 : this.tags[thisUser].votes;
			var thisColor = (typeof this.tags[thisUser].color === 'undefined') ? '' : this.tags[thisUser].color;
			var thisIgnore = (typeof this.tags[thisUser].ignore === 'undefined') ? ignoreIcons.normal : ignoreIcons.ignored;

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
				userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
			}
			userTagLink.setAttribute('username', thisUser);
			userTagLink.setAttribute('title', 'set a tag');
			/* jshint -W107 */
			userTagLink.setAttribute('href', 'javascript:void 0');
			/* jshint +W107 */
			userTagLink.addEventListener('click', function(e) {
				e.preventDefault();
				modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);

			$('#userTaggerTable tbody').append('<tr><td><a class="author" href="/user/' + thisUser + '">' + thisUser + '</a> <span class="res-icon res-right deleteIcon" data-icon="&#xf056;" user="' + thisUser + '"></span></td><td id="tag_' + userIndex + '"></td><td id="ignore_' + userIndex + '">' + thisIgnore + '</td><td><span style="color: ' + thisColor + '">' + thisColor + '</span></td><td>' + thisVotes + '</td></tr>');
			$('#tag_' + userIndex).append(userTagLink);
		}
		$('#userTaggerTable tbody .deleteIcon').click(function(e) {
			var thisUser = $(this).attr('user').toLowerCase();
			var button = $(this);
			alert('Are you sure you want to delete the tag for user: ' + thisUser + '?',
				function(e){
					delete modules['userTagger'].tags[thisUser];
					RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
					button.closest('tr').remove();
				}
			);
		});
	},
	ignoreIcons: function() {
		return {
			ignored: RESUtils.createElement.icon('F038'),
			normal: RESUtils.createElement.icon('F03B')
		};
	},
	saveTagForm: function() {
		var thisName = document.getElementById('userTaggerName').value;
		var thisTag = document.getElementById('userTaggerTag').value;
		var thisColor = document.getElementById('userTaggerColor').value;
		var thisIgnore = document.getElementById('userTaggerIgnore').checked;
		var thisLink = document.getElementById('userTaggerLink').value;
		var thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value, 10);
		if (isNaN(thisVotes)) {
			thisVotes = 0;
		}
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
	},
	bgToTextColorMap: {
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
	},
	openUserTagPrompt: function(obj, username) {
		var thisXY = RESUtils.getXYpos(obj);
		username = username.toLowerCase();
		this.clickedTag = obj;
		var thisH3 = document.querySelector('#userTaggerToolTip h3');
		thisH3.textContent = 'Tag ' + username;
		document.getElementById('userTaggerName').value = username;
		if (typeof this.tags[username] !== 'undefined') {
			if (typeof this.tags[username].link !== 'undefined') {
				document.getElementById('userTaggerLink').value = this.tags[username].link;
			} else {
				document.getElementById('userTaggerLink').value = '';
			}
			if (typeof this.tags[username].tag !== 'undefined') {
				document.getElementById('userTaggerTag').value = this.tags[username].tag;
			} else {
				document.getElementById('userTaggerTag').value = '';
				if (typeof this.tags[username].link === 'undefined') {
					// since we haven't yet set a tag or a link for this user, auto populate a link for the
					// user based on where we are tagging from.
					this.setLinkBasedOnTagLocation(obj);
				}
			}
			var ignored = typeof this.tags[username].ignore !== 'undefined' ? this.tags[username].ignore : false;
			document.getElementById('userTaggerIgnore').checked = ignored;
			document.getElementById('userTaggerIgnoreContainer').classList.toggle('enabled', ignored);
			if (typeof this.tags[username].votes !== 'undefined') {
				document.getElementById('userTaggerVoteWeight').value = this.tags[username].votes;
			} else {
				document.getElementById('userTaggerVoteWeight').value = '';
			}
			if (typeof this.tags[username].color !== 'undefined') {
				$('#userTaggerColor').val(this.tags[username].color);
			} else {
				document.getElementById('userTaggerColor').selectedIndex = 0;
			}
		} else {
			document.getElementById('userTaggerTag').value = '';
			document.getElementById('userTaggerIgnore').checked = false;
			document.getElementById('userTaggerIgnoreContainer').classList.remove('enabled');
			document.getElementById('userTaggerVoteWeight').value = '';
			document.getElementById('userTaggerLink').value = '';
			if (this.options.storeSourceLink.value) {
				this.setLinkBasedOnTagLocation(obj);
			}
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px; z-index: 20;');
		document.getElementById('userTaggerTag').focus();
		modules['userTagger'].updateOpenLink(document.getElementById('userTaggerLink'));
		modules['userTagger'].updateTagPreview();
		return false;
	},
	setLinkBasedOnTagLocation: function(obj) {
		var closestEntry = $(obj).closest('.entry'),
			linkTitle = '';

		if (!modules['userTagger'].options.useCommentsLinkAsSource.value) {
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
	},
	updateTagPreview: function() {
		$(modules['userTagger'].userTaggerPreview).text(modules['userTagger'].userTaggerTag.value);
		var bgcolor = modules['userTagger'].userTaggerColor[modules['userTagger'].userTaggerColor.selectedIndex].value;
		modules['userTagger'].userTaggerPreview.style.backgroundColor = (bgcolor === 'none') ? 'transparent' : bgcolor;
		modules['userTagger'].userTaggerPreview.style.color = modules['userTagger'].bgToTextColorMap[bgcolor];
	},
	updateOpenLink: function(userTaggerLink) {
		if (userTaggerLink.value) {
			var openLinkSpan = modules['userTagger'].userTaggerToolTip.querySelector('.userTaggerOpenLink');
			openLinkSpan.style.display = 'inline';
			openLinkSpan.getElementsByTagName('a')[0].href = userTaggerLink.value.split(/\s/)[0];
		} else {
			modules['userTagger'].userTaggerToolTip.querySelector('.userTaggerOpenLink').style.display = 'none';
		}
	},
	closeUserTagPrompt: function() {
		this.userTaggerToolTip.setAttribute('style', 'display: none');
		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			Array.prototype.slice.call(inputs).forEach(function(input) {
				input.blur();
			});
		}
	},
	setUserTag: function(username, tag, color, ignore, link, votes, noclick) {
		username = username.toLowerCase();
		if (((tag !== null) && (tag !== '')) || (ignore)) {
			if (tag === '') {
				tag = 'ignored';
			}
			if (typeof this.tags[username] === 'undefined') {
				this.tags[username] = {};
			}
			this.tags[username].tag = tag;
			this.tags[username].link = link;
			this.tags[username].color = color;
			var bgColor = (color === 'none') ? 'transparent' : color;
			if (ignore) {
				this.tags[username].ignore = true;
			} else {
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('class', 'userTagLink hasTag');
				this.clickedTag.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[color] + ' !important;');
				$(this.clickedTag).text(tag);
			}
		} else {
			if (typeof this.tags[username] !== 'undefined') {
				delete this.tags[username].tag;
				delete this.tags[username].color;
				delete this.tags[username].link;
				if (this.tags[username].tag === 'ignored') {
					delete this.tags[username].tag;
				}
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('style', 'background-color: transparent');
				this.clickedTag.setAttribute('class', 'userTagLink RESUserTagImage');
				$(this.clickedTag).html('');
			}
		}

		if (typeof this.tags[username] !== 'undefined') {
			this.tags[username].votes = (isNaN(votes)) ? 0 : votes;
		}
		if (!noclick) {
			var thisVW = this.clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
			if (thisVW) {
				this.colorUser(thisVW, username, votes);
			}
		}
		if (RESUtils.isEmpty(this.tags[username])) {
			delete this.tags[username];
		}
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
		this.closeUserTagPrompt();
	},
	usernameSelector: '.contents .author, .noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a, div.wiki-page-content .author, .commentingAsUser',
	applyTags: function(ele) {
		ele = ele || document;
		var authors = ele.querySelectorAll(modules['userTagger'].usernameSelector);
		RESUtils.forEachChunked(authors, 15, 1000, function(arrayElement, index, array) {
			modules['userTagger'].applyTagToAuthor(arrayElement);
		});
	},
	applyTagToAuthor: function(thisAuthorObj, noEdit) {
		var userObject = [],
			thisVotes = 0,
			thisTag = null,
			thisColor = null,
			thisIgnore = null,
			thisAuthor, thisPost, thisComment, test, noTag;

		// var thisAuthorObj = this.authors[authorNum];
		if ((thisAuthorObj) && (!(thisAuthorObj.classList.contains('userTagged'))) && (typeof thisAuthorObj !== 'undefined') && (thisAuthorObj !== null)) {
			if (thisAuthorObj.href) {
				test = thisAuthorObj.href.match(this.usernameRE);
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
					if (this.tags && this.tags[thisAuthor]) {
						if (typeof this.tags[thisAuthor].votes !== 'undefined') {
							thisVotes = parseInt(this.tags[thisAuthor].votes, 10);
						}
						if (typeof this.tags[thisAuthor].tag !== 'undefined') {
							thisTag = this.tags[thisAuthor].tag;
						}
						if (typeof this.tags[thisAuthor].color !== 'undefined') {
							thisColor = this.tags[thisAuthor].color;
						}
						if (typeof this.tags[thisAuthor].ignore !== 'undefined') {
							thisIgnore = this.tags[thisAuthor].ignore;
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
						userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
					}
					if (typeof noEdit === 'undefined' || !noEdit) {
						userTagLink.setAttribute('username', thisAuthor);
						userTagLink.setAttribute('title', 'set a tag');
						/* jshint -W107 */
						userTagLink.setAttribute('href', 'javascript:void 0');
						/* jshint +W107 */
						userTagLink.addEventListener('click', function(e) {
							e.preventDefault();
							modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
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
						if (this.options.colorUser.value) {
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
								modules['userTagger'].openUserTagPrompt(theTag, theTag.getAttribute('username'));
							}, true);
							this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
							userVoteFrag.appendChild(userVoteWeight);
							userTagFrag.appendChild(userVoteFrag);
						}
					}
					RESUtils.insertAfter(thisAuthorObj, userTagFrag);
					if (typeof noEdit === 'undefined' || !noEdit) {
						thisIgnore = userObject[thisAuthor].ignore && thisAuthorObj.classList.contains('author');
						if (thisIgnore && (RESUtils.pageType() !== 'profile')) {
							if (this.options.hardIgnore.value) {
								if (RESUtils.pageType() === 'comments') {
									thisComment = modules['userTagger'].ignoreComment(thisAuthorObj, thisAuthor);
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
									modules['userTagger'].ignoreComment(thisAuthorObj, thisAuthor);
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
										showLink.setAttribute('href','#');
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
	},
	ignoreComment: function(thisAuthorObj, thisAuthor){
		var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
		if (thisComment) {
			var showLink = document.createElement('a');
			showLink.textContent = 'show anyway?';
			showLink.setAttribute('href','#');
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
	},
	colorUser: function(obj, author, votes) {
		if (this.options.colorUser.value) {
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
			voteString = voteString + votes;
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
					if (this.options.vwNumber.value) {
						obj.textContent = '[' + voteString + ']';
					}
					if (this.options.vwTooltip.value) {
						obj.setAttribute('title', 'your votes for ' + escapeHTML(author) + ': ' + escapeHTML(voteString));
					}
				}
			}
		}
	},
	ignoreUser: function(username, ignore) {
		var thisName = username.toLowerCase(),
			thisIgnore = ignore !== false,
			thisColor, thisLink, thisVotes, thisTag;
		if (modules['userTagger'].tags && modules['userTagger'].tags[thisName]) {
			thisColor = modules['userTagger'].tags[thisName].color || '';
			thisLink = modules['userTagger'].tags[thisName].link || '';
			thisVotes = modules['userTagger'].tags[thisName].votes || 0;
			thisTag = modules['userTagger'].tags[thisName].tag || '';
		}
		if ((thisIgnore) && (thisTag === '')) {
			thisTag = 'ignored';
		} else if ((!thisIgnore) && (thisTag === 'ignored')) {
			thisTag = '';
		}
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true /*noclick*/);
	}
});
