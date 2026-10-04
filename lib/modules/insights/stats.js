/* @flow */

// Pure helpers for turning the responses of new Reddit's insights endpoints
// (`/svc/shreddit/graphql` operations `PostStatsPage` and `CommentStatsPage`)
// into something renderable. No DOM or i18n here, so it can be unit tested.

export type NumberFormat = 'number' | 'percent';

// `isOther` marks the remainder row of a percentage breakdown (e.g. views from all other countries)
export type Point = {| label: string, value: number, isOther?: boolean |};

export type StatNode =
	| {| type: 'value', key: string, label: string, value: number, format: NumberFormat |}
	| {| type: 'text', key: string, label: string, value: string |}
	| {| type: 'rank', key: string, label: string, rank: number, total: number |}
	| {| type: 'date', key: string, label: string, value: string |}
	| {| type: 'series', key: string, label: string, points: Point[] |}
	| {| type: 'breakdown', key: string, label: string, format: NumberFormat, rows: Point[] |}
	| {| type: 'group', key: string, label: string, children: StatNode[] |};

export type Summary = {|
	kind: 'post' | 'comment',
	// `null` when reddit didn't say (comments don't expose it)
	isOwn: ?boolean,
	score: ?number,
	// Normalized to a fraction between 0 and 1
	upvoteRatio: ?number,
	// Comments on a post, or replies (at any depth) to a comment
	replies: ?number,
	crossposts: ?number,
	awards: ?number,
	// Author-only stats (views, shares, ...); `null` if reddit didn't return any
	detailed: ?(StatNode[]),
|};

const MAX_DEPTH = 4;
const MAX_BREAKDOWN_ROWS = 10;
const MAX_TEXT_LENGTH = 80;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const NUMERIC_STRING = /^-?\d+(?:\.\d+)?$/;
// `availability` (seen in `viewsByGeo`) only holds a date the data became available from
const IGNORED_KEY = /^(?:__typename|id|_.*|.*Id|.*Ids|url|.*Url|permalink|availability)$/;

const RATIO_WORDS = ['ratio', 'rate', 'percent', 'percentage', 'pct', 'fraction'];
const TIME_WORDS = ['time', 'date', 'hour', 'hours', 'day', 'days', 'week', 'bucket', 'timestamp', 'period', 'interval', 'at'];
const LABEL_WORDS = ['name', 'label', 'title', 'country', 'region', 'location', 'geo', 'city', 'state', 'code', 'source', 'platform', 'type', 'kind', 'key', 'category'];
const VALUE_WORDS = ['count', 'value', 'total', 'views', 'view', 'amount', 'number', 'percent', 'percentage', 'ratio', 'share', 'shares'];
const RANK_TOTAL_WORDS = ['num', 'total', 'count', 'posts', 'comments', 'of'];
// at least 3 characters, so country codes like `US` are left alone
const ENUM_VALUE = /^[A-Z][A-Z0-9]{2,}(?:_[A-Z0-9]+)*$/;

function isObject(value: mixed): boolean %checks {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: mixed): ?number {
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (typeof value === 'string' && NUMERIC_STRING.test(value)) return parseFloat(value);
	return null;
}

function isNumeric(value: mixed): boolean {
	return toNumber(value) !== null;
}

function isLabel(value: mixed): boolean {
	return typeof value === 'string' && value.length > 0 && !NUMERIC_STRING.test(value);
}

function words(key: string): string[] {
	return key
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		.trim()
		.toLowerCase()
		.split(/\s+/);
}

function hasWord(key: string, list: string[]): boolean {
	return words(key).some(word => list.includes(word));
}

