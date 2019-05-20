import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fetch from 'isomorphic-fetch';
import useSuspend from '../use-suspend';
import getInitialState from '../get-initial-state';
import DataClient from '../data-client';
import DataContext from '../data-context';
import Response from '../../test/response';

jest.mock('isomorphic-fetch');

const TestApp = () => {
  const [data, meta] = useSuspend(
    (...args) => fetch(...args).then(res => res.text()),
    {hash: () => 'test'},
    'test-url'
  );

  if (meta.error) {
    return <div data-testid="error">{meta.error.toString()}</div>;
  }

  return <div data-testid="content">{data}</div>;
};

const getServerApp = client => {
  return (
    <DataContext.Provider value={client}>
      <TestApp />
    </DataContext.Provider>
  );
};

describe('Server-side', () => {
  it('initial state should retrieve populated data', async () => {
    expect.assertions(1);
    fetch.mockResolvedValueOnce(Promise.resolve(new Response('test')));
    const client = new DataClient({}, {ssrMode: true});
    const app = getServerApp(client);
    const initialState = await getInitialState({app, client});
    const key = client.cache.getKey('test');
    expect(initialState).toHaveProperty(key, {
      data: 'test',
      expiry: expect.any(Number),
    });
  });
  it('should generate script tags', async () => {
    expect.assertions(1);
    fetch.mockResolvedValueOnce(Promise.resolve(new Response('test')));
    const client = new DataClient({}, {ssrMode: true});
    const app = getServerApp(client);
    await getInitialState({app, client});
    expect(client.getScriptTags()).toEqual(
      expect.stringMatching(
        /^<script>window\.__DATA_INITIAL_STATE__={\"1brebol":{"data":"test","expiry":\d+}}<\/script>$/
      )
    );
  });
});
