/* myrandom.js
 * reddit's paywalled myrandom button, for everyone
 * compatible with Reddit Enhancement Suite's subreddit manager
 * 1.0.20150923.1
 *
 * By Eli Grey, http://eligrey.com
 * License: X11/MIT
 *   See https://gist.github.com/eligrey/ef865687f0e961f20870#file-license-md
 */

document.addEventListener("DOMContentLoaded", function() {
	var
	  cached_subreddits = JSON.parse(localStorage.mySubreddits || "[]")
	, freshness = +localStorage.mySubredditsLastAccess || 0
	, stale = localStorage.mySubredditsRefreshInterval || 172800000 // refresh after 48hrs
	, random_native = document.querySelector(".random.choice")
	, random_res = document.querySelector(".subbarlink[href='/r/random/']")
	, myrandom_native = document.querySelector(".gold.choice")
	, myrandom_res = document.querySelector(".subbarlink[href='/r/myrandom/']")
	, random_subreddit = function() {
		return "/r/" + cached_subreddits[Math.floor(Math.random() * cached_subreddits.length)];
	}
	, insert_myrandom = function() {
		var
		  myrandom = myrandom_native || myrandom_res
		, random = random_native || random_res
		;
		if (cached_subreddits.length) {
			if (!myrandom) {
				var
				// support inserting myrandom into the native subreddit bar or RES's subreddit manager bar
				  parent = random_native
				  	? random.parentNode
				  	: random.parentNode
				, random_next_sibling = random.nextElementSibling
				, myrandom_container = random_native
					? parent.parentNode.insertBefore(document.createElement("li"), parent.nextElementSibling)
					: parent // RES's subreddit manager bar doesn't use a <ul> like reddit's subreddit bar
				, separator = myrandom_container.insertBefore(document.createElement("span"), random_next_sibling)
				;
				separator.classList.add("separator");
				separator.appendChild(document.createTextNode("-"));
				myrandom = myrandom_container.insertBefore(document.createElement("a"), random_next_sibling);
				myrandom.classList.add("gold", random_native ? "choice" : "subbarlink");
				myrandom.appendChild(document.createTextNode("myrandom"));
				myrandom.href = "/myrandom/";
			}
			myrandom.addEventListener("click", function(event) {
				event.preventDefault();
				location.href = random_subreddit();
			});
		}
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
			localStorage.mySubreddits = JSON.stringify(cached_subreddits = req.response
				.evaluate(
					  "//ul/a[text()='multireddit of your subscriptions']", req.response, null
					, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null
				)
				.iterateNext()
				.href
				.split("/r/")[1]
				.split("+")
			);
			localStorage.mySubredditsLastAccess = Date.now();
			insert_myrandom();
		  }
		;

		req.responseType = "document";
		req.addEventListener("load", onload);
		req.open("GET", "/subreddits/");
		req.send();
	}
});