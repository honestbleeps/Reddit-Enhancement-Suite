addModule('orangered', function(module, moduleID) {
	module.moduleName = 'Unread Messages';
	module.category = 'My account';
	module.description = 'Helping you get your daily dose of orangereds';

	module.options = {
		openMailInNewTab: {
			description: 'When clicking the mail envelope or modmail icon, open mail in a new tab?',
			type: 'boolean',
			value: false
		},
		updateCurrentTab: {
			description: 'Update mail buttons on current tab when RES checks for orangereds',
			type: 'boolean',
			value: true,
		},
		updateOtherTabs: {
			description: 'Update all open tabs when RES checks for orangereds',
			type: 'boolean',
			value: true,
		},
		showFloatingEnvelope: {
			type: 'boolean',
			value: true,
			description: 'Show an envelope (inbox) icon in the top right corner'
		},
		showUnreadCount: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count next to orangereds?'
		},
		retroUnreadCount: {
			type: 'boolean',
			value: false,
			description: 'If you dislike the unread count provided by native reddit, you can replace it with the RES-style bracketed unread count',
			dependsOn: 'showUnreadCount'
		},
		showUnreadCountInTitle: {
			type: 'boolean',
			value: false,
			description: 'Show unread message count in page/tab title?'
		},
		showUnreadCountInFavicon: {
			type: 'boolean',
			value: true,
			description: 'Show unread message count in favicon?'
		},
		resetFaviconOnLeave: {
			type: 'boolean',
			value: true,
			description: 'Reset the favicon before leaving the page. \n\n This prevents the unread badge from appearing in bookmarks, but may hurt browser caching.'
		},
		unreadLinksToInbox: {
			type: 'boolean',
			value: false,
			description: 'Always go to the inbox, not unread messages, when clicking on orangered',
			advanced: true,
			dependsOn: 'updateCurrentTab'
		},
		hideModMail: {
			type: 'boolean',
			value: false,
			description: 'Hide the mod mail button in user bar.'
		}
	};

	var favicon;
	var mailButton, nativeMailCount;
	var resMailCount;
	var floatingInboxButton, floatingInboxCount;

	module.go = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		if (module.options.openMailInNewTab.value) {
			$('#mail, #modmail').attr('target', '_blank');
		}

		if (RESUtils.loggedInUser() !== null) {
			setupFaviconBadge();
			setupUnreadCount();
			setupFloatingButtons();

			if (!module.options.showUnreadCount.value) {
				hideUnreadCount();
			}

			if (module.options.hideModMail.value) {
				RESUtils.addCSS('#modmail, #modmail + .separator { display:none; }');
			}

			updateFromPage();
		}
	};

	module.updateFromPage = updateFromPage;
	function updateFromPage(doc) {
		if (!module.options.updateCurrentTab.value) return;

		var count = getUnreadCount(doc);

		// the new way of getting message count is right from reddit, as it will soon
		// output the message count, replacing RES's check.
		if (typeof count !== 'undefined') {
			setUnreadCount(count, doc && 'ner');
		} else if (!doc) {
			// if the countDiv doesn't exist, we still need to use the old way of polling
			// reddit for unread count
			var msgCountCacheKey = 'RESmodules.' + moduleID + '.msgCount.' + RESUtils.loggedInUser();
			RESUtils.cache.fetch({
				key: msgCountCacheKey,
				endpoint: 'message/unread/.json?mark=false',
				handleData: function(response) {
					return response.data.children.length || 0;
				},
				callback: setUnreadCount
			});
		}
	}

	module.setUnreadCount = setUnreadCount;
	function setUnreadCount(count, source) {
		updateFaviconBadge(count);
		updateTitle(count);
		updateInboxElements(count, source);
		updateMailCountElements(count, source);

		if (module.options.updateOtherTabs.value && (source !== 'rpc') && typeof count !== 'undefined') {
			RESEnvironment.sendMessage({
				requestType: 'multicast',
				moduleID: moduleID,
				method: 'setUnreadCount',
				arguments: [ count ]
			});
		}
		if (count > 0) {
			window.dispatchEvent(new Event('orangered'));
		}
	}

	function hideUnreadCount() {
		RESUtils.addCSS('.message-count { display: none; }');
	}
	function updateTitle(count) {
		if (!module.options.showUnreadCountInTitle.value) return;
		if (count > 0) {
			document.title = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/, '');
		} else {
			document.title = document.title.replace(/^\[[\d]+\]\s/, '');
		}
	}
	function updateInboxElements(count, source) {
		count = count || 0;
		var $ele = $(floatingInboxButton);
		if (module.options.updateCurrentTab.value && (source === 'rpc' || source === 'ner')) {
			$ele = $ele.add(mailButton);
		}

		$ele.attr('title', count ? 'new mail!' : 'No new mail')
			.toggleClass('havemail', !!count)
			.toggleClass('nohavemail', !count)
			.attr('href', getInboxLink(count));
	}
	function updateMailCountElements(count, source) {
		if (!module.options.showUnreadCount.value) return;

		if (nativeMailCount && module.options.updateCurrentTab.value && (source === 'rpc' || source === 'ner')) {
			nativeMailCount.style.display = count && !resMailCount ? 'inline-block' : 'none';
			nativeMailCount.textContent = count;
		}

		if (resMailCount) {
			resMailCount.style.display = count ? 'inline-block' : 'none';
			resMailCount.textContent = '[' + count + ']';
		}

		if (floatingInboxCount) {
			floatingInboxCount.style.display = count ? 'inline-block' : 'none';
			if (module.options.retroUnreadCount.value) {
				floatingInboxCount.textContent = '[' + count + ']';
			} else {
				floatingInboxCount.textContent = count;
				floatingInboxCount.classList.add('message-count');
			}
		}
	}
	function updateFaviconBadge(count) {
		if (!module.options.showUnreadCountInFavicon.value) return;
		setupFaviconBadge();

		count = count || 0;
		favicon.badge(count);
	}
	function setupFaviconBadge() {
		if (favicon) return;
		if (!module.options.showUnreadCountInFavicon.value) return;

		var faviconDataurl = 'data:image/x-icon;base64,AAABAAEAICAAAAAAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP//5s3//+3T///w1v//8Nb//u7V//7u1f/+7tX///DW//7u1f/+6M//+eDI//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G///mzf//8Nb//ePL/9O/qv+hkYL/eW1g/1pQRv9HPzf/Rz83/1VLQf91aV3/mYl6/8i1of/23cb//u7V//7p0P/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//3jy///8Nb/2cax/3VpXf8fGxj/BAQE/xIUFv8sLzH/RkhK/1pcXf9bXV//TE5Q/zAzNf8WGBn/BAQE/xQRDv9cUkj/xbOg//7s0v/+6M//9t3G//bdxv/23cb/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv//7dP/7NfA/2RbUf8CAQH/IyQm/4GDhP/Ozs//+Pj4//////////////////////////////////39/f/Z2dr/lZaW/zc5O/8AAAD/RDw1/9TBrf//8Nb/9t3G//bdxv/23cb/9t3G///w1v8AAAAA/u7V//bdxv/23cb//u7V/8Oyn/8TEA3/ICIk/6+vsP/+/v7//v7+//7+/v/+/v7//v7+//7+/v/29vb/8/P0//39/f/+/v7//v7+//7+/v/+/v7//v7+/8vLy/8/QUL/AAAA/52PgP/+8df/+N7G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//7u1f+/rZr/AAAA/2JjZP/6+vr//v7+//7+/v/+/v7//v7+/7Ozs/9RUVH/IyMj/xYWFv8UFBT/Ghoa/zg4OP+MjIz/+Pj4//7+/v/+/v7//v7+//7+/v+Pj4//AAAA/41/cv//8Nb/9t3G//bdxv/+7tX/AAAAAP7u1f/85c3/59G7/wUDAv9pamv//v7+//7+/v/+/v7//v7+//7+/v9dXV3/AAAA/1dXV/+bm5v/vb2+/8PDw/+tra3/dnZ2/xYWFv8lJSX/8fHx//7+/v/+/v7//v7+//7+/v+hoqL/AAAA/7+tmv/+7NL/9t3G//7u1f8AAAAA//DW///w1v9aUEb/IyQm/////////////////////////////////4+Pj//Ly8v/////////////////////////////////8PDw/4WFhf/w8PD///////////////////////////9WWFr/Ix8a//znzv/54Mj///DW/wAAAAD+9dv/6dK7/wIBAf+rrK3//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9/f4P8AAAD/w66b//7p0P/+7tX/AAAAAP784P+8qZb/BgcH/+vr6//+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/yMkJv+CdGb//u7V//7u1f8AAAAA/v7j/76rmP8ODg//9PT1//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9TY/v/z9f7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/8vP/v/s7/7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/LzEz/4J0Zv/+99z//u7V/wAAAAD//+X/b2NY/wAAAP/d3d3///////////////////////f5//9QVv//AAD//yUq///d4f////////////////////////f5//9KT///AAD//x0h///Y2/////////////////////////////8VFxj/Ni8o/+zZwv//+N3/AAAAALWjkf8DBQf/EBAQ/3R0dP/+/v7//v7+//7+/v/+/v7/xsv+/wAA//8AAP//AAD//4GH/v/+/v7//v7+//7+/v/+/v7/yM3+/wAA//8AAP//AAD//32D/v/+/v7//v7+//7+/v/+/v7/t7e3/wQEBP8jJCb/Miwn//7z2v8AAAAAQTgx/3p7ff+3t7f/AAAA/9LS0v/+/v7//v7+//7+/v/l6P7/Ehb+/wAA//8AAP//t7z+//7+/v/+/v7//v7+//7+/v/p7P7/GR7+/wAA//8AAP//ub7+//7+/v/+/v7//v7+//n5+f8WFhb/ZWVl//Pz9P8DBQf/t6KQ/wAAAAAxKiT/jI2P//7+/v9RUVH/Dg4P/9vb2//+/v7//v7+//7+/v/U2P7/fYP+/7G2/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/b3/7/iI3+/7m+/v/+/v7//v7+//7+/v/09PX/PDw8/xkZGf/x8fH//v7+/zAzNf+Ddmj/AAAAAH9wY/8XGhz/8PDw//////9XV1f/EhIS/6anp///////////////////////////////////////////////////////////////////////////////////////xcXG/ysrLP8vLy//8PDw///////q6ur/AQMF/7mkkv8AAAAA9+rS/y4pJf8QEhT/YGJj/0lLTf8AAAD/AAAA/zU3Of+vr7D/+Pj4//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/xcXG/1JTVf8CAQH/AAAA/0JERv+1trf/nZ6e/xkbHf82MCr//vXb/wAAAAD/+N3/89vE/4l7bf9EPDX/WE5F/7+tmv/Ww6//Vk1E/wYFBP8SFBb/UlNV/5KTlP+9vb7/3d3d/+rq6v/r6+v/39/g/8vLy/+fn6D/X2Bi/x4gIv8CAQH/OzUu/8Gwnf/Rv6r/Rz83/w4MCf8TEA3/ZFpP/+/Zwv/+99z/AAAAAP7u1f/74sn//u7V//7u1f/+7tX//unQ//7oz//+7tX/4s23/5aHeP9JQTj/GxcT/wkIB/8GBwf/BwgJ/w4OD/8KCgr/BgUE/xMQDf8+Ny//g3Zo/9O/qv/+7NL//unQ//7oz//+6dD/79fA//PbxP/+7tX/++LJ//7u1f8AAAAA//DW//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/948v//u7V//7u1f/74sn/5s+5/9G9qP+olob/AAAA/5+QgP/iz7n/89vE///t0//+7tX//+bN//bdxv/23cb//+bN//7p0P//5s3/+eDI//bdxv/23cb///DW/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP/948v//unQ///w1v8jIB3/hHdr///43f/54Mj/9t3G//bdxv/23cb/++LJ//7p0P/Tvan/w7Cc//PbxP/+6M//9tzE//bdxv/+7tX/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//vHX/21jWf8uKSX//unQ//bdxv/23cb/9t3G//ngyP/85c3/YllP/wMCAv8GBwf/IR0a/9TBrf/+6M//9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/+6dD/vquY/wMCAv/iy7X//ePL//bdxv/74sn//vne/5SFdv8BAwX/wcLC/+Li4v9ERkj/KCMf//nlzP/54Mj//u7V/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//viyf/z28T/DAsL/6GRgv///+X//+3T/+/Zwv/JvKj/Ix8a/2NlZv///////////9nZ2v8AAAD/3MWw///mzf//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G///w1v9PR0D/Mi0p/3l1af84My7/EBAQ/woKCv8PDQz/NDU2//v7+//+/v7/iYqL/wgGBP/v18D/++LJ//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//uzS/7Ggj/8UEhH/MCom/2phV/+omYj/4M23/9/Ltv8fGxj/Gx0f/zI0Nv8AAAD/mot9//7s0v/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/+eDI/+/XwP/+6dD///DW//7s0v/948v//unQ/+fRu/+Ddmj/bmJW/8Gum//+7NL/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/43sb/++LJ//jexv/23cb/9t3G//bdxv/23cb//ePL//7u1f//8Nb//unQ//bdxv/23cb/9t3G///w1v8AAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8=';
		// Remove current favicons and replace accordingly, or Favico has a cross domain issue since the real favicon is on redditstatic.com.
		$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href', faviconDataurl);

		// Init Favico
		favicon = new Favico();

		if (module.options.resetFaviconOnLeave.value) {
			// Prevent notification icon from showing up in bookmarks
			$(window).on('beforeunload', function() {
				favicon.reset();
			});
		}
	}

	function setupUnreadCount() {
		mailButton = document.getElementById('mail');
		if (module.options.showUnreadCount.value) {
			if (!resMailCount && module.options.retroUnreadCount.value) {
				// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
				// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
				RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
				// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
				RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
				if ((BrowserDetect.isChrome()) || (BrowserDetect.isSafari())) {
					// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
					RESUtils.addCSS('#mail.havemail { top: 0; }');
				}

				if (mailButton) {
					resMailCount = RESUtils.createElement('a', 'mailCount');
					resMailCount.display = 'none';
					resMailCount.setAttribute('href', getInboxLink(false));
					RESUtils.insertAfter(mailButton, resMailCount);
				}
				// since retroUnreadCount must be turned on (or the new one isn't active yet),
				// add the CSS to hide the "new" unread count
				hideUnreadCount();
			}

			nativeMailCount = document.querySelector('.message-count');
			if (!nativeMailCount && !module.options.retroUnreadCount.value) {
				if (mailButton) {
					nativeMailCount = RESUtils.createElement('a', null, 'message-count');
					nativeMailCount.style.display = 'none';
					nativeMailCount.setAttribute('href', getInboxLink(false));
					RESUtils.insertAfter(mailButton, nativeMailCount);
				}
			}
		}
	}


	function setupFloatingButtons() {
		if (!module.options.showFloatingEnvelope.value) return;
		if (floatingInboxCount) return;

		var pinHeader = modules['betteReddit'].options.pinHeader.value;
		if (pinHeader === 'sub' || pinHeader === 'none') {
			floatingInboxButton = RESUtils.createElement('a', 'NREMail');
			RESUtils.addCSS('	\
				#NREMail { display: inline-block; margin-bottom: -2px; margin-top: 5px; width: 15px; height: 10px; background: center center no-repeat; }	\
				#NREMail.nohavemail { background-image: url(https://redditstatic.s3.amazonaws.com/mailgray.png); }	\
				#NREMail.havemail { background-image: url(https://redditstatic.s3.amazonaws.com/mail.png); }	\
				.res-colorblind #NREMail.havemail { background-image: url(http://thumbs.reddit.com/t5_2s10b_5.png); }	\
				#NREMailCount { line-height: 12px; margin-top: 4px; }	\
				');
			modules['floater'].addElement(floatingInboxButton);

			floatingInboxCount = RESUtils.createElement('a', 'NREMailCount');
			floatingInboxCount.display = 'none';
			floatingInboxCount.setAttribute('href', getInboxLink(true));
			modules['floater'].addElement(floatingInboxCount);
		}
	}

	function getInboxLink(havemail) {
		if (havemail && !module.options.unreadLinksToInbox.value) {
			return '/message/unread/';
		}

		return '/message/inbox/';
	}
	function getUnreadCount(container) {
		container = container || document.body;
		var mailCount = container.querySelector('.message-count');
		var value = mailCount && parseInt(mailCount.textContent, 0);

		return value;
	}
});
