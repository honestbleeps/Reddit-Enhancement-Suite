addModule('troubleShooter', function(module, moduleID) {
	$.extend(module, {
	moduleName: 'Troubleshooter',
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
			description: 'Remove all entries for users with +1 or -1 vote tallies (only non-tagged users).'
		},
		resetToFactory: {
			type: 'button',
			text: 'Reset',
			callback: null,
			description: 'Warning: This will remove all your RES settings, including tags, saved comments, filters etc!'
		},
		backup: {
			type: 'button',
			text: 'backup',
			callback: null,
			description: 'Download a backup of your current RES settings'
		},
		restore: {
			type: 'button',
			text: 'Restore',
			callback: null,
			description: 'Restore a backup of your RES settings. Warning: This will overwrite your current settings'
		}
	},
	description: 'Resolve common problems and clean/clear unwanted settings data.' + '<br/><br/>' + 'Your first line of defence against browser crashes/updates, or potential issues' + ' with RES, is a frequent backup.' + '<br/><br/>' + 'See <a href="/r/Enhancement/wiki/where_is_res_data_stored">here</a>' + ' for the location of the RES settings file for your browser/OS.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		var css = '';
		css += 'body:not(.loggedin) #clearUserInfoCache ~ .optionDescription:before, body:not(.loggedin) #clearSubreddits ~ .optionDescription:before';
		css += '{content: "Functionality only for logged in users - ";color:#f00;font-weight:bold}';
		RESUtils.addCSS(css);
	},
	go: function() {
		this.options['clearUserInfoCache'].callback = modules['troubleShooter'].clearUICache;
		this.options['clearSubreddits'].callback = modules['troubleShooter'].clearSubreddits;
		this.options['clearTags'].callback = modules['troubleShooter'].clearTags;
		this.options['resetToFactory'].callback = modules['troubleShooter'].resetToFactory;
		this.options['backup'].callback = modules['troubleShooter'].backup; 
		this.options['restore'].callback = modules['troubleShooter'].restore;
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
					if ((tags[i].votes === 1 || tags[i].votes === -1) && !tags[i].hasOwnProperty('tag')) {
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
		var confirm = window.confirm('This will kill all your settings and saved data. Are you sure?');
		if (confirm) {
			for (var key in RESStorage) {
				if (key.indexOf('RES') !== -1) {
					RESStorage.removeItem(key);
				}
			}
			modules['notifications'].showNotification('All settings reset.', 2500);
		} else {
			modules['notifications'].showNotification('No action was taken', 2500);
		}
	},
	backup: function() {
		// Generate copy of RES settings for download
		var settings = JSON.stringify(RESStorage);
		var link = document.createElement("a");
		link.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(settings) );
		link.setAttribute('download', "RES-" + Math.round(new Date().getTime() / 1000 ) + ".resbackup");
		link.click();
	},
	uploader: false, // stores ref to upload input
	restore: function(){
		var check = alert(
			"<p>Restoring a file will <b>permanently</b> overwrite your current settings. Are you sure you want to do this?</p>",
			function(){
				var link = document.createElement("input");
				link.setAttribute("type", "file");
				link.setAttribute("accept", ".resbackup");
				link.addEventListener('change', modules['troubleShooter'].restoreFromFile);
				modules['troubleShooter'].uploader = link;
				link.click();
			}
		);
	},
	restoreFromFile: function(){
		var fail_message = "The file you uploaded did not appear to be a valid RES backup (files must have a .resbackup extension).";
		var file = modules['troubleShooter'].uploader.files[0];

		// Check extension
		if(file.name.indexOf(".resbackup") !== false){
			// read file
			var reader = new FileReader();
			reader.onload = function(e) {
				var settings = JSON.parse(reader.result);
				// Fail if JSON is bad
				if(!settings){
					alert(fail_message);
					return;
				}
				// Reimport data
				for(var k in settings){
					RESStorage.setItem(k, settings[k]);
				}

				alert("Your RES settings have been imported. Reloading reddit.");
				// Reload reddit after half a second
				setTimeout(function(){
					window.location.href = 'http://reddit.com';
				},500)	
			}
			reader.readAsText(file);
		}else{
			alert(fail_message);
		}
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
});

