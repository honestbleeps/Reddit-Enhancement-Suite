// ==UserScript==
// @name          Reddit Enhancement Suite
// @namespace	  http://reddit.honestbleeps.com/
// @description   A suite of tools to enhance reddit...
// @copyright     2010-2012, Steve Sobel (http://redditenhancementsuite.com/)
// @license       GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html/
// @author        honestbleeps
// @include       http://redditenhancementsuite.com/*
// @include       http://reddit.honestbleeps.com/*
// @include       http://reddit.com/*
// @include       https://reddit.com/*
// @include       http://*.reddit.com/*
// @include       https://*.reddit.com/*
// @updateURL     http://redditenhancementsuite.com/latest/reddit_enhancement_suite.meta.js
// @downloadURL   http://redditenhancementsuite.com/latest/reddit_enhancement_suite.user.js
// ==/UserScript==

var loadEventFired = false;

window.addEventListener('load', function() {
	loadEventFired = true;
});

window.addEventListener('DOMContentLoaded', function() {
	var files = [
		'opera-header.js',

		'reddit_enhancement_suite.user.js',

		'opera-save-jquery.js',
		'jquery-1.10.2.min.js',
		'jquery.dragsort-0.6.js',
		'jquery.tokeninput.js',
		'opera-restore-jquery.js',

		'jquery-fieldselection.min.js',
		'utils.js',

		'alert.js',
		'browsersupport.js',
		'browsersupport-opera.js',
		'console.js',
		'gfycat.js',
		'guiders-1.2.8.js',
		'hogan-2.0.0.js',
		'HTMLPasteurizer.js',
		'konami.js',
		'mediacrush.js',
		'snuownd.js',
		'storage.js',
		'template.js',
		'tinycon.js',

		'modules/about.js',
		'modules/accountSwitcher.js',
		'modules/betteReddit.js',
		'modules/bitcointip.js',
		'modules/commandLine.js',
		'modules/commentHidePersistor.js',
		'modules/commentNavigator.js',
		'modules/commentPreview.js',
		'modules/commentTools.js',
		'modules/dashboard.js',
		'modules/filteReddit.js',
		'modules/hideChildComments.js',
		'modules/hover.js',
		'modules/keyboardNav.js',
		'modules/neverEndingReddit.js',
		'modules/newCommentCount.js',
		'modules/notifications.js',
		'modules/RESTips.js',
		'modules/saveComments.js',
		'modules/settingsNavigation.js',
		'modules/showImages.js',
		'modules/showKarma.js',
		'modules/showParent.js',
		'modules/singleClick.js',
		'modules/snoonet.js',
		'modules/sortCommentsTemporarily.js',
		'modules/spamButton.js',
		'modules/styleTweaks.js',
		'modules/subredditInfo.js',
		'modules/subredditManager.js',
		'modules/subredditTagger.js',
		'modules/troubleshooter.js',
		'modules/uppersAndDowners.js',
		'modules/userHighlight.js',
		'modules/usernameHider.js',
		'modules/userTagger.js',

		'init.js',

		'opera-footer.js'
	];

	var context = {opera:opera};

	function run(all) {
		function f() {
			eval(all);
		}

		f.call(context);
	}

	// Load all files asynchronously
	var data = new Array(files.length);
	var loaded = 0;

	function loadFile(i) {
		var fn = files[i];
		var f = opera.extension.getFile('/' + fn);
		var fr = new FileReader();
		fr.onload = function() {
			data[i] = fr.result;
			loaded++;
			if (loaded == files.length) {
				run(data.join(';'));
			}
		}
		fr.readAsText(f);
	}

	for (var i=0; i<files.length; i++)
		loadFile(i);
});
