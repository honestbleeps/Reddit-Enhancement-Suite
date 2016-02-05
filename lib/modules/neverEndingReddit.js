addModule('neverEndingReddit', function(module, moduleID) {
	module.moduleName = 'Never Ending Reddit';
	module.category = ['Browsing'];
	module.description = 'Inspired by modules like River of Reddit and Auto Pager - gives you a never ending stream of reddit goodness.';
	module.options = {
		returnToPrevPage: {
			type: 'boolean',
			value: true,
			description: 'Return to the page you were last on when hitting "back" button?'
		},
		autoLoad: {
			type: 'boolean',
			value: true,
			description: 'Automatically load new page on scroll (if off, you click to load)'
		},
		notifyWhenPaused: {
			type: 'boolean',
			value: true,
			description: 'Show a reminder to unpause Never-Ending Reddit after pausing',
			advanced: true
		},
		reversePauseIcon: {
			type: 'boolean',
			value: false,
			description: 'Show "paused" bars icon when auto-load is paused and "play" wedge icon when active',
			advanced: true
		},
		showServerInfo: {
			type: 'boolean',
			value: false,
			description: 'Show the π server / debug details next to the floating Never-Ending Reddit tools',
			advanced: true,
			bodyClass: true
		},
		pauseAfterEvery: {
			type: 'text',
			value: 0,
			description: 'After auto-loading a certain number of pages, pause the auto-loader<br><br>0 or a negative number means Never-Ending Reddit will only pause when you click the play/pause button in the top right corner.'
		},
		hideDupes: {
			type: 'enum',
			value: 'fade',
			values: [{
				name: 'Fade',
				value: 'fade'
			}, {
				name: 'Hide',
				value: 'hide'
			}, {
				name: 'Do not hide',
				value: 'none'
			}],
			description: 'Fade or completely hide duplicate posts already showing on the page.',
			bodyClass: true
		}
	};
	module.exclude = [
		'wiki',
		'comments'
	];

	const dupeHash = {};
	let siteTable, NREPause, isPaused, isLoading, fromBackButton;

	module.beforeLoad = async function() {
		if (!this.isEnabled() || !this.isMatchURL()) return;
		isPaused = !!(await RESEnvironment.storage.get('RESmodules.neverEndingReddit.isPaused'));
	};

	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			// code inspired by River of Reddit, but rewritten from scratch to work across multiple browsers...
			// Original River of Reddit author: reddy kapil
			// Original link to Chrome extension: https://chrome.google.com/extensions/detail/bjiggjllfebckflfdjbimogjieeghcpp

			// store access to the siteTable div since that's where we'll append new data...
			siteTable = RESUtils.thingsContainer();

			if (!siteTable) {
				// Couldn't find anything to work with, abandon ship
				return;
			}

			siteTable.classList.add('res-ner-listing');

			// modified from a contribution by Peter Siewert, thanks Peter!
			const entries = document.body.querySelectorAll('a.comments');
			for (let i = entries.length - 1; i > -1; i--) {
				dupeHash[entries[i].href] = 1;
			}

			this.allLinks = RESUtils.$things();


			// get the first link to the next page of reddit...
			const nextPrevLinks = this.getNextPrevLinks(siteTable);
			if (nextPrevLinks) {
				const nextLink = nextPrevLinks.next;
				if (nextLink) {
					this.nextPageURL = nextLink.getAttribute('href');

					attachLoaderWidget();
				}

				if (this.options.returnToPrevPage.value) {
					returnToPrevPageCheck(location.hash);
				}

				// watch for the user scrolling to the bottom of the page.  If they do it, load a new page.
				if (this.options.autoLoad.value && nextLink) {
					window.addEventListener('scroll', RESUtils.debounce(handleScroll, 300), false);
				}
			}
			// check if the user has new mail...
			NREPause = RESUtils.createElement('div', 'NREPause');
			NREPause.setAttribute('title', 'Pause / Restart Never Ending Reddit');
			if (this.options.reversePauseIcon.value) NREPause.classList.add('reversePause');
			if (isPaused) NREPause.classList.add('paused');
			NREPause.addEventListener('click', togglePause, false);
			modules['floater'].addElement(NREPause);
		}
	};

	const pageMarkers = [];

	function togglePause() {
		isPaused = !isPaused;
		if (isPaused) {
			RESEnvironment.storage.set('RESmodules.neverEndingReddit.isPaused', isPaused);
		} else {
			RESEnvironment.storage.delete('RESmodules.neverEndingReddit.isPaused');
		}
		if (isPaused) {
			NREPause.classList.add('paused');
			if (module.options.notifyWhenPaused.value) {
				const notification = [];
				notification.push('Never-Ending Reddit has been paused. Click the play/pause button to unpause it.');
				notification.push('To hide this message, disable Never-Ending Reddit\'s ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'notifyWhenPaused', 'notifyWhenPaused option <span class="gearIcon" />') + '.');
				modules['notifications'].showNotification({
					moduleID: 'neverEndingReddit',
					message: notification.join('<br><br>')
				});
			}
		} else {
			NREPause.classList.remove('paused');
			handleScroll();
		}
		setWidgetActionText();
	}

	function returnToPrevPageCheck(hash) {
		const pageRE = /page=(\d+)/;
		const match = pageRE.exec(hash);
		// Set the current page to page 1...
		module.currPage = 1;
		if (match) {
			const backButtonPageNumber = match[1] || 1;
			if (backButtonPageNumber > 1) {
				attachModalWidget();
				module.currPage = backButtonPageNumber;
				loadNewPage(true);
			}
		}

		/*
		if ((sessionStorage.NERpageURL) && (sessionStorage.NERpageURL !== sessionStorage.lastPageURL)) {
			const backButtonPageNumber = sessionStorage.getItem('NERpage') || 1;
			if (backButtonPageNumber > 1) {
		 		module.currPage = backButtonPageNumber;
				loadNewPage(true);
			}
		}
		sessionStorage.lastPageURL = location.href;
		*/
	}

	function handleScroll() {
		if (modules['settingsConsole'].isOpen) { // avoid console to close when scrolling
			return;
		}
		const thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		let thisPageNum = 1;

		for (let i = 0; i < pageMarkers.length; i++) {
			const { y } = RESUtils.getXYpos(pageMarkers[i]);
			if (y < window.pageYOffset) {
				const thisMarker = pageMarkers[i];
				thisPageNum = thisMarker.getAttribute('id').replace('page-', '');
				module.currPage = thisPageNum;
				if (thisMarker) {
					RESEnvironment.session.set('RESmodules.neverEndingReddit.lastPage.' + thisPageType, thisMarker.getAttribute('url'));
				}
			} else {
				break;
			}
		}
		if (thisPageNum !== sessionStorage.NERpage) {
			if (thisPageNum > 1) {
				// sessionStorage.NERpageURL = location.href;
				sessionStorage.NERpage = thisPageNum;
				location.hash = 'page=' + thisPageNum;
			} else {
				if (location.hash.indexOf('page=') !== -1) {
					location.hash = 'page=' + thisPageNum;
				}
				delete sessionStorage['NERpage'];
			}
		}
		if (!fromBackButton && module.options.returnToPrevPage.value) {
			for (let i = 0; i < module.allLinks.length; i++) {
				if (RESUtils.elementInViewport(module.allLinks[i])) {
					const thisClassString = module.allLinks[i].getAttribute('class');
					const thisClass = thisClassString.match(/id-t[\d]_[\w]+/);

					if (thisClass) {
						const thisID = thisClass[0];
						RESEnvironment.session.set('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType, thisID);
						break;
					}
				}
			}
		}
		if (RESUtils.elementInViewport(module.progressIndicator) && !fromBackButton) {
			if (!isPaused) {
				loadNewPage();
				pauseAfter(thisPageNum);
			}
		}
	}

	let pauseAfterPages = null;

	function pauseAfter(currPageNum) {
		if (pauseAfterPages === null) {
			pauseAfterPages = parseInt(module.options.pauseAfterEvery.value, 10);
		}

		if ((pauseAfterPages > 0) && (currPageNum % pauseAfterPages === 0)) {
			togglePause(true);
			const notification = [];
			notification.push('Time for a break!');
			notification.push('Never-Ending Reddit was paused automatically. ' + modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', 'pauseAfterEvery', '', 'gearIcon'));
			setTimeout(modules['notifications'].showNotification.bind(RESUtils, notification.join('<br><br>'), 5000));
		}
	}

	function duplicateCheck(newHTML) {
		const newLinks = newHTML.querySelectorAll('div.link');
		for (let i = newLinks.length - 1; i > -1; i--) {
			const newLink = newLinks[i];
			const thisCommentLink = newLink.querySelector('a.comments').href;
			if (dupeHash[thisCommentLink]) {
				// let's not remove it altogether, but instead dim it...
				// newLink.parentElement.removeChild(newLink);
				newLink.classList.add('NERdupe');
			} else {
				dupeHash[thisCommentLink] = 1;
			}
		}
		return newHTML;
	}

	let modalWidget, modalContent;

	function attachModalWidget() {
		modalWidget = RESUtils.createElement('div', 'NERModal');
		$(modalWidget).html('&nbsp;');
		modalContent = RESUtils.createElement('div', 'NERContent');
		$(modalContent).html('<div id="NERModalClose" class="RESCloseButton">&times;</div>Never Ending Reddit has detected that you are returning from a page that it loaded. Please give us a moment while we reload that content and return you to where you left off.<br><span class="RESThrobber"></span>');
		document.body.appendChild(modalWidget);
		document.body.appendChild(modalContent);
		$('#NERModalClose').click(function() {
			$(modalWidget).hide();
			$(modalContent).hide();
		});
	}

	function attachLoaderWidget() {
		// add a widget at the bottom that will be used to detect that we've scrolled to the bottom, and will also serve as a "loading" bar...
		module.progressIndicator = document.createElement('div');
		setWidgetActionText();
		module.progressIndicator.id = 'progressIndicator';
		module.progressIndicator.className = 'neverEndingReddit';

		module.progressIndicator.addEventListener('click', function(e) {
			if (e.target.id !== 'NERStaticLink' && !e.target.classList.contains('gearIcon')) {
				e.preventDefault();
				loadNewPage();
			}
		}, false);
		RESUtils.insertAfter(siteTable, module.progressIndicator);
	}

	module.getNextPrevLinks = function(ele) {
		ele = ele || document.body;
		const links = {
			next: ele.querySelector('.content .nextprev a[rel~=next]'),
			prev: ele.querySelector('.content .nextprev a[rel~=prev]')
		};

		if (!(links.next || links.prev)) return false;

		return links;
	};

	function setWidgetActionText() {
		$(module.progressIndicator).empty();
		$('<h2>Never Ending Reddit</h2>')
			.appendTo(module.progressIndicator)
			.append(modules['settingsNavigation'].makeUrlHashLink('neverEndingReddit', null, ' ', 'gearIcon'));

		let text = 'Click to load the next page';
		if (module.options.autoLoad.value && !isPaused) {
			text = 'scroll or click to load the next page';
		} else if (module.options.autoLoad.value && isPaused) {
			text = 'click to load the next page; or click the "pause" button in the top right corner';
		}

		$('<p class="NERWidgetText" />')
			.text(text)
			.appendTo(module.progressIndicator);

		const nextpage = $('<a id="NERStaticLink">or open next page</a>')
			.attr('href', module.nextPageURL);
		$('<p class="NERWidgetText" />').append(nextpage)
			.append('&nbsp;(and clear Never-Ending stream)')
			.appendTo(module.progressIndicator);
	}

	async function loadNewPage(fromBackButton) {
		const storageKey = `RESmodules.neverEndingReddit.lastPage.${RESUtils.pageType()}.${RESUtils.currentSubreddit()}`;
		if (!isLoading) {
			isLoading = true;
			if (fromBackButton) {
				fromBackButton = true;
				const savePageURL = module.nextPageURL;
				module.nextPageURL = await RESEnvironment.session.get(storageKey);
				if ((module.nextPageURL === 'undefined') || (module.nextPageURL === null)) {
					// something went wrong, probably someone hit refresh. Just revert to the first page...
					fromBackButton = false;
					module.nextPageURL = savePageURL;
					module.currPage = 1;
					isLoading = false;
					return false;
				}
				const leftCentered = Math.floor((window.innerWidth - 720) / 2);
				modalWidget.style.display = 'block';
				modalContent.style.display = 'block';
				modalContent.style.left = leftCentered + 'px';
				// remove the progress indicator early, as we don't want the user to scroll past it on accident, loading more content.
				module.progressIndicator.parentNode.removeChild(module.progressIndicator);
			} else {
				fromBackButton = false;
			}


			module.progressIndicator.removeEventListener('click', loadNewPage, false);
			$(module.progressIndicator).html('<span class="NERWidgetText">Loading next page...</span><span class="RESThrobber"></span>');
			// as a sanity check, which should NEVER register true, we'll make sure me.nextPageURL is on the same domain we're browsing...
			if (module.nextPageURL && module.nextPageURL.indexOf(location.hostname) === -1) {
				console.log('Next page URL mismatch. Something strange may be afoot.');
				isLoading = false;
				return false;
			}

			let thisHTML;

			try {
				thisHTML = await RESEnvironment.ajax({ url: module.nextPageURL });
			} catch (e) {
				NERFail();
				throw e;
			}

			if (module.progressIndicator.parentNode) {
				module.progressIndicator.parentNode.removeChild(module.progressIndicator);
			}
			// drop the HTML we got back into a div...
			const tempDiv = document.createElement('div');
			// clear out any javascript so we don't render it again...
			$(tempDiv).html(thisHTML.replace(/<script(.|\s)*?\/script>/g, ''));
			// grab the siteTable out of there...
			const newHTML = RESUtils.thingsContainer(tempDiv);
			// did we find anything?
			if (newHTML) {
				newHTML.setAttribute('ID', 'siteTable-' + module.currPage + 1);
				const firstLen = $('body').find('.link:last .rank').text().length;
				let lastLen = $(newHTML).find('.link:last .rank').text().length;
				if (lastLen > firstLen) {
					lastLen = (lastLen * 1.1).toFixed(1);
					RESUtils.addCSS('body.res > .content .link .rank { width: ' + lastLen + 'ex; }');
				}
				duplicateCheck(newHTML);
				// check for new mail
				modules['orangered'].updateFromPage(tempDiv);
				// get the new nextLink value for the next page...
				const nextPrevLinks = module.getNextPrevLinks(tempDiv);
				if (nextPrevLinks) {
					if (isNaN(module.currPage)) module.currPage = 1;
					if (!fromBackButton) module.currPage++;
					if ((!(fromBackButton)) && (module.options.returnToPrevPage.value)) {
						RESEnvironment.session.set(storageKey, module.nextPageURL);
						// location.hash = 'page='+module.currPage;
					}
					const nextLink = nextPrevLinks.next;
					const nextPage = module.currPage;
					const pageMarker = RESUtils.createElement('div', 'page-' + nextPage);
					pageMarker.classList.add('NERPageMarker');
					$(pageMarker).text('Page ' + nextPage);
					siteTable.appendChild(pageMarker);
					pageMarkers.push(pageMarker);
					siteTable.appendChild(newHTML);
					isLoading = false;
					if (nextLink) {
						// console.log(nextLink);
						pageMarker.setAttribute('url', module.nextPageURL);
						if (nextLink.getAttribute('rel').indexOf('prev') !== -1) {
							// remove the progress indicator from the DOM, it needs to go away.
							module.progressIndicator.style.display = 'none';
							const endOfReddit = RESUtils.createElement('div', 'endOfReddit');
							$(endOfReddit).text('You\'ve reached the last page available.  There are no more pages to load.');
							siteTable.appendChild(endOfReddit);
							window.removeEventListener('scroll', handleScroll, false);
						} else {
							// console.log('not over yet');
							module.nextPageURL = nextLink.getAttribute('href');
							attachLoaderWidget();
						}
					}
					module.allLinks = RESUtils.$things();
					if ((fromBackButton) && (module.options.returnToPrevPage.value)) {
						// TODO: it'd be great to figure out a better way than a timeout, but this
						// has considerably helped the accuracy of RES's ability to return you to where
						// you left off.
						setTimeout(scrollToLastElement, 4000, newHTML);
					}

					// If we're on the reddit-browsing page (/reddits or /subreddits), add +shortcut and -shortcut buttons...
					if (/^https?:\/\/www\.reddit\.com\/(?:sub)?reddits\/?(?:\?[\w=&]+)*/.test(location.href)) {
						modules['subredditManager'].browsingReddits();
					}
				}

				// const nextPrevLinks = newHTML && module.getNextPrevLinks(newHTML);
				if (!(nextPrevLinks && nextPrevLinks.next)) {
					const noresults = tempDiv.querySelector('#noresults');
					const noresultsfound = !!noresults;
					NERFail(noresultsfound);
				}

				const e = document.createEvent('Events');
				e.initEvent('neverEndingLoad', true, true);
				window.dispatchEvent(e);
			}
		}
	}

	async function scrollToLastElement(newHTML) {
		modalWidget.style.display = 'none';
		modalContent.style.display = 'none';
		const thisPageType = RESUtils.pageType() + '.' + RESUtils.currentSubreddit();
		const lastTopScrolledID = await RESEnvironment.session.get('RESmodules.neverEndingReddit.lastVisibleIndex.' + thisPageType);
		const lastTopScrolledEle = document.body.querySelector('.' + lastTopScrolledID) || RESUtils.$things(newHTML);
		const thisXY = RESUtils.getXYpos(lastTopScrolledEle);
		RESUtils.scrollTo(0, thisXY.y);
		fromBackButton = false;
	}

	function NERFail(noresults) {
		isLoading = false;
		const newHTML = RESUtils.createElement('div', 'NERFail');
		const failureMessage = noresults ? 'There doesn\'t seem to be anything here!' : 'Couldn\'t load any more posts';
		const start = location.href.split('#')[0];
		const retry = module.nextPageURL;
		$(newHTML).html(`
			<h3>
				${failureMessage}
				<a target="_blank" href="/r/Enhancement/comments/s72xt/never_ending_reddit_and_reddit_barfing_explained/">(Why not?)</a>
			</h3>
			<p class="nextprev">
				<a href="${start}">start over</a>
				<a href="${retry}">try again</a>
				<a href="/r/random">check out a random subreddit</a>
			</p>
		`);
		newHTML.setAttribute('style', 'cursor: auto !important;');


		siteTable.appendChild(newHTML);
		if (modalWidget) {
			modalWidget.style.display = 'none';
			modalContent.style.display = 'none';
		}
	}
});
