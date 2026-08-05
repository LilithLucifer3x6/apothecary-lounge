/**
 * Melanated skin risk checker.
 * Evaluates an item's risk flags for hyperpigmentation and photosensitivity.
 * 
 * @param {Object} item - The item object containing risk_flags
 * @returns {{warnings: Array<{type: string, message: string, severity: string}>}}
 */
export function checkMelaninRisks(item) {
  const warnings = [];
  
  if (!item || !item.risk_flags) {
    return { warnings };
  }
  
  const { melanin_caution, photosensitizer } = item.risk_flags;
  
  if (photosensitizer) {
    warnings.push({
      type: 'photosensitizer',
      message: 'This invocation makes the skin vulnerable to the sun. Vigilant protection is load-bearing; neglect may lead to deep scarring or hyperpigmentation.',
      severity: 'high'
    });
  }
  
  if (melanin_caution) {
    warnings.push({
      type: 'hyperpigmentation_risk',
      message: 'Proceed with caution: this element carries a higher risk of triggering post-inflammatory hyperpigmentation (PIH) in melanated skin.',
      severity: 'medium'
    });
  }
  
  return { warnings };
}

