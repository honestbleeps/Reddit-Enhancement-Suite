/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import type { Expando } from './expando';
import { currentSubreddit, click, downcast, expandos, filterMap, regexes } from './';

const elementMap = new WeakMap();
const things = new Set();
const SECRET_TOKEN = new class {}();

export default class Thing {
	static bodyThingSelector = '.listing .thing, .linklisting .thing, .nestedlisting .thing, .search-result-link';
	static thingSelector = '.thing, .search-result-link';
	static entrySelector = '.entry, .search-result-link > :not(.thumbnail)';
	static containerSelector = '.sitetable, .search-result-listing:last';
	static expandoSelector = '.expando-button, .search-expando-button';

	static thingsContainer(body: HTMLElement = document.body): HTMLElement {
		return $(body).find(Thing.containerSelector)[0];
	}

	static $things(container: HTMLElement = Thing.thingsContainer()): JQuery {
		const $container = $(container);
		const things = $container.find(Thing.thingSelector);
		if ($container.is(Thing.thingSelector)) return $(container).add(things);
		return things;
	}

	static findThings(container?: HTMLElement): Thing[] {
		return filterMap(Thing.$things(container).toArray(), ele => {
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

	$thing: JQuery;
	element: HTMLElement;
	thing: HTMLElement;
	entry: HTMLElement;

	// may be set by filters
	filter: *;
	filterResult: *;
	filterEntryRemover: *;

	static checkedFrom(element: Element | JQuery | Thing): Thing {
		const thing = Thing.from(element);
		if (!thing) {
			throw new Error(`Could not construct Thing from ${String(element)}`);
		}
		return thing;
	}

	static from(element: ?Element | JQuery | Thing): ?Thing {
		if (!element) return null;
		if (elementMap.has(element)) return elementMap.get(element);
		if (element instanceof Thing) return element;

		const $thing = $(element).closest(Thing.thingSelector);
		if (!$thing.length) return null;

		const thingElement = $thing.get(0);
		let thing;

		if (elementMap.has(thingElement)) {
			thing = elementMap.get(thingElement);
		} else {
			const entry = thingElement.querySelector(Thing.entrySelector) || thingElement;
			thing = new Thing(SECRET_TOKEN, $thing, thingElement, entry);
			elementMap.set(thingElement, thing);
			things.add(thing);
		}

		elementMap.set(element, thing);

		return thing;
	}

	constructor(token: typeof SECRET_TOKEN, $thing: JQuery, thing: HTMLElement, entry: HTMLElement) {
		if (token !== SECRET_TOKEN) {
			throw new Error('Use Thing.from() or Thing.checkedFrom() instead of new Thing()');
		}

		this.$thing = $thing;
		this.element = this.thing = thing;
		this.entry = entry;
	}

	// Instance methods
	is(otherThing?: Thing): boolean {
		return !!otherThing && otherThing.element === this.element;
	}

	getThreadTop(): Thing {
		return Thing.checkedFrom(this.$thing.parents(Thing.thingSelector).addBack().get(0));
	}

	getParent(): ?Thing {
		let current = this.element;
		while ((current = current.parentElement)) {
			if (current.classList.contains('thing')) return Thing.checkedFrom(downcast(current, HTMLElement));
		}
	}

	getNext({ direction = 'down' }: { direction?: 'up' | 'down' } = {}, things: HTMLElement[] = Thing.thingElements()): ?Thing {
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
		const things = this.$thing.siblings(Thing.thingSelector).addBack().get();
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

	id(): string {
		return this.$thing.data('fullname');
	}

	isMessage(): boolean {
		return this.thing.classList.contains('message');
	}

	isSubreddit(): boolean {
		return this.thing.classList.contains('subreddit');
	}

	isPost(): boolean {
		return this.thing.classList.contains('link') || this.thing.classList.contains('search-result-link');
	}

	isLinkPost(): boolean {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return !this.thing.querySelector('a').classList.contains('self');
		} else {
			return !this.thing.classList.contains('self');
		}
	}

	isSelfPost(): boolean {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return this.thing.querySelector('a').classList.contains('self');
		} else {
			return this.thing.classList.contains('self');
		}
	}

	isComment(): boolean {
		return this.thing.classList.contains('comment') || this.thing.classList.contains('was-comment');
	}

	isTopLevelComment(): boolean {
		return this.isComment() && !!this.thing.parentElement && this.thing.parentElement.classList.contains('nestedlisting');
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
		return numChildrenElem && parseInt((/\((\d+)/).exec(numChildrenElem.textContent)[1], 10) || 0;
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
			return this.thing.querySelector([
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
			return Array.from(this.thing.querySelectorAll('.midcol > .score, .search-score')).map(toScoreTuple);
		} else { // if (this.isComment()) {
			return Array.from(this.entry.querySelectorAll('.tagline > .score')).map(toScoreTuple);
		}
	}

	getAuthor(): ?string {
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
		const element = this.getSubredditLink();
		if (element) {
			return regexes.subreddit.exec(element.pathname)[1];
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
		const data = this.thing.getAttribute('data-domain');
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
		return (this.thing.querySelector('.domain a'): any);
	}

	getPostDomainText(): string {
		const data = this.thing.getAttribute('data-domain');
		if (data) {
			return data;
		}

		const element = this.thing.querySelector('.domain');
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
			return this.thing.querySelector('.buttons .comments');
		} else if (this.isComment()) {
			return this.thing.querySelector('.buttons a.full-comments');
		}
	}

	getPostThumbnailUrl(): string {
		const thumbnail = this.getPostThumbnailElement();
		if (!thumbnail) return '';
		return thumbnail.src || '';
	}

	getPostThumbnailElement(): ?HTMLImageElement {
		return (this.thing.querySelector('.thumbnail img'): any);
	}

	getPostFlairText(): string {
		const element = this.getPostFlairElement();
		return element && element.textContent || '';
	}

	getPostFlairElement(): ?HTMLElement {
		return $(this.entry).find('> .title > .linkflairlabel')[0];
	}

	getUserFlairText(): string {
		const element = this.getUserFlairElement();
		return element && element.textContent || '';
	}

	getUserFlairElement(): ?HTMLElement {
		return $(this.entry).find('> .tagline > .flair')[0];
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

	getEntryExpando(): ?Expando {
		const button = $(this.entry).find('> .expando-button')[0];
		if (!button) return null;

		let expando = expandos.get(button);

		if (!expando) {
			const box = $(this.entry).find('> .expando')[0];

			const buttonPlaceholder = document.createElement('span');
			const boxPlaceholder = document.createElement('span');

			// Otherwise it is a native expando: Create a pseudo-class for those
			expando = ({
				button,
				get open() { return button.classList.contains('expanded'); },
				collapse() { if (this.open) this.toggle(); },
				expand() { if (!this.open) this.toggle(); },
				toggle() { click(button); },
				detach() {
					$(button).replaceWith(buttonPlaceholder);
					$(box).replaceWith(boxPlaceholder);
				},
				reattach() {
					$(buttonPlaceholder).replaceWith(button);
					$(boxPlaceholder).replaceWith(box);
				},
				getTypes() {
					return [
						'native',
						this.button.classList.contains('selftext') ? 'selftext' : null,
					].filter(v => v);
				},
			}: any /* TODO: this is kinda dangerous, there should be a subclass instead */);

			expandos.set(button, expando);
		}

		return expando;
	}

	getTextExpandos(): Expando[] {
		const entryExpando = this.getEntryExpando();
		return filterMap(Array.from(this.entry.querySelectorAll(Thing.expandoSelector)), v => {
			const exp = expandos.get(v);
			if (exp && exp !== entryExpando) return [exp];
		});
	}

	getExpandos(): Expando[] {
		return filterMap([...this.getTextExpandos(), this.getEntryExpando()], v => v && [v]);
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
		return this.thing.getAttribute('data-fullname') || '';
	}

	getUserattrsElement(): ?HTMLElement {
		return this.entry.querySelector('.userattrs');
	}

	getRank(): ?string {
		return this.thing.getAttribute('data-rank');
	}

	getRankElement(): ?HTMLElement {
		if (!this.isPost()) return;
		return this.thing.querySelector('.rank');
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
		if (this.thing.classList.contains('search-result')) {
			return !!this.entry.querySelector('.nsfw-stamp');
		}
		return this.thing.classList.contains('over18');
	}

	isSpoiler(): boolean {
		if (this.thing.classList.contains('search-result')) {
			return !!this.entry.querySelector('.spoiler-stamp');
		}
		return this.thing.classList.contains('spoiler');
	}

	isFiltered(): boolean {
		return this.thing.classList.contains('RESFiltered');
	}

	isInCollapsed(): boolean {
		const parent_ = this.getParent();
		return !!(parent_ && parent_.getClosest(function() { return this.thing.classList.contains('collapsed'); }));
	}

	isVisible(): boolean {
		return (
			!this.isFiltered() &&
			!this.isInCollapsed()
		);
	}

	isSelected() {
		return this.thing.classList.contains('RES-keyNav-activeThing');
	}
}
