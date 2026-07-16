/* @flow */

export function extractCaptionFromPostMetadata(postMetadata: { [string]: any }): string {
	const originalPostMetadata = postMetadata.crosspost_parent_list && postMetadata.crosspost_parent_list.length > 0 ?
		postMetadata.crosspost_parent_list[0] :
		postMetadata;

	return originalPostMetadata.selftext_html ? originalPostMetadata.selftext_html.replace(/<\/?p>/g, '') : '';
}

export function getPostCaption(
	fullname: ?string,
	fetchPostMetadata: ({ id: string }) => Promise<{ [string]: any }>,
	{
		timeoutMs = 250,
		setTimeoutFn = setTimeout,
	}: {|
		timeoutMs?: number,
		setTimeoutFn?: (callback: () => void, timeout: number) => mixed,
	|} = {},
): Promise<string> {
	if (!fullname) return Promise.resolve('');

	const id = fullname.replace('t3_', '');
	const captionPromise = fetchPostMetadata({ id })
		.then(extractCaptionFromPostMetadata)
		.catch(error => {
			console.warn(`showImages: could not load post metadata for v.redd.it ${id}`, error);
			return '';
		});

	const timeoutPromise = new Promise(resolve => {
		setTimeoutFn(() => { resolve(''); }, timeoutMs);
	});

	return Promise.race([captionPromise, timeoutPromise]);
}
