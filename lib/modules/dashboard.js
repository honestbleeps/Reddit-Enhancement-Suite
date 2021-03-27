/* @flow */

import $ from 'jquery';
import { once } from 'lodash-es';
import { Sortable } from '../vendor';
import { Module } from '../core/module';
import {
	Alert,
	CreateElement,
	addDashboardTab,
	formatDateTime,
	loggedInUser,
	string,
	registerPage,
	isAppType,
} from '../utils';
import { i18n, Storage, ajax } from '../environment';
import * as Menu from './menu';
import * as Notifications from './notifications';

export const module: Module<*> = new Module('dashboard');

module.moduleName = 'dashboardName';
module.category = 'productivityCategory';
module.description = 'dashboardDesc';
module.options = {
	menuItem: {
		type: 'boolean',
		value: true,
		description: 'dashboardMenuItemDesc',
		title: 'dashboardMenuItemTitle',
	},
	defaultPosts: {
		type: 'text',
		value: '3',
		description: 'dashboardDefaultPostsDesc',
		title: 'dashboardDefaultPostsTitle',
		advanced: true,
	},
	defaultSort: {
		type: 'enum',
		values: [{
			name: 'hot',
			value: 'hot',
		}, {
			name: 'new',
			value: 'new',
		}, {
			name: 'rising',
			value: 'rising',
		}, {
			name: 'controversial',
			value: 'controversial',
		}, {
			name: 'top',
			value: 'top',
		}],
		value: 'hot',
		description: 'dashboardDefaultSortDesc',
		title: 'dashboardDefaultSortTitle',
	},
	defaultSortSearch: {
		type: 'enum',
		values: [{
			name: 'relevance',
			value: 'relevance',
		}, {
			name: 'top',
			value: 'top',
		}, {
			name: 'new',
			value: 'new',
		}, {
			name: 'comments',
			value: 'comments',
		}],
		value: 'relevance',
		description: 'dashboardDefaultSortSearchDesc',
		title: 'dashboardDefaultSortSearchTitle',
	},
	dashboardShortcut: {
		type: 'boolean',
		value: true,
		description: 'dashboardDashboardShortcutDesc',
		title: 'dashboardDashboardShortcutTitle',
	},
};

// depends on loggedInUser; must be called after the username is available
const initialWidgetLoad = once(getLatestWidgets);

module.beforeLoad = () => {
	if (module.options.menuItem.value) {
		const dashboardUrl = isAppType('d2x') ? 'https://old.reddit.com/r/Dashboard' : '/r/Dashboard';
		Menu.addMenuItem(
			() => string.html`<a href="${dashboardUrl}">${i18n('myDashboard')}</a>`,
			undefined,
			-7,
		);
	}
};

module.contentStart = () => {
	addDashboardTab('dashboardContents', 'My dashboard', module.moduleID, addDashboardFunctionality);

	if (module.options.dashboardShortcut.value) {
		CreateElement.sidebarSubscribeButtonWrappers().forEach(wrapper => {
			const button = createSubredditToggleButton(wrapper.getAttribute('subreddit'));
			initialWidgetLoad().then(() => button.dispatchEvent(new CustomEvent('refresh')));
			button.classList.add('RESDashboardToggle'); // custom subreddit styles uses this
			wrapper.append(button);
		});
	}
};

const MAX_ROWS = 100;

const dashboardStorage = Storage.wrap(() => `RESmodules.dashboard.${loggedInUser() || 'null'}`, ([]: Array<*>));

type WidgetOptions = {|
	basePath: string,
	displayName?: string,
	numPosts?: number,
	sortBy?: string,
	sortSearchBy?: string,
	minimized?: boolean,
|};

export let widgets: Array<WidgetOptions> = [];

async function getLatestWidgets() {
	widgets = (await dashboardStorage.get())
		// A bug causes widgets to be inproperly saved in unknown circumstances; these must be ignored
		.filter(Boolean);
}

async function addDashboardFunctionality(tabPage) {
	await initialWidgetLoad();
	attachAddComponent($(tabPage));
	attachEditComponent();
	initUpdateQueue();
}

function initUpdateQueue() {
	for (const widget of widgets) {
		if (widget) addWidget(widget);
	}

	Sortable.create(document.querySelector('#RESDashboard'), {
		handle: 'div.RESDashboardComponentHeader',
		onChange: () => saveOrder(),
	});
}

