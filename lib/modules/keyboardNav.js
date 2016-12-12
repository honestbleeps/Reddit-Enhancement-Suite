/* @flow */

import _ from 'lodash';
import goModePanelTemplate from '../templates/goModePanel.mustache';
import linkAnnotationTemplate from '../templates/linkAnnotation.mustache';
import keyHelpTemplate from '../templates/keyHelp.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
import type { ModuleOption } from '../core/module';
import * as Modules from '../core/modules';
import {
	Thing,
	click,
	currentSubreddit,
	filterMap,
	getPercentageVisibleYAxis,
	hashKeyArray,
	hashKeyEvent,
	isCommentCode,
	isEmptyLink,
	isPageType,
	loggedInUser,
	matchesPageLocation,
	niceKeyCode,
} from '../utils';
import { openNewTab } from '../environment';
import * as CommandLine from './commandLine';
import * as CommentNavigator from './commentNavigator';
import * as EasterEgg from './easterEgg';
import * as FilteReddit from './filteReddit';
import * as Hover from './hover';
import * as NeverEndingReddit from './neverEndingReddit';
import * as NoParticipation from './noParticipation';
import * as SaveComments from './saveComments';
import * as SelectedEntry from './selectedEntry';
import * as ShowImages from './showImages';
import * as ShowParent from './showParent';
import * as SingleClick from './singleClick';

export const module: Module<*> = new Module('keyboardNav');

