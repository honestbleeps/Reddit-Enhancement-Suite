import _ from 'lodash';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import {
	Thing,
	click,
	currentSubreddit,
	fadeElementIn,
	fadeElementOut,
	getPercentageVisibleYAxis,
	hashKeyArray,
	hashKeyEvent,
	isCommentCode,
	isCurrentSubreddit,
	isEmptyLink,
	isPageType,
	loggedInUser,
	matchesPageLocation,
	mousedown,
	niceKeyCode,
} from '../utils';
import { openNewTab } from '../environment';
import * as CommandLine from './commandLine';
import * as CommentNavigator from './commentNavigator';
import * as EasterEgg from './easterEgg';
import * as Hover from './hover';
import * as NeverEndingReddit from './neverEndingReddit';
import * as NoParticipation from './noParticipation';
import * as SaveComments from './saveComments';
import * as SelectedEntry from './selectedEntry';
import * as ShowImages from './showImages';
import * as ShowParent from './showParent';

export const module = {};

module.moduleID = 'keyboardNav';
module.moduleName = 'Keyboard Navigation';
module.category = ['Browsing'];
module.description = 'Keyboard navigation for reddit!';
module.options = {
	mediaBrowseMode: {
		type: 'boolean',
		value: true,
		description: 'If media is open on the currently selected post when moving up/down one post, open media on the next post.',
	},
	scrollOnExpando: {
		type: 'boolean',
		value: true,
		description: 'Scroll window to top of link when expando key is used (to keep pics etc in view)',
		advanced: true,
	},
	linearScrollStyle: {
		type: 'enum',
		values: [{
			name: 'directional',
			value: 'directional',
		}, {
			name: 'page up/down',
			value: 'page',
		}, {
			name: 'lock to top',
			value: 'top',
		}, {
			name: 'legacy',
			value: 'legacy',
		}],
		value: 'directional',
		description: `
			When moving up/down with keynav, when and how should RES scroll the window?
			<br>Directional: Scroll just enough to bring the selected element into view, if it's offscreen.
			<br>Page up/down: Scroll up/down an entire page after reaching the top or bottom.
			<br>Lock to top: Always align the selected element to the top of the screen.
			<br>Legacy: If the element is offscreen, lock to top.
		`,
		advanced: true,
	},
	commentsLinkNumbers: {
		type: 'boolean',
		value: true,
		description: 'Assign number keys (e.g. [1]) to links within selected comment',
	},
	commentsLinkNumberPosition: {
		type: 'enum',
		values: [{
			name: 'Place on right',
			value: 'right',
		}, {
			name: 'Place on left',
			value: 'left',
		}],
		value: 'right',
		description: 'Which side commentsLinkNumbers are displayed',
		advanced: true,
	},
	commentsLinkNewTab: {
		type: 'boolean',
		value: true,
		description: 'Open number key links in a new tab',
		advanced: true,
	},
	onHideMoveDown: {
		type: 'boolean',
		value: true,
		description: 'After hiding a link, automatically select the next link',
		advanced: true,
	},
	onVoteMoveDown: {
		type: 'boolean',
		value: false,
		description: 'After voting on a link, automatically select the next link',
		advanced: true,
	},
	onVoteCommentMoveDown: {
		type: 'boolean',
		value: false,
		description: 'After voting on a comment, automatically select the next comment',
		advanced: true,
	},
	useGoMode: {
		type: 'boolean',
		value: true,
		description: 'Use go mode (require go mode before "go to" shortcuts are used, e.g. frontpage)',
	},
	followLinkNewTabFocus: {
		type: 'boolean',
		value: true,
		description: 'When following a link in new tab - focus the tab?',
		advanced: true,
	},
};

