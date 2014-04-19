// OperaBlink loads browsersupport-chrome first, then browsersupport-operablink.js for overrides

BrowserStrategy['storageSetup'] = function (thisJSON) {
	// I freaking hate having to use different code that won't run in other browsers to log debugs, so I'm overriding console.log with opera.postError here
	// so I don't have to litter my code with different statements for different browsers when debugging.
	RESLoadResourceAsText = function(filename, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if (callback) {
				callback(this.responseText);
			}
		};
		var id = chrome.i18n.getMessage("@@extension_id");
		xhr.open('GET', 'chrome-extension://' + id + '/' + filename);
		xhr.send();
	};
	console.log = opera.postError;
	opera.extension.addEventListener("message", operaMessageHandler, false);
	window.addEventListener("DOMContentLoaded", function(u) {
		// we've got opera, let's check for old localStorage...
		// RESInit() will be called from operaMessageHandler()
		opera.extension.postMessage(JSON.stringify(thisJSON));
	}, false);
}
