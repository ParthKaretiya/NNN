import { GoogleGenerativeAI } from "@google/generative-ai";
import { OWASP_RULES } from "./securityPolicy";
import { calculateRisk } from "./scoringEngine";
import { defangPayload } from "./payloadGenerator";
import { analyzeImpact } from "./impactEngine";
// ✅ Import the Ethical Guard
import { enforceReadOnly } from "./ethicalGuard";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const analyzeCodeSecurity = async (code: string, fileName: string = "unknown_file.ts") => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1
    }
  });

  const prompt = `
    TASK: Act as an OWASP Lead Security Auditor. Perform a deep logic scan.
    
    STRICT LIMIT: Detect ONLY these 3 vulnerabilities:
    1. SQL Injection (${OWASP_RULES.SQL_INJECTION.focus})
    2. XSS (${OWASP_RULES.XSS.focus})
    3. Hardcoded Secrets (${OWASP_RULES.HARDCODED_SECRETS.focus})

    CODE TO ANALYZE:
    File: ${fileName}
    ${code}

    --- SCORING FACTORS (CRITICAL) ---
    Evaluate these two factors strictly on a 1-10 scale:
    - "impactFactor": 1 = Cosmetic, 10 = Total System Compromise.
    - "exploitabilityFactor": 1 = Hard/Theoretical, 10 = Public/Easy.

    --- IMPACT CATEGORIZATION ---
    Classify the vulnerability into ONE of these specific keys for the "impactCategory" field:
    - "SQL_INJECTION"
    - "XSS"
    - "HARDCODED_SECRETS"
    - "GENERAL"

    --- ATTACKER VIEW INSTRUCTIONS ---
    For "simulatedPayload", follow ETHICAL PROTOCOL (non-executable, safe placeholders).

    OUTPUT FORMAT REQUIREMENT:
    Return ONLY a raw JSON object with this structure:
    {
      "vulnerabilities": [
        {
          "title": "Short Title",
          "owaspRef": "e.g., A03:2021",
          "description": "Technical summary",
          "attackerLogic": "Source/Sink analysis",
          "defenderLogic": "Fix advice",
          "simulatedPayload": "Safe payload",
          "impact": "General impact description",
          "confidence": 0.95,
          "secureCodeFix": "Code block",
          "killChainStage": "Exploit",
          "impactFactor": number, 
          "exploitabilityFactor": number,
          "impactCategory": "SQL_INJECTION" 
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    const rawData = JSON.parse(cleanedJson);

    const processedVulns = rawData.vulnerabilities.map((v: any) => {
      // 1. Run Scoring Engine
      const { score, severity, explanation } = calculateRisk(v.impactFactor, v.exploitabilityFactor);

      // 2. Run Payload Defanger
      const simulation = defangPayload(v.title, v.simulatedPayload);

      // 3. Run Impact Analysis Engine
      const businessContext = analyzeImpact(v.impactCategory, severity);

      return {
        ...v,
        id: Math.random().toString(36).substr(2, 9),

        // Scoring Data
        riskScore: score,
        severity: severity,
        scoreReason: explanation,

        // Payload Data
        simulatedPayload: enforceReadOnly(simulation.payload), // ✅ Enforce Read-Only
        payloadLabel: simulation.label,
        payloadPurpose: simulation.purpose,

        // Impact Data
        exposedAssets: businessContext.exposedAssets,
        attackerGain: businessContext.attackerGain,
        businessImpact: businessContext.businessImpact,
        impactCategory: v.impactCategory,

        // ✅ Sanitize Fixes
        secureCodeFix: enforceReadOnly(v.secureCodeFix)
      };
    });

    const maxRisk = Math.max(...processedVulns.map((v: any) => v.riskScore), 0);

    return {
      vulnerabilities: processedVulns,
      overallRiskScore: maxRisk
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("The AI Engine is busy or the API key is invalid.");
  }
};