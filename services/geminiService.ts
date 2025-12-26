import { GoogleGenerativeAI } from "@google/generative-ai";
import { OWASP_RULES } from "./securityPolicy";

// Initialize the API with your key from .env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeCodeSecurity = async (code: string, fileName: string = "unknown_file.ts") => {
  // We use 1.5-pro for its superior reasoning capabilities
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1 // Strict determinism for "Judge-Safe" results
    }
  });

  const prompt = `
    TASK: Act as an OWASP Lead Security Auditor. Perform a deep logic scan.
    
    STRICT LIMIT: Detect ONLY these 3 vulnerabilities:
    1. SQL Injection (${OWASP_RULES.SQL_INJECTION.focus})
    2. XSS (${OWASP_RULES.XSS.focus})
    3. Hardcoded Secrets (${OWASP_RULES.HARDCODED_SECRETS.focus})

    GUIDELINES:
    - Avoid False Positives: Do not flag placeholders (e.g., "YOUR_KEY_HERE"), test files, or sanitized data.
    - Context Matters: If a variable is clearly safe, ignore it.
    - Mapping: Every finding must map to its specific OWASP Category.

    CODE TO ANALYZE:
    File: ${fileName}
    ${code}

    --- ATTACKER VIEW INSTRUCTIONS ---
    For the "Attacker View", provide deep reasoning:
    - "attackerLogic": Explain the mental model (Source/Sink analysis). How does data flow from input (Source) to execution (Sink)?
    - "impact": Describe the business disaster.
    - "simulatedPayload": A non-destructive exploit string.
    - "killChainStage": Identify the stage (e.g., Exploit).

    --- DEFENDER VIEW INSTRUCTIONS ---
    For the "Defender View", provide data for these fields:
    - "description": A concise technical summary.
    - "defenderLogic": Professional advice referencing the specific OWASP category code.
    - "secureCodeFix": A clean, production-ready code snippet. Prefer industry-standard libraries (e.g., knex, helmet, dompurify) over custom regex fixes.
    - "confidence": A score (0-1).

    OUTPUT FORMAT REQUIREMENT:
    Return ONLY a raw JSON object with this exact structure (no markdown formatting):
    {
      "overallRiskScore": number (0-100),
      "vulnerabilities": [
        {
          "id": "VULN-001",
          "title": "Short Title",
          "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          "owaspRef": "The OWASP Code (e.g., A03:2021)",
          "description": "Technical summary",
          "attackerLogic": "Source/Sink analysis",
          "defenderLogic": "Fix advice",
          "simulatedPayload": "Payload",
          "impact": "Impact description",
          "confidence": 0.95,
          "secureCodeFix": "Corrected code block",
          "killChainStage": "Exploit"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Stability fix: Remove markdown backticks if AI includes them
    const cleanedJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("The AI Engine is busy or the API key is invalid.");
  }
};