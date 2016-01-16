/*
 * HTMLPasteurizer
 * Copyright 2014 Jordan Milne
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(window, $) {
    'use strict';

    var Pasteurizer = {};
    window.Pasteurizer = Pasteurizer;

    // Some older browsers allow whitespace in protocols, but ignore
    // it during processing. Strip any weirdness out.
    var SCHEME_FILTER = /(:(?!$)|[^:a-z0-9\.\-\+])/ig;

    Pasteurizer.DEFAULT_CONFIG = {
        elemWhitelist: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'code',
            'br', 'hr', 'p', 'a', 'img', 'pre', 'blockquote', 'table',
            'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'strong', 'em',
            'i', 'b', 'u', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'font', 'center', 'small', 's', 'q', 'sub', 'sup', 'del'
        ],
        // global attribute whitelist
        attrWhitelist: [
            'title', 'colspan', 'rowspan', 'cellspacing', 'cellpadding',
            'scope', 'face', 'color', 'size', 'bgcolor', 'align'
        ],
        // tag-specific attribute whitelists
        tagAttrWhitelist: {
            'img': ['src', 'alt'],
            'a': ['href']
        },
        // Which schemes may be linked to
        schemeWhitelist: [
            'http:', 'https:', 'ftp:', 'mailto:',
            'git:', 'steam:', 'irc:', 'news:', 'mumble:',
            'ssh:', 'ircs:', 'ts3server:', ':'
        ],
        // Whether or not to hoist the contents of removed nodes up the tree.
        hoistOrphanedContents: true,

        // Tags that should *not* have their contents hoisted
        hoistBlacklist: ['script', 'style']
    };

    Pasteurizer.scrubNode = function(node, config) {
        var jNode = $(node);
        var nodeName = node.nodeName.toLowerCase();
        var nodeType = node.nodeType;

        var validNode = false;

        if(nodeType === 1) {
            validNode = config.elemWhitelist.indexOf(nodeName) !== -1;
        } else if(nodeType < 6 || nodeType === 9 || nodeType === 11) {
            validNode = true;
        }

        if(validNode && node.nodeType === 1) {
            // Kill anchor tags with invalid hrefs.
            if(nodeName === 'a') {
                if(node.protocol !== undefined) {
                    var scrubbedProto = node.protocol.replace(SCHEME_FILTER, '');

                    // Only allow whitelisted schemes unless the document was served via
                    // the same scheme.
                    if(config.schemeWhitelist.indexOf(scrubbedProto) === -1 &&
                       scrubbedProto !== document.location.protocol) {
                        validNode = false;
                    }
                } else {
                    // TODO: Handle UAs that don't support a.protocol?
                    // we may need to bundle URL.js.
                    throw 'Pasteurizer: a.protocol unsupported.';
                }
            }
        }

        if(validNode && node.nodeType === 1) {
            // Let's not invalidate any iterators, collect all attribute names.
            var attrs = $.map(node.attributes, function(attr){
                return attr.nodeName;
            });

            // Remove unwanted attributes
            attrs.forEach(function(attrName) {

                // Is this attr allowed on any node?
                if(config.attrWhitelist.indexOf(attrName) !== -1) {
                    return;
                }

                // is this attr allowed on *this* node?
                if(nodeName in config.tagAttrWhitelist &&
                   config.tagAttrWhitelist[nodeName].indexOf(attrName) !== -1) {
                    return;
                }

                // jQuery.removeAttr chokes on attribute names containing quotes
                node.removeAttribute(attrName);
            });
        }

        var canHoist = (config.hoistOrphanedContents &&
            config.hoistBlacklist.indexOf(nodeName) === -1);

        // Cut out early if we don't need the contents
        if(!validNode && !canHoist) {
            jNode.remove();
            return;
        }

        jNode.contents().each(function(i, child) {
            Pasteurizer.scrubNode(child, config);
        });

        if(!validNode) {
            // remove the node and put its remaining contents in its place.
            jNode.contents().detach().insertAfter(jNode);
            jNode.remove();
        }
    };

    Pasteurizer.safeParseHTML = function(html, config) {

        if(!config || $.isEmptyObject(config)) {
            config = Pasteurizer.DEFAULT_CONFIG;
        }


        // DOMParser behaves similarly to jQuery.parseHTML, but it won't make any
        // requests at parse time.
        var parser = new DOMParser();

        //TODO: handle <parsererror>
        var parsed = parser.parseFromString(html, 'text/html');

        // DOMParser wraps HTML fragments in body tags
        var body = $(parsed).find('body').first();

        body.contents().each(function(i, node) {
            Pasteurizer.scrubNode(node, config);
        });
        return body.contents();
    };

}(window, jQuery));



/*
 * DOMParser HTML extension
 * 2012-09-04
 *
 * By Eli Grey, http://eligrey.com
 * Public domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*! @source https://gist.github.com/1129031 */
/*global document, DOMParser*/

(function(DOMParser) {
	'use strict';

	var DOMParser_proto = DOMParser.prototype;
	var real_parseFromString = DOMParser_proto.parseFromString;

	// Firefox/Opera/IE throw errors on unsupported types
	try {
		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString('', 'text/html')) {
			// text/html parsing is natively supported
			return;
		}
	} catch (ex) {}

	DOMParser_proto.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var doc = document.implementation.createHTMLDocument('');
            if (markup.toLowerCase().indexOf('<!doctype') > -1) {
                doc.documentElement.innerHTML = markup;
            }
            else {
                doc.body.innerHTML = markup;
            }
			return doc;
		} else {
			return real_parseFromString.apply(this, arguments);
		}
	};
}(DOMParser));
