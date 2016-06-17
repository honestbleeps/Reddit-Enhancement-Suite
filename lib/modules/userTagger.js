import _ from 'lodash';
import userTaggerDialogTemplate from '../templates/userTaggerDialog.mustache';
import { $ } from '../vendor';
import * as Modules from '../core/modules';
import {
	Alert,
	CreateElement,
	Thing,
	click,
	forEachChunked,
	isCurrentSubreddit,
	isPageType,
	loggedInUser,
	string,
	watchForElement,
} from '../utils';
import { Storage, openNewTabs } from '../environment';
import * as CommandLine from './commandLine';
import * as Dashboard from './dashboard';
import * as KeyboardNav from './keyboardNav';
import * as NightMode from './nightMode';
import * as SelectedEntry from './selectedEntry';
import * as SettingsNavigation from './settingsNavigation';

export const module = {};

module.moduleID = 'userTagger';
module.moduleName = 'User Tagger';
module.category = 'Users';
module.description = 'Adds a great deal of customization around users - tagging them, ignoring them, and more. You can manage tagged users on <a href="/r/Dashboard/#userTaggerContents">Manage User Tags</a>.';
module.options = {
	/*
	defaultMark: {
		type: 'text',
		value: '_',
		description: 'clickable mark for users with no tag'
	},
	*/
	hardIgnore: {
		type: 'boolean',
		value: false,
		description: 'When "hard ignore" is off, only post titles and comment text is hidden. When it is on, the entire post is hidden (or for comments, collapsed).',
	},
	storeSourceLink: {
		type: 'boolean',
		value: true,
		description: 'By default, store a link to the link/comment you tagged a user on',
		advanced: true,
	},
	useCommentsLinkAsSource: {
		type: 'boolean',
		value: true,
		description: 'By default, store a link to the comments when tagging a user in a link post. Otherwise, the link (that the post refers to) will be used.',
		advanced: true,
	},
	colorUser: {
		type: 'boolean',
		value: true,
		description: 'Color users based on cumulative upvotes / downvotes',
		advanced: true,
	},
	vwNumber: {
		type: 'boolean',
		value: true,
		description: 'Show the number (i.e. [+6]) rather than [vw]',
		advanced: true,
		dependsOn: 'colorUser',
	},
	vwTooltip: {
		type: 'boolean',
		value: true,
		description: 'Show the vote weight tooltip on hover (i.e. "your votes for...")',
		advanced: true,
		dependsOn: 'colorUser',
	},
};

export const usernameRE = /(?:u|user)\/([\w\-]+)/;

export let tags = {};

let $tagger;

module.beforeLoad = async function() {
	tags = await Storage.get('RESmodules.userTagger.tags') || {};
};

