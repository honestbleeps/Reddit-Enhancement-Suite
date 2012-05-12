/*
	* Konami-JS ~ 
	* :: Now with support for touch events and multiple instances for 
	* :: those situations that call for multiple easter eggs!
	* Code: http://konami-js.googlecode.com/
	* Examples: http://www.snaptortoise.com/konami-js
	* Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
	* Version: 1.3.2 (7/02/2010)
	* Licensed under the GNU General Public License v3
	* http://www.gnu.org/copyleft/gpl.html
	* Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+ and Mobile Safari 2.2.1
*/
var Konami = function() {
	var konami= {
			addEvent:function ( obj, type, fn, ref_obj )
			{
				if (obj.addEventListener)
					obj.addEventListener( type, fn, false );
				else if (obj.attachEvent)
				{
					// IE
					obj["e"+type+fn] = fn;
					obj[type+fn] = function() { obj["e"+type+fn]( window.event,ref_obj ); }
	
					obj.attachEvent( "on"+type, obj[type+fn] );
				}
			},
	        input:"",
	        prepattern:"38384040373937396665",
			almostThere: false,
	        pattern:"3838404037393739666513",
	        load: function(link) {	
				
				this.addEvent(document,"keydown", function(e,ref_obj) {											
					if (ref_obj) konami = ref_obj; // IE
					konami.input+= e ? e.keyCode : event.keyCode;
					if (konami.input.length > konami.pattern.length) konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
					if (konami.input == konami.pattern) {
						konami.code(link);
						konami.input="";
						return;
                    } else if ((konami.input == konami.prepattern) || (konami.input.substr(2,konami.input.length) == konami.prepattern)) {
						konami.almostThere = true;
						setTimeout(function() {
							konami.almostThere = false;
						}, 2000);
					}
            	},this);
           this.iphone.load(link)
	                
				},
	        code: function(link) { window.location=link},
	        iphone:{
	                start_x:0,
	                start_y:0,
	                stop_x:0,
	                stop_y:0,
	                tap:false,
	                capture:false,
					orig_keys:"",
	                keys:["UP","UP","DOWN","DOWN","LEFT","RIGHT","LEFT","RIGHT","TAP","TAP","TAP"],
	                code: function(link) { konami.code(link);},
	                load: function(link){
									this.orig_keys = this.keys;
	    							konami.addEvent(document,"touchmove",function(e){
	                          if(e.touches.length == 1 && konami.iphone.capture==true){ 
	                            var touch = e.touches[0]; 
	                                konami.iphone.stop_x = touch.pageX;
	                                konami.iphone.stop_y = touch.pageY;
	                                konami.iphone.tap = false; 
	                                konami.iphone.capture=false;
	                                konami.iphone.check_direction();
	                                }
	                                });               
	                        konami.addEvent(document,"touchend",function(evt){
	                                if (konami.iphone.tap==true) konami.iphone.check_direction(link);           
	                                },false);
	                        konami.addEvent(document,"touchstart", function(evt){
	                                konami.iphone.start_x = evt.changedTouches[0].pageX
	                                konami.iphone.start_y = evt.changedTouches[0].pageY
	                                konami.iphone.tap = true
	                                konami.iphone.capture = true
	                                });               
	                                },
	                check_direction: function(link){
	                        x_magnitude = Math.abs(this.start_x-this.stop_x)
	                        y_magnitude = Math.abs(this.start_y-this.stop_y)
	                        x = ((this.start_x-this.stop_x) < 0) ? "RIGHT" : "LEFT";
	                        y = ((this.start_y-this.stop_y) < 0) ? "DOWN" : "UP";
	                        result = (x_magnitude > y_magnitude) ? x : y;
	                        result = (this.tap==true) ? "TAP" : result;                     

	                        if (result==this.keys[0]) this.keys = this.keys.slice(1,this.keys.length)
	                        if (this.keys.length==0) { 
								this.keys=this.orig_keys;
								this.code(link)
							}
					}
	               }
	}
	return konami;
};

