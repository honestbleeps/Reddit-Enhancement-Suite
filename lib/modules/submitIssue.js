addModule('submitIssue', function(module, moduleID) {
	module.moduleName = 'Submit an Issue';
	module.category = 'About RES';
	module.alwaysEnabled = true;
	module.sort = -7;

	module.description = 'If you have any problems with RES, visit <a href="/r/RESissues">/r/RESissues</a>. If you have any requests or questions, visit <a href="/r/Enhancement">/r/Enhancement</a>.';
	module.include = ['submit'];

	const subreddits = ['enhancement', 'resissues'];
	let submitWizardTemplate;

	module.beforeLoad = async function() {
		submitWizardTemplate = await RESTemplates.load('submitWizard');
	};

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

	function addWizardElements() {
		const textDesc = document.getElementById('text-desc');
		const submittingToEnhancement = RESUtils.createElement('div', 'submittingToEnhancement', 'RESDialogSmall');
		const submittingHTML = submitWizardTemplate.html({ foolin: foolin() });
		// allowing this use of .html() is a rarity - for readability's sake since there's no variables
		// or remote input here, we'll be OK.
		$(submittingToEnhancement).html(submittingHTML);

		RESUtils.insertAfter(textDesc, submittingToEnhancement);

		return submittingToEnhancement;
	}


	function wireUpWizard() {
		const title = document.querySelector('textarea[name=title]');
		$('#submittingToEnhancement')
			.on('click', '#RESSubmitBug', () => {
				$('#RESSubmitOptions').fadeOut(async () => {
					$('#RESBugReport').fadeIn();
					const { data } = await RESEnvironment.ajax({
						url: '/r/Enhancement/wiki/knownbugs.json',
						type: 'json'
					});

					if (data && data['content_md']) {
						const objects = parseObjectList(data['content_md']);
						const listItems = createLinkList(objects);
						$('#RESKnownBugs')
							.empty()
							.append(listItems);
					}
				});
			})
			.on('click', '#RESSubmitFeatureRequest', () => {
				$('#RESSubmitOptions').fadeOut(async () => {
					$('#RESFeatureRequest').fadeIn();
					const { data } = await RESEnvironment.ajax({
						url: '/r/Enhancement/wiki/knownrequests.json',
						type: 'json'
					});

					if (data && data['content_md']) {
						const objects = parseObjectList(data['content_md']);
						const listItems = createLinkList(objects);
						$('#RESKnownFeatureRequests')
							.empty()
							.append(listItems);
					}
				});
			})
			.on('click', '#submittingBug', async () => {
				updateSubreddit('RESIssues');
				$('li a.text-button').click();
				$('#submittingToEnhancement').fadeOut();

				const body = (await RESTemplates.load('submit-issue-default-body')).text({
					nightMode: modules['nightMode'].isNightModeOn(),
					version: RESMetadata.version,
					browser: BrowserDetect.browser,
					browserVersion: BrowserDetect.version,
					cookies: navigator.cookieEnabled
				});
				$('.usertext-edit textarea').val(body.trim());

				title.value = '[bug]  ???';

				const guiderText = `
					<p>Summarize your problem in the title and add details in the text:</p>
					<dl>
						<dt>Screenshots!</dt> <dd>A picture is worth a thousand words.</dd>
						<dt>What makes this happen?</dt> <dd>clicked a link, clicked a button, opened an image expando, ... </dd>
						<dt>Where does this happen?</dt> <dd>in a particular subreddit, on comments posts, on frontpage (reddit.com), on /r/all, ...</dd>
					</dl>
					<p>More detail means faster fixes.  Thanks!</p>
				`;
				const buttons = `
					<footer>
						<small>
							<a href="/r/RESissues/wiki/knownissues">known issues</a>
							|  <a href="/r/RESissues/wiki/postanissue">troubleshooting</a>
						</small>
					</footer>
				`;

				guiders.createGuider({
					attachTo: '#title-field',
					description: guiderText,
					buttonCustomHTML: buttons,
					id: 'first',
					next: 'second',
					// offset: { left: -200, top: 120 },
					position: 3,
					title: 'Please fill out all the ??? questions',
					onClose() {
						modules['styleTweaks'].setSRStyleToggleVisibility(true, 'submit-issue-guider');
					}
				}).show();
				modules['styleTweaks'].setSRStyleToggleVisibility(false, 'submit-issue-guider');
			})
			.on('click', '#submittingFeature', () => {
				updateSubreddit('Enhancement');
				$('#submittingToEnhancement').fadeOut();
				title.value = '[feature request]    ???';
			})
			.on('click', '#RESSubmitOther', () => {
				updateSubreddit('Enhancement');
				$('#submittingToEnhancement').fadeOut();
				title.value = '';
			})
			.fadeIn();
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
				bugData = bugText.replace(/\r/g, '').split('\n');

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
				var $bugLI = $('<li>');
				if (bugObj.url) {
					var $bugHTML = $('<a target="_blank">');
					$bugHTML.attr('href', bugObj.url).text(bugObj.title);
					$bugLI.append($bugHTML);
				} else {
					$bugLI.text(bugObj.title);
				}
				return $bugLI;
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
