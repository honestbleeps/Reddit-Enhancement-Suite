/* @flow */

import $ from 'jquery';
import { once } from 'lodash-es';
import { Module } from '../core/module';
import { ajax, i18n, locale } from '../environment';
import {
	MINUTE,
	Thing,
	formatDateTime,
	formatNumber,
	isModeratorAnywhere,
	loggedInUser,
	preventCloning,
	string,
	watchForThings,
} from '../utils';
import { parseTimeLabel, summarizeComment, summarizePost } from './insights/stats';
import type { NumberFormat, Point, StatNode, Summary } from './insights/stats';

export const module: Module<*> = new Module('insights');

module.moduleName = 'insightsName';
module.category = 'myAccountCategory';
module.description = 'insightsDesc';
module.keywords = ['stats', 'statistics', 'analytics', 'views', 'shares', 'upvote', 'ratio'];
module.exclude = ['d2x'];
module.options = {
	showFor: {
		title: 'insightsShowForTitle',
		description: 'insightsShowForDesc',
		type: 'enum',
		value: 'own',
		values: [{
			name: 'Your posts and comments',
			value: 'own',
		}, {
			name: 'Yours, and those in communities you moderate',
			value: 'moderated',
		}, {
			name: 'All posts and comments',
			value: 'all',
		}],
	},
	posts: {
		title: 'insightsPostsTitle',
		description: 'insightsPostsDesc',
		type: 'boolean',
		value: true,
	},
	comments: {
		title: 'insightsCommentsTitle',
		description: 'insightsCommentsDesc',
		type: 'boolean',
		value: true,
	},
};

module.beforeLoad = () => {
	if (module.options.posts.value) watchForThings(['post'], addButton);
	if (module.options.comments.value) watchForThings(['comment'], addButton);
};

// The same endpoint new Reddit's insights pages (/poststats/, /commentstats/) use
const GRAPHQL_URL = 'https://www.reddit.com/svc/shreddit/graphql';
const CACHE_TIME = 5 * MINUTE;
const MOD_BUTTONS_SELECTOR = '.remove-button, .approve-button, .big-mod-buttons, [data-event-action="remove"], [data-event-action="approve"]';

type Kind = 'post' | 'comment';

const kindOf = (fullname: string): Kind => fullname.startsWith('t3_') ? 'post' : 'comment';

const insightsPageUrl = (fullname: string) =>
	`https://www.reddit.com/${kindOf(fullname) === 'post' ? 'poststats' : 'commentstats'}/${fullname}/`;

function isAuthor(thing: Thing): boolean {
	const user = loggedInUser();
	const author = thing.getAuthor();
	return !!user && !!author && user.toLowerCase() === author.toLowerCase();
}

function shouldShowFor(thing: Thing): boolean {
	switch (module.options.showFor.value) {
		case 'all':
			return true;
		case 'moderated':
			return isAuthor(thing) || (isModeratorAnywhere() && !!thing.entry.querySelector(MOD_BUTTONS_SELECTOR));
		default:
			return isAuthor(thing);
	}
}

const button = (e => () => preventCloning(e().cloneNode(true)))(once(() => {
	$(document.body)
		.on('click', 'li.res-insights-button a', function(e: Event) {
			e.preventDefault();
			togglePanel(Thing.checkedFrom(this));
		})
		.on('click', '.res-insights-refresh', function(e: Event) {
			e.preventDefault();
			load(Thing.checkedFrom(this), true);
		})
		.on('click', '.res-insights-hide', function(e: Event) {
			e.preventDefault();
			$(this).closest('.res-insights-panel').prop('hidden', true);
		});

	return string.html`
		<li class="res-insights-button">
			<a class="noCtrlF" href="javascript:void 0" data-text="${i18n('insightsButton')}"></a>
		</li>
	`;
}));

function addButton(thing: Thing) {
	if (!(/^t[13]_/).test(thing.getFullname()) || thing.isDeleted() || !shouldShowFor(thing)) return;

	const buttons = thing.getButtons();
	if (!buttons) return;
	// .first is the comments link / permalink, after any NSFW/spoiler stamps
	const first = buttons.querySelector(':scope > li.first') || buttons.firstElementChild;
	if (first) first.after(button());
	else buttons.append(button());
}

function getPanel(thing: Thing): ?HTMLElement {
	return thing.entry.querySelector('.res-insights-panel');
}

