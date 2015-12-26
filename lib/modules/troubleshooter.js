addModule('troubleshooter', function(module, moduleID) {
	module.moduleName = 'Troubleshooter';
	module.alwaysEnabled = true;
	module.sort = -7;
	module.description = 'Resolve common problems and clean/clear unwanted settings data.' + '<br/><br/>' +
		'Your first line of defence against browser crashes/updates, or potential issues' + ' with RES, is a frequent backup.' + '<br/><br/>' +
		'See <a href="/r/Enhancement/wiki/where_is_res_data_stored">here</a>' + ' for the location of the RES settings file for your browser/OS.';
	module.category = 'About RES';
	module.options = {
		clearUserInfoCache: {
			type: 'button',
			text: 'Clear',
			callback: clearUICache,
			description: 'Reset the <code>userInfo</code> cache for the currently logged in user. Useful for when link/comment karma appears to have frozen.'
		},
		clearSubreddits: {
			type: 'button',
			text: 'Clear',
			callback: clearSubreddits,
			description: 'Reset the \'My Subreddits\' dropdown contents in the event of old/duplicate/missing entries.'
		},
		clearTags: {
			type: 'button',
			text: 'Clear',
			callback: clearTags,
			description: 'Remove all entries for users with between +1 and -1 vote tallies (only non-tagged users).'
		},
		resetToFactory: {
			type: 'button',
			text: 'Reset',
			callback: resetToFactory,
			description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!'
		},
		disableRES: {
			type: 'button',
			text: 'Disable',
			callback: disableRES,
			description: 'Reloads the page and disables RES for this tab <i>only</i>. RES will still be enabled \
				in any other reddit tabs or windows you currently have open or open after this. This feature can be \
				used for troubleshooting, as well as to quickly hide usernotes, vote counts, subreddit shortcuts, \
				and other RES data for clean screenshotting.'
		},
		breakpoint: {
			type: 'button',
			text: 'Pause JavaScript',
			callback: function() {
				debugger; // eslint-disable-line no-debugger
			},
			description: 'Pause JavaScript execution to allow debugging'
		},
		testTemplates: {
			type: 'button',
			text: 'Test templates',
			callback: testTemplates,
			description: 'Test rendering templates'
		}
	};

	function clearUICache() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESUtils.userInfoCache.' + user);
			modules['notifications'].showNotification('Cached info for ' + user + ' was reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	}

	function clearSubreddits() {
		var user = RESUtils.loggedInUser();
		if (user) {
			RESStorage.removeItem('RESmodules.subredditManager.subreddits.' + user);
			modules['notifications'].showNotification('Subreddits for ' + user + ' were reset.', 2500);
		} else {
			modules['notifications'].showNotification('You must be logged in to perform this task.', 2500);
		}
	}

	function clearTags() {
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
	}

	function resetToFactory() {
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
	}

	function disableRES() {
		sessionStorage.setItem('RES.disabled', true);
		window.location.reload();
	}

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
});