module.go = function() {
	// If we're on the dashboard, add a tab to it...
	if (isCurrentSubreddit('dashboard')) {
		// add tab to dashboard
		Dashboard.addTab('userTaggerContents', 'My User Tags');
		// populate the contents of the tab
		const $showDiv = $('<div class="show">Show </div>');
		const $tagFilter = $('<select id="tagFilter"><option>tagged users</option><option>all users</option></select>');
		$($showDiv).append($tagFilter);
		$('#userTaggerContents').append($showDiv);
		$('#tagFilter').change(() => drawUserTagTable());

		const tagsPerPage = parseInt(Dashboard.module.options.tagsPerPage.value, 10);
		if (tagsPerPage) {
			const controlWrapper = document.createElement('div');
			controlWrapper.id = 'tagPageControls';
			controlWrapper.page = 1;
			controlWrapper.pageCount = 1;

			const leftButton = document.createElement('a');
			leftButton.className = 'res-step noKeyNav';
			leftButton.addEventListener('click', () => {
				if (controlWrapper.page === 1) {
					controlWrapper.page = controlWrapper.pageCount;
				} else {
					controlWrapper.page--;
				}
				drawUserTagTable();
			});
			$(controlWrapper).append('Page ');
			controlWrapper.appendChild(leftButton);

			const posLabel = document.createElement('span');
			posLabel.className = 'res-step-progress';
			posLabel.textContent = '1 of 2';
			controlWrapper.appendChild(posLabel);

			const rightButton = document.createElement('a');
			rightButton.className = 'res-step res-step-reverse noKeyNav';
			rightButton.addEventListener('click', () => {
				if (controlWrapper.page === controlWrapper.pageCount) {
					controlWrapper.page = 1;
				} else {
					controlWrapper.page++;
				}
				drawUserTagTable();
			});
			controlWrapper.appendChild(rightButton);

			$('#userTaggerContents').append(controlWrapper);
		}
		const $thisTable = $(`
			<table id="userTaggerTable">
				<thead>
					<tr>
						<th sort="username" class="active">Username <span class="sortAsc"></span></th>
						<th sort="tag">Tag</th>
						<th sort="ignore">Ignored</th>
						<th sort="color">Color</th>
						<th sort="votes">Vote Weight</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		`);

		$('#userTaggerContents').append($thisTable);
		$('#userTaggerTable thead th').click(function(e) {
			e.preventDefault();
			const $this = $(this);

			if ($this.hasClass('delete')) {
				return false;
			}
			if ($this.hasClass('active')) {
				$this.toggleClass('descending');
			}
			$this.addClass('active');
			$this.siblings().removeClass('active').find('SPAN').remove();
			$this.find('.sortAsc, .sortDesc').remove();
			$this.append($(e.target).hasClass('descending') ?
				'<span class="sortDesc" />' :
				'<span class="sortAsc" />');
			drawUserTagTable($(e.target).attr('sort'), $(e.target).hasClass('descending'));
		});
		drawUserTagTable();
	}

	if (this.options.colorUser.value && loggedInUser()) {
		attachVoteHandler();
	}

	addTagger();

	applyTags();

	if (isPageType('comments')) {
		watchForElement('newComments', applyTags);
	} else {
		watchForElement('siteTable', applyTags);
	}

	registerCommandLine();
};

function addTagger() {
	// Create tagger
	const colors = Object.entries(bgToTextColorMap)
		.map(([color, textColor]) => ({
			textColor,
			bgColor: (color === 'none') ? 'transparent' : color,
			color,
		}));

	$tagger = $(userTaggerDialogTemplate({ colors })).appendTo(document.body);

	// Add generated elements.
	const icons = ignoreIcons();
	const ignoreToggleButton = CreateElement.toggleButton(undefined, 'userTaggerIgnore', false, icons.normal, icons.ignored);
	ignoreToggleButton.classList.add('reverseToggleButton');
	const ignoreSettingsLink = SettingsNavigation.makeUrlHashLink(module.moduleID, 'hardIgnore', ' configure ', 'gearIcon');

	$tagger.find('.res-usertag-ignore').append(ignoreToggleButton, ignoreSettingsLink);

	// Add event listeners.
	$tagger.find('#userTaggerTag')
		.on('keyup', updateTagPreview)
		.on('keydown', e => {
			if (e.keyCode === 27) {
				// close on ESC key.
				closeUserTagPrompt();
			}
		});
	$tagger.find('#userTaggerColor').on('change', updateTagPreview);
	$tagger.find('#userTaggerLink').on('keyup', updateOpenLink);
	$tagger.find('.userTaggerOpenLink a').on('click', e => {
		e.preventDefault();
		const links = $('#userTaggerLink').val().split(/\s/);
		openNewTabs('none', ...links);
	});
	$tagger.find('#userTaggerSave').on('click', e => {
		e.preventDefault();
		saveTagForm();
	});
	$tagger.find('#userTaggerClose').on('click', closeUserTagPrompt);
	$tagger.find('form').on('submit', e => {
		e.preventDefault();
		saveTagForm();
	});
}

function registerCommandLine() {
	CommandLine.registerCommand('tag', 'tag [text] - tags author of currently selected link/comment as text',
		(command, val) => {
			const tagLink = getAuthorTagLink();
			if (tagLink) {
				let str = `tag user ${tagLink.getAttribute('username')}`;
				if (val) {
					str += ` as: ${val}`;
				}
				return str;
			} else {
				return 'can\'t set tag - no post/comment selected';
			}
		},
		(command, val) => {
			const tagLink = getAuthorTagLink();
			if (tagLink) {
				click(tagLink);
				setTimeout(() => {
					if (val !== '') {
						document.getElementById('userTaggerTag').value = val;
					}
				}, 20);
			} else {
				return 'can\'t set tag - no post/comment selected';
			}
		}
	);

	function getAuthorTagLink() {
		const selected = SelectedEntry.selectedThing();
		const searchArea = selected ? selected.entry : document.body;

		return searchArea.querySelector('a.userTagLink');
	}
}

