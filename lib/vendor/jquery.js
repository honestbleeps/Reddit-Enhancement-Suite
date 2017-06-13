/* @flow */

import jQuery from 'jquery'; // eslint-disable-line no-restricted-imports

export const $ = jQuery;

// set up globals expected by legacy jQuery plugins
window.$ = window.jQuery = $;
