/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import {
	Alert,
	CreateElement,
	Thing,
	batch,
	click,
	downcast,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	string,
	watchForElements,
} from '../utils';
import { Storage, openNewTabs, i18n } from '../environment';
import * as CommandLine from './commandLine';
import * as Dashboard from './dashboard';
import * as Hover from './hover';
import * as NightMode from './nightMode';
import * as Notifications from './notifications';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('userTagger');

module.moduleName = 'userTaggerName';
module.category = 'usersCategory';
module.description = 'userTaggerDesc';
module.options = {
	showTaggingIcon: {
		title: 'userTaggerShowTaggingIconTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerShowTaggingIconDesc',
	},
	hardIgnore: {
		title: 'userTaggerHardIgnoreTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerHardIgnoreDesc',
	},
	showIgnored: {
		title: 'userTaggerShowIgnoredTitle',
		dependsOn: options => !options.hardIgnore.value,
		type: 'boolean',
		value: true,
		description: 'userTaggerShowIgnoredDesc',
	},
	storeSourceLink: {
		title: 'userTaggerStoreSourceLinkTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerStoreSourceLinkDesc',
		advanced: true,
	},
	useCommentsLinkAsSource: {
		title: 'userTaggerUseCommentsLinkAsSourceTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerUseCommentsLinkAsSourceDesc',
		advanced: true,
	},
	trackVoteWeight: {
		title: 'userTaggerTrackVoteWeightTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerTrackVoteWeightDesc',
		advanced: true,
	},
	vwNumber: {
		title: 'userTaggerVwNumberTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerVWNumberDesc',
		advanced: true,
		dependsOn: options => options.trackVoteWeight.value,
	},
	truncateTag: {
		title: 'userTaggerTruncateTagTitle',
		type: 'boolean',
		value: true,
		description: 'userTaggerTruncateTagDesc',
		advanced: true,
	},
};

export const usernameRE = /(?:u|user)\/([\w\-]+)/;

export const tagStorage = Storage.wrapPrefix('tag.', () => (({}: any): {|
	text?: string,
	link?: string,
	color?: string,
	ignore?: boolean,
	votesDown?: number,
	votesUp?: number,
|}), user => user.toLowerCase());

const getTagBatched = batch(async users => {
	const tags = await tagStorage.getMultipleNullable(users);
	return users.map(user => tags[user.toLowerCase()]);
}, { size: Infinity, delay: 0 });

module.beforeLoad = () => {
	watchForElements(['siteTable', 'newComments'], usernameSelector, applyToUser);
};

module.go = () => {
	// If we're on the dashboard, add a tab to it...
	if (isCurrentSubreddit('dashboard')) {
		addDashboardFunctionality();
	}

	if (module.options.trackVoteWeight.value && loggedInUser()) {
		attachVoteHandler();
	}

	registerCommandLine();
};

export const usernameSelector = '.contents .author, .noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a, div.wiki-page-content .author';

export async function applyToUser(element: *, {
	renderTaggingIcon = module.options.showTaggingIcon.value,
	renderVoteWeight = module.options.trackVoteWeight.value,
}: {|
	renderTaggingIcon?: boolean,
	renderVoteWeight?: boolean,
|} = {}) {
	const username = getUsername(element);

	// Get tags immediately so that it can be rendered at once without having to wait for storage
	// since in most cases there's no applied tag
	const tag = Tag.getUnfilled(username);
	tag.add(element, { renderVoteWeight, renderTaggingIcon });
	await tag.fill();

	if (tag.ignored && element.classList.contains('author') && !isPageType('profile')) {
		const thing = Thing.from(element);
		if (thing) ignore(thing);
	}
}

function getUsername(element: HTMLAnchorElement): string {
	if (element.href) {
		const test = element.href.match(usernameRE);
		if (test) {
			return test[1];
		} else {
			throw new Error(`Regex failed on ${element.href}`);
		}
	} else {
		return element.getAttribute('data-user') || element.innerText || '';
	}
}