const commands = {
	toggleHelp: {
		value: [191, false, false, true], // ? (note the true in the shift slot)
		description: 'Show help for keyboard shortcuts',
	},
	toggleCmdLine: {
		value: [190, false, false, false], // .
		description: 'Launch RES command line',
		callback() { CommandLine.toggleCmdLine(); },
	},
	hide: {
		include: ['linklist', 'modqueue', 'profile'],
		value: [72, false, false, false], // h
		description: 'Hide link',
	},
	moveUp: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [75, false, false, false], // k
		description: 'Move up to the previous link or comment in flat lists',
		callback() {
			move(
				thing => thing.getNext({ direction: 'up' }),
				{ scrollStyle: module.options.linearScrollStyle.value, tryMediaBrowse: true }
			);
		},
	},
	moveDown: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [74, false, false, false], // j
		description: 'Move down to the next link or comment in flat lists',
	},
	moveUpComment: {
		include: ['comments', 'inbox'],
		value: [75, false, false, false], // k
		description: 'Move up to the previous comment on threaded comment pages',
		callback() {
			move(
				thing => thing.getNext({ direction: 'up' }),
				{ scrollStyle: module.options.linearScrollStyle.value }
			);
		},
	},
	moveDownComment: {
		include: ['comments', 'inbox'],
		value: [74, false, false, false], // j
		description: 'Move down to the next comment on threaded comment pages',
		callback() {
			move(
				thing => thing.getNext({ direction: 'down' }),
				{ scrollStyle: module.options.linearScrollStyle.value }
			);
		},
	},
	moveTop: {
		include: ['linklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [75, false, false, true], // shift-k
		description: 'Move to top of list (on link pages)',
		callback() { move(Thing.visibleThingElements()[0], { scrollStyle: null }); },
	},
	moveBottom: {
		include: ['linklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [74, false, false, true], // shift-j
		description: 'Move to bottom of list (on link pages)',
		callback() { move(Thing.visibleThingElements().slice(-1)[0], { scrollStyle: 'top' }); },
	},
	moveUpSibling: {
		include: ['comments'],
		value: [75, false, false, true], // shift-k
		description: 'Move to previous sibling (in comments) - skips to previous sibling at the same depth.',
		callback() {
			move(thing => thing.getNextSibling({ direction: 'up' }) || thing.getParent());
		},
	},
	moveDownSibling: {
		include: ['comments'],
		value: [74, false, false, true], // shift-j
		description: 'Move to next sibling (in comments) - skips to next sibling at the same depth.',
		callback() {
			move(thing => thing.getClosest(thing.getNextSibling, { direction: 'down' }));
		},
	},
	moveUpThread: {
		include: ['comments'],
		value: [75, true, false, true], // shift-alt-k
		description: 'Move to the topmost comment of the previous thread (in comments).',
		callback() {
			move(thing => thing.getThreadTop().getNextSibling({ direction: 'up' }) || thing.getThreadTop());
		},
	},
	moveDownThread: {
		include: ['comments'],
		value: [74, true, false, true], // shift-alt-j
		description: 'Move to the topmost comment of the next thread (in comments).',
		callback() {
			move(thing => thing.getThreadTop().getNextSibling({ direction: 'down' }));
		},
	},
	moveToTopComment: {
		include: ['comments'],
		value: [84, false, false, false], // t
		description: 'Move to the topmost comment of the current thread (in comments).',
		callback() { move(thing => thing.getThreadTop()); },
	},
	moveToParent: {
		include: ['comments'],
		value: [80, false, false, false], // p
		description: 'Move to parent (in comments).',
		callback() { move(thing => thing.getParent()); },
	},
	showParents: {
		include: ['comments'],
		value: [80, false, false, true], // p
		description: 'Display parent comments.',
	},
	followLink: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, false], // enter
		description: 'Follow link (link pages only)',
	},
	followLinkNewTab: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, true], // shift-enter
		description: 'Follow link in new tab (link pages only)',
		callback() {
			module.followLink(true);
		},
	},
	toggleExpando: {
		value: [88, false, false, false], // x
		description: 'Toggle expando (image/text/video) (link pages only)',
		callback() {
			const thing = SelectedEntry.selectedThing();
			if (thing) ShowImages.toggleThingExpandos(thing, module.options.scrollOnExpando.value);
		},
	},
	imageSizeUp: {
		value: [187, false, false, false], // = -- 61 in firefox
		description: 'Increase the size of image(s) in the highlighted post area',
		callback() { imageResize({ factor: 1.3 }); },
	},
	imageSizeDown: {
		value: [189, false, false, false], // - -- 173 in firefox
		description: 'Decrease the size of image(s) in the highlighted post area',
		callback() { imageResize({ factor: 1 / 1.3 }); },
	},
	imageSizeUpFine: {
		value: [187, false, false, true], // shift-=
		description: 'Increase the size of image(s) in the highlighted post area (finer control)',
		callback() { imageResize({ factor: 1.1 }); },
	},
	imageSizeDownFine: {
		value: [189, false, false, true], // shift--
		description: 'Decrease the size of image(s) in the highlighted post area (finer control)',
		callback() { imageResize({ factor: 1 / 1.1 }); },
	},
	imageSizeAnyHeight: {
		value: [39, false, false, true], // shift-right
		description: 'Removes the height restriction of image(s) in the highlighted post area',
		callback() { imageResize({ removeHeightRestriction: true }); },
	},
	imageMoveUp: {
		value: [38, false, true, false], // ctrl-up
		description: 'Move the image(s) in the highlighted post area up',
		callback() { imageMove(0, -50); },
	},
	imageMoveDown: {
		value: [40, false, true, false], // ctrl-down
		description: 'Move the image(s) in the highlighted post area down',
		callback() { imageMove(0, 50); },
	},
	imageMoveLeft: {
		value: [37, false, true, false], // ctrl-left
		description: 'Move the image(s) in the highlighted post area left',
		callback() { imageMove(-50, 0); },
	},
	imageMoveRight: {
		value: [39, false, true, false], // ctrl-right
		description: 'Move the image(s) in the highlighted post area right',
		callback() { imageMove(50, 0); },
	},
	previousGalleryImage: {
		value: [219, false, false, false], // [
		description: 'View the previous image of an inline gallery.',
	},
	nextGalleryImage: {
		value: [221, false, false, false], // ]
		description: 'View the next image of an inline gallery.',
	},
	toggleViewImages: {
		value: [88, false, false, true], // shift-x
		description: 'Toggle "view images" button',
		callback: ShowImages.toggleViewImages,
	},
	toggleChildren: {
		include: ['comments', 'inbox'/* mostly modmail */],
		value: [13, false, false, false], // enter
		description: 'Expand/collapse comments (comments pages only)',
	},
	followComments: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, false], // c
		description: 'View comments for link (shift opens them in a new tab)',
	},
	followCommentsNewTab: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, true], // shift-c
		description: 'View comments for link in a new tab',
		callback() { module.followComments(true); },
	},
	followLinkAndCommentsNewTab: {
		include: ['linklist', 'modqueue', 'profile'],
		value: [76, false, false, false], // l
		description: 'View link and comments in new tabs',
		callback() { followLinkAndComments(); },
	},
	followLinkAndCommentsNewTabBG: {
		include: ['linklist', 'modqueue', 'profile'],
		value: [76, false, false, true], // shift-l
		description: 'View link and comments in new background tabs',
		callback() { followLinkAndComments(true); },
	},
	upVote: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, false], // a
		description: 'Upvote selected link or comment (or remove the upvote)',
	},
	downVote: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, false], // z
		description: 'Downvote selected link or comment (or remove the downvote)',
	},
	upVoteWithoutToggling: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, true], // a
		description: 'Upvote selected link or comment (but don\'t remove the upvote)',
		callback() { module.upVote(true); },
	},
	downVoteWithoutToggling: {
		include: ['linklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, true], // z
		description: 'Downvote selected link or comment (but don\'t remove the downvote)',
		callback() { module.downVote(true); },
	},
	savePost: {
		include: ['linklist', 'modqueue', 'profile', 'comments'],
		value: [83, false, false, false], // s
		description: 'Save the current post to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.',
		callback() { module.saveLink(); },
	},
	saveComment: {
		include: ['comments'],
		value: [83, false, false, true], // shift-s
		description: 'Save the current comment to your reddit account. This is accessible from anywhere that you\'re logged in, but does not preserve the original text if it\'s edited or deleted.',
	},
	saveRES: {
		include: ['comments', 'profile'],
		value: [83, false, false, false], // s
		description: 'Save the current comment with RES. This does preserve the original text of the comment, but is only saved locally.',
		callback() { module.saveCommentRES(); },
	},
	reply: {
		include: ['comments', 'inbox'],
		value: [82, false, false, false], // r
		description: 'Reply to current comment (comment pages only)',
	},
	followPermalink: {
		include: ['comments', 'inbox'],
		value: [89, false, false, false], // y
		description: 'Open the current comment\'s permalink (comment pages only)',
	},
	followPermalinkNewTab: {
		include: ['comments', 'inbox'],
		value: [89, false, false, true], // shift-y
		description: 'Open the current comment\'s permalink in a new tab (comment pages only)',
		callback() { module.followPermalink(true); },
	},
	followSubreddit: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, false], // r
		description: 'Go to subreddit of selected link (link pages only)',
	},
	followSubredditNewTab: {
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, true], // shift-r
		description: 'Go to subreddit of selected link in a new tab (link pages only)',
		callback() { module.followSubreddit(true); },
	},
	goMode: {
		value: [71, false, false, false], // g
		description: 'Enter "go mode" (next keypress goes to a location, e.g. frontpage)',
	},
	inbox: {
		value: [73, false, false, false], // i
		description: 'When in goMode, go to inbox',
	},
	inboxNewTab: {
		value: [73, false, false, true], // shift+i
		description: 'When in goMode, go to inbox in a new tab',
		callback() { module.inbox(true); },
	},
	modmail: {
		value: [77, false, false, false], // m
		description: 'When in goMode, go to modmail',
	},
	modmailNewTab: {
		value: [77, false, false, true], // shift+m
		description: 'When in goMode, go to modmail in a new tab',
		callback() { module.modmail(true); },
	},
	profile: {
		value: [85, false, false, false], // u
		description: 'When in goMode, go to profile',
	},
	profileNewTab: {
		value: [85, false, false, true], // shift+u
		description: 'When in goMode, go to profile in a new tab',
		callback() { module.profile(true); },
	},
	frontPage: {
		value: [70, false, false, false], // f
		description: 'When in goMode, go to front page',
	},
	subredditFrontPage: {
		value: [70, false, false, true], // shift-f
		description: 'When in goMode, go to subreddit front page',
		callback() { module.frontPage(true); },
	},
	random: {
		value: [89, true, false, false], // alt-y   SO RANDOM
		description: 'When in goMode, go to a random subreddit',
	},
	nextPage: {
		include: ['linklist', 'modqueue', 'profile', 'inbox'],
		value: [78, false, false, false], // n
		description: 'When in goMode, go to next page (link list pages only)',
	},
	prevPage: {
		include: ['linklist', 'modqueue', 'profile', 'inbox'],
		value: [80, false, false, false], // p
		description: 'When in goMode, go to prev page (link list pages only)',
	},
	link1: {
		value: [49, false, false, false], // 1
		description: 'Open first link within comment.',
		noconfig: true,
		callback() { commentLink(0); },
	},
	link2: {
		value: [50, false, false, false], // 2
		description: 'Open link #2 within comment.',
		noconfig: true,
		callback() { commentLink(1); },
	},
	link3: {
		value: [51, false, false, false], // 3
		description: 'Open link #3 within comment.',
		noconfig: true,
		callback() { commentLink(2); },
	},
	link4: {
		value: [52, false, false, false], // 4
		description: 'Open link #4 within comment.',
		noconfig: true,
		callback() { commentLink(3); },
	},
	link5: {
		value: [53, false, false, false], // 5
		description: 'Open link #5 within comment.',
		noconfig: true,
		callback() { commentLink(4); },
	},
	link6: {
		value: [54, false, false, false], // 6
		description: 'Open link #6 within comment.',
		noconfig: true,
		callback() { commentLink(5); },
	},
	link7: {
		value: [55, false, false, false], // 7
		description: 'Open link #7 within comment.',
		noconfig: true,
		callback() { commentLink(6); },
	},
	link8: {
		value: [56, false, false, false], // 8
		description: 'Open link #8 within comment.',
		noconfig: true,
		callback() { commentLink(7); },
	},
	link9: {
		value: [57, false, false, false], // 9
		description: 'Open link #9 within comment.',
		noconfig: true,
		callback() { commentLink(8); },
	},
	link10: {
		value: [48, false, false, false], // 0
		description: 'Open link #10 within comment.',
		noconfig: true,
		callback() { commentLink(9); },
	},
	link1NumPad: {
		value: [97, false, false, false], // 1
		description: 'Open first link within comment.',
		noconfig: true,
		callback() { commentLink(0); },
	},
	link2NumPad: {
		value: [98, false, false, false], // 2
		description: 'Open link #2 within comment.',
		noconfig: true,
		callback() { commentLink(1); },
	},
	link3NumPad: {
		value: [99, false, false, false], // 3
		description: 'Open link #3 within comment.',
		noconfig: true,
		callback() { commentLink(2); },
	},
	link4NumPad: {
		value: [100, false, false, false], // 4
		description: 'Open link #4 within comment.',
		noconfig: true,
		callback() { commentLink(3); },
	},
	link5NumPad: {
		value: [101, false, false, false], // 5
		description: 'Open link #5 within comment.',
		noconfig: true,
		callback() { commentLink(4); },
	},
	link6NumPad: {
		value: [102, false, false, false], // 6
		description: 'Open link #6 within comment.',
		noconfig: true,
		callback() { commentLink(5); },
	},
	link7NumPad: {
		value: [103, false, false, false], // 7
		description: 'Open link #7 within comment.',
		noconfig: true,
		callback() { commentLink(6); },
	},
	link8NumPad: {
		value: [104, false, false, false], // 8
		description: 'Open link #8 within comment.',
		noconfig: true,
		callback() { commentLink(7); },
	},
	link9NumPad: {
		value: [105, false, false, false], // 9
		description: 'Open link #9 within comment.',
		noconfig: true,
		callback() { commentLink(8); },
	},
	link10NumPad: {
		value: [96, false, false, false], // 0
		description: 'Open link #10 within comment.',
		noconfig: true,
		callback() { commentLink(9); },
	},
	toggleCommentNavigator: {
		include: 'comments',
		value: [78, false, false, false], // N
		description: 'Open Comment Navigator',
		callback() {
			if (Modules.isRunning(CommentNavigator)) {
				CommentNavigator.toggleNavigator();
			}
		},
	},
	commentNavigatorMoveUp: {
		include: 'comments',
		value: [38, false, false, true], // shift+up arrow
		description: 'Move up using Comment Navigator',
		callback() { CommentNavigator.moveUp(); },
	},
	commentNavigatorMoveDown: {
		include: 'comments',
		value: [40, false, false, true], // shift+down arrow
		description: 'Move down using Comment Navigator',
		callback() { CommentNavigator.moveDown(); },
	},
};

