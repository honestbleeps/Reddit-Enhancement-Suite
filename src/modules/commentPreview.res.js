modules.commentPreview = {
    moduleID: 'commentPreview',
    moduleName: 'Live Comment Preview',
    category: 'Comments',
    options: {
        // any configurable options you have go here...
        commentingAs: {
            type: 'boolean',
            value: true,
            description: 'Shows your currently logged in username to avoid posting from the wrong account.'
        },
        subredditAutocomplete: {
            type: 'boolean',
            value: true,
            description: 'Show subreddit autocomplete tool when typing in posts, comments and replies'
        }
    },
    description: 'Provides a live preview of comments, as well as shortcuts for easier markdown.',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: [
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i,
        /https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
        /https?:\/\/([a-z]+).reddit.com\/r\/[-\w\.]*\/submit\/?/i,
        /https?:\/\/([a-z]+).reddit.com\/submit\/?/i
    ],
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {

            RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
            RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
            /*
            RESUtils.addCSS('fieldset.liveComment, fieldset.liveComment legend { border: 1px solid black; border-radius: 1em; -moz-border-radius: 1em; -webkit-border-radius: 1em; }'+
                'fieldset.liveComment { padding: 1ex; margin: 1em 0; }'+
                'fieldset.liveComment legend { padding: 0 1ex; background-color: #E9E9E9; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview STRONG { font-weight: bold; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview EM { font-style: italic; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview PRE { color: auto; margin-top: 10px; margin-bottom: 10px; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview P { margin-bottom: 4px; }');
            */
            RESUtils.addCSS('.selectedItem { color: #ffffff; background-color: #5f99cf; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
            RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');

            
            if (this.options.subredditAutocomplete.value) this.subredditAutocomplete();
            
            /*
            2009-08-30
                - Fixed top comment box.
                - Added markdown toolbar.
                
            2009-02-05
                - Fixed the preview clearing after clicking "comment". That was broken, too.
                
            2009-02-04
                - Fix because reddit broke it.
            */

            //
            // showdown.js -- A javascript port of Markdown.
            //
            // Copyright (c) 2007 John Fraser.
            //
            // Original Markdown Copyright (c) 2004-2005 John Gruber
            //   <http://daringfireball.net/projects/markdown/>
            //
            // Redistributable under a BSD-style open source license.
            // See license.txt for more information.
            //
            // The full source distribution is at:
            //
            //                A A L
            //                T C A
            //                T K B
            //
            //   <http://www.attacklab.net/>
            //

            //
            // Wherever possible, Showdown is a straight, line-by-line port
            // of the Perl version of Markdown.
            //
            // This is not a normal parser design; it's basically just a
            // series of string substitutions.  It's hard to read and
            // maintain this way,  but keeping Showdown close to the original
            // design makes it easier to port new features.
            //
            // More importantly, Showdown behaves like markdown.pl in most
            // edge cases.  So web applications can do client-side preview
            // in Javascript, and then build identical HTML on the server.
            //
            // This port needs the new RegExp functionality of ECMA 262,
            // 3rd Edition (i.e. Javascript 1.5).  Most modern web browsers
            // should do fine.  Even with the new regular expression features,
            // We do a lot of work to emulate Perl's regex functionality.
            // The tricky changes in this file mostly have the "attacklab:"
            // label.  Major or self-explanatory changes don't.
            //
            // Smart diff tools like Araxis Merge will be able to match up
            // this file with markdown.pl in a useful way.  A little tweaking
            // helps: in a copy of markdown.pl, replace "#" with "//" and
            // replace "$text" with "text".  Be sure to ignore whitespace
            // and line endings.
            //


            //
            // Showdown usage:
            //
            //   var text = "Markdown *rocks*.";
            //
            //   var converter = new Showdown.converter();
            //   var html = converter.makeHtml(text);
            //
            //   RESAlert(html);
            //
            // Note: move the sample code to the bottom of this
            // file before uncommenting it.
            //


            //
            // Showdown namespace
            //
            var Showdown = {};

            //
            // converter
            //
            // Wraps all "globals" so that the only thing
            // exposed is makeHtml().
            //
            Showdown.converter = function() {

            //
            // Globals:
            //

            // Global hashes, used by various utility routines
            var g_urls;
            var g_titles;
            var g_html_blocks;

            // Used to track when we're inside an ordered or unordered list
            // (see _ProcessListItems() for details):
            var g_list_level = 0;


            this.makeHtml = function(text) {
            //
            // Main function. The order in which other subs are called here is
            // essential. Link and image substitutions need to happen before
            // _EscapeSpecialCharsWithinTagAttributes(), so that any *'s or _'s in the <a>
            // and <img> tags get encoded.
            //

                // Clear the global hashes. If we don't clear these, you get conflicts
                // from other articles when generating a page which contains more than
                // one article (e.g. an index page that shows the N most recent
                // articles):
                g_urls = [];
                g_titles = [];
                g_html_blocks = [];

                // Replace < with &lt; and > with &gt;
                // COMMENTING TO TEST PATCH FROM: 
                // https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
                // text = text.replace(/</g,"&lt;");
                text = text.replace(/>/g,"&gt;");

                // attacklab: Replace ~ with ~T
                // This lets us use tilde as an escape char to avoid md5 hashes
                // The choice of character is arbitray; anything that isn't
                // magic in Markdown will work.
                // text = text.replace(/~/g,"~T");
                text = text.replace(/(^|[^~])~(?!~)/g,"$1~T");

                // attacklab: Replace $ with ~D
                // RegExp interprets $ as a special character
                // when it's in a replacement string
                text = text.replace(/\$/g,"~D");

                // Standardize line endings
                text = text.replace(/\r\n/g,"\n"); // DOS to Unix
                text = text.replace(/\r/g,"\n"); // Mac to Unix

                // Make sure text begins and ends with a couple of newlines:
                text = "\n\n" + text + "\n\n";

                // Convert all tabs to spaces.
                text = _Detab(text);

                // Strip any lines consisting only of spaces and tabs.
                // This makes subsequent regexen easier to write, because we can
                // match consecutive blank lines with /\n+/ instead of something
                // contorted like /[ \t]*\n+/ .
                text = text.replace(/^[ \t]+$/mg,"");

                // Turn block-level HTML blocks into hash entries
                text = _HashHTMLBlocks(text);

                // Strip link definitions, store in hashes.
                text = _StripLinkDefinitions(text);

                // check for tables...
                text = _DoTables(text);

                text = _RunBlockGamut(text);

                text = _UnescapeSpecialChars(text);

                // attacklab: Restore dollar signs
                text = text.replace(/~D/g,"$$");

                // attacklab: Restore tildes
                text = text.replace(/~T/g,"~");

                return text;
            }


            var _StripLinkDefinitions = function(text) {
            //
            // Strips link definitions from text, stores the URLs and titles in
            // hash references.
            //

                // Link defs are in the form: ^[id]: url "optional title"

                /*
                    var text = text.replace(/
                            ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
                              [ \t]*
                              \n?                // maybe *one* newline
                              [ \t]*
                            <?(\S+?)>?            // url = $2
                              [ \t]*
                              \n?                // maybe one newline
                              [ \t]*
                            (?:
                              (\n*)                // any lines skipped = $3 attacklab: lookbehind removed
                              ["(]
                              (.+?)                // title = $4
                              [")]
                              [ \t]*
                            )?                    // title is optional
                            (?:\n+|$)
                          /gm,
                          function(){...});
                */
                var text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,
                    function (wholeMatch,m1,m2,m3,m4) {
                        m1 = m1.toLowerCase();
                        g_urls[m1] = _EncodeAmpsAndAngles(m2);  // Link IDs are case-insensitive
                        if (m3) {
                            // Oops, found blank lines, so it's not a title.
                            // Put back the parenthetical statement we stole.
                            return m3+m4;
                        } else if (m4) {
                            g_titles[m1] = m4.replace(/"/g,"&quot;");
                        }
                        
                        // Completely remove the definition from the text
                        return "";
                    }
                );

                return text;
            }


            var _HashHTMLBlocks = function(text) {
                // attacklab: Double up blank lines to reduce lookaround
                text = text.replace(/\n/g,"\n\n");

                // Hashify HTML blocks:
                // We only want to do this for block-level HTML tags, such as headers,
                // lists, and tables. That's because we still want to wrap <p>s around
                // "paragraphs" that are wrapped in non-block-level tags, such as anchors,
                // phrase emphasis, and spans. The list of tags we're looking for is
                // hard-coded:
                var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"
                var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"

                // First, look for nested blocks, e.g.:
                //   <div>
                //     <div>
                //     tags for inner block must be indented.
                //     </div>
                //   </div>
                //
                // The outermost tags must start at the left margin for this to match, and
                // the inner nested divs must be indented.
                // We need to do this before the next, more liberal match, because the next
                // match will start at the first `<div>` and stop at the first `</div>`.

                // attacklab: This regex can be expensive when it fails.
                /*
                    var text = text.replace(/
                    (                        // save in $1
                        ^                    // start of line  (with /m)
                        <($block_tags_a)    // start tag = $2
                        \b                    // word break
                                            // attacklab: hack around khtml/pcre bug...
                        [^\r]*?\n            // any number of lines, minimally matching
                        </\2>                // the matching end tag
                        [ \t]*                // trailing spaces/tabs
                        (?=\n+)                // followed by a newline
                    )                        // attacklab: there are sentinel newlines at end of document
                    /gm,function(){...}};
                */
                text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement);

                //
                // Now match more liberally, simply from `\n<tag>` to `</tag>\n`
                //

                /*
                    var text = text.replace(/
                    (                        // save in $1
                        ^                    // start of line  (with /m)
                        <($block_tags_b)    // start tag = $2
                        \b                    // word break
                                            // attacklab: hack around khtml/pcre bug...
                        [^\r]*?                // any number of lines, minimally matching
                        .*</\2>                // the matching end tag
                        [ \t]*                // trailing spaces/tabs
                        (?=\n+)                // followed by a newline
                    )                        // attacklab: there are sentinel newlines at end of document
                    /gm,function(){...}};
                */
                text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement);

                // Special case just for <hr />. It was easier to make a special case than
                // to make the other regex more complicated.  

                /*
                    text = text.replace(/
                    (                        // save in $1
                        \n\n                // Starting after a blank line
                        [ ]{0,3}
                        (<(hr)                // start tag = $2
                        \b                    // word break
                        ([^<>])*?            // 
                        \/?>)                // the matching end tag
                        [ \t]*
                        (?=\n{2,})            // followed by a blank line
                    )
                    /g,hashElement);
                */
                text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement);

                // Special case for standalone HTML comments:

                /*
                    text = text.replace(/
                    (                        // save in $1
                        \n\n                // Starting after a blank line
                        [ ]{0,3}            // attacklab: g_tab_width - 1
                        <!
                        (--[^\r]*?--\s*)+
                        >
                        [ \t]*
                        (?=\n{2,})            // followed by a blank line
                    )
                    /g,hashElement);
                */
                text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement);

                // PHP and ASP-style processor instructions (<?...?> and <%...%>)

                /*
                    text = text.replace(/
                    (?:
                        \n\n                // Starting after a blank line
                    )
                    (                        // save in $1
                        [ ]{0,3}            // attacklab: g_tab_width - 1
                        (?:
                            <([?%])            // $2
                            [^\r]*?
                            \2>
                        )
                        [ \t]*
                        (?=\n{2,})            // followed by a blank line
                    )
                    /g,hashElement);
                */
                text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement);

                // attacklab: Undo double lines (see comment at top of this function)
                text = text.replace(/\n\n/g,"\n");
                return text;
            }

            var hashElement = function(wholeMatch,m1) {
                var blockText = m1;

                // Undo double lines
                blockText = blockText.replace(/\n\n/g,"\n");
                blockText = blockText.replace(/^\n/,"");
                
                // strip trailing blank lines
                blockText = blockText.replace(/\n+$/g,"");
                
                // Replace the element text with a marker ("~KxK" where x is its key)
                blockText = "\n\n~K" + (g_html_blocks.push(blockText)-1) + "K\n\n";
                
                return blockText;
            };

            var _RunBlockGamut = function(text) {
            //
            // These are all the transformations that form block-level
            // tags like paragraphs, headers, and list items.
            //
                text = _DoHeaders(text);

                // Do Horizontal Rules:
                var key = hashBlock("<hr />");
                text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
                text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
                text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);

                text = _DoLists(text);
                text = _DoCodeBlocks(text);
                text = _DoBlockQuotes(text);

                // We already ran _HashHTMLBlocks() before, in Markdown(), but that
                // was to escape raw HTML in the original Markdown source. This time,
                // we're escaping the markup we've just created, so that we don't wrap
                // <p> tags around block-level tags.
                text = _HashHTMLBlocks(text);
                text = _FormParagraphs(text);

                return text;
            }


            var _RunSpanGamut = function(text) {
            //
            // These are all the transformations that occur *within* block-level
            // tags like paragraphs, headers, and list items.
            //

                text = _DoCodeSpans(text);
                text = _EscapeSpecialCharsWithinTagAttributes(text);
                text = _EncodeBackslashEscapes(text);

                // Process anchor and image tags. Images must come first,
                // because ![foo][f] looks like an anchor.
                text = _DoImages(text);
                text = _DoAnchors(text);

                // Make links out of things like `<http://example.com/>`
                // Must come after _DoAnchors(), because you can use < and >
                // delimiters in inline links like [this](<url>).
                text = _DoAutoLinks(text);
                text = _EncodeAmpsAndAngles(text);
                text = _DoItalicsAndBoldAndStrike(text);
                text = _DoSuperscript(text);

                // Do hard breaks:
                text = text.replace(/  +\n/g," <br />\n");

                return text;
            }

            var _EscapeSpecialCharsWithinTagAttributes = function(text) {
            //
            // Within tags -- meaning between < and > -- encode [\ ` * _] so they
            // don't conflict with their use in Markdown for code, italics and strong.
            //

                // Build a regex to find HTML tags and comments.  See Friedl's 
                // "Mastering Regular Expressions", 2nd Ed., pp. 200-201.
                var regex = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;

                text = text.replace(regex, function(wholeMatch) {
                    var tag = wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");
                    tag = escapeCharacters(tag,"\\`*_");
                    return tag;
                });

                return text;
            }

            var _DoAnchors = function(text) {
            //
            // Turn Markdown link shortcuts into XHTML <a> tags.
            //
                //
                // First, handle reference-style links: [link text] [id]
                //

                /*
                    text = text.replace(/
                    (                            // wrap whole match in $1
                        \[
                        (
                            (?:
                                \[[^\]]*\]        // allow brackets nested one level
                                |
                                [^\[]            // or anything else
                            )*
                        )
                        \]

                        [ ]?                    // one optional space
                        (?:\n[ ]*)?                // one optional newline followed by spaces

                        \[
                        (.*?)                    // id = $3
                        \]
                    )()()()()                    // pad remaining backreferences
                    /g,_DoAnchors_callback);
                */
                text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag);

                //
                // Next, inline-style links: [link text](url "optional title")
                //

                /*
                    text = text.replace(/
                        (                        // wrap whole match in $1
                            \[
                            (
                                (?:
                                    \[[^\]]*\]    // allow brackets nested one level
                                |
                                [^\[\]]            // or anything else
                            )
                        )
                        \]
                        \(                        // literal paren
                        [ \t]*
                        ()                        // no id, so leave $3 empty
                        <?(.*?)>?                // href = $4
                        [ \t]*
                        (                        // $5
                            (['"])                // quote char = $6
                            (.*?)                // Title = $7
                            \6                    // matching quote
                            [ \t]*                // ignore any spaces/tabs between closing quote and )
                        )?                        // title is optional
                        \)
                    )
                    /g,writeAnchorTag);
                */
                text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag);
                // the code below was to fix links that don't start with / or http ... but it doesn't work right and I'm stuck for now. undoing this change.
                // text = text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*(\/|https?:\/\/)<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/ig,writeAnchorTag);

                //
                // Last, handle reference-style shortcuts: [link text]
                // These must come last in case you've also got [link test][1]
                // or [link test](/foo)
                //

                /*
                    text = text.replace(/
                    (                             // wrap whole match in $1
                        \[
                        ([^\[\]]+)                // link text = $2; can't contain '[' or ']'
                        \]
                    )()()()()()                    // pad rest of backreferences
                    /g, writeAnchorTag);
                */
                text = text.replace(/(\[([^\[\]]+)\])()()()()()/g, writeAnchorTag);

                return text;
            }

            var writeAnchorTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
                if (m7 === undefined) m7 = "";
                var whole_match = m1;
                var link_text   = m2;
                var link_id     = m3.toLowerCase();
                var url        = m4;
                var title    = m7;
                
                if (url === "") {
                    if (link_id === "") {
                        // lower-case and turn embedded newlines into spaces
                        link_id = link_text.toLowerCase().replace(/ ?\n/g," ");
                    }
                    url = "#"+link_id;
                    
                    if (g_urls[link_id] != undefined) {
                        url = g_urls[link_id];
                        if (g_titles[link_id] != undefined) {
                            title = g_titles[link_id];
                        }
                    }
                    else {
                        if (whole_match.search(/\(\s*\)$/m)>-1) {
                            // Special case for explicit empty url
                            url = "";
                        } else {
                            return whole_match;
                        }
                    }
                }    
                url = escapeCharacters(url,"*_");
                var result = "<a href=\"" + url + "\"";
                
                if (title != "") {
                    title = title.replace(/"/g,"&quot;");
                    title = escapeCharacters(title,"*_");
                    result +=  " title=\"" + title + "\"";
                }
                
                result += ">" + link_text + "</a>";
                
                return result;
            }


            var _DoImages = function(text) {
            //
            // Turn Markdown image shortcuts into <img> tags.
            //

                //
                // First, handle reference-style labeled images: ![alt text][id]
                //

                /*
                    text = text.replace(/
                    (                        // wrap whole match in $1
                        !\[
                        (.*?)                // alt text = $2
                        \]

                        [ ]?                // one optional space
                        (?:\n[ ]*)?            // one optional newline followed by spaces

                        \[
                        (.*?)                // id = $3
                        \]
                    )()()()()                // pad rest of backreferences
                    /g,writeImageTag);
                */
                text = text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag);

                //
                // Next, handle inline images:  ![alt text](url "optional title")
                // Don't forget: encode * and _

                /*
                    text = text.replace(/
                    (                        // wrap whole match in $1
                        !\[
                        (.*?)                // alt text = $2
                        \]
                        \s?                    // One optional whitespace character
                        \(                    // literal paren
                        [ \t]*
                        ()                    // no id, so leave $3 empty
                        <?(\S+?)>?            // src url = $4
                        [ \t]*
                        (                    // $5
                            (['"])            // quote char = $6
                            (.*?)            // title = $7
                            \6                // matching quote
                            [ \t]*
                        )?                    // title is optional
                    \)
                    )
                    /g,writeImageTag);
                */
                text = text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag);

                return text;
            }

            var writeImageTag = function(wholeMatch,m1,m2,m3,m4,m5,m6,m7) {
                var whole_match = m1;
                var alt_text   = m2;
                var link_id     = m3.toLowerCase();
                var url        = m4;
                var title    = m7;

                if (!title) title = "";
                
                if (url === "") {
                    if (link_id === "") {
                        // lower-case and turn embedded newlines into spaces
                        link_id = alt_text.toLowerCase().replace(/ ?\n/g," ");
                    }
                    url = "#"+link_id;
                    
                    if (g_urls[link_id] != undefined) {
                        url = g_urls[link_id];
                        if (g_titles[link_id] != undefined) {
                            title = g_titles[link_id];
                        }
                    }
                    else {
                        return whole_match;
                    }
                }    
                
                alt_text = alt_text.replace(/"/g,"&quot;");
                url = escapeCharacters(url,"*_");
                var result = "<img src=\"" + url + "\" alt=\"" + alt_text + "\"";

                // attacklab: Markdown.pl adds empty title attributes to images.
                // Replicate this bug.

                //if (title != "") {
                    title = title.replace(/"/g,"&quot;");
                    title = escapeCharacters(title,"*_");
                    result +=  " title=\"" + title + "\"";
                //}
                
                result += " />";
                
                return result;
            }


            var _DoHeaders = function(text) {

                // Setext-style headers:
                //    Header 1
                //    ========
                //  
                //    Header 2
                //    --------
                //
                text = text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,
                    function(wholeMatch,m1){return hashBlock("<h1>" + _RunSpanGamut(m1) + "</h1>");});

                text = text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,
                    function(matchFound,m1){return hashBlock("<h2>" + _RunSpanGamut(m1) + "</h2>");});

                // atx-style headers:
                //  # Header 1
                //  ## Header 2
                //  ## Header 2 with closing hashes ##
                //  ...
                //  ###### Header 6
                //

                /*
                    text = text.replace(/
                        ^(\#{1,6})                // $1 = string of #'s
                        [ \t]*
                        (.+?)                    // $2 = Header text
                        [ \t]*
                        \#*                        // optional closing #'s (not counted)
                        \n+
                    /gm, function() {...});
                */

                text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,
                    function(wholeMatch,m1,m2) {
                        var h_level = m1.length;
                        return hashBlock("<h" + h_level + ">" + _RunSpanGamut(m2) + "</h" + h_level + ">");
                    });

                return text;
            }

            // This declaration keeps Dojo compressor from outputting garbage:
            var _ProcessListItems;

            var _DoLists = function(text) {
            //
            // Form HTML ordered (numbered) and unordered (bulleted) lists.
            //

                // attacklab: add sentinel to hack around khtml/safari bug:
                // http://bugs.webkit.org/show_bug.cgi?id=11231
                text += "~0";

                // Re-usable pattern to match any entirel ul or ol list:

                /*
                    var whole_list = /
                    (                                    // $1 = whole list
                        (                                // $2
                            [ ]{0,3}                    // attacklab: g_tab_width - 1
                            ([*+-]|\d+[.])                // $3 = first list item marker
                            [ \t]+
                        )
                        [^\r]+?
                        (                                // $4
                            ~0                            // sentinel for workaround; should be $
                        |
                            \n{2,}
                            (?=\S)
                            (?!                            // Negative lookahead for another list item marker
                                [ \t]*
                                (?:[*+-]|\d+[.])[ \t]+
                            )
                        )
                    )/g
                */
                var whole_list = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

                if (g_list_level) {
                    text = text.replace(whole_list,function(wholeMatch,m1,m2) {
                        var list = m1;
                        var list_type = (m2.search(/[*+-]/g)>-1) ? "ul" : "ol";

                        // Turn double returns into triple returns, so that we can make a
                        // paragraph for the last item in a list, if necessary:
                        list = list.replace(/\n{2,}/g,"\n\n\n");;
                        var result = _ProcessListItems(list);
                
                        // Trim any trailing whitespace, to put the closing `</$list_type>`
                        // up on the preceding line, to get it past the current stupid
                        // HTML block parser. This is a hack to work around the terrible
                        // hack that is the HTML block parser.
                        result = result.replace(/\s+$/,"");
                        result = "<"+list_type+">" + result + "</"+list_type+">\n";
                        return result;
                    });
                } else {
                    whole_list = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
                    text = text.replace(whole_list,function(wholeMatch,m1,m2,m3) {
                        var runup = m1;
                        var list = m2;

                        var list_type = (m3.search(/[*+-]/g)>-1) ? "ul" : "ol";
                        // Turn double returns into triple returns, so that we can make a
                        // paragraph for the last item in a list, if necessary:
                        var list = list.replace(/\n{2,}/g,"\n\n\n");;
                        var result = _ProcessListItems(list);
                        result = runup + "<"+list_type+">\n" + result + "</"+list_type+">\n";    
                        return result;
                    });
                }

                // attacklab: strip sentinel
                text = text.replace(/~0/,"");

                return text;
            }

            _ProcessListItems = function(list_str) {
            //
            //  Process the contents of a single ordered or unordered list, splitting it
            //  into individual list items.
            //
                // The $g_list_level global keeps track of when we're inside a list.
                // Each time we enter a list, we increment it; when we leave a list,
                // we decrement. If it's zero, we're not in a list anymore.
                //
                // We do this because when we're not inside a list, we want to treat
                // something like this:
                //
                //    I recommend upgrading to version
                //    8. Oops, now this line is treated
                //    as a sub-list.
                //
                // As a single paragraph, despite the fact that the second line starts
                // with a digit-period-space sequence.
                //
                // Whereas when we're inside a list (or sub-list), that line will be
                // treated as the start of a sub-list. What a kludge, huh? This is
                // an aspect of Markdown's syntax that's hard to parse perfectly
                // without resorting to mind-reading. Perhaps the solution is to
                // change the syntax rules such that sub-lists must start with a
                // starting cardinal number; e.g. "1." or "a.".

                g_list_level++;

                // trim trailing blank lines:
                list_str = list_str.replace(/\n{2,}$/,"\n");

                // attacklab: add sentinel to emulate \z
                list_str += "~0";

                /*
                    list_str = list_str.replace(/
                        (\n)?                            // leading line = $1
                        (^[ \t]*)                        // leading whitespace = $2
                        ([*+-]|\d+[.]) [ \t]+            // list marker = $3
                        ([^\r]+?                        // list item text   = $4
                        (\n{1,2}))
                        (?= \n* (~0 | \2 ([*+-]|\d+[.]) [ \t]+))
                    /gm, function(){...});
                */
                list_str = list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,
                    function(wholeMatch,m1,m2,m3,m4){
                        var item = m4;
                        var leading_line = m1;
                        var leading_space = m2;

                        if (leading_line || (item.search(/\n{2,}/)>-1)) {
                            item = _RunBlockGamut(_Outdent(item));
                        }
                        else {
                            // Recursion for sub-lists:
                            item = _DoLists(_Outdent(item));
                            item = item.replace(/\n$/,""); // chomp(item)
                            item = _RunSpanGamut(item);
                        }

                        return  "<li>" + item + "</li>\n";
                    }
                );

                // attacklab: strip sentinel
                list_str = list_str.replace(/~0/g,"");

                g_list_level--;
                return list_str;
            }


            var _DoCodeBlocks = function(text) {
            //
            //  Process Markdown `<pre><code>` blocks.
            //  

                /*
                    text = text.replace(text,
                        /(?:\n\n|^)
                        (                                // $1 = the code block -- one or more lines, starting with a space/tab
                            (?:
                                (?:[ ]{4}|\t)            // Lines must start with a tab or a tab-width of spaces - attacklab: g_tab_width
                                .*\n+
                            )+
                        )
                        (\n*[ ]{0,3}[^ \t\n]|(?=~0))    // attacklab: g_tab_width
                    /g,function(){...});
                */

                // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
                text += "~0";
                
                // text = text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
                text = text.replace(/(?:\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,
                    function(wholeMatch,m1,m2) {
                        var codeblock = m1;
                        var nextChar = m2;
                    
                        codeblock = _EncodeCode( _Outdent(codeblock));
                        codeblock = _Detab(codeblock);
                        codeblock = codeblock.replace(/^\n+/g,""); // trim leading newlines
                        codeblock = codeblock.replace(/\n+$/g,""); // trim trailing whitespace

                        codeblock = "<pre><code>" + codeblock + "\n</code></pre>";

                        return hashBlock(codeblock) + nextChar;
                    }
                );

                // attacklab: strip sentinel
                text = text.replace(/~0/,"");

                return text;
            }

            var hashBlock = function(text) {
                text = text.replace(/(^\n+|\n+$)/g,"");
                return "\n\n~K" + (g_html_blocks.push(text)-1) + "K\n\n";
            }


            var _DoCodeSpans = function(text) {
            //
            //   *  Backtick quotes are used for <code></code> spans.
            // 
            //   *  You can use multiple backticks as the delimiters if you want to
            //     include literal backticks in the code span. So, this input:
            //     
            //         Just type ``foo `bar` baz`` at the prompt.
            //     
            //       Will translate to:
            //     
            //         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
            //     
            //    There's no arbitrary limit to the number of backticks you
            //    can use as delimters. If you need three consecutive backticks
            //    in your code, use four for delimiters, etc.
            //
            //  *  You can use spaces to get literal backticks at the edges:
            //     
            //         ... type `` `bar` `` ...
            //     
            //       Turns to:
            //     
            //         ... type <code>`bar`</code> ...
            //

                /*
                    text = text.replace(/
                        (^|[^\\])                    // Character before opening ` can't be a backslash
                        (`+)                        // $2 = Opening run of `
                        (                            // $3 = The code block
                            [^\r]*?
                            [^`]                    // attacklab: work around lack of lookbehind
                        )
                        \2                            // Matching closer
                        (?!`)
                    /gm, function(){...});
                */

                text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
                    function(wholeMatch,m1,m2,m3,m4) {
                        var c = m3;
                        c = c.replace(/^([ \t]*)/g,"");    // leading whitespace
                        c = c.replace(/[ \t]*$/g,"");    // trailing whitespace
                        c = _EncodeCode(c);
                        return m1+"<code>"+c+"</code>";
                    });

                return text;
            }


            var _EncodeCode = function(text) {
            //
            // Encode/escape certain characters inside Markdown code runs.
            // The point is that in code, these characters are literals,
            // and lose their special Markdown meanings.
            //
                // Encode all ampersands; HTML entities are not
                // entities within a Markdown code span.
                // COMMENTING TO TEST PATCH FROM: 
                // https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
                // text = text.replace(/&/g,"&amp;");

                // Do the angle bracket song and dance:
                // COMMENTING TO TEST PATCH FROM: 
                // https://pay.reddit.com/r/Enhancement/comments/fo55a/bug_live_comment_preview_and_reddit_interpret/c1jgpi0?context=3
                // text = text.replace(/</g,"&lt;");
                // text = text.replace(/>/g,"&gt;");

                // Now, escape characters that are magic in Markdown:
                text = escapeCharacters(text,"\*_{}[]\\",false);

            // jj the line above breaks this:
            //---

            //* Item

            //   1. Subitem

            //            special char: *
            //---

                return text;
            }


            var _DoItalicsAndBoldAndStrike = function(text) {
                text = text.replace(/(?:^|[^\S])(~~)((?:.+)(?:(?:\n.+)+)?)\1/g,
                    " <del>$2</del>");
                    
                // <strong> must go first:
                // text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
                // text = text.replace(/(^|[^\S])(\*\*|__)(.+)\n?(.*)\2/g,
                // text = text.replace(/(\*\*|__)((?:.+)(?:(?:\n.+)+)?)\1/g,
                text = text.replace(/(\*\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
                    "<strong>$2</strong>");

                // text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
                // (^|[^\S])(\*|_)([^*]+)(([\n{1}].+)+)?\2
                // (^|[^\S])(\*|_)[^*]+\2
                // text = text.replace(/(^|[^\S])(\*|_)(.+)\n?(.*)\2/g,
                text = text.replace(/(\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
                    "<em>$2</em>");
                text = text.replace(/(?:^|[^\S])(_)((?:.+)(?:(?:\n.*)+)?)\1/g,
                    " <em>$2</em>");
                    
                return text;
            }

            var _DoSuperscript = function(text) {
                // do the bigger grab first (to capture things like its^super^duper
                var lastText = '';
                while (text != lastText) {
                    lastText = text;
                    text = text.replace(/([\S]+)\^([\S]+)/g,
                        "$1<sup>$2</sup>");
                }
                return text;
            }

            var _DoTables = function(text) {
                // eventually...
                // (([\w]+)(?:\|([\w]+))+)\n((--+)(?:\|(--+))+)\n(([\w]+)(?:\|([\w]+))+\n)+ grabs a table!
                if (text) {
                    // var match = text.match(/[^\n\r]+(?:\|[^\n\r]+)+\n--(?:\|--)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/g);
                    var match = text.match(/[^\n\r]+(?:\|[^\n\r]+)+\n(:?[-]{2,}:?)(\|:?[-]{2,}:?)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/g);
                    if (match != null) {
                        for (var i=0, len=match.length; i<len; i++) {
                            if (typeof(match[i]) != 'undefined') {
                                var thisTable = match[i].split('\n');
                                var thisRow = thisTable[0];
                                var thisRowCells = thisRow.split('|');
                                var thisTableHTML = '<table><thead>';
                                for (cell in thisRowCells) {
                                    thisCell = _RunSpanGamut(thisRowCells[cell]);
                                    thisTableHTML += '<th>'+thisCell+'</th>';
                                }
                                thisTableHTML += '</thead><tbody>';
                                // row 0 is headers. row 1 is dividers which we parse for alignment, then we'll start at row 2.
                                for (var j=1, len=thisTable.length; j<len; j++) {
                                    var cellCount = 0;
                                    thisRow = thisTable[j];
                                    thisRowCells = thisRow.split('|');
                                    if (j === 1) {
                                        var thisAlign = [];
                                        for (cell in thisRowCells) {
                                            if (thisRowCells[cell].substr(0,1) === ':') {
                                                thisAlign[cellCount] = 'left';
                                                if (thisRowCells[cell].substr(thisRowCells[cell].length-1) === ':') {
                                                    thisAlign[cellCount] = 'center';
                                                }
                                            } else if (thisRowCells[cell].substr(thisRowCells[cell].length-1) === ':') {
                                                thisAlign[cellCount] = 'right';
                                            }
                                            cellCount++;
                                        }
                                    } else {
                                        thisTableHTML += '<tr>';
                                        cellCount = 0;
                                        for (cell in thisRowCells) {
                                            thisCell = _RunSpanGamut(thisRowCells[cell]);
                                            thisTableHTML += '<td align="'+thisAlign[cellCount]+'">'+thisCell+'</td>';
                                            cellCount++;
                                        }
                                        thisTableHTML += '</tr>';
                                        console.log(thisTableHTML);
                                    }
                                }
                                thisTableHTML += '</tbody></table>';
                                
                                // text = text.replace(/[^\n\r]+(?:\|[^\n\r]+)+\n--(?:\|--)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/,
                                text = text.replace(/[^\n\r]+(?:\|[^\n\r]+)+\n(:?[-]{2,}:?)(\|:?[-]{2,}:?)+\n(?:[^\n\r]+(\|[^\n\r]+)+\n)+/,
                                    thisTableHTML);
                            }
                        }
                    }
                }
                return text;
            }


            var _DoBlockQuotes = function(text) {

                /*
                    text = text.replace(/
                    (                                // Wrap whole match in $1
                        (
                            ^[ \t]*>[ \t]?            // '>' at the start of a line
                            .+\n                    // rest of the first line
                            (.+\n)*                    // subsequent consecutive lines
                            \n*                        // blanks
                        )+
                    )
                    /gm, function(){...});
                */

                text = text.replace(/((^[ \t]*&gt;[ \t]?.+\n(.+\n)*\n*)+)/gm,
                    function(wholeMatch,m1) {
                        var bq = m1;

                        // attacklab: hack around Konqueror 3.5.4 bug:
                        // "----------bug".replace(/^-/g,"") === "bug"

                        bq = bq.replace(/^[ \t]*&gt;[ \t]?/gm,"~0");    // trim one level of quoting

                        // attacklab: clean up hack
                        bq = bq.replace(/~0/g,"");

                        bq = bq.replace(/^[ \t]+$/gm,"");        // trim whitespace-only lines
                        bq = _RunBlockGamut(bq);                // recurse
                        
                        bq = bq.replace(/(^|\n)/g,"$1  ");
                        // These leading spaces screw with <pre> content, so we need to fix that:
                        bq = bq.replace(
                                /(\s*<pre>[^\r]+?<\/pre>)/gm,
                            function(wholeMatch,m1) {
                                var pre = m1;
                                // attacklab: hack around Konqueror 3.5.4 bug:
                                pre = pre.replace(/^  /mg,"~0");
                                pre = pre.replace(/~0/g,"");
                                return pre;
                            });
                        
                        return hashBlock("<blockquote>\n" + bq + "\n</blockquote>");
                    });
                return text;
            }


            var _FormParagraphs = function(text) {
            //
            //  Params:
            //    $text - string to process with html <p> tags
            //

                // Strip leading and trailing lines:
                text = text.replace(/^\n+/g,"");
                text = text.replace(/\n+$/g,"");

                var grafs = text.split(/\n{2,}/g);
                var grafsOut = [];

                //
                // Wrap <p> tags.
                //
                var end = grafs.length;
                for (var i=0; i<end; i++) {
                    var str = grafs[i];

                    // if this is an HTML marker, copy it
                    if (str.search(/~K(\d+)K/g) >= 0) {
                        grafsOut.push(str);
                    }
                    else if (str.search(/\S/) >= 0) {
                        str = _RunSpanGamut(str);
                        str = str.replace(/^([ \t]*)/g,"<p>");
                        str += "</p>"
                        grafsOut.push(str);
                    }

                }

                //
                // Unhashify HTML blocks
                //
                end = grafsOut.length;
                for (var i=0; i<end; i++) {
                    // if this is a marker for an html block...
                    while (grafsOut[i].search(/~K(\d+)K/) >= 0) {
                        var blockText = g_html_blocks[RegExp.$1];
                        blockText = blockText.replace(/\$/g,"$$$$"); // Escape any dollar signs
                        grafsOut[i] = grafsOut[i].replace(/~K\d+K/,blockText);
                    }
                }

                return grafsOut.join("\n\n");
            }


            var _EncodeAmpsAndAngles = function(text) {
            // Smart processing for ampersands and angle brackets that need to be encoded.
                
                // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
                //   http://bumppo.net/projects/amputator/
                text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
                
                // Encode naked <'s
                text = text.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
                
                return text;
            }


            var _EncodeBackslashEscapes = function(text) {
            //
            //   Parameter:  String.
            //   Returns:    The string, with after processing the following backslash
            //               escape sequences.
            //

                // attacklab: The polite way to do this is with the new
                // escapeCharacters() function:
                //
                //     text = escapeCharacters(text,"\\",true);
                //     text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
                //
                // ...but we're sidestepping its use of the (slow) RegExp constructor
                // as an optimization for Firefox.  This function gets called a LOT.

                text = text.replace(/\\(\\)/g,escapeCharacters_callback);
                text = text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback);
                return text;
            }


            var _DoAutoLinks = function(text) {

                text = text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");

                // Email addresses: <address@domain.foo>

                /*
                    text = text.replace(/
                        <
                        (?:mailto:)?
                        (
                            [-.\w]+
                            \@
                            [-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+
                        )
                        >
                    /gi, _DoAutoLinks_callback());
                */
                
                text = text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,
                    function(wholeMatch,m1) {
                        return _EncodeEmailAddress( _UnescapeSpecialChars(m1) );
                    }
                );

                return text;
            }


            var _EncodeEmailAddress = function(addr) {
            //
            //  Input: an email address, e.g. "foo@example.com"
            //
            //  Output: the email address as a mailto link, with each character
            //    of the address encoded as either a decimal or hex entity, in
            //    the hopes of foiling most address harvesting spam bots. E.g.:
            //
            //    <a href="&#x6D;&#97;&#105;&#108;&#x74;&#111;:&#102;&#111;&#111;&#64;&#101;
            //       x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;">&#102;&#111;&#111;
            //       &#64;&#101;x&#x61;&#109;&#x70;&#108;&#x65;&#x2E;&#99;&#111;&#109;</a>
            //
            //  Based on a filter by Matthew Wickline, posted to the BBEdit-Talk
            //  mailing list: <http://tinyurl.com/yu7ue>
            //

                // attacklab: why can't javascript speak hex?
                function char2hex(ch) {
                    var hexDigits = '0123456789ABCDEF';
                    var dec = ch.charCodeAt(0);
                    return(hexDigits.charAt(dec>>4) + hexDigits.charAt(dec&15));
                }

                var encode = [
                    function(ch){return "&#"+ch.charCodeAt(0)+";";},
                    function(ch){return "&#x"+char2hex(ch)+";";},
                    function(ch){return ch;}
                ];

                addr = "mailto:" + addr;

                addr = addr.replace(/./g, function(ch) {
                    if (ch === "@") {
                        // this *must* be encoded. I insist.
                        ch = encode[Math.floor(Math.random()*2)](ch);
                    } else if (ch !=":") {
                        // leave ':' alone (to spot mailto: later)
                        var r = Math.random();
                        // roughly 10% raw, 45% hex, 45% dec
                        ch =  (
                                r > .9  ?    encode[2](ch)   :
                                r > .45 ?    encode[1](ch)   :
                                            encode[0](ch)
                            );
                    }
                    return ch;
                });

                addr = "<a href=\"" + addr + "\">" + addr + "</a>";
                addr = addr.replace(/">.+:/g,"\">"); // strip the mailto: from the visible part"

                return addr;
            }


            var _UnescapeSpecialChars = function(text) {
            //
            // Swap back in all the special characters we've hidden.
            //
                text = text.replace(/~E(\d+)E/g,
                    function(wholeMatch,m1) {
                        var charCodeToReplace = parseInt(m1);
                        return String.fromCharCode(charCodeToReplace);
                    }
                );
                return text;
            }


            var _Outdent = function(text) {
            //
            // Remove one level of line-leading tabs or spaces
            //

                // attacklab: hack around Konqueror 3.5.4 bug:
                // "----------bug".replace(/^-/g,"") === "bug"

                text = text.replace(/^(\t|[ ]{1,4})/gm,"~0"); // attacklab: g_tab_width

                // attacklab: clean up hack
                text = text.replace(/~0/g,"")

                return text;
            }

            var _Detab = function(text) {
            // attacklab: Detab's completely rewritten for speed.
            // In perl we could fix it by anchoring the regexp with \G.
            // In javascript we're less fortunate.

                // expand first n-1 tabs
                text = text.replace(/\t(?=\t)/g,"    "); // attacklab: g_tab_width

                // replace the nth with two sentinels
                text = text.replace(/\t/g,"~A~B");

                // use the sentinel to anchor our regex so it doesn't explode
                text = text.replace(/~B(.+?)~A/g,
                    function(wholeMatch,m1,m2) {
                        var leadingText = m1;
                        var numSpaces = 4 - leadingText.length % 4;  // attacklab: g_tab_width

                        // there *must* be a better way to do this:
                        for (var i=0; i<numSpaces; i++) leadingText+=" ";

                        return leadingText;
                    }
                );

                // clean up sentinels
                // text = text.replace(/~A/g,"    ");  // attacklab: g_tab_width
                // text = text.replace(/~B/g,"");
                text = text.replace(/~A~B/g,"    ");

                return text;
            }


            //
            //  attacklab: Utility functions
            //


            var escapeCharacters = function(text, charsToEscape, afterBackslash) {
                // First we have to escape the escape characters so that
                // we can build a character class out of them
                var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g,"\\$1") + "])";

                if (afterBackslash) {
                    regexString = "\\\\" + regexString;
                }

                var regex = new RegExp(regexString,"g");
                text = text.replace(regex,escapeCharacters_callback);

                return text;
            }


            var escapeCharacters_callback = function(wholeMatch,m1) {
                var charCodeToEscape = m1.charCodeAt(0);
                return "~E"+charCodeToEscape+"E";
            }

            } // end of Showdown.converter




            // ###########################################################################
            // Start user script 
            // ###########################################################################



            var converter = new Showdown.converter();

            function wireupNewCommentEditors( parent )
            {    
                if (!parent.getElementsByTagName) return;
                
                if ( parent.tagName === 'FORM' )
                {        
                    /*HACK: I don't get it! When I click Reply to a comment, a live 
                    preview already exists! Even before our handler for DOMNodeInserted 
                    fires. (I tested this with a timeout.) Plus, the existing live preview 
                    will already contain whatever preview is in the main comment preview 
                    at the time, but it is not linked to the main comment text area, so it 
                    never updates. The crazy thig is, the form for the comment reply 
                    doesn't even exist in the DOM before we click the Reply link. So where 
                    the hell is this preview coming from? I'm just brute-forcing it away 
                    for now. Same issue with the editor*/
                    removeExistingPreview( parent );        
                    removeExistingEditor( parent );
                    
                    var preview = addPreviewToParent( parent );    
                    addMarkdownEditorToForm( parent, preview );
                }
                else
                {        
                    var forms = parent.getElementsByTagName('form');
                    
                    for ( var i=0, form=null; form=forms[i]; i++ ) {
                        
                        if ( form.getAttribute('id') && (form.getAttribute('id').match(/^commentreply_./)))    {                
                            var preview = addPreviewToParent(form);
                            addMarkdownEditorToForm( form, preview );
                        } else if (form && form.getAttribute('id') && form.getAttribute('id').match(/^form-./)) {
                            // this is a just-added comment, so we need to add the elements to the usertext-edit div as its structure is a bit different from an existing comment...
                            var usertext = form.querySelector('.usertext-edit');
                            if (usertext) {
                                var preview = addPreviewToParent(usertext);
                                addMarkdownEditorToForm( usertext, preview );
                            }
                        }

                    }
                }
            }

            function wireupExistingCommentEditors()
            {
                // opera doesn't like xpath for some reason - changing to querySelectorAll.
                /*
                var editDivs = document.evaluate(
                    "//div[@class='usertext-edit']",
                    document,
                    null,
                    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );
                //First one is not an edit form.
                for ( var i = 0; i < editDivs.snapshotLength; i++)
                {
                    var editDiv = editDivs.snapshotItem(i);
                    
                    var preview = addPreviewToParent( editDiv );
                    addMarkdownEditorToForm( editDiv, preview );
                    
                    refreshPreview( preview, preview.textArea )
                }
                */
                var editDivs = document.body.querySelectorAll('div.usertext-edit');
                //First one is not an edit form.
                for ( var i = 0, len=editDivs.length; i < len; i++)
                {
                    var editDiv = editDivs[i];
                    
                    var preview = addPreviewToParent( editDiv );
                    addMarkdownEditorToForm( editDiv, preview );
                    
                    refreshPreview( preview, preview.textArea )
                }
                
            }
            
            function wireupViewSourceButtons(ele) {
                if (ele == null) ele = document;
                if (RESUtils.pageType() === 'comments') {
                    modules.commentPreview.commentMenus = ele.querySelectorAll('.entry .flat-list.buttons .first');
                    modules.commentPreview.commentMenusCount = modules.commentPreview.commentMenus.length;
                    modules.commentPreview.commentMenusi = 0;
                    (function(){
                        // scan 15 links at a time...
                        var chunkLength = Math.min((modules.commentPreview.commentMenusCount - modules.commentPreview.commentMenusi), 15);
                        for (var i=0;i<chunkLength;i++) {
                            viewSource = document.createElement('li');
                            viewSource.innerHTML = '<a href="javascript:void(0)">source</a>';
                            viewSource.addEventListener('click',function(e) {
                                e.preventDefault();
                                modules.commentPreview.viewSource(e.target);
                            }, false);
                            // if (modules.commentPreview.commentMenus[modules.commentPreview.commentMenusi].nextSibling) {
                            //    $(modules.commentPreview.commentMenus[modules.commentPreview.commentMenusi].nextSibling).after(viewSource);
                            //} else {
                                if (modules.commentPreview.commentMenus[modules.commentPreview.commentMenusi].nextSibling != null) {
                                    $(modules.commentPreview.commentMenus[modules.commentPreview.commentMenusi].nextSibling).after(viewSource);
                                } else {
                                    $(modules.commentPreview.commentMenus[modules.commentPreview.commentMenusi]).after(viewSource);
                                }
                            //}
                            modules.commentPreview.commentMenusi++;
                        }
                        if (modules.commentPreview.commentMenusi < modules.commentPreview.commentMenusCount) {
                            setTimeout(arguments.callee, 1000);
                        } 
                    })();        
                }
            }

            function addPreviewToParent( parent ) {    
                /*
                var set=document.createElement('fieldset');
                set.setAttribute('class', 'liveComment');

                var legend=document.createElement('legend');
                legend.textContent='Live Preview';

                var preview=document.createElement('div');
                preview.setAttribute('class', 'md');

                set.appendChild(legend);
                set.appendChild(preview);
                */
                var previewContainer = document.createElement('div');
                previewContainer.setAttribute('class','RESDialogSmall livePreview');
                previewContainer.innerHTML = '<h3>Live Preview</h3>';
                
                var preview = document.createElement('div');
                preview.setAttribute('class','md RESDialogContents');
                previewContainer.appendChild(preview);

                // modification: hide this thing until someone types...
                preview.parentNode.style.display = 'none';
                
                // parent.appendChild(set);
                parent.appendChild(previewContainer);

                var textAreas = parent.getElementsByTagName('textarea');
                
                if ( textAreas[0] )
                {        
                    var targetTextArea = textAreas[0];
                
                    var timer=null;
                    
                    targetTextArea.addEventListener(
                        'keyup',
                        function(e)
                        {
                            if (timer) clearTimeout(timer);
                            
                            timer = setTimeout(
                                function()
                                {
                                    refreshPreview( preview, targetTextArea );            
                                },
                                100
                            );
                        },
                        false
                    );    

                    targetTextArea.addEventListener(
                        'keydown',
                        function(e)
                        {
                            if (e.ctrlKey || e.metaKey) {
                                /*
                                    text = text.replace(/(?:^|[^\S])(~~)((?:.+)(?:(?:\n.+)+)?)\1/g,
                                        " <del>$2</del>");
                                        
                                    // <strong> must go first:
                                    // text = text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,
                                    // text = text.replace(/(^|[^\S])(\*\*|__)(.+)\n?(.*)\2/g,
                                    // text = text.replace(/(\*\*|__)((?:.+)(?:(?:\n.+)+)?)\1/g,
                                    text = text.replace(/(\*\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
                                        "<strong>$2</strong>");

                                    // text = text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,
                                    // (^|[^\S])(\*|_)([^*]+)(([\n{1}].+)+)?\2
                                    // (^|[^\S])(\*|_)[^*]+\2
                                    // text = text.replace(/(^|[^\S])(\*|_)(.+)\n?(.*)\2/g,
                                    text = text.replace(/(\*)((?:.+?)(?:(?:\n.*)+)?)\1/g,
                                        "<em>$2</em>");
                                    text = text.replace(/(?:^|[^\S])(_)((?:.+)(?:(?:\n.*)+)?)\1/g,
                                        " <em>$2</em>");
                                
                                */
                                var toReplace = $(e.target).getSelection().text;
                                switch (String.fromCharCode(e.keyCode)) {
                                    case 'I':
                                        e.preventDefault();
                                        if (((toReplace.substr(0,1) === '*') && (toReplace.substr(0,2) != '**')) && ((toReplace.substr(-1) === '*') && (toReplace.substr(-2) != '**'))) {
                                            toReplace = toReplace.substr(1,toReplace.length-2);
                                        } else {
                                            toReplace = '*'+toReplace+'*';
                                        }
                                        $(e.target).replaceSelection(toReplace,true);
                                        break;
                                    case 'B':
                                        e.preventDefault();
                                        if ((toReplace.substr(0,2) === '**') && (toReplace.substr(-2) === '**')) {
                                            toReplace = toReplace.substr(2,toReplace.length-4);
                                        } else {
                                            toReplace = '**'+toReplace+'**';
                                        }
                                        $(e.target).replaceSelection(toReplace,true);
                                        break;
                                    case 'S':
                                        e.preventDefault();
                                        if ((toReplace.substr(0,2) === '~~') && (toReplace.substr(-2) === '~~')) {
                                            toReplace = toReplace.substr(2,toReplace.length-4);
                                        } else {
                                            toReplace = '~~'+toReplace+'~~';
                                        }
                                        $(e.target).replaceSelection(toReplace,true);
                                        break;
                                }
                            }
                        },
                        false
                    );    

                    
                    preview.textArea = targetTextArea;
                
                    addPreviewClearOnCommentSubmit( parent, preview );
                }
                
                return preview;
            }

            //Find any fieldsets with a class of liveComment as children of this element and remove them.
            function removeExistingPreview( parent )
            {
                var previews = parent.querySelectorAll('div.livePreview');
                
                for (var i = 0, preview = null; preview = previews[i]; i++)
                {        
                    preview.parentNode.removeChild( preview );
                    break;
                }
            }

            function removeExistingEditor( parent )
            {
                // var divs = parent.getElementsByTagName('div');
                var divs = parent.querySelectorAll('.markdownEditor, .commentingAs');
                
                for (var i = 0, div = null; div = divs[i]; i++)
                {
                    div.parentNode.removeChild( div );
                }
            }

            function addPreviewClearOnCommentSubmit( parent, preview )
            {
                var buttons = parent.getElementsByTagName('button');
                
                for (var i = 0, button = null; button = buttons[i]; i++)
                {
                    if ( button.getAttribute('class') === "save" )
                    {
                        button.addEventListener(
                            'click', 
                            function()
                            {
                                preview.innerHTML='';
                            }, 
                            false
                        );
                    }
                }    
            }

            function refreshPreview( preview, targetTextArea )
            {
                // modification: hide this thing if it's empty...
                if (targetTextArea.value === '') {
                    preview.parentNode.style.display = 'none';
                } else {
                    preview.parentNode.style.display = 'block';
                }
                preview.innerHTML = converter.makeHtml( targetTextArea.value );
            }

            function addMarkdownEditorToForm( parent, preview ) 
            {    
                var textAreas = parent.getElementsByTagName('textarea');
                
                if ( !textAreas[0] ) return;
                
                var targetTextArea = textAreas[0];
                
                
                var controlBox = document.createElement( 'div' );
                controlBox.setAttribute('class', 'markdownEditor');
                parent.insertBefore( controlBox, parent.firstChild );

                if ((modules.commentPreview.options.commentingAs.value) && (!(modules.usernameHider.isEnabled()))) {
                    // show who we're commenting as...
                    var commentingAs = document.createElement('div');
                    commentingAs.setAttribute('class', 'commentingAs');
                    commentingAs.innerHTML = 'Commenting as: ' + RESUtils.loggedInUser();
                    parent.insertBefore( commentingAs, parent.firstChild );
                }
                
                var bold = new EditControl(
                    '<b>Bold</b>',
                    function()
                    {
                        tagSelection( targetTextArea, '**', '**' );
                        refreshPreview( preview, targetTextArea );
                    },
                    'ctrl-b'
                );
                
                var italics = new EditControl(
                    '<i>Italic</i>',
                    function()
                    {
                        tagSelection( targetTextArea, '*', '*' );
                        refreshPreview( preview, targetTextArea );
                    },
                    'ctrl-i'
                );
                
                var strikethrough = new EditControl(
                    '<del>strike</del>',
                    function()
                    {
                        tagSelection( targetTextArea, '~~', '~~' );
                        refreshPreview( preview, targetTextArea );
                    },
                    'ctrl-s'
                );
                
                var superscript = new EditControl(
                    '<sup>sup</sup>',
                    function()
                    {
                        tagSelection( targetTextArea, '^', '' );
                        refreshPreview( preview, targetTextArea );
                    }
                );

                var link = new EditControl(
                    'Link',
                    function()
                    {
                        linkSelection( targetTextArea );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var quote = new EditControl(
                    '|Quote',
                    function()
                    {
                        prefixSelectionLines( targetTextArea, '>' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var code = new EditControl(
                    '<span style="font-family: Courier New;">Code</span>',
                    function()
                    {
                        prefixSelectionLines( targetTextArea, '    ' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var bullets = new EditControl(
                    '&bull;Bullets',
                    function()
                    {
                        prefixSelectionLines( targetTextArea, '* ' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var numbers = new EditControl(
                    '1.Numbers',
                    function()
                    {
                        prefixSelectionLines( targetTextArea, '1. ' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var disapproval = new EditControl(
                    '&#3232;\_&#3232;',
                    function() {
                        prefixSelectionLines( targetTextArea, '&#3232;\\\_&#3232;' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                var promoteRES = new EditControl(
                    '[Promote]',
                    function() {
                        prefixSelectionLines( targetTextArea, '[Reddit Enhancement Suite](http://redditenhancementsuite.com)' );
                        refreshPreview( preview, targetTextArea );
                    }
                );
                
                controlBox.appendChild( bold.create() );
                controlBox.appendChild( italics.create() );
                controlBox.appendChild( strikethrough.create() );
                controlBox.appendChild( superscript.create() );
                controlBox.appendChild( link.create() );
                controlBox.appendChild( quote.create() );
                controlBox.appendChild( code.create() );
                controlBox.appendChild( bullets.create() );
                controlBox.appendChild( numbers.create() );
                controlBox.appendChild( disapproval.create() );
                controlBox.appendChild( promoteRES.create() );
                    
            }

            function EditControl( label, editFunction, shortcutKey )
            {
                this.create = function() 
                {
                    var link = document.createElement('a');
                    if (shortcutKey) link.title = shortcutKey;
                    link.innerHTML = label;
                    link.href = 'javascript:;';
                    // link.setAttribute('style','Margin-Right: 15px; text-decoration: none;');
                    
                    link.execute = editFunction;
                    
                    addEvent( link, 'click', 'execute' );
                    
                    return link;    
                }
            }

            function tagSelection( targetTextArea, tagOpen, tagClose, textEscapeFunction )
            {    
                //record scroll top to restore it later.
                var scrollTop = targetTextArea.scrollTop;
                
                //We will restore the selection later, so record the current selection.
                var selectionStart = targetTextArea.selectionStart;
                var selectionEnd = targetTextArea.selectionEnd;
                
                var selectedText = targetTextArea.value.substring( selectionStart, selectionEnd );
                
                //Markdown doesn't like it when you tag a word like **this **. The space messes it up. So we'll account for that because Firefox selects the word, and the followign space when you double click a word.
                var potentialTrailingSpace = '';
                
                if( selectedText[ selectedText.length - 1 ] === ' ' )
                {
                    potentialTrailingSpace = ' ';
                    selectedText = selectedText.substring( 0, selectedText.length - 1 );
                }
                
                if ( textEscapeFunction )
                {
                    selectedText = textEscapeFunction( selectedText );
                }
                
                targetTextArea.value = 
                    targetTextArea.value.substring( 0, selectionStart ) + //text leading up to the selection start
                    tagOpen + 
                    selectedText +
                    tagClose + 
                    potentialTrailingSpace +
                    targetTextArea.value.substring( selectionEnd ); //text after the selection end
                
                targetTextArea.selectionStart = selectionStart + tagOpen.length;
                targetTextArea.selectionEnd = selectionEnd + tagOpen.length;
                
                targetTextArea.scrollTop = scrollTop;
            }

            function linkSelection( targetTextArea )
            {
                var url = prompt( "Enter the URL:", "" );

                if ( url != null )
                {
                    tagSelection(
                        targetTextArea,
                        '[',
                        '](' + url.replace( /\(/, '\\(' ).replace( /\)/, '\\)' ) + ')', //escape parens in url
                        function( text )
                        {
                            return text.replace( /\[/, '\\[' ).replace( /\]/, '\\]' ).replace( /\(/, '\\(' ).replace( /\)/, '\\)' ); //escape brackets and parens in text
                        }
                    );
                }
            }

            function prefixSelectionLines( targetTextArea, prefix )
            {
                var scrollTop = targetTextArea.scrollTop;
                var selectionStart = targetTextArea.selectionStart;
                var selectionEnd = targetTextArea.selectionEnd;
                
                var selectedText = targetTextArea.value.substring( selectionStart, selectionEnd );
                
                var lines = selectedText.split( '\n' );
                
                var newValue = '';
                
                for( var i = 0; i < lines.length; i++ )
                {
                    // newValue += prefix + lines[i] + '\n';
                    newValue += prefix + lines[i];
                    if ( ( i + 1 ) != lines.length ) {newValue += '\n';}
                }
                
                targetTextArea.value = 
                    targetTextArea.value.substring( 0, selectionStart ) + //text leading up to the selection start
                    newValue + 
                    targetTextArea.value.substring( selectionEnd ); //text after the selection end
                
                targetTextArea.scrollTop = scrollTop;
            }

            //Delegated event wire-up utitlity. Using this allows you to use the "this" keyword in a delegated function.
            function addEvent( target, eventName, handlerName )
            {
                target.addEventListener(eventName, function(e){target[handlerName](e);}, false);
            }

            // Bootstrap with the top-level comment always in the page, and editors for your existing comments.
            wireupExistingCommentEditors();
            
            // Add "view source" buttons
            wireupViewSourceButtons(document);
            

            // Watch for any future 'reply' forms, or stuff loaded in via "load more comments"...
            document.body.addEventListener(
                'DOMNodeInserted',
                function( event ) {
                    if (event.target.tagName === 'FORM') {
                        wireupNewCommentEditors( event.target );
                    }
                    if ((event.target.tagName === 'DIV') && (hasClass(event.target,'thing'))) {
                        wireupNewCommentEditors( event.target );
                        wireupViewSourceButtons( event.target );
                    }
                },
                false
            );
        }
    },
    viewSource: function(ele) {
        if (ele) {
            var permalink = ele.parentNode.parentNode.firstChild.firstChild;
            if (permalink) {
                // check if we've already viewed the source.. if so just reveal it instead of loading...
                var sourceDiv = ele.parentNode.parentNode.previousSibling.querySelector('.viewSource');
                if (sourceDiv) {
                    sourceDiv.style.display = 'block';
                } else {
                    var jsonURL = permalink.getAttribute('href');
                    var sourceLink = 'comment';
                    if (hasClass(permalink, 'comments')) {
                        sourceLink = 'selftext';
                    }
                    jsonURL += '/.json';
                    this.viewSourceEle = ele;
                    this.viewSourceLink = sourceLink;
                    
                    GM_xmlhttpRequest({
                        method:    "GET",
                        url:    jsonURL,
                        onload:    function(response) {
                            var thisResponse = JSON.parse(response.responseText);
                            var userTextForm = document.createElement('div');
                            addClass(userTextForm,'usertext-edit');
                            addClass(userTextForm,'viewSource');
                            if (modules.commentPreview.viewSourceLink === 'comment') {
                                sourceText = thisResponse[1].data.children[0].data.body;
                                userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
                            } else {
                                sourceText = thisResponse[0].data.children[0].data.selftext;
                                userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
                            }
                            var cancelButton = userTextForm.querySelector('.cancel');
                            cancelButton.addEventListener('click', modules.commentPreview.hideSource, false);
                            modules.commentPreview.viewSourceEle.parentNode.parentNode.previousSibling.appendChild(userTextForm);
                        }
                    });
                }
                
            }
        }
    },
    hideSource: function(e) {
        e.target.parentNode.parentNode.parentNode.style.display = 'none';
    },
    subredditAutocomplete: function(formEle) {
        if (!this.subredditAutocompleteRunOnce) {
            // Keys "enum"
            this.KEY = {
                BACKSPACE: 8,
                TAB: 9,
                ENTER: 13,
                ESCAPE: 27,
                SPACE: 32,
                PAGE_UP: 33,
                PAGE_DOWN: 34,
                END: 35,
                HOME: 36,
                LEFT: 37,
                UP: 38,
                RIGHT: 39,
                DOWN: 40,
                NUMPAD_ENTER: 108,
                COMMA: 188
            };
            if (!formEle) formEle = $('textarea:not([name=title])');
            this.subredditAutocompleteRunOnce = true;
            this.subredditAutocompleteCache = {};
            this.subredditRE = /\W\/?r\/([\w\.]*)$/,
            this.subredditSkipRE = /\W\/?r\/([\w\.]*)\ $/,
            this.linkReplacementRE = /([^\w\[\(])\/r\/(\w*(?:\.\w*)?)([^\w\]\)])/g;
            modules.commentPreview.subredditAutocompleteDropdown = $('<div id="subreddit_dropdown" class="drop-choices srdrop inuse" style="display:none; position:relative;"><a class="choice"></a></div>');
            $('body').append(modules.commentPreview.subredditAutocompleteDropdown);
        }
        $(formEle).live('keyup', modules.commentPreview.subredditAutocompleteTrigger );
        $(formEle).live('keydown', modules.commentPreview.subredditAutocompleteNav );
    },
    subredditAutocompleteTrigger: function(event) {
        if (/[^A-Za-z0-9 ]/.test(String.fromCharCode(event.keyCode))) {
            return false;
        }
        if (typeof(modules.commentPreview.subredditAutoCompleteAJAXTimer) != 'undefined') clearTimeout(modules.commentPreview.subredditAutoCompleteAJAXTimer);
        modules.commentPreview.currentTextArea = event.target;
        var    match = modules.commentPreview.subredditRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
        if( !match || match[1] === '' || match[1].length > 10 ) {
            // if space or enter, check if they skipped over a subreddit autocomplete without selecting one..
            if ((event.keyCode === 32) || (event.keyCode === 13)) {
                match = modules.commentPreview.subredditSkipRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
                if (match) {
                    modules.commentPreview.addSubredditLink(match[1]);
                }
            }
            return modules.commentPreview.hideSubredditAutocompleteDropdown();
        }

        var query = match[1].toLowerCase();
        if( modules.commentPreview.subredditAutocompleteCache[query]) return modules.commentPreview.updateSubredditAutocompleteDropdown( modules.commentPreview.subredditAutocompleteCache[query], event.target );

        var thisTarget = event.target;
        modules.commentPreview.subredditAutoCompleteAJAXTimer = setTimeout(
            function() {
                $.post('/api/search_reddit_names.json', {query:query},
                // $.post('/reddits/search.json', {q:query},
                    function(r){
                        modules.commentPreview.subredditAutocompleteCache[query]=r['names'];
                        modules.commentPreview.updateSubredditAutocompleteDropdown( r['names'], thisTarget );
                        modules.commentPreview.subredditAutocompleteDropdownSetNav(0);
                    },
                "json");
            
            }, 200);


        $(this).blur( modules.commentPreview.hideSubredditAutocompleteDropdown );    
    },
    subredditAutocompleteNav: function(event) {
        if ($("#subreddit_dropdown").is(':visible')) {
            switch (event.keyCode) {
                case modules.commentPreview.KEY.DOWN:
                case modules.commentPreview.KEY.RIGHT:
                    event.preventDefault();
                    var reddits = $("#subreddit_dropdown a.choice");
                    if (modules.commentPreview.subredditAutocompleteDropdownNavidx < reddits.length-1) modules.commentPreview.subredditAutocompleteDropdownNavidx++;
                    modules.commentPreview.subredditAutocompleteDropdownSetNav(modules.commentPreview.subredditAutocompleteDropdownNavidx);
                    break;
                case modules.commentPreview.KEY.UP:
                case modules.commentPreview.KEY.LEFT:
                    event.preventDefault();
                    if (modules.commentPreview.subredditAutocompleteDropdownNavidx > 0) modules.commentPreview.subredditAutocompleteDropdownNavidx--;
                    modules.commentPreview.subredditAutocompleteDropdownSetNav(modules.commentPreview.subredditAutocompleteDropdownNavidx);
                    break;
                case modules.commentPreview.KEY.TAB:
                case modules.commentPreview.KEY.ENTER:
                    event.preventDefault();
                    var reddits = $("#subreddit_dropdown a.choice");
                    RESUtils.mousedown(reddits[modules.commentPreview.subredditAutocompleteDropdownNavidx]);
                    break;
                case modules.commentPreview.KEY.ESCAPE:
                    event.preventDefault();
                    modules.commentPreview.hideSubredditAutocompleteDropdown();
                    break;
            }
        }
    },
    subredditAutocompleteDropdownSetNav: function(idx) {
        modules.commentPreview.subredditAutocompleteDropdownNavidx = idx;
        var reddits = $("#subreddit_dropdown a.choice");
        for (var i=0, len=reddits.length; i<len; i++) {
            $(reddits[i]).removeClass('selectedItem');
            if (i === idx) $(reddits[i]).addClass('selectedItem');
        }
    },
    hideSubredditAutocompleteDropdown: function() {
        $("#subreddit_dropdown").hide();
    },
    updateSubredditAutocompleteDropdown: function(sr_names, textarea) {
        $( textarea ).after( modules.commentPreview.subredditAutocompleteDropdown );

        if(!sr_names.length) return    modules.commentPreview.hideSubredditAutocompleteDropdown();

        var first_row = modules.commentPreview.subredditAutocompleteDropdown.children(":first");
        modules.commentPreview.subredditAutocompleteDropdown.children().remove();

        for (var i=0, len=sr_names.length; i<len; i++) {
            if( i>10 ) break;
            var new_row=first_row.clone();
            new_row.text( sr_names[i] );
            modules.commentPreview.subredditAutocompleteDropdown.append(new_row);
            new_row.mousedown( modules.commentPreview.updateSubredditAutocompleteTextarea );
        }
        modules.commentPreview.subredditAutocompleteDropdown.show();
        if (typeof(modules.commentPreview.subredditAutocompleteDropdownNavidx) === 'undefined') modules.commentPreview.subredditAutocompleteDropdownNavidx = 0;
        modules.commentPreview.subredditAutocompleteDropdownSetNav(modules.commentPreview.subredditAutocompleteDropdownNavidx);
    
    },
    updateSubredditAutocompleteTextarea: function(event) {
        modules.commentPreview.hideSubredditAutocompleteDropdown();
        modules.commentPreview.addSubredditLink(this.innerHTML);
    },
    addSubredditLink: function(subreddit) {
        var textarea    = modules.commentPreview.currentTextArea,
            caretPos    = textarea.selectionStart,
            beforeCaret    = textarea.value.substr( 0,caretPos ),
            afterCaret    = textarea.value.substr( caretPos );

        var srLink = '[/r/'+subreddit+'](/r/'+subreddit+') ';
        beforeCaret        = beforeCaret.replace( /\/?r\/(\w*)\ ?$/, srLink );
        textarea.value    = beforeCaret + afterCaret;
        textarea.selectionStart    = textarea.selectionEnd    = beforeCaret.length;
        textarea.focus()
    
    }
};
