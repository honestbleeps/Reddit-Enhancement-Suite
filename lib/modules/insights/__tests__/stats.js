/* @flow */

import test from 'ava';

import {
	describeStats,
	humanizeKey,
	normalizeRatio,
	parseTimeLabel,
	summarizeComment,
	summarizePost,
} from '../stats.js';

// Trimmed from real `PostStatsPage` / `CommentStatsPage` responses (logged out, so no author-only stats)
const postStatsPage = {
	postStatsById: null,
	post: {
		__typename: 'SubredditPost',
		id: 't3_1wx25rp',
		score: 44929,
		commentCount: 1263,
		upvoteRatio: 0.8990539984722957,
		crosspostCount: 9,
		awardings: [{ total: 1, award: { name: 'WOW' } }, { total: 2, award: { name: 'Helpful' } }],
		postStatsPrivate: null,
		isOwnPost: false,
	},
};

const commentStatsPage = {
	commentById: {
		__typename: 'Comment',
		createdAt: '2026-10-04T00:26:12.861000+0000',
		score: 1,
		upvoteRatio: 52.17391304347826,
		awardings: [],
		commentStats: null,
		children: {
			trees: [
				{ childCount: 7, depth: 0, node: { __typename: 'Comment', id: 't1_pdqnhu3', score: 1 } },
				{ childCount: 2, depth: 1, node: { __typename: 'Comment', id: 't1_pdqo000', score: 3 } },
			],
		},
	},
};

test('humanizeKey', t => {
	t.is(humanizeKey('viewCount'), 'View count');
	t.is(humanizeKey('totalShareCount'), 'Total share count');
	t.is(humanizeKey('view_count_24h'), 'View count 24h');
	t.is(humanizeKey('topURLSources'), 'Top url sources');
});

test('normalizeRatio accepts fractions and percentages', t => {
	t.is(normalizeRatio(0.9), 0.9);
	t.is(normalizeRatio(1), 1);
	t.is(normalizeRatio(90), 0.9);
});

test('parseTimeLabel', t => {
	t.is((parseTimeLabel('2026-10-04T00:00:00Z'): any).toISOString(), '2026-10-04T00:00:00.000Z');
	t.is((parseTimeLabel('1791072000'): any).toISOString(), '2026-10-04T00:00:00.000Z');
	t.is((parseTimeLabel('1791072000000'): any).toISOString(), '2026-10-04T00:00:00.000Z');
	t.is(parseTimeLabel('US'), null);
	t.is(parseTimeLabel('12'), null);
});

test('summarizePost reads public stats', t => {
	const summary = summarizePost(postStatsPage);
	t.is(summary.kind, 'post');
	t.is(summary.isOwn, false);
	t.is(summary.score, 44929);
	t.is(summary.upvoteRatio, 0.8990539984722957);
	t.is(summary.replies, 1263);
	t.is(summary.crossposts, 9);
	t.is(summary.awards, 3);
	t.is(summary.detailed, null);
});

test('summarizeComment reads public stats', t => {
	const summary = summarizeComment(commentStatsPage, 't1_pdqnhu3');
	t.is(summary.kind, 'comment');
	t.is(summary.isOwn, null);
	t.is(summary.score, 1);
	t.true(Math.abs((summary.upvoteRatio: any) - 0.5217391304347826) < 1e-12);
	t.is(summary.replies, 7);
	t.is(summary.crossposts, null);
	t.is(summary.awards, 0);
	t.is(summary.detailed, null);
});

test('summarizeComment without a matching tree root has no reply count', t => {
	t.is(summarizeComment(commentStatsPage, 't1_other').replies, null);
});

test('summaries tolerate missing or malformed data', t => {
	for (const data of [null, undefined, {}, { post: null }, { commentById: 'x' }, []]) {
		const post = summarizePost(data);
		t.is(post.score, null);
		t.is(post.detailed, null);
		const comment = summarizeComment(data, 't1_a');
		t.is(comment.replies, null);
		t.is(comment.awards, null);
	}
});