export const tags: Map<string, Tag> = new Map();

export class Tag {
	static defaultTagElement = (e => () => e().cloneNode(true))(_.once(() => Tag.buildTagElement()));
	static buildTagElement({ text, color }: { text: ?string, color: ?string } = {}) {
		return string.html`
			<span class="RESUserTag">
				<a
					class="userTagLink ${(text || color) ? 'hasTag' : 'RESUserTagImage'} ${module.options.truncateTag.value ? 'truncateTag' : ''}"
					${color && string._html`style="background-color: ${color}; color: ${bgToTextColorMap[color]} !important;"`}
					title="${text || 'set a tag'}"
					href="javascript:void 0"
				>${text}</a>
			</span>
		`;
	}

	static async getStored(): Promise<Array<Tag>> {
		return Object.entries(await tagStorage.getAll())
			.map(([k, v]) => {
				const tag = Tag.getUnfilled(k);
				tag.load(v);
				return tag;
			});
	}

	static getUnfilled(id: string): Tag {
		let tag = tags.get(id);
		if (!tag) {
			tag = new Tag(id);
			tags.set(id, tag);
		}

		return tag;
	}

	static async get(id: string): Promise<Tag> {
		const tag = Tag.getUnfilled(id);
		await tag.fill();
		return tag;
	}

	id: string;
	text: ?string = null;
	link: ?string = null;
	color: ?string = null;
	ignored: boolean = false;
	votesUp: number = 0;
	votesDown: number = 0;

	instances: Array<{
		element: HTMLElement,
		tagger?: HTMLElement,
		vw?: HTMLElement,
		renderTaggingIcon: boolean,
		renderVoteWeight: boolean,
	}> = [];

	constructor(id: $PropertyType<this, 'id'> = '~dummy') {
		this.id = id;
	}

	fill = _.once(async () => {
		const data = await getTagBatched(this.id);
		if (data) this.load(data);
	});

	load(data: *) {
		if (data.color !== undefined) this.color = data.color;
		if (data.ignored !== undefined) this.ignored = data.ignored;
		if (data.link !== undefined) this.link = data.link;
		if (data.text !== undefined) this.text = data.text;
		if (data.votesDown !== undefined) this.votesDown = data.votesDown;
		if (data.votesUp !== undefined) this.votesUp = data.votesUp;

		for (const instance of this.instances) this.render(instance);
	}

	extract() {
		return {
			color: this.color,
			ignored: this.ignored,
			link: this.link,
			text: this.text,
			votesDown: this.votesDown,
			votesUp: this.votesUp,
		};
	}

	save() {
		const base = (new Tag()).extract();
		const data = this.extract();
		tagStorage.set(this.id, _.pickBy(data, (v, k) => base[k] !== v));
	}

	add(element: HTMLAnchorElement, { renderTaggingIcon = false, renderVoteWeight = false }: {| renderTaggingIcon?: boolean, renderVoteWeight?: boolean |} = {}) {
		// Don't add widgets for self
		if (this.id === loggedInUser()) return;

		const instance = { element, renderTaggingIcon, renderVoteWeight };
		this.instances.push(instance);
		this.render(instance);
	}

	get votes(): number {
		return this.votesUp - this.votesDown;
	}

	ignore({ showNotice = true }: { showNotice: boolean } = {}) {
		if (showNotice) {
			Notifications.showNotification({
				moduleID: module.moduleID,
				notificationID: 'addedToIgnoreList',
				message: `
					<p>Now ignoring content posted by ${this.id}.</p>
					${isPageType('inbox') ? `
						<p>If you wish to block ${this.id} from sending you messages, go to <a href="/message/messages/">your messages</a> and click 'block user' underneath their last message.</p>
						<p><a href="https://www.reddit.com/r/changelog/comments/ijfps/reddit_change_users_may_block_other_users_that/">About blocking users</a>.</p>
					` : ''}
				`,
				closeDelay: 5000,
			});
		}

		this.ignored = true;
		if (!this.text) this.text = 'ignored';
		this.save();
	}

