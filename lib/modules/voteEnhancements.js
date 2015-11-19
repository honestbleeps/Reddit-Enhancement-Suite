addModule('voteEnhancements', function(module, moduleID) {
	$.extend(module, {
	moduleName: 'Vote Enhancements',
	category: [ 'Appearance' ],
	description: 'Format or show additional information about votes on posts and comments.',
	options: {
		estimatePostScore: {
			type: 'boolean',
			value: false,
			description: 'Calculate a post\'s score from its points and "liked" percentage.'
		},
		estimatePostVotes: {
			type: 'boolean',
			value: true,
			description: 'Calculate the total number of votes.'
		},
		highlightScores: {
			type: 'boolean',
			value: true,
			description: 'Bolden post and comment scores, making them easier to find.'
		},
		colorLinkScore: {
			type: 'enum',
			values: [{
				name: 'No coloration',
				value: 'none'
			}, {
				name: 'Automatic coloration',
				value: 'automatic'
			}, {
				name: 'User-defined coloration',
				value: 'user'
			}],
			value: 'none',
			description: 'Add color to a link\'s score depending on its value.<br>\
				This does not work with reddit\'s "compressed link display" preference.'
		},
		userDefinedLinkColoration: {
			type: 'table',
			addRowText: '+add threshold',
			fields: [{
				name: 'score',
				type: 'text'
			}, {
				name: 'color',
				type: 'color'
			}],
			value: [
				['0', '#5f99cf'],
				['10', '#F2B035'],
				['50', '#FF4500'],
				['100', '#D92B2B']
			],
			description: 'Choose a color for colorLinkScore with a threshold of your choice.',
			sort: function(a, b) { // sort field with score increasing
				a[0] = parseInt(a[0], 10);
				b[0] = parseInt(b[0], 10);
				if (a[0] < b[0]) {
					return -1;
				}
				if (a[0] > b [0]) {
					return 1;
				}
				return 0;
			}
		},
		colorCommentScore: {
			type: 'enum',
			values: [{
				name: 'No coloration',
				value: 'none'
			}, {
				name: 'Automatic coloration',
				value: 'automatic'
			}, {
				name: 'Reddit Classic',
				value: 'simple'
			}, {
				name: 'User-defined coloration',
				value: 'user'
			}],
			value: 'none',
			description: 'Add color to a comment\'s score depending on its value.',
			presets: {
				'simple': [
					['0', '#9494FF'],
					['1', '#888'],
					['2', '#FF8B60']
				]
			}
		},
		userDefinedCommentColoration: {
			type: 'table',
			addRowText: '+add threshold',
			fields: [{
				name: 'score',
				type: 'text'
			}, {
				name: 'color',
				type: 'color'
			}],
			value: [
				['0', '#5f99cf'],
				['10', '#F2B035'],
				['50', '#FF4500'],
				['100', '#D92B2B']
			],
			description: 'Choose a color for colorLinkScore with a threshold of your choice.',
			sort: function(a, b) { // sort field with score increasing
				a[0] = parseInt(a[0], 10);
				b[0] = parseInt(b[0], 10);
				if (a[0] < b[0]) {
					return -1;
				}
				if (a[0] > b [0]) {
					return 1;
				}
				return 0;
			}
		},
		highlightControversial: {
			type: 'boolean',
			value: true,
			description: 'Add color to the "controversial" comment indicator.<br>This indicator can be enabled/disabled in your <a href="/prefs/#highlight_controversial">reddit preferences</a>.'
		},
		highlightControversialColor: {
			dependsOn: 'highlightControversial',
			advanced: true,
			type: 'color',
			value: '#cc0000',
			description: 'Select a color for the "controversial" comment indicator.'
		}
	},
	includes: [ 'comments', 'linklist' ],
	go: function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			if (RESUtils.pageType() === 'comments') {
				if (module.options.estimatePostScore.value || module.options.estimatePostVotes.value) {
					module.estimatePostScoreVotes();
				}
			}
			if (module.options.colorLinkScore.value !== 'none') {
				RESUtils.addCSS('.link .rank { color: #fff; text-align: center; border-radius: 1em; font-size: 12px; padding: 4px; line-height: 1; height: 1em; min-width: 1em; }');
				module.applyLinkScoreColor();
				RESUtils.watchForElement('siteTable', module.applyLinkScoreColor);
			}
			if (module.options.colorCommentScore.value !== 'none') {
				module.applyCommentScoreColor();
				RESUtils.watchForElement('newComments', module.applyCommentScoreColor);
				RESUtils.watchForElement('siteTable', module.applyCommentScoreColor);
			}
			if (module.options.highlightScores.value) {
				module.highlightScores();
			}
			if (module.options.highlightControversial.value) {
				module.highlightControversial();
			}
		}
	},
	estimatePostScoreVotes: function() {
		var linkinfoScore = $('.linkinfo .score');
		if (linkinfoScore.length) {
			var points = parseInt(linkinfoScore.find('.number').text().replace(/[^0-9]/g,''), 10);
			var percentage = parseInt((linkinfoScore.text().match(/([0-9]{1,3})\s?%/) || [0,0])[1], 10);
			if (points !== 0 && percentage !== 50) { // we can't estimate if percentage equal 50% (i.e. points equal zero) -- It's important to stop don't avoid divide by zero ! edit: if downvote>upvote we can't calculate too
				var upvotes = Math.round(points*percentage/(2*percentage - 100));
				var downvotes = upvotes-points;
				if (module.options.estimatePostScore.value) {
					RESUtils.addCSS('.linkinfo .upvotes { font-size: 80%; color: orangered; } .linkinfo .downvotes { font-size: 80%; color: #5f99cf; } ');
					linkinfoScore.after('<span class="upvotes"><span class="number">' + RESUtils.createElement.commaDelimitedNumber(upvotes) + '</span> <span class="word">' + (upvotes === 1 ? 'upvote' : 'upvotes') + '</span></span> <span class="downvotes"><span class="number">' + RESUtils.createElement.commaDelimitedNumber(downvotes) + '</span> <span class="word">' + (downvotes === 1 ? 'downvote' : 'downvotes') + '</span></span> ');
				}
				if (module.options.estimatePostVotes.value) {
					var totalVotes = upvotes + downvotes;
					RESUtils.addCSS('.linkinfo .totalvotes { font-size: 80%; } ');
					linkinfoScore.after('<span class="totalvotes"><span class="number">' + RESUtils.createElement.commaDelimitedNumber(totalVotes) + '</span> <span class="word">' + (totalVotes === 1 ? 'vote' : 'votes') + '</span></span></span> ');
				}
			}
		}
	},
	getLinkScoreColor: function(score) {
		if (isNaN(score)) {
			return '#c6c6c6';
		}

		if (module.options.colorLinkScore.value === 'automatic') {
			return 'hsl(' + 180+360*(1-100/(150+score)) + ', 75%,50%)';
		} else {
			if (module.options.userDefinedLinkColoration.value.length) {
				for (var len = module.options.userDefinedLinkColoration.value.length, i = len-1; i >= 0; i--) {
					if (score >= module.options.userDefinedLinkColoration.value[i][0]) {
						return module.options.userDefinedLinkColoration.value[i][1];
					}
				}
				return module.options.userDefinedLinkColoration.value[0][1];
			}
		}
	},
	getCommentScoreColor: function(score) {
		if (isNaN(score)) {
			return;
		}

		if (module.options.colorCommentScore.value === 'automatic') {
			return 'hsl(' + 180+360*(1-50/(100+score)) + ', 75%,50%)';
		} else {
			var colors = (module.options.colorCommentScore.value === 'user') ? module.options.userDefinedCommentColoration.value : module.options.colorCommentScore.presets[module.options.colorCommentScore.value];
			if (colors.length) {
				for (var len = colors.length, i = len-1; i >= 0; i--) {
					if (score >= colors[i][0]) {
						return colors[i][1];
					}
				}
				return colors[0][1]; // As a comment can have a -9999 score, we use the first color if no threshold have been triggered
			}
		}
	},
	highlightScores: function() {
		RESUtils.addCSS('span.score { font-weight: bold; color: #333; }');
	},
	applyLinkScoreColor: function(ele) {
		ele = ele || document;

		var scoreNodes = ele.querySelectorAll('#siteTable .midcol>.score');

		RESUtils.forEachChunked(scoreNodes, 25, 300, function(node) {
			var score = parseInt(node.textContent, 10);

			var addBackgroundTo = $(node).closest('.thing').find('.rank')[0];
			var color = module.getLinkScoreColor(score);

			if (addBackgroundTo && color) {
				addBackgroundTo.style.background = color;
			}
		});
	},
	applyCommentScoreColor: function(ele) {
		ele = ele || document;

		var scoreNodes = ele.querySelectorAll('.tagline>.score');

		RESUtils.forEachChunked(scoreNodes, 20, 1000, function(node) {
			var score = parseInt(node.textContent, 10);

			var addBackgroundTo = node;
			var color = module.getCommentScoreColor(score);

			if (addBackgroundTo && color) {
				addBackgroundTo.style.color = color;
			}
		});
	},
	highlightControversial: function() {
		var color = module.options.highlightControversialColor.value || module.options.highlightControversialColor.default;
		var style = '.comment.controversial>.entry .score:after { color: ' + color + '; }';
		RESUtils.addCSS(style);
	}
	});
});
