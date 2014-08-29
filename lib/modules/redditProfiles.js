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
		// /^http:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+/i
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (RESUtils.pageType() == 'profile') {
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
			} else if ($('.listing-chooser').length) {
				if (location.pathname === '/me/m/profile') {
					var thisCache = RESStorage.getItem('RESmodules.redditProfiles.cache');
					if (thisCache == null) {
						thisCache = '{}';
					}
					this.profileCache = safeJSON.parse(thisCache);
					if (this.profileCache == null) this.profileCache = {};
					$('body').removeClass('with-listing-chooser');
					RESUtils.addCSS('.listing-chooser, .tabmenu li, #siteTable, .side > .spacer, .multi-add-notice { display: none; }');
					RESUtils.addCSS('.multi-add-notice { display: none !important; }');
					RESUtils.addCSS('.side { float:none; width:inherit; }');
					RESUtils.addCSS('.multi-details > * { display: none; }');
					RESUtils.addCSS('.multi-details > .settings, .multi-details > .description { display: block; }');
					RESUtils.addCSS('.profile-option { padding: 5px 8px; margin: 0px 10px 20px 25px !important; border: 1px solid #CCC; border-radius: 10px; }');
					RESUtils.addCSS('.profile-option-title { display: block; margin-left: 15px; }');
					$('.spacer .multi-details').closest('.spacer').css('display', 'block');
					$('.multi-details > .settings, .multi-details > .description').addClass('profile-option');
					
					$('.multi-details > .settings').before('<h2 class="profile-option-title">Profile Config</h2>');
					$('.visibility-group label:eq(0)')[0].childNodes[1].nodeValue='disable';
					$('.visibility-group label:eq(1)')[0].childNodes[1].nodeValue='enable';
					RESUtils.addCSS('.multi-details > .settings .show-copy, .multi-details > .settings .show-rename { display: none; }');
					$('.multi-details > .settings .delete button').text('delete profile');
					$('.multi-details > .settings .delete button').on('click', '.yes', function() {
						modules['redditProfiles'].profileCache[RESUtils.loggedInUser().toLowerCase()] = {
							p: null,
							t: parseInt(Date.now() / 900000, 10)
						};
						RESStorage.setItem('RESmodules.redditProfiles.cache', JSON.stringify(modules['redditProfiles'].profileCache));
						setTimeout(function() { // correct reddit bug => nothing happend after deleting a multireddit
							location.replace('/');
						}, 5000);
					});

					
					$('.multi-details > .description').before('<h2 class="profile-option-title">Profile content</h2>');
					RESUtils.addCSS('.multi-details > .description .share-in-sr { display: none; }');
					RESUtils.addCSS('.multi-details > .description .usertext-edit, .multi-details > .description textarea { width: 400px !important; }');
					$('.multi-details > .description .edit-description').text('edit');
					$('.multi-details > .description  .usertext-edit').prepend('<div class="preview"><div class="md"></div></div>');
					var converter = window.SnuOwnd.getParser();
					$('.multi-details > .description textarea').on('keyup', function() {
						var profile_html = converter.render($(this).val());
						$('.multi-details > .description .preview .md').html(profile_html);
					});
					$('.multi-details > .description .usertext-buttons .save').click(function(){
						modules['redditProfiles'].profileCache[RESUtils.loggedInUser().toLowerCase()] = {
							p: $('.multi-details > .description textarea').val(),
							t: parseInt(Date.now() / 900000, 10)
						};
						RESStorage.setItem('RESmodules.redditProfiles.cache', JSON.stringify(modules['redditProfiles'].profileCache));
					});
				} else {
				$('.listing-chooser .multis a[href$="/profile"]').closest('li').css('display', 'none')
				}
			}
		}
	},
	getProfile: function(username) {
		if ($('#side-multi-list a[href$="/profile"]').length || username === RESUtils.loggedInUser().toLowerCase()) { // check if the user have a "profile" multireddit
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
		RESUtils.addCSS('.profile-area .helplink { float: right; margin-top: 7px; } .profile-area .edit-profile { margin-right: 140px; font-weight:bold; }');
		if ($('#side-multi-list li').length === 1) {
			$('#side-multi-list').closest('div.spacer').css('display', 'none'); // the user only have profile as multireddit, we hide the multireddit section
		} else {
			$('#side-multi-list a[href$="/profile"]').css('display', 'none'); // hide the profile multireddit
		}
		if (profileObject.p !== null || username === RESUtils.loggedInUser().toLowerCase()) {
			var firstSpacer = document.querySelector('div.side > div.spacer');
			var newSpacer = document.createElement('div');
			var profileHTML = '<div class="profile-area"><a class="helplink" target="_blank" href="/r/Enhancement/wiki/profiles">what\'s this?</a>';
			if (username === RESUtils.loggedInUser().toLowerCase()) {
				profileHTML += '<a class="helplink edit-profile" href="/me/m/profile">edit</a>';
			}
			profileHTML += '<h1>profile</h1><div class="content">';
			
			if (profileObject.p !== null) {
				var converter = window.SnuOwnd.getParser();
				profileBody = converter.render(profileObject.p);
			} else { // we are on our user page but haven't set our profile yet
				profileBody = 'You haven\'t set your profile yet.<br />You can <a class="create-profile" href="#">create</a> it now if you want.';
			}

			profileHTML += profileBody + '</div></div>';
			$(newSpacer).html(profileHTML);
			$(newSpacer).addClass('spacer');
			RESUtils.insertAfter(firstSpacer,newSpacer);
			if (profileObject.p === null) {
				$('.create-profile').click(function(){
					BrowserStrategy.ajax({
						method: 'POST',
						url: location.protocol + 'api.reddit.com/api/multi/user/'+username+'/m/profile',
						/*
						data: {
							model:{"path":"/user/matheod/m/profile","visibility":"public","subreddits":[]},
							uh: RESUtils.loggedInUserHash()
						},
						*/
						data: 'model=' + encodeURIComponent('{"path":"/user/matheod/m/profile","visibility":"public","subreddits":[]}') + '&uh=' + RESUtils.loggedInUserHash(),
						onload: function(response) {
							modules['redditProfiles'].profileCache[RESUtils.loggedInUser().toLowerCase()] = {
								p: '',
								t: parseInt(Date.now() / 900000, 10)
							};
							RESStorage.setItem('RESmodules.redditProfiles.cache', JSON.stringify(modules['redditProfiles'].profileCache))
							location.replace('/me/m/profile');
						}
					});
					return false;
				});
			}
		}
	}
};