test('author-only stats are described generically', t => {
	const summary = summarizePost({
		...postStatsPage,
		postStatsById: {
			__typename: 'PostStats',
			id: 't3_1wx25rp',
			viewCount: 123456,
			shareAllTotalCount: '42',
			upvoteRatio: 0.9, // already in the summary
			isEligible: true, // flags are skipped
			viewsByHour: [
				{ timestamp: '2026-10-04T00:00:00Z', count: 10 },
				{ timestamp: '2026-10-04T01:00:00Z', count: 25 },
			],
			viewsByCountry: [
				{ countryCode: 'US', percent: 0.6 },
				{ countryCode: 'GB', percent: 0.1 },
				{ countryCode: 'CA', percent: 0.3 },
			],
			karma: { total: 50 },
		},
	});

	t.deepEqual(summary.detailed, [
		{ type: 'value', key: 'viewCount', label: 'View count', value: 123456, format: 'number' },
		{ type: 'value', key: 'shareAllTotalCount', label: 'Share all total count', value: 42, format: 'number' },
		{
			type: 'series',
			key: 'viewsByHour',
			label: 'Views by hour',
			points: [
				{ label: '2026-10-04T00:00:00Z', value: 10 },
				{ label: '2026-10-04T01:00:00Z', value: 25 },
			],
		},
		{
			type: 'breakdown',
			key: 'viewsByCountry',
			label: 'Views by country',
			format: 'percent',
			rows: [
				{ label: 'US', value: 0.6 },
				{ label: 'CA', value: 0.3 },
				{ label: 'GB', value: 0.1 },
			],
		},
		{ type: 'value', key: 'karma', label: 'Karma', value: 50, format: 'number' },
	]);
});

test('postStatsById and postStatsPrivate are merged without duplicates', t => {
	const summary = summarizePost({
		post: { ...postStatsPage.post, postStatsPrivate: { viewCount: 5, shareCount: 2 } },
		postStatsById: { viewCount: 5 },
	});
	t.deepEqual((summary.detailed: any).map(node => node.key), ['viewCount', 'shareCount']);
});

test('comment stats are described', t => {
	const summary = summarizeComment({
		commentById: {
			...commentStatsPage.commentById,
			commentStats: { views: { total: 300 }, shareRate: 2.5 },
		},
	}, 't1_pdqnhu3');
	t.deepEqual(summary.detailed, [
		{ type: 'value', key: 'views', label: 'Views', value: 300, format: 'number' },
		{ type: 'value', key: 'shareRate', label: 'Share rate', value: 0.025, format: 'percent' },
	]);
});

test('describeStats handles nested groups, numeric series and epoch labels', t => {
	t.deepEqual(describeStats({
		engagement: { upvotes: 10, downvotes: 2 },
		hourly: [1, 2, 3],
		daily: [{ day: 1791072000, viewCount: 7 }],
		createdAt: '2026-10-04T00:26:12Z',
		source: 'Home feed',
		icon: 'https://example.com/a.png',
		empty: [],
		nothing: null,
	}), [
		{
			type: 'group',
			key: 'engagement',
			label: 'Engagement',
			children: [
				{ type: 'value', key: 'upvotes', label: 'Upvotes', value: 10, format: 'number' },
				{ type: 'value', key: 'downvotes', label: 'Downvotes', value: 2, format: 'number' },
			],
		},
		{
			type: 'series',
			key: 'hourly',
			label: 'Hourly',
			points: [{ label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }],
		},
		{ type: 'series', key: 'daily', label: 'Daily', points: [{ label: '1791072000', value: 7 }] },
		{ type: 'date', key: 'createdAt', label: 'Created at', value: '2026-10-04T00:26:12Z' },
		{ type: 'text', key: 'source', label: 'Source', value: 'Home feed' },
	]);
});

test('breakdowns of counts are sorted and capped', t => {
	const rows = Array.from({ length: 15 }, (_, i) => ({ name: `s${i}`, count: i }));
	const [node] = describeStats({ sources: rows });
	if (node.type !== 'breakdown') throw new Error('expected a breakdown');
	t.is(node.format, 'number');
	t.is(node.rows.length, 10);
	t.deepEqual(node.rows[0], { label: 's14', value: 14 });
});