module.loadDynamicOptions = function() {
	_.forEach(commands, registerCommand);
};

module.beforeLoad = function() {
	registerCommandLine();
	registerSelectedThingWatcher();
};

module.go = function() {
	window.addEventListener('keydown', e => {
		if (handleKeyPress(e)) {
			e.preventDefault();
		}
	}, true);
};

function registerCommandLine() {
	CommandLine.registerCommand(/\d+/, '[number] - navigates to the link with that number (comments pages) or rank (link pages)',
		() => {},
		command => {
			if (isPageType('comments')) {
				// comment link number? (integer)
				commentLink(parseInt(command, 10) - 1);
			} else if (isPageType('linklist')) {
				const targetRank = parseInt(command, 10);
				followLinkByRank(targetRank);
			}
		}
	);
}

function registerSelectedThingWatcher() {
	SelectedEntry.addListener(updateAnnotations);
}

function registerCommand(spec, commandName) {
	if (!spec.callback) {
		if (module[commandName]) {
			spec.callback = ::module[commandName];
		} else {
			console.error('No callback for keyboardNav command', commandName);
			spec.callback = function() {
				console.warn('No callback for keyboardNav command', commandName);
			};
		}
	}

	module.options[commandName] = $.extend(true,
		{ type: 'keycode' },
		module.options[commandName],
		spec
	);
}

