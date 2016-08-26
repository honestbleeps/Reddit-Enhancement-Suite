declare module 'favico.js' {
	declare type FavicoOptions = {
		bgColor?: string,
		textColor?: string,
		fontFamily?: string,
		fontStyle?: string,
		position?: 'down' | 'up' | 'left' | 'leftup' | 'upleft',
		type?: 'circle' | 'rectangle',
		animation?: 'slide' | 'fade' | 'pop' | 'popFade' | 'none',
		dataUrl?: (dataUrl: string) => void,
		win?: WindowProxy,
	};

	declare class Favico {
		constructor(opts?: FavicoOptions): void;
		badge(num: number, opts?: FavicoOptions | $PropertyType<FavicoOptions, 'animation'>): void;
		image(image: HTMLImageElement): void;
		video(video: HTMLVideoElement | 'stop'): void;
		webcam(action?: 'stop'): void;
		reset(): void;
		browser: {
			supported: boolean,
		};
	}

	declare var exports: Class<Favico>;
}
