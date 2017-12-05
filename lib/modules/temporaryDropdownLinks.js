/* @flow */

import { Module } from '../core/module';
import { downcast, string } from '../utils';
import { i18n } from '../environment';

export const module: Module<*> = new Module('temporaryDropdownLinks');
module.moduleName = 'temporaryDropdownLinksName';
module.category = 'browsingCategory';
module.description = 'temporaryDropdownLinksDesc';
module.options = {
	always: {
		type: 'boolean',
		value: false,
		description: 'temporaryDropdownLinksAlwaysDesc',
		title: 'temporaryDropdownLinksAlwaysTitle',
	},
};
module.include = [
	/\/(?:top|controversial)\/$/,
];

module.go = () => {
	setupMenu();
};

function setupMenu() {
	const mutateChoice = module.options.always.value ? removeListener : appendTemporaryButton;
	for (const choice: HTMLAnchorElement of (document.querySelectorAll('.menuarea .drop-choices a.choice'): any)) {
		const form = choice.closest('form');
		if (!form) continue;
		const { name, value } = downcast(form.querySelector('input'), HTMLInputElement);
		if (name && value) {
			mutateChoice(choice, name, value);
		}
	}
}

function removeListener(choice, name, value) {
	// rewrite the href and remove the onclick
	choice.search = `?${name}=${value}`;
	choice.removeAttribute('onclick');
}

function appendTemporaryButton(choice, name, value) {
	const url = new URL(choice.href);
	url.searchParams.set(name, value);
	const link = string.html`
		<a class="RES-dropdown-button" href="${url.href}">${i18n('temporaryDropdownLinksTemporarily')}</a>
	`;
	link.addEventListener('click', (e: MouseEvent) => e.stopPropagation());
	choice.appendChild(link);
}