function promptLogin() {
	if (!loggedInUser()) {
		const loginButton = document.querySelector('#header .login-required');
		if (loginButton) {
			click(loginButton);
		}

		return true;
	}
}

function updateAnnotations(selected, last) {
	if (selected && isPageType('comments') && module.options.commentsLinkNumbers.value) {
		const links = getCommentLinks(selected.entry);
		let annotationCount = 0;
		for (const link of links) {
			const annotation = document.createElement('span');
			annotationCount++;
			annotation.classList.add('noCtrlF');
			annotation.setAttribute('data-text', `[${annotationCount}] `);
			if (annotationCount <= 9) {
				annotation.title = `press ${annotationCount} to open link`;
			} else if (annotationCount === 10) {
				annotation.title = 'press 0 to open link';
			} else {
				annotation.title = `press ${getNiceKeyCode('toggleCmdLine')} then ${annotationCount} and Enter to open link`;
			}
			annotation.classList.add('keyNavAnnotation');
			if (module.options.commentsLinkNumberPosition.value === 'right') {
				$(link).after(annotation);
			} else {
				link.parentNode.insertBefore(annotation, link);
			}
		}
	}

	if (last && isPageType('comments')) {
		const annotations = last.entry.querySelectorAll('div.md .keyNavAnnotation');
		$(annotations).remove();
	}
}

