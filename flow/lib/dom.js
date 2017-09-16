/* @flow */

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

// https://github.com/facebook/flow/blob/7b172c807fea56f8dc8f40f4539e683fa16e4b2f/lib/bom.js#L824
// Make the constructor take map objects or strings.
declare class URLSearchParams {
	/*:: @@iterator(): Iterator<[string, string]>; */
	constructor(query?: string | { [key: string]: string }): void;
	append(name: string, value: string): void;
	delete(name: string): void;
	entries(): Iterator<[string, string]>;
	forEach(callback: (value: string, name: string, params: URLSearchParams) => any, thisArg?: any): void;
	get(name: string): string;
	getAll(name: string): Array<string>;
	has(name: string): boolean;
	keys(): Iterator<string>;
	set(name: string, value: string): void;
	values(): Iterator<string>;
}

// temp: make querySelector return value non-nullable

// make documentElement, body, head non-nullable

declare class Element extends Node {
	assignedSlot: ?HTMLSlotElement;
	attachShadow(shadowRootInitDict: ShadowRootInit): ShadowRoot;
	attributes: NamedNodeMap;
	classList: DOMTokenList;
	className: string;
	clientHeight: number;
	clientLeft: number;
	clientTop: number;
	clientWidth: number;
	id: string;
	innerHTML: string;
	localName: string;
	namespaceURI: ?string;
	nextElementSibling: ?Element;
	outerHTML: string;
	prefix: string | null;
	previousElementSibling: ?Element;
	scrollHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollWidth: number;
	tagName: string;

	closest(selectors: string): ?Element;
	dispatchEvent(event: Event): bool;

