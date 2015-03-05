modules['filteReddit'] = {
	moduleID: 'filteReddit',
	moduleName: 'filteReddit',
	category: [ 'Filters', 'Posts' ],
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
				'<br>If you have filters which start with <code>/</code>, you should turn this option off.' +
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
				} //,
				/* { name: 'inclusions', type: 'list', source: location.protocol + '/api/search_reddit_names' } */
			],
			value: [],
			description: 'Type in title keywords you want to ignore if they show up in a title.' +
				'\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for keyword (but not unlessKeyword).'
		},
		subreddits: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
				name: 'subreddit',
				type: 'text'
			}],
			value: [],
			description: 'Type in a subreddit you want to ignore (only applies to /r/all or /domain/* urls).' +
				'\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for subreddit.'
		},
		domains: {
			type: 'table',
			addRowText: '+add filter',
			fields: [{
					name: 'domain',
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
			description: 'Type in domain keywords you want to ignore. Note that "reddit" would ignore "reddit.com" and "fooredditbar.com"' +
				'\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for domain.'
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
			description: 'Type in keywords you want to ignore if they are contained in link flair' +
				'\n\nRegExp like <code>/(this|that|theother)/i</code> is allowed for flair.'
		},
		allowNSFW: {
			type: 'table',
			addRowText: '+add subreddits',
			description: 'Whitelist subreddits from NSFW filter',
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
		advancedFilters: {
			type: 'builder',
			description: 'Customize advanced filters',
			value: [],
			addItemText: '+add filter',
			defaultTemplate: function() {
				return {note: 'Untitled filter', body: {type: 'group', op: 'all', of: [
					{type: 'score', op: '>', val: '123'}
				]}};
			},
			cases: {
				group: {
					name: 'Group',
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
						var seenTrue = false;
						if (data.op === 'all') {
							for (var i = 0; i < data.of.length; i++) {
								var condition = data.of[i];
								var result = config[condition.type].evaluate(thing, condition, config);
								if (result === false) return false;
							}
							return true;
						} else if (data.op === 'any') {
							for (var i = 0; i < data.of.length; i++) {
								var condition = data.of[i];
								var result = config[condition.type].evaluate(thing, condition, config);
								if (result === true) return true;
							}
							return false;
						} else if (data.op === 'one') {
							var seenTrue = false;
							for (var i = 0; i < data.of.length; i++) {
								var condition = data.of[i];
								var result = config[condition.type].evaluate(thing, condition, config);
								if (result) {
									if (seenTrue === true) return false;
									seenTrue = true;
								}

							return seenTrue;
							}
						} else if (data.op === 'none') {
							for (var i = 0; i < data.of.length; i++) {
								var condition = data.of[i];
								var result = config[condition.type].evaluate(thing, condition, config);
								if (result === true) return false;
							}
							return true;
						} else {
							throw new RangeError("Ilegal group operator: '"+data.op+"'");
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
					'Score is ',
					{type: 'select', options: 'COMPARISON', id: 'op'},
					' ',
					{type: 'number', id: 'val'}
					],
					evaluate: function(thing, data, config) {
						var $scoreElement = null;
						if (thing.classList.contains('link')) {
							$scoreElement = $(thing).find('> .midcol > .score:visible');

						} else if (thing.classList.contains('comment')) {
							$scoreElement = $(thing).find('> .entry > .tagline > .score:visible');
						} else {
							//Unhandled type
							return false;
						}
						//parseInt() strips off the ' points' from comments
						var score = parseInt($scoreElement.text().trim(), 10);
						return modules.settingsConsole.numericalCompare(data.op, score, data.val);
					}
				},
				subreddit: {
					name: 'Subreddit',
					defaultTemplate: function(patt) {
						return {type: 'subreddit', pattern: patt || ''};
					},
					fields: [
					'post is in /r/', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var subreddit = null;
						if (thing.classList.contains('link')) {
							subreddit = $(thing).find('> .entry > .tagline > .subreddit').text().slice(3);
						} else if (thing.classList.contains('comment')) {
							subreddit = $(thing).find('> .parent > .subreddit').text();
						} else {
							//unhandled
							return false;
						}
						var pattern = new RegExp('^'+data.patt+'$', 'i');
						return pattern.test(subreddit.trim());
					}
				},
				username: {
					name: 'Username',
					defaultTemplate: function(patt) {
						return {type: 'username', patt: patt || ''};
					},
					fields: [
					'post is by /u/', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var user  = $(thing).find('> .entry > .tagline > .author').text();
						if (user === '') return false;
						var pattern = new RegExp('^'+data.patt+'$', 'i');
						return pattern.test(user.trim());
					}
				},
				commentCount: {
					name: 'Comment Count',
					defaultTemplate: function(op, val) {
						return {type: 'commentCount', op: op || '>', val: val || 0};
					},
					fields:[
					'Post has ',
					{type: 'select', options: 'COMPARISON', id: 'op'},
					' ',
					{type: 'number', id: 'val'},
					' comments'
					],
					evaluate: function(thing, data, config) {
						var $thing = $(thing);
						var text = null;
						if (thing.classList.contains('link')) {
							text = $thing.find('.buttons .comments').text();
						} else if (thing.classList.contains('comment')) {
							text = $thing.find('.buttons a:contains(full comments)').text();
						} else {
							//unhandled
							return false;
						}
						var commentCount = parseInt(/\d+/.exec(text.trim()), 10);
						return modules.settingsConsole.numericalCompare(data.op, commentCount, data.val);
					}
				},
				userAttr: {
					name: 'User attribute (friend/mod/etc...)',
					defaultTemplate: function(cat) {
						return {type: 'userAttr', attr: cat || 'friend'}
					},
					fields: [
					'User is ', {
						type: 'select', id: 'attr',
						options: [
							['a friend', 'friend'],
							['a moderator', 'moderator'],
							['an admin', 'admin'],
							// ['op', 'submitter]',
							'me'
						]
					}
					],
					evaluate: function(thing, data, config) {
						var $author  = $(thing).find('> .entry > .tagline > .author');
						if (data.attr === 'me') {
							//No standard marker for my own posts so compare against the logged in user
							var authorName = $author.text().trim().toLowerCase();
							//loggedInUser returns null when logged out
							var myName = (RESUtils.loggedInUser() || '').trim().toLowerCase();
							return authorName === myName;
						} else {
							//The other cases have hardcoded class names
							return $attr.is(':has(.' + data.attr + ')');
						}
					}
				},
				domain: {
					name: 'Link domain name',
					defaultTemplate: function(dom) {
						return {type: 'domain', patt: dom || ''}
					},
					fields: [
					'domain name is ',
					{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						if (!thing.classList.contains('link')) return false;
						var domain = $(thing).find('> .entry > .title > .domain > a').text();
						var pattern = new RegExp('^'+data.patt+'$', 'i');
						return pattern.test(domain.trim());
					}
				},
				dow: {
					name: 'Day of week',
					defaultTemplate: function(dom) {
						return {type: 'dow', days: []};
					},
					fields: [
					'The current day of the week is ',
					{
						type: 'checkset', id: 'days',
						//Uses same 3 letter names as 
						//.toLocaleDateString('en-US', {weekday: 'short'}))
						items: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'.split(',')
					}
					],
					evaluate: function(thing, data, config) {
						//Get 3 letter name
						var currentDOW = new Date().toLocaleDateString('en-US', {weekday: 'short'});
						return data.days.indexOf(currentDOW) > -1;
					}
				},
				linkFlair: {
					name: 'Link flair',
					defaultTemplate: function(patt) {
						return {type: 'linkFlair', patt: patt || ''}
					},
					fields: [
					'The post has link flair matching ',
					{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var text = $(thing).find('> .entry > .title > .linkflairlabel').text();
						var pattern = new RegExp('^' + data.patt + '$', 'i');
						return pattern.test(text.trim());
					}
				},
				userFlair: {
					name: 'User flair',
					defaultTemplate: function(patt) {
						return {type: 'userFlair', patt: patt || ''}
					},
					fields: [
					'The author of this post has flair matching ',
					{type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var text = $(thing).find('> .entry > .tagline > .flair').text();
						var pattern = new RegExp('^' + data.patt + '$', 'i');
						return pattern.test(text.trim());
					}
				},
				postType: {
					name: 'Post type',
					defaultTemplate: function(kind) {
						return {type: 'postType', kind: kind || 'link'}
					},
					fields: [
					'This is a ', {
						//id: 'type' results in a collsion
						type: 'select', id: 'kind',
						options: [
							['link post', 'link'],
							['self post', 'self'],
							'comment',
						]
					}, '.'
					],
					evaluate: function(thing, data, config) {
						var contains = thing.classList.contains.bind(thing.classList);
						switch (data.kind) {
							case 'comment': return contains('comment');
							case 'link':    return contains('link') && !contains('self');
							case 'self':    return contains('link') &&  contains('self');
							default: throw new RuntimeError('unknown post type "' + data.kind + '"');
						}
					}
				},
				postTitle: {
					name: 'Post Title',
					defaultTemplate: function(patt) {
						return {type: 'postTitle', patt: patt || ''}
					},
					fields: [
					'The post\'s title contains ', {type: 'text', id: 'patt', validator: RegExp}
					],
					evaluate: function(thing, data, config) {
						var title = $(thing).find('>.entry > .title > a.title').text();
						//Do not anchor for this case
						return new RegExp(data.patt, 'i').test(title);
					}
				},
				postAge: {
					name: 'Post Age',
					defaultTemplate: function(age) {
						//4 hours in milliseconds
						return {type: 'postAge', age: age || 4*60*60*1000};
					},
					fields: [
					'The post is ',
					{type: 'select', id: 'op', options: [
						['more than', '>'],
						['less than', '<']
					]},
					' ', {type: 'duration', id: 'age'}, ' old'
					],
					evaluate: function(thing, data, config) {
						var postTime = new Date($(thing)
							.closest('.thing')
							.find('> .entry > .tagline > .live-timestamp')
							.attr('dateTime'));
						var now = new Date();
						return modules.settingsConsole.numericalCompare(data.op, now-postTime, data.age);
					}
				},
				currentSub: {
					name: 'Current subreddit',
					defaultTemplate: function(patt) {
						return {type: 'currentSub', patt: patt || ''};
					},
					fields: [
					'I am currently browsing /r/',
					{type: 'text', id: 'patt', validator: RegExp},
					],
					evaluate: function(thing, data, config) {
						var sub = RESUtils.currentSubreddit();
						if (sub == null) return false;
						return new RegExp(data.patt, 'i').test(sub);
					}
				},
				currentUserProfile: {
					name: 'Current user profile',
					defaultTemplate: function(patt) {
						return {type: 'currentUserProfile', patt: patt || ''};
					},
					fields: [
					'I am currently browsing /u/',
					{type: 'text', id: 'patt', validator: RegExp},
					'\'s posts',
					],
					evaluate: function(thing, data, config) {
						var user = RESUtils.currentUserProfile();
						if (user == null) return false;
						return new RegExp(data.patt, 'i').test(user);
					}
				},
				currentMulti: {
					name: 'Browsing multireddit',
					defaultTemplate: function(user, name) {
						return {type: 'currentMulti', user: user || '', name: name || ''};
					},
					fields: [
					'I am currently browsing /u/',
					{type: 'text', id: 'user', validator: RegExp},
					'/m/',
					{type: 'text', id: 'name', validator: RegExp},
					],
					evaluate: function(thing, data, config) {
						var parts = /^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i
							.exec(RESUtils.currentMultireddit());
						var multiNameRE = new RegExp(data.name, 'i');
						var user = parts[1], multi = parts[2];
						if (user === 'me' && data.name.trim() === 'me') {
							return multiNameRE.test(multi);
						} else {
							return new RegExp(data.name, 'i').test(user) && multiNameRE.test(multi);
						}
					}
				},
				browsingFrontPage: {
					name: 'Browsing the front page',
					defaultTemplate: function() {
						return {type: 'browsingFrontPage'};
					},
					fields: [
					'I am currently browsing the front page',
					],
					evaluate: function(thing, data, config) {
						return RESUtils.pageType() === 'linklist' && RESUtils.currentSubreddit() == null;
					}
				},
				isNSFW: {
					name: '',
					defaultTemplate: function() {
						return {type: 'isNSFW'};
					},
					fields: [
					'Post is marked NSFW',
					],
					evaluate: function(thing, data, config) {
						return thing.classList.contains('over18');
					}
				},
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
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/?(?:\??[\w]+=[\w]+&?)*/i,
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/r\/[\w]+\/?(?:\??[\w]+=[\w]+&?)*$/i
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
			RESUtils.addCSS('.RESFilterToggle { margin-right: 5px; color: white; background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
			RESUtils.addCSS('.RESFilterToggle.remove { background-image: url(https://redditstatic.s3.amazonaws.com/bg-button-remove.png) }');
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

			toggleOn = RESUtils.createElementWithID('span', null, 'toggleOn', 'on');
			toggleOff = RESUtils.createElementWithID('span', null, 'toggleOff', 'off');
			this.nsfwSwitch = document.createElement('li');
			this.nsfwSwitch.setAttribute('title', 'Toggle NSFW Filter');
			this.nsfwSwitch.addEventListener('click', function(e) {
				e.preventDefault();
				modules['filteReddit'].toggleNsfwFilter();
			}, true);
			this.nsfwSwitch.textContent = 'nsfw filter';
			this.nsfwSwitchToggle = RESUtils.createElementWithID('div', 'nsfwSwitchToggle', 'toggleButton');
			this.nsfwSwitchToggle.appendChild(toggleOn);
			this.nsfwSwitchToggle.appendChild(toggleOff);
			this.nsfwSwitch.appendChild(this.nsfwSwitchToggle);
			if (this.options.NSFWfilter.value) {
				this.nsfwSwitchToggle.classList.add('enabled');
			} else {
				this.nsfwSwitchToggle.classList.remove('enabled');
			}
			thisFrag.appendChild(this.nsfwSwitch);
			$(modules['RESMenu'].prefsDropdownOptions).append(this.nsfwSwitch);
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
		if (toggle !== true && toggle === false || modules['filteReddit'].options.NSFWfilter.value) {
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
		var numFiltered = 0;
		var numNsfwHidden = 0;

		var entries;
		if (typeof ele === 'undefined' || ele === null) {
			if (modules['filteReddit'].options.excludeCommentsPage.value) {
				entries = document.querySelectorAll('body:not(.comments-page) #siteTable .link');
			} else {
				entries = document.querySelectorAll('#siteTable .link');
			}
		} else {
			entries = ele.querySelectorAll('div.thing.link');
		}
		// var RALLre = /\/r\/all\/?(([\w]+)\/)?/i;
		// var onRALL = RALLre.exec(location.href);
		var filterSubs = (RESUtils.currentSubreddit('all')) || (RESUtils.currentDomain()) || (RESUtils.currentMultireddit('me/f/all')),
			onSavedPage = modules['filteReddit'].excludeSaved.test && modules['filteReddit'].excludeSaved.test(location.href);

		for (var i = 0, len = entries.length; i < len; i++) {
			var postSubreddit, currSub;
			if (!onSavedPage) {
				var postTitle = entries[i].querySelector('.entry a.title').textContent;
				var postDomain = entries[i].querySelector('.entry span.domain > a');
				postDomain = (postDomain) ? postDomain.textContent.toLowerCase() : 'reddit.com'; // ads by redditads does not have a domain
				var thisSubreddit = entries[i].querySelector('.entry a.subreddit');
				var postFlair = entries[i].querySelector('.entry span.linkflairlabel');
				if (thisSubreddit !== null) {
					postSubreddit = RESUtils.subredditRegex.exec(thisSubreddit.href)[1] || false;
				} else {
					postSubreddit = false;
				}

				var filtered = false;


				if (!filtered) filtered = modules['filteReddit'].executeCustomFilters(entries[i]);

				currSub = (RESUtils.currentSubreddit()) ? RESUtils.currentSubreddit().toLowerCase() : null;
				if (!filtered) filtered = modules['filteReddit'].filterTitle(postTitle, postSubreddit || RESUtils.currentSubreddit());
				if (!filtered) filtered = modules['filteReddit'].filterDomain(postDomain, postSubreddit || currSub);
				if ((!filtered) && (filterSubs) && (postSubreddit)) {
					filtered = modules['filteReddit'].filterSubreddit(postSubreddit);
				}
				if ((!filtered) && (postFlair)) {
					filtered = modules['filteReddit'].filterFlair(postFlair.textContent, postSubreddit || RESUtils.currentSubreddit());
				}
				if (filtered) {
					entries[i].classList.add('RESFiltered');
					numFiltered++;
				}
			}

			if (entries[i].classList.contains('over18')) {
				if (modules['filteReddit'].allowNSFW(postSubreddit, currSub)) {
					entries[i].classList.add('allowOver18');
				} else if (modules['filteReddit'].options.NSFWfilter.value) {
					numNsfwHidden++;
				}
			}
		}

		var notificationThreshold = parseInt(modules['filteReddit'].options.notificationThreshold.value, 10);
		if (typeof notificationThreshold !== 'number' || isNaN(notificationThreshold)) {
			notificationThreshold = modules['filteReddit'].options.notificationThreshold.default;
		}
		notificationThreshold = Math.max(0, Math.min(notificationThreshold, 110)); // so users can go the extra 10% to avoid notifications completely
		notificationThreshold /= 100;

		var percentageHidden = (numFiltered + numNsfwHidden) / entries.length;
		if (entries.length && percentageHidden >= notificationThreshold) {
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

		RESUtils.addCSS('body:not(.allowOver18) .thing.over18:not(.allowOver18) { display: none !important; }');
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
		var i = 0,
			len = this.options.subreddits.value.length,
			changed = false,
			check;

		for (; i<len; i++) {
			check = this.options.subreddits.value[i][0];
			if (check.substr(0,3) === '/r/') {
				this.options.subreddits.value[i][0] = check.substr(3);
				changed = true;
			}
		}
		if (changed) {
			RESUtils.options.saveModuleOptions(this.moduleID);
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

			for (var i = 0; i < sources.length; i++) {
				var filter = {};
				filters.push(filter);

				var source = sources[i];
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
			}
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

		if (this.allowAllNsfw == null && currSubreddit) {
			var optionValue = this.subredditAllowNsfwOption(currSubreddit);
			this.allowAllNsfw = (optionValue && optionValue[1] === 'visit') || false;
		}
		if (this.allowAllNsfw) {
			return true;
		}

		if (!postSubreddit) postSubreddit = currSubreddit;
		if (!postSubreddit) return false;
		var optionValue = this.subredditAllowNsfwOption(postSubreddit);
		if (optionValue) {
			if (optionValue[1] === 'everywhere') {
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
		var exists = false;
		for (var i = 0, len = filteredReddits.length; i < len; i++) {
			if ((filteredReddits[i]) && (filteredReddits[i][0].toLowerCase() === thisSubreddit)) {
				exists = true;
				filteredReddits.splice(i, 1);
				e.target.setAttribute('title', 'Filter this subreddit from /r/all and /domain/*');
				e.target.textContent = '+filter';
				e.target.classList.remove('remove');
				break;
			}
		}
		if (!exists) {
			var thisObj = [thisSubreddit, 'everywhere', ''];
			filteredReddits.push(thisObj);
			e.target.setAttribute('title', 'Stop filtering this subreddit from /r/all and /domain/*');
			e.target.textContent = '-filter';
			e.target.classList.add('remove');
		}
		modules['filteReddit'].options.subreddits.value = filteredReddits;
		// save change to options...
		RESUtils.options.saveModuleOptions(this.moduleID);
	},
	executeCustomFilters: function(thing) {
		var advancedFilterOptions = modules['filteReddit'].options['advancedFilters'];
		var filters = advancedFilterOptions.value,
		    config = advancedFilterOptions.cases;
		for (var i = 0, length = filters.length; i < length; i++) {
			if (config[filters[i].body.type].evaluate(thing, filters[i].body, config)) {
				return true;
			}
		}
		return false;
	},
};
