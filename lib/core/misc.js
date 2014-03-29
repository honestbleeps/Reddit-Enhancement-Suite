
// DOM utility functions
var escapeLookups = {
	"&": "&amp;",
	'"': "&quot;",
	"<": "&lt;",
	">": "&gt;"
};

function escapeHTML(str) {
	return (typeof str === 'undefined' || str === null) ?
		null :
		str.toString().replace(/[&"<>]/g, function(m) {
			return escapeLookups[m];
		});
}

// this alias is to account for opera having different behavior...
if (typeof navigator === 'undefined') {
	navigator = window.navigator;
}

//Because Safari 5.1 doesn't have Function.bind
if (typeof Function.prototype.bind === 'undefined') {
	Function.prototype.bind = function(context) {
		var oldRef = this;
		return function() {
			return oldRef.apply(context || null, Array.prototype.slice.call(arguments));
		};
	};
}

var safeJSON = {
	// safely parses JSON and won't kill the whole script if JSON.parse fails
	// if localStorageSource is specified, will offer the user the ability to delete that localStorageSource to stop further errors.
	// if silent is specified, it will fail silently...
	parse: function(data, localStorageSource, silent) {
		try {
			if (BrowserDetect.isSafari()) {
				if (data.substring(0, 2) === 's{') {
					data = data.substring(1, data.length);
				}
			}
			return JSON.parse(data);
		} catch (error) {
			if (silent) {
				return {};
			}
			if (localStorageSource) {
				var msg = 'Error caught: JSON parse failure on the following data from "' + localStorageSource + '": <textarea rows="5" cols="50">' + data + '</textarea><br>RES can delete this data to stop errors from happening, but you might want to copy/paste it to a text file so you can more easily re-enter any lost information.';
				alert(msg, function() {
					// back up a copy of the corrupt data
					localStorage.setItem(localStorageSource + '.error', data);
					// delete the corrupt data
					RESStorage.removeItem(localStorageSource);
				});
			} else {
				alert('Error caught: JSON parse failure on the following data: ' + data);
			}
			return {};
		}
	}
};

var lastPerf = 0;

function perfTest(name) {
	var now = Date.now();
	var diff = now - lastPerf;
	console.log(name + ' executed. Diff since last: ' + diff + 'ms');
	lastPerf = now;
}
