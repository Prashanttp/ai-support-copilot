import React from 'react';
import { X, ShieldCheck, Cpu } from 'lucide-react';
import { ApiStatus } from '../../lib/apiClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: ApiStatus;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">LLM Provider & Runtime Architecture</h3>
              <p className="text-[11px] text-slate-500">Zero frontend key exposure & deterministic fallback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Current Status Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Server Runtime State
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Operational Mode:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider border ${
                apiStatus.liveLLMConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {apiStatus.liveLLMConfigured ? 'Live LLM API' : 'Deterministic Demo Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Model Engine:</span>
              <span className="text-slate-600 font-mono text-[11px]">{apiStatus.provider}</span>
            </div>
          </div>

          {/* Security Guarantee */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-[11px]">
              <strong className="block font-semibold">Security & Privacy Protocol:</strong>
              API credentials are never bundled into client bundles or sent over the wire to browsers. All model inferences occur via serverless endpoints (`/api/analyze`).
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block text-xs">
              To Enable Live LLM (OpenAI or Gemini):
            </span>
            <div className="space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
              <p>
                <strong>Local Development:</strong> Copy <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">.env.example</code> to <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">.env</code> and add your key:
              </p>
              <pre className="p-2 bg-slate-900 text-slate-100 rounded text-[10px] font-mono">
                OPENAI_API_KEY=sk-proj-...
              </pre>
              <p className="pt-1">
                <strong>Vercel Deployment:</strong> Add <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">OPENAI_API_KEY</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">GEMINI_API_KEY</code> under <em>Project Settings &rarr; Environment Variables</em>.
              </p>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong>Transparent Demo Mode:</strong> When no API key is set, the application operates deterministically using our rule-based classification heuristics and realistic synthetic responses.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
