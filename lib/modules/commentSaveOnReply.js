/* @flow */
import { i18n } from '../environment';
import { Module } from '../core/module';
import { watchForThings } from '../utils';

export const module: Module<*> = new Module('commentSaveOnReply');

module.moduleName = 'commentSaveOnReplyName'; // add the friendly name to locales/locales/en.js for i18n
module.category = 'commentsCategory'; // categories from locales/locales/en.js
module.description = 'commentSaveOnReplyDesc';
module.options = {
};

module.include = [
	'comments',
];

module.beforeLoad = () => {
	watchForThings(['comment'], addPreviousCommentButton);
};

module.go = () => { // Optional: runs after <body> is ready and `beforeLoad` (in all modules) is complete
	const replyButtons = document.getElementsByClassName('access-required');
	for (const button of replyButtons) {
		button.addEventListener('click', saveComment, false);
	}
};
function addPreviousCommentButton(thing) {
	// Add a button to the button list to view
	// the previous versions of the comment
	const buttonsLists = thing.element.querySelector('ul.buttons');
	const button = document.createElement('LI');
	const link = document.createElement('a');
	link.addEventListener('click', loadComment, false);
	link.href = '#';
	link.innerHTML = `${i18n('commentSaveOnReplyButton')}-RES`;
	button.appendChild(link);
	buttonsLists.appendChild(button);
}
function updateButton(button, removed) {
	// removed is a bool for whether or not the preview was just removed
	// takes the <a> element when clicked
	if (removed) {
		button.innerHTML = `${i18n('commentSaveOnReplyButton')}-RES`;
		button.removeEventListener('click', hidePreviousComment, false);
		button.addEventListener('click', loadComment, false);
	} else {
		button.innerHTML = `${i18n('commentSaveOnReplyHideButton')}-RES`;
		button.removeEventListener('click', loadComment, false);
		button.addEventListener('click', hidePreviousComment, false);
	}
}
// @flow
function showPreviousComment(comment, commentElement) {
	// displays the comment under the current comment
	const div = document.createElement('div');
	div.classList.add('previous');
	if (comment !== null && comment !== undefined) {
		div.innerHTML = `<p><mark>${i18n('commentSaveOnReplyTitle')}: </mark></p>${comment}`;
	}
	const commentArea = commentElement.getElementsByClassName('md')[0];
	commentArea.appendChild(div);
}

function hidePreviousComment() {
	event.preventDefault();
	const commentArea = this.parentElement.parentElement.parentElement;
	const md = commentArea.getElementsByClassName('md')[0];
	const prev = md.getElementsByClassName('previous')[0];
	md.removeChild(prev);
	updateButton(this, true);
}

function notFound(button) {
	const commentArea = button.parentElement.parentElement.parentElement;
	const md = commentArea.getElementsByClassName('md')[0];
	const div = document.createElement('div');
	div.classList.add('previous');
	div.innerHTML = `<p><mark>${i18n('commentSaveOnReplyNotFound')} </mark></p>`;
	md.appendChild(div);
}

function loadComment() {
	// Checks local storage for a previous version of the comment
	const id = getCommentId(this.parentElement.parentElement.parentElement);
	event.preventDefault();
	const comment = localStorage.getItem(id);
	if (comment === null) {
		notFound(this);
		this.removeEventListener('click', loadComment, false);
		this.addEventListener('click', () => { event.preventDefault(); }, false);
		return false;
	} else {
		showPreviousComment(comment, this.parentElement.parentElement.parentElement);
		updateButton(this, false);
		return true;
	}
}
function getCommentId(commentElement) {
	// Returns the comment id.
	// takes the div of class "entry" as parameter
	const id = commentElement.getElementsByClassName('usertext')[0].thing_id;

	return id.value;
}
function saveComment() {
	// save
	// id is reddits id for the comment
	const commentElement = this.parentElement.parentElement.parentElement;
	const comment = commentElement.getElementsByClassName('md')[0];
	const id = getCommentId(commentElement);
	localStorage.setItem(id, comment.innerHTML);
}

