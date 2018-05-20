/* @flow */

import _ from 'lodash';
import { flow, map } from 'lodash/fp';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Thing,
	downcast,
	filterMap,
	string,
	isCurrentSubreddit,
	empty,
	watchForThings,
} from '../utils';
import * as Cases from './filteReddit/cases';
import * as CommandLine from './commandLine';
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
		wheelBrowseWidget.addEventListener('click', () => { toggle(); });

		return direction => {
			if (direction === 'up') move('up');
			else move('down');
		};
	});

	const getMatchingCategory = async val => val && (await getCategories()).find(({ category }) => category.startsWith(val));
	CommandLine.registerCommand('nav', 'nav [sortType] - open the comment navigator',
		async (command, val) => {
			const { category: matchingCategory = '' } = await getMatchingCategory(val) || {};
			return `navigate comments by [(${(await getCategories()).map(({ category }) => matchingCategory === category ? `<b>${category}</b>` : category).join('|')})]`;
		},
		async (command, val) => {
			const { category: matchingCategory = '' } = await getMatchingCategory(val) || {};
			if (matchingCategory) setCategory(matchingCategory);
			toggle(false, true);
		}
	);
};

const initialize = _.once(() => {
	// `getPosts` is memoized. Keep up to date by reseting it when new comments loads
	watchForThings(['comment'], () => { _memoized.cache.clear(); });

	SelectedEntry.addListener(updateFromSelected, 'beforePaint');
	updateFromSelected();
});

const sortTypes: {
	[string]: {|
		title: string,
		getElements?: () => Array<HTMLElement> | NodeList<*>,
		getThings?: () => Promise<Array<Thing>>,
		conditions?: *, // Used in conjunction with filteReddit
		nonlinear?: boolean,
		disabled?: () => boolean,
	|},
} = {
	custom: {
		title: 'Navigate custom category',
		conditions: { type: 'false' }, // Must be updated by `updateCustomCategory`
	},
	comment: {
		title: 'Navigate comments',
		conditions: { type: 'true' },
	},
	submitter: {
		title: 'Navigate comments made by the post submitter',
		conditions: { type: 'userAttr', attr: 'submitter' },
	},
	moderator: {
		title: 'Navigate comments made by moderators',
		conditions: { type: 'userAttr', attr: 'moderator' },
	},
	friend: {
		title: 'Navigate comments made by users on your friends list',
		conditions: { type: 'userAttr', attr: 'friend' },
	},
	me: {
		title: 'Navigate comments made by you',
		conditions: { type: 'userAttr', attr: 'me' },
	},
	admin: {
		title: 'Navigate comments made by reddit admins',
		conditions: { type: 'userAttr', attr: 'admin' },
	},
	highlighted: {
		title: 'Navigate comments made by highlighted user',
		getElements() {
			const highlightedUserSelector = Object.keys(UserInfo.highlightedUsers)
				.map(key => `.noncollapsed .author.id-t2_${key}`)
				.join(', ');
			return highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
		},
	},
	tagged: {
		title: 'Navigate comments made by tagged users',
		getElements: () => document.querySelectorAll('.noncollapsed .tagline .userTagLink.hasTag'),
	},
	gilded: {
		title: 'Navigate through gilded comments',
		getElements: () => document.querySelectorAll('.noncollapsed .gilded-icon'),
	},
	IAmA: {
		title: 'Navigate through questions that have been answered by the submitter (most useful in /r/IAmA)',
		getThings: async () => filterMap(await getPosts('submitter'), thing => thing.parent ? [thing.parent] : undefined),
	},
	images: {
		title: 'Navigate through comments with images',
		conditions: { type: 'hasExpando', types: ['image'] },
	},
	videos: {
		title: 'Navigate through comments with videos',
		conditions: { type: 'hasExpando', types: ['video'] },
	},
	popular: {
		title: 'Navigate through comments in order of highest vote total',
		async getThings() {
			return flow(
				filterMap(thing => {
					const score = thing.getScore();
					if (typeof score === 'number') {
						return [[score, thing]];
					}
				}),
				arr => arr.sort((a, b) => b[0] - a[0]),
				map(([, thing]) => thing),
			)(await getPosts('comment'));
		},
		nonlinear: true,
	},
	new: {
		title: 'Navigate through new comments (Reddit Gold users only)',
		getElements: () => document.querySelectorAll('.new-comment'),
		disabled: () => !document.body.querySelector('.gold-accent.comment-visits-box'),
	},
	upvoted: {
		title: 'Navigate through comments you upvoted',
		conditions: { type: 'voteType', kind: 'upvote' },
	},
};

export function updateCustomConditions(conditions: *) {
	sortTypes.custom.conditions = conditions;
}

function getCategories() {
	return Promise.all(
		Object.entries(sortTypes)
			.filter(([, { disabled }]) => !disabled || !disabled())
			.map(async ([category, { title }]) => ({
				category,
				selected: category === currentCategory,
				size: (await getPosts(category)).length,
				title,
			}))
	).then(v =>
		v.filter(({ size, selected }) => selected || size)
	);
}

