import { extendDeep, numericalCompare } from '../../utils';
import * as CustomToggles from '../../modules/customToggles';

export const postCommentIdentifier = (options) => ({
	advanced: true, // VERY
	type: 'builder',
	value: [],
	addItemText: '+add custom filter',
	defaultTemplate() {
		return {
			note: '', ver: 1,
			body: { type: 'group', op: 'all', of: [/* empty */] },
		};
	},
	cases: {
		group: {
			name: 'Group of conditions',
			defaultTemplate(op, of) {
				return {
					type: 'group',
					op: (op || 'all'),
					of: (of || []),
				};
			},
			fields: [
				{ type: 'select', options: ['all', 'any', 'one', 'none'], id: 'op' },
				' of these are true:',
				{ type: 'multi', include: 'all', id: 'of' },
			],
			evaluate(thing, data, config) {
				if (data.op === 'all') {
					return data.of.every(condition => config[condition.type].evaluate(thing, condition, config));
				} else if (data.op === 'any') {
					return data.of.some(condition => config[condition.type].evaluate(thing, condition, config));
				} else if (data.op === 'one') {
					let seenTrue = false;
					for (const condition of data.of) {
						const result = config[condition.type].evaluate(thing, condition, config);
						if (result) {
							if (seenTrue) return false;
							seenTrue = true;
						}
					}
					return seenTrue;
				} else if (data.op === 'none') {
					return data.of.every(condition => !config[condition.type].evaluate(thing, condition, config));
				} else {
					throw new RangeError(`Illegal group operator: "${data.op}"`);
				}
			},
		},
		score: {
			name: 'Score',
			defaultTemplate(op, val) {
				return {
					type: 'score',
					op: (op || '>'),
					val: (val || 0),
				};
			},
			fields: [
				'post has ',
				{ type: 'select', options: 'COMPARISON', id: 'op' },
				' ',
				{ type: 'number', id: 'val' },
				'points',
			],
			evaluate(thing, data) {
				const score = thing.getScore();
				if (typeof score === 'undefined') {
					return false;
				}

				return numericalCompare(data.op, score, data.val);
			},
		},
		subreddit: {
			name: 'Subreddit',
			defaultTemplate(patt) {
				return { type: 'subreddit', patt: patt || '' };
			},
			fields: [
				'posted in /r/', { type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const subreddit = thing.getSubreddit();
				if (!subreddit) {
					return false;
				}
				const pattern = new RegExp(`^(${data.patt})$`, 'i');
				return pattern.test(subreddit.trim());
			},
		},
		username: {
			name: 'Username',
			defaultTemplate(patt) {
				return { type: 'username', patt: patt || '' };
			},
			fields: [
				'posted by /u/', { type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const user = thing.getAuthor();
				if (!user) {
					return false;
				}
				const pattern = new RegExp(`^(${data.patt})$`, 'i');
				return pattern.test(user);
			},
		},
		commentCount: {
			name: 'Comment count',
			defaultTemplate(op, val) {
				return { type: 'commentCount', op: op || '>', val: val || 0 };
			},
			fields: [
				'post has ',
				{ type: 'select', options: 'COMPARISON', id: 'op' },
				' ',
				{ type: 'number', id: 'val' },
				' comments',
			],
			evaluate(thing, data) {
				const commentCount = thing.getCommentCount();
				if (typeof commentCount !== 'number') {
					return false;
				}
				return numericalCompare(data.op, commentCount, data.val);
			},
		},
		userAttr: {
			name: 'User attribute (friend/mod/etc...)',
			defaultTemplate(cat) {
				return { type: 'userAttr', attr: cat || 'friend' };
			},
			fields: [
				'user is ',
				{ type: 'select', id: 'attr', options: [
					['a friend', 'friend'],
					['a moderator', 'moderator'],
					['an admin', 'admin'],
					// ['op', 'submitter]',
					'me',
				] },
			],
			evaluate(thing, data) {
				if (data.attr === 'me') {
					// No standard marker for my own posts so compare against the logged in user
					let myName = loggedInUser();
					if (!myName) {
						return false;
					}
					const author = thing.getAuthor().toLowerCase();
					myName = myName.trim().toLowerCase();

					return author === myName;
				} else {
					// The other cases have hardcoded class names
					const element = thing.getAuthorElement();
					return element.classList.contains(data.attr);
				}
			},
		},
		domain: {
			name: 'Link domain name',
			defaultTemplate(dom) {
				return { type: 'domain', patt: dom || '' };
			},
			fields: [
				'post links to the domain ',
				{ type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const domain = thing.getPostDomain();
				if (!domain) {
					return false;
				}
				const pattern = new RegExp(`^(${data.patt})$`, 'i');
				return pattern.test(domain);
			},
		},
		dow: {
			name: 'Day of week',
			defaultTemplate() {
				return { type: 'dow', days: [] };
			},
			fields: [
				'current day of the week is ',
				{
					type: 'checkset', id: 'days',
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
		linkFlair: {
			name: 'Link flair',
			defaultTemplate(patt) {
				return { type: 'linkFlair', patt: patt || '' };
			},
			fields: [
				'post has link flair matching ',
				{ type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const text = thing.getPostFlairText();
				if (!text) {
					return false;
				}
				const pattern = new RegExp(`^(${data.patt})$`, 'i');
				return pattern.test(text.trim());
			},
		},
		userFlair: {
			name: 'User flair',
			defaultTemplate(patt) {
				return { type: 'userFlair', patt: patt || '' };
			},
			fields: [
				'author of this post has flair matching ',
				{ type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const text = thing.getUserFlairText();
				if (!text) {
					return false;
				}
				const pattern = new RegExp(`^(${data.patt})$`, 'i');
				return pattern.test(text);
			},
		},
		postType: {
			name: 'Post type',
			defaultTemplate(kind) {
				return { type: 'postType', kind: kind || 'link' };
			},
			fields: [
				'post is a ', {
					// id: 'type' results in a collsion
					type: 'select', id: 'kind',
					options: [
						['link post', 'link'],
						['self post', 'self'],
						// 'comment',
					],
				}, '.',
			],
			evaluate(thing, data) {
				switch (data.kind) {
					case 'comment': return thing.isComment();
					case 'self':    return thing.isSelfPost();
					case 'link':    return thing.isLinkPost();
					default: throw new Error(`unknown post type "${data.kind}"`);
				}
			},
		},
		postTitle: {
			name: 'Post title',
			defaultTemplate(patt) {
				return { type: 'postTitle', patt: patt || '' };
			},
			fields: [
				'post\'s title contains ', { type: 'text', id: 'patt', validator: RegExp },
			],
			evaluate(thing, data) {
				const title = thing.getTitle();
				// Do not anchor for this case
				return new RegExp(data.patt, 'i').test(title);
			},
		},
		postAge: {
			name: 'Post age',
			defaultTemplate(age) {
				// 4 hours in milliseconds
				return { type: 'postAge', age: age || 4 * 60 * 60 * 1000 };
			},
			fields: [
				'post is ',
				{ type: 'select', id: 'op', options: [
					['more than', '>'],
					['less than', '<'],
				] },
				' ', { type: 'duration', id: 'age' }, ' old',
			],
			evaluate(thing, data) {
				const postTime = thing.getTimestamp();
				if (!postTime) {
					return false;
				}
				const now = new Date();
				return numericalCompare(data.op, now - postTime, data.age);
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
				if (sub === null) return false;
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
				if (user === null) return false;
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
				const parts = (/^(?:user\/)?([a-z0-9_-]+)\/m\/([a-z0-9_-]+)$/i)
					.exec(currentMultireddit());
				if (parts === null) return false;
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
					currentSubreddit() === null &&
					currentMultireddit() === null &&
					currentUserProfile() === null;
			},
		},
		isNSFW: {
			name: 'NSFW post',
			defaultTemplate() {
				return { type: 'isNSFW' };
			},
			fields: [
				'post is marked NSFW',
			],
			evaluate(thing) {
				return thing.classList.contains('over18');
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
		/*
		possible for later:

		res tag
		res score
		up/down/unvoted
		sort
		//*/
	},
	...options
});

export const changeClassnameWhen = function(options = {}, baseGenerator = postCommentIdentifier) {
	const base = baseGenerator();
	const wrapper = {
		addItemText: '+add custom conditions',
		defaultTemplate() {
			return {
				note: '',
				classNames: '',
				ver: 1,
				body: {
					type: 'action',
					op: 'add',
					classNames: 'res-thing-highlighted',
					when: [ /* empty */ ],
				},
			};
		},
		cases: {
			action: {
				name: 'Add/remove classes',
				defaultTemplate(op, classNames, when) {
					return {
						type: 'action',
						op: (op || 'add'),
						classNames: (classNames || 'res-thing-highlighted'),
						when: [ /* empty */ ],
					};
				},
				fields: [
					{ id: 'op', type: 'select', options: [ 'add', 'remove' ] },
					' CSS class names ',
					{ id: 'classNames', type: 'text' },
					' on a post ' /* or comment */ + ' when ',
					{ id: 'when', type: 'multi', include: 'all', exclude: [ 'action' ] },
				],
				evaluate(thing, data, config) {
					const when = data.when.some(condition => config[condition.type].evaluate(thing, condition, config));

					if (!when) {
						return [ [], [] ];
					}

					if (data.op === 'add') {
						return [ data.classNames, [] ];
					} else {
						return [ [], data.classNames ];
					}
				}
			}
		}
	};

	return extendDeep(base, wrapper, options);
}
