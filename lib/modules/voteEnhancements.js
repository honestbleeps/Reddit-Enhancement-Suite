/* @flow */

import { zipWith } from 'lodash-es';
import { Module } from '../core/module';
import {
	addCSS,
	colorFromArray,
	colorToArray,
	projectInto,
	watchForThings,
	zip,
} from '../utils';

export const module: Module<*> = new Module('voteEnhancements');

module.moduleName = 'voteEnhancementsName';
module.category = 'appearanceCategory';
module.description = 'voteEnhancementsDesc';
module.options = {
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
			[10, '#f2b035'],
			[50, '#ff4500'],
			[100, '#d92b2b'],
		],
		description: 'voteEnhancementsUserDefinedLinkColorationDesc',
		sort([a], [b]) { // sort field with score increasing
			return a - b || String(a).localeCompare(b, undefined, { numeric: true });
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
			[10, '#f2b035'],
			[50, '#ff4500'],
			[100, '#d92b2b'],
		],
		description: 'voteEnhancementsUserDefinedCommentColorationDesc',
		sort([a], [b]) { // sort field with score increasing
			return a - b || String(a).localeCompare(b, undefined, { numeric: true });
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
		description: 'voteEnhancementsHighlightControversialDesc',
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

	if (module.options.highlightControversial.value) {
		highlightControversial();
	}
};

/**
 * @param {number} score
 * @param {Array<Array>} colors An array of [scoreThreshold, color] pairs in ascending order of scoreThreshold
 * @param {string} defaultColor
 * @returns {string}
 */
function interpolateScoreColor(score, colors, defaultColor) {
	if (!colors.length) return defaultColor;

	const augmented = [
		[-Infinity, colors[0][1]],
		...colors,
		[Infinity, colors.slice(-1)[0][1]],
	];

	for (const [[lowBound, lowColor], [highBound, highColor]] of zip(augmented.slice(0, -1), augmented.slice(1))) {
		if (score >= lowBound && score < highBound) {
			if (module.options.interpolateScoreColor.value) {
				return colorFromArray(
					zipWith(colorToArray(lowColor), colorToArray(highColor),
						(lowVal, highVal) => Math.round(projectInto(lowBound, highBound, lowVal, highVal, score)),
					),
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
				[0, '#9494ff'],
				[1, '#888'],
				[2, '#ff8b60'],
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
