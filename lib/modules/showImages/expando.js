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

export const expandos: WeakMap<Element, Expando> = new WeakMap();

// Used for specifying primary expando for any given link
export const primaryExpandos: Map<string /* href */, Expando> = new Map();

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

		const button = thing.entry.querySelector('.expando-button');
		if (!button) return null;

		let expando = expandos.get(button);

		if (!expando) {
			const box = thing.entry.querySelector('.expando');

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
					button.replaceWith(buttonPlaceholder);
					box.replaceWith(boxPlaceholder);
				},
				reattach() {
					buttonPlaceholder.replaceWith(button);
					boxPlaceholder.replaceWith(box);
				},
				getTypes() {
					return [
						'native',
						this.button.classList.contains('selftext') ? 'selftext' : null,
					].filter(v => v);
				},
				isLoaded() { return true; },
			}: any /* TODO: this is kinda dangerous, there should be a subclass instead */);

			expandos.set(button, expando);
		}

		return expando;
	}

	static getTextExpandosFrom(thing: ?Thing): Expando[] {
		if (!thing) return [];
		const md = thing.entry.querySelector('.md');
		if (!md) return [];
		return filterMap(Array.from(md.querySelectorAll(Expando.expandoSelector)), v => {
			const exp = expandos.get(v);
			if (exp) return [exp];
		});
	}

	static getAllExpandosFrom(thing: ?Thing): Expando[] {
		return _.compact([...Expando.getTextExpandosFrom(thing), Expando.getEntryExpandoFrom(thing)]);
	}

	inText: boolean;
	locked: boolean;
	unlock: ?() => {};

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

	constructor(lock: *, unlock: *) {
		this.locked = !!lock;
		if (lock) lock.then(() => { this.locked = false; this.updateButton(); });
		this.unlock = unlock;

		this.box = string.html`
			<div hidden class="res-expando-box" style="min-height: 20px">
				<div class="res-expando-box-inner"></div>
			</div>
		`;
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

	isLoaded() {
		return !!this.mediaOptions;
	}

	updateButton() {
		let title = '';
		let mediaClass;

		if (this.mediaOptions) {
			({ mediaClass, title } = this.mediaOptions.buttonInfo);
		} else {
			title = 'Expando is not yet ready';
		}

		if (this.locked) {
			mediaClass = 'expando-button-requires-permission';
			title = 'Click to request required permissions';
		}

		this.button.className = [
			'expando-button toggleImage',
			mediaClass || 'expando-button-loading',
			this.open || this.expandWanted ? 'expanded' : 'collapsed collapsedExpando',
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
		(this.box.firstElementChild: any).appendChild(this.media);
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