function attachVoteHandler() {
	// hand-rolled delegated listener because jQuery doesn't support useCapture
	// which is necessary so we run before reddit's handler
	document.body.addEventListener('click', e => {
		const $target = $(e.target);
		if ($target.is('.arrow')) {
			handleVoteClick($target);
		}
	}, true);
}

function handleVoteClick($this) {
	const $otherArrow = $this.siblings('.arrow');
	const thing = new Thing($this);
	let thisAuthor = thing.getAuthor();

	// Stop if the post is archived (unvotable) or you are voting on your own post/comment/etc.
	if ($this.hasClass('archived') || !thisAuthor || thisAuthor === loggedInUser()) {
		return;
	}

	const thisVWobj = $(thing.getAuthorElement()).nextAll('.voteWeight')[0];

	thisAuthor = thisAuthor.toLowerCase();
	tags[thisAuthor] = tags[thisAuthor] || {};

	let votes = parseInt(tags[thisAuthor].votes, 10) || 0;

	// there are 6 possibilities here:
	// 1) no vote yet, click upmod
	// 2) no vote yet, click downmod
	// 3) already upmodded, undoing
	// 4) already downmodded, undoing
	// 5) upmodded before, switching to downmod
	// 6) downmodded before, switching to upmod

	// classes are changed AFTER this event is triggered
	if ($this.hasClass('up')) {
		// adding an upvote
		votes++;
		if ($otherArrow.hasClass('downmod')) {
			// also removing a downvote
			votes++;
		}
	} else if ($this.hasClass('upmod')) {
		// removing an upvote directly
		votes--;
	} else if ($this.hasClass('down')) {
		// adding a downvote
		votes--;
		if ($otherArrow.hasClass('upmod')) {
			// also removing an upvote
			votes--;
		}
	} else if ($this.hasClass('downmod')) {
		// removing a downvote directly
		votes++;
	}

	tags[thisAuthor].votes = votes;
	Storage.patch('RESmodules.userTagger.tags', { [thisAuthor]: { votes } });

	colorUser(thisVWobj, thisAuthor, tags[thisAuthor].votes);
}

let currentSortMethod, isDescending;

