// https://github.com/marudor/flowInterfaces/blob/3fe07b33cae783b17ccc974f3bfd6010637d0d1a/packages/iflow-lodash/index.js.flow
// modified to make higher-order functions under "Function" generic over the function type
// also fixed zip/zipWith typings

type TemplateSettings = {
	escape?: RegExp,
	evaluate?: RegExp,
	imports?: Object,
	interpolate?: RegExp,
	variable?: string,
};

type TruncateOptions = {
	length?: number,
	omission?: string,
	separator?: RegExp | string,
};

type DebounceOptions = {
	leading?: bool,
	maxWait?: number,
	trailing?: bool,
};

type ThrottleOptions = {
	leading?: bool,
	trailing?: bool,
};

declare interface Curry1<A, R> {
	(a: A, ...args: void[]): R;
}

declare interface Curry2<A, B, R> {
	(a: A, ...args: void[]): Curry1<B, R>;
	(a: A, b: B, ...args: void[]): R;
}

declare interface Curry3<A, B, C, R> {
	(a: A, ...args: void[]): Curry2<B, C, R>;
	(a: A, b: B, ...args: void[]): Curry1<C, R>;
	(a: A, b: B, c: C, ...args: void[]): R;
}

declare interface Curry4<A, B, C, D, R> {
	(a: A, ...args: void[]): Curry3<B, C, D, R>;
	(a: A, b: B, ...args: void[]): Curry2<C, D, R>;
	(a: A, b: B, c: C, ...args: void[]): Curry1<D, R>;
	(a: A, b: B, c: C, d: D, ...args: void[]): R;
}

declare interface CurryRight1<A, R> {
	(a: A, ...args: void[]): R;
}

declare interface CurryRight2<A, B, R> {
	(b: B, ...args: void[]): CurryRight1<A, R>;
	(a: A, b: B, ...args: void[]): R;
}

declare interface CurryRight3<A, B, C, R> {
	(c: C, ...args: void[]): CurryRight2<A, B, R>;
	(b: B, c: C, ...args: void[]): CurryRight1<A, R>;
	(a: A, b: B, c: C, ...args: void[]): R;
}

declare interface CurryRight4<A, B, C, D, R> {
	(d: D, ...args: void[]): CurryRight3<A, B, C, R>;
	(c: C, d: D, ...args: void[]): CurryRight2<A, B, R>;
	(b: B, c: C, d: D, ...args: void[]): CurryRight1<A, R>;
	(a: A, b: B, c: C, d: D, ...args: void[]): R;
}

type NestedArray<T> = Array<Array<T>>;

type OPredicate<O> = ((value: any, key: string, object: O) => ?bool) | Object | string;
type OIterateeWithResult<V, O, R> = ((value: V, key: string, object: O) => R) | Object | string;
type OIteratee<O> = OIterateeWithResult<any, O, any>;

type Predicate<T> = ((value: T, index: number, array: Array<T>) => ?bool) | Object | string;
type _Iteratee<T> = (item: T, index: number, array: ?Array<T>) => mixed;
type Iteratee<T> = _Iteratee<T> | Object | string;
type Iteratee2<T, U> = ((item: T, index: number, array: ?Array<T>) => U) | Object | string;
type FlatMapIteratee<T, U> = ((item: T, index: number, array: ?Array<T>) => Array<U>) | Object | string;
type Comparator<T> = (item: T, item2: T) => bool;

type MapIterator1<T, U> = (item: T) => U;
type MapIterator2<T, U> = (item: T, index: number) => U;
type MapIterator3<T, U> = (item: T, index: number, array: Array<T>) => U;
type MapIterator<T, U> = MapIterator1<T, U> | MapIterator2<T, U> | MapIterator3<T, U>;

