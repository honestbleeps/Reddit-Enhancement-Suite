/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { i18n } from '../environment';
import {
	addCSS,
	colorFromArray,
	colorToArray,
	formatNumber,
	isPageType,
	projectInto,
	string,
	watchForThings,
	zip,
} from '../utils';

export const module: Module<*> = new Module('voteEnhancements');

module.moduleName = 'voteEnhancementsName';
module.category = 'appearanceCategory';
module.description = 'voteEnhancementsDesc';
module.options = {
	estimatePostScore: {
		title: 'voteEnhancementsEstimatePostScoreTitle',
		type: 'boolean',
		value: false,
		description: 'voteEnhancementsEstimatePostScoreDesc',
		bodyClass: true,
	},
	estimatePostVotes: {
		title: 'voteEnhancementsEstimatePostVotesTitle',
		type: 'boolean',
		value: true,
		description: 'voteEnhancementsEstimatePostVotesDesc',
		bodyClass: true,
	},
	highlightScores: {
		title: 'voteEnhancementsHighlightScoresTitle',
		type: 'boolean',
		value: true,
		description: 'voteEnhancementsHighlightScoresDesc',
		bodyClass: true,
	},
	colorLinkScore: {
		title: 'voteEnhancementsColorLinkScoreTitle',
		type: 'enum',
		values: [{
			name: 'No coloration',
			value: 'none',
		}, {
			name: 'Automatic coloration',
			value: 'automatic',
		}, {
			name: 'User-defined coloration',
			value: 'user',
		}],
		value: 'none',
		description: 'voteEnhancementsColorLinkScoreDesc',
		bodyClass: true,
	},
	userDefinedLinkColoration: {
		title: 'voteEnhancementsUserDefinedLinkColorationTitle',
		dependsOn: options => options.colorLinkScore.value === 'user',
		type: 'table',
		addRowText: '+add threshold',
		fields: [{
			key: 'score',
			name: 'score',
			type: 'text',
		}, {
			key: 'color',
			name: 'color',
			type: 'color',
		}],
		value: [
			[0, '#5f99cf'],
			[10, '#F2B035'],
			[50, '#FF4500'],
			[100, '#D92B2B'],
		],
		description: 'voteEnhancementsUserDefinedLinkColorationDesc',
		sort(a, b) { // sort field with score increasing
			a[0] = parseInt(a[0], 10);
			b[0] = parseInt(b[0], 10);
			if (a[0] < b[0]) {
				return -1;
			}
			if (a[0] > b[0]) {
				return 1;
			}
			return 0;
		},
	},
	colorCommentScore: {
		title: 'voteEnhancementsColorCommentScoreTitle',
		type: 'enum',
		values: [{
			name: 'No coloration',
			value: 'none',
		}, {
			name: 'Automatic coloration',
			value: 'automatic',
		}, {
			name: 'Reddit Classic',
			value: 'simple',
		}, {
			name: 'User-defined coloration',
			value: 'user',
		}],
		value: 'none',
		description: 'voteEnhancementsColorCommentScoreDesc',
	},
	userDefinedCommentColoration: {
		title: 'voteEnhancementsUserDefinedCommentColorationTitle',
		dependsOn: options => options.colorCommentScore.value === 'user',
		type: 'table',
		addRowText: '+add threshold',
		fields: [{
			key: 'score',
			name: 'score',
			type: 'text',
		}, {
			key: 'color',
			name: 'color',
			type: 'color',
		}],
		value: [
			[0, '#5f99cf'],
			[10, '#F2B035'],
			[50, '#FF4500'],
			[100, '#D92B2B'],
		],
		description: 'voteEnhancementsUserDefinedCommentColorationDesc',
		sort(a, b) { // sort field with score increasing
			a[0] = parseInt(a[0], 10);
			b[0] = parseInt(b[0], 10);
			if (a[0] < b[0]) {
				return -1;
			}
			if (a[0] > b[0]) {
				return 1;
			}
			return 0;
		},
	},
	interpolateScoreColor: {
		title: 'voteEnhancementsInterpolateScoreColorTitle',
		type: 'boolean',
		value: true,
		description: 'voteEnhancementsInterpolateScoreColorDesc',
		advanced: true,
	},
	highlightControversial: {
		title: 'voteEnhancementsHighlightControversialTitle',
		type: 'boolean',
		value: true,
		description: 'Add color to the "controversial" comment indicator.<br>This indicator can be enabled/disabled in your <a href="/prefs/#highlight_controversial">reddit preferences</a>.',
	},
	highlightControversialColor: {
		title: 'voteEnhancementsHighlightControversialColorTitle',
		dependsOn: options => options.highlightControversial.value,
		advanced: true,
		type: 'color',
		value: '#cc0000',
		description: 'voteEnhancementsHighlightControversialColorDesc',
	},
};
module.include = ['comments', 'commentsLinklist', 'linklist', 'modqueue', 'profile', 'inbox'];

module.beforeLoad = () => {
	if (module.options.colorLinkScore.value !== 'none') {
		watchForThings(['post'], applyLinkScoreColor);
	}
	if (module.options.colorCommentScore.value !== 'none') {
		watchForThings(['comment'], applyCommentScoreColor);
	}
};

