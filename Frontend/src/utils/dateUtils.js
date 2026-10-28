/**
 * Date Utility Functions
 * Centralized helpers for parsing, formatting, and handling dates across the ARGUS Portal.
 */

/**
 * Format a date string into human-readable short form (e.g. "Oct 25, 2026").
 * @param {string|Date} dateString - ISO string or Date object
 * @param {string} [fallback='Date not specified'] - Default text if date is missing or invalid
 * @returns {string} Formatted short date string
 */
export function formatShortDate(dateString, fallback = 'Date not specified') {
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString || fallback;
  }
}

/**
 * Format a date string into human-readable long form (e.g. "October 25, 2026").
 * @param {string|Date} dateString - ISO string or Date object
 * @param {string} [fallback='Date not specified'] - Default text if date is missing or invalid
 * @returns {string} Formatted long date string
 */
export function formatLongDate(dateString, fallback = 'Date not specified') {
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString || fallback;
  }
}

/**
 * Format a Date object or ISO string into YYYY-MM-DD for HTML <input type="date"> elements.
 * @param {string|Date} dateString - ISO string or Date object
 * @returns {string} Formatted YYYY-MM-DD date string, or empty string if invalid/missing
 */
export function toDateInputValue(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Get current local date formatted as YYYY-MM-DD for date input defaults and max limits.
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string into human-readable date and time (e.g. "Oct 28, 2026, 11:15 AM").
 * @param {string|Date} dateString - ISO string or Date object
 * @param {string} [fallback='Date not specified'] - Default text if date is missing or invalid
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateString, fallback = 'Date not specified') {
  if (!dateString) return fallback;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString || fallback;
  }
}

// Default export alias for general display formatting
export const formatDate = formatShortDate;

export default {
  formatShortDate,
  formatLongDate,
  formatDateTime,
  formatDate,
  toDateInputValue,
  getTodayDateString,
};
