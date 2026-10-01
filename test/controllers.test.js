const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const trips = require('../data/trips.json');

function loadApi(find) {
  const context = { module: { exports: {} }, require: () => ({ find }), console: { error() {} } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app_api/controllers/trips.js'), 'utf8'), context);
  return context.module.exports;
}
function response() {
  return { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
test('collection queries all trips and returns 200 JSON', async () => {
  const api = loadApi(filter => { assert.equal(Object.keys(filter).length, 0); return { exec: async () => trips }; });
  const res = response(); await api.tripsList({}, res);
  assert.equal(res.code, 200); assert.equal(res.body.length, 3);
});
test('individual query uses tripCode and returns a trip array', async () => {
  const api = loadApi(filter => { assert.equal(filter.code, trips[0].code); return { exec: async () => [trips[0]] }; });
  const res = response(); await api.tripsFindByCode({ params: { tripCode: trips[0].code } }, res);
  assert.equal(res.code, 200); assert.equal(res.body[0].code, trips[0].code); assert.equal(Array.isArray(res.body), true);
});
test('missing trip returns 404', async () => {
  const res = response(); await loadApi(() => ({ exec: async () => [] })).tripsFindByCode({ params: { tripCode: 'NOTFOUND' } }, res);
  assert.equal(res.code, 404);
});
test('invalid code returns 400 without querying', async () => {
  const res = response(); await loadApi(() => { throw Error('Should not query'); }).tripsFindByCode({ params: { tripCode: 'bad code' } }, res);
  assert.equal(res.code, 400);
});
test('database errors return 500 for both queries', async () => {
  const api = loadApi(() => ({ exec: async () => { throw Error('Private database detail'); } }));
  for (const method of ['tripsList', 'tripsFindByCode']) {
    const res = response(); await api[method]({ params: { tripCode: 'GALR210214' } }, res);
    assert.equal(res.code, 500); assert.ok(!JSON.stringify(res.body).includes('Private'));
  }
});
test('website requests API JSON and forwards upstream failure', async () => {
  let status = 200;
  const server = http.createServer((req, res) => {
    assert.equal(req.url, '/api/trips'); res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(trips));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const context = { module: { exports: {} }, require, URL, fetch, AbortSignal, process: { env: { API_BASE_URL: `http://127.0.0.1:${server.address().port}/api/` } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app_server/controllers/traveler.js'), 'utf8'), context);
  try {
    await new Promise((resolve, reject) => context.module.exports.travel({}, { render(view, data) {
      try { assert.equal(view, 'travel'); assert.equal(data.trips[0].name, trips[0].name); resolve(); } catch (err) { reject(err); }
    } }, reject));
    status = 500;
    await new Promise((resolve, reject) => context.module.exports.travel({}, { render() { reject(Error('Should not render')); } }, err => {
      try { assert.equal(err.status, 502); resolve(); } catch (e) { reject(e); }
    }));
  } finally { await new Promise(resolve => server.close(resolve)); }
});

for (const [label, payload, expected] of [
  ['empty trip list', [], 'No trips exist in our database!'],
  ['invalid JSON shape', { message: 'Invalid response' }, 'API lookup error']
]) {
  test(`website displays a message for ${label}`, async () => {
    const context = { module: { exports: {} }, URL, AbortSignal, process: { env: {} },
      fetch: async () => ({ ok: true, json: async () => payload }) };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app_server/controllers/traveler.js'), 'utf8'), context);
    let rendered = false;
    await context.module.exports.travel({}, { render(view, data) {
      rendered = true; assert.equal(view, 'travel'); assert.equal(data.message, expected);
      assert.equal(data.trips.length, 0);
    } }, err => { throw err; });
    assert.equal(rendered, true);
  });
}
