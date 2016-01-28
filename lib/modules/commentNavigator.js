addModule('commentNavigator', function(module, moduleID) {
	module.moduleName = 'Comment Navigator';
	module.category = 'Comments';
	module.description = 'Provides a comment navigation tool to easily find comments by OP, mod, etc.';
	module.options = {
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
	};
	module.include = [
		'comments'
	];

	var _posts = [];
	var _nav = [];
	var commentNavBox, commentNavToggle, navSelect, commentNavPostCount, commentNavButtons, commentNavUp, commentNavDown;

	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;
		// draw the commentNav box
		commentNavBox = RESUtils.createElement('div', 'REScommentNavBox');
		commentNavBox.classList.add('RESDialogSmall');

		const template = await RESTemplates.load('commentNavigator');
		$(commentNavBox).html(template.html());

		navSelect = commentNavBox.querySelector('#commentNavBy');
		commentNavPostCount = commentNavBox.querySelector('#commentNavPostCount');
		commentNavButtons = commentNavBox.querySelector('#commentNavButtons');
		commentNavBox.querySelector('#commentNavCloseButton').addEventListener('click', () => module.hideNavigator(), false);
		commentNavUp = commentNavBox.querySelector('#commentNavUp');
		commentNavUp.addEventListener('click', module.moveUp, false);
		commentNavDown = commentNavBox.querySelector('#commentNavDown');
		commentNavDown.addEventListener('click', module.moveDown, false);
		navSelect.addEventListener('change', changeCategory, false);
	};

	module.go = function() {
		if (this.isEnabled() && this.isMatchURL()) {
			// var commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			var commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				commentNavToggle = RESUtils.createElement('div', 'REScommentNavToggle');
				$(commentNavToggle).html('<span>navigate by:</span> ');
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
							module.showNavigator(e.target.getAttribute('index'));
						}, false);
					}
					commentNavToggle.appendChild(thisEle);
					if (i < len - 1) {
						var thisDivider = document.createElement('span');
						thisDivider.textContent = ' | ';
						commentNavToggle.appendChild(thisDivider);
					}
				}

				commentArea.appendChild(commentNavToggle, commentArea.firstChild);
				if (!(this.options.showByDefault.value)) {
					module.hideNavigator();
				}

				modules['floater'].addElement(commentNavBox, { separate: true });
				window.addEventListener('scroll', RESUtils.debounce(onScroll, 300));
			}
		}
	};

	var currentCategory;

	function onScroll() {
		var category = currentCategory,
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
			posts = _posts[category];
			len = posts.length;
			for (; i < len; i++) {
				thisXY = RESUtils.getXYpos(posts[i]);
				if (thisXY.y > window.pageYOffset + headerOffset) {
					setNavIndex(Math.max(i-1, 0));
					break;
				}
			}
		}
	}

	function changeCategory() {
		var index = navSelect.selectedIndex;
		if (index === -1) {
			return;
		}
		currentCategory = navSelect.options[index].value;
		if (currentCategory !== '') {
			module.getPostsByCategory();
			commentNavButtons.style.display = 'block';
		} else {
			commentNavButtons.style.display = 'none';
		}
		$('#commentNavBy').blur();
	}

	module.showNavigator = function(category) {
		module.isOpen = true;
		modules['styleTweaks'].setSRStyleToggleVisibility(false, 'commentNavigator');
		commentNavBox.style.display = 'block';
		if (typeof category === 'undefined') {
			category = currentCategory;
		}

		if (isNaN(category)) {
			navSelect.value = category;
		} else if (typeof category === 'number') {
			navSelect.selectedIndex = category;
		} else if (!isNaN(parseInt(category, 10))) {
			navSelect.selectedIndex = parseInt(category, 10);
		}
		$('#commentNavBy').focus();
		changeCategory();
	};

	module.hideNavigator = function() {
		module.isOpen = false;
		commentNavBox.style.display = 'none';
		modules['styleTweaks'].setSRStyleToggleVisibility(true, 'commentNavigator');
	};

	module.getPostsByCategory = function() {
		var category = currentCategory;
		if ((typeof category !== 'undefined') && (category !== '')) {
			if (typeof _posts[category] === 'undefined' || category === 'highlighted') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						_posts[category] = document.querySelectorAll('.noncollapsed a.author.' + category);
						break;
					case 'me':
						_posts[category] = document.querySelectorAll(`.noncollapsed a.author[href$="/user/${RESUtils.loggedInUser()}"]`);
						break;
					case 'highlighted':
						if (modules['userInfo'].highlightedUsers) {
							var highlightedUserSelectors = $.map(modules['userInfo'].highlightedUsers, function(element, key) {
								return '.noncollapsed .author.id-t2_'+key;
							});
							var highlightedUserSelector = highlightedUserSelectors.join(', ');
							_posts[category] = highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
						} else {
							_posts[category] = [];
						}
						break;
					case 'gilded':
						var gildedPosts = document.querySelectorAll('.noncollapsed .gilded-icon');
						_posts[category] = gildedPosts;
						break;
					case 'IAmA':
						var submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter'),
							i = 0,
							len = submitterPosts.length,
							parent;
						_posts[category] = [];
						for (; i < len; i++) {
							// get the proper parent post
							parent = $(submitterPosts[i]).closest('.comment').parent().closest('.comment');
							if (!parent.length) {
								_posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								_posts[category].push($(parent)[0]);
							}
						}
						break;
					case 'images':
						var imagePosts = document.querySelectorAll('.expando-button.image');
						_posts[category] = imagePosts;
						break;
					case 'videos':
						var videoPosts = document.querySelectorAll('.expando-button.video');
						_posts[category] = videoPosts;
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

						_posts[category] = commentsObj.map(function(commentObj) {
							return commentObj.comment;
						});
						break;
					case 'new':
						_posts[category] = document.querySelectorAll('.new-comment');
						break;
				}
			}
			resetNavigator(category);
		}
	};

	function resetNavigator(category) {
		_nav[category] = 0;
		if (_posts[category] && _posts[category].length) {
			scrollToNavElement();
			commentNavUp.disabled = false;
			commentNavDown.disabled = false;
			commentNavButtons.classList.remove('noNav');
		} else {
			commentNavPostCount.textContent = 'none';
			commentNavUp.disabled = true;
			commentNavDown.disabled = true;
			commentNavButtons.classList.add('noNav');
		}
	}

	module.moveUp = function() {
		var category = currentCategory;
		if (typeof category === 'undefined') {
			module.showNavigator();
			return;
		}

		if (_posts[category].length) {
			if (_nav[category] > 0) {
				_nav[category]--;
			} else {
				_nav[category] = _posts[category].length - 1;
			}
			scrollToNavElement();
		}
	};

	module.moveDown = function() {
		var category = currentCategory;
		if (typeof category === 'undefined') {
			module.showNavigator();
			return;
		}

		if (_posts[category].length) {
			if (_nav[category] < _posts[category].length - 1) {
				_nav[category]++;
			} else {
				_nav[category] = 0;
			}
			scrollToNavElement();
		}
	};

	function setNavIndex(idx) {
		var category = currentCategory;
		_nav[category] = idx;
		$(commentNavPostCount).text(_nav[category] + 1 + '/' + _posts[category].length);
	}

	function scrollToNavElement() {
		var category = currentCategory,
			thisXY;
		setNavIndex(_nav[category]);
		thisXY = RESUtils.getXYpos(_posts[category][_nav[category]]);
		RESUtils.scrollTo(0, thisXY.y);
	}
});