	unignore() {
		this.ignored = false;
		if (this.text === 'ignored') this.text = null;
		this.save();
	}

	openPrompt(instance: *) {
		if (this.link === null && module.options.storeSourceLink.value) {
			// since we haven't yet set a tag or a link for this user, auto populate a link for the
			// user based on where we are tagging from.
			this.link = getLinkBasedOnTagLocation(instance.element);
		}

		Hover.infocard('userTagger')
			.target(instance.tagger || instance.element)
			.options({ openDelay: 0, width: 350 })
			.populateWith(card => populateDialog(this, card))
			.begin();
	}

	render(instance: *) {
		if (instance.vw) instance.vw.remove();
		if (instance.renderVoteWeight && (this.votesUp || this.votesDown)) {
			instance.vw = string.html`
				<a
					class="voteWeight"
					href="javascript:void 0"
					title="${i18n('userTaggerYourVotesFor', this.id, `+${this.votesUp} -${this.votesDown}`)}"
					style="${getVoteWeightStyle(this)}"
				>${module.options.vwNumber.value ? `[${this.votes > 0 ? '+' : ''}${this.votes}]` : '[vw]'}</a>
			`;
			instance.vw.addEventListener('click', () => this.openPrompt(instance));
			(instance.tagger || instance.element).after(instance.vw);
		}

		if (instance.tagger) instance.tagger.remove();
		if (this.text || this.color || instance.renderTaggingIcon) {
			// `defaultTagElement` is a lot fast than `buildTagElement`
			instance.tagger = (this.text || this.color) ? Tag.buildTagElement(this) : Tag.defaultTagElement();
			instance.tagger.addEventListener('click', () => this.openPrompt(instance));
			instance.element.after(instance.tagger);
		}
	}
}

const ignoreIcons = {
	IGNORED: '\uF038',
	NORMAL: '\uF03B',
};