function togglePanel(thing: Thing) {
	const existing = getPanel(thing);
	if (existing) {
		existing.hidden = !existing.hidden;
		if (!existing.hidden) load(thing);
		return;
	}

	const fullname = thing.getFullname();
	const panel = string.html`
		<div class="res-insights-panel">
			<div class="res-insights-header">
				<span class="res-insights-title">${kindOf(fullname) === 'post' ? i18n('insightsPostHeading') : i18n('insightsCommentHeading')}</span>
				<a class="res-insights-refresh" href="javascript:void 0">${i18n('insightsRefresh')}</a>
				<a href="${insightsPageUrl(fullname)}" target="_blank" rel="noopener noreferrer">${i18n('insightsViewFull')}</a>
				<a class="res-insights-hide" href="javascript:void 0">${i18n('insightsHide')}</a>
			</div>
			<div class="res-insights-body"></div>
		</div>
	`;
	thing.getButtons().after(panel);
	load(thing);
}

let latestRequest = 0;

async function load(thing: Thing, force: boolean = false) {
	const panel = getPanel(thing);
	const body = panel && panel.querySelector('.res-insights-body');
	if (!panel || !body) return;

	const request = String(++latestRequest);
	panel.dataset.request = request;
	body.textContent = '';
	body.append(string.html`<div class="res-insights-loading"><span class="RESLoadingSpinner"></span> ${i18n('insightsLoading')}</div>`);

	let contents;
	try {
		contents = renderSummary(await fetchSummary(thing.getFullname(), force), isAuthor(thing));
	} catch (e) {
		console.error('Could not load insights', e);
		contents = string.html`
			<div class="res-insights-note res-insights-error">
				${i18n('insightsLoadError')}${typeof e.status === 'number' ? ` (HTTP ${e.status})` : ''}
			</div>
		`;
	}

	// a newer request (e.g. refresh) owns the panel now
	if (panel.dataset.request !== request) return;
	body.textContent = '';
	body.append(contents);
}

const cache: Map<string, {| time: number, promise: Promise<Summary> |}> = new Map();

function fetchSummary(fullname: string, force: boolean): Promise<Summary> {
	const cached = cache.get(fullname);
	if (!force && cached && Date.now() - cached.time < CACHE_TIME) return cached.promise;

	const promise = kindOf(fullname) === 'post' ?
		query('PostStatsPage', { postId: fullname }).then(data => summarizePost(data)) :
		query('CommentStatsPage', { commentId: fullname }).then(data => summarizeComment(data, fullname));

	cache.set(fullname, { time: Date.now(), promise });
	promise.catch(() => {
		const entry = cache.get(fullname);
		if (entry && entry.promise === promise) cache.delete(fullname);
	});
	return promise;
}

async function query(operation: string, variables: { [string]: string }): Promise<mixed> {
	const response = await ajax({
		method: 'POST',
		url: GRAPHQL_URL,
		headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
		data: JSON.stringify({ operation, variables, csrf_token: csrfToken() }),
		type: 'json',
	});
	if (!response.data) throw new Error(`${operation} returned no data: ${JSON.stringify(response.errors)}`);
	return response.data;
}

