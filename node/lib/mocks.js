import jsdom from 'jsdom';

export const document = jsdom.jsdom(undefined, { url: 'https://www.reddit.com/' });
export const window = document.defaultView;
export const location = window.location;
export const DOMParser = window.DOMParser;

export const sessionStorage = {
	getItem() {
		return undefined;
	}
};
