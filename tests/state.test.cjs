const assert = require('node:assert/strict');
const M = require('../assets/state.js');
assert.equal(M.integer('', 0, 100), null);
for (const value of ['101', '-1', '1.5', 'NaN', Infinity, null, true]) assert.equal(M.integer(value, 0, 100), null);
assert.equal(M.integer('0', 0, 100), 0);
assert.equal(M.integer('100', 0, 100), 100);
const custom = { ...M.defaults(), mode: 'settings', textScale: 140, panelAlpha: 50,
  patient: { id: 'B02', hr: 0, spo2: 100, status: 'attention', notes: '<script>test</script>\n第二行' } };
assert.deepEqual(M.sanitize(JSON.parse(JSON.stringify(custom))), custom);
assert.deepEqual(M.sanitize({ version: 99 }), M.defaults());
assert.equal(M.sanitize({ ...custom, hudWidth: 999999, mode: 'bad', patient: { ...custom.patient, hr: -10, spo2: 101 } }).patient.spo2, 98);
assert.equal(M.sanitize({ ...custom, hudWidth: -1 }).hudWidth, 1120);
assert.equal(M.resetLayout(custom, false).mode, 'hud');
assert.equal(M.resetLayout(custom, false).textScale, 100);
assert.equal(M.resetLayout(custom, false).layoutScale, 100);
assert.equal(M.resetLayout(custom, false).panelAlpha, 0);
assert.deepEqual(M.resetLayout(custom, false).patient, custom.patient);
assert.deepEqual(M.resetLayout(custom, true), M.defaults());
for (const [scenario, hr, spo2] of [['stable', [76, 82], [97, 99]], ['attention', [112, 120], [91, 93]]]) {
  for (const random of [0, .9999999]) {
    const p = M.simulate(custom.patient, scenario, () => random);
    assert(p.hr >= hr[0] && p.hr <= hr[1]); assert(p.spo2 >= spo2[0] && p.spo2 <= spo2[1]);
    assert.equal(p.notes, custom.patient.notes);
  }
}
console.log('PASS: input boundaries, stored state round trip, corrupt/version fallback, layout/data resets, simulation ranges.');
