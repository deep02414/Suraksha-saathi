import React, { useState } from 'react';
import { UserProfile, EscalationTicket, SystemAuditLog, VaultAsset, DispatchedEmailRecord } from '../types';
import {
  generateSecureUID,
  generateTemporaryPassword,
  sendOnboardingEmailMock,
  createMailtoUrl,
} from '../services/emailService';
import { recordAuditLog, deleteUserFromStore, updateUserInStore, toggleBlockUserInStore } from '../services/store';
import {
  ShieldAlert,
  UserCheck,
  Eye,
  EyeOff,
  Send,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Mail,
  UserPlus,
  FileSearch,
  Clock,
  Check,
  Building,
  Search,
  FileCheck,
  X,
  FileText,
  Lock,
  Trash2,
  Key,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface AuditorDashboardProps {
  currentUser: UserProfile;
  usersList: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  escalationTickets: EscalationTicket[];
  onUpdateTickets: (tickets: EscalationTicket[]) => void;
  auditLogs: SystemAuditLog[];
  onAddAuditLog: (log: SystemAuditLog) => void;
  onOpenEmails: () => void;
  onAddDispatchedEmail?: (email: DispatchedEmailRecord) => void;
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({
  currentUser,
  usersList,
  onUpdateUsers,
  escalationTickets,
  onUpdateTickets,
  auditLogs,
  onAddAuditLog,
  onOpenEmails,
  onAddDispatchedEmail,
}) => {
  // Navigation tab for Auditor:
  // 1. FORWARDED_REPORTS: Inspect work sent by verification officers
  // 2. SEARCH_OFFICERS: Separate column/view to search and inspect all verification officers
  const [activeTab, setActiveTab] = useState<'FORWARDED_REPORTS' | 'SEARCH_OFFICERS'>(
    'FORWARDED_REPORTS'
  );

  // Search state for verification officers
  const [officerSearch, setOfficerSearch] = useState('');
  const [inspectedOfficer, setInspectedOfficer] = useState<UserProfile | null>(null);

  // Onboard Officer Modal state
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerCity, setOfficerCity] = useState(currentUser.city || 'New Delhi');
  const [officerStation, setOfficerStation] = useState('Cyber Verification & Forensic Analysis Cell');
  const [officerUid, setOfficerUid] = useState('');
  const [officerPassword, setOfficerPassword] = useState(generateTemporaryPassword());
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState<any | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Deletion & Password management states
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dossierNewPassword, setDossierNewPassword] = useState('');
  const [showDossierPassword, setShowDossierPassword] = useState(false);
  const [dossierActionMsg, setDossierActionMsg] = useState<string | null>(null);

  // Selected Escalation Ticket for Auditor Review
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [auditorNote, setAuditorNote] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // All Verification Officers
  const officers = usersList.filter((u) => u.role === 'OFFICER');

  // Filtered officers
  const q = officerSearch.toLowerCase().trim();
  const filteredOfficers = officers.filter((o) => {
    if (!q) return true;
    return (
      o.uid.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      o.email.toLowerCase().includes(q)
    );
  });

  // Tickets sent to Auditor by Verification Officers
  const forwardedTickets = escalationTickets.filter(
    (t) => t.sentToAuditor || t.status === 'ESCALATED_TO_AUDITOR'
  );

  // Handle Auditor Onboarding a Verification Officer
  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName || !officerEmail || !officerCity) return;

    setIsSubmitting(true);
    const assignedUid = officerUid.trim() || `OFF-${officerCity.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPassword = officerPassword.trim() || generateTemporaryPassword();

    // 1. Dispatch email from this auditor's email
    const emailResult = await sendOnboardingEmailMock({
      senderRole: `CAG Statutory Auditor (${currentUser.uid})`,
      senderEmail: currentUser.email,
      recipientEmail: officerEmail.trim().toLowerCase(),
      recipientName: officerName.trim(),
      recipientRole: 'OFFICER',
      recipientCity: officerCity.trim(),
      generatedUid: assignedUid,
      generatedPassword: finalPassword,
      extraDetails: officerStation,
    });

    if (onAddDispatchedEmail) {
      onAddDispatchedEmail(emailResult);
    }

    // 2. Add Verification Officer to users
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newOfficer: UserProfile = {
      id: `user-officer-${Date.now()}`,
      uid: assignedUid,
      email: officerEmail.trim().toLowerCase(),
      name: officerName.trim(),
      role: 'OFFICER',
      password: finalPassword,
      city: officerCity.trim(),
      assignedAuditorId: currentUser.uid,
      department: officerStation,
      did: `did:suraksha:in:${assignedUid.toLowerCase()}-${randomHex.substring(0, 8)}`,
      walletAddress: '0x' + randomHex,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      status: 'ACTIVE',
      isBlocked: false,
      badgeNumber: `VO-${officerCity.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      directMessages: [],
    };

    const updatedUsers = [...usersList, newOfficer];
    onUpdateUsers(updatedUsers);

    // 3. Record Audit Log
    const newLog = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'PROVISION_VERIFICATION_OFFICER',
      details: `Auditor ${currentUser.name} provisioned Verification Officer ${officerName} (${assignedUid}) for ${officerCity}. Credentials dispatched to ${officerEmail}.`,
      targetId: assignedUid,
    });
    onAddAuditLog(newLog);

    setIsSubmitting(false);
    setOnboardSuccess({
      ...emailResult,
      generatedPassword: finalPassword,
      generatedUid: assignedUid,
    });

    setToastMessage(`Verification Officer ${officerName} (${assignedUid}) provisioned! Credentials sent to ${officerEmail}.`);
    setTimeout(() => setToastMessage(null), 5000);

    setOfficerName('');
    setOfficerEmail('');
    setOfficerUid('');
    setOfficerPassword(generateTemporaryPassword());
  };

  // Safe Account Deletion for Verification Officer
  const handleExecuteDelete = (officer: UserProfile) => {
    const updated = deleteUserFromStore(officer.uid);
    onUpdateUsers(updated);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'PERMANENT_DELETE_USER',
      details: `Auditor ${currentUser.name} permanently purged Verification Officer account ${officer.uid} (${officer.name}) from sovereign directory`,
      targetId: officer.uid,
    });
    onAddAuditLog(log);

    setConfirmDeleteTarget(null);
    if (inspectedOfficer?.uid === officer.uid) {
      setInspectedOfficer(null);
    }
    setToastMessage(`Verification Officer account ${officer.uid} (${officer.name}) has been permanently deleted.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Resend credentials to officer
  const handleResendCredentials = async (officer: UserProfile) => {
    const currentPassword = officer.password || 'Deep@2026';
    const emailResult = await sendOnboardingEmailMock({
      senderRole: `CAG Statutory Auditor (${currentUser.uid})`,
      senderEmail: currentUser.email,
      recipientEmail: officer.email,
      recipientName: officer.name,
      recipientRole: 'OFFICER',
      recipientCity: officer.city || 'India',
      generatedUid: officer.uid,
      generatedPassword: currentPassword,
      extraDetails: officer.department,
    });

    if (onAddDispatchedEmail) {
      onAddDispatchedEmail(emailResult);
    }

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'CREDENTIALS_REISSUED',
      details: `Dispatched credential reminder email to ${officer.email} (${officer.uid})`,
      targetId: officer.uid,
    });
    onAddAuditLog(log);

    setDossierActionMsg(`Credentials successfully dispatched to ${officer.email}!`);
    setTimeout(() => setDossierActionMsg(null), 4000);
  };

  // Update password in dossier
  const handleUpdatePasswordInDossier = async (officer: UserProfile) => {
    if (!dossierNewPassword.trim()) return;
    const newPwd = dossierNewPassword.trim();
    const updated = updateUserInStore(officer.uid, { password: newPwd });
    onUpdateUsers(updated);

    setInspectedOfficer((prev) => prev ? { ...prev, password: newPwd } : null);

    const emailResult = await sendOnboardingEmailMock({
      senderRole: `CAG Statutory Auditor (${currentUser.uid})`,
      senderEmail: currentUser.email,
      recipientEmail: officer.email,
      recipientName: officer.name,
      recipientRole: 'OFFICER',
      recipientCity: officer.city || 'India',
      generatedUid: officer.uid,
      generatedPassword: newPwd,
      extraDetails: 'Updated password credentials generated by Auditor',
    });

    if (onAddDispatchedEmail) {
      onAddDispatchedEmail(emailResult);
    }

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'ADMIN_OVERRIDE_PASSWORD',
      details: `Auditor updated password for ${officer.uid} and dispatched new credentials to ${officer.email}`,
      targetId: officer.uid,
    });
    onAddAuditLog(log);

    setDossierActionMsg(`Password updated & sent to ${officer.email}!`);
    setDossierNewPassword('');
    setTimeout(() => setDossierActionMsg(null), 4000);
  };

  // Toggle Block Officer
  const handleToggleBlock = (officer: UserProfile) => {
    const nextBlock = !officer.isBlocked;
    const updated = toggleBlockUserInStore(officer.uid, nextBlock);
    onUpdateUsers(updated);

    setInspectedOfficer((prev) => prev ? { ...prev, isBlocked: nextBlock, status: nextBlock ? 'SUSPENDED' : 'ACTIVE' } : null);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: nextBlock ? 'SUSPEND_OFFICER_ACCESS' : 'RESTORE_OFFICER_ACCESS',
      details: `Auditor ${nextBlock ? 'blocked' : 'unblocked'} officer ${officer.uid} (${officer.name})`,
      targetId: officer.uid,
    });
    onAddAuditLog(log);
  };

  // Handle Auditor Sanctioning the Verification Officer's Work
  const handleAuditorSignOff = (decision: 'APPROVED_BY_AUDITOR' | 'FLAGGED_FOR_LEGAL_ACTION') => {
    if (!selectedTicket) return;

    const updated = escalationTickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status:
            decision === 'APPROVED_BY_AUDITOR'
              ? ('RESOLVED_APPROVED' as const)
              : ('FORWARDED_TO_ADMIN' as const),
          auditorId: currentUser.uid,
          auditorName: currentUser.name,
          auditorComments: auditorNote.trim() || 'Auditor verified cryptographic signature and officer resolution.',
          auditorInspectedAt: new Date().toISOString(),
          auditorDecision: decision,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    onUpdateTickets(updated);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: decision === 'APPROVED_BY_AUDITOR' ? 'STATUTORY_AUDIT_APPROVAL' : 'ESCALATE_TO_SOVEREIGN_ADMIN',
      details: `Auditor ${currentUser.name} signed off ticket ${selectedTicket.ticketNumber} (${selectedTicket.documentName}): ${decision}`,
      targetId: selectedTicket.id,
    });
    onAddAuditLog(log);

    setActionSuccessMsg(
      decision === 'APPROVED_BY_AUDITOR'
        ? 'Statutory Audit Sign-off complete! Verdict anchored to immutable ledger.'
        : 'Case flagged for Sovereign Legal Action & escalated to Sovereign Administrator (Deep123).'
    );

    setTimeout(() => {
      setActionSuccessMsg('');
      setSelectedTicket(null);
      setAuditorNote('');
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner: Auditor Oversight Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                CAG Statutory Audit Directorate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                Station: {currentUser.city || 'National Directorate'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Statutory Auditor Oversight & Forensic Inspection Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Welcome, <span className="font-bold text-slate-900">{currentUser.name}</span> ({currentUser.uid}).
              Inspect work sent by verification officers, search officer performance records, and provision new officers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onOpenEmails}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-orange-600" />
              <span>Dispatched Outbox</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOfficerModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Onboard Verification Officer</span>
            </button>
          </div>
        </div>

        {/* Auditor Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setActiveTab('FORWARDED_REPORTS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'FORWARDED_REPORTS'
                ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Forwarded Reports from Officers
              </span>
              <FileSearch className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{forwardedTickets.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Work & dispute cases sent to you by Verification Officers
            </div>
          </div>

          <div
            onClick={() => setActiveTab('SEARCH_OFFICERS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'SEARCH_OFFICERS'
                ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Search Verification Officers
              </span>
              <FileCheck className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{officers.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Inspect officers by UID, city name, and verification workload
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-100 hover:text-white text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('FORWARDED_REPORTS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FORWARDED_REPORTS'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Inspect Verification Officer Work ({forwardedTickets.length})
        </button>

        <button
          onClick={() => setActiveTab('SEARCH_OFFICERS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SEARCH_OFFICERS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Verification Officer ({officers.length})</span>
        </button>
      </div>

      {/* VIEW 1: INSPECT WORK SENT BY VERIFICATION OFFICERS */}
      {activeTab === 'FORWARDED_REPORTS' && (
        <div className="space-y-4">
          {forwardedTickets.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No Forwarded Reports Pending Audit</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When a Verification Officer reviews a citizen's complaint and clicks "Send Information to
                Auditor", the dossier will appear here for your statutory audit sign-off.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {forwardedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {ticket.ticketNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5">{ticket.documentName}</h3>
                      <div className="text-xs text-slate-500">Citizen: {ticket.userName} ({ticket.userEmail})</div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {ticket.status}
                    </span>
                  </div>

                  {/* Officer Verification Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 flex items-center justify-between">
                      <span>Officer Resolution Notes:</span>
                      <span className="text-orange-600 font-mono">By: {ticket.officerName || ticket.officerId || 'Verification Officer'}</span>
                    </div>
                    <p className="text-slate-600 italic">
                      "{ticket.officerComments || 'Officer reviewed and verified the authentic document against tampered upload.'}"
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Tamper Rate: <strong>{ticket.tamperPercentage}%</strong></span>
                      <span>Original Restored: {ticket.resolvedDocumentUrl ? 'YES' : 'Pending'}</span>
                    </div>
                  </div>

                  {/* Audit Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-[11px] text-slate-500">
                      Forwarded: {new Date(ticket.updatedAt).toLocaleDateString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Inspect Dossier & Audit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SEPARATE COLUMN - SEARCH VERIFICATION OFFICER */}
      {activeTab === 'SEARCH_OFFICERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                placeholder="Search verification officer by UID, city name, or email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
              />
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredOfficers.length}</span> verification officers
            </div>
          </div>

          {filteredOfficers.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Verification Officers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No verification officers registered yet for this criteria. You can onboard a new officer using the button below.
              </p>
              <button
                type="button"
                onClick={() => setShowOfficerModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Onboard Verification Officer</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficers.map((officer) => {
                const reviewedCases = escalationTickets.filter(
                  (t) => t.officerId === officer.uid || t.officerName === officer.name
                );

                return (
                  <div
                    key={officer.uid}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {officer.uid}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5">{officer.name}</h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>City: <strong className="text-slate-800">{officer.city || 'India'}</strong></span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {officer.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                      <div>Email: {officer.email}</div>
                      <div>Unit: {officer.department || 'Document Verification Unit'}</div>
                      <div>Resolved Cases: <strong className="text-slate-900">{reviewedCases.length} disputes</strong></div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectedOfficer(officer)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Inspect Officer Work & Credentials"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBlock(officer)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          officer.isBlocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                        }`}
                        title={officer.isBlocked ? 'Unblock Officer' : 'Block Officer'}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{officer.isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTarget(officer)}
                        className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Permanently Delete Officer Account"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: INSPECT OFFICER DOSSIER */}
      {inspectedOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Verification Officer Inspection
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {inspectedOfficer.name} ({inspectedOfficer.uid})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedOfficer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>City / Station: <strong>{inspectedOfficer.city || 'India'}</strong></div>
                <div>Official Email: <strong>{inspectedOfficer.email}</strong></div>
                <div>Status: <strong className={inspectedOfficer.isBlocked ? 'text-red-600' : 'text-emerald-700'}>{inspectedOfficer.isBlocked ? 'SUSPENDED' : 'ACTIVE'}</strong></div>
                <div>Station: <strong>{inspectedOfficer.department}</strong></div>
              </div>

              {/* SECURITY CREDENTIALS & PASSWORD MANAGEMENT */}
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                    <Key className="w-4 h-4 text-orange-600" />
                    <span>Credentials & Access Key Management</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleResendCredentials(inspectedOfficer)}
                    className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Resend Credentials via Email</span>
                  </button>
                </div>

                {dossierActionMsg && (
                  <div className="p-2.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{dossierActionMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-orange-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                      Current Password / Access Key
                    </span>
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-800 text-xs">
                        {showDossierPassword ? (inspectedOfficer.password || 'Deep@2026') : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDossierPassword(!showDossierPassword)}
                        className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      >
                        {showDossierPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-orange-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                      Assigned Officer UID
                    </span>
                    <div className="font-mono font-bold text-orange-700 text-xs py-0.5">
                      {inspectedOfficer.uid}
                    </div>
                  </div>
                </div>

                {/* Set Password Option for Officer */}
                <div className="pt-2 border-t border-orange-200/60 flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={dossierNewPassword}
                      onChange={(e) => setDossierNewPassword(e.target.value)}
                      placeholder="Enter new password to assign to this officer..."
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:border-orange-500 font-mono outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!dossierNewPassword.trim()}
                    onClick={() => handleUpdatePasswordInDossier(inspectedOfficer)}
                    className="w-full sm:w-auto shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save & Update Password
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase text-xs">
                  Work Completed by this Officer:
                </h4>
                {escalationTickets.filter(
                  (t) => t.officerId === inspectedOfficer.uid || t.officerName === inspectedOfficer.name
                ).length === 0 ? (
                  <div className="p-3 text-slate-500 bg-slate-50 rounded-lg text-center">
                    No citizen dispute cases handled yet by this officer.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {escalationTickets
                      .filter(
                        (t) =>
                          t.officerId === inspectedOfficer.uid || t.officerName === inspectedOfficer.name
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{t.documentName}</div>
                            <div className="text-slate-500 text-[11px]">User: {t.userName}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {t.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(inspectedOfficer)}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleBlock(inspectedOfficer)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    inspectedOfficer.isBlocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {inspectedOfficer.isBlocked ? 'Unblock Officer' : 'Block & Suspend'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedOfficer(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDITOR STATUTORY SIGN-OFF */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  CAG Statutory Audit Sign-off
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Case Review: {selectedTicket.ticketNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div>Document: <strong className="text-slate-900">{selectedTicket.documentName}</strong></div>
                <div>Citizen: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail})</div>
                <div>Tamper Analysis: <span className="font-bold text-red-600">{selectedTicket.tamperPercentage}% Tampered</span></div>
                <div>Officer Findings: <span className="italic text-slate-700">"{selectedTicket.officerComments}"</span></div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Statutory Auditor Evaluation & Sign-off Notes:
                </label>
                <textarea
                  rows={3}
                  value={auditorNote}
                  onChange={(e) => setAuditorNote(e.target.value)}
                  placeholder="Enter statutory inspection remarks, evidence review, or sanctions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Signing off will anchor your Auditor Decentralized Identifier ({currentUser.did})
                  to the immutable blockchain ledger under IT Act § 65B.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAuditorSignOff('FLAGGED_FOR_LEGAL_ACTION')}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Flag for Sovereign Legal Action
              </button>
              <button
                type="button"
                onClick={() => handleAuditorSignOff('APPROVED_BY_AUDITOR')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Anchor Audit Verdict</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD VERIFICATION OFFICER */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  Verification Officer Provisioning
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Onboard Document Verification Officer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOfficerModal(false);
                  setOnboardSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Officer Provisioned & Credentials Dispatched!</span>
                  </div>
                  <p>
                    Official credentials have been dispatched from your email (
                    <strong>{currentUser.email}</strong>) to{' '}
                    <strong>{onboardSuccess.recipientEmail}</strong>.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span>Assigned UID:</span>
                      <strong className="text-slate-900 text-xs">{onboardSuccess.generatedUid}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Assigned Password:</span>
                      <strong className="text-orange-700 text-xs">{onboardSuccess.generatedPassword}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Recipient:</span>
                      <span className="text-slate-700">{onboardSuccess.recipientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Email:</span>
                      <span className="text-slate-700">{onboardSuccess.recipientEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `SurakshaSathi Officer Credentials:\nUID: ${onboardSuccess.generatedUid}\nPassword: ${onboardSuccess.generatedPassword}\nPortal: Official Verification Officer Portal`
                      );
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 3000);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCreds ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                  </button>

                  <a
                    href={createMailtoUrl(onboardSuccess)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Send via Mail Client</span>
                  </a>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOfficerModal(false);
                      setOnboardSuccess(null);
                      onOpenEmails();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs text-orange-700 hover:bg-orange-50 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>View in Email Outbox</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOfficerModal(false);
                      setOnboardSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateOfficer} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Officer Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    placeholder="e.g. Insp. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    City / Station Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={officerCity}
                    onChange={(e) => setOfficerCity(e.target.value)}
                    placeholder="e.g. New Delhi, Mumbai, Bengaluru"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Official Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    placeholder="e.g. officer.rajesh@surakshasathi.gov.in"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Credentials will be sent to the officer's email from your official Auditor address.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Assigned Officer UID (Optional / Auto-Generated)
                  </label>
                  <input
                    type="text"
                    value={officerUid}
                    onChange={(e) => setOfficerUid(e.target.value)}
                    placeholder="Leave empty to auto-generate e.g. OFF-DEL-3104"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 font-mono text-xs text-slate-900 outline-none"
                  />
                </div>

                {/* SET PASSWORD FOR OFFICER */}
                <div className="space-y-1 bg-orange-50/70 p-3 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-orange-600" />
                      <span>Set Password for Officer <span className="text-red-500">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOfficerPassword(generateTemporaryPassword())}
                      className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showOfficerPassword ? 'text' : 'password'}
                      required
                      value={officerPassword}
                      onChange={(e) => setOfficerPassword(e.target.value)}
                      placeholder="Enter login password for officer"
                      className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 font-mono text-xs text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOfficerPassword(!showOfficerPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showOfficerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    This password will be dispatched to the Officer via official mail from <strong>{currentUser.email}</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Assigned Unit / Cell
                  </label>
                  <input
                    type="text"
                    value={officerStation}
                    onChange={(e) => setOfficerStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOfficerModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Provisioning & Dispatching Email...' : 'Provision Officer & Send Credentials Email'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* MODAL: CONFIRM PERMANENT DELETE OFFICER (Safe in-app modal, no window.confirm) */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Permanently Delete Verification Officer?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to permanently purge the Verification Officer account for{' '}
                <strong className="text-slate-900">{confirmDeleteTarget.name}</strong> ({confirmDeleteTarget.uid}).
              </p>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-left text-[11px] text-red-800 font-mono space-y-1 mt-2">
                <div>UID: {confirmDeleteTarget.uid}</div>
                <div>Email: {confirmDeleteTarget.email}</div>
                <div>Station: {confirmDeleteTarget.department || 'Verification Cell'}</div>
                <div>Action: Purging keys & access credentials</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteDelete(confirmDeleteTarget)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm & Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
