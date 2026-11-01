/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

const redirectHostnames = ['reddit.com', 'www.reddit.com', 'new.reddit.com', 'm.reddit.com', 'amp.reddit.com', 'i.reddit.com', 'sh.reddit.com'];

test('redirects only the allowed hostnames and preserves the rest of the URL', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
	});

	for (const hostname of redirectHostnames) {
		for (const path of [
			'/', '/r/Enhancement/?sort=new#comments', '/r/settings/comments/123/title/', '/r/test/search?q=settings',
			'/mailbox', '/answerswiki', '/r/subreddit_name', '/message/compose', '/message/inbox/',
			'/?new_reddit=false', '/?not_new_reddit=true', '/?new_reddit=trueish', '/#new_reddit=true',
			'/gallery', '/gallery/', '/galleryfoo', '/r/Enhancement/gallery/633x7q',
			'/api/filter', '/api/filters/', '/r/api/filter/',
		]) {
			location.href = `https://${hostname}${path}`;
			redirector.module.beforeLoad();
			t.is(redirects.pop(), `https://old.reddit.com${path}`);
		}
	}

	for (const hostname of ['old.reddit.com', 'en.reddit.com', 'mod.reddit.com', 'modmail.reddit.com', 'chat.reddit.com', 'oauth.reddit.com', 'i.redd.it', 'reddit.com.example.com', 'example.com']) {
		location.href = `https://${hostname}/r/Enhancement/`;
		redirector.module.beforeLoad();
		t.is(redirects.length, 0, `${hostname} is not redirected`);
	}
});

test('redirects galleries to the old Reddit comments page', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
	});

	for (const hostname of [...redirectHostnames, 'old.reddit.com']) {
		for (const [path, expected] of [
			['/gallery/633x7q', '/comments/633x7q'],
			['/gallery/633x7q/', '/comments/633x7q/'],
			['/Gallery/633x7q?utm_source=share#media', '/comments/633x7q?utm_source=share#media'],
		]) {
			location.href = `https://${hostname}${path}`;
			redirector.module.beforeLoad();
			t.is(redirects.pop(), `https://old.reddit.com${expected}`);
		}
	}

	location.href = 'https://www.reddit.com/gallery/633x7q?new_reddit=true';
	redirector.module.beforeLoad();
	t.is(redirects.length, 0);
});

test('leaves pages requiring new Reddit on every allowed hostname', async t => {
	const redirects = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
	}, {
		location,
		window: { location: { replace: url => redirects.push(url) } },
	});
	const paths = [
		'/settings', '/settings/', '/settings/profile',
		'/mod', '/mod/', '/mod/mail/all', '/modmail', '/modmail/all',
		'/poll', '/poll/', '/poll/633x7q/',
		'/media', '/media/', '/media?url=https%3A%2F%2Fi.redd.it%2Fexample.jpg', '/media?url=not-a-url',
		'/media/example', '/settingswiki', '/moderator', '/polling',
		'/topics', '/topics/gaming', '/community-points', '/community-points/',
		'/appeal', '/appeal/', '/appeals', '/appeals/status',
		'/notifications', '/notifications/', '/message/compose/?to=example',
		'/api/filter/', '/api/filter/user/example/f/all', '/API/Filter/user/example/f/all?raw_json=1',
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
			redirector.module.beforeLoad();
			t.is(redirects.length, 0, `${location.href} is not redirected`);
		}
	}
});
