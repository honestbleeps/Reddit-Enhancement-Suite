// @flow
import { JSAPI_CONSUMER_NAME } from '../constants/jsapi';
import type {
	EventData, // eslint-disable-line no-unused-vars
	CommentEventData, // eslint-disable-line no-unused-vars
	CommentAuthorEventData, // eslint-disable-line no-unused-vars
	PostAuthorEventData, // eslint-disable-line no-unused-vars
	PostEventData, // eslint-disable-line no-unused-vars
	SubredditEventData, // eslint-disable-line no-unused-vars
	UserHovercardEventData, // eslint-disable-line no-unused-vars
	PostModToolsEventData, // eslint-disable-line no-unused-vars
} from '../types/events';

const callbacks = {
	comment: [],
	subreddit: [],
	postAuthor: [],
	post: [],
	userHovercard: [],
	commentAuthor: [],
	postModTools: [],
	'*': [],
};

/* eslint-disable no-redeclare, no-unused-vars */
declare function watchForRedditEvents(type: 'comment', callback: (HTMLElement, CommentEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'subreddit', callback: (HTMLElement, SubredditEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'postAuthor', callback: (HTMLElement, PostAuthorEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'post', callback: (HTMLElement, PostEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'userHovercard', callback: (HTMLElement, UserHovercardEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'commentAuthor', callback: (HTMLElement, CommentAuthorEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: 'postModTools', callback: (HTMLElement, PostModToolsEventData) => void | Promise<void>): void;
declare function watchForRedditEvents(type: '*', callback: (HTMLElement, EventData) => void | Promise<void>): void;

export function watchForRedditEvents(type: $Keys<typeof callbacks>, callback) {
	if (!callbacks[type]) {
		callbacks[type] = [];
	}
	callbacks[type].push(callback);
}
/* eslint-enable no-redeclare */

function handleRedditEvent(event) {
	const { target, detail: { type, data } } = event;
	const fns = callbacks[type] || callbacks['*'];
	if (!fns) {
		if (process.env.NODE_ENV === 'development') {
			console.warn('Unhandled reddit event type:', type);
		}
		return;
	}

	let expandoId = `${type}|`;
	switch (type) {
		case 'postAuthor':
			expandoId += data.post.id;
			break;
		case 'commentAuthor':
			expandoId += data.comment.id;
			break;
		case 'userHovercard':
			expandoId += `${data.contextId}|${data.user.id}`;
			break;
		case 'subreddit':
		case 'post':
		case 'postModTools':
		default:
			expandoId += data.id;
			break;
	}

	const update = target.eventData && target.eventData._id === expandoId ?
		(target.eventData._update || 0) + 1 :
		0;

	const eventData = {
		...data,
		_id: expandoId,
		_type: type,
		_update: update,
	};

	target.eventData = eventData;

	const ownedTarget = target.querySelector(`[data-name="${JSAPI_CONSUMER_NAME}"]`);
	for (const fn of fns) {
		try {
			fn(ownedTarget, eventData);
		} catch (e) {
			console.log(e);
		}
	}
}

export function initD2xWatcher() {
	document.addEventListener('reddit', (handleRedditEvent: any), true);
	const meta = document.createElement('meta');
	meta.name = 'jsapi.consumer';
	meta.content = JSAPI_CONSUMER_NAME;
	document.head.appendChild(meta);
	meta.dispatchEvent(new CustomEvent('reddit.ready'));
}
