import { $ } from '../vendor';
import * as Hover from './hover';

export const module = {};

module.moduleID = 'showParent';
module.moduleName = 'Show Parent on Hover';
module.category = 'Comments';
module.description = 'Shows the parent comments when hovering over the "parent" link of a comment.';
module.options = {
	hoverDelay: {
		type: 'text',
		value: 500,
		description: 'Delay, in milliseconds, before parent hover loads. Default is 500.',
		advanced: true,
	},
	fadeDelay: {
		type: 'text',
		value: 200,
		description: 'Delay, in milliseconds, before parent hover fades away after the mouse leaves. Default is 200.',
		advanced: true,
	},
	fadeSpeed: {
		type: 'text',
		value: 0.7,
		description: 'Fade animation\'s speed (in seconds). Default is 0.7.',
		advanced: true,
	},
	direction: {
		type: 'enum',
		value: 'down',
		values: [{
			name: 'Above',
			value: 'up',
		}, {
			name: 'Below',
			value: 'down',
		}],
		description: 'Order the parent comments to place each parent comment above or below its children.',
		bodyClass: true,
	},
};
module.include = [
	'comments',
];

module.go = function() {
	$('body').on('mouseenter', '.comment .buttons :not(:first-child) .bylink', function() {
		Hover.infocard(module.moduleID)
			.target(this)
			.options({
				openDelay: module.options.hoverDelay.value,
				fadeDelay: module.options.fadeDelay.value,
				fadeSpeed: module.options.fadeSpeed.value,
			})
			.populateWith(showCommentHover)
			.begin();
	});
};

function handleVoteClick() {
	const $this = $(this);
	const voteClasses = {
		'-1': 'dislikes',
		0: 'unvoted',
		1: 'likes',
	};
	const id = $this.parent().parent().data('fullname');
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
	function removeClickHandlers(event) {
		event.stopPropagation();
	}

	$targetButton.on('click', removeClickHandlers);
	$targetButton.click();
	$targetButton.off('click', removeClickHandlers);

	const clickedDir = (direction === 'up' ? 1 : -1);
	const $midcol = $this.parent();

	let startDir;
	for (const [key, value] of Object.entries(voteClasses)) {
		if ($midcol.hasClass(value)) {
			startDir = parseInt(key, 10);
			break;
		}
	}

	const newDir = clickedDir === startDir ? 0 : clickedDir;

	$midcol.parent().children(`.${voteClasses[startDir]}`)
		.removeClass(voteClasses[startDir])
		.addClass(voteClasses[newDir]);
	$midcol.find('.up, .upmod')
		.toggleClass('upmod', newDir === 1)
		.toggleClass('up', newDir !== 1);
	$midcol.find('.down, .downmod')
		.toggleClass('downmod', newDir === -1)
		.toggleClass('down', newDir !== -1);
}

export function showCommentHover(base) {
	const direction = module.options.direction.value;

	let $thing = $(base);
	// If the passed element is not a `.thing` move up to the nearest `.thing`
	if (!$thing.is('.thing')) $thing = $thing.parents('.thing:first');

	let $parents = $thing.parents('.thing').clone();

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
		let id = $this.data('fullname');
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
	$parents.find('.entry').removeClass('RES-keyNav-activeElement');
	$parents.find('.author.userTagged').removeClass('userTagged'); // tags again
	$parents.find('.collapsed').remove(); // unused collapse view
	$parents.find('.expand').remove(); // expand button
	$parents.find('form').attr('id', ''); // IDs should be unique
	$parents.find('.arrow').prop('onclick', null) // clear the vote handlers
	.on('click', handleVoteClick); // bind handlers to vote buttons
	/*
	I am stripping out the image viewer stuff for now.
	Making the image viewer work here requires some changes that are for another time.
	*/
	$parents.find('.res-expando-box, .expando-button').remove(); // image viewer
	$parents.find('.keyNavAnnotation').remove();

	const $container = $('<div class="parentCommentWrapper">');
	$container.append($parents);
	$parents.slice(0, -1).after('<div class="parentArrow">reply to</div>');
	return ['Parents', $container];
}
