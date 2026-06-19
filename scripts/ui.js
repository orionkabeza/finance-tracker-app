import { validateDescription, validateAmount, validateDate, validateCategory, validateForm } from './validators.js';
import { getState, addRecord, updateRecord, deleteRecord, seedIfEmpty } from './state.js';
import { compileRegex, highlight, escapeHtml, matchesRecord } from './search.js';
import { renderDashboard } from './dashboard.js';
import { initSettings } from './settings.js';
// ── Section navigation ────────────────────────────────────────────────────────
const sections = document.querySelectorAll('.page-section');
const navLinks  = document.querySelectorAll('.nav-link');

export function showSection(id) {
  sections.forEach(s => { s.hidden = s.id !== id; });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
  if (id === 'records')   renderRecords();
  if (id === 'dashboard') renderDashboard();
  if (id === 'settings')  initSettings();
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showSection(link.getAttribute('href').slice(1));
  });
});

// ── Form elements ─────────────────────────────────────────────────────────────
const form        = document.getElementById('transaction-form');
const formTitle   = document.getElementById('form-title');
const formStatus  = document.getElementById('form-status');
const editIdInput = document.getElementById('edit-id');

const fields = {
  description: document.getElementById('field-description'),
  amount:      document.getElementById('field-amount'),
  date:        document.getElementById('field-date'),
  category:    document.getElementById('field-category'),
};

const errorEls = {
  description: document.getElementById('err-description'),
  amount:      document.getElementById('err-amount'),
  date:        document.getElementById('err-date'),
  category:    document.getElementById('err-category'),
};

// ── Field error display ───────────────────────────────────────────────────────
function setError(field, message) {
  errorEls[field].textContent = message;
  fields[field].classList.toggle('invalid', message !== '');
}

// ── Real-time validation ──────────────────────────────────────────────────────
fields.description.addEventListener('input', () =>
  setError('description', validateDescription(fields.description.value)));

fields.amount.addEventListener('input', () =>
  setError('amount', validateAmount(fields.amount.value)));

fields.date.addEventListener('input', () =>
  setError('date', validateDate(fields.date.value)));

fields.category.addEventListener('change', () =>
  setError('category', validateCategory(fields.category.value)));

// ── Form submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    description: fields.description.value,
    amount:      fields.amount.value,
    date:        fields.date.value,
    category:    fields.category.value,
  };

  const { valid, errors } = validateForm(data);
  Object.keys(errors).forEach(field => setError(field, errors[field]));

  if (!valid) {
    formStatus.textContent = 'Please fix the errors above before saving.';
    return;
  }

  if (editIdInput.value) {
    updateRecord(editIdInput.value, data);
    formStatus.textContent = 'Transaction updated.';
  } else {
    addRecord(data);
    formStatus.textContent = 'Transaction saved.';
  }

  resetForm();
  showSection('records');
});

// ── Cancel ────────────────────────────────────────────────────────────────────
document.getElementById('cancel-btn').addEventListener('click', () => {
  resetForm();
  showSection('records');
});

function resetForm() {
  form.reset();
  editIdInput.value     = '';
  formTitle.textContent = 'Add Transaction';
  formStatus.textContent = '';
  Object.keys(errorEls).forEach(f => setError(f, ''));
}

// ── Records table ─────────────────────────────────────────────────────────────
const tbody       = document.getElementById('records-tbody');
const emptyState  = document.getElementById('empty-state');
const searchMeta  = document.getElementById('search-meta');
const searchInput = document.getElementById('search-input');
const searchCase  = document.getElementById('search-case');

let sortCol = 'date';
let sortDir = -1;

export function renderRecords() {
  let records = [...getState()];
  const query = searchInput.value.trim();

  // Sort
  records.sort((a, b) => {
    if (sortCol === 'amount') return (a.amount - b.amount) * sortDir;
    return String(a[sortCol]).localeCompare(String(b[sortCol])) * sortDir;
  });

  // Regex search — compile safely, then filter
  let regex = null;
  let invalidPattern = false;
  if (query) {
    regex = compileRegex(query, searchCase.checked);
    if (regex) {
      records = records.filter(r => matchesRecord(r, regex));
    } else {
      invalidPattern = true;
    }
  }

  // Status message: invalid-pattern message must NOT be overwritten by the count
  if (invalidPattern) {
    searchMeta.textContent = 'Invalid regex pattern — showing all records.';
  } else if (query) {
    searchMeta.textContent = `${records.length} result${records.length !== 1 ? 's' : ''} found`;
  } else {
    searchMeta.textContent = `${records.length} transaction${records.length !== 1 ? 's' : ''}`;
  }

  // Show/hide empty state
  const tableWrapper = document.querySelector('.table-wrapper');
  emptyState.hidden  = records.length > 0;
  tableWrapper.style.display = records.length === 0 ? 'none' : '';

  // Build rows
  tbody.innerHTML = '';
  records.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${highlight(record.description, regex)}</td>
      <td class="col-hide-mobile">
        <span class="badge badge-${escapeHtml(record.category)}">${highlight(record.category, regex)}</span>
      </td>
      <td>RWF ${Number(record.amount).toLocaleString()}</td>
      <td>${escapeHtml(record.date)}</td>
      <td>
        <div class="row-actions">
          <button class="btn btn-outline" style="padding:0.3rem 0.7rem;font-size:0.8rem;" data-edit="${record.id}">Edit</button>
          <button class="btn btn-danger"  style="padding:0.3rem 0.7rem;font-size:0.8rem;" data-delete="${record.id}">Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Edit listeners
  tbody.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const record = getState().find(r => r.id === btn.dataset.edit);
      if (!record) return;
      fields.description.value = record.description;
      fields.amount.value      = record.amount;
      fields.date.value        = record.date;
      fields.category.value    = record.category;
      editIdInput.value        = record.id;
      formTitle.textContent    = 'Edit Transaction';
      showSection('add');
    });
  });

  // Delete listeners
  tbody.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this transaction?')) {
        deleteRecord(btn.dataset.delete);
        renderRecords();
      }
    });
  });
}

// ── Sort buttons ──────────────────────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const col = btn.dataset.sort;
    sortDir = sortCol === col ? sortDir * -1 : 1;
    sortCol = col;
    renderRecords();
  });
});

// ── Search ────────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', renderRecords);
searchCase.addEventListener('change', renderRecords);

// ── Add buttons ───────────────────────────────────────────────────────────────
document.getElementById('btn-go-add').addEventListener('click', () => showSection('add'));
document.getElementById('btn-empty-add').addEventListener('click', () => showSection('add'));

// ── Initial page ──────────────────────────────────────────────────────────────
// Load seed data on first run (if any), then show the landing section.
seedIfEmpty().finally(() => showSection('about'));
