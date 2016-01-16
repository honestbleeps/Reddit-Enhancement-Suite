/*
Copyright (c) 2015 Scott McClaugherty

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

!(function ($, pluginName){

	var defaults = {
		padding: 40,
		triggerClass: pluginName,
		topClass: pluginName+'-top',
		bottomClass: pluginName+'-bottom',
		speed: 3
	};


	function setTimer(data, func) {
		if (data.timer > 0) {
			clearTimeout(data.timer);
			data.timer = 0;
		}
		if (func) {
			data.timer = setInterval(func, $.fx.interval);
		}
	}

	function stopScrolling() {
			var data = $(this).data(pluginName);
			$(data.triggers).remove();
			setTimer(data, null);
			$(this).removeData(pluginName);
			return this;
	}

	$.fn[pluginName] = function(opts) {
		if (opts === 'stop') return this.map(stopScrolling);
		var options = $.extend({}, defaults, opts);
		return this.map(function() {
			var $this = $(this);
			var top = $('<div>').addClass(options.topClass)[0],
				bottom = $('<div>').addClass(options.bottomClass)[0],
				triggers = [top, bottom];

			var data = {
				options: options,
				timer: 0,
				top: top,
				bottom: bottom,
				triggers: triggers
			};
			$this.data('edgescroll', data)

			$(triggers).addClass(options.triggerClass).css({
				height: options.padding,
				position: this==window?'fixed':'absolute'
			});

			$(this==window?document.body:this).append(triggers);

			$(triggers).hover(function(e) {
				var that = this;
				setTimer(data, function() {
					var delta = (that==top?-1:1) * options.speed;
					$this.scrollTop($this.scrollTop() + delta);
				});
			}, function(e) {
				setTimer(data, null);
			});

			return this;
		});
	};
})(jQuery, 'edgescroll');