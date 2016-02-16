addModule('filteReddit', {
	moduleID: 'filteReddit',
	moduleName: 'filteReddit',
	category: ['Subreddits', 'Submissions'],
	options: {
		// any configurable options you have go here...
		// options must have a type and a value..
		// valid types are: text, boolean (if boolean, value must be true or false)
		// for example:
		NSFWfilter: {
			type: 'boolean',
			value: false,
			description: 'Filters all links labelled NSFW'
		},
		notificationThreshold: {
			type: 'text',
			value: '80',
			description: 'If more than this percentage (0-100) of a page is filtered, show a notification',
			advanced: true
		},
		NSFWQuickToggle: {
			type: 'boolean',
			value: true,
			description: 'Add a quick NSFW on/off toggle to the gear menu',
			advanced: true
		},
		excludeCommentsPage: {
			type: 'boolean',
			value: true,
			description: 'When visiting the comments page for a filtered link, allow the link/expando to be shown'
		},
		excludeModqueue: {
			type: 'boolean',
			value: true,
			description: 'Don\'t filter anything on modqueue pages (modqueue, reports, spam)'
		},
		excludeUserPages: {
			type: 'boolean',
			value: false,
			description: 'Don\'t filter anything on users\' profile pages'
		},
		regexpFilters: {
			type: 'boolean',
			value: true,
			advanced: true,
			description: 'Allow RegExp in certain filteReddit fields.' +
				'<br>If you have filters which start with <code>/</code> and don\'t know what RegExp is, you should turn this option off.' +
				'<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		keywords: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits'
				},
				{
					name: 'unlessKeyword',
					type: 'text'
				},
				 //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Hide posts with certain keywords in the title.' +
				'\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).' +
				'\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}],
			value: [],
			description: 'Hide posts submitted to certain subreddits.' +
				'\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.' +
				'\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		filterSubredditsFrom: {
			type: 'enum',
			value: 'everywhere-except-subreddit',
			values: [{
				name: 'Everywhere except inside a subreddit',
				value: 'everywhere-except-subreddit'
			}, {
				name: 'Everywhere',
				value: 'everywhere'
			}, {
				name: '/r/all and domain pages',
				value: 'legacy',
			}, ]
		},
		domains: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits'
				}
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Hide posts that link to certain domains.' +
				'\n\n<br><br>Caution: domain keywords like "reddit" would ignore "reddit.com" and "fooredditbar.com".' +
				'\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for domain.' +
				'\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		flair: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'keyword',
					type: 'text'
				}, {
					name: 'applyTo',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'Everywhere but:',
						value: 'exclude'
					}, {
						name: 'Only on:',
						value: 'include'
					}],
					value: 'everywhere',
					description: 'Apply filter to:'
				},
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits'
				}
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Hide in posts where certain keywords are in the post\'s link flair' +
				'\n\n<br><br>RegExp like <code>/(this|that|theother)/i</code> is allowed for flair.' +
				'\n\n<br>Find out more on the <a href="/r/Enhancement/wiki/index/filters/filtereddit/regexp">/r/Enhancement wiki</a>.'
		},
		allowNSFW: {
			type: 'table',
			addRowText: '+add subreddits',
			description: 'Don\'t hide NSFW posts from certain subreddits when the NSFW filter is turned on.',
			fields: [
				{
					name: 'subreddits',
					type: 'list',
					listType: 'subreddits'
				},
				{
					name: 'where',
					type: 'enum',
					values: [{
						name: 'Everywhere',
						value: 'everywhere'
					}, {
						name: 'When browsing subreddit/multi-subreddit',
						value: 'visit'
					}],
					value: 'everywhere'
				}
			]
		},
		customFilters: {
			type: 'builder',
			advanced: true, //VERY
			description: 'Hide posts based on complex custom criteria. <p>This is a very advanced feature, please <a href="http://www.reddit.com/r/Enhancement/wiki/customfilters">read the guide</a> before asking questions.  <p style="font-weight: bold; font-size: 16pt;">This feature is currently in beta. Filters may break in future RES updates.</p>',
			value: [],
			addItemText: '+add custom filter',
			defaultTemplate: function() {
				return {
					note: '', ver: 1,
					body: {type: 'group', op: 'all', of: [
						// empty
				]}};
			},
			cases: {
				group: {
					name: 'Group of conditions',
					defaultTemplate: function(op, of) {
						return {
							type: 'group',
							op: (op || 'all'),
							of: (of || [])
						};
					},
					fields: [
						{type: 'select', options: ['all', 'any', 'one', 'none'], id: 'op'},
						' of these are true:',
						{type: 'multi', include: 'all', id: 'of'}
					],
					evaluate: function(thing, data, config) {
						if (data.op === 'all') {
							return data.of.every(function(condition) {
								return config[condition.type].evaluate(thing, condition, config);
							});
						} else if (data.op === 'any') {
							return data.of.some(function(condition) {
								return config[condition.type].evaluate(thing, condition, config);
							});
						} else if (data.op === 'one') {
							var seenTrue = false;
							for (var i = 0; i < data.of.length; i++) {
								var condition = data.of[i];
								var result = config[condition.type].evaluate(thing, condition, config);
								if (result) {
									if (seenTrue) return false;
									seenTrue = true;
								}

								return seenTrue;
							}
						} else if (data.op === 'none') {
							return data.of.every(function(condition) {
								return !config[condition.type].evaluate(thing, condition, config);
							});
						} else {
							throw new RangeError('Illegal group operator: "' + data.op + '"');
						}
					}
				},
				score: {
					name: 'Score',
					defaultTemplate: function(op, val) {
						return {
							type: 'score',
							op: (op || '>'),
							val: (val || 0)
						};
					},
					fields: [
						'post has ',
						{type: 'select', options: 'COMPARISON', id: 'op'},
						' ',
						{type: 'number', id: 'val'},
						'points'
					],
					evaluate: function(thing, data, config) {
						var score = thing.getScore();
						if (typeof score === 'undefined') {
							return false;
						}

						return modules.settingsConsole.numericalCompare(data.op, score, data.val);
					}
				},
				subreddit: {
					name: 'Subreddit',
					defaultTemplate: function(patt) {
						return {type: 'subreddit', patt: patt || ''};
					},
					fields: [
						'posted in /r/', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var subreddit = thing.getSubreddit();
						if (!subreddit) {
							return false;
						}
						var pattern = new RegExp('^('+data.patt+')$', 'i');
						return pattern.test(subreddit.trim());
					}
				},
				username: {
					name: 'Username',
					defaultTemplate: function(patt) {
						return {type: 'username', patt: patt || ''};
					},
					fields: [
						'posted by /u/', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var user  = thing.getAuthor();
						if (!user) {
							return false;
						}
						var pattern = new RegExp('^('+data.patt+')$', 'i');
						return pattern.test(user);
					}
				},
				commentCount: {
					name: 'Comment count',
					defaultTemplate: function(op, val) {
						return {type: 'commentCount', op: op || '>', val: val || 0};
					},
					fields:[
						'post has ',
						{type: 'select', options: 'COMPARISON', id: 'op'},
						' ',
						{type: 'number', id: 'val'},
						' comments'
					],
					evaluate: function(thing, data, config) {
						var commentCount = thing.getCommentCount();
						if (typeof commentCount !=='number') {
							return false;
						}
						return modules.settingsConsole.numericalCompare(data.op, commentCount, data.val);
					}
				},
				userAttr: {
					name: 'User attribute (friend/mod/etc...)',
					defaultTemplate: function(cat) {
						return {type: 'userAttr', attr: cat || 'friend'};
					},
					fields: [
						'user is ',
						{type: 'select', id: 'attr', options: [
							['a friend', 'friend'],
							['a moderator', 'moderator'],
							['an admin', 'admin'],
							// ['op', 'submitter]',
							'me'
						]}
					],
					evaluate: function(thing, data, config) {
						if (data.attr === 'me') {
							//No standard marker for my own posts so compare against the logged in user
							var myName = RESUtils.loggedInUser();
							if (!myName) {
								return false;
							}
							var author = thing.getAuthor().toLowerCase();
							myName = myName.trim().toLowerCase();

							return author === myName;
						} else {
							//The other cases have hardcoded class names
							var element = thing.getAuthorElement();
							return element.classList.contains(data.attr);
						}
					}
				},
				domain: {
					name: 'Link domain name',
					defaultTemplate: function(dom) {
						return {type: 'domain', patt: dom || ''};
					},
					fields: [
						'post links to the domain ',
						{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var domain = thing.getPostDomain();
						if (!domain) {
							return false;
						}
						var pattern = new RegExp('^(' + data.patt + ')$', 'i');
						return pattern.test(domain);
					}
				},
				dow: {
					name: 'Day of week',
					defaultTemplate: function(dom) {
						return {type: 'dow', days: []};
					},
					fields: [
						'current day of the week is ',
						{
							type: 'checkset', id: 'days',
							//Uses same 3 letter names as
							//.toLocaleDateString('en-US', {weekday: 'short'}))
							items: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
						}
					],
					evaluate: function(thing, data, config) {
						//duplicating because I was having issues with accessing a variable before it was assigned
						var dayList = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',');
						//Get 3 letter name
						var currentDOW = dayList[new Date().getDay()];

						//At the time of writing Safari doesn't support the toLocaleDateString
						// var currentDOW = new Date().toLocaleDateString('en-US', {weekday: 'short'});
						return data.days.indexOf(currentDOW) !== -1;
					}
				},
				linkFlair: {
					name: 'Link flair',
					defaultTemplate: function(patt) {
						return {type: 'linkFlair', patt: patt || ''};
					},
					fields: [
						'post has link flair matching ',
						{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var text = thing.getPostFlairText();
						if (!text) {
							return false;
						}
						var pattern = new RegExp('^(' + data.patt + ')$', 'i');
						return pattern.test(text.trim());
					}
				},
				userFlair: {
					name: 'User flair',
					defaultTemplate: function(patt) {
						return {type: 'userFlair', patt: patt || ''};
					},
					fields: [
						'author of this post has flair matching ',
						{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var text = thing.getUserFlairText();
						if (!text) {
							return false;
						}
						var pattern = new RegExp('^(' + data.patt + ')$', 'i');
						return pattern.test(text);
					}
				},
				postType: {
					name: 'Post type',
					defaultTemplate: function(kind) {
						return {type: 'postType', kind: kind || 'link'};
					},
					fields: [
						'post is a ', {
							//id: 'type' results in a collsion
							type: 'select', id: 'kind',
							options: [
								['link post', 'link'],
								['self post', 'self'],
								// 'comment',
							]
						}, '.'
					],
					evaluate: function(thing, data, config) {
						switch (data.kind) {
							case 'comment': return thing.isComment();
							case 'link':    return thing.isSelfPost();
							case 'self':    return this.isLinkPost();
							default: throw new Error('unknown post type "' + data.kind + '"');
						}
					}
				},
				postTitle: {
					name: 'Post title',
					defaultTemplate: function(patt) {
						return {type: 'postTitle', patt: patt || ''};
					},
					fields: [
						'post\'s title contains ', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var title = thing.getTitle();
						//Do not anchor for this case
						return new RegExp(data.patt, 'i').test(title);
					}
				},
				postAge: {
					name: 'Post age',
					defaultTemplate: function(age) {
						//4 hours in milliseconds
						return {type: 'postAge', age: age || 4*60*60*1000};
					},
					fields: [
						'post is ',
						{type: 'select', id: 'op', options: [
							['more than', '>'],
							['less than', '<']
						]},
						' ', {type: 'duration', id: 'age'}, ' old'
					],
					evaluate: function(thing, data, config) {
						var postTime = thing.getTimestamp();
						if (!postTime) {
							return;
						}
						var now = new Date();
						return modules.settingsConsole.numericalCompare(data.op, now-postTime, data.age);
					}
				},
				currentSub: {
					name: 'When browsing a subreddit',
					defaultTemplate: function(patt) {
						return {type: 'currentSub', patt: patt || ''};
					},
					fields: [
						'when browsing /r/',
						{type: 'text', id: 'patt', validator: RegExp},
					],
					evaluate: function(thing, data, config) {
						var sub = RESUtils.currentSubreddit();
						if (sub === null) return false;
						return new RegExp('^(' + data.patt + ')$', 'i').test(sub);
					}
				},
				currentUserProfile: {
					name: 'When browsing a user profile',
					defaultTemplate: function(patt) {
						return {type: 'currentUserProfile', patt: patt || ''};
					},
					fields: [
						'when browsing /u/',
						{type: 'text', id: 'patt', validator: RegExp},
						'\'s posts',
					],
					evaluate: function(thing, data, config) {
						var user = RESUtils.currentUserProfile();
						if (user === null) return false;
						return new RegExp('^(' + data.patt + ')$', 'i').test(user);
					}
				},
				currentMulti: {
					name: 'When browsing a multireddit',
					defaultTemplate: function(user, name) {
						return {type: 'currentMulti', user: user || '', name: name || ''};
					},
					fields: [
						'when browsing /u/',
						{type: 'text', id: 'user', validator: RegExp},
						'/m/',
						{type: 'text', id: 'name', validator: RegExp},
					],
					evaluate: function(thing, data, config) {
						var parts = /^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i
							.exec(RESUtils.currentMultireddit());
						if (parts === null) return false;
						var multiNameRE = data.name.trim() === '' ? /.*/ : new RegExp('^(' + data.name + ')$', 'i');
						var user = parts[1], multi = parts[2];
						if (user === 'me' && data.name.trim() === 'me') {
							return multiNameRE.test(multi);
						} else {
							return (data.user.trim() === '' ? /.*/ : new RegExp('^(' + data.user + ')$', 'i')).test(user) && multiNameRE.test(multi);
						}
					}
				},
				browsingFrontPage: {
					name: 'Browsing the front page',
					defaultTemplate: function() {
						return {type: 'browsingFrontPage'};
					},
					fields: [
						'when browsing the front page',
					],
					evaluate: function(thing, data, config) {
						return RESUtils.pageType() === 'linklist' &&
						    RESUtils.currentSubreddit() === null &&
						    RESUtils.currentMultireddit() === null &&
						    RESUtils.currentUserProfile() === null;
					}
				},
				isNSFW: {
					name: 'NSFW post',
					defaultTemplate: function() {
						return {type: 'isNSFW'};
					},
					fields: [
						'post is marked NSFW',
					],
					evaluate: function(thing, data, config) {
						return thing.classList.contains('over18');
					}
				},
				toggle: {
					name: 'Custom toggle',
					defaultTemplate: function() {
						var toggleName = '';
						var toggles = modules['customToggles'].options.toggle.value;
						if (toggles && toggles.length === 1) {
							toggleName = toggles[0][0];
						}

						return {
							type: 'toggle',
							toggleName: toggleName
						};
					},
					fields: [
						'custom toggle named',
						{type: 'text', id: 'toggleName', validator: RegExp},
						'is turned on'
					],
					evaluate: function(thing, data, config) {
						var toggleName = data.toggleName;
						return modules['customToggles'].toggleActive(toggleName);
					}
				}
				/*
				possible for later:

				res tag
				res score
				up/down/unvoted
				sort
				//*/
			}
		}
	},
	description: 'Filter out NSFW content, or links by keyword, domain (use User Tagger to ignore by user) or subreddit (for /r/all or /domain/*).',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'linklist',
		'profile',
		'comments',
		'search'
	],
	exclude: [
		// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		// /^https?:\/\/(?:[-\w\.]+\.)?reddit\.com\/comments\/[-\w\.]+/i
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/over18.*/i
	],
	excludeSaved: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/user\/[\w]+\/saved/i,
	excludeModqueue: /^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\-\w\.]+\/about\/(?:modqueue|reports|spam)\/?/i,
	isMatchURL: function() {
		if (
			this.options.excludeModqueue.value && this.excludeModqueue.test(location.href) ||
			this.options.excludeUserPages.value && RESUtils.pageType() === 'profile'
		) {
			return false;
		}

		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if (this.isEnabled()) {
			RESUtils.addCSS('.RESFiltered { display: none !important; }');
			if (this.options.NSFWfilter.value && this.isEnabled() && this.isMatchURL()) {
				this.addNSFWFilterStyle();
			}
		}
	},
	go: function() {
		// shh I'm cheating. This runs the toggle on every single page, bypassing isMatchURL.
		if ((this.isEnabled()) && (this.options.NSFWQuickToggle.value)) {
			var thisFrag = document.createDocumentFragment(),
				toggleOn, toggleOff;

			toggleOn = RESUtils.createElement('span', null, 'toggleOn', 'on');
			toggleOff = RESUtils.createElement('span', null, 'toggleOff', 'off');
			this.nsfwSwitch = document.createElement('div');
			this.nsfwSwitch.setAttribute('title', 'Toggle NSFW Filter');
			var onClickSwitch = function(e) {
				e.preventDefault();
				modules['filteReddit'].toggleNsfwFilter();
			};
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = RESUtils.createElement('div', 'nsfwSwitchToggle', 'toggleButton');
			this.nsfwSwitchToggle.appendChild(toggleOn);
			this.nsfwSwitchToggle.appendChild(toggleOff);
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			if (this.options.NSFWfilter.value) {
				this.nsfwSwitchToggle.classList.add('enabled');
			} else {
				this.nsfwSwitchToggle.classList.remove('enabled');
			}
			thisFrag.appendChild(this.nsfwSwitch);
			modules['RESMenu'].addMenuItem(this.nsfwSwitch, onClickSwitch);
		}

		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.scanEntries();
			RESUtils.watchForElement('siteTable', modules['filteReddit'].scanEntries);

			modules['commandLine'].registerCommand('nsfw', 'nsfw [on|off] - toggle nsfw filter on/off',
				function(command, val, match) {
					return 'Toggle nsfw filter on or off';
				}, function(command, val, match, e) {
					var toggle;
					switch (val && val.toLowerCase()) {
						case 'on':
							toggle = true;
							break;
						case 'off':
							toggle = false;
							break;
						default:
							return 'nsfw on &nbsp; or &nbsp; nsfw off ?';
					}
					modules['filteReddit'].toggleNsfwFilter(toggle, true);
				}
			);
		}
	},
	toggleNsfwFilter: function(toggle, notify) {
		if (toggle === false || modules['filteReddit'].options.NSFWfilter.value) {
			modules['filteReddit'].filterNSFW(false);
			RESUtils.options.setOption('filteReddit', 'NSFWfilter', false);
			$(modules['filteReddit'].nsfwSwitchToggle).removeClass('enabled');
		} else {
			modules['filteReddit'].filterNSFW(true);
			RESUtils.options.setOption('filteReddit', 'NSFWfilter', true);
			$(modules['filteReddit'].nsfwSwitchToggle).addClass('enabled');
		}

		if (notify) {
			var onOff = modules['filteReddit'].options.NSFWfilter.value ? 'on' : ' off';

			modules['notifications'].showNotification({
				header: 'NSFW Filter',
				moduleID: 'filteReddit',
				optionKey: 'NSFWfilter',
				message: 'NSFW Filter has been turned ' + onOff + '.'
			}, 4000);
		}
	},
	scanEntries: function(ele) {
		if (modules['filteReddit'].options.excludeCommentsPage.value && RESUtils.isPageType('comments')) {
			return;
		}
		var numFiltered = 0;
		var numNsfwHidden = 0;

		var things = RESUtils.things(ele);

		// var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
		// var onRALL = RALLre.exec(location.href);
		var filterSubs = (modules['filteReddit'].options.filterSubredditsFrom.value === 'everywhere') ||
			(modules['filteReddit'].options.filterSubredditsFrom.value === 'everywhere-except-subreddit' && !RESUtils.currentSubreddit()) ||
			(RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain()) || (RESUtils.currentMultireddit('me/f/all')),
			onSavedPage = modules['filteReddit'].excludeSaved.test && modules['filteReddit'].excludeSaved.test(location.href);

		things.forEach(function(thing) {
			var currSub, postTitle, postDomain, postSubreddit, postFlair;
			var filtered;
			if (thing.isPost() && !onSavedPage) {
				postTitle = thing.getTitle();
				postDomain = thing.getPostDomain();
				postFlair = thing.getPostFlairText();

				filtered = modules['filteReddit'].executeCustomFilters(thing);

				currSub = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : null;
				postSubreddit = thing.getSubreddit() || currSub;
				if (!filtered) filtered = modules['filteReddit'].filterTitle(postTitle, postSubreddit);
				if (!filtered) filtered = modules['filteReddit'].filterDomain(postDomain, postSubreddit || currSub);
				if ((!filtered) && (filterSubs) && (postSubreddit)) {
					filtered = modules['filteReddit'].filterSubreddit(postSubreddit);
				}
				if ((!filtered) && (postFlair)) {
					filtered = modules['filteReddit'].filterFlair(postFlair, postSubreddit);
				}
				if (filtered) {
					thing.element.classList.add('RESFiltered');
					numFiltered++;
				}
			}

			if (thing.isNSFW()) {
				if (modules['filteReddit'].allowNSFW(postSubreddit, currSub)) {
					thing.entry.classList.add('allowOver18');
				} else if (modules['filteReddit'].options.NSFWfilter.value) {
					if (!thing.element.classList.contains('over18')) {
						// backfill for new post layout
						thing.element.classList.add('over18');
					}
					numNsfwHidden++;
				}
			}
		});

		var notificationThreshold = parseInt(modules['filteReddit'].options.notificationThreshold.value, 10);
		if (typeof notificationThreshold !== 'number' || isNaN(notificationThreshold)) {
			notificationThreshold = modules['filteReddit'].options.notificationThreshold.default;
		}
		notificationThreshold = Math.max(0, Math.min(notificationThreshold, 110)); // so users can go the extra 10% to avoid notifications completely
		notificationThreshold /= 100;

		var percentageHidden = (numFiltered + numNsfwHidden) / things.length;
		if (things.length && percentageHidden >= notificationThreshold) {
			var notification = [];
			if (!percentageHidden) notification.push('No posts were filtered.');
			if (numFiltered) notification.push(numFiltered + ' post(s) hidden by ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'keywords', 'custom filters') + '.');
			if (numNsfwHidden) notification.push(numNsfwHidden + ' post(s) hidden by the ' + modules['settingsNavigation'].makeUrlHashLink('filteReddit', 'NSFWfilter', 'NSFW filter') + '.');
			if (numNsfwHidden && modules['filteReddit'].options.NSFWQuickToggle.value) notification.push('You can toggle the nsfw filter in the <span class="gearIcon"></span> menu.');

			notification = notification.join('<br><br>');
			modules['notifications'].showNotification({
				header: 'Posts Filtered',
				moduleID: 'filteReddit',
				message: notification
			});
		}
	},
	addedNSFWFilterStyle: false,
	addNSFWFilterStyle: function() {
		if (this.addedNSFWFilterStyle) return;
		this.addedNSFWFilterStyle = true;

		RESUtils.addCSS('\
			body:not(.allowOver18) .thing.over18:not(.allowOver18),	\
			body:not(.allowOver18) .search-result.over18:not(.allowOver18) {	\
				display: none !important; 	\
			}');
	},
	filterNSFW: function(filterOn) {
		this.addNSFWFilterStyle();
		$(document.body).toggleClass('allowOver18');
	},
	filterTitle: function(title, reddit) {
		reddit = reddit ? reddit.toLowerCase() : null;
		return this.filtersMatchString('keywords', title.toLowerCase(), reddit);
	},
	filterDomain: function(domain, reddit) {
		domain = domain ? domain.toLowerCase() : null;
		reddit = reddit ? reddit.toLowerCase() : null;
		return this.filtersMatchString('domains', domain, reddit);
	},
	filterSubreddit: function(subreddit) {
		// check for /r/ hack from when reddit changed its format and broke RES filters
		if (!this.filterFormatChecked) {
			this.checkFilterFormat();
		}
		return this.filtersMatchString('subreddits', subreddit.toLowerCase(), null, true);
	},
	filterFlair: function(flair, reddit) {
		reddit = reddit ? reddit.toLowerCase() : null;
		return this.filtersMatchString('flair', flair.toLowerCase(), reddit);
	},
	checkFilterFormat: function() {
		var changed = false;

		this.options.subreddits.value.forEach(function(subreddit) {
			var check = subreddit[0];
			if (check.substr(0, 3) === '/r/') {
				subreddit[0] = check.substr(3);
				changed = true;
			}
		});
		if (changed) {
			RESUtils.options.saveModuleOptions('filteReddit');
		}
		this.filterFormatChecked = true;
	},
	_filters: {},
	filters: function(type) {
		var module = modules['filteReddit'];
		var sources = module.options[type].value;
		if (!module._filters[type] || module._filters[type].length !== sources.length) {
			var filters = [];
			module._filters[type] = filters;

			sources.forEach(function(source) {
				var filter = {};
				filters.push(filter);

				if (typeof source !== 'object') {
					source = [ source ];
				}

				var searchString = source[0];
				if (modules['filteReddit'].options.regexpFilters.value && modules['filteReddit'].regexRegex.test(searchString)) {
					var regexp = modules['filteReddit'].regexRegex.exec(searchString);
					try {
						searchString = new RegExp(regexp[1], regexp[2]);
					} catch (e) {
						modules['notifications'].showNotification({
							moduleID: 'filteReddit',
							optionKey: type,
							notificationID: 'badRegexpPattern',
							header: 'filteReddit RegExp issue',
							message: 'There was a problem parsing a RegExp in your filteReddit settings. ' +
								modules['settingsNavigation'].makeUrlHashLink('filteReddit', type, 'Correct it now.') +
								'<p>RegExp: <code>' + RESUtils.sanitizeHTML(searchString) + '</code></p>' +
								'<blockquote>' + e.toString() + '</blockquote>'
						});
					}
				} else {
					searchString = searchString.toString().toLowerCase();
				}
				filter.searchString = searchString;

				var applyTo = source[1] || 'everywhere';
				filter.applyTo = applyTo;

				var applyList = (source[2] || '').toLowerCase().split(',');
				filter.applyList = applyList;

				var exceptSearchString = source[3] && source[3].toString().toLowerCase() || '';
				filter.exceptSearchString = exceptSearchString;
			});
		}

		return module._filters[type];
	},
	allowAllNSFW: null, // lazy loaded with boolean-y value
	subredditAllowNsfwOption: null, // lazy loaded with function to get a given subreddit's row in this.options.allowNSFW
	allowNSFW: function(postSubreddit, currSubreddit) {
		if (!this.options.allowNSFW.value || !this.options.allowNSFW.value.length) return false;

		if (typeof currSubreddit === 'undefined') {
			currSubreddit = RESUtils.currentSubreddit();
		}

		if (!this.subredditAllowNsfwOption) {
			this.subredditAllowNsfwOption = RESUtils.indexOptionTable('filteReddit', 'allowNSFW', 0);
		}

		if (this.allowAllNsfw === null && currSubreddit) {
			var currOptionValue = this.subredditAllowNsfwOption(currSubreddit);
			this.allowAllNsfw = (currOptionValue && currOptionValue[0][1] === 'visit') || false;
		}
		if (this.allowAllNsfw) {
			return true;
		}

		if (!postSubreddit) postSubreddit = currSubreddit;
		if (!postSubreddit) return false;
		var postOptionValue = this.subredditAllowNsfwOption(postSubreddit);
		if (postOptionValue) {
			if (postOptionValue[0][1] === 'everywhere') {
				return true;
			} else { // optionValue[1] == visit (subreddit or multisubreddit)
				if (RESUtils.inList(postSubreddit, currSubreddit, '+')) {
					return true;
				}
			}
		}
	},
	regexRegex: /^\/(.*)\/([gim]+)?$/,
	filtersMatchString: function(filterType, stringToSearch, reddit, fullmatch) {
		var filters = modules['filteReddit'].filters(filterType);
		if (!filters || !filters.length) return false;
		if (!stringToSearch) {
			// this means a bad filter of some sort...
			return;
		}
		var i = filters.length;
		var result = false;

		while (i--) {
			var filter = filters[i];
			var skipCheck = false;

			// we also want to know if we should be matching /r/all, because when getting
			// listings on /r/all, each post has a subreddit (that does not equal "all")
			var checkRAll = ((RESUtils.currentSubreddit() === 'all') && (filter.applyList.indexOf('all') !== -1));
			switch (filter.applyTo) {
				case 'exclude':
					if ((filter.applyList.indexOf(reddit) !== -1) || (checkRAll)) {
						skipCheck = true;
					}
					break;
				case 'include':
					if ((filter.applyList.indexOf(reddit) === -1) && (!checkRAll)) {
						skipCheck = true;
					}
					break;
			}

			if (!skipCheck && filter.exceptSearchString.length && stringToSearch.indexOf(filter.exceptSearchString) !== -1) {
				skipCheck = true;
			}

			if (skipCheck) {
				// skip checking this filter, duh
				continue;
			} else if (filter.searchString.test) {
				// filter is a regex
				if (filter.searchString.test(stringToSearch)) {
					result = true;
					break;
				}
			} else if (fullmatch) {
				// simple full string match
				if (stringToSearch === filter.searchString) {
					result = true;
					break;
				}
			} else {
				// simple in-string match
				if (stringToSearch.indexOf(filter.searchString) !== -1) {
					result = true;
					break;
				}
			}
		}
		return result;
	},
	toggleFilter: function(e) {
		var thisSubreddit = $(e.target).data('subreddit').toLowerCase();
		var filteredReddits = modules['filteReddit'].options.subreddits.value || [];
		var message;
		var subredditIndex = filteredReddits.findIndex(function(reddit) {
			return reddit && reddit[0].toLowerCase() === thisSubreddit;
		});
		if (subredditIndex !== -1) {
			filteredReddits.splice(subredditIndex, 1);
			e.target.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
			e.target.textContent = '+filter';
			e.target.classList.remove('remove');
			message = 'No longer filtering submissions from /r/' + thisSubreddit + '.';
		} else {
			filteredReddits.push([thisSubreddit, 'everywhere', '']);
			e.target.setAttribute('title', 'Stop filtering this subreddit from /r/all and /domain/*');
			e.target.textContent = '-filter';
			e.target.classList.add('remove');
			message = 'Submissions from /r/' + thisSubreddit + ' will be hidden from listings.';
		}
		modules['notifications'].showNotification({
			moduleID: 'filteReddit',
			notificationID: 'filterSubreddit',
			message: message
		});
		modules['filteReddit'].options.subreddits.value = filteredReddits;
		// save change to options...
		RESUtils.options.saveModuleOptions('filteReddit');
	},
	executeCustomFilters: function(thing) {
		var advancedFilterOptions = modules['filteReddit'].options.customFilters;
		var filters = advancedFilterOptions.value,
		    config = advancedFilterOptions.cases;
		return filters.some(function(filter) {
			return config[filter.body.type].evaluate(thing, filter.body, config);
		});
	},
});
