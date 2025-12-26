import { Severity } from '../types';

export const calculateRisk = (impact: number, exploitability: number) => {
  // 1. The Weighted Formula
  // Impact is 60% of the score, Exploitability is 40%
  // We multiply input (1-10) by 10 to get a 100-point scale
  const score = Math.round((impact * 10 * 0.6) + (exploitability * 10 * 0.4));
  
  let severity: Severity = 'LOW';
  let explanation = '';

  // 2. Deterministic Thresholds (The "Judge-Ready" Logic)
  if (score >= 90) {
    severity = 'CRITICAL';
    explanation = "Critical threat: Easy to exploit with catastrophic impact on data integrity.";
  } else if (score >= 70) {
    severity = 'HIGH';
    explanation = "High risk: Significant impact detected with moderate effort required by an attacker.";
  } else if (score >= 40) {
    severity = 'MEDIUM';
    explanation = "Medium risk: Potential for limited data exposure; requires specific conditions to exploit.";
  } else {
    severity = 'LOW';
    explanation = "Low risk: Minimal security impact or requires highly complex, manual intervention.";
  }

  return { score, severity, explanation };
};