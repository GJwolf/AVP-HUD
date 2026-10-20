(function () {
  'use strict';
  const Model = window.AvpHudState;
  const $ = id => document.getElementById(id);
  let state = Model.defaults();
  let timer;
  let modeCount = 0;
  let storageMessage = '設定將自動儲存在本機。';
  let storageAvailable = true;
  try {
    const saved = localStorage.getItem(Model.KEY);
    if (saved !== null) {
      state = Model.sanitize(JSON.parse(saved));
      storageMessage = '已恢復本機儲存的網頁設定與測試資料。';
    }
  } catch (error) {
    storageMessage = '無法讀取已存設定，改用預設值；頁面仍可操作。';
  }
  function persist() {
    try {
      localStorage.setItem(Model.KEY, JSON.stringify(state));
      storageAvailable = true;
      storageMessage = '已自動儲存本機網頁設定與測試資料。';
    } catch (error) {
      storageAvailable = false;
      storageMessage = '本機儲存不可用；目前操作有效，重新整理可能遺失。';
    }
    $('storageFeedback').textContent = storageMessage;
  }
  function notify(message) {
    $('notice').hidden = false;
    $('notice').textContent = message;
  }
  function renderHud() {
    const p = state.patient;
    $('patientDisplay').textContent = p.id;
    $('hrDisplay').textContent = p.hr;
    $('spo2Display').textContent = p.spo2;
    $('statusDisplay').textContent = Model.STATUS[p.status];
    $('statusDisplay').className = 'status ' + p.status;
    $('notesDisplay').textContent = p.notes;
    $('notesDisplay').hidden = !p.notes;
    $('simulationDisplay').textContent = state.running ? `假資料更新中 · 每 ${state.interval / 1000} 秒` : '手動測試資料 · 模擬已暫停';
    $('simulationToggle').textContent = state.running ? '暫停假資料更新' : '啟動假資料更新';
    $('simulationToggle').setAttribute('aria-pressed', String(state.running));
  }
  function stamp() {
    const now = new Date();
    $('updated').textContent = now.toLocaleTimeString('zh-TW', { hour12: false });
    $('updated').dateTime = now.toISOString();
  }
  function renderAppearance() {
    const style = document.documentElement.style;
    style.setProperty('--hud-width', state.hudWidth + 'px');
    style.setProperty('--text-scale', state.textScale / 100);
    style.setProperty('--layout-scale', state.layoutScale / 100);
    style.setProperty('--panel-alpha', state.panelAlpha / 100);
    style.setProperty('--metric-alpha', state.metricAlpha / 100);
    document.documentElement.dataset.background = state.background;
    document.body.classList.toggle('shadow', state.shadow);
    for (const key of Object.keys(Model.ranges)) $(key + 'Out').textContent = state[key] + (key === 'hudWidth' ? ' px' : '%');
  }
  function renderMode(focus) {
    const editing = state.mode === 'settings';
    document.body.dataset.mode = state.mode;
    $('settings').hidden = !editing;
    $('modeToggle').textContent = editing ? '返回 HUD 顯示模式' : '設定／輸入';
    $('modeToggle').setAttribute('aria-expanded', String(editing));
    if (focus) {
      (editing ? $('settingsTitle') : $('modeToggle')).focus({ preventScroll: true });
      if (!editing) window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  function syncInputs() {
    const p = state.patient;
    for (const [id, key] of [['patientId', 'id'], ['hr', 'hr'], ['spo2', 'spo2'], ['patientStatus', 'status'], ['notes', 'notes']]) $(id).value = p[key];
    for (const key of [...Object.keys(Model.ranges), 'background', 'scenario', 'interval']) $(key).value = String(state[key]);
    $('shadow').checked = state.shadow;
    for (const id of ['patientId', 'hr', 'spo2']) {
      $(id).setAttribute('aria-invalid', 'false');
      $(id + 'Error').textContent = '';
    }
  }
  function schedule() {
    clearInterval(timer);
    if (state.running) timer = setInterval(sample, state.interval);
  }
  function sample() {
    state.patient = Model.simulate(state.patient, state.scenario);
    syncInputs();
    renderHud(); stamp(); persist();
  }
  function pauseForEditing() {
    if (state.running) { state.running = false; schedule(); }
  }
  function validPatientInput(id) {
    const element = $(id);
    let message = '';
    let value = element.value;
    if (id === 'patientId') {
      value = value.trim();
      if (!value || value.length > 32) message = '請輸入 1–32 字的傷患編號；HUD 暫時保留上一筆有效值。';
    } else {
      const max = id === 'hr' ? 300 : 100;
      value = Model.integer(value, 0, max);
      if (value === null || !element.validity.valid) message = `請輸入 0–${max} 的整數；HUD 暫時保留上一筆有效值。`;
    }
    element.setAttribute('aria-invalid', String(Boolean(message)));
    $(id + 'Error').textContent = message;
    return { value, message };
  }
  for (const [id, key] of [['patientId', 'id'], ['hr', 'hr'], ['spo2', 'spo2']]) {
    $(id).addEventListener('input', () => {
      pauseForEditing();
      const result = validPatientInput(id);
      if (!result.message) { state.patient[key] = result.value; stamp(); }
      $('patientFeedback').textContent = result.message || '有效輸入已同步 HUD；模擬已暫停。';
      renderHud(); persist();
    });
  }
  for (const [id, key] of [['patientStatus', 'status'], ['notes', 'notes']]) {
    $(id).addEventListener('input', () => {
      pauseForEditing();
      state.patient[key] = $(id).value;
      renderHud(); stamp(); persist();
      $('patientFeedback').textContent = '已同步 HUD；模擬已暫停。';
    });
  }
  for (const key of Object.keys(Model.ranges)) $(key).addEventListener('input', () => {
    state[key] = Number($(key).value); renderAppearance(); persist();
  });
  $('background').addEventListener('change', () => { state.background = $('background').value; renderAppearance(); persist(); });
  $('shadow').addEventListener('change', () => { state.shadow = $('shadow').checked; renderAppearance(); persist(); });
  $('scenario').addEventListener('change', () => { state.scenario = $('scenario').value; if (state.running) sample(); else persist(); });
  $('interval').addEventListener('change', () => { state.interval = Number($('interval').value); schedule(); renderHud(); persist(); });
  $('simulationToggle').addEventListener('click', () => {
    state.running = !state.running;
    if (state.running) sample();
    schedule(); renderHud(); persist();
  });
  $('modeToggle').addEventListener('click', () => {
    state.mode = state.mode === 'hud' ? 'settings' : 'hud';
    modeCount++;
    $('modeFeedback').textContent = `已切換 ${modeCount} 次；目前：${state.mode === 'hud' ? 'HUD 顯示模式' : '設定／輸入模式'}`;
    $('notice').hidden = true;
    renderMode(true); persist();
  });
  $('returnHud').addEventListener('click', () => $('modeToggle').click());
  function reset(clearPatient) {
    state = Model.resetLayout(state, clearPatient);
    $('clearPatient').checked = false;
    syncInputs(); renderHud(); renderAppearance(); renderMode(true); schedule(); stamp(); persist();
    $('patientFeedback').textContent = '已重置版面與顯示設定。';
    notify((clearPatient ? '已恢復 A01 範例資料與預設版面。' : '已重置網頁版面，保留傷患資料。') + ' 實際 AVP 視窗大小與位置未改變。' + (storageAvailable ? '' : ' 本機儲存不可用。'));
  }
  $('resetHud').addEventListener('click', () => reset($('clearPatient').checked));
  $('restoreDefaults').addEventListener('click', () => reset(true));
  let clicks = 0;
  $('testButton').addEventListener('click', () => { $('testButtonOut').textContent = `已點擊 ${++clicks} 次`; });
  $('testText').addEventListener('input', () => { $('testTextOut').textContent = $('testText').value ? `目前：${$('testText').value}` : '尚未輸入'; });
  $('testNumber').addEventListener('input', () => {
    const element = $('testNumber');
    const valid = Model.integer(element.value, 0, 100) !== null && element.validity.valid;
    element.setAttribute('aria-invalid', String(!valid));
    $('testNumberOut').textContent = valid ? `有效整數：${element.value}` : '請輸入 0–100 的整數';
  });
  $('testSelect').addEventListener('change', () => { $('testSelectOut').textContent = '目前：' + $('testSelect').value; });
  $('testCheck').addEventListener('change', () => { $('testCheckOut').textContent = $('testCheck').checked ? '已勾選 ✓' : '未勾選'; });
  $('testRange').addEventListener('input', () => { $('testRangeOut').textContent = '目前：' + $('testRange').value; });
  $('testTextarea').addEventListener('input', () => { $('testTextareaOut').textContent = $('testTextarea').value ? `已輸入 ${$('testTextarea').value.length} 字：\n${$('testTextarea').value}` : '尚未輸入'; });
  syncInputs(); renderHud(); renderAppearance(); renderMode(false); schedule();
  $('storageFeedback').textContent = storageMessage;
  // Persist defaults too, detecting disabled storage before the first user edit.
  if (storageMessage === '設定將自動儲存在本機。') persist();
})();
