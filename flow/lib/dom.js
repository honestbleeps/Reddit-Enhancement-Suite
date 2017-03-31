type MutationObserverInit = {
	childList?: boolean,
	attributes?: boolean,
	characterData?: boolean,
	subtree?: boolean,
	attributeOldValue?: boolean,
	characterDataOldValue?: boolean,
	attributeFilter?: Array<string>,
};

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
