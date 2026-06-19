import { getState } from './state.js';

const CAP_KEY = 'finance-tracker:cap';

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadCap() {
  return parseFloat(localStorage.getItem(CAP_KEY)) || 0;
}

function saveCap(value) {
  localStorage.setItem(CAP_KEY, value);
}

// Returns the last 7 days as YYYY-MM-DD strings, oldest first
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

// ── Main render function ──────────────────────────────────────────────────────
export function renderDashboard() {
  const records = getState();
  const cap     = loadCap();

  // ── Stat: total count ────────────────────────────────────────────────────
  document.getElementById('stat-count').textContent = records.length;

  // ── Stat: total spent ────────────────────────────────────────────────────
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  document.getElementById('stat-total').textContent =
    Number(total.toFixed(0)).toLocaleString();

  // ── Stat: top category ───────────────────────────────────────────────────
  const catTotals = {};
  records.forEach(r => {
    catTotals[r.category] = (catTotals[r.category] || 0) + r.amount;
  });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('stat-top-cat').textContent = topCat ? topCat[0] : '—';

  // ── Stat: last 7 days ────────────────────────────────────────────────────
  const days   = last7Days();
  const recent = records.filter(r => days.includes(r.date));
  const sum7   = recent.reduce((s, r) => s + r.amount, 0);
  document.getElementById('stat-7days').textContent =
    Number(sum7.toFixed(0)).toLocaleString();

  // ── Budget cap status ────────────────────────────────────────────────────
  const capStatus = document.getElementById('cap-status');

  if (cap > 0) {
    const remaining = cap - total;
    if (remaining < 0) {
      // Over budget — assertive interrupts the user immediately
      capStatus.setAttribute('aria-live', 'assertive');
      capStatus.innerHTML = `
        <span style="color:var(--color-danger); font-weight:500;">
          ⚠ Over budget by RWF ${Math.abs(remaining).toLocaleString()}
          (cap: RWF ${cap.toLocaleString()})
        </span>`;
    } else {
      // Under budget — polite, doesn't interrupt
      capStatus.setAttribute('aria-live', 'polite');
      capStatus.innerHTML = `
        <span style="color:var(--color-accent); font-weight:500;">
          ✓ RWF ${remaining.toLocaleString()} remaining of your
          RWF ${cap.toLocaleString()} budget
        </span>`;
    }
  } else {
    capStatus.textContent = 'No budget cap set.';
  }

  // ── 7-day bar chart ──────────────────────────────────────────────────────
  const chart  = document.getElementById('chart');
  const labels = document.getElementById('chart-labels');

  // Total spent per day
  const dayTotals = days.map(day => ({
    day,
    label: new Date(day + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }),
    total: records.filter(r => r.date === day).reduce((s, r) => s + r.amount, 0),
  }));

  const maxVal = Math.max(...dayTotals.map(d => d.total), 1);

  chart.innerHTML  = '';
  labels.innerHTML = '';

  dayTotals.forEach(({ day, label, total }) => {
    const heightPct = Math.round((total / maxVal) * 100);

    // Bar
    const bar = document.createElement('div');
    bar.style.cssText = `
      flex: 1;
      height: ${heightPct}%;
      background: var(--color-accent);
      border-radius: 4px 4px 0 0;
      min-height: ${total > 0 ? '4px' : '0'};
      position: relative;
      transition: height 0.3s ease;
    `;
    bar.setAttribute('role', 'img');
    bar.setAttribute('aria-label', `${label}: RWF ${total.toLocaleString()}`);

    // Tooltip on hover
    bar.title = `${day}: RWF ${total.toLocaleString()}`;
    chart.appendChild(bar);

    // Label below chart
    const lbl = document.createElement('div');
    lbl.style.cssText = `
      flex: 1;
      text-align: center;
      font-size: 0.72rem;
      color: var(--color-text-muted);
    `;
    lbl.textContent = label;
    labels.appendChild(lbl);
  });

  // ── Cap input: pre-fill with saved value ─────────────────────────────────
  const capInput = document.getElementById('cap-input');
  if (cap > 0) capInput.value = cap;
}

// ── Cap save button ───────────────────────────────────────────────────────────
document.getElementById('cap-save-btn').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('cap-input').value);
  if (!val || val <= 0) {
    document.getElementById('cap-status').textContent = 'Enter a valid amount.';
    return;
  }
  saveCap(val);
  renderDashboard();
});
