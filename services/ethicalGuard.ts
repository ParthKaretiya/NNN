// src/services/ethicalGuard.ts

export const ETHICAL_POLICY = {
  VERSION: "1.0.0",
  MANDATE: "DEFENSIVE_ONLY",
  DISCLAIMER: "SentinAI is a read-only educational platform. It does not possess, generate, or execute offensive exploit code.",
  RESTRICTIONS: [
    "No execution of simulated payloads permitted.",
    "Analysis is restricted to static code review (SAST) methodology.",
    "Network-based attack simulations are strictly prohibited.",
    "All output is formatted as non-executable plain text."
  ]
};

// Logic to ensure text remains non-executable (The "Sandbox")
export const enforceReadOnly = (text: string): string => {
  if (!text) return "";
  
  // Replace potentially executable JS/Shell patterns with safe descriptions
  return text
    .replace(/eval\(/gi, "disallowed_eval_logic(")
    .replace(/<script/gi, "[SAFE_ANALYSIS_STRING]")
    .replace(/javascript:/gi, "safe_protocol:")
    .replace(/netcat/gi, "[NETWORK_TOOL_BLOCKED]")
    .replace(/curl/gi, "[NETWORK_TOOL_BLOCKED]")
    .replace(/wget/gi, "[NETWORK_TOOL_BLOCKED]")
    .trim();
};