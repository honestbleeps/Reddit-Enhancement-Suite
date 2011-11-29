modules.dashboard = {
    moduleID: 'dashboard',
    moduleName: 'RES Dashboard',
    category: 'UI',
    options: {
        defaultPosts: {
            type: 'text',
            value: 3,
            description: 'Number of posts to show by default in each widget'
        },
        defaultSort: {
            type: 'enum',
            values: [
                { name: 'hot', value: 'hot' },
                { name: 'new', value: 'new' },
                { name: 'controversial', value: 'controversial' },
                { name: 'top', value: 'top' }
            ],
            value: 'hot',
            description: 'Default sort method for new widgets'
        }
    },
    description: 'RES Dashboard',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.\/]*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            $('#RESDropdownOptions').prepend('<li id="DashboardLink"><a href="/r/Dashboard">my dashboard</a></li>');
            if (RESUtils.currentSubreddit()) {
                RESUtils.addCSS('.RESDashboardToggle {}');
                try {
                    this.widgets = JSON.parse(RESStorage.getItem('RESmodules.dashboard.' + RESUtils.loggedInUser())) || [];
                } catch (e) {
                    this.widgets = [];
                }
                // one more safety check... not sure how people's widgets[] arrays are breaking.
                if (!(this.widgets instanceof Array)) {
                    this.widgets = [];
                }
                if (RESUtils.currentSubreddit('dashboard')) {
                    $('#noresults, #header-bottom-left .tabmenu').hide();
                    $('#header-bottom-left .redditname a').html('My Dashboard');
                    this.drawDashboard();
                }
                this.addDashboardShortcuts();
            }
        }
    },
    loader: 'data:image/gif;base64,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',
    drawDashboard: function() {
        RESUtils.addCSS('.RESDashboardComponent { position: relative; border: 1px solid #cccccc; border-radius: 3px 3px 3px 3px; overflow: hidden; margin-bottom: 10px; }');
        RESUtils.addCSS('.RESDashboardComponentHeader { box-sizing: border-box; padding: 5px 0px 5px 0px; background-color: #f0f3fc; height: 38px; }');
        RESUtils.addCSS('.RESDashboardComponentScrim { position: absolute; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 5; display: none; }');
        RESUtils.addCSS('.RESDashboardComponentLoader { box-sizing: border-box; position: absolute; background-color: #f2f9ff; border: 1px solid #b9d7f4; border-radius: 3px 3px 3px 3px; width: 314px; height: 40px; left: 50%; top: 50%; margin-left: -167px; margin-top: -20px; text-align: center; padding-top: 11px; }');
        RESUtils.addCSS('.RESDashboardComponentLoader span { position: relative; top: -6px; left: 5px; } ');
        RESUtils.addCSS('.RESDashboardComponentContainer { padding: 10px 15px 0px 15px; min-height: 100px; }');
        RESUtils.addCSS('.RESDashboardComponentContainer.minimized { display: none; }');
        RESUtils.addCSS('.RESDashboardComponent a.widgetPath, .addNewWidget { display: inline-block; margin-left: 0px; margin-top: 7px; color: #000000; font-weight: bold; }');
        RESUtils.addCSS('.RESDashboardComponent a.widgetPath { margin-left: 15px; vertical-align: top; width: 120px; overflow: hidden; text-overflow: ellipsis; }');
        RESUtils.addCSS('#RESDashboardAddComponent { box-sizing: border-box; padding: 5px 8px 5px 8px; vertical-align: middle; background-color: #cee3f8; border: 1px solid #336699;}');
        // RESUtils.addCSS('#RESDashboardComponentScrim, #RESDashboardComponentLoader { background-color: #cccccc; opacity: 0.3; border: 1px solid red; display: none; }');
        RESUtils.addCSS('#addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { display: none; }');
        RESUtils.addCSS('#addWidgetButtons, #addRedditFormContainer, #addMailWidgetContainer, #addUserFormContainer { width: 550px; height: 28px; float: right; text-align: right; }');
        RESUtils.addCSS('#addUserForm, #addRedditForm { display: inline-block }');
        RESUtils.addCSS('#addUser { width: 200px; height: 24px; }');
        RESUtils.addCSS('#addRedditFormContainer ul.token-input-list-facebook { float: left; }');
        RESUtils.addCSS('#addReddit { width: 115px; background-color: #ffffff; border: 1px solid #96bfe8; margin-left: 6px; margin-right: 6px; padding: 1px 2px 1px 2px; }');
        RESUtils.addCSS('.addButton { cursor: pointer; display: inline-block; width: auto; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 11px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; margin-top: 3px; margin-left: 5px; }');
        RESUtils.addCSS('.backToWidgetTypes { display: inline-block; vertical-align: top; margin-top: 8px; font-weight: bold; color: #000000; cursor: pointer; }');
        RESUtils.addCSS('.RESDashboardComponentHeader ul { font-family: Verdana; font-size: 13px; box-sizing: border-box; height: 14px; line-height: 22px; display: inline-block; margin-top: 2px; }');
        RESUtils.addCSS('.RESDashboardComponentHeader ul li { box-sizing: border-box; vertical-align: middle; height: 24px; display: inline-block; cursor: pointer; padding: 0px 6px 0px 6px; border: 1px solid #c7c7c7; background-color: #ffffff; color: #6c6c6c; border-radius: 3px 3px 3px 3px; }');
        RESUtils.addCSS('.RESDashboardComponent.minimized ul li { display: none; }');
        RESUtils.addCSS('.RESDashboardComponent.minimized li.RESClose, .RESDashboardComponent.minimized li.minimize { display: inline-block; }');
        RESUtils.addCSS('ul.widgetSortButtons li { margin-right: 10px; }');
        RESUtils.addCSS('.RESDashboardComponentHeader ul li.active, .RESDashboardComponentHeader ul li:hover { background-color: #a6ccf1; color: #ffffff; border-color: #699dcf; }');
        RESUtils.addCSS('ul.widgetStateButtons li { margin-left: 10px; }');
        RESUtils.addCSS('ul.widgetStateButtons li.disabled { background-color: #dddddd; }');
        RESUtils.addCSS('ul.widgetStateButtons li.disabled:hover { cursor: auto; background-color: #dddddd; color: #6c6c6c; border: 1px solid #c7c7c7; }');
        RESUtils.addCSS('ul.widgetSortButtons { margin-left: 10px; }');
        RESUtils.addCSS('ul.widgetStateButtons { float: right; margin-right: 8px; }');
        RESUtils.addCSS('ul.widgetStateButtons li.updateTime { cursor: auto; background: none; border: none; color: #afafaf; font-size: 9px; }');
        RESUtils.addCSS('ul.widgetStateButtons li.minimize, ul.widgetStateButtons li.close { font-size: 24px; }');
        RESUtils.addCSS('.minimized ul.widgetStateButtons li.minimize { font-size: 14px; }');
        RESUtils.addCSS('ul.widgetStateButtons li.refresh { margin-left: 3px; width: 24px; position:relative; padding: 0px 0px; }');
        RESUtils.addCSS('ul.widgetStateButtons li.refresh div { height: 16px; width: 16px; position: absolute; left: 4px; top: 4px; background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); background-repeat: no-repeat; background-position: -16px -209px; }');

        // add each subreddit widget...
        // add the "add widget" form...
        this.attachAddComponent();
        this.initUpdateQueue();
    },
    initUpdateQueue: function() {
        modules.dashboard.updateQueue = [];
        for (i in this.widgets) if (this.widgets[i]) this.addWidget(this.widgets[i]);
        setTimeout(function () {
            $('#RESDashboard').dragsort({ dragSelector: "div.RESDashboardComponentHeader", dragSelectorExclude: 'a, li, li.refresh > div', dragEnd: modules.dashboard.saveOrder, placeHolderTemplate: "<div class='placeHolder'><div></div></div>" });
        }, 300);
    },
    addToUpdateQueue: function(updateFunction) {
        modules.dashboard.updateQueue.push(updateFunction);
        if (!modules.dashboard.updateQueueTimer) {
            modules.dashboard.updateQueueTimer = setInterval(modules.dashboard.processUpdateQueue, 2000);
            setTimeout(modules.dashboard.processUpdateQueue, 100);
        }
    },
    processUpdateQueue: function() {
        var thisUpdate = modules.dashboard.updateQueue.pop();
        thisUpdate();
        if (modules.dashboard.updateQueue.length < 1) {
            clearInterval(modules.dashboard.updateQueueTimer);
            delete modules.dashboard.updateQueueTimer;
        }
    },
    saveOrder: function() {
        var data = $("#siteTable li.RESDashboardComponent").map(function() { return $(this).attr("id"); }).get();
        data.reverse();
        var newOrder = [];
        for (var i=0, len=modules.dashboard.widgets.length; i<len; i++) {
            var newIndex = data.indexOf(modules.dashboard.widgets[i].basePath.replace(/(\/|\+)/g, '_'));
            newOrder[newIndex] = modules.dashboard.widgets[i];
        }
        modules.dashboard.widgets = newOrder;
        delete newOrder;
        RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules.dashboard.widgets));
    },
    attachAddComponent: function() {
        this.siteTable = $('#siteTable.linklisting');
        this.dashboardAddComponent = $('<div id="RESDashboardAddComponent" class="RESDashboardComponent" />');
        $(this.dashboardAddComponent).html(' \
            <div class="addNewWidget">Add a new widget</div> \
            <div id="addWidgetButtons"> \
                <div class="addButton" id="addMailWidget">+mail widget</div> \
                <div class="addButton" id="addUserWidget">+user widget</div> \
                <div class="addButton" id="addRedditWidget">+subreddit widget</div> \
            </div> \
            <div id="addMailWidgetContainer"> \
                <div class="backToWidgetTypes">&laquo; back</div> \
                <div class="addButton widgetShortcut" widgetPath="/message/inbox/">+inbox</div> \
                <div class="addButton widgetShortcut" widgetPath="/message/unread/">+unread</div> \
                <div class="addButton widgetShortcut" widgetPath="/message/messages/">+messages</div> \
                <div class="addButton widgetShortcut" widgetPath="/message/comments/">+comment replies</div> \
                <div class="addButton widgetShortcut" widgetPath="/message/selfreply/">+post replies</div> \
            </div> \
            <div id="addUserFormContainer" class="addUserForm"> \
                <div class="backToWidgetTypes">&laquo; back</div> \
                <form id="addUserForm"><input type="text" id="addUser"><input type="submit" class="addButton" value="+add"></form> \
            </div> \
            <div id="addRedditFormContainer" class="addRedditForm"> \
                <div class="backToWidgetTypes">&laquo; back</div> \
                <form id="addRedditForm"><input type="text" id="addReddit"><input type="submit" class="addButton" value="+add"></form> \
            </div> \
        ');
        $(this.dashboardAddComponent).find('.backToWidgetTypes').click(function(e) {
            $(this).parent().fadeOut(function() {
                $('#addWidgetButtons').fadeIn();
            });
        });
        $(this.dashboardAddComponent).find('.widgetShortcut').click(function(e) {
            var thisBasePath = $(this).attr('widgetPath');
            modules.dashboard.addWidget({
                basePath: thisBasePath
            }, true);
            $('#addMailWidgetContainer').fadeOut(function() {
                $('#addWidgetButtons').fadeIn();
            });
        });
        $(this.dashboardAddComponent).find('#addRedditWidget').click(function(e) {
            $('#addWidgetButtons').fadeOut(function() {
                $('#addRedditFormContainer').fadeIn();
            });
        });
        $(this.dashboardAddComponent).find('#addMailWidget').click(function(e) {
            $('#addWidgetButtons').fadeOut(function() {
                $('#addMailWidgetContainer').fadeIn();
            });
        });;
        $(this.dashboardAddComponent).find('#addUserWidget').click(function(e) {
            $('#addWidgetButtons').fadeOut(function() {
                $('#addUserFormContainer').fadeIn();
            });
        });;
        var thisEle = $(this.dashboardAddComponent).find('#addReddit');
        $(thisEle).tokenInput('/api/search_reddit_names.json', {
            method: "POST",
            queryParam: "query",
            theme: "facebook",
            onResult: function(response) {
                        var names = response.names;
                        var results = [];
                        for (var i=0, len=names.length; i<len; i++) {
                            results.push({id: names[i], name: names[i]});
                        }
                        if (names.length === 0) {
                            var failedQueryValue = $('#token-input-addReddit').val();
                            results.push({id: failedQueryValue, name: failedQueryValue, failedResult: true});
                        }
                        return results;
                    },
            /* prePopulate: prepop, */
            searchingText: 'Searching for matching reddits - may take a few seconds...',
            hintText: 'Type one or more subreddits for which to create a widget.',
            resultsFormatter: function(item) { 
                var thisDesc = item[this.propertyToSearch];
                if (item['failedResult']) thisDesc += ' - [this subreddit may not exist, ensure proper spelling]';
                return "<li>" + thisDesc + "</li>" 
            }
        });
        
        $(this.dashboardAddComponent).find('#addRedditForm').submit(
            function(e) {
                e.preventDefault();
                var thisBasePath = $('#addReddit').val();
                if (thisBasePath != '') {
                    if (thisBasePath.indexOf(',') != -1) {
                        thisBasePath = thisBasePath.replace(/\,/g,'+');
                    }
                    modules.dashboard.addWidget({
                        basePath: thisBasePath
                    }, true);
                    // $('#addReddit').val('').blur();
                    $('#addReddit').tokenInput('clear');
                    $('#addRedditFormContainer').fadeOut(function() {
                        $('#addWidgetButtons').fadeIn();
                    });
                }
            }
        );
        $(this.dashboardAddComponent).find('#addUserForm').submit(
            function(e) {
                e.preventDefault();
                var thisBasePath = '/user/'+$('#addUser').val();
                modules.dashboard.addWidget({
                    basePath: thisBasePath
                }, true);
                $('#addUser').val('').blur();
                $('#addUserFormContainer').fadeOut(function() {
                    $('#addWidgetButtons').fadeIn();
                });
                
            }
        );
        $(this.siteTable).append(this.dashboardAddComponent);
        this.dashboardUL = $('<ul id="RESDashboard"></ul>');
        $(this.siteTable).append(this.dashboardUL);
    },
    addWidget: function(optionsObject, isNew) {
        if (optionsObject.basePath.slice(0,1) != '/') optionsObject.basePath = '/r/'+optionsObject.basePath;
        var exists=false;
        for (var i=0, len=this.widgets.length; i<len; i++) {
            if (this.widgets[i].basePath === optionsObject.basePath) {
                exists=true;
                break;
            }
        }
        // hide any shortcut button for this widget, since it exists... wait a second, though, or it causes rendering stupidity.
        setTimeout(function() {
            $('.widgetShortcut[widgetPath="'+optionsObject.basePath+'"]').hide();
        }, 1000);
        if (exists && isNew) {
            RESAlert('A widget for '+optionsObject.basePath+' already exists!');
        } else {
            var thisWidget = new this.widgetObject(optionsObject);
            thisWidget.init();
            modules.dashboard.saveWidget(thisWidget.optionsObject());
        }
    },
    removeWidget: function(optionsObject) {
        var exists = false;
        for (var i=0, len=modules.dashboard.widgets.length; i<len; i++) {
            if (modules.dashboard.widgets[i].basePath === optionsObject.basePath) {
                exists = true;
                $('#'+modules.dashboard.widgets[i].basePath.replace(/\/|\+/g,'_')).fadeOut('slow', function(ele) {
                    $(this).detach();
                });
                modules.dashboard.widgets.splice(i,1);
                // show any shortcut button for this widget, since we've now deleted it...
                setTimeout(function() {
                    $('.widgetShortcut[widgetPath="'+optionsObject.basePath+'"]').show();
                }, 1000);
                break;
            }
        }
        if (!exists) RESUtils.notification('Error, the widget you just tried to remove does not seem to exist.');
        RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules.dashboard.widgets));
    },
    saveWidget: function(optionsObject, init) {
        var exists = false;
        for (var i=0, len=modules.dashboard.widgets.length; i<len; i++) {
            if (modules.dashboard.widgets[i].basePath === optionsObject.basePath) {
                exists = true;
                modules.dashboard.widgets[i] = optionsObject;
            }
        }
        if (!exists) modules.dashboard.widgets.push(optionsObject);
        RESStorage.setItem('RESmodules.dashboard.' + RESUtils.loggedInUser(), JSON.stringify(modules.dashboard.widgets));
    },
    widgetObject: function(widgetOptions) {
        var thisWidget = this; // keep a reference because the this keyword can mean different things in different scopes...
        thisWidget.basePath = widgetOptions.basePath;
        thisWidget.numPosts = widgetOptions.numPosts || modules.dashboard.options.defaultPosts.value;
        thisWidget.sortBy = widgetOptions.sortBy || modules.dashboard.options.defaultSort.value;
        thisWidget.minimized = widgetOptions.minimized || false;
        thisWidget.widgetEle = $('<li class="RESDashboardComponent" id="'+thisWidget.basePath.replace(/\/|\+/g,'_')+'"><div class="RESDashboardComponentScrim"><div class="RESDashboardComponentLoader"><img id="dashboardLoader" src="'+modules.dashboard.loader+'"><span>querying the server. one moment please.</span></div></div></li>');
        thisWidget.header = $('<div class="RESDashboardComponentHeader"><a class="widgetPath" title="'+thisWidget.basePath+'" href="'+thisWidget.basePath+'">'+thisWidget.basePath+'</a></div>');
        thisWidget.sortControls = $('<ul class="widgetSortButtons"><li sort="hot">hot</li><li sort="new">new</li><li sort="controversial">controversial</li><li sort="top">top</li></ul>');
        // return an optionsObject, which is what we'll store in the modules.dashboard.widgets array.
        thisWidget.optionsObject = function() {
            return {
                basePath: thisWidget.basePath,
                numPosts: thisWidget.numPosts,
                sortBy: thisWidget.sortBy,
                minimized: thisWidget.minimized 
            }
        }
        // set the sort by properly...
        $(thisWidget.sortControls).find('li[sort='+thisWidget.sortBy+']').addClass('active');
        $(thisWidget.sortControls).find('li').click(function(e) {
            thisWidget.sortChange($(e.target).attr('sort'));
        });
        $(thisWidget.header).append(thisWidget.sortControls);
        if ((thisWidget.basePath.indexOf('/r/') != 0) && (thisWidget.basePath.indexOf('/user/') != 0)) {
            setTimeout(function() {
                $(thisWidget.sortControls).hide();
            }, 100);
        }
        thisWidget.stateControls = $('<ul class="widgetStateButtons"><li class="updateTime"></li><li action="refresh" class="refresh"><div action="refresh"></div></li><li action="addRow">+row</li><li action="subRow">-row</li><li action="minimize" class="minimize">-</li><li action="delete" class="RESClose">X</li></ul>');
        $(thisWidget.stateControls).find('li').click(function (e) {
            switch ($(e.target).attr('action')) {
                case 'refresh':
                    thisWidget.update();
                    break;
                case 'addRow':
                    if (thisWidget.numPosts === 10) break;
                    thisWidget.numPosts++;
                    if (thisWidget.numPosts === 10) $(thisWidget.stateControls).find('li[action=addRow]').addClass('disabled');
                    $(thisWidget.stateControls).find('li[action=subRow]').removeClass('disabled');
                    modules.dashboard.saveWidget(thisWidget.optionsObject());
                    thisWidget.update();
                    break;
                case 'subRow':
                    if (thisWidget.numPosts === 0) break;
                    thisWidget.numPosts--;
                    if (thisWidget.numPosts === 1) $(thisWidget.stateControls).find('li[action=subRow]').addClass('disabled');
                    $(thisWidget.stateControls).find('li[action=addRow]').removeClass('disabled');
                    modules.dashboard.saveWidget(thisWidget.optionsObject());
                    thisWidget.update();
                    break;
                case 'minimize':
                    $(thisWidget.widgetEle).toggleClass('minimized');
                    if ($(thisWidget.widgetEle).hasClass('minimized')) {
                        $(e.target).html('+');
                        thisWidget.minimized = true;
                    } else {
                        $(e.target).html('-');
                        thisWidget.minimized = false;
                        thisWidget.update();
                    }
                    $(thisWidget.contents).parent().slideToggle();
                    modules.dashboard.saveWidget(thisWidget.optionsObject());
                    break;
                case 'delete':
                    modules.dashboard.removeWidget(thisWidget.optionsObject());
                    break;
            }
        });
        $(thisWidget.header).append(thisWidget.stateControls);
        thisWidget.sortChange = function(sortBy) {
            thisWidget.sortBy = sortBy;
            $(thisWidget.header).find('ul.widgetSortButtons li').removeClass('active');
            $(thisWidget.header).find('ul.widgetSortButtons li[sort='+sortBy+']').addClass('active');
            thisWidget.update();
            modules.dashboard.saveWidget(thisWidget.optionsObject());
        }
        thisWidget.update = function() {
            if (thisWidget.basePath.match(/\/user\//)) {
                thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '?sort='+thisWidget.sortBy;
            } else if (thisWidget.basePath.match(/\/r\//)) {
                thisWidget.sortPath = (thisWidget.sortBy === 'hot') ? '/' : '/'+thisWidget.sortBy+'/';
            } else {
                thisWidget.sortPath = '';
            }
            thisWidget.url = location.protocol + '//' + location.hostname + '/' + thisWidget.basePath + thisWidget.sortPath;
            $(thisWidget.contents).fadeTo('fast',0.25);
            $(thisWidget.scrim).fadeIn();
            $.ajax({
                url: thisWidget.url,
                data: {
                    limit: thisWidget.numPosts
                },
                success: thisWidget.populate,
                error: thisWidget.error
            });
        }
        thisWidget.container = $('<div class="RESDashboardComponentContainer"><div class="RESDashboardComponentContents"></div></div>');
        if (thisWidget.minimized) {
            $(thisWidget.container).addClass('minimized');
            $(thisWidget.stateControls).find('li.minimize').addClass('minimized').html('+');
        }
        thisWidget.scrim = $(thisWidget.widgetEle).find('.RESDashboardComponentScrim');
        thisWidget.contents = $(thisWidget.container).find('.RESDashboardComponentContents');
        thisWidget.init = function() {
            if (RESUtils.currentSubreddit('dashboard')) {
                thisWidget.draw();
                if (!thisWidget.minimized) modules.dashboard.addToUpdateQueue(thisWidget.update);
            }
        }
        thisWidget.draw = function() {
            $(thisWidget.widgetEle).append(thisWidget.header);
            $(thisWidget.widgetEle).append(thisWidget.container);
            if (thisWidget.minimized) $(thisWidget.widgetEle).addClass('minimized');
            modules.dashboard.dashboardUL.prepend(thisWidget.widgetEle);
            // $(thisWidget.scrim).fadeIn();
        }
        thisWidget.populate = function(response) {
            var widgetContent = $(response).find('#siteTable');
            $(widgetContent).attr('id','siteTable_'+thisWidget.basePath.replace(/\/|\+/g,'_'));
            if (widgetContent.length === 2) widgetContent = widgetContent[1];
            $(widgetContent).attr('url',thisWidget.url+'?limit='+thisWidget.numPosts);
            if ((widgetContent) && ($(widgetContent).html() != '')) {
                $(thisWidget.contents).html(widgetContent);
                $(thisWidget.contents).fadeTo('fast',1);
                $(thisWidget.scrim).fadeOut();
                $(thisWidget.stateControls).find('.updateTime').html('updated: '+RESUtils.niceDateTime());
            } else {
                if (thisWidget.url.indexOf('/message/') != -1) {
                    $(thisWidget.contents).html('<div class="widgetNoMail">No messages were found.</div>');
                } else {
                    $(thisWidget.contents).html('<div class="error">There were no results returned for this widget. If you made a typo, simply close the widget to delete it. If reddit is just under heavy load, try clicking refresh in a few moments.</div>');
                }
                $(thisWidget.contents).fadeTo('fast',1);
                $(thisWidget.scrim).fadeOut();
                $(thisWidget.stateControls).find('.updateTime').html('updated: '+RESUtils.niceDateTime());
            }
        }
        thisWidget.error = function(xhr, err) {
            // RESAlert('There was an error loading data for this widget. Did you type a bad path, perhaps? Removing this widget automatically.');
            // modules.dashboard.removeWidget(thisWidget.optionsObject());
            if (xhr.status === 404) {
                $(thisWidget.contents).html('<div class="error">This widget received a 404 not found error. You may have made a typo when adding it.</div>');
            } else {
                $(thisWidget.contents).html('<div class="error">There was an error loading data for this widget. Reddit may be under heavy load, or you may have provided an invalid path.</div>');
            }
            $(thisWidget.scrim).fadeOut();
            $(thisWidget.contents).fadeTo('fast',1);
        }
    },
    addDashboardShortcuts: function() {
        RESUtils.addCSS('.RESDashboardToggle { margin-right: 5px; color: white; background-image: url(/static/bg-button-add.png); cursor: pointer; text-align: center; width: 68px; font-weight: bold; font-size: 10px; border: 1px solid #444444; padding: 1px 6px; border-radius: 3px 3px 3px 3px;  }');
        RESUtils.addCSS('.RESDashboardToggle.remove { background-image: url(/static/bg-button-remove.png) }');
        var subButton = document.querySelector('.fancy-toggle-button');
        if (! ($('#subButtons').length>0)) {
            this.subButtons = $('<div id="subButtons"></div>');
            $(subButton).wrap(this.subButtons);
        }
        var dashboardToggle = document.createElement('span');
        dashboardToggle.setAttribute('class','RESDashboardToggle');
        dashboardToggle.setAttribute('subreddit',RESUtils.currentSubreddit());
        var exists=false;
        for (var i=0, len=this.widgets.length; i<len; i++) {
            if ((this.widgets[i]) && (this.widgets[i].basePath.toLowerCase() === '/r/'+RESUtils.currentSubreddit().toLowerCase())) {
                exists=true;
                break;
            }
        }
        if (exists) {
            dashboardToggle.innerHTML = '-dashboard';
            dashboardToggle.setAttribute('title','Remove this subreddit from your dashboard');
            addClass(dashboardToggle,'remove');
        } else {
            dashboardToggle.innerHTML = '+dashboard';
            dashboardToggle.setAttribute('title','Add this subreddit to your dashboard');
        }
        dashboardToggle.addEventListener('click', modules.dashboard.toggleDashboard, false);
        $('#subButtons').append(dashboardToggle);
    },
    toggleDashboard: function(e) {
        var thisBasePath = '/r/'+e.target.getAttribute('subreddit');
        if (hasClass(e.target,'remove')) {
            modules.dashboard.removeWidget({
                basePath: thisBasePath
            }, true);
            e.target.innerHTML = '+dashboard';
            removeClass(e.target,'remove');
        } else {
            modules.dashboard.addWidget({
                basePath: thisBasePath
            }, true);
            e.target.innerHTML = '-dashboard';
            RESUtils.notification({ 
                header: 'Dashboard Notification', 
                message: 'Dashboard widget added for '+thisBasePath+' <p><a class="RESNotificationButtonBlue" href="/r/Dashboard">view the dashboard</a></p><div class="clear"></div>'
            });
            addClass(e.target,'remove');
        }
    }
};
