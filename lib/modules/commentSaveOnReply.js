/* @flow */
import { i18n } from '../environment';
import { Module } from '../core/module';

export const module: Module<*> = new Module('commentSaveOnReply');

module.moduleName = 'commentSaveOnReplyName'; // add the friendly name to locales/locales/en.js for i18n
module.category = 'commentsCategory'; // categories from locales/locales/en.js
module.description = 'commentSaveOnReplyDesc'
module.options = {
};


module.go = () => { // Optional: runs after <body> is ready and `beforeLoad` (in all modules) is complete
	// Do stuff now!
	// This is where your code goes...
    var replyButtons = document.getElementsByClassName('access-required')
    for (var i = 0; i < replyButtons.length; i++) {
        replyButtons[i].addEventListener('click', saveComment, false)
    }
    addPreviousCommentButton()
};
var addPreviousCommentButton = function () {
    // Add a button to the button list to view 
    // the previous versions of the comment
    var buttonsLists = document.getElementsByClassName("flat-list buttons")
    for(var i = 0; i < buttonsLists.length; i++) {
        var button = document.createElement("LI")
        var link = document.createElement("a")
        link.addEventListener("click", loadComment, false)
        link.href = "javascript:void(0)"
        link.innerHTML = i18n("commentSaveOnReplyButton") + "-RES"
        button.appendChild(link)
        buttonsLists[i].appendChild(button)
    }
}
var updateButton = function (button, removed) {
    // removed is a bool for whether or not the preview was just removed
    // takes the <a> element when clicked
    if (removed) {
        button.innerHTML = i18n("commentSaveOnReplyButton") + "-RES"
        button.removeEventListener("click", hidePreviousComment, false)
        button.addEventListener("click", loadComment, false)
    } else {
        button.innerHTML = i18n("commentSaveOnReplyHideButton") + "-RES"
        button.removeEventListener("click", loadComment, false)
        button.addEventListener("click", hidePreviousComment, false)
    }
}
var showPreviousComment = function (comment, commentElement) {
    // displays the comment under the current comment
    var div = document.createElement("div")
    div.classList.add("previous")
    div.innerHTML = "<p><mark>" + i18n("commentSaveOnReplyTitle") + ": </mark></p>" + comment
    var commentArea = commentElement.getElementsByClassName("md")[0]
    commentArea.appendChild(div)
}

var hidePreviousComment = function () {
    var commentArea = this.parentElement.parentElement.parentElement
    var md = commentArea.getElementsByClassName("md")[0]
    var prev = md.getElementsByClassName("previous")[0]
    md.removeChild(prev)
    updateButton(this, true)
}


var loadComment = function () {
    // Checks local storage for a previous version of the comment
    var id = getCommentId(this.parentElement.parentElement.parentElement)

    var comment = localStorage.getItem(id)
    if (comment == null) {
        alert(i18n("commentSaveOnReplyNotFound"))
        return false
    } else { 
        showPreviousComment(comment, this.parentElement.parentElement.parentElement)
        updateButton(this, false)
        return true
    }
}
var getCommentId = function (commentElement) {
    // Returns the comment id.
    // takes the div of class "entry" as parameter
    var id = commentElement.getElementsByClassName("usertext")[0]["thing_id"]

    return id.value
}
var saveComment = function () {
    // save
    // id is reddits id for the comment
    var commentElement = this.parentElement.parentElement.parentElement
    var comment = commentElement.getElementsByClassName('md')[0]
    var id = getCommentId(commentElement)
    localStorage.setItem(id, comment.innerHTML)

}


