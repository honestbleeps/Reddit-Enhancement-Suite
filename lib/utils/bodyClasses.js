const classes = new Set();

export function add(...newClasses) {
	newClasses.forEach(cls => [].concat(cls).forEach(cls => classes.add(cls)));

	if (document.documentElement) {
		document.documentElement.classList.add(...classes);
	}
	if (document.body) {
		document.body.classList.add(...classes);
	}
}

export function remove(...removeClasses) {
	removeClasses = removeClasses.reduce((acc, cls) => acc.concat(cls), []);

	removeClasses.forEach(cls => classes.delete(cls));

	if (document.documentElement) {
		document.documentElement.classList.remove(...removeClasses);
	}
	if (document.body) {
		document.body.classList.remove(...removeClasses);
	}
}

export function toggle(toggleOn, ...classes) {
	if (toggleOn) {
		add(...classes);
	} else {
		remove(...classes);
	}
}
