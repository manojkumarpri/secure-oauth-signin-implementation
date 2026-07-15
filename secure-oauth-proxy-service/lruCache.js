class LRUCache {
  constructor(limit = 5) {
    this.limit = limit;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    
    // Move to the end (most recently used)
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.limit) {
      // Map keys() returns an iterator; next().value gets the oldest (first inserted) key
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`[Cache] Evicted oldest key: ${oldestKey}`);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = LRUCache;