function populateDialog(tag: Tag, card) {
	const head = string.html`<div><span class="res-icon">&#xF0AC;</span>&nbsp;<span>${tag.id}</span></div>`;

	const colors = Object.entries(bgToTextColorMap)
		.map(([color, textColor]) => ({
			textColor,
			color,
		}));

	const body = string.html`
		<form id="userTaggerToolTip">
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerText">Text</label>
				<input class="fieldPair-text" type="text" id="userTaggerText">
			</div>
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerColor">Color</label>
				<select id="userTaggerColor">
					${colors.map(({ textColor, color }) => string._html`
						<option style="color: ${textColor}; background-color: ${color}" value="${color}" ${tag.color === color && string._html`selected`}>${color}</option>
					`)}
				</select>
			</div>
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerPreview">Preview</label>
				<span id="userTaggerPreview"></span>
			</div>
			<div class="fieldPair res-usertag-ignore">
				<label class="fieldPair-label" for="userTaggerIgnore">Ignore</label>
				${string.safe(SettingsNavigation.makeUrlHashLink(module.moduleID, 'hardIgnore', ' configure ', 'gearIcon'))}
			</div>
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerLink">
					<span class="userTaggerOpenLink">
						<a title="open link" href="javascript:void 0">Source URL</a>
					</span>
				</label>
				<input class="fieldPair-text" type="text" id="userTaggerLink" value="${tag.link}">
			</div>
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerVotesUp" title="Upvotes you have given this redditor">Upvotes</label>
				<input type="number" style="width: 50px;" id="userTaggerVotesUp" value="${tag.votesUp}">
			</div>
			<div class="fieldPair">
				<label class="fieldPair-label" for="userTaggerVotesDown" title="Downvotes you have given this redditor">Downvotes</label>
				<input type="number" style="width: 50px;" id="userTaggerVotesDown" value="${tag.votesDown}">
			</div>
			<div class="res-usertagger-footer">
				<a href="/r/dashboard#userTaggerContents" target="_blank" rel="noopener noreferer">View tagged users</a>
				<input type="submit" id="userTaggerSave" value="✓ save tag">
			</div>
		</form>
	`;

	const elements = {
		color: downcast(body.querySelector('#userTaggerColor'), HTMLSelectElement),
		link: downcast(body.querySelector('#userTaggerLink'), HTMLInputElement),
		openLink: downcast(body.querySelector('.userTaggerOpenLink a'), HTMLAnchorElement),
		preview: downcast(body.querySelector('#userTaggerPreview'), HTMLElement),
		save: downcast(body.querySelector('#userTaggerSave'), HTMLElement),
		text: downcast(body.querySelector('#userTaggerText'), HTMLInputElement),
		votesDown: downcast(body.querySelector('#userTaggerVotesDown'), HTMLInputElement),
		votesUp: downcast(body.querySelector('#userTaggerVotesUp'), HTMLInputElement),
	};

	let ignored = tag.ignored;
	body.querySelector('.res-usertag-ignore label').after(
		CreateElement.toggleButton(
			ignore => {
				if (ignore && !elements.text.value) elements.text.value = 'ignored';
				if (!ignore && elements.text.value === 'ignored') elements.text.value = '';
				ignored = ignore;
			},
			'userTaggerIgnore',
			ignored,
			ignoreIcons.IGNORED,
			ignoreIcons.NORMAL,
			false,
			true
		)
	);

	function extract() {
		return {
			color: elements.color.value === 'none' ? null : elements.color.value,
			ignored,
			link: elements.link.value || null,
			text: elements.text.value || null,
			votesDown: parseInt(elements.votesDown.value, 10) || 0,
			votesUp: parseInt(elements.votesUp.value, 10) || 0,
		};
	}

	function updateTagPreview() {
		elements.preview.innerHTML = '';
		elements.preview.appendChild(Tag.buildTagElement(extract()));
	}

	elements.openLink.addEventListener('click', () => openNewTabs('none', ...elements.link.value.split(/\s/)));
	$(body).on('change input click', updateTagPreview);
	body.addEventListener('submit', e => {
		e.preventDefault();
		tag.load(extract());
		tag.save();
		card.close();
	});

	updateTagPreview();
	setTimeout(() => {
		// Focus before setting value so the caret becomes positioned at the end
		elements.text.focus();
		elements.text.value = tag.text;
	});

	return [head, body];
}

function registerCommandLine() {
	let tag;

	CommandLine.registerCommand('tag', `tag [text] - ${i18n('userTaggerCommandLineDescription')}`,
		async (command, val) => {
			const username = SelectedEntry.selectedThing && SelectedEntry.selectedThing.getAuthor();
			tag = username && await Tag.get(username);
			return tag ?
				i18n(val ? 'userTaggerTagUserAs' : 'userTaggerTagUser', tag.id, val) :
				i18n('userTaggerTagCanNotSetTag');
		},
		(command, val) => {
			if (tag) {
				tag.load({ text: val });
				tag.save();
			} else {
				return i18n('userTaggerTagCanNotSetTag');
			}
		}
	);
}

function attachVoteHandler() {
	// hand-rolled delegated listener because jQuery doesn't support useCapture
	// which is necessary so we run before reddit's handler
	document.body.addEventListener('click', (e: MouseEvent) => {
		if (e.button !== 0) return;
		if (e.target.classList.contains('arrow')) {
			handleVoteClick(e.target);
		}
	}, true);
}

