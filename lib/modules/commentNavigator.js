/* @flow */

import { once, memoize } from 'lodash-es';
import { Module } from '../core/module';
import {
	SelectedThing,
	Thing,
	addFloater,
	caseBuilder,
	downcast,
	filterMap,
	frameThrottle,
	string,
	isCurrentSubreddit,
	empty,
	watchForThings,
	waitForDescendant,
} from '../utils';
import * as Options from '../core/options';
import * as Cases from './filteReddit/cases';
import * as CommandLine from './commandLine';
import * as UserInfo from './userInfo';
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
	showOnKeyboardMove: {
		type: 'boolean',
		value: false,
		description: 'commentNavigatorShowOnKeyboardMoveDesc',
		title: 'commentNavigatorShowOnKeyboardMoveTitle',
	},
	skipReadComments: {
		type: 'boolean',
		value: false,
		description: 'commentNavigatorSkipReadCommentsDesc',
		title: 'commentNavigatorSkipReadCommentsTitle',
	},
	openOnHighlightUser: {
		type: 'boolean',
		value: true,
		description: 'commentNavigatorOpenOnHighlightUserDesc',
		title: 'commentNavigatorOpenOnHighlightUserTitle',
		advanced: true,
	},
	popularConditions: {
		type: 'text',
		value: JSON.stringify({ type: 'commentLength', op: '>', kind: 'words', val: 0 }),
		description: 'commentNavigatorPopularConditionsDesc',
		title: 'commentNavigatorPopularConditionsTitle',
		advanced: true,
	},
};
module.include = [
	'comments',
];

module.contentStart = () => {
	skipReadComments = module.options.skipReadComments.value;
	SelectedThing.addListener(selected => { readComments.add(selected); }, 'instantly');

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
		},
	);
};

const initialize = once((source: ?'keyboard') => {
	// `getPosts` is memoized. Keep up to date by reseting it when new comments loads
	watchForThings(['comment'], () => { getPosts.cache.clear(); });

	SelectedThing.addListener(updateFromSelected, 'instantly');
	if (SelectedThing.current) updateFromSelected(SelectedThing.current);

	if (source === 'keyboard' && !module.options.showOnKeyboardMove.value) commentNav().close();
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
				.map(key => `.author.id-t2_${key}`)
				.join(', ');
			return highlightedUserSelector ? document.querySelectorAll(highlightedUserSelector) : [];
		},
	},
	tagged: {
		title: 'Navigate comments made by tagged users',
		getElements: () => document.querySelectorAll('.tagline .userTagLink.hasTag'),
	},
	gilded: {
		title: 'Navigate through gilded comments',
		getElements: () => document.querySelectorAll('.gilded-icon'),
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
			return filterMap((await getPosts('comment')), thing => {
				const score = thing.getScore();
				if (typeof score === 'number') {
					return [[score, thing]];
				}
			})
				.sort((a, b) => b[0] - a[0])
				.map(([, thing]) => thing);
		},
		get conditions() { return JSON.parse(module.options.popularConditions.value); },
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
				size: (await getVisiblePosts(category)).length,
				title,
			})),
	).then(v =>
		v.filter(({ size, selected }) => selected || size),
	);
}

const getPosts = memoize(async (category: Category): Promise<Thing[]> => {
	const { getElements, getThings, conditions } = sortTypes[category];

	let things;

	if (getThings) {
		things = [...new Set(await getThings())];
	} else if (getElements) {
		things = [...new Set(Array.from(getElements()).map(e => Thing.from(e)).filter(Boolean))];
	} else {
		things = Thing.things().filter(thing => thing.isComment());
	}

	return Cases.filterThings(things, conditions);
});
const getVisiblePosts = (category: Category = currentCategory) => getPosts(category).then(v => v.filter(thing => (!skipReadComments || !readComments.has(thing)) && thing.isContentVisible()));
let lastNavigatedTo: ?Thing = null;
const readComments = new Set();
let skipReadComments;

type Category = $Keys<typeof sortTypes>;
let currentCategory: Category = isCurrentSubreddit('IAmA', 'casualiama') ? 'IAmA' : 'popular';
let isOpen = false;

