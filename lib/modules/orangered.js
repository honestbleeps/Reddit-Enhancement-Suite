addModule('orangered', function(module, moduleID) {
	module.moduleName = 'Unread Messages'
	module.category = 'Comments';
	module.description = 'Helping you get your daily dose of orangereds';

	module.options = {
		openMailInNewTab: {
			description: 'When clicking the mail envelope or modmail icon, open mail in a new tab?',
			type: 'enum',
			value: false
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
		unreadLinksToInbox: {
			type: 'boolean',
			value: false,
			description: 'Always go to the inbox, not unread messages, when clicking on orangered',
			advanced: true
		},
		hideModMail: {
			type: 'boolean',
			value: false,
			description: 'Hide the mod mail button in user bar.'
		}
	};

	module.go = function() {
		if (!(module.isEnabled() && module.isMatchURL())) return;

		if (module.options.openMailInNewTab.value) {
			$('#mail, #modmail').attr('target', '_blank');
		}

		if ((RESUtils.loggedInUser() !== null) && ((module.options.showUnreadCount.value) || (module.options.showUnreadCountInTitle.value) || (module.options.showUnreadCountInFavicon.value))) {
			module.setupFaviconBadge();

			// Reddit CSS change broke this when they went to sprite sheets.. new CSS will fix the issue.
			// removing text indent - on 11/14/11 reddit changed the mail sprites, so I have to change how this is handled..
			RESUtils.addCSS('#mail { top: 2px; min-width: 16px !important; width: auto !important; background-repeat: no-repeat !important; line-height: 8px !important; }');
			// RESUtils.addCSS('#mail.havemail { top: 2px !important; margin-right: 1px; }');
			RESUtils.addCSS('#mail.havemail { top: 2px !important; }');
			if ((BrowserDetect.isChrome()) || (BrowserDetect.isSafari())) {
				// I hate that I have this conditional CSS in here but I can't figure out why it's needed for webkit and screws up firefox.
				RESUtils.addCSS('#mail.havemail { top: 0; }');
			}
			module.showUnreadCount();
		}
		if ((RESUtils.loggedInUser() !== null) && !module.options.showUnreadCount.value) {
			module.hideUnreadCount();
		}
		if (module.options.hideModMail.value) {
			RESUtils.addCSS('#modmail, #modmail + .separator { display:none; }');
		}

	}

	$.extend(true, module, {
		getInboxLink: function(havemail) {
			if (havemail && !module.options.unreadLinksToInbox.value) {
				return '/message/unread/';
			}

			return '/message/inbox/';
		},
		showUnreadCount: function() {
			if ((typeof module.mail === 'undefined') && module.options.showUnreadCount.value) {
				// deprecate this feature once reddit's own goes live...
				module.mail = document.getElementById('mail');
				if (!document.querySelector('.message-count') || module.options.retroUnreadCount.value) {
					if (module.mail) {
						module.mailCount = RESUtils.createElementWithID('a', 'mailCount');
						module.mailCount.display = 'none';
						module.mailCount.setAttribute('href', module.getInboxLink(true));
						RESUtils.insertAfter(module.mail, module.mailCount);
					}
					// since retroUnreadCount must be turned on (or the new one isn't active yet),
					// add the CSS to hide the "new" unread count
					module.hideUnreadCount();
				} else {
					module.deprecateMailCount = true;
				}
			}
			if (module.mail) {
				$(module.mail).html('');
				var msgCountCacheKey = 'RESmodules.' + moduleID + '.msgCount.' + RESUtils.loggedInUser();
				if (module.mail.classList.contains('havemail')) {
					module.mail.setAttribute('href', module.getInboxLink(true));
					var countDiv = document.querySelector('.message-count'),
						count;

					// the new way of getting message count is right from reddit, as it will soon
					// output the message count, replacing RES's check.
					if (countDiv) {
						count = countDiv.textContent;
						module.setUnreadCount(count || 0);
					} else {
						// if the countDiv doesn't exist, we still need to use the old way of polling
						// reddit for unread count
						RESUtils.cache.fetch({
							key: msgCountCacheKey,
							endpoint: 'message/unread/.json?mark=false',
							handleData: function(response) {
								return response.data.children.length || 0;
							},
							callback: module.setUnreadCount.bind(module)
						});
					}
				} else {
					// console.log('no need to get count - no new mail. resetting lastCheck');
					module.setUnreadCount(0);
					RESUtils.cache.expire({ key: msgCountCacheKey });
				}
			}
		},
		hideUnreadCount: function() {
			RESUtils.addCSS('.message-count { display: none; }');
		},
		setUnreadCount: function(count, fromMessage) {
			if (count > 0) {
				if (module.options.showUnreadCountInTitle.value) {
					document.title = '[' + count + '] ' + document.title.replace(/^\[[\d]+\]\s/, '');
				}
				module.updateFaviconBadge(count);
				if (module.options.showUnreadCount.value && !module.deprecateMailCount) {
					module.mailCount.display = 'inline-block';
					module.mailCount.textContent = '[' + count + ']';
					if (modules['neverEndingReddit'].NREMailCount) {
						modules['neverEndingReddit'].NREMailCount.display = 'inline-block';
						modules['neverEndingReddit'].NREMailCount.textContent = '[' + count + ']';
					}
				}
			} else {
				document.title = document.title.replace(/^\[[\d]+\]\s/, '');
				if (module.mailCount) {
					module.mailCount.display = 'none';
					$(module.mailCount).html('');
					if (modules['neverEndingReddit'].NREMailCount) {
						modules['neverEndingReddit'].NREMailCount.display = 'none';
						$(modules['neverEndingReddit'].NREMailCount).html('');
					}
				}
				module.updateFaviconBadge(0);
			}

			if (!fromMessage && typeof count !== 'undefined') {
				RESUtils.runtime.sendMessage({
					requestType: 'multicast',
					moduleID: moduleID,
					method: 'setUnreadCount',
					arguments: Array.prototype.slice.call(arguments)
				});
			}

		},
		updateFaviconBadge: function(count) {
			if (!(module.isEnabled() && module.isMatchURL())) return;
			if (module.options.showUnreadCountInFavicon.value) {
				module.setupFaviconBadge();

				count = count || 0;
				module.favicon.badge(count);
			}
		},
		setupFaviconBadge: function() {
			if (module.favicon) return;

			if (module.options.showUnreadCountInFavicon.value) {
				var faviconDataurl = 'data:image/x-icon;base64,AAABAAEAICAAAAAAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP//5s3//+3T///w1v//8Nb//u7V//7u1f/+7tX///DW//7u1f/+6M//+eDI//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G///mzf//8Nb//ePL/9O/qv+hkYL/eW1g/1pQRv9HPzf/Rz83/1VLQf91aV3/mYl6/8i1of/23cb//u7V//7p0P/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//3jy///8Nb/2cax/3VpXf8fGxj/BAQE/xIUFv8sLzH/RkhK/1pcXf9bXV//TE5Q/zAzNf8WGBn/BAQE/xQRDv9cUkj/xbOg//7s0v/+6M//9t3G//bdxv/23cb/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv//7dP/7NfA/2RbUf8CAQH/IyQm/4GDhP/Ozs//+Pj4//////////////////////////////////39/f/Z2dr/lZaW/zc5O/8AAAD/RDw1/9TBrf//8Nb/9t3G//bdxv/23cb/9t3G///w1v8AAAAA/u7V//bdxv/23cb//u7V/8Oyn/8TEA3/ICIk/6+vsP/+/v7//v7+//7+/v/+/v7//v7+//7+/v/29vb/8/P0//39/f/+/v7//v7+//7+/v/+/v7//v7+/8vLy/8/QUL/AAAA/52PgP/+8df/+N7G//bdxv/23cb//u7V/wAAAAD+7tX/9t3G//7u1f+/rZr/AAAA/2JjZP/6+vr//v7+//7+/v/+/v7//v7+/7Ozs/9RUVH/IyMj/xYWFv8UFBT/Ghoa/zg4OP+MjIz/+Pj4//7+/v/+/v7//v7+//7+/v+Pj4//AAAA/41/cv//8Nb/9t3G//bdxv/+7tX/AAAAAP7u1f/85c3/59G7/wUDAv9pamv//v7+//7+/v/+/v7//v7+//7+/v9dXV3/AAAA/1dXV/+bm5v/vb2+/8PDw/+tra3/dnZ2/xYWFv8lJSX/8fHx//7+/v/+/v7//v7+//7+/v+hoqL/AAAA/7+tmv/+7NL/9t3G//7u1f8AAAAA//DW///w1v9aUEb/IyQm/////////////////////////////////4+Pj//Ly8v/////////////////////////////////8PDw/4WFhf/w8PD///////////////////////////9WWFr/Ix8a//znzv/54Mj///DW/wAAAAD+9dv/6dK7/wIBAf+rrK3//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9/f4P8AAAD/w66b//7p0P/+7tX/AAAAAP784P+8qZb/BgcH/+vr6//+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/yMkJv+CdGb//u7V//7u1f8AAAAA/v7j/76rmP8ODg//9PT1//7+/v/+/v7//v7+//7+/v/+/v7//v7+/9TY/v/z9f7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+/8vP/v/s7/7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/LzEz/4J0Zv/+99z//u7V/wAAAAD//+X/b2NY/wAAAP/d3d3///////////////////////f5//9QVv//AAD//yUq///d4f////////////////////////f5//9KT///AAD//x0h///Y2/////////////////////////////8VFxj/Ni8o/+zZwv//+N3/AAAAALWjkf8DBQf/EBAQ/3R0dP/+/v7//v7+//7+/v/+/v7/xsv+/wAA//8AAP//AAD//4GH/v/+/v7//v7+//7+/v/+/v7/yM3+/wAA//8AAP//AAD//32D/v/+/v7//v7+//7+/v/+/v7/t7e3/wQEBP8jJCb/Miwn//7z2v8AAAAAQTgx/3p7ff+3t7f/AAAA/9LS0v/+/v7//v7+//7+/v/l6P7/Ehb+/wAA//8AAP//t7z+//7+/v/+/v7//v7+//7+/v/p7P7/GR7+/wAA//8AAP//ub7+//7+/v/+/v7//v7+//n5+f8WFhb/ZWVl//Pz9P8DBQf/t6KQ/wAAAAAxKiT/jI2P//7+/v9RUVH/Dg4P/9vb2//+/v7//v7+//7+/v/U2P7/fYP+/7G2/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/b3/7/iI3+/7m+/v/+/v7//v7+//7+/v/09PX/PDw8/xkZGf/x8fH//v7+/zAzNf+Ddmj/AAAAAH9wY/8XGhz/8PDw//////9XV1f/EhIS/6anp///////////////////////////////////////////////////////////////////////////////////////xcXG/ysrLP8vLy//8PDw///////q6ur/AQMF/7mkkv8AAAAA9+rS/y4pJf8QEhT/YGJj/0lLTf8AAAD/AAAA/zU3Of+vr7D/+Pj4//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7//v7+//7+/v/+/v7/xcXG/1JTVf8CAQH/AAAA/0JERv+1trf/nZ6e/xkbHf82MCr//vXb/wAAAAD/+N3/89vE/4l7bf9EPDX/WE5F/7+tmv/Ww6//Vk1E/wYFBP8SFBb/UlNV/5KTlP+9vb7/3d3d/+rq6v/r6+v/39/g/8vLy/+fn6D/X2Bi/x4gIv8CAQH/OzUu/8Gwnf/Rv6r/Rz83/w4MCf8TEA3/ZFpP/+/Zwv/+99z/AAAAAP7u1f/74sn//u7V//7u1f/+7tX//unQ//7oz//+7tX/4s23/5aHeP9JQTj/GxcT/wkIB/8GBwf/BwgJ/w4OD/8KCgr/BgUE/xMQDf8+Ny//g3Zo/9O/qv/+7NL//unQ//7oz//+6dD/79fA//PbxP/+7tX/++LJ//7u1f8AAAAA//DW//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/948v//u7V//7u1f/74sn/5s+5/9G9qP+olob/AAAA/5+QgP/iz7n/89vE///t0//+7tX//+bN//bdxv/23cb//+bN//7p0P//5s3/+eDI//bdxv/23cb///DW/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//ngyP/948v//unQ///w1v8jIB3/hHdr///43f/54Mj/9t3G//bdxv/23cb/++LJ//7p0P/Tvan/w7Cc//PbxP/+6M//9tzE//bdxv/+7tX/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//vHX/21jWf8uKSX//unQ//bdxv/23cb/9t3G//ngyP/85c3/YllP/wMCAv8GBwf/IR0a/9TBrf/+6M//9t3G//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/+6dD/vquY/wMCAv/iy7X//ePL//bdxv/74sn//vne/5SFdv8BAwX/wcLC/+Li4v9ERkj/KCMf//nlzP/54Mj//u7V/wAAAAD/8Nb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//viyf/z28T/DAsL/6GRgv///+X//+3T/+/Zwv/JvKj/Ix8a/2NlZv///////////9nZ2v8AAAD/3MWw///mzf//8Nb/AAAAAP7u1f/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G///w1v9PR0D/Mi0p/3l1af84My7/EBAQ/woKCv8PDQz/NDU2//v7+//+/v7/iYqL/wgGBP/v18D/++LJ//7u1f8AAAAA/u7V//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb//uzS/7Ggj/8UEhH/MCom/2phV/+omYj/4M23/9/Ltv8fGxj/Gx0f/zI0Nv8AAAD/mot9//7s0v/23cb//u7V/wAAAAD+7tX/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/+eDI/+/XwP/+6dD///DW//7s0v/948v//unQ/+fRu/+Ddmj/bmJW/8Gum//+7NL/9t3G//bdxv/+7tX/AAAAAP/w1v/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/23cb/9t3G//bdxv/43sb/++LJ//jexv/23cb/9t3G//bdxv/23cb//ePL//7u1f//8Nb//unQ//bdxv/23cb/9t3G///w1v8AAAAA///n///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb///DW///w1v//8Nb////n/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAgAAAAP////8=';
				// Remove current favicons and replace accordingly, or Favico has a cross domain issue since the real favicon is on redditstatic.com.
				$('head link[rel="shortcut icon"], head link[rel="icon"]').attr('href', faviconDataurl);

				// Init Favico
				this.favicon = new window.Favico();

				// Prevent notification icon from showing up in bookmarks
				$(window).on('beforeunload', function() {
					module.favicon.reset();
				});
			}
		}
	});
});
