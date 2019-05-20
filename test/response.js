export default class Response {
  constructor(body, opts = {}) {
    Object.assign(
      this,
      {
        status: 200,
        ok: true,
        statusText: 'OK',
      },
      opts,
      {
        body: typeof body === 'object' ? JSON.stringify(body) : body,
      }
    );
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }

  text() {
    return Promise.resolve(this.body);
  }
}