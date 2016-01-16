/*
How to use me?
	Move me into the lib/modules/ folder. Add me to the manifest of your browser.
	Then go on About RES -> wikiCheck and push the button!
	This will check the wiki and list all undocumented options.
*/
addModule('wikiCheck', function(module, moduleID) {
	module.moduleName = 'Wiki Check';
	module.category = 'About RES';
	module.description = 'Check if all options are listed on the wiki.';
	module.options = {
		check: {
			type: 'button',
			text: 'Check',
			callback: check,
			description: 'Launch the test (open the dev console !).'
		}
	};
	module.isMatchURL = function() {
		return false;
	};
	function check() {
		fetchPages();
	}
	function fetchPages() {
		console.group('Fetching wiki pages');
		$.getJSON('http://api.reddit.com/r/Enhancement/wiki/pages/', function(data){
			console.log('Wiki page list fetched');
			var wikiPages = data.data;
			var fetchedPages = 0;
			var optionsList = [];
			wikiPages.forEach(function(wikiPage, i) {
				setTimeout(function(page) {
					$.getJSON('http://api.reddit.com/r/Enhancement/wiki/' + page, function(data) {
						var md = data.data.content_md;
						var options = md.match(/######\S+/g) || [];
						options.forEach(function(option) {
							optionsList.push(option.substr(6)); // remove ######
						});
						fetchedPages++;
						console.log(fetchedPages + '/' + wikiPages.length);
						if (fetchedPages === wikiPages.length) {
							fetchOptions(optionsList);
							console.groupEnd();
						}
					});
				}, i*1000, wikiPage);
			});
		});
	}
	function fetchOptions(optionsList) {
		var missingOptions = [];
		for (var m in modules) {
			if (!m.hidden) {
				console.groupCollapsed(m);
				for (var o in modules[m].options) {
					if (!modules[m].options[o].noconfig) {
						if (optionsList.indexOf(o) === -1) {
							console.warn(o);
							missingOptions.push(m + '/' + o);
						} else {
							console.info(o);
						}
					}
				}
				console.groupEnd();
			}
		}
		if (missingOptions.length === 0) {
			console.info('All options documented !');
		} else {
			console.error('Missing ' + missingOptions.length + ' options documentations');
			console.groupCollapsed('Missing options');
			missingOptions.forEach(function(v) {
				console.log(v);
			});
			console.groupEnd();
		}
	}
});
