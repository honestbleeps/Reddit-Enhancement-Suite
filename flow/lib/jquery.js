// https://github.com/marudor/flowInterfaces/blob/3fe07b33cae783b17ccc974f3bfd6010637d0d1a/packages/iflow-jquery/index.js.flow
// reordered/merged some overloaded function definitions for better inference
// disabled one permutation of `$.fn.on` because it conflicts with delegated listeners (and we don't use it)
// specialized `$.fn.on` and `$.fn.one` for keyboard and input event types
// added overloadings of animation functions with only a callback (default delay)
// added definitions for tokeninput, edgescroll, safehtml, sortable
// added iterator
// made JQueryXHR extend the native XMLHttpRequest object
// switched to the `.then` implementation of native promises, à la jQuery 3
// typed the callback arguments of $.Callbacks


// Type definitions for jQuery 1.10.x / 2.0.x
// Project: http://jquery.com/
// Definitions by: Boris Yankov <https://github.com/borisyankov/>, Christian Hoffmeister <https://github.com/choffmeister>, Steve Fenton <https://github.com/Steve-Fenton>, Diullei Gomes <https://github.com/Diullei>, Tass Iliopoulos <https://github.com/tasoili>, Jason Swearingen <https://github.com/jasons-novaleaf>, Sean Hill <https://github.com/seanski>, Guus Goossens <https://github.com/Guuz>, Kelly Summerlin <https://github.com/ksummerlin>, Basarat Ali Syed <https://github.com/basarat>, Nicholas Wolverson <https://github.com/nwolverson>, Derek Cicerone <https://github.com/derekcicerone>, Andrew Gaspar <https://github.com/AndrewGaspar>, James Harrison Fisher <https://github.com/jameshfisher>, Seikichi Kondo <https://github.com/seikichi>, Benjamin Jackman <https://github.com/benjaminjackman>, Poul Sorensen <https://github.com/s093294>, Josh Strobl <https://github.com/JoshStrobl>, John Reilly <https://github.com/johnnyreilly/>, Dick van den Brink <https://github.com/DickvdBrink>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/* *****************************************************************************
Copyright (c: any) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not us: void;
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

declare type JQueryAjaxSettings = {
	accepts?: any;

	async?: boolean;

	beforeSend?: (jqXHR: JQueryXHR, settings: JQueryAjaxSettings) => any;

	cache?: boolean;

	complete?: (jqXHR: JQueryXHR, textStatus: string) => any;

	contents?: {
		[key: string]: any;
	};

	contentType?: any;

	context?: any;

	converters?: {
		[key: string]: any;
	};

	crossDomain?: boolean;

	data?: any;

	dataFilter?: (data: any, ty: any) => any;

	dataType?: string;

	error?: (jqXHR: JQueryXHR, textStatus: string, errorThrown: string) => any;

	global?: boolean;

	headers?: {
		[key: string]: any;
	};

	ifModified?: boolean;

	isLocal?: boolean;

	jsonp?: any;

	jsonpCallback?: any;

	method?: string;

	mimeType?: string;

	password?: string;

	processData?: boolean;

	scriptCharset?: string;

	statusCode?: {
		[key: string]: any;
	};

	success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any;

	timeout?: number;

	traditional?: boolean;

	type?: string;

	url?: string;

	username?: string;

	xhr?: any;

	xhrFields?: {
		[key: string]: any;
	};
};

declare class JQueryXHR extends XMLHttpRequest {
	overrideMimeType(mimeType: string): any;

	abort(statusText?: string): void;

	then<R> (doneCallback: (data: any, textStatus: string, jqXHR: JQueryXHR) => R, failCallback?: (jqXHR: JQueryXHR, textStatus: string, errorThrown: any) => void): JQueryPromise<R>;

	responseJSON?: any;

	error(xhr: JQueryXHR, textStatus: string, errorThrown: string): void;
}

declare class JQueryCallback<A, B, C, D, E, F, T: (a: A, b: B, c: C, d: D, e: E, f: F) => void> {
	constructor(flags?: string): void;

	add(callbacks: T): this;
	add(callbacks: T[]): this;

	disable(): this;

	disabled(): boolean;

	empty(): this;

	fire(a: A, b: B, c: C, d: D, e: E, f: F): this;

	fired(): boolean;

	fireWith(context?: mixed, args?: [A, B, C, D, E, F]): this;

	has(callback: T): boolean;

	lock(): this;

	locked(): boolean;

	remove(T: Function): this;
	remove(T: Function[]): this;
}

declare class JQueryPromiseCallback<T> {
	(value?: T, ...args: any[]): void;
}

