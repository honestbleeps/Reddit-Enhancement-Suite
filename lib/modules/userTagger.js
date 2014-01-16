// user tagger functions
modules['userTagger'] = {
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
			description: 'If "hard ignore" is off, only post titles and comment text is hidden. If it is on, the entire block is hidden (or in comments, collapsed).'
		},
		colorUser: {
			type: 'boolean',
			value: true,
			description: 'Color users based on cumulative upvotes / downvotes'
		},
		storeSourceLink: {
			type: 'boolean',
			value: true,
			description: 'By default, store a link to the link/comment you tagged a user on'
		},
		hoverInfo: {
			type: 'boolean',
			value: true,
			description: 'Show information on user (karma, how long they\'ve been a redditor) on hover.'
		},
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.3,
			description: 'Fade animation\'s speed. Default is 0.3, the range is 0-1. Setting the speed to 1 will disable the animation.'
		},
		gildComments: {
			type: 'boolean',
			value: true,
			description: 'When clicking the "give gold" button on the user hover info on a comment, give gold to the comment.'
		},
		highlightButton: {
			type: 'boolean',
			value: true,
			description: 'Show "highlight" button in user hover info, for distinguishing posts/comments from particular users.'
		},
		highlightColor: {
			type: 'text',
			value: '#5544CC',
			description: 'Color used to highlight a selected user, when "highlighted" from hover info.'
		},
		highlightColorHover: {
			type: 'text',
			value: '#6677AA',
			description: 'Color used to highlight a selected user on hover.'
		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (redditor since...) in US format (i.e. 08-31-2010)'
		},
		vwNumber: {
			type: 'boolean',
			value: true,
			description: 'Show the number (i.e. [+6]) rather than [vw]'
		},
		vwTooltip: {
			type: 'boolean',
			value: true,
			description: 'Show the vote weight tooltip on hover (i.e. "your votes for...")'
		}
	},
	description: 'Adds a great deal of customization around users - tagging them, ignoring them, and more.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	include: [
		/^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.]*/i
	],
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var css = '.comment .tagline { display: inline; }';
			css += '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
			css += '#userTaggerToolTip label { margin-top: 5px; clear: both; float: left; width: 110px; }';
			css += '#userTaggerToolTip input[type=text], #userTaggerToolTip select { margin-top: 5px; float: left; width: 195px; border: 1px solid #c7c7c7; border-radius: 3px; margin-bottom: 6px; }';
			css += '#userTaggerToolTip input[type=checkbox] { margin-top: 5px; float: left; }';
			css += '#userTaggerToolTip input[type=submit] { cursor: pointer; position: absolute; right: 16px; bottom: 16px; padding: 3px 5px; font-size: 12px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; } ';
			css += '#userTaggerToolTip .toggleButton { margin-top: 5px; margin-bottom: 5px; }';
			css += '#userTaggerClose { position: absolute; right: 7px; top: 7px; z-index: 11; }';

			css += '.ignoredUserComment { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += '.ignoredUserPost { color: #CACACA; padding: 3px; font-size: 10px; }';
			css += 'a.voteWeight { text-decoration: none; color: #369; }';
			css += 'a.voteWeight:hover { text-decoration: none; }';
			css += '#authorInfoToolTip { display: none; position: absolute; min-width: 450px; z-index: 10001; }';
			css += '#authorInfoToolTip:before { content: ""; position: absolute; top: 10px; left: -26px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip:after { content: ""; position: absolute; top: 10px; left: -24px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip.right:before { content: ""; position: absolute; top: 10px; right: -26px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip.right:after { content: ""; position: absolute; top: 10px; right: -24px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#authorInfoToolTip .authorFieldPair { clear: both; overflow: auto; margin-bottom: 12px; }';
			css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; }';
			css += '#authorInfoToolTip .authorDetail { float: left; min-width: 240px; }';
			css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; margin-top: 12px; }';
			css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; }';

			css += '#benefits { width: 200px; margin-left: 0; }';
			css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
			css += '.RESUserTagImage { display: inline-block; width: 16px; height: 8px; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); background-repeat: no-repeat; background-position: -16px -137px; }';
			css += '.userTagLink { display: inline-block; }';
			css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #369; text-decoration: underline; }';
			css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0 4px; border: 1px solid #c7c7c7; border-radius: 3px; }';
			css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
			css += '#userTaggerToolTip .toggleButton .toggleOn { background-color: #107ac4; color: #fff;  }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOn { background-color: #ddd ; color: #636363; }';
			css += '#userTaggerToolTip .toggleButton.enabled .toggleOff { background-color: #d02020; color: #fff; }';
			css += '#userTaggerToolTip .toggleButton .toggleOff { background-color: #ddd; color: #636363; } ';
			css += '#userTaggerTable th { -moz-user-select: none; -webkit-user-select: none; -o-user-select: none; user-select: none; }';
			css += '#userTaggerTable tbody .deleteButton { cursor: pointer; width: 16px; height: 16px; background-image: url(data:image/gif;base64,R0lGODlhEAAQAOZOAP///3F6hcopAJMAAP/M//Hz9OTr8ZqksMTL1P8pAP9MDP9sFP+DIP8zAO7x8/D1/LnEz+vx+Flha+Ln7OLm61hhayk0QCo1QMfR2eDo8b/K1M/U2pqiqcfP15WcpcLK05ymsig0P2lyftnf5naBi8XJzZ6lrJGdqmBqdKissYyZpf/+/puotNzk66ayvtbc4rC7x9Xd5n+KlbG7xpiirnJ+ivDz9KKrtrvH1Ojv9ePq8HF8h2x2gvj9/yYyPmRueFxlb4eRm+71+kFLVdrb3c/X4KOnrYGMl3uGke/0+5Sgq1ZfaY6Xn/X4+f///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAE4ALAAAAAAQABAAAAexgE6CggGFAYOIiAEPEREPh4lOhpOUgwEAmJmaABuQAUktMUUYGhAwLiwnKp41REYmHB5MQUcyN0iQTjsAHU05ICM4SjMQJIg8AAgFBgcvE5gUJYgiycsHDisCApjagj/VzAACBATa5AJOKOAHAAMMDOTvA05A6w7tC/kL804V9uIKAipA52QJgA82dNAQRyBBgwYJyjmRgKmHkAztHA4YAJHfEB8hLFxI0W4AACcbnQQCADs=)}';

			RESUtils.addCSS(css);
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			this.usernameRE = /(?:u|user)\/([\w\-]+)/;
			// Get user tag data...
			var tags = RESStorage.getItem('RESmodules.userTagger.tags');
			this.tags = null;
			if (typeof tags !== 'undefined') {
				this.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
			}
			// check if we're using the old method of storing user tags... yuck!
			if (this.tags === null) {
				this.updateTagStorage();
			}
			// If we're on the dashboard, add a tab to it...
			if (RESUtils.currentSubreddit('dashboard')) {
				// add tab to dashboard
				modules['dashboard'].addTab('userTaggerContents', 'My User Tags');
				// populate the contents of the tab
				var showDiv = $('<div class="show">Show:</div>');
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

					var leftButton = document.createElement("a");
					leftButton.className = 'previous noKeyNav';
					leftButton.addEventListener('click', function(e) {
						if (controlWrapper.page === 1) {
							controlWrapper.page = controlWrapper.pageCount;
						} else {
							controlWrapper.page -= 1;
						}
						modules['userTagger'].drawUserTagTable();
					});
					controlWrapper.appendChild(leftButton);

					var posLabel = document.createElement('span');
					posLabel.className = 'RESGalleryLabel';
					posLabel.textContent = "1 of 2";
					controlWrapper.appendChild(posLabel);

					var rightButton = document.createElement("a");
					rightButton.className = 'next noKeyNav';
					rightButton.addEventListener('click', function(e) {
						if (controlWrapper.page === controlWrapper.pageCount) {
							controlWrapper.page = 1;
						} else {
							controlWrapper.page += 1;
						}
						modules['userTagger'].drawUserTagTable();
					});
					controlWrapper.appendChild(rightButton);

					$('#userTaggerContents').append(controlWrapper);

				}
				var thisTable = $('<table id="userTaggerTable" />');
				$(thisTable).append('<thead><tr><th sort="" class="active">Username <span class="sortAsc"></span></th><th sort="tag">Tag</th><th sort="ignore">Ignored</th><th sort="color">Color</th><th sort="votes">Vote Weight</th></tr></thead><tbody></tbody>');
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
					$this.append($(e.target).hasClass('descending')
						? '<span class="sortDesc" />'
						: '<span class="sortAsc" />');
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
			this.userTaggerToolTip = RESUtils.createElementWithID('div', 'userTaggerToolTip', 'RESDialogSmall');
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
			thisHTML += '<label for="userTaggerIgnore">Ignore</label>'; // <input type="checkbox" id="userTaggerIgnore" value="true">';
			thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span></label> <input type="text" id="userTaggerLink" value="">';
			thisHTML += '<label for="userTaggerVoteWeight">Vote Weight<span class="hoverHelp" title="manually edit vote weight for this user">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
			thisHTML += '<div class="clear"></div><input type="submit" id="userTaggerSave" value="Save"></form></div>';
			$(this.userTaggerToolTip).html(thisHTML);
			var ignoreLabel = this.userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
			RESUtils.insertAfter(ignoreLabel, RESUtils.toggleButton('userTaggerIgnore', false, 'no', 'yes'));
			this.userTaggerTag = this.userTaggerToolTip.querySelector('#userTaggerTag');
			this.userTaggerTag.addEventListener('keyup', modules['userTagger'].updateTagPreview, false);
			this.userTaggerColor = this.userTaggerToolTip.querySelector('#userTaggerColor');
			this.userTaggerColor.addEventListener('change', modules['userTagger'].updateTagPreview, false);
			this.userTaggerPreview = this.userTaggerToolTip.querySelector('#userTaggerPreview');
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
			if (this.options.hoverInfo.value) {
				this.authorInfoToolTip = RESUtils.createElementWithID('div', 'authorInfoToolTip', 'RESDialogSmall');
				this.authorInfoToolTipHeader = document.createElement('h3');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipHeader);
				this.authorInfoToolTipCloseButton = RESUtils.createElementWithID('div', 'authorInfoToolTipClose', 'RESCloseButton');
				$(this.authorInfoToolTipCloseButton).text('×');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipCloseButton);
				this.authorInfoToolTipCloseButton.addEventListener('click', function(e) {
					if (typeof modules['userTagger'].hideTimer !== 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
					modules['userTagger'].hideAuthorInfo();
				}, false);
				this.authorInfoToolTipContents = RESUtils.createElementWithID('div', 'authorInfoToolTipContents', 'RESDialogContents');
				this.authorInfoToolTip.appendChild(this.authorInfoToolTipContents);
				this.authorInfoToolTip.addEventListener('mouseover', function(e) {
					if (typeof modules['userTagger'].hideTimer !== 'undefined') {
						clearTimeout(modules['userTagger'].hideTimer);
					}
				}, false);
				this.authorInfoToolTip.addEventListener('mouseout', function(e) {
					if (e.target.getAttribute('class') !== 'hoverAuthor') {
						modules['userTagger'].hideTimer = setTimeout(function() {
							modules['userTagger'].hideAuthorInfo();
						}, modules['userTagger'].options.fadeDelay.value);
					}
				}, false);
				document.body.appendChild(this.authorInfoToolTip);
			}
			document.getElementById('userTaggerTag').addEventListener('keydown', function(e) {
				if (e.keyCode === 27) {
					// close prompt.
					modules['userTagger'].closeUserTagPrompt();
				}
			}, true);
			//console.log('before applytags: ' + Date());
			this.applyTags();
			//console.log('after applytags: ' + Date());
			if (RESUtils.pageType() === 'comments') {
				RESUtils.watchForElement('newComments', modules['userTagger'].attachVoteHandlers);
				RESUtils.watchForElement('newComments', modules['userTagger'].applyTags);
			} else {
				RESUtils.watchForElement('siteTable', modules['userTagger'].attachVoteHandlers);
				RESUtils.watchForElement('siteTable', modules['userTagger'].applyTags);
			}

			var userpagere = /^https?:\/\/([a-z]+)\.reddit\.com\/user\/[-\w\.]+\/?/i;
			if (userpagere.test(location.href)) {
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
					// this stopped working. commenting it out for now.  if i add this back I need to check if you're reddit gold anyway.
					/*
					var benefitsForm = document.createElement('div');
					var thisUser = document.querySelector('.titlebox > h1').innerHTML;
					$(benefitsForm).html('<form action="/post/friendnote" id="friendnote-r9_2vt1" method="post" class="pretty-form medium-text friend-note" onsubmit="return post_form(this, \'friendnote\');"><input type="hidden" name="name" value="'+thisUser+'"><input type="text" maxlength="300" name="note" id="benefits" class="tiny" onfocus="$(this).parent().addClass(\'edited\')" value="'+thisFriendComment+'"><button onclick="$(this).parent().removeClass(\'edited\')" type="submit">submit</button><span class="status"></span></form>');
					insertAfter( friendButton, benefitsForm );
					*/
				}
			}
		}
	},
	attachVoteHandlers: function(obj) {
		var voteButtons = obj.querySelectorAll('.arrow');
		this.voteStates = [];
		for (var i = 0, len = voteButtons.length; i < len; i++) {
			// get current vote states so that when we listen, we check the delta...
			// pairNum is just the index of the "pair" of vote arrows... it's i/2 with no remainder...
			var pairNum = Math.floor(i / 2);
			if (typeof this.voteStates[pairNum] === 'undefined') {
				this.voteStates[pairNum] = 0;
			}
			if (voteButtons[i].classList.contains('upmod')) {
				this.voteStates[pairNum] = 1;
			} else if (voteButtons[i].classList.contains('downmod')) {
				this.voteStates[pairNum] = -1;
			}
			// add an event listener to vote buttons to track votes, but only if we're logged in....
			voteButtons[i].setAttribute('pairNum', pairNum);
			if (RESUtils.loggedInUser()) {
				voteButtons[i].addEventListener('click', modules['userTagger'].handleVoteClick, true);
			}
		}
	},
	handleVoteClick: function(e) {
		var tags = RESStorage.getItem('RESmodules.userTagger.tags');
		if (typeof tags !== 'undefined') {
			modules['userTagger'].tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
		}
		if (e.target.getAttribute('onclick').indexOf('unvotable') === -1) {
			var pairNum = e.target.getAttribute('pairNum');
			if (pairNum) {
				pairNum = parseInt(pairNum, 10);
			}
			var thisAuthorA = this.parentNode.nextSibling.querySelector('p.tagline a.author');
			// if this is a post with a thumbnail, we need to adjust the query a bit...
			if (thisAuthorA === null && this.parentNode.nextSibling.classList.contains('thumbnail')) {
				thisAuthorA = this.parentNode.nextSibling.nextSibling.querySelector('p.tagline a.author');
			}
			if (thisAuthorA) {
				var thisVWobj = this.parentNode.nextSibling.querySelector('.voteWeight');
				if (!thisVWobj) {
					thisVWobj = this.parentNode.parentNode.querySelector('.voteWeight');
				}
				// but what if no obj exists
				var thisAuthor = thisAuthorA.textContent;
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
				var upOrDown = ((this.classList.contains('up')) || (this.classList.contains('upmod'))) ? 'up' : 'down';
				// did they click the up arrow, or down arrow?
				switch (upOrDown) {
					case 'up':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an upvote...
						if (this.classList.contains('up')) {
							// this is an undo of an upvote. subtract one from votes. We end on no vote.
							votes--;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've upvoted... the question is, is it an upvote alone, or an an undo of a downvote?
							// add one vote either way...
							votes++;
							// if it was previously downvoted, add another!
							if (modules['userTagger'].voteStates[pairNum] === -1) {
								votes++;
							}
							modules['userTagger'].voteStates[pairNum] = 1;
						}
						break;
					case 'down':
						// the class changes BEFORE the click event is triggered, so we have to look at them backwards.
						// if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
						// we are undoing an downvote...
						if (this.classList.contains('down')) {
							// this is an undo of an downvote. subtract one from votes. We end on no vote.
							votes++;
							modules['userTagger'].voteStates[pairNum] = 0;
						} else {
							// They've downvoted... the question is, is it an downvote alone, or an an undo of an upvote?
							// subtract one vote either way...
							votes--;
							// if it was previously upvoted, subtract another!
							if (modules['userTagger'].voteStates[pairNum] === 1) {
								votes--;
							}
							modules['userTagger'].voteStates[pairNum] = -1;
						}
						break;
				}
				/*
				if ((hasClass(this, 'upmod')) || (hasClass(this, 'down'))) {
					// upmod = upvote.  down = undo of downvote.
					votes = votes + 1;
				} else if ((hasClass(this, 'downmod')) || (hasClass(this, 'up'))) {
					// downmod = downvote.  up = undo of downvote.
					votes = votes - 1;
				}
				*/
				modules['userTagger'].tags[thisAuthor].votes = votes;
				RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
				modules['userTagger'].colorUser(thisVWobj, thisAuthor, votes);
			}
		}
	},
	drawUserTagTable: function(sortMethod, descending) {
		this.currentSortMethod = sortMethod || this.currentSortMethod;
		this.descending = (descending == null) ? this.descending : descending == true;
		var taggedUsers = [];
		var filterType = $('#tagFilter').val();
		for (var i in this.tags) {
			if (filterType === 'tagged users') {
				if (typeof this.tags[i].tag !== 'undefined') {
					taggedUsers.push(i);
				}
			} else {
				taggedUsers.push(i);
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

		for (var i = start; i < end; i++) {
			var thisUser = taggedUsers[i];
			var thisTag = (typeof this.tags[thisUser].tag === 'undefined') ? '' : this.tags[thisUser].tag;
			var thisVotes = (typeof this.tags[thisUser].votes === 'undefined') ? 0 : this.tags[thisUser].votes;
			var thisColor = (typeof this.tags[thisUser].color === 'undefined') ? '' : this.tags[thisUser].color;
			var thisIgnore = (typeof this.tags[thisUser].ignore === 'undefined') ? 'no' : 'yes';

			var userTagLink = document.createElement('a');
			if (thisTag === '') {
				// thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
			} else {
				userTagLink.setAttribute('class', 'userTagLink hasTag');
			}
			$(userTagLink).html(escapeHTML(thisTag));
			if (thisColor) {
				var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
				userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
			}
			userTagLink.setAttribute('username', thisUser);
			userTagLink.setAttribute('title', 'set a tag');
			userTagLink.setAttribute('href', 'javascript:void(0)');
			userTagLink.addEventListener('click', function(e) {
				modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);

			$('#userTaggerTable tbody').append('<tr><td><a class="author" href="/user/' + thisUser + '">' + thisUser + '</a> <span class="deleteButton" user="' + thisUser + '"></span></td><td id="tag_' + i + '"></td><td id="ignore_' + i + '">' + thisIgnore + '</td><td><span style="color: ' + thisColor + '">' + thisColor + '</span></td><td>' + thisVotes + '</td></tr>');
			$('#tag_' + i).append(userTagLink);
		}
		$('#userTaggerTable tbody .deleteButton').click(function(e) {
			var thisUser = $(this).attr('user');
			var answer = confirm("Are you sure you want to delete the tag for user: " + thisUser + "?");
			if (answer) {
				delete modules['userTagger'].tags[thisUser];
				RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules['userTagger'].tags));
				$(this).closest('tr').remove();
			}
		});
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
		'none': 'black',
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
		'olive': 'black',
		'orange': 'black',
		'purple': 'white',
		'red': ' black',
		'silver': 'black',
		'teal': 'white',
		'white': 'black',
		'yellow': 'black'
	},
	openUserTagPrompt: function(obj, username) {
		var thisXY = RESUtils.getXYpos(obj);
		this.clickedTag = obj;
		var thisH3 = document.querySelector('#userTaggerToolTip h3');
		thisH3.textContent = 'Tag ' + username;
		document.getElementById('userTaggerName').value = username;
		var thisTag = null;
		var thisIgnore = null;
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
			if (typeof this.tags[username].ignore !== 'undefined') {
				document.getElementById('userTaggerIgnore').checked = this.tags[username].ignore;
				var thisToggle = document.getElementById('userTaggerIgnoreContainer');
				if (this.tags[username].ignore) {
					thisToggle.classList.add('enabled');
				}
			} else {
				document.getElementById('userTaggerIgnore').checked = false;
			}
			if (typeof this.tags[username].votes !== 'undefined') {
				document.getElementById('userTaggerVoteWeight').value = this.tags[username].votes;
			} else {
				document.getElementById('userTaggerVoteWeight').value = '';
			}
			if (typeof this.tags[username].color !== 'undefined') {
				RESUtils.setSelectValue(document.getElementById('userTaggerColor'), this.tags[username].color);
			} else {
				document.getElementById('userTaggerColor').selectedIndex = 0;
			}
		} else {
			document.getElementById('userTaggerTag').value = '';
			document.getElementById('userTaggerIgnore').checked = false;
			document.getElementById('userTaggerVoteWeight').value = '';
			document.getElementById('userTaggerLink').value = '';
			if (this.options.storeSourceLink.value) {
				this.setLinkBasedOnTagLocation(obj);
			}
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
		this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
		document.getElementById('userTaggerTag').focus();
		modules['userTagger'].updateTagPreview();
		return false;
	},
	setLinkBasedOnTagLocation: function(obj) {
		var closestEntry = $(obj).closest('.entry');
		var linkTitle = $(closestEntry).find('a.title');
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
		modules['userTagger'].userTaggerPreview.style.backgroundColor = bgcolor;
		modules['userTagger'].userTaggerPreview.style.color = modules['userTagger'].bgToTextColorMap[bgcolor];
	},
	closeUserTagPrompt: function() {
		this.userTaggerToolTip.setAttribute('style', 'display: none');
		if (modules['keyboardNav'].isEnabled()) {
			var inputs = this.userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
			// remove focus from any input fields from the prompt so that keyboard navigation works again...
			for (var i = 0, len = inputs.length; i < len; i++) {
				inputs[i].blur();
			}
		}
	},
	setUserTag: function(username, tag, color, ignore, link, votes, noclick) {
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
			var bgColor = (color === "none") ? "transparent" : color;
			if (ignore) {
				this.tags[username].ignore = true;
			} else {
				delete this.tags[username].ignore;
			}
			if (!noclick) {
				this.clickedTag.setAttribute('class', 'userTagLink hasTag');
				this.clickedTag.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[color] + ' !important;');
				$(this.clickedTag).html(escapeHTML(tag));
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
	applyTags: function(ele) {
		if (ele == null) {
			ele = document;
		}
		var authors = ele.querySelectorAll('.noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a');
		RESUtils.forEachChunked(authors, 15, 1000, function(arrayElement, index, array) {
			modules['userTagger'].applyTagToAuthor(arrayElement);
		});
	},
	applyTagToAuthor: function(thisAuthorObj) {
		var userObject = [],
			thisVotes = 0,
			thisTag = null,
			thisColor = null,
			thisIgnore = null,
			thisAuthor, thisPost, thisComment, test, noTag;

		// var thisAuthorObj = this.authors[authorNum];
		if ((thisAuthorObj) && (!(thisAuthorObj.classList.contains('userTagged'))) && (typeof thisAuthorObj !== 'undefined') && (thisAuthorObj !== null)) {
			if (this.options.hoverInfo.value) {
				// add event listener to hover, so we can grab user data on hover...
				thisAuthorObj.addEventListener('mouseover', function(e) {
					modules['userTagger'].showTimer = setTimeout(function() {
						modules['userTagger'].showAuthorInfo(thisAuthorObj);
					}, modules['userTagger'].options.hoverDelay.value);
				}, false);
				thisAuthorObj.addEventListener('mouseout', function(e) {
					clearTimeout(modules['userTagger'].showTimer);
				}, false);
				thisAuthorObj.addEventListener('click', function(e) {
					clearTimeout(modules['userTagger'].showTimer);
				}, false);
			}
			test = thisAuthorObj.href.match(this.usernameRE);
			if (test) {
				thisAuthor = test[1];
			}
			// var thisAuthor = thisAuthorObj.text;
			noTag = false;
			if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
				noTag = true;
				thisAuthor = thisAuthor.substr(3);
			}
			if (!noTag) {
				thisAuthorObj.classList.add('userTagged');
				if (typeof userObject[thisAuthor] === 'undefined') {
					if ((this.tags !== null) && (typeof this.tags[thisAuthor] !== 'undefined')) {
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

				var userTagLink = document.createElement('a');
				if (!thisTag) {
					// thisTag = '<div class="RESUserTagImage"></div>';
					userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
				} else {
					userTagLink.setAttribute('class', 'userTagLink hasTag');
				}
				$(userTagLink).html(escapeHTML(thisTag));
				if (thisColor) {
					var bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
					userTagLink.setAttribute('style', 'background-color: ' + bgColor + '; color: ' + this.bgToTextColorMap[thisColor] + ' !important;');
				}
				userTagLink.setAttribute('username', thisAuthor);
				userTagLink.setAttribute('title', 'set a tag');
				userTagLink.setAttribute('href', 'javascript:void(0)');
				userTagLink.addEventListener('click', function(e) {
					modules['userTagger'].openUserTagPrompt(e.target, this.getAttribute('username'));
				}, true);
				var userTag = document.createElement('span');
				userTag.classList.add('RESUserTag');
				// var lp = document.createTextNode(' (');
				// var rp = document.createTextNode(')');
				userTag.appendChild(userTagLink);
				// userTagFrag.appendChild(lp);
				userTagFrag.appendChild(userTag);
				// userTagFrag.appendChild(rp);
				if (this.options.colorUser.value) {
					var userVoteFrag = document.createDocumentFragment();
					var spacer = document.createTextNode(' ');
					userVoteFrag.appendChild(spacer);
					var userVoteWeight = document.createElement('a');
					userVoteWeight.setAttribute('href', 'javascript:void(0)');
					userVoteWeight.setAttribute('class', 'voteWeight');
					$(userVoteWeight).text('[vw]');
					userVoteWeight.addEventListener('click', function(e) {
						var theTag = this.parentNode.querySelector('.userTagLink');
						modules['userTagger'].openUserTagPrompt(theTag, theTag.getAttribute('username'));
					}, true);
					this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
					userVoteFrag.appendChild(userVoteWeight);
					userTagFrag.appendChild(userVoteFrag);
				}
				RESUtils.insertAfter(thisAuthorObj, userTagFrag);
				thisIgnore = userObject[thisAuthor].ignore;
				if (thisIgnore && (RESUtils.pageType() !== 'profile')) {
					if (this.options.hardIgnore.value) {
						if (RESUtils.pageType() === 'comments') {
							var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								$(thisComment).textContent = thisAuthor + ' is an ignored user';
								thisComment.classList.add('ignoredUserComment');

								var toggle = thisComment.parentNode.querySelector('a.expand');
								RESUtils.click(toggle);
							}
							// firefox fails when we use this jquery call, so we're ditching it
							// in favor of the above lines (grabbing toggle, using RESUtils.click...)
							// $(thisComment).parent().find('a.expand').click();
						} else {
							if(RESUtils.pageType() === 'inbox'){
								thisPost = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							}else{
								thisPost = thisAuthorObj.parentNode.parentNode.parentNode;
							}
							// hide post block first...
							thisPost.style.display = 'none';
							// hide associated voting block...
							if (thisPost.previousSibling) {
								thisPost.previousSibling.style.display = 'none';
							}
						}
					} else {
						if (RESUtils.pageType() === 'comments') {
							thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
							if (thisComment) {
								thisComment.textContent = thisAuthor + ' is an ignored user';
								thisComment.classList.add('ignoredUserComment');
							}
						} else {
							if(RESUtils.pageType() === 'inbox'){
								var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.querySelector('.md');
								var thisMessage = thisAuthorObj.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
								// If message, ignore message title also
								if(!$(thisMessage).hasClass("was-comment")){
									thisMessage.querySelector('.subject').textContent = 'Ignored message';
								}
							}else{
								var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.querySelector('p.title');
							}

							if (thisPost) {
								// need this setTimeout, potentially because destroying the innerHTML causes conflict with other modules?
								setTimeout(function() {
									thisPost.textContent = thisAuthor + ' is an ignored user';
								}, 100);
								thisPost.setAttribute('class', 'ignoredUserPost');
							}
						}
					}
				}
			}
		}
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
					if (modules['styleTweaks'].isDark()) {
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
	showAuthorInfo: function(obj) {
		var isFriend = obj.classList.contains('friend'),
			thisXY = RESUtils.getXYpos(obj),
			thisWidth = $(obj).width(),
			test = obj.href.match(this.usernameRE),
			myID, friendButton, friendButtonEle;

		if (test) {
			thisUserName = test[1];
		}
		// if (thisUserName.substr(0,3) === '/u/') thisUserName = thisUserName.substr(3);
		$(this.authorInfoToolTipHeader).html('<a href="/user/' + escapeHTML(thisUserName) + '">' + escapeHTML(thisUserName) + '</a> (<a href="/user/' + escapeHTML(thisUserName) + '/submitted/">Links</a>) (<a href="/user/' + escapeHTML(thisUserName) + '/comments/">Comments</a>)');
		RESUtils.getUserInfo(function(userInfo) {
			myID = 't2_' + userInfo.data.id;
			if (isFriend) {
				friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'), friend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
			} else {
				friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'), unfriend(\'' + obj.textContent + '\', \'' + myID + '\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
			}
			friendButtonEle = $(friendButton);
			$(modules['userTagger'].authorInfoToolTipHeader).append(friendButtonEle);
		});
		$(this.authorInfoToolTipContents).html('<a class="hoverAuthor" href="/user/' + escapeHTML(thisUserName) + '">' + escapeHTML(thisUserName) + '</a>:<br><span class="RESThrobber"></span> loading...');
		if (window.innerWidth - thisXY.x - thisWidth <= 450) {
			// tooltip would go off right edge - reverse it.
			this.authorInfoToolTip.classList.add('right');
			var tooltipWidth = $(this.authorInfoToolTip).width();
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x - tooltipWidth - 30) + 'px;');
		} else {
			this.authorInfoToolTip.classList.remove('right');
			this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 14) + 'px; left: ' + (thisXY.x + thisWidth + 25) + 'px;');
		}
		if (this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementIn(this.authorInfoToolTip, this.options.fadeSpeed.value);
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'authorInfo');
		setTimeout(function() {
			if (!RESUtils.elementUnderMouse(modules['userTagger'].authorInfoToolTip) && (!RESUtils.elementUnderMouse(obj))) {
				modules['userTagger'].hideAuthorInfo();
			}
		}, 1000);
		obj.addEventListener('mouseout', modules['userTagger'].delayedHideAuthorInfo);
		if (typeof this.authorInfoCache[thisUserName] !== 'undefined') {
			this.writeAuthorInfo(this.authorInfoCache[thisUserName], obj);
		} else {
			GM_xmlhttpRequest({
				method: "GET",
				url: location.protocol + "//" + location.hostname + "/user/" + thisUserName + "/about.json?app=res",
				onload: function(response) {
					var thisResponse = JSON.parse(response.responseText);
					modules['userTagger'].authorInfoCache[thisUserName] = thisResponse;
					modules['userTagger'].writeAuthorInfo(thisResponse, obj);
				}
			});
		}
	},
	delayedHideAuthorInfo: function(e) {
		modules['userTagger'].hideTimer = setTimeout(function() {
			e.target.removeEventListener('mouseout', modules['userTagger'].delayedHideAuthorInfo);
			modules['userTagger'].hideAuthorInfo();
		}, modules['userTagger'].options.fadeDelay.value);
	},
	writeAuthorInfo: function(jsonData, authorLink) {
		if (!jsonData.data) {
			$(this.authorInfoToolTipContents).text("User not found");
			return false;
		}
		var utctime = jsonData.data.created_utc;
		var d = new Date(utctime * 1000);
		// var userHTML = '<a class="hoverAuthor" href="/user/'+jsonData.data.name+'">'+jsonData.data.name+'</a>:';
		var userHTML = '<div class="authorFieldPair"><div class="authorLabel">Redditor since:</div> <div class="authorDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.link_karma) + '</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + escapeHTML(jsonData.data.comment_karma) + '</div></div>';
		if ((typeof modules['userTagger'].tags[jsonData.data.name] !== 'undefined') && (modules['userTagger'].tags[jsonData.data.name].link)) {
			userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link:</div> <div class="authorDetail"><a target="_blank" href="' + escapeHTML(modules['userTagger'].tags[jsonData.data.name].link) + '">website link</a></div></div>';
		}
		userHTML += '<div class="clear"></div><div class="bottomButtons">';
		userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/message/compose/?to=' + escapeHTML(jsonData.data.name) + '"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> send message</a>';
		if (jsonData.data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold/about">User has Reddit Gold</a>';
		} else {
			userHTML += '<a target="_blank" id="gildUser" class="blueButton" href="http://www.reddit.com/gold?goldtype=gift&recipient=' + escapeHTML(jsonData.data.name) + '">Gift Reddit Gold</a>';
		}

		if (this.options.highlightButton.value) {
			if (!this.highlightedUsers || !this.highlightedUsers[jsonData.data.name]) {
				userHTML += '<div class="blueButton" id="highlightUser" user="' + escapeHTML(jsonData.data.name) + '">Highlight</div>';
			} else {
				userHTML += '<div class="redButton" id="highlightUser" user="' + escapeHTML(jsonData.data.name) + '">Unhighlight</div>';
			}
		}

		if ((modules['userTagger'].tags[jsonData.data.name]) && (modules['userTagger'].tags[jsonData.data.name].ignore)) {
			userHTML += '<div class="redButton" id="ignoreUser" user="' + escapeHTML(jsonData.data.name) + '">&empty; Unignore</div>';
		} else {
			userHTML += '<div class="blueButton" id="ignoreUser" user="' + escapeHTML(jsonData.data.name) + '">&empty; Ignore</div>';
		}
		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		$(this.authorInfoToolTipContents).html(userHTML);
		this.authorInfoToolTipIgnore = this.authorInfoToolTipContents.querySelector('#ignoreUser');
		this.authorInfoToolTipIgnore.addEventListener('click', modules['userTagger'].ignoreUser, false);
		if (modules['userTagger'].options.highlightButton.value) {
			this.authorInfoToolTipHighlight = this.authorInfoToolTipContents.querySelector('#highlightUser');
			if (this.authorInfoToolTipHighlight) {
				this.authorInfoToolTipHighlight.addEventListener('click', function(e) {
					var username = e.target.getAttribute('user');
					modules['userTagger'].toggleUserHighlight(username);
				}, false);
			}
		}
		if (modules['userTagger'].options.gildComments.value && RESUtils.pageType() === 'comments') {
			var giveGold = this.authorInfoToolTipContents.querySelector('#gildUser');
			if (giveGold) {
				giveGold.addEventListener('click', function(e) {
					if (e.ctrlKey || e.cmdKey || e.shiftKey) {
						return;
					}

					var comment = $(authorLink).closest('.comment');
					if (!comment) {
						return;
					}

					modules['userTagger'].hideAuthorInfo();
					var giveGold = comment.find('.give-gold')[0];
					RESUtils.click(giveGold);
					e.preventDefault();
				});
			}
		}
	},
	toggleUserHighlight: function(username) {
		if (!this.highlightedUsers) {
			this.highlightedUsers = {};
		}

		if (this.highlightedUsers[username]) {
			this.highlightedUsers[username].remove();
			delete this.highlightedUsers[username];
			this.toggleUserHighlightButton(true);
		} else {

			this.highlightedUsers[username] =
				modules['userHighlight'].highlightUser(username);
			this.toggleUserHighlightButton(false);
		}
	},
	toggleUserHighlightButton: function(canHighlight) {
		$(this.authorInfoToolTipHighlight)
			.toggleClass('blueButton', canHighlight)
			.toggleClass('redButton', !canHighlight)
			.text(canHighlight ? 'Highlight' : 'Unhighlight');
	},
	ignoreUser: function(e) {
		var thisIgnore, thisName,
			thisColor, thisLink, thisVotes, thisTag;
		
		if (e.target.classList.contains('blueButton')) {
			e.target.classList.remove('blueButton');
			e.target.classList.add('redButton');
			$(e.target).html('&empty; Unignore');
			var thisIgnore = true;
		} else {
			e.target.classList.remove('redButton');
			e.target.classList.add('blueButton');
			$(e.target).html('&empty; Ignore');
			var thisIgnore = false;
		}
		thisName = e.target.getAttribute('user');
		if (modules['userTagger'].tags[thisName]) {
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
		modules['userTagger'].setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true); // last true is for noclick param
	},
	hideAuthorInfo: function(obj) {
		// this.authorInfoToolTip.setAttribute('style', 'display: none');
		if (this.options.fadeSpeed.value < 0 || this.options.fadeSpeed.value > 1 || isNaN(this.options.fadeSpeed.value)) {
			this.options.fadeSpeed.value = 0.3;
		}
		RESUtils.fadeElementOut(this.authorInfoToolTip, this.options.fadeSpeed.value);
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'authorInfo');
	},
	updateTagStorage: function() {
		// update tag storage format from the old individual bits to a big JSON blob
		// It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
		ls = (typeof unsafeWindow !== 'undefined') ? unsafeWindow.localStorage : localStorage;
		var tags = {};
		var toRemove = [];
		for (var i = 0, len = ls.length; i < len; i++) {
			var keySplit = null;
			if (ls.key(i)) {
				keySplit = ls.key(i).split('.');
			}
			if (keySplit) {
				var keyRoot = keySplit[0];
				switch (keyRoot) {
					case 'reddituser':
						var thisNode = keySplit[1];
						if (typeof tags[keySplit[2]] === 'undefined') {
							tags[keySplit[2]] = {};
						}
						if (thisNode === 'votes') {
							tags[keySplit[2]].votes = ls.getItem(ls.key(i));
						} else if (thisNode === 'tag') {
							tags[keySplit[2]].tag = ls.getItem(ls.key(i));
						} else if (thisNode === 'color') {
							tags[keySplit[2]].color = ls.getItem(ls.key(i));
						} else if (thisNode === 'ignore') {
							tags[keySplit[2]].ignore = ls.getItem(ls.key(i));
						}
						// now delete the old stored garbage...
						var keyString = 'reddituser.' + thisNode + '.' + keySplit[2];
						toRemove.push(keyString);
						break;
					default:
						// console.log('Not currently handling keys with root: ' + keyRoot);
						break;
				}
			}
		}
		this.tags = tags;
		RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
		// now remove the old garbage...
		for (var i = 0, len = toRemove.length; i < len; i++) {
			ls.removeItem(toRemove[i]);
		}
	}
};