function handleKeyLink(link) {
	if (link.classList.contains('toggleImage')) {
		click(link);
		return false;
	}

	const url = link.getAttribute('href');

	if (module.options.commentsLinkNewTab.value) {
		openNewTab(url, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = url;
	}
}

let keyHelp;

const drawHelp = _.once(() => {
	keyHelp = $('<div>', { class: 'keyHelp' }).get(0);
	const helpTable = document.createElement('table');
	keyHelp.appendChild(helpTable);
	const helpTableHeader = document.createElement('thead');
	const helpTableHeaderRow = document.createElement('tr');
	const helpTableHeaderKey = document.createElement('th');
	$(helpTableHeaderKey).text('Key');
	helpTableHeaderRow.appendChild(helpTableHeaderKey);
	const helpTableHeaderFunction = document.createElement('th');
	$(helpTableHeaderFunction).text('Function');
	helpTableHeaderRow.appendChild(helpTableHeaderFunction);
	helpTableHeader.appendChild(helpTableHeaderRow);
	helpTable.appendChild(helpTableHeader);
	const helpTableBody = document.createElement('tbody');
	const isLink = /^link[\d]+$/i;
	for (const i in module.options) {
		if ((module.options[i].type === 'keycode') && (!isLink.test(i))) {
			const thisRow = document.createElement('tr');
			const thisRowKey = document.createElement('td');
			let thisKeyCode = getNiceKeyCode(i);
			if (module.options[i].dependsOn && module.options[module.options[i].dependsOn].type === 'keycode') {
				thisKeyCode = [getNiceKeyCode(module.options[i].dependsOn), thisKeyCode].join(', ');
			}
			$(thisRowKey).text(thisKeyCode);
			thisRow.appendChild(thisRowKey);
			const thisRowDesc = document.createElement('td');
			$(thisRowDesc).text(module.options[i].description);
			thisRow.appendChild(thisRowDesc);
			helpTableBody.appendChild(thisRow);
		}
	}
	helpTable.appendChild(helpTableBody);
	document.body.appendChild(keyHelp);
});

export function getNiceKeyCode(optionKey) {
	let keyCodeArray = module.options[optionKey].value;
	if (!keyCodeArray) {
		return '';
	}

	if (typeof keyCodeArray === 'string') {
		keyCodeArray = parseInt(keyCodeArray, 10);
	}
	if (typeof keyCodeArray === 'number') {
		keyCodeArray = [keyCodeArray, false, false, false, false];
	}
	return niceKeyCode(keyCodeArray);
}

const _commandLookup = _.once(() => {
	const lookup = {};
	for (const option of Object.values(module.options)) {
		if (option.type !== 'keycode') continue;
		if (!option.callback) continue;
		if (!matchesPageLocation(option.include, option.exclude)) continue;

		const hash = hashKeyArray(option.value);
		if (!lookup[hash]) {
			lookup[hash] = $.Callbacks();
		}
		lookup[hash].add(option.callback);
	}
	return lookup;
});

function getCommandsForKeyEvent(keyEvent) {
	const hash = hashKeyEvent(keyEvent);
	return _commandLookup()[hash];
}

function handleKeyPress(e) {
	const konamitest = !EasterEgg.konamiActive();
	let callbacks;

	// Allow navigation on other elements when input has no (apparent) default behavior
	if (['A', 'BUTTON'].includes(document.activeElement.tagName)) {
		const hasDefaultBehavior = [/* tab */9, /* enter */13, /* space */32].includes(e.which);
		callbacks = getCommandsForKeyEvent(e);

		if (!hasDefaultBehavior && callbacks) {
			document.activeElement.blur();
		}
	}

	if ((document.activeElement.tagName === 'BODY') && (konamitest)) {
		callbacks = callbacks || getCommandsForKeyEvent(e);
		if (callbacks) {
			callbacks.fire(e);
			return true;
		}
	}
}

module.toggleHelp = function() {
	if (keyHelp && keyHelp.style.display === 'block') {
		hideHelp();
	} else {
		showHelp();
	}
};

function showHelp() {
	// show help!
	drawHelp();
	fadeElementIn(keyHelp, 0.3);
}

function hideHelp() {
	// hide help!
	fadeElementOut(keyHelp, 0.3);
}

module.hide = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	// find the hide link and click it...
	const hideLink = selected.entry.querySelector('form.hide-button > span > a');
	click(hideLink);

	if (module.options.onHideMoveDown.value) {
		module.moveDown();
	}
};

