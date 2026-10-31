/* @flow */

import test from 'ava';

import { loadModule } from '../../environment/foreground/__tests__/helpers/loadModule.js';

async function loadRedirector(posts = {}, navigation) {
	const redirects = [];
	const requests = [];
	const intervals = [];
	const location = { href: '' };
	const redirector = await loadModule(new URL('../oldRedditRedirect.js', import.meta.url), {
		'../core/module': 'export class Module {}',
		'../environment': 'export const ajax = options => mockAjax(options);',
	}, {
		location,
		window: { navigation, location: { replace: url => redirects.push(url) } },
		setInterval: callback => intervals.push(callback),
		mockAjax: options => {
			requests.push(options);
			if (posts instanceof Error) return Promise.reject(posts);
			return Promise.resolve({ kind: 'Listing', data: { children: posts[options.query.url] || [] } });
		},
	});

	// beforeLoad reads location.href synchronously, so URLs can be visited concurrently
	async function visit(urls) {
		await Promise.all(urls.map(url => {
			location.href = url;
			return redirector.module.beforeLoad();
		}));
		return redirects.splice(0).sort();
	}

	return { visit, requests, location, intervals };
}

const onHostnames = (hostnames, paths) => hostnames.flatMap(hostname => paths.map(path => `https://${hostname}${path}`));

const redirectHostnames = ['reddit.com', 'www.reddit.com', 'new.reddit.com', 'm.reddit.com', 'amp.reddit.com', 'i.reddit.com', 'sh.reddit.com'];

test('redirects only the allowed hostnames and preserves the rest of the URL', async t => {
	const { visit } = await loadRedirector();
	const paths = [
		'/', '/r/Enhancement/?sort=new#comments', '/r/settings/comments/123/title/', '/r/test/search?q=settings',
		'/mailbox', '/answerswiki', '/r/subreddit_name', '/message/compose', '/message/inbox/',
		'/?new_reddit=false', '/?not_new_reddit=true', '/?new_reddit=trueish', '/#new_reddit=true',
		'/gallery', '/gallery/', '/galleryfoo', '/r/Enhancement/gallery/633x7q',
	];

	t.deepEqual(
		await visit(onHostnames(redirectHostnames, paths)),
		onHostnames(redirectHostnames.map(() => 'old.reddit.com'), paths).sort(),
	);

	t.deepEqual(await visit(onHostnames(
		['old.reddit.com', 'en.reddit.com', 'mod.reddit.com', 'modmail.reddit.com', 'chat.reddit.com', 'oauth.reddit.com', 'i.redd.it', 'reddit.com.example.com', 'example.com'],
		['/r/Enhancement/'],
	)), []);
});

test('redirects galleries to the old Reddit comments page', async t => {
	const { visit } = await loadRedirector();
	const hostnames = [...redirectHostnames, 'old.reddit.com'];

	t.deepEqual(
		await visit(onHostnames(hostnames, ['/gallery/633x7q', '/gallery/633x7q/', '/Gallery/633x7q?utm_source=share#media'])),
		onHostnames(hostnames.map(() => 'old.reddit.com'), ['/comments/633x7q', '/comments/633x7q/', '/comments/633x7q?utm_source=share#media']).sort(),
	);

	t.deepEqual(await visit(['https://www.reddit.com/gallery/633x7q?new_reddit=true']), []);
});

test('leaves pages requiring new Reddit on every allowed hostname', async t => {
	const { visit } = await loadRedirector();

	t.deepEqual(await visit(onHostnames(redirectHostnames, [
		'/settings', '/settings/', '/settings/profile',
		'/mod', '/mod/', '/mod/mail/all', '/modmail', '/modmail/all',
		'/poll', '/poll/', '/poll/633x7q/',
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
	])), []);
});

test('redirects i.redd.it images to their post on old Reddit', async t => {
	const imageUrl = 'https://i.redd.it/ypujqousa1yh1.jpeg';
	const encodedImageUrl = encodeURIComponent(imageUrl);
	const { visit, requests } = await loadRedirector({
		[imageUrl]: [{ kind: 't3', data: { id: '1abcde', permalink: '/r/pics/comments/1abcde/title/' } }],
	});

	const imagePages = onHostnames(redirectHostnames, ['/media', '/media/', '/Media'].map(path => `${path}?url=${encodedImageUrl}`));
	t.deepEqual(await visit(imagePages), imagePages.map(() => 'https://old.reddit.com/r/pics/comments/1abcde/title/'));
	t.deepEqual(requests.splice(0)[0], { url: '/api/info.json', query: { url: imageUrl }, type: 'json' });

	t.deepEqual(await visit([
		'https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fnot-posted.jpeg',
		'https://www.reddit.com/media?url=https%3A%2F%2Fpreview.redd.it%2Fexample.jpg',
		'https://www.reddit.com/media?url=https%3A%2F%2Fv.redd.it%2Fexample',
		'https://www.reddit.com/media?url=not-a-url',
		'https://www.reddit.com/media',
		`https://www.reddit.com/media/example?url=${encodedImageUrl}`,
		`https://www.reddit.com/media?url=${encodedImageUrl}&new_reddit=true`,
		`https://old.reddit.com/media?url=${encodedImageUrl}`,
	]), []);
	t.is(requests.length, 1, 'only i.redd.it images are looked up');
});

test('leaves i.redd.it images when the post lookup fails', async t => {
	const { visit } = await loadRedirector(new Error('Network error'));

	t.deepEqual(await visit(['https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fypujqousa1yh1.jpeg']), []);
});

test('redirects when new Reddit navigates without reloading', async t => {
	const listeners = [];
	const navigation = { addEventListener: (type, listener) => listeners.push([type, listener]) };
	const { visit, location } = await loadRedirector({}, navigation);

	t.deepEqual(await visit(['https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fnot-posted.jpeg']), []);
	t.is(listeners.length, 1);
	const [type, onNavigate] = listeners[0];
	t.is(type, 'currententrychange');

	location.href = 'https://www.reddit.com/settings/profile';
	t.deepEqual(await visit([]), []);
	onNavigate();
	t.deepEqual(await visit([]), []);

	location.href = 'https://www.reddit.com/r/pics/comments/1abcde/title/';
	onNavigate();
	t.deepEqual(await visit([]), ['https://old.reddit.com/r/pics/comments/1abcde/title/']);
});

test('polls for navigation without the Navigation API, and only on redirected hostnames', async t => {
	const { visit, location, intervals } = await loadRedirector();

	await visit(['https://old.reddit.com/r/Enhancement/', 'https://en.reddit.com/r/Enhancement/']);
	t.is(intervals.length, 0);

	await visit(['https://www.reddit.com/settings']);
	t.is(intervals.length, 1);

	location.href = 'https://www.reddit.com/r/Enhancement/';
	intervals[0]();
	t.deepEqual(await visit([]), ['https://old.reddit.com/r/Enhancement/']);
});
