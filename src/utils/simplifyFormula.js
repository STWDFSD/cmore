// --- Formula Simplification Utility ---
/**
 * Adds spaces around operators in a formula, but leaves constants (e.g., {1}) untouched.
 * @param {string} expression - The formula string to simplify.
 * @returns {string} - Simplified formula string.
 */
export default function simplifyFormula(expression) {
  return (
    expression
      // Put space around all non-alphanumeric, non-whitespace, except inside {...}
      .replace(/({\d+})|([^a-zA-Z0-9\s])/g, (match, brace, symbol) => {
        if (brace) return brace; // leave {123} untouched
        return ` ${symbol} `;
      })
      .replace(/\s+/g, " ") // normalize multiple spaces
      .trim()
  ); // remove leading/trailing spaces
}
