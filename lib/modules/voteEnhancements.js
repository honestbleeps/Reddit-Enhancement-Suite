modules['voteEnhancements'] = {
	moduleID: 'voteEnhancements',
	moduleName: 'Vote Enhancements',
	category: 'UI',
	options: {
		estimatePostScore: {
			type: 'boolean',
			value: false,
			description: 'Calculate post score from points and "liked" percentage.'
		},
		estimatePostVotes: {
			type: 'boolean',
			value: true,
			description: 'Calculate the total number of votes.'
		},
		highlightScores: {
			type: 'boolean',
			value: true,
			description: 'Makes post/comment scores bold and therefore easier to find.'
		},
		colorLinkScore: {
			type: 'boolean',
			value: false,
			description: 'Add color to link\'s score depending on its value. (Does not work with "compressed link display" reddit preference)'
		},
		colorCommentScore: {
			type: 'boolean',
			value: false,
			description: 'Add color to comment\'s score depending on its value.'
		},
		highlightControversial: {
			type: 'boolean',
			value: true,
			description: 'Add color to the "controversial" comment indicator'
		},
		highlightControversialColor: {
			dependsOn: 'highlightControversial',
			advanced: true,
			type: 'color',
			value: '#cc0000',
			description: 'Select the color for the "controversial" comment indicator',
		}
	},
	description: 'Allow you to get additionnals informations about votes on comment page.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [],
	isMatchURL: function() {
		// return RESUtils.isMatchURL(this.moduleID);
		return true;
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.pageType() === 'comments') {
				if (this.options.estimatePostScore.value || this.options.estimatePostVotes.value) {
					this.estimatePostScoreVotes();
				}
			}
			if (this.options.colorLinkScore.value) {
				RESUtils.addCSS('.link .rank { color: #fff; text-align: center; border-radius: 1em; font-size: 12px; padding: 4px; line-height: 1; height: 1em; min-width: 1em; }');
				this.applyLinkScoreColor();
				RESUtils.watchForElement('siteTable', modules['voteEnhancements'].applyLinkScoreColor);
			}
			if (this.options.colorCommentScore.value) {
				this.applyCommentScoreColor();
				RESUtils.watchForElement('newComments', modules['voteEnhancements'].applyCommentScoreColor);
			}
			if (this.options.highlightScores.value) {
				this.highlightScores();
			}
			if (this.options.highlightControversial.value) {
				this.highlightControversial();
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
				if (this.options.estimatePostScore.value) {
					RESUtils.addCSS('.linkinfo .upvotes { font-size: 80%; color: orangered; } .linkinfo .downvotes { font-size: 80%; color: #5f99cf; } ');
					linkinfoScore.after('<span class="upvotes"><span class="number">' + RESUtils.addCommas(upvotes) + '</span> <span class="word">' + (upvotes > 1 ? 'upvotes' : 'upvote') + '</span></span> <span class="downvotes"><span class="number">' + RESUtils.addCommas(downvotes) + '</span> <span class="word">' + (downvotes > 1 ? 'downvotes' : 'downvote') + '</span></span> ');
				}
				if (this.options.estimatePostVotes.value) {
					var totalVotes = upvotes + downvotes;
					RESUtils.addCSS('.linkinfo .totalvotes { font-size: 80%; } ');
					linkinfoScore.after('<span class="totalvotes"><span class="number">' + RESUtils.addCommas(totalVotes) + '</span> <span class="word">' + (totalVotes > 1 ? 'votes' : 'vote') + '</span></span></span> ');
				}
			}
		}
	},
	highlightScores: function() {
		RESUtils.addCSS('span.score { font-weight: bold; color: #333; }');
	},
	applyLinkScoreColor: function(ele) {
		ele = ele || document;
		
		var scoreNode = ele.querySelectorAll('#siteTable .midcol>.score');

		for (var i = 0, len = scoreNode.length; i < len; i++) {
			var node = scoreNode[i],
				$node = $(node),
				nodeText = $node.text(),
				nodeNum = parseInt(nodeText, 10);

			if (!isNaN(nodeNum)) {
				$node.closest('.thing').find('.rank')[0].style.background = 'hsl(' + 180+360*(1-100/(150+nodeNum)) + ', 75%,50%)';
			} else {
				$node.closest('.thing').find('.rank')[0].style.background = '#c6c6c6';
			}
		}
	},
	applyCommentScoreColor: function(ele) {
		ele = ele || document;
		
		var scoreNode = ele.querySelectorAll('.tagline>.score');

		for (var i = 0, len = scoreNode.length; i < len; i++) {
			var node = scoreNode[i],
				$node = $(node),
				nodeText = $node.text(),
				nodeNum = parseInt(nodeText, 10);

			if (!isNaN(nodeNum) && nodeNum >= 0) {
				node.style.color = 'hsl(' + 180+360*(1-50/(100+nodeNum)) + ', 75%,50%)';
			}
		}
	},
	highlightControversial: function() {
		var color = modules['voteEnhancements'].options.highlightControversialColor.value || modules['voteEnhancements'].options.highlightControversialColor.defaultValue;
		var style = '.comment.controversial>.entry .score:after { color: ' + color + '; }';
		RESUtils.addCSS(style);
	}
};
