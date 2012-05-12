modules['commentPreview'] = {
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
		},
		keyboardShortcuts: {
			type: 'boolean',
			value: true,
			description: 'Use keyboard shortcuts to apply styles to selected text'
		},
		macros: {
			type: 'table',
			addRowText: '+add shortcut',
			fields: [
				{ name: 'label', type: 'text' },
				{ name: 'text', type: 'textarea' }
			],
			value: [
			],
			description: "Add buttons to insert frequently used snippets of text."
		}
	},
	description: 'Provides a live preview of comments, as well as shortcuts for easier markdown.',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(
		/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/comments\/[-\w\.]+/i,
		/https?:\/\/([a-z]+).reddit.com\/message\/[-\w\.]*\/?[-\w\.]*/i,
		/https?:\/\/([a-z]+).reddit.com\/r\/[-\w\.]*\/submit\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/user\/[-\w\.\/]*\/?/i,
		/https?:\/\/([a-z]+).reddit.com\/submit\/?/i
	),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	beforeLoad: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			RESUtils.addCSS('.markdownEditor { white-space: nowrap;  }');
			RESUtils.addCSS('.markdownEditor a { margin-right: 8px; text-decoration: none; font-size: 11px; }');
			RESUtils.addCSS('.selectedItem { color: #ffffff; background-color: #5f99cf; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview { position: relative; width: auto; margin-bottom: 15px; }');
			RESUtils.addCSS('.RESDialogSmall.livePreview .RESDialogContents h3 { font-weight: bold; }');
			RESUtils.addCSS('.RESMacroDropdownTitle, .RESMacroDropdownTitleOverlay { cursor: pointer; display: inline-block; font-size: 11px; text-decoration: underline; color: gray; padding-left: 2px; padding-right: 21px; background-image: url(http://www.redditstatic.com/droparrowgray.gif); background-position: 100% 50%; background-repeat: no-repeat; }');
			RESUtils.addCSS('.RESMacroDropdownTitleOverlay { cursor: pointer; }');
			RESUtils.addCSS('#RESMacroDropdown { display: none; }');
			RESUtils.addCSS('#RESMacroDropdownContainer { display: none; position: absolute; }');
			RESUtils.addCSS('#RESMacroDropdownList { margin-top: 0; width: auto; max-width: 300px; }');
			RESUtils.addCSS('#RESMacroDropdown li { padding-right: 10px; height: 25px; line-height: 24px; }');
		}
	},
	go: function() {
		if ((this.isEnabled()) && (this.isMatchURL())) {

			
			if (this.options.subredditAutocomplete.value) this.subredditAutocomplete();


 /*
 snuownd.js - javascript port of reddit's "snudown" markdown parser
 https://github.com/gamefreak/snuownd
 */
/*
 Copyright (c) 2009, Natacha Porté
 Copyright (c) 2011, Vicent Marti
 Copyright (c) 2012, Scott McClaugherty

 Permission to use, copy, modify, and distribute this software for any
 purpose with or without fee is hereby granted, provided that the above
 copyright notice and this permission notice appear in all copies.

 THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
var SnuOwnd={};
(function(){function _isspace(c){return c==" "||c=="\n"}function isspace(c){return/\s/.test(c)}function isalnum(c){return/[A-Za-z0-9]/.test(c)}function isalpha(c){return/[A-Za-z]/.test(c)}function ispunct(c){return/[\x20-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]/.test(c)}function find_block_tag(str){var wordList=["p","dl","div","math","table","ul","del","form","blockquote","figure","ol","fieldset","h1","h6","pre","script","h5","noscript","style","iframe","h4","ins","h3","h2"];if(wordList.indexOf(str.toLowerCase())!=-1)return str.toLowerCase();
return""}function sdhtml_is_tag(tag_data,tagname){var i;var closed=0;var tag_size=tag_data.length;if(tag_size<3||tag_data[0]!="<")return HTML_TAG_NONE;i=1;if(tag_data[i]=="/"){closed=1;i++}var tagname_c=0;for(;i<tag_size;++i,++tagname_c){if(tagname_c>=tagname.length)break;if(tag_data[i]!=tagname[tagname_c])return HTML_TAG_NONE}if(i==tag_size)return HTML_TAG_NONE;if(isspace(tag_data[i])||tag_data[i]==">")return closed?HTML_TAG_CLOSE:HTML_TAG_OPEN;return HTML_TAG_NONE}function unscape_text(out,src){var i=
0,org;while(i<src.s.length){org=i;while(i<src.s.length&&src.s[i]!="\\")i++;if(i>org)out.s+=src.s.slice(org,i);if(i+1>=src.s.length)break;out.s+=src.s[i+1];i+=2}}var HTML_ESCAPE_TABLE=[7,7,7,7,7,7,7,7,7,0,0,7,7,0,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,0,0,1,0,0,0,2,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,5,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];var HTML_ESCAPES=["","&quot;","&amp;","&#39;","&#47;","&lt;","&gt;",""];function escape_html(out,src,secure){var i=0,org,esc=0;while(i<src.length){org=i;while(i<src.length&&!(esc=HTML_ESCAPE_TABLE[src.charCodeAt(i)]))i++;if(i>org)out.s+=src.slice(org,i);if(i>=src.length)break;if(src[i]=="/"&&!secure)out.s+=
"/";else if(HTML_ESCAPE_TABLE[src.charCodeAt(i)]==7);else out.s+=HTML_ESCAPES[esc];i++}}var HREF_SAFE=[2,2,2,2,2,2,2,2,2,0,0,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];function escape_href(out,src){var hex_chars="0123456789ABCDEF";var i=0,org;var hex_str=["$","",""];while(i<src.length){org=i;while(i<src.length&&HREF_SAFE[src.charCodeAt(i)]!=0)i++;if(i>org)out.s+=src.slice(org,i);if(i>=src.length)break;if(HREF_SAFE[src.charCodeAt(i)]==2){i++;continue}switch(src[i]){case "&":out.s+="&amp;";break;case "'":out.s+="&#x27;";break;default:var cc=src.charCodeAt(i);
hex_str[1]=hex_chars[cc>>4&15];hex_str[2]=hex_chars[cc&15];out.s+=hex_str.join("")}i++}}function autolink_delim(data,link_end){var cclose,copen=0;var i;for(i=0;i<link_end;++i)if(data[i]=="<"){link_end=i;break}while(link_end>0)if("?!.,".indexOf(data[link_end-1])!=-1)link_end--;else if(data[link_end-1]==";"){var new_end=link_end-2;while(new_end>0&&isalpha(data[new_end]))new_end--;if(new_end<link_end-2&&data[new_end]=="&")link_end=new_end;else link_end--}else break;if(link_end==0)return 0;cclose=data[link_end-
1];switch(cclose){case '"':copen='"';break;case "'":copen="'";break;case ")":copen="(";break;case "]":copen="[";break;case "}":copen="{";break}if(copen!=0){var closing=0;var opening=0;var j=0;while(j<link_end){if(data[j]==copen)opening++;else if(data[j]==cclose)closing++;j++}if(closing!=opening)link_end--}return link_end}function check_domain(data){var i,np=0;if(!isalnum(data[0]))return 0;for(i=1;i<data.length-1;++i)if(data[i]==".")np++;else if(!isalnum(data[i])&&data[i]!="-")break;return np?i:0}
function sd_autolink_issafe(link){var valid_uris=["http://","https://","ftp://","mailto://","/","git://","steam://","irc://","news://","mumble://","ssh://","ircs://","#"];var i;for(i=0;i<valid_uris.length;++i){var len=valid_uris[i].length;if(link.length>len&&link.toLowerCase().indexOf(valid_uris[i])==0&&/[A-Za-z0-9#\/?]/.test(link[len]))return 1}return 0}function sd_autolink__url(rewind_p,link,data_,offset,size){var data=data_.slice(offset);var link_end,rewind=0,domain_len;if(size<4||data_[offset+
1]!="/"||data_[offset+2]!="/")return 0;while(rewind<offset&&isalpha(data_[offset-rewind-1]))rewind++;if(!sd_autolink_issafe(data_.slice(offset-rewind,size+rewind)))return 0;link_end="://".length;domain_len=check_domain(data.slice(link_end));if(domain_len==0)return 0;link_end+=domain_len;while(link_end<size&&!isspace(data_[offset+link_end]))link_end++;link_end=autolink_delim(data,link_end);if(link_end==0)return 0;link.s+=data_.substr(offset-rewind,link_end+rewind);rewind_p.p=rewind;return link_end}
function sd_autolink__subreddit(rewind_p,link,data_,offset,size){var data=data_.slice(offset);var link_end;if(size<3)return 0;if(data.indexOf("/r/")!=0)return 0;link_end="/r/".length;if(!isalnum(data[link_end]))return 0;link_end+=1;while(link_end<size&&(isalnum(data[link_end])||data[link_end]=="_"||data[link_end]=="+"))link_end++;link.s+=data.slice(0,link_end);rewind_p.p=0;return link_end}function sd_autolink__username(rewind_p,link,data_,offset,size){var data=data_.slice(offset);var link_end;if(size<
6)return 0;if(data.indexOf("/u/")!=0)return 0;link_end="/u/".length;if(!isalnum(data[link_end])&&data[link_end]!="_"&&data[link_end]!="-")return 0;link_end+=1;while(link_end<size&&(isalnum(data[link_end])||data[link_end]=="_"||data[link_end]=="-"))link_end++;link.s+=data.slice(0,link_end);rewind_p.p=0;return link_end}function sd_autolink__email(rewind_p,link,data_,offset,size){var data=data_.slice(offset);var link_end,rewind;var nb=0,np=0;for(rewind=0;rewind<offset;++rewind){var c=data_[offset-rewind-
1];if(isalnum(c))continue;if(".+-_".indexOf(c)!=-1)continue;break}if(rewind==0)return 0;for(link_end=0;link_end<size;++link_end){var c=data_[offset+link_end];if(isalnum(c))continue;if(c=="@")nb++;else if(c=="."&&link_end<size-1)np++;else if(c!="-"&&c!="_")break}if(link_end<2||nb!=1||np==0)return 0;link_end=autolink_delim(data,link_end);if(link_end==0)return 0;link.s+=data_.substr(offset-rewind,link_end+rewind);rewind_p.p=rewind;return link_end}function sd_autolink__www(rewind_p,link,data_,offset,
size){var data=data_.slice(offset);var link_end;if(offset>0&&!ispunct(data_[offset-1])&&!isspace(data_[offset-1]))return 0;if(size<4||data.slice(0,4)!="www.")return 0;link_end=check_domain(data);if(link_end==0)return 0;while(link_end<size&&!isspace(data[link_end]))link_end++;link_end=autolink_delim(data,link_end);if(link_end==0)return 0;link.s+=data.slice(0,link_end);rewind_p.p=0;return link_end}function getDefaultRenderOptions(){return{nofollow:0,target:null,tocData:{headerCount:0,currentLevel:0},
flags:HTML_SKIP_HTML|HTML_SKIP_IMAGES|HTML_SAFELINK|HTML_ESCAPE|HTML_USE_XHTML,link_attributes:function link_attributes(out,url,options){if(options.nofollow)out.s+=' rel="nofollow"';if(options.target!=null)out.s+=' target="'+options.target+'"'}}}var defaultCallbacks={blockcode:function blockcode(out,text,lang,options){if(out.s.length)out.s+="\n";if(lang&&lang.s.length){var i,cls;out.s+='<pre><code class="';for(i=0,cls=0;i<lang.s.length;++i,++cls){while(i<lang.s.length&&isspace(lang.s[i]))i++;if(i<
lang.s.length){var org=i;while(i<lang.s.length&&!isspace(lang.s[i]))i++;if(lang.s[org]==".")org++;if(cls)out.s+=" ";escape_html(out,lang.s.slice(org,i),false)}}out.s+='">'}else out.s+="<pre><code>";if(text)escape_html(out,text.s,false);out.s+="</code></pre>\n"},blockquote:function blockquote(out,text,lang,options){if(out.s.length)out.s+="\n";out.s+="<blockquote>\n";if(text)out.s+=text.s;out.s+="</blockquote>\n"},blockhtml:function blockhtml(out,text,options){var org,sz;if(!text)return;sz=text.s.length;
while(sz>0&&text.s[sz-1]=="\n")sz--;org=0;while(org<sz&&text.s[org]=="\n")org++;if(org>=sz)return;if(out.s.length)out.s+="\n";out.s+=text.s.slice(org,sz);out.s+="\n"},header:function header(out,text,level,options){if(out.s.length)out.s+="\n";if(options.flags&HTML_TOC)out.s+="<h"+ +level+'id="toc_'+options.tocData.headerCount++ +'">';else out.s+="<h"+ +level+">";if(text)out.s+=text.s;out.s+="</h"+ +level+">\n"},hrule:function hrule(out,options){if(out.s.length)out.s+="\n";out.s+=options.flags&HTML_USE_XHTML?
"<hr/>\n":"<hr>\n"},list:function list(out,text,flags,options){if(out.s.length)out.s+="\n";out.s+=flags&MKD_LIST_ORDERED?"<ol>\n":"<ul>\n";if(text)out.s+=text.s;out.s+=flags&MKD_LIST_ORDERED?"</ol>\n":"</ul>\n"},listitem:function listitem(out,text,flags,options){out.s+="<li>";if(text){var size=text.s.length;while(size&&text.s[size-1]=="\n")size--;out.s+=text.s.slice(0,size)}out.s+="</li>\n"},paragraph:function paragraph(out,text,options){var i=0;if(out.s.length)out.s+="\n";if(!text||!text.s.length)return;
while(i<text.s.length&&isspace(text.s[i]))i++;if(i==text.s.length)return;out.s+="<p>";if(options.flags&HTML_HARD_WRAP){var org;while(i<text.s.length){org=i;while(i<text.s.length&&text.data[i]!="\n")i++;if(i>org)out.s+=text.s.slice(org,i);if(i>=text.s.length-1)break;defaultCallbacks.linebreak(out,options);i++}}else out.s+=text.s.slice(i);out.s+="</p>\n"},table:function table(out,header,body,options){if(out.s.length)out.s+="\n";out.s+="<table><thead>\n";if(header)out.s+=header.s;out.s+="</thead><tbody>\n";
if(body)out.s+=body.s;out.s+="</tbody></table>\n"},table_row:function table_row(out,text,options){out.s+="<tr>\n";if(text)out.s+=text.s;out.s+="</tr>\n"},table_cell:function table_cell(out,text,flags,options){if(flags&MKD_TABLE_HEADER)out.s+="<th";else out.s+="<td";switch(flags&MKD_TABLE_ALIGNMASK){case MKD_TABLE_ALIGN_CENTER:out.s+=' align="center">';break;case MKD_TABLE_ALIGN_L:out.s+=' align="left">';break;case MKD_TABLE_ALIGN_R:out.s+=' align="right">';break;default:out.s+=">"}if(text)out.s+=
text.s;if(flags&MKD_TABLE_HEADER)out.s+="</th>\n";else out.s+="</td>\n"},autolink:function autolink(out,link,type,options){var offset=0;if(!link||!link.s.length)return 0;if((options.flags&HTML_SAFELINK)!=0&&!sd_autolink_issafe(link.s)&&type!=MKDA_EMAIL)return 0;out.s+='<a href="';if(type==MKDA_EMAIL)out.s+="mailto:";escape_href(out,link.s.slice(offset));if(options.link_attributes){out.s+='"';options.link_attributes(out,link,options);out.s+=">"}else out.s+='">';if(link.s.indexOf("mailto:")==0)escape_html(out,
link.s.slice(7),false);else escape_html(out,link.s,false);out.s+="</a>";return 1},codespan:function codespan(out,text,options){out.s+="<code>";if(text)escape_html(out,text.s,false);out.s+="</code>";return 1},double_emphasis:function double_emphasis(out,text,options){if(!text||!text.s.length)return 0;out.s+="<strong>"+text.s+"</strong>";return 1},emphasis:function emphasis(out,text,options){if(!text||!text.s.length)return 0;out.s+="<em>"+text.s+"</em>";return 1},image:function image(out,link,title,
alt,options){if(!link||!link.s.length)return 0;out.s+='<img src="';escape_href(out,link.s);out.s+='" alt="';if(alt&&alt.s.length)escape_html(out,alt.s,false);if(title&&title.s.length){out.s+='" title="';escape_html(out,title.s,false)}out.s+=options.flags&HTML_USE_XHTML?'"/>':'">';return 1},linebreak:function linebreak(out,options){out.s+=options.flags&HTML_USE_XHTML?"<br/>\n":"<br>\n";return 1},link:function link(out,link,title,content,options){if(link!=null&&(options.flags&HTML_SAFELINK)!=0&&!sd_autolink_issafe(link.s))return 0;
out.s+='<a href="';if(link&&link.s.length)escape_href(out,link.s);if(title&&title.s.length){out.s+='" title="';escape_html(out,title.s,false)}if(options.link_attributes){out.s+='"';options.link_attributes(out,link,options);out.s+=">"}else out.s+='">';if(content&&content.s.length)out.s+=content.s;out.s+="</a>";return 1},raw_html_tag:function raw_html_tag(out,tag,options){if((options.flags&HTML_ESCAPE)!=0){escape_html(out,text.s,false);return 1}if((options.flags&HTML_SKIP_HTML)!=0)return 1;if((options.flags&
HTML_SKIP_STYLE)!=0&&sdhtml_is_tag(text.s,"style"))return 1;if((options.flags&HTML_SKIP_LINKS)!=0&&sdhtml_is_tag(text.s,"a"))return 1;if((options.flags&HTML_SKIP_IMAGES)!=0&&sdhtml_is_tag(text.s,"img"))return 1;out.s+=text.s;return 1},triple_emphasis:function triple_emphasis(out,text,options){if(!text||!text.s.length)return 0;out.s+="<strong><em>"+text.s+"</em></strong>";return 1},strikethrough:function strikethrough(out,text,options){if(!text||!text.s.length)return 0;out.s+="<del>"+text.s+"</del>";
return 1},superscript:function superscript(out,text,options){if(!text||!text.s.length)return 0;out.s+="<sup>"+text.s+"</sup>";return 1},entity:null,normal_text:function normal_text(out,text,options){if(text)escape_html(out,text.s,false)},doc_header:null,doc_footer:null};function char_emphasis(out,md,data_,offset){var data=data_.slice(offset);var size=data.length;var c=data[0];var ret;if(size>2&&data[1]!=c){if(c=="~"||_isspace(data[1])||(ret=parse_emph1(out,md,data,c))==0)return 0;return ret+1}if(data.length>
3&&data[1]==c&&data[2]!=c){if(_isspace(data[2])||(ret=parse_emph2(out,md,data,c))==0)return 0;return ret+2}if(data.length>4&&data[1]==c&&data[2]==c&&data[3]!=c){if(c=="~"||_isspace(data[3])||(ret=parse_emph3(out,md,data,c))==0)return 0;return ret+3}return 0}function char_codespan(out,md,data_,offset){var data=data_.slice(offset);var end,nb=0,i,f_begin,f_end;while(nb<data.length&&data[nb]=="`")nb++;i=0;for(end=nb;end<data.length&&i<nb;end++)if(data[end]=="`")i++;else i=0;if(i<nb&&end>=data.length)return 0;
f_begin=nb;while(f_begin<end&&data[f_begin]==" ")f_begin++;f_end=end-nb;while(f_end>nb&&data[f_end-1]==" ")f_end--;if(f_begin<f_end){var work=new Buffer(data.slice(f_begin,f_end));if(!md.callbacks.codespan(out,work,md.context))end=0}else if(!md.callbacks.codespan(out,null,md.context))end=0;return end}function char_linebreak(out,md,data_,offset){var data=data_.slice(offset);if(offset<2||data_[offset-1]!=" "||data_[offset-2]!=" ")return 0;out.s=out.s.trimRight();return md.callbacks.linebreak(out,md.context)?
1:0}function char_link(out,md,data_,offset){var data=data_.slice(offset);var is_img=offset&&data[offset-1]=="!",level;var i=1,txt_e,link_b=0,link_e=0,title_b=0,title_e=0;var content=null;var link=null;var title=null;var u_link=null;var org_work_size=md.spanStack.length;var text_has_nl=0,ret=0;var in_title=0,qtype=0;function cleanup(){md.spanStack.length=org_work_size;return ret?i:0}if(is_img&&!md.callbacks.image||!is_img&&!md.callbacks.link)return cleanup();for(level=1;i<data.length;i++)if(data[i]==
"\n")text_has_nl=1;else if(data[i-1]=="\\")continue;else if(data[i]=="[")level++;else if(data[i]=="]"){level--;if(level<=0)break}if(i>=data.length)return cleanup();txt_e=i;i++;while(i<data.length&&_isspace(data[i]))i++;if(i<data.length&&data[i]=="("){i++;while(i<data.length&&_isspace(data[i]))i++;link_b=i;while(i<data.length)if(data[i]=="\\")i+=2;else if(data[i]==")")break;else if(i>=1&&_isspace(data[i-1])&&(data[i]=="'"||data[i]=='"'))break;else i++;if(i>=data.length)return cleanup();link_e=i;if(data[i]==
"'"||data[i]=='"'){qtype=data[i];in_title=1;i++;title_b=i;while(i<data.length)if(data[i]=="\\")i+=2;else if(data[i]==qtype){in_title=0;i++}else if(data[i]==")"&&!in_title)break;else i++;if(i>=data.length)return cleanup();title_e=i-1;while(title_e>title_b&&_isspace(data[title_e]))title_e--;if(data[title_e]!="'"&&data[title_e]!='"'){title_b=title_e=0;link_e=i}}while(link_e>link_b&&_isspace(data[link_e-1]))link_e--;if(data[link_b]=="<")link_b++;if(data[link_e-1]==">")link_e--;if(link_e>link_b){link=
new Buffer;md.spanStack.push(link);link.s+=data.slice(link_b,link_e)}if(title_e>title_b){title=new Buffer;md.spanStack.push(title);title.s+=data.slice(title_b,title_e)}i++}else if(i<data.length&&data[i]=="["){var id=new Buffer;var lr=null;i++;link_b=i;while(i<data.length&&data[i]!="]")i++;if(i>=data.length)return cleanup();link_e=i;if(link_b==link_e)if(text_has_nl){var b=new Buffer;md.spanStack.push(b);var j;for(j=1;j<txt_e;j++)if(data[j]!="\n")b.s+=data[j];else if(data[j-1]!=" ")b.s+=" ";id.s=b.s}else id.s=
data.slice(1);else id.s=data.slice(link_b,link_e);lr=md.refs[id.s];if(!lr)return cleanup();link=lr.link;title=lr.title;i++}else{var id=new Buffer;var lr=null;if(text_has_nl){var b=new Buffer;md.spanStack.push(b);var j;for(j=1;j<txt_e;j++)if(data[j]!="\n")b.s+=data[j];else if(data[j-1]!=" ")b.s+=" ";id.s=b.s}else id.s=data.slice(1,txt_e);lr=md.refs[id.s];if(!lr)return cleanup();link=lr.link;title=lr.title;i=txt_e+1}if(txt_e>1){content=new Buffer;md.spanStack.push(content);if(is_img)content.s+=data.slice(1,
txt_e);else{md.inLinkBody=1;parse_inline(content,md,data.slice(1,txt_e));md.inLinkBody=0}}if(link){u_link=new Buffer;md.spanStack.push(u_link);unscape_text(u_link,link)}else return cleanup();if(is_img){if(out.s.length&&out.s[out.s.length-1]=="!")out.s=out.s.slice(0,-1);ret=md.callbacks.image(out,u_link,title,content,md.context)}else ret=md.callbacks.link(out,u_link,title,content,md.context);return cleanup()}function char_langle_tag(out,md,data_,offset){var data=data_.slice(offset);var altype={p:MKDA_NOT_AUTOLINK};
var end=tag_length(data,altype);var work=new Buffer(data.slice(0,end));var ret=0;if(end>2)if(md.callbacks.autolink&&altype.p!=MKDA_NOT_AUTOLINK){var u_link=new Buffer;md.spanStack.push(u_link);work.s=data.slice(1,end-2);unscape_text(u_link,work);ret=md.callbacks.autolink(out,u_link,altype.p,md.context);md.spanStack.pop()}else if(md.callbacks.raw_html_tag)ret=md.callbacks.raw_html_tag(out,work,md.context);if(!ret)return 0;else return end}function char_escape(out,md,data_,offset){var data=data_.slice(offset);
var escape_chars="\\`*_{}[]()#+-.!:|&<>/^~";var work=new Buffer;if(data.length>1){if(escape_chars.indexOf(data[1])==-1)return 0;if(md.callbacks.normal_text){work.s=data[1];md.callbacks.normal_text(out,work,md.context)}else out.s+=data[1]}else if(data.length==1)out.s+=data[0];return 2}function char_entity(out,md,data_,offset){var data=data_.slice(offset);var end=1;var work=new Buffer;if(end<data.length&&data[end]=="#")end++;while(end<data.length&&isalnum(data[end]))end++;if(end<data.length&&data[end]==
";")end++;else return 0;if(md.callbacks.entity){work.s=data.slice(0,end);md.callbacks.entity(out,work,md.context)}else out.s+=data.slice(0,end);return end}function char_autolink_url(out,md,data_,offset){var data=data_.slice(offset);var link=null;var link_len,rewind={p:null};if(!md.callbacks.autolink||md.inLinkBody)return 0;link=new Buffer;md.spanStack.push(link);if((link_len=sd_autolink__url(rewind,link,data_,offset,data.length))>0){if(rewind.p>0)out.s=out.s.slice(0,-rewind.p);md.callbacks.autolink(out,
link,MKDA_NORMAL,md.context)}md.spanStack.pop();return link_len}function char_autolink_email(out,md,data_,offset){var data=data_.slice(offset);var link=null;var link_len,rewind={p:null};if(!md.callbacks.autolink||md.inLinkBody)return 0;link=new Buffer;md.spanStack.push(link);if((link_len=sd_autolink__email(rewind,link,data_,offset,data.length))>0){if(rewind.p>0)out.s=out.s.slice(0,-rewind.p);md.callbacks.autolink(out,link,MKDA_EMAIL,md.context)}md.spanStack.pop();return link_len}function char_autolink_www(out,
md,data_,offset){var data=data_.slice(offset);var link=null,link_url=null,link_text=null;var link_len,rewind={p:null};if(!md.callbacks.link||md.inLinkBody)return 0;link=new Buffer;md.spanStack.push(link);if((link_len=sd_autolink__www(rewind,link,data_,offset,data.length))>0){link_url=new Buffer;md.spanStack.push(link_url);link_url.s+="http://";link_url.s+=link.s;if(rewind.p>0)out.s=out.s.slice(0,out.s.length-rewind.p);if(md.callbacks.normal_text){link_text=new Buffer;md.spanStack.push(link_text);
md.callbacks.normal_text(link_text,link,md.context);md.callbacks.link(out,link_url,null,link_text,md.context);md.spanStack.pop()}else md.callbacks.link(out,link_url,null,link,md.context);md.spanStack.pop()}md.spanStack.pop();return link_len}function char_autolink_subreddit_or_username(out,md,data_,offset){var data=data_.slice(offset);var link=null;var link_len,rewind={p:null};if(!md.callbacks.autolink||md.inLinkBody)return 0;link=new Buffer;md.spanStack.push(link);if((link_len=sd_autolink__subreddit(rewind,
link,data_,offset,data.length))>0){if(rewind.p>0)out.s=out.s.slice(0,-rewind.p);md.callbacks.autolink(out,link,MKDA_NORMAL,md.context)}else if((link_len=sd_autolink__username(rewind,link,data_,offset,data.length))>0){if(rewind.p>0)out.s=out.s.slice(0,-rewind.p);md.callbacks.autolink(out,link,MKDA_NORMAL,md.context)}md.spanStack.pop();return link_len}function char_superscript(out,md,data_,offset){var data=data_.slice(offset);var size=data.length;var sup_start,sup_len;var sup=null;if(!md.callbacks.superscript)return 0;
if(size<2)return 0;if(data[1]=="("){sup_start=sup_len=2;while(sup_len<size&&data[sup_len]!=")"&&data[sup_len-1]!="\\")sup_len++;if(sup_len==size)return 0}else{sup_start=sup_len=1;while(sup_len<size&&!_isspace(data[sup_len]))sup_len++}if(sup_len-sup_start==0)return sup_start==2?3:0;sup=new Buffer;md.spanStack.push(sup);parse_inline(sup,md,data.slice(sup_start,sup_len));md.callbacks.superscript(out,sup,md.context);md.spanStack.pop();return sup_start==2?sup_len+1:sup_len}var markdown_char_ptrs=[null,
char_emphasis,char_codespan,char_linebreak,char_link,char_langle_tag,char_escape,char_entity,char_autolink_url,char_autolink_email,char_autolink_www,char_autolink_subreddit_or_username,char_superscript];var MKD_LIST_ORDERED=1;var MKD_LI_BLOCK=2;var MKD_LI_END=8;var enumCounter=0;var MD_CHAR_NONE=enumCounter++;var MD_CHAR_EMPHASIS=enumCounter++;var MD_CHAR_CODESPAN=enumCounter++;var MD_CHAR_LINEBREAK=enumCounter++;var MD_CHAR_LINK=enumCounter++;var MD_CHAR_LANGLE=enumCounter++;var MD_CHAR_ESCAPE=enumCounter++;
var MD_CHAR_ENTITITY=enumCounter++;var MD_CHAR_AUTOLINK_URL=enumCounter++;var MD_CHAR_AUTOLINK_EMAIL=enumCounter++;var MD_CHAR_AUTOLINK_WWW=enumCounter++;var MD_CHAR_AUTOLINK_SUBREDDIT_OR_USERNAME=enumCounter++;var MD_CHAR_SUPERSCRIPT=enumCounter++;enumCounter=0;var MKDA_NOT_AUTOLINK=enumCounter++;var MKDA_NORMAL=enumCounter++;var MKDA_EMAIL=enumCounter++;var MKDEXT_NO_INTRA_EMPHASIS=1<<0;var MKDEXT_TABLES=1<<1;var MKDEXT_FENCED_CODE=1<<2;var MKDEXT_AUTOLINK=1<<3;var MKDEXT_STRIKETHROUGH=1<<4;var MKDEXT_LAX_HTML_BLOCKS=
1<<5;var MKDEXT_SPACE_HEADERS=1<<6;var MKDEXT_SUPERSCRIPT=1<<7;var HTML_SKIP_HTML=1<<0;var HTML_SKIP_STYLE=1<<1;var HTML_SKIP_IMAGES=1<<2;var HTML_SKIP_LINKS=1<<3;var HTML_EXPAND_TABS=1<<4;var HTML_SAFELINK=1<<5;var HTML_TOC=1<<6;var HTML_HARD_WRAP=1<<7;var HTML_USE_XHTML=1<<8;var HTML_ESCAPE=1<<9;var MKD_TABLE_ALIGN_L=1;var MKD_TABLE_ALIGN_R=2;var MKD_TABLE_ALIGN_CENTER=3;var MKD_TABLE_ALIGNMASK=3;var MKD_TABLE_HEADER=4;function Buffer(str){this.s=str||""}function Markdown(){this.spanStack=[];this.blockStack=
[];this.extensions=MKDEXT_NO_INTRA_EMPHASIS|MKDEXT_SUPERSCRIPT|MKDEXT_AUTOLINK|MKDEXT_STRIKETHROUGH|MKDEXT_TABLES;this.context=getDefaultRenderOptions();this.inLinkBody=0;this.activeChars={};this.refs={}}Markdown.prototype.callbacks=defaultCallbacks;Markdown.prototype.nestingLimit=16;function is_empty(data){var i;for(i=0;i<data.length&&data[i]!="\n";i++)if(data[i]!=" ")return 0;return i+1}function is_hrule(data){var i=0,n=0;var c;if(data.length<3)return 0;if(data[0]==" "){i++;if(data[1]==" "){i++;
if(data[2]==" ")i++}}if(i+2>=data.length||data[i]!="*"&&data[i]!="-"&&data[i]!="_")return 0;c=data[i];while(i<data.length&&data[i]!="\n"){if(data[i]==c)n++;else if(data[i]!=" ")return 0;i++}return n>=3}function is_codefence(data,syntax){var i=0,n=0;var c;if(data.length<3)return 0;if(data[0]==" "){i++;if(data[1]==" "){i++;if(data[2]==" ")i++}}if(i+2>=data.length||!(data[i]=="~"||data[i]=="`"))return 0;c=data[i];while(i<data.length&&data[i]==c){n++;i++}if(n<3)return 0;if(syntax){var syn_cursor;var syn=
0;while(i<data.length&&data[i]==" ")i++;syn_cursor=i;if(i<size&&data[i]=="{"){i++;syn_cursor++;while(i<data.length&&data[i]!="}"&&data[i]!="\n"){syn++;i++}if(i==size||data[i]!="}")return 0;while(syn>0&&_isspace(data[syn_cursor+0])){syn_cursor++;syn--}while(syn>0&&_isspace(data[syn_cursor+syn-1]))syn--;i++}else while(i<data.length&&!_isspace(data[i])){syn++;i++}syntax.s=data.substr(syn_cursor,syn)}while(i<data.length&&data[i]!="\n"){if(!_isspace(data[i]))return 0;i++}return i+1}function find_emph_char(data,
c){var i=1;while(i<data.length){while(i<data.length&&data[i]!=c&&data[i]!="`"&&data[i]!="[")i++;if(i==data.length)return 0;if(data[i]==c)return i;if(i&&data[i-1]=="\\"){i++;continue}if(data[i]=="`"){var span_nb=0,bt;var tmp_i=0;while(i<data.length&&data[i]=="`"){i++;span_nb++}if(i>=data.length)return 0;bt=0;while(i<data.length&&bt<span_nb){if(!tmp_i&&data[i]==c)tmp_i=i;if(data[i]=="`")bt++;else bt=0;i++}if(i>=data.length)return tmp_i}else if(data[i]=="["){var tmp_i=0;var cc;i++;while(i<data.length&&
data[i]!="]"){if(!tmp_i&&data[i]==c)tmp_i=i;i++}i++;while(i<data.length&&(data[i]==" "||data[i]=="\n"))i++;if(i>=data.length)return tmp_i;switch(data[i]){case "[":cc="]";break;case "(":cc=")";break;default:if(tmp_i)return tmp_i;else continue}i++;while(i<data.length&&data[i]!=cc){if(!tmp_i&&data[i]==c)tmp_i=i;i++}if(i>=data.length)return tmp_i;i++}}return 0}function parse_emph1(out,md,data_,c){var data=data_.slice(1);var i=0,len;var r;if(!md.callbacks.emphasis)return 0;if(data.length>1&&data[0]==c&&
data[1]==c)i=1;while(i<data.length){len=find_emph_char(data.slice(i),c);if(!len)return 0;i+=len;if(i>=data.length)return 0;if(data[i]==c&&!_isspace(data[i-1])){if(md.extensions&MKDEXT_NO_INTRA_EMPHASIS&&c=="_")if(!(i+1==data.length||_isspace(data[i+1])||ispunct(data[i+1])))continue;var work=new Buffer;md.spanStack.push(work);parse_inline(work,md,data.slice(0,i));r=md.callbacks.emphasis(out,work,md.context);md.spanStack.pop();return r?i+1:0}}return 0}function parse_emph2(out,md,data_,c){var data=data_.slice(2);
var i=0,len;var r;var render_method=c=="~"?md.callbacks.strikethrough:md.callbacks.double_emphasis;if(!render_method)return 0;while(i<data.length){len=find_emph_char(data.slice(i),c);if(!len)return 0;i+=len;if(i+1<data.length&&data[i]==c&&data[i+1]==c&&i&&!_isspace(data[i-1])){var work=new Buffer;md.spanStack.push(work);parse_inline(work,md,data.slice(0,i));r=render_method(out,work,md.context);md.spanStack.pop();return r?i+2:0}i++}return 0}function parse_emph3(out,md,data_,c){var data=data_.slice(3);
var i=0,len;var r;while(i<data.length){len=find_emph_char(data.slice(i),c);if(!len)return 0;i+=len;if(data[i]!=c||_isspace(data[i-1]))continue;if(i+2<data.length&&data[i+1]==c&&data[i+2]==c&&md.callbacks.triple_emphasis){var work=new Buffer;md.spanStack.push(work);parse_inline(work,md,data.slice(0,i));r=md.callbacks.triple_emphasis(out,work,md.context);md.spanStack.pop();return r?i+3:0}else if(i+1<data.length&&data[i+1]==c){len=parse_emph1(out,md,data_.slice(1),c);if(!len)return 0;else return len-
2}else{len=parse_emph2(out,md,data.slice(2),c);if(!len)return 0;else return len-1}}return 0}function is_atxheader(md,data){if(data[0]!="#")return false;if(md.extensions&MKDEXT_SPACE_HEADERS){var level=0;while(level<data.length&&level<6&&data[level]=="#")level++;if(level<data.length&&data[level]!=" ")return false}return true}function is_headerline(data){var i=0;var size=data.length;if(data[i]=="="){for(i=1;i<size&&data[i]=="=";i++);while(i<size&&data[i]==" ")i++;return i>=size||data[i]=="\n"?1:0}if(data[i]==
"-"){for(i=1;i<size&&data[i]=="-";i++);while(i<size&&data[i]==" ")i++;return i>=size||data[i]=="\n"?2:0}return 0}function is_next_headerline(data){var size=data.length;var i=0;while(i<size&&data[i]!="\n")i++;if(++i>=size)return 0;return is_headerline(data.slice(i))}function prefix_quote(data){var i=0;var size=data.length;if(i<size&&data[i]==" ")i++;if(i<size&&data[i]==" ")i++;if(i<size&&data[i]==" ")i++;if(i<size&&data[i]==">"){if(i+1<size&&data[i+1]==" ")return i+2;return i+1}return 0}function prefix_code(data){if(data.length>
3&&data[0]==" "&&data[1]==" "&&data[2]==" "&&data[3]==" ")return 4;return 0}function prefix_oli(data){var size=data.length;var i=0;if(i<size&&data[i]==" ")i++;if(i<size&&data[i]==" ")i++;if(i<size&&data[i]==" ")i++;if(i>=size||data[i]<"0"||data[i]>"9")return 0;while(i<size&&data[i]>="0"&&data[i]<="9")i++;if(i+1>=size||data[i]!="."||data[i+1]!=" ")return 0;if(is_next_headerline(data.slice(i)))return 0;return i+2}function prefix_uli(data){var size=data.length;var i=0;if(i<size&&data[i]==" ")i++;if(i<
size&&data[i]==" ")i++;if(i<size&&data[i]==" ")i++;if(i+1>=size||data[i]!="*"&&data[i]!="+"&&data[i]!="-"||data[i+1]!=" ")return 0;if(is_next_headerline(data.slice(i)))return 0;return i+2}function is_mail_autolink(data){var i=0,nb=0;for(i=0;i<data.length;++i){if(isalnum(data[i]))continue;switch(data[i]){case "@":nb++;case "-":case ".":case "_":break;case ">":return nb==1?i+1:0;default:return 0}}return 0}function tag_length(data,autolink){var i,j;if(data.length<3)return 0;if(data[0]!="<")return 0;
i=data[1]=="/"?2:1;if(!isalnum(data[i]))return 0;autolink.p=MKDA_NOT_AUTOLINK;while(i<data.length&&(isalnum(data[i])||data[i]=="."||data[i]=="+"||data[i]=="-"))i++;if(i>1&&data[i]=="@")if((j=is_mail_autolink(data.slice(i)))!=0){autolink.p=MKDA_EMAIL;return i+j}if(i>2&&data[i]==":"){autolink.p=MKDA_NORMAL;i++}if(i>=data.length)autolink.p=MKDA_NOT_AUTOLINK;else if(autolink.p){j=i;while(i<data.length)if(data[i]=="\\")i+=2;else if(data[i]==">"||data[i]=="'"||data[i]=='"'||data[i]==" "||data[i]=="\n")break;
else i++;if(i>=data.length)return 0;if(i>j&&data[i]==">")return i+1;autolink.p=MKDA_NOT_AUTOLINK}while(i<data.length&&data[i]!=">")i++;if(i>=data.length)return 0;return i+1}function parse_inline(out,md,data){var i=0,end=0;var action=0;var work=new Buffer;if(md.spanStack.length+md.blockStack.length>md.nestingLimit)return;while(i<data.length){while(end<data.length&&!(action=md.activeChars[data[end]]))end++;if(md.callbacks.normal_text){work.s=data.slice(i,end);md.callbacks.normal_text(out,work,md.context)}else out.s+=
data.slice(i,end);if(end>=data.length)break;i=end;end=markdown_char_ptrs[action](out,md,data,i);if(!end)end=i+1;else{i+=end;end=i}}}function parse_atxheader(out,md,data){var level=0;var i,end,skip;while(level<data.length&&level<6&&data[level]=="#")level++;for(i=level;i<data.length&&data[i]==" ";i++);for(end=i;end<data.length&&data[end]!="\n";end++);skip=end;while(end&&data[end-1]=="#")end--;while(end&&data[end-1]==" ")end--;if(end>i){var work=new Buffer;md.spanStack.push(work);parse_inline(work,md,
data.slice(i,end));if(md.callbacks.header)md.callbacks.header(out,work,level,md.context);md.spanStack.pop()}return skip}function htmlblock_end(tag,md,data){var i,w;if(tag.length+3>=data.length||data.slice(2).toLowerCase()!=tag||data[tag.length+2]!=">")return 0;i=tag.length+3;w=0;if(i<data.length&&(w=is_empty(data.slice(i)))==0)return 0;i+=w;w=0;if(md.extensions&MKDEXT_LAX_HTML_BLOCKS){if(i<data.length)w=is_empty(data.slice(i))}else if(i<data.length&&(w=is_empty(data.slice(i)))==0)return 0;return i+
w}function parse_htmlblock(out,md,data,do_render){var i,j=0;var curtag=null;var found;var work=new Buffer(data);if(data.length<2||data[0]!="<")return 0;i=1;while(i<data.length&&data[i]!=">"&&data[i]!=" ")i++;if(i<data.length)curtag=find_block_tag(data.slice(1));if(!curtag){if(data.length>5&&data[1]=="!"&&data[2]=="-"&&data[3]=="-"){i=5;while(i<data.length&&!(data[i-2]=="-"&&data[i-1]=="-"&&data[i]==">"))i++;i++;if(i<size)j=is_empty(data.slice(i));if(j){work.s=data.slice(0,i+j);if(do_render&&md.callbacks.blockhtml)md.callbacks.blockhtml(out,
work,md.context);return work.s.length}}if(data.length>4&&(data[1]=="h"||data[1]=="H")&&(data[2]=="r"||data[2]=="R")){i=3;while(i<data.length&&data[i]!=">")i++;if(i+1<data.length){i++;j=is_empty(data.slice(i));if(j){work.s=data.slice(0,i+j);if(do_render&&md.callbacks.blockhtml)md.callbacks.blockhtml(out,work,md.context);return work.s.length}}}return 0}i=1;found=0;if(curtag!="ins"&&curtag!="del"){var tag_size=curtag.length;i=1;while(i<data.length){i++;while(i<data.length&&!(data[i-1]=="<"&&data[i]==
"/"))i++;if(i+2+tag_size>=data.length)break;j=htmlblock_end(tag,md,data.slice(i-1));if(j){i+=j-1;found=1;break}}}if(!found)return 0;work.s=work.s.slice(0,i);if(do_render&&md.callbacks.blockhtml)md.callbacks.blockhtml(out,work,md.context);return i}function parse_blockquote(out,md,data){var size=data.length;var beg,end=0,pre,work_size=0;var work_data="";var work_data_cursor=0;var out_=new Buffer;md.blockStack.push(out_);beg=0;while(beg<size){for(end=beg+1;end<size&&data[end-1]!="\n";end++);pre=prefix_quote(data.slice(beg,
end));if(pre)beg+=pre;else if(is_empty(data.slice(beg,end))&&(end>=size||prefix_quote(data.slice(end))==0&&!is_empty(data.slice(end))))break;if(beg<end){work_data+=data.slice(beg,end);work_size+=end-beg}beg=end}parse_block(out_,md,work_data);if(md.callbacks.blockquote)md.callbacks.blockquote(out,out_,md.context);md.blockStack.pop();return end}function parse_paragraph(out,md,data){var i=0,end=0;var level=0;var size=data.length;var work=new Buffer(data);while(i<size){for(end=i+1;end<size&&data[end-
1]!="\n";end++);if(prefix_quote(data.slice(i,end))!=0){end=i;break}var tempdata=data.slice(i);if(is_empty(tempdata)||(level=is_headerline(tempdata))!=0)break;if(md.extensions&MKDEXT_LAX_HTML_BLOCKS)if(data[i]=="<"&&md.callbacks.blockhtml&&parse_htmlblock(out,md,tempdata,null)){end=i;break}if(is_atxheader(md,tempdata)||is_hrule(tempdata)){end=i;break}i=end}var work_size=i;while(work_size&&data[work_size-1]=="\n")work_size--;work.s=work.s.slice(0,work_size);if(!level){var tmp=new Buffer;md.blockStack.push(tmp);
parse_inline(tmp,md,work.s);if(md.callbacks.paragraph)md.callbacks.paragraph(out,tmp,md.context);md.blockStack.pop()}else{var header_work=null;if(work.size){var beg;i=work.s.length;while(work_size&&data[work_size]!="\n")work_size-=1;beg=work_size+1;while(work_size&&data[work_size-1]=="\n")work_size-=1;work.s=work.s.slice(0,work_size);if(work_size>0){var tmp=new Buffer;md.blockStack.push(tmp);parse_inline(tmp,md,work.s);if(md.callbacks.paragraph)md.callbacks.paragraph(out,tmp,md.context);md.blockStack.pop();
work.s=work.s.slice(beg,i)}else work.s=work.s.slice(0,i)}header_work=new Buffer;md.spanStack.push(header_work);parse_inline(header_work,md,work.s);if(md.callbacks.header)md.callbacks.header(out,header_work,level,md.context);md.spanStack.pop()}return end}function parse_fencedcode(out,md,data){var beg,end;var work=null;var lang=new Buffer;beg=is_codefence(data,lang);if(beg==0)return 0;work=new Buffer;md.blockStack.push(work);while(beg<data.length){var fence_end;fence_end=is_codefence(data.slice(beg),
null);if(fence_end!=0){beg+=fence_end;break}for(end=beg+1;end<data.length&&data[end-1]!="\n";end++);if(beg<end){var tempData=data.slice(beg,end);if(is_empty(tempData))work.s+="\n";else work.s+=tempData}beg=end}if(work.s.length&&work.s[work.s.length-1]!="\n")work.s+="\n";if(md.callbacks.blockcode)md.callbacks.blockcode(out,work,lang.s.length?lang:null,md.context);md.blockStack.pop();return beg}function parse_blockcode(out,md,data){var size=data.length;var beg,end,pre;var work=null;md.blockStack.push(work=
new Buffer);beg=0;while(beg<size){for(end=beg+1;end<size&&data[end-1]!="\n";end++);pre=prefix_code(data.slice(beg,end));if(pre)beg+=pre;else if(!is_empty(data.slice(beg,end)))break;if(beg<end)if(is_empty(data.slice(beg,end)))work.s+="\n";else work.s+=data.slice(beg,end);beg=end}var work_size=work.s.length;while(work_size&&work.s[work_size-1]=="\n")work_size-=1;work.s=work.s.slice(0,work_size);work.s+="\n";if(md.callbacks.blockcode)md.callbacks.blockcode(out,work,null,md.context);md.blockStack.pop();
return beg}function parse_listitem(out,md,data,flags){var size=data.length;var work=null,inter=null;var beg=0,end,pre,sublist=0,orgpre=0,i;var in_empty=0,has_inside_empty=0;var has_next_uli,has_next_oli;while(orgpre<3&&orgpre<size&&data[orgpre]==" ")orgpre++;beg=prefix_uli(data);if(!beg)beg=prefix_oli(data);if(!beg)return 0;end=beg;while(end<size&&data[end-1]!="\n")end++;md.spanStack.push(work=new Buffer);md.spanStack.push(inter=new Buffer);work.s+=data.slice(beg,end);beg=end;while(beg<size){end++;
while(end<size&&data[end-1]!="\n")end++;if(is_empty(data.slice(beg,end))){in_empty=1;beg=end;continue}i=0;while(i<4&&beg+i<end&&data[beg+i]==" ")i++;pre=i;has_next_uli=prefix_uli(data.slice(beg+i,end));has_next_oli=prefix_oli(data.slice(beg+i,end));if(in_empty&&(flags.p&MKD_LIST_ORDERED&&has_next_uli||!(flags.p&MKD_LIST_ORDERED)&&has_next_oli)){flags.p|=MKD_LI_END;break}if(has_next_uli&&!is_hrule(data.slice(beg+i,end))||has_next_oli){if(in_empty)has_inside_empty=1;if(pre==orgpre)break;if(!sublist)sublist=
work.s.length}else if(in_empty&&i<4){flags.p|=MKD_LI_END;break}else if(in_empty){work.s+="\n";has_inside_empty=1}in_empty=0;work.s+=data.slice(beg+i,end);beg=end}if(has_inside_empty)flags.p|=MKD_LI_BLOCK;if(flags.p&MKD_LI_BLOCK)if(sublist&&sublist<work.s.length){parse_block(inter,md,work.s.slice(0,sublist));parse_block(inter,md,work.s.slice(sublist))}else parse_block(inter,md,work.s);else if(sublist&&sublist<work.s.length){parse_inline(inter,md,work.s.slice(0,sublist));parse_block(inter,md,work.s.slice(sublist))}else parse_inline(inter,
md,work.s);if(md.callbacks.listitem)md.callbacks.listitem(out,inter,flags.p,md.context);md.spanStack.pop();md.spanStack.pop();return beg}function parse_list(out,md,data,flags){var size=data.length;var i=0,j;var work=null;md.blockStack.push(work=new Buffer);while(i<size){var flag_p={p:flags};j=parse_listitem(work,md,data.slice(i),flag_p);flags=flag_p.p;i+=j;if(!j||flags&MKD_LI_END)break}if(md.callbacks.list)md.callbacks.list(out,work,flags,md.context);md.blockStack.pop();return i}function parse_table_row(out,
md,data,columns,header_flag){var i=0,col;var row_work=null;if(!md.callbacks.table_cell||!md.callbacks.table_row)return;md.spanStack.push(row_work=new Buffer);if(i<data.length&&data[i]=="|")i++;for(col=0;col<columns.length&&i<data.length;++col){var cell_start,cell_end;var cell_work;md.spanStack.push(cell_work=new Buffer);while(i<data.length&&_isspace(data[i]))i++;cell_start=i;while(i<data.length&&data[i]!="|")i++;cell_end=i-1;while(cell_end>cell_start&&_isspace(data[cell_end]))cell_end--;parse_inline(cell_work,
md,data.slice(cell_start,1+cell_end));md.callbacks.table_cell(row_work,cell_work,columns[col]|header_flag,md.context);md.spanStack.pop();i++}for(;col<columns.length;++col){var empty_cell=null;md.callbacks.table_cell(row_work,empty_cell,columns[col]|header_flag,md.context)}md.callbacks.table_row(out,row_work,md.context);md.spanStack.pop()}function parse_table_header(out,md,data,columns){var i=0,col,header_end,under_end;var pipes=0;while(i<data.length&&data[i]!="\n")if(data[i++]=="|")pipes++;if(i==
data.length||pipes==0)return 0;header_end=i;while(header_end>0&&_isspace(data[header_end-1]))header_end--;if(data[0]=="|")pipes--;if(header_end&&data[header_end-1]=="|")pipes--;columns.p=new Array(pipes+1);for(var k=0;k<columns.p.length;k++)columns.p[k]=0;i++;if(i<data.length&&data[i]=="|")i++;under_end=i;while(under_end<data.length&&data[under_end]!="\n")under_end++;for(col=0;col<columns.p.length&&i<under_end;++col){var dashes=0;while(i<under_end&&data[i]==" ")i++;if(data[i]==":"){i++;columns.p[col]|=
MKD_TABLE_ALIGN_L;dashes++}while(i<under_end&&data[i]=="-"){i++;dashes++}if(i<under_end&&data[i]==":"){i++;columns.p[col]|=MKD_TABLE_ALIGN_R;dashes++}while(i<under_end&&data[i]==" ")i++;if(i<under_end&&data[i]!="|")break;if(dashes<1)break;i++}if(col<columns.p.length)return 0;parse_table_row(out,md,data,columns.p,MKD_TABLE_HEADER);return under_end+1}function parse_table(out,md,data){var i;var header_work,body_work;var columns={p:null};md.spanStack.push(header_work=new Buffer);md.blockStack.push(body_work=
new Buffer);i=parse_table_header(header_work,md,data,columns);if(i>0){while(i<data.length){var row_start;var pipes=0;row_start=i;while(i<data.length&&data[i]!="\n")if(data[i++]=="|")pipes++;if(pipes==0||i==data.length){i=row_start;break}parse_table_row(body_work,md,data.slice(row_start,i),columns.p,0);i++}if(md.callbacks.table)md.callbacks.table(out,header_work,body_work,md.context)}md.spanStack.pop();md.blockStack.pop();return i}function parse_block(out,md,data){var beg=0,end,i;var textData;if(md.spanStack.length+
md.blockStack.length>md.nestingLimit)return;while(beg<data.length){textData=data.slice(beg);end=data.length-beg;if(is_atxheader(md,textData))beg+=parse_atxheader(out,md,textData);else if(data[beg]=="<"&&md.callbacks.blockhtml&&(i=parse_htmlblock(out,md,textData,1))!=0)beg+=i;else if((i=is_empty(textData))!=0)beg+=i;else if(is_hrule(textData)){if(md.callbacks.hrule)md.callbacks.hrule(out,md.context);while(beg<data.length&&data[beg]!="\n")beg++;beg++}else if((md.extensions&MKDEXT_FENCED_CODE)!=0&&(i=
parse_fencedcode(out,md,textData))!=0)beg+=i;else if((md.extensions&MKDEXT_TABLES)!=0&&(i=parse_table(out,md,textData))!=0)beg+=i;else if(prefix_quote(textData))beg+=parse_blockquote(out,md,textData);else if(prefix_code(textData))beg+=parse_blockcode(out,md,textData);else if(prefix_uli(textData))beg+=parse_list(out,md,textData,0);else if(prefix_oli(textData))beg+=parse_list(out,md,textData,MKD_LIST_ORDERED);else beg+=parse_paragraph(out,md,textData)}}function is_ref(data,beg,end,md){var i=0;var idOffset,
idEnd;var linkOffset,linkEnd;var titleOffset,titleEnd;var lineEnd;if(beg+3>=end)return 0;if(data[beg]==" "){i=1;if(data[beg+1]==" "){i=2;if(data[beg+2]==" "){i=3;if(data[beg+3]==" ")return 0}}}i+=beg;if(data[i]!="[")return 0;i++;idOffset=i;while(i<end&&data[i]!="\n"&&data[i]!="\r"&&data[i]!="]")i++;if(i>=end||data[i]!="]")return 0;idEnd=i;i++;if(i>=end||data[i]!=":")return 0;i++;while(i<end&&data[i]==" ")i++;if(i<end&&(data[i]=="\n"||data[i]=="\r")){i++;if(i<end&&data[i]=="\r"&&data[i-1]=="\n")i++}while(i<
end&&data[i]==" ")i++;if(i>=end)return 0;if(data[i]=="<")i++;linkOffset=i;while(i<end&&data[i]!=" "&&data[i]!="\n"&&data[i]!="\r")i++;if(data[i-1]==">")linkEnd=i-1;else linkEnd=i;while(i<end&&data[i]==" ")i++;if(i<end&&data[i]!="\n"&&data[i]!="\r"&&data[i]!="'"&&data[i]!='"'&&data[i]!="(")return 0;lineEnd=0;if(i>=end||data[i]=="\r"||data[i]=="\n")lineEnd=i;if(i+1<end&&data[i]=="\n"&&data[i+1]=="\r")lineEnd=i+1;if(lineEnd){i=lineEnd+1;while(i<end&&data[i]==" ")i++}titleOffset=titleEnd=0;if(i+1<end&&
(data[i]=="'"||data[i]=='"'||data[i]=="(")){i++;titleOffset=i;while(i<end&&data[i]!="\n"&&data[i]!="\r")i++;if(i+1<end&&data[i]=="\n"&&data[i+1]=="\r")titleEnd=i+1;else titleEnd=i;i-=1;while(i>titleOffset&&data[i]==" ")i-=1;if(i>titleOffset&&(data[i]=="'"||data[i]=='"'||data[i]==")")){lineEnd=titleEnd;titleEnd=i}}if(!lineEnd||linkEnd==linkOffset)return 0;var id=data.slice(idOffset,idEnd);var link=data.slice(linkOffset,linkEnd);var title=null;if(titleEnd>titleOffset)title=data.slice(titleOffset,titleEnd);
md.refs[id]={id:id,link:new Buffer(link),title:new Buffer(title)};return lineEnd}function expand_tabs(out,line){var i=0,tab=0;while(i<line.length){var org=i;while(i<line.length&&line[i]!="\t"){i++;tab++}if(i>org)out.s+=line.slice(org,i);if(i>=line.length)break;do{out.s+=" ";tab++}while(tab%4);i++}}function render(source){var text=new Buffer;var beg=0,end;this.refs={};while(beg<source.length)if(end=is_ref(source,beg,source.length,this))beg=end;else{end=beg;while(end<source.length&&source[end]!="\n"&&
source[end]!="\r")end++;if(end>beg)expand_tabs(text,source.slice(beg,end));while(end<source.length&&(source[end]=="\n"||source[end]=="\r")){if(source[end]=="\n"||end+1<source.length&&source[end+1]!="\n")text.s+="\n";end++}beg=end}var out=new Buffer;if(this.callbacks.doc_header)this.callbacks.doc_header(out,this.context);if(text.s.length){if(text.s[text.s.length-1]!="\n"&&text.s[text.s.length-1]!="\r")text.s+="\n";parse_block(out,this,text.s)}if(this.callbacks.doc_footer)this.callbacks.doc_footer(out,
this.context);return out.s}Markdown.prototype["render"]=render;function getParser(callbacks,extensions,nestingLimit,context){var md=new Markdown;if(callbacks)md.callbacks=callbacks;if(nestingLimit)md.nestingLimit=nestingLimit;if(context)md.context=context;if(extensions!=undefined&&extensions!=null)md.extensions=extensions;var cb=md.callbacks;if(cb.emphasis||cb.double_emphasis||cb.triple_emphasis){md.activeChars["*"]=MD_CHAR_EMPHASIS;md.activeChars["_"]=MD_CHAR_EMPHASIS;if(md.extensions&MKDEXT_STRIKETHROUGH)md.activeChars["~"]=
MD_CHAR_EMPHASIS}if(cb.codespan)md.activeChars["`"]=MD_CHAR_CODESPAN;if(cb.linebreak)md.activeChars["\n"]=MD_CHAR_LINEBREAK;if(cb.image||cb.link)md.activeChars["["]=MD_CHAR_LINK;md.activeChars["<"]=MD_CHAR_LANGLE;md.activeChars["\\"]=MD_CHAR_ESCAPE;md.activeChars["&"]=MD_CHAR_ENTITITY;if(md.extensions&MKDEXT_AUTOLINK){md.activeChars[":"]=MD_CHAR_AUTOLINK_URL;md.activeChars["@"]=MD_CHAR_AUTOLINK_EMAIL;md.activeChars["w"]=MD_CHAR_AUTOLINK_WWW;md.activeChars["/"]=MD_CHAR_AUTOLINK_SUBREDDIT_OR_USERNAME}if(md.extensions&
MKDEXT_SUPERSCRIPT)md.activeChars["^"]=MD_CHAR_SUPERSCRIPT;return md}SnuOwnd["defaultCallbacks"]=defaultCallbacks;SnuOwnd["getParser"]=getParser;SnuOwnd["HTML_SKIP_HTML"]=HTML_SKIP_HTML;SnuOwnd["HTML_SKIP_STYLE"]=HTML_SKIP_STYLE;SnuOwnd["HTML_SKIP_IMAGES"]=HTML_SKIP_IMAGES;SnuOwnd["HTML_SKIP_LINKS"]=HTML_SKIP_LINKS;SnuOwnd["HTML_EXPAND_TABS"]=HTML_EXPAND_TABS;SnuOwnd["HTML_SAFELINK"]=HTML_SAFELINK;SnuOwnd["HTML_TOC"]=HTML_TOC;SnuOwnd["HTML_HARD_WRAP"]=HTML_HARD_WRAP;SnuOwnd["HTML_USE_XHTML"]=HTML_USE_XHTML;
SnuOwnd["HTML_ESCAPE"]=HTML_ESCAPE;SnuOwnd["MKDEXT_NO_INTRA_EMPHASIS"]=MKDEXT_NO_INTRA_EMPHASIS;SnuOwnd["MKDEXT_TABLES"]=MKDEXT_TABLES;SnuOwnd["MKDEXT_FENCED_CODE"]=MKDEXT_FENCED_CODE;SnuOwnd["MKDEXT_AUTOLINK"]=MKDEXT_AUTOLINK;SnuOwnd["MKDEXT_STRIKETHROUGH"]=MKDEXT_STRIKETHROUGH;SnuOwnd["MKDEXT_LAX_HTML_BLOCKS"]=MKDEXT_LAX_HTML_BLOCKS;SnuOwnd["MKDEXT_SPACE_HEADERS"]=MKDEXT_SPACE_HEADERS;SnuOwnd["MKDEXT_SUPERSCRIPT"]=MKDEXT_SUPERSCRIPT})();

			// ###########################################################################
			// Start user script 
			// ###########################################################################


			var converter = SnuOwnd.getParser();


			function wireupNewCommentEditors( parent )
			{	
				if (!parent.getElementsByTagName) return;
				
				if ( parent.tagName == 'FORM' )
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
						
						if ( form.getAttribute('id') && (form.getAttribute('id').match(/^commentreply_./)))	{				
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
				var editDivs = $('div.usertext-edit');
				$(editDivs).each(function() {
					var editDiv = this;
					
					var preview = addPreviewToParent( editDiv );
					addMarkdownEditorToForm( editDiv, preview );
				});
				
			}
			
			function wireupViewSourceButtons(ele) {
				if (ele == null) ele = document;
				if ((RESUtils.pageType() == 'comments') || (RESUtils.pageType() == 'inbox'))  {
					modules['commentPreview'].commentMenus = ele.querySelectorAll('.entry .flat-list.buttons li:first-child');
					modules['commentPreview'].commentMenusCount = modules['commentPreview'].commentMenus.length;
					modules['commentPreview'].commentMenusi = 0;
					(function(){
						// scan 15 links at a time...
						var chunkLength = Math.min((modules['commentPreview'].commentMenusCount - modules['commentPreview'].commentMenusi), 15);
						for (var i=0;i<chunkLength;i++) {
							var viewSource = document.createElement('li');
							viewSource.innerHTML = '<a href="javascript:void(0)">source</a>';
							viewSource.addEventListener('click', modules['commentPreview'].viewSource, false);
							// if (modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling) {
							//	insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling, viewSource);
							//} else {
								if (modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling != null) {
									insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi].nextSibling, viewSource);
								} else {
									insertAfter(modules['commentPreview'].commentMenus[modules['commentPreview'].commentMenusi], viewSource);
								}
							//}
							modules['commentPreview'].commentMenusi++;
						}
						if (modules['commentPreview'].commentMenusi < modules['commentPreview'].commentMenusCount) {
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
					
					if (modules['commentPreview'].options.keyboardShortcuts.value) {
						targetTextArea.addEventListener(
							'keydown',
							function(e)
							{
								if ((e.ctrlKey || e.metaKey) && (!e.shiftKey) && (!e.altKey)) {
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
									var toReplaceSplit = $(e.target).getSelection().text.split('\n\n');
									var end = '\n\n';
									for (var i=0, len=toReplaceSplit.length; i<len; i++) {
										toReplace = toReplaceSplit[i];
										if (i==len-1) end = '';
										if (toReplace != '') {
											switch (String.fromCharCode(e.keyCode)) {
												case 'I':
													e.preventDefault();
													if (((toReplace.substr(0,1) == '*') && (toReplace.substr(0,2) != '**')) && ((toReplace.substr(-1) == '*') && (toReplace.substr(-2) != '**'))) {
														toReplace = toReplace.substr(1,toReplace.length-2);
													} else {
														toReplace = '*'+toReplace+'*';
													}
													toReplace += end;
													$(e.target).replaceSelection(toReplace,true);
													break;
												case 'B':
													e.preventDefault();
													if ((toReplace.substr(0,2) == '**') && (toReplace.substr(-2) == '**')) {
														toReplace = toReplace.substr(2,toReplace.length-4);
													} else {
														toReplace = '**'+toReplace+'**';
													}
													toReplace += end;
													$(e.target).replaceSelection(toReplace,true);
													break;
												case 'S':
													e.preventDefault();
													if ((toReplace.substr(0,2) == '~~') && (toReplace.substr(-2) == '~~')) {
														toReplace = toReplace.substr(2,toReplace.length-4);
													} else {
														toReplace = '~~'+toReplace+'~~';
													}
													toReplace += end;
													$(e.target).replaceSelection(toReplace,true);
													break;
											}
										}
									}
								}
							},
							false
						);	
					}

					
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
					if ( button.getAttribute('class') == "save" )
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
				if (targetTextArea.value == '') {
					preview.parentNode.style.display = 'none';
				} else {
					preview.parentNode.style.display = 'block';
				}
				preview.innerHTML = converter.render(targetTextArea.value);
			}

			function addMarkdownEditorToForm( parent, preview ) 
			{	
				var textAreas = parent.getElementsByTagName('textarea');
				
				if ( !textAreas[0] ) return;
				
				var targetTextArea = textAreas[0];
				targetTextArea.setAttribute('tabIndex',0);
				
				
				var controlBox = document.createElement( 'div' );
				controlBox.setAttribute('class', 'markdownEditor');
				parent.insertBefore( controlBox, parent.firstChild );

				if ((modules['commentPreview'].options.commentingAs.value) && (!(modules['usernameHider'].isEnabled()))) {
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
						targetTextArea.focus();
					},
					'ctrl-b'
				);
				
				var italics = new EditControl(
					'<i>Italic</i>',
					function()
					{
						tagSelection( targetTextArea, '*', '*' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					},
					'ctrl-i'
				);
				
				var strikethrough = new EditControl(
					'<del>strike</del>',
					function()
					{
						tagSelection( targetTextArea, '~~', '~~' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					},
					'ctrl-s'
				);
				
				var superscript = new EditControl(
					'<sup>sup</sup>',
					function()
					{
						tagSelection( targetTextArea, '^', '' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);

				var link = new EditControl(
					'Link',
					function()
					{
						linkSelection( targetTextArea );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);
				
				var quote = new EditControl(
					'|Quote',
					function()
					{
						prefixSelectionLines( targetTextArea, '>' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);
				
				var code = new EditControl(
					'<span style="font-family: Courier New;">Code</span>',
					function()
					{
						prefixSelectionLines( targetTextArea, '    ' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);
				
				var bullets = new EditControl(
					'&bull;Bullets',
					function()
					{
						prefixSelectionLines( targetTextArea, '* ' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);
				
				var numbers = new EditControl(
					'1.Numbers',
					function()
					{
						prefixSelectionLines( targetTextArea, '1. ' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
					}
				);
				
				var disapproval = new EditControl(
					'&#3232;\_&#3232;',
					function() {
						prefixCursor( modules['commentPreview'].macroTargetTextarea, '&#3232;\\\_&#3232;' );
						refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
						modules['commentPreview'].macroTargetTextarea.focus();
					}
				);
				
				var promoteRES = new EditControl(
					'[Promote]',
					function() {
						var thisCount = $(this).data('promoteCount') || 0;
						thisCount++;
						$(this).data('promoteCount',thisCount);
						if (thisCount > 2) {
							$(this).hide();
							modules['commentPreview'].lod();
							return false;
						}
						prefixSelectionLines( modules['commentPreview'].macroTargetTextarea, '[Reddit Enhancement Suite](http://redditenhancementsuite.com)' );
						refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
						modules['commentPreview'].macroTargetTextarea.focus();
					}
				);
				
				var reddiquette = new EditControl(
					'reddiquette',
					function() {
						var thisCount = $(this).data('promoteCount') || 0;
						thisCount++;
						$(this).data('promoteCount',thisCount);
						if (thisCount > 2) {
							$(this).hide();
							// modules['commentPreview'].lod();
							return false;
						}
						prefixCursor( targetTextArea, '[reddiquette](http://www.reddit.com/help/reddiquette) ' );
						refreshPreview( preview, targetTextArea );
						targetTextArea.focus();
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
				// controlBox.appendChild( disapproval.create() );
				controlBox.appendChild( reddiquette.create() );
				// controlBox.appendChild( promoteRES.create() );
				modules['commentPreview'].macroDropdownTitle = $('<span class="RESMacroDropdownTitle">macros</span>')
				$(controlBox).append(modules['commentPreview'].macroDropdownTitle);
				// add one single dropdown to the document body rather than creating multiples...
				if (typeof(modules['commentPreview'].macroDropdownContainer) == 'undefined') {
					modules['commentPreview'].macroDropdownContainer = $('<span id="RESMacroDropdown"><span class="RESMacroDropdownTitleOverlay">macros</span></span>')
					modules['commentPreview'].macroDropdown = $('<ul id="RESMacroDropdownList" class="RESDropdownList"></ul>')
					var thisLI = $('<li />');
					$(thisLI).append(disapproval.create());
					$(modules['commentPreview'].macroDropdown).append(thisLI);
					thisLI = $('<li />');
					$(thisLI).append(promoteRES.create());
					$(modules['commentPreview'].macroDropdown).append(thisLI);
					Array.prototype.slice.call(modules['commentPreview'].options['macros'].value).forEach(function(elem, index, array) {
						var thisLI = $('<li />');
						$(thisLI).append(new EditControl(elem[0], function(){
							prefixCursor( modules['commentPreview'].macroTargetTextarea, elem[1] );
							refreshPreview( modules['commentPreview'].macroTargetPreview, modules['commentPreview'].macroTargetTextarea );
							$(modules['commentPreview'].macroDropdownContainer).hide();
							modules['commentPreview'].macroTargetTextarea.focus();
						}).create());
						$(modules['commentPreview'].macroDropdown).append(thisLI);
					});
					// add the "+ add macro" button
					var thisLI = $('<li><a href="javascript:void(0)">+ add macro</a>');
					$(thisLI).click(modules['commentPreview'].manageMacros)
					$(modules['commentPreview'].macroDropdown).append(thisLI);
					$(modules['commentPreview'].macroDropdownContainer).append(modules['commentPreview'].macroDropdown);
					$(modules['commentPreview'].macroDropdownContainer).mouseleave(function(e) {
						$(this).hide();
					});
					$(document.body).append( modules['commentPreview'].macroDropdownContainer );
				}
				// attach listeners to dropdowntitles to show the dropdown...
				$(".RESMacroDropdownTitle").live('click', modules['commentPreview'].showMacroDropdown);
			}

			function EditControl( label, editFunction, shortcutKey )
			{
				this.create = function() 
				{
					this.link = document.createElement('a');
					if (shortcutKey) this.link.title = shortcutKey;
					this.link.innerHTML = label;
					this.link.setAttribute('tabindex','1');
					this.link.href = 'javascript:;';
					// this.link.setAttribute('style','Margin-Right: 15px; text-decoration: none;');
					
					this.link.execute = editFunction;
					
					addEvent( this.link, 'click', 'execute' );
					
					return this.link;	
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
				
				if( selectedText[ selectedText.length - 1 ] == ' ' )
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

			function prefixCursor ( targetTextArea, prefix )
			{
				//Is scrollTop necessary?
				var scrollTop = targetTextArea.scrollTop;
				var text = targetTextArea.value;
				var selectionStart = targetTextArea.selectionStart;
				text = text.slice(0, selectionStart) + prefix + text.slice(selectionStart);
				targetTextArea.value  = text;
				targetTextArea.selectionStart += prefix.length;
				targetTextArea.scrollTop = scrollTop;
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
					if (event.target.tagName == 'FORM') {
						wireupNewCommentEditors( event.target );
					}
					if ((event.target.tagName == 'DIV') && (hasClass(event.target,'thing'))) {
						wireupNewCommentEditors( event.target );
						wireupViewSourceButtons( event.target );
					}
				},
				false
			);
		}
	},
	manageMacros: function() {
		RESConsole.open();
		RESConsole.menuClick(document.getElementById('Menu-Comments'));
		RESConsole.drawConfigOptions('commentPreview');
	},
	showMacroDropdown: function(e) {
		modules['commentPreview'].macroTargetTextarea = $(e.target).parent().parent().find('textarea')[0];
		modules['commentPreview'].macroTargetPreview = $(e.target).parent().parent().find('.livePreview div.md')[0];
		//get the position of the placeholder element  
		var pos = $(e.target).offset();    
		// var eWidth = $(this).outerWidth();
		// var mWidth = $(dropdown).outerWidth();
		// var left = (pos.left + eWidth - mWidth) + "px";
		var left = (pos.left) + "px";
		// var top = $(this).outerHeight()+pos.top + "px";
		var top = (pos.top) + "px";
		//show the dropdown directly over the placeholder  
		$(modules['commentPreview'].macroDropdownContainer).css( { 
			position: 'absolute',
			zIndex: 50,
			left: left, 
			top: top
		}).show();
	},
	lod: function() {
		if (typeof(this.firstlod) == 'undefined') {
			this.firstlod = true;
			$('body').append('<div id="RESlod" style="display: none; position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #dddddd; opacity: 0.9; z-index: 99999;"><div style="position: relative; text-align: center; width: 400px; height: 300px; margin: auto;"><div style="font-size: 100px; margin-bottom: 10px;">&#3232;\_&#3232;</div> when you do this, people direct their frustrations at <b>me</b>... could we please maybe give this a rest?</div></div>');
		}
		$('#RESlod').fadeIn('slow', function() {
			setTimeout(function() {
				$('#RESlod').fadeOut('slow');
			}, 5000);
		});
	},
	viewSource: function(e) {
		e.preventDefault();
		var ele = e.target;
		if (ele) {
			var permalink = ele.parentNode.parentNode.firstChild.firstChild;
			if (permalink) {
				// check if we've already viewed the source.. if so just reveal it instead of loading...
				var prevSib = ele.parentNode.parentNode.previousSibling;
				if (typeof(prevSib.querySelector) == 'undefined') prevSib = prevSib.previousSibling;
				var sourceDiv = prevSib.querySelector('.viewSource');
				if (sourceDiv) {
					sourceDiv.style.display = 'block';
				} else {
					var jsonURL = permalink.getAttribute('href');
					var sourceLink = 'comment';
					if (hasClass(permalink, 'comments')) {
						sourceLink = 'selftext';
					}
					if (jsonURL.indexOf('?context') != -1) {
						jsonURL = jsonURL.replace('?context=3','.json?');
					} else {
						jsonURL += '/.json';
					}
					modules['commentPreview'].viewSourceEle = ele;
					modules['commentPreview'].viewSourceLink = sourceLink;
					jsonURL = RESUtils.insertParam(jsonURL,'app','res');
					GM_xmlhttpRequest({
						method:	"GET",
						url:	jsonURL,
						onload:	function(response) {
							var thisResponse = JSON.parse(response.responseText);
							var userTextForm = document.createElement('div');
							addClass(userTextForm,'usertext-edit');
							addClass(userTextForm,'viewSource');
							if (modules['commentPreview'].viewSourceLink == 'comment') {
								var sourceText = thisResponse[1].data.children[0].data.body;
								userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
							} else {
								var sourceText = thisResponse[0].data.children[0].data.selftext;
								userTextForm.innerHTML = '<div><textarea rows="1" cols="1" name="text">' + sourceText + '</textarea></div><div class="bottom-area"><div class="usertext-buttons"><button type="button" class="cancel">hide</button></div></div>';
							}
							var cancelButton = userTextForm.querySelector('.cancel');
							cancelButton.addEventListener('click', modules['commentPreview'].hideSource, false);
							var prevSib = modules['commentPreview'].viewSourceEle.parentNode.parentNode.previousSibling;
							if (typeof(prevSib.querySelector) == 'undefined') prevSib = prevSib.previousSibling;
							prevSib.appendChild(userTextForm);
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
			modules['commentPreview'].subredditAutocompleteDropdown = $('<div id="subreddit_dropdown" class="drop-choices srdrop inuse" style="display:none; position:relative;"><a class="choice"></a></div>');
			$('body').append(modules['commentPreview'].subredditAutocompleteDropdown);
		}
		$(formEle).live('keyup', modules['commentPreview'].subredditAutocompleteTrigger );
		$(formEle).live('keydown', modules['commentPreview'].subredditAutocompleteNav );
	},
	subredditAutocompleteTrigger: function(event) {
		if (/[^A-Za-z0-9 ]/.test(String.fromCharCode(event.keyCode))) {
			return false;
		}
		if (typeof(modules['commentPreview'].subredditAutoCompleteAJAXTimer) != 'undefined') clearTimeout(modules['commentPreview'].subredditAutoCompleteAJAXTimer);
		modules['commentPreview'].currentTextArea = event.target;
		var	match = modules['commentPreview'].subredditRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
		if( !match || match[1] == '' || match[1].length > 10 ) {
			// if space or enter, check if they skipped over a subreddit autocomplete without selecting one..
			if ((event.keyCode == 32) || (event.keyCode == 13)) {
				match = modules['commentPreview'].subredditSkipRE.exec( ' '+ event.target.value.substr( 0, event.target.selectionStart ) );
				if (match) {
					modules['commentPreview'].addSubredditLink(match[1]);
				}
			}
			return modules['commentPreview'].hideSubredditAutocompleteDropdown();
		}

		var query = match[1].toLowerCase();
		if( modules['commentPreview'].subredditAutocompleteCache[query]) return modules['commentPreview'].updateSubredditAutocompleteDropdown( modules['commentPreview'].subredditAutocompleteCache[query], event.target );

		var thisTarget = event.target;
		modules['commentPreview'].subredditAutoCompleteAJAXTimer = setTimeout(
			function() {
				$.post('/api/search_reddit_names.json?app=res', {query:query},
				// $.post('/reddits/search.json', {q:query},
					function(r){
						modules['commentPreview'].subredditAutocompleteCache[query]=r['names'];
						modules['commentPreview'].updateSubredditAutocompleteDropdown( r['names'], thisTarget );
						modules['commentPreview'].subredditAutocompleteDropdownSetNav(0);
					},
				"json");
			
			}, 200);


		$(this).blur( modules['commentPreview'].hideSubredditAutocompleteDropdown );	
	},
	subredditAutocompleteNav: function(event) {
		if ($("#subreddit_dropdown").is(':visible')) {
			switch (event.keyCode) {
				case modules['commentPreview'].KEY.DOWN:
				case modules['commentPreview'].KEY.RIGHT:
					event.preventDefault();
					var reddits = $("#subreddit_dropdown a.choice");
					if (modules['commentPreview'].subredditAutocompleteDropdownNavidx < reddits.length-1) modules['commentPreview'].subredditAutocompleteDropdownNavidx++;
					modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
					break;
				case modules['commentPreview'].KEY.UP:
				case modules['commentPreview'].KEY.LEFT:
					event.preventDefault();
					if (modules['commentPreview'].subredditAutocompleteDropdownNavidx > 0) modules['commentPreview'].subredditAutocompleteDropdownNavidx--;
					modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
					break;
				case modules['commentPreview'].KEY.TAB:
				case modules['commentPreview'].KEY.ENTER:
					event.preventDefault();
					var reddits = $("#subreddit_dropdown a.choice");
					RESUtils.mousedown(reddits[modules['commentPreview'].subredditAutocompleteDropdownNavidx]);
					break;
				case modules['commentPreview'].KEY.ESCAPE:
					event.preventDefault();
					modules['commentPreview'].hideSubredditAutocompleteDropdown();
					break;
			}
		}
	},
	subredditAutocompleteDropdownSetNav: function(idx) {
		modules['commentPreview'].subredditAutocompleteDropdownNavidx = idx;
		var reddits = $("#subreddit_dropdown a.choice");
		for (var i=0, len=reddits.length; i<len; i++) {
			$(reddits[i]).removeClass('selectedItem');
			if (i == idx) $(reddits[i]).addClass('selectedItem');
		}
	},
	hideSubredditAutocompleteDropdown: function() {
		$("#subreddit_dropdown").hide();
	},
	updateSubredditAutocompleteDropdown: function(sr_names, textarea) {
		$( textarea ).after( modules['commentPreview'].subredditAutocompleteDropdown );

		if(!sr_names.length) return	modules['commentPreview'].hideSubredditAutocompleteDropdown();

		var first_row = modules['commentPreview'].subredditAutocompleteDropdown.children(":first");
		modules['commentPreview'].subredditAutocompleteDropdown.children().remove();

		for (var i=0, len=sr_names.length; i<len; i++) {
			if( i>10 ) break;
			var new_row=first_row.clone();
			new_row.text( sr_names[i] );
			modules['commentPreview'].subredditAutocompleteDropdown.append(new_row);
			new_row.mousedown( modules['commentPreview'].updateSubredditAutocompleteTextarea );
		}
		modules['commentPreview'].subredditAutocompleteDropdown.show();
		if (typeof(modules['commentPreview'].subredditAutocompleteDropdownNavidx) == 'undefined') modules['commentPreview'].subredditAutocompleteDropdownNavidx = 0;
		modules['commentPreview'].subredditAutocompleteDropdownSetNav(modules['commentPreview'].subredditAutocompleteDropdownNavidx);
	
	},
	updateSubredditAutocompleteTextarea: function(event) {
		modules['commentPreview'].hideSubredditAutocompleteDropdown();
		modules['commentPreview'].addSubredditLink(this.innerHTML);
	},
	addSubredditLink: function(subreddit) {
		var textarea	= modules['commentPreview'].currentTextArea,
			caretPos	= textarea.selectionStart,
			beforeCaret	= textarea.value.substr( 0,caretPos ),
			afterCaret	= textarea.value.substr( caretPos );

		// var srLink = '[/r/'+subreddit+'](/r/'+subreddit+') ';
		var srLink = '/r/'+subreddit+' ';
		beforeCaret		= beforeCaret.replace( /\/?r\/(\w*)\ ?$/, srLink );
		textarea.value	= beforeCaret + afterCaret;
		textarea.selectionStart	= textarea.selectionEnd	= beforeCaret.length;
		textarea.focus()
	
	}
};
