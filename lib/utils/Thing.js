import { $ } from '../vendor';
import { currentSubreddit, click, expandos, regexes } from './';

const things = new WeakMap();

export default class Thing {
	static bodyThingSelector = '.listing .thing, .linklisting .thing, .nestedlisting .thing, .search-result-link';
	static thingSelector = '.thing, .search-result-link';
	static entrySelector = '.entry, .search-result-link > :not(.thumbnail)';
	static containerSelector = '.sitetable, .search-result-listing:last';
	static expandoSelector = '.expando-button, .search-expando-button'

	static thingsContainer(body = document.body) {
		return $(body).find(Thing.containerSelector)[0];
	}

	static $things(container = Thing.thingsContainer()) {
		return $(container).find(Thing.thingSelector);
	}

	static things(container) {
		return Thing.$things(container)
			.get()
			.map(ele => new Thing(ele));
	}

	static visibleThingElements() {
		return Array.from(document.querySelectorAll(Thing.bodyThingSelector)).filter(v => v.offsetParent);
	}

	static visibleThings() {
		return Thing.visibleThingElements().map(ele => new Thing(ele));
	}

	constructor(element) {
		if (element instanceof Thing) return element;
		if (things.has(element)) return things.get(element);

		this.$thing = $(element).closest(Thing.thingSelector);
		this.element = this.thing = this.$thing[0];

		if (things.has(this.element)) return things.get(this.element);
		else things.set(this.element, this);

		this.entry = this.thing && this.thing.querySelector(Thing.entrySelector) || this.thing;
	}

	// Proxied functions
	find(...args) {
		return this.$thing.find(...args);
	}

	querySelector(selectors) {
		return this.thing && this.thing.querySelector(selectors);
	}

	querySelectorAll(selectors) {
		return this.thing && this.thing.querySelectorAll(selectors);
	}

	// Instance methods
	is(otherThing) {
		return otherThing && otherThing.element === this.element;
	}

	getThreadTop() {
		return new Thing(this.$thing.parents(Thing.thingSelector).addBack().get(0));
	}

	getParent() {
		const target = this.$thing.parents(Thing.thingSelector).get(0);
		return target ? new Thing(target) : null;
	}

	getNext({ direction = 'down' } = {}, things = Thing.visibleThingElements()) {
		let index = things.indexOf(this.element);
		let target;

		do {
			index += direction === 'down' ? 1 : -1;
			target = things[index];
			if (!target) return null;
		} while (!target.offsetParent);

		return new Thing(target);
	}

	getNextSibling(options) {
		const things = this.$thing.siblings(Thing.thingSelector).addBack().get();
		return this.getNext(options, things);
	}

	getClosest(func, ...args) {
		const target = this::func(...args);
		if (target) {
			return target;
		} else {
			const parent = this.getParent();
			if (parent) return parent.getClosest(func, ...args);
		}
	}

	isPost() {
		return this.thing.classList.contains('link') || this.thing.classList.contains('search-result-link');
	}

