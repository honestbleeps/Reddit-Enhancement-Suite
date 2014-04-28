// Silence insertAfter's `console.log(arguments.callee.caller)` calls
var origLog = console.log;
console.log = function(x) {
	if (typeof(x) != 'function') {
		origLog(x);
	}
}

test("insertAfter: Inserts a DOM element after a reference element and before the reference's next sibling", function() {
	expect(7);	
	var $fixture = $( "#qunit-fixture" );  

	referenceNode = document.createElement("div");
	referenceNode.id = "referenceNode"; 	
	referenceNode_sibling = document.createElement("div");
	referenceNode_sibling.id = "referenceNode_sibling";
	newNode = document.createElement("div");
	newNode.id = "newNode";

	var fix = document.getElementById("qunit-fixture");
	fix.appendChild(referenceNode);
	fix.appendChild(referenceNode_sibling); 	

	equal(fix.childNodes.length, 2);	
	equal(fix.firstChild, referenceNode);
	equal(fix.lastChild, referenceNode_sibling);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(fix.childNodes.length, 3);
	equal(fix.firstChild, referenceNode);
	equal(referenceNode.nextSibling, newNode);
	equal(newNode.nextSibling, referenceNode_sibling);
});

test("insertAfter: Can insert a DOM element after a reference element even if reference is only child", function() {
	expect(5);	
	var $fixture = $( "#qunit-fixture" );  

	referenceNode = document.createElement("div");
	referenceNode.id = "referenceNode"; 	
	newNode = document.createElement("div");
	newNode.id = "newNode";

	var fix = document.getElementById("qunit-fixture");
	fix.appendChild(referenceNode);

	equal(fix.childNodes.length, 1);
	equal(fix.firstChild, referenceNode);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(fix.childNodes.length, 2);
	equal(fix.firstChild, referenceNode);
	equal(fix.lastChild, newNode);
});

test("insertAfter: Cannot insert a DOM element if reference element has no parent", function() {
	expect(3);	
	var $fixture = $( "#qunit-fixture" );  

	referenceNode = document.createElement("div");
	referenceNode.id = "referenceNode"; 	
	newNode = document.createElement("div");
	newNode.id = "newNode";

	equal(document.getElementById("newNode"), null);
 	equal(referenceNode.parentNode, null);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(document.getElementById("newNode"), null);
});

test("insertAfter: Cannot insert a DOM element if reference element is undefined", function() {
	expect(4);	
	var $fixture = $( "#qunit-fixture" );  

	referenceNode = null;
	newNode = document.createElement("div");
	newNode.id = "newNode";

	equal(document.getElementById("newNode"), null);
	equal(referenceNode, null);

	RESUtils.insertAfter(referenceNode, newNode);

	equal(document.getElementById("newNode"), null);
	equal(referenceNode, null);
});

