# Student Finance Tracker

A responsive, accessible, vanilla HTML/CSS/JS web app for tracking student expenses.
No frameworks. No libraries. Just clean, modular code.

**Live demo:** https://orionkabeza.github.io/finance-tracker-app/

---

## Chosen Theme
Student Finance Tracker — track transactions by category, set a budget cap,
search with regex, and import/export your data as JSON.

---

## Features
- Add, edit, and delete expense transactions
- Categories: Food, Books, Transport, Entertainment, Fees, Other
- Live regex search with match highlighting
- Sort records by date, description, or amount
- Dashboard with total spend, top category, and 7-day trend chart
- Budget cap with live ARIA announcements when exceeded
- Currency conversion (RWF + 2 others) with manual rates in Settings
- Import / export data as JSON with validation
- Auto-save to localStorage — data persists across sessions
- Fully keyboard navigable
- Mobile-first responsive design (360px, 768px, 1024px breakpoints)

---

## Regex Catalog

| Rule | Pattern | Example match | Example fail |
|------|---------|---------------|--------------|
| Description | `/^\S(?:.*\S)?$/` | `"Lunch at cafeteria"` | `" Lunch "` |
| Amount | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | `12.50`, `0`, `100` | `12.5.6`, `-5` |
| Date | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | `2025-09-29` | `2025-13-01` |
| Category/tag | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Food`, `Books` | `Food!`, `123` |
| Advanced — duplicate word | `/\b(\w+)\s+\1\b/i` | `"the the"`, `"a a"` | `"the cat"` |
| Search — cents present | `/\.\d{2}\b/` | `12.50`, `0.99` | `12`, `12.5` |
| Search — beverage keyword | `/(coffee\|tea)/i` | `"coffee with friends"` | `"water"` |

---

## Keyboard Map

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through interactive elements |
| `Shift+Tab` | Move focus backward |
| `Enter` / `Space` | Activate buttons and links |
| `Arrow keys` | Navigate within dropdowns and sort controls |
| `Escape` | Cancel edit mode |
| `Tab` on skip link | Reveals "Skip to main content" link (first Tab on page load) |

---

## Accessibility Notes
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- All form inputs have bound `<label>` elements
- Skip-to-content link visible on focus
- `aria-live="polite"` region announces budget status updates
- `aria-live="assertive"` used when budget cap is exceeded
- `role="status"` on search result count
- `[hidden]` attribute used (not `display:none`) so content is removed from accessibility tree
- Focus styles visible on all interactive elements (never `outline: none`)
- Color contrast ratio ≥ 4.5:1 for all text

---

## File Structure
```
finance-tracker-app/
├── index.html          — single page, all 5 sections
├── tests.html          — regex unit tests
├── seed.json           — 10+ sample records
├── README.md
├── styles/
│   ├── main.css        — layout, variables, typography
│   └── components.css  — buttons, forms, table, cards
├── scripts/
│   ├── storage.js      — localStorage read/write
│   ├── state.js        — app data in memory
│   ├── validators.js   — all regex validation rules
│   ├── search.js       — regex search + highlight
│   └── ui.js           — DOM updates, rendering, events
└── assets/
    └── wireframes.png  — M1 wireframe sketches
```

---

## How to Run Tests
1. Open `tests.html` in your browser
2. Open the browser console (F12 → Console)
3. All regex test results print automatically — green = pass, red = fail

No build step. No npm. Just open the file.

---

## Data Model
```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2025-09-29",
  "createdAt": "2025-09-29T10:30:00.000Z",
  "updatedAt": "2025-09-29T10:30:00.000Z"
}
```

---

## Import / Export
- Click **Export** in Settings to download your data as `transactions.json`
- Click **Import** to load a JSON file — the app validates structure before loading
- Invalid files are rejected with an error message

---

## Currency Settings
Set manual exchange rates in Settings. Base currency is RWF.
Supported: RWF, USD, EUR (rates editable, no API dependency).

---

## Seed Data
`seed.json` contains 10 diverse records covering edge cases:
large amounts, small amounts, multi-word descriptions, all categories,
and date range spread across multiple months.
