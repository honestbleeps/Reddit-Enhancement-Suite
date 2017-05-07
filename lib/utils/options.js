/* @flow */

import _ from 'lodash';
// importing core types is okay
import type { TableOption } from '../core/module'; // eslint-disable-line

export function indexOptionTable<T: any[], Ctx>(option: TableOption<Ctx, T>, keyIndex: number, keyTransformer: string => string = v => v): { [key: string]: T[] } {
	const source = option.fields[keyIndex].type === 'list' ?
		Array.from(expandKeys(option.value)) :
		option.value;

	return _.groupBy(source, arr => keyTransformer(arr[keyIndex]));

	// allows indexing by multiple keys, e.g. transforms
	// [['foo,bar', 'baz']] to
	// [['foo', 'baz'], ['bar', 'baz']]
	function* expandKeys(nestedArray) {
		for (const arr of nestedArray) {
			for (const subKey of arr[keyIndex].split(',')) {
				yield [...arr.slice(0, keyIndex), subKey, ...arr.slice(keyIndex + 1)];
			}
		}
	}
}
