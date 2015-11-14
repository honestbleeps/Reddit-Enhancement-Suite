// Called from Opera's loader.js after loading jQuery plugins
// which might call window.jQuery, this.jQuery, or
// Intended to restore reddit's jQuery to window.jQuery
// and ensure RES's "global" $ / jQuery are accessible
// to RES core and module code

resJQuery = window.$.noConflict(true);
jQuery = $ = resJQuery; // var'd in opera-save-jquery,
window.jQuery = window.$ = redditJQuery;

if (true) { // Debugging?
	console.log('Reddit jQuery version was:\n' + redditJQuery.fn.jquery);
	console.log('Window jQuery version is :\n' + window.$.fn.jquery);

	console.log('RES    jQuery version was:\n' + resJQuery   .fn.jquery);
	console.log('Local  jQuery version is :\n' +        $.fn.jquery);
}
