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

(function(moduleExports) {
	var scripts = [
		'opera-header.js',

		'opera-save-jquery.js',
		'vendor/jquery-1.11.3.min.js',
		'opera-alias-jquery.js',

		'vendor/guiders.js',
		'vendor/jquery.sortable-0.9.12.js',
		'vendor/jquery.edgescroll-0.1.js',
		'vendor/jquery-fieldselection.min.js',
		'vendor/favico.js',
		'vendor/jquery.tokeninput.js',
		'vendor/HTMLPasteurizer.js',
		'vendor/snuownd.js',

		'opera-restore-jquery.js',

		'core/utils.js',
		'browsersupport.js',
		'browsersupport-opera.js',
		'core/options.js',
		'core/alert.js',
		'core/migrate.js',
		'core/storage.js',
		'core/template.js',
		'vendor/konami.js',
		'vendor/hogan-3.0.2.js',
		'vendor/gfycat.js',
		'vendor/gifyoutube.js',
		'vendor/imgurgifv.js',
		'vendor/pornbot.js',
		'opera-vendor-footer.js',

		'reddit_enhancement_suite.user.js',

		'modules/submitIssue.js',
		'modules/about.js',
		'modules/accountSwitcher.js',
		'modules/betteReddit.js',
		'modules/commandLine.js',
		'modules/messageMenu.js',
		'modules/easterEgg.js',
		'modules/pageNavigator.js',
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
		'modules/spamButton.js',
		'modules/styleTweaks.js',
		'modules/subredditInfo.js',
		'modules/subredditManager.js',
		'modules/subredditTagger.js',
		'modules/tableTools.js',
		'modules/troubleshooter.js',
		'modules/backupAndRestore.js',
		'modules/userHighlight.js',
		'modules/userTagger.js',
		'modules/userbarHider.js',
		'modules/usernameHider.js',
		'modules/voteEnhancements.js',
		'modules/upload.js',
		'modules/modhelper.js',
		'modules/quickMessage.js',

		'modules/hosts/imgur.js',
		'modules/hosts/pornbot.js',
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
		'modules/hosts/oddshot.js',

		'core/init.js',

		'opera-footer.js'
	];

	var stylesheets = [
		'core/res.css',
		'vendor/guiders.css',
		'vendor/tokenize.css',
		'modules/commentBoxes.css',
		'modules/nightmode.css',
		'core/batch.css'
	];


	function loadFiles(filenames) {
		var deferred = new Deferred();
		var files = new Array(filenames.length);
		var loaded = 0;

		filenames.forEach(loadFile);

		function loadFile(filename, i) {
			var file = opera.extension.getFile('/' + filename);
			var fr = new FileReader();
			fr.onload = onLoad.bind(this, i, fr, filename);
			fr.readAsText(file);
		}

		function onLoad(i, fr, filename) {
			files[i] = '\r\r\r/**** ' + filename + ' ****/\r\r ' + fr.result;
			deferred.update(files[i], i);
			loaded++;
			if (loaded === files.length) {
				deferred.resolve(files);
			}
		}

		return deferred;
	}

	function Deferred() {
		if (!(this instanceof Deferred)) {
			return new Deferred();
		}
		this._ = {
			progress: [],
			done: [],
			result: undefined,
			status: 'pending'
		};
	}
	Deferred.prototype = {
		progress: function(callback) {
			this._.progress.push(callback);
			return this;
		},
		done: function(callback) {
			if (this._.status === 'resolved') {
				callback.apply(this, this._.result);
			} else {
				this._.done.push(callback);
			}
			return this;
		},
		update: function(/* ... vals */) {
			var vals = Array.prototype.slice.call(arguments);
			this._.progress.forEach(function(callback) {
				callback.apply(this, vals);
			}.bind(this));
			return this;
		},
		resolve: function(/* ... vals */) {
			if (this._.status !== 'resolved') {
				this._.status = 'resolved';
				this._.result = Array.prototype.slice.call(arguments);

				this._.done.forEach(function(callback) {
					callback.apply(this, this._.result);
				}.bind(this));
			}
			return this;
		}
	};


	var context = { opera: opera };

	var stylesheetsLoaded = loadFiles(stylesheets);
	stylesheetsLoaded.done(function(css) {
		var container = document.createDocumentFragment(),
			elements = css.map(function(css, i) {
				var element = document.createElement('style');
				element.textContent = css;
				element.setAttribute('data-res-src', stylesheets[i]);
				return element;
			});
		elements.forEach(container.appendChild.bind(container));
		document.head.appendChild(container);
	});

	var scriptsLoaded = loadFiles(scripts);
	scriptsLoaded.done(function(files) {
		stylesheetsLoaded.done(function() {
			var res, error;
			var batched = files.join(';\n');
			console.log('Evaluating RES');

			try {
				(function() {
					res = eval(batched);
				}).call(context);
			} catch(e) {
				error = e;
			}
			window.REScontext = {
				res: res,
				error: error,
				getSourceAt: source.bind(batched, batched),
				sourceText: batched,
				files: files
			}
			if (error) {
				console.error('Could not load RES. Consult window.resContext.error for more details.');
				console.error(error);
			} else {
				console.log('RES loaded');
			}
		});
	});

	function source(code, line, after, before) {
		line = typeof line === 'line' ? line : 0;
		after = typeof after === 'number' ? after : 10;
		before = typeof before === 'number' ? before : 5;
		var slice = code.slice(line - before, line + after).join('\n');
		return {
			line: line,
			before: before,
			after: after,
			source: slice
		};
	}
})(typeof exports !== 'undefined' ? exports : typeof window !== 'undefined' ? window : this);