const updateQueue = [];
let updateQueueTimer;

function addToUpdateQueue(updateFunction) {
	updateQueue.push(updateFunction);
	if (!updateQueueTimer) {
		updateQueueTimer = setInterval(processUpdateQueue, 2000);
		setTimeout(processUpdateQueue, 100);
	}
}

function processUpdateQueue() {
	const thisUpdate = updateQueue.pop();
	thisUpdate();
	if (updateQueue.length < 1) {
		clearInterval(updateQueueTimer);
		updateQueueTimer = undefined;
	}
}

function saveOrder() {
	const data = $('#siteTable li.RESDashboardComponent').toArray().map(e => $(e).attr('id'));
	data.reverse();
	const newOrder = [];
	for (const widget of widgets) {
		const newIndex = data.indexOf(widget.basePath.replace(/(\/|\+)/g, '_'));
		newOrder[newIndex] = widget;
	}
	widgets = newOrder;
	dashboardStorage.set(widgets);
}

let widgetBeingEdited;

function attachEditComponent() {
	const $dashboardEditComponent = $('<div id="RESDashboardEditComponent" class="RESDashboardComponent" />');
	$dashboardEditComponent.html(`
		<div class="editWidget">Edit widget</div>
		<div id="editRedditFormContainer" class="editRedditForm">
			<form id="editRedditForm">
				<input type="text" id="editReddit" placeholder="subreddit / multireddit">
				<input type="text" id="editRedditDisplayName" placeholder="display name (e.g. stuff)">
				<input type="submit" class="updateButton" value="save changes">
				<input type="cancel" class="cancelButton" value="cancel">
			</form>
			<form id="editSearchForm">
				<input type="text" id="editSearch" placeholder="search terms">
				<input type="text" id="editSearchDisplayName" placeholder="display name (e.g. stuff)">
				<input type="submit" class="updateButton" value="save changes">
				<input type="cancel" class="cancelButton" value="cancel">
			</form>
		</div>
	`);

	$dashboardEditComponent.find('#editRedditForm').get(0).addEventListener('submit', e => {
		e.preventDefault();
		let thisBasePath = $('#editReddit').val();
		if (thisBasePath !== '') {
			thisBasePath = thisBasePath.replace(/,|\s/g, '+');
			widgetBeingEdited.formerBasePath = widgetBeingEdited.basePath;
			widgetBeingEdited.basePath = `/r/${thisBasePath}`;
			widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
			widgetBeingEdited.update();
			$('#RESDashboardEditComponent').fadeOut(() => $('#editReddit').blur());
			widgetBeingEdited.widgetEle.find('.widgetPath').text(widgetBeingEdited.displayName).attr('title', `/r/${thisBasePath}`);
			updateWidget();
		}
	});
	$dashboardEditComponent.find('#editSearchForm').get(0).addEventListener('submit', e => {
		e.preventDefault();
		const thisBasePath = $('#editSearch').val();
		widgetBeingEdited.formerBasePath = widgetBeingEdited.basePath;
		widgetBeingEdited.basePath = string.encode`/search?q=${thisBasePath}`;
		widgetBeingEdited.displayName = $('#editSearchDisplayName').val();
		widgetBeingEdited.update();
		$('#RESDashboardEditComponent').fadeOut(() => {
			$('#editSearch').val('').blur();
			$('#editSearchDisplayName').val('').blur();
		});
		widgetBeingEdited.widgetEle.find('.widgetPath').text(widgetBeingEdited.displayName).attr('title', thisBasePath);
		updateWidget();
	});
	$dashboardEditComponent.find('.cancelButton').click(() => {
		if (widgetBeingEdited.basePath.startsWith('/search?q=')) {
			$('#RESDashboardEditComponent').fadeOut(() => $('#editSearchDisplayName').val('').blur());
		} else {
			$('#RESDashboardEditComponent').fadeOut(() => $('#editReddit').blur());
		}
	});
	$(document.body).append($dashboardEditComponent);
}

