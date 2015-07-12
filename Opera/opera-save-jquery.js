// Called from Opera loader.js before loading RES jQuery
// Intended to preserve reddit's jQuery and temporarily
// make way for RES's jQuery as window.jQuery

var redditJQuery = window.$.noConflict(true);
var resJQuery;
var jQuery, $;
