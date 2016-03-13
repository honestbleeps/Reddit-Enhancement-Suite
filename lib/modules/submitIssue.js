addModule('submitIssue', function(module, moduleID) {
	module.moduleName = 'Submit an Issue';
	module.category = 'About RES';
	module.alwaysEnabled = true;
	module.sort = -7;

	module.description = 'If you have any problems with RES, visit <a href="/r/RESissues">/r/RESissues</a>. If you have any requests or questions, visit <a href="/r/Enhancement">/r/Enhancement</a>.';
	module.include = [ 'submit' ];

	var subreddits = ['enhancement', 'resissues'];

	module.go = function() {
		if (this.isMatchURL()) {
			this.checkIfSubmitting();
		}
	};

	module.checkIfSubmitting = function() {
		var thisSubRedditInput = document.getElementById('sr-autocomplete');
		if (thisSubRedditInput) {
			var thisSubReddit = thisSubRedditInput.value,
				title = document.querySelector('textarea[name=title]');
			if (typeof this.thisSubRedditInputListener === 'undefined') {
				this.thisSubRedditInputListener = true;
				thisSubRedditInput.addEventListener('change', function(e) {
					if (e.res) return;
					module.checkIfSubmitting();
				}, false);
			}
			if (subreddits.indexOf(thisSubReddit.toLowerCase()) !== -1) {
				addWizardCSS();
				this.submittingToEnhancement = addWizardElements();
				wireUpWizard();
			} else if (typeof this.submittingToEnhancement !== 'undefined') {
				this.submittingToEnhancement.parentNode.removeChild(this.submittingToEnhancement);
				if (title.value === 'Submitting a bug? Please read the box above...') {
					title.value = '';
				}
			}
		}
	};

	function addWizardCSS() {
		RESTemplates.load('submitWizardCSS', function(template) {
			var css = template.text();
			RESUtils.addCSS(css);
		});
	}

	function addWizardElements() {
		var textDesc = document.getElementById('text-desc');
		var submittingToEnhancement = RESUtils.createElement('div', 'submittingToEnhancement', 'RESDialogSmall');

		RESTemplates.load('submitWizard', function(template) {
			var submittingHTML = template.html({ foolin: foolin() });
			// allowing this use of .html() is a rarity - for readability's sake since there's no variables
			// or remote input here, we'll be OK.
			$(submittingToEnhancement).html(submittingHTML);
		});

		RESUtils.insertAfter(textDesc, submittingToEnhancement);

		return submittingToEnhancement;
	}


	function wireUpWizard() {
		var title = document.querySelector('textarea[name=title]');
		setTimeout(function() {
			$('#submittingToEnhancement').on('click', '#RESSubmitBug',
				function() {
					$('#RESSubmitOptions').fadeOut(
						function() {
							$('#RESBugReport').fadeIn();
							RESEnvironment.ajax({
								method: 'GET',
								url: location.protocol + '//' + location.hostname + '/r/Enhancement/wiki/knownbugs.json',
								onload: function(response) {
									var data = safeJSON.parse(response.responseText),
										text;

									if (data.data) {
										text = data.data['content_md'];
									}
									if (text) {
										var objects = parseObjectList(text);
										var listItems = createLinkList(objects);
										$('#RESKnownBugs').empty()
											.append(listItems);
									}
								}
							});
						}
					);
				}
			);
			$('#submittingToEnhancement').on('click', '#RESSubmitFeatureRequest',
				function() {
					$('#RESSubmitOptions').fadeOut(
						function() {
							$('#RESFeatureRequest').fadeIn();
							RESEnvironment.ajax({
								method: 'GET',
								url: location.protocol + '//' + location.hostname + '/r/Enhancement/wiki/knownrequests.json',
								onload: function(response) {
									var data = safeJSON.parse(response.responseText),
										text;

									if (data.data) {
										text = data.data['content_md'];
									}
									if (text) {
										var objects = parseObjectList(text);
										var listItems = createLinkList(objects);
										$('#RESKnownFeatureRequests').empty()
											.append(listItems);
									}
								}
							});
						}
					);
				}
			);
			$('#submittingToEnhancement').on('click', '#submittingBug',
				function() {
					updateSubreddit('RESIssues');
					$('li a.text-button').click();
					$('#submittingToEnhancement').fadeOut();

					var txt = '';
					txt += '*What\'s the problem?*   \n';
					txt += '  ???\n';
					txt += '\n\n\n';
					txt += '*What other browser extensions are installed?*  \n';
					txt += '  ???\n';
					txt += '\n';
					txt += '*Did you read the known issues and search /r/RESissues?*  \n';
					txt += '  ???\n';
					txt += '\n\n\n';
					txt += '- Night mode: ' + modules['nightMode'].isNightModeOn() + '\n';
					txt += '- RES Version: ' + RESMetadata.version + '\n';
					txt += '- Browser: ' + BrowserDetect.browser + '\n';
					txt += '- Browser Version: ' + BrowserDetect.version + '\n';
					txt += '- Cookies Enabled: ' + navigator.cookieEnabled + '\n';
					txt += '- Platform: ' + BrowserDetect.OS + '\n';
					txt += '\n';
					$('.usertext-edit textarea').val(txt);
					title.value = '[bug]  ???';

					var guiderText = '\
						<p>Summarize your problem in the title and add details in the text:</p> \
						<dl> \
							<dt>Screenshots!</dt> <dd>A picture is worth a thousand words.</dd> \
							<dt>What makes this happen?</dt> <dd>clicked a link, clicked a button, opened an image expando, ... </dd> \
							<dt>Where does this happen?</dt> <dd>in a particular subreddit, on comments posts, on frontpage (reddit.com), on /r/all, ...</dd> \
						</dl> \
						<p>More detail means faster fixes.  Thanks!</p> \
						';
					var buttons = ' \
						<footer> \
							<small> \
								<a href="/r/RESissues/wiki/knownissues">known issues</a> \
								|  <a href="/r/RESissues/wiki/postanissue">troubleshooting</a> \
							</small> \
						</footer> \
						';

					guiders.createGuider({
						attachTo: '#title-field',
						description: guiderText,
						buttonCustomHTML: buttons,
						id: 'first',
						next: 'second',
						// offset: { left: -200, top: 120 },
						position: 3,
						title: 'Please fill out all the ??? questions'
					}).show();

				}
			);
			$('#submittingToEnhancement').on('click', '#submittingFeature',
				function() {
					updateSubreddit('Enhancement');
					$('#submittingToEnhancement').fadeOut();
					title.value = '[feature request]    ???';
				}
			);
			$('#submittingToEnhancement').on('click', '#RESSubmitOther',
				function() {
					updateSubreddit('Enhancement');
					$('#submittingToEnhancement').fadeOut();
					title.value = '';
				}
			);
			$('#submittingToEnhancement').fadeIn();
		}, 1000);
	}

	function updateSubreddit(subreddit) {
		var input = document.querySelector('#sr-autocomplete');
		input.value = subreddit;
		var e = new Event('change');
		e.res = true;
		input.dispatchEvent(e);
	}

	function parseObjectList(text) {
		var bugs = text.split('---');

		if (bugs && bugs[0].length === 0) {
			bugs.shift();
		}

		var bugObjs = bugs.map(function(bugText) {
			var bugObj = {},
				bugData = bugText.replace(/\r/g,'').split('\n');

			for (var i in bugData) {
				var line = $.trim(bugData[i]).split(':');
				if (line.length > 0) {
					var key = line.shift();
					if (key) {
						bugObj[key] = line.join(':');
					}
				}
			}

			return bugObj;
		});

		return bugObjs;
	}

	function createLinkList(objects) {
		var listItems = objects.map(function(bugObj) {
			if (bugObj.title) {
				var bugLI = $('<li>');
				if (bugObj.url) {
					var bugHTML = $('<a target="_blank">');
					$(bugHTML).attr('href', bugObj.url).text(bugObj.title);
					$(bugLI).append(bugHTML);
				} else {
					$(bugLI).text(bugObj.title);
				}
				return bugLI;
			}
		});

		return listItems;
	}

	function foolin() {
		var now = new Date();
		if ((now.getMonth() === 2 && now.getDate() > 30) ||
			(now.getMonth() === 3 && now.getDate() <= 2)) {
			return true;
		}
	}
});
