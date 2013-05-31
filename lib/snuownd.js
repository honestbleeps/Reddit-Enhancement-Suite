/**
 @preserve snuownd.js - javascript port of reddit's "snudown" markdown parser
 https://github.com/gamefreak/snuownd
 */
/**
 * @license Copyright (c) 2009, Natacha Porté
 * Copyright (c) 2011, Vicent Marti
 * Copyright (c) 2012, Scott McClaugherty
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
// up to date with commit b6baacb79996cec794a20d3abcae51adec5cc3cd

/**
@module SnuOwnd
*/
(function(exports){
	function _isspace(c) {return c == ' ' || c == '\n';}
	function isspace(c) {return /[\x09-\x0d ]/.test(c);}
	function isalnum(c) { return /[A-Za-z0-9]/.test(c); }
	function isalpha(c) { return /[A-Za-z]/.test(c); }
	function ispunct(c) {return /[\x20-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/.test(c); }

	function urlHexCode(number) {
		var hex_str = '0123456789ABCDEF';
		return '%'+hex_str[(number&0xf0)>>4]+hex_str[(number&0x0f)>>0];
	}

	function escapeUTF8Char(char) {
		var code = char.charCodeAt(0);
		if (code < 0x80) {
			return urlHexCode(code);
		} else if((code > 0x7f) && (code < 0x0800)) {
			var seq = urlHexCode(code >> 6 & 0xff | 0xc0);
				seq += urlHexCode(code >> 0 & 0x3f | 0x80);
			return seq;
		} else {
			var seq  = urlHexCode(code >> 12 & 0xff | 0xe0);
				seq += urlHexCode(code >> 6 & 0x3f | 0x80);
				seq += urlHexCode(code >> 0 & 0x3f | 0x80);
			return seq;
		}
	}

	function find_block_tag (str) {
		var wordList = [
			'p', 'dl', 'div', 'math',
			'table', 'ul', 'del', 'form',
			'blockquote', 'figure', 'ol', 'fieldset',
			'h1', 'h6', 'pre', 'script',
			'h5', 'noscript', 'style', 'iframe',
			'h4', 'ins', 'h3', 'h2'
		];
		if (wordList.indexOf(str.toLowerCase()) != -1) {
			return str.toLowerCase();
		}
		return '';
	}

	function sdhtml_is_tag(tag_data, tagname) {
		var i;
		var closed = 0;
		var tag_size = tag_data.length;

		if (tag_size < 3 || tag_data[0] != '<') return HTML_TAG_NONE;

		i = 1;

		if (tag_data[i] == '/') {
			closed = 1;
			i++;
		}

		var tagname_c = 0;
		for (; i < tag_size; ++i, ++tagname_c) {
			if (tagname_c >= tagname.length) break;

			if (tag_data[i] != tagname[tagname_c]) return HTML_TAG_NONE;
		}

		if (i == tag_size) return HTML_TAG_NONE;

		if (isspace(tag_data[i]) || tag_data[i] == '>')
			return closed ? HTML_TAG_CLOSE : HTML_TAG_OPEN;

		return HTML_TAG_NONE;
	}

	function unscape_text(out, src) {
		var i = 0, org;
		while (i < src.s.length) {
			org = i;
			while (i < src.s.length && src.s[i] != '\\') i++;

			if (i > org) out.s += src.s.slice(org, i);

			if (i + 1 >= src.s.length) break;

			out.s += src.s[i + 1];
			i += 2;
		}
	}

	/**
	 * According to the OWASP rules:
	 *
	 * & --> &amp;
	 * < --> &lt;
	 * > --> &gt;
	 * " --> &quot;
	 * ' --> &#x27;     &apos; is not recommended
	 * / --> &#x2F;     forward slash is included as it helps end an HTML entity
	 *
	 */
	var HTML_ESCAPE_TABLE = [
		7, 7, 7, 7, 7, 7, 7, 7, 7, 0, 0, 7, 7, 0, 7, 7, 
		7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 
		0, 0, 1, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 4, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 6, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	];

	var HTML_ESCAPES = ["", "&quot;", "&amp;", "&#39;", "&#47;", "&lt;", "&gt;", "" /* throw out control characters */ ];

	function escape_html(out, src, secure) {
		var i = 0, org, esc = 0;
		while (i < src.length) {
			org = i;
			while (i < src.length && !(esc = HTML_ESCAPE_TABLE[src.charCodeAt(i)]))
				i++;

			if (i > org) out.s += src.slice(org, i);

			/* escaping */
			if (i >= src.length) break;

			/* The forward slash is only escaped in secure mode */
			if (src[i] == '/' && !secure) {
				out.s += '/';
			} else if (HTML_ESCAPE_TABLE[src.charCodeAt(i)] == 7) {
				/* skip control characters */
			} else {
				out.s += HTML_ESCAPES[esc];
			}

			i++;
		}
	}


	/*
	 * The following characters will not be escaped:
	 *
	 *		-_.+!*'(),%#@?=;:/,+&$ alphanum
	 *
	 * Note that this character set is the addition of:
	 *
	 *	- The characters which are safe to be in an URL
	 *	- The characters which are *not* safe to be in
	 *	an URL because they are RESERVED characters.
	 *
	 * We asume (lazily) that any RESERVED char that
	 * appears inside an URL is actually meant to
	 * have its native function (i.e. as an URL 
	 * component/separator) and hence needs no escaping.
	 *
	 * There are two exceptions: the chacters & (amp)
	 * and ' (single quote) do not appear in the table.
	 * They are meant to appear in the URL as components,
	 * yet they require special HTML-entity escaping
	 * to generate valid HTML markup.
	 *
	 * All other characters will be escaped to %XX.
	 *
	 */
	var HREF_SAFE = [
		2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 2, 2, 
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 
		0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 
		0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
		1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
	];

	function escape_href(out, src) {
		var  i = 0, org;


		while (i < src.length) {
			org = i;
			while (i < src.length && HREF_SAFE[src.charCodeAt(i)] != 0) i++;

			if (i > org) out.s += src.slice(org, i);

			/* escaping */
			if (i >= src.length) break;

			/* throw out control characters */
			if (HREF_SAFE[src.charCodeAt(i)] == 2) {
				i++;
				continue;
			}

			switch (src[i]) {
				/* amp appears all the time in URLs, but needs
				 * HTML-entity escaping to be inside an href */
				case '&': 
					out.s += '&amp;';
					break;

					/* the single quote is a valid URL character
					 * according to the standard; it needs HTML
					 * entity escaping too */
				case '\'':
					out.s += '&#x27;';
					break;

					/* the space can be escaped to %20 or a plus
					 * sign. we're going with the generic escape
					 * for now. the plus thing is more commonly seen
					 * when building GET strings */
				/*
				//This was disabled
				case ' ':
					out.s += '+'
					break;
				//*/

					/* every other character goes with a %XX escaping */
				default:
					out.s += escapeUTF8Char(src[i]);
					/*
					var cc = src.charCodeAt(i);
					hex_str[1] = hex_chars[(cc >> 4) & 0xF];
					hex_str[2] = hex_chars[cc & 0xF];
					out.s += hex_str.join('');
					*/
			}

			i++;
		}
	}


	// function autolink_delim(uint8_t *data, size_t link_end, size_t offset, size_t size)
	function autolink_delim(data, link_end) {
		var cclose, copen = 0;
		var i;

		for (i = 0; i < link_end; ++i)
			if (data[i] == '<') {
				link_end = i;
				break;
			}

		while (link_end > 0) {
			if ('?!.,'.indexOf(data[link_end - 1]) != -1) link_end--;

			else if (data[link_end - 1] == ';') {
				var new_end = link_end - 2;

				while (new_end > 0 && isalpha(data[new_end])) new_end--;

				if (new_end < link_end - 2 && data[new_end] == '&')
					link_end = new_end;
				else link_end--;
			}
			else break;
		}

		if (link_end == 0) return 0;

		cclose = data[link_end - 1];

		switch (cclose) {
			case '"':	copen = '"'; break;
			case '\'':	copen = '\''; break;
			case ')':	copen = '('; break;
			case ']':	copen = '['; break;
			case '}':	copen = '{'; break;
		}

		if (copen != 0) {
			var closing = 0;
			var opening = 0;
			var j = 0;

			/* Try to close the final punctuation sign in this same line;
			 * if we managed to close it outside of the URL, that means that it's
			 * not part of the URL. If it closes inside the URL, that means it
			 * is part of the URL.
			 *
			 * Examples:
			 *
			 *	foo http://www.pokemon.com/Pikachu_(Electric) bar
			 *		=> http://www.pokemon.com/Pikachu_(Electric)
			 *
			 *	foo (http://www.pokemon.com/Pikachu_(Electric)) bar
			 *		=> http://www.pokemon.com/Pikachu_(Electric)
			 *
			 *	foo http://www.pokemon.com/Pikachu_(Electric)) bar
			 *		=> http://www.pokemon.com/Pikachu_(Electric))
			 *
			 *	(foo http://www.pokemon.com/Pikachu_(Electric)) bar
			 *		=> foo http://www.pokemon.com/Pikachu_(Electric)
			 */

			while (j < link_end) {
				if (data[j] == copen) opening++;
				else if (data[j] == cclose) closing++;

				j++;
			}

			if (closing != opening) link_end--;
		}

		return link_end;
	}

	function check_domain(data, allow_short) {
		var i, np = 0;

		if (!isalnum(data[0])) return 0;

		for (i = 1; i < data.length - 1; ++i) {
			if (data[i] == '.') np++;
			else if (!isalnum(data[i]) && data[i] != '-') break;
		}

		/* a valid domain needs to have at least a dot.
		 * that's as far as we get */
		if (allow_short) {
			/* We don't need a valid domain in the strict sence (with
			 * at least one dot; so just make sure it's composed of valid
			 * domain characters and return the length of the valid
			 * sequence. */
			return i;
		} else {
			return np ? i : 0;
		}
	}

	function sd_autolink_issafe(link) {
		var valid_uris = [
			"http://", "https://", "ftp://", "mailto://",
		"/", "git://", "steam://", "irc://", "news://", "mumble://",
		"ssh://", "ircs://", "#"];

		var i;

		for (i = 0; i < valid_uris.length; ++i) {
			var len = valid_uris[i].length;

			if (link.length > len &&
					link.toLowerCase().indexOf(valid_uris[i]) == 0 &&
					/[A-Za-z0-9#\/?]/.test(link[len]))
				return 1;
		}

		return 0;
	}


	function sd_autolink__url(rewind_p, link, data_, offset, size, flags) {
		var data = data_.slice(offset);
		var link_end, rewind = 0, domain_len;

		if (size < 4 || data_[offset+1] != '/' || data_[offset+2] != '/') return 0;

		while (rewind < offset && isalpha(data_[offset-rewind - 1])) rewind++;

		if (!sd_autolink_issafe(data_.substr(offset-rewind, size+rewind))) return 0;
		link_end = "://".length;

		domain_len = check_domain(data.slice(link_end), flags & SD_AUTOLINK_SHORT_DOMAINS);
		if (domain_len == 0) return 0;

		link_end += domain_len;
		while (link_end < size && !isspace(data_[offset+link_end])) link_end++;

		link_end = autolink_delim(data, link_end);

		if (link_end == 0) return 0;

		//TODO
		link.s += data_.substr(offset-rewind, link_end+rewind);
		rewind_p.p = rewind;

		return link_end;
	}

	function sd_autolink__subreddit(rewind_p, link, data_, offset, size) {
		var data = data_.slice(offset);
		var link_end;
		var allMinus = false;

		if (size < 3) return 0;

		/* make sure this / is part of /r/ */
		if (data.indexOf('/r/') != 0) return 0;

		link_end = "/r/".length;
		if (data.substr(link_end-1, 4).toLowerCase() == "all-") {
			allMinus = true;
		}
		do {
			var start = link_end;
			var max_length = 24;
			/* special case: /r/reddit.com (the only subreddit with a '.') */
			if ( size >= link_end+10 && data.substr(link_end, 10).toLowerCase() == 'reddit.com') {
				link_end += 10;
				max_length = 10;
			} else {
				/* If not the special case make sure it starts with (t:)?[A-Za-z0-9] */
				/* support autolinking to timereddits, /r/t:when (1 April 2012) */
				if ( size > link_end+2 && data.substr(link_end, 2) == 't:')
					link_end += 2;  /* Jump over the 't:' */

				/* the first character of a subreddit name must be a letter or digit */
				if (!isalnum(data[link_end]))
					return 0;
				link_end += 1;
			}

			/* consume valid characters ([A-Za-z0-9_]) until we run out */
			while (link_end < size && (isalnum(data[link_end]) ||
								data[link_end] == '_'))
				link_end++;

			/* valid subreddit names are between 3 and 21 characters, with
			 * some subreddits having 2-character names. Don't bother with
			 * autolinking for anything outside this length range.
			 * (chksrname function in reddit/.../validator.py) */
			if ( link_end-start < 2 || link_end-start > max_length )
				return 0;

			/* If we are linking to a multireddit, continue */
		} while ( link_end < size && (data[link_end] == '+' || (allMinus && data[link_end] == '-')) && link_end++ );
		if (link_end < size && data[link_end] == '/') {
			while (link_end < size && (isalnum(data[link_end]) ||
					data[link_end] == '_' ||
					data[link_end] == '/' ||
					data[link_end] == '-')) {
				link_end++;
			}
		}
		/* make the link */
		link.s += data.slice(0, link_end);
		rewind_p.p = 0;

		return link_end;
	}

	function sd_autolink__username(rewind_p, link, data_, offset, size) {
		var data = data_.slice(offset);
		var link_end;

		if (size < 6) return 0;

		/* make sure this / is part of /u/ */
		if (data.indexOf('/u/') != 0) return 0;

		/* the first letter of a username must... well, be valid, we don't care otherwise */
		link_end = "/u/".length;
		if (!isalnum(data[link_end]) && data[link_end] != '_' && data[link_end] != '-')
			return 0;
		link_end += 1;

		/* consume valid characters ([A-Za-z0-9_-/]) until we run out */
		while (link_end < size && (isalnum(data[link_end]) ||
					data[link_end] == '_' ||
					data[link_end] == '/' ||
					data[link_end] == '-'))
			link_end++;

		/* make the link */
		link.s += data.slice(0, link_end);
		rewind_p.p = 0;

		return link_end;
	}

	function sd_autolink__email(rewind_p, link, data_, offset, size, flags) {
		var data = data_.slice(offset);
		var link_end, rewind;
		var nb = 0, np = 0;

		for (rewind = 0; rewind < offset; ++rewind) {
			var c = data_[offset-rewind - 1];
			if (isalnum(c)) continue;
			if (".+-_".indexOf(c) != -1) continue;
			break;
		}

		if (rewind == 0) return 0;

		for (link_end = 0; link_end < size; ++link_end) {
			var c = data_[offset+link_end];

			if (isalnum(c)) continue;

			if (c == '@') nb++;
			else if (c == '.' && link_end < size - 1) np++;
			else if (c != '-' && c != '_') break;
		}

		if (link_end < 2 || nb != 1 || np == 0) return 0;

		//TODO
		link_end = autolink_delim(data, link_end);

		if (link_end == 0) return 0;

		// link.s += data_.slice(offset - rewind, link_end + rewind
		link.s += data_.substr(offset - rewind, link_end + rewind);
		rewind_p.p = rewind;

		return link_end;
	}

	function sd_autolink__www(rewind_p, link, data_, offset, size, flags) {
		var data = data_.slice(offset);
		var link_end;

		if (offset > 0 && !ispunct(data_[offset-1]) && !isspace(data_[offset-1]))
			return 0;

		// if (size < 4 || memcmp(data, "www.", strlen("www.")) != 0)
		if (size < 4 || (data.slice(0,4) != 'www.')) return 0;

		link_end = check_domain(data, 0);

		if (link_end == 0)
			return 0;

		while (link_end < size && !isspace(data[link_end])) link_end++;

		link_end = autolink_delim(data, link_end);

		if (link_end == 0) return 0;

		link.s += data.slice(0, link_end);
		rewind_p.p = 0;

		return link_end;
	}

	/**
	Initialize a Callbacks object.

	@constructor
	@param {Object.<string, ?function>} callbacks A set of callbacks to use as the methods on this object.
	*/
	function Callbacks(callbacks) {
		if (callbacks) {
			for (var name in callbacks) {
				if (name in this) this[name] = callbacks[name];
			}
		}
	}

	Callbacks.prototype = {
		/**
		Renders a code block.

		Syntax highlighting specific to lanugage may be performed here.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {Buffer} language The name of the code langage.
		@param {?Object} context A renderer specific context object.
		*/
		blockcode: null,
		/**
		Renders a blockquote.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {?Object} context A renderer specific context object.
		*/
		blockquote: null,
		/**
		Renders a block of HTML code.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {?Object} context A renderer specific context object.
		*/
		blockhtml: null,
		/**
		Renders a header.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {Number} level The header level.
		@param {?Object} context A renderer specific context object.
		*/
		header: null,
		/**
		Renders a horizontal rule.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {?Object} context A renderer specific context object.
		*/
		hrule: null,
		/**
		Renders a list.
		<p>
		This method handles the list wrapper, which in terms of HTML would be &lt;ol&gt; or &lt;ul&gt;.
		This method is not responsible for handling list elements, all such processing should
		already have occured on text pased to the method . All that it is intended
		to do is to wrap the text parameter in anything needed.
		</p>

		@example
		out.s += "&lt;ul&gt;" + text.s + "&lt;/ul&gt;"


		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input that goes inside the list.
		@param {Number} flags A bitfield holding a portion of the render state. The only bit that this should be concerned with is MKD_LIST_ORDERED
		@param {?Object} context A renderer specific context object.
		*/
		list: null,
		/**
		Renders a list.
		<p>
		Wraps the text in a list element.
		</p>

		@example
		out.s += "&lt;li&gt;" + text.s + "&lt;/li&gt;"


		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The contents of the list element.
		@param {Number} flags A bitfield holding a portion of the render state. The only bit that this should be concerned with is MKD_LI_BLOCK.
		@param {?Object} context A renderer specific context object.
		*/
		listitem: null,
		/**
		Renders a paragraph.

		@example

		out.s += "&lt;p&gt;" + text.s + "&lt;/p&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {?Object} context A renderer specific context object.
		*/
		paragraph: null,
		/**
		Renders a table.

		@example

		out.s += "<table><thead>";
		out.s += header.s;
		out.s += "</thead><tbody>";
		out.s += body.s;
		out.s += "</tbody></table>";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} head The table header.
		@param {Buffer} body The table body.
		@param {?Object} context A renderer specific context object.
		*/
		table: null,
		/**
		Renders a table row.

		@example

		out.s += "&lt;tr&gt;" + text.s + "&lt;/tr&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {?Object} context A renderer specific context object.
		*/
		table_row: null,
		/**
		Renders a table cell.

		@example

		out.s += "&lt;td&gt;" + text.s + "&lt;/td&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {Number} flags A bit filed indicating a portion of the output state. Relevant bits are: MKD_TABLE_HEADER, MKD_TABLE_ALIGN_CENTER. MKD_TABLE_ALIGN_L, and MKD_TABLE_ALIGN_R.
		@param {?Object} context A renderer specific context object.
		*/
		table_cell: null,
		/**
		Renders a link that was autodetected.

		@example

		out.s += "&lt;a href=\""+ text.s + "\"&gt;" + text.s + "&lt;/a&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The address being linked to.
		@param {Number} type Equal to MKDA_NORMAL or MKDA_EMAIL
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		autolink: null,
		/**
		Renders inline code.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		codespan: null,
		/**
		Renders text with double emphasis. Default is equivalent to the HTML &lt;strong&gt; tag.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		double_emphasis: null,
		/**
		Renders text with single emphasis. Default is equivalent to the HTML &lt;em&gt; tag.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		emphasis: null,
		/**
		Renders an image.

		@example

		out.s = "&lt;img src=\"" + link.s + "\" title=\"" + title.s + "\"  alt=\"" + alt.s + "\"/&gt;";"

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} link The address of the image.
		@param {Buffer} title Title text for the image
		@param {Buffer} alt Alt text for the image
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		image: null,
		/**
		Renders line break.

		@example

		out.s += "&lt;br/&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		linebreak: null,
		/**
		Renders a link.

		@example

		out.s = "&lt;a href=\"" + link.s + "\" title=\"" + title.s + "\"&gt;" + content.s + "&lt;/a&gt;";

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} link The link address.
		@param {Buffer} title Title text for the link.
		@param {Buffer} content Link text.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		link: null,
		/**
		Copies and potentially escapes some HTML.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The input text.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		raw_html_tag: null,
		/**
		Renders text with triple emphasis. Default is equivalent to both the &lt;em&gt; and &lt;strong&gt; HTML tags.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		triple_emphasis: null,
		/**
		Renders text crossd out.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		strikethrough: null,
		/**
		Renders text as superscript.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		@returns {Boolean} Whether or not the tag was rendered.
		*/
		superscript: null,
		/**
		Escapes an HTML entity.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being wrapped.
		@param {?Object} context A renderer specific context object.
		*/
		entity: null,
		/**
		Renders plain text.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {Buffer} text The text being rendered.
		@param {?Object} context A renderer specific context object.
		*/
		normal_text: null,
		/**
		Creates opening boilerplate for a table of contents.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {?Object} context A renderer specific context object.
		*/
		doc_header: null,
		/**
		Creates closing boilerplate for a table of contents.

		@method
		@param {Buffer} out The output string buffer to append to.
		@param {?Object} context A renderer specific context object.
		*/
		doc_footer: null
	};


	/**
	A renderer object

	@constructor
	@param {Callbacks} callbacks The callbacks object to use for the renderer.
	@param {?Callbacks} context Renderer specific context information.
	*/
	function Renderer(callbacks, context) {
		this.callbacks = callbacks;
		this.context = context;
	}

	/**
	Instantiates a custom Renderer object.

	@param {Callbacks} callbacks The callbacks object to use for the renderer.
	@param {?Callbacks} context Renderer specific context information.
	@returns {Renderer}
	*/
	function createCustomRenderer(callbacks, context) {
		return new Renderer(callbacks, context)
	}
	exports.createCustomRenderer = createCustomRenderer;

	function defaultRenderState() {
		return {
			nofollow: 0,
			target: null,
			tocData: {
				headerCount: 0,
				currentLevel: 0,
				levelOffset: 0
			},
			toc_id_prefix: null,
			html_element_whitelist: DEFAULT_HTML_ELEMENT_WHITELIST,
			html_attr_whitelist: DEFAULT_HTML_ATTR_WHITELIST,
			flags: 0,
			//(flags != undefined?flags:HTML_SKIP_HTML | HTML_SKIP_IMAGES | HTML_SAFELINK | HTML_ESCAPE | HTML_USE_XHTML),
			/* extra callbacks */
			//	void (*link_attributes)(struct buf *ob, const struct buf *url, void *self);
			link_attributes: function link_attributes(out, url, options) {

				if (options.nofollow) out.s += ' rel="nofollow"';

				if (options.target != null) {
					out.s += ' target="' + options.target + '"';
				}
			}
		};
	}
	exports.defaultRenderState = defaultRenderState;
	/**
	Produces a renderer object that will match Reddit's output.
	@param {?Number=} flags A bitfield containing flags specific to the reddit HTML renderer. Passing undefined, null, or null value will produce reddit exact output.
	@returns {Renderer} A renderer object that will match Reddit's output.
	*/
	function getRedditRenderer(flags) {
		var state =defaultRenderState();
		if (flags == null) {
			state.flags = DEFAULT_BODY_FLAGS;
		} else {
			state.flags = flags;
		}

		var renderer = new Renderer(getRedditCallbacks() , state);
		if (renderer.context.flags & HTML_SKIP_IMAGES)
			renderer.callbacks.image = null;

		if (renderer.context.flags & HTML_SKIP_LINKS) {
			renderer.callbacks.link = null;
			renderer.callbacks.autolink = null;
		}

		if (renderer.context.flags & HTML_SKIP_HTML || renderer.context.flags & HTML_ESCAPE)
			renderer.callbacks.blockhtml = null;
		return renderer;
	}
	exports.getRedditRenderer = getRedditRenderer;

	/**
	Produces a renderer object that will match Reddit's for a table of contents.
	@returns {Renderer} A renderer object that will match Reddit's output.
	*/
	function getTocRenderer() {
		var state = defaultRenderState();
		state.flags = HTML_TOC | HTML_SKIP_HTML;
		var renderer = new Renderer(getTocCallbacks(), state);
		return renderer;
	}
	exports.getTocRenderer = getTocRenderer;

	/**
	Create a Callbacks object with the given callback table.

	@param {Object.<string, function>} callbacks A table of callbacks to place int a callbacks object.
	@returns {Callbacks} A callbacks object holding the provided callbacks.
	*/
	function createCustomCallbacks(callbacks) {
		return new Callbacks(callbacks);
	}
	exports.createCustomCallbacks = createCustomCallbacks;

	/**
	Produce a callbacks object that matches Reddit's output.
	@returns {Callbacks} A callbacks object that matches Reddit's output.
	*/
	function getRedditCallbacks(){
		return new Callbacks({
			blockcode: cb_blockcode,
			blockquote: cb_blockquote,
			blockhtml: cb_blockhtml,
			header: cb_header,
			hrule: cb_hrule,
			list: cb_list,
			listitem: cb_listitem,
			paragraph: cb_paragraph,
			table: cb_table,
			table_row: cb_table_row,
			table_cell: cb_table_cell,
			autolink: cb_autolink,
			codespan: cb_codespan,
			double_emphasis: cb_double_emphasis,
			emphasis: cb_emphasis,
			image: cb_image,
			linebreak: cb_linebreak,
			link: cb_link,
			raw_html_tag: cb_raw_html_tag,
			triple_emphasis: cb_triple_emphasis,
			strikethrough: cb_strikethrough,
			superscript: cb_superscript,
			entity: null,
			normal_text: cb_normal_text,
			doc_header: null,
			doc_footer: cb_reset_toc
		});
	}
	exports.getRedditCallbacks = getRedditCallbacks;

	/**
	Produce a callbacks object for rendering a table of contents.
	@returns {Callbacks} A callbacks object for rendering a table of contents.
	*/
	function getTocCallbacks() {
		return new Callbacks({
			blockcode: null,
			blockquote: null,
			blockhtml: null,
			header: cb_toc_header,
			hrule: null,
			list: null,
			listitem: null,
			paragraph: null,
			table: null,
			table_row: null,
			table_cell: null,
			autolink: null,
			codespan: cb_codespan,
			double_emphasis: cb_double_emphasis,
			emphasis: cb_emphasis,
			image: null,
			linebreak: null,
			link: cb_toc_link,
			raw_html_tag: null,
			triple_emphasis: cb_triple_emphasis,
			strikethrough: cb_strikethrough,
			superscript: cb_superscript,
			entity: null,
			normal_text: null,
			doc_header: null,
			doc_footer: cb_toc_finalize
		});
	}
	exports.getTocCallbacks = getTocCallbacks;

	/* block level callbacks - NULL skips the block */
	// void (*blockcode)(struct buf *ob, const struct buf *text, const struct buf *lang, void *opaque);
	function cb_blockcode(out, text, lang, options) {
		if (out.s.length) out.s += '\n';

		if (lang && lang.s.length) {
			var i, cls;
			out.s += '<pre><code class="';

			for (i = 0, cls = 0; i < lang.s.length; ++i, ++cls) {
				while (i < lang.s.length && isspace(lang.s[i]))
					i++;

				if (i < lang.s.length) {
					var org = i;
					while (i < lang.s.length && !isspace(lang.s[i])) i++;

					if (lang.s[org] == '.') org++;

					if (cls) out.s += ' ';
					escape_html(out, lang.s.slice(org, i), false);
				}
			}

			out.s += '">';
		} else
			out.s += '<pre><code>';

		if (text) escape_html(out, text.s, false);

		out.s += '</code></pre>\n';
	}

	// void (*blockquote)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_blockquote(out, text, options) {
		if (out.s.length) out.s += '\n';
		out.s += '<blockquote>\n';
		if (text) out.s += text.s;
		out.s += '</blockquote>\n';
	}

	// void (*blockhtml)(struct buf *ob,const  struct buf *text, void *opaque);
	function cb_blockhtml(out, text, options) {
		var org, sz;
		if (!text) return;
		sz = text.s.length;
		while (sz > 0 && text.s[sz - 1] == '\n') sz--;
		org = 0;
		while (org < sz && text.s[org] == '\n') org++;
		if (org >= sz) return;
		if (out.s.length) out.s += '\n';
		out.s += text.s.slice(org, sz);
		out.s += '\n';
	}

	// header(Buffer out, Buffer text, int level, void *opaque);
	function cb_header(out, text, level, options) {
		if (out.s.length) out.s += '\n';

		if (options.flags & HTML_TOC) {
			out.s += '<h' + (+level) + ' id="';
			if (options.toc_id_prefix) out.s += options.toc_id_prefix;
			out.s += 'toc_' + (options.tocData.headerCount++) + '">';
		} else {
			out.s += '<h' + (+level) + '>';
		}

		if (text) out.s += text.s;
		out.s += '</h' + (+level) + '>\n';
	}

	// void (*hrule)(struct buf *ob, void *opaque);
	function cb_hrule(out, options) {
		if (out.s.length) out.s += '\n';
		out.s += (options.flags & HTML_USE_XHTML) ? '<hr/>\n' : '<hr>\n';
	}

	// void (*list)(struct buf *ob, const struct buf *text, int flags, void *opaque);
	function cb_list(out, text, flags, options) {
		if (out.s.length) out.s += '\n';
		out.s += (flags&MKD_LIST_ORDERED?'<ol>\n':'<ul>\n');
		if (text) out.s += text.s;
		out.s += (flags&MKD_LIST_ORDERED?'</ol>\n':'</ul>\n');
	}

	// void (*listitem)(struct buf *ob, const struct buf *text, int flags, void *opaque);
	function cb_listitem(out, text, flags, options) {
		out.s += '<li>';
		if (text) {
			var size = text.s.length;
			while (size && text.s[size - 1] == '\n') size--;
			out.s += text.s.slice(0, size);
		}
		out.s += '</li>\n';
	}

	// void (*paragraph)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_paragraph(out, text, options) {
		var i = 0;

		if (out.s.length) out.s += '\n';

		if (!text || !text.s.length) return;

		while (i < text.s.length && isspace(text.s[i])) i++;

		if (i == text.s.length) return;

		out.s += '<p>';
		if (options.flags & HTML_HARD_WRAP) {
			var org;
			while (i < text.s.length) {
				org = i;
				while (i < text.s.length && text.data[i] != '\n')
					i++;

				if (i > org) out.s += text.s.slice(org, i);

				/*
				 * do not insert a line break if this newline
				 * is the last character on the paragraph
				 */
				if (i >= text.s.length - 1) break;

				cb_linebreak(out, options);
				i++;
			}
		} else {
			out.s += text.s.slice(i);
		}
		out.s += '</p>\n';
	}

	// void (*table)(struct buf *ob, const struct buf *header, const struct buf *body, void *opaque);
	function cb_table(out, header, body, options) {
		if (out.s.length) out.s += '\n';
		out.s += '<table><thead>\n';
		if (header) out.s += header.s;
		out.s += '</thead><tbody>\n';
		if (body) out.s += body.s;
		out.s += '</tbody></table>\n';
	}

	// void (*table_row)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_table_row(out, text, options) {
		out.s += '<tr>\n';
		if (text) out.s += text.s;
		out.s += '</tr>\n';
	}

	// void (*table_cell)(struct buf *ob, const struct buf *text, int flags, void *opaque);
	function cb_table_cell(out, text, flags, options) {
		if (flags & MKD_TABLE_HEADER) {
			out.s += '<th';
		} else {
			out.s += '<td';
		}

		switch (flags & MKD_TABLE_ALIGNMASK) {
			case MKD_TABLE_ALIGN_CENTER:
				out.s += ' align="center">';
				break;

			case MKD_TABLE_ALIGN_L:
				out.s += ' align="left">';
				break;

			case MKD_TABLE_ALIGN_R:
				out.s += ' align="right">';
				break;
			default:
				out.s += '>';
		}

		if (text) out.s += text.s;

		if (flags & MKD_TABLE_HEADER) {
			out.s += '</th>\n';
		} else {
			out.s += '</td>\n';
		}
	}

	/* span level callbacks - NULL or return 0 prints the span verbatim */
	// int (*autolink)(struct buf *ob, const struct buf *link, enum mkd_autolink type, void *opaque);
	function cb_autolink(out, link, type, options) {
		var offset = 0;

		if (!link || !link.s.length) return 0;

		if ((options.flags & HTML_SAFELINK) != 0 &&
				!sd_autolink_issafe(link.s) && type != MKDA_EMAIL)
			return 0;

		out.s += '<a href="';
		if (type == MKDA_EMAIL) out.s += 'mailto:';
		escape_href(out, link.s.slice(offset));

		if (options.link_attributes) {
			out.s += '"';
			options.link_attributes(out, link, options);
			out.s += '>';
		} else {
			out.s += '">';
		}

		/*
		 * Pretty printing: if we get an email address as
		 * an actual URI, e.g. `mailto:foo@bar.com`, we don't
		 * want to print the `mailto:` prefix
		 */
		if (link.s.indexOf('mailto:')==0) {
			escape_html(out, link.s.slice(7), false);
		} else {
			escape_html(out, link.s, false);
		}

		out.s += '</a>';

		return 1;
	}

	// int (*codespan)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_codespan(out, text, options) {
		out.s += '<code>';
		if (text) escape_html(out, text.s, false);
		out.s += '</code>';
		return 1;
	}

	// int (*double_emphasis)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_double_emphasis(out, text, options) {
		if (!text || !text.s.length) return 0;
		out.s += '<strong>' + text.s + '</strong>';
		return 1;
	}

	// int (*emphasis)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_emphasis(out, text, options) {
		if (!text || !text.s.length) return 0;
		out.s += '<em>' + text.s + '</em>';
		return 1;
	}

	// int (*image)(struct buf *ob, const struct buf *link, const struct buf *title, const struct buf *alt, void *opaque);
	function cb_image(out, link, title, alt, options) {
		if (!link || !link.s.length) return 0;

		out.s += '<img src="';
		escape_href(out, link.s);
		out.s += '" alt="';

		if (alt && alt.s.length) escape_html(out, alt.s, false);

		if (title && title.s.length) {
			out.s += '" title="';
			escape_html(out, title.s, false);
		}

		out.s += (options.flags&HTML_USE_XHTML?'"/>':'">');
		return 1;
	}


	// int (*linebreak)(struct buf *ob, void *opaque);
	function cb_linebreak(out, options) {
		out.s += (options.flags&HTML_USE_XHTML?'<br/>\n':'<br>\n');
		return 1;
	}

	// int (*link)(struct buf *ob, const struct buf *link, const struct buf *title, const struct buf *content, void *opaque);
	function cb_link(out, link, title, content, options) {
		if (link != null && (options.flags & HTML_SAFELINK) != 0 && !sd_autolink_issafe(link.s)) return 0;

		out.s += '<a href="';

		if (link && link.s.length) escape_href(out, link.s);

		if (title && title.s.length) {
			out.s += '" title="';
			escape_html(out, title.s, false);
		}

		if (options.link_attributes) {
			out.s += '"';
			options.link_attributes(out, link, options);
			out.s += '>';
		} else {
			out.s += '">';
		}

		if (content && content.s.length) out.s += content.s;
		out.s += '</a>';
		return 1;
	}

	// rndr_html_tag(struct buf *ob, const struct buf *text, void *opaque, char* tagname, char** whitelist, int tagtype)
	//NOT A CALLBACK!
	function rndr_html_tag(out, text, options, tagname, whitelist, tagtype) {
	    var x, z, in_str = 0, seen_equals = 0, done, reset;
	    var attr = new Buffer()
	    var c;
	    
	    out.s += '<';
	    
	    var i = 1 + tagname.length;
	    
	    if(tagtype == HTML_TAG_CLOSE) {
	    	out.s += '/';
	        i += 1;
	    }
	    
	    out.s += tagname;
	    
	    if(tagtype != HTML_TAG_CLOSE) {
	        for(;i < text.s.length; i++) {
	            c = text.s[i];
	            done = 0;
	            reset = 0;
	            
	            switch(c) {
	                case '>':
	                    if(seen_equals && !in_str) {
	                        done = 1;
	                        reset = 1;
	                    } else {
	                        reset = 1;
	                    }
	                    break;
	                case '\'':
	                case '"':
	                    if(!in_str)
	                        in_str = c;
	                    else if(in_str == c)
	                        in_str = !in_str;
	                    break;
	                default:
	                    if(!in_str) {
	                        switch(c) {
	                            case ' ':
	                                if(seen_equals) {
	                                    done = 1;
	                                    reset = 1;
	                                } else
	                                    reset = 1;
	                                break;
	                            case '=':
	                                if(seen_equals) {
	                                    reset = 1;
	                                } else {
	                                    for(z=0; z < whitelist.length; z++) {
	                                        if(whitelist[z].length != attr.s.length)
	                                            continue;
	                                        for(x=0;x < attr.s.length; x++) {
	                                            if(whitelist[z][x].toLowerCase() != attr.s[x].toLowerCase())
	                                                break;
	                                        }
	                                        if(x == attr.s.length)
	                                            seen_equals = 1;
	                                    }
	                                    if(!seen_equals)
	                                        reset = 1;
	                                }
	                                break;
	                        }
	                    }
	            }
	            
	            if(done) {
	            	out.s += ' ' + attr.s;
	            }
	            
	            if(reset) {
	                seen_equals = 0;
	                in_str = 0;
	                attr.s = '';
	            } else {
	                attr.s += c;
	            }
	        }
	    }
	    
	    // bufrelease(attr);
	    out.s += '>';
	}

	// int (*raw_html_tag)(struct buf *ob, const struct buf *tag, void *opaque);
	function cb_raw_html_tag(out, text, options) {
		var whitelist = options.html_element_whitelist;

	    /* Items on the whitelist ignore all other flags and just output */
		if (((options.flags & HTML_ALLOW_ELEMENT_WHITELIST) != 0) && whitelist) {
		    for(var i = 0; whitelist[i]; i++) {
		        var tagtype = sdhtml_is_tag(text.s, whitelist[i]);
		        if(tagtype != HTML_TAG_NONE) {
		            rndr_html_tag(out, text, options, whitelist[i], options.html_attr_whitelist, tagtype);
		            return 1;
		        }
		    }
		}

		/* HTML_ESCAPE overrides SKIP_HTML, SKIP_STYLE, SKIP_LINKS and SKIP_IMAGES
		 * It doens't see if there are any valid tags, just escape all of them. */
		if((options.flags & HTML_ESCAPE) != 0) {
			escape_html(out, text.s, false);
			return 1;
		}

		if ((options.flags & HTML_SKIP_HTML) != 0) return 1;

		if ((options.flags & HTML_SKIP_STYLE) != 0 &&
				sdhtml_is_tag(text.s, "style"))
			return 1;

		if ((options.flags & HTML_SKIP_LINKS) != 0 &&
				sdhtml_is_tag(text.s, "a"))
			return 1;

		if ((options.flags & HTML_SKIP_IMAGES) != 0 &&
				sdhtml_is_tag(text.s, "img"))
			return 1;

		out.s += text.s;
		return 1;
	}

	// int (*triple_emphasis)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_triple_emphasis(out, text, options) {
		if (!text || !text.s.length) return 0;
		out.s += '<strong><em>' + text.s + '</em></strong>';
		return 1;
	}

	// int (*strikethrough)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_strikethrough(out, text, options) {
		if (!text || !text.s.length) return 0;
		out.s += '<del>' + text.s + '</del>';
		return 1;
	}

	// int (*superscript)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_superscript(out, text, options) {
		if (!text || !text.s.length) return 0;
		out.s += '<sup>' + text.s + '</sup>';
		return 1;
	}

	/* low level callbacks - NULL copies input directly into the output */
	//do not use
	// void (*entity)(struct buf *ob, const struct buf *entity, void *opaque);
	// function cb_entity(out, entity, options) {}

	// void (*normal_text)(struct buf *ob, const struct buf *text, void *opaque);
	function cb_normal_text(out, text, options) {
		if (text) escape_html(out, text.s, false);
	}

	// toc_header(struct buf *ob, const struct buf *text, int level, void *opaque)
	function cb_toc_header(out, text, level, options) {
		/* set the level offset if this is the first header
		 * we're parsing for the document */
		if (options.tocData.currentLevel== 0) {
			out.s += '<div class="toc">\n';
			options.tocData.levelOffset = level - 1;
		}
		level -= options.tocData.levelOffset;

		if (level > options.tocData.currentLevel) {
			while (level > options.tocData.currentLevel) {
				out.s += '<ul>\n<li>\n';
				options.tocData.currentLevel++;
			}
		} else if (level < options.tocData.currentLevel) {
			out.s += '</li>\n';
			while (level < options.tocData.currentLevel) {
				out.s += '</ul>\n</li>\n';
				options.tocData.currentLevel--;
			}
			out.s += '<li>\n';
		} else {
			out.s += '</li>\n<li>\n';
		}

		out.s += '<a href="#';
		if (options.toc_id_prefix) out.s += options.toc_id_prefix;
		out.s += 'toc_' + (options.tocData.headerCount++) + '">';
		if (text) escape_html(out, text.s, false);
		out.s += '</a>\n';
	}

	//toc_link(struct buf *ob, const struct buf *link, const struct buf *title, const struct buf *content, void *opaque)
	function cb_toc_link(out, link, title, content, options) {
		if (content && content.s) 
			out.s += content.s;
		return 1;
	}


	// reset_toc(struct buf *ob, void *opaque)
	function cb_reset_toc(out, options) {
		options.tocData = {
			headerCount: 0,
			currentLevel: 0,
			levelOffset: 0
		};
	}

	//toc_finalize(struct buf *ob, void *opaque)
	function cb_toc_finalize(out, options) {
		var hasToc = false;
		while (options.tocData.currentLevel > 0) {
			out.s += '</li>\n</ul>\n';
			options.tocData.currentLevel--;
			hasToc = true;
		}
		if (hasToc) {
			out.s += '</div>\n';
		}
		cb_reset_toc(out, options);
	}

	/* header and footer */
	// doc_header(Buffer out}, context);
	//		doc_header: null,
	//	doc_footer(Buffer out, context);
	//		doc_footer: null


	/* char_emphasis • single and double emphasis parsing */
	//Buffer, md, str, int
	function char_emphasis(out, md, data_, offset) {
		var data = data_.slice(offset);
		var size = data.length;
		var c = data[0];
		var ret;

		if (size > 2 && data[1] != c) {
			/* whitespace cannot follow an opening emphasis;
			 * strikethrough only takes two characters '~~' */
			if (c == '~' || _isspace(data[1]) || (ret = parse_emph1(out, md, data, c)) == 0)
				return 0;

			return ret + 1;
		}

		if (data.length > 3 && data[1] == c && data[2] != c) {
			if (_isspace(data[2]) || (ret = parse_emph2(out, md, data, c)) == 0)
				return 0;

			return ret + 2;
		}

		if (data.length > 4 && data[1] == c && data[2] == c && data[3] != c) {
			if (c == '~' || _isspace(data[3]) || (ret = parse_emph3(out, md, data, c)) == 0)
				return 0;

			return ret + 3;
		}

		return 0;
	}

	/* char_codespan - '`' parsing a code span (assuming codespan != 0) */
	function char_codespan(out, md, data_, offset) {
		var data = data_.slice(offset);
		var end, nb = 0, i, f_begin, f_end;

		/* counting the number of backticks in the delimiter */
		while (nb < data.length && data[nb] == '`')
			nb++;

		/* finding the next delimiter */
		i = 0;
		for (end = nb; end < data.length && i < nb; end++) {
			if (data[end] == '`') i++;
			else i = 0;
		}

		if (i < nb && end >= data.length)
			return 0; /* no matching delimiter */

		/* trimming outside whitespaces */
		f_begin = nb;
		while (f_begin < end && data[f_begin] == ' ') f_begin++;

		f_end = end - nb;
		while (f_end > nb && data[f_end-1] == ' ') f_end--;

		/* real code span */
		if (f_begin < f_end) {
			var work = new Buffer(data.slice(f_begin, f_end));
			if (!md.callbacks.codespan(out, work, md.context))
				end = 0;
		} else {
			if (!md.callbacks.codespan(out, null, md.context))
				end = 0;
		}

		return end;
	}

	/* char_linebreak - '\n' preceded by two spaces (assuming linebreak != 0) */
	function char_linebreak(out, md, data_, offset) {
		var data = data_.slice(offset);
		if (offset < 2 || data_[offset-1] != ' ' || data_[offset-2] != ' ')
			return 0;

		/* removing the last space from ob and rendering */
		var len = out.s.length;
		while (len && out.s[len - 1] == ' ') len--;
		out.s = out.s.slice(0, len);

		return md.callbacks.linebreak(out, md.context) ? 1 : 0;
	}

	/* char_link - '[': parsing a link or an image */
	function char_link(out, md, data_, offset) {
		var data = data_.slice(offset);
		var is_img = (offset && data_[offset - 1] == '!'), level;
		var i = 1, txt_e, link_b = 0, link_e = 0, title_b = 0, title_e = 0;
		//4 bufs
		var content = null;
		var link = null;
		var title = null;
		var u_link = null;
		var org_work_size = md.spanStack.length;
		var text_has_nl = 0, ret = 0;
		var in_title = 0, qtype = 0;

		function cleanup() {
			md.spanStack.length = org_work_size;
			return ret ? i : 0;
		}

		/* checking whether the correct renderer exists */
		if ((is_img && !md.callbacks.image) || (!is_img && !md.callbacks.link))
				return cleanup();
		/* looking for the matching closing bracket */
		for (level = 1; i < data.length; i++) {
			if (data[i] == '\n') text_has_nl = 1;
			else if (data[i - 1] == '\\') continue;
			else if (data[i] == '[') level++;
			else if (data[i] == ']') {
				level--;
				if (level <= 0) break;
			}
		}

		if (i >= data.length) return cleanup();

		txt_e = i;
		i++;

		/* skip any amount of whitespace or newline */
		/* (this is much more laxist than original markdown syntax) */
		while (i < data.length && _isspace(data[i])) i++;

		/* inline style link */
		if (i < data.length && data[i] == '(') {
			/* skipping initial whitespace */
			i++;

			while (i < data.length && _isspace(data[i])) i++;

			link_b = i;

			/* looking for link end: ' " ) */
			while (i < data.length) {
				if (data[i] == '\\') i += 2;
				else if (data[i] == ')') break;
				else if (i >= 1 && _isspace(data[i-1]) && (data[i] == '\'' || data[i] == '"')) break;
				else i++;
			}

			if (i >= data.length) return cleanup();
			link_e = i;

			/* looking for title end if present */
			if (data[i] == '\'' || data[i] == '"') {
				qtype = data[i];
				in_title = 1;
				i++;
				title_b = i;

				while (i < data.length) {
					if (data[i] == '\\') i += 2;
					else if (data[i] == qtype) {in_title = 0; i++;}
					else if ((data[i] == ')') && !in_title) break;
					else i++;
				}

				if (i >= data.length) return cleanup();

				/* skipping whitespaces after title */
				title_e = i - 1;
				while (title_e > title_b && _isspace(data[title_e])) title_e--;

				/* checking for closing quote presence */
				if (data[title_e] != '\'' &&  data[title_e] != '"') {
					title_b = title_e = 0;
					link_e = i;
				}
			}

			/* remove whitespace at the end of the link */
			while (link_e > link_b && _isspace(data[link_e - 1])) link_e--;

			/* remove optional angle brackets around the link */
			if (data[link_b] == '<') link_b++;
			if (data[link_e - 1] == '>') link_e--;

			/* building escaped link and title */
			if (link_e > link_b) {
				link = new Buffer();
				md.spanStack.push(link);
				link.s += data.slice(link_b, link_e);
			}

			if (title_e > title_b) {
				title = new Buffer();
				md.spanStack.push(title);
				title.s += data.slice(title_b, title_e);
			}

			i++;
		}

		/* reference style link */
		else if (i < data.length && data[i] == '[') {
			var id = new Buffer();
			var lr = null;

			/* looking for the id */
			i++;
			link_b = i;
			while (i < data.length && data[i] != ']') i++;
			if (i >= data.length) return cleanup();
			link_e = i;

			/* finding the link_ref */
			if (link_b == link_e) {
				if (text_has_nl) {
					var b = new Buffer();
					md.spanStack.push(b);
					var j;

					for (j = 1; j < txt_e; j++) {
						if (data[j] != '\n')
							b.s += data[j];
						else if (data[j - 1] != ' ')
							b.s += ' ';
					}

					id.s = b.s;
				} else {
					id.s = data.slice(1);
				}
			} else {
				id.s = data.slice(link_b, link_e);
			}

			//TODO
			lr = md.refs[id.s];
			if (!lr) return cleanup();

			/* keeping link and title from link_ref */
			link = lr.link;
			title = lr.title;
			i++;
		}

		/* shortcut reference style link */
		else {
			var id = new Buffer();
			var lr = null;

			/* crafting the id */
			if (text_has_nl) {
				var b = new Buffer();
				md.spanStack.push(b);

				var j;
				for (j = 1; j < txt_e; j++) {
					if (data[j] != '\n') b.s += data[j];
					else if (data[j - 1] != ' ') b.s += ' ';
				}

				id.s = b.s;
			} else {
				id.s = data.slice(1, txt_e);
			}

			/* finding the link_ref */
			lr = md.refs[id.s];
			if (!lr) return cleanup();

			/* keeping link and title from link_ref */
			link = lr.link;
			title = lr.title;

			/* rewinding the whitespace */
			i = txt_e + 1;
		}

		/* building content: img alt is escaped, link content is parsed */
		if (txt_e > 1) {
			content = new Buffer();
			md.spanStack.push(content);
			if (is_img) {
				content.s += data.slice(1, txt_e);
			} else {
				/* disable autolinking when parsing inline the
				 * content of a link */
				md.inLinkBody = 1;
				parse_inline(content, md, data.slice(1, txt_e));
				md.inLinkBody = 0;
			}
		}

		if (link) {
			u_link = new Buffer();
			md.spanStack.push(u_link);
			unscape_text(u_link, link);
		} else {
			return cleanup();
		}

		/* calling the relevant rendering function */
		if (is_img) {
			if (out.s.length && out.s[out.s.length - 1] == '!')
				out.s = out.s.slice(0, -1);

			ret = md.callbacks.image(out, u_link, title, content, md.context);
		} else {
			ret = md.callbacks.link(out, u_link, title, content, md.context);
		}

		/* cleanup */
		// cleanup:
		// 	rndr->work_bufs[BUFFER_SPAN].size = (int)org_work_size;
		// return ret ? i : 0;
		return cleanup();
	}


	/* char_langle_tag - '<' when tags or autolinks are allowed */
	function char_langle_tag(out, md, data_, offset) {
		var data = data_.slice(offset);
		var altype = {p:MKDA_NOT_AUTOLINK};
		var end = tag_length(data, altype);
		var work = new Buffer(data.slice(0, end));
		var ret = 0;

		if (end > 2) {
			if (md.callbacks.autolink && altype.p != MKDA_NOT_AUTOLINK) {
				var u_link = new Buffer();
				md.spanStack.push(u_link);
				work.s = data.substr(1 , end - 2);
				unscape_text(u_link, work);
				ret = md.callbacks.autolink(out, u_link, altype.p, md.context);
				md.spanStack.pop();
			}
			else if (md.callbacks.raw_html_tag)
				ret = md.callbacks.raw_html_tag(out, work, md.context);
		}

		if (!ret) return 0;
		else return end;
	}


	/* char_escape - '\\' backslash escape */
	function char_escape(out, md, data_, offset) {
		var data = data_.slice(offset);
		var escape_chars = "\\`*_{}[]()#+-.!:|&<>/^~";
		var work = new Buffer();

		if (data.length > 1) {
			if (escape_chars.indexOf(data[1]) == -1) return 0;

			if (md.callbacks.normal_text) {
				work.s = data[1];
				md.callbacks.normal_text(out, work, md.context);
			}
			else out.s += data[1];
		} else if (data.length == 1) {
			out.s += data[0];
		}

		return 2;
	}



	/* char_entity - '&' escaped when it doesn't belong to an entity */
	/* valid entities are assumed to be anything matching &#?[A-Za-z0-9]+; */
	function char_entity(out, md, data_, offset) {
		var data = data_.slice(offset);
		var end = 1;
		var work = new Buffer();

		if (end < data.length && data[end] == '#') end++;

		while (end < data.length && isalnum(data[end])) end++;

		if (end < data.length && data[end] == ';') end++; /* real entity */
		else return 0; /* lone '&' */

		if (md.callbacks.entity) {
			work.s = data.slice(0, end);
			md.callbacks.entity(out, work, md.context);
		}
		else out.s += data.slice(0, end);

		return end;
	}

	function char_autolink_url(out, md, data_, offset) {
		var data = data_.slice(offset);
		var link = null;
		var link_len, rewind = {p: null};

		if (!md.callbacks.autolink || md.inLinkBody) return 0;

		link = new Buffer();
		md.spanStack.push(link);

		if ((link_len = sd_autolink__url(rewind, link, data_, offset, data.length, 0)) > 0) {
			if (rewind.p > 0) out.s = out.s.slice(0, -rewind.p);
			md.callbacks.autolink(out, link, MKDA_NORMAL, md.context);
		}

		md.spanStack.pop();
		return link_len;
	}


	function char_autolink_email(out, md, data_, offset) {
		var data = data_.slice(offset);
		var link = null;
		var link_len, rewind = {p: null};

		if (!md.callbacks.autolink || md.inLinkBody) return 0;

		link = new Buffer();
		md.spanStack.push(link);

		if ((link_len = sd_autolink__email(rewind, link, data_, offset, data.length, 0)) > 0) {
			if (rewind.p > 0) out.s = out.s.slice(0, -rewind.p);
			md.callbacks.autolink(out, link, MKDA_EMAIL, md.context);
		}

		md.spanStack.pop();
		return link_len;
	}


	function char_autolink_www(out, md, data_, offset) {
		var data = data_.slice(offset);
		var link = null, link_url = null, link_text = null;
		var link_len, rewind = {p: null};

		if (!md.callbacks.link || md.inLinkBody) return 0;

		link = new Buffer();
		md.spanStack.push(link);

		if ((link_len = sd_autolink__www(rewind, link, data_, offset, data.length, 0)) > 0) {
			link_url = new Buffer();
			md.spanStack.push(link_url);
			link_url.s += 'http://';
			link_url.s += link.s;

			if (rewind.p > 0) out.s = out.s.slice(0, out.s.length-rewind.p);
			if (md.callbacks.normal_text) {
				link_text = new Buffer();
				md.spanStack.push(link_text);
				md.callbacks.normal_text(link_text, link, md.context);
				md.callbacks.link(out, link_url, null, link_text, md.context);
				md.spanStack.pop();
			} else {
				md.callbacks.link(out, link_url, null, link, md.context);
			}
			md.spanStack.pop();
		}

		md.spanStack.pop();
		return link_len;
	}

	function char_autolink_subreddit_or_username(out, md, data_, offset) {
		var data = data_.slice(offset);
		var link = null;
		var link_len, rewind = {p: null};

		if (!md.callbacks.autolink || md.inLinkBody) return 0;

		link = new Buffer();
		md.spanStack.push(link);
		if ((link_len = sd_autolink__subreddit(rewind, link, data_, offset, data.length)) > 0) {
			//don't slice because the rewind pointer will always be 0
			if (rewind.p > 0) out.s = out.s.slice(0, -rewind.p);
			md.callbacks.autolink(out, link, MKDA_NORMAL, md.context);
		} else if ((link_len = sd_autolink__username(rewind, link, data_, offset, data.length)) > 0) {
			//don't slice because the rewind pointer will always be 0
			if (rewind.p > 0) out.s = out.s.slice(0, -rewind.p);
			md.callbacks.autolink(out, link, MKDA_NORMAL, md.context);
		}
		md.spanStack.pop();

		return link_len;
	}

	function char_superscript(out, md, data_, offset) {
		var data = data_.slice(offset);
		var size = data.length;
		var sup_start, sup_len;
		var sup = null;

		if (!md.callbacks.superscript) return 0;

		if (size < 2) return 0;

		if (data[1] == '(') {
			sup_start = sup_len = 2;

			while (sup_len < size && data[sup_len] != ')' && data[sup_len - 1] != '\\') sup_len++;

			if (sup_len == size) return 0;
		} else {
			sup_start = sup_len = 1;

			while (sup_len < size && !_isspace(data[sup_len])) sup_len++;
		}

		if (sup_len - sup_start == 0) return (sup_start == 2) ? 3 : 0;

		sup = new Buffer();
		md.spanStack.push(sup);
		parse_inline(sup, md, data.slice(sup_start, sup_len));
		md.callbacks.superscript(out, sup, md.context);
		md.spanStack.pop();

		return (sup_start == 2) ? sup_len + 1 : sup_len;
	}


	var  markdown_char_ptrs = [
		null,
		char_emphasis,
		char_codespan,
		char_linebreak,
		char_link,
		char_langle_tag,
		char_escape,
		char_entity,
		char_autolink_url,
		char_autolink_email,
		char_autolink_www,
		char_autolink_subreddit_or_username,
		char_superscript
	];

	var MKD_LIST_ORDERED = 1;
	var MKD_LI_BLOCK = 2; /* <li> containing block data */
	var MKD_LI_END = 8; /* internal list flag */

	var enumCounter = 0;
	var MD_CHAR_NONE = enumCounter++;
	var MD_CHAR_EMPHASIS = enumCounter++;
	var MD_CHAR_CODESPAN = enumCounter++;
	var MD_CHAR_LINEBREAK = enumCounter++;
	var MD_CHAR_LINK = enumCounter++;
	var MD_CHAR_LANGLE = enumCounter++;
	var MD_CHAR_ESCAPE = enumCounter++;
	var MD_CHAR_ENTITITY = enumCounter++;
	var MD_CHAR_AUTOLINK_URL = enumCounter++;
	var MD_CHAR_AUTOLINK_EMAIL = enumCounter++;
	var MD_CHAR_AUTOLINK_WWW = enumCounter++;
	var MD_CHAR_AUTOLINK_SUBREDDIT_OR_USERNAME = enumCounter++;
	var MD_CHAR_SUPERSCRIPT = enumCounter++;

	var SD_AUTOLINK_SHORT_DOMAINS = (1 << 0);

	enumCounter = 0;
	var MKDA_NOT_AUTOLINK = enumCounter++;	/* used internally when it is not an autolink*/
	var MKDA_NORMAL = enumCounter++;		/* normal http/http/ftp/mailto/etc link */
	var MKDA_EMAIL = enumCounter++;			/* e-mail link without explit mailto: */

	var MKDEXT_NO_INTRA_EMPHASIS = (1 << 0);
	var MKDEXT_TABLES = (1 << 1);
	var MKDEXT_FENCED_CODE = (1 << 2);
	var MKDEXT_AUTOLINK = (1 << 3);
	var MKDEXT_STRIKETHROUGH = (1 << 4);
	// var MKDEXT_LAX_HTML_BLOCKS = (1 << 5);
	var MKDEXT_SPACE_HEADERS = (1 << 6);
	var MKDEXT_SUPERSCRIPT = (1 << 7);
	var MKDEXT_LAX_SPACING = (1 << 8)

	var HTML_SKIP_HTML = (1 << 0);
	var HTML_SKIP_STYLE = (1 << 1);
	var HTML_SKIP_IMAGES = (1 << 2);
	var HTML_SKIP_LINKS = (1 << 3);
	var HTML_EXPAND_TABS = (1 << 4);
	var HTML_SAFELINK = (1 << 5);
	var HTML_TOC = (1 << 6);
	var HTML_HARD_WRAP = (1 << 7);
	var HTML_USE_XHTML = (1 << 8);
	var HTML_ESCAPE = (1 << 9);
	var HTML_ALLOW_ELEMENT_WHITELIST = (1 << 10);

	var MKD_TABLE_ALIGN_L = 1;
	var MKD_TABLE_ALIGN_R = 2;
	var MKD_TABLE_ALIGN_CENTER = 3;
	var MKD_TABLE_ALIGNMASK = 3;
	var MKD_TABLE_HEADER = 4

	var HTML_TAG_NONE = 0;
	var HTML_TAG_OPEN = 1;
	var HTML_TAG_CLOSE = 2;


	/**
	 * A string buffer wrapper because JavaScript doesn't have mutable strings.
	 * @constructor
	 * @param {string=} str Optional string to initialize the Buffer with.
	 */
	function Buffer(str) {
		this.s = str || "";
	};
	// Buffer.prototype.toString = function toString() {
		// return this.s;
	// };
	// Buffer.prototype.slice 


	/**
	 * A Markdown parser object.
	 * @constructor
	 */
	function Markdown() {

		//Becase javascript strings are immutable they must be wrapped with Buffer()
		this.spanStack = [];
		this.blockStack = [];
		this.extensions = MKDEXT_NO_INTRA_EMPHASIS | MKDEXT_SUPERSCRIPT | MKDEXT_AUTOLINK | MKDEXT_STRIKETHROUGH | MKDEXT_TABLES;
		var renderer = getRedditRenderer();
		this.context = renderer.context;
		this.callbacks = renderer.callbacks;
		this.inLinkBody = 0;
		this.activeChars = {};
		this.refs = {};
		this.nestingLimit = 16;
	};


	/* is_empty - returns the line length when it is empty, 0 otherwise */
	function is_empty(data) {
		var i;
		for (i = 0; i < data.length && data[i] != '\n'; i++)
			if (data[i] != ' ') return 0;

		return i + 1;
	}


	/* is_hrule - returns whether a line is a horizontal rule */
	function is_hrule(data) {
		var i = 0, n = 0;
		var c;

		/* skipping initial spaces */
		if (data.length < 3) return 0;
		if (data[0] == ' ') { i++;
		if (data[1] == ' ') { i++;
		if (data[2] == ' ') { i++; } } }

		/* looking at the hrule uint8_t */
		if (i + 2 >= data.length
				|| (data[i] != '*' && data[i] != '-' && data[i] != '_'))
			return 0;
		c = data[i];

		/* the whole line must be the char or whitespace */
		while (i < data.length && data[i] != '\n') {
			if (data[i] == c) n++;
			else if (data[i] != ' ')
				return 0;

			i++;
		}

		return n >= 3;
	}


	/* check if a line begins with a code fence; return the
	 * width if it is */
	function prefix_codefence(data) {
		var i = 0, n = 0;
		var c;

		/* skipping initial spaces */
		if (data.length < 3) return 0;
		if (data[0] == ' ') { i++;
		if (data[1] == ' ') { i++;
		if (data[2] == ' ') { i++; } } }

		/* looking at the hrule uint8_t */
		if (i + 2 >= data.length || !(data[i] == '~' || data[i] == '`'))
			return 0;

		c = data[i];

		/* the whole line must be the uint8_t or whitespace */
		while (i < data.length && data[i] == c) {
			n++; i++;
		}

		if (n < 3) return 0;

		return i;
	}

	/* check if a line is a code fence; return its size if it */
	function is_codefence(data, syntax) {
		var i = 0, syn_len = 0;
		i = prefix_codefence(data);
		if (i == 0) return 0;


		while (i < data.length && data[i] == ' ') i++;

		var syn_start;
		//syn_start = data + i;
		syn_start = i;

		if (i < data.length && data[i] == '{') {
			i++; syn_start++;

			while (i < data.length && data[i] != '}' && data[i] != '\n') {
				syn_len++; i++;
			}

			if (i == data.length || data[i] != '}')
				return 0;

			/* strip all whitespace at the beginning and the end
			 * of the {} block */
			/*remember not to remove the +0, it helps me keep syncronised with snudown*/
			while (syn_len > 0 && _isspace(data[syn_start+0])) {
				syn_start++; syn_len--;
			}

			// while (syn_len > 0 && _isspace(syn_start[syn_len - 1]))
			while (syn_len > 0 && _isspace(data[syn_start+syn_len - 1]))
				syn_len--;

			i++;
		} else {
			while (i < data.length && !_isspace(data[i])) {
				syn_len++; i++;
			}
		}

		if (syntax) syntax.s = data.substr(syn_start, syn_len);
		// syntax->size = syn;

		while (i < data.length && data[i] != '\n') {
			if (!_isspace(data[i])) return 0;

			i++;
		}

		return i + 1;
	}

	/* find_emph_char - looks for the next emph uint8_t, skipping other constructs */
	function find_emph_char(data, c) {
		var i = 1;
		while (i < data.length) {
			while (i < data.length && data[i] != c && data[i] != '`' && data[i] != '[')
				i++;

			if (i == data.length) return 0;

			if (data[i] == c)
				return i;

			/* not counting escaped chars */
			if (i && data[i - 1] == '\\') {
				i++; continue;
			}

			if (data[i] == '`') {
				var span_nb = 0, bt;
				var tmp_i = 0;

				/* counting the number of opening backticks */
				while (i < data.length && data[i] == '`') {
					i++; span_nb++;
				}

				if (i >= data.length) return 0;

				/* finding the matching closing sequence */
				bt = 0;
				while (i < data.length && bt < span_nb) {
					if (!tmp_i && data[i] == c) tmp_i = i;
					if (data[i] == '`') bt++;
					else bt = 0;
					i++;
				}

				if (i >= data.length) return tmp_i;
			}
			/* skipping a link */
			else if (data[i] == '[') {
				var tmp_i = 0;
				var cc;

				i++;
				while (i < data.length && data[i] != ']') {
					if (!tmp_i && data[i] == c) tmp_i = i;
					i++;
				}

				i++;
				while (i < data.length && (data[i] == ' ' || data[i] == '\n'))
					i++;

				if (i >= data.length) return tmp_i;

				switch (data[i]) {
				case '[':
					cc = ']'; break;

				case '(':
					cc = ')'; break;

				default:
					if (tmp_i)
						return tmp_i;
					else
						continue;
				}

				i++;
				while (i < data.length && data[i] != cc) {
					if (!tmp_i && data[i] == c) tmp_i = i;
					i++;
				}

				if (i >= data.length) return tmp_i;
				i++;
			}
		}

		return 0;
	}

	/* parse_emph1 - parsing single emphase */
	/* closed by a symbol not preceded by whitespace and not followed by symbol */
	function parse_emph1(out, md, data_, c) {
		var data = data_.slice(1);
		var i = 0, len;
		var r;

		if (!md.callbacks.emphasis) return 0;

		/* skipping one symbol if coming from emph3 */
		if (data.length > 1 && data[0] == c && data[1] == c) i = 1;

		while (i < data.length) {
			len = find_emph_char(data.slice(i), c);
			if (!len) return 0;
			i += len;
			if (i >= data.length) return 0;

			if (data[i] == c && !_isspace(data[i - 1])) {
				if ((md.extensions & MKDEXT_NO_INTRA_EMPHASIS) && (c == '_')) {
					if (!(i + 1 == data.length || _isspace(data[i + 1]) || ispunct(data[i + 1])))
						continue;
				}

				var work = new Buffer();
				md.spanStack.push(work);
				parse_inline(work, md, data.slice(0, i));
				r = md.callbacks.emphasis(out, work, md.context);
				md.spanStack.pop();
				return r ? i + 1 : 0;
			}
		}

		return 0;
	}

	/* parse_emph2 - parsing single emphase */
	function parse_emph2(out, md, data_, c) {
		var data = data_.slice(2);
		var i = 0, len;
		var r;

		var render_method = (c == '~') ? md.callbacks.strikethrough : md.callbacks.double_emphasis;

		if (!render_method) return 0;

		while (i < data.length) {
			len = find_emph_char(data.slice(i), c);
			if (!len) return 0;
			i += len;

			if (i + 1 < data.length && data[i] == c && data[i + 1] == c && i && !_isspace(data[i - 1])) {
				var work = new Buffer();
				md.spanStack.push(work);
				parse_inline(work, md, data.slice(0, i));
				r = render_method(out, work, md.context);
				md.spanStack.pop();
				return r ? i + 2 : 0;
			}
			i++;
		}
		return 0;
	}

	/* parse_emph3 • parsing single emphase */
	/* finds the first closing tag, and delegates to the other emph */
	function parse_emph3(out, md, data_, c) {
		var data = data_.slice(3);
		var i = 0, len;
		var r;

		while (i < data.length) {
			len = find_emph_char(data.slice(i), c);
			if (!len) return 0;
			i += len;

			/* skip whitespace preceded symbols */
			if (data[i] != c || _isspace(data[i - 1])) continue;

			if (i + 2 < data.length && data[i + 1] == c && data[i + 2] == c && md.callbacks.triple_emphasis) {
				/* triple symbol found */
				var work = new Buffer();
				md.spanStack.push(work);
				parse_inline(work, md, data.slice(0, i));
				r = md.callbacks.triple_emphasis(out, work, md.context);
				md.spanStack.pop();
				return r ? i + 3 : 0;

			} else if (i + 1 < data.length && data[i + 1] == c) {
				/* double symbol found, handing over to emph1 */
				len = parse_emph1(out, md, data_, c);
				if (!len) return 0;
				else return len - 2;

			} else {
				/* single symbol found, handing over to emph2 */
				len = parse_emph2(out, md, data_, c);
				if (!len) return 0;
				else return len - 1;
			}
		}
		return 0;
	}

	function is_atxheader(md, data) {
		if (data[0] != '#') return false;

		if (md.extensions & MKDEXT_SPACE_HEADERS) {
			var level = 0;

			while (level < data.length && level < 6 && data[level] == '#')
				level++;

			if (level < data.length && data[level] != ' ')
				return false;
		}

		return true;
	}


	/* is_headerline . returns whether the line is a setext-style hdr underline */
	function is_headerline(data) {
		var i = 0;
		var size = data.length;

		/* test of level 1 header */
		if (data[i] == '=') {
			for (i = 1; i < size && data[i] == '='; i++) {}
			while (i < size && data[i] == ' ') i++;
			return (i >= size || data[i] == '\n') ? 1 : 0; }

		/* test of level 2 header */
		if (data[i] == '-') {
			for (i = 1; i < size && data[i] == '-'; i++) {}
			while (i < size && data[i] == ' ') i++;
			return (i >= size || data[i] == '\n') ? 2 : 0; }

		return 0;
	}

	function is_next_headerline(data) {
		var size = data.length;
		var i = 0;

		while (i < size && data[i] != '\n') i++;

		if (++i >= size) return 0;

		return is_headerline(data.slice(i));
	}

	/* prefix_quote - returns blockquote prefix length */
	function prefix_quote(data) {
		var i = 0;
		var size = data.length;
		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;

		if (i < size && data[i] == '>') {
			if (i + 1 < size && data[i + 1] == ' ')
				return i + 2;

			return i + 1;
		}

		return 0;
	}

	/* prefix_code • returns prefix length for block code*/
	function prefix_code(data) {
		if (data.length > 3 && data[0] == ' ' && data[1] == ' '
				&& data[2] == ' ' && data[3] == ' ') return 4;

		return 0;
	}

	/* prefix_oli - returns ordered list item prefix */
	function prefix_oli(data) {
		var size = data.length;
		var i = 0;

		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;

		if (i >= size || data[i] < '0' || data[i] > '9') return 0;

		while (i < size && data[i] >= '0' && data[i] <= '9') i++;

		if (i + 1 >= size || data[i] != '.' || data[i + 1] != ' ') return 0;

		if (is_next_headerline(data.slice(i))) return 0;

		return i + 2;
	}

	/* prefix_uli - returns ordered list item prefix */
	function prefix_uli(data) {
		var size = data.length;
		var i = 0;

		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;
		if (i < size && data[i] == ' ') i++;

		if (i + 1 >= size ||
				(data[i] != '*' && data[i] != '+' && data[i] != '-') ||
				data[i + 1] != ' ')
			return 0;

		if (is_next_headerline(data.slice(i))) return 0;

		return i + 2;
	}

	/* is_mail_autolink - looks for the address part of a mail autolink and '>' */
	/* this is less strict than the original markdown e-mail address matching */
	function is_mail_autolink(data) {
		var i = 0, nb = 0;

		/* address is assumed to be: [-@._a-zA-Z0-9]+ with exactly one '@' */
		for (i = 0; i < data.length; ++i) {
			if (isalnum(data[i]))
				continue;

			switch (data[i]) {
				case '@':
					nb++;

				case '-':
				case '.':
				case '_':
					break;

				case '>':
					return (nb == 1) ? i + 1 : 0;

				default:
					return 0;
			}
		}

		return 0;
	}

	/* tag_length - returns the length of the given tag, or 0 is it's not valid */
	function tag_length(data, autolink) {
		var i, j;

		/* a valid tag can't be shorter than 3 chars */
		if (data.length < 3) return 0;

		/* begins with a '<' optionally followed by '/', followed by letter or number */
		if (data[0] != '<') return 0;
		i = (data[1] == '/') ? 2 : 1;

		if (!isalnum(data[i])) return 0;

		/* scheme test */
		autolink.p = MKDA_NOT_AUTOLINK;

		/* try to find the beginning of an URI */
		while (i < data.length && (isalnum(data[i]) || data[i] == '.' || data[i] == '+' || data[i] == '-')) i++;

		if (i > 1 && data[i] == '@') {
			if ((j = is_mail_autolink(data.slice(i))) != 0) {
				autolink.p = MKDA_EMAIL;
				return i + j;
			}
		}

		if (i > 2 && data[i] == ':') {
			autolink.p = MKDA_NORMAL;
			i++;
		}

		/* completing autolink test: no whitespace or ' or " */
		if (i >= data.length) autolink.p = MKDA_NOT_AUTOLINK;
		else if (autolink.p) {
			j = i;

			while (i < data.length) {
				if (data[i] == '\\') i += 2;
				else if (data[i] == '>' || data[i] == '\'' ||
						data[i] == '"' || data[i] == ' ' || data[i] == '\n')
					break;
				else i++;
			}

			if (i >= data.length) return 0;
			if (i > j && data[i] == '>') return i + 1;
			/* one of the forbidden chars has been found */
			autolink.p = MKDA_NOT_AUTOLINK;
		}

		/* looking for sometinhg looking like a tag end */
		while (i < data.length && data[i] != '>') i++;
		if (i >= data.length) return 0;
		return i + 1;
	}

	// parse_inline - parses inline markdown elements 
	//Buffer, md, String
	function parse_inline(out, md, data) {
		var i = 0, end = 0;
		var action = 0;
		var work = new Buffer();

		if (md.spanStack.length + md.blockStack.length > md.nestingLimit)
			return;

		while (i < data.length) {
			/* copying inactive chars into the output */
			while (end < data.length && !(action = md.activeChars[data[end]])) {
				end++;
			}

			if (md.callbacks.normal_text) {
				work.s = data.slice(i, end);
				md.callbacks.normal_text(out, work, md.context);
			}
			else
				out.s += data.slice(i, end);

			if (end >= data.length) break;
			i = end;

			end = markdown_char_ptrs[action](out, md, data, i);
			if (!end) /* no action from the callback */
				end = i + 1;
			else {
				i += end;
				end = i;
			}
		}
	}

	/* parse_atxheader - parsing of atx-style headers */
	function parse_atxheader(out, md, data) {
		var level = 0;
		var i, end, skip;

		while (level < data.length && level < 6 && data[level] == '#') level++;

		for (i = level; i < data.length && data[i] == ' '; i++) {}

		for (end = i; end < data.length && data[end] != '\n'; end++) {}
		skip = end;

		while (end && data[end - 1] == '#') end--;

		while (end && data[end - 1] == ' ') end--;

		if (end > i) {
			var work = new Buffer();
			md.spanStack.push(work);

			parse_inline(work, md, data.slice(i, end));

			if (md.callbacks.header)
				md.callbacks.header(out, work, level, md.context);

			md.spanStack.pop();
		}

		return skip;
	}

	/* htmlblock_end - checking end of HTML block : </tag>[ \t]*\n[ \t*]\n */
	/*	returns the length on match, 0 otherwise */
	// htmlblock_end(const char *tag, size_t tag_len, struct sd_markdown *rndr, uint8_t *data, size_t size)
	function htmlblock_end(tag, md, data) {
		var i, w;

		/* checking if tag is a match */
		//tag should already be lowercase
		if (tag.length + 3 >= data.length ||
				data.slice(2).toLowerCase() != tag ||
				data[tag.length + 2] != '>')
			return 0;

		/* checking white lines */
		i = tag.length + 3;
		w = 0;
		if (i < data.length && (w = is_empty(data.slice(i))) == 0)
			return 0; /* non-blank after tag */
		i += w;
		w = 0;

		if (i < data.length) w = is_empty(data.slice(i));

		return i + w;
	}

	/* parse_htmlblock - parsing of inline HTML block */
	//TODO
	function parse_htmlblock(out, md, data, do_render) {
		var i, j = 0;
		var curtag = null;
		var found;
		var work = new Buffer(data);

		/* identification of the opening tag */
		if (data.length < 2 || data[0] != '<') return 0;

		i = 1;
		while (i < data.length && data[i] != '>' && data[i] != ' ') i++;

		if (i < data.length) curtag = find_block_tag(data.slice(1));

		/* handling of special cases */
		if (!curtag) {

			/* HTML comment, laxist form */
			if (data.length > 5 && data[1] == '!' && data[2] == '-' && data[3] == '-') {
				i = 5;

				while (i < data.length && !(data[i - 2] == '-' && data[i - 1] == '-' && data[i] == '>')) i++;

				i++;

				if (i < size)
					j = is_empty(data.slice(i));

				if (j) {
					//TODO: HANDLE WORK!!!
					// work.size = i + j;
					work.s = data.slice(0, i + j);
					if (do_render && md.callbacks.blockhtml)
						md.callbacks.blockhtml(out, work, md.context);
					return work.s.length;
				}
			}

			/* HR, which is the only self-closing block tag considered */
			if (data.length > 4 && (data[1] == 'h' || data[1] == 'H') && (data[2] == 'r' || data[2] == 'R')) {
				i = 3;
				while (i < data.length && data[i] != '>') i++;

				if (i + 1 < data.length) {
					i++;
					j = is_empty(data.slice(i));
					if (j) {
						work.s = data.slice(0, i + j);
						if (do_render && md.callbacks.blockhtml)
							md.callbacks.blockhtml(out, work, md.context);
						return work.s.length;
					}
				}
			}

			/* no special case recognised */
			return 0;
		}

		/* looking for an unindented matching closing tag */
		/*	followed by a blank line */
		i = 1;
		found = 0;

		/* if not found, trying a second pass looking for indented match */
		/* but not if tag is "ins" or "del" (following original Markdown.pl) */
		if (curtag != 'ins' && curtag != 'del') {
			var tag_size = curtag.length;
			i = 1;
			while (i < data.length) {
				i++;
				while (i < data.length && !(data[i - 1] == '<' && data[i] == '/'))
					i++;

				if (i + 2 + tag_size >= data.length)
					break;

				// j = htmlblock_end(tag, md, data + i - 1, size - i + 1);
				//TODO
				j = htmlblock_end(tag, md, data.slice(i - 1));

				if (j) {
					i += j - 1;
					found = 1;
					break;
				}
			}
		}

		if (!found) return 0;

		/* the end of the block has been found */
		//TODO:
		work.s = work.s.slice(0, i);
		if (do_render && md.callbacks.blockhtml)
			md.callbacks.blockhtml(out, work, md.context);

		return i;
	}

	/* parse_blockquote - handles parsing of a blockquote fragment */
	function parse_blockquote(out, md, data) {
		var size = data.length;
		var beg, end = 0, pre, work_size = 0;
		// uint8_t *work_data = 0;
		var work_data = "";
		var work_data_cursor = 0;

		var out_ = new Buffer();
		md.blockStack.push(out_);

		beg = 0;
		while (beg < size) {
			for (end = beg + 1; end < size && data[end - 1] != '\n'; end++) {}

			pre = prefix_quote(data.slice(beg, end));

			if (pre) beg += pre; /* skipping prefix */

			/* empty line followed by non-quote line */
			else if (is_empty(data.slice(beg, end)) &&
					(end >= size || (prefix_quote(data.slice(end)) == 0 &&
									 !is_empty(data.slice(end)))))
				break;

			if (beg < end) { /* copy into the in-place working buffer */
				/* bufput(work, data + beg, end - beg); */
				//TODO:!!! FIX THIS!!!
				// if (!work_data) work_data = data.slice(beg, end);
				// 	work_data = data + beg;
				work_data += data.slice(beg, end);
				/*
				if (!work_data) work_data_cursor = beg;
				else if (beg != work_data_cursor + work_size)
					work_data += data.slice(beg, end);
					*/
					// memmove(work_data + work_size, data + beg, end - beg);
				work_size += end - beg;
			}
			beg = end;
		}

		parse_block(out_, md, work_data);
		if (md.callbacks.blockquote)
			md.callbacks.blockquote(out, out_, md.context);
		md.blockStack.pop();
		return end;
	}

	/* parse_paragraph - handles parsing of a regular paragraph */
	function parse_paragraph(out, md, data) {
		var i = 0, end = 0;
		var level = 0;
		var size = data.length;
		var work = new Buffer(data);

		while (i < size) {
			for (end = i + 1; end < size && data[end - 1] != '\n'; end++) {/* empty */}

			if (prefix_quote(data.slice(i, end)) != 0) {
				end = i;
				break;
			}

			var tempdata = data.slice(i);
			if (is_empty(tempdata) || (level = is_headerline(tempdata)) != 0) break;
			if (is_empty(tempdata)) break;
			if ((level = is_headerline(tempdata)) != 0) break;

			if (is_atxheader(md, tempdata)
				|| is_hrule(tempdata)
				|| prefix_quote(tempdata)) {
					end = i;
					break;
				}

			/*
			 * Early termination of a paragraph with the same logic
			 * as markdown 1.0.0. If this logic is applied, the
			 * Markdown 1.0.3 test suite wont pass cleanly.
			 *
			 * :: If the first character in a new line is not a letter
			 * lets check to see if there's some kind of block starting here
			 */
			if ((md.extensions & MKDEXT_LAX_SPACING) && !isalnum(data[i])) {
				if (prefix_oli(tempdata)
				|| prefix_uli(tempdata)) {
					end = i;
					break;
				}
				/* see if an html block starts here */
				if (data[i] == '<' && md.callbacks.blockhtml
						&& parse_htmlblock(out, md, tempdata, 0)) {
					end = i;
					break
				}

				/* see if a code fence starts here */
				if ((md.extensions && MKDEXT_FENCED_CODE) != 0
						&& is_codefence(tempdata, null) != 0) {
					end = i;
					break;
				}
			}

			i = end;
		}

		var work_size = i;
		while (work_size && data[work_size - 1] == '\n') work_size--;
		work.s = work.s.slice(0, work_size);

		if (!level) {
			var tmp = new Buffer();
			md.blockStack.push(tmp);
			parse_inline(tmp, md, work.s);
			if (md.callbacks.paragraph)
				md.callbacks.paragraph(out, tmp, md.context);
			md.blockStack.pop();
		} else {
			var header_work = null;

			if (work.size) {
				var beg;
				i = work.s.length;
				// var work_size = work.s.length - 1;
				// work.size -= 1;

				while (work_size && data[work_size] != '\n')
					work_size -= 1;

				beg = work_size + 1;
				while (work_size && data[work_size - 1] == '\n')
					work_size -= 1;

				work.s = work.s.slice(0, work_size);
				if (work_size > 0) {
					var tmp = new Buffer();
					md.blockStack.push(tmp);
					parse_inline(tmp, md, work.s);

					if (md.callbacks.paragraph)
						md.callbacks.paragraph(out, tmp, md.context);

					md.blockStack.pop();
					work.s = work.s.slice(beg, i);
				}
				else work.s = work.s.slice(0, i);
			}

			header_work = new Buffer();
			md.spanStack.push(header_work);
			parse_inline(header_work, md, work.s);

			if (md.callbacks.header)
				md.callbacks.header(out, header_work, level, md.context);

			md.spanStack.pop();
		}

		return end;
	}

	/* parse_fencedcode - handles parsing of a block-level code fragment */
	function parse_fencedcode(out, md, data) {
		var beg, end;
		var work = null;
		var lang = new Buffer();

		beg = is_codefence(data, lang);
		if (beg == 0) return 0;

		work = new Buffer();
		md.blockStack.push(work);

		while (beg < data.length) {
			var fence_end;
			var fence_trail = new Buffer();

			fence_end = is_codefence(data.slice(beg), fence_trail);
			if (fence_end != 0 && fence_trail.s.length == 0) {
				beg += fence_end;
				break;
			}

			for (end = beg + 1; end < data.length && data[end - 1] != '\n'; end++) {}

			if (beg < end) {
				/* verbatim copy to the working buffer,
				   escaping entities */
				var tempData = data.slice(beg, end);
				if (is_empty(tempData)) work.s += '\n';
				else work.s += tempData;
			}
			beg = end;
		}

		if (work.s.length && work.s[work.s.length - 1] != '\n')
			work.s += '\n';

		if (md.callbacks.blockcode)
			md.callbacks.blockcode(out, work, lang.s.length ? lang : null, md.context);

		md.blockStack.pop();
		return beg;
	}

	function parse_blockcode(out, md, data) {
		var size = data.length;
		var beg, end, pre;

		var work = null;
		md.blockStack.push(work = new Buffer());

		beg = 0;
		while (beg < size) {
			for (end = beg + 1; end < size && data[end - 1] != '\n'; end++) {};
			pre = prefix_code(data.slice(beg, end));

			if (pre) beg += pre; /* skipping prefix */
			else if (!is_empty(data.slice(beg, end)))
				/* non-empty non-prefixed line breaks the pre */
				break;

			if (beg < end) {
				/* verbatim copy to the working buffer,
				   escaping entities */
				if (is_empty(data.slice(beg, end))) work.s += '\n';
				else work.s += data.slice(beg, end);
			}
			beg = end;
		}

		var work_size = work.s.length;
		while (work_size && work.s[work_size - 1] == '\n') work_size -= 1;
		work.s = work.s.slice(0, work_size);

		work.s += '\n';

		if (md.callbacks.blockcode)
			md.callbacks.blockcode(out, work, null, md.context);

		md.blockStack.pop();
		return beg;
	}

	/* parse_listitem - parsing of a single list item */
	/*	assuming initial prefix is already removed */
	//FLAGS is pointer
	function parse_listitem(out, md, data, flags) {
		var size = data.length;
		var work = null, inter = null;
		var beg = 0, end, pre, sublist = 0, orgpre = 0, i;
		var in_empty = 0, has_inside_empty = 0, in_fence = 0;

		/* keeping track of the first indentation prefix */
		while (orgpre < 3 && orgpre < size && data[orgpre] == ' ')
			orgpre++;

		//TODO
		beg = prefix_uli(data);
		if (!beg) beg = prefix_oli(data);

		if (!beg) return 0;

		/* skipping to the beginning of the following line */
		end = beg;
		while (end < size && data[end - 1] != '\n') end++;

		/* getting working buffers */
		md.spanStack.push(work = new Buffer());
		md.spanStack.push(inter = new Buffer());

		/* putting the first line into the working buffer */
		work.s += data.slice(beg, end);
		beg = end;

		/* process the following lines */
		while (beg < size) {
			var has_next_uli, has_next_oli;
			end++;

			while (end < size && data[end - 1] != '\n') end++;

			/* process an empty line */
			if (is_empty(data.slice(beg, end))) {
				in_empty = 1;
				beg = end;
				continue;
			}

			/* calculating the indentation */
			i = 0;
			while (i < 4 && beg + i < end && data[beg + i] == ' ') i++;

			pre = i;

			//TODO: Cache this slice?
			if (md.flags & MKDEXT_FENCED_CODE) {
				if (is_codefence(data.slice(beg+i, end), null) != 0) {
					in_fence = !in_fence;
				}
			}

			/* only check for new list items if we are **not** in a fenced code block */
			if (!in_fence) {
				has_next_uli = prefix_uli(data.slice(beg+i, end));
				has_next_oli = prefix_oli(data.slice(beg+i, end));
			}

			/* checking for ul/ol switch */
			if (in_empty && (
						((flags.p & MKD_LIST_ORDERED) && has_next_uli) ||
						(!(flags.p & MKD_LIST_ORDERED) && has_next_oli))){
							flags.p |= MKD_LI_END;
							break; /* the following item must have same list type */
						}

			/* checking for a new item */
			if ((has_next_uli && !is_hrule(data.slice(beg+i, end))) || has_next_oli) {
				if (in_empty) has_inside_empty = 1;

				if (pre == orgpre) /* the following item must have */
					break;             /* the same indentation */

				if (!sublist) sublist = work.s.length;
			}
			/* joining only indented stuff after empty lines;
			 * note that now we only require 1 space of indentation
			 * to continue list */
			else if (in_empty && pre == 0) {
				flags.p |= MKD_LI_END;
				break;
			}
			else if (in_empty) {
				work.s += '\n';
				has_inside_empty = 1;
			}

			in_empty = 0;

			/* adding the line without prefix into the working buffer */
			work.s += data.slice(beg + i, end);
			beg = end;
		}

		/* render of li contents */
		if (has_inside_empty) flags.p |= MKD_LI_BLOCK;

		if (flags.p & MKD_LI_BLOCK) {
			/* intermediate render of block li */
			if (sublist && sublist < work.s.length) {
				parse_block(inter, md, work.s.slice(0, sublist));
				parse_block(inter, md, work.s.slice(sublist));
			}
			else
				parse_block(inter, md, work.s);
		} else {
				//TODO:
			/* intermediate render of inline li */
			if (sublist && sublist < work.s.length) {
				parse_inline(inter, md, work.s.slice(0, sublist));
				parse_block(inter, md, work.s.slice(sublist));
			}
			else
				parse_inline(inter, md, work.s);
		}

		/* render of li itself */
		if (md.callbacks.listitem)
			md.callbacks.listitem(out, inter, flags.p, md.context);

		md.spanStack.pop();
		md.spanStack.pop();
		return beg;
	}


	/* parse_list - parsing ordered or unordered list block */
	function parse_list(out, md, data, flags) {
		var size = data.length;
		var i = 0, j;

		var work = null;
		md.blockStack.push(work = new Buffer());

		while (i < size) {
			var flag_p = {p: flags};
			j = parse_listitem(work, md, data.slice(i), flag_p);
			flags = flag_p.p;
			i += j;

			if (!j || (flags & MKD_LI_END)) break;
		}

		if (md.callbacks.list)
			md.callbacks.list(out, work, flags, md.context);
		md.blockStack.pop();
		return i;
	}

	function parse_table_row(out, md, data, columns, header_flag) {
		var i = 0, col;
		var row_work = null;

		if (!md.callbacks.table_cell || !md.callbacks.table_row) return;

		md.spanStack.push(row_work = new Buffer());

		if (i < data.length && data[i] == '|') i++;

		for (col = 0; col < columns.length && i < data.length; ++col) {
			var cell_start, cell_end;
			var cell_work;

			md.spanStack.push(cell_work = new Buffer());

			while (i < data.length && _isspace(data[i])) i++;

			cell_start = i;

			while (i < data.length && data[i] != '|') i++;

			cell_end = i - 1;

			while (cell_end > cell_start && _isspace(data[cell_end])) cell_end--;

			// parse_inline(cell_work, rndr, data + cell_start, 1 + cell_end - cell_start);
			parse_inline(cell_work, md, data.slice(cell_start, 1 + cell_end));
			md.callbacks.table_cell(row_work, cell_work, columns[col] | header_flag, md.context);

			md.spanStack.pop();
			i++;
		}

		for (; col < columns.length; ++col) {
			var empty_cell = null;
			md.callbacks.table_cell(row_work, empty_cell, columns[col] | header_flag, md.context);
		}

		md.callbacks.table_row(out, row_work, md.context);

		md.spanStack.pop();
	}

	function parse_table_header(out, md, data, columns) { 
		var i = 0, col, header_end, under_end;

		var pipes = 0;
		while (i < data.length && data[i] != '\n')
			if (data[i++] == '|') pipes++;

		if (i == data.length || pipes == 0)
			return 0;

		header_end = i;

		while (header_end > 0 && _isspace(data[header_end - 1])) header_end--;

		if (data[0] == '|') pipes--;

		if (header_end && data[header_end - 1] == '|') pipes--;

		//	columns.p = pipes + 1;
		//	column_data.p = new Array(columns.p);
		columns.p = new Array(pipes + 1);
		for (var k = 0; k <	columns.p.length; k++) columns.p[k] = 0;

		/* Parse the header underline */
		i++;
		if (i < data.length && data[i] == '|') i++;

		under_end = i;
		while (under_end < data.length && data[under_end] != '\n') under_end++;

		for (col = 0; col < columns.p.length && i < under_end; ++col) {
			var dashes = 0;

			while (i < under_end && data[i] == ' ') i++;

			if (data[i] == ':') {
				i++;
				columns.p[col] |= MKD_TABLE_ALIGN_L;
				dashes++;
			}

			while (i < under_end && data[i] == '-') {
				i++; dashes++;
			}

			if (i < under_end && data[i] == ':') {
				i++; columns.p[col] |= MKD_TABLE_ALIGN_R;
				dashes++;
			}

			while (i < under_end && data[i] == ' ') i++;

			if (i < under_end && data[i] != '|') break;

			if (dashes < 1) break;

			i++;
		}

		if (col < columns.p.length) return 0;

		parse_table_row(out, md, data.slice(0, header_end), columns.p, MKD_TABLE_HEADER);

		return under_end + 1;
	}

	function parse_table(out, md, data) {
		var i;
		var header_work, body_work;

		var columns = {p: null};

		md.spanStack.push(header_work = new Buffer());
		md.blockStack.push(body_work = new Buffer());

		i = parse_table_header(header_work, md, data, columns);
		if (i > 0) {

		while (i < data.length) {
			var row_start;
			var pipes = 0;

			row_start = i;

			while (i < data.length && data[i] != '\n')
				if (data[i++] == '|')
					pipes++;

			if (pipes == 0 || i == data.length) {
				i = row_start;
				break;
			}

			parse_table_row(body_work, md, data.slice(row_start, i), columns.p, 0);

			i++;
		}

		if (md.callbacks.table)
			md.callbacks.table(out, header_work, body_work, md.context);
		}

		md.spanStack.pop();
		md.blockStack.pop();
		return i;
	}

	function parse_block(out, md, data) {
		var beg = 0, end, i;
		var textData;

		if (md.spanStack.length +
				md.blockStack.length > md.nestingLimit)
			return;

		while (beg < data.length) {
			textData = data.slice(beg);
			end = data.length - beg;

			if (is_atxheader(md, textData))
				beg += parse_atxheader(out, md, textData);

			else if (data[beg] == '<' && md.callbacks.blockhtml &&
					(i = parse_htmlblock(out, md, textData, 1)) != 0)
				beg += i;
			else if ((i = is_empty(textData)) != 0)
				beg += i;
			else if (is_hrule(textData)) {
				if (md.callbacks.hrule)
					md.callbacks.hrule(out, md.context);

				while (beg < data.length && data[beg] != '\n') beg++;

				beg++;
			}

			else if ((md.extensions & MKDEXT_FENCED_CODE) != 0 &&
					(i = parse_fencedcode(out, md, textData)) != 0)
				beg += i;

			else if ((md.extensions & MKDEXT_TABLES) != 0 &&
					(i = parse_table(out, md, textData)) != 0)
				beg += i;

			else if (prefix_quote(textData))
				beg += parse_blockquote(out, md, textData);

			else if (prefix_code(textData))
				beg += parse_blockcode(out, md, textData);

			else if (prefix_uli(textData))
				beg += parse_list(out, md, textData, 0);

			else if (prefix_oli(textData))
				beg += parse_list(out, md, textData, MKD_LIST_ORDERED);

			else {
				beg += parse_paragraph(out, md, textData);
			}
		}
	}

	function is_ref(data, beg, end, md) {
		/*	int n; */
		var i = 0;
		var idOffset, idEnd;
		var linkOffset, linkEnd;
		var titleOffset, titleEnd;
		var lineEnd;

		/* up to 3 optional leading spaces */
		if (beg + 3 >= end) return 0;
		if (data[beg] == ' ') { i = 1;
		if (data[beg + 1] == ' ') { i = 2;
		if (data[beg + 2] == ' ') { i = 3;
		if (data[beg + 3] == ' ') return 0; } } }
		i += beg;

		/* id part: anything but a newline between brackets */
		if (data[i] != '[') return 0;
		i++;
		idOffset = i;
		while (i < end && data[i] != '\n' && data[i] != '\r' && data[i] != ']') i++;
		if (i >= end || data[i] != ']') return 0;
		idEnd = i;

		/* spacer: colon (space | tab)* newline? (space | tab)* */
		i++;
		if (i >= end || data[i] != ':') return 0;
		i++;
		while (i < end && data[i] == ' ') i++;
		if (i < end && (data[i] == '\n' || data[i] == '\r')) {
			i++;
			if (i < end && data[i] == '\r' && data[i - 1] == '\n') i++; }
		while (i < end && data[i] == ' ') i++;
		if (i >= end) return 0;

		/* link: whitespace-free sequence, optionally between angle brackets */
		if (data[i] == '<') i++;

		linkOffset = i;
		while (i < end && data[i] != ' ' && data[i] != '\n' && data[i] != '\r') i++;

		if (data[i - 1] == '>') linkEnd = i - 1; else linkEnd = i;

		/* optional spacer: (space | tab)* (newline | '\'' | '"' | '(' ) */
		while (i < end && data[i] == ' ') i++;
		if (i < end && data[i] != '\n' && data[i] != '\r'
				&& data[i] != '\'' && data[i] != '"' && data[i] != '(')
			return 0;
		lineEnd = 0;
		/* computing end-of-line */
		if (i >= end || data[i] == '\r' || data[i] == '\n') lineEnd = i;
		if (i + 1 < end && data[i] == '\n' && data[i + 1] == '\r')
			lineEnd = i + 1;

		/* optional (space|tab)* spacer after a newline */
		if (lineEnd) {
			i = lineEnd + 1;
			while (i < end && data[i] == ' ') i++;
		}

		/* optional title: any non-newline sequence enclosed in '"()
		   alone on its line */
		titleOffset = titleEnd = 0;
		if (i + 1 < end && (data[i] == '\'' || data[i] == '"' || data[i] == '(')) {
			i++;
			titleOffset = i;
			/* looking for EOL */
			while (i < end && data[i] != '\n' && data[i] != '\r') i++;
			if (i + 1 < end && data[i] == '\n' && data[i + 1] == '\r')
				titleEnd = i + 1;
			else titleEnd = i;
			/* stepping back */
			i -= 1;
			while (i > titleOffset && data[i] == ' ')
				i -= 1;
			if (i > titleOffset && (data[i] == '\'' || data[i] == '"' || data[i] == ')')) {
				lineEnd = titleEnd;
				titleEnd = i;
			}
		}

		if (!lineEnd || linkEnd == linkOffset)
			return 0; /* garbage after the link empty link */

		var id = data.slice(idOffset, idEnd);
		var link = data.slice(linkOffset, linkEnd);
		var title = null;
		if (titleEnd > titleOffset) title = data.slice(titleOffset, titleEnd);
		md.refs[id] = {
			id: id,
			link: new Buffer(link),
			title: new Buffer(title)
		};
		return lineEnd;
	}

	function expand_tabs(out, line) {
		var  i = 0, tab = 0;

		while (i < line.length) {
			var org = i;

			while (i < line.length && line[i] != '\t') {
				i++; tab++;
			}

			if (i > org) out.s += line.slice(org, i);

			if (i >= line.length) break;

			do {
				out.s += ' ';
				tab++;
			} while (tab % 4);

			i++;
		}
	}

	/**
	Render markdown code to HTML.

	@param {string} source Markdown code.
	@returns {string} HTML code.
	*/
	function render(source) {
		var text = new Buffer();
		var beg = 0, end;
		this.refs = {};

		while (beg < source.length) { /* iterating over lines */
			if (end = is_ref(source, beg, source.length, this))
				beg = end;
			else { /* skipping to the next line */
				end = beg;
				while (end < source.length && source[end] != '\n' && source[end] != '\r') end++;

				/* adding the line body if present */
				if (end > beg) expand_tabs(text, source.slice(beg, end));

				while (end < source.length && (source[end] == '\n' || source[end] == '\r')) {
					/* add one \n per newline */
					if (source[end] == '\n' || (end + 1 < source.length && source[end + 1] != '\n'))
						text.s += '\n';
					end++;
				}

				beg = end;
			}
		}
	
		var out = new Buffer();

		/* second pass: actual rendering */
		if (this.callbacks.doc_header)
			this.callbacks.doc_header(out, this.context);

		if (text.s.length) {
			/* adding a final newline if not already present */
			if (text.s[text.s.length - 1] != '\n' &&  text.s[text.s.length - 1] != '\r')
				text.s += '\n';
			parse_block(out, this, text.s);
		}

		if (this.callbacks.doc_footer)
			this.callbacks.doc_footer(out, this.context);

		return out.s;
	}
	Markdown.prototype['render'] = render;

	/**
	Create a parser object using the given configuration parameters.

	To get a Reddit equivelent configuration, pass no arguments.

	@param {?Renderer=} renderer A renderer object.
	@param {?Number=} extensions A series of OR'd extension flags. (Extension flags start with MKDEXT_)
	@param {?Number=} nestingLimit The maximum depth to which inline elements can be nested.
	@return {Markdown} A configured markdown object.
	*/
	exports.getParser = function getParser(renderer, extensions, nestingLimit) {
		var md = new Markdown();
		if (renderer) md.callbacks = renderer.callbacks;
		if (nestingLimit) md.nestingLimit = nestingLimit;
		if (renderer) md.context = renderer.context;
		if (extensions != undefined && extensions != null) md.extensions = extensions;

		var cb = md.callbacks;
		if (cb.emphasis || cb.double_emphasis || cb.triple_emphasis) {
			md.activeChars['*'] = MD_CHAR_EMPHASIS;
			md.activeChars['_'] = MD_CHAR_EMPHASIS;
			if (md.extensions & MKDEXT_STRIKETHROUGH) md.activeChars['~'] = MD_CHAR_EMPHASIS;
		}

		if (cb.codespan) md.activeChars['`'] = MD_CHAR_CODESPAN;
		if (cb.linebreak) md.activeChars['\n'] = MD_CHAR_LINEBREAK;
		if (cb.image || cb.link) md.activeChars['['] = MD_CHAR_LINK;

		md.activeChars['<'] = MD_CHAR_LANGLE;
		md.activeChars['\\'] = MD_CHAR_ESCAPE;
		md.activeChars['&'] = MD_CHAR_ENTITITY;

		if (md.extensions & MKDEXT_AUTOLINK) {
			md.activeChars[':'] = MD_CHAR_AUTOLINK_URL;
			md.activeChars['@'] = MD_CHAR_AUTOLINK_EMAIL;
			md.activeChars['w'] = MD_CHAR_AUTOLINK_WWW;
			md.activeChars['/'] = MD_CHAR_AUTOLINK_SUBREDDIT_OR_USERNAME;
		}
		if (md.extensions & MKDEXT_SUPERSCRIPT) md.activeChars['^'] = MD_CHAR_SUPERSCRIPT;

		return md;
	}

	var DEFAULT_BODY_FLAGS = HTML_SKIP_HTML | HTML_SKIP_IMAGES | HTML_SAFELINK | HTML_ESCAPE | HTML_USE_XHTML;
	var DEFAULT_WIKI_FLAGS = HTML_SKIP_HTML | HTML_SAFELINK | HTML_ALLOW_ELEMENT_WHITELIST | HTML_ESCAPE | HTML_USE_XHTML;
	var DEFAULT_HTML_ATTR_WHITELIST = ['colspan', 'rowspan', 'cellspacing', 'cellpadding', 'scope'];
	var DEFAULT_HTML_ELEMENT_WHITELIST =  ['tr', 'th', 'td', 'table', 'tbody', 'thead', 'tfoot', 'caption'];
	exports.DEFAULT_HTML_ELEMENT_WHITELIST = DEFAULT_HTML_ELEMENT_WHITELIST;
	exports.DEFAULT_HTML_ATTR_WHITELIST = DEFAULT_HTML_ATTR_WHITELIST;
	exports.DEFAULT_BODY_FLAGS = DEFAULT_BODY_FLAGS;
	exports.DEFAULT_WIKI_FLAGS = DEFAULT_WIKI_FLAGS;

	exports.HTML_SKIP_HTML = HTML_SKIP_HTML;
	exports.HTML_SKIP_STYLE = HTML_SKIP_STYLE;
	exports.HTML_SKIP_IMAGES = HTML_SKIP_IMAGES;
	exports.HTML_SKIP_LINKS = HTML_SKIP_LINKS;
	exports.HTML_EXPAND_TABS = HTML_EXPAND_TABS;
	exports.HTML_SAFELINK = HTML_SAFELINK;
	exports.HTML_TOC = HTML_TOC;
	exports.HTML_HARD_WRAP = HTML_HARD_WRAP;
	exports.HTML_USE_XHTML = HTML_USE_XHTML;
	exports.HTML_ESCAPE = HTML_ESCAPE;
	exports.HTML_ALLOW_ELEMENT_WHITELIST = HTML_ALLOW_ELEMENT_WHITELIST;

	exports.MKDEXT_NO_INTRA_EMPHASIS = MKDEXT_NO_INTRA_EMPHASIS;
	exports.MKDEXT_TABLES = MKDEXT_TABLES;
	exports.MKDEXT_FENCED_CODE = MKDEXT_FENCED_CODE;
	exports.MKDEXT_AUTOLINK = MKDEXT_AUTOLINK;
	exports.MKDEXT_STRIKETHROUGH = MKDEXT_STRIKETHROUGH;
	exports.MKDEXT_SPACE_HEADERS = MKDEXT_SPACE_HEADERS;
	exports.MKDEXT_SUPERSCRIPT = MKDEXT_SUPERSCRIPT;
	exports.MKDEXT_LAX_SPACING = MKDEXT_LAX_SPACING;

	exports['SD_AUTOLINK_SHORT_DOMAINS'] = SD_AUTOLINK_SHORT_DOMAINS;

	exports.MKDA_NOT_AUTOLINK = MKDA_NOT_AUTOLINK;
	exports.MKDA_NORMAL = MKDA_NORMAL;
	exports.MKDA_EMAIL = MKDA_EMAIL;

	if (typeof define === 'function') {
		define('snuownd', [], exports);
	}
})(typeof(exports)!=='undefined'?exports:typeof(window)!=='undefined'?window.SnuOwnd={}:{});

