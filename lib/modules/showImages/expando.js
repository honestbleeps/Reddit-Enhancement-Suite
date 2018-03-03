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
import type { Media } from '../showImages';

export const expandos: WeakMap<Element, Expando> = new WeakMap();

// Used for specifying primary expando for any given link
export const primaryExpandos: Map<string /* href */, Expando> = new Map();

type OnExpandCallback = () => void;

type ExpandOptions = { scrollOnMoveError?: boolean };

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
				types: [
					'native',
					button.classList.contains('selftext') ? 'selftext' : null,
				].filter(v => v),
				ready: true,
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

	href: string;
	inText: boolean;
	ready: boolean = false;
	locked: boolean;
	unlock: ?() => {};

	box: HTMLElement;
	button: HTMLElement;

	open: boolean = false;
	expandWanted: boolean = false;

	expandCallbacks: OnExpandCallback[] = [];

	media: ?Media;
	generateMedia: ?() => Media;

	types: string[] = [];

	buttonInfo: {|
		title: string,
		mediaClass: string,
	|} = {
		title: 'Expando is not yet ready',
		mediaClass: '',
	};

	constructor(href: *, lock: *, unlock: *) {
		this.href = href;
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

	updateButton() {
		let { mediaClass, title } = this.buttonInfo;

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
		return primaryExpandos.get(this.href);
	}

	isPrimary(): boolean {
		return this.getPrimary() === this || !this.getPrimary();
	}

	setAsPrimary() {
		const primary = this.getPrimary();
		if (primary && primary.media) {
			if (!primary.media.supportsMoveInDOM && primary.media.isAttached()) {
				throw new Error('Media cannot be moved in DOM');
			}

			this.media = primary.media;
		}

		primaryExpandos.set(this.href, this);

		if (primary) primary.empty();
	}

	initialize(options: {| generateMedia: *, buttonInfo: *, types: * |}) {
		this.generateMedia = options.generateMedia;
		this.buttonInfo = options.buttonInfo;
		this.types = options.types;
		this.ready = true;

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

		if (!this.ready) {
			this.expandWanted = true;
			this.updateButton();
			return;
		}

		this.box.hidden = false;

		this.attachMedia();
		if (this.media) this.media.expand();

		this.open = true;
		this.expandWanted = false;
		this.updateButton();

		for (const callback of this.expandCallbacks) callback();
	}

	collapse() {
		if (!this.ready) {
			this.expandWanted = false;
			return;
		}

		this.open = false;
		this.updateButton();

		if (this.media) {
			const removeInstead = this.media.collapse();
			if (removeInstead /*:: && this.media */) {
				this.media.element.remove();
			}
		}

		this.box.hidden = true;
	}

	scrollToButton(returnElement?: Element) {
		const _returnElement = returnElement;
		if (_returnElement) {
			$('<span title="Restore position" class="res-expando-restore-position">')
				.insertAfter(this.button)
				.click(e => {
					e.target.remove();
					scrollToElement(_returnElement, null, { scrollStyle: 'middle' });
				});
		}

		scrollToElement(this.button, null, { scrollStyle: 'top' });
	}

	attachMedia() {
		if (!this.generateMedia) throw new Error('Cannot attach media without `generateMedia`');
		this.media = this.media || this.generateMedia();
		(this.box.firstElementChild: any).appendChild(this.media.element);
		if (/*:: this.media && */ this.media.onAttach) this.media.onAttach();
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
		if (primaryExpandos.get(this.href) === this) primaryExpandos.delete(this.href);
	}

	empty() {
		if (this.media) {
			this.media.element.remove();
			delete this.media;
		}
		if (this.button) {
			if (this.open) this.collapse();
			else this.updateButton();
		}
	}
}