async function handleVoteClick(arrow) {
	const $this = $(arrow);
	const $otherArrow = $this.siblings('.arrow');

	// Stop if the post is archived (unvotable)
	if ($this.hasClass('archived')) {
		return;
	}

	// there are 6 possibilities here:
	// 1) no vote yet, click upmod
	// 2) no vote yet, click downmod
	// 3) already upmodded, undoing
	// 4) already downmodded, undoing
	// 5) upmodded before, switching to downmod
	// 6) downmodded before, switching to upmod

	// classes are changed AFTER this event is triggered
	let up = 0;
	let down = 0;
	if ($this.hasClass('up')) {
		// adding an upvote
		up = 1;
		if ($otherArrow.hasClass('downmod')) {
			// also removing a downvote
			down = -1;
		}
	} else if ($this.hasClass('upmod')) {
		// removing an upvote directly
		up = -1;
	} else if ($this.hasClass('down')) {
		// adding a downvote
		down = 1;
		if ($otherArrow.hasClass('upmod')) {
			// also removing an upvote
			up = -1;
		}
	} else if ($this.hasClass('downmod')) {
		// removing a downvote directly
		down = -1;
	}

	// must load tag object _after_ checking the DOM, so that classes will not be changed
	const thing = Thing.checkedFrom(arrow);
	const username = thing.getAuthor();
	const tag = username && await Tag.get(username);
	if (!tag) throw new Error('No tag');
	tag.load({
		votesUp: tag.votesUp + up,
		votesDown: tag.votesDown + down,
	});
	tag.save();
}

const bgToTextColorMap = {
	none: 'inherit',
	aqua: 'black',
	black: 'white',
	blue: 'white',
	cornflowerblue: 'white',
	fuchsia: 'white',
	gray: 'white',
	green: 'white',
	lime: 'black',
	maroon: 'white',
	navy: 'white',
	olive: 'white',
	orange: 'white',
	orangered: 'white',
	pink: 'black',
	purple: 'white',
	red: 'white',
	silver: 'black',
	teal: 'white',
	white: 'black',
	yellow: 'black',
};

function getLinkBasedOnTagLocation(obj) {
	const closestEntry = $(obj).closest('.entry');
	let linkTitle = '';
	if (!module.options.useCommentsLinkAsSource.value) {
		linkTitle = $(closestEntry).find('a.title');
	}
	// if we didn't find anything, try a new search (works on inbox)
	if (!linkTitle.length) {
		linkTitle = $(closestEntry).find('a.bylink');
	}
	if (linkTitle.length) {
		return $(linkTitle).attr('href');
	} else {
		const permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
		if (permaLink.length) {
			return $(permaLink).attr('href');
		}
	}
}

// Ignore content from certain users.
// For blocking users from sending messages to other users, see reddit's built-in block feature.
function ignore(thing) {
	thing.element.classList.add('res-ignored-content');

	if (thing.isPost()) {
		ignorePost(thing);
	} else if (thing.isComment()) {
		ignoreComment(thing);
	}
}

function ignorePost(thing) {
	if (module.options.hardIgnore.value) {
		// hardIgnore, remove post completely
		thing.element.remove();
	} else {
		// no hardIgnore, replace title with placeholder
		const title = downcast(thing.getTitleElement(), HTMLElement);
		ignoredPlaceholder(thing).insertAfter(title);
	}
}

function ignoreComment(thing) {
	if (module.options.hardIgnore.value) {
		if ($(thing.element).children('.child').children().length === 0) {
			// hardIgnore and no children, remove completely
			thing.element.remove();
			return;
		} else if (thing.element.classList.contains('noncollapsed')) {
			// hardIgnore and children, collapse
			const toggleComment = downcast(thing.entry.querySelector('a.expand'), HTMLElement);
			click(toggleComment);
		}
	}

	// replace body with placeholder (both with/without hardIgnore)
	const body = downcast(thing.entry.querySelector('.md'), HTMLElement);
	ignoredPlaceholder(thing).insertAfter(body);
}

