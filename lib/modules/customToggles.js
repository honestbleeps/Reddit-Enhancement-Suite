/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import * as Options from '../core/options';
import { CreateElement, string } from '../utils';
import { multicast } from '../environment';
import * as CommandLine from './commandLine';
import * as Menu from './menu';

export const module: Module<*> = new Module('customToggles');

module.moduleName = 'customTogglesName';
module.category = 'coreCategory';
module.description = 'customTogglesDesc';

module.options = {
	toggle: {
		description: 'customTogglesToggleDesc',
		title: 'customTogglesToggleTitle',
		type: 'table',
		fields: [{
			key: 'key',
			name: 'key',
			type: 'text',
		}, {
			key: 'enabled',
			name: 'enabled',
			type: 'boolean',
			value: true,
		}, {
			key: 'text',
			name: 'text',
			type: 'text',
		}],
		value: ([]: Array<[string, boolean, string]>),
	},
};

const toggles: Map<string, Toggle> = new Map();
const customToggles: Array<Toggle> = [];

module.beforeLoad = () => {
	for (const instance of module.options.toggle.value) {
		const [key, initialEnabled, text] = instance;

		if (toggles.has(key)) {
			console.error(`A toggle with key ${key} already exists`, instance);
			continue;
		}

		const toggle = new Toggle(key, text, initialEnabled);
		customToggles.push(toggle);

		toggle.onStateChange(() => {
			// Keep the settings data current to avoid overwriting modifications from other tabs
			instance[1] = toggle.enabled;
		});

		toggle.onToggle(() => {
			Options.set(module, 'toggle', module.options.toggle.value);
		});

		toggle.addMenuItem();
	}
};

module.go = () => {
	registerCommandLine();
};

export class Toggle {
	text: string;
	enabled: boolean;

	stateChangeCallbacks: Array<() => void> = []; // Invoked on all tabs
	toggleCallbacks: Array<(type: 'auto' | 'manual') => void> = []; // Invoked on the tab which caused the change

	constructor(key: string, text: *, enabled: *) {
		this.text = text;
		this.enabled = enabled;

		const setGlobalState = multicast(enabled => {
			this.setLocalState(enabled);
		}, { name: `toggle.${key}` });

		this.onToggle(() => { setGlobalState(this.enabled); });

		toggles.set(key, this);
	}

	toggle(type: * = 'manual') {
		this.setLocalState(!this.enabled);

		for (const callback of this.toggleCallbacks) callback(type);
	}

	setLocalState(enabled: boolean) {
		this.enabled = enabled;

		// For modules which update dynamically
		$(module).trigger($.Event('toggle')); // eslint-disable-line new-cap

		for (const callback of this.stateChangeCallbacks) callback();
	}

	onStateChange(callback: *) {
		this.stateChangeCallbacks.push(callback);
	}

	onToggle(callback: *) {
		this.toggleCallbacks.push(callback);
	}

	addMenuItem(title: string = `Toggle ${this.text}`, order: number = 9, on?: string, off?: string) {
		Menu.addMenuItem(
			_.once(() => {
				const item = string.html`<div title="${title}">${this.text || '\u00A0'}</div>`;
				const toggle = CreateElement.toggleButton(undefined, this.text, this.enabled, on, off);
				item.append(toggle);
				this.onStateChange(() => { toggle.classList.toggle('enabled', this.enabled); });
				return item;
			}),
			e => {
				this.toggle();
				e.stopPropagation();
			},
			order
		);
	}

	addCLI(commandPredicate: string) {
		CommandLine.registerCommand(commandPredicate, `${commandPredicate} - toggle ${this.text}`,
			() => ` ${this.enabled ? 'Disable' : 'Enable'} ${this.text}`,
			() => { this.toggle(); }
		);
	}
}

function registerCommandLine() {
	const getToggles = val => Array.from(toggles.values())
		.filter(({ text }) => text.startsWith(val))
		.sort(({ text: a }, { text: b }) => a.localeCompare(b));

	CommandLine.registerCommand('toggle', 'toggle - toggle any custom toggle',
		(command, val) => getToggles(val).length ?
			`Toggle ${getToggles(val).map((toggle, i) => i === 0 ? `<b>${toggle.text}</b>` : toggle.text).join('|')}` :
			`No toggles matching <i>${val}</i>`,
		(command, val) => {
			const match = getToggles(val)[0];
			if (match) match.toggle();
			else return `${val} does not match a valid toggle`;
		}
	);
}

export function toggleActive(key: string): boolean {
	const toggle = toggles.get(key);
	return !!toggle && toggle.enabled;
}

// Stage may have the most recent toggles, in case this is invoked while in settingsConsole
export const getToggles = () => (Options.stage.get(module.moduleID) || module.options)
	.toggle.value.map(([key, , text]) => ({ key, text }));
