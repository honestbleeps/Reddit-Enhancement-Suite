import 'babel-polyfill';
import test from 'ava';
import jsdom from 'jsdom';

import { RESUtils } from '../utils';

test.beforeEach(t => {
	t.context.document = jsdom.jsdom('<html><body><div id="fixture"></div></body></html>');
});

test('Inserts a DOM element after a reference element and before the reference\'s next sibling', t => {
	const { document } = t.context;

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const referenceNode_sibling = document.createElement('div');
	referenceNode_sibling.id = 'referenceNode_sibling';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	const fix = document.getElementById('fixture');
	fix.appendChild(referenceNode);
	fix.appendChild(referenceNode_sibling);

	t.is(fix.childNodes.length, 2);
	t.is(fix.firstChild, referenceNode);
	t.is(fix.lastChild, referenceNode_sibling);

	RESUtils.insertAfter(referenceNode, newNode);

	t.is(fix.childNodes.length, 3);
	t.is(fix.firstChild, referenceNode);
	t.is(referenceNode.nextSibling, newNode);
	t.is(newNode.nextSibling, referenceNode_sibling);
});

test('Can insert a DOM element after a reference element even if reference is only child', t => {
	const { document } = t.context;

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	const fix = document.getElementById('fixture');
	fix.appendChild(referenceNode);

	t.is(fix.childNodes.length, 1);
	t.is(fix.firstChild, referenceNode);

	RESUtils.insertAfter(referenceNode, newNode);

	t.is(fix.childNodes.length, 2);
	t.is(fix.firstChild, referenceNode);
	t.is(fix.lastChild, newNode);
});

test('Cannot insert a DOM element if reference element has no parent', t => {
	const { document } = t.context;

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	t.is(document.getElementById('newNode'), null);
	t.is(referenceNode.parentNode, null);

	RESUtils.insertAfter(referenceNode, newNode, false);

	t.is(document.getElementById('newNode'), null);
});

test('Cannot insert a DOM element if reference element is undefined', t => {
	const { document } = t.context;

	const referenceNode = null;
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	t.is(document.getElementById('newNode'), null);
	t.is(referenceNode, null);

	RESUtils.insertAfter(referenceNode, newNode, false);

	t.is(document.getElementById('newNode'), null);
	t.is(referenceNode, null);
});
