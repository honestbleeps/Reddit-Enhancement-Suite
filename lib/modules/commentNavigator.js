/* @flow */

import _ from 'lodash';
import { flow, filter, map } from 'lodash/fp';
import commentNavigatorTemplate from '../templates/commentNavigator.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Thing,
	downcast,
	filterMap,
	loggedInUser,
	getHeaderOffset,
	scrollToElement,
	waitForEvent,
} from '../utils';
import * as Floater from './floater';
import * as UserInfo from './userInfo';

export const module: Module<*> = new Module('commentNavigator');

module.moduleName = 'commentNavName';
module.category = 'commentsCategory';
module.description = 'commentNavDesc';
module.options = {
	showByDefault: {
		type: 'boolean',
		value: false,
		description: 'commentNavigatorShowByDefaultDesc',
		title: 'commentNavigatorShowByDefaultTitle',
	},
	openOnHighlightUser: {
		type: 'boolean',
		value: true,
		description: 'commentNavigatorOpenOnHighlightUserDesc',
		title: 'commentNavigatorOpenOnHighlightUserTitle',
		advanced: true,
	},
};
module.include = [
	'comments',
];

const _posts = {};
const _nav = {};

const commentNav = _.once(() => {
	// draw the commentNav box
	const box = $('<div>', {
		id: 'REScommentNavBox',
		class: 'RESDialogSmall',
		html: commentNavigatorTemplate(),
	})[0];

	const select = downcast(box.querySelector('#commentNavBy'), HTMLSelectElement);
	const postCount = box.querySelector('#commentNavPostCount');
	const buttons = box.querySelector('#commentNavButtons');
	box.querySelector('#commentNavCloseButton').addEventListener('click', () => hideNavigator());
	const up = downcast(box.querySelector('#commentNavUp'), HTMLButtonElement);
	up.addEventListener('click', moveUp);
	const down = downcast(box.querySelector('#commentNavDown'), HTMLButtonElement);
	down.addEventListener('click', moveDown);
	select.addEventListener('change', changeCategory);

	Floater.addElement(box, { separate: true });
	window.addEventListener('scroll', _.debounce(onScroll, 300));

	return {
		box,
		select,
		postCount,
		buttons,
		down,
		up,
	};
});

const sortTypes = {
	submitter: {
		title: 'Navigate comments made by the post submitter',
		getPosts: () => document.querySelectorAll('.noncollapsed a.author.submitter'),
	},
	moderator: {
		title: 'Navigate comments made by moderators',
		getPosts: () => document.querySelectorAll('.noncollapsed a.author.moderator'),
	},
	friend: {
		title: 'Navigate comments made by users on your friends list',
		getPosts: () => document.querySelectorAll('.noncollapsed a.author.friend'),
	},
	me: {
		title: 'Navigate comments made by you',
		getPosts: () => {
			const loggedIn = loggedInUser();
			return loggedIn ? document.querySelectorAll(`.noncollapsed a.author[href$="/user/${loggedIn}"]`) : [];
		},
	},
	admin: {
		title: 'Navigate comments made by reddit admins',
		getPosts: () => document.querySelectorAll('.noncollapsed a.author.admin'),
	},
	highlighted: {
		title: 'Navigate comments made by highlighted user',
		getPosts() {
			const highlightedUserSelector = Object.keys(UserInfo.highlightedUsers)
				.map(key => `.noncollapsed .author.id-t2_${key}`)
				.join(', ');
			return highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
		},
	},
	tagged: {
		title: 'Navigate comments made by tagged users',
		getPosts: () => document.querySelectorAll('.noncollapsed .tagline .userTagLink.hasTag'),
	},
	gilded: {
		title: 'Navigate through gilded comments',
		getPosts: () => document.querySelectorAll('.noncollapsed .gilded-icon'),
	},
	IAmA: {
		title: 'Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)',
		getPosts() {
			const submitterPosts = document.querySelectorAll('.noncollapsed a.author.submitter');
			return Array.from(submitterPosts)
				.map(post => $(post).closest('.comment').parent().closest('.comment').get(0))
				.filter(x => x);
		},
	},
	images: {
		title: 'Navigate through comments with images',
		getPosts: () => document.querySelectorAll('.expando-button.image'),
	},
	videos: {
		title: 'Navigate through comments with videos',
		getPosts: () => document.querySelectorAll('.expando-button.video'),
	},
	popular: {
		title: 'Navigate through comments in order of highest vote total',
		getPosts() {
			return flow(
				() => Thing.visibleThings(),
				filter(thing => thing.isComment()),
				filterMap(thing => {
					const score = thing.getScore();
					if (typeof score === 'number') {
						return [[score, thing]];
					}
				}),
				arr => arr.sort((a, b) => b[0] - a[0]),
				map(([, thing]) => thing.element)
			)();
		},
	},
	new: {
		title: 'Navigate through new comments (Reddit Gold users only)',
		getPosts: () => document.querySelectorAll('.new-comment'),
	},
};

