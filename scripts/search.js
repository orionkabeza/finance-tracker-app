// Safe regex compiler, HTML escaping, and match highlighting for the records search.

// Compile a user-supplied pattern into a RegExp.
// Returns null on empty input OR an invalid pattern (caller shows a message).
// The 'g' flag lets highlight() mark every match, not just the first.
export function compileRegex(input, caseSensitive = false) {
  if (!input) return null;
  try {
    return new RegExp(input, caseSensitive ? 'g' : 'gi');
  } catch {
    return null;
  }
}

// Escape HTML so record text can never inject markup into the table.
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Wrap every regex match in <mark>, after escaping the text.
export function highlight(text, regex) {
  const safe = escapeHtml(text);
  if (!regex) return safe;
  regex.lastIndex = 0; // reset: the regex is global and reused across calls
  return safe.replace(regex, m => `<mark>${m}</mark>`);
}

// Does a record match the search regex (description OR category)?
export function matchesRecord(record, regex) {
  if (!regex) return true;
  regex.lastIndex = 0;
  const inDescription = regex.test(record.description);
  regex.lastIndex = 0;
  const inCategory = regex.test(record.category);
  return inDescription || inCategory;
}
