addModule('troubleshooter', function(module, moduleID) {
	$.extend(module, {
	moduleName: 'Troubleshooter',
	alwaysEnabled: true,
	sort: -7,
	description: 'Resolve common problems and clean/clear unwanted settings data.' + '<br/><br/>' +
		'Your first line of defence against browser crashes/updates, or potential issues' + ' with RES, is a frequent backup.' + '<br/><br/>' +
		'See <a href="/r/Enhancement/wiki/where_is_res_data_stored">here</a>' + ' for the location of the RES settings file for your browser/OS.',
	category: 'About RES',
	options: {
		clearUserInfoCache: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the <code>userInfo</code> cache for the currently logged in user. Useful for when link/comment karma appears to have frozen.'
		},
		clearSubreddits: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Reset the \'My Subreddits\' dropdown contents in the event of old/duplicate/missing entries.'
		},
		clearTags: {
			type: 'button',
			text: 'Clear',
			callback: null,
			description: 'Remove all entries for users with between +1 and -1 vote tallies (only non-tagged users).'
		},
		resetToFactory: {
			type: 'button',
			text: 'Reset',
			callback: null,
			description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!'
		},
		disableRES: {
			type: 'button',
			text: 'Disable',
			callback: null,
			description: 'Reloads the page and disables RES for this tab <i>only</i>. RES will still be enabled \
				in any other reddit tabs or windows you currently have open or open after this. This feature can be \
				used for troubleshooting, as well as to quickly hide usernotes, vote counts, subreddit shortcuts, \
				and other RES data for clean screenshotting.'
		},
		breakpoint: {
			type: 'button',
			text: 'Pause JavaScript',
			callback: function() {
				/* jshint -W087 */
				debugger;
			},
			description: 'Pause JavaScript execution to allow debugging'
		}
	},

	beforeLoad: function() {
		var css = '';
		css += 'body:not(.loggedin) #clearUserInfoCache ~ .optionDescription:before, body:not(.loggedin) #clearSubreddits ~ .optionDescription:before';
		css += '{content: "Functionality only for logged in users - ";color:#f00;font-weight:bold}';
		RESUtils.addCSS(css);
	},
	go: function() {
		module.options.clearUserInfoCache.callback = module.clearUICache;
		module.options.clearSubreddits.callback = module.clearSubreddits;
		module.options.clearTags.callback = module.clearTags;
		module.options.resetToFactory.callback = module.resetToFactory;
		module.options.disableRES.callback = module.disableRES;
	},
	clearUICache: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESUtils.userInfoCache.' + user);
			modules['notifications'].showNotification('Cached info for ' + user + ' was reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearSubreddits: function() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESmodules.subredditManager.subreddits.' + user);
			modules['notifications'].showNotification('Subreddits for ' + user + ' were reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	},
	clearTags: function() {
		var confirm = window.confirm('Are you positive?');
		if (confirm) {
			var i,
				cnt = 0,
				tags = RESStorage.getItem('RESmodules.userTagger.tags');
			if (tags) {
				tags = JSON.parse(tags);
				for (i in tags) {
					if ((tags[i].votes === 1 || tags[i].votes === 0 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
						delete tags[i];
						cnt += 1;
					}
				}
				tags = JSON.stringify(tags);
				RESStorage.setItem('RESmodules.userTagger.tags', tags);
				modules['notifications'].showNotification(cnt + ' entries removed.', 2500);
			}
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	},
	resetToFactory: function() {
		var confirm = window.prompt('This will kill all your settings and saved data. If you\'re certain, type in "trash".');
		if (confirm === 'trash' || confirm === '"trash"') {
			for (var key in RESStorage) {
				if (key.indexOf('RES') !== -1) {
					RESStorage.removeItem(key);
				}
			}
			modules['notifications'].showNotification('All settings reset. Reload to see the result.', 2500);
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	},
	disableRES: function() {
		sessionStorage.setItem('RES.disabled', true);
		window.location.reload();
	}
	});


	module.options['testTemplates'] = {
		type: 'button',
		text: 'Test templates',
		callback: testTemplates,
		description: 'Test rendering templates'
	};
	function testTemplates() {
		RESTemplates.load('test', function(template) {
			var templateText = template.text({ name: 'FakeUsername' });
			console.log(templateText);

			modules['notifications'].showNotification({
				moduleID: moduleID,
				header: 'Template test',
				message: templateText
			});
		});
	}

	module.notification = function() {
		modules['notifications'].showNotification({
			moduleID: moduleID,
			notificationID: 'test',
			message: arguments.length ? Array.prototype.join.call(arguments, ', ') : 'No arguments'
		});
	};
});