function showEditForm() {
	const basePath = widgetBeingEdited.basePath;
	const widgetEle = widgetBeingEdited.widgetEle;
	const eleTop = $(widgetEle).position().top;
	const eleWidth = $(widgetEle).width();
	$('#RESDashboardEditComponent').css('top', `${eleTop}px`).css('left', '5px').css('width', `${eleWidth + 2}px`);
	if (basePath.startsWith('/search?q=')) {
		$('#editSearchDisplayName').val(widgetBeingEdited.displayName);
		$('#editSearch').val(decodeURIComponent(basePath.substr(10)));
		$('#editSearchForm').show();
		$('#editRedditForm').hide();
		$('#RESDashboardEditComponent').fadeIn('fast');
	} else {
		$('#editReddit').val(widgetBeingEdited.basePath.substr(3));
		$('#editRedditDisplayName').val(widgetBeingEdited.displayName);
		$('#editRedditForm').show();
		$('#editSearchForm').hide();
		$('#RESDashboardEditComponent').fadeIn('fast');
	}
}

let $dashboardUL;

function attachAddComponent($tabPage) {
	const $dashboardAddComponent = $('<div id="RESDashboardAddComponent" class="RESDashboardComponent" />');
	$dashboardAddComponent.html(`
		<div class="addNewWidget">Add a new widget</div>
		<div id="addWidgetButtons">
			<div class="addButton" id="addSearchWidget">+search widget</div>
			<div class="addButton" id="addMailWidget">+mail widget</div>
			<div class="addButton" id="addUserWidget">+user widget</div>
			<div class="addButton" id="addRedditWidget">+subreddit widget</div>
		</div>
		<div id="addSearchFormContainer" class="addSearchForm">
			<div class="backToWidgetTypes">&laquo; back</div>
			<form id="addSearchForm">
				<input type="text" id="addSearch" placeholder="search terms">
				<input type="text" id="addSearchDisplayName" placeholder="display name (e.g. stuff)">
				<input type="submit" class="addButton" value="+add">
			</form>
		</div>
		<div id="addMailWidgetContainer">
			<div class="backToWidgetTypes">&laquo; back</div>
			<div class="addButton widgetShortcut" widgetPath="/message/inbox/">+inbox</div>
			<div class="addButton widgetShortcut" widgetPath="/message/unread/">+unread</div>
			<div class="addButton widgetShortcut" widgetPath="/message/messages/">+messages</div>
			<div class="addButton widgetShortcut" widgetPath="/message/comments/">+comment replies</div>
			<div class="addButton widgetShortcut" widgetPath="/message/selfreply/">+post replies</div>
			<div class="addButton widgetShortcut" widgetPath="/message/moderator/">+modmail</div>
		</div>
		<div id="addUserFormContainer" class="addUserForm">
			<div class="backToWidgetTypes">&laquo; back</div>
			<form id="addUserForm">
				<input type="text" id="addUser">
				<input type="submit" class="addButton" value="+add">
			</form>
		</div>
		<div id="addRedditFormContainer" class="addRedditForm">
			<div class="backToWidgetTypes">&laquo; back</div>
			<form id="addRedditForm">
				<input type="text" id="addReddit" placeholder="subreddit / multireddit">
				<input type="text" id="addRedditDisplayName" placeholder="display name (e.g. stuff)">
				<input type="submit" class="addButton" value="+add">
			</form>
		</div>
	`);
	$dashboardAddComponent.find('.backToWidgetTypes').click(function() {
		$(this).parent().fadeOut(() => $('#addWidgetButtons').fadeIn());
	});
	$dashboardAddComponent.find('.widgetShortcut').click(function() {
		const thisBasePath = $(this).attr('widgetPath');
		addWidget({
			basePath: thisBasePath,
		}, true);
		$('#addMailWidgetContainer').fadeOut(() => $('#addWidgetButtons').fadeIn());
	});
	$dashboardAddComponent.find('#addRedditWidget').click(() => {
		$('#addWidgetButtons').fadeOut(() => {
			$('#addRedditFormContainer').fadeIn(() => {
				$('#token-input-addReddit').focus();
			});
		});
	});
	$dashboardAddComponent.find('#addMailWidget').click(() => {
		$('#addWidgetButtons').fadeOut(() => $('#addMailWidgetContainer').fadeIn());
	});
	$dashboardAddComponent.find('#addUserWidget').click(() => {
		$('#addWidgetButtons').fadeOut(() => $('#addUserFormContainer').fadeIn());
	});
	$dashboardAddComponent.find('#addSearchWidget').click(() => {
		$('#addWidgetButtons').fadeOut(() => $('#addSearchFormContainer').fadeIn());
	});

	$dashboardAddComponent.find('#addRedditForm').get(0).addEventListener('submit', e => {
		e.preventDefault();
		let thisBasePath = $('#addReddit').val();
		if (thisBasePath !== '') {
			thisBasePath = thisBasePath.replace(/,|\s/g, '+');
			const thisDisplayName = ($('#addRedditDisplayName').val()) ? $('#addRedditDisplayName').val() : thisBasePath;
			addWidget({
				basePath: thisBasePath,
				displayName: thisDisplayName,
			}, true);
			$('#addReddit').val('').blur();
			$('#addRedditFormContainer').fadeOut(() => {
				$('#addWidgetButtons').fadeIn();
			});
		}
	});
	$dashboardAddComponent.find('#addUserForm').get(0).addEventListener('submit', e => {
		e.preventDefault();
		const thisBasePath = `/user/${$('#addUser').val()}`;
		addWidget({
			basePath: thisBasePath,
		}, true);
		$('#addUser').val('').blur();
		$('#addUserFormContainer').fadeOut(() => $('#addWidgetButtons').fadeIn());
	});
	$dashboardAddComponent.find('#addSearchForm').get(0).addEventListener('submit', e => {
		e.preventDefault();
		const thisBasePath = string.encode`/search?q=${$('#addSearch').val()}`;
		const thisDisplayName = ($('#addSearchDisplayName').val()) ? $('#addSearchDisplayName').val() : thisBasePath;
		addWidget({
			basePath: thisBasePath,
			displayName: thisDisplayName,
		}, true);
		$('#addSearch').val('').blur();
		$('#addSearchFormContainer').fadeOut(() => $('#addWidgetButtons').fadeIn());
	});
	$dashboardUL = $('<ul id="RESDashboard"></ul>');
	$tabPage.append($dashboardAddComponent, $dashboardUL);
}

