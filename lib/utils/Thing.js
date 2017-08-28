/* @flow */

import _ from 'lodash';
import { filterMap } from './array';
import { downcast } from './flow';
import { currentSubreddit, regexes } from './location';

const elementMap = new WeakMap();
const things = new Set();
const SECRET_TOKEN = new class {}();

/**
 * Wrapper class around reddit's concept of a "Thing".
 * Use Thing.from or Thing.checkedFrom (fallible/infallible respectively) to construct a Thing.
 * Uniqueness is guaranteed, i.e. `Thing.from(element) === Thing.from(element)`.
 */
export class Thing {
	static bodyThingSelector = '.listing .thing, .linklisting .thing, .nestedlisting .thing, .search-result-link';
	static thingSelector = '.thing, .search-result-link';
	static entrySelector = '.entry, .search-result-link > :not(.thumbnail)';

	static thingsContainer(body: HTMLElement = document.body): HTMLElement {
		return (
			body.querySelector('.sitetable') ||
			_.last(Array.from(body.querySelectorAll('.search-result-listing')))
		);
	}

	static findThings(container?: HTMLElement = Thing.thingsContainer()): Thing[] {
		const potentialThings = [
			...(container.matches(Thing.thingSelector) ? [container] : []),
			...container.querySelectorAll(Thing.thingSelector),
		];
		return filterMap(potentialThings, ele => {
			const thing = Thing.from(ele);
			if (thing) return [thing];
		});
	}

	static things(): Thing[] {
		return Array.from(things);
	}

	static thingElements(): HTMLElement[] {
		return Array.from(document.querySelectorAll(Thing.bodyThingSelector));
	}

	static visibleThingElements(): HTMLElement[] {
		return Thing.thingElements().filter(v => v.offsetParent);
	}

	static visibleThings(): Thing[] {
		return filterMap(Thing.visibleThingElements(), ele => {
			const thing = Thing.from(ele);
			if (thing) return [thing];
		});
	}

	element: HTMLElement;
	entry: HTMLElement;

	// may be set by filters
	filter: *;

	static checkedFrom(element: HTMLElement | Thing): Thing {
		const thing = Thing.from(element);
		if (!thing) {
			throw new Error(`Could not construct Thing from ${String(element)}`);
		}
		return thing;
	}

	static from(element: ?HTMLElement | Thing): ?Thing {
		if (!element) return null;

		if (element instanceof Thing) return element;

		const thingElement = element.closest(Thing.thingSelector);
		if (!thingElement) return null;

		if (elementMap.has(thingElement)) return elementMap.get(thingElement);

		const entry = thingElement.querySelector(Thing.entrySelector) || thingElement;
		const thing = new Thing(SECRET_TOKEN, downcast(thingElement, HTMLElement), entry);

		elementMap.set(thingElement, thing);
		things.add(thing);

		return thing;
	}

	constructor(token: typeof SECRET_TOKEN, thing: HTMLElement, entry: HTMLElement) {
		if (token !== SECRET_TOKEN) {
			throw new Error('Use Thing.from() or Thing.checkedFrom() instead of new Thing()');
		}

		this.element = thing;
		this.entry = entry;
	}

	setFilter(filter: ?*) {
		this.filter = filter;
		this.element.classList.toggle('RESFiltered', !!filter);
	}

	getThreadTop(): Thing {
		let thing = this; // eslint-disable-line consistent-this

		let current = this.element;
		while ((current = current.parentElement)) {
			if (current.matches(Thing.thingSelector)) thing = downcast(current, HTMLElement);
		}

		return Thing.checkedFrom(thing);
	}

	getParent(): ?Thing {
		let current = this.element;
		while ((current = current.parentElement)) {
			if (current.classList.contains('thing')) return Thing.checkedFrom(downcast(current, HTMLElement));
		}
	}

