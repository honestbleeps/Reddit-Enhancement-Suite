addModule('submitIssue', function(module, moduleID) {
	module.moduleName = 'Submit an Issue';
	module.category = 'About RES';
	module.alwaysEnabled = true;

	module.description = 'If you have any problems with RES, visit <a href="/r/RESissues">/r/RESissues</a>. If you have any requests or questions, visit <a href="/r/Enhancement">/r/Enhancement</a>.';
	module.include = [ 'submit' ];

	var subreddits = ['enhancement', 'resissues'];

	module.go = function() {
		if (this.isMatchURL()) {
			this.checkIfSubmitting();
		}
	}

	module.checkIfSubmitting = function() {
		var thisSubRedditInput = document.getElementById('sr-autocomplete');
		if (thisSubRedditInput) {
			var thisSubReddit = thisSubRedditInput.value,
				title = document.querySelector('textarea[name=title]');
			if (typeof this.thisSubRedditInputListener === 'undefined') {
				this.thisSubRedditInputListener = true;
				thisSubRedditInput.addEventListener('change', function(e) {
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
		RESTemplates.load("submitWizardCSS", function(template) {
			var css = template.text();
			RESUtils.addCSS(css);
		});
	}

	function addWizardElements() {
		var textDesc = document.getElementById('text-desc');
		var submittingToEnhancement = RESUtils.createElementWithID('div', 'submittingToEnhancement', 'RESDialogSmall');

		RESTemplates.load("submitWizard", function(template) {
			var submittingHTML = template.html();
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
							BrowserStrategy.ajax({
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
							BrowserStrategy.ajax({
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
					$('#sr-autocomplete').val('RESIssues');
					$('li a.text-button').click();
					$('#submittingToEnhancement').fadeOut();

					var txt = '- RES Version: ' + RESVersion + '\n';
					txt += '- Browser: ' + BrowserDetect.browser + '\n';
					if (typeof navigator === 'undefined') navigator = window.navigator;
					txt += '- Browser Version: ' + BrowserDetect.version + '\n';
					txt += '- Cookies Enabled: ' + navigator.cookieEnabled + '\n';
					txt += '- Night mode: ' + modules['nightMode'].isNightModeOn() + '\n';
					txt += '- Platform: ' + BrowserDetect.OS + '\n\n';
					txt += '- Did you search /r/RESIssues before submitting this:   ???\n\n';
					txt += '- Please list any other extensions you run (especially things like ad blockers, privacy extensions, etc):   ???\n\n';
					$('.usertext-edit textarea').val(txt);
					title.value = '[bug]  ???';

					guiders.createGuider({
						attachTo: '#title-field',
						description: 'Please write a summary of the bug in the "title" field and fill out <strong>all</strong> details in the text portion of the post including steps on reproducing the bug if at all possible. This helps us support you better!',
						id: 'first',
						next: 'second',
						// offset: { left: -200, top: 120 },
						position: 3,
						title: 'Submitting a bug:'
					}).show();

				}
			);
			$('#submittingToEnhancement').on('click', '#submittingFeature',
				function() {
					$('#sr-autocomplete').val('Enhancement');
					$('#submittingToEnhancement').fadeOut();
					title.value = '[feature request]    ???';
				}
			);
			$('#submittingToEnhancement').on('click', '#RESSubmitOther',
				function() {
					$('#sr-autocomplete').val('Enhancement');
					$('#submittingToEnhancement').fadeOut();
					title.value = '';
				}
			);
			$('#submittingToEnhancement').fadeIn();
		}, 1000);
	}

	function parseObjectList(text) {
		var bugs = text.split('---'),
			bugLines, bugData, line,
			bugObj, bugLI, bugHTML;

		if (bugs && bugs[0].length === 0) {
			bugs.shift();
		}
		var bugObjs = $.map(bugs, function(bugText, idx) {
			var bugObj = {};

			bugData = bugText.replace(/\r/g,'').split('\n');
			for (var i in bugData) {
				line = $.trim(bugData[i]).split(':');
				if (line.length > 0) {
					key = line.shift();
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
		var listItems = $.map(objects, function(bugObj, idx) {
			var bugLI, bugHTML;

			if (bugObj.title) {
				bugLI = $('<li>');
				if (bugObj.url) {
					bugHTML = $('<a target="_blank">');
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
});
