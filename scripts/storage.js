const KEY = 'finance-tracker:data';
export const loadData = () => JSON.parse(localStorage.getItem(KEY) || '[]');
export const saveData = data => localStorage.setItem(KEY, JSON.stringify(data));
