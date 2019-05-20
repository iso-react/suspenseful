import React from 'react';

import DataContext from './data-context';

const getKey = (value, hash) => {
  if (typeof hash === 'function') {
    return hash(value);
  } else if (hash) {
    return JSON.stringify(hash);
  } else {
    return JSON.stringify(value);
  }
};

const now = () => {
  return new Date().getTime();
};

const defaultOpts = {
  ttl: 10 * 60 * 1000,
};

function useSuspend(fn, _opts = {}, ...args) {
  const opts = {
    ...defaultOpts,
    ..._opts,
  };

  // For managing rerenders
  const [, setTimestamp] = React.useState(0);
  // For preventing updates while unmounted
  const isMounted = React.useRef(true);
  React.useEffect(() => () => {
    isMounted.current = false;
  });

  // For preventing multiple requests
  const isActive = React.useRef(null);

  // For managing and updating cache
  const client = React.useContext(DataContext);

  if (!client) {
    console.error('Client must be set by DataContext.Provider');
    throw new Error('Client must be set by DataContext.Provider');
  }
  const cache = client.cache;
  if (!cache) {
    console.error('Client must have cache set');
    throw new Error('Client must have cache set');
  }

  const key = cache.getKey(getKey(args, opts.hash));

  // For handling fetch results
  const updateCacheData = value => {
    cache.set(key, {data: value, expiry: now() + opts.ttl});
  };

  const updateCacheError = error => {
    cache.set(key, {error, expiry: now() + opts.ttl});
  };

  // For causing rerender client-side and clearing cached promise
  const reset = () => {
    isActive.current = null;
    if (isMounted.current && !client.ssrMode) {
      setTimestamp(now());
    }
  };

  const fetch = async () => {
    try {
      const data = await fn(...args);
      updateCacheData(data);
    } catch (error) {
      updateCacheError(error);
    }
    reset();
  };

  // If fetch is in progress, throw existing promise
  if (isActive.current) {
    throw isActive.current;
  }


  // Get cached item
  const inCache = cache.get(key);

  // If item is cached
  if (inCache) {
    // Refetch if expired
    if (inCache.expiry < now()) {
      fetch();
    }

    // and return cached data
    const {data, ...meta} = inCache;
    return [data, meta, fetch];
  }

  // If item is not cached
  // throw fetch promise
  isActive.current = fetch();
  throw isActive.current;
}

export default useSuspend;
