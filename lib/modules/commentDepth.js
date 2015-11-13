addModule('commentDepth', function(module, moduleID) {
	module.moduleName = 'Custom Comment Depth';
	module.category = 'Comments';
	module.description = 'Allows you to set the preferred depth of comments you wish to see when clicking on comments links. 0 = Everything, 1 = Root level, 2 = Responses to Root Level, 3 = Responses to Responses to Root Level, etc.';
	module.options = {
		defaultCommentDepth: {
			type: 'text',
			value: '4',
			description: 'Default depth to use for all subreddits not listed below'
		},
		subredditCommentDepths: {
			type: 'table',
			addRowNext: '+add subreddit',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}, {
				name: 'commentDepth',
				type: 'text'
			}],
			value: [
			],
			description: 'Enter any subreddit (no "/r/", just the name).  Enter a number for the desired default comment depth. '
		}
	};

	// See RESUtils.pageType (utils.js) for other page types
	module.include = [
		'all'
	];
	module.exclude = [
	];

	module.go = function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			var commentDepth = parseInt(module.options.defaultCommentDepth.value, 10);
			if (commentDepth >= 0) {
				$(document.body).on('click', 'a[href*="/comments"]', function(e) {
				    var href = e.currentTarget.href;
				    if (href.match(RESUtils.regexes.comments)) { 
				    	//check for subreddit specific values
						var subredditCommentDepths = module.options.subredditCommentDepths.value;
				    	if(subredditCommentDepths.length > 0){
					    	for (var i = 0; i < subredditCommentDepths.length; i++) {
					    		if(href.indexOf('/r/'+subredditCommentDepths[i][0]+'/') >= 0){
					    			commentDepth = subredditCommentDepths[i][1];
									break;
					    		}
					    	};				    		
				    	}
				    	//check for ? in url
				    	if (href.match(/\?/)){
				    		//check for 'depth='
							href = (href.match(/depth=/)) ? href : href + '&depth=' + commentDepth;
				    	}else{
				    		href += '?depth=' + commentDepth;
				    	}
				    	e.currentTarget.href = href;	
				    }
				});
			}
		}
	};
});
