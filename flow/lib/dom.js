type MutationObserverInit = {
	childList?: boolean,
	attributes?: boolean,
	characterData?: boolean,
	subtree?: boolean,
	attributeOldValue?: boolean,
	characterDataOldValue?: boolean,
	attributeFilter?: Array<string>,
};

// https://github.com/facebook/flow/blob/8e0f56e3d60686c426cab93da202fbe029f1a59e/lib/bom.js#L329
// adding responseURL: https://xhr.spec.whatwg.org/#the-responseurl-attribute
declare class XMLHttpRequest extends EventTarget {
	responseBody: any;
	status: number;
	readyState: number;
	responseText: string;
	responseXML: any;
	responseURL: string;
	ontimeout: (ev: ProgressEvent) => any;
	statusText: string;
	onreadystatechange: (ev: Event) => any;
	timeout: number;
	onload: (ev: ProgressEvent) => any;
	response: any;
	withCredentials: boolean;
	onprogress: (ev: ProgressEvent) => any;
	onabort: (ev: ProgressEvent) => any;
	responseType: string;
	onloadend: (ev: ProgressEvent) => any;
	upload: XMLHttpRequestEventTarget;
	onerror: (ev: ProgressEvent) => any;
	onloadstart: (ev: ProgressEvent) => any;
	msCaching: string;
	open(method: string, url: string, async?: boolean, user?: string, password?: string): void;
	send(data?: any): void;
	abort(): void;
	getAllResponseHeaders(): string;
	setRequestHeader(header: string, value: string): void;
	getResponseHeader(header: string): string;
	msCachingEnabled(): boolean;
	overrideMimeType(mime: string): void;
	LOADING: number;
	DONE: number;
	UNSENT: number;
	OPENED: number;
	HEADERS_RECEIVED: number;

	statics: {
		create(): XMLHttpRequest;
	},
}

// Make event.target an HTMLElement
// this is unsound for `window.addEventListener`
// but it's better than having to downcast every single event target
declare class Event {
	constructor(type: string, eventInitDict?: Event$Init): void;
	bubbles: boolean;
	cancelable: boolean;
	currentTarget: HTMLElement;
	defaultPrevented: boolean;
	eventPhase: number;
	isTrusted: boolean;
	srcElement: Element;
	target: HTMLElement;
	timeStamp: number;
	type: string;
	preventDefault(): void;
	stopImmediatePropagation(): void;
	stopPropagation(): void;
	AT_TARGET: number;
	BUBBLING_PHASE: number;
	CAPTURING_PHASE: number;
}

// https://github.com/facebook/flow/blob/6d110710af4d6200ff8bf510ce6438aa203de09b/lib/dom.js#L1598
// Only <option> and <optgroup> can inhabit this in valid HTML
declare class HTMLOptionsCollection {
	length: number;
	item(index: number): HTMLOptionElement;
	namedItem(name: string): HTMLOptionElement;
}
