/* eslint-env qunit */

test('insertAfter: Inserts a DOM element after a reference element and before the reference\'s next sibling', function() {
	expect(7);

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const referenceNodeSibling = document.createElement('div');
	referenceNodeSibling.id = 'referenceNode_sibling';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	const fix = document.getElementById('qunit-fixture');
	fix.appendChild(referenceNode);
	fix.appendChild(referenceNodeSibling);

	equal(fix.childNodes.length, 2);
	equal(fix.firstChild, referenceNode);
	equal(fix.lastChild, referenceNodeSibling);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(fix.childNodes.length, 3);
	equal(fix.firstChild, referenceNode);
	equal(referenceNode.nextSibling, newNode);
	equal(newNode.nextSibling, referenceNodeSibling);
});

test('insertAfter: Can insert a DOM element after a reference element even if reference is only child', function() {
	expect(5);

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	const fix = document.getElementById('qunit-fixture');
	fix.appendChild(referenceNode);

	equal(fix.childNodes.length, 1);
	equal(fix.firstChild, referenceNode);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(fix.childNodes.length, 2);
	equal(fix.firstChild, referenceNode);
	equal(fix.lastChild, newNode);
});

test('insertAfter: Cannot insert a DOM element if reference element has no parent', function() {
	expect(3);

	const referenceNode = document.createElement('div');
	referenceNode.id = 'referenceNode';
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	equal(document.getElementById('newNode'), null);
	equal(referenceNode.parentNode, null);

	RESUtils.insertAfter(referenceNode, newNode, false);

	equal(document.getElementById('newNode'), null);
});

test('insertAfter: Cannot insert a DOM element if reference element is undefined', function() {
	expect(4);

	const referenceNode = null;
	const newNode = document.createElement('div');
	newNode.id = 'newNode';

	equal(document.getElementById('newNode'), null);
	equal(referenceNode, null);

	RESUtils.insertAfter(referenceNode, newNode, false);

	equal(document.getElementById('newNode'), null);
	equal(referenceNode, null);
});
