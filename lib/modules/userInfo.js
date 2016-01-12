addModule('userInfo', function (module, moduleID) { $.extend(true, module, {
	moduleID: 'userInfo',
	moduleName: 'User Info',
	category: ['Users'],
	options: {
		hoverInfo: {
			type: 'boolean',
			value: true,
			description: 'Show information on user (karma, how long they\'ve been a redditor) on hover.'
		},
		useQuickMessage: {
			type: 'boolean',
			value: true,
			description: 'Open the quick message dialog when clicking on the "send message" button in hover info, instead of going straight to reddit\'s message page.',
			dependsOn: 'hoverInfo'
		},
		hoverDelay: {
			type: 'text',
			value: 800,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		fadeSpeed: {
			type: 'text',
			value: 0.7,
			description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		gildComments: {
			type: 'boolean',
			value: true,
			description: 'When clicking the "give gold" button on the user hover info on a comment, give gold to the comment.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		highlightButton: {
			type: 'boolean',
			value: true,
			description: 'Show "highlight" button in user hover info, for distinguishing posts/comments from particular users.',
			advanced: true,
			dependsOn: 'hoverInfo'
		},
		highlightColor: {
			type: 'color',
			value: '#5544CC',
			description: 'Color used to highlight a selected user, when "highlighted" from hover info.',
			advanced: true,
			dependsOn: 'highlightButton'
		},
		highlightColorHover: {
			type: 'color',
			value: '#6677AA',
			description: 'Color used to highlight a selected user on hover.',
			advanced: true,
			dependsOn: 'highlightButton'
		},
		USDateFormat: {
			type: 'boolean',
			value: false,
			description: 'Show date (redditor since...) in US format (i.e. 08-31-2010)',
			advanced: true,
			dependsOn: 'hoverInfo'
		}
	},
	description: 'Adds a hover tooltip to users',
	go: function() {
		if ((module.isEnabled()) && (module.isMatchURL())) {
			// create a cache for user data so we only load it once even if the hover is triggered many times
			module.userInfoCache = [];

			if (module.options.hoverInfo.value) {
				// get user links and add event listeners...
				$(document.body).on('mouseover', modules['userTagger'].usernameSelector, module.handleMouseOver);
			}

			addCSS();
		}
	},
	handleMouseOver: function(e) {
		if (!modules['userTagger'].usernameRE.test(e.target.href)) return;
		modules['hover'].infocard(moduleID)
			.target(e.target)
			.options({
				width: 475,
				openDelay: module.options.hoverDelay.value,
				fadeDelay: module.options.fadeDelay.value,
				fadeSpeed: module.options.fadeSpeed.value
			})
			.populateWith(module.showUserInfo.bind(module))
			.begin();
	},
	showUserInfo: function(def, obj, context) {
		var test = obj.href.match(modules['userTagger'].usernameRE),
			thisUserName,
			nameLowerCase,
			throbber = '<span class="RESThrobber"></span>';

		if (test) {
			thisUserName = test[1];
			nameLowerCase = thisUserName.toLowerCase();
		}

		module.lastOpenedAuthorLink = obj;

		// Get the logged in user's ID and store it on first run.
		if (!module.loggedInID) {
			// Clear the author's cache so the friend button will have both
			// author and logged in user's ID.
			RESUtils.cache.expire({endpoint: '/user/' + nameLowerCase + '/about.json'});
			RESUtils.getUserInfo(function (me) {
				module.loggedInID = me.data.id;
			});
		}
		def.notify(thisUserName, throbber);

		RESUtils.cache.fetch({
			method: 'GET',
			endpoint: '/user/' + nameLowerCase + '/about.json',
			callback: module.renderAuthorInfo.bind(module, def, obj)
		});
	},
	hideAuthorInfo: function() {
		modules['hover'].infocard('userInfo').close();
	},
	renderAuthorInfo: function(def, authorLink, data) {
		if (!(data && data.data)) {
			def.resolve(undefined, 'User not found');
			return false;
		}
		data = data.data;
		var userTaggerEnabled = (modules['userTagger'].isEnabled()) && (modules['userTagger'].isMatchURL());
		var utctime = data.created_utc;
		var d = new Date(utctime * 1000);
		var friendButton;
		var myID = 't2_' + module.loggedInID;
		data.name = data.name.toLowerCase();

		var header = $('<div />');
		header.append('<a href="/user/' + escapeHTML(data.name) + '">/u/' + escapeHTML(data.name) + '</a> (<a href="/user/' + escapeHTML(data.name) + '/submitted/">Links</a>) (<a href="/user/' + escapeHTML(data.name) + '/comments/">Comments</a>)');

		// Add friend button to header.
		if (data.is_friend) {
			friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\'' + data.name + '\', \'' + myID + '\', \'friend\'), friend(\'' + data.name + '\', \'' + myID + '\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
		} else {
			friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\'' + data.name + '\', \'' + myID + '\', \'friend\'), unfriend(\'' + data.name + '\', \'' + myID + '\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
		}
		header.append(friendButton);
		header.find('.toggle').click(function (e) {
			if (e.target.tagName !== 'A') return;
			// The cache is now outdated, so expire it.
			RESUtils.cache.expire({endpoint: '/user/' + data.name + '/about.json'});
		});

		def.notify(header, 'Getting friend button...');

		// var userHTML = '<a class="hoverAuthor" href="/user/'+data.name+'">'+data.name+'</a>:';
		var userHTML = '<div class="authorFieldPair"><div class="authorLabel">Redditor since:</div> <div class="authorDetail">' + RESUtils.niceDate(d, module.options.USDateFormat.value) + ' (' + RESUtils.niceDateDiff(d) + ')</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + escapeHTML(data.link_karma) + '</div></div>';
		userHTML += '<div class="authorFieldPair"><div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + escapeHTML(data.comment_karma) + '</div></div>';
		if (modules['userTagger'].tags && modules['userTagger'].tags[data.name] && modules['userTagger'].tags[data.name].link) {
			var links = modules['userTagger'].tags[data.name].link.split(/\s/).reduce(function(pre, cur) {
				return pre + '<a target="_blank" href="' + escapeHTML(cur) + '">' + escapeHTML(cur).replace(/^https?:\/\/(www\.)?/, '') + '</a>';
			}, '');
			userHTML += '<div class="authorFieldPair"><div class="authorLabel">Link:</div> <div class="authorDetail">' + links + '</div></div>';
		}
		userHTML += '<div class="clear"></div><div class="bottomButtons">';
		userHTML += '<a target="_blank" class="blueButton composeButton" href="/message/compose/?to=' + escapeHTML(data.name) + '"><img src="https://redditstatic.s3.amazonaws.com/mailgray.png"> send message</a>';
		if (data.is_gold) {
			userHTML += '<a target="_blank" class="blueButton" href="/gold/about">User has Reddit Gold</a>';
		} else {
			userHTML += '<a target="_blank" id="gildUser" class="blueButton" href="/gold?goldtype=gift&recipient=' + escapeHTML(data.name) + '">Gift Reddit Gold</a>';
		}

		if (module.options.highlightButton.value) {
			if (!module.highlightedUsers || !module.highlightedUsers[data.id]) {
				userHTML += '<div class="blueButton" id="highlightUser" userid="' + escapeHTML(data.id) + '">Highlight</div>';
			} else {
				userHTML += '<div class="redButton" id="highlightUser" userid="' + escapeHTML(data.id) + '">Unhighlight</div>';
			}
		}

		if (userTaggerEnabled && (modules['userTagger'].tags && modules['userTagger'].tags[data.name]) && (modules['userTagger'].tags[data.name].ignore)) {
			userHTML += '<div class="redButton" id="ignoreUser" user="' + escapeHTML(data.name) + '">&empty; Unignore</div>';
		} else {
			userHTML += '<div class="blueButton" id="ignoreUser" user="' + escapeHTML(data.name) + '">&empty; Ignore</div>';
		}
		userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
		var body = $('<div id="authorInfoToolTip" />').append(userHTML);
		def.resolve(null, body);

		if (userTaggerEnabled) {
			var ignoreButton = body.find('#ignoreUser');
			ignoreButton.on('click', module.ignoreUser.bind(module));
		}
		if (module.options.highlightButton.value) {
			module.authorInfoToolTipHighlight = body.find('#highlightUser');
			module.authorInfoToolTipHighlight.on('click', function(e) {
				var userid = e.target.getAttribute('userid');
				module.toggleUserHighlight(userid);
			});
		}
		if (module.options.gildComments.value && RESUtils.pageType() === 'comments') {
			var giveGold = body.find('#gildUser');
			giveGold.on('click', function(e) {
				if (e.ctrlKey || e.cmdKey || e.shiftKey) {
					return;
				}

				var comment = $(authorLink).closest('.comment');
				if (!comment) {
					return;
				}

				module.hideAuthorInfo();
				var giveGold = comment.find('.give-gold')[0];
				RESUtils.click(giveGold);
				e.preventDefault();
			});
		}

		if (module.options.useQuickMessage.value && modules['quickMessage'].isEnabled()) {
			var composeButton = body.find('a.composeButton');
			composeButton.on('click', function(e) {
				if (e.which === 1) {
					e.preventDefault();

					var entryUrl;
					if (modules['quickMessage'].options.linkToCurrentPage.value) {
						var permalink = $(module.lastOpenedAuthorLink).closest('.entry').find('a.bylink');
						if (permalink.length) {
							entryUrl = permalink[0].href;
							if (entryUrl.indexOf('?context=') === -1) {
								entryUrl += '?context=10';
							}
						}
					}

					modules['quickMessage'].openQuickMessageDialog({
						to: escapeHTML(data.name),
						body: entryUrl
					});
					module.hideAuthorInfo();
				}
			});
		}
	},
	toggleUserHighlight: function(userid) {
		if (!module.highlightedUsers) {
			module.highlightedUsers = {};
		}
		if (module.highlightedUsers[userid]) {
			module.highlightedUsers[userid].remove();
			delete module.highlightedUsers[userid];
			module.toggleUserHighlightButton(true);
			if(modules['commentNavigator'].isEnabled() && modules['commentNavigator'].isMatchURL() && modules['commentNavigator'].options.openOnHighlightUser.value) {
				modules['commentNavigator'].getPostsByCategory(); // refresh informations
			}
		} else {
			module.highlightedUsers[userid] = modules['userHighlight'].highlightUser(userid);
			module.toggleUserHighlightButton(false);
			if(modules['commentNavigator'].isEnabled() && modules['commentNavigator'].isMatchURL() && modules['commentNavigator'].options.openOnHighlightUser.value) {
				modules['commentNavigator'].showNavigator('highlighted');
			}
		}
	},
	toggleUserHighlightButton: function(canHighlight) {
		module.authorInfoToolTipHighlight
			.toggleClass('blueButton', canHighlight)
			.toggleClass('redButton', !canHighlight)
			.text(canHighlight ? 'Highlight' : 'Unhighlight');
	},
	ignoreUser: function(e) {
		var thisIgnore, thisName;

		if (e.target.classList.contains('blueButton')) {
			e.target.classList.remove('blueButton');
			e.target.classList.add('redButton');
			$(e.target).html('&empty; Unignore');
			thisIgnore = true;
		} else {
			e.target.classList.remove('redButton');
			e.target.classList.add('blueButton');
			$(e.target).html('&empty; Ignore');
			thisIgnore = false;
		}
		thisName = e.target.getAttribute('user');
		modules['userTagger'].ignoreUser(thisName, thisIgnore);
	}
});

	function addCSS() {
		var css = '';
		css += '#authorInfoToolTip .authorFieldPair { clear: both; overflow: auto; margin-bottom: 12px; }';
		css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; }';
		css += '#authorInfoToolTip .authorDetail { float: left; min-width: 240px; }';
		css += '#authorInfoToolTip .authorDetail a { display: block; max-width: 25em; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }';
		css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; margin-top: 12px; }';
		css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; }';

		RESUtils.addCSS(css);
	}
});
