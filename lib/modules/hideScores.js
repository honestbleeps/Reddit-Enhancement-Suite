addModule('hideScores', {
	moduleID: 'hideScores',
	moduleName: 'Hide Scores',
	category: 'UI',
	description: 'Hides scores until you cast your vote. The idea is to prevent yourself from being influenced by the votes of other users.',
	options: {
		hideCommentScores: {
			type: 'boolean',
			value: false,
			description: 'Hide comment scores'
		},
		hideSubmissionScores: {
			type: 'boolean',
			value: false,
			description: 'Hide submission scores'
		},
		alwaysHide: {
			type: 'boolean',
			value: false,
			description: 'Keep hiding scores after you vote'
		}
	},
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (!this.isEnabled() || !this.isMatchURL())
			return;

		if (this.options.hideCommentScores.value) {
			if (this.options.alwaysHide.value) {
				RESUtils.addCSS('.comment .score { display: none; }');
				RESUtils.addCSS('.comment .userattrs::after { content: "(score hidden)"; }');
			} else {
				RESUtils.addCSS('.comment .unvoted .score { display: none; }');
				RESUtils.addCSS('.comment .unvoted .userattrs::after { content: "(score hidden)"; }');
			}
		}

		if (this.options.hideSubmissionScores.value) {
			if (this.options.alwaysHide.value) {
				RESUtils.addCSS('.midcol .score { visibility: hidden; }');
			} else {
				RESUtils.addCSS('.midcol.unvoted .score { visibility: hidden; }');
			}
		}
	},
	go: function() {
		return;
	}
});
