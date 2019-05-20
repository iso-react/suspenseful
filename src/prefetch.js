import ssrPrepass from 'react-ssr-prepass';

const prefetch = app => {
  return ssrPrepass(app);
};

export default prefetch;
