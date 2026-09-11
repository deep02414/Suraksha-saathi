import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Building,
  FileCheck,
  Layers,
  ArrowLeft,
  AlertTriangle,
  Wallet,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';

interface CitizenLoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
  onNavigateOfficerLogin: () => void;
  usersList: UserProfile[];
  onRegisterCitizen?: (user: UserProfile) => void;
}

export const CitizenLoginView: React.FC<CitizenLoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateOfficerLogin,
  usersList,
  onRegisterCitizen,
}) => {
  // Citizen Form State - strictly manual entry (NO autofill)
  const [citizenTab, setCitizenTab] = useState<'SIGN_IN' | 'CREATE_ACCOUNT'>('SIGN_IN');
  const [citizenEmailOrDid, setCitizenEmailOrDid] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenCity, setCitizenCity] = useState('');
  const [citizenWallet, setCitizenWallet] = useState('');
  const [citizenError, setCitizenError] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState('');

  // Submit Citizen Sign In / Create Account
  const handleCitizenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenError('');
    setRegSuccessMsg('');

    if (citizenTab === 'SIGN_IN') {
      const input = citizenEmailOrDid.trim().toLowerCase();
      if (!input) {
        setCitizenError('Please enter your Registered Email or DID.');
        return;
      }
      if (!citizenPassword) {
        setCitizenError('Please enter your account password.');
        return;
      }

      // Look up existing citizen
      const found = usersList.find(
        (u) =>
          u.role === 'USER' &&
          (u.email.toLowerCase() === input ||
            u.did.toLowerCase() === input ||
            u.uid.toLowerCase() === input)
      );

      if (found) {
        if (found.isBlocked || found.status === 'SUSPENDED') {
          setCitizenError(
            'Access Denied: Your citizen vault access has been suspended by the Sovereign Administrator.'
          );
          return;
        }

        if (found.password && citizenPassword !== found.password) {
          setCitizenError('Authentication Failed: Incorrect password.');
          return;
        }

        onLoginSuccess(found);
      } else {
        setCitizenError(
          'No citizen account found with this email. Please switch to "Create Citizen Account" to register.'
        );
      }
    } else {
      // Create citizen account
      if (!citizenEmailOrDid.trim() || !citizenName.trim() || !citizenPassword) {
        setCitizenError('Full Name, Email Address, and Password are required.');
        return;
      }

      const emailInput = citizenEmailOrDid.trim().toLowerCase();
      const existing = usersList.find((u) => u.email.toLowerCase() === emailInput);
      if (existing) {
        setCitizenError('An account with this email address already exists. Please sign in.');
        return;
      }

      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const genWallet = citizenWallet.trim() || `0x${randomHex}`;
      const newCitizen: UserProfile = {
        id: `user-citizen-${Date.now()}`,
        uid: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        email: emailInput,
        name: citizenName.trim(),
        role: 'USER',
        password: citizenPassword,
        city: citizenCity.trim() || 'New Delhi',
        did: `did:suraksha:in:usr-${randomHex.substring(0, 8)}`,
        walletAddress: genWallet,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        isBlocked: false,
        department: 'Citizen Self-Service Vault Registry',
        uploadedDocuments: [],
        registeredWallets: [genWallet],
      };

      if (onRegisterCitizen) {
        onRegisterCitizen(newCitizen);
      }
      onLoginSuccess(newCitizen);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row bg-[#f8fafc] text-slate-800 font-sans">
      {/* LEFT COLUMN: Clean White & Slate Branding Panel */}
      <div className="w-full lg:w-[44%] bg-white border-r border-slate-200 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle orange accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        <div className="space-y-8 relative z-10">
          {/* Top navigation controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-600" />
              <span>Return to Homepage</span>
            </button>

            <button
              type="button"
              onClick={onNavigateOfficerLogin}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-orange-600" />
              <span>Official Officer Login →</span>
            </button>
          </div>

          {/* Logos */}
          <div className="space-y-3">
            <SurakshaLogo variant="light" size="lg" />
            <div className="flex items-center gap-2">
              <DigitalIndiaBadge size="sm" />
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Citizen Self-Service Vault
              </span>
            </div>
          </div>

          {/* Context Overview */}
          <div className="space-y-4 pt-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Citizen Decentralized Identity & Asset Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Securely store sovereign fixed deposit bonds, degree certificates, land titles, and
              crypto cold-storage addresses. If any document is altered, submit instant verification
              complaints to authorized Verification Officers.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">Permanent Database & Blockchain Storage</div>
                  <div className="text-slate-600">
                    Upload your important documents and link your crypto wallet address permanently
                    anchored with zero-knowledge proofs.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">AI Tamper Scanner & Officer Escalation</div>
                  <div className="text-slate-600">
                    Run automated pixel and font verification. If tampered, request the verification
                    officer to verify and send back your authentic document.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-500">
          MeitY GIGW 3.0 & Web3 Identity Standards compliant. No mock credentials or autofill triggers.
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Form */}
      <div className="w-full lg:w-[56%] p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Tab Switcher: Sign In vs Create Account */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setCitizenTab('SIGN_IN');
                setCitizenError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                citizenTab === 'SIGN_IN'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In to Vault
            </button>
            <button
              type="button"
              onClick={() => {
                setCitizenTab('CREATE_ACCOUNT');
                setCitizenError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                citizenTab === 'CREATE_ACCOUNT'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Create Citizen Account</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {citizenTab === 'SIGN_IN' ? 'Citizen Vault Sign In' : 'Create New Citizen Account'}
            </h2>
            <p className="text-xs text-slate-600">
              {citizenTab === 'SIGN_IN'
                ? 'Enter your registered email or Decentralized Identifier (DID).'
                : 'Fill in your details to establish your sovereign citizen identity.'}
            </p>
          </div>

          {/* Error Message */}
          {citizenError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{citizenError}</span>
            </div>
          )}

          {/* Citizen Form */}
          <form onSubmit={handleCitizenSubmit} className="space-y-4">
            {citizenTab === 'CREATE_ACCOUNT' && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    City / Residential Location
                  </label>
                  <input
                    type="text"
                    value={citizenCity}
                    onChange={(e) => setCitizenCity(e.target.value)}
                    placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
                  />
                </div>
              </>
            )}

            {/* Email / DID Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {citizenTab === 'SIGN_IN' ? 'Registered Email or DID' : 'Email Address'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={citizenEmailOrDid}
                onChange={(e) => setCitizenEmailOrDid(e.target.value)}
                placeholder={
                  citizenTab === 'SIGN_IN'
                    ? 'Enter your registered email'
                    : 'Enter your official contact email'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Security Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={citizenPassword}
                onChange={(e) => setCitizenPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {citizenTab === 'SIGN_IN'
                  ? 'Sign In & Access Digital Vault'
                  : 'Register Account & Generate DID'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
