addModule('hover', function (hover, moduleID) {
	hover.moduleName = 'RES Pop-up Hover';
	hover.category = 'About RES';
	$.extend(hover, {
		options: {
			openDelay: {
				type: 'text',
				value: 500
			},
			fadeDelay: {
				type: 'text',
				value: 500
			},
			fadeSpeed: {
				type: 'text',
				value: 0.3
			},
			width:  {
				type: 'text',
				value: 512
			},
			closeOnMouseOut: {
				type: 'boolean',
				value: true
			}
		},
		beforeLoad: function() {
			for (var option in hover.options) {
				if (!hover.options.hasOwnProperty(option)) {
					continue;
				}

				var value = hover.options[option].value;
				var defaultValue = hover.options[option].default;
				if (typeof defaultValue === "number") {
					value = RESUtils.firstValid(parseFloat(value), defaultValue);
				}

				hover.defaults[option] = value;
			}
		},
		defaults: {}, // populated in beforeLoad
		container: null,
		/*
		The contents of state are as follows:
		state: {
			//The DOM element that triggered the hover popup.
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
			if (hover.container === null) {
				hover.create();
			}
			if (hover.state !== null) {
				hover.close(false);
			}
			var state = hover.state = {
				element: onElement,
				options: $.extend({}, hover.defaults, conf),
				context: context,
				callback: callback,
			};
			hover.showTimer = setTimeout(function() {
				hover.cancelShowTimer();
				hover.clearShowListeners();
				hover.open();

				$(hover.state.element).on('mouseleave', hover.startHideTimer);
			}, state.options.openDelay);

			$(state.element).on('click', hover.cancelShow);
			$(state.element).on('mouseleave', hover.cancelShow);
		},

		create: function() {
			var $container = $('<div id="RESHoverContainer" class="RESDialogSmall"> \
				<h3 id="RESHoverTitle"></h3> \
				<div class="RESCloseButton">x</div> \
				<div id="RESHoverBody" class="RESDialogContents"> \
				</div>'),
				container = $container[0];

			$container
				.appendTo(document.body)
				.on('mouseenter', function() {
					if (hover.state !== null) {
						hover.cancelHideTimer();
					}
				})
				.on('mouseleave', function() {
					if (hover.state !== null) {
						hover.cancelHideTimer();
						if (hover.state.options.closeOnMouseOut === true) {
							hover.startHideTimer();
						}
					}
				})
				.on('click', '.RESCloseButton', function() {
					hover.close(true);
				});

			hover.container = container;

			var css = '';

			css += '#RESHoverContainer { display: none; position: absolute; z-index: 10001; }';
			css += '#RESHoverContainer:before { content: ""; position: absolute; top: 10px; left: -26px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer:after { content: ""; position: absolute; top: 10px; left: -24px; border-style: solid; border-width: 10px 29px 10px 0; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer.right:before { content: ""; position: absolute; top: 10px; right: -26px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #c7c7c7; display: block; width: 0; z-index: 1; }';
			css += '#RESHoverContainer.right:after { content: ""; position: absolute; top: 10px; right: -24px; left: auto; border-style: solid; border-width: 10px 0 10px 29px; border-color: transparent #f0f3fc; display: block; width: 0; z-index: 1; }';

			RESUtils.addCSS(css);
		},
		open: function() {
			var def = $.Deferred();
			def.promise()
				.progress(hover.set)
				.done(hover.set)
				.fail(hover.close);
			hover.state.callback(def, hover.state.element, hover.state.context);
		},
		set: function(header, body) {
			var container = hover.container;
			if (header != null) {
				$('#RESHoverTitle').empty().append(header);
			}
			if (body != null) {
				$('#RESHoverBody').empty().append(body);
			}

			var XY = RESUtils.getXYpos(hover.state.element);

			var width = $(hover.state.element).width();
			var tooltipWidth = $(container).width();
			tooltipWidth = hover.state.options.width;

			RESUtils.fadeElementIn(hover.container, hover.state.options.fadeSpeed);
			if ((window.innerWidth - XY.x - width) <= tooltipWidth) {
				// tooltip would go off right edge - reverse it.
				container.classList.add('right');
				$(container).css({
					top: XY.y - 14,
					left: XY.x - tooltipWidth - 30,
					width: tooltipWidth
				});
			} else {
				container.classList.remove('right');
				$(container).css({
					top: XY.y - 14,
					left: XY.x + width + 25,
					width: tooltipWidth
				});
			}
		},
		cancelShow: function() {
			hover.close(true);
		},
		clearShowListeners: function() {
			if (hover.state === null) {
				return;
			}
			var element = hover.state.element;
			var func = hover.cancelShow;

			$(element).off('click', func).off('mouseleave', func);
		},
		cancelShowTimer: function() {
			if (hover.showTimer === null) {
				return;
			}
			clearTimeout(hover.showTimer);
			hover.showTimer = null;
		},
		startHideTimer: function() {
			if (hover.state !== null) {
				hover.hideTimer = setTimeout(function() {
					hover.cancelHideTimer();
					hover.close(true);
				}, hover.state.options.fadeDelay);
			}
		},
		cancelHideTimer: function() {
			if (hover.state !== null) {
				$(hover.state.element).off('mouseleave', hover.startHideTimer);
			}
			if (hover.hideTimer === null) {
				return;
			}
			clearTimeout(hover.hideTimer);
			hover.hideTimer = null;
		},
		close: function(fade) {
			function afterHide() {
				$('#RESHoverTitle, #RESHoverBody').empty();
				hover.clearShowListeners();
				hover.cancelShowTimer();
				hover.cancelHideTimer();
				hover.state = null;
			}
			if (fade && hover.state !== null) {
				RESUtils.fadeElementOut(hover.container, hover.state.options.fadeSpeed, afterHide);
			} else {
				$(hover.container).hide(afterHide);
			}
		}
	});
});
