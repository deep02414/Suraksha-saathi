import React from 'react';
import { UserProfile, SystemAuditLog, EscalationTicket, VaultAsset, DispatchedEmail } from '../types';
import { AdminDashboard } from './AdminDashboard';
import { AuditorDashboard } from './AuditorDashboard';
import { OfficerDashboard } from './OfficerDashboard';
import { Key, Shield, Building, FileCheck, Lock, ExternalLink } from 'lucide-react';
import { DigitalIndiaBadge } from './SurakshaLogo';

interface RBACCommandPortalProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  auditLogs: SystemAuditLog[];
  onAddAuditLog: (log: SystemAuditLog) => void;
  escalationTickets: EscalationTicket[];
  onUpdateTickets: (tickets: EscalationTicket[]) => void;
  vaultAssets: VaultAsset[];
  onUpdateAssets: (assets: VaultAsset[]) => void;
  onOpenOnboardOfficer?: () => void;
  onOpenSmartContract?: () => void;
  onOpenEmails: () => void;
  onAddDispatchedEmail?: (email: DispatchedEmail) => void;
}

export const RBACCommandPortal: React.FC<RBACCommandPortalProps> = ({
  currentUser,
  allUsers,
  onUpdateUsers,
  auditLogs,
  onAddAuditLog,
  escalationTickets,
  onUpdateTickets,
  vaultAssets,
  onUpdateAssets,
  onOpenOnboardOfficer,
  onOpenSmartContract,
  onOpenEmails,
  onAddDispatchedEmail,
}) => {
  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-140px)] p-4 sm:p-7 max-w-7xl mx-auto font-sans space-y-6">
      {/* Top Identity Header (No Instant Authorization Role-Switching) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0 ${
              currentUser.role === 'ADMIN'
                ? 'bg-orange-600'
                : currentUser.role === 'AUDITOR'
                ? 'bg-emerald-600'
                : 'bg-amber-600'
            }`}
          >
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-slate-900">{currentUser.name}</span>
              <span
                className={`px-2 py-0.2 rounded text-[10px] font-black uppercase tracking-wider ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : currentUser.role === 'AUDITOR'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {currentUser.role === 'ADMIN'
                  ? 'Sovereign Root Administrator'
                  : currentUser.role === 'AUDITOR'
                  ? 'CAG Statutory Auditor'
                  : 'Document Verification Officer'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-slate-700">
                UID: {currentUser.uid}
              </span>
              <span>•</span>
              <span>City: <strong className="text-slate-700">{currentUser.city || 'National Central'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Credential Session Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DigitalIndiaBadge size="sm" />
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            FIPS 140-2 Level 3
          </span>
        </div>
      </div>

      {/* Role-tailored dynamic dashboard rendered strictly according to authenticated role */}
      {currentUser.role === 'ADMIN' && (
        <AdminDashboard
          currentUser={currentUser}
          usersList={allUsers}
          onUpdateUsers={onUpdateUsers}
          auditLogs={auditLogs}
          onAddAuditLog={onAddAuditLog}
          escalationTickets={escalationTickets}
          vaultAssets={vaultAssets}
          onOpenEmails={onOpenEmails}
          onOpenSmartContract={onOpenSmartContract}
          onAddDispatchedEmail={onAddDispatchedEmail}
        />
      )}

      {currentUser.role === 'AUDITOR' && (
        <AuditorDashboard
          currentUser={currentUser}
          usersList={allUsers}
          onUpdateUsers={onUpdateUsers}
          escalationTickets={escalationTickets}
          onUpdateTickets={onUpdateTickets}
          auditLogs={auditLogs}
          onAddAuditLog={onAddAuditLog}
          onOpenEmails={onOpenEmails}
          onAddDispatchedEmail={onAddDispatchedEmail}
        />
      )}

      {currentUser.role === 'OFFICER' && (
        <OfficerDashboard
          currentUser={currentUser}
          escalationTickets={escalationTickets}
          onUpdateTickets={onUpdateTickets}
          vaultAssets={vaultAssets}
          onUpdateAssets={onUpdateAssets}
          auditLogs={auditLogs}
          onAddAuditLog={onAddAuditLog}
        />
      )}
    </div>
  );
};