function ignoredPlaceholder(thing) {
	const $wrapper = $('<span>', { class: 'res-ignored-message' }).append(
		$('<span>', { class: 'res-icon', text: '\uF093' }),
		$('<span>', { text: ` ${i18n('userTaggerIgnoredPlaceholder')} ` })
	);

	if (module.options.showIgnored.value) {
		const $button = $('<a>', { href: '#', text: i18n('userTaggerShowAnyway') });
		$button.click(e => {
			e.preventDefault();
			thing.element.classList.remove('res-ignored-content');
			$wrapper.remove();
		});
		$button.appendTo($wrapper);
	}

	return $wrapper;
}

function getVoteWeightStyle({ votes, votesUp, votesDown }) {
	let red = 255;
	let green = 255;
	let blue = 255;
	let alpha = 1;
	if (votesUp > votesDown) {
		red = Math.max(0, 255 - 8 * votes);
		green = 255;
		blue = Math.max(0, 255 - 8 * votes);
		alpha = Math.abs(votes) / (votesUp + votesDown);
	} else if (votesUp < votesDown) {
		red = 255;
		green = Math.max(0, (255 - Math.abs(8 * votes)));
		blue = Math.max(0, (255 - Math.abs(8 * votes)));
		alpha = Math.abs(votes) / (votesUp + votesDown);
	}

	const color = `rgba(${red}, ${green}, ${blue}, ${0.2 + alpha * 0.8})`;
	return NightMode.isNightModeOn() ?
		`color: ${color};` :
		`background-color: ${color};`;
}

const filters = [
	{ get name() { return i18n('userTaggerAllUsers'); }, filter: v => v },
	{ get name() { return i18n('userTaggerTaggedUsers'); }, filter: v => v.text },
];

async function addDashboardFunctionality() {
	const $tabPage = Dashboard.addTab('userTaggerContents', i18n('userTaggerMyUserTags'), module.moduleID);
	// populate the contents of the tab
	const $showDiv = $(string.html`<div class="show">${i18n('userTaggerShow')} </div>`)
		.appendTo($tabPage);

	const tags = await Tag.getStored();
	$(string.html`
		<select id="tagFilter">
			${filters.map(({ name, filter }, i) => string._html`<option value="${i}" ${tags.some(filter) && 'selected'}>${name}</option>`)}
		</select>
	`)
		.change(() => drawUserTagTable())
		.appendTo($showDiv);

	const tagsPerPage = parseInt(Dashboard.module.options.tagsPerPage.value, 10);
	if (tagsPerPage) {
		const controlWrapper = document.createElement('div');
		controlWrapper.id = 'tagPageControls';
		$(controlWrapper).data({
			page: 1,
			pageCount: 1,
		});

		const leftButton = document.createElement('a');
		leftButton.className = 'res-step noKeyNav';
		leftButton.addEventListener('click', () => {
			const { page, pageCount } = $(controlWrapper).data();
			if (page === 1) {
				$(controlWrapper).data('page', pageCount);
			} else {
				$(controlWrapper).data('page', page - 1);
			}
			drawUserTagTable();
		});
		$(controlWrapper).append(string.escape`${i18n('userTaggerPage')} `);
		controlWrapper.appendChild(leftButton);

		const posLabel = document.createElement('span');
		posLabel.className = 'res-step-progress';
		posLabel.textContent = '1 of 2';
		controlWrapper.appendChild(posLabel);

		const rightButton = document.createElement('a');
		rightButton.className = 'res-step res-step-reverse noKeyNav';
		rightButton.addEventListener('click', () => {
			const { page, pageCount } = $(controlWrapper).data();
			if (page === pageCount) {
				$(controlWrapper).data('page', 1);
			} else {
				$(controlWrapper).data('page', page + 1);
			}
			drawUserTagTable();
		});
		controlWrapper.appendChild(rightButton);

		$tabPage.append(controlWrapper);
	}
	const $thisTable = $(string.html`
		<table id="userTaggerTable">
			<thead>
				<tr>
					<th sort="username" class="active">${i18n('userTaggerUsername')}<span class="sortAsc"></span></th>
					<th sort="tag">${i18n('userTaggerTag')}</th>
					<th sort="ignore">${i18n('userTaggerIgnored')}</th>
					<th sort="color">${i18n('userTaggerColor')}</th>
					<th sort="votesDown">${i18n('userTaggerVotesDown')}</th>
					<th sort="votesUp">${i18n('userTaggerVotesUp')}</th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
	`);

	$tabPage.append($thisTable);
	$('#userTaggerTable thead th').click(function(e) {
		e.preventDefault();
		const $this = $(this);

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
		drawUserTagTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
	});
	drawUserTagTable();
}