function RESPreloadCSS() {
RESUtils.addCSS(' \
#RESConsole { \
	visibility: hidden; \
	color: #000; \
	font-size: 12px; \
	z-index: 1000; \
	position: fixed; \
	margin: auto; \
	top: -1500px; \
	left: 1.5%; \
	width: 95%; \
	height: 85%; \
	overflow: hidden; \
	padding: 10px; \
	box-shadow: 10px 10px 10px #aaa; \
	-moz-box-shadow: 10px 10px 10px #aaa; \
	-webkit-box-shadow: 10px 10px 10px #aaa; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	/* border: 4px solid #CCCCCC; */ \
	background-color: #ffffff; \
	-webkit-transition:top 0.5s ease-in-out; \
	-moz-transition:top 0.5s ease-in-out; \
	-o-transition:top 0.5s ease-in-out; \
	-ms-transition:top 0.5s ease-in-out; \
	-transition:top 0.5s ease-in-out; \
} \
#RESConsole.slideIn { \
	visibility: visible; \
	top: 30px; \
} \
#RESConsole.slideOut { \
	visibility: visible; \
	top: -1500px; \
} \
#modalOverlay { \
	display: none; \
	z-index: 999; \
	position: fixed; \
	top: 0px; \
	left: 0px; \
	width: 100%; \
	height: 100%; \
	background-color: #c9c9c9; \
	opacity: 0; \
	-webkit-transition:opacity 0.4s ease-in-out; \
	-moz-transition:opacity 0.4s ease-in-out; \
	-o-transition:opacity 0.4s ease-in-out; \
	-ms-transition:opacity 0.4s ease-in-out; \
	-transition:opacity 0.4s ease-in-out; \
} \
#modalOverlay.fadeIn { \
	display: block; \
	opacity: 0.9; \
} \
#modalOverlay.fadeOut { \
	display: block; \
	opacity: 0; \
	height: 0; \
} \
#RESSettingsButton { \
	display: inline-block; \
	margin: auto; \
	margin-bottom: -2px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESSettingsButton.newNotification, .gearIcon.newNotification { \
	cursor: pointer; \
	background-position: 0px -135px; \
} \
#DashboardLink a { \
	display: block; \
	width: auto; \
	height: auto; \
} \
#RESMainGearOverlay { \
	position: absolute; \
	display: none; \
	width: 27px; \
	height: 24px; \
	border: 1px solid #336699; \
	border-bottom: 1px solid #5f99cf; \
	background-color: #5f99cf; \
	border-radius: 3px 3px 0px 0px; \
	z-index: 10000; \
} \
.gearIcon { \
	position: absolute; \
	top: 3px; \
	left: 6px; \
	width: 15px; \
	height: 15px; \
	background-image: url(\'http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png\'); \
	background-repeat: no-repeat; \
	background-position: 0px -209px; \
} \
#RESPrefsDropdown { \
	display: none; \
	position: absolute; \
	z-index: 10000; \
} \
.RESDropdownList { \
	list-style-type: none; \
	background-color: #5f99cf; \
	width: 180px; \
	border-radius: 0px 0px 3px 3px; \
	border: 1px solid #336699; \
	border-bottom: none; \
	margin-top: -1px; \
} \
.RESDropdownList li { \
	cursor: pointer; \
	border-bottom: 1px solid #336699; \
	height: 35px; \
	line-height: 34px; \
	font-weight: bold; \
	color: #c9def2; \
	padding-left: 10px; \
} \
.RESDropdownList a, .RESDropdownList a:visited { \
	display: inline-block; \
	width: 100%; \
	height: 100%; \
	color: #c9def2; \
} \
.RESDropdownList li:hover, .RESDropdownList li a:hover { \
	background-color: #9cc6ec; \
	color: #336699; \
} \
#openRESPrefs { \
	display: inline-block; \
	height: 100%; \
} \
#RESConsoleHeader { \
	width: 100%; \
} \
#RESLogo { \
	margin-right: 5px; \
	float: left; \
} \
#RESConsoleTopBar { \
	border-radius: 3px 3px 0px 0px; \
	-moz-border-radius: 3px 3px 0px 0px; \
	-webkit-border-radius: 3px 3px 0px 0px; \
	position: absolute; \
	top: 0px; \
	left: 0px; \
	right: 0px; \
	height: 40px; \
	margin-bottom: 10px; \
	padding-top: 10px; \
	padding-left: 10px; \
	padding-right: 10px; \
	border-bottom: 1px solid #c7c7c7; \
	background-color: #F0F3FC; \
	float: left; \
} \
#RESConsoleTopBar h1 { \
	float: left; \
	margin-top: 6px; \
	padding: 0px; \
	font-size: 14px; \
} \
#RESConsoleSubredditLink { \
	float: right; \
	margin-right: 34px; \
	margin-top: 7px; \
	font-size: 11px; \
} \
#RESKnownBugs, #RESKnownFeatureRequests { \
	list-style-type: disc; \
} \
.RESCloseButton { \
	position: absolute; \
	top: 7px; \
	right: 7px; \
	font: 12px Verdana, sans-serif; \
	background-color: #ffffff; \
	border: 1px solid #d7d9dc; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #9a958e; \
	text-align: center; \
	line-height: 22px; \
	width: 24px; \
	height: 24px; \
	z-index: 1000; \
	cursor: pointer; \
} \
#RESConsoleTopBar .RESCloseButton { \
	top: 9px; \
	right: 9px; \
} \
.RESCloseButton:hover { \
	border: 1px solid #999999; \
	background-color: #dddddd; \
} \
#RESClose { \
	float: right; \
	margin-top: 2px; \
	margin-right: 0px; \
} \
.RESDialogSmall { \
	background-color: #ffffff; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	font-size: 12px; \
	color: #666666; \
	position: relative; \
} \
.RESDialogSmall > h3 { \
	color: #000000; \
	font-size: 14px; \
	margin-top: 6px; \
	margin-bottom: 10px; \
	font-weight: normal; \
	position: absolute; \
	top: -5px; \
	left: 0px; \
	right: 0px; \
	background-color: #f0f3fc; \
	border-bottom: 1px solid #c7c7c7; \
	width: auto; \
	z-index: 10; \
	height: 28px; \
	padding-left: 10px; \
	padding-top: 12px; \
} \
.RESDialogSmall .RESDialogContents { \
	padding: 56px 12px 12px 12px;  \
} \
#RESHelp { \
	background-image: url("http://e.thumbs.redditmedia.com/r22WT2K4sio9Bvev.png"); \
	background-position: -16px -120px; \
	margin-right: 8px; \
	width: 16px; \
	height: 16px; \
	float: right; \
	cursor: pointer; \
} \
#RESMenu { \
	position: absolute; \
	top: 60px; \
	left: 15px; \
	right: 0px; \
	height: 30px; \
} \
#RESMenu li { \
	float: left; \
	text-align: center; \
	/* min-width: 80px; */ \
	height: 22px; \
	margin-right: 15px; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	padding-top: 6px; \
	padding-bottom: 0px; \
	padding-left: 8px; \
	padding-right: 8px; \
	cursor: pointer; \
	background-color: #dddddd; \
	color: #6c6c6c; \
} \
#RESMenu li.active { \
	border-color: #000000; \
	background-color: #7f7f7f; \
	color: #ffffff; \
} \
#RESMenu li:hover { \
	border-color: #000000; \
} \
#RESConsoleContent { \
	clear: both; \
	padding: 6px; \
	position: absolute; \
	top: 100px; \
	left: 0px; \
	right: 0px; \
	bottom: 0px; \
	border-top: 1px solid #DDDDDD; \
	overflow: auto; \
} \
#RESConfigPanelOptions, #RESAboutDetails { \
	margin-top: 15px; \
	display: block; \
	margin-left: 220px; \
} \
#allOptionsContainer { \
	position: relative; \
} \
#moduleOptionsScrim { \
	display: none; \
	position: absolute; \
	top: 1px; \
	left: 4px; \
	right: 13px; \
	bottom: 1px; \
	border-radius:2px \
	z-index: 1500; \
	background-color: #DDDDDD; \
	opacity: 0.7; \
} \
#moduleOptionsScrim.visible { \
	display: block; \
} \
#RESConfigPanelModulesPane, #RESAboutPane { \
	float: left; \
	width: 195px; \
	padding-right: 15px; \
	border-right: 1px solid #dedede; \
	height: 100%; \
} \
.moduleButton { \
	font-size: 12px; \
	color: #868686; \
	text-align: right; \
	padding-bottom: 3px; \
	padding-top: 3px; \
	margin-bottom: 12px; \
	cursor: pointer; \
	opacity: 0.5; \
} \
.moduleButton.enabled { \
	opacity: 1; \
} \
.moduleButton:hover { \
	text-decoration: underline; \
} \
.moduleButton.active, .moduleButton.active:hover { \
	opacity: 1; \
	font-weight: bold; \
} \
.RESPanel { \
	display: none; \
} \
.clear { \
	clear: both; \
} \
#keyCodeModal { \
	display: none; \
	width: 200px; \
	height: 40px; \
	position: absolute; \
	z-index: 1000; \
	background-color: #FFFFFF; \
	padding: 4px; \
	border: 2px solid #CCCCCC; \
} \
p.moduleListing { \
	padding-left: 5px; \
	padding-right: 5px; \
	padding-top: 5px; \
	padding-bottom: 15px; \
	border: 1px solid #BBBBBB; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
} \
#RESConsoleModulesPanel label { \
	float: left; \
	width: 15%; \
	padding-top: 6px; \
} \
#RESConsoleModulesPanel input[type=checkbox] { \
	float: left; \
	margin-left: 10px; \
} \
#RESConsoleModulesPanel input[type=button] { \
	float: right; \
	padding: 3px; \
	margin-left: 20px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#RESConsoleModulesPanel p { \
	overflow: auto; \
	clear: both; \
	margin-bottom: 10px; \
} \
.moduleDescription { \
	float: left; \
	width: 500px; \
	margin-left: 10px; \
	padding-top: 6px; \
} \
#RESConfigPanelOptions .moduleDescription { \
	margin-left: 0px; \
	margin-top: 10px; \
	padding-top: 0px; \
	clear: both; \
	width: auto; \
} \
.moduleToggle, .toggleButton { \
	float: left; \
	width: 60px; \
	height: 20px; \
	cursor: pointer; \
} \
.moduleHeader { \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.moduleName { \
	font-size: 16px; \
	float: left; \
	margin-right: 15px; \
} \
#RESConsole .toggleButton { \
	margin-left: 10px; \
} \
.toggleButton input[type=checkbox] { \
	display: none; \
} \
.moduleToggle span, .toggleButton span { \
	margin-top: -3px; \
	font-size: 11px; \
	padding-top: 3px; \
	width: 28px; \
	height: 17px; \
	float: left; \
	display: inline-block; \
	text-align: center; \
} \
.moduleToggle .toggleOn, .toggleButton .toggleOn { \
	background-color: #dddddd; \
	color: #636363; \
	border-left: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 3px 0px 0px 3px; \
} \
.moduleToggle.enabled .toggleOn, .toggleButton.enabled .toggleOn { \
	background-color: #107ac4 ; \
	color: #ffffff; \
} \
.moduleToggle.enabled .toggleOff, .toggleButton.enabled .toggleOff { \
	background-color: #dddddd; \
	color: #636363; \
} \
.moduleToggle .toggleOff, .toggleButton .toggleOff { \
	background-color: #d02020; \
	color: #ffffff; \
	border-right: 1px solid #636363; \
	border-top: 1px solid #636363; \
	border-bottom: 1px solid #636363; \
	border-radius: 0px 3px 3px 0px; \
} \
.optionContainer { \
	position: relative; \
	border: 1px solid #c7c7c7; \
	border-radius: 2px 2px 2px 2px; \
	padding: 12px; \
	background-color: #f0f3fc; \
	display: block; \
	margin-bottom: 12px; \
	margin-right: 12px; \
	margin-left: 3px; \
	overflow: auto; \
} \
.optionContainer table { \
	clear: both; \
	width: 650px; \
	margin-top: 20px; \
} \
.optionContainer label { \
	float: left; \
	width: 175px; \
} \
.optionContainer input[type=text], .optionContainer input[type=password], div.enum { \
	margin-left: 10px; \
	float: left; \
	width: 140px; \
} \
.optionContainer input[type=checkbox] { \
	margin-left: 10px; \
	margin-top: 0px; \
	float: left; \
} \
.optionContainer .optionsTable input[type=text], .optionContainer .optionsTable input[type=password] { \
	margin-left: 0px; \
} \
.optionsTable th, .optionsTable td { \
	padding-bottom: 7px; \
} \
.optionsTable textarea { \
	width: 400px; \
} \
.optionDescription { \
	margin-left: 255px; \
} \
.optionDescription.textInput { \
	margin-left: 340px; \
} \
.optionDescription.table { \
	position: relative; \
	top: auto; \
	left: auto; \
	right: auto; \
	float: left; \
	width: 100%; \
	margin-left: 0px; \
	margin-top: 12px; \
	margin-bottom: 12px; \
} \
#RESConsoleVersion { \
	float: left; \
	font-size: 10px; \
	color: f0f3fc; \
	margin-left: 6px; \
	margin-top: 7px; \
} \
#moduleOptionsSave { \
	display: none; \
	position: fixed; \
	z-index: 1100; \
	top: 98px; \
	right: 4%; \
	cursor: pointer; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #5cc410; \
	margin-bottom: 10px; \
} \
#moduleOptionsSave:hover { \
	background-color: #73e81e; \
} \
.addRowButton { \
	cursor: pointer; \
	padding-top: 2px; \
	padding-bottom: 2px; \
	padding-right: 5px; \
	padding-left: 5px; \
	color: #ffffff; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
.addRowButton:hover { \
	background-color: #289dee; \
} \
#moduleOptionsSaveBottom { \
	float: right; \
	margin-top: 10px; \
	margin-right: 30px; \
	cursor: pointer; \
	padding: 3px; \
	font-size: 12px; \
	border: 1px solid #DDDDDD; \
	-moz-box-shadow: 3px 3px 3px #BBB; \
	-webkit-box-shadow: 3px 3px 3px #BBB; \
	background-color: #F0F3FC; \
	margin-bottom: 10px; \
} \
#moduleOptionsSaveStatus { \
	display: none; \
	position: fixed; \
	top: 98px; \
	right: 160px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#moduleOptionsSaveStatusBottom { \
	display: none; \
	float: right; \
	margin-top: 10px; \
	width: 180px; \
	padding: 5px; \
	text-align: center; \
	background-color: #FFFACD; \
} \
#RESConsoleAboutPanel p { \
	margin-bottom: 10px; \
} \
#RESConsoleAboutPanel ul { \
	margin-bottom: 10px; \
	margin-top: 10px; \
} \
#RESConsoleAboutPanel li { \
	list-style-type: disc; \
	margin-left: 15px; \
} \
.aboutPanel { \
	background-color: #f0f3fc; \
	border: 1px solid #c7c7c7; \
	border-radius: 3px 3px 3px 3px; \
	padding: 10px; \
} \
.aboutPanel h3 { \
	margin-top: 0px; \
	margin-bottom: 10px; \
} \
#DonateRES { \
	display: block; \
} \
#RESTeam { \
	display: none; \
} \
#AboutRESTeamImage { \
	width: 100%; \
	background-color: #000000; \
	margin-bottom: 12px; \
} \
#AboutRESTeamImage img { \
	display: block; \
	margin: auto; \
} \
#AboutRES { \
	display: none; \
} \
.outdated { \
	float: right; \
	font-size: 11px; \
	margin-right: 15px; \
	margin-top: 5px; \
} \
#RESNotifications { \
	position: fixed; \
	top: 0px; \
	right: 10px; \
	height: auto; \
	width: 360px; \
	background: none; \
} \
.RESNotification { \
	opacity: 0; \
	position: relative; \
	font: 12px/14px Arial, Helvetica, Verdana, sans-serif; \
	z-index: 99999; \
	width: 360px; \
	margin-top: 6px; \
	border: 1px solid #ccccff; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	color: #000000; \
	background-color: #ffffff; \
} \
.RESNotification a { \
	color: orangered; \
} \
.RESNotification a:hover { \
	text-decoration: underline; \
} \
.RESNotification.timerOn { \
	border: 1px solid #c7c7c7; \
} \
.RESNotificationContent { \
	overflow: auto; \
	padding: 10px; \
	color: #999999; \
} \
.RESNotificationContent h2 { \
	color: #000000; \
	margin-bottom: 10px; \
} \
.RESNotificationHeader { \
	padding-left: 10px; \
	padding-right: 10px; \
	background-color: #f0f3fc; \
	border-bottom: #c7c7c7; \
	height: 38px; \
} \
.RESNotificationHeader h3 { \
	padding-top: 12px; \
	font-size: 15px; \
} \
.RESNotificationClose { \
	position: absolute; \
	right: 0px; \
	top: 0px; \
	margin-right: 12px; \
	margin-top: 6px; \
} \
a.RESNotificationButtonBlue { \
	clear: both; \
	float: right; \
	cursor: pointer; \
	margin-top: 12px; \
	padding-top: 3px; \
	padding-bottom: 3px; \
	padding-left: 5px; \
	padding-right: 5px; \
	font-size: 12px; \
	color: #ffffff !important; \
	border: 1px solid #636363; \
	border-radius: 3px 3px 3px 3px; \
	-moz-border-radius: 3px 3px 3px 3px; \
	-webkit-border-radius: 3px 3px 3px 3px; \
	background-color: #107ac4; \
} \
#baconBit { \
	position: fixed; \
	width: 32px; \
	height: 32px; \
	background-image: url("http://thumbs.reddit.com/t5_2s10b_6.png"); \
	top: -5%; \
	left: -5%; \
	z-index: 999999; \
	-webkit-transform: rotate(0deg); \
	-moz-transform: rotate(0deg); \
	transform: rotate(0deg); \
	-webkit-transition: all 2s linear; \
	-moz-transition: all 2s linear; \
	-o-transition: all 2s linear; \
	-ms-transition: all 2s linear; \
	-transition: all 2s linear; \
} \
#baconBit.makeitrain { \
	top: 100%; \
	left: 100%; \
	-webkit-transform: rotate(2000deg); \
	-moz-transform: rotate(2000deg); \
	transform: rotate(2000deg); \
} \
.RESButton { margin: 5px; padding: 3px; border: 1px solid #999999; width: 120px; cursor: pointer; border-radius: 5px 5px 5px 5px; -moz-border-radius: 5px 5px 5px 5px; -webkit-border-radius: 5px 5px 5px 5px;  } \
.RESButton:hover { background-color: #DDDDDD;  } \
');
}
RESPreloadCSS();

var _beforeLoadComplete = false;
function RESdoBeforeLoad() {
	if (_beforeLoadComplete) return;
	_beforeLoadComplete = true;
	// if (beforeLoadDoneOnce) return;
	// first, go through each module and set all of the options so that if a module needs to check another module's options, they're ready...
	// console.log('get options start: ' + Date());
	for (var thisModuleID in modules) {
		if (typeof(modules[thisModuleID]) == 'object') {
			RESUtils.getOptions(thisModuleID);
		}
	}
	// console.log('get options end: ' + Date());
	for (var thisModuleID in modules) {
		if (typeof(modules[thisModuleID]) == 'object') {
			if (typeof(modules[thisModuleID].beforeLoad) == 'function') modules[thisModuleID].beforeLoad();
		}
	}
	// apply style...
	GM_addStyle(RESUtils.css);
	// clear out css cache...
	RESUtils.css = '';
}

function RESInit() {
	localStorageFail = false;

	// Check for localStorage functionality...
	try {
		localStorage.setItem('RES.localStorageTest','test');
		// if this is a firefox addon, check for the old lsTest to see if they used to use the Greasemonkey script...
		// if so, present them with a notification explaining that they should download a new script so they can
		// copy their old settings...
		if (typeof(self.on) == 'function') {
			if ((localStorage.getItem('RES.lsTest') == 'test') && (localStorage.getItem('copyComplete') != 'true')) {
				RESUtils.notification('<h2>Important Alert for Greasemonkey Users!</h2>Hey! It looks like you have upgraded to RES 4.0, but used to use the Greasemonkey version of RES. You\'re going to see double until you uninstall the Greasemonkey script. However, you should first copy your settings by clicking the blue button. <b>After installing, refresh this page!</b> <a target="_blank" class="RESNotificationButtonBlue" href="http://redditenhancementsuite.com/gmutil/reddit_enhancement_suite.user.js">GM->FF Import Tool</a>', 15000);
				localStorage.removeItem('RES.lsTest');
				document.body.addEventListener('DOMNodeInserted', function(event) {
					if ((event.target.tagName == 'DIV') && (event.target.getAttribute('id') && event.target.getAttribute('id').indexOf('copyToSimpleStorage') != -1)) {
						GMSVtoFFSS();
					}
				}, true);
			}
		}
	} catch(e) {
		localStorageFail = true;
	}


	addClass(document.body,'res');

// tokeninput jquery plugin
(function ($) {
// Default settings
var DEFAULT_SETTINGS = {
	// Search settings
    method: "GET",
    contentType: "json",
    queryParam: "q",
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: "name",
    jsonContainer: null,

	// Display settings
    hintText: "Type in a search term",
    noResultsText: "No results",
    searchingText: "Searching...",
    deleteText: "&times;",
    animateDropdown: true,

	// Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ",",
    preventDuplicates: false,

	// Output settings
    tokenValue: "id",

	// Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,

	// Manipulation settings
    idPrefix: "token-input-",

    // Keep track if the input is currently in disabled mode
    disabled: false,

	// Allowed add token which is not in suggest list
    allowCustomEntry: false,

	// Formatters
    resultsFormatter: function(item){ return "<li>" + item[this.propertyToSearch]+ "</li>" },
    tokenFormatter: function(item) { return "<li><p>" + item[this.propertyToSearch] + "</p></li>" },

	// Callbacks
    onResult: null,
    onAdd: null,
    onDelete: null,
    onReady: null
};

// Default classes to use when theming
var DEFAULT_CLASSES = {
    tokenList: "token-input-list",
    token: "token-input-token",
    tokenDelete: "token-input-delete-token",
    selectedToken: "token-input-selected-token",
    highlightedToken: "token-input-highlighted-token",
    dropdown: "token-input-dropdown",
    dropdownItem: "token-input-dropdown-item",
    dropdownItem2: "token-input-dropdown-item2",
    selectedDropdownItem: "token-input-selected-dropdown-item",
    inputToken: "token-input-input-token"
};

// Input box position "enum"
var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2
};

// Keys "enum"
var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NUMPAD_ENTER: 108,
    COMMA: 188
};

// Additional public (exposed) methods
var methods = {
    init: function(url_or_data_or_function, options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

        return this.each(function () {
            $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
        });
    },
    clear: function() {
        this.data("tokenInputObject").clear();
        return this;
    },
    add: function(item) {
        this.data("tokenInputObject").add(item);
        return this;
    },
    remove: function(item) {
        this.data("tokenInputObject").remove(item);
        return this;
    },
    get: function() {
    	return this.data("tokenInputObject").getTokens();
   	}
}

// Expose the .tokenInput function to jQuery as a plugin
$.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if(methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
        return methods.init.apply(this, arguments);
    }
};

// TokenList class for each input
$.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
        // Set the url to query against
        settings.url = url_or_data;

        // If the URL is a function, evaluate it here to do our initalization work
        var url = computeURL();

        // Make a smart guess about cross-domain if it wasn't explicitly specified
        if(settings.crossDomain === undefined) {
            if(url.indexOf("://") === -1) {
                settings.crossDomain = false;
            } else {
                settings.crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
            }
        }
    } else if(typeof(url_or_data) === "object") {
        // Set the local data to search through
        settings.local_data = url_or_data;
    }

    // Build class names
    if(settings.classes) {
        // Use custom class names
        settings.classes = $.extend({}, DEFAULT_CLASSES, settings.classes);
    } else if(settings.theme) {
        // Use theme-suffixed default class names
        settings.classes = {};
        $.each(DEFAULT_CLASSES, function(key, value) {
            settings.classes[key] = value + "-" + settings.theme;
        });
    } else {
        settings.classes = DEFAULT_CLASSES;
    }


    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\"  autocomplete=\"off\">")
        .css({
            outline: "none"
        })
        .attr("id", settings.idPrefix + input.id)
        .focus(function () {
            if (settings.tokenLimit === null || settings.tokenLimit !== token_count) {
                show_dropdown_hint();
            }
        })
        .blur(function () {
            hide_dropdown();
            $(this).val("");
        })
        .bind("keyup keydown blur update", resize_input)
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
                        }
                        return false;
                    }
                    break;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();

                    if(!$(this).val().length) {
                        if(selected_token) {
                            delete_token($(selected_token));
                            hidden_input.change();
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }

                        return false;
                    } else if($(this).val().length === 1) {
                        hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;

                case KEY.TAB:
                case KEY.ENTER:
                case KEY.NUMPAD_ENTER:
                case KEY.SPACE: // added by honestbleeps
                case KEY.COMMA:
                  if(selected_dropdown_item) {
                    add_token($(selected_dropdown_item).data("tokeninput"));
                    hidden_input.change();
                    return false;
                  } else if (settings.allowCustomEntry) {
                  	// this functionality added by honestbleeps, doesn't exist in current plugin.
                  	// this allows tokens to be added for elements that don't show up in the search.
                  	if (event.target.value.length>0) {
	                  	var currentTokenInputItem = {"name": event.target.value, "id": event.target.value };
	                  	add_token(currentTokenInputItem);
	                  	hidden_input.change();
                  	}
                  	return false;
                  }
                  break;

                case KEY.ESCAPE:
                  hide_dropdown();
                  return true;

                default:
                    if(String.fromCharCode(event.which)) {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;
            }
        });

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .val("")
                           .focus(function () {
                               input_box.focus();
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass(settings.classes.tokenList)
        .click(function (event) {
            var li = $(event.target).closest("li");
            if(li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                toggle_select_token(li);
            } else {
                // Deselect selected token
                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }

                // Focus input box
                input_box.focus();
            }
        })
        .mouseover(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.addClass(settings.classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.removeClass(settings.classes.highlightedToken);
            }
        })
        .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $("<li />")
        .addClass(settings.classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass(settings.classes.dropdown)
        .appendTo("body")
        .hide();

    // Magic element to help us resize the text input
    var input_resizer = $("<tester/>")
        .insertAfter(input_box)
        .css({
            position: "absolute",
            top: -9999,
            left: -9999,
            width: "auto",
            fontSize: input_box.css("fontSize"),
            fontFamily: input_box.css("fontFamily"),
            fontWeight: input_box.css("fontWeight"),
            letterSpacing: input_box.css("letterSpacing"),
            whiteSpace: "nowrap"
        });

    // Pre-populate list if items exist
    hidden_input.val("");
    var li_data = settings.prePopulate || hidden_input.data("pre");
    if(settings.processPrePopulate && $.isFunction(settings.onResult)) {
        li_data = settings.onResult.call(hidden_input, li_data);
    }
    if(li_data && li_data.length) {
        $.each(li_data, function (index, value) {
            insert_token(value);
            checkTokenLimit();
        });
    }

    // Initialization is done
    if($.isFunction(settings.onReady)) {
        settings.onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function() {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                delete_token($(this));
            }
        });
    }

    this.add = function(item) {
        add_token(item);
    }

    this.remove = function(item) {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                var currToken = $(this).data("tokeninput");
                var match = true;
                for (var prop in item) {
                    if (item[prop] !== currToken[prop]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    delete_token($(this));
                }
            }
        });
    }
    
    this.getTokens = function() {
   		return saved_tokens;
   	}

    //
    // Private functions
    //

    function checkTokenLimit() {
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
            return;
        }
    }

    function resize_input() {
        if(input_val === (input_val = input_box.val())) {return;}

        // Enter new content into resizer and resize input accordingly
        var escaped = input_val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        input_resizer.html(escaped);
        input_box.width(input_resizer.width() + 30);
    }

    function is_printable_character(keycode) {
        return ((keycode >= 48 && keycode <= 90) ||     // 0-1a-z
                (keycode >= 96 && keycode <= 111) ||    // numpad 0-9 + - / * .
                (keycode >= 186 && keycode <= 192) ||   // ; = , - . / ^
                (keycode >= 219 && keycode <= 222));    // ( \ ) '
    }

    // Inner function to a token to the list
    function insert_token(item) {
        var this_token = settings.tokenFormatter(item);
        this_token = $(this_token)
          .addClass(settings.classes.token)
          .insertBefore(input_token);

        // The 'delete token' button
        $("<span>" + settings.deleteText + "</span>")
            .addClass(settings.classes.tokenDelete)
            .appendTo(this_token)
            .click(function () {
                delete_token($(this).parent());
                hidden_input.change();
                return false;
            });

        // Store data on the token
        var token_data = {"id": item.id};
        token_data[settings.propertyToSearch] = item[settings.propertyToSearch];
        $.data(this_token.get(0), "tokeninput", item);

        // Save this token for duplicate checking
        saved_tokens = saved_tokens.slice(0,selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
        selected_token_index++;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count += 1;

        // Check the token limit
        if(settings.tokenLimit !== null && token_count >= settings.tokenLimit) {
            input_box.hide();
            hide_dropdown();
        }

        return this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        var callback = settings.onAdd;

        // See if the token already exists and select it if we don't want duplicates
        if(token_count > 0 && settings.preventDuplicates) {
            var found_existing_token = null;
            token_list.children().each(function () {
                var existing_token = $(this);
                var existing_data = $.data(existing_token.get(0), "tokeninput");
                if(existing_data && existing_data.id === item.id) {
                    found_existing_token = existing_token;
                    return false;
                }
            });

            if(found_existing_token) {
                select_token(found_existing_token);
                input_token.insertAfter(found_existing_token);
                input_box.focus();
                return;
            }
        }

        // Insert the new tokens
        if(settings.tokenLimit == null || token_count < settings.tokenLimit) {
            insert_token(item);
            checkTokenLimit();
        }

        // Clear input box
        input_box.val("");

        // Don't show the help dropdown, they've got the idea
        hide_dropdown();

        // Execute the onAdd callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,item);
        }
    }

    // Select a token in the token list
    function select_token (token) {
        token.addClass(settings.classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val("");

        // Hide dropdown if it is visible (eg if we clicked to select token)
        hide_dropdown();
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass(settings.classes.selectedToken);
        selected_token = null;

        if(position === POSITION.BEFORE) {
            input_token.insertBefore(token);
            selected_token_index--;
        } else if(position === POSITION.AFTER) {
            input_token.insertAfter(token);
            selected_token_index++;
        } else {
            input_token.appendTo(token_list);
            selected_token_index = token_count;
        }

        // Show the input box and give it focus again
        input_box.focus();
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
        var previous_selected_token = selected_token;

        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }

        if(previous_selected_token === token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            select_token(token);
        }
    }

    // Delete a token from the token list
    function delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        var callback = settings.onDelete;

        var index = token.prevAll().length;
        if(index > selected_token_index) index--;

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        input_box.focus();

        // Remove this token from the saved list
        saved_tokens = saved_tokens.slice(0,index).concat(saved_tokens.slice(index+1));
        if(index < selected_token_index) selected_token_index--;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count -= 1;

        if(settings.tokenLimit !== null) {
            input_box
                .show()
                .val("")
                .focus();
        }

        // Execute the onDelete callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,token_data);
        }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
        var token_values = $.map(saved_tokens, function (el) {
            return el[settings.tokenValue];
        });
        hidden_input.val(token_values.join(settings.tokenDelimiter));

    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                zindex: 999
            })
            .show();
    }

    function show_dropdown_searching () {
        if(settings.searchingText) {
            dropdown.html("<p>"+settings.searchingText+"</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if(settings.hintText) {
            dropdown.html("<p>"+settings.hintText+"</p>");
            show_dropdown();
        }
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    }
    
    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + value + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
    }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    add_token($(event.target).closest("li").data("tokeninput"));
                    hidden_input.change();
                    return false;
                })
                .hide();

            $.each(results, function(index, value) {
                var this_li = settings.resultsFormatter(value);
                
                this_li = find_value_and_highlight_term(this_li ,value[settings.propertyToSearch], query);            
                
                this_li = $(this_li).appendTo(dropdown_ul);
                
                if(index % 2) {
                    this_li.addClass(settings.classes.dropdownItem);
                } else {
                    this_li.addClass(settings.classes.dropdownItem2);
                }

                if(index === 0) {
                    select_dropdown_item(this_li);
                }

                $.data(this_li.get(0), "tokeninput", value);
            });

            show_dropdown();

            if(settings.animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if(settings.noResultsText) {
                dropdown.html("<p>"+settings.noResultsText+"</p>");
                selected_dropdown_item = null;
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass(settings.classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass(settings.classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than settings.minChars
    function do_search() {
        var query = input_box.val().toLowerCase();

        if(query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }

            if(query.length >= settings.minChars) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
                    run_search(query);
                }, settings.searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if(settings.url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[settings.queryParam] = query;
                ajax_params.type = settings.method;
                ajax_params.dataType = settings.contentType;
                if(settings.crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                  if($.isFunction(settings.onResult)) {
                      results = settings.onResult.call(hidden_input, results);
                  }
                  cache.add(cache_key, settings.jsonContainer ? results[settings.jsonContainer] : results);

                  // only populate the dropdown if the results are associated with the active search query
                  if(input_box.val().toLowerCase() === query) {
                      populate_dropdown(query, settings.jsonContainer ? results[settings.jsonContainer] : results);
                  }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if(settings.local_data) {
                // Do the search through local data
                var results = $.grep(settings.local_data, function (row) {
                    return row[settings.propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                if($.isFunction(settings.onResult)) {
                    results = settings.onResult.call(hidden_input, results);
                }
                cache.add(cache_key, results);
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url = settings.url;
        if(typeof settings.url == 'function') {
            url = settings.url.call();
        }
        return url;
    }
};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};
}($));
// END tokeniput jquery plugin

// fieldSelection jquery plugin
/*
 * jQuery plugin: fieldSelection - v0.1.0 - last change: 2006-12-16
 * (c) 2006 Alex Brem <alex@0xab.cd> - http://blog.0xab.cd
 */

(function(){var a={getSelection:function(){var b=this.jquery?this[0]:this;return(("selectionStart" in b&&function(){var c=b.selectionEnd-b.selectionStart;return{start:b.selectionStart,end:b.selectionEnd,length:c,text:b.value.substr(b.selectionStart,c)}})||(document.selection&&function(){b.focus();var d=document.selection.createRange();if(d==null){return{start:0,end:b.value.length,length:0}}var c=b.createTextRange();var e=c.duplicate();c.moveToBookmark(d.getBookmark());e.setEndPoint("EndToStart",c);return{start:e.text.length,end:e.text.length+d.text.length,length:d.text.length,text:d.text}})||function(){return{start:0,end:b.value.length,length:0}})()},replaceSelection:function(){var b=this.jquery?this[0]:this;var c=arguments[0]||"";return(("selectionStart" in b&&function(){b.value=b.value.substr(0,b.selectionStart)+c+b.value.substr(b.selectionEnd,b.value.length);return this})||(document.selection&&function(){b.focus();document.selection.createRange().text=c;return this})||function(){b.value+=c;return this})()}};jQuery.each(a,function(b){jQuery.fn[b]=this})})();
 
// END fieldSelection jquery plugin

// guiders jquery plugin
/**
 * guiders.js
 *
 * version 1.1.4
 *
 * Developed at Optimizely. (www.optimizely.com)
 * We make A/B testing you'll actually use.
 *
 * Released under the Apache License 2.0.
 * www.apache.org/licenses/LICENSE-2.0.html
 *
 * Questions about Guiders or Optimizely?
 * Email us at jeff+pickhardt@optimizely.com or hello@optimizely.com.
 *
 * Enjoy!
 */

guiders = (function($){
  var guiders = {
    version: "1.1.3",

    _defaultSettings: {
      attachTo: null,
      buttons: [{name: "Close"}],
      buttonCustomHTML: "",
      classString: null,
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      isHashable: true,
      offset: {
          top: null,
          left: null
      },
      onShow: null,
      overlay: false,
      position: 0, // 1-12 follows an analog clock, 0 means centered
      title: "Sample title goes here",
      width: 400,
      xButton: false // this places a closer "x" button in the top right of the guider
    },

    _htmlSkeleton: [
      "<div class='guider'>",
      "  <div class='guider_content'>",
      "    <h1 class='guider_title'></h1>",
      "    <div class='guider_close'></div>",
      "    <p class='guider_description'></p>",
      "    <div class='guider_buttons'>",
      "    </div>",
      "  </div>",
      "  <div class='guider_arrow'>",
      "  </div>",
      "</div>"
    ].join(""),

    _arrowSize: 42, // = arrow's width and height
    _closeButtonTitle: "Close",
    _currentGuiderID: null,
    _guiders: {},
    _lastCreatedGuiderID: null,
    _nextButtonTitle: "Next",
    _zIndexForHilight: 101,

    _addButtons: function(myGuider) {
      // Add buttons
      var guiderButtonsContainer = myGuider.elem.find(".guider_buttons");

      if (myGuider.buttons === null || myGuider.buttons.length === 0) {
        guiderButtonsContainer.remove();
        return;
      }

      for (var i = myGuider.buttons.length-1; i >= 0; i--) {
        var thisButton = myGuider.buttons[i];
        var thisButtonElem = $("<a></a>", {
                                "class" : "guider_button",
                                "text" : thisButton.name });
        if (typeof thisButton.classString !== "undefined" && thisButton.classString !== null) {
          thisButtonElem.addClass(thisButton.classString);
        }

        guiderButtonsContainer.append(thisButtonElem);

        if (thisButton.onclick) {
          thisButtonElem.bind("click", thisButton.onclick);
        } else if (!thisButton.onclick &&
                   thisButton.name.toLowerCase() === guiders._closeButtonTitle.toLowerCase()) { 
          thisButtonElem.bind("click", function() { guiders.hideAll(); });
        } else if (!thisButton.onclick &&
                   thisButton.name.toLowerCase() === guiders._nextButtonTitle.toLowerCase()) { 
          thisButtonElem.bind("click", function() { guiders.next(); });
        }
      }

      if (myGuider.buttonCustomHTML !== "") {
        var myCustomHTML = $(myGuider.buttonCustomHTML);
        myGuider.elem.find(".guider_buttons").append(myCustomHTML);
      }

			if (myGuider.buttons.length == 0) {
				guiderButtonsContainer.remove();
			}
    },

    _addXButton: function(myGuider) {
        var xButtonContainer = myGuider.elem.find(".guider_close");
        var xButton = $("<div></div>", {
                        "class" : "x_button",
                        "role" : "button" });
        xButtonContainer.append(xButton);
        xButton.click(function() { guiders.hideAll(); });
    },

    _attach: function(myGuider) {
      if (myGuider === null) {
        return;
      }

      var myHeight = myGuider.elem.innerHeight();
      var myWidth = myGuider.elem.innerWidth();

      if (myGuider.position === 0 || myGuider.attachTo === null) {
        myGuider.elem.css("position", "absolute");
        myGuider.elem.css("top", ($(window).height() - myHeight) / 3 + $(window).scrollTop() + "px");
        myGuider.elem.css("left", ($(window).width() - myWidth) / 2 + $(window).scrollLeft() + "px");
        return;
      }

      myGuider.attachTo = $(myGuider.attachTo);
      var base = myGuider.attachTo.offset();
      var attachToHeight = myGuider.attachTo.innerHeight();
      var attachToWidth = myGuider.attachTo.innerWidth();

      var top = base.top;
      var left = base.left;

      var bufferOffset = 0.9 * guiders._arrowSize;

      var offsetMap = { // Follows the form: [height, width]
        1: [-bufferOffset - myHeight, attachToWidth - myWidth],
        2: [0, bufferOffset + attachToWidth],
        3: [attachToHeight/2 - myHeight/2, bufferOffset + attachToWidth],
        4: [attachToHeight - myHeight, bufferOffset + attachToWidth],
        5: [bufferOffset + attachToHeight, attachToWidth - myWidth],
        6: [bufferOffset + attachToHeight, attachToWidth/2 - myWidth/2],
        7: [bufferOffset + attachToHeight, 0],
        8: [attachToHeight - myHeight, -myWidth - bufferOffset],
        9: [attachToHeight/2 - myHeight/2, -myWidth - bufferOffset],
        10: [0, -myWidth - bufferOffset],
        11: [-bufferOffset - myHeight, 0],
        12: [-bufferOffset - myHeight, attachToWidth/2 - myWidth/2]
      };

      offset = offsetMap[myGuider.position];
      top   += offset[0];
      left  += offset[1];

      if (myGuider.offset.top !== null) {
        top += myGuider.offset.top;
      }

      if (myGuider.offset.left !== null) {
        left += myGuider.offset.left;
      }

      myGuider.elem.css({
        "position": "absolute",
        "top": top,
        "left": left
      });
    },

    _guiderById: function(id) {
      if (typeof guiders._guiders[id] === "undefined") {
        throw "Cannot find guider with id " + id;
        console.log("Cannot find guider with id " + id);
      }
      return guiders._guiders[id];
    },

    _showOverlay: function() {
      $("#guider_overlay").fadeIn("fast", function(){
        if (this.style.removeAttribute) {
          this.style.removeAttribute("filter");
        }
      });
      // This callback is needed to fix an IE opacity bug.
      // See also:
      // http://www.kevinleary.net/jquery-fadein-fadeout-problems-in-internet-explorer/
    },

    _highlightElement: function(selector) {
      $(selector).css({'z-index': guiders._zIndexForHilight});
    },

    _dehighlightElement: function(selector) {
      $(selector).css({'z-index': 1});
    },

    _hideOverlay: function() {
      $("#guider_overlay").fadeOut("fast");
    },

    _initializeOverlay: function() {
      if ($("#guider_overlay").length === 0) {
        $("<div id=\"guider_overlay\"></div>").hide().appendTo("body");
      }
    },

    _styleArrow: function(myGuider) {
      var position = myGuider.position || 0;
      if (!position) {
        return;
      }
      var myGuiderArrow = $(myGuider.elem.find(".guider_arrow"));
      var newClass = {
        1: "guider_arrow_down",
        2: "guider_arrow_left",
        3: "guider_arrow_left",
        4: "guider_arrow_left",
        5: "guider_arrow_up",
        6: "guider_arrow_up",
        7: "guider_arrow_up",
        8: "guider_arrow_right",
        9: "guider_arrow_right",
        10: "guider_arrow_right",
        11: "guider_arrow_down",
        12: "guider_arrow_down"
      };
      myGuiderArrow.addClass(newClass[position]);

      var myHeight = myGuider.elem.innerHeight();
      var myWidth = myGuider.elem.innerWidth();
      var arrowOffset = guiders._arrowSize / 2;
      var positionMap = {
        1: ["right", arrowOffset],
        2: ["top", arrowOffset],
        3: ["top", myHeight/2 - arrowOffset],
        4: ["bottom", arrowOffset],
        5: ["right", arrowOffset],
        6: ["left", myWidth/2 - arrowOffset],
        7: ["left", arrowOffset],
        8: ["bottom", arrowOffset],
        9: ["top", myHeight/2 - arrowOffset],
        10: ["top", arrowOffset],
        11: ["left", arrowOffset],
        12: ["left", myWidth/2 - arrowOffset]
      };
      var position = positionMap[myGuider.position];
      myGuiderArrow.css(position[0], position[1] + "px");
    },

    /**
     * One way to show a guider to new users is to direct new users to a URL such as
     * http://www.mysite.com/myapp#guider=welcome
     *
     * This can also be used to run guiders on multiple pages, by redirecting from
     * one page to another, with the guider id in the hash tag.
     *
     * Alternatively, if you use a session variable or flash messages after sign up,
     * you can add selectively add JavaScript to the page: "guiders.show('first');"
     */
    _showIfHashed: function(myGuider) {
      var GUIDER_HASH_TAG = "guider=";
      var hashIndex = window.location.hash.indexOf(GUIDER_HASH_TAG);
      if (hashIndex !== -1) {
        var hashGuiderId = window.location.hash.substr(hashIndex + GUIDER_HASH_TAG.length);
        if (myGuider.id.toLowerCase() === hashGuiderId.toLowerCase()) {
          // Success!
          guiders.show(myGuider.id);
        }
      }
    },

    next: function() {
      var currentGuider = guiders._guiders[guiders._currentGuiderID];
      if (typeof currentGuider === "undefined") {
        return;
      }
      var nextGuiderId = currentGuider.next || null;
      if (nextGuiderId !== null && nextGuiderId !== "") {
        var myGuider = guiders._guiderById(nextGuiderId);
        var omitHidingOverlay = myGuider.overlay ? true : false;
        guiders.hideAll(omitHidingOverlay);
        if (currentGuider.highlight) {
            guiders._dehighlightElement(currentGuider.highlight);
        }
        guiders.show(nextGuiderId);
      }
    },

    createGuider: function(passedSettings) {
      if (passedSettings === null || passedSettings === undefined) {
        passedSettings = {};
      }

      // Extend those settings with passedSettings
      var myGuider = $.extend({}, guiders._defaultSettings, passedSettings);
      myGuider.id = myGuider.id || String(Math.floor(Math.random() * 1000));

      var guiderElement = $(guiders._htmlSkeleton);
      myGuider.elem = guiderElement;
      if (typeof myGuider.classString !== "undefined" && myGuider.classString !== null) {
        myGuider.elem.addClass(myGuider.classString);
      }
      myGuider.elem.css("width", myGuider.width + "px");

      var guiderTitleContainer = guiderElement.find(".guider_title");
      guiderTitleContainer.html(myGuider.title);

      guiderElement.find(".guider_description").html(myGuider.description);

      guiders._addButtons(myGuider);

      if (myGuider.xButton) {
          guiders._addXButton(myGuider);
      }

      guiderElement.hide();
      guiderElement.appendTo("body");
      guiderElement.attr("id", myGuider.id);

      // Ensure myGuider.attachTo is a jQuery element.
      if (typeof myGuider.attachTo !== "undefined" && myGuider !== null) {
        guiders._attach(myGuider);
        guiders._styleArrow(myGuider);
      }

      guiders._initializeOverlay();

      guiders._guiders[myGuider.id] = myGuider;
      guiders._lastCreatedGuiderID = myGuider.id;

      /**
       * If the URL of the current window is of the form
       * http://www.myurl.com/mypage.html#guider=id
       * then show this guider.
       */
      if (myGuider.isHashable) {
        guiders._showIfHashed(myGuider);
      }

      return guiders;
    },

    hideAll: function(omitHidingOverlay) {
      $(".guider").fadeOut("fast");
      if (typeof omitHidingOverlay !== "undefined" && omitHidingOverlay === true) {
        // do nothing for now
      } else {
        guiders._hideOverlay();
      }
      return guiders;
    },

    show: function(id) {
      if (!id && guiders._lastCreatedGuiderID) {
        id = guiders._lastCreatedGuiderID;
      }

      var myGuider = guiders._guiderById(id);
      if (myGuider.overlay) {
        guiders._showOverlay();
        // if guider is attached to an element, make sure it's visible
        if (myGuider.highlight) {
          guiders._highlightElement(myGuider.highlight);
        }
      }

      guiders._attach(myGuider);

      // You can use an onShow function to take some action before the guider is shown.
      if (myGuider.onShow) {
        myGuider.onShow(myGuider);
      }

      myGuider.elem.fadeIn("fast");

      var windowHeight = $(window).height();
      var scrollHeight = $(window).scrollTop();
      var guiderOffset = myGuider.elem.offset();
      var guiderElemHeight = myGuider.elem.height();

      if (guiderOffset.top - scrollHeight < 0 ||
          guiderOffset.top + guiderElemHeight + 40 > scrollHeight + windowHeight) {
        window.scrollTo(0, Math.max(guiderOffset.top + (guiderElemHeight / 2) - (windowHeight / 2), 0));
      }

      guiders._currentGuiderID = id;
      return guiders;
    }
  };

  return guiders;
}).call(this, jQuery);


// END guiders jquery plugin

// dragsort jquery plugin
// jQuery List DragSort v0.4.3
// License: http://dragsort.codeplex.com/license
(function(b){b.fn.dragsort=function(k){var d=b.extend({},b.fn.dragsort.defaults,k),g=[],a=null,j=null;this.selector&&b("head").append("<style type='text/css'>"+(this.selector.split(",").join(" "+d.dragSelector+",")+" "+d.dragSelector)+" { cursor: pointer; }</style>");this.each(function(k,i){b(i).is("table")&&b(i).children().size()==1&&b(i).children().is("tbody")&&(i=b(i).children().get(0));var m={draggedItem:null,placeHolderItem:null,pos:null,offset:null,offsetLimit:null,scroll:null,container:i,init:function(){b(this.container).attr("data-listIdx", k).mousedown(this.grabItem).find(d.dragSelector).css("cursor","pointer");b(this.container).children(d.itemSelector).each(function(a){b(this).attr("data-itemIdx",a)})},grabItem:function(e){if(!(e.which!=1||b(e.target).is(d.dragSelectorExclude))){for(var c=e.target;!b(c).is("[data-listIdx='"+b(this).attr("data-listIdx")+"'] "+d.dragSelector);){if(c==this)return;c=c.parentNode}a!=null&&a.draggedItem!=null&&a.dropItem();b(e.target).css("cursor","move");a=g[b(this).attr("data-listIdx")];a.draggedItem= b(c).closest(d.itemSelector);var c=parseInt(a.draggedItem.css("marginTop")),f=parseInt(a.draggedItem.css("marginLeft"));a.offset=a.draggedItem.offset();a.offset.top=e.pageY-a.offset.top+(isNaN(c)?0:c)-1;a.offset.left=e.pageX-a.offset.left+(isNaN(f)?0:f)-1;if(!d.dragBetween)c=b(a.container).outerHeight()==0?Math.max(1,Math.round(0.5+b(a.container).children(d.itemSelector).size()*a.draggedItem.outerWidth()/b(a.container).outerWidth()))*a.draggedItem.outerHeight():b(a.container).outerHeight(),a.offsetLimit= b(a.container).offset(),a.offsetLimit.right=a.offsetLimit.left+b(a.container).outerWidth()-a.draggedItem.outerWidth(),a.offsetLimit.bottom=a.offsetLimit.top+c-a.draggedItem.outerHeight();var c=a.draggedItem.height(),f=a.draggedItem.width(),h=a.draggedItem.attr("style");a.draggedItem.attr("data-origStyle",h?h:"");d.itemSelector=="tr"?(a.draggedItem.children().each(function(){b(this).width(b(this).width())}),a.placeHolderItem=a.draggedItem.clone().attr("data-placeHolder",!0),a.draggedItem.after(a.placeHolderItem), a.placeHolderItem.children().each(function(){b(this).css({borderWidth:0,width:b(this).width()+1,height:b(this).height()+1}).html("&nbsp;")})):(a.draggedItem.after(d.placeHolderTemplate),a.placeHolderItem=a.draggedItem.next().css({height:c,width:f}).attr("data-placeHolder",!0));a.draggedItem.css({position:"absolute",opacity:0.8,"z-index":999,height:c,width:f});b(g).each(function(a,b){b.createDropTargets();b.buildPositionTable()});a.scroll={moveX:0,moveY:0,maxX:b(document).width()-b(window).width(), maxY:b(document).height()-b(window).height()};a.scroll.scrollY=window.setInterval(function(){if(d.scrollContainer!=window)b(d.scrollContainer).scrollTop(b(d.scrollContainer).scrollTop()+a.scroll.moveY);else{var c=b(d.scrollContainer).scrollTop();if(a.scroll.moveY>0&&c<a.scroll.maxY||a.scroll.moveY<0&&c>0)b(d.scrollContainer).scrollTop(c+a.scroll.moveY),a.draggedItem.css("top",a.draggedItem.offset().top+a.scroll.moveY+1)}},10);a.scroll.scrollX=window.setInterval(function(){if(d.scrollContainer!=window)b(d.scrollContainer).scrollLeft(b(d.scrollContainer).scrollLeft()+ a.scroll.moveX);else{var c=b(d.scrollContainer).scrollLeft();if(a.scroll.moveX>0&&c<a.scroll.maxX||a.scroll.moveX<0&&c>0)b(d.scrollContainer).scrollLeft(c+a.scroll.moveX),a.draggedItem.css("left",a.draggedItem.offset().left+a.scroll.moveX+1)}},10);a.setPos(e.pageX,e.pageY);b(document).bind("selectstart",a.stopBubble);b(document).bind("mousemove",a.swapItems);b(document).bind("mouseup",a.dropItem);d.scrollContainer!=window&&b(window).bind("DOMMouseScroll mousewheel",a.wheel);return!1}},setPos:function(e, c){var f=c-this.offset.top,h=e-this.offset.left;d.dragBetween||(f=Math.min(this.offsetLimit.bottom,Math.max(f,this.offsetLimit.top)),h=Math.min(this.offsetLimit.right,Math.max(h,this.offsetLimit.left)));this.draggedItem.parents().each(function(){if(b(this).css("position")!="static"&&(!b.browser.mozilla||b(this).css("display")!="table")){var a=b(this).offset();f-=a.top;h-=a.left;return!1}});if(d.scrollContainer==window)c-=b(window).scrollTop(),e-=b(window).scrollLeft(),c=Math.max(0,c-b(window).height()+ 5)+Math.min(0,c-5),e=Math.max(0,e-b(window).width()+5)+Math.min(0,e-5);else var l=b(d.scrollContainer),g=l.offset(),c=Math.max(0,c-l.height()-g.top)+Math.min(0,c-g.top),e=Math.max(0,e-l.width()-g.left)+Math.min(0,e-g.left);a.scroll.moveX=e==0?0:e*d.scrollSpeed/Math.abs(e);a.scroll.moveY=c==0?0:c*d.scrollSpeed/Math.abs(c);this.draggedItem.css({top:f,left:h})},wheel:function(e){if((b.browser.safari||b.browser.mozilla)&&a&&d.scrollContainer!=window){var c=b(d.scrollContainer),f=c.offset();e.pageX>f.left&& e.pageX<f.left+c.width()&&e.pageY>f.top&&e.pageY<f.top+c.height()&&(f=e.detail?e.detail*5:e.wheelDelta/-2,c.scrollTop(c.scrollTop()+f),e.preventDefault())}},buildPositionTable:function(){var a=this.draggedItem==null?null:this.draggedItem.get(0),c=[];b(this.container).children(d.itemSelector).each(function(d,h){if(h!=a){var g=b(h).offset();g.right=g.left+b(h).width();g.bottom=g.top+b(h).height();g.elm=h;c.push(g)}});this.pos=c},dropItem:function(){if(a.draggedItem!=null){b(a.container).find(d.dragSelector).css("cursor", "pointer");a.placeHolderItem.before(a.draggedItem);var e=a.draggedItem.attr("data-origStyle");a.draggedItem.attr("style",e);e==""&&a.draggedItem.removeAttr("style");a.draggedItem.removeAttr("data-origStyle");a.placeHolderItem.remove();b("[data-dropTarget]").remove();window.clearInterval(a.scroll.scrollY);window.clearInterval(a.scroll.scrollX);var c=!1;b(g).each(function(){b(this.container).children(d.itemSelector).each(function(a){parseInt(b(this).attr("data-itemIdx"))!=a&&(c=!0,b(this).attr("data-itemIdx", a))})});c&&d.dragEnd.apply(a.draggedItem);a.draggedItem=null;b(document).unbind("selectstart",a.stopBubble);b(document).unbind("mousemove",a.swapItems);b(document).unbind("mouseup",a.dropItem);d.scrollContainer!=window&&b(window).unbind("DOMMouseScroll mousewheel",a.wheel);return!1}},stopBubble:function(){return!1},swapItems:function(e){if(a.draggedItem==null)return!1;a.setPos(e.pageX,e.pageY);for(var c=a.findPos(e.pageX,e.pageY),f=a,h=0;c==-1&&d.dragBetween&&h<g.length;h++)c=g[h].findPos(e.pageX, e.pageY),f=g[h];if(c==-1||b(f.pos[c].elm).attr("data-placeHolder"))return!1;j==null||j.top>a.draggedItem.offset().top||j.left>a.draggedItem.offset().left?b(f.pos[c].elm).before(a.placeHolderItem):b(f.pos[c].elm).after(a.placeHolderItem);b(g).each(function(a,b){b.createDropTargets();b.buildPositionTable()});j=a.draggedItem.offset();return!1},findPos:function(a,b){for(var d=0;d<this.pos.length;d++)if(this.pos[d].left<a&&this.pos[d].right>a&&this.pos[d].top<b&&this.pos[d].bottom>b)return d;return-1}, createDropTargets:function(){d.dragBetween&&b(g).each(function(){var d=b(this.container).find("[data-placeHolder]"),c=b(this.container).find("[data-dropTarget]");d.size()>0&&c.size()>0?c.remove():d.size()==0&&c.size()==0&&(b(this.container).append(a.placeHolderItem.removeAttr("data-placeHolder").clone().attr("data-dropTarget",!0)),a.placeHolderItem.attr("data-placeHolder",!0))})}};m.init();g.push(m)});return this};b.fn.dragsort.defaults={itemSelector:"li",dragSelector:"li",dragSelectorExclude:"input, textarea, a[href]", dragEnd:function(){},dragBetween:!1,placeHolderTemplate:"<li>&nbsp;</li>",scrollContainer:window,scrollSpeed:5}})(jQuery);



	if (localStorageFail) {
		RESFail = "Sorry, but localStorage seems inaccessible. Reddit Enhancement Suite can't work without it. \n\n";
		if (typeof(safari) != 'undefined') {
			RESFail += 'Since you\'re using Safari, it might be that you\'re in private browsing mode, which unfortunately is incompatible with RES until Safari provides a way to allow extensions localStorage access.';
		} else if (typeof(chrome) != 'undefined') {
			RESFail += 'Since you\'re using Chrome, you might just need to go to your extensions settings and check the "Allow in Incognito" box.';
		} else if (typeof(opera) != 'undefined') {
			RESFail += 'Since you\'re using Opera, you might just need to go to your extensions settings and click the gear icon, then click "privacy" and check the box that says "allow interaction with private tabs".';
		} else {
			RESFail += 'Since it looks like you\'re using Firefox, you probably need to go to about:config and ensure that dom.storage.enabled is set to true, and that dom.storage.default_quota is set to a number above zero (i.e. 5120, the normal default)".';
		}
		var userMenu = document.querySelector('#header-bottom-right');
		if (userMenu) {
			var preferencesUL = userMenu.querySelector('UL');
			var separator = document.createElement('span');
			separator.setAttribute('class','separator');
			separator.innerHTML = '|';
			RESPrefsLink = document.createElement('a');
			RESPrefsLink.setAttribute('href','javascript:void(0)');
			RESPrefsLink.addEventListener('click', function(e) {
				e.preventDefault();
				alert(RESFail);
			}, true);
			RESPrefsLink.innerHTML = '[RES - ERROR]';
			RESPrefsLink.setAttribute('style','color: red; font-weight: bold;');
			insertAfter(preferencesUL, RESPrefsLink);
			insertAfter(preferencesUL, separator);
		}
	} else {
		document.body.addEventListener('mousemove', RESUtils.setMouseXY, false);
		// added this if statement because some people's Greasemonkey "include" lines are getting borked or ignored, so they're calling RES on non-reddit pages.
		if (location.href.match(/^(http|https):\/\/([\w]+.)?reddit\.com/i)) {
			RESUtils.firstRun();
			RESUtils.checkForUpdate();
			// add the config console link...
			RESConsole.create();
			RESConsole.addConsoleLink();
			RESConsole.addConsoleDropdown();
			RESUtils.checkIfSubmitting();
			// go through each module and run it
			for (var thisModuleID in modules) {
				if (typeof(modules[thisModuleID]) == 'object') {
					  // console.log(thisModuleID + ' start: ' + Date());
					  // perfTest(thisModuleID+' start');
					modules[thisModuleID].go();
					  // perfTest(thisModuleID+' end');
					  // console.log(thisModuleID + ' end: ' + Date());
				}
			}
			GM_addStyle(RESUtils.css);
		//	console.log('end: ' + Date());
		}
		if ((location.href.match(/reddit.honestbleeps.com\/download/)) || (location.href.match(/redditenhancementsuite.com\/download/))) {
			var installLinks = document.body.querySelectorAll('.install');
			for (var i=0, len=installLinks.length;i<len;i++) {
				addClass(installLinks[i], 'update');
				addClass(installLinks[i], 'res4'); // if update but not RES 4, then FF users == greasemonkey...
				removeClass(installLinks[i], 'install');
			}
		}
		konami = new Konami();
		konami.code = function() {
			var baconBit = createElementWithID('div','baconBit');
			document.body.appendChild(baconBit);
			RESUtils.notification({header: 'RES Easter Eggies!', message: 'Mmm, bacon!'});
			setTimeout(function() {
				addClass(baconBit,'makeitrain');
			}, 500);
		}
		konami.load();
	
	}
}

RESStorage = {};
function setUpRESStorage (response) {
	if (typeof(chrome) != 'undefined') {
		RESStorage = response;
		// we'll set up a method for getItem, but it's not adviseable to use since it's asynchronous...
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		// if the fromBG parameter is true, we've been informed by another tab that this item has updated. We should update the data locally, but not send a background request.
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					chrome.extension.sendRequest(thisJSON, function(response) {
						// this is an asynchronous response, we don't really need to do anything here...
					});
				}
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			chrome.extension.sendRequest(thisJSON, function(response) {
				// this is an asynchronous response, we don't really need to do anything here...
			});
		}
		window.localStorage = RESStorage;
		//RESInit();
	} else if (typeof(safari) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					safari.self.tab.dispatchMessage("localStorage", thisJSON);
				}
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			safari.self.tab.dispatchMessage("localStorage", thisJSON);
		}
		window.localStorage = RESStorage;
	} else if (typeof(opera) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
				// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
				// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					opera.extension.postMessage(JSON.stringify(thisJSON));
				} 
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			opera.extension.postMessage(JSON.stringify(thisJSON));
		}
		window.localStorage = RESStorage;
	} else if (typeof(self.on) != 'undefined') {
		RESStorage = response;
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			return null;
		}
		RESStorage.setItem = function(key, value, fromBG) {
			// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
			if (RESStorage[key] != value) {
				RESStorage[key] = value;
				var thisJSON =  {
					requestType: 'localStorage',
					operation: 'setItem',
					itemName: key,
					itemValue: value
				}
				if (!fromBG) {
					self.postMessage(thisJSON);
				} 
			}
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			var thisJSON =  {
				requestType: 'localStorage',
				operation: 'removeItem',
				itemName: key
			}
			self.postMessage(thisJSON);
		}
		window.localStorage = RESStorage;
	} else {
		// must be firefox w/greasemonkey...
		//
		RESStorage.getItem = function(key) {
			if (typeof(RESStorage[key]) != 'undefined') return RESStorage[key];
			RESStorage[key] = GM_getValue(key);
			if (typeof(RESStorage[key]) == 'undefined') return null;
			return GM_getValue(key);
		}
		RESStorage.setItem = function(key, value) {
			// save it locally in the RESStorage variable, but also write it to the extension's localStorage...
			// It's OK that saving it is asynchronous since we're saving it in this local variable, too...
			// Wow, GM_setValue doesn't support big integers, so we have to store anything > 2147483647 as a string, so dumb.
			if (typeof(value) != 'undefined') {
				// if ((typeof(value) == 'number') && (value > 2147483647)) {
				if (typeof(value) == 'number') {
					value = value.toString();
				}
			//Protect from excessive disk I/O...
			if (RESStorage[key] != value) {
					RESStorage[key] = value;
					// because we may want to use jQuery events to call GM_setValue and GM_getValue, we must use this ugly setTimeout hack.
					setTimeout(function() {
						GM_setValue(key, value);
					}, 0);
				}
			}
			return true;
		}
		RESStorage.removeItem = function(key) {
			// delete it locally in the RESStorage variable, but also delete it from the extension's localStorage...
			// It's OK that deleting it is asynchronous since we're deleting it in this local variable, too...
			delete RESStorage[key];
			GM_deleteValue(key);
			return true;
		}
	}
	RESdoBeforeLoad();
}

