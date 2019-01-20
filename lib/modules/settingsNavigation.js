/* @flow */

import { RES_SETTINGS_HASH } from '../constants/urlHashes';
import { context, isOptionsPage, getOptionsURL, i18n, openNewTab } from '../environment';
import { string } from '../utils';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import * as Menu from '../modules/menu';
import * as CommandLine from '../modules/commandLine';

export const module: Module<*> = new Module('settingsNavigation');

module.moduleName = 'settingsNavName';
module.category = 'coreCategory';
module.description = 'settingsNavDesc';
module.hidden = true;
module.alwaysEnabled = true;
module.options = {
	showAllOptions: {
		title: 'settingsNavigationShowAllOptionsTitle',
		type: 'boolean',
		value: true,
		description: 'settingsNavigationShowAllOptionsDesc',
		noconfig: true,
	},
	showAllOptionsAlert: {
		title: 'settingsNavigationShowAllOptionsAlertTitle',
		type: 'boolean',
		value: true,
		description: 'settingsNavigationShowAllOptionsAlertDesc',
		noconfig: true,
	},
};

module.beforeLoad = () => {
	Menu.addMenuItem(
		() => string.html`<div id="SettingsConsole">
			${i18n('RESSettingsConsole')}
			<span module="search" class="RESMenuItemButton res-icon" title="search settings">\uF094</span>
		</div>`,
		e => open(e.target.getAttribute('module')),
		-10
	);

	CommandLine.registerCommand(/^set(?:t?ings?)?$/, 'settings [words to search for]- search RES settings console',
		(command, val) => `Search RES settings ${val && val.length ? ` for: ${val}` : ''}`,
		(command, val) => open('search', val)
	);
};

module.go = () => {
	function findModules(val) {
		return Modules.all()
			.filter(v => !v.hidden)
			.map(v => v.moduleID)
			.filter(id => id.toLowerCase().match(val.toLowerCase()))
			.sort();
	}

	CommandLine.registerCommand(/^mod(?:ule?)?$/, 'module [name of module] - open module settings',
		(command, val) => {
			const matches = findModules(val);
			return matches.length ? `Open module ${matches[0]}` : 'Could not find any matching module.';
		},
		(command, val) => open(findModules(val)[0])
	);

	window.addEventListener('popstate', () => { update(); });
	update();

	// Open settings links (regardless of hostname)
	document.body.addEventListener('click', (e: MouseEvent) => {
		if (e.ctrlKey) return; // Except when intentionally opened in a new tab
		const url = e.target instanceof HTMLAnchorElement && new URL(e.target.href, location.origin);
		if (url && isSettingsUrl(url.href)) {
			update(url);
			e.stopImmediatePropagation();
			e.preventDefault();
		}
	}, true);
};

export function makeUrlHashLink(moduleID: string, optionKey?: string, displayText?: string, cssClass?: string): string {
	const mod = Modules.getUnchecked(moduleID);
	if (!displayText) {
		if (mod && optionKey) {
			displayText = i18n(mod.options[optionKey].title);
		} else if (mod) {
			displayText = i18n(mod.moduleName);
		} else {
			displayText = 'Settings';
		}
	}

	let title = ['RES Settings'];
	if (mod) {
		title.push(i18n(mod.moduleName));
	}
	if (optionKey) {
		title.push(optionKey);
	}
	title = title.join(' &gt; ');

	const hash = makeUrlHash(moduleID, optionKey);
	return `<a class="${cssClass || ''}" href="${hash}" title="${title}">${displayText}</a>`;
}

export function parseHash(hash: string) {
	const params = hash.match(/\/(?:\w|\s|%20)+/g);
	return {
		moduleID: params && params[0] && params[0].substring(1).replace('%20', ' ') || undefined,
		optionKey: params && params[1] && params[1].substring(1).replace('%20', ' ') || undefined,
	};
}

export function makeUrlHash(moduleID?: string, optionKey?: string): string {
	const hashComponents = [RES_SETTINGS_HASH];

	if (moduleID) {
		hashComponents.push(moduleID);
	}

	if (moduleID && optionKey) {
		hashComponents.push(optionKey);
	}

	return hashComponents.join('/');
}

export function isSettingsUrl(href: string): boolean {
	const { origin, hash } = new URL(href, location.origin);

	const sameSite = origin === getOptionsURL().origin ||
		origin.split('.').slice(-2).join('.') === context.origin.split('.').slice(-2).join('.');
	if (!sameSite) return false;

	return hash.startsWith(RES_SETTINGS_HASH) ||
		hash.startsWith('#!settings'); /* legacy */
}

export function setHash(hash: string) {
	if (window.top === window) {
		if (parseHash(location.hash).moduleID === parseHash(hash).moduleID) {
			history.replaceState(null, '', hash);
		} else {
			history.pushState(null, '', hash);
		}
	} else {
		window.parent.postMessage({ hash }, '*');
	}
}

let iframe;

export function update(url: { href: string, hash: string } = location) {
	if (isSettingsUrl(url.href)) {
		const { moduleID, optionKey } = parseHash(url.hash);
		open(moduleID, optionKey);
	} else if (iframe) {
		iframe.contentWindow.postMessage({ close: true }, '*');
	}
}

function listener({ origin, data }: MessageEvent) {
	if (origin !== getOptionsURL().origin) return;
	const { failedToLoad, hash, closing } = (data: any);
	if (failedToLoad) handleEmbedFailure();
	if (hash) setHash(hash);
	if (closing) close();
}

function handleEmbedFailure() {
	console.warn('Embed failed. Opening RES settings console in new tab');
	if (iframe) openNewTab(iframe.src, true);
	close();
}

export function open(moduleID?: string, optionKey?: string) {
	if (iframe || isOptionsPage()) {
		(iframe && iframe.contentWindow || window).postMessage({ load: { moduleID, optionKey } }, '*');
	} else {
		iframe = document.createElement('iframe');
		iframe.id = 'console-container';
		iframe.src = getOptionsURL(makeUrlHash(moduleID, optionKey)).href;

		window.addEventListener('message', listener);
		iframe.addEventListener('load', () => {
			if (iframe) iframe.contentWindow.postMessage({ context }, '*');

			// If the console doesn't progress fast enough (like due to an embedding issue), use fallback
			let success;
			window.addEventListener('message', ({ origin, data }: MessageEvent) => {
				if (origin === getOptionsURL().origin && (data: any).loadSuccess) success = true;
			});
			setTimeout(() => { if (!success) handleEmbedFailure(); }, 1000);
		});

		document.body.append(iframe);
		document.body.classList.add('res-console-open');
	}
}

export function close() {
	if (isOptionsPage()) {
		window.parent.postMessage({ closing: true }, '*');
		window.close();
	} else {
		window.removeEventListener('message', listener);
		if (!iframe) return;
		iframe.remove();
		iframe = null;
		document.body.classList.remove('res-console-open');
		if (isSettingsUrl(location.href)) history.pushState(null, '', location.pathname + location.search);
	}
}