declare module 'lodash' {
	declare class Lodash {
		// Array
		chunk<T>(array: ?Array<T>, size?: number): Array<T>;
		compact<T, N:?T>(array: Array<N>): Array<T>;
		concat<T>(base: Array<T>, ...elements: Array<any>): Array<T | any>;
		difference<T>(array: ?Array<T>, values?: Array<T>): Array<T>;
		differenceBy<T>(array: ?Array<T>, values: Array<T>, iteratee: Iteratee<T>): T[];
		differenceWith<T>(array: T[], values: T[], comparator?: Comparator<T>): T[];
		drop<T>(array: ?Array<T>, n?: number): Array<T>;
		dropRight<T>(array: ?Array<T>, n?: number): Array<T>;
		dropRightWhile<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		dropWhile<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		fill<T, U>(array: ?Array<T>, value: U, start?: number, end?: number): Array<T | U>;
		findIndex<T>(array: ?Array<T>, predicate?: Predicate<T>): number;
		findLastIndex<T>(array: ?Array<T>, predicate?: Predicate<T>): number;
		// alias of _.head
		first<T>(array: ?Array<T>): T;
		flatten(array: any[]): any[];
		flattenDeep<T>(array: any[]): Array<T>;
		flattenDepth(array: any[], depth?: number): any[];
		fromPairs<T>(pairs: Array<T>): Object;
		head<T>(array: ?Array<T>): T;
		indexOf<T>(array: ?Array<T>, value: T, fromIndex?: number): number;
		initial<T>(array: ?Array<T>): Array<T>;
		intersection<T>(...arrays: Array<Array<T>>): Array<T>;
		// Workaround until (...parameter: T, parameter2: U) works
		intersectionBy<T>(a1: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		intersectionBy<T>(a1: Array<T>, a2: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		intersectionBy<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		intersectionBy<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, a4: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		// Workaround until (...parameter: T, parameter2: U) works
		intersectionWith<T>(a1: Array<T>, comparator: Comparator<T>): Array<T>;
		intersectionWith<T>(a1: Array<T>, a2: Array<T>, comparator: Comparator<T>): Array<T>;
		intersectionWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, comparator: Comparator<T>): Array<T>;
		intersectionWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, a4: Array<T>, comparator: Comparator<T>): Array<T>;
		join<T>(array: ?Array<T>, separator?: string): string;
		last<T>(array: ?Array<T>): T;
		lastIndexOf<T>(array: ?Array<T>, value: T, fromIndex?: number): number;
		nth<T>(array: T[], n?: number): T;
		pull<T>(array: ?Array<T>, ...values?: Array<T>): Array<T>;
		pullAll<T>(array: ?Array<T>, values: Array<T>): Array<T>;
		pullAllBy<T>(array: ?Array<T>, values: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		pullAllWith<T>(array?: T[], values: T[], comparator?: Function): T[];
		pullAt<T>(array: ?Array<T>, ...indexed?: Array<number>): Array<T>;
		pullAt<T>(array: ?Array<T>, indexed?: Array<number>): Array<T>;
		remove<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		reverse<T>(array: ?Array<T>): Array<T>;
		slice<T>(array: ?Array<T>, start?: number, end?: number): Array<T>;
		sortedIndex<T>(array: ?Array<T>, value: T): number;
		sortedIndexBy<T>(array: ?Array<T>, value: T, iteratee?: Iteratee<T>): number;
		sortedIndexOf<T>(array: ?Array<T>, value: T): number;
		sortedLastIndex<T>(array: ?Array<T>, value: T): number;
		sortedLastIndexBy<T>(array: ?Array<T>, value: T, iteratee?: Iteratee<T>): number;
		sortedLastIndexOf<T>(array: ?Array<T>, value: T): number;
		sortedUniq<T>(array: ?Array<T>): Array<T>;
		sortedUniqBy<T>(array: ?Array<T>, iteratee?: (value: T) => mixed): Array<T>;
		tail<T>(array: ?Array<T>): Array<T>;
		take<T>(array: ?Array<T>, n?: number): Array<T>;
		takeRight<T>(array: ?Array<T>, n?: number): Array<T>;
		takeRightWhile<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		takeWhile<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		union<T>(array?: Array<T>): Array<T>;
		unionBy<T>(array?: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		// Workaround until (...parameter: T, parameter2: U) works
		unionWith<T>(a1: Array<T>, comparator?: Comparator<T>): Array<T>;
		unionWith<T>(a1: Array<T>, a2: Array<T>, comparator?: Comparator<T>): Array<T>;
		unionWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, comparator?: Comparator<T>): Array<T>;
		unionWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, a4: Array<T>, comparator?: Comparator<T>): Array<T>;
		uniq<T>(array: ?Array<T>): Array<T>;
		uniqBy<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		uniqWith<T>(array: ?Array<T>, comparator?: Comparator<T>): Array<T>;
		unzip<T>(array: ?Array<T>): Array<T>;
		unzipWith<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		without<T>(array: ?Array<T>, ...values?: Array<T>): Array<T>;
		xor<T>(...array: Array<Array<T>>): Array<T>;
		// Workaround until (...parameter: T, parameter2: U) works
		xorBy<T>(a1: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		xorBy<T>(a1: Array<T>, a2: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		xorBy<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		xorBy<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, a4: Array<T>, iteratee?: Iteratee<T>): Array<T>;
		// Workaround until (...parameter: T, parameter2: U) works
		xorWith<T>(a1: Array<T>, comparator?: Comparator<T>): Array<T>;
		xorWith<T>(a1: Array<T>, a2: Array<T>, comparator?: Comparator<T>): Array<T>;
		xorWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, comparator?: Comparator<T>): Array<T>;
		xorWith<T>(a1: Array<T>, a2: Array<T>, a3: Array<T>, a4: Array<T>, comparator?: Comparator<T>): Array<T>;
		zip<A>(a: A[]): ([A])[];
		zip<A, B>(a: A[], b: B[]): ([A | void, B | void])[];
		zip<A, B, C>(a: A[], b: B[], c: C[]): ([A | void, B | void, C | void])[];
		zip<A, B, C, D>(a: A[], b: B[], c: C[], d: D[]): ([A | void, B | void, C | void, D | void])[];
		zipObject(props?: Array<any>, values?: Array<any>): Object;
		zipObjectDeep(props?: any[], values?: any): Object;
		// Workaround until (...parameter: T, parameter2: U) works
		zipWith<A, T>(a: A[], iteratee?: (a: A) => T): T[];
		zipWith<A, B, T>(a: A[], b: B[], iteratee?: (a: A, b: B) => T): T[];
		zipWith<A, B, C, T>(a: A[], b: B[], c: C[], iteratee?: (a: A, b: B, c: C) => T): T[];
		zipWith<A, B, C, D, T>(a: A[], b: B[], c: C[], d: D[], iteratee?: (a: A, b: B, c: C, d: D) => T): T[];

