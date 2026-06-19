import { getState } from './state.js';
import { saveData, loadData } from './storage.js';

const RATES_KEY = 'finance-tracker:rates';

export function loadRates() {
  return JSON.parse(localStorage.getItem(RATES_KEY) || '{"usd":1300,"eur":1400}');
}

function saveRates(rates) {
  localStorage.setItem(RATES_KEY, JSON.stringify(rates));
}

export function initSettings() {
  const rates = loadRates();
  document.getElementById('rate-usd').value = rates.usd;
  document.getElementById('rate-eur').value = rates.eur;

  // Save rates
  document.getElementById('save-rates-btn').addEventListener('click', () => {
    const usd = parseFloat(document.getElementById('rate-usd').value);
    const eur = parseFloat(document.getElementById('rate-eur').value);
    const status = document.getElementById('rates-status');

    if (!usd || !eur || usd <= 0 || eur <= 0) {
      status.textContent = 'Enter valid rates for both currencies.';
      return;
    }
    saveRates({ usd, eur });
    status.textContent = 'Rates saved.';
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const data    = getState();
    const blob    = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'transactions.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import
  document.getElementById('import-input').addEventListener('change', e => {
    const file   = e.target.files[0];
    const status = document.getElementById('import-status');
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);

        // Validate structure
        if (!Array.isArray(parsed)) throw new Error('File must contain an array.');

        const required = ['id', 'description', 'amount', 'category', 'date'];
        parsed.forEach((r, i) => {
          required.forEach(key => {
            if (!(key in r)) throw new Error(`Record ${i + 1} is missing field: ${key}`);
          });
          if (typeof r.amount !== 'number') throw new Error(`Record ${i + 1}: amount must be a number.`);
        });

        saveData(parsed);
        location.reload(); // reload so state re-initialises from localStorage
      } catch (err) {
        status.textContent = `Import failed: ${err.message}`;
      }
    };
    reader.readAsText(file);
  });
}
