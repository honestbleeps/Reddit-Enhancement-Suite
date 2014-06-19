modules['voteEnhancements'] = {
	moduleID: 'voteEnhancements',
	moduleName: 'Vote Enhancements',
	category: 'UI',
	options: {
		estimatePostScore: {
			type: 'boolean',
			value: false,
			description: 'Try to calculate post score from points and "liked" percentage.'
		},
		estimatePostVotes: {
			type: 'boolean',
			value: true,
			description: 'Try to calculate the total number of vote.'
		}
	},
	description: 'Allow you to get additionnals informations about votes on comment page.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'comments'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.estimatePostScore.value || this.options.estimatePostVotes.value) {
				this.estimatePostScoreVotes();
			}
		}
	},
	estimatePostScoreVotes: function() {
		var linkinfoScore = $('.linkinfo .score');
		if (linkinfoScore.length) {
			var points = parseInt(linkinfoScore.find('.number').text().replace(/[^0-9]/g,''), 10);
			var percentage = parseInt((linkinfoScore.text().match(/([0-9]{1,3})\s?%/) || [0,0])[1], 10);
			if (points !== 50 || percentage !== 50) { // we can't estimate if percentage equal 50% (i.e. points equal zero) -- It's important to stop don't avoid divide by zero ! edit: if downvote>upvote we can't calculate too
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
	}
};
