/* @flow */

import _ from 'lodash';
import goModePanelTemplate from '../templates/goModePanel.mustache';
import linkAnnotationTemplate from '../templates/linkAnnotation.mustache';
import keyHelpTemplate from '../templates/keyHelp.mustache';
import { $ } from '../vendor';
import { Module } from '../core/module';
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
	waitForEvent,
} from '../utils';
import { i18n, openNewTab } from '../environment';
import * as Options from '../core/options';
import * as CommandLine from './commandLine';
import * as CommentNavigator from './commentNavigator';
import * as EasterEgg from './easterEgg';
import * as FilteReddit from './filteReddit';
import * as Hover from './hover';
import * as NeverEndingReddit from './neverEndingReddit';
import * as Notifications from './notifications';
import * as NoParticipation from './noParticipation';
import * as SaveComments from './saveComments';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';
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
		title: 'keyboardNavMediaBrowseModeTitle',
	},
	scrollOnExpando: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavScrollOnExpandoDesc',
		title: 'keyboardNavScrollOnExpandoTitle',
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
			name: 'adopt top',
			value: 'adopt',
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
			<br>Adopt top: Reuse the alignment of the previous selected element.
			<br>Legacy: If the element is offscreen, lock to top.
		`,
		title: 'keyboardNavLinearScrollStyleTitle',
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
			name: 'adopt top',
			value: 'adopt',
		}, {
			name: 'legacy',
			value: 'legacy',
		}],
		value: 'legacy',
		description: 'keyboardNavNonLinearScrollStyleDesc',
		title: 'keyboardNavNonLinearScrollStyleTitle',
		advanced: true,
	},
	commentsLinkNumbers: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkNumbersDesc',
		title: 'keyboardNavCommentsLinkNumbersTitle',
	},
	commentsLinkNumberPosition: {
		dependsOn: options => options.commentsLinkNumbers.value,
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
		title: 'keyboardNavCommentsLinkNumberPositionTitle',
		advanced: true,
	},
	commentsLinkToggleExpando: {
		dependsOn: options => options.commentsLinkNumbers.value,
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkToggleExpandoDesc',
		title: 'keyboardNavCommentsLinkToggleExpandoTitle',
	},
	commentsLinkNewTab: {
		dependsOn: options => options.commentsLinkNumbers.value,
		type: 'boolean',
		value: true,
		description: 'keyboardNavCommentsLinkNewTabDesc',
		title: 'keyboardNavCommentsLinkNewTabTitle',
		advanced: true,
	},
	onHideMoveDown: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavOnHideMoveDownDesc',
		title: 'keyboardNavOnHideMoveDownTitle',
		advanced: true,
	},
	onVoteMoveDown: {
		type: 'boolean',
		value: false,
		description: 'keyboardNavOnVoteMoveDownDesc',
		title: 'keyboardNavOnVoteMoveDownTitle',
		advanced: true,
	},
	onVoteCommentMoveDown: {
		type: 'boolean',
		value: false,
		description: 'keyboardNavOnVoteCommentMoveDownDesc',
		title: 'keyboardNavOnVoteCommentMoveDownTitle',
		advanced: true,
	},
	useGoMode: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavUseGoModeDesc',
		title: 'keyboardNavUseGoModeTitle',
	},
	followLinkNewTabFocus: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavFollowLinkNewTabFocusDesc',
		title: 'keyboardNavFollowLinkNewTabFocusTitle',
		advanced: true,
	},
	toggleHelp: {
		type: 'keycode',
		value: [191, false, false, true, false], // ? (note the true in the shift slot)
		description: 'keyboardNavToggleHelpDesc',
		title: 'keyboardNavToggleHelpTitle',
		callback() { drawHelp().toggle(300); },
	},
	toggleCmdLine: {
		type: 'keycode',
		value: [190, false, false, false, false], // .
		description: 'keyboardNavToggleCmdLineDesc',
		title: 'keyboardNavToggleCmdLineTitle',
		callback() { CommandLine.toggleCmdLine(); },
	},
	enterFilterCommandLine: {
		type: 'keycode',
		requiresModule: FilteReddit,
		value: [70, false, false, false, false], // f
		description: 'keyboardNavEnterFilterCommandLineDesc',
		title: 'keyboardNavEnterFilterCommandLineTitle',
		callback() { CommandLine.toggleCmdLine(true, 'fl '); },
	},
	hide: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile'],
		value: [72, false, false, false, false], // h
		description: 'keyboardNavHideDesc',
		title: 'keyboardNavHideTitle',
		callback: hideLink,
	},
	moveUp: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'search'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpDesc',
		title: 'keyboardNavMoveUpTitle',
		callback() {
			move(thing => thing.getNext({ direction: 'up' }), getLinearListMoveOptions());
		},
	},
	moveDown: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'search'],
		value: [74, false, false, false, false], // j
		description: 'keyboardNavMoveDownDesc',
		title: 'keyboardNavMoveDownTitle',
		callback() {
			move(thing => thing.getNext({ direction: 'down' }), getLinearListMoveOptions());
		},
	},
	moveUpComment: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpCommentDesc',
		title: 'keyboardNavMoveUpCommentTitle',
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
		title: 'keyboardNavMoveDownCommentTitle',
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
		title: 'keyboardNavMoveTopTitle',
		callback() { move(Thing.visibleThingElements()[0], { scrollStyle: 'top' }); },
	},
	moveBottom: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [74, false, false, true, false], // shift-j
		description: 'keyboardNavMoveBottomDesc',
		title: 'keyboardNavMoveBottomTitle',
		callback() { move(Thing.visibleThingElements().slice(-1)[0], { scrollStyle: 'top' }); },
	},
	moveUpSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [75, false, false, true, false], // shift-k
		description: 'keyboardNavMoveUpSiblingDesc',
		title: 'keyboardNavMoveUpSiblingTitle',
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
		title: 'keyboardNavMoveDownSiblingTitle',
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
		title: 'keyboardNavMoveDownParentSiblingTitle',
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
		title: 'keyboardNavMoveUpThreadTitle',
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
		title: 'keyboardNavMoveDownThreadTitle',
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
		title: 'keyboardNavMoveToTopCommentTitle',
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
		title: 'keyboardNavMoveToParentTitle',
		callback() {
			move(
				thing => thing.getParent(),
				{ scrollStyle: module.options.nonLinearScrollStyle.value }
			);
		},
	},
	showParents: {
		type: 'keycode',
		requiresModule: ShowParent,
		value: [80, false, false, true, false], // p
		description: 'keyboardNavShowParentsDesc',
		title: 'keyboardNavShowParentsTitle',
		callback: showParents,
	},
	followLink: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, false, false], // enter
		description: 'keyboardNavFollowLinkDesc',
		title: 'keyboardNavFollowLinkTitle',
		callback() { followLink(); },
	},
	followLinkNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments', 'search'],
		value: [13, false, false, true, false], // shift-enter
		description: 'keyboardNavFollowLinkNewTabDesc',
		title: 'keyboardNavFollowLinkNewTabTitle',
		callback() { followLink(true); },
	},
	toggleExpando: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [88, false, false, false, false], // x
		description: 'keyboardNavToggleExpandoDesc',
		title: 'keyboardNavToggleExpandoTitle',
		callback() {
			const thing = SelectedEntry.selectedThing();
			if (thing) ShowImages.toggleThingExpandos(thing, module.options.scrollOnExpando.value);
		},
	},
	imageSizeUp: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [187, false, false, false, false], // = -- 61 in firefox
		description: 'keyboardNavImageSizeUpDesc',
		title: 'keyboardNavImageSizeUpTitle',
		callback() { imageResize({ factor: 1.3 }); },
	},
	imageSizeDown: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [189, false, false, false, false], // - -- 173 in firefox
		description: 'keyboardNavImageSizeDownDesc',
		title: 'keyboardNavImageSizeDownTitle',
		callback() { imageResize({ factor: 1 / 1.3 }); },
	},
	imageSizeUpFine: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [187, false, false, true, false], // shift-=
		description: 'keyboardNavImageSizeUpFineDesc',
		title: 'keyboardNavImageSizeUpFineTitle',
		callback() { imageResize({ factor: 1.1 }); },
	},
	imageSizeDownFine: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [189, false, false, true, false], // shift--
		description: 'keyboardNavImageSizeDownFineDesc',
		title: 'keyboardNavImageSizeDownFineTitle',
		callback() { imageResize({ factor: 1 / 1.1 }); },
	},
	imageSizeAnyHeight: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [39, false, false, true, false], // shift-right
		description: 'keyboardNavImageSizeAnyHeightDesc',
		title: 'keyboardNavImageSizeAnyHeightTitle',
		callback() { imageResize({ removeHeightRestriction: true }); },
	},
	imageMoveUp: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [38, false, true, false, false], // ctrl-up
		description: 'keyboardNavImageMoveUpDesc',
		title: 'keyboardNavImageMoveUpTitle',
		callback() { imageMove(0, -50); },
	},
	imageMoveDown: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [40, false, true, false, false], // ctrl-down
		description: 'keyboardNavImageMoveDownDesc',
		title: 'keyboardNavImageMoveDownTitle',
		callback() { imageMove(0, 50); },
	},
	imageMoveLeft: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [37, false, true, false, false], // ctrl-left
		description: 'keyboardNavImageMoveLeftDesc',
		title: 'keyboardNavImageMoveLeftTitle',
		callback() { imageMove(-50, 0); },
	},
	imageMoveRight: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [39, false, true, false, false], // ctrl-right
		description: 'keyboardNavImageMoveRightDesc',
		title: 'keyboardNavImageMoveRightTitle',
		callback() { imageMove(50, 0); },
	},
	previousGalleryImage: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [219, false, false, false, false], // [
		description: 'keyboardNavPreviousGalleryImageDesc',
		title: 'keyboardNavPreviousGalleryImageTitle',
		callback: previousGalleryImage,
	},
	nextGalleryImage: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [221, false, false, false, false], // ]
		description: 'keyboardNavNextGalleryImageDesc',
		title: 'keyboardNavNextGalleryImageTitle',
		callback: nextGalleryImage,
	},
	toggleViewImages: {
		type: 'keycode',
		requiresModule: ShowImages,
		value: [88, false, false, true, false], // shift-x
		description: 'Toggle "show images" button',
		title: 'keyboardNavToggleViewImagesTitle',
		callback: ShowImages.toggleViewImages,
	},
	toggleChildren: {
		type: 'keycode',
		include: ['comments', 'inbox'/* mostly modmail */],
		value: [13, false, false, false, false], // enter
		description: 'keyboardNavToggleChildrenDesc',
		title: 'keyboardNavToggleChildrenTitle',
		callback: toggleChildren,
	},
	followComments: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, false, false], // c
		description: 'keyboardNavFollowCommentsDesc',
		title: 'keyboardNavFollowCommentsTitle',
		callback() { followComments(); },
	},
	followCommentsNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [67, false, false, true, false], // shift-c
		description: 'keyboardNavFollowCommentsNewTabDesc',
		title: 'keyboardNavFollowCommentsNewTabTitle',
		callback() { followComments(true); },
	},
	followLinkAndCommentsNewTab: {
		type: 'keycode',
		requiresModule: SingleClick,
		value: [76, false, false, false, false], // l
		description: 'keyboardNavFollowLinkAndCommentsNewTabDesc',
		title: 'keyboardNavFollowLinkAndCommentsNewTabTitle',
		callback() { followLinkAndComments(); },
	},
	followLinkAndCommentsNewTabBG: {
		type: 'keycode',
		requiresModule: SingleClick,
		value: [76, false, false, true, false], // shift-l
		description: 'keyboardNavFollowLinkAndCommentsNewTabBGDesc',
		title: 'keyboardNavFollowLinkAndCommentsNewTabBGTitle',
		callback() { followLinkAndComments(true); },
	},
	upVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, false, false], // a
		description: 'keyboardNavUpVoteDesc',
		title: 'keyboardNavUpVoteTitle',
		callback() { upVote(); },
	},
	downVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, false, false], // z
		description: 'keyboardNavDownVoteDesc',
		title: 'keyboardNavDownVoteTitle',
		callback() { downVote(); },
	},
	upVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, true, false], // a
		description: 'keyboardNavUpVoteWithoutTogglingDesc',
		title: 'keyboardNavUpVoteWithoutTogglingTitle',
		callback() { upVote(true); },
	},
	downVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, true, false], // z
		description: 'keyboardNavDownVoteWithoutTogglingDesc',
		title: 'keyboardNavDownVoteWithoutTogglingTitle',
		callback() { downVote(true); },
	},
	savePost: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments'],
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSavePostDesc',
		title: 'keyboardNavSavePostTitle',
		callback() { saveLink(); },
	},
	saveComment: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist'],
		value: [83, false, false, true, false], // shift-s
		description: 'keyboardNavSaveCommentDesc',
		title: 'keyboardNavSaveCommentTitle',
		callback: saveComment,
	},
	saveRES: {
		type: 'keycode',
		requiresModule: SaveComments,
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSaveRESDesc',
		title: 'keyboardNavSaveRESTitle',
		callback: saveCommentRES,
	},
	reply: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [82, false, false, false, false], // r
		description: 'keyboardNavReplyDesc',
		title: 'keyboardNavReplyTitle',
		callback: reply,
	},
	followPermalink: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [89, false, false, false, false], // y
		description: 'keyboardNavFollowPermalinkDesc',
		title: 'keyboardNavFollowPermalinkTitle',
		callback() { followPermalink(); },
	},
	followPermalinkNewTab: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [89, false, false, true, false], // shift-y
		description: 'keyboardNavFollowPermalinkNewTabDesc',
		title: 'keyboardNavFollowPermalinkNewTabTitle',
		callback() { followPermalink(true); },
	},
	followSubreddit: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, false, false], // r
		description: 'keyboardNavFollowSubredditDesc',
		title: 'keyboardNavFollowSubredditTitle',
		callback() { followSubreddit(); },
	},
	followSubredditNewTab: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [82, false, false, true, false], // shift-r
		description: 'keyboardNavFollowSubredditNewTabDesc',
		title: 'keyboardNavFollowSubredditNewTabTitle',
		callback() { followSubreddit(true); },
	},
	goMode: {
		type: 'keycode',
		value: [71, false, false, false, false], // g
		description: 'keyboardNavGoModeDesc',
		title: 'keyboardNavGoModeTitle',
		dependsOn: options => options.useGoMode.value,
		callback() { if (module.options.useGoMode.value) toggleGoMode(); },
	},
	inbox: {
		type: 'keycode',
		value: [73, false, false, false, false], // i
		description: 'keyboardNavInboxDesc',
		title: 'keyboardNavInboxTitle',
		callback() { navigateTo(false, '/message/inbox/'); },
		goMode: true,
	},
	inboxNewTab: {
		type: 'keycode',
		value: [73, false, false, true, false], // shift+i
		description: 'keyboardNavInboxNewTabDesc',
		title: 'keyboardNavInboxNewTabTitle',
		callback() { navigateTo(true, '/message/inbox/'); },
		goMode: true,
	},
	modmail: {
		type: 'keycode',
		value: [77, false, false, false, false], // m
		description: 'keyboardNavModmailDesc',
		title: 'keyboardNavModmailTitle',
		callback() { navigateTo(false, '/message/moderator/'); },
		goMode: true,
	},
	modmailNewTab: {
		type: 'keycode',
		value: [77, false, false, true, false], // shift+m
		description: 'keyboardNavModmailNewTabDesc',
		title: 'keyboardNavModmailNewTabTitle',
		callback() { navigateTo(true, '/message/moderator/'); },
		goMode: true,
	},
	profile: {
		type: 'keycode',
		value: [85, false, false, false, false], // u
		description: 'keyboardNavProfileDesc',
		title: 'keyboardNavProfileTitle',
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
		title: 'keyboardNavProfileNewTabTitle',
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
		title: 'keyboardNavFrontPageTitle',
		callback() { navigateTo(false, '/'); },
		goMode: true,
	},
	slashAll: {
		type: 'keycode',
		value: [65, true, false, false, false], // alt-a
		description: 'keyboardNavSlashAllDesc',
		title: 'keyboardNavSlashAllTitle',
		callback() { navigateTo(false, '/r/all'); },
		goMode: true,
	},
	subredditFrontPage: {
		type: 'keycode',
		value: [70, false, false, true, false], // shift-f
		description: 'keyboardNavsSubredditFrontPageDesc',
		title: 'keyboardNavsSubredditFrontPageTitle',
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
		title: 'keyboardNavRandomTitle',
		callback() { navigateTo(false, '/r/random'); },
		goMode: true,
	},
	nextPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [78, false, false, false, false], // n
		description: 'keyboardNavNextPageDesc',
		title: 'keyboardNavNextPageTitle',
		callback: nextPage,
		goMode: true,
	},
	prevPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [80, false, false, false, false], // p
		description: 'keyboardNavPrevPageDesc',
		title: 'keyboardNavPrevPageTitle',
		callback: prevPage,
		goMode: true,
	},
	toggleCommentNavigator: {
		type: 'keycode',
		requiresModule: CommentNavigator,
		value: [78, false, false, false, false], // N
		description: 'keyboardNavToggleCommentNavigatorDesc',
		title: 'keyboardNavToggleCommentNavigatorTitle',
		callback: CommentNavigator.toggleNavigator,
	},
	commentNavigatorMoveUp: {
		type: 'keycode',
		requiresModule: CommentNavigator,
		value: [38, false, false, true, false], // shift+up arrow
		description: 'keyboardNavCommentNavigatorMoveUpDesc',
		title: 'keyboardNavCommentNavigatorMoveUpTitle',
		callback() { CommentNavigator.moveUp(); },
	},
	commentNavigatorMoveDown: {
		type: 'keycode',
		requiresModule: CommentNavigator,
		value: [40, false, false, true, false], // shift+down arrow
		description: 'keyboardNavCommentNavigatorMoveDownDesc',
		title: 'keyboardNavCommentNavigatorMoveDownTitle',
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
	window.addEventListener('keydown', handleKeyPress, true);
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
	const keys = filterMap(getActiveCommandOptions(), opt => {
		let keyCode	= niceKeyCode(opt.value);
		if (opt.goMode && module.options.useGoMode.value) {
			keyCode = `${niceKeyCode(module.options.goMode.value)} → ${keyCode}`;
		}

		return [{ keyCode, description: i18n(opt.description) }];
	});

	return $(keyHelpTemplate({ keys })).appendTo(document.body);
});

function getCommentsLinkKeys() {
	const keys = [];

	function addKey(key, index) {
		keys.push({
			value: [key, false, false, false, false], // number
			callback() { commentLink(index); },
		}, {
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

const getActiveCommandOptions = _.once(() =>
	filterMap(Object.values(module.options), option => {
		if (option.type === 'keycode' &&
			option.callback &&
			(!option.dependsOn || option.dependsOn(module.options)) &&
			(!option.include || matchesPageLocation(option.include)) &&
			(!option.requiresModule || Modules.isRunning(option.requiresModule))) {
			return [option];
		}
	})
);

const _commandLookup = _.once(() => {
	const lookup = {};
	for (const option of [...getActiveCommandOptions(), ...getCommentsLinkKeys()]) {
		const hash = hashKeyArray(option.value);
		if (!lookup[hash]) {
			lookup[hash] = [];
		}

		lookup[hash].push(option);
	}
	return lookup;
});

function handleKeyPress(e) {
	if (EasterEgg.konamiActive()) return;

	// Allow navigation on other elements when input has no (apparent) default behavior
	if (['A', 'BUTTON'].includes(document.activeElement.tagName)) {
		const hasDefaultBehavior = [/* tab */9, /* enter */13, /* space */32].includes(e.which);
		if (hasDefaultBehavior) return;
	} else if (document.activeElement.tagName !== 'BODY') {
		return;
	}

	const hash = hashKeyEvent(e);
	const options = (_commandLookup()[hash] || [])
		.filter(v => {
			if (v.goMode) return module.options.useGoMode.value === goModeActive;
			else return !goModeActive;
		});

	if (options.length) {
		handleCallbacks(options);
		e.preventDefault();
		e.target.blur();
	}
}

async function handleCallbacks(options) {
	if (options.some(v => v.goMode)) {
		if (goModeActive) toggleGoMode();

		if (options.length > 1) {
			const shortcut = niceKeyCode(options[0].value);
			options = await promptUniqueShortcut(shortcut, options);
		}
	}

	for (const option of options) option.callback();
}

const promptUniqueShortcut = _.memoize(async (shortcut, options: any) => {
	const question = i18n('keyboardNavAmbiguousShortcutPrompt', i18n(module.moduleName), `<i>${shortcut}</i>`, '<br><br>', `<i>${shortcut}</i>`);
	const optionButtons = options.map(option =>
		[option, $(`<button style="width: 100%; margin-top: 2px;">${i18n(option.description)}</button>`).get(0)]
	);
	const followUp = i18n('keyboardNavAmbiguousShortcutPromptFollowUp', SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, i18n(module.moduleName)));

	const message = $(`<div>${question}</div>`)
		.append(optionButtons.map(([, button]) => button))
		.append(`<br><br><small>(${followUp})</small>`)
		.get(0);

	const notification = await Notifications.showNotification({
		moduleID: module.moduleID,
		header: 'Ambiguous shortcut',
		message,
		noDisable: true,
		closeDelay: Infinity,
	});

	const preservedOption = await Promise.race(
		optionButtons.map(([option, button]) => waitForEvent(button, 'click').then(() => option))
	);

	Object.entries(module.options)
		.filter(([, value]) => value !== preservedOption && options.includes(value))
		.forEach(([name]) => { Options.set(module, name, [-1, false, false, false, false]); });

	notification.close();

	return [preservedOption];
});

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
	if (!target) return;
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
