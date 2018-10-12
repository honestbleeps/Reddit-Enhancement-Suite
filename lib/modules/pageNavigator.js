/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Module } from '../core/module';
import { getHeaderOffset, isPageType, scrollTo, frameThrottle, string, watchForThings } from '../utils';
import { i18n } from '../environment';
import * as Floater from './floater';
import * as SettingsNavigation from './settingsNavigation';
import * as SelectedEntry from './selectedEntry';

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

module.beforeLoad = () => {
	if (module.options.showLink.value && isPageType('comments')) {
		watchForThings(['post'], showLinkTitle);
	}
};

module.afterLoad = () => {
	if (module.options.toComment.value && isPageType('comments')) {
		backToNewCommentArea();
	}
	if (module.options.toTop.value) {
		backToTop();
	}
};

function backToTop() {
	const $backToTop = $(`<a class="pageNavigator res-icon" data-id="top" href="#header" title="${i18n('pageNavToTopTitle')}">&#xF148;</a>`);
	$backToTop.on('click', (e: Event) => {
		e.preventDefault();
		scrollTo(0, 0);
		SelectedEntry.move('top');
	});
	Floater.addElement($backToTop);
}

const showLinkTitleTemplate = ({ thumbnailSrc, linkId, settingsHash, linkHref, linkNewTab, title, domainHref, domain, time, author, authorHref }) => string.html`
	<div class="res-show-link hide">
		${thumbnailSrc && string._html`
			<span class="res-show-link-thumb"><img src="${thumbnailSrc}" alt="thumbnail" /></span>
		`}
		<a href="#${linkId}" class="res-icon toTop" title="Jump to title">&#xF148;</a>
		<a href="${settingsHash}" class="gearIcon" title="Configure this widget"></a>
		<div class="res-show-link-content">
			<div class="res-show-link-header">
				<a href="${linkHref}" ${linkNewTab && string._html`target="_blank" rel="noopener noreferer"`} class="res-show-link-title">${title}</a>
				<a href="${domainHref}" class="res-show-link-domain">(<span>${domain}</span>)</a>
			</div>
			<div class="res-show-link-tagline">
				Submitted ${time} by
				<a href="${authorHref}" class="res-show-link-author">${author}</a>
			</div>
		</div>
	</div>
`;

function backToNewCommentArea() {
	const commentArea = document.querySelector('.commentarea > form.usertext textarea');
	if (!commentArea || !commentArea.offsetParent) return;
	const $backToNewCommentArea = $(`<a class="pageNavigator res-icon" data-id="addComment" href="#comments" title="${i18n('pageNavToCommentTitle')}">&#xF003;</a>`);
	$backToNewCommentArea.on('click', (e: Event) => {
		e.preventDefault();
		commentArea.focus();
	});
	Floater.addElement($backToNewCommentArea);
}

const showLinkTitle = _.once(submissionThing => {
	let $widget;
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
			linkId: submissionThing.element.id,
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

		new IntersectionObserver(entries => {
			belowSubmission = !entries[0].isIntersecting;
			if (!belowSubmission) hideWidget();
		}, { rootMargin: '100px 0px 0px 0px' }).observe(submissionThing.element);

		window.addEventListener('scroll', () => { if (scrollTo.isProgrammaticEvent()) hideWidget(); });
	});

	window.addEventListener('wheel', updateWidget, { passive: true });
});
