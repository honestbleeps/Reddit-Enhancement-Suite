modules['commentNavigator'] = {
	moduleID: 'commentNavigator',
	moduleName: 'Comment Navigator',
	category: 'Comments',
	description: 'Provides a comment navigation tool to easily find comments by OP, mod, etc.',
	options: {
		showByDefault: {
			type: 'boolean',
			value: false,
			description: 'Display Comment Navigator by default'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/^https?:\/\/([a-z]+)\.reddit\.com\/comments\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('#REScommentNavBox { position: fixed; z-index: 999; right: 10px; top: 46px; width: 265px; border: 1px solid gray; background-color: #fff; opacity: 0.3; padding: 3px; user-select: none; -webkit-user-select: none; -moz-user-select: none; -webkit-transition:opacity 0.5s ease-in; -moz-transition:opacity 0.5s ease-in; -o-transition:opacity 0.5s ease-in; -ms-transition:opacity 0.5s ease-in; -transition:opacity 0.5s ease-in; }');
			RESUtils.addCSS('#REScommentNavBox:hover { opacity: 1 }');
			RESUtils.addCSS('#REScommentNavToggle { float: left; display: inline; margin-left: 0; width: 100%; }');
			RESUtils.addCSS('.commentarea .menuarea { margin-right: 0; }');
			RESUtils.addCSS('.menuarea > .spacer { margin-right: 0; }');
			RESUtils.addCSS('#commentNavButtons { margin: auto; }');
			RESUtils.addCSS('#commentNavUp { margin: auto; cursor: pointer; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0 -224px; }');
			RESUtils.addCSS('#commentNavDown { margin: auto; cursor: pointer; background-image: url("https://s3.amazonaws.com/e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); width: 32px; height: 20px; background-position: 0 -244px; }');
			RESUtils.addCSS('#commentNavUp.noNav { background-position: 0 -264px; }');
			RESUtils.addCSS('#commentNavDown.noNav { background-position: 0 -284px; }');
			RESUtils.addCSS('#commentNavButtons { display: none; margin-left: 12px; text-align: center; user-select: none; -webkit-user-select: none; -moz-user-select: none; }');
			RESUtils.addCSS('.commentNavSortType { cursor: pointer; font-weight: bold; float: left; margin-left: 6px; }');
			RESUtils.addCSS('#commentNavPostCount { color: #1278d3; }');
			RESUtils.addCSS('.noNav #commentNavPostCount { color: #ddd; }');
			RESUtils.addCSS('.commentNavSortTypeDisabled { color: #ddd; }');
			RESUtils.addCSS('.commentNavSortType:hover { text-decoration: underline; }');
			RESUtils.addCSS('#REScommentNavToggle span { float: left; margin-left: 6px; }');
			RESUtils.addCSS('.menuarea > .spacer { float: left; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// draw the commentNav box
			this.commentNavBox = RESUtils.createElementWithID('div', 'REScommentNavBox');
			this.commentNavBox.classList.add('RESDialogSmall');
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				this.commentNavToggle = RESUtils.createElementWithID('div', 'REScommentNavToggle');
				$(this.commentNavToggle).html('<span>navigate by:</span>');
				var sortTypes = ['submitter', 'moderator', 'friend', 'me', 'admin', 'IAmA', 'images', 'popular', 'new'];
				for (var i = 0, len = sortTypes.length; i < len; i++) {
					var thisCategory = sortTypes[i];
					// var thisEle = document.createElement('div');
					var thisEle = RESUtils.createElementWithID('div', 'navigateBy' + thisCategory);
					switch (thisCategory) {
						case 'submitter':
							thisEle.setAttribute('title', 'Navigate comments made by the post submitter');
							break;
						case 'moderator':
							thisEle.setAttribute('title', 'Navigate comments made by moderators');
							break;
						case 'friend':
							thisEle.setAttribute('title', 'Navigate comments made by users on your friends list');
							break;
						case 'me':
							thisEle.setAttribute('title', 'Navigate comments made by you');
							break;
						case 'admin':
							thisEle.setAttribute('title', 'Navigate comments made by reddit admins');
							break;
						case 'IAmA':
							thisEle.setAttribute('title', 'Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)');
							break;
						case 'images':
							thisEle.setAttribute('title', 'Navigate through comments with images');
							break;
						case 'popular':
							thisEle.setAttribute('title', 'Navigate through comments in order of highest vote total');
							break;
						case 'new':
							thisEle.setAttribute('title', 'Navigate through new comments (Reddit Gold users only)');
							break;
						default:
							break;
					}
					thisEle.setAttribute('index', i + 1);
					thisEle.classList.add('commentNavSortType');
					thisEle.textContent = thisCategory;
					if (thisCategory === 'new') {
						var isGold = document.body.querySelector('.gold-accent.comment-visits-box');
						if (isGold) {
							thisEle.setAttribute('style', 'color: #9A7D2E;');
						} else {
							thisEle.classList.add('commentNavSortTypeDisabled');
						}
					}
					if ((thisCategory !== 'new') || (isGold)) {
						thisEle.addEventListener('click', function(e) {
							modules['commentNavigator'].showNavigator(e.target.getAttribute('index'));
						}, false);
					}
					this.commentNavToggle.appendChild(thisEle);
					if (i < len - 1) {
						var thisDivider = document.createElement('span');
						thisDivider.textContent = '|';
						this.commentNavToggle.appendChild(thisDivider);
					}
				}

				// commentArea.insertBefore(this.commentNavToggle,commentArea.firstChild);
				commentArea.appendChild(this.commentNavToggle, commentArea.firstChild);
				if (!(this.options.showByDefault.value)) {
					this.commentNavBox.style.display = 'none';
				}
				var navBoxHTML = ' \
					\
					<h3>Navigate by: \
						<select id="commentNavBy"> \
							<option name=""></option> \
							<option name="submitter">submitter</option> \
							<option name="moderator">moderator</option> \
							<option name="friend">friend</option> \
							<option name="me">me</option> \
							<option name="admin">admin</option> \
							<option name="IAmA">IAmA</option> \
							<option name="images">images</option> \
							<option name="popular">popular</option> \
							<option name="new">new</option> \
						</select> \
					</h3>\
					<div id="commentNavCloseButton" class="RESCloseButton">&times;</div> \
					<div class="RESDialogContents"> \
						<div id="commentNavButtons"> \
							<div id="commentNavUp"></div> <div id="commentNavPostCount"></div> <div id="commentNavDown"></div> \
						</div> \
					</div> \
				';
				$(this.commentNavBox).html(navBoxHTML);
				this.posts = [];
				this.nav = [];
				this.navSelect = this.commentNavBox.querySelector('#commentNavBy');
				this.commentNavPostCount = this.commentNavBox.querySelector('#commentNavPostCount');
				this.commentNavButtons = this.commentNavBox.querySelector('#commentNavButtons');
				this.commentNavCloseButton = this.commentNavBox.querySelector('#commentNavCloseButton');
				this.commentNavCloseButton.addEventListener('click', function(e) {
					modules['commentNavigator'].commentNavBox.style.display = 'none';
				}, false);
				this.commentNavUp = this.commentNavBox.querySelector('#commentNavUp');
				this.commentNavUp.addEventListener('click', modules['commentNavigator'].moveUp, false);
				this.commentNavDown = this.commentNavBox.querySelector('#commentNavDown');
				this.commentNavDown.addEventListener('click', modules['commentNavigator'].moveDown, false);
				this.navSelect.addEventListener('change', modules['commentNavigator'].changeCategory, false);
				document.body.appendChild(this.commentNavBox);
			}
		}
	},
	changeCategory: function() {
		var index = modules['commentNavigator'].navSelect.selectedIndex;
		modules['commentNavigator'].currentCategory = modules['commentNavigator'].navSelect.options[index].value;
		if (modules['commentNavigator'].currentCategory !== '') {
			modules['commentNavigator'].getPostsByCategory(modules['commentNavigator'].currentCategory);
			modules['commentNavigator'].commentNavButtons.style.display = 'block';
		} else {
			modules['commentNavigator'].commentNavButtons.style.display = 'none';
		}
	},
	showNavigator: function(categoryID) {
		modules['commentNavigator'].commentNavBox.style.display = 'block';
		this.navSelect.selectedIndex = categoryID;
		modules['commentNavigator'].changeCategory();
	},
	getPostsByCategory: function() {
		var category = modules['commentNavigator'].currentCategory;
		if ((typeof category !== 'undefined') && (category !== '')) {
			if (typeof this.posts[category] === 'undefined') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						this.posts[category] = document.querySelectorAll('.noncollapsed a.author.' + category);
						this.resetNavigator(category);
						break;
					case 'me':
						RESUtils.getUserInfo(function(userInfo) {
							var myID = 't2_' + userInfo.data.id;
							modules['commentNavigator'].posts[category] = document.querySelectorAll('.noncollapsed a.author.id-' + myID);
							modules['commentNavigator'].resetNavigator(category);
						});
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
						this.posts[category] = [];
						for (var i = 0, len = submitterPosts.length; i < len; i++) {
							// go seven parents up to get the proper parent post...
							var sevenUp = submitterPosts[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
							if (sevenUp.parentNode.nodeName === 'BODY') {
								this.posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								this.posts[category].push(sevenUp);
							}
						}
						this.resetNavigator(category);
						break;
					case 'images':
						var imagePosts = document.querySelectorAll('.toggleImage');
						this.posts[category] = imagePosts;
						this.resetNavigator(category);
						break;
					case 'popular':
						var allComments = document.querySelectorAll('.noncollapsed');
						var commentsObj = [];
						for (var i = 0, len = allComments.length; i < len; i++) {
							var thisScore = allComments[i].querySelector('.unvoted');
							if (thisScore) {
								var scoreSplit = thisScore.innerHTML.split(' ');
								var score = scoreSplit[0];
							} else {
								var score = 0;
							}
							commentsObj[i] = {
								comment: allComments[i],
								score: score
							}
						}
						commentsObj.sort(function(a, b) {
							return parseInt(b.score, 10) - parseInt(a.score, 10);
						});
						this.posts[category] = [];
						for (var i = 0, len = commentsObj.length; i < len; i++) {
							this.posts[category][i] = commentsObj[i].comment;
						}
						this.resetNavigator(category);
						break;
					case 'new':
						this.posts[category] = document.querySelectorAll('.new-comment');
						this.resetNavigator(category);
						break;
				}
			}
		}
	},
	resetNavigator: function(category) {
		this.nav[category] = 0;
		if (this.posts[category].length) {
			modules['commentNavigator'].scrollToNavElement();
			modules['commentNavigator'].commentNavUp.classList.remove('noNav');
			modules['commentNavigator'].commentNavDown.classList.remove('noNav');
			modules['commentNavigator'].commentNavButtons.classList.remove('noNav');
		} else {
			modules['commentNavigator'].commentNavPostCount.textContent = 'none';
			modules['commentNavigator'].commentNavUp.classList.add('noNav');
			modules['commentNavigator'].commentNavDown.classList.add('noNav');
			modules['commentNavigator'].commentNavButtons.classList.add('noNav');
		}
	},
	moveUp: function() {
		var category = modules['commentNavigator'].currentCategory;
		if (modules['commentNavigator'].posts[category].length) {
			if (modules['commentNavigator'].nav[category] > 0) {
				modules['commentNavigator'].nav[category]--;
			} else {
				modules['commentNavigator'].nav[category] = modules['commentNavigator'].posts[category].length - 1;
			}
			modules['commentNavigator'].scrollToNavElement();
		}
	},
	moveDown: function() {
		var category = modules['commentNavigator'].currentCategory;
		if (modules['commentNavigator'].posts[category].length) {
			if (modules['commentNavigator'].nav[category] < modules['commentNavigator'].posts[category].length - 1) {
				modules['commentNavigator'].nav[category]++;
			} else {
				modules['commentNavigator'].nav[category] = 0;
			}
			modules['commentNavigator'].scrollToNavElement();
		}
	},
	scrollToNavElement: function() {
		var category = modules['commentNavigator'].currentCategory;
		$(modules['commentNavigator'].commentNavPostCount).text(modules['commentNavigator'].nav[category] + 1 + '/' + modules['commentNavigator'].posts[category].length);
		var thisXY = RESUtils.getXYpos(modules['commentNavigator'].posts[category][modules['commentNavigator'].nav[category]]);
		RESUtils.scrollTo(0, thisXY.y);
	}
};
