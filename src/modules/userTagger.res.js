modules.userTagger = {
    moduleID: 'userTagger',
    moduleName: 'User Tagger',
    category: 'Users',
    options: {
        hardIgnore: {
            type: 'boolean',
            value: false,
            description: 'If "hard ignore" is off, only post titles and comment text is hidden. If it is on, the entire block is hidden - note that this would make it difficult/impossible for you to unignore a person.'
        },
        colorUser: {
            type: 'boolean',
            value: true,
            description: 'Color users based on cumulative upvotes / downvotes'
        },
        hoverInfo: {
            type: 'boolean',
            value: true,
            description: 'Show information on user (karma, how long they\'ve been a redditor) on hover.'
        },
        hoverDelay: {
            type: 'text',
            value: 400,
            description: 'Delay, in milliseconds, before hover tooltip loads. Default is 400.'
        },
        fadeDelay: {
            type: 'text',
            value: 200,
            description: 'Delay, in milliseconds, before hover tooltip fades away. Default is 200.'
        },
        USDateFormat: {
            type: 'boolean',
            value: false,
            description: 'Show date (redditor since...) in US format (i.e. 08-31-2010)'
        },
        vwNumber: {
            type: 'boolean',
            value: true,
            description: 'Show the number (i.e. [+6]) rather than [vw]'
        },
        vwTooltip: {
            type: 'boolean',
            value: true,
            description: 'Show the vote weight tooltip on hover (i.e. "your votes for...")'
        }
    },
    description: 'Adds a great deal of customization around users - tagging them, ignoring them, and more.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    include: [
        /^https?:\/\/([-\w\.]+\.)?reddit\.com\/[-\w\.]*/i
    ],
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            // get this module's options...
            // RESUtils.getOptions(this.moduleID);
            
            // Get user tag data...
            var tags = RESStorage.getItem('RESmodules.userTagger.tags');
            this.tags = null;
            if (typeof tags != 'undefined') this.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags', true);
            // check if we're using the old method of storing user tags... yuck!
            if (this.tags == null) {
                this.updateTagStorage();
            }
            // set up an array to cache user data
            this.authorInfoCache = [];
            if (this.options.colorUser.value) {
                var voteButtons = document.body.querySelectorAll('.arrow');
                this.voteStates = [];
                for (var i=0, len=voteButtons.length;i<len;i++) {
                    // get current vote states so that when we listen, we check the delta...
                    // pairNum is just the index of the "pair" of vote arrows... it's i/2 with no remainder...
                    pairNum = Math.floor(i/2);
                    if (typeof(this.voteStates[pairNum]) === 'undefined') {
                        this.voteStates[pairNum] = 0;
                    }
                    if (hasClass(voteButtons[i], 'upmod')) {
                        this.voteStates[pairNum] = 1;
                    } else if (hasClass(voteButtons[i], 'downmod')) {
                        this.voteStates[pairNum] = -1;
                    }
                    // add an event listener to vote buttons to track votes, but only if we're logged in....
                    voteButtons[i].setAttribute('pairNum',pairNum);
                    if (RESUtils.loggedInUser()) {
                        voteButtons[i].addEventListener('click', function(e) {
                            var tags = RESStorage.getItem('RESmodules.userTagger.tags');
                            if (typeof tags != 'undefined') modules.userTagger.tags = safeJSON.parse(tags, 'RESmodules.userTagger.tags');
                            if (e.target.getAttribute('onclick').indexOf('unvotable') === -1) {
                                var pairNum = e.target.getAttribute('pairNum');
                                if (pairNum) pairNum = parseInt(pairNum, 10);
                                var thisAuthorA = this.parentNode.nextSibling.querySelector('p.tagline a.author');
                                // ???? TODO: fix on posts with thumbnails?
                                if (thisAuthorA == null && this.parentNode.nextSibling.nextSibling != null) {
                                    thisAuthorA = this.parentNode.nextSibling.nextSibling.querySelector('p.tagline a.author');
                                }
                                if (thisAuthorA) {
                                    var thisVWobj = this.parentNode.nextSibling.querySelector('.voteWeight');
                                    if (!thisVWobj) thisVWobj = this.parentNode.parentNode.querySelector('.voteWeight');
                                    // but what if no obj exists
                                    var thisAuthor = thisAuthorA.text;
                                    var votes = 0;
                                    if (typeof(modules.userTagger.tags[thisAuthor]) != 'undefined') {
                                        if (typeof(modules.userTagger.tags[thisAuthor].votes) != 'undefined') {
                                            votes = parseInt(modules.userTagger.tags[thisAuthor].votes);
                                        }
                                    } else {
                                        modules.userTagger.tags[thisAuthor] = {};
                                    }
                                    // there are 6 possibilities here:
                                    // 1) no vote yet, click upmod
                                    // 2) no vote yet, click downmod
                                    // 3) already upmodded, undoing
                                    // 4) already downmodded, undoing
                                    // 5) upmodded before, switching to downmod
                                    // 6) downmodded before, switching to upmod
                                    var upOrDown = '';
                                    ((hasClass(this, 'up')) || (hasClass(this, 'upmod'))) ? upOrDown = 'up' : upOrDown = 'down';
                                    // did they click the up arrow, or down arrow?
                                    switch (upOrDown) {
                                        case 'up':
                                            // the class changes BEFORE the click event is triggered, so we have to look at them backwards.
                                            // if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
                                            // we are undoing an upvote...
                                            if (hasClass(this, 'up')) {
                                                // this is an undo of an upvote. subtract one from votes. We end on no vote.
                                                votes--;
                                                modules.userTagger.voteStates[pairNum] = 0;
                                            } else {
                                                // They've upvoted... the question is, is it an upvote alone, or an an undo of a downvote?
                                                // add one vote either way...
                                                votes++;
                                                // if it was previously downvoted, add another!
                                                if (modules.userTagger.voteStates[pairNum] === -1) {
                                                    votes++;
                                                }
                                                modules.userTagger.voteStates[pairNum] = 1;
                                            }
                                            break;
                                        case 'down':
                                            // the class changes BEFORE the click event is triggered, so we have to look at them backwards.
                                            // if the arrow now has class "up" instead of "upmod", then it was "upmod" before, which means
                                            // we are undoing an downvote...
                                            if (hasClass(this, 'down')) {
                                                // this is an undo of an downvote. subtract one from votes. We end on no vote.
                                                votes++;
                                                modules.userTagger.voteStates[pairNum] = 0;
                                            } else {
                                                // They've downvoted... the question is, is it an downvote alone, or an an undo of an upvote?
                                                // subtract one vote either way...
                                                votes--;
                                                // if it was previously upvoted, subtract another!
                                                if (modules.userTagger.voteStates[pairNum] === 1) {
                                                    votes--;
                                                }
                                                modules.userTagger.voteStates[pairNum] = -1;
                                            }
                                            break;
                                    }
                                    /*
                                    if ((hasClass(this, 'upmod')) || (hasClass(this, 'down'))) {
                                        // upmod = upvote.  down = undo of downvote.
                                        votes = votes + 1;
                                    } else if ((hasClass(this, 'downmod')) || (hasClass(this, 'up'))) {
                                        // downmod = downvote.  up = undo of downvote.
                                        votes = votes - 1;
                                    }
                                    */
                                    modules.userTagger.tags[thisAuthor].votes = votes;
                                    RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(modules.userTagger.tags));
                                    modules.userTagger.colorUser(thisVWobj, thisAuthor, votes);
                                }
                            }
                            
                        }, true);
                    }
                }
            }
            // add tooltip to document body...
            var css = '#userTaggerToolTip { display: none; position: absolute; width: 334px; height: 248px; }';
            css += '#userTaggerToolTip label { margin-top: 5px; clear: both; float: left; width: 110px; }';
            css += '#userTaggerToolTip input[type=text], #userTaggerToolTip select { margin-top: 5px; float: left; width: 195px; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; margin-bottom: 6px; }';
            css += '#userTaggerToolTip input[type=checkbox] { margin-top: 5px; float: left; }';
            css += '#userTaggerToolTip input[type=submit] { cursor: pointer; position: absolute; right: 16px; bottom: 16px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #5cc410; } ';
            css += '#userTaggerToolTip .toggleButton { margin-top: 5px; margin-bottom: 5px; }';
            css += '#userTaggerClose { position: absolute; right: 7px; top: 7px; z-index: 11; }';

            css += '.ignoredUserComment { color: #CACACA; padding: 3px; font-size: 10px; }';
            css += '.ignoredUserPost { color: #CACACA; padding: 3px; font-size: 10px; }';
            css += 'a.voteWeight { text-decoration: none; color: #336699; }';
            css += 'a.voteWeight:hover { text-decoration: none; }';
            css += '#authorInfoToolTip { display: none; position: absolute; width: 412px; }';
            css += '#authorInfoToolTip .authorLabel { float: left; width: 140px; margin-bottom: 12px; }';
            css += '#authorInfoToolTip .authorDetail { float: left; width: 240px; margin-bottom: 12px; }';
            css += '#authorInfoToolTip .blueButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #636363; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #107ac4; }';
            css += '#authorInfoToolTip .redButton { float: right; margin-left: 8px; cursor: pointer; margin-top: 12px; padding-top: 3px; padding-bottom: 3px; padding-left: 5px; padding-right: 5px; font-size: 12px; color: #ffffff !important; border: 1px solid #bc3d1b; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; background-color: #ff5757; }';

            css += '#benefits { width: 200px; margin-left: 0px; }';
            css += '#userTaggerToolTip #userTaggerVoteWeight { width: 30px; }';
            css += '.RESUserTagImage { display: inline-block; width: 16px; height: 8px; background-image: url(\'http://f.thumbs.redditmedia.com/ykyGgtUvyXldPc3A.png\'); background-repeat: no-repeat; background-position: -16px -137px; }';
            css += '.userTagLink { display: inline-block; }';
            css += '.hoverHelp { margin-left: 3px; cursor: pointer; color: #336699; text-decoration: underline; }';
            css += '.userTagLink.hasTag, #userTaggerPreview { display: inline-block; padding: 0px 4px 0px 4px; border: 1px solid #c7c7c7; border-radius: 3px 3px 3px 3px; -moz-border-radius: 3px 3px 3px 3px; -webkit-border-radius: 3px 3px 3px 3px; }';
            css += '#userTaggerPreview { float: left; height: 16px; margin-bottom: 10px; }';
            css += '#userTaggerToolTip .toggleButton .toggleOn { background-color: #107ac4; color: #ffffff;  }';
            css += '#userTaggerToolTip .toggleButton.enabled .toggleOn { background-color: #dddddd ; color: #636363; }';
            css += '#userTaggerToolTip .toggleButton.enabled .toggleOff { background-color: #d02020; color: #ffffff; }'; 
            css += '#userTaggerToolTip .toggleButton .toggleOff { background-color: #dddddd; color: #636363; } ';
            
            RESUtils.addCSS(css);
            this.userTaggerToolTip = createElementWithID('div','userTaggerToolTip', 'RESDialogSmall');
            thisHTML = '<h3>Tag User</h3><div id="userTaggerToolTipContents" class="RESDialogContents clear">';
            thisHTML += '<form name="userTaggerForm" action=""><input type="hidden" id="userTaggerName" value="">';
            thisHTML += '<label for="userTaggerTag">Tag</label> <input type="text" id="userTaggerTag" value="">';
            thisHTML += '<div id="userTaggerClose" class="RESCloseButton">X</div>';
            thisHTML += '<label for="userTaggerColor">Color</label> <select id="userTaggerColor">';
            for (color in this.bgToTextColorMap) {
                thisValue = color;
                if (thisValue === 'none') thisValue = '';
                thisHTML += '<option style="background-color: '+color+'; color: '+this.bgToTextColorMap[color]+'" value="'+thisValue+'">'+color+'</option>';
            }
            thisHTML += '</select>';
            thisHTML += '<label for="userTaggerPreview">Preview</label> <span id="userTaggerPreview"></span>';
            thisHTML += '<label for="userTaggerIgnore">Ignore</label>';// <input type="checkbox" id="userTaggerIgnore" value="true">';
            thisHTML += '<label for="userTaggerLink">Link<span class="hoverHelp" title="add a link for this user (shows up in hover pane)">?</span></label> <input type="text" id="userTaggerLink" value="">';
            thisHTML += '<label for="userTaggerVoteWeight">Vote Weight<span class="hoverHelp" title="manually edit vote weight for this user">?</span></label> <input type="text" size="2" id="userTaggerVoteWeight" value="">';
            thisHTML += '<div class="clear"></div><input type="submit" id="userTaggerSave" value="Save"></form></div>';
            this.userTaggerToolTip.innerHTML = thisHTML;
            var ignoreLabel = this.userTaggerToolTip.querySelector('label[for=userTaggerIgnore]');
            $(ignoreLabel, RESUtils.toggleButton('userTaggerIgnore', false, 'no').after('yes'));
            this.userTaggerTag = this.userTaggerToolTip.querySelector('#userTaggerTag');
            this.userTaggerTag.addEventListener('keyup', modules.userTagger.updateTagPreview, false);
            this.userTaggerColor = this.userTaggerToolTip.querySelector('#userTaggerColor');
            this.userTaggerColor.addEventListener('change', modules.userTagger.updateTagPreview, false);
            this.userTaggerPreview = this.userTaggerToolTip.querySelector('#userTaggerPreview');
            var userTaggerSave = this.userTaggerToolTip.querySelector('#userTaggerSave');
            userTaggerSave.setAttribute('type','submit');
            userTaggerSave.setAttribute('value','✓ save tag');
            userTaggerSave.addEventListener('click', function(e) {
                e.preventDefault();
                modules.userTagger.saveTagForm();
            }, false);
            var userTaggerClose = this.userTaggerToolTip.querySelector('#userTaggerClose');
            userTaggerClose.addEventListener('click', function(e) {
                modules.userTagger.closeUserTagPrompt();
            }, false);
            //this.userTaggerToolTip.appendChild(userTaggerSave);
            this.userTaggerForm = this.userTaggerToolTip.querySelector('FORM');
            this.userTaggerForm.addEventListener('submit',function(e) {
                e.preventDefault();
                modules.userTagger.saveTagForm();
            }, true);
            document.body.appendChild(this.userTaggerToolTip);
            if (this.options.hoverInfo.value) {
                this.authorInfoToolTip = createElementWithID('div', 'authorInfoToolTip', 'RESDialogSmall');
                this.authorInfoToolTipHeader = document.createElement('h3');
                this.authorInfoToolTip.appendChild(this.authorInfoToolTipHeader);
                this.authorInfoToolTipCloseButton = createElementWithID('div', 'authorInfoToolTipClose', 'RESCloseButton');
                this.authorInfoToolTipCloseButton.innerHTML = 'X';
                this.authorInfoToolTip.appendChild(this.authorInfoToolTipCloseButton);
                this.authorInfoToolTipCloseButton.addEventListener('click', function(e) {
                    if (typeof(modules.userTagger.hideTimer) != 'undefined') {
                        clearTimeout(modules.userTagger.hideTimer);
                    }
                    modules.userTagger.hideAuthorInfo();
                }, false);
                this.authorInfoToolTipContents = createElementWithID('div','authorInfoToolTipContents', 'RESDialogContents');
                this.authorInfoToolTip.appendChild(this.authorInfoToolTipContents);
                this.authorInfoToolTip.addEventListener('mouseover', function(e) {
                    if (typeof(modules.userTagger.hideTimer) != 'undefined') {
                        clearTimeout(modules.userTagger.hideTimer);
                    }
                }, false);
                this.authorInfoToolTip.addEventListener('mouseout', function(e) {
                    if (e.target.getAttribute('class') != 'hoverAuthor') {
                        modules.userTagger.hideTimer = setTimeout(function() {
                            modules.userTagger.hideAuthorInfo();
                        }, modules.userTagger.options.fadeDelay.value);
                    }
                }, false);
                document.body.appendChild(this.authorInfoToolTip);
            }
            document.getElementById('userTaggerTag').addEventListener('keydown', function(e) {
                if (e.keyCode === 27) {
                    // close prompt.
                    modules.userTagger.closeUserTagPrompt();
                }
            }, true);
            //console.log('before applytags: ' + Date());
            this.applyTags();
            //console.log('after applytags: ' + Date());
            // listen for new DOM nodes so that modules like autopager, river of reddit, etc still get user tags
            document.body.addEventListener('DOMNodeInserted', function(event) {
                // if ((event.target.tagName === 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1)) {
                if ((event.target.tagName === 'DIV') && ((event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('siteTable') != -1) || (hasClass(event.target,'child')) || (hasClass(event.target,'thing')))) {
                    modules.userTagger.applyTags(event.target);
                }
            }, true);
            var userpagere = new RegExp(/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.]+\/?/i);
            if (userpagere.test(location.href)) {
                var friendButton = document.querySelector('.titlebox .fancy-toggle-button');
                if ((typeof friendButton != 'undefined') && (friendButton != null)) {
                    var firstAuthor = document.querySelector('a.author');
                    if ((typeof firstAuthor != 'undefined') && (firstAuthor != null)) {
                        var thisFriendComment = firstAuthor.getAttribute('title');
                        (thisFriendComment != null) ? thisFriendComment = thisFriendComment.substring(8,thisFriendComment.length-1) : thisFriendComment = '';
                    } else {
                        var thisFriendComment = '';
                    }
                    var benefitsForm = document.createElement('div');
                    var thisUser = document.querySelector('.titlebox > h1').innerHTML;
                    benefitsForm.innerHTML = '<form action="/post/friendnote" id="friendnote-r9_2vt1" method="post" class="pretty-form medium-text friend-note" onsubmit="return post_form(this, \'friendnote\');"><input type="hidden" name="name" value="'+thisUser+'"><input type="text" maxlength="300" name="note" id="benefits" class="tiny" onfocus="$(this).parent().addClass(\'edited\')" value="'+thisFriendComment+'"><button onclick="$(this).parent().removeClass(\'edited\')" type="submit">submit</button><span class="status"></span></form>';
                    $( friendButton).after(benefitsForm );
                }
            }
        }
    },
    saveTagForm: function() {
        var thisName = document.getElementById('userTaggerName').value;
        var thisTag = document.getElementById('userTaggerTag').value;
        var thisColor = document.getElementById('userTaggerColor').value;
        var thisIgnore = document.getElementById('userTaggerIgnore').checked;
        var thisLink = document.getElementById('userTaggerLink').value;
        var thisVotes = parseInt(document.getElementById('userTaggerVoteWeight').value);
        if (isNaN(thisVotes)) thisVotes = 0;
        modules.userTagger.setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes);
    },
    bgToTextColorMap: {
        'none':'black',
        'aqua':'black',
        'black':'white',
        'blue':'white',
        'fuchsia':'white',
        'gray':'white',
        'green':'white',
        'lime':'black',
        'maroon':'white',
        'navy':'white',
        'olive':'black',
        'orange':'black',
        'purple':'white',
        'red':'black',
        'silver':'black',
        'teal':'white',
        'white':'black',
        'yellow':'black'
    },
    openUserTagPrompt: function(obj, username) {
        thisXY=RESUtils.getXYpos(obj);
        this.clickedTag = obj;
        document.querySelector('#userTaggerToolTip h3').innerHTML = 'Tag '+username;
        document.getElementById('userTaggerName').value = username;
        var thisTag = null;
        var thisIgnore = null;
        if (typeof(this.tags[username]) != 'undefined') {
            if (typeof(this.tags[username].tag) != 'undefined') {
                document.getElementById('userTaggerTag').value = this.tags[username].tag;
            } else {
                document.getElementById('userTaggerTag').value = '';
            }
            if (typeof(this.tags[username].ignore) != 'undefined') {
                document.getElementById('userTaggerIgnore').checked = this.tags[username].ignore;
                var thisToggle = document.getElementById('userTaggerIgnoreContainer');
                if (this.tags[username].ignore) addClass(thisToggle,'enabled');
            } else {
                document.getElementById('userTaggerIgnore').checked = false;
            }
            if (typeof(this.tags[username].votes) != 'undefined') {
                document.getElementById('userTaggerVoteWeight').value = this.tags[username].votes;
            } else {
                document.getElementById('userTaggerVoteWeight').value = '';
            }
            if (typeof(this.tags[username].link) != 'undefined') {
                document.getElementById('userTaggerLink').value = this.tags[username].link;
            } else {
                document.getElementById('userTaggerLink').value = '';
            }
            if (typeof(this.tags[username].color) != 'undefined') {
                RESUtils.setSelectValue(document.getElementById('userTaggerColor'), this.tags[username].color);
            } else {
                document.getElementById('userTaggerColor').selectedIndex = 0;
            }
        } else {
            document.getElementById('userTaggerTag').value = '';
            document.getElementById('userTaggerIgnore').checked = false;
            document.getElementById('userTaggerVoteWeight').value = '';
            document.getElementById('userTaggerLink').value = '';
            document.getElementById('userTaggerColor').selectedIndex = 0;
        }
        this.userTaggerToolTip.setAttribute('style', 'display: block; top: ' + thisXY.y + 'px; left: ' + thisXY.x + 'px;');
        document.getElementById('userTaggerTag').focus();
        modules.userTagger.updateTagPreview();
        return false;
    },
    updateTagPreview: function() {
        modules.userTagger.userTaggerPreview.innerHTML = modules.userTagger.userTaggerTag.value;
        var bgcolor = modules.userTagger.userTaggerColor[modules.userTagger.userTaggerColor.selectedIndex].value;
        modules.userTagger.userTaggerPreview.style.backgroundColor = bgcolor;
        modules.userTagger.userTaggerPreview.style.color = modules.userTagger.bgToTextColorMap[bgcolor];
    },
    closeUserTagPrompt: function() {
        this.userTaggerToolTip.setAttribute('style','display: none');
        if (modules.keyboardNav.isEnabled()) {
            var inputs = this.userTaggerToolTip.querySelectorAll('INPUT, BUTTON');
            // remove focus from any input fields from the prompt so that keyboard navigation works again...
            for (var i=0,len=inputs.length; i<len; i++) {
                inputs[i].blur();
            }
        }
    },
    setUserTag: function(username, tag, color, ignore, link, votes, noclick) {
        if (((tag != null) && (tag != '')) || (ignore)) {
            if (tag === '') tag = 'ignored';
            if (typeof(this.tags[username]) === 'undefined') this.tags[username] = {};
            this.tags[username].tag = tag;
            this.tags[username].link = link;
            if (color != '') {
                this.tags[username].color = color;
            }
            if (ignore) {
                this.tags[username].ignore = true;
            } else {
                delete this.tags[username].ignore;
            }
            if (!noclick) {
                this.clickedTag.setAttribute('class','userTagLink hasTag');
                this.clickedTag.setAttribute('style', 'background-color: '+color+'; color: ' + this.bgToTextColorMap[color]);
                this.clickedTag.innerHTML = tag;
            }
        } else {
            if (typeof(this.tags[username]) != 'undefined') {
                delete this.tags[username].tag;
                delete this.tags[username].color;
                delete this.tags[username].link;
                if (this.tags[username].tag === 'ignored') delete this.tags[username].tag;
                delete this.tags[username].ignore;
            }
            if (!noclick) {
                this.clickedTag.setAttribute('style', 'background-color: none');
                this.clickedTag.setAttribute('class','userTagLink');
                this.clickedTag.innerHTML = '<div class="RESUserTagImage"></div>';
            }
        }

        if (typeof(this.tags[username]) != 'undefined') {
            this.tags[username].votes = (isNaN(votes)) ? 0 : votes;
        }
        if (!noclick) {
            var thisVW = this.clickedTag.parentNode.parentNode.querySelector('a.voteWeight');
            if (thisVW) {
                this.colorUser(thisVW, username, votes);
            }
        }
        if (RESUtils.isEmpty(this.tags[username])) delete this.tags[username];
        RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
        this.closeUserTagPrompt();
    },
    applyTags: function(ele) {
        if (ele == null) ele = document;
        this.authors = ele.querySelectorAll('.noncollapsed a.author, p.tagline a.author, #friend-table span.user a');
        this.authorCount = this.authors.length;
        this.authori = 0;
        (function(){
            modules.userTagger.authorCount;
            var chunkLength = Math.min((modules.userTagger.authorCount - modules.userTagger.authori), 15);
            for (var i=0;i<chunkLength;i++) {
                var authorNum = modules.userTagger.authori;
                modules.userTagger.applyTagToAuthor(modules.userTagger.authors[authorNum]);
                modules.userTagger.authori++;
            }
            if (modules.userTagger.authori < modules.userTagger.authorCount) {
                setTimeout(arguments.callee, 1000);
            }
        })();        
    },
    applyTagToAuthor: function(thisAuthorObj) {
        var userObject = [];
        // var thisAuthorObj = this.authors[authorNum];
        if ((thisAuthorObj) && (!(hasClass(thisAuthorObj,'userTagged'))) && (typeof thisAuthorObj != 'undefined') && (thisAuthorObj != null)) {
            if (this.options.hoverInfo.value) {
                // add event listener to hover, so we can grab user data on hover...
                thisAuthorObj.addEventListener('mouseover', function(e) {
                    modules.userTagger.showTimer = setTimeout(function() {
                        modules.userTagger.showAuthorInfo(thisAuthorObj);
                    }, modules.userTagger.options.hoverDelay.value);
                }, false);
                thisAuthorObj.addEventListener('mouseout', function(e) {
                    clearTimeout(modules.userTagger.showTimer);
                }, false);
            }
            var thisAuthor = thisAuthorObj.text;
            addClass(thisAuthorObj, 'userTagged');
            if (typeof(userObject[thisAuthor]) === 'undefined') {
                var thisVotes = 0;
                var thisTag = null;
                var thisColor = null;
                var thisIgnore = null;
                if ((this.tags != null) && (typeof(this.tags[thisAuthor]) != 'undefined')) {
                    if (typeof(this.tags[thisAuthor].votes) != 'undefined') {
                        thisVotes = parseInt(this.tags[thisAuthor].votes);
                    }
                    if (typeof(this.tags[thisAuthor].tag) != 'undefined') {
                        thisTag = this.tags[thisAuthor].tag;
                    }
                    if (typeof(this.tags[thisAuthor].color) != 'undefined') {
                        thisColor = this.tags[thisAuthor].color;
                    }
                    if (typeof(this.tags[thisAuthor].ignore) != 'undefined') {
                        thisIgnore = this.tags[thisAuthor].ignore;
                    }
                }
                userObject[thisAuthor] = {
                    tag: thisTag,
                    color: thisColor,
                    ignore: thisIgnore,
                    votes: thisVotes
                }
            }
            
            var userTagFrag = document.createDocumentFragment();
            
            var userTagLink = document.createElement('a');
            if (!(thisTag)) {
                thisTag = '<div class="RESUserTagImage"></div>';
                userTagLink.setAttribute('class','userTagLink');
            } else {
                userTagLink.setAttribute('class','userTagLink hasTag');
            }
            userTagLink.innerHTML = thisTag;
            if (thisColor) {
                userTagLink.setAttribute('style','background-color: '+thisColor+'; color: '+this.bgToTextColorMap[thisColor]);
            }
            userTagLink.setAttribute('username',thisAuthor);
            userTagLink.setAttribute('title','set a tag');
            userTagLink.setAttribute('href','javascript:void(0)');
            userTagLink.addEventListener('click', function(e) {
                modules.userTagger.openUserTagPrompt(e.target, this.getAttribute('username'));
            }, true);
            var userTag = document.createElement('span');
            // var lp = document.createTextNode(' (');
            // var rp = document.createTextNode(')');
            userTag.appendChild(userTagLink);
            // userTagFrag.appendChild(lp);
            userTagFrag.appendChild(userTag);
            // userTagFrag.appendChild(rp);
            if (this.options.colorUser.value) {
                var userVoteFrag = document.createDocumentFragment();
                var spacer = document.createTextNode(' ');
                userVoteFrag.appendChild(spacer);
                var userVoteWeight = document.createElement('a');
                userVoteWeight.setAttribute('href','javascript:void(0)');
                userVoteWeight.setAttribute('class','voteWeight');
                userVoteWeight.innerHTML = '[vw]';
                userVoteWeight.addEventListener('click', function(e) {
                    var theTag = this.parentNode.querySelector('.userTagLink');
                    modules.userTagger.openUserTagPrompt(theTag, theTag.getAttribute('username'));
                }, true);
                this.colorUser(userVoteWeight, thisAuthor, userObject[thisAuthor].votes);
                userVoteFrag.appendChild(userVoteWeight);
                userTagFrag.appendChild(userVoteFrag);
            }
            $( thisAuthorObj).after(userTagFrag );
            // thisAuthorObj.innerHTML += userTagFrag.innerHTML;
            thisIgnore = userObject[thisAuthor].ignore;
            if (thisIgnore && (RESUtils.pageType('profile') != true)) {
                if (this.options.hardIgnore.value) {
                    if (RESUtils.pageType() === 'comments') {
                        var thisComment = thisAuthorObj.parentNode.parentNode;
                        // hide comment block first...
                        thisComment.style.display = 'none';
                        // hide associated voting block...
                        if (thisComment.previousSibling) {
                            thisComment.previousSibling.style.display = 'none';
                        }
                    } else {
                        var thisPost = thisAuthorObj.parentNode.parentNode.parentNode;
                        // hide post block first...
                        thisPost.style.display = 'none';
                        // hide associated voting block...
                        if (thisPost.previousSibling) {
                            thisPost.previousSibling.style.display = 'none';
                        }
                    }
                } else {
                    if (RESUtils.pageType() === 'comments') {
                        var thisComment = thisAuthorObj.parentNode.parentNode.querySelector('.usertext');
                        if (thisComment) {
                            thisComment.innerHTML = thisAuthor + ' is an ignored user';
                            addClass(thisComment, 'ignoredUserComment');
                        }
                    } else {
                        var thisPost = thisAuthorObj.parentNode.parentNode.parentNode.querySelector('p.title');
                        if (thisPost) {
                            // need this setTimeout, potentially because destroying the innerHTML causes conflict with other modules?
                            setTimeout(function() {
                                thisPost.innerHTML = thisAuthor + ' is an ignored user';
                            }, 100);
                            thisPost.setAttribute('class','ignoredUserPost');
                        }
                    }
                }
            }
        }
    },
    colorUser: function(obj, author, votes) {
        if (this.options.colorUser.value) {
            votes = parseInt(votes, 10);
            var red = 255;
            var green = 255;
            var blue = 255;
            var voteString = '+';
            if (votes > 0) {
                red = Math.max(0, (255-(8*votes)));
                green = 255;
                blue = Math.max(0, (255-(8*votes)));
            } else if (votes < 0) {
                red = 255;
                green = Math.max(0, (255-Math.abs(8*votes)));
                blue = Math.max(0, (255-Math.abs(8*votes)));
                voteString = '';
            }
            voteString = voteString + votes;
            var rgb='rgb('+red+','+green+','+blue+')';
            if (obj != null) {
                if (votes === 0) {
                    obj.style.display = 'none';
                } else {
                    obj.style.display = 'inline';
                    obj.style.backgroundColor = rgb;
                    if (this.options.vwNumber.value) obj.innerHTML = '[' + voteString + ']';
                    if (this.options.vwTooltip.value) obj.setAttribute('title','your votes for '+author+': '+voteString);
                }
            }
        }
    },
    showAuthorInfo: function(obj) {
        var isFriend = (hasClass(obj, 'friend')) ? true : false;
        thisXY=RESUtils.getXYpos(obj);
        var objClass = obj.getAttribute('class');
        this.authorInfoToolTipHeader.innerHTML = '<a href="/user/'+obj.textContent+'">' + obj.textContent + '</a>';
        RESUtils.loggedInUserInfo(function(userInfo) {
            var myID = 't2_'+userInfo.data.id;
            if (isFriend) {
                var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active remove" href="#" tabindex="100" onclick="return toggle(this, unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">- friends</a><a class="option add" href="#">+ friends</a></span>';
            } else {
                var friendButton = '<span class="fancy-toggle-button toggle" style="display: inline-block; margin-left: 12px;"><a class="option active add" href="#" tabindex="100" onclick="return toggle(this, friend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'), unfriend(\''+obj.textContent+'\', \''+myID+'\', \'friend\'))">+ friends</a><a class="option remove" href="#">- friends</a></span>';
            }
            modules.userTagger.authorInfoToolTipHeader.innerHTML += friendButton;
        });
        this.authorInfoToolTipContents.innerHTML = '<a class="hoverAuthor" href="/user/'+obj.textContent+'">'+obj.textContent+'</a>:<br><img src="'+RESConsole.loader+'"> loading...';
        this.authorInfoToolTip.setAttribute('style', 'top: ' + (thisXY.y - 8) + 'px; left: ' + (thisXY.x - 8) + 'px;');
        RESUtils.fadeElementIn(this.authorInfoToolTip, 0.3);
        var thisUserName = obj.textContent;
        setTimeout(function() {
            if (!RESUtils.elementUnderMouse(modules.userTagger.authorInfoToolTip)) {
                modules.userTagger.hideAuthorInfo();
            }
        }, 1000);
        if (typeof(this.authorInfoCache[thisUserName]) != 'undefined') {
            this.writeAuthorInfo(this.authorInfoCache[thisUserName]);
        } else {
            GM_xmlhttpRequest({
                method:    "GET",
                url:    location.protocol + "//www.reddit.com/user/" + thisUserName + "/about.json",
                onload:    function(response) {
                    var thisResponse = JSON.parse(response.responseText);
                    modules.userTagger.authorInfoCache[thisUserName] = thisResponse;
                    modules.userTagger.writeAuthorInfo(thisResponse);
                }
            });
        }
    },
    writeAuthorInfo: function(jsonData) {
        var utctime = jsonData.data.created;
        var d = new Date(utctime*1000);
        // var userHTML = '<a class="hoverAuthor" href="/user/'+jsonData.data.name+'">'+jsonData.data.name+'</a>:';
        var userHTML = '<div class="authorLabel">Redditor since:</div> <div class="authorDetail">' + RESUtils.niceDate(d, this.options.USDateFormat.value) + ' ('+RESUtils.niceDateDiff(d)+')</div>';
        userHTML += '<div class="authorLabel">Link Karma:</div> <div class="authorDetail">' + jsonData.data.link_karma + '</div>';
        userHTML += '<div class="authorLabel">Comment Karma:</div> <div class="authorDetail">' + jsonData.data.comment_karma + '</div>';
        if ((typeof(modules.userTagger.tags[jsonData.data.name]) != 'undefined') && (modules.userTagger.tags[jsonData.data.name].link)) {
            userHTML += '<div class="authorLabel">Link:</div> <div class="authorDetail"><a target="_blank" href="'+modules.userTagger.tags[jsonData.data.name].link+'">website link</a></div>';
        }
        userHTML += '<div class="clear"></div><div class="bottomButtons">';
        userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/message/compose/?to='+jsonData.data.name+'"><img src="/static/mailgray.png"> send message</a>';
        if (jsonData.data.is_gold) {
            userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold">User has Reddit Gold</a>';
        } else {
            userHTML += '<a target="_blank" class="blueButton" href="http://www.reddit.com/gold?goldtype=gift&recipient='+jsonData.data.name+'">Gift Reddit Gold</a>';
        }
        if ((modules.userTagger.tags[jsonData.data.name]) && (modules.userTagger.tags[jsonData.data.name].ignore)) {
            userHTML += '<div class="redButton" id="ignoreUser" user="'+jsonData.data.name+'">&empty; Unignore</div>';
        } else {
            userHTML += '<div class="blueButton" id="ignoreUser" user="'+jsonData.data.name+'">&empty; Ignore</div>';
        }
        userHTML += '<div class="clear"></div></div>'; // closes bottomButtons div
        this.authorInfoToolTipContents.innerHTML = userHTML;
        this.authorInfoToolTipIgnore = this.authorInfoToolTipContents.querySelector('#ignoreUser');
        this.authorInfoToolTipIgnore.addEventListener('click', modules.userTagger.ignoreUser, false);
    },
    ignoreUser: function(e) {
        if (hasClass(e.target,'blueButton')) {
            removeClass(e.target,'blueButton');
            addClass(e.target,'redButton');
            e.target.innerHTML = '&empty; Unignore';
            var thisIgnore = true;
        } else {
            removeClass(e.target,'redButton');
            addClass(e.target,'blueButton');
            e.target.innerHTML = '&empty; Ignore';
            var thisIgnore = false;
        }
        var thisName = e.target.getAttribute('user');
        var thisColor, thisLink, thisVotes, thisTag;
        if (modules.userTagger.tags[thisName]) {
            thisColor = modules.userTagger.tags[thisName].color || '';
            thisLink = modules.userTagger.tags[thisName].link || '';
            thisVotes = modules.userTagger.tags[thisName].votes || 0;
            thisTag = modules.userTagger.tags[thisName].tag || '';
        } 
        if ((thisIgnore) && (thisTag === '')) {
            thisTag = 'ignored';
        } else if ((!thisIgnore) && (thisTag === 'ignored')) {
            thisTag = '';
        }
        modules.userTagger.setUserTag(thisName, thisTag, thisColor, thisIgnore, thisLink, thisVotes, true); // last true is for noclick param
    },
    hideAuthorInfo: function(obj) {
        // this.authorInfoToolTip.setAttribute('style', 'display: none');
        RESUtils.fadeElementOut(this.authorInfoToolTip, 0.3);
    },
    updateTagStorage: function() {
        // update tag storage format from the old individual bits to a big JSON blob
        // It's OK that we're directly accessing localStorage here because if they have old school tag storage, it IS in localStorage.
        (typeof unsafeWindow != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
        var tags = {};
        var toRemove = [];
        for (var i = 0, len=ls.length; i < len; i++){
            var keySplit = null;
            if (ls.key(i)) keySplit = ls.key(i).split('.');
            if (keySplit) {
                var keyRoot = keySplit[0];
                switch (keyRoot) {
                    case 'reddituser':
                        var thisNode = keySplit[1];
                        if (typeof(tags[keySplit[2]]) === 'undefined') {
                            tags[keySplit[2]] = {};
                        }
                        if (thisNode === 'votes') {
                            tags[keySplit[2]].votes = ls.getItem(ls.key(i));
                        } else if (thisNode === 'tag') {
                            tags[keySplit[2]].tag = ls.getItem(ls.key(i));
                        } else if (thisNode === 'color') {
                            tags[keySplit[2]].color = ls.getItem(ls.key(i));
                        } else if (thisNode === 'ignore') {
                            tags[keySplit[2]].ignore = ls.getItem(ls.key(i));
                        }
                        // now delete the old stored garbage...
                        var keyString = 'reddituser.'+thisNode+'.'+keySplit[2];
                        toRemove.push(keyString);
                        break;
                    default:
                        // console.log('Not currently handling keys with root: ' + keyRoot);
                        break;
                }
            }
        }
        this.tags = tags;
        RESStorage.setItem('RESmodules.userTagger.tags', JSON.stringify(this.tags));
        // now remove the old garbage...
        for (var i=0, len=toRemove.length; i<len; i++) {
            ls.removeItem(toRemove[i]);
        }
    }
};
