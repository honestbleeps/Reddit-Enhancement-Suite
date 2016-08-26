declare module 'snudown-js' {
	declare var version: string;

	declare var RENDERER_USERTEXT: number;
	declare var RENDERER_WIKI: number;

	declare type MarkdownOptions = {
		text: string,
		nofollow?: boolean,
		target?: string,
		enableToc?: boolean,
		tocIdPrefix?: string,
	};

	declare function markdown(options: MarkdownOptions & { renderer?: number }): string;
	declare function markdown(text: string, nofollow?: boolean, target?: string, renderer?: number, enableToc?: boolean, tocIdPrefix?: string): string;

	declare function markdownWiki(options: MarkdownOptions): string;
	declare function markdownWiki(text: string, nofollow?: boolean, target?: string, enableToc?: boolean, tocIdPrefix?: string): string;
}
