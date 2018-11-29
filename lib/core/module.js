/* @flow */

import type { PageType, AppType } from '../utils/location';
import type { KeyArray } from '../utils/keycode';

// separate because indexer syntax is not supported in normal (no `declare`) classes
declare class Indexable { // eslint-disable-line no-unused-vars
	[Symbol | $Keys<this>]: any;
}

export class Module<RawOpt: { [string]: any }, Opt: { [string]: ModuleOption<RawOpt> } = RawOpt> /*:: extends Indexable */ {
	moduleID: string;

	moduleName: string;
	category: string = '';
	description: string = '';
	descriptionRaw: boolean = false; // Whether the message is HTML and should not be run through i18n / markdown
	keywords: Array<string> = [];
	bodyClass: boolean = false;
	options: Opt = ({}: any);
	include: Array<PageType | AppType | RegExp> = [];
	exclude: Array<PageType | AppType | RegExp> = [];
	shouldRun: () => boolean = () => true;
	onToggle: (enabling: boolean) => void = () => {};
	onSaveSettings: (changedSettings: any) => void = () => {};

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

	permissions: {|
		requiredPermissions: Array<string>,
		message?: string,
	|} = {
		requiredPermissions: [],
	};

	constructor(moduleID: string) {
		/*:: super(); */
		this.moduleID = moduleID;
		this.moduleName = moduleID;
	}
}

export type OpaqueModuleId = string | { moduleID: string, module?: void } | { module: { moduleID: string } };

export type ModuleOption<Ctx> =
	| BooleanOption<Ctx>
	| TextOption<Ctx>
	| EnumOption<Ctx>
	| KeycodeOption<Ctx>
	| ListOption<Ctx>
	| SelectOption<Ctx>
	| TableOption<Ctx, any>
	| ButtonOption<Ctx>
	| ColorOption<Ctx>
	| BuilderOption<Ctx>;

type CommonOptionProps<Ctx> = {|
	title: string,
	description: string,
	keywords?: Array<string>,
	dependsOn?: (opt: Ctx) => boolean,
	advanced?: boolean,
	noconfig?: boolean,
	onChange?: () => void,
|};

export type BooleanOption<Ctx> = {|
	type: 'boolean',
	value: boolean,
	bodyClass?: boolean | string,
	...CommonOptionProps<Ctx>,
|};

export type TextOption<Ctx> = {|
	type: 'text',
	value: string,
	...CommonOptionProps<Ctx>,
|};

export type EnumOption<Ctx> = {|
	type: 'enum',
	value: string,
	values: Array<{
		name: string,
		value: string,
	}>,
	bodyClass?: boolean | string,
	...CommonOptionProps<Ctx>,
|};

export type KeycodeOption<Ctx> = {|
	type: 'keycode',
	value: KeyArray,
	// special for keyboardNav
	goMode?: boolean,
	callback?: () => void,
	include?: Array<PageType | AppType | RegExp>,
	requiresModules?: Array<OpaqueModuleId>,
	mustBeLoggedIn?: boolean,
	...CommonOptionProps<Ctx>,
|};

export type ListOption<Ctx> = {|
	type: 'list',
	listType: ListType,
	value: string,
	...CommonOptionProps<Ctx>,
|};

type ListType = 'subreddits';

export type SelectOption<Ctx> = {|
	type: 'select',
	value: string,
	values: Array<{
		name: string,
		value: string,
		style: string,
	}>,
	...CommonOptionProps<Ctx>,
|};

export type TableOption<Ctx, V: $ReadOnlyArray<any>> = {|
	type: 'table',
	addRowText?: string,
	fields: TableField[],
	value: V[],
	sort?: (a: V, b: V) => number,
	...CommonOptionProps<Ctx>,
|};

type TableField = TextField | BooleanField | ListField | PasswordField | KeycodeField | TextareaField | EnumField | ColorField | SelectField;

type TextField = {|
	type: 'text',
	key: string,
	name: string,
	value?: string,
|};

type BooleanField = {|
	type: 'boolean',
	key: string,
	name: string,
	value: boolean,
|};

type ListField = {|
	type: 'list',
	key: string,
	name: string,
	listType: ListType,
|};

type PasswordField = {|
	type: 'password',
	key: string,
	name: string,
|};

type KeycodeField = {|
	type: 'keycode',
	key: string,
	name: string,
|};

type TextareaField = {|
	type: 'textarea',
	key: string,
	name: string,
|};

type EnumField = {|
	type: 'enum',
	key: string,
	name: string,
	value: string,
	values: Array<{
		name: string,
		value: string,
	}>,
|};

type ColorField = {|
	type: 'color',
	key: string,
	name: string,
|};

type SelectField = {|
	type: 'select',
	key: string,
	name: string,
	value: string,
	values: Array<{
		name: string,
		value: string,
		style?: string,
	}>,
|};

export type ButtonOption<Ctx> = {|
	type: 'button',
	text?: string | HTMLElement,
	callback?: (() => Promise<void> | void) | string | { moduleID: string },
	values?: Array<{ text: $PropertyType<ButtonOption<Ctx>, 'text'>, callback: $PropertyType<ButtonOption<Ctx>, 'callback'> }>,
	...CommonOptionProps<Ctx>,
|};

export type ColorOption<Ctx> = {|
	type: 'color',
	value: string,
	...CommonOptionProps<Ctx>,
|};

export type BuilderOption<Ctx> = {|
	type: 'builder',
	addItemText: string,
	defaultTemplate: () => BuilderRootValue,
	cases: { [string]: BuilderCase<*> },
	value: BuilderRootValue[],
	customOptionsFields: Array<Array<BuilderField | string>>,
	...CommonOptionProps<Ctx>,
|};

export type BuilderRootValue = {|
	note: string,
	ver: number,
	id: string,
	body: BuilderValue,
	opts?: {
		[string]: mixed,
		// Some typed (reserved) values in order to simplify type checking
		name?: string,
	},
|};

export type BuilderValue = {
	type: string,
	[string]: any,
};

type BuilderCase = {
	text: string,
	fields: Array<BuilderField | string>,
};

type BuilderField = BuilderSelectField | BuilderMultiField | BuilderDurationField | BuilderChecksetField | BuilderNumberField | BuilderCheckboxField | BuilderGenericInputField;

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

type BuilderCheckboxField = {|
	type: 'check',
	id: string,
	label: string,
|};

type BuilderGenericInputField = {|
	type: string,
	id: string,
|};
