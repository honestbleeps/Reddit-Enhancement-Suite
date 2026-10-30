/* @flow */

/* eslint-disable no-await-in-loop */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const loggedInEnvironment = 'export const ajax = async () => ({ kind: "t2", data: { name: "example" } });';

function fakeDom() {
	class Element {
		parent = null;
		children = [];
		matchesForm = false;

		closest(selector) {
			if (this.matchesForm && selector.includes('form')) return this;
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
		matchesForm = true;
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

const redirectHostnames = ['reddit.com', 'www.reddit.com', 'new.reddit.com', 'sh.reddit.com'];

test('redirects only the allowed hostnames and preserves the rest of the URL', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': loggedInEnvironment,
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
		...fakeDom(),
	});

	for (const hostname of redirectHostnames) {
		for (const path of [
			'/', '/r/Enhancement/?sort=new#comments', '/r/settings/comments/123/title/', '/r/test/search?q=settings',
			'/mailbox', '/answerswiki', '/r/subreddit_name', '/message/compose', '/message/inbox/',
			'/?new_reddit=false', '/?not_new_reddit=true', '/?new_reddit=trueish', '/#new_reddit=true',
		]) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.pop(), `https://old.reddit.com${path}`);
		}
	}

	for (const hostname of ['old.reddit.com', 'np.reddit.com', 'en.reddit.com', 'mod.reddit.com', 'modmail.reddit.com', 'chat.reddit.com', 'oauth.reddit.com', 'i.redd.it', 'reddit.com.example.com', 'example.com']) {
		location.href = `https://${hostname}/r/Enhancement/`;
		await redirector.module.beforeLoad();
		t.is(redirects.length, 0, `${hostname} is not redirected`);
	}
});

test('leaves pages requiring new Reddit on every allowed hostname', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': loggedInEnvironment,
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
		...fakeDom(),
	});
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

	for (const hostname of redirectHostnames) {
		for (const path of paths) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.length, 0, `${location.href} is not redirected`);
		}
	}
});

const loadWithAjax = (ajax, location, redirects) => loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
	'../core/module': 'export class Module {}',
	'../environment': `export const ajax = ${ajax};`,
}, {
	location,
	window: { location: { replace: url => redirects.push(url) } },
	...fakeDom(),
});

const loggedOutPaths = ['/', '/r/all/', '/r/Enhancement/?sort=new#comments', '/r/login', '/?dest=%2Flogin'];

test('sends logged-out users from old Reddit to www.reddit.com', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadWithAjax('async () => ({})', location, redirects);

	for (const path of loggedOutPaths) {
		location.href = `https://old.reddit.com${path}`;
		await redirector.module.beforeLoad();
		t.is(redirects.pop(), `https://www.reddit.com${path}`);
	}

	for (const hostname of [...redirectHostnames, 'np.reddit.com', 'example.com']) {
		for (const path of loggedOutPaths) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.length, 0, `${location.href} is not redirected`);
		}
	}
});

test('does not redirect when the login check fails', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadWithAjax('async () => { throw new Error("network"); }', location, redirects);

	for (const hostname of [...redirectHostnames, 'old.reddit.com']) {
		for (const path of loggedOutPaths) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.length, 0, `${location.href} is not redirected`);
		}
	}
});

test('waits for the auth flow to finish before redirecting logged-in users', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadWithAjax('async () => ({ kind: "t2", data: { name: "example" } })', location, redirects);
	const authPaths = [
		'/login', '/login/', '/login/?dest=https%3A%2F%2Fold.reddit.com%2F', '/Login',
		'/logout', '/register', '/register/', '/account/login', '/account/register/', '/account/sso/one_tap/',
		'/password', '/password/', '/username', '/verification/abc123', '/onboarding', '/onboarding/',
		'/api/login', '/api/v1/authorize?client_id=example&response_type=code', '/api/v1/authorize.compact',
	];

	for (const hostname of redirectHostnames) {
		for (const path of authPaths) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.length, 0, `${location.href} is not redirected`);
		}

		for (const path of ['/r/login', '/loginhelp', '/accounts', '/user/register', '/?dest=%2Flogin']) {
			location.href = `https://${hostname}${path}`;
			await redirector.module.beforeLoad();
			t.is(redirects.pop(), `https://old.reddit.com${path}`);
		}
	}
});

