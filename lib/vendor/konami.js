/*
 * Konami-JS ~
 * :: Now with support for touch events and multiple instances for
 * :: those situations that call for multiple easter eggs!
 * Code: http://konami-js.googlecode.com/
 * Examples: http://www.snaptortoise.com/konami-js
 * Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
 * Version: 1.3.2 (7/02/2010)
 * Licensed under the GNU General Public License v3
 * http://www.gnu.org/copyleft/gpl.html
 * Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+ and Mobile Safari 2.2.1
 */
var Konami = function() {
	var konami = {
		addEvent: function(obj, type, fn, ref_obj) {
			if (obj.addEventListener)
				obj.addEventListener(type, fn, false);
			else if (obj.attachEvent) {
				// IE
				obj["e" + type + fn] = fn;
				obj[type + fn] = function() {
					obj["e" + type + fn](window.event, ref_obj);
				}

				obj.attachEvent("on" + type, obj[type + fn]);
			}
		},
		input: "",
		prepattern: "38384040373937396665",
		almostThere: false,
		pattern: "3838404037393739666513",
		load: function(link) {
			this.addEvent(document, "keydown", function(e, ref_obj) {
				if (ref_obj) konami = ref_obj; // IE
				konami.input += e ? e.keyCode : event.keyCode;
				if (konami.input.length > konami.pattern.length) konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
				if (konami.input == konami.pattern) {
					konami.code(link);
					konami.input = "";
					return;
				} else if ((konami.input == konami.prepattern) || (konami.input.substr(2, konami.input.length) == konami.prepattern)) {
					konami.almostThere = true;
					setTimeout(function() {
						konami.almostThere = false;
					}, 2000);
				}
			}, this);
			this.iphone.load(link);
		},
		code: function(link) {
			window.location = link;
		},
		iphone: {
			start_x: 0,
			start_y: 0,
			stop_x: 0,
			stop_y: 0,
			tap: false,
			capture: false,
			orig_keys: "",
			keys: ["UP", "UP", "DOWN", "DOWN", "LEFT", "RIGHT", "LEFT", "RIGHT", "TAP", "TAP", "TAP"],
			code: function(link) {
				konami.code(link);
			},
			load: function(link) {
				this.orig_keys = this.keys;
				konami.addEvent(document, "touchmove", function(e) {
					if (e.touches.length === 1 && konami.iphone.capture == true) {
						var touch = e.touches[0];
						konami.iphone.stop_x = touch.pageX;
						konami.iphone.stop_y = touch.pageY;
						konami.iphone.tap = false;
						konami.iphone.capture = false;
						konami.iphone.check_direction();
					}
				});
				konami.addEvent(document, "touchend", function(evt) {
					if (konami.iphone.tap == true) konami.iphone.check_direction(link);
				}, false);
				konami.addEvent(document, "touchstart", function(evt) {
					konami.iphone.start_x = evt.changedTouches[0].pageX;
					konami.iphone.start_y = evt.changedTouches[0].pageY;
					konami.iphone.tap = true;
					konami.iphone.capture = true;
				});
			},
			check_direction: function(link) {
				x_magnitude = Math.abs(this.start_x - this.stop_x);
				y_magnitude = Math.abs(this.start_y - this.stop_y);
				x = ((this.start_x - this.stop_x) < 0) ? "RIGHT" : "LEFT";
				y = ((this.start_y - this.stop_y) < 0) ? "DOWN" : "UP";
				result = (x_magnitude > y_magnitude) ? x : y;
				result = (this.tap == true) ? "TAP" : result;

				if (result == this.keys[0]) this.keys = this.keys.slice(1, this.keys.length);
				if (this.keys.length === 0) {
					this.keys = this.orig_keys;
					this.code(link);
				}
			}
		}
	}
	return konami;
};
