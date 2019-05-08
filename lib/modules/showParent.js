/* @flow */

import _ from 'lodash';
import { $ } from '../vendor';
import { Thing } from '../utils';
import { Module } from '../core/module';
import * as Hover from './hover';
import * as SelectedEntry from './selectedEntry';

export const module: Module<*> = new Module('showParent');

module.moduleName = 'showParentName';
module.category = 'myAccountCategory';
module.description = 'showParentDesc';
module.options = {
	hoverDelay: {
		title: 'showParentHoverDelayTitle',
		type: 'text',
		value: '500',
		description: 'showParentHoverDelayDesc',
		advanced: true,
	},
	fadeDelay: {
		title: 'showParentFadeDelayTitle',
		type: 'text',
		value: '200',
		description: 'showParentFadeDelayDesc',
		advanced: true,
	},
	fadeSpeed: {
		title: 'showParentFadeSpeedTitle',
		type: 'text',
		value: '0.7',
		description: 'showParentFadeSpeedDesc',
		advanced: true,
	},
	direction: {
		title: 'showParentDirectionTitle',
		type: 'enum',
		value: 'down',
		values: [{
			name: 'Above',
			value: 'up',
		}, {
			name: 'Below',
			value: 'down',
		}],
		description: 'showParentDirectionDesc',
		bodyClass: true,
	},
};
module.include = [
	'comments',
];

module.contentStart = () => {
	$(document.body).on('mouseenter', '.comment .buttons :not(:first-child) .bylink', function() {
		startHover(this, {
			openDelay: parseFloat(module.options.hoverDelay.value),
			fadeDelay: parseFloat(module.options.fadeDelay.value),
			fadeSpeed: parseFloat(module.options.fadeSpeed.value),
		});
	});
};

const closeOnSelect = _.once(() => {
	SelectedEntry.addListener(() => Hover.infocard(module.moduleID).close(false), 'beforePaint');
});

export function startHover(button: HTMLElement, options: * = {}) {
	closeOnSelect();

	Hover.infocard(module.moduleID)
		.target(button)
		.options(options)
		.populateWith(() => showCommentHover(Thing.checkedFrom(button)))
		.begin();
}

function handleVoteClick() {
	const $this = $(this);
	const voteClasses = {
		up: 'likes',
		none: 'unvoted',
		down: 'dislikes',
	};
	const id = $this.parent().parent().attr('data-fullname');
	let direction = (/(up|down)(?:mod)?/).exec(this.className);

	if (!direction) return;

	direction = direction[1];

	const $targetButton = $(`.content .thing.id-${id}`)
		.children('.midcol')
		.find(`.arrow.${direction}, .arrow.${direction}mod`);

	if ($targetButton.length !== 1) {
		console.error('When attempting to find %s arrow for comment %s %d elements were returned',
			direction, id, $targetButton.length);
		return;
	}

	// Prevent other click handlers from running
	// Note that $targetButton's other click handlers run before this one,
	// by a "first come, first serve" basis
	function removeClickHandlers(event: Event) {
		event.stopPropagation();
	}

	$targetButton.on('click', removeClickHandlers);
	$targetButton.click();
	$targetButton.off('click', removeClickHandlers);

	const $midcol = $this.parent();

	let startDir = 'none';
	for (const [key, value] of Object.entries(voteClasses)) {
		if ($midcol.hasClass(value)) {
			startDir = key;
			break;
		}
	}

	const newDir = direction === startDir ? 'none' : direction;

	$midcol.parent().children(`.${voteClasses[startDir]}`)
		.removeClass(voteClasses[startDir])
		.addClass(voteClasses[newDir]);
	$midcol.find('.up, .upmod')
		.toggleClass('upmod', newDir === 'up')
		.toggleClass('up', newDir !== 'up');
	$midcol.find('.down, .downmod')
		.toggleClass('downmod', newDir === 'down')
		.toggleClass('down', newDir !== 'down');
}

function showCommentHover(thing: Thing) {
	const direction = module.options.direction.value;

	let $parents = $(thing.element).parents('.thing').clone();
	let topParentURL = '';

	if ($parents.length === 0) {
		// Get parent URL from visible top comment
		topParentURL = $(thing.element).find('[data-event-action="parent"]').first().attr('data-href-url');
	} else {
		// Find visible top comment before getting parent URL
		const topParentId = $parents.last().attr('data-fullname');
		// topParentURL will be undefined at top-most parent as it does not have a parent link
		topParentURL = $(`[data-fullname="${topParentId}"] > .entry [data-event-action="parent"]`).first().attr('data-href-url');
	}
	if (direction === 'up') {
		$parents = $($parents.get().reverse());
	}

	$parents.addClass('comment parentComment').removeClass('thing even odd');
	$parents.children('.child').remove(); // replies and reply edit form
	$parents.each(function() {
		const $this = $(this);

		// Remove the keyboardNav functionality
		$this.off('click');

		// A link to go to the actual comment
		let id = $this.attr('data-fullname');
		if (id) {
			id = id.slice(3);
			$this.find('> .entry .tagline').append(`<a class="bylink parentlink" href="#${id}">goto comment</a>`);
		}
	});
	$parents.find('.parent').remove();
	$parents.find('.usertext-body').show(); // contents
	$parents.find('.flat-list.buttons').remove(); // buttons
	$parents.find('.usertext-edit').remove(); // edit form
	$parents.find('.RESUserTag').remove(); // tags
	$parents.find('.voteWeight').remove(); // tags
	$parents.find('.collapsed').remove(); // unused collapse view
	$parents.find('.expand').remove(); // expand button
	$parents.find('form').attr('id', ''); // IDs should be unique
	$parents.find('.arrow').on('click', handleVoteClick); // bind handlers to vote buttons
	/*
	I am stripping out the image viewer stuff for now.
	Making the image viewer work here requires some changes that are for another time.
	*/
	$parents.find('.res-expando-box, .expando-button').remove(); // image viewer
	$parents.find('.keyNavAnnotation').remove();

	const $container = $('<div class="parentCommentWrapper">');
	$container.append($parents);
	// Does not show view parent comment when top-most parent is shown
	if (topParentURL) {
		$container.append(`<a class="bylink" href="${topParentURL}">View parent comment</a>`);
	}
	$parents.slice(0, -1).after('<div class="parentArrow">reply to</div>');
	return ['Parents', $container];
}
