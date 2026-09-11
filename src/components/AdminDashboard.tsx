import React, { useState } from 'react';
import { UserProfile, SystemAuditLog, EscalationTicket, VaultAsset, DirectMessage, DispatchedEmail } from '../types';
import {
  generateSecureUID,
  generateTemporaryPassword,
  sendOnboardingEmailMock,
  createMailtoUrl,
} from '../services/emailService';
import {
  recordAuditLog,
  toggleBlockUserInStore,
  deleteUserFromStore,
  updateUserInStore,
  sendDirectMessage,
} from '../services/store';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Activity,
  Trash2,
  Lock,
  Mail,
  CheckCircle,
  Clock,
  Search,
  Building,
  FileCheck,
  Send,
  Eye,
  EyeOff,
  AlertTriangle,
  Laptop,
  CheckCircle2,
  XCircle,
  FileText,
  Wallet,
  X,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Key,
} from 'lucide-react';
import { getDeviceFingerprint, getMasterDeviceBinding } from '../services/deviceSecurity';

interface AdminDashboardProps {
  currentUser: UserProfile;
  usersList: UserProfile[];
  onUpdateUsers: (users: UserProfile[]) => void;
  auditLogs: SystemAuditLog[];
  onAddAuditLog: (log: SystemAuditLog) => void;
  escalationTickets: EscalationTicket[];
  vaultAssets: VaultAsset[];
  onOpenEmails: () => void;
  onOpenSmartContract?: () => void;
  onAddDispatchedEmail?: (email: DispatchedEmail) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  usersList,
  onUpdateUsers,
  auditLogs,
  onAddAuditLog,
  escalationTickets,
  vaultAssets,
  onOpenEmails,
  onOpenSmartContract,
  onAddDispatchedEmail,
}) => {
  // Navigation Tabs for Admin: AUDITORS | OFFICERS | USERS | AUDIT_CHAIN | DEVICE_LOCK
  const [adminTab, setAdminTab] = useState<
    'SEARCH_AUDITORS' | 'SEARCH_OFFICERS' | 'SEARCH_USERS' | 'AUDIT_LOGS' | 'DEVICE_LOCK'
  >('SEARCH_AUDITORS');

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Profile for Inspection Modal
  const [inspectedUser, setInspectedUser] = useState<UserProfile | null>(null);

  // Message Modal state
  const [messageRecipient, setMessageRecipient] = useState<UserProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messageSentNotification, setMessageSentNotification] = useState('');

  // Onboard Auditor Modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [auditorName, setAuditorName] = useState('');
  const [auditorEmail, setAuditorEmail] = useState('');
  const [auditorCity, setAuditorCity] = useState('');
  const [auditorDept, setAuditorDept] = useState('Directorate of Document Forensics & Audit');
  const [auditorUid, setAuditorUid] = useState('');
  const [auditorPassword, setAuditorPassword] = useState(() => generateTemporaryPassword());
  const [showAuditorPassword, setShowAuditorPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState<any | null>(null);

  // Management & Deletion state
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<UserProfile | null>(null);
  const [dossierNewPassword, setDossierNewPassword] = useState('');
  const [showDossierPassword, setShowDossierPassword] = useState(false);
  const [dossierActionMsg, setDossierActionMsg] = useState('');
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Counts
  const totalAuditors = usersList.filter((u) => u.role === 'AUDITOR');
  const totalOfficers = usersList.filter((u) => u.role === 'OFFICER');
  const totalUsers = usersList.filter((u) => u.role === 'USER');

  // Handlers for Block/Unblock
  const handleToggleBlock = (target: UserProfile) => {
    const willBlock = !target.isBlocked;
    const updated = toggleBlockUserInStore(target.uid, willBlock);
    onUpdateUsers(updated);

    if (inspectedUser && inspectedUser.uid === target.uid) {
      setInspectedUser({
        ...inspectedUser,
        isBlocked: willBlock,
        status: willBlock ? 'SUSPENDED' : 'ACTIVE',
      });
    }

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: willBlock ? 'BLOCK_ACCOUNT' : 'UNBLOCK_ACCOUNT',
      details: `Sovereign Admin ${willBlock ? 'blocked' : 'unblocked'} account ${target.uid} (${target.name})`,
      targetId: target.uid,
    });
    onAddAuditLog(log);
  };

  // Handler for Permanent Delete User (No window.confirm to avoid iframe blocks)
  const handleExecuteDelete = (target: UserProfile) => {
    const updated = deleteUserFromStore(target.uid);
    onUpdateUsers(updated);

    if (inspectedUser && inspectedUser.uid === target.uid) {
      setInspectedUser(null);
    }
    setConfirmDeleteTarget(null);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'DELETE_ACCOUNT',
      details: `Sovereign Admin permanently deleted account ${target.uid} (${target.name})`,
      targetId: target.uid,
    });
    onAddAuditLog(log);

    setToastMessage(`Account ${target.uid} (${target.name}) permanently purged from sovereign database.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handler for Admin updating an Auditor's password from Dossier
  const handleUpdatePasswordInDossier = (user: UserProfile) => {
    if (!dossierNewPassword.trim()) return;
    const pass = dossierNewPassword.trim();
    const updated = updateUserInStore(user.uid, { password: pass });
    onUpdateUsers(updated);
    setInspectedUser({ ...user, password: pass });
    setDossierNewPassword('');
    setDossierActionMsg(`Password successfully updated and secured for ${user.uid}!`);
    setTimeout(() => setDossierActionMsg(''), 5000);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'UPDATE_PASSWORD',
      details: `Admin reset password for ${user.role} ${user.uid} (${user.name})`,
      targetId: user.uid,
    });
    onAddAuditLog(log);
  };

  // Handler for Admin resending credentials via email
  const handleResendCredentials = async (user: UserProfile) => {
    const passToSend = user.password || dossierNewPassword || 'CAG@Secure2026';
    const emailResult = await sendOnboardingEmailMock({
      senderRole: 'Sovereign Administrator (Deep123)',
      senderEmail: currentUser.email || 'deepsingh02414@gmail.com',
      recipientEmail: user.email,
      recipientName: user.name,
      recipientRole: user.role,
      recipientCity: user.city || 'India',
      generatedUid: user.uid,
      generatedPassword: passToSend,
      extraDetails: user.department,
    });

    if (onAddDispatchedEmail) {
      onAddDispatchedEmail(emailResult);
    }

    setDossierActionMsg(`Credentials (UID: ${user.uid}, Password: ${passToSend}) dispatched to ${user.email}!`);
    setTimeout(() => setDossierActionMsg(''), 6000);
  };

  // Handler for Sending Direct Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageRecipient || !messageText.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderUid: currentUser.uid,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientUid: messageRecipient.uid,
      message: messageText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updated = sendDirectMessage(messageRecipient.uid, newMsg);
    onUpdateUsers(updated);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'DIRECT_DISPATCH_MESSAGE',
      details: `Dispatched directive message to ${messageRecipient.uid} (${messageRecipient.name})`,
      targetId: messageRecipient.uid,
    });
    onAddAuditLog(log);

    setMessageSentNotification(`Message dispatched successfully to ${messageRecipient.name}!`);
    setTimeout(() => {
      setMessageSentNotification('');
      setMessageRecipient(null);
      setMessageText('');
    }, 2000);
  };

  // Handler for Onboarding Auditor
  const handleCreateAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorName || !auditorEmail || !auditorCity) return;

    setIsSubmitting(true);
    const assignedUid = auditorUid.trim() || `AUD-${auditorCity.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalPassword = auditorPassword.trim() || generateTemporaryPassword();

    // 1. Dispatch official email using deepsingh02414@gmail.com
    const emailResult = await sendOnboardingEmailMock({
      senderRole: 'Sovereign Administrator (Deep123)',
      senderEmail: currentUser.email || 'deepsingh02414@gmail.com',
      recipientEmail: auditorEmail.trim().toLowerCase(),
      recipientName: auditorName.trim(),
      recipientRole: 'AUDITOR',
      recipientCity: auditorCity.trim(),
      generatedUid: assignedUid,
      generatedPassword: finalPassword,
      extraDetails: auditorDept,
    });

    if (onAddDispatchedEmail) {
      onAddDispatchedEmail(emailResult);
    }

    // 2. Add Auditor into dynamic state and database
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newAuditor: UserProfile = {
      id: `user-auditor-${Date.now()}`,
      uid: assignedUid,
      email: auditorEmail.trim().toLowerCase(),
      name: auditorName.trim(),
      role: 'AUDITOR',
      password: finalPassword,
      city: auditorCity.trim(),
      did: `did:suraksha:in:${assignedUid.toLowerCase()}-${randomHex.substring(0, 8)}`,
      walletAddress: '0x' + randomHex,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.uid,
      status: 'ACTIVE',
      isBlocked: false,
      department: auditorDept,
      badgeNumber: `CAG-${auditorCity.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      directMessages: [],
    };

    const updated = [...usersList, newAuditor];
    onUpdateUsers(updated);

    // 3. Record Audit Log
    const newLog = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'PROVISION_AUDITOR',
      details: `Provisioned Auditor ${auditorName} (${assignedUid}) for ${auditorCity}. Credentials dispatched to ${auditorEmail}.`,
      targetId: assignedUid,
    });
    onAddAuditLog(newLog);

    setIsSubmitting(false);
    setOnboardSuccess({
      ...emailResult,
      generatedPassword: finalPassword,
      generatedUid: assignedUid,
    });

    setToastMessage(`Auditor ${auditorName} successfully provisioned! Credentials dispatched to ${auditorEmail}.`);
    setTimeout(() => setToastMessage(null), 5000);

    setAuditorName('');
    setAuditorEmail('');
    setAuditorCity('');
    setAuditorUid('');
    setAuditorPassword(generateTemporaryPassword());
  };

  // Filtered lists based on search
  const q = searchQuery.toLowerCase().trim();

  const filteredAuditors = totalAuditors.filter((a) => {
    if (!q) return true;
    return (
      a.uid.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q)) ||
      a.email.toLowerCase().includes(q)
    );
  });

  const filteredOfficers = totalOfficers.filter((o) => {
    if (!q) return true;
    return (
      o.uid.toLowerCase().includes(q) ||
      o.name.toLowerCase().includes(q) ||
      (o.city && o.city.toLowerCase().includes(q)) ||
      o.email.toLowerCase().includes(q)
    );
  });

  const filteredUsers = totalUsers.filter((u) => {
    if (!q) return true;
    return (
      u.uid.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.city && u.city.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      u.walletAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Sovereign Master Control Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                Sovereign Root Authority
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Master Device Bound: Authorized
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sovereign Administrator Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Welcome, <span className="font-bold text-slate-900">Deep Singh (Deep123)</span>.
              Full centralized governance over auditors, verification officers, citizen accounts, and
              device-locked security.
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
              onClick={() => setShowOnboardModal(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Onboard Auditor</span>
            </button>
          </div>
        </div>

        {/* 3 Prominent Stat Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Statutory Auditors Registered */}
          <div
            onClick={() => setAdminTab('SEARCH_AUDITORS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'SEARCH_AUDITORS'
                ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase">Auditors Registered</span>
              <Building className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalAuditors.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Click to search and inspect auditors</div>
          </div>

          {/* Verification Officers Registered */}
          <div
            onClick={() => setAdminTab('SEARCH_OFFICERS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'SEARCH_OFFICERS'
                ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase">Verification Officers</span>
              <FileCheck className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalOfficers.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Click to search and inspect officers</div>
          </div>

          {/* Users / Citizens Registered */}
          <div
            onClick={() => setAdminTab('SEARCH_USERS')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              adminTab === 'SEARCH_USERS'
                ? 'bg-orange-50/70 border-orange-400 ring-2 ring-orange-400/20'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase">Registered Users</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalUsers.length}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Click to view uploads & block users</div>
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
            className="text-emerald-100 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setAdminTab('SEARCH_AUDITORS');
            setSearchQuery('');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'SEARCH_AUDITORS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Search Auditor ({totalAuditors.length})
        </button>

        <button
          onClick={() => {
            setAdminTab('SEARCH_OFFICERS');
            setSearchQuery('');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'SEARCH_OFFICERS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Search Verification Officer ({totalOfficers.length})
        </button>

        <button
          onClick={() => {
            setAdminTab('SEARCH_USERS');
            setSearchQuery('');
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'SEARCH_USERS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Search User ({totalUsers.length})
        </button>

        <button
          onClick={() => setAdminTab('AUDIT_LOGS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'AUDIT_LOGS'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Privilege Audit Chain ({auditLogs.length})
        </button>

        <button
          onClick={() => setAdminTab('DEVICE_LOCK')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'DEVICE_LOCK'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Device Security Lock</span>
        </button>
      </div>

      {/* SUB-VIEW 1: SEARCH AUDITOR */}
      {adminTab === 'SEARCH_AUDITORS' && (
        <div className="space-y-4">
          {/* Search bar & count */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auditor by UID, city name, or email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
              />
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredAuditors.length}</span> auditors
            </div>
          </div>

          {/* Auditors List Table / Cards */}
          {filteredAuditors.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Auditors Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No auditors match your search criteria. You can onboard an auditor using the button below.
                Credentials will be dispatched to their official email.
              </p>
              <button
                type="button"
                onClick={() => setShowOnboardModal(true)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Onboard First Auditor</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAuditors.map((auditor) => (
                <div
                  key={auditor.uid}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                    auditor.isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {auditor.uid}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{auditor.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>City: <strong className="text-slate-800">{auditor.city || 'Unassigned'}</strong></span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        auditor.isBlocked
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {auditor.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="truncate">Email: {auditor.email}</div>
                    <div className="truncate text-slate-500">Dept: {auditor.department || 'Statutory Audit Cell'}</div>
                  </div>

                  {/* Actions: Inspect Profile & Work, Message, Block, Delete */}
                  <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setInspectedUser(auditor)}
                      className="py-1.5 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Inspect Dossier & Manage Password"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageRecipient(auditor)}
                      className="py-1.5 px-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <Send className="w-3 h-3 text-orange-600" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBlock(auditor)}
                      className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        auditor.isBlocked
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                      }`}
                      title={auditor.isBlocked ? 'Unblock Auditor' : 'Block Auditor'}
                    >
                      <Lock className="w-3 h-3" />
                      <span>{auditor.isBlocked ? 'Unblock' : 'Block'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTarget(auditor)}
                      className="py-1.5 px-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Permanently Delete Account"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: SEARCH VERIFICATION OFFICER */}
      {adminTab === 'SEARCH_OFFICERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verification officer by UID, city name, or email..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
              />
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredOfficers.length}</span> officers
            </div>
          </div>

          {filteredOfficers.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
              <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Verification Officers Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Auditors can onboard Verification Officers from the Auditor portal, or officers can
                self-register on the Official RBAC Portal.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOfficers.map((officer) => (
                <div
                  key={officer.uid}
                  className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                    officer.isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {officer.uid}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">{officer.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>City: <strong className="text-slate-800">{officer.city || 'Unassigned'}</strong></span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        officer.isBlocked
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {officer.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="truncate">Email: {officer.email}</div>
                    <div className="truncate text-slate-500">Dept: {officer.department || 'Cyber Verification Cell'}</div>
                  </div>

                  {/* Actions: Inspect, Message, Block, Delete */}
                  <div className="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setInspectedUser(officer)}
                      className="py-1.5 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Inspect Officer Dossier & Manage Password"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                      <span>Inspect</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageRecipient(officer)}
                      className="py-1.5 px-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Send Message"
                    >
                      <Send className="w-3 h-3 text-orange-600" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleBlock(officer)}
                      className={`py-1.5 px-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
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
                      className="py-1.5 px-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Permanently Delete Account"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: SEARCH USER */}
      {adminTab === 'SEARCH_USERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizens by name, email, DID, or city..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
              />
            </div>

            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-800">{filteredUsers.length}</span> registered citizens
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Citizens Registered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Users can register themselves on the Citizen Portal to upload documents and add crypto wallets.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                // Find all assets and uploads belonging to this citizen
                const userAssets = vaultAssets.filter(
                  (a) => a.ownerDid === user.did || a.ownerWallet === user.walletAddress
                );
                const userUploads = user.uploadedDocuments || [];
                const userComplaints = escalationTickets.filter((t) => t.userEmail === user.email);

                return (
                  <div
                    key={user.uid}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all ${
                      user.isBlocked ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {user.uid}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-2">{user.name}</h3>
                        <div className="text-xs text-slate-500">City: <strong className="text-slate-800">{user.city || 'India'}</strong></div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          user.isBlocked
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </div>

                    {/* What user has uploaded & registered */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Citizen Vault Uploads:</span>
                        <span className="text-orange-600 font-mono">
                          {userAssets.length + userUploads.length} items
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-600">
                        <div>• Digital Bonds / Certificates: <strong>{userAssets.length}</strong></div>
                        <div>• Important Uploaded Docs: <strong>{userUploads.length}</strong></div>
                        <div>• Active Tamper Complaints: <strong>{userComplaints.length}</strong></div>
                      </div>
                      <div className="pt-1 border-t border-slate-200 text-[11px] font-mono text-slate-500 truncate">
                        Wallet: {user.walletAddress}
                      </div>
                    </div>

                    {/* Actions: View Uploads, Block User, Delete */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setInspectedUser(user)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleBlock(user)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                          user.isBlocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{user.isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTarget(user)}
                        className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Delete Citizen Account"
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

      {/* SUB-VIEW 4: PRIVILEGE AUDIT CHAIN */}
      {adminTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Immutable Privilege Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Cryptographic timestamped record of administrative actions, account blocks, and role verifications.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Total Events: {auditLogs.length}</span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">{log.actorUid}</span>
                    <span className="text-slate-400">({log.actorRole})</span>
                  </div>
                  <div className="text-slate-700">{log.details}</div>
                  <div className="font-mono text-[10px] text-slate-400 truncate">
                    TX: {log.txHash} • IP: {log.ipAddress}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: DEVICE SECURITY LOCK FOR DEEP123 */}
      {adminTab === 'DEVICE_LOCK' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hardware Device Binding Enforced</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Sovereign Administrator Device Security & Cryptographic Lock
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl">
              Under strict security mandates, the Sovereign Admin account (Deep123 / deepsingh02414@gmail.com)
              is locked exclusively to this designated physical master workstation using canvas and hardware
              fingerprinting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-orange-600" />
                <span>Authorized Master Workstation Signature</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 font-mono">
                <div>Device ID: <strong className="text-slate-900">{getMasterDeviceBinding()?.deviceId || 'DEV-FIPS-AUTHORIZED-01'}</strong></div>
                <div>Canvas Signature: <strong className="text-slate-900">{getMasterDeviceBinding()?.canvasHash || '0x9f4a8102'}</strong></div>
                <div>Screen Profile: <strong className="text-slate-900">{getMasterDeviceBinding()?.screenResolution || '1920x1080'}</strong></div>
                <div>Timezone / Locale: <strong className="text-slate-900">{getMasterDeviceBinding()?.timezone || 'Asia/Kolkata'}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Zero-Trust Physical Enclave Active</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                Any external browser or rogue device attempting to enter password <code>Deep@2414</code> will be
                immediately rejected with:
                <br />
                <span className="font-mono text-[11px] font-bold block mt-1 bg-white/70 p-1.5 rounded border border-emerald-300">
                  "Access Denied: Sovereign Admin login is locked exclusively to the designated master device."
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: INSPECT PROFILE & WORK */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                  {inspectedUser.role} DOSSIER
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">{inspectedUser.name}</h2>
                <div className="text-xs text-slate-500 font-mono">UID: {inspectedUser.uid} • City: {inspectedUser.city || 'India'}</div>
              </div>

              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Data */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>Email: <strong className="text-slate-900">{inspectedUser.email}</strong></div>
              <div>Status: <strong className={inspectedUser.isBlocked ? 'text-red-600' : 'text-emerald-600'}>{inspectedUser.isBlocked ? 'SUSPENDED' : 'ACTIVE'}</strong></div>
              <div>DID: <span className="font-mono text-[10px] text-slate-600 block truncate">{inspectedUser.did}</span></div>
              <div>Wallet: <span className="font-mono text-[10px] text-slate-600 block truncate">{inspectedUser.walletAddress}</span></div>
            </div>

            {/* If User: Show Uploaded Documents and Wallets */}
            {inspectedUser.role === 'USER' && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Citizen Uploaded Documents & Cryptographic Assets:
                </h4>
                {vaultAssets.filter(
                  (a) => a.ownerDid === inspectedUser.did || a.ownerWallet === inspectedUser.walletAddress
                ).length === 0 && (!inspectedUser.uploadedDocuments || inspectedUser.uploadedDocuments.length === 0) ? (
                  <div className="text-xs text-slate-500 p-4 rounded-lg bg-slate-50 text-center">
                    No documents uploaded yet by this citizen.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {vaultAssets
                      .filter(
                        (a) =>
                          a.ownerDid === inspectedUser.did || a.ownerWallet === inspectedUser.walletAddress
                      )
                      .map((asset) => (
                        <div
                          key={asset.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{asset.title}</div>
                            <div className="text-[11px] text-slate-500">
                              Type: {asset.assetType} • Issuer: {asset.issuerName}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            NFT Minted #{asset.nftTokenId}
                          </span>
                        </div>
                      ))}

                    {(inspectedUser.uploadedDocuments || []).map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{doc.title}</div>
                          <div className="text-[11px] text-slate-500">
                            Type: {doc.assetType} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {doc.fileSize}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* If Auditor / Officer: Show their Activity & Dispatches */}
            {inspectedUser.role !== 'USER' && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Official Verification Work & Audit Events:
                </h4>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                  <div>Department: <strong>{inspectedUser.department || 'Statutory Cell'}</strong></div>
                  <div>Account Created By: <strong>{inspectedUser.createdBy || 'Self-Registered'}</strong></div>
                  <div>Directives Received: <strong>{(inspectedUser.directMessages || []).length} messages</strong></div>
                </div>
              </div>
            )}

            {/* SECURITY CREDENTIALS & PASSWORD MANAGEMENT (Admin can set password & resend credentials) */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
                  <Key className="w-4 h-4 text-orange-600" />
                  <span>Security Credentials & Access Key Management</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleResendCredentials(inspectedUser)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-orange-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Current Password / Access Key
                  </span>
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-800 text-xs">
                      {showDossierPassword ? (inspectedUser.password || 'Deep@2026') : '••••••••••••'}
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
                    Assigned Account UID
                  </span>
                  <div className="font-mono font-bold text-orange-700 text-xs py-0.5">
                    {inspectedUser.uid}
                  </div>
                </div>
              </div>

              {/* Set New Password Option for Admin */}
              <div className="pt-2 border-t border-orange-200/60 flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={dossierNewPassword}
                    onChange={(e) => setDossierNewPassword(e.target.value)}
                    placeholder="Enter new password to assign to this account..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:border-orange-500 font-mono outline-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={!dossierNewPassword.trim()}
                  onClick={() => handleUpdatePasswordInDossier(inspectedUser)}
                  className="w-full sm:w-auto shrink-0 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save & Update Password
                </button>
              </div>
            </div>

            {/* Footer action controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(inspectedUser)}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBlock(inspectedUser);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    inspectedUser.isBlocked
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {inspectedUser.isBlocked ? 'Unblock Account' : 'Block & Suspend Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedUser(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DIRECT MESSAGE MODAL */}
      {messageRecipient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  Direct Sovereign Directive
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Message {messageRecipient.name} ({messageRecipient.uid})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMessageRecipient(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {messageSentNotification && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{messageSentNotification}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Directive / Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write official directive or instructions for ${messageRecipient.name}...`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMessageRecipient(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ONBOARD AUDITOR */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Sovereign Auditor Provisioning
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Onboard Statutory CAG Auditor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOnboardModal(false);
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
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Auditor Provisioned & Credentials Dispatched!</span>
                  </div>
                  <p>
                    Official onboarding email has been dispatched from{' '}
                    <strong>deepsingh02414@gmail.com</strong> to{' '}
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
                        `SurakshaSathi Auditor Credentials:\nUID: ${onboardSuccess.generatedUid}\nPassword: ${onboardSuccess.generatedPassword}\nPortal: Official RBAC Command Enclave`
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
                      setShowOnboardModal(false);
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
                      setShowOnboardModal(false);
                      setOnboardSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateAuditor} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Auditor Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="e.g. Dr. Sunita Sharma"
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
                    value={auditorCity}
                    onChange={(e) => setAuditorCity(e.target.value)}
                    placeholder="e.g. New Delhi, Mumbai, Kolkata, Bengaluru"
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
                    value={auditorEmail}
                    onChange={(e) => setAuditorEmail(e.target.value)}
                    placeholder="e.g. auditor.delhi@surakshasathi.gov.in"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    UID and password credentials will be dispatched to this email address automatically.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Assigned Auditor UID (Optional / Auto-Generated)
                  </label>
                  <input
                    type="text"
                    value={auditorUid}
                    onChange={(e) => setAuditorUid(e.target.value)}
                    placeholder="Leave empty to auto-generate e.g. AUD-DEL-4821"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 font-mono text-xs text-slate-900 outline-none"
                  />
                </div>

                {/* SET PASSWORD FOR AUDITOR FIELD */}
                <div className="space-y-1 bg-orange-50/70 p-3 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-orange-600" />
                      <span>Set Password for Auditor <span className="text-red-500">*</span></span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuditorPassword(generateTemporaryPassword())}
                      className="text-[11px] font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate Strong Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAuditorPassword ? 'text' : 'password'}
                      required
                      value={auditorPassword}
                      onChange={(e) => setAuditorPassword(e.target.value)}
                      placeholder="Enter login password for auditor"
                      className="w-full pl-3 pr-10 py-2 rounded-lg bg-white border border-slate-300 focus:border-orange-500 font-mono text-xs text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuditorPassword(!showAuditorPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showAuditorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600">
                    This password will be assigned to the Auditor and dispatched via the official sovereign mail service.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Department
                  </label>
                  <input
                    type="text"
                    value={auditorDept}
                    onChange={(e) => setAuditorDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Provisioning & Dispatching Email...' : 'Provision Auditor & Send Credentials Email'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM PERMANENT DELETE (Safe in-app modal, no window.confirm) */}
      {confirmDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">
                Permanently Delete Account?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You are about to permanently purge the <strong className="text-slate-800">{confirmDeleteTarget.role}</strong> account for{' '}
                <strong className="text-slate-900">{confirmDeleteTarget.name}</strong> ({confirmDeleteTarget.uid}).
              </p>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-left text-[11px] text-red-800 font-mono space-y-1 mt-2">
                <div>UID: {confirmDeleteTarget.uid}</div>
                <div>Email: {confirmDeleteTarget.email}</div>
                <div>Status: Purging cryptographic keys & access tokens</div>
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