module.moduleName = 'keyboardNavName';
module.category = 'browsingCategory';
module.description = 'keyboardNavDesc';
module.options = {
	mediaBrowseMode: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavMediaBrowseModeDesc',
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
			name: 'in middle',
			value: 'middle',
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
			<br>In middle: Scroll just enough to bring the selected element to the middle of the viewport.
			<br>Legacy: If the element is offscreen, lock to top.
		`,
		advanced: true,
	},
	nonLinearScrollStyle: {
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
			name: 'in middle',
			value: 'middle',
		}, {
			name: 'legacy',
			value: 'legacy',
		}],
		value: 'legacy',
		description: 'keyboardNavNonLinearScrollStyleDesc',
		advanced: true,
	},
	commentsLinkNumbers: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkNumbersDesc',
	},
	commentsLinkNumberPosition: {
		dependsOn: 'commentsLinkNumbers',
		type: 'enum',
		values: [{
			name: 'Place on right',
			value: 'right',
		}, {
			name: 'Place on left',
			value: 'left',
		}],
		value: 'right',
		description: 'keyboardNavCommentsLinkNumberPositionDesc',
		advanced: true,
	},
	commentsLinkToggleExpando: {
		dependsOn: 'commentsLinkNumbers',
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkToggleExpandoDesc',
	},
	commentsLinkNewTab: {
		dependsOn: 'commentsLinkNumbers',
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkNewTabDesc',
		advanced: true,
	},
	onHideMoveDown: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavOnHideMoveDownDesc',
		advanced: true,
	},
	onVoteMoveDown: {
		type: 'boolean',
		value: false,
		description: 'keyboardNavOnVoteMoveDownDesc',
		advanced: true,
	},
	onVoteCommentMoveDown: {
		type: 'boolean',
		value: false,
		description: 'keyboardNavOnVoteCommentMoveDownDesc',
		advanced: true,
	},
	useGoMode: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavUseGoModeDesc',
	},
	followLinkNewTabFocus: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavFollowLinkNewTabFocusDesc',
		advanced: true,
	},
	toggleHelp: {
		type: 'keycode',
		value: [191, false, false, true, false], // ? (note the true in the shift slot)
		description: 'keyboardNavToggleHelpDesc',
		callback() { drawHelp().toggle(300); },
	},
	toggleCmdLine: {
		type: 'keycode',
		value: [190, false, false, false, false], // .
		description: 'keyboardNavToggleCmdLineDesc',
		callback() { CommandLine.toggleCmdLine(); },
	},
	enterFilterCommandLine: {
		type: 'keycode',
		requiresModule: FilteReddit,
		value: [70, false, false, false, false], // f
		description: 'keyboardNavEnterFilterCommandLineDesc',
		callback() { CommandLine.toggleCmdLine(true, 'fl '); },
	},
	hide: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile'],
		value: [72, false, false, false, false], // h
		description: 'keyboardNavHideDesc',
		callback: hideLink,
	},
	moveUp: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'search'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpDesc',
		callback() {
			move(thing => thing.getNext({ direction: 'up' }), getLinearListMoveOptions());
		},
	},
	moveDown: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'search'],
		value: [74, false, false, false, false], // j
		description: 'keyboardNavMoveDownDesc',
		callback() {
			move(thing => thing.getNext({ direction: 'down' }), getLinearListMoveOptions());
		},
	},
	moveUpComment: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpCommentDesc',
		callback() {
			move(
				thing => thing.getNext({ direction: 'up' }),
				{ scrollStyle: module.options.linearScrollStyle.value }
			);
		},
	},
	moveDownComment: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [74, false, false, false, false], // j
		description: 'keyboardNavMoveDownCommentDesc',
		callback() {
			move(
				thing => thing.getNext({ direction: 'down' }),
				{ scrollStyle: module.options.linearScrollStyle.value }
			);
		},
	},
	moveTop: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [75, false, false, true, false], // shift-k
		description: 'keyboardNavMoveTopDesc',
		callback() { move(Thing.visibleThingElements()[0], { scrollStyle: 'top' }); },
	},
	moveBottom: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [74, false, false, true, false], // shift-j
		description: 'keyboardNavMoveBottomDesc',
		callback() { move(Thing.visibleThingElements().slice(-1)[0], { scrollStyle: 'top' }); },
	},
	moveUpSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [75, false, false, true, false], // shift-k
		description: 'keyboardNavMoveUpSiblingDesc',
		callback() {
			move(
				thing => thing.getNextSibling({ direction: 'up' }) || thing.getParent(),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveDownSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [74, false, false, true, false], // shift-j
		description: 'keyboardNavMoveDownSiblingDesc',
		callback() {
			move(
				thing => thing.getClosest(thing.getNextSibling, { direction: 'down' }),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveDownParentSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [74, true, false, false, false], // alt-j
		description: 'keyboardNavMoveDownParentSiblingDesc',
		callback() {
			move(
				thing => (thing.getParent() || thing).getClosest(thing.getNextSibling, { direction: 'down' }),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveUpThread: {
		type: 'keycode',
		include: ['comments'],
		value: [75, true, false, true, false], // shift-alt-k
		description: 'keyboardNavMoveUpThreadDesc',
		callback() {
			move(
				thing => thing.getThreadTop().getNextSibling({ direction: 'up' }) || thing.getThreadTop(),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveDownThread: {
		type: 'keycode',
		include: ['comments'],
		value: [74, true, false, true, false], // shift-alt-j
		description: 'keyboardNavMoveDownThreadDesc',
		callback() {
			move(
				thing => thing.getThreadTop().getNextSibling({ direction: 'down' }),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveToTopComment: {
		type: 'keycode',
		include: ['comments'],
		value: [84, false, false, false, false], // t
		description: 'keyboardNavMoveToTopCommentDesc',
		callback() {
			move(
				thing => thing.getThreadTop(),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	moveToParent: {
		type: 'keycode',
		include: ['comments'],
		value: [80, false, false, false, false], // p
		description: 'keyboardNavMoveToParentDesc',
		callback() {
			move(
				thing => thing.getParent(),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	showParents: {
		type: 'keycode',
		include: ['comments'],
		value: [80, false, false, true, false], // p
		description: 'keyboardNavShowParentsDesc',
		callback: showParents,
	},
	followLink: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, false, false], // enter
		description: 'keyboardNavFollowLinkDesc',
		callback() { followLink(); },
	},
	followLinkNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, true, false], // shift-enter
		description: 'keyboardNavFollowLinkNewTabDesc',
		callback() { followLink(true); },
	},
	toggleExpando: {
		type: 'keycode',
		value: [88, false, false, false, false], // x
		description: 'keyboardNavToggleExpandoDesc',
		callback() {
			const thing = SelectedEntry.selectedThing();
			if (thing) ShowImages.toggleThingExpandos(thing, module.options.scrollOnExpando.value);
		},
	},
	imageSizeUp: {
		type: 'keycode',
		value: [187, false, false, false, false], // = -- 61 in firefox
		description: 'keyboardNavImageSizeUpDesc',
		callback() { imageResize({ factor: 1.3 }); },
	},
	imageSizeDown: {
		type: 'keycode',
		value: [189, false, false, false, false], // - -- 173 in firefox
		description: 'keyboardNavImageSizeDownDesc',
		callback() { imageResize({ factor: 1 / 1.3 }); },
	},
	imageSizeUpFine: {
		type: 'keycode',
		value: [187, false, false, true, false], // shift-=
		description: 'keyboardNavImageSizeUpFineDesc',
		callback() { imageResize({ factor: 1.1 }); },
	},
	imageSizeDownFine: {
		type: 'keycode',
		value: [189, false, false, true, false], // shift--
		description: 'keyboardNavImageSizeDownFineDesc',
		callback() { imageResize({ factor: 1 / 1.1 }); },
	},
	imageSizeAnyHeight: {
		type: 'keycode',
		value: [39, false, false, true, false], // shift-right
		description: 'keyboardNavImageSizeAnyHeightDesc',
		callback() { imageResize({ removeHeightRestriction: true }); },
	},
	imageMoveUp: {
		type: 'keycode',
		value: [38, false, true, false, false], // ctrl-up
		description: 'keyboardNavImageMoveUpDesc',
		callback() { imageMove(0, -50); },
	},
	imageMoveDown: {
		type: 'keycode',
		value: [40, false, true, false, false], // ctrl-down
		description: 'keyboardNavImageMoveDownDesc',
		callback() { imageMove(0, 50); },
	},
	imageMoveLeft: {
		type: 'keycode',
		value: [37, false, true, false, false], // ctrl-left
		description: 'keyboardNavImageMoveLeftDesc',
		callback() { imageMove(-50, 0); },
	},
	imageMoveRight: {
		type: 'keycode',
		value: [39, false, true, false, false], // ctrl-right
		description: 'keyboardNavImageMoveRightDesc',
		callback() { imageMove(50, 0); },
	},
	previousGalleryImage: {
		type: 'keycode',
		value: [219, false, false, false, false], // [
		description: 'keyboardNavPreviousGalleryImageDesc',
		callback: previousGalleryImage,
	},
	nextGalleryImage: {
		type: 'keycode',
		value: [221, false, false, false, false], // ]
		description: 'keyboardNavNextGalleryImageDesc',
		callback: nextGalleryImage,
	},
	toggleViewImages: {
		type: 'keycode',
		value: [88, false, false, true, false], // shift-x
		description: 'Toggle "show images" button',
		callback: ShowImages.toggleViewImages,
	},
	toggleChildren: {
		type: 'keycode',
		include: ['comments', 'inbox'/* mostly modmail */],
		value: [13, false, false, false, false], // enter
		description: 'keyboardNavToggleChildrenDesc',
		callback: toggleChildren,
	},
	followComments: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, false, false], // c
		description: 'keyboardNavFollowCommentsDesc',
		callback() { followComments(); },
	},
	followCommentsNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, true, false], // shift-c
		description: 'keyboardNavFollowCommentsNewTabDesc',
		callback() { followComments(true); },
	},
	followLinkAndCommentsNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile'],
		value: [76, false, false, false, false], // l
		description: 'keyboardNavFollowLinkAndCommentsNewTabDesc',
		callback() { followLinkAndComments(); },
	},
	followLinkAndCommentsNewTabBG: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile'],
		value: [76, false, false, true, false], // shift-l
		description: 'keyboardNavFollowLinkAndCommentsNewTabBGDesc',
		callback() { followLinkAndComments(true); },
	},
	upVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, false, false], // a
		description: 'keyboardNavUpVoteDesc',
		callback() { upVote(); },
	},
	downVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, false, false], // z
		description: 'keyboardNavDownVoteDesc',
		callback() { downVote(); },
	},
	upVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, true, false], // a
		description: 'keyboardNavUpVoteWithoutTogglingDesc',
		callback() { upVote(true); },
	},
	downVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, true, false], // z
		description: 'keyboardNavDownVoteWithoutTogglingDesc',
		callback() { downVote(true); },
	},
	savePost: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments'],
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSavePostDesc',
		callback() { saveLink(); },
	},
	saveComment: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist'],
		value: [83, false, false, true, false], // shift-s
		description: 'keyboardNavSaveCommentDesc',
		callback: saveComment,
	},
	saveRES: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'profile'],
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSaveRESDesc',
		callback: saveCommentRES,
	},
	reply: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [82, false, false, false, false], // r
		description: 'keyboardNavReplyDesc',
		callback: reply,
	},
	followPermalink: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [89, false, false, false, false], // y
		description: 'keyboardNavFollowPermalinkDesc',
		callback() { followPermalink(); },
	},
	followPermalinkNewTab: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [89, false, false, true, false], // shift-y
		description: 'keyboardNavFollowPermalinkNewTabDesc',
		callback() { followPermalink(true); },
	},
	followSubreddit: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, false, false], // r
		description: 'keyboardNavFollowSubredditDesc',
		callback() { followSubreddit(); },
	},
	followSubredditNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, true, false], // shift-r
		description: 'keyboardNavFollowSubredditNewTabDesc',
		callback() { followSubreddit(true); },
	},
	goMode: {
		type: 'keycode',
		value: [71, false, false, false, false], // g
		description: 'keyboardNavGoModeDesc',
		dependsOn: 'useGoMode',
		callback() { if (module.options.useGoMode.value) toggleGoMode(); },
	},
	inbox: {
		type: 'keycode',
		value: [73, false, false, false, false], // i
		description: 'keyboardNavInboxDesc',
		callback() { navigateTo(false, '/message/inbox/'); },
		goMode: true,
	},
	inboxNewTab: {
		type: 'keycode',
		value: [73, false, false, true, false], // shift+i
		description: 'keyboardNavInboxNewTabDesc',
		callback() { navigateTo(true, '/message/inbox/'); },
		goMode: true,
	},
	modmail: {
		type: 'keycode',
		value: [77, false, false, false, false], // m
		description: 'keyboardNavModmailDesc',
		callback() { navigateTo(false, '/message/moderator/'); },
		goMode: true,
	},
	modmailNewTab: {
		type: 'keycode',
		value: [77, false, false, true, false], // shift+m
		description: 'keyboardNavModmailNewTabDesc',
		callback() { navigateTo(true, '/message/moderator/'); },
		goMode: true,
	},
	profile: {
		type: 'keycode',
		value: [85, false, false, false, false], // u
		description: 'keyboardNavProfileDesc',
		callback() {
			const user = loggedInUser();
			if (user) navigateTo(false, `/user/${user}`);
		},
		goMode: true,
	},
	profileNewTab: {
		type: 'keycode',
		value: [85, false, false, true, false], // shift+u
		description: 'keyboardNavProfileNewTabDesc',
		callback() {
			const user = loggedInUser();
			if (user) navigateTo(true, `/user/${user}`);
		},
		goMode: true,
	},
	frontPage: {
		type: 'keycode',
		value: [70, false, false, false, false], // f
		description: 'keyboardNavFrontPageDesc',
		callback() { navigateTo(false, '/'); },
		goMode: true,
	},
	subredditFrontPage: {
		type: 'keycode',
		value: [70, false, false, true, false], // shift-f
		description: 'keyboardNavsSubredditFrontPageDesc',
		callback() {
			const sub = currentSubreddit();
			if (sub) navigateTo(false, `/r/${sub}`);
		},
		goMode: true,
	},
	random: {
		type: 'keycode',
		value: [89, true, false, false, false], // alt-y   SO RANDOM
		description: 'keyboardNavRandomDesc',
		callback() { navigateTo(false, '/r/random'); },
		goMode: true,
	},
	nextPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [78, false, false, false, false], // n
		description: 'keyboardNavNextPageDesc',
		callback: nextPage,
		goMode: true,
	},
	prevPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [80, false, false, false, false], // p
		description: 'keyboardNavPrevPageDesc',
		callback: prevPage,
		goMode: true,
	},
	toggleCommentNavigator: {
		type: 'keycode',
		include: ['comments'],
		value: [78, false, false, false, false], // N
		description: 'keyboardNavToggleCommentNavigatorDesc',
		callback() {
			if (Modules.isRunning(CommentNavigator)) {
				CommentNavigator.toggleNavigator();
			}
		},
	},
	commentNavigatorMoveUp: {
		type: 'keycode',
		include: ['comments'],
		value: [38, false, false, true, false], // shift+up arrow
		description: 'keyboardNavCommentNavigatorMoveUpDesc',
		callback() { CommentNavigator.moveUp(); },
	},
	commentNavigatorMoveDown: {
		type: 'keycode',
		include: ['comments'],
		value: [40, false, false, true, false], // shift+down arrow
		description: 'keyboardNavCommentNavigatorMoveDownDesc',
		callback() { CommentNavigator.moveDown(); },
	},
	// numbers and numpad numbers are used by commentsLink (see getCommentsLinkKeys)
};

module.beforeLoad = () => {
	registerCommandLine();

	if (module.options.commentsLinkNumbers.value && isPageType('comments', 'commentsLinklist')) {
		SelectedEntry.addListener(updateCommentLinkAnnotations);
	}
};

module.go = () => {
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
			if (isPageType('comments', 'commentsLinklist')) {
				// comment link number? (integer)
				commentLink(parseInt(command, 10) - 1);
			} else if (isPageType('linklist')) {
				const targetRank = parseInt(command, 10);
				followLinkByRank(targetRank);
			}
		}
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

let linkAnnotations = [];

function updateCommentLinkAnnotations(selected) {
	for (const { annotation } of linkAnnotations) annotation.remove();

	linkAnnotations = ((Array.from((selected && selected.entry.querySelectorAll('div.md a:not(.noKeyNav)')) || []): any[]): HTMLAnchorElement[])
		.filter(link => !isCommentCode(link) && !isEmptyLink(link))
		.map((link, i) => {
			const number = i + 1;
			const title = number < 10 ? `press ${number} to open link` :
				number === 10 ? 'press 0 to open link' :
				`press ${niceKeyCode(module.options.toggleCmdLine.value)} then ${number} and Enter to open link`;

			const $annotation = $(linkAnnotationTemplate({ number, title }));

			if (module.options.commentsLinkNumberPosition.value === 'right') $annotation.insertAfter(link);
			else $annotation.insertBefore(link);

			return { annotation: $annotation.get(0), link };
		});
}

const drawHelp = _.once(() => {
	const keys = filterMap(Object.entries(module.options), ([optionKey, opt]) => {
		if (opt.type !== 'keycode' || optionKey.startsWith('link')) return;

		let keyCode	= niceKeyCode(opt.value);
		if (opt.dependsOn && module.options[opt.dependsOn].type === 'keycode') {
			keyCode = `${niceKeyCode(module.options[opt.dependsOn].value)}, ${keyCode}`;
		}

		return [{ keyCode, description: opt.description }];
	});

	return $(keyHelpTemplate({ keys })).appendTo(document.body);
});

function getCommentsLinkKeys() {
	const keys = [];

	function addKey(key, index) {
		keys.push({
			type: 'keycode',
			value: [key, false, false, false, false], // number
			callback() { commentLink(index); },
		}, {
			type: 'keycode',
			value: [key, true, false, false, false], // alt-number
			callback() { commentLink(index, true); },
		});
	}

	if (module.options.commentsLinkNumbers.value && isPageType('comments', 'commentsLinklist')) {
		[49, 50, 51, 52, 53, 54, 55, 56, 57, 48].forEach(addKey); // numbers 1 2 3 4 5 6 7 8 9 0
		[97, 98, 99, 100, 101, 102, 103, 104, 105, 96].forEach(addKey); // numpad 1 2 3 4 5 6 7 8 9 0
	}

	return keys;
}

const _commandLookup = _.once(() => {
	const lookup = {};
	for (const option of [...(Object.values(module.options): ModuleOption[]), ...getCommentsLinkKeys()]) {
		if (option.type !== 'keycode') continue;
		if (!option.callback) continue;
		if (option.include && !matchesPageLocation(option.include)) continue;
		if (option.requiresModule && !Modules.isRunning(option.requiresModule)) continue;

		const hash = hashKeyArray(option.value);
		if (!lookup[hash]) {
			lookup[hash] = $.Callbacks();
		}

		if (option.goMode) lookup[hash].add(() => { handleGoModeCommand((option.callback: any)); });
		else lookup[hash].add(option.callback);
	}
	return lookup;
});

function getCommandsForKeyEvent(keyEvent) {
	const hash = hashKeyEvent(keyEvent);
	return _commandLookup()[hash];
}

function handleKeyPress(e) {
	if (EasterEgg.konamiActive()) return false;

	const callbacks = getCommandsForKeyEvent(e);

	if (!callbacks) return false;

	// Allow navigation on other elements when input has no (apparent) default behavior
	if (['A', 'BUTTON'].includes(document.activeElement.tagName)) {
		const hasDefaultBehavior = [/* tab */9, /* enter */13, /* space */32].includes(e.which);

		if (!hasDefaultBehavior) {
			document.activeElement.blur();
		}
	}

	if (document.activeElement.tagName === 'BODY') {
		callbacks.fire(e);
		return true;
	}
}

function hideLink() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	// find the hide link and click it...
	const hide = selected.getHideElement();
	if (hide) {
		click(hide);
	}

	if (module.options.onHideMoveDown.value) {
		SelectedEntry.selectClosestVisible({ scrollStyle: 'none', mediaBrowse: module.options.mediaBrowseMode.value });
	}
}

function followSubreddit(newWindow) {
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
}

const getLinearListMoveOptions = () => ({
	mediaBrowse: module.options.mediaBrowseMode.value,
	scrollStyle: module.options.linearScrollStyle.value,
	mediaBrowseScrollStyle: module.options.scrollOnExpando.value ? 'top' : undefined,
});

export let recentKeyMove = false;
const refreshKeyMoveTimer = _.debounce(() => { recentKeyMove = false; }, 1000);

function move(target, options) {
	const selected = SelectedEntry.selectedThing();

	if (typeof target === 'function') {
		target = selected ? target(selected) : null;
	}

	if (target instanceof HTMLElement) {
		target = Thing.from(target);
	}

	if (!target) return null;

	SelectedEntry.select(target, options);

	recentKeyMove = true;
	refreshKeyMoveTimer();

	return target;
}

function showParents() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const button = selected.entry.querySelector('.buttons .bylink[href^="#"]');
	if (button) {
		Hover.infocard('showParent')
			.target(button)
			.populateWith(ShowParent.showCommentHover)
			.begin();
	}
}

function toggleChildren() {
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
}

function getMostVisibleElementInThingByQuery(query, thing = SelectedEntry.selectedThing()) {
	if (!thing) return null;

	const elements = Array.from(thing.entry.querySelectorAll(query));
	return _.maxBy(elements, element => getPercentageVisibleYAxis(element));
}

function imageResize({ factor = 1, removeHeightRestriction = false }: { factor?: number, removeHeightRestriction?: boolean }) {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-media-zoomable');
	if (mostVisible) {
		if (removeHeightRestriction) mostVisible.style.maxHeight = 'none';
		ShowImages.resizeMedia(mostVisible, mostVisible.clientWidth * factor);
	}
}

function imageMove(deltaX, deltaY) {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-media-movable');
	if (mostVisible) ShowImages.moveMedia(mostVisible, deltaX, deltaY);
}

function previousGalleryImage() {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-gallery');
	const previousButton = mostVisible && mostVisible.querySelector('.res-gallery-previous');
	if (previousButton) previousButton.click();
}

function nextGalleryImage() {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-gallery');
	const nextButton = mostVisible && mostVisible.querySelector('.res-gallery-next');
	if (nextButton) nextButton.click();
}

function followLink(newWindow) {
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
}

function followLinkByRank(num) {
	const target = Thing.visibleThings().find(v => v.getRank() === num);
	SelectedEntry.select(target);
	followLink();
}

function followPermalink(newWindow) {
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
}

function followComments(newWindow) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	newWindow = typeof newWindow === 'boolean' ? newWindow : undefined;
	const url = selected.getCommentsLink().getAttribute('href');
	if (newWindow) {
		openNewTab(url, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = url;
	}
}

function followLinkAndComments(background) {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;
	background = typeof background === 'boolean' ? background : undefined;

	SingleClick.openTabs(selected, !background);
}

function upVote(preventToggle) {
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

	const link = isPageType('linklist', 'commentsLinklist', 'modqueue', 'profile');
	if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
		module.options.moveDown.callback();
	}
}

function downVote(preventToggle) {
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

	const link = isPageType('linklist', 'commentsLinklist', 'modqueue', 'profile');
	if (link && module.options.onVoteMoveDown.value || !link && module.options.onVoteCommentMoveDown.value) {
		module.options.moveDown.callback();
	}
}

function saveLink() {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const link = selected.entry.querySelector('.link-save-button a, .link-unsave-button a');
	if (link) {
		click(link);
	}
}

function saveComment() {
	if (promptLogin()) return;
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const button = selected.entry.querySelector('.comment-save-button > a');
	if (button) {
		click(button);
	}
}

function saveCommentRES() {
	const selected = SelectedEntry.selectedThing();
	if (!selected) return;

	const saveComment = selected.entry.querySelector('.saveComments, .unsaveComments');
	if (saveComment) {
		click(saveComment);
		SaveComments.showEducationalNotification();
	}
}

function reply() {
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
}

function navigateTo(newWindow, thisHREF) {
	if (newWindow) {
		openNewTab(thisHREF);
	} else {
		location.href = thisHREF;
	}
}

function handleGoModeCommand(func) {
	if (module.options.useGoMode.value) {
		if (goModeActive) {
			func();
			toggleGoMode();
		}
	} else {
		func();
	}
}

const goModePanel = _.once(() => {
	const goModes = filterMap(Object.entries(module.options), ([key, opt]) => {
		if (!opt.goMode) return;
		return [{ key, niceKeyCode: niceKeyCode(opt.value) }];
	});

	return $(goModePanelTemplate({ goModes }))
		.find('.RESCloseButton').click(toggleGoMode)
		.end();
});

let goModeActive = false;

function toggleGoMode() {
	goModeActive = !goModeActive;
	if (goModeActive) {
		$('body').on('keyup', handleGoModeEscapeKey);
		goModePanel().appendTo(document.body).fadeIn();
	} else {
		goModePanel().fadeOut();
		$('body').off('keyup', handleGoModeEscapeKey);
	}
}

function handleGoModeEscapeKey(event: KeyboardEvent) {
	if (event.which === 27) {
		toggleGoMode();
	}
}

function nextPage() {
	// if Never Ending Reddit is enabled, just scroll to the bottom.  Otherwise, click the 'next' link.
	if (Modules.isRunning(NeverEndingReddit) && NeverEndingReddit.loaderWidget) {
		click(NeverEndingReddit.loaderWidget);
		move(Thing.visibleThingElements().slice(-1)[0]);
	} else {
		// get the first link to the next page of reddit...
		const nextPrevLinks = NeverEndingReddit.getNextPrevLinks();
		if (nextPrevLinks && nextPrevLinks.next) {
			location.href = nextPrevLinks.next.getAttribute('href');
		}
	}
}

function prevPage() {
	// if Never Ending Reddit is enabled, do nothing.  Otherwise, click the 'prev' link.
	if (!Modules.isRunning(NeverEndingReddit)) {
		const nextPrevLinks = NeverEndingReddit.getNextPrevLinks();
		if (nextPrevLinks && nextPrevLinks.prev) {
			location.href = nextPrevLinks.prev.getAttribute('href');
		}
	}
}

function commentLink(index, altMode = false) {
	const link = linkAnnotations[index] && linkAnnotations[index].link;
	if (!link) return;

	const expando = ShowImages.getLinkExpando(link);
	if (expando && (module.options.commentsLinkToggleExpando.value !== altMode)) {
		click(expando.button);
	} else if (module.options.commentsLinkNewTab.value) {
		openNewTab(link.href, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = link.href;
	}
}
