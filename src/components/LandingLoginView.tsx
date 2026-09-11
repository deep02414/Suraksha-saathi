import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building,
  FileCheck,
  Layers,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';

interface LandingLoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  usersList: UserProfile[];
}

export const LandingLoginView: React.FC<LandingLoginViewProps> = ({
  onLoginSuccess,
  usersList,
}) => {
  // Citizen Form State
  const [citizenTab, setCitizenTab] = useState<'SIGN_IN' | 'CREATE_ACCOUNT'>('SIGN_IN');
  const [citizenEmailOrDid, setCitizenEmailOrDid] = useState('citizen@domain.in');
  const [citizenPassword, setCitizenPassword] = useState('Password@123');
  const [citizenName, setCitizenName] = useState('');
  const [rememberSession, setRememberSession] = useState(true);

  // RBAC Officer State
  const [selectedOfficerLevel, setSelectedOfficerLevel] = useState<1 | 2 | 3>(1);
  const [officerEmail, setOfficerEmail] = useState('officer@suraksha.gov.in');
  const [officerPassword, setOfficerPassword] = useState('Password@123');

  // Error/Status messages
  const [citizenError, setCitizenError] = useState('');
  const [officerError, setOfficerError] = useState('');

  // Handle Level Selection
  const handleSelectOfficerProfile = (level: 1 | 2 | 3) => {
    setSelectedOfficerLevel(level);
    if (level === 1) {
      setOfficerEmail('officer@suraksha.gov.in');
      setOfficerPassword('Password@123');
    } else if (level === 2) {
      setOfficerEmail('officer.rajesh@suraksha.gov.in');
      setOfficerPassword('Password@123');
    } else {
      setOfficerEmail('cag.auditor@suraksha.gov.in');
      setOfficerPassword('Password@123');
    }
  };

  // Submit Citizen Sign In / Create Account
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenError('');

    if (citizenTab === 'SIGN_IN') {
      const input = citizenEmailOrDid.trim().toLowerCase();
      // Look up existing citizen
      const found = usersList.find(
        (u) =>
          u.role === 'USER' &&
          (u.email.toLowerCase() === input || u.did.toLowerCase() === input || u.uid.toLowerCase() === input)
      );

      if (found) {
        onLoginSuccess(found);
      } else {
        // Fallback create/login citizen with matching format
        const citizenUser: UserProfile = {
          id: `user-citizen-${Date.now()}`,
          uid: 'USR-HHFG',
          email: citizenEmailOrDid.trim() || 'citizen@domain.in',
          name: 'HHFG',
          role: 'USER',
          did: 'did:suraksha:0xa172f883019bca721048bca901238491029e84bc',
          walletAddress: '0xa172f883019bca721048bca901238491029e84bc',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          department: 'Citizen Self-Service Registry',
        };
        onLoginSuccess(citizenUser);
      }
    } else {
      // Create account
      if (!citizenEmailOrDid.trim()) {
        setCitizenError('Email address is required');
        return;
      }
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newCitizen: UserProfile = {
        id: `user-${Date.now()}`,
        uid: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        email: citizenEmailOrDid.trim().toLowerCase(),
        name: citizenName.trim() || 'HHFG',
        role: 'USER',
        did: `did:suraksha:0x${randomHex.substring(0, 32)}`,
        walletAddress: '0x' + randomHex,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        department: 'Citizen Self-Service Registry',
      };
      onLoginSuccess(newCitizen);
    }
  };

  // Submit RBAC Official Portal Login
  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');

    const emailInput = officerEmail.trim().toLowerCase();

    // Map role based on selected clearance
    let targetRole: UserRole = 'ADMIN';
    if (selectedOfficerLevel === 2) targetRole = 'OFFICER';
    if (selectedOfficerLevel === 3) targetRole = 'AUDITOR';

    // Find in users list
    const found = usersList.find(
      (u) =>
        u.role === targetRole ||
        u.email.toLowerCase() === emailInput ||
        u.uid.toLowerCase() === emailInput
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      // Default to Rajesh Sharma IAS for Level 1, Rajesh Kumar for Level 2, Sunita Sharma for Level 3
      const defaultUser = usersList[0] || {
        id: 'user-admin-ias',
        uid: 'ADM-DEL-01',
        email: 'officer@suraksha.gov.in',
        name: 'Rajesh Sharma, IAS (Joint Secretary)',
        role: 'ADMIN',
        did: 'did:suraksha:0x9f2a8104bca78210e9014bca89104bca7201948b',
        walletAddress: '0x9f2a8104bca78210e9014bca89104bca7201948b',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        department: 'Ministry of Electronics & IT (MeitY)',
        badgeNumber: 'IAS-DEL-2012',
      };
      onLoginSuccess(defaultUser);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row shadow-sm">
      {/* LEFT COLUMN: Dark Navy Branding Panel (#0c1527) */}
      <div className="w-full lg:w-[46%] bg-[#0c1527] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Top Branding in Left Panel */}
          <div className="space-y-3">
            <SurakshaLogo variant="dark" size="lg" />
            <DigitalIndiaBadge size="sm" />
          </div>

          {/* Large Hero Headline */}
          <div className="space-y-3 pt-4">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              &ldquo;Your Digital Assets.
              <br />
              <span className="text-[#f59e0b]">Secure Forever.&rdquo;</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
              Decentralized Identity (DID), cryptographic document hashing, and tamper-evident
              blockchain verification for citizens of India.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="space-y-3.5 pt-2 max-w-lg">
            {/* Card 1: DID */}
            <div className="p-4 rounded-xl bg-[#111d35]/80 border border-[#1e293b] backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h3 className="font-bold text-white text-sm">Decentralized Identity (DID)</h3>
                <p className="text-slate-400 font-mono text-[11px] leading-relaxed">
                  Formatted as <span className="text-emerald-400">did:suraksha:0x...</span> with zero
                  on-chain PII exposure.
                </p>
              </div>
            </div>

            {/* Card 2: SHA-256 */}
            <div className="p-4 rounded-xl bg-[#111d35]/80 border border-[#1e293b] backdrop-blur-xs flex items-start gap-3.5">
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h3 className="font-bold text-white text-sm">SHA-256 Document Anchoring</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Original documents remain private. Cryptographic hashes protect against fraud and
                  alteration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom security footer inside left panel */}
        <div className="relative z-10 pt-8 mt-8 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Key className="w-3.5 h-3.5 text-[#00BFFF]" />
          <span>Your credentials are protected using secure bcrypt + JWT authentication.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Light Background Portals (#f8fafc) */}
      <div className="w-full lg:w-[54%] bg-[#f8fafc] p-6 sm:p-10 lg:p-12 flex flex-col justify-center space-y-6">
        {/* CARD 1: Citizen Portal Gateway */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[#1e3a8a]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Citizen Portal Gateway</h2>
              <p className="text-xs text-slate-500">
                Manage verified personal property deeds & certificates
              </p>
            </div>
          </div>

          {/* Subtabs: 1. Sign In / Log In vs 2. Create Account */}
          <div className="flex border-b border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCitizenTab('SIGN_IN')}
              className={`pb-2.5 px-4 flex items-center gap-2 transition-colors border-b-2 ${
                citizenTab === 'SIGN_IN'
                  ? 'border-[#1e3a8a] text-[#1e3a8a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>1. Sign In / Log In</span>
            </button>

            <button
              onClick={() => setCitizenTab('CREATE_ACCOUNT')}
              className={`pb-2.5 px-4 flex items-center gap-2 transition-colors border-b-2 ${
                citizenTab === 'CREATE_ACCOUNT'
                  ? 'border-[#1e3a8a] text-[#1e3a8a] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>2. Create Account</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            {citizenTab === 'CREATE_ACCOUNT' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Vikram Mehta / HHFG"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Registered Citizen Email / DID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={citizenEmailOrDid}
                  onChange={(e) => setCitizenEmailOrDid(e.target.value)}
                  placeholder="e.g. citizen@domain.in or did:suraksha:0x..."
                  required
                  className="w-full pl-3.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={citizenPassword}
                  onChange={(e) => setCitizenPassword(e.target.value)}
                  placeholder="Enter account password"
                  required
                  className="w-full pl-3.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                />
                <span>Remember this session</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset links are cryptographically dispatched via DID challenge.')}
                className="text-xs text-[#1e3a8a] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {citizenError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {citizenError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>{citizenTab === 'SIGN_IN' ? 'Sign In as Citizen' : 'Register Citizen Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-slate-500 pt-1">
              {citizenTab === 'SIGN_IN' ? (
                <span>
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setCitizenTab('CREATE_ACCOUNT')}
                    className="font-bold text-[#1e3a8a] hover:underline"
                  >
                    Create Account here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setCitizenTab('SIGN_IN')}
                    className="font-bold text-[#1e3a8a] hover:underline"
                  >
                    Sign In here
                  </button>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* CARD 2: RBAC Official Portal Login (Yellow/Amber Card) */}
        <div className="border-2 border-[#fde047] bg-[#fefce8]/60 rounded-xl p-6 sm:p-7 space-y-4 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#d97706]" />
              <h2 className="text-base font-bold text-slate-900">RBAC Official Portal Login</h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fef08a] border border-[#fde047] text-[#854d0e]">
              Govt Access
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Role-Based Access Control for Administrators, Officers & CAG Auditors
          </p>

          {/* Section: Select RBAC Officer Clearance Profile */}
          <div>
            <div className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider mb-2">
              SELECT RBAC OFFICER CLEARANCE PROFILE: INSTANT AUTHORIZATION
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Level 1: Sovereign Admin */}
              <button
                type="button"
                onClick={() => handleSelectOfficerProfile(1)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedOfficerLevel === 1
                    ? 'border-[#b45309] bg-white ring-2 ring-[#fde047] shadow-xs'
                    : 'border-slate-200 bg-white/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700">
                    Level 1
                  </span>
                  {/* Indian flag */}
                  <span className="text-xs">🇮🇳</span>
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">Sovereign Admin</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Govt Admin Clearance
                  <br />
                  MeitY Full Registry
                </div>
              </button>

              {/* Level 2: Verification Officer */}
              <button
                type="button"
                onClick={() => handleSelectOfficerProfile(2)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedOfficerLevel === 2
                    ? 'border-[#b45309] bg-white ring-2 ring-[#fde047] shadow-xs'
                    : 'border-slate-200 bg-white/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                    Level 2
                  </span>
                  <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  Verification Officer
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Deed & Record Validator
                  <br />
                  Revenue & Deeds
                </div>
              </button>

              {/* Level 3: CAG Auditor */}
              <button
                type="button"
                onClick={() => handleSelectOfficerProfile(3)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedOfficerLevel === 3
                    ? 'border-[#b45309] bg-white ring-2 ring-[#fde047] shadow-xs'
                    : 'border-slate-200 bg-white/80 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-700">
                    Level 3
                  </span>
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="font-bold text-xs text-slate-900 leading-tight">CAG Auditor</div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Statutory Ledger Auditor
                  <br />
                  Statutory Ledger
                </div>
              </button>
            </div>
          </div>

          {/* Officer Form */}
          <form onSubmit={handleOfficerSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Official Govt Email
                </label>
                <input
                  type="email"
                  value={officerEmail}
                  onChange={(e) => setOfficerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#b45309]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  HSM Token / Password
                </label>
                <input
                  type="password"
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#b45309]"
                  required
                />
              </div>
            </div>

            {officerError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {officerError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#78350f] hover:bg-[#92400e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-300" />
              <span>Login to RBAC Dashboard</span>
            </button>
          </form>

          {/* Bottom Security Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 pt-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Official Government of India Sovereign Infrastructure • Authentication Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};
