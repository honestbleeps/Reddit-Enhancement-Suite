addModule('submitIssue', function(module, moduleID) {
	module.moduleName = 'Submit an Issue';
	module.category = 'About RES';
	module.alwaysEnabled = true;

	module.description = 'If you have any problems with RES, visit <a href="/r/RESissues">/r/RESissues</a>. If you have any requests or questions, visit <a href="/r/Enhancement">/r/Enhancement</a>.';
	module.include = [ 'submit' ];

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
			if ((thisSubReddit.toLowerCase() === 'enhancement') || (thisSubReddit.toLowerCase() === 'resissues')) {
				RESUtils.addCSS('#submittingToEnhancement { display: none; min-height: 300px; font-size: 14px; line-height: 15px; margin-top: 10px; width: 518px; position: absolute; z-index: 999; } #submittingToEnhancement ol { margin-left: 10px; margin-top: 15px; list-style-type: decimal; } #submittingToEnhancement li { margin-left: 25px; }');
				RESUtils.addCSS('.submittingToEnhancementButton { border: 1px solid #444; border-radius: 2px; padding: 3px 6px; cursor: pointer; display: inline-block; margin-top: 12px; }');
				RESUtils.addCSS('#RESBugReport, #RESFeatureRequest { display: none; }');
				RESUtils.addCSS('#RESSubmitOptions .submittingToEnhancementButton { margin-top: 30px; }');
				var textDesc = document.getElementById('text-desc');
				this.submittingToEnhancement = RESUtils.createElementWithID('div', 'submittingToEnhancement', 'RESDialogSmall');

				var submittingHTML = ' \
				<h3>Submitting to r/Enhancement</h3> \
				<div class="RESDialogContents"> \
					<div id="RESSubmitOptions"> \
						What kind of a post do you want to submit to r/Enhancement? So that we can better support you, please choose from the options below, and please take care to read the instructions, thanks!<br> \
						<div id="RESSubmitBug" class="submittingToEnhancementButton">I want to submit a bug report</div><br> \
						<div id="RESSubmitFeatureRequest" class="submittingToEnhancementButton">I want to submit a feature request</div><br> \
						<div id="RESSubmitOther" class="submittingToEnhancementButton">I want to submit a general question or other item</div> \
					</div> \
					<div id="RESBugReport"> \
						Are you sure you want to submit a bug report? We get a lot of duplicates and it would really help if you took a moment to read the following: <br> \
						<ol> \
							<li>Have you searched /r/RESIssues to see if someone else has reported it?</li> \
							<li>Have you checked the <a target="_blank" href="/r/Enhancement/wiki/faq">RES FAQ?</a></li> \
							<li>Are you sure it\'s a bug with RES specifically? Do you have any other userscripts/extensions running?  How about addons like BetterPrivacy, Ghostery, CCleaner, etc?</li> \
						</ol> \
						<br> \
						Please also check out the latest known / popular bugs first:<br> \
						<ul id="RESKnownBugs"><li style="color: red;">Loading...</li></ul> \
						<span id="submittingBug" class="submittingToEnhancementButton">I still want to submit a bug!</span> \
					</div> \
					<div id="RESFeatureRequest"> \
						So you want to request a feature, great!  Please just consider the following, first:<br> \
						<ol> \
							<li>Have you searched /r/Enhancement to see if someone else has requested it?</li> \
							<li>Is it something that would appeal to Reddit as a whole?  Personal or subreddit specific requests usually aren\'t added to RES.</li> \
						</ol> \
						<br> \
						Please also check out the latest known popular feature requests first:<br> \
						<ul id="RESKnownFeatureRequests"><li style="color: red;">Loading...</li></ul> \
						<span id="submittingFeature" class="submittingToEnhancementButton">I still want to submit a feature request!<span> \
					</div> \
				</div>';
				// allowing this use of .html() is a rarity - for readability's sake since there's no variables
				// or remote input here, we'll be OK.
				$(this.submittingToEnhancement).html(submittingHTML);
				RESUtils.insertAfter(textDesc, this.submittingToEnhancement);
				setTimeout(function() {
					$('#RESSubmitBug').click(
						function() {
							$('#RESSubmitOptions').fadeOut(
								function() {
									$('#RESBugReport').fadeIn();
									BrowserStrategy.ajax({
										method: 'GET',
										url: location.protocol + '//' + location.hostname + '/r/Enhancement/wiki/knownbugs.json',
										onload: function(response) {
											var data = safeJSON.parse(response.responseText),
												bugsText;

											if (data.data) {
												bugsText = data.data['content_md'];
											}
											if (bugsText) {
												var bugs = bugsText.split('---'),
													bugLines, bugData, line,
													bugObj, bugLI, bugHTML;

												$('#RESKnownBugs').html('');
												if (bugs && bugs[0].length === 0) {
													bugs.shift();
												}
												$.each(bugs, function(idx, bugText) {
													bugObj = {};
													bugHTML = '';
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
													if (bugObj.title) {
														bugLI = $('<li>');
														if (bugObj.url) {
															bugHTML = $('<a target="_blank">');
															$(bugHTML).attr('href', bugObj.url).text(bugObj.title);
															$(bugLI).append(bugHTML);
														} else {
															$(bugLI).text(bugObj.title);
														}
														$('#RESKnownBugs').append(bugLI);
													}
												});
											}
										}
									});
								}
							);
						}
					);
					$('#RESSubmitFeatureRequest').click(
						function() {
							$('#RESSubmitOptions').fadeOut(
								function() {
									$('#RESFeatureRequest').fadeIn();
									$.getJSON('http://redditenhancementsuite.com/knownfeaturerequests.json', function(data) {
										$('#RESKnownFeatureRequests').html('');
										$.each(data, function(key, val) {
											$('#RESKnownFeatureRequests').append('<li><a target="_blank" href="' + val.url + '">' + val.description + '</a></li>');
										});
									});
								}
							);
						}
					);
					$('#submittingBug').click(
						function() {
							$('#sr-autocomplete').val('RESIssues');
							$('li a.text-button').click();
							$('#submittingToEnhancement').fadeOut();

							var txt = '- RES Version: ' + RESVersion + '\n';
							txt += '- Browser: ' + BrowserDetect.browser + '\n';
							if (typeof navigator === 'undefined') navigator = window.navigator;
							txt += '- Browser Version: ' + BrowserDetect.version + '\n';
							txt += '- Cookies Enabled: ' + navigator.cookieEnabled + '\n';
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
					$('#submittingFeature').click(
						function() {
							$('#sr-autocomplete').val('Enhancement');
							$('#submittingToEnhancement').fadeOut();
							title.value = '[feature request]    ???';
						}
					);
					$('#RESSubmitOther').click(
						function() {
							$('#sr-autocomplete').val('Enhancement');
							$('#submittingToEnhancement').fadeOut();
							title.value = '';
						}
					);
					$('#submittingToEnhancement').fadeIn();
				}, 1000);
			} else if (typeof this.submittingToEnhancement !== 'undefined') {
				this.submittingToEnhancement.parentNode.removeChild(this.submittingToEnhancement);
				if (title.value === 'Submitting a bug? Please read the box above...') {
					title.value = '';
				}
			}
		}
	}
});
