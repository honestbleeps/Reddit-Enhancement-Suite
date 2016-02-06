addModule('troubleshooter', (module, moduleID) => {
	module.moduleName = 'Troubleshooter';
	module.alwaysEnabled = true;
	module.sort = -7;
	module.description = 'Resolve common problems and clean/clear unwanted settings data.<br/><br/>' +
		'Your first line of defence against browser crashes/updates, or potential issues with RES, is a frequent backup.<br/><br/>' +
		'See <a href="/r/Enhancement/wiki/where_is_res_data_stored">here</a> for the location of the RES settings file for your browser/OS.';
	module.category = 'About RES';
	module.options = {
		clearCache: {
			type: 'button',
			text: 'Clear',
			callback: clearCache,
			description: 'Clear your RES cache and session. This includes the "My Subreddits" dropdown and cached user or subreddit info.'
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
			description: `
				Reloads the page and disables RES for this tab <i>only</i>. RES will still be enabled
				in any other reddit tabs or windows you currently have open or open after this. This feature can be
				used for troubleshooting, as well as to quickly hide usernotes, vote counts, subreddit shortcuts,
				and other RES data for clean screenshotting.
			`
		},
		profileStartup: {
			type: 'button',
			text: 'Enable',
			callback: enableProfiling,
			description: 'Reloads the page and profiles startup time. Future reloads in the current tab will also be profiled. Only affects the current tab.'
		},
		breakpoint: {
			type: 'button',
			text: 'Pause JavaScript',
			callback() {
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

	function clearCache() {
		RESEnvironment.xhrCache.clear();
		RESEnvironment.session.clear();
		modules['notifications'].showNotification('All caches cleared.', 2500);
	}

	async function clearTags() {
		const confirm = window.confirm('Are you positive?');
		if (confirm) {
			const tags = await RESEnvironment.storage.get('RESmodules.userTagger.tags');
			if (tags) {
				let cnt = 0;
				for (const i in tags) {
					if ((tags[i].votes === 1 || tags[i].votes === 0 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
						delete tags[i];
						cnt += 1;
					}
				}
				RESEnvironment.storage.set('RESmodules.userTagger.tags', tags);
				modules['notifications'].showNotification(cnt + ' entries removed.', 2500);
			}
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	}

	async function resetToFactory() {
		const confirm = window.prompt('This will kill all your settings and saved data. If you\'re certain, type in "trash".');
		if (confirm === 'trash' || confirm === '"trash"') {
			(await RESEnvironment.storage.keys()).forEach(key => RESEnvironment.storage.delete(key));
			modules['notifications'].showNotification('All settings reset. Reload to see the result.', 2500);
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	}

	function disableRES() {
		sessionStorage.setItem('RES.disabled', true);
		window.location.reload();
	}

	function enableProfiling() {
		sessionStorage.setItem('RES.profiling', true);
		location.hash = '';
		location.reload();
	}

	async function testTemplates() {
		const templateText = (await RESTemplates.load('test')).text({ name: 'FakeUsername' });
		console.log(templateText);

		modules['notifications'].showNotification({
			moduleID,
			header: 'Template test',
			message: templateText
		});
	}
});