module.go = () => {
	if (isPageType('comments')) {
		if (module.options.estimatePostScore.value || module.options.estimatePostVotes.value) {
			estimatePostScoreVotes();
		}
	}
	if (module.options.highlightControversial.value) {
		highlightControversial();
	}
};

function estimatePostScoreVotes() {
	const $linkinfoScore = $('.linkinfo .score');
	if ($linkinfoScore.length) {
		const points = parseInt($linkinfoScore.find('.number').text().replace(/[^0-9]/g, ''), 10);
		const percentage = parseInt(($linkinfoScore.text().match(/([0-9]{1,3})\s?%/) || [0, 0])[1], 10);
		if (points !== 0 && percentage !== 50) { // we can't estimate if percentage equal 50% (i.e. points equal zero) -- It's important to stop don't avoid divide by zero ! edit: if downvote>upvote we can't calculate too
			const upvotes = Math.round(points * percentage / (2 * percentage - 100));
			const downvotes = upvotes - points;
			if (module.options.estimatePostScore.value) {
				$linkinfoScore.after(string.escapeHTML`
					<span class="upvotes">
						<span class="number">${formatNumber(upvotes)}</span>
						<span class="word">${upvotes === 1 ? i18n('voteEnhancementsUpvote') : i18n('voteEnhancementsUpvotes')}</span>
					</span>
					<span class="downvotes">
						<span class="number">${formatNumber(downvotes)}</span>
						<span class="word">${downvotes === 1 ? i18n('voteEnhancementsDownvote') : i18n('voteEnhancementsDownvotes')}</span
					</span>
				`);
			}
			if (module.options.estimatePostVotes.value) {
				const totalVotes = upvotes + downvotes;
				$linkinfoScore.after(string.escapeHTML`
					<span class="totalvotes">
						<span class="number">${formatNumber(totalVotes)}</span>
						<span class="word">${totalVotes === 1 ? i18n('voteEnhancementsVote') : i18n('voteEnhancementsVotes')}</span>
					</span>
				`);
			}
		}
	}
}

/**
 * @param {number} score
 * @param {Array<Array>} colors An array of [scoreThreshold, color] pairs in ascending order of scoreThreshold
 * @param {string} defaultColor
 * @returns {string}
 */
function interpolateScoreColor(score, colors, defaultColor) {
	if (!colors.length) return defaultColor;

	const augmented = [
		[-Infinity, _.first(colors)[1]],
		...colors,
		[Infinity, _.last(colors)[1]],
	];

	for (const [[lowBound, lowColor], [highBound, highColor]] of zip(augmented.slice(0, -1), augmented.slice(1))) {
		if (score >= lowBound && score < highBound) {
			if (module.options.interpolateScoreColor.value) {
				return colorFromArray(
					_.zipWith(colorToArray(lowColor), colorToArray(highColor),
						(lowVal, highVal) => Math.round(projectInto(lowBound, highBound, lowVal, highVal, score))
					)
				);
			} else {
				// only start using a color when the magnitude of the score exceeds the magnitude of the score bound
				// e.g. if we're between -10 and -5, use -5 (higher); if we're between 5 and 10, use 5 (lower)
				return (score < 0) ? highColor : lowColor;
			}
		}
	}

	// should never be reached because score should always be in [-Infinity, Infinity]
	return defaultColor;
}

function getLinkScoreColor(score) {
	if (module.options.colorLinkScore.value === 'automatic') {
		return `hsl(${180 + 360 * (1 - 100 / (150 + score))}, 75%,50%)`;
	} else {
		return interpolateScoreColor(score, module.options.userDefinedLinkColoration.value, '#c6c6c6');
	}
}

function getCommentScoreColor(score) {
	if (module.options.colorCommentScore.value === 'automatic') {
		return `hsl(${180 + 360 * (1 - 50 / (100 + score))}, 75%,50%)`;
	} else {
		let colors;
		if (module.options.colorCommentScore.value === 'user') {
			colors = module.options.userDefinedCommentColoration.value;
		} else if (module.options.colorCommentScore.value === 'simple') {
			colors = [
				[0, '#9494FF'],
				[1, '#888'],
				[2, '#FF8B60'],
			];
		} else {
			return false;
		}

		return interpolateScoreColor(score, colors, '#888');
	}
}

function applyLinkScoreColor(thing) {
	const score = thing.getScore();
	const rankEle = thing.getRankElement();
	const color = typeof score === 'number' && getLinkScoreColor(score);

	if (rankEle && color) {
		rankEle.style.background = color;
	}
}

function applyCommentScoreColor(thing) {
	for (const [scoreEle, score] of thing.getAllScoreElements()) {
		const color = getCommentScoreColor(score);

		if (color) {
			scoreEle.style.color = color;
		}
	}
}

function highlightControversial() {
	const color = module.options.highlightControversialColor.value || module.options.highlightControversialColor.default;
	addCSS(`
		.comment.controversial > .entry .score::after {
			color: ${color};
		}
	`);
}