function drawUserTagTable(sortMethod, descending) {
	currentSortMethod = sortMethod || currentSortMethod;
	isDescending = (typeof descending === 'undefined' || descending === null) ? isDescending : descending;
	const taggedUsers = [];
	const filterType = $('#tagFilter').val();
	for (const tagIndex in tags) {
		if (filterType === 'tagged users') {
			if (typeof tags[tagIndex].tag !== 'undefined') {
				taggedUsers.push(tagIndex);
			}
		} else {
			taggedUsers.push(tagIndex);
		}
	}
	switch (currentSortMethod) {
		case 'tag':
			taggedUsers.sort((a, b) => {
				const tagA = (typeof tags[a].tag === 'undefined') ? 'zzzzz' : tags[a].tag.toLowerCase();
				const tagB = (typeof tags[b].tag === 'undefined') ? 'zzzzz' : tags[b].tag.toLowerCase();
				return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
			});
			if (isDescending) {
				taggedUsers.reverse();
			}
			break;
		case 'ignore':
			taggedUsers.sort((a, b) => {
				const tagA = (typeof tags[a].ignore === 'undefined') ? 'z' : 'a';
				const tagB = (typeof tags[b].ignore === 'undefined') ? 'z' : 'a';
				return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : 0;
			});
			if (isDescending) {
				taggedUsers.reverse();
			}
			break;
		case 'color':
			taggedUsers.sort((a, b) => {
				const colorA = (typeof tags[a].color === 'undefined') ? 'zzzzz' : tags[a].color.toLowerCase();
				const colorB = (typeof tags[b].color === 'undefined') ? 'zzzzz' : tags[b].color.toLowerCase();
				return (colorA > colorB) ? 1 : (colorB > colorA) ? -1 : 0;
			});
			if (isDescending) {
				taggedUsers.reverse();
			}
			break;
		case 'votes':
			taggedUsers.sort((a, b) => {
				const tagA = (typeof tags[a].votes === 'undefined') ? 0 : tags[a].votes;
				const tagB = (typeof tags[b].votes === 'undefined') ? 0 : tags[b].votes;
				return (tagA > tagB) ? 1 : (tagB > tagA) ? -1 : (a.toLowerCase() > b.toLowerCase());
			});
			if (isDescending) {
				taggedUsers.reverse();
			}
			break;
		case 'username':
			/* falls through */
		default:
			// sort users, ignoring case
			taggedUsers.sort((a, b) =>
				(a.toLowerCase() > b.toLowerCase()) ? 1 : (b.toLowerCase() > a.toLowerCase()) ? -1 : 0
			);
			if (isDescending) {
				taggedUsers.reverse();
			}
			break;
	}
	$('#userTaggerTable tbody').html('');
	const tagsPerPage = parseInt(Dashboard.module.options.tagsPerPage.value, 10);
	const count = taggedUsers.length;
	let start = 0;
	let end = count;

	if (tagsPerPage) {
		const $tagControls = $('#tagPageControls');
		let page = $tagControls.prop('page');
		const pages = Math.ceil(count / tagsPerPage);
		page = Math.min(page, pages);
		page = Math.max(page, 1);
		$tagControls.prop('page', page).prop('pageCount', pages);
		$tagControls.find('.res-step-progress').text(`${page} of ${pages}`);
		start = tagsPerPage * (page - 1);
		end = Math.min(count, tagsPerPage * page);
	}

	const icons = ignoreIcons();

	taggedUsers
		.slice(start, end)
		.forEach((thisUser, userIndex) => {
			const thisTag = (typeof tags[thisUser].tag === 'undefined') ? '' : tags[thisUser].tag;
			const thisVotes = (typeof tags[thisUser].votes === 'undefined') ? 0 : tags[thisUser].votes;
			const thisColor = (typeof tags[thisUser].color === 'undefined') ? '' : tags[thisUser].color;
			const thisIgnore = (typeof tags[thisUser].ignore === 'undefined') ? icons.normal : icons.ignored;

			const userTagLink = document.createElement('a');
			if (thisTag === '') {
				// thisTag = '<div class="RESUserTagImage"></div>';
				userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
			} else {
				userTagLink.setAttribute('class', 'userTagLink hasTag');
			}
			$(userTagLink).text(thisTag);
			if (thisColor) {
				const bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
				userTagLink.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[thisColor]} !important;`);
			}
			userTagLink.setAttribute('username', thisUser);
			userTagLink.setAttribute('title', 'set a tag');
			userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
			userTagLink.addEventListener('click', function(e) {
				e.preventDefault();
				openUserTagPrompt(e.target, this.getAttribute('username'));
			}, true);

			$('#userTaggerTable tbody').append(`
			    <tr>
			        <td>
			            <span class="res-icon res-right deleteIcon" data-icon="&#xf056;" user="${thisUser}"></span>
			            <a class="author" href="/user/${thisUser}">${thisUser}</a>
                    </td>
                    <td id="tag_${userIndex}"></td>
                    <td id="ignore_${userIndex}">${thisIgnore.outerHTML/* safe: generated in utils/createElement.js */}</td>
                    <td><span style="color: ${thisColor}">${thisColor}</span></td>
                    <td>${thisVotes}</td>
                </tr>
            `);

			$(`#tag_${userIndex}`).append(userTagLink);
		});
	$('#userTaggerTable tbody .deleteIcon').click(function() {
		const thisUser = $(this).attr('user').toLowerCase();
		const $button = $(this);
		Alert.open(`Are you sure you want to delete the tag for user: ${thisUser}?`,
			() => {
				delete tags[thisUser];
				Storage.deletePath('RESmodules.userTagger.tags', thisUser);
				$button.closest('tr').remove();
			}
		);
	});
}