module.followSubreddit = function(newWindow) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

	// find the subreddit link and click it...
	const srLink = selected.getSubredditLink();
	if (srLink) {
		const url = srLink.getAttribute('href');
		if (newWindow) {
			openNewTab(url, module.options.followLinkNewTabFocus.value);
		} else {
			location.href = url;
		}
	}
};

export let recentKeyMove = false;
const refreshKeyMoveTimer = _.debounce(() => { recentKeyMove = false; }, 1000);

function move(target, { scrollStyle = 'legacy', tryMediaBrowse = false } = {}) {
	const selected = SelectedEntry.selectedThing();

	if (typeof target === 'function') {
		target = selected ? target(selected) : null;
	}

	if (target instanceof Element) {
		target = new Thing(target);
	}

	if (!target) return null;

	if (module.options.mediaBrowseMode.value && tryMediaBrowse && selected) {
		const didExpand = ShowImages.mediaBrowseMode(selected, target);
		if (didExpand && module.options.scrollOnExpando.value) scrollStyle = 'top';
	}

	SelectedEntry.select(target, { scrollStyle });

	recentKeyMove = true;
	refreshKeyMoveTimer();

	return target;
}

module.moveDown = function() {
	const target = move(
		thing => thing.getNext({ direction: 'down' }),
		{ scrollStyle: module.options.linearScrollStyle.value, tryMediaBrowse: true }
	);

	if (
		target &&
		!isCurrentSubreddit('dashboard') &&
		isPageType('linklist', 'modqueue') &&
		Modules.isRunning(NeverEndingReddit) &&
		NeverEndingReddit.module.options.autoLoad.value
	) {
		const things = Thing.visibleThingElements();
		if (things.indexOf(target.element) + 2 > things.length) {
			// nearing the bottom of the list, so initiate load of next page
			module.nextPage(true);
		}
	}
};

module.showParents = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const button = selected.entry.querySelector('.buttons .bylink[href^="#"]');
	if (button) {
		Hover.infocard('showParent')
			.target(button)
			.populateWith(ShowParent.showCommentHover)
			.begin();
	}
};

