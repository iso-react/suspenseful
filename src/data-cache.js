import LRU from 'tiny-lru';
import fnv1a from '@sindresorhus/fnv1a';

class DataCache {
  constructor({size = 100, ttl = 0, initialState = {}} = {}) {
    this.lru = LRU(size, ttl);
    Object.entries(initialState).forEach(([key, val]) => {
      this.lru.set(key, val);
    });
    this.getKey = this._getKey.bind(this);
    this.get = this._get.bind(this);
    this.set = this._set.bind(this);
    this.delete = this._delete.bind(this);
    this.clear = this._clear.bind(this);
    this.keys = this._keys.bind(this);
    this.getInitialState = this._getInitialState.bind(this);
  }

  _getKey(obj) {
    return fnv1a(JSON.stringify(obj)).toString(36);
  }

  _get(obj) {
    return this.lru.get(obj);
  }

  _set(obj, data) {
    this.lru.set(obj, data);
  }

  _delete(obj) {
    this.lru.delete(obj);
  }

  _clear() {
    this.lru.clear();
  }

  _keys() {
    return this.lru.keys();
  }

  _getInitialState() {
    return this._keys().reduce(
      (initialState, key) => ({
        ...initialState,
        [key]: this.lru.get(key),
      }),
      {}
    );
  }
}

export default DataCache;
