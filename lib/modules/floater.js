import _ from 'lodash';
import cssTemplate from '../templates/floaterVisibleAfterScrollStyles.mustache';
import { $ } from '../vendor';
import { addCSS, getHeaderOffset } from '../utils';

export const module = {};

module.moduleID = 'floater';
module.category = ['Productivity'];
module.moduleName = 'Floating Islands';
module.description = 'Managing free-floating RES elements';
module.alwaysEnabled = true;
module.hidden = true;

const defaultContainer = 'visibleAfterScroll';
const containers = {
	visibleAfterScroll: {
		renderElement() {
			return $('<div>', { id: 'NREFloat', class: 'res-floater-visibleAfterScroll' })
				.append('<ul>')
				.get(0);
		},
		css() {
			addCSS(cssTemplate({ offset: this.getOffset() }));
		},
		go() {
			window.addEventListener('scroll', _.debounce(() => this.onScroll(), 300));
			setTimeout(() => this.onScroll(), 500);
		},
		add(element, options) {
			if (options && options.separate) {
				$(this.element).append(element);
			} else {
				const $container = $('<li />');
				$container.append(element);
				$(this.element).find('> ul').append($container);
			}
		},
		getOffset() {
			if (typeof this._offset !== 'number') {
				this._offset = 5 + getHeaderOffset() + $('#header-bottom-left .tabmenu').height();
			}

			return this._offset;
		},
		onScroll() {
			const show = $(window).scrollTop() > this.getOffset();
			$(this.element).toggle(show);
		}
	}
};

module.beforeLoad = function() {
	for (const container of Object.values(containers)) {
		if (!container.element && typeof container.renderElement === 'function') {
			container.element = container.renderElement();
		}
	}
};

module.go = function() {
	const elements = _.map(containers, container => container.element);
	$(document.body).append(elements);

	Object.values(containers)
		.map(container => {
			if (typeof container.css === 'function') {
				return container.css();
			}
			return container.css;
		})
		.filter(css => css)
		.forEach(css => addCSS(css));

	for (const container of Object.values(containers)) {
		if (typeof container.go === 'function') {
			container.go();
		}
	}
};

export function addElement(element, options) {
	const container = containers[options && options.container] || containers[defaultContainer];
	if (typeof container.add === 'function') {
		container.add(element, options);
	} else {
		$(container.element).append(element);
	}
}
