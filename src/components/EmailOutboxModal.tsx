import React, { useState } from 'react';
import { DispatchedEmail } from '../types';
import { Mail, Copy, Check, Shield, Clock, ExternalLink, X } from 'lucide-react';

interface EmailOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: DispatchedEmail[];
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({
  isOpen,
  onClose,
  emails,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(emails[0] || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#060e1a] border-2 border-[#00BFFF] rounded-xl shadow-[0_0_40px_rgba(0,191,255,0.3)] overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b172a] border-b border-[#00BFFF]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#00BFFF]" />
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">
                सुरक्षा साथी NodeMailer Onboarding Dispatch Outbox
              </h3>
              <p className="text-xs text-[#87CEEB]">
                Secure credential transmission logs: Admin → Auditor and Auditor → Verification Officer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#87CEEB] hover:text-[#FFFFFF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content split pane */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#87CEEB]/20">
          {/* Email list */}
          <div className="overflow-y-auto p-4 space-y-2 max-h-[400px] md:max-h-[600px]">
            <div className="text-[11px] font-bold text-[#87CEEB] uppercase mb-2">
              Dispatched Emails ({emails.length})
            </div>
            {emails.map((mail) => (
              <div
                key={mail.id}
                onClick={() => setSelectedEmail(mail)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedEmail?.id === mail.id
                    ? 'border-[#00BFFF] bg-[#00BFFF]/10'
                    : 'border-[#87CEEB]/20 bg-[#071326] hover:border-[#87CEEB]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                      mail.recipientRole === 'AUDITOR'
                        ? 'border-[#00BFFF] text-[#00BFFF]'
                        : 'border-[#2E8B57] text-[#00FF00]'
                    }`}
                  >
                    {mail.recipientRole}
                  </span>
                  <span className="text-[10px] text-[#87CEEB]">
                    {new Date(mail.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-bold text-[#FFFFFF] truncate">{mail.recipientName}</div>
                <div className="text-[11px] text-[#87CEEB] truncate">{mail.recipientEmail}</div>
                <div className="font-mono text-[10px] text-[#FFA500] mt-1">
                  UID: {mail.generatedUid}
                </div>
              </div>
            ))}
          </div>

          {/* Email Preview Pane */}
          <div className="md:col-span-2 p-6 overflow-y-auto space-y-4">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="border-b border-[#87CEEB]/20 pb-3">
                  <div className="text-xs text-[#87CEEB]">Subject:</div>
                  <div className="text-sm font-bold text-[#FFFFFF] mt-0.5">
                    {selectedEmail.subject}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[#87CEEB] mt-2">
                    <div>
                      <strong className="text-[#FFFFFF]">From:</strong> {selectedEmail.senderRole} (
                      {selectedEmail.senderEmail})
                    </div>
                    <div>
                      <strong className="text-[#FFFFFF]">To:</strong> {selectedEmail.recipientName} (
                      {selectedEmail.recipientEmail})
                    </div>
                  </div>
                </div>

                {/* Quick copy credentials card */}
                <div className="p-3 rounded-lg border border-[#FFA500]/40 bg-[#FFA500]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-[#FFA500]">Generated Authorized Credentials:</div>
                    <div className="font-mono">
                      <span className="text-[#87CEEB]">UID: </span>
                      <strong className="text-[#FFFFFF]">{selectedEmail.generatedUid}</strong>
                      <span className="mx-2 text-[#87CEEB]">•</span>
                      <span className="text-[#87CEEB]">Password: </span>
                      <strong className="text-[#00FF00]">{selectedEmail.generatedPassword}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `UID: ${selectedEmail.generatedUid}\nPassword: ${selectedEmail.generatedPassword}`,
                          'creds'
                        )
                      }
                      className="px-2.5 py-1 rounded bg-[#0b172a] border border-[#FFA500] text-[#FFA500] font-bold text-[11px] hover:bg-[#FFA500]/20 flex items-center gap-1"
                    >
                      {copiedKey === 'creds' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00FF00]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-4 rounded-lg bg-[#071326] border border-[#87CEEB]/20 text-xs font-mono text-[#FFFFFF] whitespace-pre-wrap leading-relaxed">
                  {selectedEmail.previewBody}
                </div>

                <div className="text-[11px] text-[#87CEEB] flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#00FF00]" />
                  <span>
                    Status: DELIVERED via Simulated NodeMailer SMTP Relay at{' '}
                    {new Date(selectedEmail.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#87CEEB] text-xs">
                Select an email from the list to view the dispatch template.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