		// Collection
		countBy<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Object;
		countBy<T: Object>(object: T, iteratee?: OIteratee<T>): Object;
		// alias of _.forEach
		each<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		each<T: Object>(object: T, iteratee?: OIteratee<T>): T;
		// alias of _.forEachRight
		eachRight<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		eachRight<T: Object>(object: T, iteratee?: OIteratee<T>): T;
		every<T>(array: ?Array<T>, iteratee?: Iteratee<T>): bool;
		every<T: Object>(object: T, iteratee?: OIteratee<T>): bool;
		filter<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		filter<V, T: Object>(object: T, predicate?: OPredicate<T>): Array<any>;
		find<T>(array: ?Array<T>, predicate?: Predicate<T>): T;
		find<V, T: Object>(object: T, predicate?: OPredicate<T>): V;
		findLast<T>(array: ?Array<T>, predicate?: Predicate<T>): T;
		findLast<V, T>(object: T, predicate?: OPredicate<T>): V;
		flatMap<T, U>(array: ?Array<T>, iteratee?: FlatMapIteratee<T, U>): Array<U>;
		flatMapDeep<T, U>(array: ?Array<T>, iteratee?: FlatMapIteratee<T, U>): Array<U>;
		flatMapDepth<T, U>(array: ?Array<T>, iteratee?: FlatMapIteratee<T, U>, depth?: number): Array<U>;
		forEach<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		forEach<T: Object>(object: T, iteratee?: OIteratee<T>): T;
		forEachRight<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Array<T>;
		forEachRight<T: Object>(object: T, iteratee?: OIteratee<T>): T;
		groupBy<T>(array: ?Array<T>, iteratee?: Iteratee<T>): Object;
		groupBy<T: Object>(object: T, iteratee?: OIteratee<T>): Object;
		includes<T>(array: ?Array<T>, value: T, fromIndex?: number): bool;
		includes<T: Object>(object: T, value: any, fromIndex?: number): bool;
		includes(str: string, value: string, fromIndex?: number): bool;
		invokeMap<T>(array: ?Array<T>, path: ((value: T) => Array<string> | string) | Array<string> | string, ...args?: Array<any>): Array<any>;
		invokeMap<T: Object>(object: T, path: ((value: any) => Array<string> | string) | Array<string> | string, ...args?: Array<any>): Array<any>;
		keyBy<T, V>(array: ?Array<T>, iteratee?: Iteratee2<T, V>): {[key: V]: T};
		keyBy<V, T: Object>(object: T, iteratee?: OIteratee<T>): Object;
		map<T, U>(array: ?Array<T>, iteratee?: MapIterator<T, U>): Array<U>;
		map<V, T: Object, U>(object: ?T, iteratee?: OIterateeWithResult<V, T, U>): Array<U>;
		map(str: ?string, iteratee?: (char: string, index: number, str: string) => any): string;
		orderBy<T>(array: ?Array<T>, iteratees?: Array<Iteratee<T>> | string, orders?: Array<'asc' | 'desc'> | string): Array<T>;
		orderBy<V, T: Object>(object: T, iteratees?: Array<OIteratee<*>> | string, orders?: Array<'asc' | 'desc'> | string): Array<V>;
		partition<T>(array: ?Array<T>, predicate?: Predicate<T>): NestedArray<T>;
		partition<V, T: Object>(object: T, predicate?: OPredicate<T>): NestedArray<V>;
		reduce<T, U>(array: ?Array<T>, iteratee?: (accumulator: U, value: T, index: number, array: ?Array<T>) => U, accumulator?: U): U;
		reduce<T: Object, U>(object: T, iteratee?: (accumulator: U, value: any, key: string, object: T) => U, accumulator?: U): U;
		reduceRight<T, U>(array: ?Array<T>, iteratee?: (accumulator: U, value: T, index: number, array: ?Array<T>) => U, accumulator?: U): U;
		reduceRight<T: Object, U>(object: T, iteratee?: (accumulator: U, value: any, key: string, object: T) => U, accumulator?: U): U;
		reject<T>(array: ?Array<T>, predicate?: Predicate<T>): Array<T>;
		reject<V: Object, T>(object: T, predicate?: OPredicate<T>): Array<V>;
		sample<T>(array: ?Array<T>): T;
		sample<V, T: Object>(object: T): V;
		sampleSize<T>(array: ?Array<T>, n?: number): Array<T>;
		sampleSize<V, T: Object>(object: T, n?: number): Array<V>;
		shuffle<T>(array: ?Array<T>): Array<T>;
		shuffle<V, T: Object>(object: T): Array<V>;
		size(collection: Array<any> | Object): number;
		some<T>(array: ?Array<T>, predicate?: Predicate<T>): bool;
		some<T: Object>(object?: ?Object, predicate?: OPredicate<T>): bool;
		sortBy<T>(array: ?Array<T>, ...iteratees?: Array<Iteratee<T>>): Array<T>;
		sortBy<T>(array: ?Array<T>, iteratees?: Array<Iteratee<T>>): Array<T>;
		sortBy<V, T: Object>(object: T, ...iteratees?: Array<OIteratee<T>>): Array<V>;
		sortBy<V, T: Object>(object: T, iteratees?: Array<OIteratee<T>>): Array<V>;

