addModule('dashboard', {
	moduleID: 'dashboard',
	moduleName: 'RES Dashboard',
	category: 'Productivity',
	alwaysEnabled: true,
	options: {
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
			},{
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
	},
	description: 'The RES Dashboard is home to a number of features including widgets and other useful tools',
	isEnabled: function() {
		return RESUtils.options.getModulePrefs(this.moduleID);
	},
	include: [
		'all'
	],
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	go: function() {
		if (this.isEnabled()) {
			this.getLatestWidgets();
			if (this.isMatchURL()) {
				if (this.options.menuItem.value) {
					modules['RESMenu'].addMenuItem('<div id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></div>', null, true);
				}
				if (RESUtils.currentSubreddit()) {
					RESUtils.addCSS('.RESDashboardToggle {}');
					// one more safety check... not sure how people's widgets[] arrays are breaking.
					if (!(this.widgets instanceof Array)) {
						this.widgets = [];
					}
					if (RESUtils.currentSubreddit('dashboard')) {
						$('#noresults, #header-bottom-left .tabmenu:not(".viewimages")').hide();
						$('#header-bottom-left .redditname a:first').text('My Dashboard');
						this.drawDashboard();
					}
					if (this.options.dashboardShortcut.value) this.addDashboardShortcuts();
				}
			}
		}
	},
	MAX_ROWS: 100,
	getLatestWidgets: function() {
		try {
			this.widgets = JSON.parse(RESStorage.getItem('RESmodules.dashboard.' + RESUtils.loggedInUser())) || [];
		} catch (e) {
			this.widgets = [];
		}
	},
	loader: 'data:image/gif;base64,R0lGODlhEAAQAPQAAP///2+NyPb3+7zK5e3w95as1rPD4W+NyKC02oOdz8/Z7Nnh8HqVzMbS6XGOyI2l06m73gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAFdyAgAgIJIeWoAkRCCMdBkKtIHIngyMKsErPBYbADpkSCwhDmQCBethRB6Vj4kFCkQPG4IlWDgrNRIwnO4UKBXDufzQvDMaoSDBgFb886MiQadgNABAokfCwzBA8LCg0Egl8jAggGAA1kBIA1BAYzlyILczULC2UhACH5BAkKAAAALAAAAAAQABAAAAV2ICACAmlAZTmOREEIyUEQjLKKxPHADhEvqxlgcGgkGI1DYSVAIAWMx+lwSKkICJ0QsHi9RgKBwnVTiRQQgwF4I4UFDQQEwi6/3YSGWRRmjhEETAJfIgMFCnAKM0KDV4EEEAQLiF18TAYNXDaSe3x6mjidN1s3IQAh+QQJCgAAACwAAAAAEAAQAAAFeCAgAgLZDGU5jgRECEUiCI+yioSDwDJyLKsXoHFQxBSHAoAAFBhqtMJg8DgQBgfrEsJAEAg4YhZIEiwgKtHiMBgtpg3wbUZXGO7kOb1MUKRFMysCChAoggJCIg0GC2aNe4gqQldfL4l/Ag1AXySJgn5LcoE3QXI3IQAh+QQJCgAAACwAAAAAEAAQAAAFdiAgAgLZNGU5joQhCEjxIssqEo8bC9BRjy9Ag7GILQ4QEoE0gBAEBcOpcBA0DoxSK/e8LRIHn+i1cK0IyKdg0VAoljYIg+GgnRrwVS/8IAkICyosBIQpBAMoKy9dImxPhS+GKkFrkX+TigtLlIyKXUF+NjagNiEAIfkECQoAAAAsAAAAABAAEAAABWwgIAICaRhlOY4EIgjH8R7LKhKHGwsMvb4AAy3WODBIBBKCsYA9TjuhDNDKEVSERezQEL0WrhXucRUQGuik7bFlngzqVW9LMl9XWvLdjFaJtDFqZ1cEZUB0dUgvL3dgP4WJZn4jkomWNpSTIyEAIfkECQoAAAAsAAAAABAAEAAABX4gIAICuSxlOY6CIgiD8RrEKgqGOwxwUrMlAoSwIzAGpJpgoSDAGifDY5kopBYDlEpAQBwevxfBtRIUGi8xwWkDNBCIwmC9Vq0aiQQDQuK+VgQPDXV9hCJjBwcFYU5pLwwHXQcMKSmNLQcIAExlbH8JBwttaX0ABAcNbWVbKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICSRBlOY7CIghN8zbEKsKoIjdFzZaEgUBHKChMJtRwcWpAWoWnifm6ESAMhO8lQK0EEAV3rFopIBCEcGwDKAqPh4HUrY4ICHH1dSoTFgcHUiZjBhAJB2AHDykpKAwHAwdzf19KkASIPl9cDgcnDkdtNwiMJCshACH5BAkKAAAALAAAAAAQABAAAAV3ICACAkkQZTmOAiosiyAoxCq+KPxCNVsSMRgBsiClWrLTSWFoIQZHl6pleBh6suxKMIhlvzbAwkBWfFWrBQTxNLq2RG2yhSUkDs2b63AYDAoJXAcFRwADeAkJDX0AQCsEfAQMDAIPBz0rCgcxky0JRWE1AmwpKyEAIfkECQoAAAAsAAAAABAAEAAABXkgIAICKZzkqJ4nQZxLqZKv4NqNLKK2/Q4Ek4lFXChsg5ypJjs1II3gEDUSRInEGYAw6B6zM4JhrDAtEosVkLUtHA7RHaHAGJQEjsODcEg0FBAFVgkQJQ1pAwcDDw8KcFtSInwJAowCCA6RIwqZAgkPNgVpWndjdyohACH5BAkKAAAALAAAAAAQABAAAAV5ICACAimc5KieLEuUKvm2xAKLqDCfC2GaO9eL0LABWTiBYmA06W6kHgvCqEJiAIJiu3gcvgUsscHUERm+kaCxyxa+zRPk0SgJEgfIvbAdIAQLCAYlCj4DBw0IBQsMCjIqBAcPAooCBg9pKgsJLwUFOhCZKyQDA3YqIQAh+QQJCgAAACwAAAAAEAAQAAAFdSAgAgIpnOSonmxbqiThCrJKEHFbo8JxDDOZYFFb+A41E4H4OhkOipXwBElYITDAckFEOBgMQ3arkMkUBdxIUGZpEb7kaQBRlASPg0FQQHAbEEMGDSVEAA1QBhAED1E0NgwFAooCDWljaQIQCE5qMHcNhCkjIQAh+QQJCgAAACwAAAAAEAAQAAAFeSAgAgIpnOSoLgxxvqgKLEcCC65KEAByKK8cSpA4DAiHQ/DkKhGKh4ZCtCyZGo6F6iYYPAqFgYy02xkSaLEMV34tELyRYNEsCQyHlvWkGCzsPgMCEAY7Cg04Uk48LAsDhRA8MVQPEF0GAgqYYwSRlycNcWskCkApIyEAOwAAAAAAAAAAAA==',
	drawDashboard: function() {
		// this first line hides the "you need RES 4.0+ to view the dashboard" link
		RESUtils.addCSS('.id-t3_qi5iy {display: none;}');
		RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #ccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-top: 5px; margin-bottom: 5px;}');
		RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0 8px 0; background-color: #f0f3fc; overflow: hidden; }');
		RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0; bottom: 0; left: 0; right: 0; z-index: 5; display: none; }');
		RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
		RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
		RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0 15px; min-height: 100px; }');
		RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget, .editWidget { display: inline-block; margin-left: 0; margin-top: 7px; color: #000; font-weight: bold; }');
		RESUtils.addCSS('.editWidget { float: left; margin-right: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
		RESUtils.addCSS('#RESDashboardAddComponent, #RESDashboardEditComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #369;}');
		RESUtils.addCSS('#RESDashboardEditComponent { display: none; position: absolute; }');
		// RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #ccc; opacity: 0.3; border: 1px solid red; display: none; }');
		RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer, #addSearchFormContainer { display: none; }');
		RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer, #addSearchFormContainer, #editRedditFormContainer, #editSearchFormContainer { width: auto; min-width: 550px; height: 28px; float: right; text-align: right; }');
		RESUtils.addCSS('#addRedditFormContainer { height: auto; }');
		RESUtils.addCSS('#editRedditFormContainer, #editSearchFormContainer { width: auto; }');
		RESUtils.addCSS('#addUserForm, #addSearchForm, #addRedditForm { display: inline-block }');
		RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
		RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook, #editRedditFormContainer ul.token-input-list-facebook { float: left; }');
		RESUtils.addCSS('#addReddit { width: 115px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#addRedditDisplayName, #editRedditDisplayName { width: 140px; height: 24px; background-color: #fff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
		RESUtils.addCSS('#editReddit { width: 5px; } ');
		RESUtils.addCSS('.addButton, .updateButton { cursor: pointer; display: inline-block; width: auto; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.cancelButton { width: 50px; text-align: center; cursor: pointer; display: inline-block; padding: 3px 5px; font-size: 11px; color: #fff; border: 1px solid #636363; border-radius: 3px; background-color: #D02020; margin-top: 3px; margin-left: 5px; }');
		RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000; cursor: pointer; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; line-height: 22px; display: inline-block; margin-top: 2px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0 6px; border: 1px solid #c7c7c7; background-color: #fff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader .editButton { display: inline-block; padding: 0; width: 24px; -moz-box-sizing: border-box; vertical-align: middle; margin-left: 10px; } ');
		RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
		RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
		RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
		RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #fff; border-color: #699dcf; }');
		RESUtils.addCSS('ul.widgetStateButtons li { margin-right: 5px; }');
		RESUtils.addCSS('ul.widgetStateButtons li:last-child { margin-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #ddd; }');
		RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #ddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
		RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
		RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; padding-right: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
		RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
		RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0; }');
		RESUtils.addCSS('ul.widgetStateButtons li .res-icon { margin: 3px; }');
		RESUtils.addCSS('#userTaggerContents .show { display: inline-block; }');
		RESUtils.addCSS('#tagPageControls { display: inline-block; margin: 0 0 0 10px; }');
		// some styles to override /r/dashboard stylesheet.
		RESUtils.addCSS('#userTaggerContents, #newCommentsContents { margin-right: 305px; font-size: small; }');
		RESUtils.addCSS('#userTaggerContents table, #newCommentsContents table { margin: 0; width: 100%; }');
		RESUtils.addCSS('#userTaggerTable th, #newCommentsTable th, #userTaggerTable td, #newCommentsTable td { min-width: 0; padding: 5px 8px; border: 1px solid rgb(200,200,200); }');
		RESUtils.addCSS('#newCommentsTable th, #userTaggerTable th, #newCommentsTable td { white-space: nowrap; }');
		RESUtils.addCSS('#newCommentsTable td:first-child, #newCommentsTable th:first-child { width: auto; white-space: normal; }');
		RESUtils.addCSS('#newCommentsTable .deleteIcon, #userTaggerTable .deleteIcon { color: rgba(0,0,0,0); }');
		RESUtils.addCSS('#newCommentsTable tr:hover .deleteIcon, #userTaggerTable tr:hover .deleteIcon { color: #369; }');

		var dbLinks = $('span.redditname a');
		if ($(dbLinks).length > 1) {
			$(dbLinks[0]).addClass('active');
		}

		// add each subreddit widget...
		// add the "add widget" form...
		this.attachContainer();
		this.attachAddComponent();
		this.attachEditComponent();
		this.initUpdateQueue();
	},
	initUpdateQueue: function() {
		modules['dashboard'].updateQueue = [];
		for (var i in this.widgets)
			if (this.widgets[i]) this.addWidget(this.widgets[i]);

		setTimeout(function() {
			$('#RESDashboard').sortable({
				nested: false,
				handle: 'div.RESDashboardComponentHeader',
				itemSelector: '.RESDashboardComponent',
				placeholderClass: 'RESSortPlaceholder',
				placeholder: '<li class="RESSortPlaceholder"></li>',
				onCancel: function ($item, container, _super, event) {
					_super($item, container, _super, event);
					$(window).edgescroll('stop');
					$item.removeData('dragOffset');
				},
				onDrop: function($item, container, _super, event) {
					_super($item, container, _super, event);
					$item.removeData('dragOffset');
					$(window).edgescroll('stop');
					modules['dashboard'].saveOrder();
				},
				onDrag: function ($item, position, _super, event) {
					var dragOffset = $item.data('dragOffset');
					//Reposition the row, remembering to apply the offset
					$item.css({
						top: position.top - dragOffset.top,
						left: position.left - dragOffset.left
					});
				},
				onDragStart: function ($item, container, _super, event) {
					$(window).edgescroll({speed: 4});

					var offset = $item.offset(),
					    pointer = container.rootGroup.pointer;
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
	},
	addToUpdateQueue: function(updateFunction) {
		modules['dashboard'].updateQueue.push(updateFunction);
		if (!modules['dashboard'].updateQueueTimer) {
			modules['dashboard'].updateQueueTimer = setInterval(modules['dashboard'].processUpdateQueue, 2000);
			setTimeout(modules['dashboard'].processUpdateQueue, 100);
		}
	},
	processUpdateQueue: function() {
		var thisUpdate = modules['dashboard'].updateQueue.pop();
		thisUpdate();
		if (modules['dashboard'].updateQueue.length < 1) {
			clearInterval(modules['dashboard'].updateQueueTimer);
			delete modules['dashboard'].updateQueueTimer;
		}
	},
	saveOrder: function() {
		var data = $('#siteTable li.RESDashboardComponent').map(function() {
			return $(this).attr('id');
		}).get();
		data.reverse();
		var newOrder = [];
		modules['dashboard'].widgets.forEach(function(widget) {
			var newIndex = data.indexOf(widget.basePath.replace(/(\/|\+)/g, '_'));
			newOrder[newIndex] = widget;
		});
		modules['dashboard'].widgets = newOrder;
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	attachContainer: function() {
		this.siteTable = $('#siteTable.linklisting');
		$(this.siteTable).append('<div id="dashboardContents" class="dashboardPane" />');
		if ((location.hash !== '') && (location.hash !== '#dashboardContents')) {
			$('span.redditname a').removeClass('active');
			var activeTabID = location.hash.replace('#', '#tab-');
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
	},
	attachEditComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardEditComponent = $('<div id="RESDashboardEditComponent" class="RESDashboardComponent" />');
		$(this.dashboardEditComponent).html(' \
			<div class="editWidget">Edit widget</div> \
			<div id="editRedditFormContainer" class="editRedditForm"> \
				<form id="editRedditForm"> \
					<input type="text" id="editReddit"> \
					<input type="text" id="editRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="updateButton" value="save changes"> \
					<input type="cancel" class="cancelButton" value="cancel"> \
				</form> \
				<form id="editSearchForm"> \
					<input type="text" id="editSearch" placeholder="search terms"> \
					<input type="text" id="editSearchDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="updateButton" value="save changes"> \
					<input type="cancel" class="cancelButton" value="cancel"> \
				</form> \
			</div> \
		');

		$(this.dashboardEditComponent).find('#editRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#editReddit').val();
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
					}
					modules['dashboard'].widgetBeingEdited.formerBasePath = modules['dashboard'].widgetBeingEdited.basePath;
					modules['dashboard'].widgetBeingEdited.basePath = '/r/' + thisBasePath;
					modules['dashboard'].widgetBeingEdited.displayName = $('#editRedditDisplayName').val();
					modules['dashboard'].widgetBeingEdited.update();
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
					modules['dashboard'].widgetBeingEdited.widgetEle.find('.widgetPath').text(modules['dashboard'].widgetBeingEdited.displayName).attr('title', '/r/' + thisBasePath);
					modules['dashboard'].updateWidget();
				}
			}
		);
		$(this.dashboardEditComponent).find('#editSearchForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#editSearch').val();
				modules['dashboard'].widgetBeingEdited.formerBasePath = modules['dashboard'].widgetBeingEdited.basePath;
				modules['dashboard'].widgetBeingEdited.basePath = '/search?q=' + encodeURIComponent(thisBasePath);
				modules['dashboard'].widgetBeingEdited.displayName = $('#editSearchDisplayName').val();
				modules['dashboard'].widgetBeingEdited.update();
				$('#RESDashboardEditComponent').fadeOut(function() {
					$('#editSearch').val('').blur();
					$('#editSearchDisplayName').val('').blur();
				});
				modules['dashboard'].widgetBeingEdited.widgetEle.find('.widgetPath').text(modules['dashboard'].widgetBeingEdited.displayName).attr('title', thisBasePath);
				modules['dashboard'].updateWidget();
			}
		);
		$(this.dashboardEditComponent).find('.cancelButton').click(
			function(e) {
				if (modules['dashboard'].widgetBeingEdited.basePath.substr(0,10) === '/search?q=') {
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editSearchDisplayName').val('').blur();
					});
				} else {
					$('#editReddit').tokenInput('clear');
					$('#RESDashboardEditComponent').fadeOut(function() {
						$('#editReddit').blur();
					});
				}
			}
		);
		$(document.body).append(this.dashboardEditComponent);
	},
	showEditForm: function() {
		var basePath = modules['dashboard'].widgetBeingEdited.basePath;
		var widgetEle = modules['dashboard'].widgetBeingEdited.widgetEle;
		var eleTop = $(widgetEle).position().top;
		var eleWidth = $(widgetEle).width();
		$('#RESDashboardEditComponent').css('top', eleTop + 'px').css('left', '5px').css('width', (eleWidth + 2) + 'px');
		if(basePath.substr(0,10) === '/search?q=') {
			$('#editSearchDisplayName').val(modules['dashboard'].widgetBeingEdited.displayName);
			$('#editSearch').val(decodeURIComponent(basePath.substr(10)));
			$('#editSearchForm').show();
			$('#editRedditForm').hide();
			$('#RESDashboardEditComponent').fadeIn('fast');
		} else {
			$('#editRedditDisplayName').val(modules['dashboard'].widgetBeingEdited.displayName);
			$('#editRedditForm').show();
			$('#editSearchForm').hide();
			$('#RESDashboardEditComponent').fadeIn('fast');
			basePath = basePath.replace(/^\/r\//, '');
			var reddits = basePath.split('+'),
				prepop = reddits.map(function(reddit) {
					return {
						id: reddit,
						name: reddit
					};
				});
			if (typeof modules['dashboard'].firstEdit === 'undefined') {
				$('#editReddit').tokenInput('/api/search_reddit_names.json?app=res', {
					method: 'POST',
					queryParam: 'query',
					theme: 'facebook',
					allowFreeTagging: true,
					zindex: 999999999,
					onResult: function(response) {
						var names = response.names,
							results = names.map(function(name) {
								return {
									id: name,
									name: name
								};
							});
						if (names.length === 0) {
							var failedQueryValue = $('#token-input-editReddit').val();
							results.push({
								id: failedQueryValue,
								name: failedQueryValue,
								failedResult: true
							});
						}
						return results;
					},
					onCachedResult: function(response) {
						var names = response.names,
							results = names.map(function(name) {
								return {
									id: name,
									name: name
								};
							});
						if (names.length === 0) {
							var failedQueryValue = $('#token-input-editReddit').val();
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
					resultsFormatter: function(item) {
						var thisDesc = item.name;
						if (item['failedResult']) {
							thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
						}
						return '<li>' + thisDesc + '</li>';
					}
				});
				modules['dashboard'].firstEdit = true;
			} else {
				$('#editReddit').tokenInput('clear');
				prepop.forEach(function(value) {
					$('#editReddit').tokenInput('add', value);
				});
			}
		}
	},
	attachAddComponent: function() {
		this.dashboardContents = $('#dashboardContents');
		this.dashboardAddComponent = $('<div id="RESDashboardAddComponent" class="RESDashboardComponent" />');
		$(this.dashboardAddComponent).html(' \
			<div class="addNewWidget">Add a new widget</div> \
			<div id="addWidgetButtons"> \
				<div class="addButton" id="addSearchWidget">+search widget</div> \
				<div class="addButton" id="addMailWidget">+mail widget</div> \
				<div class="addButton" id="addUserWidget">+user widget</div> \
				<div class="addButton" id="addRedditWidget">+subreddit widget</div> \
			</div> \
			<div id="addSearchFormContainer" class="addSearchForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addSearchForm"> \
					<input type="text" id="addSearch" placeholder="search terms"> \
					<input type="text" id="addSearchDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
			<div id="addMailWidgetContainer"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/inbox/">+inbox</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/unread/">+unread</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/messages/">+messages</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/comments/">+comment replies</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/selfreply/">+post replies</div> \
				<div class="addButton widgetShortcut" widgetPath="/message/moderator/">+modmail</div> \
			</div> \
			<div id="addUserFormContainer" class="addUserForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addUserForm"> \
					<input type="text" id="addUser"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
			<div id="addRedditFormContainer" class="addRedditForm"> \
				<div class="backToWidgetTypes">&laquo; back</div> \
				<form id="addRedditForm"> \
					<input type="text" id="addReddit"> \
					<input type="text" id="addRedditDisplayName" placeholder="display name (e.g. stuff)"> \
					<input type="submit" class="addButton" value="+add"> \
				</form> \
			</div> \
		');
		$(this.dashboardAddComponent).find('.backToWidgetTypes').click(function(e) {
			$(this).parent().fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('.widgetShortcut').click(function(e) {
			var thisBasePath = $(this).attr('widgetPath');
			modules['dashboard'].addWidget({
				basePath: thisBasePath
			}, true);
			$('#addMailWidgetContainer').fadeOut(function() {
				$('#addWidgetButtons').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('#addRedditWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addRedditFormContainer').fadeIn(function() {
					$('#token-input-addReddit').focus();
				});
			});
		});
		$(this.dashboardAddComponent).find('#addMailWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addMailWidgetContainer').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('#addUserWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addUserFormContainer').fadeIn();
			});
		});
		$(this.dashboardAddComponent).find('#addSearchWidget').click(function(e) {
			$('#addWidgetButtons').fadeOut(function() {
				$('#addSearchFormContainer').fadeIn();
			});
		});

		var thisEle = $(this.dashboardAddComponent).find('#addReddit');
		$(thisEle).tokenInput('/api/search_reddit_names.json?app=res', {
			method: 'POST',
			queryParam: 'query',
			theme: 'facebook',
			allowFreeTagging: true,
			zindex: 999999999,
			onResult: function(response) {
				var names = response.names,
					results = names.map(function(name) {
						return {
							id: name,
							name: name
						};
					});
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
					results.push({
						id: failedQueryValue,
						name: failedQueryValue,
						failedResult: true
					});
				}
				return results;
			},
			onCachedResult: function(response) {
				var names = response.names,
					results = names.map(function(name) {
						return {
							id: name,
							name: name
						};
					});
				if (names.length === 0) {
					var failedQueryValue = $('#token-input-addReddit').val();
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
			resultsFormatter: function(item) {
				var thisDesc = item.name;
				if (item['failedResult']) {
					thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
				}
				return '<li>' + thisDesc + '</li>';
			}
		});

		$(this.dashboardAddComponent).find('#addRedditForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = $('#addReddit').val();
				if (thisBasePath !== '') {
					if (thisBasePath.indexOf(',') !== -1) {
						thisBasePath = thisBasePath.replace(/\,/g, '+');
					}
					var thisDisplayName = ($('#addRedditDisplayName').val()) ? $('#addRedditDisplayName').val() : thisBasePath;
					modules['dashboard'].addWidget({
						basePath: thisBasePath,
						displayName: thisDisplayName
					}, true);
					// $('#addReddit').val('').blur();
					$('#addReddit').tokenInput('clear');
					$('#addRedditFormContainer').fadeOut(function() {
						$('#addReddit').blur();
						$('#addWidgetButtons').fadeIn();
					});
				}
			}
		);
		$(this.dashboardAddComponent).find('#addUserForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = '/user/' + $('#addUser').val();
				modules['dashboard'].addWidget({
					basePath: thisBasePath
				}, true);
				$('#addUser').val('').blur();
				$('#addUserFormContainer').fadeOut(function() {
					$('#addWidgetButtons').fadeIn();
				});
			}
		);
		$(this.dashboardAddComponent).find('#addSearchForm').submit(
			function(e) {
				e.preventDefault();
				var thisBasePath = '/search?q=' + encodeURIComponent($('#addSearch').val());
				var thisDisplayName = ($('#addSearchDisplayName').val()) ? $('#addSearchDisplayName').val() : thisBasePath;
				modules['dashboard'].addWidget({
					basePath: thisBasePath,
					displayName: thisDisplayName
				}, true);
				$('#addSearch').val('').blur();
				$('#addSearchFormContainer').fadeOut(function() {
					$('#addWidgetButtons').fadeIn();
				});
			}
		);
		$(this.dashboardContents).append(this.dashboardAddComponent);
		this.dashboardUL = $('<ul id="RESDashboard"></ul>');
		$(this.dashboardContents).append(this.dashboardUL);
	},
	addWidget: function(optionsObject, isNew) {
		if (optionsObject.basePath.slice(0, 1) !== '/') {
			optionsObject.basePath = '/r/' + optionsObject.basePath;
		}
		var exists = modules['dashboard'].widgets.some(function(widget) {
			return widget.basePath === optionsObject.basePath;
		});
		// hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
		setTimeout(function() {
			$('.widgetShortcut[widgetPath="' + optionsObject.basePath + '"]').hide();
		}, 1000);
		if (exists && isNew) {
			alert('A widget for ' + optionsObject.basePath + ' already exists!');
		} else {
			var thisWidget = new this.widgetObject(optionsObject);
			thisWidget.init();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		}
	},
	removeWidget: function(optionsObject) {
		this.getLatestWidgets();
		var exists;
		modules['dashboard'].widgets = modules['dashboard'].widgets.filter(function(widget) {
			if (widget.basePath === optionsObject.basePath) {
				exists = true;
				$(document.getElementById(widget.basePath.replace(/\/|\+/g, '_'))).fadeOut('slow', function(ele) {
					$(this).detach();
				});
				// show any shortcut button for this widget, since we've now deleted it...
				setTimeout(function() {
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
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	saveWidget: function(optionsObject, init) {
		this.getLatestWidgets();

		var index = modules['dashboard'].widgets.findIndex(function(widget) {
			return widget.basePath === optionsObject.basePath;
		});

		// update if exists else append
		if (index === -1) {
			index = modules['dashboard'].widgets.length;
		}
		modules['dashboard'].widgets[index] = optionsObject;

		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	updateWidget: function() {
		this.getLatestWidgets();
		modules['dashboard'].widgets = modules['dashboard'].widgets.map(function(widget) {
			if (widget.basePath === modules['dashboard'].widgetBeingEdited.formerBasePath) {
				delete modules['dashboard'].widgetBeingEdited.formerBasePath;
				widget = modules['dashboard'].widgetBeingEdited.optionsObject();
			}
			return widget;
		});
		RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules['dashboard'].widgets));
	},
	widgetObject: function(widgetOptions) {
		var thisWidget = this; // keep a reference because the this keyword can mean different things in different scopes...
		thisWidget.basePath = widgetOptions.basePath;
		if ((typeof widgetOptions.displayName === 'undefined') || (widgetOptions.displayName === null)) {
			widgetOptions.displayName = thisWidget.basePath;
		}
		thisWidget.displayName = widgetOptions.displayName;
		thisWidget.numPosts = widgetOptions.numPosts || modules['dashboard'].options.defaultPosts.value;
		thisWidget.sortBy = widgetOptions.sortBy || modules['dashboard'].options.defaultSort.value;
		thisWidget.minimized = widgetOptions.minimized || false;
		thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="' + thisWidget.basePath.replace(/\/|\+/g, '_') + '"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="' + modules['dashboard'].loader + '"><span>querying the server. one moment please.</span></div></div></li>');
		thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="' + thisWidget.basePath + '" href="' + thisWidget.basePath + '"></a></div>');
		thisWidget.header.find('.widgetPath').text(thisWidget.displayName);
		thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="rising">rising</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
		// return an optionsObject, which is what we'll store in the modules['dashboard'].widgets array.
		thisWidget.optionsObject = function() {
			return {
				basePath: thisWidget.basePath,
				displayName: thisWidget.displayName,
				numPosts: thisWidget.numPosts,
				sortBy: thisWidget.sortBy,
				minimized: thisWidget.minimized
			};
		};
		// set the sort by properly...
		$(thisWidget.sortControls).find('li[sort=' + thisWidget.sortBy + ']').addClass('active');
		$(thisWidget.sortControls).find('li').click(function(e) {
			thisWidget.sortChange($(e.target).attr('sort'));
		});
		$(thisWidget.header).append(thisWidget.sortControls);
		if ((thisWidget.basePath.indexOf('/r/') !== 0) && (thisWidget.basePath.indexOf('/user/') !== 0)) {
			setTimeout(function() {
				$(thisWidget.sortControls).hide();
			}, 100);
		}
		thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><span class="res-icon">&#xF0B0;</span></li><li action="refreshAll" class="refreshAll">Refresh All</li><li action="addRow">+row</li><li action="subRow">-row</li><li action="edit" class="editButton"><span class="res-icon">&#xF139;</span></li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">&times;</li></ul>');
		$(thisWidget.stateControls).find('li').click(function(e) {
			switch ($(e.target).attr('action')) {
				case 'refresh':
					thisWidget.update();
					break;
				case 'refreshAll':
					$('li[action="refresh"]').click();
					break;
				case 'addRow':
					if (thisWidget.numPosts === modules.dashboard.MAX_ROWS) break;
					thisWidget.numPosts++;
					if (thisWidget.numPosts === modules.dashboard.MAX_ROWS) $(thisWidget.stateControls).find('li[action=addRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=subRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'subRow':
					if (thisWidget.numPosts === 0) break;
					thisWidget.numPosts--;
					if (thisWidget.numPosts === 1) $(thisWidget.stateControls).find('li[action=subRow]').addClass('disabled');
					$(thisWidget.stateControls).find('li[action=addRow]').removeClass('disabled');
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					thisWidget.update();
					break;
				case 'minimize':
					$(thisWidget.widgetEle).toggleClass('minimized');
					if ($(thisWidget.widgetEle).hasClass('minimized')) {
						$(e.target).text('+');
						thisWidget.minimized = true;
					} else {
						$(e.target).text('-');
						thisWidget.minimized = false;
						thisWidget.update();
					}
					$(thisWidget.contents).parent().slideToggle();
					modules['dashboard'].saveWidget(thisWidget.optionsObject());
					break;
				case 'delete':
					modules['dashboard'].removeWidget(thisWidget.optionsObject());
					break;
			}
		});
		$(thisWidget.header).append(thisWidget.stateControls);
		thisWidget.sortChange = function(sortBy) {
			thisWidget.sortBy = sortBy;
			$(thisWidget.header).find('ul.widgetSortButtons li').removeClass('active');
			$(thisWidget.header).find('ul.widgetSortButtons li[sort=' + sortBy + ']').addClass('active');
			thisWidget.update();
			modules['dashboard'].saveWidget(thisWidget.optionsObject());
		};
		thisWidget.edit = function(e) {
			modules['dashboard'].widgetBeingEdited = thisWidget;
			modules['dashboard'].showEditForm();
		};
		$(thisWidget.header).find('.editButton').click(thisWidget.edit);
		thisWidget.update = function() {
			if (thisWidget.basePath.indexOf('/user/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '?sort=' + thisWidget.sortBy;
			} else if (thisWidget.basePath.indexOf('/r/') !== -1) {
				thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '/' + thisWidget.sortBy + '/';
			} else {
				thisWidget.sortPath = '';
			}
			thisWidget.url = location.protocol + '//' + location.hostname + '/' + thisWidget.basePath + thisWidget.sortPath;
			$(thisWidget.contents).fadeTo('fast', 0.25);
			$(thisWidget.scrim).fadeIn();
			$.ajax({
				url: thisWidget.url,
				data: {
					limit: thisWidget.numPosts
				},
				success: thisWidget.populate,
				error: thisWidget.error
			});
		};
		thisWidget.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
		if (thisWidget.minimized) {
			$(thisWidget.container).addClass('minimized');
			$(thisWidget.stateControls).find('li.minimize').addClass('minimized').text('+');
		}
		thisWidget.scrim = $(thisWidget.widgetEle).find('.RESDashboardComponentScrim');
		thisWidget.contents = $(thisWidget.container).find('.RESDashboardComponentContents');
		thisWidget.init = function() {
			if (RESUtils.currentSubreddit('dashboard')) {
				thisWidget.draw();
				if (!thisWidget.minimized) modules['dashboard'].addToUpdateQueue(thisWidget.update);
			}
		};
		thisWidget.draw = function() {
			$(thisWidget.widgetEle).append(thisWidget.header);
			$(thisWidget.widgetEle).append(thisWidget.container);
			if (thisWidget.minimized) $(thisWidget.widgetEle).addClass('minimized');
			modules['dashboard'].dashboardUL.prepend(thisWidget.widgetEle);
			// $(thisWidget.scrim).fadeIn();
		};
		thisWidget.populate = function(response) {
			var $widgetContent = $(response).find('#siteTable, .search-result-group>.contents:last'),
				$thisWidgetContents = $(thisWidget.contents),
				$noResults;

			$widgetContent.attr('id', 'siteTable_' + thisWidget.basePath.replace(/\/|\+/g, '_'));
			if ($widgetContent.length === 2) $widgetContent = $($widgetContent[1]);
			$widgetContent.attr('url', thisWidget.url + '?limit=' + thisWidget.numPosts);
			if (($widgetContent.length > 0) && ($widgetContent.html() !== '')) {
				$widgetContent.html($widgetContent.html().replace(/<script(.|\s)*?\/script>/g, ''));

				// check for "no results"
				$noResults = $widgetContent.find('#noresults.error');
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
				$(thisWidget.scrim).fadeOut(function(e) {
					$(this).hide(); // make sure it is hidden in case the element isn't visible due to being on a different dashboard tab
				});
			} else {
				if (thisWidget.url.indexOf('/message/') !== -1) {
					$thisWidgetContents.html('<div class="widgetNoMail">No messages were found.</div>');
				} else {
					$thisWidgetContents.html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
				}
				$thisWidgetContents.fadeTo('fast', 1);
				$(thisWidget.scrim).fadeOut();
			}
			$(thisWidget.stateControls).find('.updateTime').text('updated: ' + RESUtils.niceDateTime());

			// now run watcher functions from other modules on this content...
			if (typeof $widgetContent[0] !== 'undefined') {
				RESUtils.watchers.siteTable.forEach(function(callback) {
					if (callback) callback($widgetContent[0]);
				});
			}
		};
		thisWidget.error = function(xhr, err) {
			// alert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
			// modules['dashboard'].removeWidget(thisWidget.optionsObject());
			if (xhr.status === 404) {
				$(thisWidget.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
			} else {
				$(thisWidget.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
			}
			$(thisWidget.scrim).fadeOut();
			$(thisWidget.contents).fadeTo('fast', 1);
		};
	},
	addDashboardShortcuts: function() {
		var subButtons = document.querySelectorAll('.side .fancy-toggle-button');
		for (var h = 0, len = subButtons.length; h < len; h++) {
			var subButton = subButtons[h],
				isMulti, thisSubredditFragment;
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
				var subButtonsWrapper = $('<div id="subButtons-' + thisSubredditFragment + '" class="subButtons" style="margin: 0 !important;"></div>');
				$(subButton).wrap(subButtonsWrapper);
				// move this wrapper to the end (after any icons that may exist...)
				if (isMulti) {
					var theWrap = $(subButton).parent();
					$(theWrap).appendTo($(theWrap).parent());
				}
			}
			var dashboardToggle = document.createElement('span');
			dashboardToggle.setAttribute('class', 'res-fancy-toggle-button RESDashboardToggle REStoggle');
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			var exists = this.widgets.some(function(widget) {
				return (widget &&
					(widget.basePath.toLowerCase() === '/r/' + thisSubredditFragment.toLowerCase()));
			});
			if (exists) {
				dashboardToggle.textContent = '-dashboard';
				dashboardToggle.setAttribute('title', 'Remove this subreddit from your dashboard');
				dashboardToggle.classList.add('remove');
			} else {
				dashboardToggle.textContent = '+dashboard';
				dashboardToggle.setAttribute('title', 'Add this subreddit to your dashboard');
			}
			dashboardToggle.setAttribute('data-subreddit', thisSubredditFragment);
			dashboardToggle.addEventListener('click', modules['dashboard'].toggleDashboard, false);
			$('#subButtons-' + thisSubredditFragment).append(dashboardToggle);
			var next = $('#subButtons-' + thisSubredditFragment).next();
			if ($(next).hasClass('title') && (!$('#subButtons-' + thisSubredditFragment).hasClass('swapped'))) {
				$('#subButtons-' + thisSubredditFragment).before($(next));
				$('#subButtons-' + thisSubredditFragment).addClass('swapped');
			}
		}
	},
	toggleDashboard: function(e) {
		var thisBasePath = '/r/' + $(e.target).data('subreddit');
		if (e.target.classList.contains('remove')) {
			modules['dashboard'].removeWidget({
				basePath: thisBasePath
			}, true);
			e.target.textContent = '+dashboard';
			e.target.classList.remove('remove');
		} else {
			modules['dashboard'].addWidget({
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
	},
	addTab: function(tabID, tabName) {
		$('#siteTable.linklisting').append('<div id="' + tabID + '" class="dashboardPane" />');
		$('span.redditname').append('<a id="tab-' + tabID + '" class="dashboardTab" title="' + tabName + '">' + tabName + '</a>');
		$('#tab-' + tabID).click(function(e) {
			location.hash = tabID;
			$('span.redditname a').removeClass('active');
			$(this).addClass('active');
			$('.dashboardPane').hide();
			$('#' + tabID).show();
		});
	}
});
