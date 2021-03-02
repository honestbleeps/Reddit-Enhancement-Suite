/* @flow */

import $ from 'jquery';
import { once, maxBy, without, memoize } from 'lodash-es';
import { Module } from '../core/module';
import * as Modules from '../core/modules';
import {
	NAMED_KEYS,
	Thing,
	SelectedThing,
	click,
	downcast,
	currentSubreddit,
	currentUserProfile,
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
	scrollToElement,
	string,
	watchForElements,
	waitForEvent,
} from '../utils';
import { i18n, openNewTab } from '../environment';
import * as Options from '../core/options';
import * as CommandLine from './commandLine';
import * as CommentNavigator from './commentNavigator';
import * as EasterEgg from './easterEgg';
import * as FilteReddit from './filteReddit';
import * as HideChildComments from './hideChildComments';
import * as NeverEndingReddit from './neverEndingReddit';
import * as Notifications from './notifications';
import * as NoParticipation from './noParticipation';
import * as SaveComments from './saveComments';
import * as SettingsNavigation from './settingsNavigation';
import * as ShowImages from './showImages';
import * as ShowParent from './showParent';
import * as SingleClick from './singleClick';

export const module: Module<*> = new Module('keyboardNav');

module.moduleName = 'keyboardNavName';
module.category = 'browsingCategory';
module.description = 'keyboardNavDesc';
module.options = {
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
		description: 'keyboardNavLinearScrollStyleDesc',
		title: 'keyboardNavLinearScrollStyleTitle',
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
	},
	linkNumbers: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavLinkNumbersDesc',
		title: 'keyboardNavLinkNumbersTitle',
	},
	linkNumberPosition: {
		dependsOn: options => options.linkNumbers.value,
		type: 'enum',
		values: [{
			name: 'Place on right',
			value: 'right',
		}, {
			name: 'Place on left',
			value: 'left',
		}],
		value: 'right',
		description: 'keyboardNavLinkNumberPositionDesc',
		title: 'keyboardNavLinkNumberPositionTitle',
		advanced: true,
	},
	linkToggleExpando: {
		dependsOn: options => options.linkNumbers.value,
		type: 'boolean',
		value: true,
		description: 'keyboardNavLinkToggleExpandoDesc',
		title: 'keyboardNavLinkToggleExpandoTitle',
	},
	linkNumberAltModeModifier: {
		dependsOn: options => options.linkNumbers.value,
		type: 'enum',
		values: [{
			name: 'none',
			value: 'none',
		}, {
			name: 'Shift',
			value: 'shift',
		}, {
			name: 'Alt',
			value: 'alt',
		}],
		value: 'alt',
		description: 'keyboardNavLinkNumberAltModeModifierDesc',
		title: 'keyboardNavLinkNumberAltModeModifierTitle',
		advanced: true,
	},
	linkNewTab: {
		dependsOn: options => options.linkNumbers.value,
		type: 'boolean',
		value: true,
		description: 'keyboardNavLinkNewTabDesc',
		title: 'keyboardNavLinkNewTabTitle',
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
	followLinkNewTabFocus: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavFollowLinkNewTabFocusDesc',
		title: 'keyboardNavFollowLinkNewTabFocusTitle',
	},
	toggleHelp: {
		type: 'keycode',
		value: [191, false, false, true, false], // ? (note the true in the shift slot)
		description: 'keyboardNavToggleHelpDesc',
		title: 'keyboardNavToggleHelpTitle',
		callback() { toggleKeyNavHelp(); },
	},
	toggleCmdLine: {
		type: 'keycode',
		requiresModules: [CommandLine],
		value: [190, false, false, false, false], // .
		description: 'keyboardNavToggleCmdLineDesc',
		title: 'keyboardNavToggleCmdLineTitle',
		callback() { CommandLine.toggle(); },
	},
	enterFilterCommandLine: {
		type: 'keycode',
		requiresModules: [CommandLine, FilteReddit],
		value: [70, false, false, false, false], // f
		description: 'keyboardNavEnterFilterCommandLineDesc',
		title: 'keyboardNavEnterFilterCommandLineTitle',
		callback() { CommandLine.open('fl '); },
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
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpDesc',
		title: 'keyboardNavMoveUpTitle',
		callback() { SelectedThing.move('up', { allowMediaBrowse: true, scrollStyle: module.options.linearScrollStyle.value }); },
	},
	moveDown: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'search'],
		value: [74, false, false, false, false], // j
		description: 'keyboardNavMoveDownDesc',
		title: 'keyboardNavMoveDownTitle',
		callback() {
			SelectedThing.move('down', { allowMediaBrowse: true, scrollStyle: module.options.linearScrollStyle.value }, moveDownFallback);
		},
	},
	moveUpComment: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [75, false, false, false, false], // k
		description: 'keyboardNavMoveUpCommentDesc',
		title: 'keyboardNavMoveUpCommentTitle',
		callback() { SelectedThing.move('up', { scrollStyle: module.options.linearScrollStyle.value }); },
	},
	moveDownComment: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist', 'inbox'],
		value: [74, false, false, false, false], // j
		description: 'keyboardNavMoveDownCommentDesc',
		title: 'keyboardNavMoveDownCommentTitle',
		callback() { SelectedThing.move('down', { scrollStyle: module.options.linearScrollStyle.value }); },
	},
	moveTop: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [75, false, false, true, false], // shift-k
		description: 'keyboardNavMoveTopDesc',
		title: 'keyboardNavMoveTopTitle',
		callback() { SelectedThing.move('top', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveBottom: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox', 'search'],
		value: [74, false, false, true, false], // shift-j
		description: 'keyboardNavMoveBottomDesc',
		title: 'keyboardNavMoveBottomTitle',
		callback() { SelectedThing.move('bottom', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveUpSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [75, false, false, true, false], // shift-k
		description: 'keyboardNavMoveUpSiblingDesc',
		title: 'keyboardNavMoveUpSiblingTitle',
		callback() { SelectedThing.move('upSibling', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveDownSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [74, false, false, true, false], // shift-j
		description: 'keyboardNavMoveDownSiblingDesc',
		title: 'keyboardNavMoveDownSiblingTitle',
		callback() { SelectedThing.move('downSibling', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveDownParentSibling: {
		type: 'keycode',
		include: ['comments'],
		value: [74, true, false, false, false], // alt-j
		description: 'keyboardNavMoveDownParentSiblingDesc',
		title: 'keyboardNavMoveDownParentSiblingTitle',
		callback() { SelectedThing.move('downParentSibling', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveUpThread: {
		type: 'keycode',
		include: ['comments'],
		value: [75, true, false, true, false], // shift-alt-k
		description: 'keyboardNavMoveUpThreadDesc',
		title: 'keyboardNavMoveUpThreadTitle',
		callback() { SelectedThing.move('upThread', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveDownThread: {
		type: 'keycode',
		include: ['comments'],
		value: [74, true, false, true, false], // shift-alt-j
		description: 'keyboardNavMoveDownThreadDesc',
		title: 'keyboardNavMoveDownThreadTitle',
		callback() { SelectedThing.move('downThread', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveToTopComment: {
		type: 'keycode',
		include: ['comments'],
		value: [84, false, false, false, false], // t
		description: 'keyboardNavMoveToTopCommentDesc',
		title: 'keyboardNavMoveToTopCommentTitle',
		callback() { SelectedThing.move('toTopComment', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	moveToParent: {
		type: 'keycode',
		include: ['comments'],
		value: [80, false, false, false, false], // p
		description: 'keyboardNavMoveToParentDesc',
		title: 'keyboardNavMoveToParentTitle',
		callback() { SelectedThing.move('toParent', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	undoMove: {
		type: 'keycode',
		value: [90, false, true, false, false], // ctrl-z
		description: 'keyboardNavUndoMoveDesc',
		title: 'keyboardNavUndoMoveTitle',
		callback() { SelectedThing.move('previous', { scrollStyle: module.options.nonLinearScrollStyle.value }); },
	},
	showParents: {
		type: 'keycode',
		requiresModules: [ShowParent],
		value: [80, false, false, true, false], // p
		description: 'keyboardNavShowParentsDesc',
		title: 'keyboardNavShowParentsTitle',
		callback(selected = getSelected()) {
			ShowParent.startHover(assertElement(selected.element.querySelector('.buttons .bylink[href^="#"]')));
		},
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
		requiresModules: [ShowImages],
		value: [88, false, false, false, false], // x
		description: 'keyboardNavToggleExpandoDesc',
		title: 'keyboardNavToggleExpandoTitle',
		callback(selected = getSelected()) {
			ShowImages.toggleThingExpandos(selected, {
				scrollOnToggle: module.options.scrollOnExpando.value,
			});
		},
	},
	scrollOnExpando: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavScrollOnExpandoDesc',
		title: 'keyboardNavScrollOnExpandoTitle',
		advanced: true,
	},
	imageSizeUp: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [187, false, false, false, false], // = -- 61 in firefox
		description: 'keyboardNavImageSizeUpDesc',
		title: 'keyboardNavImageSizeUpTitle',
		callback() { imageResize({ factor: 1.3 }); },
	},
	imageSizeDown: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [189, false, false, false, false], // - -- 173 in firefox
		description: 'keyboardNavImageSizeDownDesc',
		title: 'keyboardNavImageSizeDownTitle',
		callback() { imageResize({ factor: 1 / 1.3 }); },
	},
	imageSizeUpFine: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [187, false, false, true, false], // shift-=
		description: 'keyboardNavImageSizeUpFineDesc',
		title: 'keyboardNavImageSizeUpFineTitle',
		callback() { imageResize({ factor: 1.1 }); },
	},
	imageSizeDownFine: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [189, false, false, true, false], // shift--
		description: 'keyboardNavImageSizeDownFineDesc',
		title: 'keyboardNavImageSizeDownFineTitle',
		callback() { imageResize({ factor: 1 / 1.1 }); },
	},
	imageSizeAnyHeight: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [39, false, false, true, false], // shift-right
		description: 'keyboardNavImageSizeAnyHeightDesc',
		title: 'keyboardNavImageSizeAnyHeightTitle',
		callback() { imageResize({ removeHeightRestriction: true }); },
	},
	imageMoveUp: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [38, false, true, false, false], // ctrl-up
		description: 'keyboardNavImageMoveUpDesc',
		title: 'keyboardNavImageMoveUpTitle',
		callback() { imageMove(0, -50); },
	},
	imageMoveDown: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [40, false, true, false, false], // ctrl-down
		description: 'keyboardNavImageMoveDownDesc',
		title: 'keyboardNavImageMoveDownTitle',
		callback() { imageMove(0, 50); },
	},
	imageMoveLeft: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [37, false, true, false, false], // ctrl-left
		description: 'keyboardNavImageMoveLeftDesc',
		title: 'keyboardNavImageMoveLeftTitle',
		callback() { imageMove(-50, 0); },
	},
	imageMoveRight: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [39, false, true, false, false], // ctrl-right
		description: 'keyboardNavImageMoveRightDesc',
		title: 'keyboardNavImageMoveRightTitle',
		callback() { imageMove(50, 0); },
	},
	previousGalleryImage: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [219, false, false, false, false], // [
		description: 'keyboardNavPreviousGalleryImageDesc',
		title: 'keyboardNavPreviousGalleryImageTitle',
		callback() { navigateGallery('previous'); },
	},
	nextGalleryImage: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [221, false, false, false, false], // ]
		description: 'keyboardNavNextGalleryImageDesc',
		title: 'keyboardNavNextGalleryImageTitle',
		callback() { navigateGallery('next'); },
	},
	scrollOnGalleryNavigate: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavScrollOnGalleryNavigateDesc',
		title: 'keyboardNavScrollOnGalleryNavigateTitle',
		advanced: true,
	},
	toggleViewImages: {
		type: 'keycode',
		requiresModules: [ShowImages],
		value: [88, false, false, true, false], // shift-x
		description: 'keyboardNavToggleViewImagesDesc',
		title: 'keyboardNavToggleViewImagesTitle',
		callback() { ShowImages.viewImagesButton().click(); },
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
		requiresModules: [SingleClick],
		value: [76, false, false, false, false], // l
		description: 'keyboardNavFollowLinkAndCommentsNewTabDesc',
		title: 'keyboardNavFollowLinkAndCommentsNewTabTitle',
		callback() { (SingleClick.invokeOnPostMap.get(getSelected()): any)(true); },
	},
	followLinkAndCommentsNewTabBG: {
		type: 'keycode',
		requiresModules: [SingleClick],
		value: [76, false, false, true, false], // shift-l
		description: 'keyboardNavFollowLinkAndCommentsNewTabBGDesc',
		title: 'keyboardNavFollowLinkAndCommentsNewTabBGTitle',
		callback() { (SingleClick.invokeOnPostMap.get(getSelected()): any)(false); },
	},
	upVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, false, false], // a
		description: 'keyboardNavUpVoteDesc',
		title: 'keyboardNavUpVoteTitle',
		mustBeLoggedIn: true,
		callback() { vote('upmod'); },
	},
	downVote: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, false, false], // z
		description: 'keyboardNavDownVoteDesc',
		title: 'keyboardNavDownVoteTitle',
		mustBeLoggedIn: true,
		callback() { vote('downmod'); },
	},
	upVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [65, false, false, true, false], // a
		description: 'keyboardNavUpVoteWithoutTogglingDesc',
		title: 'keyboardNavUpVoteWithoutTogglingTitle',
		mustBeLoggedIn: true,
		callback() { vote('upmod', true); },
	},
	downVoteWithoutToggling: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'comments', 'inbox', 'search'],
		value: [90, false, false, true, false], // z
		description: 'keyboardNavDownVoteWithoutTogglingDesc',
		title: 'keyboardNavDownVoteWithoutTogglingTitle',
		mustBeLoggedIn: true,
		callback() { vote('downmod', true); },
	},
	savePost: {
		type: 'keycode',
		include: ['linklist', 'modqueue', 'profile', 'comments'],
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSavePostDesc',
		title: 'keyboardNavSavePostTitle',
		mustBeLoggedIn: true,
		callback() {
			click(getFirstElementInThingByQuery('.link-save-button a, .link-unsave-button a', ASSERT));
		},
	},
	saveComment: {
		type: 'keycode',
		include: ['comments', 'commentsLinklist'],
		value: [83, false, false, true, false], // shift-s
		description: 'keyboardNavSaveCommentDesc',
		title: 'keyboardNavSaveCommentTitle',
		mustBeLoggedIn: true,
		callback() {
			click(getFirstElementInThingByQuery('.comment-save-button > a', ASSERT));
		},
	},
	saveRES: {
		type: 'keycode',
		requiresModules: [SaveComments],
		value: [83, false, false, false, false], // s
		description: 'keyboardNavSaveRESDesc',
		title: 'keyboardNavSaveRESTitle',
		callback() {
			click(getFirstElementInThingByQuery('.saveComments, .unsaveComments', ASSERT));
			SaveComments.showEducationalNotification();
		},
	},
	reply: {
		type: 'keycode',
		include: ['comments', 'inbox'],
		value: [82, false, false, false, false], // r
		description: 'keyboardNavReplyDesc',
		title: 'keyboardNavReplyTitle',
		mustBeLoggedIn: true,
		callback: reply,
	},
	edit: {
		type: 'keycode',
		include: ['comments', 'profile'],
		value: [69, false, false, false, false], // e
		description: 'keyboardNavEditDesc',
		title: 'keyboardNavEditTitle',
		mustBeLoggedIn: true,
		callback() {
			click(getFirstElementInThingByQuery('.entry .edit-usertext', ASSERT, getSelected()));
		},
	},
	showChildComments: {
		type: 'keycode',
		requiresModules: [HideChildComments],
		value: [67, false, false, false, false], // c
		description: 'keyboardNavShowChildCommentsDesc',
		title: 'keyboardNavShowChildCommentsTitle',
		callback(selected = getSelected()) {
			HideChildComments.toggle(selected);
		},
	},
	showAllChildComments: {
		type: 'keycode',
		requiresModules: [HideChildComments],
		value: [67, false, false, true, false], // shift-c
		description: 'keyboardNavShowAllChildCommentsDesc',
		title: 'keyboardNavShowAllChildCommentsTitle',
		callback() {
			HideChildComments.toggleAll();
		},
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
	followProfile: {
		type: 'keycode',
		include: ['linklist', 'comments', 'commentsLinklist', 'inbox', 'modqueue', 'search'],
		value: [85, false, false, false, false], // u
		description: 'keyboardNavFollowProfileDesc',
		title: 'keyboardNavFollowProfileTitle',
		callback() { followProfile(); },
	},
	followProfileNewTab: {
		type: 'keycode',
		include: ['linklist', 'comments', 'commentsLinklist', 'inbox', 'modqueue', 'search'],
		value: [85, false, false, true, false], // shift-u
		description: 'keyboardNavFollowProfileNewTabDesc',
		title: 'keyboardNavFollowProfileNewTabTitle',
		callback() { followProfile(true); },
	},
	toggleCommentNavigator: {
		type: 'keycode',
		requiresModules: [CommentNavigator],
		value: [78, false, false, false, false], // N
		description: 'keyboardNavToggleCommentNavigatorDesc',
		title: 'keyboardNavToggleCommentNavigatorTitle',
		callback() { CommentNavigator.toggle(true); },
	},
	commentNavigatorMoveUp: {
		type: 'keycode',
		requiresModules: [CommentNavigator],
		value: [38, false, false, true, false], // shift+up arrow
		description: 'keyboardNavCommentNavigatorMoveUpDesc',
		title: 'keyboardNavCommentNavigatorMoveUpTitle',
		callback() { CommentNavigator.move('up', 'keyboard'); },
	},
	commentNavigatorMoveDown: {
		type: 'keycode',
		requiresModules: [CommentNavigator],
		value: [40, false, false, true, false], // shift+down arrow
		description: 'keyboardNavCommentNavigatorMoveDownDesc',
		title: 'keyboardNavCommentNavigatorMoveDownTitle',
		callback() { CommentNavigator.move('down', 'keyboard'); },
	},
	focusOnSearchBox: {
		type: 'keycode',
		value: [191, true, false, false, false], // alt-/
		description: 'keyboardNavFocusOnSearchBoxDesc',
		title: 'keyboardNavFocusOnSearchBoxTitle',
		callback() { document.querySelector('#search input[name="q"]').focus(); },
	},
	useGoMode: {
		type: 'boolean',
		value: true,
		description: 'keyboardNavUseGoModeDesc',
		title: 'keyboardNavUseGoModeTitle',
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
		callback() { navigateTo('/message/inbox/', { leaveNP: true }); },
		goMode: true,
	},
	inboxNewTab: {
		type: 'keycode',
		value: [73, false, false, true, false], // shift+i
		description: 'keyboardNavInboxNewTabDesc',
		title: 'keyboardNavInboxNewTabTitle',
		callback() { navigateTo('/message/inbox/', { newWindow: true, leaveNP: true }); },
		goMode: true,
	},
	modmail: {
		type: 'keycode',
		value: [77, false, false, false, false], // m
		description: 'keyboardNavModmailDesc',
		title: 'keyboardNavModmailTitle',
		callback() { navigateTo('/message/moderator/', { leaveNP: true }); },
		goMode: true,
	},
	modmailNewTab: {
		type: 'keycode',
		value: [77, false, false, true, false], // shift+m
		description: 'keyboardNavModmailNewTabDesc',
		title: 'keyboardNavModmailNewTabTitle',
		callback() { navigateTo('/message/moderator/', { newWindow: true, leaveNP: true }); },
		goMode: true,
	},
	profile: {
		type: 'keycode',
		value: [85, false, false, false, false], // u
		description: 'keyboardNavProfileDesc',
		title: 'keyboardNavProfileTitle',
		callback() {
			const user = loggedInUser();
			if (user) navigateTo(`/user/${user}`, { leaveNP: true });
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
			if (user) navigateTo(`/user/${user}`, { newWindow: true, leaveNP: true });
		},
		goMode: true,
	},
	frontPage: {
		type: 'keycode',
		value: [70, false, false, false, false], // f
		description: 'keyboardNavFrontPageDesc',
		title: 'keyboardNavFrontPageTitle',
		callback() { navigateTo('/', { leaveNP: true }); },
		goMode: true,
	},
	slashAll: {
		type: 'keycode',
		value: [65, true, false, false, false], // alt-a
		description: 'keyboardNavSlashAllDesc',
		title: 'keyboardNavSlashAllTitle',
		callback() { navigateTo('/r/all', { leaveNP: true }); },
		goMode: true,
	},
	subredditFrontPage: {
		type: 'keycode',
		value: [70, false, false, true, false], // shift-f
		description: 'keyboardNavsSubredditFrontPageDesc',
		title: 'keyboardNavsSubredditFrontPageTitle',
		callback() {
			const sub = currentSubreddit();
			if (sub) navigateTo(`/r/${sub}`, { leaveNP: false });
		},
		goMode: true,
	},
	random: {
		type: 'keycode',
		value: [89, true, false, false, false], // alt-y   SO RANDOM
		description: 'keyboardNavRandomDesc',
		title: 'keyboardNavRandomTitle',
		callback() { navigateTo('/r/random', { leaveNP: true }); },
		goMode: true,
	},
	nextPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [78, false, false, false, false], // n
		description: 'keyboardNavNextPageDesc',
		title: 'keyboardNavNextPageTitle',
		callback() {
			if (Modules.isRunning(NeverEndingReddit)) {
				NeverEndingReddit.loadNextPage({ scrollToLoadWidget: true });
			} else {
				const next = NeverEndingReddit.getNextPrevLinks().next;
				if (next) location.href = next;
			}
		},
		goMode: true,
	},
	prevPage: {
		type: 'keycode',
		include: ['linklist', 'commentsLinklist', 'modqueue', 'profile', 'inbox'],
		value: [80, false, false, false, false], // p
		description: 'keyboardNavPrevPageDesc',
		title: 'keyboardNavPrevPageTitle',
		callback() {
			if (Modules.isRunning(NeverEndingReddit)) {
				// neverEndingReddit has no interface for this
			} else {
				const prev = NeverEndingReddit.getNextPrevLinks().prev;
				if (prev) location.href = prev;
			}
		},
		goMode: true,
	},
	overviewLegacy: {
		type: 'keycode',
		include: ['d2x', 'profile'],
		value: [79, false, false, true, false], // shift+o
		description: 'keyboardNavOverviewLegacyDesc',
		title: 'keyboardNavOverviewLegacyTitle',
		callback() {
			const currentUser = currentUserProfile();
			if (currentUser) navigateTo(`/user/${currentUser}/overview`, { leaveNP: true });
		},
		goMode: true,
	},
	profileView: {
		type: 'keycode',
		include: ['d2x', 'profile'],
		value: [80, false, false, true, false], // shift+p
		description: 'keyboardNavProfileViewDesc',
		title: 'keyboardNavProfileViewTitle',
		callback() {
			const currentUser = currentUserProfile();
			if (currentUser) navigateTo(`/user/${currentUser}`, { leaveNP: true });
		},
		goMode: true,
	},
	// numbers and numpad numbers are used to access links (see getLinkKeys)
};

module.beforeLoad = () => {
	registerCommandLine();

	if (module.options.linkNumbers.value) {
		SelectedThing.addListener(updateLinkAnnotations, 'instantly');
		watchForElements(['selfText'], null, element => {
			const thing = Thing.from(element);
			if (SelectedThing.current === thing) updateLinkAnnotations(thing);
		});
	}
};

module.contentStart = () => {
	window.addEventListener('keydown', handleKeyPress, true);
};

function registerCommandLine() {
	CommandLine.registerCommand(/\d+/, '[number] - navigates to the link with that number (if annotation exists) or rank (link pages)',
		() => {},
		command => {
			const number = parseInt(command, 10);
			const annotation = linkAnnotations[number - 1];
			if (annotation) {
				if (!document.contains(annotation.link)) {
					console.log('Annotation refers to removed link; ignoring');
					return;
				}
				openLink(number - 1);
			} else {
				followLinkByRank(number);
			}
		},
	);
}

let linkAnnotations = [];

function updateLinkAnnotations(selected) {
	for (const { annotation } of linkAnnotations) annotation.remove();

	linkAnnotations = ((Array.from((selected && selected.entry.querySelectorAll('div.md a:not(.noKeyNav)')) || []): any[]): HTMLAnchorElement[])
		.filter(link => !isCommentCode(link) && !isEmptyLink(link))
		.map((link, i) => {
			const number = i + 1;
			const title = number < 10 ? `press ${number} to open link` :
				number === 10 ? 'press 0 to open link' :
				`press ${niceKeyCode(module.options.toggleCmdLine.value)} then ${number} and Enter to open link`;

			const annotation = string.html`<span class="noCtrlF keyNavAnnotation" data-text="[${number}]" title="${title}"></span>`;

			if (module.options.linkNumberPosition.value === 'right') link.after(annotation);
			else link.before(annotation);

			return { annotation, link };
		});
}

function toggleKeyNavHelp() {
	const slideSpeed = 400;
	if (!drawHelp().attr('shown')) {
		drawHelp().attr('shown', 'false');
		drawHelp().css({ right: '-350px' });
		drawHelp().show();
	}
	if (drawHelp().attr('shown') === 'true') {
		drawHelp().animate({
			right: '-350px',
		}, slideSpeed);
		drawHelp().attr('shown', 'false');
	} else {
		drawHelp().animate({
			right: '20px',
		}, slideSpeed);
		drawHelp().attr('shown', 'true');
	}
}

const drawHelp = once(() => {
	const keys = filterMap(getActiveCommandOptions(), opt => {
		let keyCode	= niceKeyCode(opt.value);
		if (opt.goMode && module.options.useGoMode.value) {
			keyCode = `${niceKeyCode(module.options.goMode.value)} → ${keyCode}`;
		}

		return [{ keyCode, description: i18n(opt.description) }];
	});

	return $(string.html`
		<div id="keyHelp">
			<table>
				<thead>
					<tr><th>Key</th><th>Function</th></tr>
				</thead>
				<tbody>
					${keys.map(({ keyCode, description }) => string._html`
						<tr><td>${keyCode}</td><td>${description}</td></tr>
					`)}
				</tbody>
			</table>
		</div>
	`).appendTo(document.body);
});

function getLinkKeys() {
	const altModeModifier = module.options.linkNumberAltModeModifier.value;
	const keys = [];

	function addKey(key, index) {
		keys.push({
			value: [key, false, false, false, false], // number
			callback() { openLink(index); },
		});

		if (altModeModifier !== 'none') {
			keys.push({
				value: [key, altModeModifier === 'alt', false, altModeModifier === 'shift', false], // alt-number | shift-number
				callback() { openLink(index, true); },
			});
		}
	}

	if (module.options.linkNumbers.value) {
		[49, 50, 51, 52, 53, 54, 55, 56, 57, 48].forEach(addKey); // numbers 1 2 3 4 5 6 7 8 9 0
		[97, 98, 99, 100, 101, 102, 103, 104, 105, 96].forEach(addKey); // numpad 1 2 3 4 5 6 7 8 9 0
	}

	return keys;
}

const getActiveCommandOptions = once(() =>
	filterMap(Object.values(module.options), option => {
		if (
			option.type === 'keycode' &&
			option.callback &&
			(!option.dependsOn || option.dependsOn(module.options)) &&
			(!option.include || matchesPageLocation(option.include)) &&
			(!option.mustBeLoggedIn || loggedInUser()) &&
			(!option.requiresModules || option.requiresModules.every(Modules.isRunning))
		) {
			return [option];
		}
	}),
);

const _commandLookup = once(() => {
	const lookup = {};
	for (const option of [...getActiveCommandOptions(), ...getLinkKeys()]) {
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
	if (document.activeElement && ['A', 'BUTTON'].includes(document.activeElement.tagName)) {
		const hasDefaultBehavior = [NAMED_KEYS.Tab, NAMED_KEYS.Enter,
			NAMED_KEYS.Space].includes(e.key);
		if (hasDefaultBehavior) return;
	} else if (document.activeElement && document.activeElement.tagName !== 'BODY') {
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

	for (const option of options) {
		try {
			option.callback();
		} catch (e) {
			console.error('Could not execute callback', i18n(option.title), e);
		}
	}
}

const promptUniqueShortcut = memoize(async (shortcut, options: any) => {
	const question = i18n('keyboardNavAmbiguousShortcutPrompt', i18n(module.moduleName), `<i>${shortcut}</i>`, '<br><br>', `<i>${shortcut}</i>`);
	const optionButtons = options.map(option =>
		[option, $(`<button style="width: 100%; margin-top: 2px;">${i18n(option.description)}</button>`).get(0)],
	);
	const followUp = i18n('keyboardNavAmbiguousShortcutPromptFollowUp', SettingsNavigation.makeUrlHashLink(module.moduleID, undefined, i18n(module.moduleName)));

	const message = $(`<div>${question}</div>`)
		.append(optionButtons.map(([, button]) => button))
		.append(`<br><br><small>(${followUp})</small>`)
		.get(0);

	const notification = Notifications.showNotification({
		moduleID: module.moduleID,
		header: 'Ambiguous shortcut',
		message,
		noDisable: true,
		closeDelay: Infinity,
	});

	const preservedOption = await Promise.race(
		optionButtons.map(([option, button]) => waitForEvent(button, 'click').then(() => option)),
	);

	for (const option of without(options, preservedOption)) {
		option.value = [-1, false, false, false, false];
		Options.save(option);
	}

	notification.close();

	return [preservedOption];
});

function getSelected(): Thing {
	const selected = SelectedThing.current;
	if (!selected) throw new Error('A entry must be selected');
	if (!selected.isVisible()) throw new Error('Entry must be visible');
	return selected;
}

const ASSERT = true;
const NOASSERT = false;

function assertElement<T>(element: ?T): T {
	if (!element) throw new Error('Element not available');
	return element;
}

function getFirstElementInThingByQuery(query: string, assertExistance: boolean, thing = getSelected()) {
	const element = thing.entry.querySelector(query);
	return assertExistance ? assertElement(element) : element;
}

function getElementsInThingByQuery(query: string, assertLength: boolean, thing = getSelected()) {
	const elements = Array.from(thing.entry.querySelectorAll(query));
	if (assertLength) assertElement(elements[0]);
	return elements;
}

function getMostVisibleElementInThingByQuery(query, assertLength, thing) {
	return maxBy(getElementsInThingByQuery(query, assertLength, thing), getPercentageVisibleYAxis);
}

function hideLink(selected = getSelected()) {
	const hide = assertElement(selected.getHideElement());

	// Hide will collapse expandos, so move down first in order for mediaBrowse to use correct state
	if (module.options.onHideMoveDown.value) {
		SelectedThing.move('down', { allowMediaBrowse: true, scrollStyle: 'none' }, moveDownFallback);
	}

	click(hide);
}

function followSubreddit(newWindow = false, selected = getSelected()) {
	const a = downcast(assertElement(selected.getSubredditLink()), HTMLAnchorElement);
	navigateTo(a.href, { newWindow, leaveNP: true });
}

function followProfile(newWindow = false, selected = getSelected()) {
	navigateTo(selected.getAuthorUrl(), { newWindow, leaveNP: true });
}

function toggleChildren(selected = getSelected()) {
	if (selected.element.classList.contains('link')) return;

	click(assertElement(
		// 'continue this thread' links
		getFirstElementInThingByQuery('span.deepthread > a', NOASSERT, selected) ||
		// check if this is a "show more comments" box, or just contracted content...
		getFirstElementInThingByQuery('span.morecomments > a', NOASSERT, selected) ||
		// find out if this is a collapsed or uncollapsed view...
		getFirstElementInThingByQuery('a.expand', NOASSERT, selected),
	));
}

function imageResize({ factor = 1, removeHeightRestriction = false }: {| factor?: number, removeHeightRestriction?: boolean |}) {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-media-zoomable', ASSERT);
	if (removeHeightRestriction) mostVisible.style.maxHeight = 'none';
	ShowImages.resize(mostVisible, mostVisible.clientWidth * factor);
}

function imageMove(deltaX, deltaY) {
	const mostVisible = getMostVisibleElementInThingByQuery('.res-media-movable', ASSERT);
	ShowImages.move(mostVisible, deltaX, deltaY);
}

function navigateGallery(direction: 'previous' | 'next') {
	const gallery = getMostVisibleElementInThingByQuery('.res-gallery', ASSERT);
	assertElement(gallery.querySelector(`.res-step-${direction}`)).click();
	if (module.options.scrollOnGalleryNavigate.value) {
		scrollToElement(assertElement(gallery.querySelector('.res-gallery-pieces')), null, { scrollStyle: 'directional', restrictDirectionTo: 'up' });
	}
}

function followLink(newWindow = false, selected = getSelected()) {
	if (isPageType('comments') && !selected.element.classList.contains('link')) return;

	const a = selected.getPostLink();
	navigateTo(a.href, { newWindow });
}

function followLinkByRank(num) {
	const target = Thing.visibleThings().find(v => v.getRank() === num);
	if (!target) throw new Error(`Could not find visible entry at rank ${num}`);
	SelectedThing.set(target);
	followLink();
}

function followPermalink(newWindow = false) {
	const a = downcast(getFirstElementInThingByQuery('a.bylink', ASSERT), HTMLAnchorElement);
	navigateTo(a.href, { newWindow });
}

function followComments(newWindow = false, selected = getSelected()) {
	const a = assertElement(selected.getCommentsLink());
	navigateTo(a.href, { newWindow });
}

function vote(way: 'downmod' | 'upmod', preventToggle = false, selected = getSelected()) {
	const button = assertElement(way === 'upmod' ? selected.getUpvoteButton() : selected.getDownvoteButton());

	if (button.classList.contains('archived')) {
		// do nothing
	} else if (NoParticipation.isVotingBlocked()) {
		NoParticipation.notifyNoVote();
	} else if (!preventToggle || !button.classList.contains(way)) {
		click(button);
	}

	if (selected.isComment()) {
		if (module.options.onVoteCommentMoveDown.value) module.options.moveDownComment.callback();
	} else {
		if (module.options.onVoteMoveDown.value) module.options.moveDown.callback();
	}
}

function reply(selected = getSelected()) {
	if (selected.element.classList.contains('link') && isPageType('comments')) {
		// Reply to OP, but only if a reply form is available
		const $target = $('.usertext-edit textarea[name=text]:first');
		if ($target.filter(':visible').length) {
			$target.focus();
			return;
		}
	}

	click(assertElement(
		// User can reply directly here, so open/focus the reply form
		getFirstElementInThingByQuery('.buttons a[onclick*=reply]', NOASSERT, selected) ||
		// User cannot reply directly from this page, so go to where they can reply
		getFirstElementInThingByQuery('.buttons a.comments, .buttons a.bylink', NOASSERT, selected),
	));
}

function navigateTo(href, options: {| newWindow?: boolean, leaveNP?: boolean |}) {
	if (
		options.leaveNP &&
		Modules.isEnabled(NoParticipation) &&
		NoParticipation.module.options.escapeNP.value
	) {
		href = NoParticipation.nonNpLocation(href);
	}

	if (options.newWindow) {
		openNewTab(href, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = href;
	}
}

const goModePanel = once(() => {
	const goModes = getActiveCommandOptions()
		.filter(opt => opt.goMode)
		.map(opt => ({ key: i18n(opt.title), niceKeyCode: niceKeyCode(opt.value) }));

	return $(string.html`
		<div id="goModePanel" class="RESDialogSmall">
			<h3>Press a key to go:</h3>
			<div class="RESCloseButton RESCloseButtonTopRight"></div>
			<div class="RESDialogContents">
				<table>
					${goModes.map(({ niceKeyCode, key }) => string._html`
						<tr>
							<td>${niceKeyCode}</td>
							<td class="arrow">&rarr;</td>
							<td>${key}</td>
						</tr>
					`)}
				</table>
			</div>
		</div>
	`)
		.find('.RESCloseButton').click(toggleGoMode)
		.end();
});

let goModeActive = false;

function toggleGoMode() {
	goModeActive = !goModeActive;
	if (goModeActive) {
		$(document.body).on('keyup', handleGoModeEscapeKey);
		goModePanel().appendTo(document.body).fadeIn();
	} else {
		goModePanel().fadeOut();
		$(document.body).off('keyup', handleGoModeEscapeKey);
	}
}

function handleGoModeEscapeKey(event: KeyboardEvent) {
	if (event.key === NAMED_KEYS.Escape) {
		toggleGoMode();
	}
}

function moveDownFallback() {
	const bump = Modules.isRunning(NeverEndingReddit) &&
		(
			!SelectedThing.current ||
			[SelectedThing.current, undefined].includes(Thing.visibleThings().slice(-1)[0])
		);
	if (bump) NeverEndingReddit.loadNextPage({ scrollToLoadWidget: true });
}

function openLink(index, altMode = false) {
	const link = linkAnnotations[index] && linkAnnotations[index].link;
	if (!link) throw Error(`Link annotation ${index} is not available`);

	const expando = ShowImages.getLinkExpando(link);
	if (expando && (module.options.linkToggleExpando.value !== altMode)) {
		click(expando.button);
	} else if (SettingsNavigation.isSettingsUrl(link.href)) {
		SettingsNavigation.update(link);
	} else if (module.options.linkNewTab.value) {
		openNewTab(link.href, module.options.followLinkNewTabFocus.value);
	} else {
		location.href = link.href;
	}
}
