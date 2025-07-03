// --- Formula Simplification Utility ---
/**
 * Adds spaces around operators in a formula, but leaves constants (e.g., {1}) untouched.
 * @param {string} expression - The formula string to simplify.
 * @returns {string} - Simplified formula string.
 */
export default function simplifyFormula(expression) {
  return expression
    .replace(/({[^}]*})|([+\-*/])/g, (match, brace, operator) => {
      if (brace) return brace; // Don't touch constants like {1}, {14}, etc.
      return ` ${operator} `; // Add space around operators
    })
    .replace(/\s+/g, " ") // Normalize multiple spaces
    .trim(); // Remove leading/trailing spaces
}
