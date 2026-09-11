import React from 'react';
import { Phone, Shield, Cpu, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';

interface GovernmentTopBarProps {
  currentUser: UserProfile | null;
  onNavigate: (view: string) => void;
}

export const GovernmentTopBar: React.FC<GovernmentTopBarProps> = ({
  currentUser,
  onNavigate,
}) => {
  return (
    <div className="bg-[#0b121f] text-[#cbd5e1] text-[11px] border-b border-[#1e293b] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Indian flag & Ministry text */}
        <div className="flex items-center gap-2">
          {/* Indian Flag */}
          <div className="overflow-hidden rounded-[2px] shadow-xs shrink-0">
            <svg className="w-4 h-2.5" viewBox="0 0 640 480">
              <path fill="#f93" d="M0 0h640v160H0z" />
              <path fill="#fff" d="M0 160h640v160H0z" />
              <path fill="#128807" d="M0 320h640v160H0z" />
              <g transform="matrix(3.2 0 0 3.2 320 240)">
                <circle r="20" fill="none" stroke="#008" strokeWidth="2" />
                <circle r="3.5" fill="#008" />
              </g>
            </svg>
          </div>
          <span className="text-slate-200 font-semibold">
            Government of India — Ministry of Electronics & IT (MeitY)
          </span>
        </div>

        {/* Right: Helpline & Quick Links & Security Status */}
        <div className="flex items-center gap-3 flex-wrap text-slate-300 font-medium">
          <div className="flex items-center gap-1 text-slate-300">
            <Phone className="w-3 h-3 text-[#f59e0b]" />
            <span>Toll-Free Helpline:</span>
            <span className="text-white font-mono font-bold">8127291476</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <button
            onClick={() => onNavigate('TAMPER_DETECTION')}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Cpu className="w-3 h-3 text-[#10b981]" />
            <span>AI Tamper Detector</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <button
            onClick={() => onNavigate('VERIFY_ASSET')}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-[#00BFFF]" />
            <span>Public Asset Verifier</span>
          </button>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="flex items-center gap-1.5 text-[10px]">
            {currentUser?.role === 'ADMIN' || currentUser?.role === 'OFFICER' || currentUser?.role === 'AUDITOR' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[#10b981] font-semibold">Hardware Key Session Active</span>
              </>
            ) : currentUser?.role === 'USER' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-[#10b981]">Session Secured by Cryptographic DID</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-[#f59e0b]">Security Clearance Required</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