// Shapes seen on a real post and comment (as the author); inner key names are reconstructed
test('real post stats shape', t => {
	const trend = [
		{ timestamp: '2026-10-02T13:00:00.000000+0000', value: 120 },
		{ timestamp: '2026-10-02T14:00:00.000000+0000', value: 80 },
	];
	const summary = summarizePost({
		...postStatsPage,
		postStatsById: {
			__typename: 'PostStats',
			viewCountTotals: { totalAllTimeCount: 8228 },
			shareAllCountTotals: { totalAllTimeCount: 3 },
			profilePostRank: { numericRank: 2, numPosts: 3 },
			viewsByGeo: {
				otherPercent: 46.8,
				availability: { availableAt: '2021-09-27T23:00:00.000000+0000' },
				data: [{ countryCode: 'US', percent: 39.1 }, { countryCode: 'GB', percent: 7.4 }, { countryCode: 'CA', percent: 6.6 }],
			},
			viewCountTrends: { data: trend },
		},
	});

	t.deepEqual(summary.detailed, [
		{ type: 'value', key: 'viewCountTotals', label: 'View count totals', value: 8228, format: 'number' },
		{ type: 'value', key: 'shareAllCountTotals', label: 'Share all count totals', value: 3, format: 'number' },
		{ type: 'rank', key: 'profilePostRank', label: 'Profile post rank', rank: 2, total: 3 },
		{
			type: 'breakdown',
			key: 'viewsByGeo',
			label: 'Views by geo',
			format: 'percent',
			rows: [
				{ label: 'US', value: 39.1 / 100 },
				{ label: 'GB', value: 7.4 / 100 },
				{ label: 'CA', value: 6.6 / 100 },
				{ label: 'Other percent', value: 46.8 / 100, isOther: true },
			],
		},
		{
			type: 'series',
			key: 'viewCountTrends',
			label: 'View count trends',
			points: trend.map(p => ({ label: p.timestamp, value: p.value })),
		},
	]);
});

test('real comment stats shape', t => {
	const summary = summarizeComment({
		commentById: {
			...commentStatsPage.commentById,
			commentStats: {
				viewCountTotals: { totalAllTimeCount: 271 },
				shareCountTotals: { totalAllTimeCount: 0 },
				engagementLevel: 'NORMAL',
				viewsByGeo: {
					otherPercent: null,
					data: [{ countryCode: 'US', percent: 0.36 }, { countryCode: 'GB', percent: 0.08 }, { countryCode: 'CY', percent: 0.07 }],
				},
			},
		},
	}, 't1_pdqnhu3');

	t.deepEqual(summary.detailed, [
		{ type: 'value', key: 'viewCountTotals', label: 'View count totals', value: 271, format: 'number' },
		{ type: 'value', key: 'shareCountTotals', label: 'Share count totals', value: 0, format: 'number' },
		{ type: 'text', key: 'engagementLevel', label: 'Engagement level', value: 'Normal' },
		{
			type: 'breakdown',
			key: 'viewsByGeo',
			label: 'Views by geo',
			format: 'percent',
			rows: [{ label: 'US', value: 0.36 }, { label: 'GB', value: 0.08 }, { label: 'CY', value: 0.07 }],
		},
	]);
});

test('enum-like text is humanized, but short codes are left alone', t => {
	t.deepEqual(describeStats({ level: 'VERY_HIGH', country: 'US', note: 'Mixed Case' }).map(node => node.type === 'text' && node.value), [
		'Very high',
		'US',
		'Mixed Case',
	]);
});

test('rank needs exactly a rank and a total', t => {
	t.is(describeStats({ postRank: { numericRank: 2 } })[0].type, 'value');
	t.is(describeStats({ postRank: { numericRank: 2, numPosts: 3, other: 4 } })[0].type, 'group');
});