declare class JQueryPromiseOperator <T, U> {
	(callback1: JQueryPromiseCallback<T> | JQueryPromiseCallback<T> [], ...callbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryPromise<U>;
}

declare class JQueryPromise<T> extends Promise<T> {
	state(): string;

	always(alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryPromise<T>;

	done(doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T> [], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T> []>): JQueryPromise<T>;

	fail(failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryPromise<T>;

	progress(progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryPromise<T>;

	// Deprecated - given no typings
	pipe(doneFilter?: (x: any) => any, failFilter?: (x: any) => any, progressFilter?: (x: any) => any): JQueryPromise<any>;
}

declare class JQueryDeferred<T> extends Promise<T> {
	state(): string;

	always(alwaysCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...alwaysCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryDeferred<T>;

	done(doneCallback1?: JQueryPromiseCallback<T> | JQueryPromiseCallback<T> [], ...doneCallbackN: Array<JQueryPromiseCallback<T> | JQueryPromiseCallback<T> []>): JQueryDeferred<T>;

	fail(failCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...failCallbacksN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryDeferred<T>;

	progress(progressCallback1?: JQueryPromiseCallback<any> | JQueryPromiseCallback<any> [], ...progressCallbackN: Array<JQueryPromiseCallback<any> | JQueryPromiseCallback<any> []>): JQueryDeferred<T>;

	notify(value?: any, ...args: any[]): JQueryDeferred<T>;

	notifyWith(context: any, value?: any[]): JQueryDeferred<T>;

	reject(value?: any, ...args: any[]): JQueryDeferred<T>;

	rejectWith(context: any, value?: any[]): JQueryDeferred<T>;

	resolve(value?: T, ...args: any[]): JQueryDeferred<T>;

	resolveWith(context: any, value?: T[]): JQueryDeferred<T>;

	promise(target?: any): JQueryPromise<T>;

	// Deprecated - given no typings
	pipe(doneFilter?: (x: any) => any, failFilter?: (x: any) => any, progressFilter?: (x: any) => any): JQueryPromise<any>;
}

declare class BaseJQueryEventObject extends Event {
	data: any;
	delegateTarget: Element;
	isDefaultPrevented(): boolean;
	isImmediatePropagationStopped(): boolean;
	isPropagationStopped(): boolean;
	namespace: string;
	originalEvent: Event;
	preventDefault(): any;
	relatedTarget: Element;
	result: any;
	stopImmediatePropagation(): void;
	stopPropagation(): void;
	target: HTMLElement;
	pageX: number;
	pageY: number;
	which: number;
	metaKey: boolean;
}

declare class JQueryMouseEventObject extends MouseEvent /*:: mixins BaseJQueryEventObject */ {
	button: number;
	clientX: number;
	clientY: number;
	offsetX: number;
	offsetY: number;
	pageX: number;
	pageY: number;
	screenX: number;
	screenY: number;
}

declare class JQueryKeyEventObject extends KeyboardEvent /*:: mixins BaseJQueryEventObject */ {
	char: any;
	charCode: number;
	key: any;
	keyCode: number;
}

declare class JQueryEventObject extends Event /*:: mixins BaseJQueryEventObject */ {}

/*
	Collection of properties of the current browser
*/

declare class JQuerySupport {
	ajax?: boolean;
	boxModel?: boolean;
	changeBubbles?: boolean;
	checkClone?: boolean;
	checkOn?: boolean;
	cors?: boolean;
	cssFloat?: boolean;
	hrefNormalized?: boolean;
	htmlSerialize?: boolean;
	leadingWhitespace?: boolean;
	noCloneChecked?: boolean;
	noCloneEvent?: boolean;
	opacity?: boolean;
	optDisabled?: boolean;
	optSelected?: boolean;
	scriptEval(): boolean;
	style?: boolean;
	submitBubbles?: boolean;
	tbody?: boolean;
}

declare class JQueryParam {
	(obj: any): string;

	(obj: any, traditional: boolean): string;
}

declare class JQueryEventConstructor {
	(name: string, eventProperties?: any): JQueryEventObject;
	new(name: string, eventProperties?: any): JQueryEventObject;
}

declare class JQueryCoordinates {
	left: number;
	top: number;
}

declare class JQuerySerializeArrayElement {
	name: string;
	value: string;
}

declare class JQueryAnimationOptions {
	duration?: any;

	easing?: string;

	complete?: Function;

	step?: (now: number, tween: any) => any;

	progress?: (animation: JQueryPromise<any>, progress: number, remainingMs: number) => any;

	start?: (animation: JQueryPromise<any>) => any;

	done?: (animation: JQueryPromise<any>, jumpedToEnd: boolean) => any;

	fail?: (animation: JQueryPromise<any>, jumpedToEnd: boolean) => any;

	always?: (animation: JQueryPromise<any>, jumpedToEnd: boolean) => any;

	queue?: any;

	specialEasing?: Object;
}

declare class JQueryEasingFunction {
	(percent: number): number;
}

declare class JQueryEasingFunctions {
	[name: string]: JQueryEasingFunction;
	linear: JQueryEasingFunction;
	swing: JQueryEasingFunction;
}

declare class JQueryStatic {
	cookie(key: string, value?: any): string;

	ajax(settings: JQueryAjaxSettings): JQueryXHR;
	ajax(url: string, settings?: JQueryAjaxSettings): JQueryXHR;

	ajaxPrefilter(dataTypes: string, handler: (opts: any, originalOpts: JQueryAjaxSettings, jqXHR: JQueryXHR) => any): void;
	ajaxPrefilter(handler: (opts: any, originalOpts: JQueryAjaxSettings, jqXHR: JQueryXHR) => any): void;

	ajaxSettings: JQueryAjaxSettings;

	ajaxSetup(options: JQueryAjaxSettings): void;

	get(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;
	get(url: string, data?: Object | string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;

	getJSON(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any): JQueryXHR;
	getJSON(url: string, data?: Object | string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any): JQueryXHR;

	getScript(url: string, success?: (script: string, textStatus: string, jqXHR: JQueryXHR) => any): JQueryXHR;

	param: JQueryParam;

	post(url: string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;
	post(url: string, data?: Object | string, success?: (data: any, textStatus: string, jqXHR: JQueryXHR) => any, dataType?: string): JQueryXHR;

	Callbacks<A, B, C, D, E, F, T: (a: A, b: B, c: C, d: D, e: E, f: F) => void>(flags?: string): JQueryCallback<A, B, C, D, E, F, T>;

	holdReady(hold: boolean): void;

	(selector: string, context?: Element | JQuery): JQuery;

	(element: Element): JQuery;

	/*:: <T: Element>(elementArray: T[]): JQuery; */

	(callback: (jQueryAlias?: JQueryStatic) => any): JQuery;

	(object: ?{}): JQuery;

	(object: JQuery): JQuery;

	(...args: void[]): JQuery;

	(html: string, ownerDocument?: Document): JQuery;

	(html: string, attributes: Object): JQuery;

	noConflict(removeAll?: boolean): JQueryStatic;

	when<T> (...deferreds: Array<T | JQueryPromise<T>>): JQueryPromise<T>;

	cssHooks: {
		[key: string]: any;
	};
	cssNumber: any;

	data(element: Element, key: string, ...args: void[]): any;
	data<T>(element: Element, key: string, value: T): T;
	data(element: Element): any;

	dequeue(element: Element, queueName?: string): void;

	hasData(element: Element): boolean;

	queue(element: Element, queueName?: string): any[];
	queue(element: Element, queueName: string, newQueue: Function[]): JQuery;
	queue(element: Element, queueName: string, callback: Function): JQuery;

	removeData(element: Element, name?: string): JQuery;

	Deferred<T> (beforeStart?: (deferred: JQueryDeferred<T>) => any): JQueryDeferred<T>;


	easing: JQueryEasingFunctions;

	fx: {
		tick: () => void;

		interval: number;
		stop: () => void;
		speeds: {
			slow: number;fast: number;
		};

		off: boolean;
		step: any;
	};

	proxy(fnction: (...args: any[]) => any, context: Object, ...additionalArguments: any[]): any;
	proxy(context: Object, name: string, ...additionalArguments: any[]): any;

	Event: JQueryEventConstructor;

	error(message: any): JQuery;

	expr: any;
	fn: any; // TODO: Decide how we want to type this

	isReady: boolean;

	// Properties
	support: JQuerySupport;

	contains(container: Element, contained: Element): boolean;

	each<T> (
		collection: T[],
		callback: (indexInArray: number, valueOfElement: T) => any
	): any;

	each(
		collection: any,
		callback: (indexInArray: any, valueOfElement: any) => any
	): any;

	extend(target: any, object1?: any, ...objectN: any[]): any;
	extend(deep: boolean, target: any, object1?: any, ...objectN: any[]): any;

	globalEval(code: string): any;

	grep<T> (array: T[], func: (elementOfArray: T, indexInArray: number) => boolean, invert?: boolean): T[];

	inArray<T> (value: T, array: T[], fromIndex?: number): number;

	isArray(obj: any): boolean;

	isEmptyObject(obj: any): boolean;

	isFunction(obj: any): boolean;

	isNumeric(value: any): boolean;

	isPlainObject(obj: any): boolean;

	isWindow(obj: any): boolean;

	isXMLDoc(node: Node): boolean;

	makeArray(obj: any): any[];

	map<T, U> (array: T[], callback: (elementOfArray: T, indexInArray: number) => U): U[];
	map(arrayOrObject: any, callback: (value: any, indexOrKey: any) => any): any;

	merge<T> (first: T[], second: T[]): T[];

	noop(): any;

	now(): number;

	parseJSON(json: string): any;

	parseXML(data: string): any;

	trim(str: string): string;

	type(obj: any): string;

	unique(array: Element[]): Element[];

	parseHTML(data: string, context?: HTMLElement, keepScripts?: boolean): any[];
	parseHTML(data: string, context?: Document, keepScripts?: boolean): any[];
}

declare class JQuery {
	ajaxComplete(handler: (event: JQueryEventObject, XMLHttpRequest: XMLHttpRequest, ajaxOptions: any) => any): JQuery;

	ajaxError(handler: (event: JQueryEventObject, jqXHR: JQueryXHR, ajaxSettings: JQueryAjaxSettings, thrownError: any) => any): JQuery;

	ajaxSend(handler: (event: JQueryEventObject, jqXHR: JQueryXHR, ajaxOptions: JQueryAjaxSettings) => any): JQuery;

	ajaxStart(handler: () => any): JQuery;

	ajaxStop(handler: () => any): JQuery;

	ajaxSuccess(handler: (event: JQueryEventObject, XMLHttpRequest: XMLHttpRequest, ajaxOptions: JQueryAjaxSettings) => any): JQuery;

	load(url: string, data?: string | Object, complete?: (responseText: string, textStatus: string, XMLHttpRequest: XMLHttpRequest) => any): JQuery;

	serialize(): string;

	serializeArray(): JQuerySerializeArrayElement[];

	addClass(className: string): JQuery;
	addClass(func: (index: number, className: string) => string): JQuery;

	addBack(selector?: string): JQuery;

	attr(attributeName: string, value: string | number): JQuery;
	attr(attributeName: string, func: (index: number, attr: string) => string | number): JQuery;
	attr(attributeName: string, ...args: void[]): string;
	attr(attributes: Object): JQuery;

	hasClass(className: string): boolean;

	html(htmlString: string): JQuery;
	html(func: (index: number, oldhtml: string) => string): JQuery;
	html(): string;

	prop(propertyName: string, value: string | number | boolean): JQuery;
	prop(properties: Object): JQuery;
	prop(propertyName: string, func: (index: number, oldPropertyValue: any) => any): JQuery;
	prop(propertyName: string): any;

	removeAttr(attributeName: string): JQuery;

	removeClass(className?: string): JQuery;
	removeClass(func: (index: number, className: string) => string): JQuery;

	removeProp(propertyName: string): JQuery;

	toggleClass(className: string, swtch?: boolean): JQuery;
	toggleClass(swtch?: boolean): JQuery;
	toggleClass(func: (index: number, className: string, swtch: boolean) => string, swtch?: boolean): JQuery;

	val(value: string | string[] | number): JQuery;
	val(func: (index: number, value: string) => string): JQuery;
	val(): any;

	css(propertyName: string, value: string | number): JQuery;
	css(propertyName: string, value: (index: number, value: string) => string | number): JQuery;
	css(properties: Object): JQuery;
	css(propertyName: string, ...args: void[]): string;

	height(value: number | string): JQuery;
	height(func: (index: number, height: number) => number | string): JQuery;
	height(): number;

	innerHeight(height: number | string): JQuery;
	innerHeight(): number;

	innerWidth(width: number | string): JQuery;
	innerWidth(): number;

	offset(coordinates: JQueryCoordinates): JQuery;
	offset(func: (index: number, coords: JQueryCoordinates) => JQueryCoordinates): JQuery;
	offset(): JQueryCoordinates;

	outerHeight(height: number | string): JQuery;
	outerHeight(includeMargin?: boolean): number;

	outerWidth(width: number | string): JQuery;
	outerWidth(includeMargin?: boolean): number;

	position(): JQueryCoordinates;

	scrollLeft(value: number): JQuery;
	scrollLeft(): number;

	scrollTop(value: number): JQuery;
	scrollTop(): number;

	width(value: number | string): JQuery;
	width(func: (index: number, width: number) => number | string): JQuery;
	width(): number;

	clearQueue(queueName?: string): JQuery;

	data(key: string, ...args: void[]): any;
	data(key: string, value: any): JQuery;
	data(obj: {
		[key: string]: any;
	}): JQuery;
	data(): any;

	dequeue(queueName?: string): JQuery;

	removeData(name: string): JQuery;
	removeData(list: string[]): JQuery;
	removeData(...args: void[]): JQuery;

	promise(type?: string, target?: Object): JQueryPromise<any>;

	animate(properties: Object, complete?: Function): JQuery;
	animate(properties: Object, duration?: string | number, complete?: Function): JQuery;
	animate(properties: Object, duration?: string | number, easing?: string, complete?: Function): JQuery;
	animate(properties: Object, options: JQueryAnimationOptions): JQuery;

	delay(duration: number, queueName?: string): JQuery;

	fadeIn(complete?: Function): JQuery;
	fadeIn(duration?: number | string, complete?: Function): JQuery;
	fadeIn(duration?: number | string, easing?: string, complete?: Function): JQuery;
	fadeIn(options: JQueryAnimationOptions): JQuery;

	fadeOut(complete?: Function): JQuery;
	fadeOut(duration?: number | string, complete?: Function): JQuery;
	fadeOut(duration?: number | string, easing?: string, complete?: Function): JQuery;
	fadeOut(options: JQueryAnimationOptions): JQuery;

	fadeTo(duration: string | number, opacity: number, complete?: Function): JQuery;
	fadeTo(duration: string | number, opacity: number, easing?: string, complete?: Function): JQuery;

	fadeToggle(complete?: Function): JQuery;
	fadeToggle(duration?: number | string, complete?: Function): JQuery;
	fadeToggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
	fadeToggle(options: JQueryAnimationOptions): JQuery;

	finish(queue?: string): JQuery;

	hide(complete?: Function): JQuery;
	hide(duration?: number | string, complete?: Function): JQuery;
	hide(duration?: number | string, easing?: string, complete?: Function): JQuery;
	hide(options: JQueryAnimationOptions): JQuery;

	show(complete?: Function): JQuery;
	show(duration?: number | string, complete?: Function): JQuery;
	show(duration?: number | string, easing?: string, complete?: Function): JQuery;
	show(options: JQueryAnimationOptions): JQuery;

	slideDown(complete?: Function): JQuery;
	slideDown(duration?: number | string, complete?: Function): JQuery;
	slideDown(duration?: number | string, easing?: string, complete?: Function): JQuery;
	slideDown(options: JQueryAnimationOptions): JQuery;

	slideToggle(complete?: Function): JQuery;
	slideToggle(duration?: number | string, complete?: Function): JQuery;
	slideToggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
	slideToggle(options: JQueryAnimationOptions): JQuery;

	slideUp(complete?: Function): JQuery;
	slideUp(duration?: number | string, complete?: Function): JQuery;
	slideUp(duration?: number | string, easing?: string, complete?: Function): JQuery;
	slideUp(options: JQueryAnimationOptions): JQuery;

	stop(clearQueue?: boolean, jumpToEnd?: boolean): JQuery;
	stop(queue?: string, clearQueue?: boolean, jumpToEnd?: boolean): JQuery;

	toggle(complete?: Function): JQuery;
	toggle(duration?: number | string, complete?: Function): JQuery;
	toggle(duration?: number | string, easing?: string, complete?: Function): JQuery;
	toggle(options: JQueryAnimationOptions): JQuery;
	toggle(showOrHide: boolean): JQuery;

	bind(eventType: string, eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;
	bind(eventType: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
	bind(eventType: string, eventData: any, preventBubble: boolean): JQuery;
	bind(eventType: string, preventBubble: boolean): JQuery;
	bind(events: any): JQuery;

	blur(): JQuery;
	blur(handler: (eventObject: JQueryEventObject) => any): JQuery;
	blur(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	change(): JQuery;
	change(handler: (eventObject: JQueryEventObject) => any): JQuery;
	change(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	click(): JQuery;
	click(handler: (eventObject: JQueryEventObject) => any): JQuery;
	click(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	dblclick(): JQuery;
	dblclick(handler: (eventObject: JQueryEventObject) => any): JQuery;
	dblclick(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	delegate(selector: any, eventType: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
	delegate(selector: any, eventType: string, eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;

	focus(): JQuery;
	focus(handler: (eventObject: JQueryEventObject) => any): JQuery;
	focus(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	focusin(): JQuery;
	focusin(handler: (eventObject: JQueryEventObject) => any): JQuery;
	focusin(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	focusout(): JQuery;
	focusout(handler: (eventObject: JQueryEventObject) => any): JQuery;
	focusout(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	hover(handlerIn: (eventObject: JQueryEventObject) => any, handlerOut: (eventObject: JQueryEventObject) => any): JQuery;
	hover(handlerInOut: (eventObject: JQueryEventObject) => any): JQuery;

	keydown(): JQuery;
	keydown(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	keydown(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;

	keypress(): JQuery;
	keypress(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	keypress(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;

	keyup(): JQuery;
	keyup(handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	keyup(eventData?: any, handler?: (eventObject: JQueryKeyEventObject) => any): JQuery;

	load(handler: (eventObject: JQueryEventObject) => any): JQuery;
	load(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	mousedown(): JQuery;
	mousedown(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mousedown(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mouseenter(): JQuery;
	mouseenter(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mouseenter(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mouseleave(): JQuery;
	mouseleave(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mouseleave(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mousemove(): JQuery;
	mousemove(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mousemove(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mouseout(): JQuery;
	mouseout(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mouseout(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mouseover(): JQuery;
	mouseover(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mouseover(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	mouseup(): JQuery;
	mouseup(handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	mouseup(eventData: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;

	off(): JQuery;
	off(events: string, selector?: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
	off(events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;
	off(events: string, handler: (eventObject: JQueryEventObject) => any): JQuery;
	off(events: {
		[key: string]: any;
	}, selector?: string): JQuery;


	on(events: MouseEventTypes, handler: (eventObject: JQueryMouseEventObject, ...args: any[]) => any): JQuery;
	on(events: KeyboardEventTypes, handler: (eventObject: JQueryKeyEventObject, ...args: any[]) => any): JQuery;
	on(events: string, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;

	// on(events: MouseEventTypes, data: any, handler: (eventObject: JQueryMouseEventObject, ...args: any[]) => any): JQuery;
	// on(events: KeyboardEventTypes, data: any, handler: (eventObject: JQueryKeyEventObject, ...args: any[]) => any): JQuery;
	// on(events: string, data: any, handler: (eventObject: JQueryEventObject, ...args: any[]) => any): JQuery;

	on(events: MouseEventTypes, selector: string, handler: (eventObject: JQueryMouseEventObject, ...eventData: any[]) => any): JQuery;
	on(events: KeyboardEventTypes, selector: string, handler: (eventObject: JQueryKeyEventObject, ...eventData: any[]) => any): JQuery;
	on(events: string, selector: string, handler: (eventObject: JQueryEventObject, ...eventData: any[]) => any): JQuery;

	on(events: MouseEventTypes, selector: string, data: any, handler: (eventObject: JQueryMouseEventObject, ...eventData: any[]) => any): JQuery;
	on(events: KeyboardEventTypes, selector: string, data: any, handler: (eventObject: JQueryKeyEventObject, ...eventData: any[]) => any): JQuery;
	on(events: string, selector: string, data: any, handler: (eventObject: JQueryEventObject, ...eventData: any[]) => any): JQuery;

	on(events: {
		[key: string]: any;
	}, selector?: string, data?: any): JQuery;

	on(events: {
		[key: string]: any;
	}, data?: any): JQuery;

	one(events: MouseEventTypes, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	one(events: KeyboardEventTypes, handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	one(events: string, handler: (eventObject: JQueryEventObject) => any): JQuery;

	one(events: MouseEventTypes, data: Object, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	one(events: KeyboardEventTypes, data: Object, handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	one(events: string, data: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	one(events: MouseEventTypes, selector: string, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	one(events: KeyboardEventTypes, selector: string, handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	one(events: string, selector: string, handler: (eventObject: JQueryEventObject) => any): JQuery;

	one(events: MouseEventTypes, selector: string, data: any, handler: (eventObject: JQueryMouseEventObject) => any): JQuery;
	one(events: KeyboardEventTypes, selector: string, data: any, handler: (eventObject: JQueryKeyEventObject) => any): JQuery;
	one(events: string, selector: string, data: any, handler: (eventObject: JQueryEventObject) => any): JQuery;

	one(events: {
		[key: string]: any;
	}, selector?: string, data?: any): JQuery;

	one(events: {
		[key: string]: any;
	}, data?: any): JQuery;

	ready(handler: (jQueryAlias?: JQueryStatic) => any): JQuery;

	resize(): JQuery;
	resize(handler: (eventObject: JQueryEventObject) => any): JQuery;
	resize(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	scroll(): JQuery;
	scroll(handler: (eventObject: JQueryEventObject) => any): JQuery;
	scroll(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	select(): JQuery;
	select(handler: (eventObject: JQueryEventObject) => any): JQuery;
	select(eventData: Object, handler: (eventObject: JQueryEventObject) => any): JQuery;

	submit(): JQuery;
	submit(handler: (eventObject: JQueryEventObject) => any): JQuery;
	submit(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	trigger(eventType: string, extraParameters?: any[] | Object): JQuery;
	trigger(event: JQueryEventObject, extraParameters?: any[] | Object): JQuery;

	triggerHandler(eventType: string, ...extraParameters: any[]): Object;
	triggerHandler(event: JQueryEventObject, ...extraParameters: any[]): Object;

	unbind(eventType?: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
	unbind(eventType: string, fls: boolean): JQuery;
	unbind(evt: any): JQuery;

	undelegate(): JQuery;
	undelegate(selector: string, eventType: string, handler?: (eventObject: JQueryEventObject) => any): JQuery;
	undelegate(selector: string, events: Object): JQuery;
	undelegate(namespace: string): JQuery;

	unload(handler: (eventObject: JQueryEventObject) => any): JQuery;
	unload(eventData?: any, handler?: (eventObject: JQueryEventObject) => any): JQuery;

	context: Element;

	jquery: string;

	error(handler: (eventObject: JQueryEventObject) => any): JQuery;
	error(eventData: any, handler: (eventObject: JQueryEventObject) => any): JQuery;

	// inherited from Array.prototype?
	push(...elements: HTMLElement[]): number;

	pushStack(elements: any[]): JQuery;
	pushStack(elements: any[], name: string, arguments: any[]): JQuery;

	after(content1: JQuery | any[] | Element | Text | string, ...content2: any[]): JQuery;
	after(func: (index: number, html: string) => string | Element | JQuery): JQuery;

	append(content1: JQuery | any[] | Element | Text | string, ...content2: any[]): JQuery;
	append(func: (index: number, html: string) => string | Element | JQuery): JQuery;

	appendTo(target: JQuery | any[] | Element | string): JQuery;

	before(content1: JQuery | any[] | Element | Text | string, ...content2: any[]): JQuery;
	before(func: (index: number, html: string) => string | Element | JQuery): JQuery;

	clone(withDataAndEvents?: boolean, deepWithDataAndEvents?: boolean): JQuery;

	detach(selector?: string): JQuery;

	empty(): JQuery;

	insertAfter(target: JQuery | any[] | Element | Text | string): JQuery;

	insertBefore(target: JQuery | any[] | Element | Text | string): JQuery;

	prepend(content1: JQuery | any[] | Element | Text | string, ...content2: any[]): JQuery;
	prepend(func: (index: number, html: string) => string | Element | JQuery): JQuery;

	prependTo(target: JQuery | any[] | Element | string): JQuery;

	remove(selector?: string): JQuery;

	replaceAll(target: JQuery | any[] | Element | string): JQuery;

	replaceWith(newContent: JQuery | any[] | Element | Text | string): JQuery;
	replaceWith(func: () => Element | JQuery): JQuery;

	text(text: string | number | boolean): JQuery;
	text(func: (index: number, text: string) => string): JQuery;
	text(): string;

	toArray(): HTMLElement[];

	unwrap(): JQuery;

	wrap(wrappingElement: JQuery | Element | string): JQuery;
	wrap(func: (index: number) => string | JQuery): JQuery;

	wrapAll(wrappingElement: JQuery | Element | string): JQuery;
	wrapAll(func: (index: number) => string): JQuery;

	wrapInner(wrappingElement: JQuery | Element | string): JQuery;
	wrapInner(func: (index: number) => string): JQuery;

	each(func: (index: number, elem: Element) => any): JQuery;

	get(index: number): HTMLElement;
	get(): HTMLElement[];

	index(selector: string | JQuery | Element): number;
	index(): number;

	length: number;

	selector: string;

	[index: number]: HTMLElement;
	/*:: @@iterator(): Iterator<HTMLElement>; */

	add(selector: string, context?: Element): JQuery;
	add(...elements: Element[]): JQuery;
	add(html: string): JQuery;
	add(obj: JQuery): JQuery;

	children(selector?: string): JQuery;

	closest(selector: string): JQuery;
	closest(selector: string, context?: Element): JQuery;
	closest(obj: JQuery): JQuery;
	closest(element: Element): JQuery;
	closest(selectors: any, context?: Element): any[];

	contents(): JQuery;

	end(): JQuery;

	eq(index: number): JQuery;

	filter(selector: string): JQuery;
	filter(func: (index: number, element: Element) => any): JQuery;
	filter(element: Element): JQuery;
	filter(obj: JQuery): JQuery;

	find(selector: string): JQuery;
	find(element: Element): JQuery;
	find(obj: JQuery): JQuery;

	first(): JQuery;

	has(selector: string): JQuery;
	has(contained: Element): JQuery;

	is(selector: string): boolean;
	is(func: (index: number, element: Element) => boolean): boolean;
	is(obj: JQuery): boolean;
	is(elements: any): boolean;

	last(): JQuery;

	map(callback: (index: number, domElement: Element) => any): JQuery;

	next(selector?: string): JQuery;

	nextAll(selector?: string): JQuery;

	nextUntil(selector?: string, filter?: string): JQuery;
	nextUntil(element?: Element, filter?: string): JQuery;
	nextUntil(obj?: JQuery, filter?: string): JQuery;

	not(selector: string): JQuery;
	not(func: (index: number, element: Element) => boolean): JQuery;
	not(elements: Element | Element[]): JQuery;
	not(obj: JQuery): JQuery;

	offsetParent(): JQuery;

	parent(selector?: string): JQuery;

	parents(selector?: string): JQuery;

	parentsUntil(selector?: string, filter?: string): JQuery;
	parentsUntil(element?: Element, filter?: string): JQuery;
	parentsUntil(obj?: JQuery, filter?: string): JQuery;

	prev(selector?: string): JQuery;

	prevAll(selector?: string): JQuery;

	prevUntil(selector?: string, filter?: string): JQuery;
	prevUntil(element?: Element, filter?: string): JQuery;
	prevUntil(obj?: JQuery, filter?: string): JQuery;

	siblings(selector?: string): JQuery;

	slice(start: number, end?: number): JQuery;

	queue(queueName?: string): any[];
	queue(newQueue: Function[]): JQuery;
	queue(callback: Function): JQuery;
	queue(queueName: string, newQueue: Function[]): JQuery;
	queue(queueName: string, callback: Function): JQuery;

	// jQuery Plugins

	// vendor/jquery.edgescroll-0.1.js
	edgescroll(opts: 'stop' | {
		padding?: number,
		triggerClass?: string,
		topClass?: string,
		bottomClass?: string,
		speed?: number,
	}): JQuery;

	// jquery.tokeninput
	tokenInput(op: 'clear'): JQuery;
	tokenInput(op: 'add', item: mixed): JQuery;
	tokenInput(op: 'remove', item: mixed): JQuery;
	tokenInput(op: 'get'): any[];
	tokenInput(op: 'toggleDisabled', disabled: boolean): JQuery;
	tokenInput<T>(op: 'setOptions', options: TokenInputOptions<T>): JQuery;
	tokenInput(op: 'destroy'): JQuery;
	tokenInput<T>(op: 'init', urlOrDataOrFunction: string | Function, options: TokenInputOptions<T>): JQuery;
	tokenInput<T>(urlOrDataOrFunction: string | Function, options: TokenInputOptions<T>): JQuery;

	// vendor/index.js
	safeHtml(html: string): JQuery;

	// jquery-sortable
	sortable(options: {
		drag?: boolean,
		drop?: boolean,
		exclude?: string,
		nested?: boolean,
		vertical?: boolean,
		afterMove?: ($placeholder: JQuery, container: any, $closestItemOrContainer: JQuery) => void,
		containerPath?: string,
		containerSelector?: string,
		distance?: number,
		delay?: number,
		handle?: string,
		itemPath?: string,
		itemSelector?: string,
		bodyClass?: string,
		draggedClass?: string,
		isValidTarget?: ($item: JQuery, container: any) => boolean,
		onCancel?: ($item: JQuery, container: any, _super: Function, event: Event) => void,
		onDrag?: ($item: JQuery, container: any, _super: Function, event: Event) => void,
		onDragStart?: ($item: JQuery, container: any, _super: Function, event: Event) => void,
		onDrop?: ($item: JQuery, container: any, _super: Function, event: Event) => void,
		onMousedown?: ($item: JQuery, _super: Function, event: Event) => void,
		placeholderClass?: string,
		placeholder?: string,
		pullPLaceholder?: boolean,
		serialize?: ($parent: JQuery, $children: JQuery, parentIsContainer: boolean) => { [key: string]: mixed },
		tolerance?: number,
	}): JQuery;
}

type TokenInputOptions<Item: { [key: any]: any }> = {
	method?: string,
	queryParam?: string,
	searchDelay?: number,
	minChars?: number,
	resultsRoot?: mixed,
	propertyToSearch?: string,
	jsonContainer?: mixed,
	contentType?: string,

	prePopulate?: Item[],
	processPrePopulate?: boolean,

	hintText?: string,
	noResultsText?: string,
	searchingText?: string,
	deleteText?: string,
	animateDropdown?: boolean,
	placeholder?: string,
	theme?: string,
	zindex?: number,
	resultsLimit?: ?number,

	enableHTML?: boolean,

	resultsFormatter?: (item: Item) => string,
	tokenFormatter?: (item: Item) => string,

	tokenLimit?: number,
	tokenDelimiter?: string,
	preventDuplicates?: boolean,
	tokenValue?: string,

	allowFreeTagging?: boolean,
	allowTabOut?: boolean,

	onResult?: (response: any) => Item[],
	onCachedResult?: (response: any) => Item[],
	onAdd?: (item: Item) => void,
	onFreeTaggingAdd?: (token: string) => string,
	onDelete?: (item: Item) => void,
	onReady?: () => void,

	idPrefix?: string,

	disabled?: boolean,
};

declare module 'jquery' {
	declare var exports: JQueryStatic;
}
declare var jQuery: JQueryStatic;
declare var $: JQueryStatic;
