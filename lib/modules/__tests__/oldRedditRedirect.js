/* @flow */

/* eslint-disable no-await-in-loop */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const NEW_REDDIT_HOSTNAMES = ['reddit.com', 'www.reddit.com', 'new.reddit.com', 'sh.reddit.com'];

const AUTH_PATHS = [
	'/login', '/login/', '/Login', '/login/?dest=https%3A%2F%2Fold.reddit.com%2F',
	'/login/?reason=lor2&dest=https%3A%2F%2Fold.reddit.com%2Fr%2Fall%2F',
	'/logout', '/register', '/register/', '/account/login', '/account/register/', '/account/sso/one_tap/',
	'/password', '/password/', '/username', '/verification/abc123', '/onboarding', '/onboarding/',
	'/api/login', '/api/v1/authorize?client_id=example&response_type=code', '/api/v1/authorize.compact',
];

// Paths that look like auth pages but aren't
const NON_AUTH_PATHS = ['/r/login', '/loginhelp', '/accounts', '/user/register', '/?dest=%2Flogin'];

// Minimal DOM: elements with parent/children, logout forms and hidden inputs
function fakeDom() {
	class Element {
		parent = null;
		children = [];
		isForm = false;

		closest(selector) {
			if (this.isForm && selector.includes('form')) return this;
			return this.parent ? this.parent.closest(selector) : null;
		}

		querySelector(selector) {
			return this.children.find(child => child instanceof HTMLInputElement && selector.includes(`name="${child.name}"`)) || null;
		}

		append(child) {
			child.parent = this;
			this.children.push(child);
		}
	}

	class HTMLFormElement extends Element {
		isForm = true;
	}

	class HTMLInputElement extends Element {
		type = '';
		name = '';
		value = '';
	}

	const listeners = [];
	const storage = new Map();

	return {
		Element,
		HTMLFormElement,
		HTMLInputElement,
		listeners,
		document: {
			addEventListener: (type, listener, capture) => listeners.push({ type, listener, capture }),
			createElement: () => new HTMLInputElement(),
		},
		sessionStorage: {
			getItem: key => (storage.has(key) ? storage.get(key) : null),
			setItem: (key, value) => storage.set(key, String(value)),
			removeItem: key => storage.delete(key),
		},
	};
}

/**
 * Loads the module with mocked globals.
 * `loggedIn` is whether old Reddit considers the user logged in: true, false or 'error' (the login check throws).
 */
async function setup(loggedIn = true) {
	const state = { loggedIn, requests: [] };
	const location = { href: '' };
	const redirects = [];
	const dom = fakeDom();

	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': `
			export async function ajax({ url }) {
				globalThis.state.requests.push(url);
				if (globalThis.state.loggedIn === 'error') throw new Error('network');
				return globalThis.state.loggedIn ? { kind: 't2', data: { name: 'example' } } : {};
			}
		`,
	}, {
		...dom,
		location,
		window: { location: { replace: url => redirects.push(url) } },
		globalThis: { state },
	});

	return {
		state,
		dom,
		// Runs the module on `href` and returns the redirect target, if any
		async visit(href) {
			location.href = href;
			await redirector.module.beforeLoad();
			if (redirects.length > 1) throw new Error(`Expected at most one redirect, got ${redirects.length}`);
			return redirects.pop();
		},
	};
}

test('logged in: redirects new Reddit hostnames to old Reddit, preserving the rest of the URL', async t => {
	const { visit } = await setup();
	const paths = [
		'/', '/r/Enhancement/?sort=new#comments', '/r/settings/comments/123/title/', '/r/test/search?q=settings',
		'/mailbox', '/answerswiki', '/r/subreddit_name', '/message/compose', '/message/inbox/',
		'/?new_reddit=false', '/?not_new_reddit=true', '/?new_reddit=trueish', '/#new_reddit=true',
		...NON_AUTH_PATHS,
	];

	for (const hostname of NEW_REDDIT_HOSTNAMES) {
		for (const path of paths) {
			t.is(await visit(`https://${hostname}${path}`), `https://old.reddit.com${path}`);
		}
	}
});

test('logged in: ignores other hostnames', async t => {
	const { visit } = await setup();
	for (const hostname of [
		'old.reddit.com', 'm.reddit.com', 'np.reddit.com', 'en.reddit.com', 'mod.reddit.com', 'modmail.reddit.com',
		'chat.reddit.com', 'oauth.reddit.com', 'i.redd.it', 'reddit.com.example.com', 'example.com',
	]) {
		const href = `https://${hostname}/r/Enhancement/`;
		t.is(await visit(href), undefined, href);
	}
});

test('logged in: leaves pages that require new Reddit', async t => {
	const { visit } = await setup();
	const paths = [
		'/settings', '/settings/', '/settings/profile',
		'/mod', '/mod/', '/mod/mail/all', '/modmail', '/modmail/all',
		'/poll', '/poll/', '/poll/633x7q/',
		'/gallery', '/gallery/', '/gallery/633x7q',
		'/media', '/media/', '/media?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg', '/media?url=not-a-url',
		'/media/example', '/settingswiki', '/moderator', '/polling',
		'/topics', '/topics/gaming', '/community-points', '/community-points/',
		'/appeal', '/appeal/', '/appeals', '/appeals/status',
		'/notifications', '/notifications/', '/message/compose/?to=example',
		'/mail', '/mail/', '/mail/all', '/answers', '/answers/', '/answers/example',
		'/r/subreddit', '/r/subreddit/', '/r/subreddit/comments/example',
		'/s/abc123', '/r/Enhancement/s/abc123', '/user/example/s/abc123', '/u/example/s/abc123',
		'/Settings/Profile', '/r/Enhancement/S/abc123?share_id=example#comments',
		'/?new_reddit=true', '/r/Enhancement/?sort=new&new_reddit=true#comments',
		'/?new_reddit=true&sort=new', '/?new_reddit=false&new_reddit=true',
	];

	for (const hostname of NEW_REDDIT_HOSTNAMES) {
		for (const path of paths) {
			const href = `https://${hostname}${path}`;
			t.is(await visit(href), undefined, href);
		}
	}
});

