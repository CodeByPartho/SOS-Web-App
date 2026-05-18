// ============================================================
//  SOS GUARD — Emergency Help App
//  app.js — Core Logic
// ============================================================

// ── State ──────────────────────────────────────────────────
const state = {
  contacts: [],
  currentLat: null,
  currentLon: null,
  alarmActive: false,
  sosTimer: null,
  sosHoldDuration: 2000, // ms
  sosHoldStart: null,
  sosProgressInterval: null,
  audioCtx: null,
  alarmNodes: [],
  log: [],
};

// ── DOM helpers ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const showPage = page => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  $(`page-${page}`).classList.add('active');
  const navBtn = $(`nav-${page}`);
  if (navBtn) navBtn.classList.add('active');
};

// ── Toast ──────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '', duration = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.className = 'toast hidden', duration);
}

// ── Log ────────────────────────────────────────────────────
function addLog(msg, type = 'info') {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  state.log.unshift({ msg, type, time });
  if (state.log.length > 30) state.log.pop();
  renderLog();
}

function renderLog() {
  const el = $('activityLog');
  if (state.log.length === 0) {
    el.innerHTML = '<div class="log-empty">No recent activity</div>';
    return;
  }
  el.innerHTML = state.log.map(entry => `
    <div class="log-item log-${entry.type}">
      <span class="log-time">${entry.time}</span>
      <span class="log-msg">${entry.msg}</span>
    </div>
  `).join('');
}

function clearLog() {
  state.log = [];
  renderLog();
}

// ── Storage ────────────────────────────────────────────────
function saveData() {
  localStorage.setItem('sos_contacts', JSON.stringify(state.contacts));
  localStorage.setItem('sos_log', JSON.stringify(state.log));
  const msg = $('sosMessage')?.value;
  if (msg) localStorage.setItem('sos_message', msg);
}

function loadData() {
  try {
    const contacts = localStorage.getItem('sos_contacts');
    if (contacts) state.contacts = JSON.parse(contacts);
    const log = localStorage.getItem('sos_log');
    if (log) state.log = JSON.parse(log);
    const msg = localStorage.getItem('sos_message');
    if (msg && $('sosMessage')) $('sosMessage').value = msg;
    const autoCall = localStorage.getItem('sos_autoCall');
    if (autoCall !== null && $('autoCall')) $('autoCall').checked = autoCall === 'true';
    const autoAlarm = localStorage.getItem('sos_autoAlarm');
    if (autoAlarm !== null && $('autoAlarm')) $('autoAlarm').checked = autoAlarm === 'true';
    const lowBatt = localStorage.getItem('sos_lowBattery');
    if (lowBatt !== null && $('lowBatteryMode')) {
      $('lowBatteryMode').checked = lowBatt === 'true';
      if (lowBatt === 'true') document.body.classList.add('low-battery');
    }
  } catch (e) {
    console.warn('Failed to load data', e);
  }
}

// ── Battery ────────────────────────────────────────────────
async function initBattery() {
  try {
    if (!('getBattery' in navigator)) return;
    const battery = await navigator.getBattery();
    const update = () => {
      const pct = Math.round(battery.level * 100);
      $('batteryLevel').textContent = pct;
      const badge = $('batteryIndicator');
      badge.style.color = pct <= 20 ? '#ff6b00' : pct <= 10 ? '#ff2233' : '';
      if (pct <= 15 && !$('lowBatteryMode').checked) {
        addLog(`⚠️ Low battery: ${pct}% — consider enabling Low Battery Mode`, 'warn');
      }
    };
    update();
    battery.addEventListener('levelchange', update);
    battery.addEventListener('chargingchange', update);
  } catch (e) { /* Battery API not available */ }
}

