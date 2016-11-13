import { $ } from '../vendor';
import expandoTemplate from '../templates/expando.mustache';
import { scrollToElement, invokeAll } from './';

// @type {WeakMap.<expandoButton, Expando>}
export const expandos = new WeakMap();

// Used for specifying primary expando for any given link
// @type {Map.<string, Expando>} - key: href
export const primaryExpandos = new Map();

export class Expando {
	constructor(inText, requiresPermission) {
		this.inText = inText;
		this.requiresPermission = requiresPermission;

		this.box = $(expandoTemplate())[0];
		this.button = document.createElement('a');
		this.updateButton();

		this.open = false;
		this.expandWanted = false;

		this.expandCallbacks = [];
	}

	onExpand(callback) {
		this.expandCallbacks.push(callback);
	}

	getTypes() {
		const types = [];

		if (this.mediaOptions) {
			types.push(
				this.mediaOptions.type.toLowerCase(),
				this.mediaOptions.muted ? 'muted' : 'non-muted',
				...((this.mediaOptions.expandoClass || '').toLowerCase().split(' ')).filter(v => v)
			);
		}

		return types;
	}

	updateButton() {
		let mediaClass, title;

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
				title ? `${title} (` : '',
				'duplicate link',
				title ? ')' : '',
			].join('');
		}

		this.button.title = title;
	}

	getPrimary() {
		return primaryExpandos.get(this.href);
	}

	isPrimary() {
		return this.getPrimary() === this || !this.getPrimary();
	}

	setAsPrimary(force) {
		const primary = this.getPrimary();
		if (!force && primary && primary.media) {
			if (document.body.contains(primary.media) && primary.mediaOptions.type === 'IFRAME') {
				// iframe reloads when reattached after being moving in DOM / becoming parentless
				throw new Error('Could not set as primary since iframe is active');
			}

			this.media = primary.media;
		}

		primaryExpandos.set(this.href, this);

		if (primary) primary.empty();
	}

	initialize() {
		if (!this.getPrimary()) this.setAsPrimary();

		if (this.expandWanted) this.expand();
		else this.updateButton();
	}

	toggle(options) {
		if (this.open) this.collapse();
		else this.expand(options);
	}

	expand({ scrollOnMoveError = false } = {}) {
		if (!this.isAttached()) {
			this.destroy();
			return;
		}

		try {
			if (!this.isPrimary(!scrollOnMoveError)) this.setAsPrimary();
		} catch (e) {
			// If another expando still is primary, scroll to it instead
			if (scrollOnMoveError && !this.isPrimary()) {
				const primary = this.getPrimary();
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
		if (this.media.expand) this.media.expand();

		this.open = true;
		this.expandWanted = false;
		this.updateButton();

		this.expandCallbacks::invokeAll();
	}

	collapse() {
		if (!this.isAttached()) {
			this.destroy();
			return;
		}

		if (!this.mediaOptions) {
			this.expandWanted = false;
			return;
		}

		this.open = false;
		this.updateButton();

		if (this.media && this.media.collapse) {
			const removeInstead = this.media.collapse();
			if (removeInstead) {
				this.media.remove();
			}
		}

		this.box.hidden = true;
	}

	scrollToButton(returnElement = null) {
		if (returnElement) {
			$('<span title="Restore position" class="res-expando-restore-position">')
				.insertAfter(this.button)
				.click(e => {
					e.target.remove();
					scrollToElement(returnElement, { scrollStyle: 'middle' });
				});
		}

		scrollToElement(this.button, { scrollStyle: 'top' });
	}

	attachMedia() {
		this.media = this.media || this.generateMedia();
		const wasAttached = !!this.media.offsetParent;
		this.box.appendChild(this.media);
		if (!wasAttached) this.onMediaAttach();
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
			this.button.remove();
			delete this.button;
		}
		this.empty();
		expandos.delete(this);
		if (primaryExpandos.get(this.href) === this) primaryExpandos.delete(this.href);
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