	getNext({ direction = 'down' }: {| direction?: 'up' | 'down' |} = {}, things: HTMLElement[] = Thing.thingElements()): ?Thing {
		let index = things.indexOf(this.element);
		let target;

		do {
			index += direction === 'down' ? 1 : -1;
			target = things[index];
			if (!target) return null;
		} while (!target.offsetParent);

		return Thing.from(target);
	}

	getNextSibling(options: *): ?Thing {
		if (!this.element.parentElement) return null;

		const things = Array.from(this.element.parentElement.children)
			.filter(e => e.matches(Thing.thingSelector));

		return this.getNext(options, things);
	}

	getClosest(func: (...args: any) => ?Thing, ...args: mixed[]): ?Thing {
		const target = Reflect.apply(func, this, args);
		if (target) {
			return target;
		} else {
			const parent = this.getParent();
			if (parent) return parent.getClosest(func, ...args);
		}
	}

	getClosestVisible(includeSelf: boolean = true): ?Thing {
		if (includeSelf && this.isVisible()) return this;
		return this.getNext({ direction: 'down' }) || this.getNext({ direction: 'up' });
	}

	isMessage(): boolean {
		return this.element.classList.contains('message');
	}

	isSubreddit(): boolean {
		return this.element.classList.contains('subreddit');
	}

	isPost(): boolean {
		return this.element.classList.contains('link') || this.element.classList.contains('search-result-link');
	}

	isLinkPost(): boolean {
		if (!this.isPost()) {
			return false;
		}
		if (this.element.classList.contains('search-result-link')) {
			return !this.element.querySelector('a').classList.contains('self');
		} else {
			return !this.element.classList.contains('self');
		}
	}

	isSelfPost(): boolean {
		if (!this.isPost()) {
			return false;
		}
		if (this.element.classList.contains('search-result-link')) {
			return this.element.querySelector('a').classList.contains('self');
		} else {
			return this.element.classList.contains('self');
		}
	}

	isComment(): boolean {
		return this.element.classList.contains('comment') || this.element.classList.contains('was-comment');
	}

	isTopLevelComment(): boolean {
		return this.isComment() && !!this.element.parentElement && this.element.parentElement.classList.contains('nestedlisting');
	}

	getTitle(): string {
		const element = this.getTitleElement();
		return element && element.textContent || '';
	}

	getTitleElement(): ?HTMLAnchorElement {
		return (this.entry.querySelector('a.title, a.search-title') ||
			this.entry.querySelector('.title'): any);
	}

	getTitleUrl(): string {
		const element = this.getTitleElement();
		if (element) {
			return element.href;
		}
		return '';
	}

	getPostLink(): HTMLAnchorElement {
		return downcast(this.entry.querySelector('a.title, a.search-link'), HTMLAnchorElement);
	}

	getCommentsLink(): HTMLAnchorElement {
		return downcast(this.entry.querySelector('a.comments, a.search-comments'), HTMLAnchorElement);
	}

	getCommentPermalink(): ?HTMLAnchorElement {
		return (this.entry.querySelector('a.bylink'): any);
	}

	getHideElement(): ?HTMLAnchorElement {
		return (this.entry.querySelector('.hide-button a, .unhide-button a'): any);
	}

	getNumberOfChildren(): number {
		const numChildrenElem = this.element.querySelector('.numchildren');
		return numChildrenElem && parseInt((/(\d+)/).exec(numChildrenElem.textContent)[1], 10) || 0;
	}

	static _parseScore(scoreEle: HTMLElement): number {
		return parseInt(scoreEle.title || scoreEle.textContent, 10) || 0;
	}

	getScore(): ?number {
		const element = this._getActiveScoreElement();
		// parseInt() strips off the ' points' from comments
		return element && Thing._parseScore(element);
	}

	_getActiveScoreElement(): ?HTMLElement {
		if (this.isPost()) {
			return this.element.querySelector([
				'.midcol.unvoted > .score.unvoted',
				'.midcol.likes > .score.likes',
				'.midcol.dislikes > .score.dislikes',
				'.search-score',
			].join(', '));
		} else { // if (this.isComment()) {
			return this.entry.querySelector('.tagline > .score');
		}
	}

