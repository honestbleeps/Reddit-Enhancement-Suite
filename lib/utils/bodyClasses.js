/* @flow */

const classes: $FlowIssue = new Set(); // https://github.com/facebook/flow/issues/1059

export function add(...newClasses: string[]) {
	newClasses.forEach(cls => [].concat(cls).forEach(cls => classes.add(cls)));

	if (document.documentElement) {
		document.documentElement.classList.add(...classes);
	}
	if (document.body) {
		document.body.classList.add(...classes);
	}
}

export function remove(...removeClasses: string[]) {
	removeClasses = removeClasses.reduce((acc, cls) => acc.concat(cls), []);

	removeClasses.forEach(cls => classes.delete(cls));

	if (document.documentElement) {
		document.documentElement.classList.remove(...removeClasses);
	}
	if (document.body) {
		document.body.classList.remove(...removeClasses);
	}
}

export function toggle(toggleOn: boolean, ...classes: string[]) {
	if (toggleOn) {
		add(...classes);
	} else {
		remove(...classes);
	}
}
