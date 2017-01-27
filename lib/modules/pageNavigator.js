/* @flow */

import _ from 'lodash';
import showLinkTitleTemplate from '../templates/showLinkTitle.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { getHeaderOffset, isPageType, scrollTo, Thing, frameThrottle } from '../utils';
import { i18n } from '../environment/i18n';
import * as Floater from './floater';
import * as SettingsNavigation from './settingsNavigation';

export const module: Module<*> = new Module('pageNavigator');

module.moduleName = 'pageNavName';
module.category = 'browsingCategory';
module.description = 'pageNavDesc';
module.options = {
	toTop: {
		type: 'boolean',
		value: true,
		description: 'pageNavToTopDesc',
		title: 'pageNavToTopTitle',
	},
	toComment: {
		type: 'boolean',
		value: true,
		description: 'pageNavToCommentDesc',
		title: 'pageNavToCommentTitle',
	},
	showLink: {
		type: 'boolean',
		value: true,
		description: 'pageNavShowLinkDesc',
		title: 'pageNavShowLinkTitle',
	},
	showLinkNewTab: {
		type: 'boolean',
		value: true,
		description: 'pageNavShowLinkNewTabDesc',
		title: 'pageNavShowLinkNewTabTitle',
		dependsOn: options => options.showLink.value,
	},
};

module.afterLoad = () => {
	if (module.options.toComment.value && isPageType('comments')) {
		backToNewCommentArea();
	}
	if (module.options.toTop.value) {
		backToTop();
	}
	if (module.options.showLink.value && isPageType('comments')) {
		showLinkTitle();
	}
};

function backToTop() {
	const $backToTop = $(`<a class="pageNavigator res-icon" data-id="top" href="#header" title="${i18n('pageNavToTopTitle')}">&#xF148;</a>`);
	$backToTop.on('click', (e: Event) => {
		e.preventDefault();
		scrollTo(0, 0);
	});
	Floater.addElement($backToTop);
}

function backToNewCommentArea() {
	const commentArea = document.querySelector('.commentarea > form.usertext textarea');
	if (!commentArea) return;
	const $backToNewCommentArea = $(`<a class="pageNavigator res-icon" data-id="addComment" href="#comments" title="${i18n('pageNavToCommentTitle')}">&#xF003;</a>`);
	$backToNewCommentArea.on('click', (e: Event) => {
		e.preventDefault();
		commentArea.focus();
	});
	Floater.addElement($backToNewCommentArea);
}

function showLinkTitle() {
	let $widget;
	const $submission = $('body > .content > .sitetable > .thing');
	const submissionThing = Thing.checkedFrom($submission);
	let belowSubmission = true;
	let baseHeight, hoverHeight;

	function showWidget() {
		$widget.css({ top: getHeaderOffset(true) }).removeClass('hide');
	}

	function hideWidget() {
		$widget.css({ top: -baseHeight }).addClass('hide');
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

	const updateWidget = frameThrottle((e: WheelEvent) => {
		const scrollingUp = e.deltaY < 0;

		if (scrollingUp && belowSubmission) {
			initialize();
			// We have scrolled up while below the linklisting.
			showWidget();
		} else if ($widget) {
			hideWidget();
		}
	});

	const initialize = _.once(() => {
		$widget = renderWidget()
			.on('mouseenter', () => $widget.css({ height: hoverHeight }))
			.on('mouseleave', () => $widget.css({ height: baseHeight }))
			.appendTo(document.body);

		baseHeight = $widget.get(0).getBoundingClientRect().height;
		hoverHeight = $widget.get(0).scrollHeight;

		// $FlowIssue TODO
		new IntersectionObserver(entries => {
			belowSubmission = entries[0].intersectionRatio === 0;
			if (!belowSubmission) hideWidget();
		}, { rootMargin: '100px 0px 0px 0px' }).observe($submission.get(0));
	});

	window.addEventListener('wheel', updateWidget, process.env.BUILD_TARGET !== 'safari' ? { passive: true } : false);
}
