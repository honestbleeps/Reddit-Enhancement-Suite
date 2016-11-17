/* @flow */

import { $ } from '../vendor';
import { Thing, isPageType, observe, downcast } from './';

type WatcherType = 'siteTable' | 'newComments' | 'selfText' | 'newCommentsForms';
type WatcherCallback = (e: HTMLElement) => void | Promise<void>;

export const watchers: { [key: WatcherType]: WatcherCallback[] } = {
	siteTable: [],
	newComments: [],
	selfText: [],
	newCommentsForms: [],
};

export function watchForElement(type: WatcherType, callback: WatcherCallback) {
	watchers[type].push(callback);
}

export function initObservers() {
	if (!isPageType('comments')) {
		// initialize sitetable observer...
		const siteTable = Thing.thingsContainer();

		if (siteTable) {
			observe(siteTable, { childList: true }, mutation => {
				if (!mutation.addedNodes.length) return;

				const addedNode = downcast(mutation.addedNodes[0], HTMLElement);

				if ($(addedNode).is(Thing.containerSelector)) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					for (const expando of addedNode.querySelectorAll('.entry div.expando')) {
						addSelfTextObserver(expando);
					}
					for (const fn of watchers.siteTable) fn(addedNode);
				}
			});
		}
	} else {
		// initialize sitetable observer...
		const siteTable = document.querySelector('.commentarea > .sitetable') || document.querySelector('.sitetable');

		if (siteTable) {
			observe(siteTable, { childList: true }, mutation => {
				if (!mutation.addedNodes.length) return;

				const addedNode = downcast(mutation.addedNodes[0], HTMLElement);

				// handle comment listing pages (not within a post)
				if ($(addedNode).is('[id^="siteTable"]')) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					for (const expando of addedNode.querySelectorAll('.entry div.expando')) {
						addSelfTextObserver(expando);
					}
					for (const fn of watchers.siteTable) fn(addedNode);
				}

				if (addedNode.classList.contains('thing')) {
					const newCommentEntry = addedNode.querySelector('.entry');
					if (!$(newCommentEntry).data('alreadyDetected')) {
						$(newCommentEntry).data('alreadyDetected', true);
						for (const child of addedNode.querySelectorAll('.child')) {
							addNewCommentFormObserver(child);
						}
						for (const fn of watchers.newComments) fn(newCommentEntry);
					}
				}
			});
		}
	}

	for (const expando of document.querySelectorAll('.entry div.expando')) {
		addSelfTextObserver(expando);
	}

	// initialize new comments observers on demand, by first wiring up click listeners to "load more comments" buttons.
	// on click, we'll add a mutation observer...
	$('.morecomments a').on('click', addNewCommentObserverToTarget);

	// on click, we'll add a mutation observer...
	for (const child of document.querySelectorAll('.thing .child')) {
		addNewCommentFormObserver(child);
	}
}

function addNewCommentObserverToTarget(e: Event) {
	const ele = $(e.currentTarget).closest('.sitetable')[0];
	// mark this as having an observer so we don't add multiples...
	if (!$(ele).hasClass('hasObserver')) {
		$(ele).addClass('hasObserver');
		addNewCommentObserver(ele);
	}
}

function addNewCommentObserver(ele) {
	const observer = observe(ele, { childList: true }, mutation => {
		// look at the added nodes, and find comment containers.
		for (const node of Array.from(mutation.addedNodes).map(n => downcast(n, Element))) {
			if (node.classList.contains('thing')) {
				for (const child of node.querySelectorAll('.child')) {
					addNewCommentFormObserver(child);
				}

				// check for "load new comments" links within this group as well...
				$(node).find('.morecomments a').click(addNewCommentObserverToTarget);

				// look at the comment containers and find actual comments...
				for (const subComment of node.querySelectorAll('.entry')) {
					const $subComment = $(subComment);
					if (!$subComment.data('alreadyDetected')) {
						$subComment.data('alreadyDetected', true);
						for (const fn of watchers.newComments) fn(subComment);
					}
				}
			}
		}

		// disconnect this observer once all callbacks have been run.
		// unless we have the nestedlisting class, in which case don't disconnect because that's a
		// bottom level load more comments where even more can be loaded after, so they all drop into this
		// same .sitetable div.
		if (!$(ele).hasClass('nestedlisting')) {
			observer.disconnect();
		}
	});
}

function addNewCommentFormObserver(ele) {
	observe(ele, { childList: true }, mutation => {
		const form = $(mutation.target).children('form');
		if (form.length === 1) {
			for (const fn of watchers.newCommentsForms) fn(form[0]);
		} else {
			const newOwnComment = $(mutation.target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
			if (newOwnComment.length === 1) {
				// new comment detected from the current user...
				for (const fn of watchers.newComments) fn(newOwnComment[0]);
			}
		}
		// only the first mutation (legacy behavior)
		return true;
	});
}

function addSelfTextObserver(ele) {
	observe(ele, { childList: true }, mutation => {
		const form = $(mutation.target).find('form');
		if (form.length) {
			for (const fn of watchers.selfText) fn(form[0]);
		}
		// only the first mutation (legacy behavior)
		return true;
	});
}