		// Date
		now(): number;

		// Function
		after<T: (...args: any) => void>(n: number, fn: T): T;
		ary<T>(func: (...args: any) => T, n?: number): (...args: any) => T;
		before<T: Function>(n: number, fn: T): T;
		bind<T>(func: (...args: any) => T, thisArg: any, ...partials: Array<any>): (...args: any) => T;
		bindKey<K: string, T>(obj: { [key: K]: (...args: any) => T }, key: string, ...partials: Array<any>): (...args: any) => T;

		curry<A, R>(func: (a: A) => R, arity: 1): Curry1<A, R>;
		curry<A, R>(func: (a: A, ...args: void[]) => R, arity: void): Curry1<A, R>;
		curry<A, B, R>(func: (a: A, b: B) => R, arity: 2): Curry2<A, B, R>;
		curry<A, B, R>(func: (a: A, b: B, ...args: void[]) => R, arity: void): Curry2<A, B, R>;
		curry<A, B, C, R>(func: (a: A, b: B, c: C) => R, arity: 3): Curry3<A, B, C, R>;
		curry<A, B, C, R>(func: (a: A, b: B, c: C, ...args: void[]) => R, arity: void): Curry3<A, B, C, R>;
		curry<A, B, C, D, R>(func: (a: A, b: B, c: C, d: D) => R, arity: 4): Curry4<A, B, C, D, R>;
		curry<A, B, C, D, R>(func: (a: A, b: B, c: C, d: D, ...args: void[]) => R, arity: void): Curry4<A, B, C, D, R>;

		curryRight<A, R>(func: (a: A) => R, arity: 1): CurryRight1<A, R>;
		curryRight<A, R>(func: (a: A, ...args: void[]) => R, arity: void): CurryRight1<A, R>;
		curryRight<A, B, R>(func: (a: A, b: B) => R, arity: 2): CurryRight2<A, B, R>;
		curryRight<A, B, R>(func: (a: A, b: B, ...args: void[]) => R, arity: void): CurryRight2<A, B, R>;
		curryRight<A, B, C, R>(func: (a: A, b: B, c: C) => R, arity: 3): CurryRight3<A, B, C, R>;
		curryRight<A, B, C, R>(func: (a: A, b: B, c: C, ...args: void[]) => R, arity: void): CurryRight3<A, B, C, R>;
		curryRight<A, B, C, D, R>(func: (a: A, b: B, c: C, d: D) => R, arity: 4): CurryRight4<A, B, C, D, R>;
		curryRight<A, B, C, D, R>(func: (a: A, b: B, c: C, d: D, ...args: void[]) => R, arity: void): CurryRight4<A, B, C, D, R>;

