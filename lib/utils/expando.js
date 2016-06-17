import { $ } from '../vendor';
import expandoTemplate from '../templates/expando.mustache';

// @type {WeakMap.<expandoButton, Expando>}
export const expandos = new WeakMap();

// Used for specifying primary expando for any given link
// @type {Map.<string, Expando>} - key: href
export const primaryExpandos = new Map();

export class Expando {
	constructor(inText) {
		this.inText = inText;

		this.box = $(expandoTemplate())[0];
		this.mediaContainer = this.box.querySelector('.res-expando-media');
		this.mediaContainer.addEventListener('mediaResize', ::this.syncPlaceholder);

		this.button = document.createElement('a');
		this.updateButton();

		this.open = false;
		this.expandWanted = false;
	}

	adjustInnersize(width, marginLeft) {
		this.mediaContainer.style.width = `${width}px`;
		this.mediaContainer.style.marginLeft = `${marginLeft}px`;

		if (this.mediaContainer.classList.contains('res-expando-independent')) {
			this.syncPlaceholder();
		}
	}

	syncPlaceholder() {
		this.mediaContainer.classList.add('res-expando-independent');

		// Set the 'placeholder' height to that of the child element (which has position: absolute)
		this.box.style.height = `${this.mediaContainer.clientHeight}px`;
	}

	updateButton() {
		this.button.title = '';

		let mediaClass;
		if (this.mediaOptions) {
			const defaultClass = {
				IMAGE: 'image',
				GALLERY: 'image gallery',
				TEXT: 'selftext',
				VIDEO: this.mediaOptions.muted ? 'video-muted' : 'video',
				IFRAME: this.mediaOptions.muted ? 'video-muted' : 'video',
				AUDIO: 'video', // yes, still class "video", that's what reddit uses.
				NOEMBED: 'video',
				GENERIC_EXPANDO: 'selftext',
			}[this.mediaOptions.type];
			mediaClass = this.mediaOptions.expandoClass || defaultClass;

			if (this.mediaOptions.type === 'GALLERY') {
				this.button.title += `${this.mediaOptions.src.length} items in gallery`;
			}
		}

		this.button.className = [
			'expando-button toggleImage',
			mediaClass || 'expando-button-loading',
			this.open || this.expandWanted ? 'expanded' : 'collapsed collapsedExpando',
			this.inText ? 'commentImg' : 'linkImg',
		].join(' ');

		if (!this.isPrimary()) {
			this.button.classList.add('expando-button-duplicate');
			this.button.title = [
				this.button.title ? `${this.button.title}  (` : '',
				'duplicate link',
				this.button.title ? ')' : '',
			].join('');
		}
	}

	getPrimary() {
		return primaryExpandos.get(this.href);
	}

	isPrimary() {
		return this.getPrimary() === this || !this.getPrimary();
	}

	setAsPrimary() {
		const primary = this.getPrimary();
		if (primary && primary.media) {
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

	toggle() {
		if (this.open) this.collapse();
		else this.expand();
	}

	expand() {
		if (!this.isAttached()) {
			this.destroy();
			return;
		}

		try {
			if (!this.isPrimary()) this.setAsPrimary();
		} catch (e) {
			console.log('Could not expand expando', e);

			// If another expando still is primary, scroll to it instead
			if (!this.isPrimary()) {
				const primary = this.getPrimary();
				primary.button.scrollIntoView();
				primary.expand();
			}

			return;
		}

		if (!this.mediaOptions) {
			this.expandWanted = true;
			this.updateButton();
			return;
		}

		window.addEventListener('resize', this.resize);
		this.resize();

		this.box.hidden = false;

		if (!this.media || this.media.parentElement !== this.mediaContainer) this.attachMedia();
		if (this.media.expand) this.media.expand();

		this.open = true;
		this.expandWanted = false;
		this.updateButton();
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

		window.removeEventListener('resize', this.resize);
	}

	attachMedia() {
		const wasBuilt = !!this.media;
		this.media = this.media || this.generateMedia();

		this.mediaContainer.appendChild(this.media);
		if (this.media.ready) this.media.ready.then(::this.syncPlaceholder);

		if (!wasBuilt) this.onMediaAttach();
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
