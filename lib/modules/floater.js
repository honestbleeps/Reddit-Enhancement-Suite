import _ from 'lodash';
import { $ } from '../vendor';
import { getHeaderOffset } from '../utils';

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
				.append('<ul>');
		},
		go() {
			window.addEventListener('scroll', _.debounce(() => this.onScroll(), 300));
			setTimeout(() => this.onScroll(), 1000);
		},
		add(element, options) {
			if (options && options.separate) {
				this.$element.append(element);
			} else {
				const $container = $('<li />');
				$container.append(element);
				this.$element.find('> ul').append($container);
			}
		},
		getOffset: _.once(() => 5 + getHeaderOffset() + $('#header-bottom-left .tabmenu').height()),
		onScroll() {
			const show = window.scrollY > this.getOffset();
			if (show) this.$element.css('top', this.getOffset());
			this.$element.toggle(show);
		},
	},
};

module.beforeLoad = () => {
	for (const container of Object.values(containers)) {
		if (!container.$element && typeof container.renderElement === 'function') {
			container.$element = container.renderElement();
		}
	}
};

module.afterLoad = () => {
	const elements = _.map(containers, container => container.$element);
	$(document.body).append(elements);

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
		container.$element.append(element);
	}
}