		debounce<T: (...args: any) => void | Promise<void>>(func: T, wait?: number, options?: DebounceOptions): T;
		defer(func: Function, ...args?: Array<any>): number;
		delay(func: Function, wait: number, ...args?: Array<any>): number;
		flip(func: Function): Function;
		memoize<T: Function>(func: T, resolver?: Function): T;
		negate(predicate: Function): Function;
		once<T: Function>(func: T): T;
		overArgs(func: Function, ...transforms: Array<Function>): Function;
		overArgs(func: Function, transforms: Array<Function>): Function;
		partial<T>(func: (...args: any) => T, ...partials: any[]): (...args: any) => T;
		partialRight<T>(func: (...args: any) => T, ...partials: Array<any>): (...args: any) => T;
		partialRight<T>(func: (...args: any) => T, partials: Array<any>): (...args: any) => T;
		rearg<T>(func: (...args: any) => T, ...indexes: Array<number>): (...args: any) => T;
		rearg<T>(func: (...args: any) => T, indexes: Array<number>): (...args: any) => T;
		rest<T>(func: (...args: any) => T, start?: number): (...args: any) => T;
		spread<T>(func: (...args: any) => T): (...args: any) => T;
		throttle<T: (...args: any) => void>(func: T, wait?: number, options?: ThrottleOptions): T;
		unary<A, T: (a: A) => any>(func: T): T;
		wrap<T, R>(value: T, wrapper: (first: T, ...args: any) => R): (...args: any) => R;

		// Lang
		castArray(value: *): any[];
		clone<T>(value: T): T;
		cloneDeep<T>(value: T): T;
		cloneDeepWith<T, U>(value: T, customizer?: ?(value: T, key: number | string, object: T, stack: any) => U): U;
		cloneWith<T, U>(value: T, customizer?: ?(value: T, key: number | string, object: T, stack: any) => U): U;
		conformsTo<T: { [key: string]: mixed }>(source: T, predicates: T & { [key: string]: (x: any) => boolean }): boolean;
		eq(value: any, other: any): bool;
		gt(value: any, other: any): bool;
		gte(value: any, other: any): bool;
		isArguments(value: any): bool;
		isArray(value: any): bool;
		isArrayBuffer(value: any): bool;
		isArrayLike(value: any): bool;
		isArrayLikeObject(value: any): bool;
		isBoolean(value: any): bool;
		isBuffer(value: any): bool;
		isDate(value: any): bool;
		isElement(value: any): bool;
		isEmpty(value: any): bool;
		isEqual(value: any, other: any): bool;
		isEqualWith<T, U>(value: T, other: U, customizer?: (objValue: any, otherValue: any, key: number | string, object: T, other: U, stack: any) => bool | void): bool;
		isError(value: any): bool;
		isFinite(value: any): bool;
		isFunction(value: Function): true;
		isFunction(value: number | string | void | null | Object): false;
		isInteger(value: any): bool;
		isLength(value: any): bool;
		isMap(value: any): bool;
		isMatch(object?: ?Object, source: Object): bool;
		isMatchWith<T: Object, U: Object>(object: T, source: U, customizer?: (objValue: any, srcValue: any, key: number | string, object: T, source: U) => bool | void): bool;
		isNaN(value: any): bool;
		isNative(value: any): bool;
		isNil(value: any): bool;
		isNull(value: any): bool;
		isNumber(value: any): bool;
		isObject(value: any): bool;
		isObjectLike(value: any): bool;
		isPlainObject(value: any): bool;
		isRegExp(value: any): bool;
		isSafeInteger(value: any): bool;
		isSet(value: any): bool;
		isString(value: any): bool;
		isSymbol(value: any): bool;
		isTypedArray(value: any): bool;
		isUndefined(value: any): bool;
		isWeakMap(value: any): bool;
		isWeakSet(value: any): bool;
		lt(value: any, other: any): bool;
		lte(value: any, other: any): bool;
		toArray(value: any): Array<any>;
		toFinite(value: any): number;
		toInteger(value: any): number;
		toLength(value: any): number;
		toNumber(value: any): number;
		toPlainObject(value: any): Object;
		toSafeInteger(value: any): number;
		toString(value: any): string;

