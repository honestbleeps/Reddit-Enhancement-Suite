import test from 'ava';

import { escapeHTML } from '../html';

test('Returns null on null string', t => {
	t.is(escapeHTML(null), null);
});

test('Escaping single characters correctly', t => {
	t.is(escapeHTML('&'), '&amp;', 'Escaping ampersands');
	t.is(escapeHTML('>'), '&gt;', 'Escaping right chevron');
	t.is(escapeHTML('<'), '&lt;', 'Escaping left chevron');
	t.is(escapeHTML('"'), '&quot;', 'Escaping double quotes');
});

test('Use case with a combination of escaped characters', t => {
	t.is(escapeHTML('<a href="http://www.reddit.com">RES & Reddit</a>'), '&lt;a href=&quot;http://www.reddit.com&quot;&gt;RES &amp; Reddit&lt;/a&gt;');
});