module.toggleChildren = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	if (selected.thing.classList.contains('link')) return;

	// find out if this is a collapsed or uncollapsed view...
	let thisToggle = selected.entry.querySelector('a.expand');

	// check if this is a "show more comments" box, or just contracted content...
	const moreComments = selected.entry.querySelector('span.morecomments > a');
	if (moreComments) {
		thisToggle = moreComments;
	}

	// 'continue this thread' links
	const contThread = selected.entry.querySelector('span.deepthread > a');
	if (contThread) {
		thisToggle = contThread;
	}

	click(thisToggle);
};

function imageResize({ factor = 1, removeHeightRestriction }) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	for (const image of selected.entry.querySelectorAll('.res-media-zoomable')) {
		if (removeHeightRestriction) image.style.maxHeight = '';
		ShowImages.resizeMedia(image, image.clientWidth * factor);
	}
}

function imageMove(deltaX, deltaY) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const images = selected.entry.querySelectorAll('.res-media-movable');
	const mostVisible = _.maxBy(images, media => getPercentageVisibleYAxis(media));
	if (mostVisible) ShowImages.moveMedia(mostVisible, deltaX, deltaY);
}

module.previousGalleryImage = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const previousButton = selected.entry.querySelector('.res-gallery-previous');
	if (previousButton) {
		click(previousButton);
	}
};

module.nextGalleryImage = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const nextButton = selected.entry.querySelector('.res-gallery-next');
	if (nextButton) {
		click(nextButton);
	}
};

module.followLink = function(newWindow) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	if (isPageType('comments') && !selected.thing.classList.contains('link')) return;

	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

	const thisHREF = selected.getPostLink().href;
	if (newWindow) {
		openNewTab(thisHREF, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = thisHREF;
	}
};

function followLinkByRank(num) {
	const target = Thing.visibleThings().find(v => v.getRank() === num);
	SelectedEntry.select(target);
	module.followLink();
}

module.followPermalink = function(newWindow) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;
	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;

	const thisA = selected.entry.querySelector('a.bylink');
	if (!thisA) return;
	const url = thisA.getAttribute('href');
	if (newWindow) {
		openNewTab(url, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = url;
	}
};

module.followComments = function(newWindow) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
	const url = selected.getCommentsLink().getAttribute('href');
	if (newWindow) {
		openNewTab(url, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = url;
	}
};

function followLinkAndComments(background) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;
	background = typeof background === 'boolean' ? background : undefined;

	// find the [l+c] link and click it...
	const lcLink = selected.entry.querySelector('.redditSingleClick');
	mousedown(lcLink, background ? 1 : 0);
}

module.upVote = function(preventToggle) {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;
	preventToggle = typeof preventToggle === 'boolean' ? preventToggle : undefined;

	const upVoteButton = selected.getUpvoteButton();

	if (!upVoteButton) {
		return;
	}

	if (NoParticipation.isVotingBlocked()) {
		NoParticipation.notifyNoVote();
	} else if (!preventToggle || !upVoteButton.classList.contains('upmod')) {
		click(upVoteButton);
	}

	const link = isPageType('linklist', 'modqueue', 'profile');
	if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
		module.moveDown();
	}
};

module.downVote = function(preventToggle) {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;
	preventToggle = typeof preventToggle === 'boolean' ? preventToggle : undefined;

	const downVoteButton = selected.getDownvoteButton();

	if (!downVoteButton) {
		return;
	}

	if (NoParticipation.isVotingBlocked()) {
		NoParticipation.notifyNoVote();
	} else if (!preventToggle || !downVoteButton.classList.contains('downmod')) {
		click(downVoteButton);
	}

	const link = isPageType('linklist', 'modqueue', 'profile');
	if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
		module.moveDown();
	}
};

module.saveLink = function() {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const saveLink = selected.entry.querySelector('.link-save-button a') || selected.entry.querySelector('.link-unsave-button a');
	if (saveLink) {
		click(saveLink);
	}
};

module.saveComment = function() {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const saveComment = selected.entry.querySelector('.comment-save-button > a');
	if (saveComment) {
		click(saveComment);
	}
};

module.saveCommentRES = function() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const saveComment = selected.entry.querySelector('.saveComments, .unsaveComments');
	if (saveComment) {
		click(saveComment);
		SaveComments.showEducationalNotification();
	}
};

module.reply = function() {
	if (promptLogin()) return;

	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	if (selected.thing.classList.contains('link') && isPageType('comments')) {
		// Reply to OP, but only if a reply form is available
		const $target = $('.usertext-edit textarea[name=text]:first');
		if ($target.filter(':visible').length) {
			$target.focus();
			return;
		}
	}

	// User can reply directly here, so open/focus the reply form
	const replyButton = selected.entry.querySelector('.buttons a[onclick*=reply]');
	if (replyButton) {
		click(replyButton);
		return;
	}

	// User cannot reply directly from this page, so go to where they can reply
	const replyAt = selected.entry.querySelector('.buttons a.comments, .buttons a.bylink');
	if (replyAt) {
		click(replyAt);
	}
};