function ignoreIcons() {
	return {
		ignored: CreateElement.icon('F038'),
		normal: CreateElement.icon('F03B'),
	};
}

function saveTagForm() {
	const thisName = document.getElementById('userTaggerName').value;
	const thisTag = document.getElementById('userTaggerTag').value;
	const thisColor = document.getElementById('userTaggerColor').value;
	const thisIgnore = document.getElementById('userTaggerIgnore').checked;
	const thisLink = document.getElementById('userTaggerLink').value;
	const thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value, 10) || 0;
	setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
}

const bgToTextColorMap = {
	none: 'inherit',
	aqua: 'black',
	black: 'white',
	blue: 'white',
	cornflowerblue: 'white',
	fuchsia: 'white',
	pink: 'black',
	gray: 'white',
	green: 'white',
	lime: 'black',
	maroon: 'white',
	navy: 'white',
	olive: 'white',
	orange: 'white',
	orangered: 'white',
	purple: 'white',
	red: 'white',
	silver: 'black',
	teal: 'white',
	white: 'black',
	yellow: 'black',
};

let clickedTag;

function openUserTagPrompt(obj, username) {
	username = username.toLowerCase();
	clickedTag = obj;
	$tagger.find('h3 span:last-of-type').text(username);
	document.getElementById('userTaggerName').value = username;
	if (typeof tags[username] !== 'undefined') {
		if (typeof tags[username].link !== 'undefined') {
			document.getElementById('userTaggerLink').value = tags[username].link;
		} else {
			document.getElementById('userTaggerLink').value = '';
		}
		if (typeof tags[username].tag !== 'undefined') {
			document.getElementById('userTaggerTag').value = tags[username].tag;
		} else {
			document.getElementById('userTaggerTag').value = '';
			if (typeof tags[username].link === 'undefined') {
				// since we haven't yet set a tag or a link for this user, auto populate a link for the
				// user based on where we are tagging from.
				setLinkBasedOnTagLocation(obj);
			}
		}
		const ignored = typeof tags[username].ignore !== 'undefined' ? tags[username].ignore : false;
		document.getElementById('userTaggerIgnore').checked = ignored;
		document.getElementById('userTaggerIgnoreContainer').classList.toggle('enabled', ignored);
		if (typeof tags[username].votes !== 'undefined') {
			document.getElementById('userTaggerVoteWeight').value = tags[username].votes;
		} else {
			document.getElementById('userTaggerVoteWeight').value = '';
		}
		if (typeof tags[username].color !== 'undefined') {
			$('#userTaggerColor').val(tags[username].color);
		} else {
			document.getElementById('userTaggerColor').selectedIndex = 0;
		}
	} else {
		document.getElementById('userTaggerTag').value = '';
		document.getElementById('userTaggerIgnore').checked = false;
		document.getElementById('userTaggerIgnoreContainer').classList.remove('enabled');
		document.getElementById('userTaggerVoteWeight').value = '';
		document.getElementById('userTaggerLink').value = '';
		if (module.options.storeSourceLink.value) {
			setLinkBasedOnTagLocation(obj);
		}
		document.getElementById('userTaggerColor').selectedIndex = 0;
	}

	setTaggerPosition();

	document.getElementById('userTaggerTag').focus();
	updateOpenLink();
	updateTagPreview();
	return false;
}

function setLinkBasedOnTagLocation(obj) {
	const closestEntry = $(obj).closest('.entry');
	let linkTitle = '';
	if (!module.options.useCommentsLinkAsSource.value) {
		linkTitle = $(closestEntry).find('a.title');
	}
	// if we didn't find anything, try a new search (works on inbox)
	if (!linkTitle.length) {
		linkTitle = $(closestEntry).find('a.bylink');
	}
	if (linkTitle.length) {
		document.getElementById('userTaggerLink').value = $(linkTitle).attr('href');
	} else {
		const permaLink = $(closestEntry).find('.flat-list.buttons li.first a');
		if (permaLink.length) {
			document.getElementById('userTaggerLink').value = $(permaLink).attr('href');
		}
	}
}

