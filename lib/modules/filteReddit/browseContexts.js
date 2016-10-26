import escapeStringRegexp from 'escape-string-regexp';
import {
	currentMultireddit,
	currentSubreddit,
	currentUserProfile,
	regexes,
	isPageType,
	loggedInUser,
} from '../../utils';
import * as CustomToggles from '../customToggles';

export default {
	dow: {
		name: 'Day of week',
		defaultTemplate() {
			return { type: 'dow', days: [] };
		},
		fields: [
			'current day of the week is ',
			{
				type: 'checkset',
				id: 'days',
				// Uses same 3 letter names as
				// .toLocaleDateString('en-US', {weekday: 'short'}))
				items: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(','),
			},
		],
		evaluate(thing, data) {
			// duplicating because I was having issues with accessing a variable before it was assigned
			const dayList = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',');
			// Get 3 letter name
			const currentDOW = dayList[new Date().getDay()];

			// At the time of writing Safari doesn't support the toLocaleDateString
			// const currentDOW = new Date().toLocaleDateString('en-US', {weekday: 'short'});
			return data.days.includes(currentDOW);
		},
	},
	currentSub: {
		name: 'When browsing a subreddit',
		defaultTemplate(patt) {
			return { type: 'currentSub', patt: patt || '' };
		},
		fields: [
			'when browsing /r/',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			const sub = currentSubreddit();
			if (!sub) return false;
			return new RegExp(`^(${data.patt})$`, 'i').test(sub);
		},
	},
	currentUserProfile: {
		name: 'When browsing a user profile',
		defaultTemplate(patt) {
			return { type: 'currentUserProfile', patt: patt || '' };
		},
		fields: [
			'when browsing /u/',
			{ type: 'text', id: 'patt', validator: RegExp },
			'\'s posts',
		],
		evaluate(thing, data) {
			const user = currentUserProfile();
			if (!user) return false;
			return new RegExp(`^(${data.patt})$`, 'i').test(user);
		},
	},
	currentMulti: {
		name: 'When browsing a multireddit',
		defaultTemplate(user, name) {
			return { type: 'currentMulti', user: user || '', name: name || '' };
		},
		fields: [
			'when browsing /u/',
			{ type: 'text', id: 'user', validator: RegExp },
			'/m/',
			{ type: 'text', id: 'name', validator: RegExp },
		],
		evaluate(thing, data) {
			const rawMulti = currentMultireddit();
			if (!rawMulti) return false;
			const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i).exec(rawMulti);
			if (!parts) return false;
			const multiNameRE = data.name.trim() === '' ? /.*/ : new RegExp(`^(${data.name})$`, 'i');
			const user = parts[1];
			const multi = parts[2];
			if (user === 'me' && data.name.trim() === 'me') {
				return multiNameRE.test(multi);
			} else {
				return (data.user.trim() === '' ? /.*/ : new RegExp(`^(${data.user})$`, 'i')).test(user) && multiNameRE.test(multi);
			}
		},
	},
	currentLocation: {
		name: 'When browsing in location',
		defaultTemplate(patt) {
			return { type: 'currentLocation', patt: patt || this.getCurrent() };
		},
		fields: [
			'when browsing',
			{ type: 'text', id: 'patt', validator: RegExp },
		],
		evaluate(thing, data) {
			return this.getCurrent() === data.patt;
		},
		getCurrent() {
			const regex = Object.keys(regexes).find(key => location.pathname.match(regexes[key]));
			if (!regex) return location.pathname.toLowerCase();

			// examples: domain-youtube.com, user-gueor, subreddit-enhancement+resissues
			return escapeStringRegexp(
				[
					regex,
					...(location.pathname.match(regexes[regex]) || []).slice(1), // ignore matched string
				]
					.filter(v => v)
					.join('-')
					.toLowerCase()
			);
		},
	},
	browsingFrontPage: {
		name: 'Browsing the front page',
		defaultTemplate() {
			return { type: 'browsingFrontPage' };
		},
		fields: [
			'when browsing the front page',
		],
		evaluate() {
			return isPageType('linklist') &&
				!currentSubreddit() &&
				!currentMultireddit() &&
				!currentUserProfile();
		},
	},
	loggedInAs: {
		name: 'Logged in user',
		defaultTemplate(patt) {
			return { type: 'loggedInAs', patt: patt || '' };
		},
		fields: [
			'logged in as /u/',
			{ type: 'text', id: 'loggedInAs', validator: RegExp },
		],
		evaluate(thing, data) {
			const myName = loggedInUser();
			if (!myName) {
				return false;
			}
			return new RegExp(`^(${data.loggedInAs})$`, 'i').test(myName);
		},
	},
	toggle: {
		name: 'Custom toggle',
		defaultTemplate() {
			return { type: 'toggle', toggleName: '' };
		},
		fields: [
			'custom toggle named',
			{ type: 'text', id: 'toggleName', validator: RegExp },
			'is turned on',
		],
		evaluate(thing, data) {
			const toggleName = data.toggleName;
			return CustomToggles.toggleActive(toggleName);
		},
	},
};