test('logged in: lets auth flows finish before redirecting', async t => {
	const { visit } = await setup();
	for (const hostname of NEW_REDDIT_HOSTNAMES) {
		for (const path of AUTH_PATHS) {
			const href = `https://${hostname}${path}`;
			t.is(await visit(href), undefined, href);
		}
	}
});

test('logged out: redirects old Reddit to www.reddit.com, preserving the rest of the URL', async t => {
	const { visit } = await setup(false);
	for (const path of ['/', '/r/all/', '/r/Enhancement/?sort=new#comments', ...NON_AUTH_PATHS]) {
		t.is(await visit(`https://old.reddit.com${path}`), `https://www.reddit.com${path}`);
	}

	for (const hostname of [...NEW_REDDIT_HOSTNAMES, 'm.reddit.com', 'np.reddit.com', 'example.com']) {
		const href = `https://${hostname}/r/Enhancement/`;
		t.is(await visit(href), undefined, href);
	}
});

test('logged out: stays on old Reddit auth pages', async t => {
	const { visit } = await setup(false);
	for (const path of AUTH_PATHS) {
		const href = `https://old.reddit.com${path}`;
		t.is(await visit(href), undefined, href);
	}
});

test('does not redirect when the login check fails', async t => {
	const { visit } = await setup('error');
	for (const hostname of [...NEW_REDDIT_HOSTNAMES, 'old.reddit.com']) {
		const href = `https://${hostname}/r/Enhancement/`;
		t.is(await visit(href), undefined, href);
	}
});

test('asks old Reddit whether the user is logged in, from both old and new Reddit', async t => {
	const { visit, state } = await setup();
	await visit('https://www.reddit.com/r/all/');
	await visit('https://new.reddit.com/r/all/');
	await visit('https://old.reddit.com/r/all/');
	t.deepEqual(state.requests, Array(3).fill('https://old.reddit.com/api/me.json'));
});

test('does not check login on pages that are never redirected', async t => {
	const { visit, state } = await setup();
	await visit('https://www.reddit.com/settings/');
	await visit('https://www.reddit.com/login/');
	await visit('https://old.reddit.com/login/');
	await visit('https://example.com/');
	t.deepEqual(state.requests, []);
});

test('keeps users on new Reddit when old Reddit does not accept their session', async t => {
	// e.g. logged in on www.reddit.com, but old Reddit sends them to /login/?reason=lor2
	const { visit } = await setup(false);
	t.is(await visit('https://www.reddit.com/r/all/'), undefined);
	t.is(await visit('https://old.reddit.com/r/all/'), 'https://www.reddit.com/r/all/');
	t.is(await visit('https://old.reddit.com/login/?reason=lor2&dest=https%3A%2F%2Fold.reddit.com%2Fr%2Fall%2F'), undefined);
});

test('logout: only watches for logout on old Reddit', async t => {
	const { visit, dom } = await setup();
	for (const hostname of NEW_REDDIT_HOSTNAMES) {
		await visit(`https://${hostname}/r/Enhancement/`);
	}
	t.is(dom.listeners.length, 0);

	await visit('https://old.reddit.com/r/Enhancement/');
	t.deepEqual(dom.listeners.map(({ type, capture }) => [type, capture]), [['click', true], ['submit', true]]);
});

test('logout: points old Reddit logout forms at www.reddit.com', async t => {
	const { visit, dom } = await setup();
	t.is(await visit('https://old.reddit.com/r/Enhancement/'), undefined);
	const [{ listener }] = dom.listeners;

	// Adds a `dest` input when missing
	const form = new dom.HTMLFormElement();
	const link = new dom.Element();
	form.append(link);
	listener({ target: link });
	const [, added] = form.children;
	t.is(added.name, 'dest');
	t.is(added.type, 'hidden');
	t.is(added.value, 'https://www.reddit.com/');

	// Overwrites an existing `dest` input
	const formWithDest = new dom.HTMLFormElement();
	const dest = new dom.HTMLInputElement();
	dest.name = 'dest';
	dest.value = '/r/Enhancement/';
	formWithDest.append(dest);
	listener({ target: formWithDest });
	t.is(dest.value, 'https://www.reddit.com/');
	t.is(formWithDest.children.length, 1);

	// Ignores clicks outside logout forms
	const other = new dom.Element();
	listener({ target: other });
	t.is(other.children.length, 0);
});

test('logout: sends users who just logged out to www.reddit.com, even from old Reddit auth pages', async t => {
	const { visit, dom, state } = await setup();
	await visit('https://old.reddit.com/');
	const form = new dom.HTMLFormElement();
	dom.listeners[0].listener({ target: form });

	state.loggedIn = false;
	t.is(await visit('https://old.reddit.com/login/?reason=lor2&dest=https%3A%2F%2Fold.reddit.com%2F'), 'https://www.reddit.com/');
	t.is(await visit('https://old.reddit.com/login/'), undefined, 'the logout is only remembered once');

	dom.sessionStorage.setItem('RES.oldRedditRedirect.loggedOutAt', String(Date.now() - 5 * 60 * 1000));
	t.is(await visit('https://old.reddit.com/login/'), undefined, 'an old logout is ignored');

	state.loggedIn = true;
	dom.listeners[0].listener({ target: form });
	t.is(await visit('https://old.reddit.com/r/Enhancement/'), undefined, 'a failed logout keeps the user on old Reddit');
});