function addWidget(optionsObject: WidgetOptions, isNew) {
	if (!optionsObject.basePath.startsWith('/')) {
		optionsObject.basePath = `/r/${optionsObject.basePath}`;
	}
	const exists = widgets.some(widget => widget.basePath === optionsObject.basePath);
	// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
	setTimeout(() => {
		$(`.widgetShortcut[widgetPath="${optionsObject.basePath}"]`).hide();
	}, 1000);
	if (exists && isNew) {
		Alert.open(`A widget for ${optionsObject.basePath} already exists!`);
	} else {
		const thisWidget = new WidgetObject(optionsObject);
		if ($dashboardUL) thisWidget.init();
		saveWidget(thisWidget.optionsObject());
	}
}

async function removeWidget(optionsObject) {
	await getLatestWidgets();
	let exists;
	widgets = widgets.filter(widget => {
		if (widget.basePath === optionsObject.basePath) {
			exists = true;
			$(document.getElementById(widget.basePath.replace(/\/|\+/g, '_'))).fadeOut('slow', function() {
				$(this).detach();
			});
			// show any shortcut button for this widget, since we've now deleted it...
			setTimeout(() => {
				$(`.widgetShortcut[widgetPath="${optionsObject.basePath}"]`).show();
			}, 1000);
			return false;
		}

		return true;
	});
	if (!exists) {
		Notifications.showNotification({
			moduleID: 'dashboard',
			message: 'The widget you just tried to remove does not seem to exist.',
		});
	}
	dashboardStorage.set(widgets);
}

async function saveWidget(optionsObject) {
	await getLatestWidgets();

	let index = widgets.findIndex(widget => widget.basePath === optionsObject.basePath);

	// update if exists else append
	if (index === -1) {
		index = widgets.length;
	}
	widgets[index] = optionsObject;

	dashboardStorage.set(widgets);
}

async function updateWidget() {
	await getLatestWidgets();
	widgets = widgets.map(widget => {
		if (widget.basePath === widgetBeingEdited.formerBasePath) {
			delete widgetBeingEdited.formerBasePath;
			widget = widgetBeingEdited.optionsObject();
		}
		return widget;
	});
	dashboardStorage.set(widgets);
}