// ── GPS Location ───────────────────────────────────────────
function acquireLocation() {
  if (!navigator.geolocation) {
    showToast('❌ Geolocation not supported on this device', 'error');
    addLog('GPS not supported on this device', 'warn');
    return;
  }

  setStatus('Acquiring GPS location...', 'locating');
  $('gpsStatus').textContent = 'Acquiring...';

  navigator.geolocation.getCurrentPosition(
    pos => {
      state.currentLat = pos.coords.latitude;
      state.currentLon = pos.coords.longitude;
      const accuracy = Math.round(pos.coords.accuracy);
      $('gpsStatus').textContent = `${state.currentLat.toFixed(4)}, ${state.currentLon.toFixed(4)}`;
      addLog(`📍 GPS acquired (±${accuracy}m)`, 'success');
      setStatus('● GPS ready — tap SOS to send alert', 'ready');
      showToast(`📍 Location acquired (±${accuracy}m)`, 'success');
    },
    err => {
      const msgs = {
        1: 'Permission denied. Please allow location access.',
        2: 'Position unavailable. Check GPS.',
        3: 'Location request timed out.',
      };
      const msg = msgs[err.code] || 'Location error.';
      addLog(`❌ GPS Error: ${msg}`, 'warn');
      setStatus('● GPS failed — location unavailable', 'warning');
      showToast(`⚠️ ${msg}`, 'error');
    },
    { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
  );
}

function getLocationURL() {
  if (state.currentLat !== null && state.currentLon !== null) {
    return `https://maps.google.com/?q=${state.currentLat},${state.currentLon}`;
  }
  return 'Location unavailable (GPS not acquired)';
}

function shareLocation() {
  if (state.currentLat === null) {
    acquireLocation();
    showToast('Acquiring location first...', 'info');
    return;
  }
  const url = getLocationURL();
  if (navigator.share) {
    navigator.share({ title: 'My Location', url })
      .then(() => { addLog('📤 Location shared', 'success'); showToast('Location shared!', 'success'); })
      .catch(() => copyToClipboard(url));
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text)
    .then(() => { addLog('📋 Location link copied', 'info'); showToast('Location link copied!', 'info'); })
    .catch(() => showToast('Copy: ' + text, 'info', 6000));
}

// ── Status bar ─────────────────────────────────────────────
function setStatus(text, type) {
  const bar = $('statusBar');
  bar.className = `status-bar status-${type}`;
  $('statusText').textContent = text;
}

// ── Contacts ───────────────────────────────────────────────
function addContact() {
  const name = $('contactName').value.trim();
  const phone = $('contactPhone').value.trim();
  const primary = $('contactPrimary').checked;

  if (!name) { showToast('Please enter a name', 'error'); return; }
  if (!phone || phone.length < 6) { showToast('Please enter a valid phone number', 'error'); return; }

  if (primary) {
    state.contacts.forEach(c => c.primary = false);
  }

  const contact = {
    id: Date.now(),
    name,
    phone,
    primary: primary || state.contacts.length === 0,
  };

  state.contacts.push(contact);
  saveData();
  renderContacts();

  $('contactName').value = '';
  $('contactPhone').value = '';
  $('contactPrimary').checked = false;

  addLog(`👤 Contact added: ${name}`, 'success');
  showToast(`✅ ${name} added as emergency contact`, 'success');
}

function deleteContact(id) {
  const c = state.contacts.find(c => c.id === id);
  if (!c) return;
  if (!confirm(`Remove ${c.name} from emergency contacts?`)) return;
  state.contacts = state.contacts.filter(c => c.id !== id);
  if (state.contacts.length > 0 && !state.contacts.some(c => c.primary)) {
    state.contacts[0].primary = true;
  }
  saveData();
  renderContacts();
  addLog(`🗑️ Contact removed: ${c.name}`, 'warn');
  showToast(`${c.name} removed`, '');
}

function setPrimary(id) {
  state.contacts.forEach(c => c.primary = c.id === id);
  saveData();
  renderContacts();
  const c = state.contacts.find(c => c.id === id);
  addLog(`⭐ Primary contact set: ${c?.name}`, 'info');
  showToast(`${c?.name} set as primary contact`, 'success');
}

function callContact(phone, name) {
  addLog(`📞 Calling ${name} (${phone})`, 'success');
  window.location.href = `tel:${phone}`;
}

function renderContacts() {
  const list = $('contactsList');
  $('contactCount').textContent = `${state.contacts.length} saved`;

  if (state.contacts.length === 0) {
    list.innerHTML = '<div class="empty-state">No contacts added yet.<br/>Add at least one emergency contact.</div>';
    return;
  }

  list.innerHTML = state.contacts.map(c => `
    <div class="contact-card ${c.primary ? 'primary' : ''}">
      <div class="contact-avatar">👤</div>
      <div class="contact-info">
        <div class="contact-name">
          ${escapeHtml(c.name)}
          ${c.primary ? '<span class="primary-badge">PRIMARY</span>' : ''}
        </div>
        <div class="contact-phone">${escapeHtml(c.phone)}</div>
      </div>
      <div class="contact-actions">
        ${!c.primary ? `<button class="contact-action" onclick="setPrimary(${c.id})" title="Set as primary">⭐</button>` : ''}
        <button class="contact-action" onclick="callContact('${escapeHtml(c.phone)}','${escapeHtml(c.name)}')" title="Call">📞</button>
        <button class="contact-action" onclick="deleteContact(${c.id})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── SMS ────────────────────────────────────────────────────
function buildSMSMessage() {
  const template = $('sosMessage')?.value ||
    '🆘 EMERGENCY! I need help! My current location: {LOCATION}';
  return template.replace('{LOCATION}', getLocationURL());
}

function sendSMS(phone, message) {
  const encoded = encodeURIComponent(message);
  // Use sms: URI scheme — works on mobile devices
  const link = `sms:${phone}?body=${encoded}`;
  window.open(link, '_blank');
}

function sendSMSToAll() {
  if (state.contacts.length === 0) {
    showToast('⚠️ No emergency contacts! Add contacts first.', 'error');
    addLog('⚠️ SOS: No contacts to notify', 'warn');
    return false;
  }

  const msg = buildSMSMessage();
  addLog(`💬 Sending SMS to ${state.contacts.length} contact(s)`, 'sos');

  // Open SMS for each contact with a small delay
  state.contacts.forEach((contact, i) => {
    setTimeout(() => {
      sendSMS(contact.phone, msg);
      addLog(`💬 SMS → ${contact.name} (${contact.phone})`, 'success');
    }, i * 800);
  });

  return true;
}

function sendSMSOnly() {
  if (state.currentLat === null) {
    acquireLocation();
    setTimeout(sendSMSToAll, 3000);
    showToast('Getting location then sending SMS...', 'info');
  } else {
    sendSMSToAll();
    showToast('SMS sending to all contacts...', 'success');
  }
}

// ── Call ───────────────────────────────────────────────────
function callFirstContact() {
  const primary = state.contacts.find(c => c.primary) || state.contacts[0];
  if (!primary) {
    showToast('⚠️ No emergency contacts saved!', 'error');
    addLog('⚠️ No contacts to call', 'warn');
    return;
  }
  addLog(`📞 Calling ${primary.name}`, 'sos');
  window.location.href = `tel:${primary.phone}`;
}

// ── Alarm Sound ────────────────────────────────────────────
function initAudio() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playAlarmSound() {
  initAudio();
  stopAlarmSound();

  const ctx = state.audioCtx;
  let time = ctx.currentTime;

  // Create a piercing alarm pattern
  for (let i = 0; i < 60; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startT = time + i * 0.1;

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, startT);
    osc.frequency.setValueAtTime(i % 2 === 0 ? 1320 : 880, startT + 0.05);

    gain.gain.setValueAtTime(0, startT);
    gain.gain.linearRampToValueAtTime(0.7, startT + 0.01);
    gain.gain.setValueAtTime(0.7, startT + 0.09);
    gain.gain.linearRampToValueAtTime(0, startT + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startT);
    osc.stop(startT + 0.1);

    state.alarmNodes.push(osc);
  }

  addLog('🔊 Alarm sound playing', 'sos');
}

function stopAlarmSound() {
  state.alarmNodes.forEach(node => {
    try { node.stop(); node.disconnect(); } catch (e) {}
  });
  state.alarmNodes = [];
}

// ── Alarm UI ───────────────────────────────────────────────
function toggleAlarm() {
  if (state.alarmActive) {
    stopAlarm();
  } else {
    startAlarm();
  }
}

function startAlarm() {
  state.alarmActive = true;
  $('alarmOverlay').classList.remove('hidden');
  playAlarmSound();
  addLog('🚨 Loud alarm activated', 'sos');
  showToast('🔊 ALARM ACTIVE', 'error');

  // Auto-restart alarm sound in loop
  state.alarmInterval = setInterval(() => {
    if (state.alarmActive) playAlarmSound();
  }, 6200);
}

function stopAlarm() {
  state.alarmActive = false;
  $('alarmOverlay').classList.add('hidden');
  stopAlarmSound();
  clearInterval(state.alarmInterval);
  addLog('🔇 Alarm stopped', 'info');
  showToast('Alarm stopped', '');
}

// ── SOS Hold Button ────────────────────────────────────────
const SOS_CIRCUMFERENCE = 2 * Math.PI * 54; // ~339.3

function startSosHold(e) {
  if (e) e.preventDefault();
  if (state.sosTimer) return;

  const btn = $('sosBtn');
  btn.classList.add('holding');
  state.sosHoldStart = Date.now();

  // Animate progress ring
  const circle = $('sosProgressCircle');
  state.sosProgressInterval = setInterval(() => {
    const elapsed = Date.now() - state.sosHoldStart;
    const progress = Math.min(elapsed / state.sosHoldDuration, 1);
    const offset = SOS_CIRCUMFERENCE * (1 - progress);
    circle.style.strokeDashoffset = offset;
  }, 16);

  state.sosTimer = setTimeout(() => {
    triggerSOS();
  }, state.sosHoldDuration);
}

function cancelSosHold() {
  if (state.sosTimer) {
    clearTimeout(state.sosTimer);
    state.sosTimer = null;
  }
  if (state.sosProgressInterval) {
    clearInterval(state.sosProgressInterval);
    state.sosProgressInterval = null;
  }
  const btn = $('sosBtn');
  if (btn) btn.classList.remove('holding');
  const circle = $('sosProgressCircle');
  if (circle) circle.style.strokeDashoffset = SOS_CIRCUMFERENCE;
}

// ── MAIN SOS TRIGGER ───────────────────────────────────────
async function triggerSOS() {
  cancelSosHold();
  setStatus('🚨 SOS ACTIVATED — Sending alerts...', 'active');
  document.body.classList.add('sos-active');
  addLog('🚨 SOS ACTIVATED', 'sos');
  showToast('🚨 SOS SENT! Help is on the way.', 'error', 5000);

  // 1. Get location (if not already acquired)
  if (state.currentLat === null) {
    addLog('📍 Acquiring GPS location...', 'info');
    await acquireLocationAsync();
  }

  // 2. Play alarm if setting enabled
  if ($('autoAlarm')?.checked !== false) {
    startAlarm();
  }

  // 3. Send SMS to all contacts
  const sent = sendSMSToAll();

  // 4. Auto-call first contact if setting enabled
  if ($('autoCall')?.checked !== false && sent) {
    setTimeout(() => {
      addLog('📞 Auto-calling primary contact...', 'info');
      callFirstContact();
    }, 1500);
  }

  // 5. Update status
  setTimeout(() => {
    document.body.classList.remove('sos-active');
    if (state.alarmActive) {
      setStatus('🔊 Alarm active — press SOS again if needed', 'active');
    } else {
      setStatus('✅ SOS sent — contacts notified', 'ready');
    }
  }, 4000);

  saveData();
}

function acquireLocationAsync() {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        state.currentLat = pos.coords.latitude;
        state.currentLon = pos.coords.longitude;
        $('gpsStatus').textContent = `${state.currentLat.toFixed(4)}, ${state.currentLon.toFixed(4)}`;
        addLog('📍 GPS acquired', 'success');
        resolve();
      },
      () => {
        addLog('⚠️ GPS failed — sending without location', 'warn');
        resolve();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

// ── Test Alert ─────────────────────────────────────────────
function testAlert() {
  const msg = buildSMSMessage();
  addLog('🧪 Test alert preview generated', 'info');
  alert(`TEST ALERT PREVIEW\n\nMessage that would be sent:\n\n${msg}\n\nTo: ${
    state.contacts.map(c => `${c.name} (${c.phone})`).join(', ') || 'No contacts saved'
  }`);
}

// ── Settings persistence ───────────────────────────────────
function initSettings() {
  $('sosMessage')?.addEventListener('change', saveData);
  $('autoCall')?.addEventListener('change', () => {
    localStorage.setItem('sos_autoCall', $('autoCall').checked);
  });
  $('autoAlarm')?.addEventListener('change', () => {
    localStorage.setItem('sos_autoAlarm', $('autoAlarm').checked);
  });
  $('lowBatteryMode')?.addEventListener('change', () => {
    const on = $('lowBatteryMode').checked;
    localStorage.setItem('sos_lowBattery', on);
    document.body.classList.toggle('low-battery', on);
    showToast(on ? '🔋 Low battery mode ON' : '🔋 Low battery mode OFF', 'info');
  });
}

function resetApp() {
  if (!confirm('Reset ALL data including contacts and settings? This cannot be undone.')) return;
  localStorage.clear();
  state.contacts = [];
  state.log = [];
  state.currentLat = null;
  state.currentLon = null;
  renderContacts();
  renderLog();
  $('gpsStatus').textContent = 'Not acquired';
  $('sosMessage').value = '🆘 EMERGENCY! I need help! My current location: {LOCATION}';
  addLog('🔄 App reset to defaults', 'warn');
  showToast('App data reset', '');
  showPage('home');
}

// ── Auto GPS watch ─────────────────────────────────────────
function startLocationWatch() {
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition(
    pos => {
      state.currentLat = pos.coords.latitude;
      state.currentLon = pos.coords.longitude;
      if ($('gpsStatus').textContent === 'Not acquired' || $('gpsStatus').textContent === 'Acquiring...') {
        $('gpsStatus').textContent = `${state.currentLat.toFixed(4)}, ${state.currentLon.toFixed(4)}`;
        addLog('📍 GPS location auto-acquired', 'success');
        setStatus('● Ready — GPS acquired. Tap SOS to alert.', 'ready');
      } else {
        $('gpsStatus').textContent = `${state.currentLat.toFixed(4)}, ${state.currentLon.toFixed(4)}`;
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
}

// ── Init ───────────────────────────────────────────────────
function init() {
  loadData();
  renderContacts();
  renderLog();
  initBattery();
  initSettings();
  startLocationWatch();
  addLog('✅ SOS Guard ready', 'success');
}

document.addEventListener('DOMContentLoaded', init);
