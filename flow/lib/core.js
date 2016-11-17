// https://github.com/facebook/flow/blob/303c9efd1aa2e9230a7283176af961bb85e2356e/lib/core.js#L28

// specialize Object.entries and Object.values for known object types
// this is technically unsound (https://github.com/facebook/flow/issues/2221),
// but the alternative is worse (having to type check every Object.entries/values call, even when the type is obvious)

declare class Object {
	static (o: ?void): {[key: any]: any};
	static (o: boolean): Boolean;
	static (o: number): Number;
	static (o: string): String;
	static <T: Object>(o: T): T;
	static assign: Object$Assign;
	static create(o: any, properties?: any): any; // compiler magic
	static defineProperties(o: any, properties: any): any;
	static defineProperty(o: any, p: any, attributes: any): any;
	static entries<K, V>(object: { [key: K]: V }): Array<[K, V]>;
	static entries(object: any): Array<[string, mixed]>;
	static freeze<T>(o: T): T;
	static getOwnPropertyDescriptor(o: any, p: any): any;
	static getOwnPropertyNames(o: any): Array<string>;
	static getOwnPropertySymbols(o: any): Symbol[];
	static getPrototypeOf: Object$GetPrototypeOf;
	static is(a: any, b: any): boolean;
	static isExtensible(o: any): boolean;
	static isFrozen(o: any): boolean;
	static isSealed(o: any): boolean;
	static keys(o: any): Array<string>;
	static preventExtensions(o: any): any;
	static seal(o: any): any;
	static setPrototypeOf(o: any, proto: ?Object): bool;
	static values<T>(object: { [key: any]: T }): Array<T>;
	static values(object: any): Array<mixed>;
	hasOwnProperty(prop: any): boolean;
	propertyIsEnumerable(prop: any): boolean;
	toLocaleString(): string;
	toString(): string;
	valueOf(): Object;
	[key:any]: any;
}