function WidgetObject(widgetOptions: WidgetOptions) {
	this.basePath = widgetOptions.basePath;
	if (widgetOptions.displayName === undefined || widgetOptions.displayName === null) {
		widgetOptions.displayName = this.basePath;
	}
	this.displayName = widgetOptions.displayName;
	this.numPosts = widgetOptions.numPosts || parseInt(module.options.defaultPosts.value, 10);
	this.sortBy = widgetOptions.sortBy || module.options.defaultSort.value;
	this.sortSearchBy = widgetOptions.sortSearchBy || module.options.defaultSortSearch.value;
	this.minimized = widgetOptions.minimized || false;
	this.widgetEle = $(`
		<li class="RESDashboardComponent" id="${this.basePath.replace(/\/|\+/g, '_')}">
			<div class="RESDashboardComponentScrim">
				<div class="RESDashboardComponentLoader">
					<span class="dashboardLoader"/><span>querying the server. one moment please.</span>
				</div>
			</div>
		</li>
	`);
	this.header = $(`<div class="RESDashboardComponentHeader"><a class="widgetPath" title="${this.basePath}" href="${this.basePath}"></a></div>`);
	this.header.find('.widgetPath').text(this.displayName);
	this.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="rising">rising</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
	this.sortSearchControls = $('<ul class="widgetSortButtons"><li sort="relevance">relevance</li><li sort="top">top</li><li sort="new">new</li><li sort="comments">comments</li></ul>');
	// return an optionsObject, which is what we'll store in the widgets array.
	this.optionsObject = () => ({
		basePath: this.basePath,
		displayName: this.displayName,
		numPosts: this.numPosts,
		sortBy: this.sortBy,
		sortSearchBy: this.sortSearchBy,
		minimized: this.minimized,
	});
	// set the sort by properly...
	$(this.sortControls).find(`li[sort=${this.sortBy}]`).addClass('active');
	$(this.sortControls).find('li').click(e => {
		this.sortChange($(e.currentTarget).attr('sort'));
	});
	$(this.sortSearchControls).find(`li[sort=${this.sortSearchBy}]`).addClass('active');
	$(this.sortSearchControls).find('li').click(e => {
		this.sortChange($(e.currentTarget).attr('sort'));
	});
	$(this.header).append(this.sortControls);
	if (!this.basePath.startsWith('/r/') && !this.basePath.startsWith('/user/')) {
		setTimeout(() => $(this.sortControls).hide(), 100);
	}
	$(this.header).append(this.sortSearchControls);
	if (!this.basePath.startsWith('/search?q=')) {
		setTimeout(() => $(this.sortSearchControls).hide(), 100);
	}
	this.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><span class="res-icon">&#xF0B0;</span></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"><span class="res-icon">&#xF139;</span></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
	$(this.stateControls).find('li').click(e => {
		switch ($(e.currentTarget).attr('action')) {
			case 'refresh':
				this.update();
				break;
			case 'refreshAll':
				$('li[action="refresh"]').click();
				break;
			case 'addRow':
				if (this.numPosts === MAX_ROWS) break;
				this.numPosts++;
				if (this.numPosts === MAX_ROWS) $(this.stateControls).find('li[action=addRow]').addClass('disabled');
				$(this.stateControls).find('li[action=subRow]').removeClass('disabled');
				saveWidget(this.optionsObject());
				this.update();
				break;
			case 'subRow':
				if (this.numPosts === 0) break;
				this.numPosts--;
				if (this.numPosts === 1) $(this.stateControls).find('li[action=subRow]').addClass('disabled');
				$(this.stateControls).find('li[action=addRow]').removeClass('disabled');
				saveWidget(this.optionsObject());
				this.update();
				break;
			case 'minimize':
				$(this.widgetEle).toggleClass('minimized');
				if ($(this.widgetEle).hasClass('minimized')) {
					$(e.currentTarget).text('+');
					this.minimized = true;
				} else {
					$(e.currentTarget).text('-');
					this.minimized = false;
					this.update();
				}
				$(this.contents).parent().slideToggle();
				saveWidget(this.optionsObject());
				break;
			case 'delete':
				removeWidget(this.optionsObject());
				break;
			default:
				break;
		}
	});
	$(this.header).append(this.stateControls);
	this.sortChange = sortBy => {
		this.sortBy = sortBy;
		this.sortSearchBy = sortBy;
		$(this.header).find('ul.widgetSortButtons li').removeClass('active');
		$(this.header).find(`ul.widgetSortButtons li[sort=${sortBy}]`).addClass('active');
		this.update();
		saveWidget(this.optionsObject());
	};
	this.edit = () => {
		widgetBeingEdited = this; // eslint-disable-line consistent-this
		showEditForm();
	};
	$(this.header).find('.editButton').click(this.edit);
	this.update = () => {
		if (this.basePath.includes('/user/')) {
			this.sortPath = (this.sortBy === 'hot') ? '/' : `?sort=${this.sortBy}`;
		} else if (this.basePath.includes('/r/')) {
			this.sortPath = (this.sortBy === 'hot') ? '/' : `/${this.sortBy}/`;
		} else if (this.basePath.includes('/search?q=')) {
			this.sortPath = `&sort=${this.sortSearchBy}`;
		} else {
			this.sortPath = '';
		}
		this.url = new URL(`${this.basePath}${this.sortPath}`, location.origin).href;
		$(this.contents).fadeTo('fast', 0.25);
		$(this.scrim).fadeIn();

		ajax({
			method: 'GET',
			url: this.url,
			query: {
				limit: this.numPosts,
			},
		})
			.then(this.populate)
			.catch(this.error);
	};
	this.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
	if (this.minimized) {
		$(this.container).addClass('minimized');
		$(this.stateControls).find('li.minimize').addClass('minimized').text('+');
	}
	this.scrim = $(this.widgetEle).find('.RESDashboardComponentScrim');
	this.contents = $(this.container).find('.RESDashboardComponentContents');
	this.init = () => {
		this.draw();
		if (!this.minimized) addToUpdateQueue(this.update);
	};
	this.draw = () => {
		$(this.widgetEle).append(this.header);
		$(this.widgetEle).append(this.container);
		if (this.minimized) $(this.widgetEle).addClass('minimized');
		$dashboardUL.prepend(this.widgetEle);
		// $(thisWidget.scrim).fadeIn();
	};
	this.populate = response => {
		let $widgetContent = $(response).find('#siteTable, .search-result-group>.contents:last');
		const $thisWidgetContents = $(this.contents);

		$widgetContent.attr('id', `siteTable_${this.basePath.replace(/\/|\+/g, '_')}`);
		if ($widgetContent.length === 2) $widgetContent = $($widgetContent[1]);
		$widgetContent.attr('url', `${this.url}?limit=${this.numPosts}`);
		if (($widgetContent.length > 0) && ($widgetContent.html() !== '')) {
			$widgetContent.html($widgetContent.html().replace(/<script(.|\s)*?\/script>/g, ''));

			// check for "no results"
			const $noResults = $widgetContent.find('#noresults.error');
			if ($noResults.length) {
				$widgetContent.html('<span class="error">No results found for this widget. Some sort methods, such as rising, may not always have results. Please try a different method.</span>');
			}

			// $widgetContent will contain HTML from Reddit's page load. No XSS here or you'd already be hit, can't call escapeHTML on this either and wouldn't help anyhow.
			try {
				$thisWidgetContents.empty().append($widgetContent);
			} catch (e) {
				// console.log(e);
			}

			$thisWidgetContents.fadeTo('fast', 1);
			$(this.scrim).fadeOut(function() {
				$(this).hide(); // make sure it is hidden in case the element isn't visible due to being on a different dashboard tab
			});
		} else {
			if (this.url.includes('/message/')) {
				$thisWidgetContents.html('<div class="widgetNoMail">No messages were found.</div>');
			} else {
				$thisWidgetContents.html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
			}
			$thisWidgetContents.fadeTo('fast', 1);
			$(this.scrim).fadeOut();
		}
		$(this.stateControls).find('.updateTime').text(`updated: ${formatDateTime()}`);

		// now run watcher functions from other modules on this content...
		if ($widgetContent[0]) {
			registerPage($widgetContent[0]);
		}
	};
	this.error = e => {
		if (e.status === 404) {
			$(this.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
		} else {
			$(this.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
		}
		$(this.scrim).fadeOut();
		$(this.contents).fadeTo('fast', 1);
	};
}

export function createSubredditToggleButton(subreddit: string) {
	const basePath = `/r/${subreddit.toLowerCase()}`;

	return CreateElement.fancyToggleButton(
		i18n('subredditInfoAddRemoveDashboard'),
		i18n('subredditInfoAddThisSubredditToDashboard'),
		() => widgets.some(widget => widget && (widget.basePath.toLowerCase() === basePath)),
		state => {
			if (state) {
				addWidget({ basePath });
				Notifications.showNotification({
					header: 'Dashboard Notification',
					moduleID: 'dashboard',
					message: `
						Dashboard widget added for ${basePath}
						<p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p>
						<div class="clear"></div>
					`,
				});
			} else {
				removeWidget({ basePath });
			}
		},
	);
}
