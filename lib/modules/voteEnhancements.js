import { $ } from '../vendor';
import {
	addCSS,
	collect,
	colorFromArray,
	colorToArray,
	commaDelimitedNumber,
	forEachChunked,
	isPageType,
	map,
	projectInto,
	watchForElement,
	zip,
} from '../utils';

export const module = {};

module.moduleID = 'voteEnhancements';
module.moduleName = 'Vote Enhancements';
module.category = ['Appearance'];
module.description = 'Format or show additional information about votes on posts and comments.';
module.options = {
	estimatePostScore: {
		type: 'boolean',
		value: false,
		description: 'Calculate a post\'s score from its points and "liked" percentage.',
		bodyClass: true,
	},
	estimatePostVotes: {
		type: 'boolean',
		value: true,
		description: 'Calculate the total number of votes.',
		bodyClass: true,
	},
	highlightScores: {
		type: 'boolean',
		value: true,
		description: 'Bolden post and comment scores, making them easier to find.',
		bodyClass: true,
	},
	colorLinkScore: {
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
		description: `
			Add color to a link's score depending on its value.<br>
			This does not work with reddit's "compressed link display" preference.
		`,
		bodyClass: true,
	},
	userDefinedLinkColoration: {
		type: 'table',
		addRowText: '+add threshold',
		fields: [{
			name: 'score',
			type: 'text',
		}, {
			name: 'color',
			type: 'color',
		}],
		value: [
			['0', '#5f99cf'],
			['10', '#F2B035'],
			['50', '#FF4500'],
			['100', '#D92B2B'],
		],
		description: 'Choose a color for colorLinkScore with a threshold of your choice.',
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
		description: 'Add color to a comment\'s score depending on its value.',
		presets: {
			simple: [
				['0', '#9494FF'],
				['1', '#888'],
				['2', '#FF8B60'],
			],
		},
	},
	userDefinedCommentColoration: {
		type: 'table',
		addRowText: '+add threshold',
		fields: [{
			name: 'score',
			type: 'text',
		}, {
			name: 'color',
			type: 'color',
		}],
		value: [
			['0', '#5f99cf'],
			['10', '#F2B035'],
			['50', '#FF4500'],
			['100', '#D92B2B'],
		],
		description: 'Choose a color for colorLinkScore with a threshold of your choice.',
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
	highlightControversial: {
		type: 'boolean',
		value: true,
		description: 'Add color to the "controversial" comment indicator.<br>This indicator can be enabled/disabled in your <a href="/prefs/#highlight_controversial">reddit preferences</a>.',
	},
	highlightControversialColor: {
		dependsOn: 'highlightControversial',
		advanced: true,
		type: 'color',
		value: '#cc0000',
		description: 'Select a color for the "controversial" comment indicator.',
	},
};
module.includes = ['comments', 'linklist', 'modqueue'];

module.go = function() {
	if (isPageType('comments')) {
		if (module.options.estimatePostScore.value || module.options.estimatePostVotes.value) {
			estimatePostScoreVotes();
		}
	}
	if (module.options.colorLinkScore.value !== 'none') {
		applyLinkScoreColor();
		watchForElement('siteTable', applyLinkScoreColor);
	}
	if (module.options.colorCommentScore.value !== 'none') {
		applyCommentScoreColor();
		watchForElement('newComments', applyCommentScoreColor);
		watchForElement('siteTable', applyCommentScoreColor);
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
				$linkinfoScore.after(`
					<span class="upvotes"><span class="number">${commaDelimitedNumber(upvotes)}</span> <span class="word">${upvotes === 1 ? 'upvote' : 'upvotes'}</span></span>
					<span class="downvotes"><span class="number">${commaDelimitedNumber(downvotes)}</span> <span class="word">${downvotes === 1 ? 'downvote' : 'downvotes'}</span></span>
				`);
			}
			if (module.options.estimatePostVotes.value) {
				const totalVotes = upvotes + downvotes;
				$linkinfoScore.after(`
					<span class="totalvotes"><span class="number">${commaDelimitedNumber(totalVotes)}</span> <span class="word">${totalVotes === 1 ? 'vote' : 'votes'}</span></span>
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
	const augmented = [
		[-Infinity, defaultColor],
		...colors,
		[Infinity, defaultColor],
	];

	for (const [[lowBound, lowColor], [highBound, highColor]] of zip(augmented.slice(0, -1), augmented.slice(1))) {
		if (score >= lowBound && score < highBound) {
			return colorFromArray(
				zip(colorToArray(lowColor), colorToArray(highColor))
					::map(([lowVal, highVal]) => Math.round(projectInto(lowBound, highBound, lowVal, highVal, score)))
					::collect()
			);
		}
	}

	// should never be reached because score should always be in [-Infinity, Infinity]
	return defaultColor;
}

function getLinkScoreColor(score) {
	if (isNaN(score)) {
		return false;
	}

	if (module.options.colorLinkScore.value === 'automatic') {
		return `hsl(${180 + 360 * (1 - 100 / (150 + score))}, 75%,50%)`;
	} else {
		return interpolateScoreColor(score, module.options.userDefinedLinkColoration.value, '#c6c6c6');
	}
}

function getCommentScoreColor(score) {
	if (isNaN(score)) {
		return false;
	}

	if (module.options.colorCommentScore.value === 'automatic') {
		return `hsl(${180 + 360 * (1 - 50 / (100 + score))}, 75%,50%)`;
	} else {
		const colors = (module.options.colorCommentScore.value === 'user') ?
			module.options.userDefinedCommentColoration.value :
			module.options.colorCommentScore.presets[module.options.colorCommentScore.value];

		return interpolateScoreColor(score, colors, '#888');
	}
}

function applyLinkScoreColor(ele = document) {
	const scoreNodes = ele.querySelectorAll('#siteTable .midcol>.score');

	scoreNodes::forEachChunked(node => {
		const score = parseInt(node.textContent, 10);

		const addBackgroundTo = $(node).closest('.thing').find('.rank')[0];
		const color = getLinkScoreColor(score);

		if (addBackgroundTo && color) {
			addBackgroundTo.style.background = color;
		}
	});
}

function applyCommentScoreColor(ele = document) {
	const scoreNodes = ele.querySelectorAll('.tagline>.score');

	scoreNodes::forEachChunked(node => {
		const score = parseInt(node.textContent, 10);

		const addBackgroundTo = node;
		const color = getCommentScoreColor(score);

		if (addBackgroundTo && color) {
			addBackgroundTo.style.color = color;
		}
	});
}

function highlightControversial() {
	const color = module.options.highlightControversialColor.value || module.options.highlightControversialColor.default;
	addCSS(`
		.comment.controversial > .entry .score::after {
			color: ${color};
		}
	`);
}
