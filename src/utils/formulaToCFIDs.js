// --- Formula Parsing Utility ---
/**
 * Extracts all numeric IDs from a formula string in the format {ID}.
 * @param {string} formula - The formula string to parse.
 * @returns {string[]} - Array of extracted IDs as strings.
 */
export default function formulaToCFIDs(formula) {
  const matches = formula.match(/{(\d+)}/g);
  return matches ? matches.map((m) => m.match(/\d+/)[0]) : [];
}
