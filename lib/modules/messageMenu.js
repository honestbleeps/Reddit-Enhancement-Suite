addModule('messageMenu', function(module, moduleID) {
	module.moduleName = 'Message Menu';
	module.category = ['Browsing', 'My account'];
	module.description = 'Navigate quickly to inboxes and other parts of the reddit messaging system';

	module.options = {
		links: {
			type: 'table',
			addRowNext: '+add shortcut',
			fields: [{
				name: 'label',
				type: 'text'
			}, {
				name: 'url',
				type: 'text'
			}],
			value: [
				[ 'compose', '/message/compose' ],
				[ 'all', '/message/inbox' ],
				[ 'unread', '/message/unread'],
				[ 'messages', '/message/messages'],
				[ 'comment replies', '/message/comments' ],
				[ 'post replies', '/message/selfreply'],
				[ '/u/ mentions', '/message/mentions' ]
			]
		},
		useQuickMessage: {
			type: 'boolean',
			description: 'Use Quick Message pop-up when composing a new message',
			value: true
		},
		hoverDelay: {
			type: 'text',
			value: 1000,
			description: 'Delay, in milliseconds, before hover tooltip loads. Default is 800.',
			advanced: true
		},
		fadeDelay: {
			type: 'text',
			value: 200,
			description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.',
			advanced: true
		},
		fadeSpeed: {
			type: 'text',
			value: 0.7,
			description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
			advanced: true
		}
	};

	module.go = function() {
		if (!this.isEnabled() || !this.isMatchURL()) {
			return;
		}

		$('#mail, .mail-count, #NREMail, #NREMailCount').on('mouseover', onMouseOver);
	};

	var onMouseOver = function(e) {
		modules['hover'].dropdownList(moduleID)
			.target(e.target)
			.options({
				openDelay: module.options.hoverDelay.value,
				fadeDelay: module.options.fadeDelay.value,
				fadeSpeed: module.options.fadeSpeed.value
			})
			.populateWith(populate)
			.begin();
	};


	var menuItems;
	var populate = function(def, obj, context) {
		if (!menuItems) {
			menuItems = module.options.links.value
				.map(populateItem)
				.reduce(function(prev, curr) {
					return prev.add(curr);
				}, $());

			menuItems = menuItems.add(populateItem([
				'<i>' + module.moduleName + '</i>',
				modules['settingsNavigation'].makeUrlHash(moduleID)
			]));
		}

		def.resolve(menuItems);
	};

	var populateItem = function(link) {
		var label = link[0] || '',
		 	url = link[1] || '',
			compose = url.indexOf('/message/compose') !== -1,
			$link = $('<a />')
				.safeHtml(label)
				.attr('href', url);

		if (compose) {
			$link.append('<span class="RESMenuItemButton res-icon">&#xF139;</span>');
		} else if (url.indexOf('#!settings') !== -1) {
			$link.append('<span class="RESMenuItemButton gearIcon" />');
		}

		if (module.options.useQuickMessage.value && compose) {
			$link.on('click', function(e) {
				e.target = $(e.target).closest('a').get(0);
				if (modules['quickMessage'].onClickMessageLink(e)) {
					e.preventDefault();
				}
			});
		}

		$link.on('click', function(e) {
			modules['hover'].dropdownList(moduleID).close();
		});

		return $('<li />').append($link);
	};
});
