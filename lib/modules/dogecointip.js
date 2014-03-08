modules['dogecointip'] = {
    moduleID: 'dogecointip',
    moduleName: 'dogecointip',
    category: 'Users',
    disabledByDefault: true,
    description: 'Send <a href="http://dogecoin.com/" target="_blank">Dogecoin</a> to other redditors via ' +
        '<a href="/r/dogetipbot" target="_blank">dogetipbot</a>. <br><br> For more information, ' +
        'visit <a href="/r/dogetipbot" target="_blank">/r/dogetipbot</a> or ' + 
        '<a href="/r/dogetipbot/wiki/gettingstarted" target="_blank">read the documentation</a>.',
    options: {
        baseTip: {
            name: 'Default Tip',
            type: 'text',
            value: '10 DOGE',
            description: 'Default tip amount in the form of "[value] [units]", e.g. "10 DOGE"'
        },
        attachButtons: {
            name: 'Add "tip Dogecoin" Button',
            type: 'boolean',
            value: true,
            description: 'Attach "tip Dogecoin" button to comments'
        }/*, // this part was only working the second time the page was loaded for some reason
        hide: {
            name: 'Hide Bot Verifications',
            type: 'boolean',
            value: true,
            description: 'Hide bot verifications'
        }*/ /*, // this doesn't even work (at least for now)
        address: {
            name: 'Known User Addresses',
            type: 'table',
            addRowText: '+add address',
            fields: [{
                name: 'user',
                type: 'text'
            }, {
                name: 'address',
                type: 'text'
            }],
            value: [
                // ['skeeto', '1...']
            ],
            description: 'Mapping of usernames to Dogecoin addresses'
        },
        fetchWalletAddress: {
            text: 'Search private messages',
            description: "Search private messages for dogecoin wallet associated with the current username." + "<p>You must be logged in to search.</p>" + "<p>After clicking the button, you must reload the page to see newly-found addresses.</p>",
            type: 'button',
            callback: null // populated when module loads
        } */
    },
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*/i
    ],
    exclude: [
        /^https?:\/\/([a-z]+)\.reddit\.com\/[\?]*\/user\/dogetipbot\/?/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    beforeLoad: function() {
        this.options.fetchWalletAddress.callback = this.fetchAddressForCurrentUser.bind(this);
        RESUtils.addCSS('.tip-dogecoins { cursor: pointer; }');
        RESUtils.addCSS('.tips-enabled-icon { cursor: help; }');
        RESUtils.addCSS('#tip-menu { display: none; position: absolute; top: 0; left: 0; }');
        // fix weird z-indexing issue caused by reddit's default .dropdown class
        RESUtils.addCSS('.tip-wrapper .dropdown { position: static; }');
    },

    go: function() {
        if (!this.isEnabled() || !this.isMatchURL()) {
            return;
        }

        if (RESUtils.pageType() === 'comments') {
            if (this.options.attachButtons.value) {
                this.attachTipButtons();
                RESUtils.watchForElement('newComments', modules['dogecointip'].attachTipButtons.bind(this));
                this.attachTipMenu();
            }

            if (this.options.hide.value) {
                this.hideVerifications();
                RESUtils.watchForElement('newComments', modules['dogecointip'].hideVerifications.bind(this));
            }
        }
    },

    save: function save() {
        var json = JSON.stringify(this.options);
        RESStorage.setItem('RESoptions.dogecoinTip', json);
    },

    load: function load() {
        var json = RESStorage.getItem('RESoptions.dogecoinTip');
        if (json) {
            this.options = JSON.parse(json);
        }
    },

    /** Specifies how to find tips already entered in the comment box. */
    tipregex: /\+((\/u\/)?dogetipbot)/i,

    /** Encoded tipping icons. */
    icons: {
        tipped: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAANCAMAAACq939wAAAA/FBMVEWqVQCqcQCZZgCLXQCdYgDMjACOXACOXwCacQCfcQCqegCwggChggCnfwCwggCthACtgQC9iACleQC+iwDMlgDJlACmfgDDiwDBjADHlQDJnQDFlQDKmAChfRGjgBOmfhKmghKnghOqhBKthxOviROvjB+vjCGvjCOwiRSwihixixWxjSGziBOzkSmzky+0kSa0kiy3jxW8kxS8mCi8n0i8oEq9lBe9mSvOoBbUrTTUrTjbukXcsTDctDrdtj/exHbexXDfwWXfwmvjrBnksRjksx7lrhnqx17qyWTqymrq377rz3nr2qftuiHtvSv67cD67sj+997/+OX///8rcy1sAAAAHXRSTlMDCQoLDRQkKystMDc5Oj0+QUlKS0tMTVFSV15/i6wTI/gAAACWSURBVHjaHcrnAoFQGADQryI7sjNKN0RKZJVNQ8io938YN+f3ASDp1B9NAhD15UzXNH26KhNQXZyDBxZcNlloKadvFIbR56owUOFV9425ai8PrGwZaITQeisXoKHs7k/MP44ZaHYl54U5El8EdmjNEWbEjesf/Ljd9v0S1ETBtD3PNgUxB8nOQIybOGknAKgMy2FsmoIflIEZdK7PshkAAAAASUVORK5CYII="
    },

    /** Return a DOM element to separate items in the user bar. */
    separator: function() {
        return $('<span>|</span>').addClass('separator');
    },

    tipPublicly: function tipPublicly($target) {
        var form = null;
        if ($target.closest('.link').length > 0) { /* Post */
            form = $('.commentarea .usertext:first');
        } else { /* Comment */
            var replyButton = $target.closest('ul').find('a[onclick*="reply"]');
            RESUtils.click(replyButton[0]);
            form = $target.closest('.thing').find('FORM.usertext.cloneable:first');
        }
        var textarea = form.find('textarea');
        if (!this.tipregex.test(textarea.val())) {
            textarea.val(textarea.val() + '\n\n+/u/dogetipbot ' + this.options.baseTip.value);
            RESUtils.setCursorPosition(textarea, 0);
        }
    },

    tipSneakily: function tipPrivately($target) {
        var form = null;
        if ($target.closest('.link').length > 0) { /* Post */
            form = $('.commentarea .usertext:first');
        } else { /* Comment */
            var replyButton = $target.closest('ul').find('a[onclick*="reply"]');
            RESUtils.click(replyButton[0]);
            form = $target.closest('.thing').find('FORM.usertext.cloneable:first');
        }
        var textarea = form.find('textarea');
        if (!this.tipregex.test(textarea.val())) {
            textarea.val(textarea.val() + '\n\n+/u/dogetipbot @<real tip recipient> ' + this.options.baseTip.value);
            RESUtils.setCursorPosition(textarea, 0);
        }
    },

    attachTipButtons: function attachTipButtons(ele) {
        ele = ele || document.body;
        var module = this;
        if (!module.tipButton) {
            module.tipButton = $(
                '<div class="tip-wrapper">' +
                '<div class="dropdown">' +
                '<a class="tip-dogecoins login-required noCtrlF" title="Click to give a dogecoin tip" data-text="dogecointip"></a>' +
                '</div>' +
                '</div>');
            module.tipButton.on('click', function(e) {
                modules['dogecointip'].toggleTipMenu(e.target);
            });
        }

        /* Add the "tip dogecoins" button after "give gold". */
        var allGiveGoldLinks = ele.querySelectorAll('a.give-gold');
        RESUtils.forEachChunked(allGiveGoldLinks, 15, 1000, function(giveGold, i, array) {
            $(giveGold).parent().after($('<li/>')
                .append(modules['dogecointip'].tipButton.clone(true)));
        });

        if (!module.attachedPostTipButton) {
            module.attachedPostTipButton = true; // signifies either "attached button" or "decided not to attach button"

            if (!RESUtils.isCommentPermalinkPage() && $('.link').length === 1) {
                // Viewing full comments on a submission, so user can comment on post
                $('.link ul.buttons .share').after($('<li/>')
                    .append(modules['dogecointip'].tipButton.clone(true)));
            }
        }
    },

    attachTipMenu: function() {
        this.tipMenu =
            $('<div id="tip-menu" class="drop-choices">' +
                '<a class="choice tip-publicly" href="javascript:void(0);">tip publicly</a>' +
                '<a class="choice tip-sneakily" href="javascript:void(0);">tip someone else here</a>' +
                '</div>');

        if (modules['settingsNavigation']) { // affordance for userscript mode
            this.tipMenu.append(
                modules['settingsNavigation'].makeUrlHashLink(this.moduleID, null,
                    '<img src="' + this.icons.tipped + '"> dogecointip', 'choice')
            );
        }
        $(document.body).append(this.tipMenu);

        this.tipMenu.find('a').click(function(event) {
            modules['dogecointip'].toggleTipMenu();
        });

        this.tipMenu.find('.tip-publicly').click(function(event) {
            event.preventDefault();
            modules['dogecointip'].tipPublicly($(modules['dogecointip'].lastToggle));
        });

        this.tipMenu.find('.tip-sneakily').click(function(event) {
            event.preventDefault();
            modules['dogecointip'].tipSneakily($(modules['dogecointip'].lastToggle));
        });
    },

    toggleTipMenu: function(ele) {
        var tipMenu = modules['dogecointip'].tipMenu;

        if (!ele || ele.length === 0) {
            tipMenu.hide();
            return;
        }

        var thisXY = $(ele).offset();
        var thisHeight = $(ele).height();
        // if already visible and we've clicked a different trigger, hide first, then show after the move.
        if ((tipMenu.is(':visible')) && (modules['dogecointip'].lastToggle !== ele)) {
            tipMenu.hide();
        }
        tipMenu.css({
            top: (thisXY.top + thisHeight) + 'px',
            left: thisXY.left + 'px'
        });
        tipMenu.toggle();
        modules['dogecointip'].lastToggle = ele;
    },

    // this doesn't work the first time the page is loaded; it works on refresh for some weird reason
    // bitcointip works just fine and this is the exact same code
    hideVerifications: function hideVerifications(ele) {
        ele = ele || document.body;

        /* t2_ed080 is u/dogetipbot. */

        var botComments = $(ele).find('a.id-t2_ed080').closest('.comment');
        RESUtils.forEachChunked(botComments, 15, 1000, function(botComment, i, array) {
            var $this = $(botComment);
            var isTarget = $this.find('form:first').hasClass('border');
            if (isTarget) return;

            var hasReplies = $this.find('.comment').length > 0;
            if (hasReplies) return;

            $this.find('.expand').eq(2).click();
        });
    },

    // I couldn't get this part working; mostly because Chrome wasn't letting me set breakpoints in this code.
    setAddress: function setAddress(user, address) {
        user = user || RESUtils.loggedInUser();
        var set = false;
        this.options.address.value.forEach(function(row) {
            if (row[0] === user) {
                row[1] = address;
                set = true;
            }
        });
        if (user && !set) {
            this.options.address.value.push([user, address]);
        }
        this.save();
        return address;
    },

    fetchAddressForCurrentUser: function() {
        var user = RESUtils.loggedInUser();
        if (!user) {
            modules['notifications'].showNotification({
                moduleID: 'dogecointip',
                optionKey: 'fetchWalletAddress',
                type: 'error',
                message: 'Log in, then try again.'
            });
            return;
        }
        this.fetchAddress(user, function(address) {
            if (address) {
                modules['dogecointip'].setAddress(user, address);
                modules['notifications'].showNotification({
                    moduleID: 'dogecointip',
                    optionKey: 'address',
                    message: 'Found address ' + address + ' for user ' + user + '<br><br>Your adress will appear in RES settings after you refresh the page.'
                });
            } else {
                modules['notifications'].showNotification({
                    moduleID: 'dogecointip',
                    type: 'error',
                    message: 'Could not find address for user ' + user
                });
            }

        });
        modules['notifications'].showNotification({
            moduleID: 'dogecointip',
            optionKey: 'fetchWalletAddress',
            message: 'Searching your private messages for a dogecoin wallet address. ' + '<br><br>Reload the page to see if a wallet was found.'
        });
    },

    fetchAddress: function fetchAddress(user, callback) {
        user = user || RESUtils.loggedInUser();
        callback = callback || function nop() {};
        if (!user) return;
        $.getJSON('/message/messages.json', function(messages) {
            // Search messages for a dogecointip response.
            var address = messages.data.children.filter(function(message) {
                return message.data.dest === 'dogetipbot';
            }).map(function(message) {
                return message.data.replies.data.children;
            }).reduce(function(allReplies, thisReplyList) {
                var newReplies = allReplies;
                thisReplyList.each(function(reply) {
                    newReplies.push(reply);
                });
                return newReplies;
            }, []).map(function(message) {
                var pattern = /Your deposit address is: (D[a-zA-Z0-9]{33})/;
                var address = pattern.exec(message.data.body);
                if (address) {
                    return address[1];
                } else {
                    return false;
                }
            }).filter(function(x) {
                return x;
            })[0]; // Use the most recent
            if (address) {
                this.setAddress(user, address);
                callback(address);
            } else {
                callback(null);
            }
        }.bind(this));
    }
};
