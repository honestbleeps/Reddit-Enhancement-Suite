modules['filterComments'] = {
	moduleID: 'filterComments',
	moduleName: 'Filter Comments',
	category: 'Filters',
	options: {
		keywords: {
			type: 'table',
			fields: [{
				name: 'keyword',
				type: 'text'
			}],
			value: [],
			description: 'Type in title keywords you want to ignore if they show up in a comment. The comment body will be hidden and replaced with a placeholder.'
		},
		hideComment: {
			type: 'boolean',
			value: false,
			description: 'If a comment is filtered, hide the entire comment.'
		},
		filteredCommentText: {
			type: 'text',
			value: '[Filtered] - Click to reveal',
			description: "When a comment is 'soft' filtered this is the default placeholder."
		},
		filteredCommentTextColour: {
			type: 'text',
			value: 'Red',
			description: 'Change the colour of the placeholder text.'
		}
	},
	description: 'Filter comments containing some text',
	isEnabled: function() {
		return RESConsole.getModulePrefs(this.moduleID);
	},
	include: Array(/https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i),
	isMatchURL: function() {
		return RESUtils.isMatchURL(this.moduleID);
	},
	applyCommentFilter: function(ele) {
		var filteredPara;
		for (var i = 0, lene = ele.length; i < lene; i += 1) {
			if (ele[i].innerHTML) {
				if (this.filterComment(ele[i].innerHTML.toString())) {
					if (this.options.hideComment.value) {
						ele[i].parentNode.parentNode.parentNode.parentNode.style.display = "none";
					} 
					else {
						filteredPara = document.createElement('p');
						if(modules['filterComments'].options.filteredCommentText.value){
						filteredPara.innerHTML = modules['filterComments'].options.filteredCommentText.value;
						} else {filteredPara.innerHTML="[Filtered] - Click to reveal";};
						filteredPara.setAttribute('style', 'cursor:pointer;font-weight:bolder !important;');
						filteredPara.style.color = modules['filterComments'].options.filteredCommentTextColour.value;
						filteredPara.setAttribute('onclick',';this.style.display="none";this.parentNode.querySelector(".md").style.display="block";');
						ele[i].parentNode.appendChild(filteredPara);
						ele[i].style.display="none";
						}
					}
				}
            }	
	},
	go: function () {
		if ((this.isEnabled()) && (this.isMatchURL())) {
			if (this.options.keywords.value) {
			document.body.addEventListener('DOMNodeInserted', function(ev) {
            if ((event.target.tagName == 'DIV') && (/even/ig.test(event.target.getAttribute('class')))) {
                var ele = ev.target.querySelectorAll('.md');
                modules['filterComments'].applyCommentFilter(ele);
            }
        }, false);
        var ele = document.querySelectorAll('.commentarea:not(.side) .sitetable .md:not(.markhelp)');
        this.applyCommentFilter(ele);
		}
		}
		
    },
	filterComment: function(comment) {
		return this.arrayContainsSubstring(this.options.keywords.value, comment.toLowerCase());
	},
	arrayContainsSubstring: function(obj, substring) {
		var re;
		for(var j=0, lenobj = obj.length;j<lenobj;j+=1){
		re = "\\b" + obj[j].toString().toLowerCase() + "\\b";
		if (substring.match(re)) {
			return true;
		}		
		}
		return false;	
		}
	
};