test('leaves logged-out users on old Reddit sign-in pages to avoid a redirect loop', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadWithAjax('async () => ({})', location, redirects);

	for (const path of [
		'/login/?reason=lor2&dest=https%3A%2F%2Fold.reddit.com%2Fr%2Fall%2F',
		'/login', '/login/', '/register', '/password', '/account/login', '/api/v1/authorize?client_id=example',
	]) {
		location.href = `https://old.reddit.com${path}`;
		await redirector.module.beforeLoad();
		t.is(redirects.length, 0, `${location.href} is not redirected`);
	}
});

test('points old Reddit logout forms at www.reddit.com', async t => {
	const redirects = [];
	const location = { href: 'https://old.reddit.com/r/Enhancement/' };
	const dom = fakeDom();
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': loggedInEnvironment,
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
		...dom,
	});

	await redirector.module.beforeLoad();
	t.deepEqual(dom.listeners.map(({ type, capture }) => [type, capture]), [['click', true], ['submit', true]]);
	const [{ listener }] = dom.listeners;

	// Form without a `dest` input gets one added
	const form = new dom.HTMLFormElement();
	const link = new dom.Element();
	form.append(link);
	listener({ target: link });
	t.is(form.children[1].name, 'dest');
	t.is(form.children[1].type, 'hidden');
	t.is(form.children[1].value, 'https://www.reddit.com/');

	// Existing `dest` input is overwritten
	const formWithDest = new dom.HTMLFormElement();
	const dest = new dom.HTMLInputElement();
	dest.name = 'dest';
	dest.value = '/r/Enhancement/';
	formWithDest.append(dest);
	listener({ target: formWithDest });
	t.is(dest.value, 'https://www.reddit.com/');
	t.is(formWithDest.children.length, 1);

	// Clicks outside logout forms are ignored
	const other = new dom.Element();
	listener({ target: other });
	t.is(other.children.length, 0);

	t.is(redirects.length, 0);
});

test('only listens for logout on old Reddit', async t => {
	const redirects = [];
	const location = { href: '' };
	const dom = fakeDom();
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': loggedInEnvironment,
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
		...dom,
	});

	for (const hostname of redirectHostnames) {
		location.href = `https://${hostname}/r/Enhancement/`;
		await redirector.module.beforeLoad();
	}
	t.is(dom.listeners.length, 0);
});

test('sends users who just logged out on old Reddit to www.reddit.com, even from old sign-in pages', async t => {
	const redirects = [];
	const location = { href: 'https://old.reddit.com/' };
	const dom = fakeDom();
	const environment = { loggedIn: true };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': 'export const ajax = async () => (globalThis.environment.loggedIn ? { data: { name: "example" } } : {});',
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
		...dom,
		environment,
		globalThis: { environment },
	});

	await redirector.module.beforeLoad();
	const form = new dom.HTMLFormElement();
	dom.listeners[0].listener({ target: form });

	environment.loggedIn = false;
	location.href = 'https://old.reddit.com/login/?reason=lor2&dest=https%3A%2F%2Fold.reddit.com%2F';
	await redirector.module.beforeLoad();
	t.deepEqual(redirects.splice(0), ['https://www.reddit.com/']);

	// The flag is single-use
	await redirector.module.beforeLoad();
	t.is(redirects.length, 0);

	// A stale flag is ignored
	dom.sessionStorage.setItem('RES.oldRedditRedirect.loggedOutAt', String(Date.now() - 5 * 60 * 1000));
	await redirector.module.beforeLoad();
	t.is(redirects.length, 0);

	// If logout failed, the user stays on old Reddit
	environment.loggedIn = true;
	dom.listeners[0].listener({ target: form });
	location.href = 'https://old.reddit.com/r/Enhancement/';
	await redirector.module.beforeLoad();
	t.is(redirects.length, 0);
});
