/* @flow */

const escapeLookups = {
	'&': '&amp;',
	'"': '&quot;',
	'<': '&lt;',
	'>': '&gt;',
};

export function escapeHTML(str: ?string): string {
	return str ?
		str.toString().replace(/[&"<>]/g, m => escapeLookups[m]) :
		'';
}

const ELEMENTS: $ReadOnlyArray<string> = [
	'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'code',
	'br', 'hr', 'p', 'a', 'img', 'pre', 'blockquote', 'table',
	'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'strong', 'em',
	'i', 'b', 'u', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
	'font', 'center', 'small', 's', 'q', 'sub', 'sup', 'del',
];

const ATTRIBUTES: $ReadOnlyArray<string> = ['title', 'src', 'alt', 'href'];

const SCHEMES: $ReadOnlyArray<string> = [
	'http:', 'https:', 'ftp:', 'mailto:',
	'git:', 'steam:', 'irc:', 'news:', 'mumble:',
	'ssh:', 'ircs:', 'ts3server:', ':',
];

function cloneTo(parent, node) {
	switch (node.nodeType) {
		case 1: // element node
			const nodeName = ELEMENTS.find(e => e === node.nodeName);
			if (typeof nodeName !== 'string') return;
			// manually clone the element
			const cloned = document.createElement(nodeName);
			// copy over attributes
			for (const attr of node.attributes) {
				const attrName = ATTRIBUTES.find(a => a === attr.name);
				if (typeof attrName !== 'string') continue;
				cloned.setAttribute(attrName, attr.value);
			}
			// sanitize href schemes
			if (nodeName === 'a' && !SCHEMES.find(s => s === cloned.protocol)) {
				// invalid url scheme
				return;
			}
			// clone children
			for (const childNode of node.childNodes) {
				cloneTo(cloned, childNode);
			}
			// add cloned node to parent
			parent.appendChild(cloned);
			break;
		case 3: // text node
			parent.appendChild(document.createTextNode(node.nodeValue));
			break;
		default: // ignore all other nodes
			break;
	}
}

export function safeParse(html: string): DocumentFragment {
	// eslint-disable-next-line no-restricted-syntax
	const unsanitizedDocument = new DOMParser().parseFromString(html, 'text/html');
	const sanitizedNodes = document.createDocumentFragment();
	for (const child of unsanitizedDocument.body.childNodes) {
		cloneTo(sanitizedNodes, child);
	}
	return sanitizedNodes;
}
