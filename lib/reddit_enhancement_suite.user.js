/* exported RESMetadata */

var RESMetadata = {
	defaultModuleID: 'about',  // Show this module by default when opening settings
	categories: [ 'About RES', 'My account', 'Users', 'Comments', 'Submissions', 'Subreddits', 'Appearance', '*', 'Core' ],
	announcementsSubreddit: 'RESAnnouncements',
	setup: function() {
		var deferred = $.Deferred();
		RESEnvironment.loadResourceAsText('package.json', function(metadata) {
			$.extend(true, RESMetadata, JSON.parse(metadata));
			RESMetadata.updatedURL = 'http://redditenhancementsuite.com/whatsnew.html?v=' + RESMetadata.version;
			deferred.resolve(RESMetadata);
		});
		return deferred.promise();
	}
};
/*
	Reddit Enhancement Suite - a suite of tools to enhance Reddit
	Copyright (C) 2010-2015 - honestbleeps (steve@honestbleeps.com)

	RES is released under the GPL. However, I do ask a favor (obviously I don't/can't require it, I ask out of courtesy):

	Because RES auto updates and is hosted from a central server, I humbly request that if you intend to distribute your own
	modified Reddit Enhancement Suite, you name it something else and make it very clear to your users that it's your own
	branch and isn't related to mine.

	RES is updated very frequently, and I get lots of tech support questions/requests from people on outdated versions. If
	you're distributing RES via your own means, those recipients won't always be on the latest and greatest, which makes
	it harder for me to debug things and understand (at least with browsers that auto-update) whether or not people are on
	a current version of RES.

	I can't legally hold you to any of this - I'm just asking out of courtesy.

	Thanks, I appreciate your consideration.  Without further ado, the all-important GPL Statement:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/************************************************************************************************************

For a guide on creating your own module, check out lib/modules/example.js

 ************************************************************************************************************/

if (typeof exports === 'object') {
	exports.RESMetadata = RESMetadata;
}
