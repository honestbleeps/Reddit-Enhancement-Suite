/* @flow */

import { escapeHTML } from '../html';
import test from 'ava';


test('Handles null string', t => {
	t.is(escapeHTML(null), '');
});

test('Escaping single characters correctly', t => {
	t.is(escapeHTML('&'), '&amp;', 'Escaping ampersands');
	t.is(escapeHTML('>'), '&gt;', 'Escaping right chevron');
	t.is(escapeHTML('<'), '&lt;', 'Escaping left chevron');
	t.is(escapeHTML('"'), '&quot;', 'Escaping double quotes');
	t.is(escapeHTML("'"), '&apos;', 'Escaping single quotes'); // eslint-disable-line quotes
	t.is(escapeHTML('/'), '&#47;', 'Escaping slash');
});

test('Use case with a combination of escaped characters', t => {
	t.is(escapeHTML('<a href="https://www.reddit.com"><span class=\'foo\'>RES & Reddit</span></a>'),
		'&lt;a href=&quot;https:&#47;&#47;www.reddit.com&quot;&gt;&lt;span class=&apos;foo&apos;&gt;RES &amp; Reddit&lt;&#47;span&gt;&lt;&#47;a&gt;');
});
