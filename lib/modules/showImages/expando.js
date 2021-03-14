/* @flow */

import { compact } from 'lodash-es';
import {
	click,
	filterMap,
} from '../../utils';
import type { Thing } from '../../utils';
import type { Media } from '../showImages';

export const expandos: Map<Element, Expando> = new Map();
export const activeExpandos: Set<Expando> = new Set();
const opened = new Set();

type OnExpandCallback = () => void;

export class Expando {
	static expandoSelector = '.expando-button, .search-expando-button';

	static getEntryExpandoFrom(thing: ?Thing): ?Expando {
		if (!thing) return null;

		const button = thing.entry.querySelector('.expando-button');
		if (!button) return null;

		let expando = expandos.get(button);

		if (!expando) {
			const box = thing.entry.querySelector('.expando');
			if (!box) return null;

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
					button.classList.contains('selftext') ? 'selftext' : // This may be muted, depending on its content (not possible to know before expanding)
					(box.dataset.cachedhtml || '').match(/\bvideo-player\b/) ? ['video', 'non-muted'] :
					(box.dataset.cachedhtml || '').match(/\<iframe\b/) ? ['iframe', 'non-muted'] :
					['image', 'muted'],
					// $FlowIssue Array#flat
				].flat().filter(Boolean),
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
		return compact([...Expando.getTextExpandosFrom(thing), Expando.getEntryExpandoFrom(thing)]);
	}

	href: string;
	inText: boolean;
	ready: boolean = false;

	lock: ?{ open: () => {}, promise: Promise<*> } = null;

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

	constructor(href: *) {
		this.href = href;

		this.box = document.createElement('div');
		this.box.classList.add('res-expando-box');
		this.box.hidden = true;

		this.button = document.createElement('a');
		this.button.addEventListener('click', () => this.toggle());
		this.updateButton();

		// Reddit may try to override the button classes
		new MutationObserver(() => { this.updateButton(); }).observe(this.button, { attributes: true });

		expandos.set(this.button, this);
	}

	onExpand(callback: OnExpandCallback) {
		this.expandCallbacks.push(callback);
	}

	updateButton() {
		let { mediaClass, title } = this.buttonInfo;

		if (this.lock) {
			mediaClass = 'expando-button-requires-permission';
			title = 'Click to request required permissions';
		}

		const classList = [
			'expando-button',
			...(mediaClass.split(' ') || ['expando-button-loading']),
			this.open || this.expandWanted ? 'expanded' : 'collapsed',
		].filter(Boolean);

		if (!this.expandWanted && !this.open && opened.has(this.href)) {
			classList.push('expando-button-duplicate');
			title += ' (link has already been opened)';
		}

		// Only invoke if there's actual changes, to prevent triggering the mutationobserver unnecessarily
		const btn = this.button;
		for (const v of btn.classList) if (!classList.includes(v)) btn.classList.remove(v);
		for (const v of classList) if (!btn.classList.contains(v)) btn.classList.add(v);
		if (btn.title !== title) btn.title = title;
	}

	initialize(options: {| generateMedia: *, buttonInfo: *, types: * |}) {
		this.generateMedia = options.generateMedia;
		this.buttonInfo = options.buttonInfo;
		this.types = options.types;
		this.ready = true;

		if (this.expandWanted) this.expand();
		else this.updateButton();
	}

	getDuplicates() {
		return Array.from(expandos.values()).filter(v => v !== this && v.href === this.href && document.contains(v.button));
	}

	async setLock(lock: *) {
		this.lock = lock;
		this.updateButton();

		await lock.promise;

		this.lock = null;
		this.updateButton();
	}

	toggle() {
		if (this.open) this.collapse();
		else this.expand();
	}

	expand() {
		if (this.lock || !this.ready) {
			this.expandWanted = true;
			if (this.lock) this.lock.open();
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

		opened.add(this.href);
		for (const duplicate of this.getDuplicates()) duplicate.updateButton();
	}

	collapse() {
		this.box.hidden = true;

		this.open = false;
		this.expandWanted = false;
		this.updateButton();

		if (this.media) {
			this.media.collapse();
		}
	}

	attachMedia() {
		const wrapper = this.box.firstElementChild || document.createElement('div');
		if (!this.generateMedia) throw new Error('Cannot attach media without `generateMedia`');
		this.media = this.media || this.generateMedia();
		wrapper.append(this.media.element);
		wrapper.classList.add('res-expando-box-inner');
		this.box.append(wrapper);
		if (/*:: this.media && */ this.media.onAttach) this.media.onAttach();
		activeExpandos.add(this);
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
		activeExpandos.delete(this);
	}
}
