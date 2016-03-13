addModule('commentNavigator', {
	moduleID: 'commentNavigator',
	moduleName: 'Comment Navigator',
	category: 'Comments',
	description: 'Provides a comment navigation tool to easily find comments by OP, mod, etc.',
	options: {
		showByDefault: {
			type: 'boolean',
			value: false,
			description: 'Display Comment Navigator by default'
		},
		openOnHighlightUser: {
			type: 'boolean',
			value: true,
			description: 'Display Comment Navigator when a user is highlighted',
			advanced: true
		}
	},
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'comments'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESTemplates.load('commentNavigatorCSS', function(template) {
				RESUtils.addCSS(template.text());
			});
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// draw the commentNav box
			this.commentNavBox = RESUtils.createElement('div', 'REScommentNavBox');
			this.commentNavBox.classList.add('RESDialogSmall');
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				this.commentNavToggle = RESUtils.createElement('div', 'REScommentNavToggle');
				$(this.commentNavToggle).html('<span>navigate by:</span> ');
				var sortTypes = ['submitter', 'moderator', 'friend', 'me', 'admin', 'highlighted', 'gilded', 'IAmA', 'images', 'videos', 'popular', 'new'];
				for (var i = 0, len = sortTypes.length; i < len; i++) {
					var thisCategory = sortTypes[i];
					// var thisEle = document.createElement('div');
					var thisEle = RESUtils.createElement('div', 'navigateBy' + thisCategory, 'commentNavSortType noCtrlF', thisCategory);
					thisEle.setAttribute('index', i + 1);
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
						case 'highlighted':
							thisEle.setAttribute('title', 'Navigate comments made by highlighted user');
							break;
						case 'gilded':
							thisEle.setAttribute('title', 'Navigate through gilded comments');
							break;
						case 'IAmA':
							thisEle.setAttribute('title', 'Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)');
							break;
						case 'images':
							thisEle.setAttribute('title', 'Navigate through comments with images');
							break;
						case 'videos':
							thisEle.setAttribute('title', 'Navigate through comments with videos');
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

					var isGold;
					if (thisCategory === 'new') {
						isGold = document.body.querySelector('.gold-accent.comment-visits-box');
						if (isGold) {
							thisEle.setAttribute('style', 'color: #9A7D2E;');
						} else {
							thisEle.classList.add('commentNavSortTypeDisabled');
						}
					}
					if (thisCategory !== 'new' || isGold) {
						thisEle.addEventListener('click', function(e) {
							modules['commentNavigator'].showNavigator(e.target.getAttribute('index'));
						}, false);
					}
					this.commentNavToggle.appendChild(thisEle);
				}

				// commentArea.insertBefore(this.commentNavToggle,commentArea.firstChild);
				commentArea.appendChild(this.commentNavToggle, commentArea.firstChild);
				if (!(this.options.showByDefault.value)) {
					modules['commentNavigator'].hideNavigator();
				}
				this.posts = [];
				this.nav = [];

				RESTemplates.load('commentNavigator', (function(template) {
					var navBoxHTML = template.html();
					$(this.commentNavBox).html(navBoxHTML);

					this.navSelect = this.commentNavBox.querySelector('#commentNavBy');
					this.commentNavPostCount = this.commentNavBox.querySelector('#commentNavPostCount');
					this.commentNavButtons = this.commentNavBox.querySelector('#commentNavButtons');
					this.commentNavCloseButton = this.commentNavBox.querySelector('#commentNavCloseButton');
					this.commentNavCloseButton.addEventListener('click', function(e) {
						modules['commentNavigator'].hideNavigator();
					}, false);
					this.commentNavUp = this.commentNavBox.querySelector('#commentNavUp');
					this.commentNavUp.addEventListener('click', modules['commentNavigator'].moveUp, false);
					this.commentNavDown = this.commentNavBox.querySelector('#commentNavDown');
					this.commentNavDown.addEventListener('click', modules['commentNavigator'].moveDown, false);
					this.navSelect.addEventListener('change', modules['commentNavigator'].changeCategory, false);

					modules['floater'].addElement(this.commentNavBox, { separate: true } );
					window.addEventListener('scroll', RESUtils.debounce.bind(RESUtils, 'scroll.commentNavigator', 300, modules['commentNavigator'].onScroll.bind(modules['commentNavigator'])));
				}).bind(this));
			}
		}
	},
	onScroll: function() {
		var category = modules['commentNavigator'].currentCategory,
			i = 0,
			headerOffset = 0,
			posts, len, thisXY;

		if (category) {
			// add space for header offset if pinheader is used
			if (modules['betteReddit'].options.pinHeader.value === 'sub') {
				headerOffset += $('#sr-header-area').height() + 8;
			} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
				headerOffset += $('#sr-header-area').height() + 8;
			} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
				headerOffset += $('#header').height() + 8;
			}
			posts = modules['commentNavigator'].posts[category];
			len = posts.length;
			for (; i < len; i++) {
				thisXY = RESUtils.getXYpos(posts[i]);
				if (thisXY.y > window.pageYOffset + headerOffset) {
					modules['commentNavigator'].setNavIndex(Math.max(i-1,0));
					break;
				}
			}

		}
	},
	changeCategory: function() {
		var index = modules['commentNavigator'].navSelect.selectedIndex;
		if (index === -1) {
			return;
		}
		modules['commentNavigator'].currentCategory = modules['commentNavigator'].navSelect.options[index].value;
		if (modules['commentNavigator'].currentCategory !== '') {
			modules['commentNavigator'].getPostsByCategory();
			modules['commentNavigator'].commentNavButtons.style.display = 'block';
		} else {
			modules['commentNavigator'].commentNavButtons.style.display = 'none';
		}
		$('#commentNavBy').blur();
	},
	showNavigator: function(category) {
		modules['commentNavigator'].isOpen = true;
		modules['commentNavigator'].commentNavBox.style.display = 'block';
		if (typeof category === 'undefined') {
			category = modules['commentNavigator'].currentCategory;
		}

		if (isNaN(category)) {
			this.navSelect.value = category;
		} else if (typeof category === 'number') {
			this.navSelect.selectedIndex = category;
		} else if (!isNaN(parseInt(category, 10))) {
			this.navSelect.selectedIndex = parseInt(category, 10);
		}
		$('#commentNavBy').focus();
		modules['commentNavigator'].changeCategory();
	},
	hideNavigator: function() {
		modules['commentNavigator'].isOpen = false;
		modules['commentNavigator'].commentNavBox.style.display = 'none';
	},
	getPostsByCategory: function() {
		var category = modules['commentNavigator'].currentCategory;
		if ((typeof category !== 'undefined') && (category !== '')) {
			if (typeof this.posts[category] === 'undefined' || category === 'highlighted') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						this.posts[category] = document.querySelectorAll('.noncollapsed a.author.' + category);
						break;
					case 'me':
						RESUtils.getUserInfo(function(userInfo) {
							var myID = 't2_' + userInfo.data.id;
							modules['commentNavigator'].posts[category] = document.querySelectorAll('.noncollapsed a.author.id-' + myID);
						});
						break;
					case 'highlighted':
						if (modules['userInfo'].highlightedUsers) {
							var highlightedUserSelectors = $.map(modules['userInfo'].highlightedUsers, function(element, key) {
								return '.noncollapsed .author.id-t2_'+key;
							});
							var highlightedUserSelector = highlightedUserSelectors.join(', ');
							this.posts[category] = highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
						} else {
							this.posts[category] = [];
						}
						break;
					case 'gilded':
						var gildedPosts = document.querySelectorAll('.noncollapsed .gilded-icon');
						this.posts[category] = gildedPosts;
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter'),
							i = 0,
							len = submitterPosts.length,
							parent;
						this.posts[category] = [];
						for (; i < len; i++) {
							// get the proper parent post
							parent = $(submitterPosts[i]).closest('.comment').parent().closest('.comment');
							if (!parent.length) {
								this.posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								this.posts[category].push($(parent)[0]);
							}
						}
						break;
					case 'images':
						var imagePosts = document.querySelectorAll('.expando-button.image');
						this.posts[category] = imagePosts;
						break;
					case 'videos':
						var videoPosts = document.querySelectorAll('.expando-button.video');
						this.posts[category] = videoPosts;
						break;
					case 'popular':
						var allComments = document.querySelectorAll('.noncollapsed');
						var commentsObj = Array.prototype.slice.call(allComments).map(function(comment) {
							var thisScore = comment.querySelector('.score.unvoted');
							var score;
							if (thisScore) {
								var scoreSplit = thisScore.textContent.split(' ');
								score = parseInt(scoreSplit[0], 10);
							} else {
								score = 0;
							}

							return {
								comment: comment,
								score: score
							};
						}).sort(function(a, b) {
							return b.score - a.score;
						});

						this.posts[category] = commentsObj.map(function(commentObj) {
							return commentObj.comment;
						});
						break;
					case 'new':
						this.posts[category] = document.querySelectorAll('.new-comment');
						break;
				}
			}
			this.resetNavigator(category);
		}
	},
	resetNavigator: function(category) {
		this.nav[category] = 0;
		if (this.posts[category] && this.posts[category].length) {
			modules['commentNavigator'].scrollToNavElement();
			modules['commentNavigator'].commentNavUp.disabled = false;
			modules['commentNavigator'].commentNavDown.disabled = false;
			modules['commentNavigator'].commentNavButtons.classList.remove('noNav');
		} else {
			modules['commentNavigator'].commentNavPostCount.textContent = 'none';
			modules['commentNavigator'].commentNavUp.disabled = true;
			modules['commentNavigator'].commentNavDown.disabled = true;
			modules['commentNavigator'].commentNavButtons.classList.add('noNav');
		}
	},
	moveUp: function() {
		var category = modules['commentNavigator'].currentCategory;
		if (typeof category === 'undefined') {
			modules['commentNavigator'].showNavigator();
			return;
		}

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
		if (typeof category === 'undefined') {
			modules['commentNavigator'].showNavigator();
			return;
		}

		if (modules['commentNavigator'].posts[category].length) {
			if (modules['commentNavigator'].nav[category] < modules['commentNavigator'].posts[category].length - 1) {
				modules['commentNavigator'].nav[category]++;
			} else {
				modules['commentNavigator'].nav[category] = 0;
			}
			modules['commentNavigator'].scrollToNavElement();
		}
	},
	setNavIndex: function(idx) {
		var category = modules['commentNavigator'].currentCategory;
		modules['commentNavigator'].nav[category] = idx;
		$(modules['commentNavigator'].commentNavPostCount).text(modules['commentNavigator'].nav[category] + 1 + '/' + modules['commentNavigator'].posts[category].length);
	},
	scrollToNavElement: function() {
		var category = modules['commentNavigator'].currentCategory,
			thisXY;
		this.setNavIndex(modules['commentNavigator'].nav[category]);
		thisXY = RESUtils.getXYpos(modules['commentNavigator'].posts[category][modules['commentNavigator'].nav[category]]);
		RESUtils.scrollTo(0, thisXY.y);
	}
});
