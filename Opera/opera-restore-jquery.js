window.$.noConflict();
$ = window.jQuery;
jQuery = window.jQuery;
// now, return the window.$ / window.jQuery back to its original state.
window.$ = redditJq;
window.jQuery = redditJq;
