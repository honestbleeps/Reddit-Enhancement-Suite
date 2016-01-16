addModule('submitHelper', function(module, moduleID) {
	module.moduleName = 'Submission Helper';
	module.category = 'Submissions';
	module.description = 'Provides utilities to help with submitting a post.';
	module.options = {
		warnAlreadySubmitted: {
			type: 'boolean',
			value: true,
			description: 'Show a warning when the current URL has already been submitted to the selected subreddit. <p><i>Not 100% accurate, due to search limitations and different ways to format the same URL.</i></p>'
		},
		uncheckSendRepliesToInbox: {
			type: 'boolean',
			value: false,
			description: 'Uncheck "send replies to my inbox" by default, when submitting a new post.'
		}
	};
	module.include = [
		'submit'
	];
	module.beforeLoad = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			if (module.options.warnAlreadySubmitted.value) {
				RESTemplates.load('repostWarning', function(template) {
					module.repostWarning = template.html()[0];
				});
			}
		}
	};
	module.go = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			if (module.options.warnAlreadySubmitted.value) {
				var urlFieldDiv = document.body.querySelector('#url-field');
				if (urlFieldDiv) {
					$(urlFieldDiv).parent().after(module.repostWarning);
					module.urlField = urlFieldDiv.querySelector('#url');
					module.srField = document.body.querySelector('#sr-autocomplete');
					$([module.srField, module.urlField]).on('input keydown', function() {
						RESUtils.debounce('repostWarning', 300, module.updateRepostWarning);
					});
					// No event is fired when reddit's js changes the subreddit field, so update whenever the user clicks
					$('#suggested-reddits a, #sr-drop-down').on('click', module.updateRepostWarning);
					// We would allow reddit to show/hide the message for link/text posts with #link-desc
					// but some subreddits hide this box, so we'll do it manually.
					var linkButton = document.body.querySelector('a.link-button'),
						textButton = document.body.querySelector('a.text-button');
					if (linkButton && textButton) {
						linkButton.addEventListener('click', function() {
							module.repostWarning.querySelector('.res-repost').style.display = 'block';
						});
						textButton.addEventListener('click', function() {
							module.repostWarning.querySelector('.res-repost').style.display = 'none';
						});
					}
				}
			}

			if (module.options.uncheckSendRepliesToInbox.value) {
				var sendReplies = document.body.querySelector('#sendreplies');
				if (sendReplies) {
					sendReplies.checked = false;
				}
			}
		}
	};
	module.showRepostWarning = function(sr, url, date) {
		var srLink = module.repostWarning.querySelector('.subredditLink');
		srLink.href = '/r/' + sr;
		$(srLink).text('/r/' + sr);
		module.repostWarning.querySelector('.seeMore').href = '/r/' + sr + '/search?restrict_sr=on&sort=relevance&q=url%3A' + encodeURIComponent(url);
		$(module.repostWarning).find('.time').text(' ' + RESUtils.niceDateDiff(date) + ' ago ');
		RESUtils.fadeElementIn(module.repostWarning, 0.3);
	};
	module.hideRepostWarning = function() {
		RESUtils.fadeElementOut(module.repostWarning, 0.3);
	};
	module.updateRepostWarning = function() {
		var stripUrlRe = /^(?:https?:\/\/)?(?:(?:www|i|m)\.)?(.+?)\/?(?:\.\w+)?(?:#[^\/]*)?$/i,
			subreddit = module.srField.value,
			userUrl = module.urlField.value;
		if (subreddit && userUrl) {
			userUrl = userUrl.match(stripUrlRe)[1];
			RESEnvironment.ajax({
				method: 'GET',
				url: location.protocol + '//' + location.hostname + '/r/' + subreddit + '/search.json?restrict_sr=on&sort=relevance&limit=1&q=url%3A' + encodeURIComponent(userUrl),
				onload: function(response) {
					if (response.status == 200 && response.responseText) {
						var data = safeJSON.parse(response.responseText).data;
						if (data && data.children.length && data.children[0].data.url.match(stripUrlRe)[1] === userUrl) {
							module.showRepostWarning(subreddit, userUrl, new Date(data.children[0].data.created * 1000));
						} else {
							module.hideRepostWarning();
						}
					} else {
						console.log(response);
						module.hideRepostWarning();
					}
				}
			});
		} else {
			module.hideRepostWarning();
		}
	};
});
