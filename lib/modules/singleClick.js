import { $ } from '../core/global';

addModule('singleClick', (module, moduleID) => {
	module.moduleName = 'Single Click Opener';
	module.category = 'Browsing';
	module.description = 'Adds an [l+c] link that opens a link and the comments page in new tabs for you in one click.';
	module.options = {
		openOrder: {
			type: 'enum',
			values: [{
				name: 'open comments then link',
				value: 'commentsfirst'
			}, {
				name: 'open link then comments',
				value: 'linkfirst'
			}],
			value: 'commentsfirst',
			description: 'What order to open the link/comments in.'
		},
		hideLEC: {
			type: 'boolean',
			value: false,
			description: 'Hide the [l=c] when the link is the same as the comments page',
			advanced: true,
			bodyClass: true
		},
		openBackground: {
			type: 'boolean',
			value: false,
			description: 'Open the [l+c] link in background tabs'
		}
	};
	module.exclude = [
		'comments',
		/^https?:\/\/(?:[\-\w\.]+\.)?reddit\.com\/subreddits\/?/i
	];
	module.go = function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.watchForElement('siteTable', applyLinks);
			applyLinks();

			// mousedown because Firefox doesn't fire click events on middle click...
			$(document.body).on('mousedown', '.redditSingleClick', e => {
				if (e.button !== 2) {
					e.preventDefault();

					const thing = new RESUtils.thing(e.target);

					const selected = !e.button && !e.ctrlKey && !module.options.openBackground.value;
					const link = thing.getPostLink().href;
					const comments = thing.getCommentsLink().href;
					const urls = [link];

					if (thing.isLinkPost()) urls.push(comments);
					if (module.options.openOrder.value === 'commentsfirst') urls.reverse();

					RESEnvironment.openNewTabs(selected, ...urls);
				}
			});
		}
	};

	function applyLinks(ele = document) {
		const entries = Array.from(ele.querySelectorAll('#siteTable .entry, #siteTable_organic .entry'));
		for (const entry of entries) {
			if (entry.classList.contains('lcTagged')) continue;
			entry.classList.add('lcTagged');
			// changed from a link to a span because you can't cancel a new window on middle click of a link during the mousedown event, and a click event isn't triggered.
			$(entry)
				.find('ul.flat-list')
				.append('<li><span class="redditSingleClick"></span></li>');
		}
	}
});