	getAllScoreElements(): Array<[HTMLElement, number]> {
		const toScoreTuple = ele => [ele, Thing._parseScore(ele)];
		if (this.isPost()) {
			return Array.from(this.element.querySelectorAll('.midcol > .score, .search-score')).map(toScoreTuple);
		} else { // if (this.isComment()) {
			return Array.from(this.entry.querySelectorAll('.tagline > .score')).map(toScoreTuple);
		}
	}

	getAuthor(): ?string {
		const data = this.element.getAttribute('data-author');
		if (data) {
			return data;
		}
		const element = this.getAuthorElement();
		return element && regexes.profile.exec(element.pathname)[1];
	}

	getAuthorUrl(): string {
		const author = this.getAuthor();
		if (author) {
			return `/user/${author}/`;
		}
		return '';
	}

	getAuthorElement(): ?HTMLAnchorElement {
		return (this.entry.querySelector('.tagline a.author, .search-author .author'): any);
	}

	getSubreddit = _.once(function(): ?string {
		const data = this.element.getAttribute('data-subreddit');
		if (data) {
			return data;
		}
		const element = this.getSubredditLink();
		if (element) {
			const match = regexes.subreddit.exec(element.pathname);
			if (match) {
				return match[1];
			}
		} else {
			return currentSubreddit();
		}
	});

	getSubredditLink(): ?HTMLAnchorElement {
		if (this.isPost()) {
			return (this.entry.querySelector('.tagline a.subreddit, a.search-subreddit-link'): any);
		} else if (this.isComment()) {
			// TODO: does .parent a.subreddit work?
			return (this.entry.querySelector('.parent a.subreddit, .tagline .subreddit a'): any);
		}
	}

	getPostDomain(): string {
		const data = this.element.getAttribute('data-domain');
		if (data) {
			return data;
		}

		const element = this.getPostDomainLink();
		if (element) {
			return element.textContent;
		}

		const text = this.getPostDomainText();
		if (text) {
			return text;
		}

		const subreddit = this.getSubreddit();
		if (subreddit) {
			return `self.${subreddit}`;
		}

		return 'reddit.com';
	}

	getPostDomainUrl(): string {
		const link = this.getPostDomainLink();
		if (link) {
			return link.href;
		}
		return `/domain/${this.getPostDomain()}/`;
	}

	getPostDomainLink(): ?HTMLAnchorElement {
		return (this.element.querySelector('.domain a'): any);
	}

	getPostDomainText(): string {
		const data = this.element.getAttribute('data-domain');
		if (data) {
			return data;
		}

		const element = this.element.querySelector('.domain');
		if (!element) return '';
		const text = element.textContent || '';
		return text.replace(/[\(\)\s]/g, '');
	}

	getCommentCount(): number {
		const element = this.getCommentCountElement();
		return element && parseInt(/\d+/.exec(
			element.textContent ||
			element.getAttribute('data-text') // In case noCtrlF is applied
		), 10) || 0;
	}

	getCommentCountElement(): ?HTMLElement {
		if (this.isPost()) {
			return this.element.querySelector('.buttons .comments');
		} else if (this.isComment()) {
			return this.element.querySelector('.buttons a.full-comments');
		}
	}

	getPostThumbnailUrl(): string {
		const thumbnail = this.getPostThumbnailElement();
		if (!thumbnail) return '';
		return thumbnail.src || '';
	}

	getPostThumbnailElement(): ?HTMLImageElement {
		return (this.element.querySelector('.thumbnail img'): any);
	}

	getPostFlairText(): string {
		const element = this.getPostFlairElement();
		return element && element.textContent || '';
	}

	getPostFlairElement(): ?HTMLElement {
		return this.entry.querySelector('.title > .linkflairlabel');
	}

