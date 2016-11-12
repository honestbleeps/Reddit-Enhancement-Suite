import _ from 'lodash';
import showLinkTitleTemplate from '../templates/showLinkTitle.mustache';
import { $ } from '../vendor';
import { getHeaderOffset, isPageType, scrollTo, Thing } from '../utils';
import * as Floater from './floater';
import * as SettingsNavigation from './settingsNavigation';
import * as KeyboardNav from './keyboardNav';

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

module.afterLoad = () => {
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
	let oldPos;
	let $widget;
	const $submission = $('body > .content > .sitetable > .thing');
	const $commentarea = $('body > .content > .commentarea > .sitetable');
	const submissionThing = new Thing($submission);

	function showWidget() {
		$widget.css({ top: getHeaderOffset(true) }).removeClass('hide');
	}

	function hideWidget() {
		$widget.css({ top: -$widget.outerHeight() }).addClass('hide');
	}

	function renderWidget() {
		return $(showLinkTitleTemplate({
			linkId: $submission.attr('id'),
			thumbnailSrc: submissionThing.getPostThumbnailUrl(),
			linkHref: submissionThing.getTitleUrl(),
			linkNewTab: module.options.showLinkNewTab.value,
			title: submissionThing.getTitle(),
			domainHref: submissionThing.getPostDomainUrl(),
			domain: submissionThing.getPostDomainText(),
			time: submissionThing.getPostTime(),
			authorHref: submissionThing.getAuthorUrl(),
			author: submissionThing.getAuthor(),
			settingsHash: SettingsNavigation.makeUrlHash(module.moduleID, 'showLink'),
		}));
	}

	function updateWidget() {
		const nowPos = window.scrollY;

		if (
			!KeyboardNav.recentKeyMove &&
			nowPos < oldPos &&
			$commentarea.get(0).getBoundingClientRect().top < 0
		) {
			initialize();
			// We have scrolled up while still inside commentarea.
			showWidget();
		} else if ($widget) {
			hideWidget();
		}

		oldPos = nowPos;
	}

	const initialize = _.once(() => {
		oldPos = window.scrollY;

		$widget = renderWidget();

		$widget
			.appendTo(document.body)
			.find('.toTop').click(hideWidget);

		// Set the two heights for the bar.
		// Due to a Firefox bug with scrollHeight we avoid adding padding to container.
		// jQuery.height() does extra stuff, use plain CSS instead.
		const crop = $widget.find('.res-show-link-content').outerHeight(true) - $widget.find('.res-show-link-tagline').outerHeight();
		$widget.css({ height: crop });

		$widget
			.on('mouseenter', e => $widget.css({ height: e.currentTarget.scrollHeight }))
			.on('mouseleave', () => $widget.css({ height: crop }));
	});

	window.addEventListener('scroll', _.debounce(updateWidget, 100, { leading: true, trailing: true }));
}
