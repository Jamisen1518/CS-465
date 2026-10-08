const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const trips = require('../data/trips.json');

function loadApi(methods) {
  const context = { module: { exports: {} }, require: () => methods, console: { error() {} } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app_api/controllers/trips.js'), 'utf8'), context);
  return context.module.exports;
}
function response() {
  return { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
test('collection queries all trips and returns 200 JSON', async () => {
  const api = loadApi({ find: filter => { assert.equal(Object.keys(filter).length, 0); return { exec: async () => trips }; } });
  const res = response(); await api.tripsList({}, res);
  assert.equal(res.code, 200); assert.equal(res.body.length, 3);
});
test('individual query uses tripCode and returns a trip array', async () => {
  const api = loadApi({ findOne: filter => { assert.equal(filter.code, trips[0].code); return { exec: async () => trips[0] }; } });
  const res = response(); await api.tripsFindByCode({ params: { tripCode: trips[0].code } }, res);
  assert.equal(res.code, 200); assert.equal(res.body[0].code, trips[0].code); assert.equal(Array.isArray(res.body), true);
});
test('missing trip returns 404', async () => {
  const res = response(); await loadApi({ findOne: () => ({ exec: async () => null }) }).tripsFindByCode({ params: { tripCode: 'NOTFOUND' } }, res);
  assert.equal(res.code, 404);
});
test('invalid code returns 400 without querying', async () => {
  const res = response(); await loadApi({ findOne: () => { throw Error('Should not query'); } }).tripsFindByCode({ params: { tripCode: 'bad code' } }, res);
  assert.equal(res.code, 400);
});
test('database errors return 500 for both queries', async () => {
  const api = loadApi({ find: () => ({ exec: async () => { throw Error('Private database detail'); } }), findOne: () => ({ exec: async () => { throw Error('Private database detail'); } }) });
  for (const method of ['tripsList', 'tripsFindByCode']) {
    const res = response(); await api[method]({ params: { tripCode: 'GALR210214' } }, res);
    assert.equal(res.code, 500); assert.ok(!JSON.stringify(res.body).includes('Private'));
  }
});

const tripInput = { ...trips[0], code: 'NEWTRIP101' };
test('POST creates a trip and rejects duplicate trip codes', async () => {
  const api = loadApi({ create: async data => data });
  const created = response(); await api.tripsCreate({ body: tripInput }, created);
  assert.equal(created.code, 201); assert.equal(created.body.code, tripInput.code);
  const duplicate = response(); await loadApi({ create: async () => { const err = Error('duplicate'); err.code = 11000; throw err; } }).tripsCreate({ body: tripInput }, duplicate);
  assert.equal(duplicate.code, 409);
});

test('PUT updates trip details and returns 404 for an unknown trip', async () => {
  let filter; let update;
  const api = loadApi({ findOneAndUpdate: (query, values, options) => {
    filter = query; update = values; assert.equal(options.new, true); assert.equal(options.runValidators, true);
    return { exec: async () => ({ ...trips[0], ...values }) };
  } });
  const updated = response(); await api.tripsUpdate({ params: { tripCode: trips[0].code }, body: tripInput }, updated);
  assert.equal(updated.code, 200); assert.equal(filter.code, trips[0].code); assert.equal(update.name, tripInput.name);
  const missing = response(); await loadApi({ findOneAndUpdate: () => ({ exec: async () => null }) }).tripsUpdate({ params: { tripCode: 'MISSING1' }, body: tripInput }, missing);
  assert.equal(missing.code, 404);
});

test('DELETE removes a trip and reports a missing trip', async () => {
  const api = loadApi({ findOneAndDelete: () => ({ exec: async () => trips[0] }) });
  const removed = response(); await api.tripsDelete({ params: { tripCode: trips[0].code } }, removed);
  assert.equal(removed.code, 200); assert.equal(removed.body.code, trips[0].code);
  const missing = response(); await loadApi({ findOneAndDelete: () => ({ exec: async () => null }) }).tripsDelete({ params: { tripCode: 'MISSING1' } }, missing);
  assert.equal(missing.code, 404);
});
test('website requests API JSON and forwards upstream failure', async () => {
  let status = 200; let requestedUrl;
  const context = { module: { exports: {} }, URL, AbortSignal, process: { env: { API_BASE_URL: 'http://api.example.test/api/' } },
    fetch: async url => { requestedUrl = String(url); return { ok: status === 200, json: async () => trips }; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../app_server/controllers/traveler.js'), 'utf8'), context);
  await new Promise((resolve, reject) => context.module.exports.travel({}, { render(view, data) {
    try { assert.equal(view, 'travel'); assert.equal(data.trips[0].name, trips[0].name); resolve(); } catch (err) { reject(err); }
  } }, reject));
  assert.equal(requestedUrl, 'http://api.example.test/api/trips');
  status = 500;
  await new Promise((resolve, reject) => context.module.exports.travel({}, { render() { reject(Error('Should not render')); } }, err => {
    try { assert.equal(err.status, 502); resolve(); } catch (e) { reject(e); }
  }));
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
