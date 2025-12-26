// src/components/EthicalGuard.tsx

import React from 'react';
import { ShieldCheck, Info, AlertTriangle } from 'lucide-react';
import { ETHICAL_POLICY } from '../services/ethicalGuard';

export const EthicalPolicyModal: React.FC<{ onAccept: () => void }> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-lg w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-green-500 to-cyan-500"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ethical Use Framework</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Version {ETHICAL_POLICY.VERSION}</p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed border-l-2 border-zinc-700 pl-4">
          <strong className="text-white">Notice:</strong> {ETHICAL_POLICY.DISCLAIMER} By proceeding, you agree to the following guardrails:
        </p>

        <div className="space-y-3 mb-8">
          {ETHICAL_POLICY.RESTRICTIONS.map((rule, i) => (
            <div key={i} className="flex gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
              <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <span className="text-xs text-zinc-300">{rule}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-8">
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
          <p className="text-[10px] text-yellow-200/60 leading-tight">
            Any attempt to use these findings for unauthorized access 
            is a violation of international cyber laws and our Ethical Use Policy.
          </p>
        </div>

        <button
          onClick={onAccept}
          className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-lg shadow-white/5 active:scale-95"
        >
          I Accept the Ethical Terms
        </button>
      </div>
    </div>
  );
};