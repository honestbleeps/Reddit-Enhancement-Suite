import _ from 'lodash';
import showLinkTitleTemplate from '../templates/showLinkTitle.mustache';
import { $ } from '../vendor';
import { getHeaderOffset, isPageType, scrollTo } from '../utils';
import * as Floater from './floater';
import * as SettingsNavigation from './settingsNavigation';

export const module = {};

module.moduleID = 'pageNavigator';
module.moduleName = 'Page Navigator';
module.category = 'Browsing';
module.description = 'Provides tools for getting around the page.';
module.options = {
	toTop: {
		type: 'boolean',
		value: true,
		description: 'Add an icon to every page that takes you to the top when clicked.',
	},
	showLink: {
		type: 'boolean',
		value: true,
		description: 'Show information about the submission when scrolling up on comments pages.',
	},
	showLinkNewTab: {
		type: 'boolean',
		value: true,
		description: 'Open link in new tab.',
		dependsOn: 'showLink',
	},
};

module.go = function() {
	if (module.options.toTop.value) {
		backToTop();
	}
	if (module.options.showLink.value && isPageType('comments')) {
		showLinkTitle();
	}
};

function backToTop() {
	const $backToTop = $('<a class="pageNavigator res-icon" data-id="top" href="#header" title="back to top">&#xF148;</a>');
	$backToTop.on('click', '[data-id="top"]', e => {
		e.preventDefault();
		scrollTo(0, 0);
	});
	Floater.addElement($backToTop);
}

function showLinkTitle() {
	let oldPos = window.scrollY;

	function showWidget() {
		$('.res-show-link').css({ top: getHeaderOffset() }).removeClass('hide');
	}

	function hideWidget() {
		$('.res-show-link').css({ top: -$('.res-show-link').outerHeight() }).addClass('hide');
	}

	function renderWidget($submission) {
		$('body').append(showLinkTitleTemplate({
			linkId: $submission.attr('id'),
			thumbnailSrc: $submission.find('.thumbnail img').attr('src'),
			linkHref: $submission.find('a.title').attr('href'),
			linkNewTab: module.options.showLinkNewTab.value,
			title: $submission.find('a.title').text(),
			domainHref: $submission.find('.domain a').attr('href'),
			domain: $submission.find('.domain a').text(),
			time: $submission.find('.tagline time').text(),
			authorHref: $submission.find('.tagline a.author').attr('href'),
			author: $submission.find('.tagline a.author').text(),
			settingsHash: SettingsNavigation.makeUrlHash(module.moduleID, 'showLink'),
		}));
	}

	function snapToEdge($linkInfo) {
		const rightGap = document.body.scrollWidth - $linkInfo.get(0).getBoundingClientRect().right;
		if (rightGap <= 15) {
			$linkInfo.css({ right: '15px' });
		}
	}

	function resizeListener($linkInfo) {
		// Shake off 'right' value before checking its proximity again.
		window.addEventListener('resize', _.debounce(() => {
			$linkInfo.css({ right: '' });
			snapToEdge($linkInfo);
		}, 100));
	}

	function scrollListener() {
		window.addEventListener('scroll', _.debounce(updateWidget, 100, { leading: true, trailing: true }));
	}

	function updateWidget() {
		const nowPos = window.scrollY;
		const commentBounds = $('body > .content > .commentarea > .sitetable').get(0).getBoundingClientRect();

		if (nowPos < oldPos && commentBounds.top < 0) {
			// We have scrolled up while still inside commentarea.
			showWidget();
		} else {
			hideWidget();
		}
		oldPos = nowPos;
	}

	const $submission = $('body > .content > .sitetable > .thing');
	renderWidget($submission);

	const $linkInfo = $('.res-show-link');
	$linkInfo.find('.toTop').click(hideWidget);

	snapToEdge($linkInfo);
	resizeListener($linkInfo);
	scrollListener();

	// Set the two heights for the bar.
	// Due to a Firefox bug with scrollHeight we avoid adding padding to container.
	// jQuery.height() does extra stuff, use plain CSS instead.
	const crop = $linkInfo.find('.res-show-link-content').outerHeight(true) - $linkInfo.find('.res-show-link-tagline').outerHeight();
	$linkInfo.css({ height: crop });

	$linkInfo
		.on('mouseenter', e => $linkInfo.css({ height: e.currentTarget.scrollHeight }))
		.on('mouseleave', () => $linkInfo.css({ height: crop }));
}
