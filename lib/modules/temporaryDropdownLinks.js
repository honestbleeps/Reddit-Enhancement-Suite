addModule('temporaryDropdownLinks', function(module, moduleID) {
	module.moduleName = 'Temporary Dropdown Links';
	module.category = 'UI';
	module.description = 'Offers temporary links for dropdowns.';
	module.include = [
		/^https?:\/\/[a-z]+\.reddit\.com\/(?:domain\/[\da-z.-]+\/|(?:r|me\/m|user\/\w+\/m)\/\w+\/)?(?:top|controversial)/,
		'comments'
	];

	module.options = {
		always: {
			type: 'boolean',
			value: false,
			description: 'Always change change links to temporary ones.'
		}
	};

	module.beforeLoad = function() {
		RESUtils.addCSS('\
			.drop-choices .RES-dropdown-button { visibility: hidden; margin-left: 1em; float: right; opacity:0.25; }	\
			.drop-choices form:hover .RES-dropdown-button { visibility: visible; }	\
			.drop-choices .RES-dropdown-button:hover { visibility: visible; opacity:1;}	\
		');
	}

	module.go = function() {
		if (module.isEnabled() && module.isMatchURL()) {
			setupMenu();
		}
	};

	function setupMenu() {
		var menu = $('.menuarea .drop-choices');
		var selector = '.choice';

		if (!module.options.always.value) {
			menu.find('.choice').each(function(index, element) {
				var button = $('<a>', { class: 'RES-dropdown-button' })
				button.text('(temporarily?)');
				button.attr('href', element.getAttribute('href'));
				$(element).prepend(button);

			});
			selector = '.RES-dropdown-button';
		}

		menu.find(selector).each(function(index, element) {
			var $input = $(element).closest('form').find('input');
			var name = $input.attr('name');
			var value = $input.attr('value');

			if (name && value) {
				$(element).attr('href', element.getAttribute('href') + '?' + name + '=' + value);
			}
		});

		menu.find(selector).on('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			window.location.href = e.target.getAttribute('href');
			return false;
		});
	}

	module.showNotification = function(notificationID) {
		if (notificationID === 'always') {
			modules.notifications.showNotification({
				moduleID: moduleID,
				notificationID: notificationID,
				message: 'You can set the dropdown links to always be temporary in the ' + module.settingsNavigation.makeUrlHashLink(moduleID, 'always', 'RES settings console') + '.'
			});
		}
	};
});
