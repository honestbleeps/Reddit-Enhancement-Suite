/* @flow */

import type { Thing } from '../utils';
import type { ModuleOption } from './module'; // eslint-disable-line no-unused-vars

export class Host<Detect, Opt: { [key: string]: ModuleOption<any> }> {
	moduleID: string;

	name: string;
	domains: string[];
	permissions: string[] | void;

	logo: string | void;
	landingPage: string | void;
	attribution: boolean;

	options: Opt | void;

	detect: (a: URL, context: ?Thing) => void | null | false | Detect;
	handleLink: (href: string, detectResult: Detect) => ExpandoMedia | Promise<ExpandoMedia>;

	go: (() => void) | void;

	constructor(moduleID: string, {
		name,
		domains,
		permissions,
		logo,
		landingPage,
		attribution = true,
		options,
		detect,
		handleLink,
		go,
	}: {|
		name: string,
		domains: string[],
		permissions?: string[],
		logo?: string,
		landingPage?: string,
		attribution?: boolean,
		options?: Opt,
		detect: (a: URL, context: ?Thing) => void | null | false | Detect,
		handleLink: (href: string, detectResult: Detect) => ExpandoMedia | Promise<ExpandoMedia>,
		go?: () => void,
	|}) {
		this.moduleID = moduleID;
		this.name = name;
		this.domains = domains;
		this.permissions = permissions;
		this.logo = logo;
		this.landingPage = landingPage;
		this.attribution = attribution;
		this.options = options;
		this.detect = detect;
		this.handleLink = handleLink;
		this.go = go;
	}
}

export type ExpandoMedia = GalleryMedia | ImageMedia | VideoMedia | AudioMedia | TextMedia | IframeMedia | GenericMedia;

export type GalleryMedia = {|
	type: 'GALLERY',
	title?: string,
	caption?: string,
	credits?: string,
	src: Array<ImageMedia | VideoMedia | AudioMedia | TextMedia | IframeMedia | GenericMedia>,
	galleryStart?: number,
|};

export type ImageMedia = {|
	type: 'IMAGE',
	title?: string,
	caption?: string,
	credits?: string,
	src: string,
	href?: string,
|};

export type VideoMedia = {|
	type: 'VIDEO',
	title?: string,
	caption?: string,
	credits?: string,
	sources: Array<{|
		source: string,
		reverse?: string,
		type: string,
	|}>,
	fallback?: string,
	href?: string,
	source?: string,
	poster?: string,
	muted?: boolean,
	controls?: boolean,
	frameRate?: number,
	loop?: boolean,
	playbackRate?: number,
	reversable?: boolean,
	reversed?: boolean,
	time?: number,
|};

export type AudioMedia = {|
	type: 'AUDIO',
	autoplay?: boolean,
	loop?: boolean,
	sources: Array<{|
		file: string,
		type: string,
	|}>,
|};

export type TextMedia = {|
	type: 'TEXT',
	title?: string,
	caption?: string,
	credits?: string,
	src: string,
|};

export type IframeMedia = {|
	type: 'IFRAME',
	muted?: boolean,
	expandoClass?: string,
	embed: string,
	embedAutoplay?: string,
	width?: string,
	height?: string,
	fixedRatio?: boolean,
	pause?: string,
	play?: string,
|};

export type GenericMedia = {|
	type: 'GENERIC_EXPANDO',
	muted?: boolean,
	expandoClass?: string,
	generate: () => HTMLElement,
	onAttach?: () => void,
|};