export function humanizeKey(key: string): string {
	const text = words(key).join(' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Reddit uses a fraction (0.93) for post upvote ratios but a percentage (93) for comments,
 * and the author-only stats don't document which they use, so accept both.
 */
export function normalizeRatio(value: number): number {
	return value > 1 ? value / 100 : value;
}

/**
 * Series labels are often timestamps: ISO strings, or epoch seconds/milliseconds.
 */
export function parseTimeLabel(label: string): ?Date {
	if (ISO_DATE.test(label)) {
		const date = new Date(label);
		return isNaN(date.getTime()) ? null : date;
	}
	const number = toNumber(label);
	// after 2001-09-09 in epoch seconds; anything larger is milliseconds
	if (typeof number === 'number' && number >= 1e9) return new Date(number < 1e12 ? number * 1000 : number);
	return null;
}

function candidateKeys(rows: Array<{ [string]: mixed }>, accept: mixed => boolean, exclude: ?string): string[] {
	return Object.keys(rows[0]).filter(key =>
		key !== exclude && !IGNORED_KEY.test(key) && rows.every(row => accept(row[key])),
	);
}

function describeArray(key: string, label: string, items: mixed[]): ?StatNode {
	if (!items.length) return null;

	if (items.every(isNumeric)) {
		const points = items.map((v, i) => ({ label: String(i + 1), value: Number(toNumber(v)) }));
		return { type: 'series', key, label, points };
	}

	if (!items.every(isObject)) return null;
	const rows: Array<{ [string]: mixed }> = (items: any);

	// Prefer value-ish names (`count`, `views`, ...), and never pick the timestamp as the value
	const numericKeys = candidateKeys(rows, isNumeric);
	const valueKey =
		numericKeys.find(k => hasWord(k, VALUE_WORDS)) ||
		numericKeys.find(k => !hasWord(k, TIME_WORDS));
	if (!valueKey) return null;

	const labelKeys = candidateKeys(rows, isLabel, valueKey);
	const timeKey =
		labelKeys.find(k => hasWord(k, TIME_WORDS) || rows.every(row => parseTimeLabel(String(row[k])))) ||
		numericKeys.find(k => k !== valueKey && hasWord(k, TIME_WORDS));
	const labelKey = timeKey || labelKeys.find(k => hasWord(k, LABEL_WORDS)) || labelKeys[0];

	const points = rows.map((row, i) => ({
		label: labelKey ? String(row[labelKey]) : String(i + 1),
		value: Number(toNumber(row[valueKey])),
	}));

	if (timeKey) return { type: 'series', key, label, points };

	const isFraction = hasWord(valueKey, RATIO_WORDS) ||
		(points.every(p => p.value >= 0 && p.value <= 1) && points.reduce((sum, p) => sum + p.value, 0) <= 1.0001);
	return {
		type: 'breakdown',
		key,
		label,
		format: isFraction ? 'percent' : 'number',
		rows: points
			.map(p => (isFraction ? { label: p.label, value: normalizeRatio(p.value) } : p))
			.sort((a, b) => b.value - a.value)
			.slice(0, MAX_BREAKDOWN_ROWS),
	};
}

/**
 * `{ numericRank: 2, numPosts: 3 }` -> "#2 of 3"
 */
function describeRank(key: string, label: string, value: { [string]: mixed }): ?StatNode {
	const numericKeys = Object.keys(value).filter(k => !IGNORED_KEY.test(k) && isNumeric(value[k]));
	const rankKey = numericKeys.find(k => words(k).includes('rank'));
	const totalKey = numericKeys.find(k => k !== rankKey && hasWord(k, RANK_TOTAL_WORDS));
	if (!rankKey || !totalKey || numericKeys.length !== 2) return null;
	return { type: 'rank', key, label, rank: Number(toNumber(value[rankKey])), total: Number(toNumber(value[totalKey])) };
}

/**
 * `{ data: [{ US: 39% }, ...], otherPercent: 47% }` -> one breakdown with an "other" row at the end
 */
function mergeOther(children: StatNode[]): StatNode[] {
	const breakdown = children.find(node => node.type === 'breakdown' && node.format === 'percent');
	const other = children.find(node => node.type === 'value' && node.format === 'percent' && words(node.key).includes('other'));
	if (!breakdown || breakdown.type !== 'breakdown' || !other || other.type !== 'value') return children;
	const merged = { ...breakdown, rows: [...breakdown.rows, { label: other.label, value: other.value, isOther: true }] };
	return children.filter(node => node !== other).map(node => (node === breakdown ? merged : node));
}

function relabel(node: StatNode, key: string, label: string): StatNode {
	// Flow 0.84 can't spread a union of exact objects; this keeps the node's own variant
	return ({ ...node, key, label }: any);
}

function describeValue(key: string, value: mixed, depth: number): ?StatNode {
	const label = humanizeKey(key);

	const number = toNumber(value);
	if (typeof number === 'number') {
		return hasWord(key, RATIO_WORDS) ?
			{ type: 'value', key, label, value: normalizeRatio(number), format: 'percent' } :
			{ type: 'value', key, label, value: number, format: 'number' };
	}

	if (typeof value === 'string') {
		if (ISO_DATE.test(value)) return { type: 'date', key, label, value };
		if (!value || value.length > MAX_TEXT_LENGTH || (/^https?:/).test(value)) return null;
		// enum values like `NORMAL` or `VERY_HIGH`
		return { type: 'text', key, label, value: ENUM_VALUE.test(value) ? humanizeKey(value.toLowerCase()) : value };
	}

	if (Array.isArray(value)) return describeArray(key, label, value);

	if (isObject(value) && depth < MAX_DEPTH) {
		const rank = describeRank(key, label, value);
		if (rank) return rank;

		const children = mergeOther(describeStats(value, depth + 1)); // eslint-disable-line no-use-before-define
		if (!children.length) return null;
		// Collapse wrappers like `{ views: { total: 5 } }` or `{ viewsByGeo: { data: [...] } }` into their only child
		if (children.length === 1) return relabel(children[0], key, label);
		return { type: 'group', key, label, children };
	}

	// booleans are just flags, not insights
	return null;
}

/**
 * Turn an arbitrary stats object into a list of renderable nodes.
 *
 * The author-only parts of the insights responses (`postStatsById`, `postStatsPrivate`, `commentStats`)
 * can't be inspected without being the author, so rather than hardcoding field names,
 * describe whatever shape reddit sends.
 */
export function describeStats(stats: mixed, depth: number = 0, skipKeys: Set<string> = new Set()): StatNode[] {
	if (!isObject(stats)) return [];
	const nodes = [];
	for (const [key, value] of Object.entries(stats)) {
		if (IGNORED_KEY.test(key) || skipKeys.has(key)) continue;
		const node = describeValue(key, value, depth);
		if (node) nodes.push(node);
	}
	return nodes;
}

function describeDetailed(roots: mixed[], skipKeys: Set<string>): ?(StatNode[]) {
	const present = roots.filter(isObject);
	if (!present.length) return null;

	// `postStatsById` and `postStatsPrivate` may overlap
	const seen = new Set();
	return [].concat(...present.map(root => describeStats(root, 0, skipKeys))).filter(node => {
		const id = JSON.stringify(node);
		if (seen.has(id)) return false;
		seen.add(id);
		return true;
	});
}

function sumAwards(awardings: mixed): ?number {
	if (!Array.isArray(awardings)) return null;
	return awardings.reduce((sum, awarding) => sum + (isObject(awarding) && toNumber(awarding.total) || 0), 0);
}

function ratioOf(value: mixed): ?number {
	const number = toNumber(value);
	return typeof number === 'number' ? normalizeRatio(number) : null;
}

// Fields shown in the summary; don't repeat them in the detailed section
const POST_SUMMARY_KEYS = new Set(['score', 'upvoteRatio', 'commentCount', 'crosspostCount', 'awardings']);
const COMMENT_SUMMARY_KEYS = new Set(['score', 'upvoteRatio', 'awardings']);

export function summarizePost(data: mixed): Summary {
	const { post, postStatsById } = isObject(data) ? (data: any) : {};
	const p = isObject(post) ? post : {};
	return {
		kind: 'post',
		isOwn: typeof p.isOwnPost === 'boolean' ? p.isOwnPost : null,
		score: toNumber(p.score),
		upvoteRatio: ratioOf(p.upvoteRatio),
		replies: toNumber(p.commentCount),
		crossposts: toNumber(p.crosspostCount),
		awards: sumAwards(p.awardings),
		detailed: describeDetailed([postStatsById, p.postStatsPrivate], POST_SUMMARY_KEYS),
	};
}

export function summarizeComment(data: mixed, fullname: string): Summary {
	const { commentById } = isObject(data) ? (data: any) : {};
	const c = isObject(commentById) ? commentById : {};

	// `children.trees` is the comment itself (depth 0) followed by its descendants;
	// the root's `childCount` counts replies at every depth.
	const trees = isObject(c.children) && Array.isArray(c.children.trees) ? c.children.trees : [];
	const root = trees.find(t => isObject(t) && t.depth === 0 && isObject(t.node) && t.node.id === fullname);

	return {
		kind: 'comment',
		isOwn: null,
		score: toNumber(c.score),
		upvoteRatio: ratioOf(c.upvoteRatio),
		replies: root ? toNumber(root.childCount) : null,
		crossposts: null,
		awards: sumAwards(c.awardings),
		detailed: describeDetailed([c.commentStats], COMMENT_SUMMARY_KEYS),
	};
}
