// ui.js — DOM rendering and event handling
import { validateDescription, validateAmount, validateDate, validateCategory, validateForm } from './validators.js';
import { loadData, saveData } from './storage.js';
import { getState, addRecord, updateRecord } from './state.js';

// ── Section navigation ───────────────────────────────────────────────────────
const sections = document.querySelectorAll('.page-section');
const navLinks  = document.querySelectorAll('.nav-link');

export function showSection(id) {
  sections.forEach(s => { s.hidden = s.id !== id; });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    showSection(id);
  });
});

// ── Form elements ────────────────────────────────────────────────────────────
const form        = document.getElementById('transaction-form');
const formTitle   = document.getElementById('form-title');
const formStatus  = document.getElementById('form-status');
const editIdInput = document.getElementById('edit-id');
const cancelBtn   = document.getElementById('cancel-btn');

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

// ── Show/clear a single field error ─────────────────────────────────────────
function setError(field, message) {
  errorEls[field].textContent = message;
  fields[field].classList.toggle('invalid', message !== '');
}

// ── Real-time validation: validate each field as user types/changes ──────────
// This gives instant feedback without waiting for form submit
fields.description.addEventListener('input', () =>
  setError('description', validateDescription(fields.description.value)));

fields.amount.addEventListener('input', () =>
  setError('amount', validateAmount(fields.amount.value)));

fields.date.addEventListener('input', () =>
  setError('date', validateDate(fields.date.value)));

fields.category.addEventListener('change', () =>
  setError('category', validateCategory(fields.category.value)));

// ── Form submit ──────────────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault(); // stop page reload

  const data = {
    description: fields.description.value,
    amount:      fields.amount.value,
    date:        fields.date.value,
    category:    fields.category.value,
  };

  const { valid, errors } = validateForm(data);

  // Show all errors at once if any field is invalid
  Object.keys(errors).forEach(field => setError(field, errors[field]));

  if (!valid) {
    formStatus.textContent = 'Please fix the errors above before saving.';
    return;
  }

  const isEditing = editIdInput.value !== '';

  if (isEditing) {
    updateRecord(editIdInput.value, data);
    formStatus.textContent = 'Transaction updated.';
  } else {
    addRecord(data);
    formStatus.textContent = 'Transaction saved.';
  }

  resetForm();
  showSection('records');
});

// ── Cancel button ────────────────────────────────────────────────────────────
cancelBtn.addEventListener('click', () => {
  resetForm();
  showSection('records');
});

// ── Reset form to blank state ────────────────────────────────────────────────
function resetForm() {
  form.reset();
  editIdInput.value = '';
  formTitle.textContent = 'Add Transaction';
  formStatus.textContent = '';
  Object.keys(errorEls).forEach(f => setError(f, ''));
}

// ── Initial load ─────────────────────────────────────────────────────────────
showSection('about');
