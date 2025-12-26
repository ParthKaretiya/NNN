export const defangPayload = (vulnType: string, rawPayload: string) => {
  let defanged = rawPayload || "No payload generated";

  // Ethical transformation rules (The "Defanging" Logic)
  const rules = [
    { pattern: /<script/gi, replacement: "[NON-EXECUTABLE-SCRIPT-TAG]" },
    { pattern: /alert\(/gi, replacement: "notify_simulator(" },
    { pattern: /prompt\(/gi, replacement: "input_simulator(" },
    { pattern: /onerror/gi, replacement: "on_simulation_event" },
    { pattern: /eval\(/gi, replacement: "unsafe_execute_simulation(" },
    { pattern: /OR 1=1/gi, replacement: "[LOGIC-BYPASS-CONDITION]" },
    { pattern: /UNION SELECT/gi, replacement: "[SIMULATED-DATA-EXTRACTION]" },
    { pattern: /DROP TABLE/gi, replacement: "[SIMULATED-DATA-RESET-CMD]" },
    { pattern: /--/g, replacement: "[COMMENT-INJECTION]" },
  ];

  rules.forEach(rule => {
    defanged = defanged.replace(rule.pattern, rule.replacement);
  });

  return {
    payload: `SENTINAI-TEST // ${defanged}`,
    label: "ETHICAL SIMULATION: NON-EXECUTABLE",
    purpose: getPurpose(vulnType)
  };
};

const getPurpose = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("sql")) return "Tests if database queries can be manipulated via input.";
  if (t.includes("xss") || t.includes("script")) return "Tests if the browser will interpret user input as executable code.";
  if (t.includes("secret") || t.includes("key")) return "Demonstrates how pattern-matching can find sensitive tokens.";
  if (t.includes("auth")) return "Simulates an attempt to bypass identity verification.";
  return "Conceptual demonstration of logic flaw for educational purposes.";
};