(function(u) {
	// Don't fire the script on the iframe. This annoyingly fires this whole thing twice. Yuck.
	// Also don't fire it on static.reddit or thumbs.reddit, as those are just images.
	// Also omit blog and code.reddit
	if ((typeof(RESRunOnce) != 'undefined') || (location.href.match(/\/toolbar\/toolbar\?id/i)) || (location.href.match(/comscore-iframe/i)) || (location.href.match(/static\.reddit/i)) || (location.href.match(/thumbs\.reddit/i)) || (location.href.match(/blog\.reddit/i)) || (location.href.match(/code\.reddit/i)) || (location.href.match(/metareddit.com/i))) {
		// do nothing.
		return false;
	}
	RESRunOnce = true;
	if (typeof(chrome) != 'undefined') {
		// we've got chrome, get a copy of the background page's localStorage first, so don't init until after.
		var thisJSON = {
			requestType: 'getLocalStorage'
		}
		chrome.extension.sendRequest(thisJSON, function(response) {
			// Does RESStorage have actual data in it?  If it doesn't, they're a legacy user, we need to copy 
			// old schol localStorage from the foreground page to the background page to keep their settings...
			if (typeof(response.importedFromForeground) == 'undefined') {
				// it doesn't exist.. copy it over...
				var thisJSON = {
					requestType: 'saveLocalStorage',
					data: localStorage
				}
				chrome.extension.sendRequest(thisJSON, function(response) {
					setUpRESStorage(response);
				});
			} else {
				setUpRESStorage(response);
			}
		});
	} else if (typeof(safari) != 'undefined') {
		// we've got safari, get localStorage from background process
		thisJSON = {
			requestType: 'getLocalStorage'
		}
		safari.self.tab.dispatchMessage("getLocalStorage", thisJSON);
	} else if (typeof(self.on) != 'undefined') {
		// we've got firefox jetpack, get localStorage from background process
		thisJSON = {
			requestType: 'getLocalStorage'
		}
		self.postMessage(thisJSON);
	} else if (typeof(opera) != 'undefined') {
		// I freaking hate having to use different code that won't run in other browsers to log debugs, so I'm overriding console.log with opera.postError here
		// so I don't have to litter my code with different statements for different browsers when debugging.
		console.log = opera.postError;
		opera.extension.addEventListener( "message", operaMessageHandler, false);	
		window.addEventListener("DOMContentLoaded", function(u) {
			// we've got opera, let's check for old localStorage...
			// RESInit() will be called from operaMessageHandler()
			thisJSON = {
				requestType: 'getLocalStorage'
			}
			opera.extension.postMessage(JSON.stringify(thisJSON));
		}, false);
	} else {
		// Check if GM_getValue('importedFromForeground') has been set.. if not, this is an old user using localStorage;
		(typeof(unsafeWindow) != 'undefined') ? ls = unsafeWindow.localStorage : ls = localStorage;
		if (GM_getValue('importedFromForeground') != 'true') {
			// It doesn't exist, so we need to copy localStorage over to GM_setValue storage...
			for (var i = 0, len=ls.length; i < len; i++){
				var value = ls.getItem(ls.key(i));
				if (typeof(value) != 'undefined') {
					if ((typeof(value) == 'number') && (value > 2147483647)) {
						value = value.toString();
					}
					if (ls.key(i)) {
						GM_setValue(ls.key(i), value);
					}
				}
			}
			GM_setValue('importedFromForeground','true');
		}
		setUpRESStorage();
		//RESInit();
		// console.log(GM_listValues());
	}
})();

