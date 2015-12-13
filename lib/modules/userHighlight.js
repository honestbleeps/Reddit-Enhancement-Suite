addModule('userHighlight', {
	moduleID: 'userHighlight',
	moduleName: 'User Highlighter',
	category: ['Users', 'Appearance'],
	description: 'Highlights certain users in comment threads: OP, Admin, Friends, Mod - contributed by MrDerk',
	options: {
		highlightOP: {
			type: 'boolean',
			value: true,
			description: 'Highlight OP\'s comments'
		},
		OPColor: {
			type: 'color',
			value: '#0055DF',
			description: 'Color to use to highlight OP. Defaults to original text color',
			advanced: true,
			dependsOn: 'highlightOP'
		},
		OPColorHover: {
			type: 'color',
			value: '#4E7EAB',
			description: 'Color used to highlight OP on hover.',
			advanced: true,
			dependsOn: 'highlightOP'
		},
		highlightAdmin: {
			type: 'boolean',
			value: true,
			description: 'Highlight Admin\'s comments'
		},
		adminColor: {
			type: 'color',
			value: '#FF0011',
			description: 'Color to use to highlight Admins. Defaults to original text color',
			advanced: true,
			dependsOn: 'highlightAdmin'
		},
		adminColorHover: {
			type: 'color',
			value: '#B3000C',
			description: 'Color used to highlight Admins on hover.',
			advanced: true,
			dependsOn: 'highlightAdmin'
		},
		highlightFriend: {
			type: 'boolean',
			value: true,
			description: 'Highlight Friends\' comments'
		},
		friendColor: {
			type: 'color',
			value: '#FF4500',
			description: 'Color to use to highlight Friends. Defaults to original text color',
			advanced: true,
			dependsOn: 'highlightFriend'
		},
		friendColorHover: {
			type: 'color',
			value: '#B33000',
			description: 'Color used to highlight Friends on hover.',
			advanced: true,
			dependsOn: 'highlightFriend'
		},
		highlightMod: {
			type: 'boolean',
			value: true,
			description: 'Highlight Mod\'s comments'
		},
		modColor: {
			type: 'color',
			value: '#228822',
			description: 'Color to use to highlight Mods. Defaults to original text color',
			advanced: true,
			dependsOn: 'highlightMod'
		},
		modColorHover: {
			type: 'color',
			value: '#134913',
			description: 'Color used to highlight Mods on hover. Defaults to gray.',
			advanced: true,
			dependsOn: 'highlightMod'
		},
		highlightFirstCommenter: {
			type: 'boolean',
			value: false,
			description: 'Highlight the person who has the first comment in a tree, within that tree'
		},
		dontHighlightFirstComment: {
			type: 'boolean',
			value: true,
			description: 'Don\'t highlight the "first commenter" on the first comment in a tree',
			advanced: true,
			dependsOn: 'highlightFirstCommenter'
		},
		firstCommentColor: {
			type: 'color',
			value: '#46B6CC',
			description: 'Color to use to highlight the first-commenter. Defaults to original text color',
			advanced: true,
			dependsOn: 'highlightFirstCommenter'
		},
		firstCommentColorHover: {
			type: 'color',
			value: '#72D2E5',
			description: 'Color used to highlight the first-commenter on hover.',
			advanced: true,
			dependsOn: 'highlightFirstCommenter'
		},
		fontColor: {
			type: 'color',
			value: '#FFFFFF',
			description: 'Color for highlighted text.',
			advanced: true
		},
		autoColorUsernames: {
			type: 'boolean',
			value: false,
			description: 'Automatically set a special color for each username'
		},
		autoColorUsing: {
			description: 'Select a method for setting colors for usernames',
			type: 'enum',
			values: [],
			advanced: true,
			dependsOn: 'autoColorUsernames'
		},
		generateHoverColors: {
			type: 'button',
			text: 'Generate',
			callback: null,
			description: 'Automatically generate hover color based on normal color.',
			advanced: false // TODO: true after release after 2014-06-30
		}
	},
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
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
		this.options['generateHoverColors'].callback = modules['userHighlight'].generateHoverColors;
		if ((this.isEnabled()) && (this.isMatchURL())) {
			this.colorTable = {
				'admin': {
					color: this.options.adminColor.value,
					hoverColor: this.options.adminColorHover.value
				},
				'firstComment': {
					color: this.options.firstCommentColor.value,
					hoverColor: this.options.firstCommentColorHover.value
				},
				'friend': {
					color: this.options.friendColor.value,
					hoverColor: this.options.friendColorHover.value
				},
				'moderator': {
					color: this.options.modColor.value,
					hoverColor: this.options.modColorHover.value
				},
				'submitter': {
					color: this.options.OPColor.value,
					hoverColor: this.options.OPColorHover.value
				},
				'user': {
					color: modules['userInfo'].options['highlightColor'].value,
					hoverColor: modules['userInfo'].options['highlightColorHover'].value
				}
			};
			if (this.options.highlightFriend.value) {
				this.highlight('friend');
			}
			if (this.options.highlightOP.value) {
				this.highlight('submitter');
			}
			if (this.options.highlightMod.value) {
				this.highlight('moderator');
			}
			if (this.options.highlightAdmin.value) {
				this.highlight('admin');
			}

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
	scanPageForFirstComments: function(ele) {
		var comments = ele ? $(ele).closest('.commentarea > .sitetable > .comment') : document.body.querySelectorAll('.commentarea > .sitetable > .comment');

		RESUtils.forEachChunked(comments, 15, 1000, function(element) {
			// Get identifiers
			var idClass = Array.prototype.slice.call(element.classList).find(function(cls) {
				return cls.substring(0, 6) === 'id-t1_';
			});

			if (idClass === undefined || modules['userHighlight'].firstComments[idClass]) return;
			modules['userHighlight'].firstComments[idClass] = true;

			var entry = element.querySelector('.entry'),
				author = entry.querySelector('.author');
			if (!author) return;

			var authorClass = Array.prototype.slice.call(author.classList).find(function(cls) {
				return cls.substring(0, 6) === 'id-t2_';
			});

			if (authorClass === undefined) return;

			var authorDidReply = element.querySelector('.child .' + authorClass);
			if (!authorDidReply) return;

			var container = '.' + idClass;
			if (modules['userHighlight'].options.dontHighlightFirstComment.value) {
				container += ' .child';
			}
			modules['userHighlight'].highlight('firstComment', authorClass, container);
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
		RESUtils.forEachChunked(authors, 15, 1000, function(element) {
			// Get identifiers
			var idClass = Array.prototype.slice.call(element.classList).find(function(cls) {
				return cls.substring(0, 6) === 'id-t2_';
			});

			if (idClass === undefined) return;

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
				var scale;
				if (lum < minLum) {
					scale = minLum / lum;
					nightmodeColor = [
						Math.round(r * scale),
						Math.round(g * scale),
						Math.round(b * scale)
					];
				} else if (lum > maxLum) {
					scale = maxLum / lum;
					color = [
						Math.round(r * scale),
						Math.round(g * scale),
						Math.round(b * scale)
					];
				}
				color = 'rgb(' + color.join(',') + ')';
				nightmodeColor = 'rgb(' + nightmodeColor.join(',') + ')';

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
				var color = 'rgb(' + [r, g, b].join(',') + ')';

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
		var strategy = modules['userHighlight'].autoColorUsing.find(function(strategy) {
			return strategy.name == name;
		});

		return strategy ? strategy.function : undefined;
	},
	coloredUsernames: {},
	highlightUser: function(userid) {
		var name = 'author.id-t2_' + userid;
		return this.highlight('user', name);
	},
	highlight: function(name, selector, container) {
		if (selector === undefined) {
			selector = name;
		}
		if (container === undefined) {
			container = '.thing .tagline';
		}
		var color = this.colorTable[name].color;
		var hoverColor = this.colorTable[name].hoverColor;
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

			var search = new RegExp('{{' + key + '}}', 'g');
			var value = placeholderValues[key];

			if (value !== null && value !== undefined) {
				css = css.replace(search, value);
			}
		}

		return RESUtils.addCSS(css);
	},
	generateHoverColor: function(color) { // generate a darker color
		if (!/^#[0-9A-F]{6}$/i.test(color)) {
			return false;
		}
		var R = parseInt(color.substr(1,2), 16);
		var G = parseInt(color.substr(3,2), 16);
		var B = parseInt(color.substr(5,2), 16);
		// R = R + 0.25 *(255-R); // 25% lighter
		R = Math.round(0.75*R) + 256; // we add 256 to add a 1 before the color in the hex format
		G = Math.round(0.75*G) + 256; // then we remove the 1, this have for effect to
		B = Math.round(0.75*B) + 256; // add a 0 before one char color in hex format (i.e. 0xA -> 0x10A -> 0x0A)
		return '#' + R.toString(16).substr(1) + G.toString(16).substr(1) + B.toString(16).substr(1);
	},
	generateHoverColors: function() { // apply generateHoverColor on all option
		var options = ['OPColor', 'adminColor', 'friendColor', 'modColor', 'firstCommentColor'];
		var error = false;
		options.forEach(function(option) {
			var newColor = modules['userHighlight'].generateHoverColor(modules['settingsConsole'].getOptionValue('userHighlight', option));
			if (newColor !== false) {
				modules['settingsConsole'].setOptionValue('userHighlight', option + 'Hover', newColor);
			} else {
				error = true;
			}
		});
		if (error) {
			alert('Some Hover color couldn\'t be generated. This is probably due to the use of color in special format.');
		}
	}
});
