/* @noflow */
/* eslint-disable import/no-nodejs-modules */

import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'ava';
import { build } from 'esbuild';
import flowRemoveTypes from 'flow-remove-types';

async function loadLocalization(locale) {
	const { outputFiles } = await build({
		entryPoints: ['lib/utils/localization.js'],
		bundle: true,
		format: 'cjs',
		write: false,
		plugins: [{
			name: 'localization-fixture',
			setup(builder) {
				builder.onResolve({ filter: /^\.\.\/environment$/ }, () => ({
					path: 'environment',
					namespace: 'fixture',
				}));
				builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
					contents: `export const locale = ${JSON.stringify(locale)};`,
				}));
				builder.onLoad({ filter: /[/\\]localization\.js$/ }, async ({ path }) => ({
					contents: flowRemoveTypes(await readFile(path, 'utf8')).toString(),
				}));
			},
		}],
	});
	return vm.runInNewContext(`${outputFiles[0].text}\nmodule.exports;`, { module: { exports: {} } });
}

for (const [locale, selectedLocale, date, time, difference] of [
	['en-US', 'en', '01/02/2024', '3:04:05 PM', '2 days'],
	['de-DE', 'de', '02.01.2024', '15:04:05', '2 Tage'],
	['el-GR', 'el', '02/01/2024', '3:04:05 PM', '2 μέρες'],
	['es-ES', 'es', '02/01/2024', '15:04:05', '2 días'],
	['he-IL', 'he', '02/01/2024', '15:04:05', 'יומיים'],
	['it-IT', 'it', '02/01/2024', '15:04:05', '2 giorni'],
	['nl-NL', 'nl', '02-01-2024', '15:04:05', '2 dagen'],
	['pl-PL', 'pl', '02.01.2024', '15:04:05', '2 dni'],
	['pt-PT', 'pt', '02/01/2024', '15:04:05', '2 dias'],
	// Preserve the existing Portuguese fallback for Brazilian Portuguese.
	['pt-BR', 'pt', '02/01/2024', '15:04:05', '2 dias'],
	['fr-FR', 'en', '01/02/2024', '3:04:05 PM', '2 days'],
]) {
	test(`Date formatting and relative-time plugins preserve ${locale} behavior`, async t => {
		const localization = await loadLocalization(locale);
		const from = new Date(2024, 0, 2, 15, 4, 5);
		const to = new Date(2024, 0, 4, 15, 4, 5);

		t.is(localization.dayjs(from).locale(), selectedLocale);
		t.is(localization.formatDate(from), date);
		t.is(localization.formatDateTime(from), `${date} ${time}`);
		t.is(localization.formatDateDiff(from, to), difference);
		t.is(localization.formatDateDiff(to, from), difference);
		t.true(localization.dayjs().isValid());
		t.notRegex(localization.formatDate(), /L/);
		t.notRegex(localization.formatDateTime(), /L/);
	});
}

test('Relative times retain suffixes and default to the current time', async t => {
	const { dayjs, formatDateDiff, formatRelativeTime } = await loadLocalization('en-US');
	const past = dayjs().subtract(2, 'day').toDate();
	const future = dayjs().add(2, 'day').toDate();

	t.is(formatDateDiff(past), '2 days');
	t.is(formatRelativeTime(past), '2 days ago');
	t.is(formatRelativeTime(future), 'in 2 days');
});

test('Italian relative times use the corrected upstream spelling', async t => {
	const { formatDateDiff, dayjs } = await loadLocalization('it-IT');
	const from = new Date(2024, 0, 2, 15, 4, 5);
	const to = new Date(2024, 0, 2, 16, 4, 5);

	t.is(formatDateDiff(from, to), 'un\'ora');
	t.is(dayjs(from).from(to), 'un\'ora fa');
	t.is(dayjs(to).from(from), 'tra un\'ora');
});

test('Date filter inputs retain parsing and comparison behavior', async t => {
	const { dayjs } = await loadLocalization('en-US');
	const date = dayjs('2024-01-02');

	t.is(date.format('YYYY-MM-DD'), '2024-01-02');
	t.true(date.isBefore(dayjs('2024-01-03')));
	t.false(date.isBefore(dayjs('2024-01-01')));
	t.false(date.isBefore(date));
	t.false(dayjs('invalid').isValid());
});
