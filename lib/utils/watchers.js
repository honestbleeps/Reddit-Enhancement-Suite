import { $ } from '../vendor';
import { Thing, invokeAll, isPageType, observe } from './';

export const watchers = {
	siteTable: [],
	newComments: [],
	selfText: [],
	newCommentsForms: [],
};

export function watchForElement(type, callback) {
	switch (type) {
		case 'siteTable':
			watchers.siteTable.push(callback);
			break;
		case 'newComments':
			watchers.newComments.push(callback);
			break;
		case 'selfText':
			watchers.selfText.push(callback);
			break;
		case 'newCommentsForms':
			watchers.newCommentsForms.push(callback);
			break;
		default:
			throw new Error(`Invalid watcher type: ${type}`);
	}
}

export function initObservers() {
	if (!isPageType('comments')) {
		// initialize sitetable observer...
		const siteTable = Thing.thingsContainer();

		if (siteTable) {
			observe(siteTable, { childList: true }, mutation => {
				if ($(mutation.addedNodes[0]).is(Thing.containerSelector)) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					$(mutation.addedNodes[0]).find('.entry div.expando').each(function() {
						addSelfTextObserver(this);
					});
					watchers.siteTable::invokeAll(mutation.addedNodes[0]);
				}
			});
		}
	} else {
		// initialize sitetable observer...
		const siteTable = document.querySelector('.commentarea > .sitetable') || document.querySelector('.sitetable');

		if (siteTable) {
			observe(siteTable, { childList: true }, mutation => {
				// handle comment listing pages (not within a post)
				const $container = $(mutation.addedNodes[0]);
				if ($container.is('[id^="siteTable"]')) {
					// when a new sitetable is loaded, we need to add new observers for selftexts within that sitetable...
					$container.find('.entry div.expando').each(function() {
						addSelfTextObserver(this);
					});
					watchers.siteTable::invokeAll(mutation.addedNodes[0]);
				}

				if (mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.contains('thing')) {
					const thing = mutation.addedNodes[0];
					const newCommentEntry = thing.querySelector('.entry');
					if (!$(newCommentEntry).data('alreadyDetected')) {
						$(newCommentEntry).data('alreadyDetected', true);
						$(thing).find('.child').each(function() {
							addNewCommentFormObserver(this);
						});
						watchers.newComments::invokeAll(newCommentEntry);
					}
				}
			});
		}
	}

	$('.entry div.expando').each(function() {
		addSelfTextObserver(this);
	});

	// initialize new comments observers on demand, by first wiring up click listeners to "load more comments" buttons.
	// on click, we'll add a mutation observer...
	$('.morecomments a').on('click', addNewCommentObserverToTarget);

	// on click, we'll add a mutation observer...
	$('.thing .child').each(function() {
		addNewCommentFormObserver(this);
	});
}

function addNewCommentObserverToTarget(e) {
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
		for (const node of mutation.addedNodes) {
			if (node.classList.contains('thing')) {
				const $node = $(node);

				$node.find('.child').each(function() {
					addNewCommentFormObserver(this);
				});

				// check for "load new comments" links within this group as well...
				$node.find('.morecomments a').click(addNewCommentObserverToTarget);

				// look at the comment containers and find actual comments...
				for (const subComment of node.querySelectorAll('.entry')) {
					const $subComment = $(subComment);
					if (!$subComment.data('alreadyDetected')) {
						$subComment.data('alreadyDetected', true);
						watchers.newComments::invokeAll(subComment);
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
			watchers.newCommentsForms::invokeAll(form[0]);
		} else {
			const newOwnComment = $(mutation.target).find(' > div.sitetable > .thing:first-child'); // assumes new comment will be prepended to sitetable's children
			if (newOwnComment.length === 1) {
				// new comment detected from the current user...
				watchers.newComments::invokeAll(newOwnComment[0]);
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
			watchers.selfText::invokeAll(form[0]);
		}
		// only the first mutation (legacy behavior)
		return true;
	});
}
