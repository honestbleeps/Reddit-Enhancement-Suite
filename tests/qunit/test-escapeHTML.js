/* eslint-env qunit */

test('escapeHTML: Returns null on null string', () => {
	expect(1);
	equal(escapeHTML(null), null);
});

test('escapeHTML: Escaping single characters correctly', () => {
	expect(4);
	equal(escapeHTML('&'), '&amp;', 'Escaping ampersands');
	equal(escapeHTML('>'), '&gt;', 'Escaping right chevron');
	equal(escapeHTML('<'), '&lt;', 'Escaping left chevron');
	equal(escapeHTML('"'), '&quot;', 'Escaping double quotes');
});

test('escapeHTML: Use case with a combination of escaped characters', () => {
	expect(1);
	equal(escapeHTML('<a href="http://www.reddit.com">RES & Reddit</a>'), '&lt;a href=&quot;http://www.reddit.com&quot;&gt;RES &amp; Reddit&lt;/a&gt;');
});
