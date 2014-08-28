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
			// RESUtils.addCSS('.redditGiftsProfileField { margin-top: 3px; margin-bottom: 6px; }');
			// RESUtils.addCSS('.redditGiftsTrophy { margin-right: 4px; }');
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
	},
	displayProfile: function(username, profileObject) { // { p: markdown of the profile content, t: timestamp/15min of the last api request}
	// username === RESUtils.loggedInUser().toLowerCase() 
		if (typeof profileObject !== 'undefined') {
			var firstSpacer = document.querySelector('div.side > div.spacer');
			var newSpacer = document.createElement('div');
			var profileHTML = '<div class="sidecontentbox profile-area"><a class="helplink" target="_blank" href="http://redditgifts.com">what\'s this?</a><h1>PROFILE</h1><div class="content">';
			var profileBody = '';
			if (typeof profileObject.body !== 'undefined') {
				profileBody += '<h3><a target="_blank" href="http://redditgifts.com/profiles/view/'+username+'">RedditGifts Profile:</a></h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.body+'</div>';
			}
			if (typeof profileObject.description !== 'undefined') {
				profileBody += '<h3>Description:</h3>';
				profileBody += '<div class="redditGiftsProfileField">'+profileObject.description+'</div>';
			}
			if (typeof profileObject.photo !== 'undefined') {
				profileBody += '<h3>Photo:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.photo.url+'"><img src="'+profileObject.photo_small.url+'" /></a></div>';
			}
			if (typeof profileObject.twitter_username !== 'undefined') {
				profileBody += '<h3>Twitter:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="http://twitter.com/'+profileObject.twitter_username+'">@'+profileObject.twitter_username+'</a></div>';
			}
			if (typeof profileObject.website !== 'undefined') {
				profileBody += '<h3>Website:</h3>';
				profileBody += '<div class="redditGiftsProfileField"><a target="_blank" href="'+profileObject.website+'">[link]</a></div>';
			}
			if (typeof profileObject.trophies !== 'undefined') {
				profileBody += '<h3>RedditGifts Trophies:</h3>';
				var count=1;
				var len=profileObject.trophies.length;
				for (var i in profileObject.trophies) {
					var rowNum = parseInt(count/2, 10);
					if (count===1) {
						profileBody += '<table class="trophy-table"><tbody>';
					}
					// console.log('count: ' + count + ' -- mod: ' + (count%2) + ' len: ' + len);
					// console.log('countmod: ' + ((count%2) === 0));
					if ((count%2) === 1) {
						profileBody += '<tr>';
					}
					if ((count===len) && ((count%2) === 1)) {
						profileBody += '<td class="trophy-info" colspan="2">';
					} else {
						profileBody += '<td class="trophy-info">';
					}
					profileBody += '<div><img src="'+profileObject.trophies[i].url+'" alt="'+profileObject.trophies[i].title+'" title="'+profileObject.trophies[i].title+'"><br><span class="trophy-name">'+profileObject.trophies[i].title+'</span></div>';
					profileBody += '</td>';
					if (((count%2) === 0) || (count===len)) {
						profileBody += '</tr>';
					}
					count++;
				}
				if (count) {
					profileBody += '</tbody></table>';
				}
			}
			if (profileBody === '') {
				profileBody = 'User has not filled out a profile on <a target="_blank" href="http://redditgifts.com">RedditGifts</a>.';
			}
			profileHTML += profileBody + '</div></div>';
			$(newSpacer).html(profileHTML);
			// addClass(newSpacer,'spacer');
			RESUtils.insertAfter(firstSpacer,newSpacer);
		}
	}
};