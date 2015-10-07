/* myrandom.js
 * reddit's paywalled myrandom button, for everyone
 * compatible with Reddit Enhancement Suite's subreddit manager
 * 1.0.20151006
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://github.com/eligrey/myrandom.js/blob/master/LICENSE.md
 */

document.addEventListener("DOMContentLoaded", function() {
	var
	  cached_subreddits = (localStorage.mySubreddits || "").split("+")
	, freshness = +localStorage.mySubredditsLastAccess || 0
	, stale = localStorage.mySubredditsRefreshInterval || 172800000 // refresh after 48hrs
	, random_native = document.querySelector(".random.choice[href$='/r/random/']")
	, random_res = document.querySelector(".subbarlink[href$='/r/random/']")
	, myrandom_native = document.querySelector(".choice[href$='/r/myrandom/']")
	, myrandom_res = document.querySelector(".subbarlink[href$='/r/myrandom/']")
	, myrandom = myrandom_native || myrandom_res
	, random = random_native || random_res
	, insert_myrandom = function() {
		if (!myrandom) {
			var
			// support inserting myrandom into the native subreddit bar or RES's subreddit manager bar
			  parent = random.parentNode
			, random_next_sibling = random.nextElementSibling
			, myrandom_container = random_native
				? parent.parentNode.insertBefore(document.createElement("li"), parent.nextElementSibling)
				: parent // RES's subreddit manager bar doesn't use a <ul> like reddit's subreddit bar
			, separator = myrandom_container.insertBefore(document.createElement("span"), random_next_sibling)
			;
			separator.classList.add("separator");
			separator.appendChild(document.createTextNode("-"));
			myrandom = myrandom_container.insertBefore(document.createElement("a"), random_next_sibling);
			myrandom.classList.add(random_native ? "choice" : "subbarlink");
			myrandom.appendChild(document.createTextNode("myrandom"));
			myrandom.href = "/r/myrandom/";
		}

		myrandom.addEventListener("click", function(event) {
			var url = "/r/" + cached_subreddits[Math.floor(Math.random() * cached_subreddits.length)] + "/";
			event.preventDefault();
			if (event.which === 2) { // middle click
				open(url);
			} else {
				location.href = url;
			}
		});
	}
	;

	insert_myrandom();

	if (!localStorage.mySubredditsRefreshInterval) {
		localStorage.mySubredditsRefreshInterval = stale;
	}

	if (freshness + stale < Date.now()) {
		var
		  req = new XMLHttpRequest
		, onload = function() {
			cached_subreddits = (localStorage.mySubreddits = req.response
				.evaluate(
					  "//ul/a[text()='multireddit of your subscriptions']", req.response, null
					, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null
				)
				.iterateNext()
				.href
				.split("/r/")[1]
			).split("+");
			localStorage.mySubredditsLastAccess = Date.now();
		  }
		;

		req.responseType = "document";
		req.addEventListener("load", onload);
		req.open("GET", "/subreddits/");
		req.send();
	}
});