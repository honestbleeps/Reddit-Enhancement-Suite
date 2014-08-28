modules['redditProfiles'] = {
	moduleID: 'redditProfiles',
	moduleName: 'Reddit Profiles',
	category: 'Users',
	options: {
	},
	description: 'Allow you to set your profile and see other user profile.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			var thisCache = RESStorage.getItem('RESmodules.redditProfiles.cache');
			if (thisCache == null) {
				thisCache = '{}';
			}
			this.profileCache = safeJSON.parse(thisCache);
			if (this.profileCache == null) this.profileCache = {};
			var userRE = /\/user\/(\w+)/i;
			var match = userRE.exec(location.href);
			if (match) {
				var username = match[1];
				this.getProfile(username.toLowerCase());
			}
		}
	},
	getProfile: function(username) {
		if ($('.side-multi-list a[href$="/profile"]').length || username === RESUtils.loggedInUser().toLowerCase()) { // check if the user have a "profile" multireddit
			var lastCheck = 0;
			if ((typeof this.profileCache[username] !== 'undefined') && (this.profileCache[username] !== null)) {
				lastCheck = this.profileCache[username].lastCheck;
			}
			var now = Date.now();
			if (parseInt(now / 900000, 10) > lastCheck) { // 15 min
				BrowserStrategy.ajax({
						method: 'GET',
						url: location.protocol + 'api.reddit.com/api/multi/user/'+username+'/m/profile/description',
						onload: function(response) {
							var thisResponse;
							try {
								thisResponse = JSON.parse(response.responseText);
							} catch (e) {
								console.log('Error parsing response from reddit');
								console.log(response.responseText);
								return false;
							}
							
							var profileData = {}
							
							var now = Date.now();
							profileData.t = parseInt(now / 900000, 10); // we save the current timestamp divided by 15 min
								
							if(thisResponse.data && thisResponse.data.body_md)	{
								profileData.p = thisResponse.data.body_md;
							} else {
								profileData.p = null;
							}
							
							modules['redditProfiles'].profileCache[username] = profileData;
							RESStorage.setItem('RESmodules.redditProfiles.cache', JSON.stringify(modules['redditProfiles'].profileCache));
							modules['redditProfiles'].displayProfile(username, profileData);
						}
					});
			} else {
				this.displayProfile(username, this.profileCache[username]);
			}
		}
	},
	displayProfile: function(username, profileObject) { // { p: markdown of the profile content, t: timestamp/15min of the last api request}
		RESUtils.addCSS('.profile-area h1 { font-weight: bold; font-variant: small-caps; margin: 0px; }');
		RESUtils.addCSS('.profile-area .helplink { float: right; margin-top: 4px; }');
		if (profileObject.p !== null || username === RESUtils.loggedInUser().toLowerCase()) {
			var firstSpacer = document.querySelector('div.side > div.spacer');
			var newSpacer = document.createElement('div');
			var profileHTML = '<div class="profile-area"><a class="helplink" target="_blank" href="/r/Enhancement/wiki/profiles">what\'s this?</a><h1>profile</h1><div class="content">';
			
			if (profileObject.p !== null) {
				var converter = window.SnuOwnd.getParser();
				profileBody = converter.render(profileObject.p);
			} else { // we are on our user page but haven't set our profile yet
				profileBody = 'You haven\'t set your profile yet. You can <a href="#">set</a> it now if you want.';
			}

			profileHTML += profileBody + '</div></div>';
			$(newSpacer).html(profileHTML);
			$(newSpacer).addClass('spacer');
			RESUtils.insertAfter(firstSpacer,newSpacer);
		}
	}
};