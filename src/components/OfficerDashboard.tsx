import React, { useState } from 'react';
import { UserProfile, EscalationTicket, SystemAuditLog, VaultAsset } from '../types';
import { recordAuditLog } from '../services/store';
import {
  FileCheck,
  FileX,
  AlertOctagon,
  ShieldCheck,
  Send,
  Eye,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  ZoomIn,
  CheckCircle2,
  AlertTriangle,
  Building,
  FileText,
  X,
  Download,
  Share2,
} from 'lucide-react';

interface OfficerDashboardProps {
  currentUser: UserProfile;
  escalationTickets: EscalationTicket[];
  onUpdateTickets: (tickets: EscalationTicket[]) => void;
  vaultAssets: VaultAsset[];
  onUpdateAssets: (assets: VaultAsset[]) => void;
  auditLogs: SystemAuditLog[];
  onAddAuditLog: (log: SystemAuditLog) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  escalationTickets,
  onUpdateTickets,
  vaultAssets,
  onUpdateAssets,
  auditLogs,
  onAddAuditLog,
}) => {
  // Selected complaint / ticket to review and fix
  const [selectedTicket, setSelectedTicket] = useState<EscalationTicket | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [statusNotification, setStatusNotification] = useState('');

  // Filtered tickets
  const displayedTickets = escalationTickets.filter((t) => {
    if (filterStatus === 'PENDING') {
      return t.status === 'PENDING_OFFICER_REVIEW';
    }
    if (filterStatus === 'RESOLVED') {
      return t.status === 'RESOLVED_APPROVED' || t.status === 'RESOLVED_REJECTED';
    }
    return true;
  });

  // Action 1: Verify & Send Original Document to User
  const handleVerifyAndSendOriginalToUser = (ticket: EscalationTicket) => {
    // Locate the authentic original document from vault assets or presets
    const matchingAsset = vaultAssets.find(
      (a) =>
        a.title.toLowerCase().includes('bond') ||
        a.title.toLowerCase().includes('degree') ||
        a.title.toLowerCase().includes('certificate') ||
        a.documentHash === ticket.documentHash
    ) || vaultAssets[0];

    const authenticDocUrl =
      ticket.originalDocumentUrl ||
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';

    const resolutionComment =
      officerNote.trim() ||
      `Official Verification Verdict: The uploaded document showed ${ticket.tamperPercentage}% unauthorized modifications. We have verified your authentic vault record and dispatched the original cryptographic document back to your Citizen Vault.`;

    const updated = escalationTickets.map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: 'RESOLVED_APPROVED' as const,
          officerId: currentUser.uid,
          officerName: currentUser.name,
          officerComments: resolutionComment,
          resolvedDocumentUrl: authenticDocUrl,
          officerResolvedAt: new Date().toISOString(),
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
      action: 'RESOLVE_AND_SEND_ORIGINAL_TO_USER',
      details: `Verification Officer ${currentUser.name} verified tampered ticket ${ticket.ticketNumber} and sent authentic original document to user ${ticket.userName} (${ticket.userEmail}).`,
      targetId: ticket.id,
    });
    onAddAuditLog(log);

    setStatusNotification(
      `Dispute Resolved! Authentic original document and verification certificate dispatched to citizen ${ticket.userName}.`
    );

    setTimeout(() => {
      setStatusNotification('');
      setSelectedTicket(null);
      setOfficerNote('');
    }, 2500);
  };

  // Action 2: Send Information & Dossier to Auditor
  const handleSendInfoToAuditor = (ticket: EscalationTicket) => {
    const updated = escalationTickets.map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          sentToAuditor: true,
          status: 'ESCALATED_TO_AUDITOR' as const,
          officerId: currentUser.uid,
          officerName: currentUser.name,
          officerComments:
            officerNote.trim() ||
            t.officerComments ||
            `Officer verified tamper anomalies (${t.tamperPercentage}% rate). Forwarding complete case file to CAG Auditor for statutory inspection.`,
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
      action: 'SEND_INFORMATION_TO_AUDITOR',
      details: `Verification Officer ${currentUser.name} forwarded case dossier ${ticket.ticketNumber} to CAG Auditor queue.`,
      targetId: ticket.id,
    });
    onAddAuditLog(log);

    setStatusNotification(
      `Case Dossier & Tamper Evidence successfully forwarded to the CAG Statutory Auditor!`
    );

    setTimeout(() => {
      setStatusNotification('');
      setSelectedTicket(null);
      setOfficerNote('');
    }, 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner: Verification Officer Resolution Center */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                Document Verification & Dispute Resolution
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                Station: {currentUser.city || 'Regional Unit'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Citizen Tamper Complaint Resolution Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Welcome, <span className="font-bold text-slate-900">{currentUser.name}</span> ({currentUser.uid}).
              Your primary mandate is to verify tampered documents reported by citizens, send back their authentic
              original documents, and forward case dossiers to the CAG Auditor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold font-mono">
              Pending Queue: {displayedTickets.length} cases
            </span>
          </div>
        </div>

        {/* Status notification toast */}
        {statusNotification && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotification}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-600">Filter Disputes:</span>
          <button
            type="button"
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'PENDING'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pending Review ({escalationTickets.filter((t) => t.status === 'PENDING_OFFICER_REVIEW').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('RESOLVED')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'RESOLVED'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Resolved Cases ({escalationTickets.filter((t) => t.status.startsWith('RESOLVED')).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Tickets ({escalationTickets.length})
          </button>
        </div>
      </div>

      {/* COMPLAINTS QUEUE */}
      {displayedTickets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">Dispute Queue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No citizen complaints currently pending review in this queue. When a user uploads a document
            flagged as tampered by the AI detector and requests assistance, their complaint will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayedTickets.map((ticket) => (
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
                  <div className="text-xs text-slate-500">
                    Complainant: <strong className="text-slate-800">{ticket.userName}</strong> ({ticket.userEmail})
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.tamperPercentage > 50
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {ticket.tamperPercentage}% Tampered
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Analysis Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-700">
                <div className="font-bold text-slate-900">AI Forensic Tamper Anomaly:</div>
                <p className="line-clamp-2 text-slate-600">{ticket.analysisSummary}</p>
              </div>

              {/* Resolution status badge */}
              {ticket.resolvedDocumentUrl && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Original Document Restored & Sent to User</span>
                </div>
              )}

              {/* Officer Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Status: <strong className="text-slate-800">{ticket.status}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setOfficerNote(ticket.officerComments || '');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Fix Issue</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: INSPECT, VERIFY & SEND ORIGINAL DOCUMENT TO CITIZEN */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 border border-slate-200 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                  OFFICIAL DISPUTE RESOLUTION
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  Fix Citizen Complaint: {selectedTicket.ticketNumber}
                </h2>
                <div className="text-xs text-slate-500">
                  Citizen: <strong>{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) • DID: {selectedTicket.userDid}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SIDE-BY-SIDE FORENSIC COMPARISON: Tampered Upload vs Original Authentic Record */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Tampered Document (Reported by Citizen) */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Reported Tampered Document</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                    {selectedTicket.tamperPercentage}% Tampered
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">{selectedTicket.documentName}</div>
                <div className="aspect-video bg-white rounded-lg border border-red-200 overflow-hidden relative flex items-center justify-center">
                  <img
                    src={selectedTicket.previewUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'}
                    alt="Tampered preview"
                    className="object-cover w-full h-full opacity-80"
                  />
                  <div className="absolute inset-0 bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xs">
                      Altered Font Kerning & Seal
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-mono truncate">
                  Hash: {selectedTicket.documentHash}
                </div>
              </div>

              {/* Box 2: Authentic Original Record from Sovereign Database */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Original Authentic Record (Vault)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    100% Authentic
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs truncate">
                  Verified_Original_{selectedTicket.documentName}
                </div>
                <div className="aspect-video bg-white rounded-lg border border-emerald-200 overflow-hidden relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
                    alt="Authentic record preview"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    Blockchain Anchored
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-mono truncate">
                  Status: VERIFIED_SOVEREIGN_RECORD
                </div>
              </div>
            </div>

            {/* Officer Resolution Notes Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Official Verification Notes & User Resolution Message:
              </label>
              <textarea
                rows={3}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                placeholder="Write resolution notes to citizen explaining the verified authentic record..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            {/* Action Bar: Send Original Document to User & Send Info to Auditor */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleSendInfoToAuditor(selectedTicket)}
                className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Send Information to Auditor</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyAndSendOriginalToUser(selectedTicket)}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Send Original Document to User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
