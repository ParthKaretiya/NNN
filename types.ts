export enum AnalysisStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Vulnerability {
  id: string;
  title: string;
  severity: Severity;
  description: string;

  // OWASP Reference
  owaspRef?: string;

  // Deep Dive Data
  attackerLogic: string;
  defenderLogic: string;
  simulatedPayload: string;
  impact: string;
  confidence: number;
  secureCodeFix: string;
  killChainStage: string;

  // Scoring Engine Fields
  impactFactor: number;
  exploitabilityFactor: number;
  scoreReason: string;

  // Ethical Payload Fields
  payloadLabel: string;
  payloadPurpose: string;

  // ✅ NEW IMPACT ANALYSIS FIELDS
  exposedAssets: string;
  attackerGain: string;
  businessImpact: string;
  impactCategory: string; // Used to track which mapping we used

  // Optional legacy fields
  category?: string;
  riskScore?: number;
  vulnerableCodeSnippet?: string;
}

export interface AnalysisResult {
  overallRiskScore: number;
  vulnerabilities: Vulnerability[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  onboarded?: boolean;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  lastAnalysis: string;
  status: AnalysisStatus;
  riskTrend: number[];
}

export interface SecurityReport {
  id: string;
  projectId: string;
  timestamp: string;
  overallScore: number;
  vulnerabilities: Vulnerability[];
  maturityScore: number;
}