		// Math
		add(augend: number, addend: number): number;
		ceil(number: number, precision?: number): number;
		divide(dividend: number, divisor: number): number;
		floor(number: number, precision?: number): number;
		max<T>(array: ?Array<T>): T;
		maxBy<T>(array: ?Array<T>, iteratee?: Iteratee<T>): T;
		mean(array: Array<*>): number;
		meanBy<T>(array: Array<T>, iteratee?: Iteratee<T>): number;
		min<T>(array: ?Array<T>): T;
		minBy<T>(array: ?Array<T>, iteratee?: Iteratee<T>): T;
		multiply(multiplier: number, multiplicand: number): number;
		round(number: number, precision?: number): number;
		subtract(minuend: number, subtrahend: number): number;
		sum(array: Array<*>): number;
		sumBy<T>(array: Array<T>, iteratee?: Iteratee<T>): number;

		// number
		clamp(number: number, lower?: number, upper: number): number;
		inRange(number: number, start?: number, end: number): bool;
		random(lower?: number, upper?: number, floating?: bool): number;

		// Object
		assign(object?: ?Object, ...sources?: Array<Object>): Object;
		assignIn(object?: ?Object, ...sources?: Array<Object>): Object;
		assignInWith<T: Object, A: Object>(object: T, s1: A, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A) => any | void): Object;
		assignInWith<T: Object, A: Object, B: Object>(object: T, s1: A, s2: B, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B) => any | void): Object;
		assignInWith<T: Object, A: Object, B: Object, C: Object>(object: T, s1: A, s2: B, s3: C, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C) => any | void): Object;
		assignInWith<T: Object, A: Object, B: Object, C: Object, D: Object>(object: T, s1: A, s2: B, s3: C, s4: D, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C | D) => any | void): Object;
		assignWith<T: Object, A: Object>(object: T, s1: A, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A) => any | void): Object;
		assignWith<T: Object, A: Object, B: Object>(object: T, s1: A, s2: B, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B) => any | void): Object;
		assignWith<T: Object, A: Object, B: Object, C: Object>(object: T, s1: A, s2: B, s3: C, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C) => any | void): Object;
		assignWith<T: Object, A: Object, B: Object, C: Object, D: Object>(object: T, s1: A, s2: B, s3: C, s4: D, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C | D) => any | void): Object;
		at(object?: ?Object, ...paths: Array<string>): Array<any>;
		at(object?: ?Object, paths: Array<string>): Array<any>;
		create<T>(prototype: T, properties?: Object): $Supertype<T>;
		defaults(object?: ?Object, ...sources?: Array<Object>): Object;
		defaultsDeep(object?: ?Object, ...sources?: Array<Object>): Object;
		// alias for _.toPairs
		entries(object?: ?Object): NestedArray<any>;
		// alias for _.toPairsIn
		entriesIn(object?: ?Object): NestedArray<any>;
		// alias for _.assignIn
		extend(object?: ?Object, ...sources?: Array<Object>): Object;
		// alias for _.assignInWith
		extendWith<T: Object, A: Object>(object: T, s1: A, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A) => any | void): Object;
		extendWith<T: Object, A: Object, B: Object>(object: T, s1: A, s2: B, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B) => any | void): Object;
		extendWith<T: Object, A: Object, B: Object, C: Object>(object: T, s1: A, s2: B, s3: C, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C) => any | void): Object;
		extendWith<T: Object, A: Object, B: Object, C: Object, D: Object>(object: T, s1: A, s2: B, s3: C, s4: D, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C | D) => any | void): Object;
		findKey(object?: ?Object, predicate?: OPredicate<*>): string | void;
		findLastKey(object?: ?Object, predicate?: OPredicate<*>): string | void;
		forIn(object?: ?Object, iteratee?: OIteratee<*>): Object;
		forInRight(object?: ?Object, iteratee?: OIteratee<*>): Object;
		forOwn(object?: ?Object, iteratee?: OIteratee<*>): Object;
		forOwnRight(object?: ?Object, iteratee?: OIteratee<*>): Object;
		functions(object?: ?Object): Array<string>;
		functionsIn(object?: ?Object): Array<string>;
		get(object?: ?Object, path?: ?Array<string> | string, defaultValue?: any): any;
		has(object?: ?Object, path?: ?Array<string> | string): bool;
		hasIn(object?: ?Object, path?: ?Array<string> | string): bool;
		invert(object?: ?Object, multiVal?: bool): Object;
		invertBy(object: ?Object, iteratee?: Function): Object;
		invoke(object?: ?Object, path?: ?Array<string> | string, ...args?: Array<any>): any;
		keys(object?: ?Object): Array<string>;
		keysIn(object?: ?Object): Array<string>;
		mapKeys(object?: ?Object, iteratee?: OIteratee<*>): Object;
		mapValues(object?: ?Object, iteratee?: OIteratee<*>): Object;
		merge(object?: ?Object, ...sources?: Array<?Object>): Object;
		mergeWith<T: Object, A: Object>(object: T, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A) => any | void): Object;
		mergeWith<T: Object, A: Object, B: Object>(object: T, s1: A, s2: B, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B) => any | void): Object;
		mergeWith<T: Object, A: Object, B: Object, C: Object>(object: T, s1: A, s2: B, s3: C, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C) => any | void): Object;
		mergeWith<T: Object, A: Object, B: Object, C: Object, D: Object>(object: T, s1: A, s2: B, s3: C, s4: D, customizer?: (objValue: any, srcValue: any, key: string, object: T, source: A | B | C | D) => any | void): Object;
		omit(object?: ?Object, ...props: Array<string>): Object;
		omit(object?: ?Object, props: Array<string>): Object;
		omitBy(object?: ?Object, predicate?: OPredicate<*>): Object;
		pick(object?: ?Object, ...props: Array<string>): Object;
		pick(object?: ?Object, props: Array<string>): Object;
		pickBy(object?: ?Object, predicate?: OPredicate<*>): Object;
		result(object?: ?Object, path?: ?Array<string> | string, defaultValue?: any): any;
		set(object?: ?Object, path?: ?Array<string> | string, value: any): Object;
		setWith<T>(object: T, path?: ?Array<string> | string, value: any, customizer?: (nsValue: any, key: string, nsObject: T) => any): Object;
		toPairs(object?: ?Object | Array<*>): NestedArray<any>;
		toPairsIn(object?: ?Object): NestedArray<any>;
		transform(collection: Object | Array<any>, iteratee?: OIteratee<*>, accumulator?: any): any;
		unset(object?: ?Object, path?: ?Array<string> | string): bool;
		update(object: Object, path: string[] | string, updater: Function): Object;
		updateWith(object: Object, path: string[] | string, updater: Function, customizer?: Function): Object;
		values(object?: ?Object): Array<any>;
		valuesIn(object?: ?Object): Array<any>;

		// Seq
		// harder to read, but this is _()
		(value: any): any;
		chain<T>(value: T): any;
		tap<T>(value: T, interceptor: (value: T)=>any): T;
		thru<T1, T2>(value: T1, interceptor: (value: T1)=>T2): T2;
		// TODO: _.prototype.*

		// String
		camelCase(string?: ?string): string;
		capitalize(string?: string): string;
		deburr(string?: string): string;
		endsWith(string?: string, target?: string, position?: number): bool;
		escape(string?: string): string;
		escapeRegExp(string?: string): string;
		kebabCase(string?: string): string;
		lowerCase(string?: string): string;
		lowerFirst(string?: string): string;
		pad(string?: string, length?: number, chars?: string): string;
		padEnd(string?: string, length?: number, chars?: string): string;
		padStart(string?: string, length?: number, chars?: string): string;
		parseInt(string: string, radix?: number): number;
		repeat(string?: string, n?: number): string;
		replace(string?: string, pattern: RegExp | string, replacement: ((string: string) => string) | string): string;
		snakeCase(string?: string): string;
		split(string?: string, separator: RegExp | string, limit?: number): Array<string>;
		startCase(string?: string): string;
		startsWith(string?: string, target?: string, position?: number): bool;
		template(string?: string, options?: TemplateSettings): Function;
		toLower(string?: string): string;
		toUpper(string?: string): string;
		trim(string?: string, chars?: string): string;
		trimEnd(string?: string, chars?: string): string;
		trimStart(string?: string, chars?: string): string;
		truncate(string?: string, options?: TruncateOptions): string;
		unescape(string?: string): string;
		upperCase(string?: string): string;
		upperFirst(string?: string): string;
		words(string?: string, pattern?: RegExp | string): Array<string>;

		// Util
		attempt(func: Function): any;
		bindAll(object?: ?Object, methodNames: Array<string>): Object;
		bindAll(object?: ?Object, ...methodNames: Array<string>): Object;
		cond(pairs: NestedArray<Function>): Function;
		conforms(source: Object): Function;
		constant<T>(value: T): () => T;
		defaultTo<T1: string | boolean | Object, T2>(value: T1, def: T2): T1;
		// NaN is a number instead of its own type, otherwise it would behave like null/void
		defaultTo<T1:number, T2>(value: T1, def: T2): T1 | T2;
		defaultTo<T1:void | null, T2>(value: T1, def: T2): T2;
		flow(...funcs?: Array<Function>): Function;
		flow(funcs?: Array<Function>): Function;
		flowRight(...funcs?: Array<Function>): Function;
		flowRight(funcs?: Array<Function>): Function;
		identity<T>(value: T): T;
		iteratee(func?: any): Function;
		matches(source: Object): Function;
		matchesProperty(path?: ?Array<string> | string, srcValue: any): Function;
		method(path?: ?Array<string> | string, ...args?: Array<any>): Function;
		methodOf(object?: ?Object, ...args?: Array<any>): Function;
		mixin<T: Function | Object>(object?: T, source: Object, options?: { chain: bool }): T;
		noConflict(): Lodash;
		noop(): void;
		nthArg(n?: number): Function;
		over(...iteratees: Array<Function>): Function;
		over(iteratees: Array<Function>): Function;
		overEvery(...predicates: Array<Function>): Function;
		overEvery(predicates: Array<Function>): Function;
		overSome(...predicates: Array<Function>): Function;
		overSome(predicates: Array<Function>): Function;
		property(path?: ?Array<string> | string): Function;
		propertyOf(object?: ?Object): Function;
		range(start: number, end: number, step?: number): Array<number>;
		range(end: number, step?: number): Array<number>;
		rangeRight(start: number, end: number, step?: number): Array<number>;
		rangeRight(end: number, step?: number): Array<number>;
		runInContext(context?: Object): Function;

		stubArray(): Array<*>;
		stubFalse(): false;
		stubObject(): {};
		stubString(): '';
		stubTrue(): true;
		times(n: number, iteratee?: Function): Function;
		toPath(value: any): Array<string>;
		uniqueId(prefix?: string): string;

		// Properties
		VERSION: string;
		templateSettings: TemplateSettings;
	}

	declare var exports: Lodash;
}

