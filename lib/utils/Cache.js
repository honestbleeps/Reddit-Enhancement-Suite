export default class Cache extends Map {
	constructor(capacity = 500) {
		super();
		this.capacity = capacity;
	}

	get(key, maxAge = Infinity) {
		const entry = super.get(key);
		const now = Date.now();
		if (entry && (now - entry.timestamp < maxAge)) {
			entry.timestamp = now;
			return entry.value;
		}
	}

	set(key, value) {
		super.set(key, { value, timestamp: Date.now() });

		if (this.size > this.capacity) {
			// evict least-recently used
			Array.from(this.entries())
				.sort(([, a], [, b]) => b.timestamp - a.timestamp)
				.slice((this.capacity / 2) | 0)
				.forEach(([key]) => this.delete(key));
		}
	}
}
