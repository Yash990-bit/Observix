'use client';

import { useState } from 'react';
import { Sparkles, Building2, Key, CheckCircle2, Copy, Check, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('Acme Enterprise');
  const [apiKey, setApiKey] = useState('aegis_sec_live_9942a1b');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-6 relative bg-slate-900">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-100">Welcome to AegisAI Platform</h3>
            <p className="text-xs text-slate-400">Developer Organization Onboarding Wizard</p>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" /> Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-border text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
            >
              Next: Generate Production Key <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-400" /> Your Live Ingestion API Key
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-border font-mono text-xs text-slate-200">
                <span>{apiKey}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-cyan-300">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition"
            >
              <CheckCircle2 className="h-4 w-4" /> Finish Setup & Launch Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
