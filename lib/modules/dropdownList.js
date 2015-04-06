addModule('dropdownList', function(dropdownList, moduleID) {
	dropdownList.moduleName = 'RES Dropdown Menu';
	dropdownList.category = 'Core';
	dropdownList.description = 'Customize the behavior of small dropdown menus that appear when you hover on or click certain elements',
	dropdownList.alwaysEnabled = true;
	$.extend(dropdownList, {
		options: {
			openDelay: {
				type: 'text',
				value: 200
			},
			fadeDelay: {
				type: 'text',
				value: 500
			},
			fadeSpeed: {
				type: 'text',
				value: 0.3
			},
			closeOnMouseOut: {
				type: 'boolean',
				value: true
			}
		},
		beforeLoad: function() {
			for (var option in dropdownList.options) {
				if (!dropdownList.options.hasOwnProperty(option)) {
					continue;
				}

				var value = dropdownList.options[option].value;
				var defaultValue = dropdownList.options[option].default;
				if (typeof defaultValue === 'number') {
					value = RESUtils.firstValid(parseFloat(value), defaultValue);
				}

				dropdownList.defaults[option] = value;
			}
		},
		defaults: {}, // populated in beforeLoad
		container: null,
		/*
		The contents of state are as follows:
		state: {
			//The DOM element that triggered the dropdownList popup.
			element: null,
			//Resolved values for timing, etc.
			options: null,
			//Usecase specific object
			context: null,
			callback: null,
		}*/
		state: null,
		showTimer: null,
		hideTimer: null,
		begin: function(onElement, conf, callback, context) {
			if (dropdownList.container === null) {
				dropdownList.create();
			}
			if (dropdownList.state !== null) {
				dropdownList.close(false);
			}
			var state = dropdownList.state = {
				element: onElement,
				options: $.extend({}, dropdownList.defaults, conf),
				context: context,
				callback: callback
			};
			dropdownList.showTimer = setTimeout(function() {
				dropdownList.cancelShowTimer();
				dropdownList.clearShowListeners();
				dropdownList.open();

				$(dropdownList.state.element).on('mouseleave', dropdownList.startHideTimer);
			}, state.options.openDelay);

			$(state.element).on('click', dropdownList.cancelShow);
			$(state.element).on('mouseleave', dropdownList.cancelShow);
		},

		create: function() {
			var $container = $('<div id="RESdropdownListContainer" class="RESDropdownList"> \
				<ul class="RESDropdownOptions"></ul>	\
				</div>'),
				container = $container[0];

			$container
				.appendTo(document.body)
				.on('mouseenter', function() {
					if (dropdownList.state !== null) {
						dropdownList.cancelHideTimer();
					}
				})
				.on('mouseleave', function() {
					if (dropdownList.state !== null) {
						dropdownList.cancelHideTimer();
						if (dropdownList.state.options.closeOnMouseOut === true) {
							dropdownList.startHideTimer();
						}
					}
				});
			dropdownList.container = container;
		},
		open: function() {
			var def = $.Deferred();
			def.promise()
				.progress(dropdownList.set)
				.done(dropdownList.set)
				.fail(dropdownList.close);
			dropdownList.state.callback(def, dropdownList.state.element, dropdownList.state.context);
			modules['styleTweaks'].setSRStyleToggleVisibility(false, moduleID);
		},
		set: function(items) {
			var container = dropdownList.container;

			if (!dropdownList.state) {
				return;
			}
			if (dropdownList.state.contents !== items) {
				$(container).find('> ul').empty().append(items);
				dropdownList.state.contents = items;
			}

			var XY = RESUtils.getXYpos(dropdownList.state.element);

			var width = $(dropdownList.state.element).width();
			var height = $(dropdownList.state.element).height();

			var containerWidth = $(container).width();

			$(container).css({
				top: XY.y + (height * 1.1),
				left: XY.x + (width * 1.3) - (containerWidth),
				zIndex: 2147483646
			});

		},
		cancelShow: function() {
			dropdownList.close(true);
		},
		clearShowListeners: function() {
			if (dropdownList.state === null) {
				return;
			}
			var element = dropdownList.state.element;
			var func = dropdownList.cancelShow;

			$(element).off('click', func).off('mouseleave', func);
		},
		cancelShowTimer: function() {
			if (dropdownList.showTimer === null) {
				return;
			}
			clearTimeout(dropdownList.showTimer);
			dropdownList.showTimer = null;
		},
		startHideTimer: function() {
			if (dropdownList.state !== null) {
				dropdownList.hideTimer = setTimeout(function() {
					dropdownList.cancelHideTimer();
					dropdownList.close(true);
				}, dropdownList.state.options.fadeDelay);
			}
		},
		cancelHideTimer: function() {
			if (dropdownList.state !== null) {
				$(dropdownList.state.element).off('mouseleave', dropdownList.startHideTimer);
			}
			if (dropdownList.hideTimer === null) {
				return;
			}
			clearTimeout(dropdownList.hideTimer);
			dropdownList.hideTimer = null;
		},
		close: function(fade) {
			function afterHide() {
				$('#RESdropdownListTitle, #RESdropdownListBody').empty();
				dropdownList.clearShowListeners();
				dropdownList.cancelShowTimer();
				dropdownList.cancelHideTimer();
				dropdownList.state = null;

				modules['styleTweaks'].setSRStyleToggleVisibility(true, moduleID);
			}
			if (fade && dropdownList.state !== null) {
				RESUtils.fadeElementOut(dropdownList.container, dropdownList.state.options.fadeSpeed, afterHide);
			} else {
				$(dropdownList.container).hide(afterHide);
			}
		}
	});
});
