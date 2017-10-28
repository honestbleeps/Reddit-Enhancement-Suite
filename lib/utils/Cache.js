/* @flow */

export class LRUCache<K, V> {
	map: Map<K, {
		value: V,
		createTime: number,
		hitTime: number,
	}>;
	capacity: number;

	constructor(capacity: number) {
		this.map = new Map();
		this.capacity = capacity;
	}

	get(key: K, maxAge: number = Infinity): V | void {
		const now = Date.now();
		const entry = this.map.get(key);
		if (entry && (now - entry.createTime < maxAge)) {
			entry.hitTime = now;
			return entry.value;
		}
	}

	set(key: K, value: V): this {
		const now = Date.now();
		this.map.set(key, { value, createTime: now, hitTime: now });

		if (this.map.size > this.capacity) {
			// Evict least-recently used (hit)
			Array.from(this.map.entries())
				.sort(([, a], [, b]) => b.hitTime - a.hitTime)
				.slice((this.capacity / 2) | 0)
				.forEach(([key]) => this.map.delete(key));
		}

		return this;
	}

	delete(key: K): bool {
		return this.map.delete(key);
	}

	clear(): void {
		this.map.clear();
	}
}
