/* Shared, DOM-free state validation. Also loadable by Node for regression checks. */
(function (root) {
  'use strict';
  const KEY = 'avp-hud-test.stage2.v1';
  const STATUS = Object.freeze({ stable: '● 模擬穩定', attention: '▲ 模擬需關注', observing: '○ 模擬觀察中' });
  function defaults() {
    return { version: 1, mode: 'hud', hudWidth: 1120, textScale: 100, layoutScale: 100,
      panelAlpha: 0, metricAlpha: 0, background: 'transparent', shadow: true,
      running: false, interval: 2000, scenario: 'stable',
      patient: { id: 'A01', hr: 78, spo2: 98, status: 'stable', notes: '' } };
  }
  function integer(value, min, max) {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (String(value).trim() === '') return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : null;
  }
  const ranges = { hudWidth: [320, 1440], textScale: [85, 140], layoutScale: [80, 120], panelAlpha: [0, 100], metricAlpha: [0, 100] };
  function sanitize(raw) {
    const clean = defaults();
    if (!raw || typeof raw !== 'object' || raw.version !== 1) return clean;
    for (const [key, range] of Object.entries(ranges)) clean[key] = integer(raw[key], ...range) ?? clean[key];
    if (['hud', 'settings'].includes(raw.mode)) clean.mode = raw.mode;
    if (['transparent', 'green', 'dark'].includes(raw.background)) clean.background = raw.background;
    if (typeof raw.shadow === 'boolean') clean.shadow = raw.shadow;
    if (typeof raw.running === 'boolean') clean.running = raw.running;
    if ([2000, 5000].includes(raw.interval)) clean.interval = raw.interval;
    if (['stable', 'attention'].includes(raw.scenario)) clean.scenario = raw.scenario;
    const p = raw.patient;
    if (p && typeof p === 'object') {
      if (typeof p.id === 'string' && p.id.trim()) clean.patient.id = p.id.trim().slice(0, 32);
      clean.patient.hr = integer(p.hr, 0, 300) ?? clean.patient.hr;
      clean.patient.spo2 = integer(p.spo2, 0, 100) ?? clean.patient.spo2;
      if (Object.hasOwn(STATUS, p.status)) clean.patient.status = p.status;
      if (typeof p.notes === 'string') clean.patient.notes = p.notes.slice(0, 500);
    }
    return clean;
  }
  function resetLayout(state, clearPatient) {
    const clean = defaults();
    if (!clearPatient) clean.patient = { ...state.patient };
    return clean;
  }
  function simulate(patient, scenario, random = Math.random) {
    const attention = scenario === 'attention';
    return { ...patient, hr: attention ? 112 + Math.floor(random() * 9) : 76 + Math.floor(random() * 7),
      spo2: attention ? 91 + Math.floor(random() * 3) : 97 + Math.floor(random() * 3), status: attention ? 'attention' : 'stable' };
  }
  const api = { KEY, STATUS, ranges, defaults, integer, sanitize, resetLayout, simulate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AvpHudState = api;
})(globalThis);
