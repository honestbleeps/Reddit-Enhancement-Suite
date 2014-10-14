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

window.addEventListener('DOMContentLoaded', function() {
	var files = [
		'opera-header.js',

		'reddit_enhancement_suite.user.js',

		'opera-save-jquery.js',
		'vendor/jquery-1.11.1.min.js',
		'vendor/jquery.dragsort-0.6.js',
		'vendor/jquery.tokeninput.js',
		'opera-restore-jquery.js',

		'vendor/jquery-fieldselection.min.js',
		'core/utils.js',

		'core/alert.js',
		'browsersupport.js',
		'browsersupport-opera.js',
		'core/console.js',
		'vendor/favico.js',
		'vendor/gfycat.js',
		'vendor/gifyoutube.js',
		'vendor/imgurgifv.js',
		'vendor/guiders-1.2.8.js',
		'vendor/hogan-3.0.2.js',
		'vendor/HTMLPasteurizer.js',
		'vendor/konami.js',
		'vendor/mediacrush.js',
		'vendor/snuownd.js',
		'core/migrate.js',
		'core/storage.js',
		'core/template.js',

		'modules/submitIssue.js',
		'modules/about.js',
		'modules/accountSwitcher.js',
		'modules/betteReddit.js',
		'modules/commandLine.js',
		'modules/commentHidePersistor.js',
		'modules/commentNavigator.js',
		'modules/commentPreview.js',
		'modules/commentTools.js',
		'modules/context.js',
		'modules/noParticipation.js',
		'modules/dashboard.js',
		'modules/filteReddit.js',
		'modules/hideChildComments.js',
		'modules/hover.js',
		'modules/keyboardNav.js',
		'modules/localDate.js',
		'modules/logoLink.js',
		'modules/neverEndingReddit.js',
		'modules/newCommentCount.js',
		'modules/nightMode.js',
		'modules/notifications.js',
		'modules/RESTips.js',
		'modules/saveComments.js',
		'modules/searchHelper.js',
		'modules/settingsNavigation.js',
		'modules/showImages.js',
		'modules/showKarma.js',
		'modules/showParent.js',
		'modules/singleClick.js',
		'modules/sortCommentsTemporarily.js',
		'modules/spamButton.js',
		'modules/styleTweaks.js',
		'modules/subredditInfo.js',
		'modules/subredditManager.js',
		'modules/subredditTagger.js',
		'modules/tableTools.js',
		'modules/troubleshooter.js',
		'modules/userHighlight.js',
		'modules/userTagger.js',
		'modules/userbarHider.js',
		'modules/usernameHider.js',
		'modules/voteEnhancements.js',
		'modules/modhelper.js',

		'core/init.js',

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
			if (loaded === files.length) {
				run(data.join(';'));
			}
		}
		fr.readAsText(f);
	}

	for (var i=0; i<files.length; i++)
		loadFile(i);
});
