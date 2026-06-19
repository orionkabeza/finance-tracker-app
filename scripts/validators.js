// ----Patterns

// Rule 1: No leading or tariling sapces, no double sapces as well.
const PATTERN_DESCRIPTION = /^\S(?:.*\S)?$/;

//Rule 2: Valid number - 0, or positive integer, optional 2 decimal places
const PATTERN_AMOUNT = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

//Rule 3: Date in YYYY-MM-DD format with valid maonth to day ranges
const PATTERN_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

//Rule 4: Letters,spaces,hyphens only - for category names
const PATTERN_CATEGORY = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

//Advanced Rule 5: Detect duplicate words that are consecutive
const PATTERN_DUPLICATE_WORD = /\b(\w+)\s+\1\b/i;

//-----------Validator functions

export function validateDescription(value) {
    if (!value.trim()) return 'Description is required.';
    if (!PATTERN_DESCRIPTION.test(value))
        return 'No leading or trailing spaces allowed.';
    if (/\s{2,}/.test(value))
        return 'No double (or repeated) spaces allowed.';
    if (PATTERN_DUPLICATE_WORD.test(value))
        return 'Contains a repeated word (e.g. "the the").';
    if (value.length > 120) return 'Maximum 120 characters.';
    return '';
}

export function validateAmount(value) {
    if (!value.trim()) return 'Amount is required.';
    if (!PATTERN_AMOUNT.test(value))
        return 'Enter a valid amount (e.g. 12.50 or 1000).';
    if (parseFloat(value) <= 0) return 'Amount must be greater than 0.';
    return '';
}

export function validateDate(value) {
    if (!value.trim()) return 'Date is required.';
    if (!PATTERN_DATE.test(value))
        return 'Use the format YYYY-MM-DD (e.g. 2025-05-17).';
    return '';
}

export function validateCategory(value) {
    if (!value) return 'Please select a category.';
    if (!PATTERN_CATEGORY.test(value)) return 'Invalid category name.';
    return '';
}

//-----Validate the whole form at once

export function validateForm(data) {
    const errors = {
        description: validateDescription(data.description),
        amount: validateAmount(data.amount),
        date: validateDate(data.date),
        category: validateCategory(data.category),
    };

    const valid = Object.values(errors).every(e => e === '');
    return {valid, errors };
}
