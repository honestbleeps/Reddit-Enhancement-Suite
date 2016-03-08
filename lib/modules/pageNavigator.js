addModule('pageNavigator', function(module, moduleID) {
	module.moduleName = 'Page Navigator';
	module.category = 'Browsing';
	module.description = 'Provides tools for getting around the page.';
	module.options = {
		toTop: {
			type: 'boolean',
			value: true,
			description: 'Add an icon to every page that takes you to the top when clicked.'
		},
		showLink: {
			type: 'boolean',
			value: true,
			description: 'Show information about the submission when scrolling up on comments pages.'
		},
		showLinkNewTab: {
			type: 'boolean',
			value: true,
			description: 'Open link in new tab.',
			dependsOn: 'showLink'
		}
	};
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (module.options.toTop.value) {
				backToTop();
			}
			if (module.options.showLink.value && RESUtils.pageType() === 'comments') {
				showLinkTitle();
			}
		}
	};

	function backToTop() {
		const element = $('<a class="pageNavigator res-icon" data-id="top" href="#header" alt="back to top">&#xF148;</a>');
		element.on('click', '[data-id="top"]', function(e) {
			e.preventDefault();
			RESUtils.scrollTo(0, 0);
		});
		modules['floater'].addElement(element);
	}

	function showLinkTitle() {
		let oldPos = window.scrollY;

		function showWidget() {
			$('.res-show-link').css({top: ''}).removeClass('hide');
		}

		function hideWidget() {
			$('.res-show-link').css({top: -$('.res-show-link').outerHeight()}).addClass('hide');
		}

		function renderWidget($submission) {
			RESTemplates.load('showLinkTitle', function(template) {
				const output = template.html({
					linkId: $submission[0].id,
					thumbnailSrc: $submission.find('.thumbnail img').attr('src'),
					linkHref: $submission.find('a.title').attr('href'),
					title: $submission.find('a.title').text(),
					domainHref: $submission.find('.domain a').attr('href'),
					domain: $submission.find('.domain a').text(),
					time: $submission.find('.tagline time').text(),
					authorHref: $submission.find('.tagline a.author').attr('href'),
					author: $submission.find('.tagline a.author').text(),
					settingsHash: modules['settingsNavigation'].makeUrlHash('pageNavigator', 'showLink'),
					isSelf: $submission.hasClass('self')
				});
				$('body').append(output);
			});
		}

		function snapToEdge($linkInfo) {
			const rightGap = document.body.scrollWidth - $linkInfo[0].getBoundingClientRect().right;
			if (rightGap <= 15) {
				$linkInfo.css({right: '15px'});
			}
		}

		function resizeListener($linkInfo) {
			// Shake off 'right' value before checking its proximity again.
			// Use a timeout because there's no need to listen constantly.
			let resizeTimeout;
			window.addEventListener('resize', function() {
				clearTimeout(resizeTimeout);
				resizeTimeout = setTimeout(function() {
					$linkInfo.css({right: ''});
					snapToEdge($linkInfo);
				}, 100);
			}, false);
		}

		function scrollListener() {
			let scrollTimeout;
			window.addEventListener('scroll', function() {
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout( function() {
					updateWidget();
				}, 100);
			}, false);
		}

		function updateWidget() {
			const nowPos = window.scrollY;
			const commentBounds = $('body > .content > .commentarea > .sitetable')[0].getBoundingClientRect();

			if (nowPos < oldPos && commentBounds.top < 0) {
				// We have scrolled up while still inside commentarea.
				showWidget();
			} else {
				hideWidget();
			}
			oldPos = nowPos;
		}

		function openNewTabListener($element) {
			$element.on('click', function(e) {
				e.preventDefault();
				RESUtils.openLinkInNewTab($element.attr('href'), true);
			});
		}

		const $submission = $('body > .content > .sitetable > .thing');
		renderWidget($submission);

		const $linkInfo = $('.res-show-link');
		$linkInfo.find('.toTop').click(function(e) {
			hideWidget();
		});

		snapToEdge($linkInfo);
		resizeListener($linkInfo);
		scrollListener();

		if (module.options.showLinkNewTab.value) {
			openNewTabListener($linkInfo.find('.res-show-link-title'));
		}

		// Set the two heights for the bar.
		// Due to a Firefox bug with scrollHeight we avoid adding padding to container.
		// jQuery.height() does extra stuff, use plain CSS instead.
		const crop = $linkInfo.find('.res-show-link-content').outerHeight(true) - $linkInfo.find('.res-show-link-tagline').outerHeight();
		$linkInfo.css({height: crop});

		$linkInfo.on('mouseenter', function(e) {
			$linkInfo.css({height: e.currentTarget.scrollHeight});
		}).on('mouseleave', function(e) {
			$linkInfo.css({height: crop});
		});
	}
});
