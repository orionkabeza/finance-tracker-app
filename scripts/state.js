import { loadData, saveData } from './storage.js';

let records = loadData();

export const getState = () => records;

export function addRecord(data) {
  const now = new Date().toISOString();
  const id  = 'txn_' + Date.now();
  records.push({ id, ...data, amount: parseFloat(data.amount), createdAt: now, updatedAt: now });
  saveData(records);
}

export function updateRecord(id, data) {
  records = records.map(r =>
    r.id === id ? { ...r, ...data, amount: parseFloat(data.amount), updatedAt: new Date().toISOString() } : r
  );
  saveData(records);
}

export function deleteRecord(id) {
  records = records.filter(r => r.id !== id);
  saveData(records);
}
