/* @flow */

import _ from 'lodash';
import { $ } from '../../vendor';
import {
	click,
	filterMap,
	scrollToElement,
	string,
} from '../../utils';
import type { Thing } from '../../utils';

// @type {WeakMap.<expandoButton, Expando>}
export const expandos: WeakMap<Element, Expando> = new WeakMap();

// Used for specifying primary expando for any given link
// @type {Map.<string, Expando>} - key: href
export const primaryExpandos: Map<string, Expando> = new Map();

type OnExpandCallback = () => void;

type ExpandOptions = { scrollOnMoveError?: boolean };

declare interface ExpandoMediaElement extends HTMLElement {
	remove: () => void;
	expand?: () => void | Promise<void>;
	collapse?: () => ?boolean;
	unload?: () => void;
	restore?: () => void;
	emitResizeEvent: () => void;
	ready?: Promise<void>;
	state?: number;
	independent?: boolean;
}

export type { ExpandoMediaElement };

type MediaOptions = {
	moduleID: string,
	type: string,
	attribution: boolean,
	href: string,
	muted: boolean,
	expandoClass?: string,
	buttonInfo: {
		title: string,
		mediaClass: string,
	},
};

export class Expando {
	static expandoSelector = '.expando-button, .search-expando-button';

	static getEntryExpandoFrom(thing: ?Thing): ?Expando {
		if (!thing) return null;

		const button = $(thing.entry).find('> .expando-button')[0];
		if (!button) return null;

		let expando = expandos.get(button);

		if (!expando) {
			const box = $(thing.entry).find('> .expando')[0];

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

	static getTextExpandosFrom(thing: ?Thing): Expando[] {
		if (!thing) return [];
		const entryExpando = Expando.getEntryExpandoFrom(thing);
		return filterMap(Array.from(thing.entry.querySelectorAll(Expando.expandoSelector)), v => {
			const exp = expandos.get(v);
			if (exp && exp !== entryExpando) return [exp];
		});
	}

	static getAllExpandosFrom(thing: ?Thing): Expando[] {
		return _.compact([...Expando.getTextExpandosFrom(thing), Expando.getEntryExpandoFrom(thing)]);
	}

	inText: boolean;
	requiresPermission: boolean;

	box: HTMLElement;
	button: HTMLElement;

	open: boolean = false;
	expandWanted: boolean = false;

	expandCallbacks: OnExpandCallback[] = [];

	href: ?string;
	media: ?ExpandoMediaElement;
	mediaOptions: ?MediaOptions;
	generateMedia: ?() => ExpandoMediaElement;
	onMediaAttach: ?() => void;

	constructor(inText: boolean, requiresPermission: boolean) {
		this.inText = inText;
		this.requiresPermission = requiresPermission;

		this.box = string.html`<div hidden class="res-expando-box" style="min-height: 20px"></div>`;
		this.button = document.createElement('a');
		this.updateButton();
	}

	onExpand(callback: OnExpandCallback) {
		this.expandCallbacks.push(callback);
	}

	getTypes() {
		if (this.mediaOptions) {
			return [
				this.mediaOptions.type,
				this.mediaOptions.muted ? 'muted' : 'non-muted',
				...((this.mediaOptions.expandoClass || '').split(' ')),
			].filter(v => v).map(s => s.toLowerCase());
		}

		return [];
	}

	updateButton() {
		let title = '';
		let mediaClass;

		if (this.mediaOptions) {
			({ mediaClass, title } = this.mediaOptions.buttonInfo);
		} else {
			title = 'Expando is not yet ready';
		}

		if (this.requiresPermission) {
			mediaClass = 'expando-button-requires-permission';
			title = 'Click to request required permissions';
		}

		this.button.className = [
			'expando-button toggleImage',
			mediaClass || 'expando-button-loading',
			this.open || this.expandWanted ? 'expanded' : 'collapsed collapsedExpando',
			this.inText ? 'commentImg' : 'linkImg',
		].join(' ');

		if (!this.isPrimary()) {
			this.button.classList.add('expando-button-duplicate');
			title = [
				title ? `${title}  (` : '',
				'duplicate link',
				title ? ')' : '',
			].join('');
		}

		this.button.title = title;
	}

	getPrimary(): Expando | void {
		if (typeof this.href === 'string') {
			return primaryExpandos.get(this.href);
		}
	}

	isPrimary(): boolean {
		return this.getPrimary() === this || !this.getPrimary();
	}

	setAsPrimary(force?: boolean = false) {
		const primary = this.getPrimary();
		if (!force && primary && primary.media) {
			if (primary.mediaOptions && primary.mediaOptions.type === 'IFRAME' && document.body.contains(primary.media)) {
				// iframe reloads when reattached after being moving in DOM / becoming parentless
				throw new Error('Could not set as primary since iframe is active');
			}

			this.media = primary.media;
		}

		if (this.href) primaryExpandos.set(this.href, this);

		if (primary) primary.empty();
	}

	initialize() {
		if (!this.getPrimary()) this.setAsPrimary();

		if (this.expandWanted) this.expand();
		else this.updateButton();
	}

	toggle(options?: ExpandOptions) {
		if (this.open) this.collapse();
		else this.expand(options);
	}

	expand({ scrollOnMoveError = false }: ExpandOptions = {}) {
		try {
			if (!this.isPrimary()) this.setAsPrimary();
		} catch (e) {
			// If another expando still is primary, scroll to it instead
			const primary = this.getPrimary();
			if (scrollOnMoveError && primary && !this.isPrimary()) {
				primary.expand();
				primary.scrollToButton(this.button);
			} else {
				console.log('Could not expand expando', e);
			}

			return;
		}

		if (!this.mediaOptions) {
			this.expandWanted = true;
			this.updateButton();
			return;
		}

		this.box.hidden = false;
		this.box.classList.add(`res-media-host-${this.mediaOptions.moduleID}`);

		if (!this.media || this.media.parentElement !== this.box) this.attachMedia();
		if (this.media && this.media.expand) this.media.expand();

		this.open = true;
		this.expandWanted = false;
		this.updateButton();

		for (const callback of this.expandCallbacks) callback();
	}

	collapse() {
		if (!this.mediaOptions) {
			this.expandWanted = false;
			return;
		}

		this.open = false;
		this.updateButton();

		if (this.media && this.media.collapse) {
			const removeInstead = this.media.collapse();
			if (removeInstead /*:: && this.media */) {
				this.media.remove();
			}
		}

		this.box.hidden = true;
	}

	scrollToButton(returnElement?: Element) {
		if (returnElement) {
			$('<span title="Restore position" class="res-expando-restore-position">')
				.insertAfter(this.button)
				.click(e => {
					e.target.remove();
					scrollToElement((returnElement: any), { scrollStyle: 'middle' });
				});
		}

		scrollToElement(this.button, { scrollStyle: 'top' });
	}

	attachMedia() {
		if (!this.generateMedia) throw new Error('Cannot attach media without `generateMedia`');
		this.media = this.media || this.generateMedia();
		const wasAttached = !!this.media.offsetParent;
		this.box.appendChild(this.media);
		if (!wasAttached && this.onMediaAttach) this.onMediaAttach();
	}

	isAttached() {
		return document.body.contains(this.button) && document.body.contains(this.box);
	}

	destroy() {
		if (this.box) {
			this.box.remove();
			delete this.box;
		}
		if (this.button) {
			expandos.delete(this.button);
			this.button.remove();
			delete this.button;
		}
		this.empty();
		if (this.href && primaryExpandos.get(this.href) === this) primaryExpandos.delete(this.href);
	}

	empty() {
		if (this.media) {
			this.media.remove();
			delete this.media;
		}
		if (this.button) {
			if (this.open) this.collapse();
			else this.updateButton();
		}
	}
}
