import { loadData, saveData } from './storage.js';

let records = loadData();

export const getState = () => records;

// First-run convenience: if nothing is saved yet, load the bundled seed.json
// so the deployed app isn't empty. A flag ensures records the user deletes are
// never silently re-added on the next reload. Returns true if seeding happened.
export async function seedIfEmpty() {
  const SEEDED_KEY = 'finance-tracker:seeded';
  if (records.length > 0 || localStorage.getItem(SEEDED_KEY)) return false;
  try {
    const res = await fetch('seed.json');
    if (!res.ok) return false;
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      records = data;
      saveData(records);
      localStorage.setItem(SEEDED_KEY, '1');
      return true;
    }
  } catch {
    /* offline, or opened via file:// — just leave the app empty */
  }
  return false;
}

export function addRecord(data) {
  const now = new Date().toISOString();
  const id  = 'txn_' + Date.now();
  records.push({
    id,
    ...data,
    amount: parseFloat(data.amount),
    createdAt: now,
    updatedAt: now
  });
  saveData(records);
}

export function updateRecord(id, data) {
  records = records.map(r =>
    r.id === id
      ? { ...r, ...data, amount: parseFloat(data.amount), updatedAt: new Date().toISOString() }
      : r
  );
  saveData(records);
}

export function deleteRecord(id) {
  records = records.filter(r => r.id !== id);
  saveData(records);
}
