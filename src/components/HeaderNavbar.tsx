import React, { useState } from 'react';
import {
  Search,
  Bell,
  Key,
  Shield,
  User,
  ChevronDown,
  LogOut,
  Cpu,
  Layers,
  FileCheck,
  UserCheck,
  Mail,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';

interface HeaderNavbarProps {
  currentUser: UserProfile | null;
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
  onOpenEmailsModal?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onLogout: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenSearch,
  onOpenEmailsModal,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand logo */}
          <div
            onClick={() => onNavigate('OVERVIEW')}
            className="cursor-pointer shrink-0"
          >
            <SurakshaLogo variant="light" size="md" />
          </div>

            {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('OVERVIEW')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeView === 'OVERVIEW'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Overview (Home)
            </button>

            {/* Citizen Portal Link: visible only to Citizens or unauthenticated guests */}
            {(!currentUser || currentUser.role === 'USER') && (
              <button
                onClick={() => {
                  if (!currentUser) onNavigate('CITIZEN_LOGIN');
                  else onNavigate('CITIZEN');
                }}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'CITIZEN' || activeView === 'CITIZEN_LOGIN'
                    ? 'text-orange-600 bg-orange-50 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Citizen Portal
              </button>
            )}

            <button
              onClick={() => onNavigate('VERIFY_ASSET')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeView === 'VERIFY_ASSET'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Verify an Asset
            </button>

            <button
              onClick={() => onNavigate('TAMPER_DETECTION')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'TAMPER_DETECTION'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>AI Tamper Detector</span>
            </button>

            <button
              onClick={() => onNavigate('PUBLIC_LEDGER')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeView === 'PUBLIC_LEDGER'
                  ? 'text-orange-600 bg-orange-50 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Public Ledger
            </button>

            {/* RBAC Command Button: strictly visible only to RBAC Officials or unauthenticated guests */}
            {(!currentUser || currentUser.role !== 'USER') && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    onNavigate('OFFICER_LOGIN');
                  } else {
                    onNavigate('RBAC');
                  }
                }}
                className={`px-3 py-1 rounded-md border flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  activeView === 'RBAC' || activeView === 'OFFICER_LOGIN'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-300/50'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-orange-600" />
                <span>RBAC Command</span>
              </button>
            )}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Digital India Badge */}
            <div className="hidden md:block">
              <DigitalIndiaBadge size="sm" />
            </div>

            {/* Search input with ⌘K */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-md text-slate-500 text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search Registry...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-300 rounded text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* User Profile or Separate Login Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-slate-300 bg-white text-left transition-colors cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-red-600'
                        : currentUser.role === 'AUDITOR'
                        ? 'bg-purple-600'
                        : currentUser.role === 'OFFICER'
                        ? 'bg-orange-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block leading-tight text-left">
                    <div className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
                      {currentUser.name}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {currentUser.role} • {currentUser.uid}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            currentUser.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : currentUser.role === 'AUDITOR'
                              ? 'bg-purple-100 text-purple-700'
                              : currentUser.role === 'OFFICER'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 break-all mt-0.5">
                        {currentUser.did}
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      {currentUser.role === 'USER' && (
                        <button
                          onClick={() => {
                            onNavigate('CITIZEN');
                            setShowUserDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>Citizen Self-Service Vault</span>
                        </button>
                      )}

                      {currentUser.role !== 'USER' && (
                        <button
                          onClick={() => {
                            onNavigate('RBAC');
                            setShowUserDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5 text-orange-600" />
                          <span>RBAC Statutory Command Center</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigate('TAMPER_DETECTION');
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        <span>AI Forensics & Tamper Tool</span>
                      </button>

                      {(currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR') && onOpenEmailsModal && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenEmailsModal();
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-orange-600" />
                          <span>View Dispatched Credential Emails</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Disconnect Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* SEPARATE CITIZEN LOGIN & OFFICER LOGIN BUTTONS */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('CITIZEN_LOGIN')}
                  className="px-3.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Citizen Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('OFFICER_LOGIN')}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Officer Login</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