	isLinkPost() {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return !this.thing.querySelector('a').classList.contains('self');
		} else {
			return !this.thing.classList.contains('self');
		}
	}

	isSelfPost() {
		if (!this.isPost()) {
			return false;
		}
		if (this.thing.classList.contains('search-result-link')) {
			return this.thing.querySelector('a').classList.contains('self');
		} else {
			return this.thing.classList.contains('self');
		}
	}

	isComment() {
		return this.thing.classList.contains('comment');
	}

	getTitle() {
		const element = this.getTitleElement();
		return element && element.textContent;
	}

	getTitleElement() {
		return this.entry.querySelector('a.title, a.search-title');
	}

	getPostLink() {
		return this.entry.querySelector('a.title, a.search-link');
	}

	getCommentsLink() {
		return this.entry.querySelector('a.comments, a.search-comments');
	}

	getCommentPermalink() {
		return this.entry.querySelector('a.bylink');
	}

	getScore() {
		const element = this.getScoreElement();
		// parseInt() strips off the ' points' from comments
		return element && parseInt(element.textContent, 10);
	}

	getScoreElement() {
		if (this.isPost()) {
			return this.thing.querySelector('.midcol.unvoted > .score.unvoted, .midcol.likes > score.likes, .midcol.dislikes > .score.dislikes, .search-score');
		} else if (this.isComment()) {
			// TODO: does this work?
			return this.entry.querySelector('tagline > .score');
		}
	}

	getAuthor() {
		const element = this.getAuthorElement();
		return element && regexes.profile.exec(element.pathname)[1];
	}

	getAuthorElement() {
		return this.entry.querySelector('.tagline a.author, .search-author .author');
	}

	getSubreddit() {
		const element = this.getSubredditLink();
		return element && regexes.subreddit.exec(element.pathname)[1];
	}

	getSubredditLink() {
		if (this.isPost()) {
			return this.entry.querySelector('.tagline a.subreddit, a.search-subreddit-link');
		} else if (this.isComment()) {
			// TODO: does this work?
			return this.entry.querySelector('.parent a.subreddit');
		}
	}

	getPostDomain() {
		const element = this.getPostDomainLink();
		if (element) {
			return element.textContent;
		}

		const subreddit = this.getSubreddit() || currentSubreddit();
		if (subreddit) {
			return `self.${subreddit}`;
		}

		return 'reddit.com';
	}

	getPostDomainLink() {
		return this.thing.querySelector('.domain > a');
	}

	getCommentCount() {
		const element = this.getCommentCountElement();
		return element && parseInt(/\d+/.exec(element.textContent), 10) || 0;
	}

	getCommentCountElement() {
		if (this.isPost()) {
			return this.thing.querySelector('.buttons .comments');
		} else if (this.isComment()) {
			return this.thing.querySelector('.buttons a.full-comments');
		}
	}

	getPostFlairText() {
		const element = this.getPostFlairElement();
		return element && element.textContent;
	}

	getPostFlairElement() {
		return $(this.entry).find('> .title > .linkflairlabel')[0];
	}

	getUserFlairText() {
		const element = this.getUserFlairElement();
		return element && element.textContent;
	}

	getUserFlairElement() {
		return $(this.entry).find('> .title > .linkflairlabel')[0];
	}

	getUpvoteButton() {
		return this._getVoteButton('div.up, div.upmod');
	}

	getDownvoteButton() {
		return this._getVoteButton('div.down, div.downmod');
	}

	_getVoteButton(selector) {
		if (this.entry.previousSibling.tagName === 'A') {
			return this.entry.previousSibling.previousSibling.querySelector(selector);
		} else {
			return this.entry.previousSibling.querySelector(selector);
		}
	}

	getEntryExpando() {
		const button = $(this.entry).find('> .expando-button')[0];
		if (!button) return null;

		let expando = expandos.get(button);

		if (!expando) {
			// Otherwise it is a native expando: Create a pseudo-class for those
			const isOpen = () => button.classList.contains('expanded');
			const toggle = () => { click(button); };
			expando = {
				button,
				get open() { return isOpen(); },
				collapse() { if (isOpen()) toggle(); },
				expand() { if (!isOpen()) toggle(); },
			};

			expandos.set(button, expando);
		}

		return expando;
	}

	getTextExpandos() {
		const entryExpando = this.getEntryExpando();
		return Array.from(this.entry.querySelectorAll(Thing.expandoSelector))
			.map(v => expandos.get(v))
			.filter(v => v && v !== entryExpando);
	}

	getExpandos() {
		return [...this.getTextExpandos(), this.getEntryExpando()].filter(v => v);
	}

	getTimestamp() {
		const element = this.getTimestampElement();
		return element && new Date(element.getAttribute('datetime'));
	}

	getTimestampElement() {
		return this.entry.querySelector('time');
	}

	getFullname() {
		return this.thing.getAttribute('data-fullname');
	}

	getUserattrsElement() {
		return this.entry.querySelector('.userattrs');
	}

	getRank() {
		return this.thing.getAttribute('data-rank');
	}

	getTaglineElement() {
		return this.entry.querySelector('.tagline');
	}

	isNSFW() {
		if (this.thing.classList.contains('search-result')) {
			return this.entry.querySelector('.nsfw-stamp');
		}
		return this.thing.classList.contains('over18');
	}

	isFiltered() {
		return this.thing.classList.contains('RESFiltered');
	}

	toggleFilter(value) {
		this.thing.classList.toggle('RESFiltered', value);
	}
}
