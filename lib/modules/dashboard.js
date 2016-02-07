addModule('dashboard', (module, moduleID) => {
	module.moduleName = 'RES Dashboard';
	module.category = 'Productivity';
	module.description = 'The RES Dashboard is home to a number of features including widgets and other useful tools';
	module.alwaysEnabled = true;
	module.options = {
		menuItem: {
			type: 'boolean',
			value: true,
			description: 'Show link to my dashboard in RES menu'
		},
		defaultPosts: {
			type: 'text',
			value: 3,
			description: 'Number of posts to show by default in each widget',
			advanced: true
		},
		defaultSort: {
			type: 'enum',
			values: [{
				name: 'hot',
				value: 'hot'
			}, {
				name: 'new',
				value: 'new'
			}, {
				name: 'rising',
				value: 'rising'
			}, {
				name: 'controversial',
				value: 'controversial'
			}, {
				name: 'top',
				value: 'top'
			}],
			value: 'hot',
			description: 'Default sort method for new widgets'
		},
		dashboardShortcut: {
			type: 'boolean',
			value: true,
			description: 'Show +dashboard shortcut in sidebar for easy addition of dashboard widgets.'
		},
		tagsPerPage: {
			type: 'text',
			value: 25,
			description: 'How many user tags to show per page on the <a href="/r/Dashboard/#userTaggerContents">my users tags</a> tab. (enter zero to show all on one page)',
			advanced: true
		}
	};
	module.go = async function() {
		if (this.isEnabled()) {
			await getLatestWidgets();
			if (this.isMatchURL()) {
				if (this.options.menuItem.value) {
					modules['RESMenu'].addMenuItem('<div id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></div>', null, true);
				}
				if (RESUtils.currentSubreddit()) {
					// one more safety check... not sure how people's widgets[] arrays are breaking.
					if (!(this.widgets instanceof Array)) {
						this.widgets = [];
					}
					if (this.options.dashboardShortcut.value) addDashboardShortcuts();
				}
			}
		}
	};

	module.afterLoad = function() {
		// needs to be done in afterLoad so other modules have a chance to add pages
		if (RESUtils.currentSubreddit('dashboard')) {
			$('#noresults, #header-bottom-left .tabmenu:not(".viewimages")').hide();
			$('#header-bottom-left .redditname a:first').text('My Dashboard');
			drawDashboard();
		}
	};

	const MAX_ROWS = 100;
	const loader = 'data:image/gif;base64,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';

	async function getLatestWidgets() {
		module.widgets = await RESEnvironment.storage.get('RESmodules.dashboard.' + RESUtils.loggedInUser()) || [];
	}

	function drawDashboard() {
		const $dbLinks = $('span.redditname a');
		if ($dbLinks.length > 1) {
			$($dbLinks[0]).addClass('active');
		}

		// add each subreddit widget...
		// add the "add widget" form...
		attachContainer();
		attachAddComponent();
		attachEditComponent();
		initUpdateQueue();
	}

	function initUpdateQueue() {
		for (const i in module.widgets) {
			if (module.widgets[i]) addWidget(module.widgets[i]);
		}

		setTimeout(() => {
			$('#RESDashboard').sortable({
				nested: false,
				handle: 'div.RESDashboardComponentHeader',
				itemSelector: '.RESDashboardComponent',
				placeholderClass: 'RESSortPlaceholder',
				placeholder: '<li class="RESSortPlaceholder"></li>',
				onCancel($item, container, _super, event) {
					_super($item, container, _super, event);
					$(window).edgescroll('stop');
					$item.removeData('dragOffset');
				},
				onDrop($item, container, _super, event) {
					_super($item, container, _super, event);
					$item.removeData('dragOffset');
					$(window).edgescroll('stop');
					saveOrder();
				},
				onDrag($item, position) {
					const dragOffset = $item.data('dragOffset');
					// Reposition the row, remembering to apply the offset
					$item.css({
						top: position.top - dragOffset.top,
						left: position.left - dragOffset.left
					});
				},
				onDragStart($item, container) {
					$(window).edgescroll({ speed: 4 });

					const offset = $item.offset();
					const pointer = container.rootGroup.pointer;
					$item.css({
						position: 'absolute',
						height: $item.height(),
						width: $item.width()
					}).data('dragOffset', {
						left: pointer.left - offset.left,
						top: pointer.top - offset.top
					});
				}
			});
		}, 300);
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
			updateQueueTimer = null;
		}
	}

	function saveOrder() {
		const data = $('#siteTable li.RESDashboardComponent').map(function() {
			return $(this).attr('id');
		}).get();
		data.reverse();
		const newOrder = [];
		module.widgets.forEach(widget => {
			const newIndex = data.indexOf(widget.basePath.replace(/(\/|\+)/g, '_'));
			newOrder[newIndex] = widget;
		});
		module.widgets = newOrder;
		RESEnvironment.storage.set('RESmodules.dashboard.' + RESUtils.loggedInUser(), module.widgets);
	}

	function attachContainer() {
		$('#siteTable.linklisting').append('<div id="dashboardContents" class="dashboardPane" />');
		if ((location.hash !== '') && (location.hash !== '#dashboardContents')) {
			$('span.redditname a').removeClass('active');
			const activeTabID = location.hash.replace('#', '#tab-');
			$(activeTabID).addClass('active');
			$('.dashboardPane').hide();
			$(location.hash).show();
		} else {
			$('#userTaggerContents').hide();
		}
		$('span.redditname a:first').click(function(e) {
			e.preventDefault();
			location.hash = 'dashboardContents';
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#dashboardContents').show();
		});
	}

	let widgetBeingEdited;

	function attachEditComponent() {
		const $dashboardEditComponent = $('<div id="RESDashboardEditComponent" class="RESDashboardComponent" />');
		$dashboardEditComponent.html(`
			<div class="editWidget">Edit widget</div>
			<div id="editRedditFormContainer" class="editRedditForm">
				<form id="editRedditForm">
					<input type="text" id="editReddit">
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

		$dashboardEditComponent.find('#editRedditForm').submit(e => {
			e.preventDefault();
			let thisBasePath = $('#editReddit').val();
			if (thisBasePath !== '') {
				if (thisBasePath.indexOf(',') !== -1) {
					thisBasePath = thisBasePath.replace(/\,/g, '+');
				}
				widgetBeingEdited.formerBasePath = widgetBeingEdited.basePath;
				widgetBeingEdited.basePath = '/r/' + thisBasePath;
				widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
				widgetBeingEdited.update();
				$('#editReddit').tokenInput('clear');
				$('#RESDashboardEditComponent').fadeOut(() => $('#editReddit').blur());
				widgetBeingEdited.widgetEle.find('.widgetPath').text(widgetBeingEdited.displayName).attr('title', '/r/' + thisBasePath);
				updateWidget();
			}
		});
		$dashboardEditComponent.find('#editSearchForm').submit(e => {
			e.preventDefault();
			const thisBasePath = $('#editSearch').val();
			widgetBeingEdited.formerBasePath = widgetBeingEdited.basePath;
			widgetBeingEdited.basePath = '/search?q=' + encodeURIComponent(thisBasePath);
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
			if (widgetBeingEdited.basePath.substr(0, 10) === '/search?q=') {
				$('#RESDashboardEditComponent').fadeOut(() => $('#editSearchDisplayName').val('').blur());
			} else {
				$('#editReddit').tokenInput('clear');
				$('#RESDashboardEditComponent').fadeOut(() => $('#editReddit').blur());
			}
		});
		$(document.body).append($dashboardEditComponent);
	}

	let firstEdit;

	function showEditForm() {
		let basePath = widgetBeingEdited.basePath;
		const widgetEle = widgetBeingEdited.widgetEle;
		const eleTop = $(widgetEle).position().top;
		const eleWidth = $(widgetEle).width();
		$('#RESDashboardEditComponent').css('top', eleTop + 'px').css('left', '5px').css('width', (eleWidth + 2) + 'px');
		if (basePath.substr(0, 10) === '/search?q=') {
			$('#editSearchDisplayName').val(widgetBeingEdited.displayName);
			$('#editSearch').val(decodeURIComponent(basePath.substr(10)));
			$('#editSearchForm').show();
			$('#editRedditForm').hide();
			$('#RESDashboardEditComponent').fadeIn('fast');
		} else {
			$('#editRedditDisplayName').val(widgetBeingEdited.displayName);
			$('#editRedditForm').show();
			$('#editSearchForm').hide();
			$('#RESDashboardEditComponent').fadeIn('fast');
			basePath = basePath.replace(/^\/r\//, '');
			const reddits = basePath.split('+');
			const prepop = reddits.map(reddit => ({
				id: reddit,
				name: reddit
			}));
			if (!firstEdit) {
				$('#editReddit').tokenInput('/api/search_reddit_names.json?app=res', {
					method: 'POST',
					queryParam: 'query',
					theme: 'facebook',
					allowFreeTagging: true,
					zindex: 999999999,
					onResult(response) {
						const names = response.names;
						const results = names.map(name => ({
							id: name,
							name
						}));
						if (names.length === 0) {
							const failedQueryValue = $('#token-input-editReddit').val();
							results.push({
								id: failedQueryValue,
								name: failedQueryValue,
								failedResult: true
							});
						}
						return results;
					},
					onCachedResult(response) {
						const names = response.names;
						const results = names.map(name => ({
							id: name,
							name
						}));
						if (names.length === 0) {
							const failedQueryValue = $('#token-input-editReddit').val();
							results.push({
								id: failedQueryValue,
								name: failedQueryValue,
								failedResult: true
							});
						}
						return results;
					},
					prePopulate: prepop,
					searchingText: 'Searching for matching reddits - may take a few seconds...',
					hintText: 'Type one or more subreddits for which to create a widget.',
					resultsFormatter(item) {
						let thisDesc = item.name;
						if (item['failedResult']) {
							thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
						}
						return '<li>' + thisDesc + '</li>';
					}
				});
				firstEdit = true;
			} else {
				$('#editReddit').tokenInput('clear');
				prepop.forEach(value => $('#editReddit').tokenInput('add', value));
			}
		}
	}

	let $dashboardUL;

	function attachAddComponent() {
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
					<input type="text" id="addReddit">
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
				basePath: thisBasePath
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

		const thisEle = $dashboardAddComponent.find('#addReddit');
		$(thisEle).tokenInput('/api/search_reddit_names.json?app=res', {
			method: 'POST',
			queryParam: 'query',
			theme: 'facebook',
			allowFreeTagging: true,
			zindex: 999999999,
			onResult(response) {
				const names = response.names;
				const results = names.map(name => ({
					id: name,
					name
				}));
				if (names.length === 0) {
					const failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
				}
				return results;
			},
			onCachedResult(response) {
				const names = response.names;
				const results = names.map(name => ({
					id: name,
					name
				}));
				if (names.length === 0) {
					const failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
				}
				return results;
			},
			/* prePopulate: prepop, */
			searchingText: 'Searching for matching reddits - may take a few seconds...',
			hintText: 'Type one or more subreddits for which to create a widget.',
			resultsFormatter(item) {
				let thisDesc = item.name;
				if (item['failedResult']) {
					thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
				}
				return '<li>' + thisDesc + '</li>';
			}
		});

		$dashboardAddComponent.find('#addRedditForm').submit(e => {
			e.preventDefault();
			let thisBasePath = $('#addReddit').val();
			if (thisBasePath !== '') {
				if (thisBasePath.indexOf(',') !== -1) {
					thisBasePath = thisBasePath.replace(/\,/g, '+');
				}
				const thisDisplayName = ($('#addRedditDisplayName').val()) ? $('#addRedditDisplayName').val() : thisBasePath;
				addWidget({
					basePath: thisBasePath,
					displayName: thisDisplayName
				}, true);
				// $('#addReddit').val('').blur();
				$('#addReddit').tokenInput('clear');
				$('#addRedditFormContainer').fadeOut(() => {
					$('#addReddit').blur();
					$('#addWidgetButtons').fadeIn();
				});
			}
		});
		$dashboardAddComponent.find('#addUserForm').submit(e => {
			e.preventDefault();
			const thisBasePath = '/user/' + $('#addUser').val();
			addWidget({
				basePath: thisBasePath
			}, true);
			$('#addUser').val('').blur();
			$('#addUserFormContainer').fadeOut(() => $('#addWidgetButtons').fadeIn());
		});
		$dashboardAddComponent.find('#addSearchForm').submit(e => {
			e.preventDefault();
			const thisBasePath = '/search?q=' + encodeURIComponent($('#addSearch').val());
			const thisDisplayName = ($('#addSearchDisplayName').val()) ? $('#addSearchDisplayName').val() : thisBasePath;
			addWidget({
				basePath: thisBasePath,
				displayName: thisDisplayName
			}, true);
			$('#addSearch').val('').blur();
			$('#addSearchFormContainer').fadeOut(() => $('#addWidgetButtons').fadeIn());
		});
		const $dashboardContents = $('#dashboardContents');
		$dashboardContents.append($dashboardAddComponent);
		$dashboardUL = $('<ul id="RESDashboard"></ul>');
		$dashboardContents.append($dashboardUL);
	}

	function addWidget(optionsObject, isNew) {
		if (optionsObject.basePath.slice(0, 1) !== '/') {
			optionsObject.basePath = '/r/' + optionsObject.basePath;
		}
		const exists = module.widgets.some(widget => widget.basePath === optionsObject.basePath);
		// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
		setTimeout(() => {
			$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').hide();
		}, 1000);
		if (exists && isNew) {
			alert('A widget for ' + optionsObject.basePath + ' already exists!');
		} else {
			const thisWidget = new WidgetObject(optionsObject);
			thisWidget.init();
			saveWidget(thisWidget.optionsObject());
		}
	}

	async function removeWidget(optionsObject) {
		await getLatestWidgets();
		let exists;
		module.widgets = module.widgets.filter(widget => {
			if (widget.basePath === optionsObject.basePath) {
				exists = true;
				$(document.getElementById(widget.basePath.replace(/\/|\+/g, '_'))).fadeOut('slow', function() {
					$(this).detach();
				});
				// show any shortcut button for this widget, since we've now deleted it...
				setTimeout(() => {
					$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').show();
				}, 1000);
				return false;
			}

			return true;
		});
		if (!exists) {
			modules['notifications'].showNotification({
				moduleID: 'dashboard',
				type: 'error',
				message: 'The widget you just tried to remove does not seem to exist.'
			});
		}
		RESEnvironment.storage.set('RESmodules.dashboard.' + RESUtils.loggedInUser(), module.widgets);
	}

	async function saveWidget(optionsObject) {
		await getLatestWidgets();

		let index = module.widgets.findIndex(widget => widget.basePath === optionsObject.basePath);

		// update if exists else append
		if (index === -1) {
			index = module.widgets.length;
		}
		module.widgets[index] = optionsObject;

		RESEnvironment.storage.set('RESmodules.dashboard.' + RESUtils.loggedInUser(), module.widgets);
	}

	async function updateWidget() {
		await getLatestWidgets();
		module.widgets = module.widgets.map(widget => {
			if (widget.basePath === widgetBeingEdited.formerBasePath) {
				delete widgetBeingEdited.formerBasePath;
				widget = widgetBeingEdited.optionsObject();
			}
			return widget;
		});
		RESEnvironment.storage.set('RESmodules.dashboard.' + RESUtils.loggedInUser(), module.widgets);
	}

	function WidgetObject(widgetOptions) {
		this.basePath = widgetOptions.basePath;
		if ((typeof widgetOptions.displayName === 'undefined') || (widgetOptions.displayName === null)) {
			widgetOptions.displayName = this.basePath;
		}
		this.displayName = widgetOptions.displayName;
		this.numPosts = widgetOptions.numPosts || module.options.defaultPosts.value;
		this.sortBy = widgetOptions.sortBy || module.options.defaultSort.value;
		this.minimized = widgetOptions.minimized || false;
		this.widgetEle = $('<li class="RESDashboardComponent" id="' + this.basePath.replace(/\/|\+/g, '_') + '"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="' + loader + '"><span>querying the server. one moment please.</span></div></div></li>');
		this.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="' + this.basePath + '" href="' + this.basePath + '"></a></div>');
		this.header.find('.widgetPath').text(this.displayName);
		this.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="rising">rising</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the module.widgets array.
		this.optionsObject = () => ({
			basePath: this.basePath,
			displayName: this.displayName,
			numPosts: this.numPosts,
			sortBy: this.sortBy,
			minimized: this.minimized
		});
		// set the sort by properly...
		$(this.sortControls).find('li[sort=' + this.sortBy + ']').addClass('active');
		$(this.sortControls).find('li').click(e => {
			this.sortChange($(e.target).attr('sort'));
		});
		$(this.header).append(this.sortControls);
		if ((this.basePath.indexOf('/r/') !== 0) && (this.basePath.indexOf('/user/') !== 0)) {
			setTimeout(() => $(this.sortControls).hide(), 100);
		}
		this.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><span class="res-icon">&#xF0B0;</span></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"><span class="res-icon">&#xF139;</span></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
		$(this.stateControls).find('li').click(e => {
			switch ($(e.target).attr('action')) {
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
						$(e.target).text('+');
						this.minimized = true;
					} else {
						$(e.target).text('-');
						this.minimized = false;
						this.update();
					}
					$(this.contents).parent().slideToggle();
					saveWidget(this.optionsObject());
					break;
				case 'delete':
					removeWidget(this.optionsObject());
					break;
			}
		});
		$(this.header).append(this.stateControls);
		this.sortChange = sortBy => {
			this.sortBy = sortBy;
			$(this.header).find('ul.widgetSortButtons li').removeClass('active');
			$(this.header).find('ul.widgetSortButtons li[sort=' + sortBy + ']').addClass('active');
			this.update();
			saveWidget(this.optionsObject());
		};
		this.edit = () => {
			widgetBeingEdited = this; // eslint-disable-line consistent-this
			showEditForm();
		};
		$(this.header).find('.editButton').click(this.edit);
		this.update = () => {
			if (this.basePath.indexOf('/user/') !== -1) {
				this.sortPath = (this.sortBy === 'hot') ? '/' : '?sort=' + this.sortBy;
			} else if (this.basePath.indexOf('/r/') !== -1) {
				this.sortPath = (this.sortBy === 'hot') ? '/' : '/' + this.sortBy + '/';
			} else {
				this.sortPath = '';
			}
			this.url = location.protocol + '//' + location.hostname + '/' + this.basePath + this.sortPath;
			$(this.contents).fadeTo('fast', 0.25);
			$(this.scrim).fadeIn();
			$.ajax({
				url: this.url,
				data: {
					limit: this.numPosts
				},
				success: this.populate,
				error: this.error
			});
		};
		this.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
		if (this.minimized) {
			$(this.container).addClass('minimized');
			$(this.stateControls).find('li.minimize').addClass('minimized').text('+');
		}
		this.scrim = $(this.widgetEle).find('.RESDashboardComponentScrim');
		this.contents = $(this.container).find('.RESDashboardComponentContents');
		this.init = () => {
			if (RESUtils.currentSubreddit('dashboard')) {
				this.draw();
				if (!this.minimized) addToUpdateQueue(this.update);
			}
		};
		this.draw = () => {
			$(this.widgetEle).append(this.header);
			$(this.widgetEle).append(this.container);
			if (this.minimized) $(this.widgetEle).addClass('minimized');
			$dashboardUL.prepend(this.widgetEle);
			// $(thisWidget.scrim).fadeIn();
		};
		this.populate = response => {
			let $widgetContent = $(response).find('#siteTable');
			const $thisWidgetContents = $(this.contents);

			$widgetContent.attr('id', 'siteTable_' + this.basePath.replace(/\/|\+/g, '_'));
			if ($widgetContent.length === 2) $widgetContent = $($widgetContent[1]);
			$widgetContent.attr('url', this.url + '?limit=' + this.numPosts);
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
				if (this.url.indexOf('/message/') !== -1) {
					$thisWidgetContents.html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$thisWidgetContents.html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$thisWidgetContents.fadeTo('fast', 1);
				$(this.scrim).fadeOut();
			}
			$(this.stateControls).find('.updateTime').text('updated: ' + RESUtils.niceDateTime());

			// now run watcher functions from other modules on this content...
			if (typeof $widgetContent[0] !== 'undefined') {
				RESUtils.watchers.siteTable.forEach(callback => {
					if (callback) callback($widgetContent[0]);
				});
			}
		};
		this.error = xhr => {
			// alert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
			if (xhr.status === 404) {
				$(this.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
			} else {
				$(this.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
			}
			$(this.scrim).fadeOut();
			$(this.contents).fadeTo('fast', 1);
		};
	}

	function addDashboardShortcuts() {
		const subButtons = document.querySelectorAll('.side .fancy-toggle-button');
		for (let h = 0; h < subButtons.length; h++) {
			const subButton = subButtons[h];
			let isMulti, thisSubredditFragment;
			if ((RESUtils.currentSubreddit().indexOf('+') === -1) && (RESUtils.currentSubreddit() !== 'mod')) {
				isMulti = false;
				thisSubredditFragment = RESUtils.currentSubreddit();
			} else if ($(subButton).parent().hasClass('subButtons')) {
				isMulti = true;
				thisSubredditFragment = $(subButton).parent().parent().find('a.title').text();
			} else {
				isMulti = true;
				thisSubredditFragment = $(subButton).next().text();
			}
			if ($('#subButtons-' + thisSubredditFragment).length === 0) {
				const $subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important;"></div>');
				$(subButton).wrap($subButtonsWrapper);
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					const theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			const dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'res-fancy-toggle-button RESDashboardToggle REStoggle');
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			const exists = module.widgets.some(widget =>
				widget && (widget.basePath.toLowerCase() === '/r/' + thisSubredditFragment.toLowerCase())
			);
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			dashboardToggle.addEventListener('click', module.toggleDashboard, false);
			$('#subButtons-' + thisSubredditFragment).append(dashboardToggle);
			// modules['styleTweaks'].protectElement($('#subButtons-' + thisSubredditFragment));  // DISABLED: too many dragons
			const next = $('#subButtons-' + thisSubredditFragment).next();
			if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
				$('#subButtons-' + thisSubredditFragment).before($(next));
				$('#subButtons-' + thisSubredditFragment).addClass('swapped');
			}
		}
	}

	module.toggleDashboard = function(e) {
		const thisBasePath = '/r/' + $(e.target).data('subreddit');
		if (e.target.classList.contains('remove')) {
			removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '+dashboard';
			e.target.classList.remove('remove');
		} else {
			addWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '-dashboard';
			modules['notifications'].showNotification({
				header: 'Dashboard Notification',
				moduleID: 'dashboard',
				message: 'Dashboard widget added for ' + thisBasePath + ' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
			});
			e.target.classList.add('remove');
		}
	};

	module.addTab = function(tabID, tabName) {
		$('#siteTable.linklisting').append('<div id="' + tabID + '" class="dashboardPane" />');
		$('span.redditname').append('<a id="tab-' + tabID + '" class="dashboardTab" title="' + tabName + '">' + tabName + '</a>');
		$('#tab-' + tabID).click(function() {
			location.hash = tabID;
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#' + tabID).show();
		});
	};
});
