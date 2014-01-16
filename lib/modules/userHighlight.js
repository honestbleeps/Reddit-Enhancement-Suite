modules['userHighlight'] = {
	moduleID: 'userHighlight',
	moduleName: 'User Highlighter',
	category: 'Users',
	description: 'Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk',
	options: {
		highlightOP: {
			type: 'boolean',
			value: true,
			description: 'Highlight OP\'s comments'
		},
		OPColor: {
			type: 'text',
			value: '#0055DF',
			description: 'Color to use to highlight OP. Defaults to original text color'
		},
		OPColorHover: {
			type: 'text',
			value: '#4E7EAB',
			description: 'Color used to highlight OP on hover.'
		},
		highlightAdmin: {
			type: 'boolean',
			value: true,
			description: 'Highlight Admin\'s comments'
		},
		adminColor: {
			type: 'text',
			value: '#FF0011',
			description: 'Color to use to highlight Admins. Defaults to original text color'
		},
		adminColorHover: {
			type: 'text',
			value: '#B3000C',
			description: 'Color used to highlight Admins on hover.'
		},
		highlightFriend: {
			type: 'boolean',
			value: true,
			description: 'Highlight Friends\' comments'
		},
		friendColor: {
			type: 'text',
			value: '#FF4500',
			description: 'Color to use to highlight Friends. Defaults to original text color'
		},
		friendColorHover: {
			type: 'text',
			value: '#B33000',
			description: 'Color used to highlight Friends on hover.'
		},
		highlightMod: {
			type: 'boolean',
			value: true,
			description: 'Highlight Mod\'s comments'
		},
		modColor: {
			type: 'text',
			value: '#228822',
			description: 'Color to use to highlight Mods. Defaults to original text color'
		},
		modColorHover: {
			type: 'text',
			value: '#134913',
			description: 'Color used to highlight Mods on hover. Defaults to gray.'
		},
		highlightFirstCommenter: {
			type: 'boolean',
			value: false,
			description: 'Highlight the person who has the first comment in a tree, within that tree'
		},
		firstCommentColor: {
			type: 'text',
			value: '#46B6CC',
			description: 'Color to use to highlight the first-commenter. Defaults to original text color'
		},
		firstCommentColorHover: {
			type: 'text',
			value: '#72D2E5',
			description: 'Color used to highlight the first-commenter on hover.'
		},
		fontColor: {
			type: 'text',
			value: 'white',
			description: 'Color for highlighted text.'
		},
		autoColorUsernames: {
			type: 'boolean',
			value: false,
			description: 'Automatically set a special color for each username'
		},
		autoColorUsing: {
			description: 'Select a method for setting colors for usernames',
			type: 'enum',
			values: []
		}
	},
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: [
		/^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	loadDynamicOptions: function() {
		var autoColorUsingStrategies = modules['userHighlight'].autoColorUsing;
		var autoColorUsingOption = modules['userHighlight'].options.autoColorUsing;
		for (var i = 0, length = autoColorUsingStrategies.length; i < length; i++) {
			var strategy = autoColorUsingStrategies[i];
			autoColorUsingOption.values.push({
				value: strategy.name,
				name: strategy.description
			});
		}

		var defaultStrategy = autoColorUsingOption.values[0];
		if (defaultStrategy) {
			autoColorUsingOption.value = defaultStrategy.value;
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.findDefaults();
			if (this.options.highlightOP.value) this.doHighlight('submitter');
			if (this.options.highlightFriend.value) this.doHighlight('friend');
			if (this.options.highlightMod.value) this.doHighlight('moderator');
			if (this.options.highlightAdmin.value) this.doHighlight('admin');

			if (this.options.autoColorUsernames.value) {
				RESUtils.watchForElement('newComments', this.scanPageForNewUsernames);
				RESUtils.watchForElement('siteTable', this.scanPageForNewUsernames);
				this.scanPageForNewUsernames();
			}

			if (this.options.highlightFirstCommenter.value) {
				RESUtils.watchForElement('newComments', this.scanPageForFirstComments);
				this.scanPageForFirstComments();
			}
		}
	},
	findDefaults: function() {
		var dummy = $('<div style="height: 0px;" id="dummy" class="tagline">\
			<a class="author submitter">submitter</a>\
			<a class="author friend">friend</a>\
			<a class="author moderator">moderator</a>\
			<a class="author admin">admin</a>\
		</div>');
		$(document.body).append(dummy);
		this.colorTable = {
			'submitter': {
				default: RESUtils.getComputedStyle('#dummy .author.submitter', 'color'),
				color: this.options.OPColor.value,
				hoverColor: this.options.OPColorHover.value
			},
			'friend': {
				default: RESUtils.getComputedStyle('#dummy .author.friend', 'color'),
				color: this.options.friendColor.value,
				hoverColor: this.options.friendColorHover.value
			},
			'moderator': {
				default: RESUtils.getComputedStyle('#dummy .author.moderator', 'color'),
				color: this.options.modColor.value,
				hoverColor: this.options.modColorHover.value
			},
			'admin': {
				default: RESUtils.getComputedStyle('#dummy .author.admin', 'color'),
				color: this.options.adminColor.value,
				hoverColor: this.options.adminColorHover.value
			},
			'user': {
				default: '#5544CC',
				color: modules['userTagger'].options['highlightColor'].value,
				hoverColor: modules['userTagger'].options['highlightColorHover'].value,
			},
			'firstComment': {
				default: '#46B6CC',
				color: this.options.firstCommentColor.value,
				hoverColor: this.options.firstCommentColorHover.value
			}
		};
		$('#dummy').detach();
	},
	scanPageForFirstComments: function(ele) {
		var comments = ele ? $(ele).closest('.commentarea > .sitetable > .comment') : document.body.querySelectorAll('.commentarea > .sitetable > .comment');

		RESUtils.forEachChunked(comments, 15, 1000, function(element, i, array) {
			// Get identifiers
			var idClass;
			for (var i = 0, length = element.classList.length; i < length; i++) {
				idClass = element.classList[i];
				if (idClass.substring(0, 6) === 'id-t1_') break;
			}

			if (modules['userHighlight'].firstComments[idClass]) return;
			modules['userHighlight'].firstComments[idClass] = true;

			var entry = element.querySelector('.entry'),
				author = entry.querySelector('.author');
			if (!author) return;

			var authorClass;
			for (var i = 0, length = author.classList.length; i < length; i++) {
				authorClass = author.classList[i];
				if (authorClass.substring(0, 6) === 'id-t2_') break;
			}

			if (authorClass.substring(0, 6) !== 'id-t2_') return;

			var authorDidReply = element.querySelector('.child .' + authorClass);
			if (!authorDidReply) return;

			modules['userHighlight'].doHighlight('firstComment', authorClass, '.' + idClass);
		});
	},
	firstComments: {},
	scanPageForNewUsernames: function(ele) {
		var autoColorUsing = modules['userHighlight'].getAutoColorUsingFunction(modules['userHighlight'].options.autoColorUsing.value);
		if (!autoColorUsing) {
			console.error('Could not find a usable userHighlight.autoColorUsing method');
			return;
		}

		ele = ele || document.body;
		var authors = ele.querySelectorAll('.author');
		RESUtils.forEachChunked(authors, 15, 1000, function(element, i, array) {
			// Get identifiers
			var idClass;
			for (var i = 0, length = element.classList.length; i < length; i++) {
				idClass = element.classList[i];
				if (idClass.substring(0, 6) === 'id-t2_') break;
			}
			var username = element.textContent;

			if (modules['userHighlight'].coloredUsernames[idClass]) return;
			modules['userHighlight'].coloredUsernames[idClass] = true;

			var color = autoColorUsing(idClass, element, username);

			// Apply color
			modules['userHighlight'].doTextColor('.' + idClass, color);
		});
	},
	autoColorTemplate: '	\
						{{selector}} {	\
							color: {{color}} !important;	\
						}	\
						.res-nightmode {{selector}} {	\
							color: {{nightmodecolor}} !important;	\
						}	\
					',
	autoColorUsing: [
	 	{
			name: 'hash-userid-notbright',
			description: 'Random color, not too bright, consistent for each user; night mode-friendly',
			function: function(idClass, username, element) {
				var hash = RESUtils.hashCode(idClass);

				// With help from /u/Rangi42

				var r = (hash & 0xFF0000) >> 16;
				var g = (hash & 0x00FF00) >> 8;
				var b = hash & 0x0000FF;
				// Luminance formula: http://stackoverflow.com/a/596243/70175
				var lum = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
				var minLum = 0x66; // Night mode background is #191919 or #222222
				var maxLum = 0xAA; // Regular background is #FFFFFF or #F7F7F8
				
				var color = [ r, g, b ];
				var nightmodeColor = [ r, g, b ];
				if (lum < minLum) {
				    var scale = minLum / lum;
				    nightmodeColor = [
				    	Math.round(r * scale),
				    	Math.round(g * scale),
				    	Math.round(b * scale)
				    ];
				} else if (lum > maxLum) {
				    var scale = maxLum / lum;
				    color = [
				    	Math.round(r * scale),
				    	Math.round(g * scale),
				    	Math.round(b * scale)
				    ];
				}
				color = "rgb(" + color.join(',') + ")";
				nightmodeColor = "rgb(" + nightmodeColor.join(',') + ")";

				return {
					template: modules['userHighlight'].autoColorTemplate,
					color:  color,
					nightmodecolor: nightmodeColor
				};
			}
		},
		{
			name: 'hash-userid',
			description: 'Simple random color, consistent for each user. (original)',
			function: function(idClass, username, element) {
				// Choose color
				var hash = 5381,
					str = idClass;
				for (var i = 0; i < str.length; i++) {
					hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
				}

				var r = (hash & 0xFF0000) >> 16;
				var g = (hash & 0x00FF00) >> 8;
				var b = hash & 0x0000FF;
				var color = "rgb(" + [r, g, b].join(',') + ")";

				return {
					color: color
				};
			}
		}, {
			name: 'monochrome',
			description: 'All black or, in night mode, all light gray',
			function: function(idClass, username, element) {
				return {
					template: modules['userHighlighter'].autoColorTemplate,
					color: 'black',
					nightmodecolor: '#ccc'
				};
			}
		}
	],
	getAutoColorUsingFunction: function(name) {
		var strategies = modules['userHighlight'].autoColorUsing;
		for (var i = 0, length = strategies.length; i < length; i++) {
			var strategy = strategies[i];
			if (strategy.name == name) {
				return strategy.function;
			}
		}
	},
	coloredUsernames: {},
	highlightUser: function(username) {
		var name = 'author[href$="/' + username + '"]'; // yucky, but it'll do
		return this.doHighlight('user', name);
	},
	doHighlight: function(name, selector, container) {
		if (selector == undefined) {
			selector = name;
		}
		if (container == undefined) {
			container = '.thing .tagline';
		}
		var color, hoverColor;
		var color = this.colorTable[name].color;
		if (color === 'default') this.colorTable[name].
		default;

		var hoverColor = this.colorTable[name].hoverColor;
		if (hoverColor === 'default') hoverColor = '#aaa';
		var css = '\
			' + container + ' .author.' + selector + ' { \
				color: ' + this.options.fontColor.value + ' !important; \
				font-weight: bold; \
				padding: 0 2px 0 2px; \
				border-radius: 3px; \
				background-color:' + color + ' !important; \
			} \
			' + container + ' .collapsed .author.' + selector + ' { \
				color: white !important; \
				background-color: #AAA !important; \
			} \
			' + container + ' .author.' + selector + ':hover {\
				background-color: ' + hoverColor + ' !important; \
				text-decoration: none !important; \
			}';
		return RESUtils.addCSS(css);
	},
	doTextColor: function(selector, colorData) {
		var template = colorData.template || '	\
				{{selector}} {	\
					color: {{color}} !important;	\
				}	\
				';

		var placeholderValues = $.extend({}, colorData, {
			template: null,
			selector: '.tagline .author' + selector
		});
		
		var css = template;

		for (var key in placeholderValues) {
			if (!placeholderValues.hasOwnProperty(key)) continue;
			
			var search = new RegExp('{{' + key + '}}', "g");
			var value = placeholderValues[key];

			if (value !== null && value !== undefined) {
				css = css.replace(search, value);
			}
		}

		return RESUtils.addCSS(css);
	}
};