const commentNav = once(() => {
	const box = string.html`
		<div id="REScommentNavBox">
			<select id="commentNavBy">
				<option selected value="${currentCategory}">${currentCategory}</option>
			</select>
			<label style="margin-top: 2px; display: flex; align-items: center;"><input id="commentNavSkipReadComments" style="margin-right: 3px;" type="checkbox" ${skipReadComments && 'checked'}>Skip read</label>
			<details id="commentNavByConditions" hidden>
				<summary>Conditions</summary>
		<div class="builderItem"></div>
			</details>
			<hr style="margin-bottom: 0">
			<div id="commentNavButtons">
				<button id="commentNavUp">&#x25B2;</button>
				<div id="commentNavPostCount"></div>
				<button id="commentNavDown">&#x25BC;</button>
			</div>
		</div>
	`;

	const skipReadCommentsEle = downcast(box.querySelector('#commentNavSkipReadComments'), HTMLInputElement);
	skipReadCommentsEle.addEventListener('change', () => {
		skipReadComments = skipReadCommentsEle.checked;
		if (SelectedThing.current) updateFromSelected(SelectedThing.current);
	});

	const select = downcast(box.querySelector('#commentNavBy'), HTMLSelectElement);

	select.addEventListener('focus', async () => {
		empty(select);
		const categories = await getCategories();
		select.append(
			...categories.map(({ category, selected, size }) => string.html`
				<option ${selected && 'selected'} value="${category}">${category}<span> (${size})</span></option>
			`),
		);
	}, true);
	select.addEventListener('keyup', ({ which }: KeyboardEvent) => { if (which === 27 /* esc */) select.blur(); });
	select.addEventListener('change', () => {
		const selectedItem = select.options.item(select.selectedIndex);
		if (selectedItem !== null) {
			setCategory(selectedItem.value);
		}
		updateBuilder();
	});

	const postCount = box.querySelector('#commentNavPostCount');
	postCount.addEventListener('click', () => moveTo(lastNavigatedTo));
	const up = downcast(box.querySelector('#commentNavUp'), HTMLButtonElement);
	up.addEventListener('click', () => move('up'));
	const down = downcast(box.querySelector('#commentNavDown'), HTMLButtonElement);
	down.addEventListener('click', () => move('down'));

	addFloater(box, { separate: true });

	const ele = box.querySelector('#commentNavByConditions');
	ele.addEventListener('click', once(() => {
		const builderCases = Cases.getByContext('comment');
		const group = Cases.resolveGroup(Cases.getGroup('any', [sortTypes[currentCategory].conditions]), true, true);
		const $builderBlock = caseBuilder.drawBuilderBlock(group, builderCases, false);
		$builderBlock.on('change input', frameThrottle(() => {
			module.options.popularConditions.value = JSON.stringify(caseBuilder.readBuilderBlock($builderBlock, builderCases));
			Options.save(module.options.popularConditions);
			setCategory(currentCategory, true);
		}));
		const wrapper = ele.querySelector('.builderItem');
		wrapper.append($builderBlock.get(0));
	}));

	const updateBuilder = () => {
		ele.hidden = currentCategory !== 'popular';
	};

	function refresh(index, length, lastNavigatedToIndex) {
		up.disabled = lastNavigatedToIndex <= 0;
		down.disabled = lastNavigatedToIndex >= length - 1;
		postCount.textContent = length ? `${lastNavigatedToIndex === index ? '' : '~'}${lastNavigatedToIndex + 1}/${length}` : 'none';
	}

	function open() { isOpen = true; box.hidden = false; }
	function close() { isOpen = false; box.hidden = true; }

	initialize();
	updateBuilder();
	isOpen = true;

	return {
		select,
		refresh,
		open,
		close,
	};
});

async function installEntryElement() {
	await (new Promise(requestAnimationFrame));

	const location = await waitForDescendant(document.body, '.commentarea .panestack-title, .menuarea');
	const commentNavToggle = string.html`<div class="res-commentNavToggle">navigate by</div>`;
	const choices = string.html`<div class="res-commentNavToggle-choices"><div>`;
	commentNavToggle.append(choices);
	location.append(commentNavToggle);

	commentNavToggle.addEventListener('mouseenter', async () => {
		empty(choices);
		const categories = await getCategories();
		choices.append(...categories.map(({ category, title, size }) => {
			const element = string.html`
				<div class="res-commentNavToggle-type" title="${title}" category="${category}">${category} (${size})</div>
			`;
			element.addEventListener('click', () => { setCategory(category); });
			return element;
		}));
	});
}

export async function updateFromSelected(selected: Thing) {
	const posts = await getVisiblePosts();

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

	getPosts.cache.delete(currentCategory);

	if (keepSelected) {
		move('refresh');
	} else {
		move('top');
	}
}

export function toggle(focus: boolean = false, open: boolean = !isOpen) {
	if (!open) {
		commentNav().close();
	} else {
		commentNav().open();
		if (focus) commentNav().select.focus();
	}
}

export async function move(change: 'up' | 'down' | 'top' | 'refresh', source: *) {
	initialize(source);

	if (!sortTypes[currentCategory].nonlinear) {
		// Return to the last navigated post if currently moved beyond it in the opposite direction
		const all = Thing.things();
		const lastNavigatedToIndex = all.indexOf(lastNavigatedTo);
		const selectedIndex = all.indexOf(SelectedThing.current);

		if (
			change === 'down' && selectedIndex < lastNavigatedToIndex ||
			change === 'up' && selectedIndex > lastNavigatedToIndex
		) {
			moveTo(lastNavigatedTo);
			return;
		}
	}

	const visible = await getVisiblePosts();

	if (change === 'top') {
		moveTo(visible[0]);
	} else {
		// Look through all posts in case the current post is not visible anymore
		const all = [...(await getPosts(currentCategory))]; // Prevent `reverse` from mutatating source
		if (change === 'up') all.reverse();
		const comment = all.slice(all.indexOf(lastNavigatedTo) + (change === 'refresh' ? 0 : 1)).find(v => visible.includes(v));
		moveTo(comment);
	}
}

function moveTo(thing: ?Thing) {
	if (!thing) return;

	lastNavigatedTo = thing;
	// Force selection to run callbacks in case `thing` is already selected
	SelectedThing.set(thing, { scrollStyle: 'top' }, true);
}
