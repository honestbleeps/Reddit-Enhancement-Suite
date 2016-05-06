export default class Cache {
	entries = new Map();

	constructor(capacity = 250) {
		this.capacity = capacity;
	}

	check(key, maxAge = Infinity) {
		const entry = this.entries.get(key);
		const now = Date.now();
		if (entry && (now - entry.timestamp < maxAge)) {
			entry.timestamp = now;
			return entry.data;
		}
	}

	set(key, value) {
		this.entries.set(key, {
			data: value,
			timestamp: Date.now(),
		});

		if (this.entries.size > this.capacity) {
			this._prune();
		}
	}

	delete(key) {
		this.entries.delete(key);
	}

	clear() {
		this.entries.clear();
	}

	_prune() {
		// evict least-recently used
		Array.from(this.entries.entries())
			.sort(([, a], [, b]) => b.timestamp - a.timestamp)
			.slice((this.capacity / 2) | 0)
			.forEach(([key]) => this.entries.delete(key));
	}
}
