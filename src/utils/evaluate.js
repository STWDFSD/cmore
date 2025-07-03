// --- Evaluation Utilities ---

/**
 * Evaluates value for 'Max' type: higher is better.
 */
function evaluateMax(value, LowStandard, HighStandard) {
  if (value < LowStandard) return 0;
  if (value > HighStandard) return 1;
  if (value >= LowStandard && value <= HighStandard)
    return (value - LowStandard) / (HighStandard - LowStandard);
}

/**
 * Evaluates value for 'Min' type: lower is better.
 */
function evaluateMin(value, LowStandard, HighStandard) {
  if (value < LowStandard) return 1;
  if (value > HighStandard) return 0;
  if (value >= LowStandard && value <= HighStandard)
    return (HighStandard - value) / (HighStandard - LowStandard);
}

/**
 * Evaluates value for 'Range' type: best within a range.
 */
function evaluateRange(value, LowStandard, HighStandard) {
  const half = (HighStandard - LowStandard) / 2;
  const lowerBound = LowStandard - half;
  const upperBound = HighStandard + half;

  if (value < lowerBound || value > upperBound) return 0;
  if (value > LowStandard && value < HighStandard) return 1;

  if (value >= lowerBound && value <= LowStandard)
    return (value - lowerBound) / (LowStandard - lowerBound);

  if (value >= HighStandard && value <= upperBound)
    return 1 - (value - HighStandard) / (upperBound - HighStandard);

  return 0;
}

/**
 * Evaluates value for 'Yes'/'No' type: binary logic.
 */
function evaluateYesNo(value, DesiredType) {
  if (DesiredType == "Yes") {
    if (value) return 1;
    return 0;
  }
  if (DesiredType == "No") {
    if (value) return 0;
    return 1;
  }
}

/**
 * Main evaluation function: dispatches to the correct evaluation logic based on type.
 */
export default function evaluate(
  value,
  DesiredType,
  LowStandard,
  HighStandard
) {
  if (DesiredType == "Yes" || DesiredType == "No") {
    return evaluateYesNo(value, DesiredType);
  }
  if (LowStandard > HighStandard) return 0;
  if (DesiredType == "Max") {
    return evaluateMax(value, LowStandard, HighStandard);
  }
  if (DesiredType == "Min") {
    return evaluateMin(value, LowStandard, HighStandard);
  }
  if (DesiredType == "Range") {
    return evaluateRange(value, LowStandard, HighStandard);
  }
}