function updateTagPreview() {
	const bgcolor = $('#userTaggerColor option:selected').val();
	$('#userTaggerPreview')
		.text($('#userTaggerTag').val())
		.css({
			backgroundColor: (bgcolor === 'none') ? 'transparent' : bgcolor,
			color: bgToTextColorMap[bgcolor],
		});
}

function updateOpenLink(e) {
	const $link = $tagger.find('.userTaggerOpenLink a');
	const el = e ? e.target : $('#userTaggerLink');
	if ($(el).val().length > 0) {
		$link.attr('href', $(el).val().split(/\s/)[0]);
	} else {
		$link.removeAttr('href');
	}
}

function setTaggerPosition() {
	const { top, left } = $(clickedTag).offset();
	const right = document.body.clientWidth - left;

	$tagger.css({ top });
	$tagger.show();

	if (left < right) {
		$tagger.css({ right: 'auto', left });
	} else {
		$tagger.css({ right, left: 'auto' });
	}
}

function closeUserTagPrompt() {
	$tagger.hide();
	if (Modules.isRunning(KeyboardNav)) {
		// remove focus from any input fields from the prompt so that keyboard navigation works again...
		$tagger.find('input, button').blur();
	}
}

function setUserTag(username, tag, color, ignore, link, votes, noclick) {
	username = username.toLowerCase();
	if (((tag !== null) && (tag !== '')) || (ignore)) {
		if (tag === '') {
			tag = 'ignored';
		}
		if (typeof tags[username] === 'undefined') {
			tags[username] = {};
		}
		tags[username].tag = tag;
		tags[username].link = link;
		tags[username].color = color;
		const bgColor = (color === 'none') ? 'transparent' : color;
		if (ignore) {
			tags[username].ignore = true;
		} else {
			delete tags[username].ignore;
		}
		if (!noclick) {
			clickedTag.setAttribute('class', 'userTagLink hasTag');
			clickedTag.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[color]} !important;`);
			$(clickedTag).text(tag);
		}
	} else {
		if (typeof tags[username] !== 'undefined') {
			delete tags[username].tag;
			delete tags[username].color;
			delete tags[username].link;
			if (tags[username].tag === 'ignored') {
				delete tags[username].tag;
			}
			delete tags[username].ignore;
		}
		if (!noclick) {
			clickedTag.setAttribute('style', 'background-color: transparent');
			clickedTag.setAttribute('class', 'userTagLink RESUserTagImage');
			$(clickedTag).html('');
		}
	}

	if (typeof tags[username] !== 'undefined') {
		tags[username].votes = (isNaN(votes)) ? 0 : votes;
	}
	if (!noclick) {
		const thisVW = clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
		if (thisVW) {
			colorUser(thisVW, username, votes);
		}
	}
	if (_.isEmpty(tags[username])) {
		delete tags[username];
		Storage.deletePath('RESmodules.userTagger.tags', username);
	} else {
		// Always need to delete the tag so deleted fields are removed
		Storage.deletePath('RESmodules.userTagger.tags', username);
		Storage.patch('RESmodules.userTagger.tags', { [username]: tags[username] });
	}
	closeUserTagPrompt();
}

export const usernameSelector = '.contents .author, .noncollapsed a.author, p.tagline a.author, #friend-table span.user a, .sidecontentbox .author, div.md a[href^="/u/"]:not([href*="/m/"]), div.md a[href*="reddit.com/u/"]:not([href*="/m/"]), .usertable a.author, .usertable span.user a, div.wiki-page-content .author, .commentingAsUser';

function applyTags(ele = document) {
	const authors = ele.querySelectorAll(usernameSelector);
	authors::forEachChunked(e => applyTagToAuthor(e));
}

export function applyTagToAuthor(thisAuthorObj, noEdit) {
	const userObject = [];

	if (thisAuthorObj && !thisAuthorObj.classList.contains('userTagged')) {
		let thisAuthor;
		if (thisAuthorObj.href) {
			const test = thisAuthorObj.href.match(usernameRE);
			if (test) {
				thisAuthor = test[1];
			} else {
				return console.error(`Regex failed on ${thisAuthorObj.href}, returning.`);
			}
		} else if (thisAuthorObj.getAttribute('data-user')) {
			thisAuthor = thisAuthorObj.getAttribute('data-user');
		} else {
			thisAuthor = thisAuthorObj.innerText;
		}
		// const thisAuthor = thisAuthorObj.text;
		let noTag = false;
		if ((thisAuthor) && (thisAuthor.substr(0, 3) === '/u/')) {
			noTag = true;
			thisAuthor = thisAuthor.substr(3);
		}
		thisAuthor = thisAuthor.toLowerCase();
		if (!noTag) {
			thisAuthorObj.classList.add('userTagged');
			let thisVotes = 0;
			let thisTag = null;
			let thisColor = null;
			let thisIgnore = null;
			if (typeof userObject[thisAuthor] === 'undefined') {
				if (tags && tags[thisAuthor]) {
					if (typeof tags[thisAuthor].votes !== 'undefined') {
						thisVotes = parseInt(tags[thisAuthor].votes, 10);
					}
					if (typeof tags[thisAuthor].tag !== 'undefined') {
						thisTag = tags[thisAuthor].tag;
					}
					if (typeof tags[thisAuthor].color !== 'undefined') {
						thisColor = tags[thisAuthor].color;
					}
					if (typeof tags[thisAuthor].ignore !== 'undefined') {
						thisIgnore = tags[thisAuthor].ignore;
					}
				}
				userObject[thisAuthor] = {
					tag: thisTag,
					color: thisColor,
					ignore: thisIgnore,
					votes: thisVotes,
				};
			}

			const userTagFrag = document.createDocumentFragment();

			if (thisTag || !noEdit) {
				const userTagLink = document.createElement('a');
				if (!thisTag) {
					thisTag = '';
					userTagLink.setAttribute('class', 'userTagLink RESUserTagImage');
				} else {
					userTagLink.setAttribute('class', 'userTagLink hasTag');
				}
				$(userTagLink).text(thisTag);
				if (thisColor) {
					const bgColor = (thisColor === 'none') ? 'transparent' : thisColor;
					userTagLink.setAttribute('style', `background-color: ${bgColor}; color: ${bgToTextColorMap[thisColor]} !important;`);
				}
				if (!noEdit) {
					userTagLink.setAttribute('username', thisAuthor);
					userTagLink.setAttribute('title', 'set a tag');
					userTagLink.setAttribute('href', 'javascript:void 0'); // eslint-disable-line no-script-url
					userTagLink.addEventListener('click', function(e) {
						e.preventDefault();
						openUserTagPrompt(e.target, this.getAttribute('username'));
					}, true);
				}
				const userTag = document.createElement('span');
				userTag.classList.add('RESUserTag');
				// const lp = document.createTextNode(' (');
				// const rp = document.createTextNode(')');
				userTag.appendChild(userTagLink);
				// userTagFrag.appendChild(lp);
				userTagFrag.appendChild(userTag);
				// userTagFrag.appendChild(rp);
				if (!noEdit) {
					if (module.options.colorUser.value) {
						const userVoteFrag = document.createDocumentFragment();
						const spacer = document.createTextNode(' ');
						userVoteFrag.appendChild(spacer);
						const userVoteWeight = document.createElement('a');
						userVoteWeight.setAttribute('href', '#');
						userVoteWeight.setAttribute('class', 'voteWeight');
						$(userVoteWeight).text('[vw]');
						userVoteWeight.addEventListener('click', function(e) {
							e.preventDefault();
							const theTag = this.parentNode.querySelector('.userTagLink');
							openUserTagPrompt(theTag, theTag.getAttribute('username'));
						}, true);
						colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
						userVoteFrag.appendChild(userVoteWeight);
						userTagFrag.appendChild(userVoteFrag);
					}
				}
				$(thisAuthorObj).after(userTagFrag);
				if (!noEdit) {
					thisIgnore = userObject[thisAuthor].ignore && thisAuthorObj.classList.contains('author');
					if (thisIgnore && !isPageType('profile')) {
						if (module.options.hardIgnore.value) {
							if (isPageType('comments')) {
								const thisComment = ignoreComment(thisAuthorObj, thisAuthor);
								if (thisComment) {
									// collapse comment as well
									const toggle = thisComment.parentNode.querySelector('a.expand');
									click(toggle);
								}
							} else {
								const thisPost = $(thisAuthorObj).closest('.thing').get(0);

								if (thisPost) {
									// hide post block first...
									thisPost.style.display = 'none';
									// hide associated voting block...
									if (thisPost.previousSibling) {
										thisPost.previousSibling.style.display = 'none';
									}
								}
							}
						} else if (isPageType('comments')) {
							// ignore comment
							ignoreComment(thisAuthorObj, thisAuthor);
						} else {
							let $thisPost;
							if (isPageType('inbox')) {
								const $thisMessage = $(thisAuthorObj).closest('.thing');
								$thisPost = $thisMessage.find('.md');

								// If message, ignore message title also
								if (!$thisMessage.is('.was-comment')) {
									$thisMessage.find('.subject').text('Ignored message');
								}
							} else {
								$thisPost = $(thisAuthorObj).closest('.thing').find('p.title');
							}
							const thisPost = $thisPost[0];

							if (thisPost) {
								const showLink = document.createElement('a');
								showLink.textContent = 'show anyway?';
								showLink.setAttribute('href', '#');
								showLink.addEventListener('click', function(e) {
									$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserPost').addClass('md');
									e.preventDefault();
								});
								thisPost.setAttribute('data-original', thisPost.innerHTML);
								thisPost.textContent = `${thisAuthor} is an ignored user. `;
								thisPost.appendChild(showLink);

								thisPost.setAttribute('class', 'ignoredUserPost');
							}
						}
					}
				}
			}
		}
	}
}

function ignoreComment(thisAuthorObj, thisAuthor) {
	const thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
	if (thisComment) {
		const showLink = document.createElement('a');
		showLink.textContent = 'show anyway?';
		showLink.setAttribute('href', '#');
		showLink.addEventListener('click', function(e) {
			$(this).parent().html($(this).parent().attr('data-original')).removeClass('ignoredUserComment');
			e.preventDefault();
		});
		// store original
		thisComment.setAttribute('data-original', thisComment.innerHTML);
		// remove comment
		thisComment.textContent = `${thisAuthor} is an ignored user.`;
		thisComment.appendChild(showLink);
		thisComment.classList.add('ignoredUserComment');
		return thisComment;
	}
	return false;
}

function colorUser(obj, author, votes) {
	if (module.options.colorUser.value) {
		votes = parseInt(votes, 10);
		let red = 255;
		let green = 255;
		let blue = 255;
		let voteString = '+';
		if (votes > 0) {
			red = Math.max(0, (255 - (8 * votes)));
			green = 255;
			blue = Math.max(0, (255 - (8 * votes)));
		} else if (votes < 0) {
			red = 255;
			green = Math.max(0, (255 - Math.abs(8 * votes)));
			blue = Math.max(0, (255 - Math.abs(8 * votes)));
			voteString = '';
		}
		voteString += votes;
		const rgb = `rgb(${red}, ${green}, ${blue})`;
		if (obj !== null) {
			if (votes === 0) {
				obj.style.display = 'none';
			} else {
				obj.style.display = 'inline';
				if (NightMode.isNightModeOn()) {
					obj.style.color = rgb;
				} else {
					obj.style.backgroundColor = rgb;
				}
				if (module.options.vwNumber.value) {
					obj.textContent = `[${voteString}]`;
				}
				if (module.options.vwTooltip.value) {
					obj.setAttribute('title', string.escapeHTML`your votes for ${author}: ${voteString}`);
				}
			}
		}
	}
}

export function ignoreUser(username, ignore) {
	const thisName = username.toLowerCase();
	const thisIgnore = ignore !== false;
	let thisColor, thisLink, thisVotes, thisTag;
	if (tags && tags[thisName]) {
		thisColor = tags[thisName].color || '';
		thisLink = tags[thisName].link || '';
		thisVotes = tags[thisName].votes || 0;
		thisTag = tags[thisName].tag || '';
	}
	if ((thisIgnore) && (thisTag === '')) {
		thisTag = 'ignored';
	} else if ((!thisIgnore) && (thisTag === 'ignored')) {
		thisTag = '';
	}
	setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true /* noclick */);
}