module.go = () => {
	const commentNavToggle = $('<div class="res-commentNavToggle">navigate by<div class="res-commentNavToggle-choices"><div></div>')
		.appendTo('.commentarea .panestack-title')
		.get(0);
	const choices = commentNavToggle.querySelector('.res-commentNavToggle-choices');

	waitForEvent(commentNavToggle, 'mouseover').then(() => {
		Object.entries(sortTypes).forEach(([category, { title }], i) => {
			const thisEle = $('<div>', {
				id: `navigateBy${category}`,
				class: 'res-commentNavToggle-type noCtrlF',
				text: category,
				title,
				attr: { index: i + 1 },
			}).get(0);

			let isGold;
			if (category === 'new') {
				isGold = document.body.querySelector('.gold-accent.comment-visits-box');
				if (isGold) {
					thisEle.setAttribute('style', 'color: #9A7D2E;');
				} else {
					thisEle.classList.add('res-commentNavToggle-type-disabled');
				}
			}
			if (category !== 'new' || isGold) {
				thisEle.addEventListener('click', () => { showNavigator(category); });
			}
			choices.appendChild(thisEle);
		});
	});

	if (module.options.showByDefault.value) {
		commentNav();
	}
};

let currentCategory = '';

function onScroll() {
	const category = currentCategory;
	if (category) {
		const posts = _posts[category];
		const inx = Array.from(posts).findIndex(post => {
			const fromViewportTop = post.getBoundingClientRect().top - getHeaderOffset();
			return post.offsetParent && fromViewportTop >= 0;
		});
		if (inx >= 0) setNavIndex(inx);
	}
}

function changeCategory() {
	const index = commentNav().select.selectedIndex;
	if (index === -1) {
		return;
	}
	currentCategory = (commentNav().select.options.item(index).value: any);
	if (currentCategory !== '') {
		getPostsByCategory();
		commentNav().buttons.style.display = 'block';
	} else {
		commentNav().buttons.style.display = 'none';
	}
	$('#commentNavBy').blur();
}

let isOpen = false;

export function showNavigator(category: $Keys<typeof sortTypes> | '' = currentCategory) {
	isOpen = true;
	commentNav().box.style.display = 'block';

	if (isNaN(category)) {
		commentNav().select.value = category;
	} else if (typeof category === 'number') {
		commentNav().select.selectedIndex = category;
	} else if (!isNaN(parseInt(category, 10))) {
		commentNav().select.selectedIndex = parseInt(category, 10);
	}
	$('#commentNavBy').focus();
	changeCategory();
}

export function hideNavigator() {
	isOpen = false;
	commentNav().box.style.display = 'none';
}

export function toggleNavigator() {
	if (isOpen) {
		hideNavigator();
	} else {
		showNavigator();
	}
}

export function getPostsByCategory() {
	if (currentCategory) {
		if (!_posts[currentCategory] || currentCategory === 'highlighted') {
			_posts[currentCategory] = sortTypes[currentCategory].getPosts();
		}
		resetNavigator(currentCategory);
	}
}

function resetNavigator(category) {
	_nav[category] = 0;
	if (_posts[category] && _posts[category].length) {
		scrollToNavElement();
		commentNav().up.disabled = false;
		commentNav().down.disabled = false;
		commentNav().buttons.classList.remove('noNav');
	} else {
		commentNav().postCount.textContent = 'none';
		commentNav().up.disabled = true;
		commentNav().down.disabled = true;
		commentNav().buttons.classList.add('noNav');
	}
}

export function moveUp() {
	const category = currentCategory;
	if (!category) {
		showNavigator();
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
}

export function moveDown() {
	const category = currentCategory;
	if (!category) {
		showNavigator();
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
}

function setNavIndex(idx) {
	const category = currentCategory;
	_nav[category] = idx;
	$(commentNav().postCount).text(`${_nav[category] + 1}/${_posts[category].length}`);
}

function scrollToNavElement() {
	const category = currentCategory;
	setNavIndex(_nav[category]);
	scrollToElement(_posts[category][_nav[category]], { scrollStyle: 'top' });
}
