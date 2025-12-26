// src/services/impactEngine.ts

export const analyzeImpact = (vulnType: string, severity: string) => {
  // Normalize input to handle AI variations
  const type = vulnType ? vulnType.toUpperCase() : "GENERAL";
  
  const mapping: any = {
    'SQL_INJECTION': {
      assets: "User Databases, Financial Records, PII (Personally Identifiable Information).",
      gain: "Full administrative database access and unauthorized data exfiltration.",
      business: "Severe legal penalties (GDPR/HIPAA), total loss of customer trust, and potential business closure."
    },
    'XSS': {
      assets: "User Session Cookies, Frontend Authentication Tokens, Browser Environment.",
      gain: "Identity theft of active users and ability to perform actions on their behalf.",
      business: "Erosion of brand reputation and increased customer support overhead due to compromised accounts."
    },
    'HARDCODED_SECRETS': {
      assets: "Cloud Infrastructure (AWS/Azure), 3rd-party APIs (Stripe, Twilio), Production Servers.",
      gain: "Lateral movement across infrastructure and unauthorized service consumption.",
      business: "Direct financial loss through service misuse and massive infrastructure recovery costs."
    }
  };

  // Default fallback for other vulnerabilities
  const defaultImpact = {
    assets: "Internal system logic and application metadata.",
    gain: "Insight into system architecture for future multi-stage attacks.",
    business: "Operational disruption and technical debt requiring urgent remediation."
  };

  // Logic to select the right domain based on partial matches
  let domain = defaultImpact;
  if (type.includes("SQL")) domain = mapping['SQL_INJECTION'];
  else if (type.includes("XSS") || type.includes("SCRIPT")) domain = mapping['XSS'];
  else if (type.includes("SECRET") || type.includes("KEY") || type.includes("PASSWORD")) domain = mapping['HARDCODED_SECRETS'];

  // Adjust intensity based on the severity score we already calculated
  const intensity = (severity === 'CRITICAL' || severity === 'HIGH') 
    ? "Immediate and catastrophic" 
    : "Moderate";
  
  return {
    exposedAssets: domain.assets,
    attackerGain: domain.gain,
    businessImpact: `${intensity} ${domain.business.toLowerCase()}`
  };
};