declare module 'lodash/fp' {
	declare function compact<A>(a: A[], ...args: void[]): $NonMaybeType<A>[];

	declare function filter<A>(fn: (a: A) => ?boolean, ...args: void[]): Curry1<A[], A[]>;

	declare function flow<A1, A2, A3, A4, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => R>
		(f1: F1, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;
	declare function flow<A1, A2, A3, A4, B, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => B, F2: (b: B) => R>
		(f1: F1, f2: F2, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;
	declare function flow<A1, A2, A3, A4, B, C, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => B, F2: (b: B) => C, F3: (c: C) => R>
		(f1: F1, f2: F2, f3: F3, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;
	declare function flow<A1, A2, A3, A4, B, C, D, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => B, F2: (b: B) => C, F3: (c: C) => D, F4: (d: D) => R>
		(f1: F1, f2: F2, f3: F3, f4: F4, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;
	declare function flow<A1, A2, A3, A4, B, C, D, E, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => B, F2: (b: B) => C, F3: (c: C) => D, F4: (d: D) => E, F5: (e: E) => R>
		(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;
	declare function flow<A1, A2, A3, A4, B, C, D, E, F, R, F1: (a1: A1, a2: A2, a3: A3, a4: A4) => B, F2: (b: B) => C, F3: (c: C) => D, F4: (d: D) => E, F5: (e: E) => F, F6: (f: F) => R>
		(f1: F1, f2: F2, f3: F3, f4: F4, f5: F5, f6: F6, ...args: void[]): (a1: A1, a2: A2, a3: A3, a4: A4) => R;

	declare function groupBy<T, K>(fn: (x: T) => K, ...args: void[]): Curry1<T[], { [key: K]: T[] }>;

	declare function join<S: string>(s: string, ...args: void[]): Curry1<S[], string>;

	declare function keyBy<T, K>(fn: (x: T) => K, ...args: void[]): Curry1<T[], { [key: K]: T }>;
	declare function keyBy<KA, KB, T>(fn: (x: T) => KB, ...args: void[]): Curry1<{ [key: KA]: T }, { [key: KB]: T }>;

	declare function map<A, B, K>(fn: (x: A) => B, ...args: void[]): Curry1<A[], B[]> & Curry1<{ [key: K]: A }, { [key: K]: B }>;

	declare function mapValues<A, B, K>(fn: (x: A) => B, ...args: void[]): Curry1<{ [key: K]: A }, { [key: K]: B }>;

	declare function slice<T>(from: number, to: number, ...args:void[]): Curry1<T[], T[]>;

	declare function sortBy<A>(fn: (a: A) => string | number, ...args: void[]): Curry1<A[], A[]>;

	declare function zip<A, B>(a: A[], ...args: void[]): Curry1<B[], Array<[A, B]>>;
	declare function zip<A, B>(a: A[], b: B[], ...args: void[]): Array<[A, B]>;
}
