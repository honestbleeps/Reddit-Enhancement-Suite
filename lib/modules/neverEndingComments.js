/* @flow */

import { Module } from '../core/module';
import { Thing, SelectedThing, frameDebounce, mutex, watchForDescendants, waitForDetach } from '../utils';

export const module: Module<*> = new Module('neverEndingComments');

module.moduleName = 'necName';
module.category = 'commentsCategory';
module.description = 'necDescription';
module.options = {
	loadChildComments: {
		type: 'boolean',
		value: false,
		description: 'necLoadChildCommentsDesc',
		title: 'necLoadChildCommentsTitle',
	},
};

module.include = [
	'comments',
];

module.afterLoad = () => {
	const context = document.body.querySelector(module.options.loadChildComments.value ? '.nestedlisting' : '.nestedlisting > .thing.morechildren');
	if (!context) return;

	const visibleLoaders = new Set();

	const io = new IntersectionObserver(entries => {
		for (const { isIntersecting, target } of entries) {
			if (!context.contains(target)) io.unobserve(target);
			const isLoading = target.innerText && target.innerText.includes('loading');

			if (isIntersecting && !isLoading) visibleLoaders.add(target);
			else visibleLoaders.delete(target);
		}

		if (visibleLoaders.size) {
			window.addEventListener('scroll', loadFirst);
			loadFirst();
		} else {
			window.removeEventListener('scroll', loadFirst);
		}
		// Don't load the top comments, as they may are likely above the current focused comment and may mess up scroll anchoring
		// also load comments that are a little beneath the viewport so this works a bit more seamlessly
	}, { rootMargin: '-10% 0px 10% 0px' });

	// Wait a little before starting load, in case the user is just quickly scrolling through
	const loadFirst = frameDebounce(mutex(async () => {
		// Load one at a time to reduce the latency
		// The uppermost is loaded first, as that is likely the one the user is interested having expanded
		const loader = Array.from(visibleLoaders.values()).sort((a, b) => 3 - (a.compareDocumentPosition(b) & 6))
			.find(e => {
				// Don't load any above the selected thing
				const thing = Thing.from(e);
				return !SelectedThing.current || !thing || (SelectedThing.current.getDirectionOf(thing) === 'down');
			});
		if (loader) {
			loader.click();
			await waitForDetach(
				loader,
				// The load may fail
				new Promise(res => { setTimeout(res, 3000); }),
			);
			loadFirst();
		}
	}), 5);

	watchForDescendants(context, '.morecomments a', ele => { io.observe(ele); });
};
