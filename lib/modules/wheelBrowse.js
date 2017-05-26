/* @flow */

import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Floater from './floater';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
import { Expando } from './showImages/expando';

export const module: Module<*> = new Module('wheelBrowse');

module.moduleName = 'wheelBrowseName';
module.category = 'browsingCategory';
module.description = 'wheelBrowseDesc';
module.include = [
	'linklist',
];

module.go = () => {
	const wheelBrowseWidget = $('<div hidden class="res-wheel-media-browse"></div>')
		.click(() => SettingsNavigation.loadSettingsPage(module.moduleID))
		.hover(() => { updateGalleryPart(); })
		.get(0);
	const galleryPart = $('<div hidden class="res-wheel-media-browse-gallery"></div>')
		.appendTo(wheelBrowseWidget)
		.get(0);
	let media;

	function updateGalleryPart(scrollDirection?: 'up' | 'down') {
		const expando = Expando.getEntryExpandoFrom(SelectedEntry.selectedThing);
		media = expando && expando.media;

		galleryPart.hidden = !(
			media &&
			media.classList.contains('res-gallery-slideshow') &&
			( // Do not show the gallery scroll widget when at the end of the gallery
				!(scrollDirection === 'down' && media.querySelector('[last-piece=true]')) &&
				!(scrollDirection === 'up' && media.querySelector('[first-piece=true]'))
			)
		);
	}

	function scrollWidget(target, scrollDirection) {
		if (target === wheelBrowseWidget) {
			SelectedEntry.move(scrollDirection, { allowMediaBrowse: true, scrollStyle: 'top' });
		} else if (target === galleryPart) {
			const clicker = media && media.querySelector(scrollDirection === 'down' ? '.res-gallery-next' : '.res-gallery-previous');
			if (clicker) clicker.click();
			updateGalleryPart(scrollDirection);
		}
	}

	SelectedEntry.addListener(selected => {
		wheelBrowseWidget.hidden = !selected;
		updateGalleryPart();
	}, 'beforePaint');

	wheelBrowseWidget.addEventListener('wheel', (e: WheelEvent) => {
		e.stopImmediatePropagation();
		e.preventDefault();
		scrollWidget(e.target, e.deltaY > 0 ? 'down' : 'up');
	});

	Floater.addElement(wheelBrowseWidget, { order: -1 });
};
