modules['highlightNewComments'] = {
	moduleID: 'highlightNewComments',
	moduleName: 'Highlight New Comments',
	options: {
		// any configurable options you have go here...
		// options must have a type and a value.. 
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		cleanComments: {
			type: 'text',
			value: 2,
			description: 'Clean out comments of threads you haven\t visited in [x] days - enter a number here only!'
		},
		limitSubreddits: {
			type: 'boolean',
			value: false,
			description: "This enhancement may use a lot of resources if you visit a lot of threads. Enable this to limit highlighting to just some subreddits specified below."
		},
		subreddits: {
			type: 'text',
			value: 'askreddit,iama',
			description: 'Enter subreddits you want it to be enabled on by separating them with a comma.'
		},
		enableColorizeOld: {
			type: 'boolean',
			value: true,
			description: 'Do you want to color old comments? Uses color below if enabled.'		
		},
		enableColorizeNew: {
			type: 'boolean',
			value: false,
			description: 'Do you want to color new comments? Uses color below if enabled.'
		},
		enableNewTagline: {
			type: 'boolean',
			value: true,
			description: 'Do you want "New" to appear beside the username of new comments? Uses color below if enabled.'
		},
		oldCommentColor: {
			type: 'text',
			value: 'gray',
			description: 'Color used for old comments.'
		},
		newCommentColor: {
			type: 'text',
			value: 'green',
			description: 'Color used for new comments.'
		},
		taglineColor: {
			type: 'text',
			value: 'red',
			description: 'Color used for "New" in the tagline.'
		},
		
	},
	description: 'Highlights new comments since your last visit. Can limit to only some subreddits. Written by saua.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/http:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// get this module's options...
			RESUtils.getOptions(this.moduleID);
			
			// Add the css needed.
			RESUtils.addCSS('.old_comment { color:' +  this.options.oldCommentColor.value + ' !important; }');			
			RESUtils.addCSS('.new_comment { color:' +  this.options.newCommentColor.value + ' !important; }');
			RESUtils.addCSS('.new_tagline { color:' +  this.options.taglineColor.value + '; }');
			
			// Get the subreddit and thread id
			var re = (/\/r\/(.*?)\/comments\/([\w]+)\//i).exec(location.href);
			var subreddit = re[1];
			var thread_id = re[2];
			if (!this.enabledOnSubreddit(subreddit)) return;
			
			// Fetch stored data
			var json_data = localStorage.getItem('RESmodules.highlightNewComments.data');
			if (json_data == null) {
				json_data = '{}';
			}
			this.data = JSON.parse(json_data);
			
			// Set up thread object, and update it's last_seen variable.
			var allNew = false;
			if (typeof(this.data[thread_id]) == 'undefined') {
				this.data[thread_id] = {}
				this.data[thread_id]['comments'] = {}
				allNew = true;
			}
			this.data[thread_id]['last_seen'] = (new Date()).getTime();

			// Check comments for old ones.
			this.checkComments(thread_id, allNew);
			
			// Highlight any new comments which arrives though "load more comments".
			document.body.addEventListener('DOMNodeInserted', function(event) {
				if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
					modules['highlightNewComments'].checkComments(thread_id, allNew);
				}
			}, true);
			
			// Clean up any old threads.
			this.cleanCache();
			
		}
	},
	checkComments: function(thread_id, allNew) {
		var seen_comments = this.data[thread_id]['comments'];
		var comments = document.querySelectorAll('div.commentarea div.thing');
		for (var i = 0; i < comments.length; i++) {
			comment = comments[i];
			c_class = comment.getAttribute('class')
			comment_id = c_class.split(" ")[2].slice(6);
			
			if (!allNew) {
				// New
				if (!this.isCommentOld(thread_id, comment_id)) {
					if (this.options.enableNewTagline.value) {
						var tagline = comment.querySelector("p.tagline");
						tagline.innerHTML = '<span class="new_tagline">New</span> ' + tagline.innerHTML;
					}
					
					if (this.options.enableColorizeNew.value) {
						var md = comment.querySelector("div.usertext-body div.md");
						if (md) {
							md.setAttribute('class', 'new_comment ' + md.getAttribute('class'));
						}
					}
				
				//Old
				} else {
					if (this.options.enableColorizeOld.value) {
						var md = comment.querySelector("div.usertext-body div.md");
						if (md) {
							md.setAttribute('class', 'old_comment ' + md.getAttribute('class'));
						}
					}
				}
			}
			
			this.data[thread_id]['comments'][comment_id] = 1;
		}
		
		this.saveData();
	},
	isCommentOld: function(thread_id, comment_id) {
		return typeof(this.data[thread_id]['comments'][comment_id]) != 'undefined';
	},
	cleanCache: function() {
		var now = (new Date()).getTime();
		for (var thread_id in this.data) {
			if ((now - this.data[thread_id]['last_seen']) > (86400000 * this.options.cleanComments.value)) {
				this.data[thread_id] = null;
			}
		}
		this.saveData();
	},
	enabledOnSubreddit: function(subredditname) {
		if (this.options.limitSubreddits.value) {
			var subreddits = this.options.subreddits.value.split(",");
			for (var i = 0; i < subreddits.length; i++) {
				if (subreddits[i].toUpperCase() == subredditname.toUpperCase()) return true;
			}
			return false;
		}
		return true;
	},
	saveData: function() {
		localStorage.setItem('RESmodules.highlightNewComments.data', JSON.stringify(this.data));
	}
};
