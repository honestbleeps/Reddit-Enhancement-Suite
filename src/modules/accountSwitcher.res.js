modules.accountSwitcher = {
    moduleID: 'accountSwitcher',
    moduleName: 'Account Switcher',
    category: 'Accounts',
    options: {
        accounts: {
            type: 'table',
            addRowText: '+add account',
            fields: [
                { name: 'username', type: 'text' },
                { name: 'password', type: 'password' }
            ],
            value: [
                /*
                ['somebodymakethis','SMT','[SMT]'],
                ['pics','pic','[pic]']
                */
            ],
            description: 'Set your usernames and passwords below. They are only stored in RES preferences.'
        },
        keepLoggedIn: {
            type: 'boolean',
            value: false,
            description: 'Keep me logged in when I restart my browser.'
        }
    },
    description: 'Store username/password pairs and switch accounts instantly while browsing Reddit!',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]*/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            // do stuff now!
            // this is where your code goes...
            this.userLink = document.querySelector('#header-bottom-right > span.user > a');
            if (this.userLink) {
                // this.loggedInUser = userLink.innerHTML;
                this.loggedInUser = RESUtils.loggedInUser();
                var downArrowIMG = 'data:image/gif;base64,R0lGODlhBwAEALMAAAcHBwgICAoKChERETs7Ozo6OkJCQg0NDRoaGhAQEAwMDDIyMv///wAAAAAAAAAAACH5BAEAAAwALAAAAAAHAAQAAAQQ0BSykADsDAUwY4kQfOT4RQA7';
                var downArrow = document.createElement('img');
                downArrow.setAttribute('src', downArrowIMG);
                downArrow.style.cursor = 'pointer';
                downArrow.style.marginLeft = '3px';
                downArrow.addEventListener('click',function(e) {
                    e.preventDefault();
                    modules.accountSwitcher.toggleAccountMenu();
                }, true);
                $(this.userLink).after(downArrow);

                this.accountMenu = createElementWithID('UL','accountSwitcherMenu');
                this.accountMenu.style.display = 'none';
                RESUtils.addCSS('#accountSwitcherMenu { position: absolute; z-index: 999; display: none; padding: 3px; background-color: #ffffff; }');
                RESUtils.addCSS('.accountName { color: #000; padding: 2px; border-bottom: 1px solid #AAAAAA; border-left: 1px solid #AAAAAA; border-right: 1px solid #AAAAAA; }');
                RESUtils.addCSS('.accountName:first-child { padding: 2px; border-top: 1px solid #AAAAAA; }');
                RESUtils.addCSS('.accountName:hover { background-color: #F3FAFF; }');
                // GM_addStyle(css);
                var accounts = this.options.accounts.value;
                if (accounts != null) {
                    var accountCount = 0;
                    for (var i=0, len=accounts.length; i<len; i++) {
                        thisPair = accounts[i];
                        if (thisPair[0] != this.loggedInUser) {
                            accountCount++;
                            var thisLI = document.createElement('LI');
                            addClass(thisLI, 'accountName');
                            thisLI.innerHTML = thisPair[0];
                            thisLI.style.cursor = 'pointer';
                            thisLI.addEventListener('click', function(e) {
                                e.preventDefault();
                                modules.accountSwitcher.toggleAccountMenu();
                                modules.accountSwitcher.switchTo(e.target.innerHTML);
                            }, true);
                            this.accountMenu.appendChild(thisLI);
                        }
                    }
                    var thisLI = document.createElement('LI');
                    addClass(thisLI, 'accountName');
                    thisLI.innerHTML = '+ add account';
                    thisLI.style.cursor = 'pointer';
                    thisLI.addEventListener('click', function(e) {
                        e.preventDefault();
                        modules.accountSwitcher.toggleAccountMenu();
                        modules.accountSwitcher.manageAccounts();
                    }, true);
                    this.accountMenu.appendChild(thisLI);
                }
                document.body.appendChild(this.accountMenu);
            }
        }
    },
    toggleAccountMenu: function() {
        if (this.accountMenu.style.display === 'none') {
            thisXY=RESUtils.getXYpos(this.userLink);
            this.accountMenu.style.top = (thisXY.y + 12) + 'px';
            this.accountMenu.style.left = (thisXY.x - 10) + 'px';
            this.accountMenu.style.display = 'block';
        } else {
            this.accountMenu.style.display = 'none';
        }
    },
    closeAccountMenu: function() {
        // this function basically just exists for other modules to call.
        if (this.accountMenu) this.accountMenu.style.display = 'none';
    },
    switchTo: function(username) {
        var accounts = this.options.accounts.value;
        var password = '';
        var rem = '';
        if (this.options.keepLoggedIn.value) {
            rem = '&rem=on';
        }
        for (var i=0, len=accounts.length; i<len; i++) {
            thisPair = accounts[i];
            if (thisPair[0] === username) {
                password = thisPair[1];
            }
        }
        // console.log('request with user: ' +username+ ' -- passwd: ' + password);
        var loginUrl = 'https://ssl.reddit.com/api/login';
        if (typeof opera != 'undefined') {
            loginUrl = 'http://'+location.hostname+'/api/login';
        } else if ((typeof chrome != 'undefined') && (chrome.extension.inIncognitoContext)) {
            loginUrl = 'http://'+location.hostname+'/api/login';
        }
        GM_xmlhttpRequest({
            method:    "POST",
            url:    loginUrl,
            data: 'user='+RESUtils.urlencode(username)+'&passwd='+RESUtils.urlencode(password)+rem,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            onload:    function(response) {
                // console.log(response.responseText);
                // var data = JSON.parse(response.responseText);
                var badData = false;
                try {
                    var data = JSON.parse(response.responseText);
                } catch(error) {
                    var data = {};
                    badData = true;
                }
                // var errorCheck = data.jquery[10][3][0];
                var error = /WRONG_PASSWORD/;
                var rateLimit = /RATELIMIT/;
                if (badData) {
                    RESUtils.notification('There was an error switching accounts. Reddit may be under heavy load. Please try again in a few moments.');
                } else if (error.test(response.responseText)) {
                    RESAlert('Incorrect login and/or password. Please check your configuration.');
                } else if (rateLimit.test(response.responseText)) {
                    RESAlert('RATE LIMIT: The Reddit API is seeing too many hits from you too fast, perhaps you keep submitting a wrong password, etc?  Try again in a few minutes.');
                } else {
                    location.reload();
                }
            }
        });
    },
    manageAccounts: function() {
        RESConsole.open();
        RESConsole.menuClick(document.getElementById('Menu-Accounts'));
        RESConsole.drawConfigOptions('accountSwitcher');
    }
};