const _memoized = _.memoize(async (category: Category): Promise<Thing[]> => {
	const { getElements, getThings, conditions } = sortTypes[category];

	let things = [];

	if (getThings) {
		things = _.uniq(await getThings());
	} else if (getElements) {
		things = _.uniq(Array.from(getElements()).map(e => Thing.checkedFrom(e)));
	} else {
		things = Thing.things().filter(thing => thing.isComment());
	}

	return Cases.filterThings(things, conditions);
});
const getPosts = (category: Category) => _memoized(category).then(v =>
	v.filter(thing => thing.isContentVisible())
);
const currentPosts = () => getPosts(currentCategory);
let lastNavigatedTo: ?Thing = null;

type Category = $Keys<typeof sortTypes>;
let currentCategory: Category = isCurrentSubreddit('IAmA', 'casualiama') ? 'IAmA' : 'popular';
let isOpen = false;

const commentNav = _.once(() => {
	const box = string.html`
		<div id="REScommentNavBox">
			<select id="commentNavBy">
				<option selected value="${currentCategory}">${currentCategory}</option>
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

	select.addEventListener('focus', async () => {
		empty(select);
		const categories = await getCategories();
		select.append(
			...categories.map(({ category, selected, size }) => string.html`
				<option ${selected && 'selected'} value="${category}">${category}<span> (${size})</span></option>
			`)
		);
	}, true);
	select.addEventListener('keyup', ({ which }: KeyboardEvent) => { if (which === 27 /* esc */) select.blur(); });
	select.addEventListener('change', () => {
		setCategory((select.options.item(select.selectedIndex).value: any));
	});

	const postCount = box.querySelector('#commentNavPostCount');
	postCount.addEventListener('click', () => moveTo(lastNavigatedTo));
	const up = downcast(box.querySelector('#commentNavUp'), HTMLButtonElement);
	up.addEventListener('click', () => move('up'));
	const down = downcast(box.querySelector('#commentNavDown'), HTMLButtonElement);
	down.addEventListener('click', () => move('down'));

	Floater.addElement(box, { separate: true });

	function refresh(index, length, lastNavigatedToIndex) {
		up.disabled = lastNavigatedToIndex <= 0;
		down.disabled = lastNavigatedToIndex >= length - 1;
		postCount.textContent = length ? `${lastNavigatedToIndex === index ? '' : '~'}${lastNavigatedToIndex + 1}/${length}` : 'none';
	}

	function open() { isOpen = true; box.hidden = false; }
	function close() { isOpen = false; box.hidden = true; }

	initialize();
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

	commentNavToggle.addEventListener('mouseenter', async () => {
		const choices = commentNavToggle.querySelector('.res-commentNavToggle-choices');
		empty(choices);
		const categories = await getCategories();
		choices.append(...categories.map(({ category, title, size }) => {
			const element = string.html`
				<div class="res-commentNavToggle-type noCtrlF" title="${title}" category="${category}">${category} (${size})</div>
			`;
			element.addEventListener('click', () => { setCategory(category); });
			return element;
		}));
	});
}

export async function updateFromSelected(selected = SelectedEntry.selectedThing) {
	const posts = await currentPosts();

	if (
		posts.includes(selected) &&
		(
			// Non-linear comment categories are not sorted by distance from top,
			// so do not disturb the selection by automatically updating
			!sortTypes[currentCategory].nonlinear ||
			// But allow change if `selected` is adjecent to `lastNavigatedTo`
			Math.abs(posts.indexOf(lastNavigatedTo) - posts.indexOf(selected)) <= 1
		)
	) {
		lastNavigatedTo = selected;
	}

	commentNav().refresh(posts.indexOf(selected), posts.length, posts.indexOf(lastNavigatedTo));
}

export function setCategory(category: Category, keepSelected: boolean = false) {
	currentCategory = category;
	lastNavigatedTo = null;

	commentNav().select.value = category;

	_memoized.cache.delete(currentCategory);

	if (!keepSelected) move('top');
}

export function toggle(focus: boolean = false, open: boolean = !isOpen) {
	if (!open) {
		commentNav().close();
	} else {
		commentNav().open();
		if (focus) commentNav().select.focus();
	}
}

export async function move(change: 'up' | 'down' | 'top') {
	initialize();

	if (!sortTypes[currentCategory].nonlinear) {
		const all = Thing.things();
		const lastNavigatedToIndex = all.indexOf(lastNavigatedTo);
		const selectedIndex = all.indexOf(SelectedEntry.selectedThing);

		if (
			// Return to the last navigated to post if currently moved it beyond in the opposite direction
			change === 'down' && selectedIndex < lastNavigatedToIndex ||
			change === 'up' && selectedIndex > lastNavigatedToIndex
		) {
			moveTo(lastNavigatedTo);
			return;
		}
	}

	const posts = await currentPosts();
	if (change === 'top') moveTo(posts[0]);
	else if (change === 'down') moveTo(posts[posts.indexOf(lastNavigatedTo) + 1]);
	else if (change === 'up') moveTo(posts[posts.indexOf(lastNavigatedTo) - 1]);
}

function moveTo(thing: ?Thing) {
	if (!thing) return;

	lastNavigatedTo = thing;
	// Force selection to run callbacks in case `thing` is already selected
	SelectedEntry.select(thing, { scrollStyle: 'top' }, true);
}
