/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Floater from './floater';
import * as KeyboardNav from './keyboardNav';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('wheelBrowse');

module.moduleName = 'wheelBrowseName';
module.category = 'browsingCategory';
module.description = 'wheelBrowseDesc';
module.include = [
	'linklist',
];

module.go = () => {
	const wheelBrowseWidget = $('<div class="res-wheel-media-browse"></div>')
		.click(() => SettingsNavigation.loadSettingsPage(module.moduleID))
		.hover(() => { updateGalleryPart(); })
		.get(0);
	const galleryPart = $('<div hidden class="res-wheel-media-browse-gallery"></div>')
		.appendTo(wheelBrowseWidget)
		.get(0);

	function updateGalleryPart(selected = SelectedEntry.selectedThing(), scrollDirection = 'down') {
		const expando = selected && selected.getEntryExpando();

		galleryPart.hidden = !(
			expando &&
			expando.media &&
			expando.media.classList.contains('res-gallery-slideshow') &&
			(
				!scrollDirection ||
				( // Do not show the gallery scroll widget when at the end of the gallery
					!(scrollDirection === 'down' && expando.media.querySelector('[last-piece=true]')) &&
					!(scrollDirection === 'up' && expando.media.querySelector('[first-piece=true]'))
				)
			)
		);
	}

	let isSelectionCause = false;

	function scrollWidget(target, scrollDirection) {
		if (target === wheelBrowseWidget) {
			isSelectionCause = true;
			if (scrollDirection === 'down') KeyboardNav.module.options.moveDown.callback();
			else KeyboardNav.module.options.moveUp.callback();
			isSelectionCause = false;
		} else if (target === galleryPart) {
			if (scrollDirection === 'down') KeyboardNav.module.options.nextGalleryImage.callback();
			else KeyboardNav.module.options.previousGalleryImage.callback();
			updateGalleryPart(undefined, scrollDirection);
		}
	}

	SelectedEntry.addListener((selected, unselected, options) => {
		// Avoid the floater disappearing when approaching the header, which may happen when using other scrollStyles
		if (isSelectionCause) options.scrollStyle = 'top';

		updateGalleryPart(selected);
	}, 'beforeScroll');

	wheelBrowseWidget.addEventListener('wheel', (e: WheelEvent) => {
		e.stopImmediatePropagation();
		e.preventDefault();
		scrollWidget(e.target, e.deltaY > 0 ? 'down' : 'up');
	});

	Floater.addElement(wheelBrowseWidget, { order: -1 });
};
