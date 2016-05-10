const classes = new Set();

export function add(...newClasses) {
	newClasses.forEach(cls => [].concat(cls).forEach(cls => classes.add(cls)));

	if (document.html) {
		document.html.classList.add(...classes);
	}
	if (document.body) {
		document.body.classList.add(...classes);
	}
}

export function remove(...removeClasses) {
	removeClasses = removeClasses.reduce((acc, cls) => acc.concat(cls), []);

	removeClasses.forEach(cls => classes.delete(cls));

	if (document.html) {
		document.html.classList.remove(...removeClasses);
	}
	if (document.body) {
		document.body.classList.remove(...removeClasses);
	}
}