function RESInitReadyCheck() {
	if ((typeof(RESStorage.getItem) != 'function') || (document.body == null)) {
		setTimeout(RESInitReadyCheck, 50);
	} else {
		if (typeof(self.on) == 'function') {
			// firefox addon sdk... we've included jQuery... 
			// also, for efficiency, we're going to try using unsafeWindow for "less secure" (but we're not going 2 ways here, so that's OK) but faster DOM node access...
			// console.log('faster?');
			document = unsafeWindow.document;
			window = unsafeWindow;
			if (typeof($) != 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		} else if ((typeof(unsafeWindow) != 'undefined') && (unsafeWindow.jQuery)) {
			// greasemonkey -- should load jquery automatically because of @require line
			// in this file's header
			if (typeof($) == 'undefined') {
				// greasemonkey-like userscript
				$ = unsafeWindow.jQuery;
				jQuery = $;
			}
		} else if (typeof(window.jQuery) == 'function') {
			// opera...
			$ = window.jQuery;
			jQuery = $;
		} else {
			// chrome and safari...
			if (typeof($) != 'function') {
				console.log('Uh oh, something has gone wrong loading jQuery...');
			}
		}
		$(document).ready(RESInit);
		// RESInit();
	}
}

window.onload = RESInitReadyCheck();

var lastPerf = 0;
function perfTest(name) {
	var d = new Date();
	var diff = d.getTime() - lastPerf;
	console.log(name+' executed. Diff since last: ' + diff +'ms');
	lastPerf=d.getTime();
}