function navigateTo(newWindow, thisHREF) {
	if (newWindow) {
		openNewTab(thisHREF);
	} else {
		location.href = thisHREF;
	}
}

const goModePanel = _.once(() => {
	const $panel = $('<div id="goModePanel" class="RESDialogSmall">')
		.append('<h3>Press a key to go:</h3><div id="goModeCloseButton" class="RESCloseButton">&times;</div>');

	// add the keyboard shortcuts...
	const $contents = $('<div class="RESDialogContents"></div>');
	const $shortCutList = $('<table>');
	for (const key in module.options) {
		if (module.options[key].dependsOn === 'goMode') {
			const niceKeyCode = getNiceKeyCode(key);
			$shortCutList.append(`<tr><td>${niceKeyCode}</td><td class="arrow">&rarr;</td><td>${key}</td></tr>`);
		}
	}
	$contents.append($shortCutList);
	$panel.append($contents);
	$panel.on('click', '.RESCloseButton', module.goMode);
	return $panel;
});

let goModeActive;

module.goMode = function() {
	if (!module.options.useGoMode.value) {
		return;
	}
	goModeActive = !goModeActive;
	if (goModeActive) {
		$('body').on('keyup', handleGoModeEscapeKey);
		$(document.body).append(goModePanel().fadeIn());
	} else {
		hideGoModePanel();
	}
};

function hideGoModePanel() {
	goModeActive = false;
	goModePanel().fadeOut();
	$('body').off('keyup', handleGoModeEscapeKey);
}

function handleGoModeEscapeKey(event) {
	if (event.which === 27) {
		hideGoModePanel();
	}
}

module.inbox = function(newWindow) {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return;
	}
	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
	hideGoModePanel();
	navigateTo(newWindow, '/message/inbox/');
};

module.modmail = function(newWindow) {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return;
	}
	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
	hideGoModePanel();
	navigateTo(newWindow, '/message/moderator/');
};

module.profile = function(newWindow) {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return;
	}
	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
	hideGoModePanel();
	navigateTo(newWindow, `/user/${loggedInUser()}`);
};

module.frontPage = function(subreddit) {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return;
	}
	subreddit = typeof subreddit === 'boolean' ? subreddit : undefined;
	hideGoModePanel();

	if (subreddit && !currentSubreddit()) {
		return;
	}

	let url = '/';
	if (subreddit) {
		url += `r/${currentSubreddit()}`;
	}
	location.href = url;
};

module.nextPage = function(override) {
	override = typeof override === 'boolean' ? override : undefined;
	if (override !== true && module.options.useGoMode.value && !goModeActive) {
		return;
	}
	hideGoModePanel();
	// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
	if (Modules.isRunning(NeverEndingReddit) && NeverEndingReddit.progressIndicator) {
		click(NeverEndingReddit.progressIndicator);
		move(Thing.visibleThingElements().slice(-1)[0]);
	} else {
		// get the first link to the next page of reddit...
		const nextPrevLinks = NeverEndingReddit.getNextPrevLinks();
		const link = nextPrevLinks.next;
		if (link) {
			location.href = link.getAttribute('href');
		}
	}
};

module.prevPage = function() {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return false;
	}
	hideGoModePanel();
	// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
	if (Modules.isRunning(NeverEndingReddit)) {
		return false;
	} else {
		const nextPrevLinks = NeverEndingReddit.getNextPrevLinks();
		const link = nextPrevLinks.prev;
		if (link) {
			location.href = link.getAttribute('href');
		}
	}
};

function getCommentLinks(entry) {
	if (!entry) {
		const selected = SelectedEntry.selectedThing();
		if (!selected) return [];

		entry = selected && selected.entry;
	}

	return Array.from(entry.querySelectorAll('div.md a:not(.expando-button):not(.res-expando-box):not(.noKeyNav):not([href^="javascript:"]):not([href="#"])'))
		.filter(link => !isCommentCode(link) && !isEmptyLink(link));
}

function commentLink(num) {
	if (module.options.commentsLinkNumbers.value) {
		const links = getCommentLinks();
		if (typeof links[num] !== 'undefined') {
			let thisLink = links[num];
			if ((thisLink.nextSibling) && (typeof thisLink.nextSibling.tagName !== 'undefined') && (thisLink.nextSibling.classList.contains('expando-button'))) {
				thisLink = thisLink.nextSibling;
			}
			handleKeyLink(thisLink);
		}
	}
}

module.random = function() {
	if ((module.options.useGoMode.value) && (!goModeActive)) {
		return;
	}
	hideGoModePanel();

	location.href = '/r/random';
};