function csrfToken(): string {
	const existing = (/(?:^|;\s*)csrf_token=([^;]+)/).exec(document.cookie);
	if (existing) return existing[1];

	// The endpoint checks that this matches the `csrf_token` cookie (double-submit).
	// New Reddit sets that cookie on first visit; old Reddit never does, so create one the same way.
	const token = Array.from(window.crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
	document.cookie = `csrf_token=${token}; path=/; domain=.reddit.com; secure; samesite=strict`;
	return token;
}

function formatValue(value: number, format: NumberFormat): string {
	if (format === 'percent') return `${formatNumber(Math.round(value * 1000) / 10)}%`;
	return formatNumber(Number.isInteger(value) ? value : Math.round(value * 100) / 100);
}

function formatLabel(label: string): string {
	const date = parseTimeLabel(label);
	return date ? formatDateTime(date) : label;
}

const regionNames = once(() => {
	try {
		return new (Intl: any).DisplayNames([locale, 'en'], { type: 'region' });
	} catch (e) {
		return null;
	}
});

function formatRowLabel(row: Point): string {
	if (row.isOther) return i18n('insightsOther');
	// country codes, e.g. in `viewsByGeo`
	const names = (/^[A-Z]{2}$/).test(row.label) && regionNames();
	if (names) {
		try {
			return names.of(row.label) || row.label;
		} catch (e) {
			return row.label;
		}
	}
	return formatLabel(row.label);
}

// Friendlier labels for fields reddit sends in the author-only stats
const KNOWN_LABELS: Map<string, string> = new Map([
	['viewCountTotals', 'insightsViews'],
	['shareAllCountTotals', 'insightsShares'],
	['shareCountTotals', 'insightsShares'],
	['profilePostRank', 'insightsProfilePostRank'],
	['engagementLevel', 'insightsEngagement'],
	['viewCountTrends', 'insightsViewsOverTime'],
	['viewsByGeo', 'insightsViewsByCountry'],
]);

function labelOf(node: StatNode): string {
	const key = KNOWN_LABELS.get(node.key);
	return key ? i18n(key) : node.label;
}

const tile = (label: string, value: string) => string._html`
	<div class="res-insights-tile">
		<div class="res-insights-value">${value}</div>
		<div class="res-insights-label">${label}</div>
	</div>
`;

function sparkline(points: Point[]) {
	const max = Math.max(0, ...points.map(p => p.value)) || 1;
	const width = 100 / points.length;
	const bars = points.map((p, i) => {
		const height = (Math.max(0, p.value) / max) * 30;
		return string._html`
			<rect x="${i * width}" y="${30 - height}" width="${Math.max(width * 0.8, 0.2)}" height="${height}">
				<title>${formatLabel(p.label)}: ${formatValue(p.value, 'number')}</title>
			</rect>
		`;
	});
	return string._html`<svg class="res-insights-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">${bars}</svg>`;
}

function renderNode(node: StatNode) {
	switch (node.type) {
		case 'value':
			return tile(labelOf(node), formatValue(node.value, node.format));
		case 'text':
			return tile(labelOf(node), node.value);
		case 'rank':
			return tile(labelOf(node), i18n('insightsRankOf', formatNumber(node.rank), formatNumber(node.total)));
		case 'date':
			return string._html`<div class="res-insights-row"><span class="res-insights-label">${labelOf(node)}</span> ${formatDateTime(new Date(node.value))}</div>`;
		case 'series': {
			const { points } = node;
			const peak = Math.max(...points.map(p => p.value));
			return string._html`
				<div class="res-insights-section">
					<div class="res-insights-section-title">${labelOf(node)}</div>
					${sparkline(points)}
					<div class="res-insights-caption">
						${formatLabel(points[0].label)} – ${formatLabel(points[points.length - 1].label)} · ${i18n('insightsPeak', formatValue(peak, 'number'))}
					</div>
				</div>
			`;
		}
		case 'breakdown': {
			const { format, rows } = node;
			return string._html`
				<div class="res-insights-section">
					<div class="res-insights-section-title">${labelOf(node)}</div>
					<table class="res-insights-breakdown">
						${rows.map(row => string._html`
							<tr class="${row.isOther ? 'res-insights-breakdown-other' : ''}">
								<td>${formatRowLabel(row)}</td>
								<td class="res-insights-breakdown-value">${formatValue(row.value, format)}</td>
							</tr>
						`)}
					</table>
				</div>
			`;
		}
		case 'group':
			return string._html`
				<div class="res-insights-section">
					<div class="res-insights-section-title">${labelOf(node)}</div>
					${renderNodes(node.children)}
				</div>
			`;
		default:
			throw new Error(`Unknown insights node ${node.type}`);
	}
}

const TILE_TYPES = ['value', 'text', 'rank'];

function renderNodes(nodes: StatNode[]) {
	// Short values become a row of tiles; everything else is a block of its own
	const tiles = nodes.filter(node => TILE_TYPES.includes(node.type));
	const others = nodes.filter(node => !TILE_TYPES.includes(node.type));
	return string._html`
		${tiles.length ? string._html`<div class="res-insights-tiles">${tiles.map(renderNode)}</div>` : ''}
		${others.map(renderNode)}
	`;
}

function detailedNote(summary: Summary, author: boolean): string {
	// Reddit says whether it recognised the logged in user as the author of posts (not comments)
	if (author && summary.isOwn === false) return i18n('insightsSessionNotRecognized');
	if (author || summary.isOwn) return i18n('insightsNoDetailedStats');
	return i18n('insightsAuthorOnly');
}

const optionalTile = (label: string, value: ?number, format: NumberFormat) =>
	typeof value === 'number' ? tile(label, formatValue(value, format)) : null;

function renderSummary(summary: Summary, author: boolean): HTMLElement {
	const tiles = [
		optionalTile(i18n('insightsScore'), summary.score, 'number'),
		optionalTile(i18n('insightsUpvoteRate'), summary.upvoteRatio, 'percent'),
		optionalTile(summary.kind === 'post' ? i18n('insightsComments') : i18n('insightsReplies'), summary.replies, 'number'),
		optionalTile(i18n('insightsCrossposts'), summary.crossposts, 'number'),
		optionalTile(i18n('insightsAwards'), summary.awards, 'number'),
	].filter(Boolean);

	const { detailed } = summary;
	const details = detailed && detailed.length ?
		string._html`
			<div class="res-insights-detailed">
				<div class="res-insights-section-title">${i18n('insightsDetailedHeading')}</div>
				${renderNodes(detailed)}
			</div>
		` :
		string._html`<div class="res-insights-note">${detailedNote(summary, author)}</div>`;

	return string.html`
		<div>
			<div class="res-insights-tiles">${tiles}</div>
			${details}
		</div>
	`;
}
