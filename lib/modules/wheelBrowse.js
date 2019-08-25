/* @flow */

import { Module } from '../core/module';
import { SelectedThing, isPageType, string } from '../utils';
import * as Floater from './floater';
import * as SettingsNavigation from './settingsNavigation';
import { Expando } from './showImages/expando';

export const module: Module<*> = new Module('wheelBrowse');

module.moduleName = 'wheelBrowseName';
module.category = 'browsingCategory';
module.description = 'wheelBrowseDesc';

let behavior: ?(HTMLElement => (('down' | 'up', Event) => void));

module.contentStart = () => {
	if (!behavior && isPageType('linklist')) useLinklistBehavior();
	if (!behavior) return;

	const wheelBrowseWidget = string.html`<div hidden class="res-wheel-browse"></div>`;

	const onWheel = behavior(wheelBrowseWidget);

	SelectedThing.addListener(current => {
		wheelBrowseWidget.hidden = !current;
	}, 'instantly');

	wheelBrowseWidget.addEventListener('wheel', (e: WheelEvent) => {
		e.stopImmediatePropagation();
		e.preventDefault();
		onWheel(e.deltaY > 0 ? 'down' : 'up', e);
	});

	Floater.addElement(wheelBrowseWidget, { order: -1 });
};

export function setCallback(v: typeof behavior) {
	behavior = v;
}

function useLinklistBehavior() {
	const galleryPart = string.html`<div hidden class="res-wheel-browse-gallery"></div>`;
	let media;

	function updateGalleryPart(direction?: 'up' | 'down') {
		const expando = Expando.getEntryExpandoFrom(SelectedThing.current);
		media = expando && expando.media;

		galleryPart.hidden = !(
			media &&
			media.element.classList.contains('res-gallery-slideshow') &&
			( // Do not show the gallery scroll widget when at the end of the gallery
				!(direction === 'down' && media.element.querySelector('[last-piece=true]')) &&
				!(direction === 'up' && media.element.querySelector('[first-piece=true]'))
			)
		);
	}

	setCallback(wheelBrowseWidget => {
		wheelBrowseWidget.addEventListener('click', () => SettingsNavigation.open(module.moduleID));
		wheelBrowseWidget.addEventListener('mouseenter', () => { updateGalleryPart(); });
		wheelBrowseWidget.append(galleryPart);

		return (direction, { target }) => {
			if (target === wheelBrowseWidget) {
				SelectedThing.move(direction, { allowMediaBrowse: true, scrollStyle: 'top' });
			} else if (target === galleryPart) {
				const clicker = media && media.element.querySelector(direction === 'down' ? '.res-gallery-next' : '.res-gallery-previous');
				if (clicker) clicker.click();
				updateGalleryPart(direction);
			}
		};
	});
}
