export default class XHRCache {
	capacity = 250;
	entries = new Map();
	
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
			timestamp: Date.now()
		});

		if (this.entries.size > this.capacity) {
			this.prune();
		}
	}
	
	delete(key) {
		this.entries.delete(key);
	}
	
	prune() {
		// evict least-recently used
		const top = Array.from(this.entries.entries())
			.sort(([, a], [, b]) => a.timestamp - b.timestamp)
			.slice((this.capacity / 2) | 0);

		this.entries = new Map(top);
	}
	
	clear() {
		this.entries.clear();
	}
}
