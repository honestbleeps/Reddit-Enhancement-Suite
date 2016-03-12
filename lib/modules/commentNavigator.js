addModule('commentNavigator', (module, moduleID) => {
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

	const _posts = [];
	const _nav = [];
	let commentNavBox, commentNavToggle, navSelect, commentNavPostCount, commentNavButtons, commentNavUp, commentNavDown;

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
			// const commentArea = document.body.querySelector('div.sitetable.nestedlisting');
			const commentArea = document.body.querySelector('.commentarea .menuarea');
			if (commentArea) {
				commentNavToggle = RESUtils.createElement('div', 'REScommentNavToggle');
				$(commentNavToggle).html('<span>navigate by:</span> ');
				const sortTypes = ['submitter', 'moderator', 'friend', 'me', 'admin', 'highlighted', 'gilded', 'IAmA', 'images', 'videos', 'popular', 'new'];
				for (let i = 0; i < sortTypes.length; i++) {
					const thisCategory = sortTypes[i];
					// const thisEle = document.createElement('div');
					const thisEle = RESUtils.createElement('div', `navigateBy${thisCategory}`, 'commentNavSortType noCtrlF', thisCategory);
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

					let isGold;
					if (thisCategory === 'new') {
						isGold = document.body.querySelector('.gold-accent.comment-visits-box');
						if (isGold) {
							thisEle.setAttribute('style', 'color: #9A7D2E;');
						} else {
							thisEle.classList.add('commentNavSortTypeDisabled');
						}
					}
					if (thisCategory !== 'new' || isGold) {
						thisEle.addEventListener('click', e => module.showNavigator(e.target.getAttribute('index')), false);
					}
					commentNavToggle.appendChild(thisEle);
					if (i < sortTypes.length - 1) {
						const thisDivider = document.createElement('span');
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

	let currentCategory;

	function onScroll() {
		const category = currentCategory;
		let headerOffset = 0;

		if (category) {
			// add space for header offset if pinheader is used
			if (modules['betteReddit'].options.pinHeader.value === 'sub') {
				headerOffset += $('#sr-header-area').height() + 8;
			} else if (modules['betteReddit'].options.pinHeader.value === 'subanduser') {
				headerOffset += $('#sr-header-area').height() + 8;
			} else if (modules['betteReddit'].options.pinHeader.value === 'header') {
				headerOffset += $('#header').height() + 8;
			}
			const posts = _posts[category];
			for (let i = 0; i < posts.length; i++) {
				const { y } = RESUtils.getXYpos(posts[i]);
				if (y > window.pageYOffset + headerOffset) {
					setNavIndex(Math.max(i - 1, 0));
					break;
				}
			}
		}
	}

	function changeCategory() {
		const index = navSelect.selectedIndex;
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
		const category = currentCategory;
		if ((typeof category !== 'undefined') && (category !== '')) {
			if (typeof _posts[category] === 'undefined' || category === 'highlighted') {
				switch (category) {
					case 'submitter':
					case 'moderator':
					case 'friend':
					case 'admin':
						_posts[category] = document.querySelectorAll(`.noncollapsed a.author.${category}`);
						break;
					case 'me':
						_posts[category] = document.querySelectorAll(`.noncollapsed a.author[href$="/user/${RESUtils.loggedInUser()}"]`);
						break;
					case 'highlighted':
						if (modules['userInfo'].highlightedUsers) {
							const highlightedUserSelectors = $.map(modules['userInfo'].highlightedUsers, (element, key) =>
								`.noncollapsed .author.id-t2_${key}`
							);
							const highlightedUserSelector = highlightedUserSelectors.join(', ');
							_posts[category] = highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
						} else {
							_posts[category] = [];
						}
						break;
					case 'gilded':
						const gildedPosts = document.querySelectorAll('.noncollapsed .gilded-icon');
						_posts[category] = gildedPosts;
						break;
					case 'IAmA':
						const submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
						_posts[category] = [];
						for (let i = 0; i < submitterPosts.length; i++) {
							// get the proper parent post
							const parent = $(submitterPosts[i]).closest('.comment').parent().closest('.comment');
							if (!parent.length) {
								_posts[category].push(submitterPosts[i].parentNode.parentNode);
							} else {
								_posts[category].push($(parent)[0]);
							}
						}
						break;
					case 'images':
						const imagePosts = document.querySelectorAll('.expando-button.image');
						_posts[category] = imagePosts;
						break;
					case 'videos':
						const videoPosts = document.querySelectorAll('.expando-button.video');
						_posts[category] = videoPosts;
						break;
					case 'popular':
						const allComments = document.querySelectorAll('.noncollapsed');
						const commentsObj = Array.from(allComments)
							.map(comment => {
								const thisScore = comment.querySelector('.score.unvoted');
								let score = 0;
								if (thisScore) {
									const scoreSplit = thisScore.textContent.split(' ');
									score = parseInt(scoreSplit[0], 10);
								}

								return {
									comment,
									score
								};
							})
							.sort((a, b) => b.score - a.score);

						_posts[category] = commentsObj.map(commentObj => commentObj.comment);
						break;
					case 'new':
						_posts[category] = document.querySelectorAll('.new-comment');
						break;
					default:
						throw new Error(`Invalid nav category: ${category}`);
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
		const category = currentCategory;
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
		const category = currentCategory;
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
		const category = currentCategory;
		_nav[category] = idx;
		$(commentNavPostCount).text(`${_nav[category] + 1}/${_posts[category].length}`);
	}

	function scrollToNavElement() {
		const category = currentCategory;
		setNavIndex(_nav[category]);
		const { y } = RESUtils.getXYpos(_posts[category][_nav[category]]);
		RESUtils.scrollTo(0, y);
	}
});
