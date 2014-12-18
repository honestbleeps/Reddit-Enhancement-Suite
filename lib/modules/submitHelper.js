modules['submitHelper'] = {
	moduleID: 'submitHelper',
	moduleName: 'Submission Helper',
	category: 'UI',
	description: 'Provides utilities to help with submitting a post.',
	options: {
		warnAlreadySubmitted: {
			type: 'boolean',
			value: false,
			description: 'Show a warning when the current URL has already been submitted to the selected subreddit. <p><i>Not 100% accurate, due to search limitations and different ways to format the same URL.</i></p>'
		},
		uncheckSendRepliesToInbox: {
			type: 'boolean',
			value: false,
			description: 'Uncheck "send replies to my inbox" by default, when submitting a new post.'
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'submit'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			if (this.options.warnAlreadySubmitted.value) {
				RESTemplates.load('repostWarning', function(template) {
					modules['submitHelper'].repostWarning = template.html()[0];
				});
				RESUtils.addCSS('.res-repost::before { background-position: -44px -774px; }');
			}
		}
	},
	go: function() {
		if (this.isEnabled() && this.isMatchURL()) {
			if (this.options.warnAlreadySubmitted.value) {
				var urlFieldDiv = document.body.querySelector('#url-field');
				if (urlFieldDiv) {
					$(urlFieldDiv).parent().after(this.repostWarning);
					this.urlField = urlFieldDiv.querySelector('#url');
					this.srField = document.body.querySelector('#sr-autocomplete');
					$([this.srField, this.urlField]).on('input keydown', function() {
						RESUtils.debounce('repostWarning', 300, modules['submitHelper'].updateRepostWarning);
					});
					// No event is fired when reddit's js changes the subreddit field, so update whenever the user clicks
					$('#suggested-reddits a, #sr-drop-down').on('click', modules['submitHelper'].updateRepostWarning);
					// We would allow reddit to show/hide the message for link/text posts with #link-desc
					// but some subreddits hide this box, so we'll do it manually.
					var linkButton = document.body.querySelector('a.link-button'),
						textButton = document.body.querySelector('a.text-button');
					if (linkButton && textButton) {
						linkButton.addEventListener('click', function() {
							modules['submitHelper'].repostWarning.querySelector('.res-repost').style.display = 'block';
						});
						textButton.addEventListener('click', function() {
							modules['submitHelper'].repostWarning.querySelector('.res-repost').style.display = 'none';
						});
					}
				}
			}

			if (this.options.uncheckSendRepliesToInbox.value) {
				var sendReplies = document.body.querySelector('#sendreplies');
				if (sendReplies) {
					sendReplies.checked = false;
				}
			}
		}
	},
	showRepostWarning: function(sr, url, date) {
		var srLink = this.repostWarning.querySelector('.subredditLink');
		srLink.href = '/r/' + sr;
		$(srLink).text('/r/' + sr);
		this.repostWarning.querySelector('.seeMore').href = '/r/' + sr + '/search?restrict_sr=on&sort=relevance&q=url%3A' + encodeURIComponent(url);
		$(this.repostWarning).find('.time').text(' ' + RESUtils.niceDateDiff(date) + ' ago ');
		RESUtils.fadeElementIn(this.repostWarning, 0.3);
	},
	hideRepostWarning: function() {
		RESUtils.fadeElementOut(this.repostWarning, 0.3);
	},
	updateRepostWarning: function() {
		var stripUrlRe = /^(?:https?:\/\/)?(?:(?:www|i|m)\.)?(.+?)\/?(?:\.\w+)?(?:#[^\/]*)?$/i,
			subreddit = modules['submitHelper'].srField.value,
			userUrl = modules['submitHelper'].urlField.value;
		if (subreddit && userUrl) {
			userUrl = userUrl.match(stripUrlRe)[1];
			BrowserStrategy.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/r/' + subreddit + '/search.json?restrict_sr=on&sort=relevance&limit=1&q=url%3A' + encodeURIComponent(userUrl),
				onload: function(response) {
					if (response.status == 200 && response.responseText) {
						var data = safeJSON.parse(response.responseText).data;
						if (data && data.children.length && data.children[0].data.url.match(stripUrlRe)[1] === userUrl) {
							modules['submitHelper'].showRepostWarning(subreddit, userUrl, new Date(data.children[0].data.created * 1000));
						} else {
							modules['submitHelper'].hideRepostWarning();
						}
					} else {
						console.log(response);
						modules['submitHelper'].hideRepostWarning();
					}
				}
			});
		} else {
			modules['submitHelper'].hideRepostWarning();
		}
	}
};
