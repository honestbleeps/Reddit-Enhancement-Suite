/* @flow */

import _ from 'lodash';
import { flow, filter, map } from 'lodash/fp';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Thing,
	downcast,
	filterMap,
	loggedInUser,
	getHeaderOffset,
	scrollToElement,
	string,
	isCurrentSubreddit,
	empty,
} from '../utils';
import * as Floater from './floater';
import * as UserInfo from './userInfo';
import * as SelectedEntry from './selectedEntry';
import * as WheelBrowse from './wheelBrowse';

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

module.go = () => {
	installEntryElement();

	if (module.options.showByDefault.value) {
		commentNav();
	}

	WheelBrowse.setCallback(wheelBrowseWidget => {
		wheelBrowseWidget.addEventListener('click', toggle);

		return direction => {
			if (direction === 'up') moveUp();
			else moveDown();
		};
	});
};

const sortTypes: {
	[string]: {|
		title: string,
		getPosts: () => Array<HTMLElement> | NodeList<*>,
		nonlinear?: boolean,
		disabled?: () => boolean,
	|},
} = {
	comment: {
		title: 'Navigate comments',
		getPosts: () => Array.from(document.querySelectorAll('.entry'))
			.filter(e => { const t = Thing.checkedFrom(e); return t.isComment() && t.isVisible(); }),
	},
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
			const parents = Array.from(submitterPosts)
				.map(post => $(post).closest('.comment').parent().closest('.comment').get(0))
				.filter(x => x);
			return _.uniq(parents);
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
				() => Thing.things(),
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
		nonlinear: true,
	},
	new: {
		title: 'Navigate through new comments (Reddit Gold users only)',
		getPosts: () => document.querySelectorAll('.new-comment'),
		disabled: () => !document.body.querySelector('.gold-accent.comment-visits-box'),
	},
	upvoted: {
		title: 'Navigate through comments you upvoted',
		getPosts: () => document.querySelectorAll('.upmod'),
	},
};

function getCategories() {
	return Object.entries(sortTypes)
		.filter(([, { disabled }]) => !disabled || !disabled())
		.map(([category, { title }]) => ({
			category,
			selected: category === currentCategory,
			size: getPosts(category).length,
			title,
		}))
		.filter(entry => entry.size);
}

const getPosts = _.memoize((category: Category) => Array.from(sortTypes[category].getPosts()).filter(e => e.offsetParent));
const currentPosts = () => getPosts(currentCategory);

type Category = $Keys<typeof sortTypes>;
let currentCategory: Category = isCurrentSubreddit('IAmA', 'casualiama') ? 'IAmA' : 'comment';
let index = 0;
let isOpen = false;

const commentNav = _.once(() => {
	const box = string.html`
		<div id="REScommentNavBox">
			<select id="commentNavBy">
				<option value="${currentCategory}">${currentCategory}</option>
			</select>
			<hr style="margin-bottom: 0">
			<div id="commentNavButtons">
				<button id="commentNavUp">&#x25B2;</button>
				<div id="commentNavPostCount"></div>
				<button id="commentNavDown">&#x25BC;</button>
			</div>
		</div>
	`;

	const select = downcast(box.querySelector('#commentNavBy'), HTMLSelectElement);

	select.addEventListener('focus', () => {
		empty(select);
		select.append(
			...getCategories().map(({ category, selected, size }) => string.html`
				<option ${selected && 'selected'} value="${category}"">${category}<span> (${size})</span></option>
			`)
		);
	}, true);
	select.addEventListener('keyup', ({ which }: KeyboardEvent) => { if (which === 27 /* esc */) select.blur(); });
	select.addEventListener('change', () => {
		setCategory((select.options.item(select.selectedIndex).value: any));
	});

	const postCount = box.querySelector('#commentNavPostCount');
	postCount.addEventListener('click', () => move(index));
	const up = downcast(box.querySelector('#commentNavUp'), HTMLButtonElement);
	up.addEventListener('click', moveUp);
	const down = downcast(box.querySelector('#commentNavDown'), HTMLButtonElement);
	down.addEventListener('click', moveDown);

	Floater.addElement(box, { separate: true });
	window.addEventListener('scroll', _.debounce(() => { if (!recentMove) refreshIndex(); }, 300));

	function refresh() {
		up.disabled = index <= 0;
		down.disabled = index >= currentPosts().length - 1;
		postCount.textContent = currentPosts().length ? `${index + 1}/${currentPosts().length}` : 'none';
	}

	function open() { isOpen = true; box.hidden = false; }
	function close() { isOpen = false; box.hidden = true; }

	isOpen = true;

	return {
		select,
		refresh,
		open,
		close,
	};
});

function installEntryElement() {
	const commentNavToggle = $('<div class="res-commentNavToggle">navigate by<div class="res-commentNavToggle-choices"><div></div>')
		.appendTo('.commentarea .panestack-title')
		.get(0);

	commentNavToggle.addEventListener('mouseenter', () => {
		const choices = commentNavToggle.querySelector('.res-commentNavToggle-choices');
		empty(choices);
		choices.append(...getCategories().map(({ category, title, size }) => {
			const element = string.html`
				<div class="res-commentNavToggle-type noCtrlF" title="${title}" category="${category}">${category} (${size})</div>
			`;
			element.addEventListener('click', () => { setCategory(category); });
			return element;
		}));
	});
}

function refreshIndex() {
	// Non-linear comment categories are not sorted by distance from top,
	// so the most matching comment cannot determined by the algorithm below
	if (sortTypes[currentCategory].nonlinear) return;

	setIndex(
		currentPosts().findIndex(post => post.getBoundingClientRect().top >= getHeaderOffset())
	);
}

export function setCategory(category: Category, keepClosest: boolean = false) {
	getPosts.cache.clear();

	currentCategory = category;
	commentNav().select.value = category;

	if (keepClosest) {
		refreshIndex();
	} else {
		move(0);
	}
}

export function toggle() {
	if (isOpen) {
		commentNav().close();
	} else {
		commentNav().open();
		commentNav().select.focus();
		refreshIndex();
	}
}

export function moveUp() { move(index - 1); }
export function moveDown() { move(index + 1); }

let recentMove = false;
const refreshMoveTimer = _.debounce(() => { recentMove = false; }, 1000);

function move(to) {
	setIndex(to);

	const element = currentPosts()[index];
	if (element) {
		scrollToElement(element, null, { scrollStyle: 'top' });
		SelectedEntry.select(Thing.checkedFrom(element));
	}

	recentMove = true;
	refreshMoveTimer();
}

function setIndex(to) {
	if (!currentPosts().length) index = 0;
	else if (to <= 0) index = 0;
	else if (to >= currentPosts().length - 1) index = currentPosts().length - 1;
	else index = to;

	commentNav().refresh();
}
