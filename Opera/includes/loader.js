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
		'vendor/jquery-1.11.2.min.js',
		'vendor/jquery.sortable-0.9.12.js',
		'vendor/jquery.edgescroll-0.1.js',
		'vendor/jquery.tokeninput.js',
		'opera-restore-jquery.js',

		'vendor/jquery-fieldselection.min.js',
		'core/utils.js',

		'core/alert.js',
		'browsersupport.js',
		'browsersupport-opera.js',
		'core/options.js',
		'vendor/favico.js',
		'vendor/gfycat.js',
		'vendor/gifyoutube.js',
		'vendor/imgurgifv.js',
		'vendor/guiders.js',
		'vendor/hogan-3.0.2.js',
		'vendor/HTMLPasteurizer.js',
		'vendor/konami.js',
		'vendor/imgrush.js',
		'vendor/snuownd.js',
		'core/migrate.js',
		'core/storage.js',
		'core/template.js',

		'modules/submitIssue.js',
		'modules/about.js',
		'modules/accountSwitcher.js',
		'modules/betteReddit.js',
		'modules/commandLine.js',
		'modules/userInfo.js',
		'modules/presets.js',
		'modules/onboarding.js',
		'modules/customToggles.js',
		'modules/floater.js',
		'modules/orangered.js',
		'modules/announcements.js',
		'modules/selectedEntry.js',
		'modules/settingsConsole.js',
		'modules/menu.js',
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
		'modules/submitHelper.js',
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
		'modules/upload.js',
		'modules/modhelper.js',
		'modules/quickMessage.js',

		'modules/hosts/imgur.js',
		'modules/hosts/twitter.js',
		'modules/hosts/futurism.js',
		'modules/hosts/gfycat.js',
		'modules/hosts/gifyoutube.js',
		'modules/hosts/vidble.js',
		'modules/hosts/fitbamob.js',
		'modules/hosts/giflike.js',
		'modules/hosts/ctrlv.js',
		'modules/hosts/snag.js',
		'modules/hosts/picshd.js',
		'modules/hosts/minus.js',
		'modules/hosts/fiveHundredPx.js',
		'modules/hosts/flickr.js',
		'modules/hosts/steampowered.js',
		'modules/hosts/deviantart.js',
		'modules/hosts/tumblr.js',
		'modules/hosts/memecrunch.js',
		'modules/hosts/imgflip.js',
		'modules/hosts/imgrush.js',
		'modules/hosts/livememe.js',
		'modules/hosts/makeameme.js',
		'modules/hosts/memegen.js',
		'modules/hosts/redditbooru.js',
		'modules/hosts/youtube.js',
		'modules/hosts/vimeo.js',
		'modules/hosts/soundcloud.js',
		'modules/hosts/clyp.js',
		'modules/hosts/memedad.js',
		'modules/hosts/ridewithgps.js',
		'modules/hosts/photobucket.js',
		'modules/hosts/giphy.js',
		'modules/hosts/streamable.js',
		'modules/hosts/raddit.js',
		'modules/hosts/pastebin.js',
		'modules/hosts/github.js',
		'modules/hosts/onedrive.js',

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
		};
		fr.readAsText(f);
	}

	for (var i=0; i<files.length; i++) {
		loadFile(i);
	}
});
