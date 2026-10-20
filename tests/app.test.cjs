// Event/state integration checks without pretending to be a browser rendering test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'interactive.html'), 'utf8');
const model = fs.readFileSync(path.join(root, 'assets/state.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
function boot(saved = null, blocked = false) {
  const elements = {};
  for (const [, id] of html.matchAll(/\bid="([^"]+)"/g)) {
    assert(!elements[id], `Duplicate id: ${id}`);
    elements[id] = { value: '', checked: false, hidden: false, textContent: '', validity: { valid: true }, attrs: {}, handlers: {},
      classList: { toggle() {} }, addEventListener(type, fn) { this.handlers[type] = fn; },
      setAttribute(key, value) { this.attrs[key] = value; }, focus() {}, click() { this.handlers.click?.(); } };
  }
  let stored = saved;
  let tick = null;
  const styles = {};
  const context = { console, Date, Math,
    document: { getElementById: id => { assert(elements[id], `Missing id: ${id}`); return elements[id]; },
      documentElement: { style: { setProperty: (k,v) => { styles[k] = v; } }, dataset: {} },
      body: { dataset: {}, classList: { toggle() {} } } },
    localStorage: { getItem() { if(blocked) throw Error('disabled'); return stored; }, setItem(k,v) { if(blocked) throw Error('disabled'); stored = v; } },
    clearInterval() { tick = null; }, setInterval(fn) { tick = fn; return 1; }, scrollTo() {} };
  context.window = context;
  vm.createContext(context); vm.runInContext(model, context); vm.runInContext(app, context);
  const input = (id, value, event = 'input') => { elements[id].value = value; elements[id].handlers[event](); };
  const click = id => elements[id].click();
  return { elements, context, styles, input, click, saved: () => stored, tick: () => tick?.() };
}
let page = boot();
assert.equal(page.context.document.body.dataset.mode, 'hud');
assert.equal(page.styles['--panel-alpha'], 0);
page.click('modeToggle'); assert.equal(page.context.document.body.dataset.mode, 'settings');
page.input('patientId', 'B02'); page.input('hr', '120'); page.input('spo2', '92');
page.input('patientStatus', 'attention'); page.input('notes', '<img src=x onerror=alert(1)>\n僅測試');
assert.equal(page.elements.patientDisplay.textContent, 'B02');
assert.equal(page.elements.hrDisplay.textContent, 120);
assert.equal(page.elements.notesDisplay.textContent, '<img src=x onerror=alert(1)>\n僅測試');
for (const invalid of ['101', '-1', '', '95.5']) { page.input('spo2', invalid); assert.equal(page.elements.spo2Display.textContent, 92); assert.equal(page.elements.spo2.attrs['aria-invalid'], 'true'); }
page.input('spo2', '0'); assert.equal(page.elements.spo2Display.textContent, 0);
page.input('hudWidth', '640'); page.input('textScale', '140'); page.input('panelAlpha', '50');
page = boot(page.saved());
assert.equal(page.context.document.body.dataset.mode, 'settings'); assert.equal(page.styles['--hud-width'], '640px'); assert.equal(page.elements.patientId.value, 'B02'); assert.equal(page.styles['--panel-alpha'], .5);
page.click('simulationToggle'); page.tick(); assert.equal(JSON.parse(page.saved()).running, true);
page.input('hr', '99'); page.tick(); assert.equal(page.elements.hrDisplay.textContent, 99); assert.equal(JSON.parse(page.saved()).running, false);
page.click('returnHud'); assert.equal(page.elements.settings.hidden, true);
page = boot(page.saved()); assert.equal(page.context.document.body.dataset.mode, 'hud');
page.click('modeToggle'); page.click('resetHud');
assert.equal(page.styles['--hud-width'], '1120px'); assert.equal(page.styles['--text-scale'], 1); assert.equal(page.styles['--layout-scale'], 1); assert.equal(page.styles['--panel-alpha'], 0); assert.equal(page.elements.hrDisplay.textContent, 99);
page.click('modeToggle'); page.elements.clearPatient.checked = true; page.click('resetHud'); assert.equal(page.elements.patientId.value, 'A01');
page.click('modeToggle'); page.input('patientId','C03'); page.click('restoreDefaults'); assert.equal(page.elements.patientDisplay.textContent,'A01');
page.click('modeToggle'); page.click('testButton'); assert.match(page.elements.testButtonOut.textContent, /1/);
page.input('testText','hello'); assert.match(page.elements.testTextOut.textContent, /hello/);
page.input('testNumber','101'); assert.match(page.elements.testNumberOut.textContent, /請輸入/);
page.input('testNumber','25'); assert.match(page.elements.testNumberOut.textContent, /有效整數/);
page.input('testSelect','選項 B','change'); assert.match(page.elements.testSelectOut.textContent, /選項 B/);
page.elements.testCheck.checked = true; page.elements.testCheck.handlers.change(); assert.match(page.elements.testCheckOut.textContent, /已勾選/);
page.input('testRange','80'); assert.match(page.elements.testRangeOut.textContent, /80/);
page.input('testTextarea','第一行\n第二行'); assert.match(page.elements.testTextareaOut.textContent, /第二行/);
assert.equal(boot('{broken').elements.patientDisplay.textContent, 'A01');
const denied = boot(null, true); denied.click('modeToggle'); denied.input('hr','90'); assert.equal(denied.elements.hrDisplay.textContent, 90); assert.match(denied.elements.storageFeedback.textContent, /不可用/);
console.log('PASS: input sync/errors, simulation pause, persistence/reload, modes, both resets, interaction feedback, corrupt/blocked storage. DOM mock only; no browser layout claims.');
