export const OWASP_RULES = {
  SQL_INJECTION: {
    code: "A03:2021-Injection",
    focus: "Check for string concatenation in database queries (e.g., 'SELECT * FROM users WHERE name = ' + input). Look for lack of parameterized inputs (e.g., ?, :id, $1).",
    impact: "Full database takeover, data exfiltration, and unauthorized administrative access."
  },
  XSS: {
    code: "A03:2021-Injection (Cross-Site Scripting)",
    focus: "Identify raw user input rendered in the DOM without sanitization (e.g., innerHTML, document.write, dangerouslySetInnerHTML).",
    impact: "Session hijacking, credential theft, and website defacement."
  },
  HARDCODED_SECRETS: {
    code: "A07:2021-Identification and Authentication Failures",
    focus: "Detect high-entropy strings assigned to variables like API_KEY, SECRET, PASSWORD, or TOKEN in the source code.",
    impact: "Unrestricted access to 3rd-party services and infrastructure compromise."
  },
  BROKEN_ACCESS_CONTROL: {
    code: "A01:2021-Broken Access Control",
    focus: "Look for API endpoints or admin routes that lack authentication middleware or role-based checks.",
    impact: "Unauthorized users accessing sensitive data or administrative functions."
  },
  INSECURE_DESIGN: {
    code: "A04:2021-Insecure Design",
    focus: "Identify lack of rate limiting, missing error handling, or exposed stack traces.",
    impact: "System overload (DoS) or information leakage helping attackers map the system."
  }
};