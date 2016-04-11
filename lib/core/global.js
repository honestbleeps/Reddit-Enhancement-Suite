import jQuery from 'jquery';

export const $ = jQuery(window);
window.$ = window.jQuery = $;

// *sigh* this requires that jQuery be a global
// but hey, at least it's _on_ npm
import 'jquery-sortable'; // eslint-disable-line

$.fn.safeHtml = function(string) {
	if (!string) return '';
	else return $(this).html(RESUtils.sanitizeHTML(string));
};
