import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Terminal, ShieldAlert,
  History, Settings, LogOut, ChevronRight, Upload,
  Search, Bell, User, Cpu, AlertTriangle, CheckCircle2,
  Lock, ArrowRight, Zap, Target, BookOpen, Download
} from 'lucide-react';
import { AnalysisStatus, User as UserType, Project, Vulnerability, Severity } from './types';
import RiskMeter from './components/RiskMeter';
import { RiskTrendChart, SeverityDistribution } from './components/DashboardCharts';
import { analyzeCodeSecurity } from './services/geminiService';
import { initGoogleLogin, triggerGoogleLogin } from './services/googleAuth';
import { saveScan, getHistory } from './services/historyService';
import { aggregateDashboardData } from './services/dashboardLogic';
// ✅ Import the Ethical Guard Modal
import { EthicalPolicyModal } from './components/EthicalGuard';

// --- Components ---

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar: React.FC<{ user: UserType | null }> = ({ user }) => (
  <nav className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-md z-40">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-cyan-500/10 rounded-lg">
        <Shield className="w-6 h-6 text-cyan-500" />
      </div>
      <span className="text-xl font-bold tracking-tight text-white">Sentin<span className="text-cyan-500">AI</span></span>
      <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Enterprise</span>
    </div>

    {/* ✅ NEW: Ethical Guard Indicator */}
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
      <span className="text-[9px] font-bold text-green-500 tracking-widest uppercase">
        Ethical Guard Active: Read-Only Mode
      </span>
    </div>

    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 focus-within:border-cyan-500/50 transition-colors">
        <Search className="w-4 h-4" />
        <input type="text" placeholder="Search vulnerabilities..." className="bg-transparent border-none outline-none text-sm w-48" />
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0a0b]"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Guest User'}</p>
            <p className="text-[10px] text-zinc-500 font-mono">ID: SEC-2024-X</p>
          </div>
          <img src={user?.avatar || "https://picsum.photos/32/32"} className="w-8 h-8 rounded-full border border-zinc-700" alt="Avatar" />
        </div>
      </div>
    </div>
  </nav>
);

// --- Pages ---

