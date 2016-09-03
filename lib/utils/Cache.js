export default class Cache extends Map {
	constructor(capacity = 500) {
		super();
		this.capacity = capacity;
	}

	get(key, maxAge = Infinity) {
		const now = Date.now();
		const entry = super.get(key);
		if (entry && (now - entry.createTime < maxAge)) {
			entry.hitTime = now;
			return entry.value;
		}
	}

	set(key, value) {
		const now = Date.now();
		super.set(key, { value, createTime: now, hitTime: now });

		if (this.size > this.capacity) {
			// evict least-recently used (hit)
			Array.from(this.entries())
				.sort(([, a], [, b]) => b.hitTime - a.hitTime)
				.slice((this.capacity / 2) | 0)
				.forEach(([key]) => this.delete(key));
		}
	}
}