	getAttribute(name?: string): string;
	getAttributeNS(namespaceURI: string | null, localName: string): string;
	getAttributeNode(name: string): Attr | null;
	getAttributeNodeNS(namespaceURI: string | null, localName: string): Attr | null;
	getBoundingClientRect(): ClientRect;
	getClientRects(): ClientRect[];
	getElementsByClassName(names: string): HTMLCollection<HTMLElement>;
	getElementsByTagName(name: 'a'): HTMLCollection<HTMLAnchorElement>;
	getElementsByTagName(name: 'audio'): HTMLCollection<HTMLAudioElement>;
	getElementsByTagName(name: 'button'): HTMLCollection<HTMLButtonElement>;
	getElementsByTagName(name: 'canvas'): HTMLCollection<HTMLCanvasElement>;
	getElementsByTagName(name: 'div'): HTMLCollection<HTMLDivElement>;
	getElementsByTagName(name: 'form'): HTMLCollection<HTMLFormElement>;
	getElementsByTagName(name: 'iframe'): HTMLCollection<HTMLIFrameElement>;
	getElementsByTagName(name: 'img'): HTMLCollection<HTMLImageElement>;
	getElementsByTagName(name: 'input'): HTMLCollection<HTMLInputElement>;
	getElementsByTagName(name: 'label'): HTMLCollection<HTMLLabelElement>;
	getElementsByTagName(name: 'link'): HTMLCollection<HTMLLinkElement>;
	getElementsByTagName(name: 'meta'): HTMLCollection<HTMLMetaElement>;
	getElementsByTagName(name: 'option'): HTMLCollection<HTMLOptionElement>;
	getElementsByTagName(name: 'p'): HTMLCollection<HTMLParagraphElement>;
	getElementsByTagName(name: 'script'): HTMLCollection<HTMLScriptElement>;
	getElementsByTagName(name: 'select'): HTMLCollection<HTMLSelectElement>;
	getElementsByTagName(name: 'source'): HTMLCollection<HTMLSourceElement>;
	getElementsByTagName(name: 'span'): HTMLCollection<HTMLSpanElement>;
	getElementsByTagName(name: 'style'): HTMLCollection<HTMLStyleElement>;
	getElementsByTagName(name: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
	getElementsByTagName(name: 'video'): HTMLCollection<HTMLVideoElement>;
	getElementsByTagName(name: 'table'): HTMLCollection<HTMLTableElement>;
	getElementsByTagName(name: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
	getElementsByTagName(name: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
	getElementsByTagName(name: 'tr'): HTMLCollection<HTMLTableRowElement>;
	getElementsByTagName(name: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
	getElementsByTagName(name: 'template'): HTMLCollection<HTMLTemplateElement>;
	getElementsByTagName(name: string): HTMLCollection<HTMLElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'a'): HTMLCollection<HTMLAnchorElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'audio'): HTMLCollection<HTMLAudioElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'button'): HTMLCollection<HTMLButtonElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'canvas'): HTMLCollection<HTMLCanvasElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'div'): HTMLCollection<HTMLDivElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'form'): HTMLCollection<HTMLFormElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'iframe'): HTMLCollection<HTMLIFrameElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'img'): HTMLCollection<HTMLImageElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'input'): HTMLCollection<HTMLInputElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'label'): HTMLCollection<HTMLLabelElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'link'): HTMLCollection<HTMLLinkElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'meta'): HTMLCollection<HTMLMetaElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'option'): HTMLCollection<HTMLOptionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'p'): HTMLCollection<HTMLParagraphElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'script'): HTMLCollection<HTMLScriptElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'select'): HTMLCollection<HTMLSelectElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'source'): HTMLCollection<HTMLSourceElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'span'): HTMLCollection<HTMLSpanElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'style'): HTMLCollection<HTMLStyleElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'video'): HTMLCollection<HTMLVideoElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'table'): HTMLCollection<HTMLTableElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'tr'): HTMLCollection<HTMLTableRowElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'template'): HTMLCollection<HTMLTemplateElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: string): HTMLCollection<HTMLElement>;
	hasAttribute(name: string): boolean;
	hasAttributeNS(namespaceURI: string | null, localName: string): boolean;
	insertAdjacentElement(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', element: Element): void;
	insertAdjacentHTML(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', html: string): void;
	insertAdjacentText(position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', text: string): void;
	matches(selector: string): bool;
	querySelector(selector: string): HTMLElement;
	querySelectorAll(selector: string): NodeList<HTMLElement>;
	releasePointerCapture(pointerId: string): void;
	removeAttribute(name?: string): void;
	removeAttributeNode(attributeNode: Attr): Attr;
	removeAttributeNS(namespaceURI: string | null, localName: string): void;
	requestFullscren(): void;
	requestPointerLock(): void;
	scrollIntoView(arg?: (boolean | { behavior?: ('auto' | 'instant' | 'smooth'), block?: ('start' | 'end') })): void;
setAttribute(name?: string, value?: string): void;
setAttributeNS(namespaceURI: string | null, qualifiedName: string, value: string): void;
setAttributeNode(newAttr: Attr): Attr | null;
setAttributeNodeNS(newAttr: Attr): Attr | null;
setPointerCapture(pointerId: string): void;
shadowRoot?: ShadowRoot;
slot?: string;

// from ParentNode interface
childElementCount: number;
children: HTMLCollection<HTMLElement>;
firstElementChild: ?Element;
lastElementChild: ?Element;
append(...nodes: Array<string | Node>): void;
prepend(...nodes: Array<string | Node>): void;

// from ChildNode interface
after(...nodes: Array<string | Node>): void;
before(...nodes: Array<string | Node>): void;
replaceWith(...nodes: Array<string | Node>): void;
remove(): void;
}

declare class DocumentFragment extends Node {
	// from ParentNode interface
	childElementCount: number;
	children: HTMLCollection<HTMLElement>;
	firstElementChild: ?Element;
	lastElementChild: ?Element;
	append(...nodes: Array<string | Node>): void;
	prepend(...nodes: Array<string | Node>): void;

	querySelector(selector: string): HTMLElement;
	querySelectorAll(selector: string): NodeList<HTMLElement>;
}

declare class Document extends Node {
	URL: string;
	adoptNode<T: Node>(source: T): T;
	anchors: HTMLCollection<HTMLAnchorElement>;
	applets: HTMLCollection<HTMLAppletElement>;
	body: HTMLElement;
	characterSet: string;
	close(): void;
	cookie: string;
	createAttribute(name: string): Attr;
	createAttributeNS(namespaceURI: string | null, qualifiedName: string): Attr;
	createCDATASection(data: string): Text;
	createComment(data: string): Comment;
	createDocumentFragment(): DocumentFragment;
	createElement(tagName: 'a'): HTMLAnchorElement;
	createElement(tagName: 'audio'): HTMLAudioElement;
	createElement(tagName: 'button'): HTMLButtonElement;
	createElement(tagName: 'canvas'): HTMLCanvasElement;
	createElement(tagName: 'div'): HTMLDivElement;
	createElement(tagName: 'form'): HTMLFormElement;
	createElement(tagName: 'iframe'): HTMLIFrameElement;
	createElement(tagName: 'img'): HTMLImageElement;
	createElement(tagName: 'input'): HTMLInputElement;
	createElement(tagName: 'label'): HTMLLabelElement;
	createElement(tagName: 'link'): HTMLLinkElement;
	createElement(tagName: 'meta'): HTMLMetaElement;
	createElement(tagName: 'option'): HTMLOptionElement;
	createElement(tagName: 'p'): HTMLParagraphElement;
	createElement(tagName: 'script'): HTMLScriptElement;
	createElement(tagName: 'select'): HTMLSelectElement;
	createElement(tagName: 'source'): HTMLSourceElement;
	createElement(tagName: 'span'): HTMLSpanElement;
	createElement(tagName: 'style'): HTMLStyleElement;
	createElement(tagName: 'textarea'): HTMLTextAreaElement;
	createElement(tagName: 'video'): HTMLVideoElement;
	createElement(tagName: 'table'): HTMLTableElement;
	createElement(tagName: 'caption'): HTMLTableCaptionElement;
	createElement(tagName: 'thead' | 'tfoot', 'tbody'): HTMLTableSectionElement;
	createElement(tagName: 'tr'): HTMLTableRowElement;
	createElement(tagName: 'td' | 'th'): HTMLTableCellElement;
	createElement(tagName: 'template'): HTMLTemplateElement;
	createElement(tagName: string): HTMLElement;
	createElementNS(namespaceURI: string | null, qualifiedName: string): Element;
	createTextNode(data: string): Text;
	currentScript: HTMLScriptElement | null;
	doctype: DocumentType | null;
	documentElement: HTMLElement;
	documentMode: number;
	domain: string | null;
	embeds: HTMLCollection<HTMLEmbedElement>;
	execCommand(cmdID: string, showUI?: boolean, value?: any): boolean;
	forms: HTMLCollection<HTMLFormElement>;
	getElementById(elementId: string): HTMLElement;
	getElementsByClassName(classNames: string): HTMLCollection<HTMLElement>;
	getElementsByName(elementName: string): HTMLCollection<HTMLElement>;
	getElementsByTagName(name: 'a'): HTMLCollection<HTMLAnchorElement>;
	getElementsByTagName(name: 'audio'): HTMLCollection<HTMLAudioElement>;
	getElementsByTagName(name: 'button'): HTMLCollection<HTMLButtonElement>;
	getElementsByTagName(name: 'canvas'): HTMLCollection<HTMLCanvasElement>;
	getElementsByTagName(name: 'div'): HTMLCollection<HTMLDivElement>;
	getElementsByTagName(name: 'form'): HTMLCollection<HTMLFormElement>;
	getElementsByTagName(name: 'iframe'): HTMLCollection<HTMLIFrameElement>;
	getElementsByTagName(name: 'img'): HTMLCollection<HTMLImageElement>;
	getElementsByTagName(name: 'input'): HTMLCollection<HTMLInputElement>;
	getElementsByTagName(name: 'label'): HTMLCollection<HTMLLabelElement>;
	getElementsByTagName(name: 'link'): HTMLCollection<HTMLLinkElement>;
	getElementsByTagName(name: 'meta'): HTMLCollection<HTMLMetaElement>;
	getElementsByTagName(name: 'option'): HTMLCollection<HTMLOptionElement>;
	getElementsByTagName(name: 'p'): HTMLCollection<HTMLParagraphElement>;
	getElementsByTagName(name: 'script'): HTMLCollection<HTMLScriptElement>;
	getElementsByTagName(name: 'select'): HTMLCollection<HTMLSelectElement>;
	getElementsByTagName(name: 'source'): HTMLCollection<HTMLSourceElement>;
	getElementsByTagName(name: 'span'): HTMLCollection<HTMLSpanElement>;
	getElementsByTagName(name: 'style'): HTMLCollection<HTMLStyleElement>;
	getElementsByTagName(name: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
	getElementsByTagName(name: 'video'): HTMLCollection<HTMLVideoElement>;
	getElementsByTagName(name: 'table'): HTMLCollection<HTMLTableElement>;
	getElementsByTagName(name: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
	getElementsByTagName(name: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
	getElementsByTagName(name: 'tr'): HTMLCollection<HTMLTableRowElement>;
	getElementsByTagName(name: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
	getElementsByTagName(name: 'template'): HTMLCollection<HTMLTemplateElement>;
	getElementsByTagName(name: string): HTMLCollection<HTMLElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'a'): HTMLCollection<HTMLAnchorElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'audio'): HTMLCollection<HTMLAudioElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'button'): HTMLCollection<HTMLButtonElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'canvas'): HTMLCollection<HTMLCanvasElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'div'): HTMLCollection<HTMLDivElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'form'): HTMLCollection<HTMLFormElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'iframe'): HTMLCollection<HTMLIFrameElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'img'): HTMLCollection<HTMLImageElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'input'): HTMLCollection<HTMLInputElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'label'): HTMLCollection<HTMLLabelElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'link'): HTMLCollection<HTMLLinkElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'meta'): HTMLCollection<HTMLMetaElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'option'): HTMLCollection<HTMLOptionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'p'): HTMLCollection<HTMLParagraphElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'script'): HTMLCollection<HTMLScriptElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'select'): HTMLCollection<HTMLSelectElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'source'): HTMLCollection<HTMLSourceElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'span'): HTMLCollection<HTMLSpanElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'style'): HTMLCollection<HTMLStyleElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'textarea'): HTMLCollection<HTMLTextAreaElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'video'): HTMLCollection<HTMLVideoElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'table'): HTMLCollection<HTMLTableElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'caption'): HTMLCollection<HTMLTableCaptionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'thead' | 'tfoot' | 'tbody'): HTMLCollection<HTMLTableSectionElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'tr'): HTMLCollection<HTMLTableRowElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'td' | 'th'): HTMLCollection<HTMLTableCellElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: 'template'): HTMLCollection<HTMLTemplateElement>;
	getElementsByTagNameNS(namespaceURI: string | null, localName: string): HTMLCollection<HTMLElement>;
	head: HTMLElement;
	images: HTMLCollection<HTMLImageElement>;
	implementation: DOMImplementation;
	importNode<T: Node>(importedNode: T, deep: boolean): T;
	inputEncoding: string;
	lastModified: string;
	links: HTMLCollection<HTMLLinkElement>;
	media: string;
	open(url?: string, name?: string, features?: string, replace?: boolean): any;
	readyState: string;
	referrer: string;
	scripts: HTMLCollection<HTMLScriptElement>;
	styleSheets: StyleSheetList;
	title: string;
	visibilityState: 'visible' | 'hidden' | 'prerender' | 'unloaded';
	write(...content: Array<string>): void;
	writeln(...content: Array<string>): void;
	xmlEncoding: string;
	xmlStandalone: boolean;
	xmlVersion: string;

	registerElement(type: string, options?: ElementRegistrationOptions): any;
	getSelection(): Selection | null;

	// 6.4.6 Focus management APIs
	activeElement: HTMLElement | null;
	hasFocus(): boolean;

	// extension
	location: Location;
	createEvent(eventInterface: 'CustomEvent'): CustomEvent;
	createEvent(eventInterface: string): Event;
	createRange(): Range;
	elementFromPoint(x: number, y: number): HTMLElement;
	defaultView: any;
	compatMode: 'BackCompat' | 'CSS1Compat';
	hidden: boolean;

	// from ParentNode interface
	childElementCount: number;
	children: HTMLCollection<HTMLElement>;
	firstElementChild: ?Element;
	lastElementChild: ?Element;
	append(...nodes: Array<string | Node>): void;
	prepend(...nodes: Array<string | Node>): void;

	querySelector(selector: 'a'): HTMLAnchorElement;
	querySelector(selector: 'audio'): HTMLAudioElement;
	querySelector(selector: 'button'): HTMLButtonElement;
	querySelector(selector: 'canvas'): HTMLCanvasElement;
	querySelector(selector: 'div'): HTMLDivElement;
	querySelector(selector: 'form'): HTMLFormElement;
	querySelector(selector: 'iframe'): HTMLIFrameElement;
	querySelector(selector: 'img'): HTMLImageElement;
	querySelector(selector: 'input'): HTMLInputElement;
	querySelector(selector: 'label'): HTMLLabelElement;
	querySelector(selector: 'link'): HTMLLinkElement;
	querySelector(selector: 'meta'): HTMLMetaElement;
	querySelector(selector: 'option'): HTMLOptionElement;
	querySelector(selector: 'p'): HTMLParagraphElement;
	querySelector(selector: 'script'): HTMLScriptElement;
	querySelector(selector: 'select'): HTMLSelectElement;
	querySelector(selector: 'source'): HTMLSourceElement;
	querySelector(selector: 'span'): HTMLSpanElement;
	querySelector(selector: 'style'): HTMLStyleElement;
	querySelector(selector: 'textarea'): HTMLTextAreaElement;
	querySelector(selector: 'video'): HTMLVideoElement;
	querySelector(selector: 'table'): HTMLTableElement;
	querySelector(selector: 'caption'): HTMLTableCaptionElement;
	querySelector(selector: 'thead' | 'tfoot' | 'tbody'): HTMLTableSectionElement;
	querySelector(selector: 'tr'): HTMLTableRowElement;
	querySelector(selector: 'td' | 'th'): HTMLTableCellElement;
	querySelector(selector: 'template'): HTMLTemplateElement;
	querySelector(selector: string): HTMLElement;

	querySelectorAll(selector: 'a'): NodeList<HTMLAnchorElement>;
	querySelectorAll(selector: 'audio'): NodeList<HTMLAudioElement>;
	querySelectorAll(selector: 'button'): NodeList<HTMLButtonElement>;
	querySelectorAll(selector: 'canvas'): NodeList<HTMLCanvasElement>;
	querySelectorAll(selector: 'div'): NodeList<HTMLDivElement>;
	querySelectorAll(selector: 'form'): NodeList<HTMLFormElement>;
	querySelectorAll(selector: 'iframe'): NodeList<HTMLIFrameElement>;
	querySelectorAll(selector: 'img'): NodeList<HTMLImageElement>;
	querySelectorAll(selector: 'input'): NodeList<HTMLInputElement>;
	querySelectorAll(selector: 'label'): NodeList<HTMLLabelElement>;
	querySelectorAll(selector: 'link'): NodeList<HTMLLinkElement>;
	querySelectorAll(selector: 'meta'): NodeList<HTMLMetaElement>;
	querySelectorAll(selector: 'option'): NodeList<HTMLOptionElement>;
	querySelectorAll(selector: 'p'): NodeList<HTMLParagraphElement>;
	querySelectorAll(selector: 'script'): NodeList<HTMLScriptElement>;
	querySelectorAll(selector: 'select'): NodeList<HTMLSelectElement>;
	querySelectorAll(selector: 'source'): NodeList<HTMLSourceElement>;
	querySelectorAll(selector: 'span'): NodeList<HTMLSpanElement>;
	querySelectorAll(selector: 'style'): NodeList<HTMLStyleElement>;
	querySelectorAll(selector: 'textarea'): NodeList<HTMLTextAreaElement>;
	querySelectorAll(selector: 'video'): NodeList<HTMLVideoElement>;
	querySelectorAll(selector: 'table'): NodeList<HTMLTableElement>;
	querySelectorAll(selector: 'caption'): NodeList<HTMLTableCaptionElement>;
	querySelectorAll(selector: 'thead' | 'tfoot' | 'tbody'): NodeList<HTMLTableSectionElement>;
	querySelectorAll(selector: 'tr'): NodeList<HTMLTableRowElement>;
	querySelectorAll(selector: 'td' | 'th'): NodeList<HTMLTableCellElement>;
	querySelectorAll(selector: 'template'): NodeList<HTMLTemplateElement>;
	querySelectorAll(selector: string): NodeList<HTMLElement>;

	// Interface DocumentTraversal
	// http://www.w3.org/TR/2000/REC-DOM-Level-2-Traversal-Range-20001113/traversal.html#Traversal-Document

	// Not all combinations of RootNodeT and whatToShow are logically possible.
	// The bitmasks NodeFilter.SHOW_CDATA_SECTION,
	// NodeFilter.SHOW_ENTITY_REFERENCE, NodeFilter.SHOW_ENTITY, and
	// NodeFilter.SHOW_NOTATION are deprecated and do not correspond to types
	// that Flow knows about.

	// NodeFilter.SHOW_ATTRIBUTE is also deprecated, but corresponds to the
	// type Attr. While there is no reason to prefer it to Node.attributes,
	// it does have meaning and can be typed: When (whatToShow &
	// NodeFilter.SHOW_ATTRIBUTE === 1), RootNodeT must be Attr, and when
	// RootNodeT is Attr, bitmasks other than NodeFilter.SHOW_ATTRIBUTE are
	// meaningless.
	createNodeIterator<RootNodeT: Attr>(root: RootNodeT, whatToShow: 2, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Attr>;
	createTreeWalker<RootNodeT: Attr>(root: RootNodeT, whatToShow: 2, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Attr>;

	// NodeFilter.SHOW_PROCESSING_INSTRUCTION is not implemented because Flow
	// does not currently define a ProcessingInstruction class.

	// When (whatToShow & NodeFilter.SHOW_DOCUMENT === 1 || whatToShow &
	// NodeFilter.SHOW_DOCUMENT_TYPE === 1), RootNodeT must be Document.
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 256, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 257, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Element>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 260, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 261, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Element | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 384, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 385, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Element | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 388, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Text | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 389, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Document | Element | Text | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 512, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 513, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Element>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 516, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 517, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Element | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 640, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 641, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Element | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 644, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Text | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 645, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Element | Text | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 768, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 769, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Element>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 772, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 773, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Element | Text>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 896, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 897, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Element | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 900, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Text | Comment>;
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: 901, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentType | Document | Element | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 256, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 257, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Element>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 260, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 261, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Element | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 384, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 385, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Element | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 388, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 389, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Document | Element | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 512, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 513, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Element>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 516, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 517, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Element | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 640, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 641, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Element | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 644, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 645, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Element | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 768, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 769, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Element>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 772, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 773, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Element | Text>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 896, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 897, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Element | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 900, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Text | Comment>;
	createTreeWalker<RootNodeT: Document>(root: RootNodeT, whatToShow: 901, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentType | Document | Element | Text | Comment>;

	// When (whatToShow & NodeFilter.SHOW_DOCUMENT_FRAGMENT === 1), RootNodeT
	// must be a DocumentFragment.
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1024, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1025, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Element>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1028, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Text>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1029, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Element | Text>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1152, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Comment>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1153, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Element | Comment>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1156, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Text | Comment>;
	createNodeIterator<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1157, filter?: NodeFilterInterface): NodeIterator<RootNodeT, DocumentFragment | Element | Text | Comment>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1024, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1025, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Element>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1028, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Text>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1029, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Element | Text>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1152, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Comment>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1153, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Element | Comment>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1156, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Text | Comment>;
	createTreeWalker<RootNodeT: DocumentFragment>(root: RootNodeT, whatToShow: 1157, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, DocumentFragment | Element | Text | Comment>;

	// In the general case, RootNodeT may be any Node and whatToShow may be
	// NodeFilter.SHOW_ALL or any combination of NodeFilter.SHOW_ELEMENT,
	// NodeFilter.SHOW_TEXT and/or NodeFilter.SHOW_COMMENT
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 1, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 4, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 5, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element | Text>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 128, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Comment>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 129, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Element | Comment>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 132, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text | Comment>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: 133, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Text | Element | Comment>;
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: -1, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Node>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 1, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 4, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 5, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element | Text>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 128, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Comment>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 129, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Element | Comment>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 132, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text | Comment>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: 133, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Text | Element | Comment>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: -1, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Node>;

	// Catch all for when we don't know the value of `whatToShow`
	createNodeIterator<RootNodeT: Document>(root: RootNodeT, whatToShow: number, filter?: NodeFilterInterface): NodeIterator<RootNodeT, Node>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: number, filter?: NodeFilterInterface, entityReferenceExpansion?: boolean): TreeWalker<RootNodeT, Node>;

	// And for when whatToShow is not provided, it is assumed to be SHOW_ALL
	createNodeIterator<RootNodeT: Node>(root: RootNodeT, whatToShow: void): NodeIterator<RootNodeT, Node>;
	createTreeWalker<RootNodeT: Node>(root: RootNodeT, whatToShow: void): TreeWalker<RootNodeT, Node>;
}
