/* @flow */

/* eslint-disable no-await-in-loop */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const loggedInEnvironment = 'export const ajax = async () => ({ kind: "t2", data: { name: "example" } });';

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
