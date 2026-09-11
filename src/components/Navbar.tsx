import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Shield, Lock, Key, Copy, Check, Mail, Code, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  onSwitchRole: (role: UserRole) => void;
  onOpenAuth: () => void;
  onOpenEmails: () => void;
  onOpenContract: () => void;
  unreadEmailsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenAuth,
  onOpenEmails,
  onOpenContract,
  unreadEmailsCount,
}) => {
  const [copiedDid, setCopiedDid] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'SYSTEM ADMIN',
          border: 'border-[#FFA500]',
          text: 'text-[#FFA500]',
          bg: 'bg-[#FFA500]/10',
        };
      case 'AUDITOR':
        return {
          label: 'CHIEF AUDITOR',
          border: 'border-[#00BFFF]',
          text: 'text-[#00BFFF]',
          bg: 'bg-[#00BFFF]/10',
        };
      case 'OFFICER':
        return {
          label: 'VERIFICATION OFFICER',
          border: 'border-[#2E8B57]',
          text: 'text-[#00FF00]',
          bg: 'bg-[#2E8B57]/20',
        };
      case 'USER':
      default:
        return {
          label: 'CITIZEN / VAULT USER',
          border: 'border-[#87CEEB]',
          text: 'text-[#87CEEB]',
          bg: 'bg-[#87CEEB]/10',
        };
    }
  };

  const roleStyle = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-[#060e1a]/95 backdrop-blur-md border-b border-[#00BFFF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Main Branding */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg border-2 border-[#00BFFF] bg-[#00BFFF]/10 flex items-center justify-center text-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.25)]">
              <Shield className="w-6 h-6 text-[#00BFFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#FFFFFF]" style={{ fontFamily: 'Arial, sans-serif' }}>
                  सुरक्षा साथी
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded border border-[#00FF00]/40 text-[#00FF00] bg-[#2E8B57]/20">
                  v2.4 MAINNET
                </span>
              </div>
              <p className="text-xs text-[#87CEEB] tracking-wide hidden sm:block">
                Suraksha Sathi • Decentralized Vault, NFT Assets & AI Tamper Detection
              </p>
            </div>
          </div>

          {/* Center: Demo Quick Role Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-[#0b172a] rounded-lg border border-[#87CEEB]/30">
            <span className="text-[11px] text-[#87CEEB] px-2 font-semibold">SWITCH ROLE:</span>
            <button
              onClick={() => onSwitchRole('ADMIN')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-[#FFA500] text-[#060e1a] shadow-sm'
                  : 'text-[#FFA500] hover:bg-[#FFA500]/10'
              }`}
            >
              Admin (Deep Singh)
            </button>
            <button
              onClick={() => onSwitchRole('AUDITOR')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                currentUser?.role === 'AUDITOR'
                  ? 'bg-[#00BFFF] text-[#060e1a] shadow-sm'
                  : 'text-[#00BFFF] hover:bg-[#00BFFF]/10'
              }`}
            >
              Auditor (Dr. Sharma)
            </button>
            <button
              onClick={() => onSwitchRole('OFFICER')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                currentUser?.role === 'OFFICER'
                  ? 'bg-[#2E8B57] text-[#FFFFFF] shadow-sm'
                  : 'text-[#00FF00] hover:bg-[#2E8B57]/20'
              }`}
            >
              Officer (Insp. Rajesh)
            </button>
            <button
              onClick={() => onSwitchRole('USER')}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                currentUser?.role === 'USER'
                  ? 'bg-[#87CEEB] text-[#060e1a] shadow-sm'
                  : 'text-[#87CEEB] hover:bg-[#87CEEB]/10'
              }`}
            >
              Citizen (Vikram)
            </button>
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Outbox Email Viewer button */}
            <button
              onClick={onOpenEmails}
              className="relative p-2 rounded-lg border border-[#87CEEB]/40 bg-[#0b172a] text-[#87CEEB] hover:text-[#FFFFFF] hover:border-[#00BFFF] transition-colors"
              title="View NodeMailer Onboarding Email Logs"
            >
              <Mail className="w-5 h-5" />
              {unreadEmailsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-[#FFA500] text-[#060e1a] rounded-full">
                  {unreadEmailsCount}
                </span>
              )}
            </button>

            {/* Smart Contract Inspector button */}
            <button
              onClick={onOpenContract}
              className="p-2 rounded-lg border border-[#87CEEB]/40 bg-[#0b172a] text-[#87CEEB] hover:text-[#FFFFFF] hover:border-[#00BFFF] transition-colors hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="View Solidity Smart Contract & RBAC Middleware"
            >
              <Code className="w-4 h-4 text-[#00FF00]" />
              <span>Contracts</span>
            </button>

            {/* User Session Info or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-bold text-[#FFFFFF]">
                      {currentUser.name.split('(')[0]}
                    </span>
                    {roleStyle && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleStyle.border} ${roleStyle.text} ${roleStyle.bg}`}
                      >
                        {roleStyle.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] text-[#87CEEB]">
                    <span className="font-mono text-xs text-[#87CEEB]">
                      UID: {currentUser.uid}
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => copyToClipboard(currentUser.did)}
                      className="font-mono text-[11px] hover:text-[#FFFFFF] flex items-center gap-0.5"
                      title="Copy DID"
                    >
                      <span>{currentUser.did.substring(0, 16)}...</span>
                      {copiedDid ? (
                        <Check className="w-3 h-3 text-[#00FF00]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#87CEEB]" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg border border-[#87CEEB]/40 bg-[#0b172a] text-xs font-bold text-[#87CEEB] hover:text-[#FFFFFF] hover:border-[#FFA500] transition-colors flex items-center gap-1.5"
                  title="Switch or Authenticate User"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Portal</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg bg-[#00BFFF] text-[#060e1a] font-bold text-sm hover:bg-[#87CEEB] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,191,255,0.3)]"
              >
                <Key className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Quick Switcher Bar */}
        <div className="lg:hidden py-2 border-t border-[#87CEEB]/20 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
          <span className="text-[#87CEEB] font-bold shrink-0">ROLE:</span>
          <button
            onClick={() => onSwitchRole('ADMIN')}
            className={`px-2 py-0.5 font-bold rounded shrink-0 ${
              currentUser?.role === 'ADMIN' ? 'bg-[#FFA500] text-[#060e1a]' : 'text-[#FFA500]'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => onSwitchRole('AUDITOR')}
            className={`px-2 py-0.5 font-bold rounded shrink-0 ${
              currentUser?.role === 'AUDITOR' ? 'bg-[#00BFFF] text-[#060e1a]' : 'text-[#00BFFF]'
            }`}
          >
            Auditor
          </button>
          <button
            onClick={() => onSwitchRole('OFFICER')}
            className={`px-2 py-0.5 font-bold rounded shrink-0 ${
              currentUser?.role === 'OFFICER' ? 'bg-[#2E8B57] text-[#FFFFFF]' : 'text-[#00FF00]'
            }`}
          >
            Officer
          </button>
          <button
            onClick={() => onSwitchRole('USER')}
            className={`px-2 py-0.5 font-bold rounded shrink-0 ${
              currentUser?.role === 'USER' ? 'bg-[#87CEEB] text-[#060e1a]' : 'text-[#87CEEB]'
            }`}
          >
            Citizen
          </button>
        </div>
      </div>
    </header>
  );
};
