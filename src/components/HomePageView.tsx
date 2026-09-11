import React from 'react';
import {
  Shield,
  Key,
  UserCheck,
  FileCheck,
  Cpu,
  Search,
  Layers,
  ArrowRight,
  Lock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Building,
  Mail,
  HelpCircle,
  Database,
} from 'lucide-react';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';
import { UserProfile } from '../types';

interface HomePageViewProps {
  currentUser: UserProfile | null;
  onNavigateToCitizenLogin: () => void;
  onNavigateToOfficerLogin: () => void;
  onNavigateView: (view: string) => void;
  onOpenEmailsModal: () => void;
  usersList: UserProfile[];
}

export const HomePageView: React.FC<HomePageViewProps> = ({
  currentUser,
  onNavigateToCitizenLogin,
  onNavigateToOfficerLogin,
  onNavigateView,
  onOpenEmailsModal,
  usersList,
}) => {
  const existingAuditors = usersList.filter((u) => u.role === 'AUDITOR');
  const existingOfficers = usersList.filter((u) => u.role === 'OFFICER');

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900">
      {/* 1. HERO SECTION WITH EMBLEM & SOVEREIGN BRANDING */}
      <section className="relative bg-white text-slate-900 py-12 sm:py-18 overflow-hidden border-b border-slate-200">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Sovereign Indian Tricolor Flag SVG with Ashoka Chakra */}
              <div className="shrink-0 overflow-hidden rounded-[3px] shadow-xs border border-slate-300">
                <svg className="w-8 h-5.5" viewBox="0 0 640 480">
                  <path fill="#FF9933" d="M0 0h640v160H0z" />
                  <path fill="#FFFFFF" d="M0 160h640v160H0z" />
                  <path fill="#138808" d="M0 320h640v160H0z" />
                  <g transform="matrix(3.2 0 0 3.2 320 240)">
                    <circle r="20" fill="none" stroke="#000080" strokeWidth="2" />
                    <circle r="3.5" fill="#000080" />
                    {Array.from({ length: 24 }).map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="-20"
                        stroke="#000080"
                        strokeWidth="0.8"
                        transform={`rotate(${i * 15})`}
                      />
                    ))}
                  </g>
                </svg>
              </div>

              <div className="leading-tight">
                <div
                  className="font-black text-sm tracking-wide text-black"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Government of India
                </div>
                <div className="text-xs font-semibold text-black">
                  Ministry of Electronics &amp; Information Technology (MeitY)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DigitalIndiaBadge size="sm" />
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Polygon Amoy (Chain 80002) • Live</span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="flex items-center gap-3">
              <SurakshaLogo variant="light" size="lg" />
            </div>

            <div className="space-y-1">
              {/* SURAKSHA SAATHI IN BOLD AND IN BIG FONT AS THE TITLE ABOVE THE LINE */}
              <h1
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black uppercase"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                SURAKSHA SAATHI
              </h1>

              {/* The Tagline */}
              <h2
                className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                &ldquo;Your Digital Assets.{' '}
                <span className="text-amber-600">Secure Forever.&rdquo;</span>
              </h2>
            </div>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl font-medium">
              The Government of India&apos;s sovereign digital vault and asset verification ecosystem.
              Anchoring Fixed Deposit Bonds, Land Titles, Property Deeds, and Academic Credentials onto a
              tamper-proof public blockchain ledger with real-time neural AI forensic analysis and
              multi-tier statutory clearance.
            </p>
          </div>

          {/* Important Statutory & Citizen Protection Information Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            {/* Card 1: Sovereign Digital Vault */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sovereign Registry
                </span>
                <span className="p-1 rounded bg-blue-100 text-blue-700">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">National Asset Vault</div>
              <div className="text-xs font-semibold text-blue-700">
                Verifiable Ownership &amp; Digital Title Proof
              </div>
            </div>

            {/* Card 2: Immutable Storage */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tamper Protection
                </span>
                <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                  <Lock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">100% Immutable</div>
              <div className="text-xs font-semibold text-emerald-700">
                Anchored on Sovereign Ledger
              </div>
            </div>

            {/* Card 3: AI Document Forensics */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  AI Fraud Detection
                </span>
                <span className="p-1 rounded bg-purple-100 text-purple-700">
                  <Cpu className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">Neural ELA Scanner</div>
              <div className="text-xs font-semibold text-purple-700">
                Pixel-Level Forgery Analysis
              </div>
            </div>

            {/* Card 4: Official Redressal */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Official Clearance
                </span>
                <span className="p-1 rounded bg-amber-100 text-amber-700">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-lg font-black text-slate-900">Officer &amp; CAG Audit</div>
              <div className="text-xs font-semibold text-amber-700">
                Multi-Tier Statutory Supervision
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED SEPARATE LOGIN GATEWAYS (CITIZEN VS OFFICER) */}
      <section className="py-14 sm:py-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-[#1e3a8a] text-xs font-bold uppercase tracking-wider">
            Portal Access Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Select Your Dedicated Access Portal
          </h2>
          <p className="text-sm text-slate-600">
            Citizens and Government Officers access dedicated, separate authentication environments
            tailored to statutory clearance levels.
          </p>
        </div>

        <div className={`grid grid-cols-1 ${!currentUser ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'} gap-8`}>
          {/* GATEWAY CARD 1: CITIZEN PORTAL */}
          {(!currentUser || currentUser.role === 'USER') && (
            <div className="bg-white border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-8 shadow-sm flex flex-col justify-between transition-all space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-[#1e3a8a]">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1e3a8a]">
                    Citizen Gateway
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">Citizen Digital Vault</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Personal sovereign asset repository for citizens of India to upload, verify,
                    and manage immutable certificates & deeds.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Self-sovereign digital vault with zero PII exposure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Fixed Deposit Bonds, Land Titles & Academic Degree registration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>One-click AI document forensics and tamper verification check</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={onNavigateToCitizenLogin}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group-hover:shadow-md"
                >
                  <span>{currentUser ? 'Access My Citizen Vault' : 'Proceed to Citizen Login'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                {!currentUser && (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Default Demo: <span className="font-mono text-slate-700">citizen@domain.in</span></span>
                    <button
                      type="button"
                      onClick={onNavigateToCitizenLogin}
                      className="font-bold text-[#1e3a8a] hover:underline cursor-pointer"
                    >
                      Create New Citizen Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GATEWAY CARD 2: GOVERNMENT OFFICER PORTAL */}
          {(!currentUser || currentUser.role !== 'USER') && (
            <div className="bg-[#fefce8]/80 border-2 border-[#fde047] hover:border-[#eab308] rounded-2xl p-8 shadow-sm flex flex-col justify-between transition-all space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full -mr-16 -mt-16 pointer-events-none transition-transform group-hover:scale-110" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800">
                    <Key className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fef08a] border border-[#fde047] text-[#854d0e]">
                    Restricted Official Access
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-900">RBAC Official Command Portal</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Clearance gateway for Sovereign Administrators, Verification Officers, and CAG
                    Statutory Auditors under MeitY guidelines.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-amber-200/60">
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700">
                      Level 1
                    </span>
                    <span>
                      <strong>Sovereign Admin:</strong> Root security clearance, onboards CAG Auditors
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                      Level 3
                    </span>
                    <span>
                      <strong>CAG Statutory Auditor:</strong> Inspects audit trail, onboards Verification Officers
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                      Level 2
                    </span>
                    <span>
                      <strong>Verification Officer:</strong> Validates citizen deeds, reviews AI tamper flags
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={onNavigateToOfficerLogin}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#78350f] hover:bg-[#92400e] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group-hover:shadow-md"
                >
                  <Key className="w-4 h-4 text-amber-300" />
                  <span>{currentUser ? 'Access Official Command Center' : 'Proceed to Officer Login'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] text-amber-900 font-medium">
                    {existingAuditors.length} Auditor, {existingOfficers.length} Officers Active
                  </span>
                  {(currentUser?.role === 'ADMIN' || currentUser?.role === 'AUDITOR') && (
                    <button
                      type="button"
                      onClick={onOpenEmailsModal}
                      className="font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>View Dispatched Emails</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. THREE PRIMARY LIVE CORE SERVICES */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
              Statutory Services Suite
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              Live Cryptographic & AI Engines
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Select any engine to immediately test sovereign verification features
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Tamper Detector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 w-fit">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">AI Tamper Detector & Forensics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload any PDF or image deed. The engine performs Error Level Analysis (ELA), font kerning
                consistency inspection, metadata alteration checks, and assigns an automated tamper percentage.
              </p>
            </div>

            <button
              onClick={() => onNavigateView('TAMPER_DETECTION')}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Launch AI Forensic Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Public Asset Verifier */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Public Cryptographic Verifier</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly query any SHA-256 document hash, NFT Token ID, or Citizen DID to verify authenticity,
                check encumbrance status, and inspect on-chain statutory notary stamps.
              </p>
            </div>

            <button
              onClick={() => onNavigateView('VERIFY_ASSET')}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Verify Deed or Asset Hash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Blockchain Explorer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Public Blockchain Ledger</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time Polygon Amoy testnet block explorer rendering immutable block headers,
                transaction receipts, gas usage, and Merkle tree root continuity logs.
              </p>
            </div>

            <button
              onClick={() => onNavigateView('PUBLIC_LEDGER')}
              className="w-full py-2.5 px-4 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Explore Blockchain Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
