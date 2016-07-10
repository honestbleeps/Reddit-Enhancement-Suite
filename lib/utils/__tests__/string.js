import test from 'ava';

import { encode, escapeHTML } from '../string';

test('encode', t => {
	t.is(
		encode`https://example.com?url=${'https://reddit.com/r/resissues+enhancement'}`,
		'https://example.com?url=https%3A%2F%2Freddit.com%2Fr%2Fresissues%2Benhancement'
	);
});

test('escapeHTML', t => {
	t.is(
		escapeHTML`<div><p>${'<b>Title</b>'}</p></div>`,
		'<div><p>&lt;b&gt;Title&lt;/b&gt;</p></div>'
	);

	t.is(
		escapeHTML`<a href="${'"&url"'}"></a>`,
		'<a href="&quot;&amp;url&quot;"></a>'
	);
});
