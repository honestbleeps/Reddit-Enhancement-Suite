addModule('sortCommentsTemporarily', function(module, moduleID) {
	module.moduleName = 'Sort Comments Temporarily';
	module.category = 'Comments';
	module.description = 'When changing the "sort by" for a post\'s comments, offer options to only do so temporarily.';
	module.include = [ 'comments'];

	module.options = {
		always: {
			type: 'boolean',
			value: false,
			description: 'Always change "sort by" temporarily; don\'t show the button'
		}
	};

	module.beforeLoad = function() {
		RESUtils.addCSS('\
			.drop-choices .RES-sort-button { visibility: hidden; margin-left: 1em; float: right; }	\
			.drop-choices form:hover .RES-sort-button { visibility: visible; }	\
		');
	}

	module.go = function() {
		setupMenu();
	};

	function setupMenu() {
		var menu = $(".commentarea form input[name=sort]").closest(".drop-choices").first();
		if (module.options.always.value) {
			menu.find(".choice").on('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				window.location = e.target.getAttribute('href');
			});
		} else {
			menu.find(".choice").each(function(index, element) {
				var button = $("<span>", { class: 'RES-sort-button' })
				button.text("(temporarily?)");
				$(element).append(button);

				button.on('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					window.location = element.getAttribute('href');
				});
			});
		}
	}

	module.showNotification = function(notificationID) {
		if (notificationID === 'always') {
			modules.notifications.showNotification({
				moduleID: moduleID,
				notificationID: notificationID,
				message: 'You can set the "sort by" menu to always be temporary in the ' + module.settingsNavigation.makeUrlHashLink(moduleID, 'always', 'RES settings console') + '.'
			});
		}
	};
});