let currentSortMethod, isDescending;

async function drawUserTagTable(sortMethod, descending) {
	currentSortMethod = sortMethod || currentSortMethod;
	isDescending = (descending === undefined || descending === null) ? isDescending : descending;

	const tags = (await Tag.getStored())
		.filter(filters[$('#tagFilter').val()].filter);

	switch (currentSortMethod) {
		case 'tag':
			tags.sort((a, b) => (a.text || '').localeCompare(b.text || ''));
			break;
		case 'ignore':
			tags.sort((a, b) => Number(a.ignored) - Number(b.ignored));
			break;
		case 'color':
			tags.sort((a, b) => (a.color || '').localeCompare(b.color || ''));
			break;
		case 'votesDown':
			tags.sort((a, b) => a.votesDown - b.votesDown);
			break;
		case 'votesUp':
			tags.sort((a, b) => a.votesUp - b.votesUp);
			break;
		case 'username':
			/* falls through */
		default:
			// sort users, ignoring case
			tags.sort((a, b) => a.id.localeCompare(b.id));
			break;
	}

	if (isDescending) {
		tags.reverse();
	}

	$('#userTaggerTable tbody').html('');
	const tagsPerPage = parseInt(Dashboard.module.options.tagsPerPage.value, 10);
	const count = tags.length;
	let start = 0;
	let end = count;

	if (tagsPerPage) {
		const $tagControls = $('#tagPageControls');
		let page = $tagControls.data('page');
		const pages = Math.ceil(count / tagsPerPage);
		page = Math.min(page, pages);
		page = Math.max(page, 1);
		$tagControls.data('page', page).data('pageCount', pages);
		$tagControls.find('.res-step-progress').text(i18n('userTaggerPageXOfY', page, pages));
		start = tagsPerPage * (page - 1);
		end = Math.min(count, tagsPerPage * page);
	}

	tags
		.slice(start, end)
		.forEach(tag => {
			const d = $(`
				<tr>
					<td>
						<span class="res-icon res-right deleteIcon" data-icon="&#xf056;" user="${tag.id}"></span>
						<a href="/user/${tag.id}">${tag.id}</a>
					</td>
					<td><a class="author" hidden></a></td>
					<td class="res-icon">${tag.ignored ? ignoreIcons.IGNORED : ignoreIcons.NORMAL}</td>
					<td><span style="color: ${tag.color || 'initial'}">${tag.color ? tag.color : ''}</span></td>
					<td>${tag.votesDown}</td>
					<td>${tag.votesUp}</td>
				</tr>
			`).get(0);

			tag.add(downcast(d.querySelector('.author'), HTMLAnchorElement), { renderTaggingIcon: true });

			$('#userTaggerTable tbody').append(d);
		});
	$('#userTaggerTable tbody .deleteIcon').click(function() {
		const thisUser = $(this).attr('user').toLowerCase();
		const $button = $(this);
		Alert.open(i18n('userTaggerAreYouSureYouWantToDeleteTag', thisUser), { cancelable: true })
			.then(() => {
				tagStorage.delete(thisUser);
				$button.closest('tr').remove();
			});
	});
}
