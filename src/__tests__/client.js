import React from 'react';
import fetch from 'isomorphic-fetch';
import {render, cleanup} from 'react-testing-library';
import DataClient from '../data-client';
import DataContext from '../data-context';
import useSuspend from '../use-suspend';

import Response from '../../test/response';

jest.mock('isomorphic-fetch');

const delayed = ms => value =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(value);
    }, ms)
  );

const TestApp = () => {
  const [data, meta] = useSuspend(
    (...args) => fetch(...args).then(res => res.text()),
    {},
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

const getClientApp = client => {
  return (
    <DataContext.Provider value={client}>
      <React.Suspense fallback={<div data-testid="loading">Loading</div>}>
        <TestApp />
      </React.Suspense>
    </DataContext.Provider>
  );
};

describe('Client-Side', () => {
  afterEach(() => {
    cleanup();
  });
  it('should suspend on request', () => {
    jest.useFakeTimers();
    fetch.mockImplementationOnce(() => delayed(1000)(new Response('test')));
    const client = new DataClient();
    const app = getClientApp(client);
    const {getByTestId} = render(app);
    expect(getByTestId('loading')).toBeDefined();
  });

  it('should populate with data', () => {
    expect.assertions(1);
    fetch.mockImplementationOnce(() => new Response('test'));
    const client = new DataClient();
    const app = getClientApp(client);
    const {findByTestId} = render(app);
    expect(findByTestId('content')).toBeDefined();
  });

  it('should populate with error', async () => {
    expect.assertions(1);
    fetch.mockImplementationOnce(() => {
      throw new Error('error');
    });
    const client = new DataClient();
    const app = getClientApp(client);
    const {findByTestId} = render(app);
    expect(findByTestId('error')).toBeDefined();
  });
});
