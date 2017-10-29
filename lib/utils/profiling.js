/* @flow */

let counter = 0;
export function markStart(): string {
	const tag = (++counter).toString();
	performance.mark(tag);
	return tag;
}

export function markEnd(tag: string, name: string) {
	performance.measure(name, tag);
}
