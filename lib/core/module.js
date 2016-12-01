/* @flow */

import type { PageType } from '../utils/location';
import type { KeyArray } from '../utils/keycode';
import type { default as Thing } from '../utils/Thing';

// separate because indexer syntax is not supported in normal (no `declare`) classes
declare class Indexable { // eslint-disable-line no-unused-vars
	[key: Symbol | $Keys<this>]: any;
}

export class Module<Opt: { [key: string]: ModuleOption }> /*:: extends Indexable */ {
	moduleID: string;

	moduleName: string;
	category: string = '';
	description: string = '';
	bodyClass: boolean = false;
	options: Opt = ({}: any);
	include: Array<PageType | RegExp> = [];
	exclude: Array<PageType | RegExp> = [];
	shouldRun: () => boolean = () => true;
	onToggle: (enabling: boolean) => void = () => {};

	hidden: boolean = false;
	disabledByDefault: boolean = false;
	alwaysEnabled: boolean = false;
	sort: number = 0;

	// no default value for cleaner profiling (modules without a stage defined won't be timed)
	loadDynamicOptions: (() => Promise<void> | void) | void = undefined;
	beforeLoad: (() => Promise<void> | void) | void = undefined;
	go: (() => Promise<void> | void) | void = undefined;
	afterLoad: (() => Promise<void> | void) | void = undefined;
	always: (() => Promise<void> | void) | void = undefined;

	constructor(moduleID: string) {
		/*:: super(); */
		this.moduleID = moduleID;
		this.moduleName = moduleID;
	}
}

export type OpaqueModuleId = string | { moduleID: string, module?: void } | { module: { moduleID: string } };

export type ModuleOption = BooleanOption | TextOption | EnumOption | KeycodeOption | ListOption | TableOption<any[]> | ButtonOption | ColorOption | BuilderOption;

export type BooleanOption = {|
	type: 'boolean',
	title?: string,
	description: string,
	value: boolean,
	bodyClass?: boolean | string,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

export type TextOption = {|
	type: 'text',
	title?: string,
	description: string,
	value: string,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

export type EnumOption = {|
	type: 'enum',
	title?: string,
	description: string,
	value: string,
	values: Array<{
		name: string,
		value: string,
	}>,
	bodyClass?: boolean | string,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

export type KeycodeOption = {|
	type: 'keycode',
	title?: string,
	description: string,
	value: KeyArray,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
	// special for keyboardNav
	goMode?: boolean,
	callback?: () => void,
	include?: Array<PageType | RegExp>,
|};

export type ListOption = {|
	type: 'list',
	title?: string,
	description: string,
	listType: ListType,
	value: string,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

type ListType = 'subreddits';

export type TableOption<V: any[]> = {|
	type: 'table',
	title?: string,
	description: string,
	addRowText?: string,
	fields: TableField[],
	value: V[],
	sort?: (a: V, b: V) => number,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

type TableField = TextField | BooleanField | ListField | PasswordField | KeycodeField | TextareaField | EnumField | ColorField;

type TextField = {|
	type: 'text',
	name: string,
	value?: string,
|};

type BooleanField = {|
	type: 'boolean',
	name: string,
	value: boolean,
|};

type ListField = {|
	type: 'list',
	name: string,
	listType: ListType,
|};

type PasswordField = {|
	type: 'password',
	name: string,
|};

type KeycodeField = {|
	type: 'keycode',
	name: string,
|};

type TextareaField = {|
	type: 'textarea',
	name: string,
|};

type EnumField = {|
	type: 'enum',
	name: string,
	value: string,
	values: Array<{
		name: string,
		value: string,
	}>,
|};

type ColorField = {|
	type: 'color',
	name: string,
|};

export type ButtonOption = {|
	type: 'button',
	title?: string,
	description: string,
	text: string | HTMLElement,
	callback: (() => Promise<void> | void) | string | { moduleID: string },
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
|};

export type ColorOption = {|
	type: 'color',
	title?: string,
	description: string,
	value: string,
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

export type BuilderOption = {|
	type: 'builder',
	title?: string,
	description: string,
	addItemText: string,
	defaultTemplate: () => BuilderRootValue,
	cases: { [key: string]: BuilderCase<*> },
	value: BuilderRootValue[],
	dependsOn?: string,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

type BuilderRootValue = {|
	note: string,
	ver: number,
	body: BuilderValue,
|};

type BuilderValue = {
	type: string,
	// allow additional properties
};

type BuilderCase<T: BuilderValue> = {|
	name: string,
	defaultTemplate: (...args: any) => T,
	fields: Array<BuilderField | string>,
	evaluate: (thing: Thing, data: T, config: { [key: string]: BuilderCase<*> }) => boolean,
|};

type BuilderField = BuilderSelectField | BuilderMultiField | BuilderTextField | BuilderDurationField | BuilderChecksetField | BuilderNumberField;

type PredefinedSelectChoice = 'COMPARISON';

type BuilderSelectField = {|
	type: 'select',
	options: Array<string | [string, string]> | PredefinedSelectChoice,
	id: string,
|};

type BuilderMultiField = {|
	type: 'multi',
	include: 'all',
	id: string,
|};

type BuilderTextField = {|
	type: 'text',
	validator: Class<RegExp>,
	id: string,
|};

type BuilderDurationField = {|
	type: 'duration',
	id: string,
|};

type BuilderChecksetField = {|
	type: 'checkset',
	items: string[],
	id: string,
|};

type BuilderNumberField = {|
	type: 'number',
	id: string,
|};
