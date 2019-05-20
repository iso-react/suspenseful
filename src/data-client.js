import getInitialState from './get-initial-state';
import DataCache from './data-cache';

class DataClient {
  constructor(initialState = {}, opts = {}) {
    this.cache = opts.cache || new DataCache({initialState});
    this.ssrMode = opts.ssrMode;
  }

  extract() {
    return this.cache.getInitialState();
  }

  getScriptTags(varName = '__DATA_INITIAL_STATE__') {
    const state = JSON.stringify(this.extract());
    return `<script>window.${varName}=${state}</script>`;
  }
}

export default DataClient;
