modules['filterComments'] = {
    moduleID: 'filterComments',
    moduleName: 'Filter Comments',
    options: {
        // any configurable options you have go here...
        // options must have a type and a value.. 
        // valid types are: text, boolean (if boolean, value must be true or false)
        // for example:
        keywords: {
            type: 'table',
            fields: [
                { name: 'keyword', type: 'text' }
            ],
            value: [
            ],
            description: 'Type in title keywords you want to ignore if they show up in a comment'
        },
        hideNest: {
            type: 'boolean',
            value: false,
            description: 'If a comment is filtered, delete the comment and all responses too. If false, will only remove comment text'
        }
    },
    description: 'Filter comments containing some text',
    isEnabled: function() {
        return RESConsole.getModulePrefs(this.moduleID);
    },
    include: Array(
        /https?:\/\/([a-z]+).reddit.com\/[-\w\.\/]+\/comments\/[-\w\.]+/i
    ),
    isMatchURL: function() {
        return RESUtils.isMatchURL(this.moduleID);
    },
    go: function() {
        if ((this.isEnabled()) && (this.isMatchURL())) {
            if (this.options.keywords.value){ // make sure there's something to filter
                var ele=document.getElementsByClassName('usertext-body');
                for(i in ele){
                    if(ele[i].innerHTML){ //make sure it's not null
                        //check first element in case it's post text. If not, do filter check
                        if (i==1 && ele[i].parentNode.parentNode.parentNode.parentNode.getAttribute('class').indexOf('link')){ 
                            //post text or link. Do not filter.
                        }else if (this.filterComment(ele[i].innerHTML)){ //if matches filters
                            if (this.options.hideNest.value){
                                ele[i].parentNode.parentNode.parentNode.parentNode.setAttribute('style','display:none');
                            }else{
                                ele[i].parentNode.parentNode.parentNode.setAttribute('style','display:none');
                            }       
                        }
                    }
                }
            }
        }
    },
    filterComment: function(comment) {
        return this.arrayContainsSubstring(this.options.keywords.value, comment.toLowerCase());
    },
    arrayContainsSubstring: function(obj, substring) {
      var i = obj.length;
      while (i--) {
        if ((obj[i] != null) && (substring.indexOf(obj[i].toString().toLowerCase()) != -1)) {
          return true;
        }
      }
      return false;
    }

}; 