const Login: React.FC<{ onLogin: (user: UserType) => void }> = ({ onLogin }) => {

  useEffect(() => {
    initGoogleLogin(onLogin);
  }, [onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 cyber-grid bg-fixed">
      <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500"></div>

        <div className="flex justify-center mb-8">
          <div className="p-4 bg-cyan-500/10 rounded-2xl ring-1 ring-cyan-500/20">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>
        </div>


        <h1 className="text-3xl font-bold text-center text-white mb-2">Secure Intelligence</h1>
        <p className="text-zinc-400 text-center mb-10">Connect your enterprise identity to begin.</p>

        <div className="w-full flex justify-center">
          <div id="google-login-btn"></div>
        </div>

        <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
          <div className="flex items-center justify-center gap-6 text-zinc-500">
            <div className="flex flex-col items-center">
              <Lock className="w-5 h-5 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest">AES-256</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest">ISO 27001</span>
            </div>
            <div className="flex flex-col items-center">
              <User className="w-5 h-5 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-widest">SOC 2</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[11px] text-center text-zinc-600">
          By continuing, you agree to our <span className="underline cursor-pointer">Ethical Use Policy</span> and <span className="underline cursor-pointer">Terms of Service</span>.
        </p>
      </div>
    </div>
  );
};

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Welcome to SentinAI",
      desc: "Our engine uses advanced Gemini models to think like both an attacker and a defender.",
      icon: <Cpu className="w-12 h-12 text-cyan-400" />
    },
    {
      title: "Ethical First",
      desc: "SentinAI performs non-destructive simulations. No data ever leaves our secure sandbox during analysis.",
      icon: <ShieldAlert className="w-12 h-12 text-yellow-400" />
    },
    {
      title: "Secure Rewrites",
      desc: "Don't just find bugs. Get production-ready, secure code suggestions for immediate deployment.",
      icon: <CheckCircle2 className="w-12 h-12 text-green-400" />
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0b]">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 p-12 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <div className="p-5 bg-zinc-800 rounded-3xl ring-1 ring-zinc-700">
            {steps[step].icon}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-4">{steps[step].title}</h2>
        <p className="text-lg text-zinc-400 text-center mb-12 max-w-md mx-auto">{steps[step].desc}</p>

        <div className="flex justify-center gap-2 mb-12">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? 'w-8 bg-cyan-500' : 'w-2 bg-zinc-700'}`}></div>
          ))}
        </div>

        <button
          onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {step < steps.length - 1 ? 'Next' : 'Get Started'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: UserType, history: any[] }> = ({ user, history }) => {
  const data = aggregateDashboardData(history);

  if (!data) {
    return (
      <div className="p-12 text-center">
        <div className="p-4 bg-zinc-900/50 rounded-full w-fit mx-auto mb-4 border border-zinc-800">
          <Shield className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Analysis History</h3>
        <p className="text-zinc-500 mb-6">Run your first vulnerability scan to populate the command center.</p>
        <Link to="/analyze" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all">
          Start First Scan
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Command Center</h1>
          <p className="text-zinc-500 mt-1">Global oversight of your development pipeline security.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/analyze" className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors">
            <Upload className="w-4 h-4" />
            New Analysis
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <RiskMeter score={data.latestScore} label="Current Risk" size="sm" />
            <div className={`px-2 py-1 text-[10px] font-bold rounded ${data.riskLabel.includes('Improved') ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
              {data.riskLabel.toUpperCase()}
            </div>
          </div>
          <p className="text-xs text-zinc-500">Based on latest scan results</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <RiskMeter score={88} label="Maturity Index" size="sm" />
            <div className="px-2 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-bold rounded">EXCELLENT</div>
          </div>
          <p className="text-xs text-zinc-500">Industry benchmark: 65</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Vulnerabilities</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{data.totalVulns}</span>
            <span className="text-zinc-500 text-sm">Detected</span>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-bold">
              {data.distribution.find(d => d.name === 'Critical')?.count || 0} CRIT
            </span>
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[10px] font-bold">
              {data.distribution.find(d => d.name === 'High')?.count || 0} HIGH
            </span>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Projects Active</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">08</span>
            <span className="text-zinc-500 text-sm">Monitored</span>
          </div>
          <div className="mt-4 flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <img key={i} src={`https://picsum.photos/24/24?random=${i}`} className="w-6 h-6 rounded-full border border-zinc-900" alt="Avatar" />
            ))}
            <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400">+4</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskTrendChart data={data.trendData} />
        <SeverityDistribution data={data.distribution} />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h3 className="font-semibold text-white">Recent Security Intelligence</h3>
          <button className="text-xs text-cyan-500 hover:text-cyan-400 font-medium">View All History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-[11px] uppercase tracking-widest border-b border-zinc-800">
                <th className="px-6 py-4 font-bold">ID / File</th>
                <th className="px-6 py-4 font-bold">Risk Level</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Analysis Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.recentScans.map((scan: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-cyan-500/10 transition-colors">
                        <Terminal className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{scan.fileName}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{scan.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <RiskMeter score={scan.overallRiskScore} size="sm" />
                      <span className="text-xs text-zinc-400 font-bold">{scan.overallRiskScore}/100</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs text-zinc-400">Completed</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {new Date(scan.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-500 hover:text-white"><ChevronRight className="w-4 h-4 ml-auto" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AnalysisWorkspace: React.FC<{ onScanComplete: (result: any) => void }> = ({ onScanComplete }) => {
  const [inputMode, setInputMode] = useState<'code' | 'api' | 'sql' | 'config'>('code');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<any>(null);
  const [loadingText, setLoadingText] = useState("Initializing Intelligence Engine...");

  useEffect(() => {
    let interval: any;

    if (status === AnalysisStatus.ANALYZING) {
      const messages = [
        "Initializing Intelligence Engine...",
        "Parsing Source Syntax Tree...",
        "Mapping OWASP Threat Vectors...",
        "Simulating Attacker Pathways...",
        "Generating Secure Remediation...",
        "Finalizing Risk Score..."
      ];
      let i = 0;
      interval = setInterval(() => {
        setLoadingText(messages[i]);
        i = (i + 1) % messages.length;
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setStatus(AnalysisStatus.ANALYZING);

    try {
      const fileName = `manual-scan-${Date.now()}.ts`;
      const analysis = await analyzeCodeSecurity(content, fileName);

      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);
      onScanComplete(analysis);

    } catch (err) {
      console.error(err);
      setStatus(AnalysisStatus.FAILED);
    }
  };

  if (status === AnalysisStatus.ANALYZING) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-cyan-500 animate-spin"></div>
          <Shield className="w-10 h-10 text-cyan-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Intelligence Engine at Work</h2>
        <p className="text-zinc-500 text-center max-w-sm h-6 transition-all duration-300">
          {loadingText}
        </p>
      </div>
    );
  }

  if (status === AnalysisStatus.COMPLETED && result) {
    return <AnalysisResults result={result} onReset={() => { setStatus(AnalysisStatus.IDLE); setContent(''); }} />;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white">New Security Analysis</h1>
        <p className="text-zinc-500 mt-1">Submit your code, endpoints, or configurations for deep-scan modeling.</p>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex border-b border-zinc-800">
          {[
            { id: 'code', label: 'Source Code', icon: <Terminal className="w-4 h-4" /> },
            { id: 'api', label: 'API Endpoint', icon: <Cpu className="w-4 h-4" /> },
            { id: 'sql', label: 'DB Queries', icon: <Search className="w-4 h-4" /> },
            { id: 'config', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInputMode(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${inputMode === tab.id ? 'bg-zinc-800 text-cyan-400 border-b-2 border-cyan-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={inputMode === 'code' ? 'Paste your source code here (TS, JS, Python, Rust...)' : 'Enter endpoint or configuration details...'}
              className="w-full h-80 bg-zinc-950 border border-zinc-800 rounded-xl p-6 mono text-sm text-zinc-300 focus:border-cyan-500/50 outline-none transition-all resize-none"
            />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Sec-Verified Sandbox
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-500">
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
              <span className="text-xs">Submissions are encrypted and analyzed non-destructively.</span>
            </div>
            <button
              disabled={!content.trim()}
              onClick={handleAnalyze}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${!content.trim() ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 active:scale-95'}`}
            >
              <Zap className="w-4 h-4" />
              Initiate Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="p-2 bg-purple-500/10 rounded-lg h-fit text-purple-400"><Target className="w-5 h-5" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Attacker Logic</h4>
            <p className="text-xs text-zinc-500 mt-1">AI attempts to find entry points and generate payload variants.</p>
          </div>
        </div>
        <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="p-2 bg-green-500/10 rounded-lg h-fit text-green-400"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Secure Fixes</h4>
            <p className="text-xs text-zinc-500 mt-1">Direct code suggestions to resolve identified vulnerabilities.</p>
          </div>
        </div>
        <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <div className="p-2 bg-cyan-500/10 rounded-lg h-fit text-cyan-400"><BookOpen className="w-5 h-5" /></div>
          <div>
            <h4 className="text-sm font-bold text-white">Knowledge Base</h4>
            <p className="text-xs text-zinc-500 mt-1">Expert explanations linked to CWE and CVE frameworks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisResults: React.FC<{ result: any, onReset: () => void }> = ({ result, onReset }) => {
  const [selectedVuln, setSelectedVuln] = useState<any>(result.vulnerabilities[0]);
  const [viewMode, setViewMode] = useState<'attacker' | 'defender'>('defender');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (selectedVuln?.secureCodeFix) {
      navigator.clipboard.writeText(selectedVuln.secureCodeFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <button onClick={onReset} className="text-zinc-500 hover:text-white flex items-center gap-1 text-sm mb-2">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Workspace
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-4">
            Analysis Report
            <span className="text-zinc-500 text-lg font-normal">#SEC-{Math.floor(Math.random() * 10000)}</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20">
            Generate Executive PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Sidebar List */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <RiskMeter score={result.overallRiskScore} label="Security Health" />
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Found Vulnerabilities</h4>
            <div className="space-y-2">
              {result.vulnerabilities.map((v: any, i: number) => (
                <button
                  key={i}
                  onClick={() => { setSelectedVuln(v); setCopied(false); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedVuln?.id === v.id ? 'bg-zinc-800 border-cyan-500/50' : 'bg-transparent border-transparent hover:bg-zinc-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {v.owaspRef?.split(':')[0] || "OWASP"}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${v.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : v.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {v.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white line-clamp-1 mt-1">{v.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Detail View */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold text-lg text-white">{selectedVuln?.title}</h3>
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setViewMode('defender')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'defender' ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  Defender View
                </button>
                <button
                  onClick={() => setViewMode('attacker')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'attacker' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                >
                  Attacker View
                </button>
              </div>
            </div>

            <div className="p-8">

              {/* Executive Impact Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Exposed Assets</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{selectedVuln.exposedAssets}</p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Attacker Gain</h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{selectedVuln.attackerGain}</p>
                </div>

                <div className="bg-zinc-950 border border-cyan-500/20 p-5 rounded-2xl shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Business Impact</h4>
                  </div>
                  <p className="text-sm text-cyan-100/80 leading-relaxed font-medium">{selectedVuln.businessImpact}</p>
                </div>
              </div>


              {viewMode === 'defender' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                  <div className="space-y-6">

                    {/* Scoring Logic Display */}
                    <section className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <Cpu className="w-3 h-3" /> SentinAI Scoring Engine
                        </h5>
                        <div className="flex gap-2">
                          <span className="text-[10px] px-2 py-0.5 bg-zinc-950 rounded text-zinc-400 border border-zinc-800">
                            Impact: <span className="text-white font-bold">{selectedVuln?.impactFactor}/10</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-zinc-950 rounded text-zinc-400 border border-zinc-800">
                            Exploit: <span className="text-white font-bold">{selectedVuln?.exploitabilityFactor}/10</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-cyan-100/80 leading-relaxed font-medium italic">
                        "{selectedVuln?.scoreReason}"
                      </p>
                    </section>

                    <section>
                      <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Technical Summary</h5>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        {selectedVuln?.description}
                      </p>
                    </section>

                    <section className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl">
                      <h5 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Secure Remediation Logic
                      </h5>
                      <p className="text-sm text-green-200/70 leading-relaxed italic">
                        "{selectedVuln?.defenderLogic}"
                      </p>
                    </section>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl h-[400px]">
                    <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-mono text-zinc-400">secure_implementation.ts</span>
                      <button
                        onClick={handleCopy}
                        className={`text-[10px] font-bold flex items-center gap-1 transition-all ${copied ? 'text-green-400' : 'text-cyan-500 hover:text-cyan-400'}`}
                      >
                        {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied!</> : <><Download className="w-3 h-3" /> Copy Fix</>}
                      </button>
                    </div>
                    <pre className="p-4 font-mono text-xs text-green-400 overflow-y-auto leading-relaxed h-full bg-[#050505]">
                      <code>{selectedVuln?.secureCodeFix}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    {/* The Ethical Header */}
                    <section className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                      <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> The Attacker's Mental Model
                      </h5>
                      <p className="text-sm text-red-200/70 leading-relaxed italic">
                        "{selectedVuln?.attackerLogic}"
                      </p>
                    </section>

                    {/* Defanged Payload Box */}
                    <section className="space-y-3">
                      <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
                        Ethical Simulation Trace
                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          {selectedVuln.payloadLabel || "SIMULATION MODE"}
                        </span>
                      </h5>

                      <div className="relative group">
                        <div className="absolute -top-2 -right-2 px-2 py-1 bg-zinc-800 text-[8px] font-bold text-zinc-500 border border-zinc-700 rounded z-10 shadow-lg">
                          PLAIN TEXT ONLY
                        </div>
                        <div className="p-4 bg-zinc-950 border border-red-500/20 rounded-xl font-mono text-xs text-red-400/90 break-all leading-relaxed shadow-inner">
                          {selectedVuln.simulatedPayload}
                        </div>
                      </div>

                      <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800">
                        <div className="flex gap-2">
                          <Target className="w-4 h-4 text-zinc-500 shrink-0" />
                          <p className="text-[11px] text-zinc-400 italic">
                            <strong className="text-zinc-300 not-italic">Simulation Logic:</strong> {selectedVuln.payloadPurpose}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Consequence of Breach</h5>
                      <p className="text-sm text-zinc-300 leading-relaxed">{selectedVuln?.impact}</p>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Breach Pathway Stage</h5>
                    <div className="flex flex-col gap-2">
                      {['Recon', 'Weaponize', 'Delivery', 'Exploit', 'C2', 'Actions'].map((stage, idx) => (
                        <div key={idx} className={`flex items-center gap-4 px-4 py-2.5 rounded-lg border transition-all ${selectedVuln?.killChainStage?.toLowerCase() === stage.toLowerCase() ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${selectedVuln?.killChainStage?.toLowerCase() === stage.toLowerCase() ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                          <span className="text-xs font-bold uppercase tracking-wider">{stage}</span>
                          {selectedVuln?.killChainStage?.toLowerCase() === stage.toLowerCase() && <ArrowRight className="w-3 h-3 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-cyan-500" />
              <h4 className="text-sm font-bold text-white uppercase tracking-widest">AI Reasoning Trace (XAI)</h4>
            </div>
            <div className="space-y-3">
              <div className="pl-4 border-l-2 border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Status</p>
                <p className="text-sm text-zinc-300 italic">Analysis complete. Deterministic OWASP mapping verified.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  // ✅ STATE: Track ethical acceptance
  const [ethicalAccepted, setEthicalAccepted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const location = useLocation();

  const handleLogin = (googleUser: UserType) => {
    localStorage.setItem("sentinai_user", JSON.stringify(googleUser));
    setUser(googleUser);
    setIsLoggedIn(true);
  };
  const handleOnboardingComplete = () => {
    setOnboarded(true);
    if (user) setUser({ ...user, onboarded: true });
  };

  useEffect(() => {
    if (user) {
      const userHistory = getHistory(user.id || user.email);
      setHistory(userHistory);
    } else {
      setHistory([]);
    }
  }, [user]);

  const handleScanComplete = (result: any) => {
    if (!user) return;
    const userId = user.id || user.email;
    const updatedHistory = saveScan(userId, result, 'manual_scan.ts');
    setHistory(updatedHistory);
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;
  if (!onboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  // ✅ LOGIC: Force Ethical Modal before main app
  return (
    <>
      {!ethicalAccepted && <EthicalPolicyModal onAccept={() => setEthicalAccepted(true)} />}
      <div className={`flex min-h-screen bg-[#0a0a0b] text-zinc-200 ${!ethicalAccepted ? 'blur-sm pointer-events-none' : ''}`}>
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 flex flex-col sticky top-0 h-screen z-50 bg-[#0a0a0b]">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-8">
              <Shield className="w-6 h-6 text-cyan-500" />
              <span className="text-xl font-bold text-white tracking-tight">Sentin<span className="text-cyan-500">AI</span></span>
            </div>

            <nav className="space-y-2">
              <SidebarLink to="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active={location.pathname === '/dashboard'} />
              <SidebarLink to="/analyze" icon={<Terminal className="w-5 h-5" />} label="Analyze" active={location.pathname === '/analyze'} />
              <SidebarLink to="/intelligence" icon={<Cpu className="w-5 h-5" />} label="Intelligence" active={location.pathname === '/intelligence'} />
              <SidebarLink to="/history" icon={<History className="w-5 h-5" />} label="Project History" active={location.pathname === '/history'} />
            </nav>
          </div>

          <div className="mt-auto p-6 space-y-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Memory Usage</span>
                <span className="text-[10px] font-bold text-cyan-500">42%</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[42%]"></div>
              </div>
            </div>
            <SidebarLink to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" active={location.pathname === '/settings'} />
            <button className="flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-400 transition-colors w-full">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <Navbar user={user} />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard user={user!} history={history} />} />
              <Route path="/analyze" element={<AnalysisWorkspace onScanComplete={handleScanComplete} />} />
              <Route path="/history" element={<Dashboard user={user!} history={history} />} />
              <Route path="/settings" element={<div className="p-8 text-white">Settings Page (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;