	getUserFlairText(): string {
		const element = this.getUserFlairElement();
		return element && element.textContent || '';
	}

	getUserFlairElement(): ?HTMLElement {
		return this.entry.querySelector('.tagline > .flair');
	}

	getCrosspostBadgeElement(): ?HTMLElement {
		return this.entry.querySelector('.crosspost-badge');
	}

	getUpvoteButton(): ?HTMLElement {
		return this._getVoteButton('div.up, div.upmod');
	}

	getDownvoteButton(): ?HTMLElement {
		return this._getVoteButton('div.down, div.downmod');
	}

	_getVoteButton(selector: string): ?HTMLElement {
		const previousSibling: HTMLElement = (this.entry.previousSibling: any);
		if (previousSibling.tagName === 'A') {
			return (previousSibling.previousSibling: any).querySelector(selector);
		} else {
			return previousSibling.querySelector(selector);
		}
	}

	getTimestamp(): ?Date {
		const element = this.getTimestampElement();
		return element && new Date(element.getAttribute('datetime'));
	}

	getTimestampElement(): ?HTMLElement {
		return this.entry.querySelector('time');
	}

	getPostEditTimestamp(): number {
		const element = this.getPostEditTimestampElement();
		return element && (Date.parse(element.getAttribute('datetime')) / 1000) || 0;
	}

	getPostEditTimestampElement(): ?HTMLElement {
		return this.entry.querySelector('time.edited-timestamp');
	}

	getFullname(): string {
		return this.element.getAttribute('data-fullname') || '';
	}

	getUserattrsElement(): ?HTMLElement {
		return this.entry.querySelector('.userattrs');
	}

	getRank(): ?number {
		const rank = parseInt(this.element.getAttribute('data-rank'), 10);
		if (!isNaN(rank)) return rank;
	}

	getRankElement(): ?HTMLElement {
		if (!this.isPost()) return;
		return this.element.querySelector('.rank');
	}

	getTaglineElement(): ?HTMLElement {
		return this.entry.querySelector('.tagline');
	}

	getCommentToggleElement(): ?HTMLElement {
		return this.entry.querySelector('.expand');
	}

	getPostTime(): string {
		const element = this.getPostTimeElement();
		if (element) {
			return element.textContent;
		}
		return '';
	}

	getPostTimeElement(): ?HTMLElement {
		return this.entry.querySelector('.tagline time');
	}

	isNSFW(): boolean {
		if (this.element.classList.contains('search-result')) {
			return !!this.entry.querySelector('.nsfw-stamp');
		}
		return this.element.classList.contains('over18');
	}

	isSpoiler(): boolean {
		if (this.element.classList.contains('search-result')) {
			return !!this.entry.querySelector('.spoiler-stamp');
		}
		return this.element.classList.contains('spoiler');
	}

	isCrosspost(): boolean {
		return !!this.getCrosspostBadgeElement();
	}

	isLocked(): boolean {
		if (this.element.classList.contains('search-result')) {
			return this.element.classList.contains('linkflair-locked');
		}
		return this.element.classList.contains('locked');
	}

	isFiltered(): boolean {
		return !document.body.classList.contains('res-filters-disabled') &&
			this.element.classList.contains('RESFiltered');
	}

	isCollapsed(): boolean {
		return this.element.classList.contains('collapsed');
	}

	isInCollapsed(): boolean {
		const parent_ = this.getParent();
		return !!(parent_ && parent_.getClosest(function() { this.isCollapsed(); }));
	}

	isVisible(): boolean {
		return (
			!this.isFiltered() &&
			!this.isInCollapsed()
		);
	}

	isSelected() {
		return this.element.classList.contains('RES-keyNav-activeThing');
	}

	isUpvoted() {
		return this.entry.classList.contains('likes');
	}

	isDownvoted() {
		return this.entry.classList.contains('dislikes');
	}

	isUnvoted() {
		return this.entry.classList.contains('unvoted');
	}
}
