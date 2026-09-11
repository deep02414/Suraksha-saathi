import React, { useState, useEffect } from 'react';
import { X, UserPlus, Key, Mail, CheckCircle2, Shield } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { recordDispatchedEmail } from '../services/emailService';

interface OnboardOfficerModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onOfficerOnboarded: (newOfficer: UserProfile) => void;
}

export const OnboardOfficerModal: React.FC<OnboardOfficerModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onOfficerOnboarded,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const isAuditor = currentUser.role === 'AUDITOR';

  // Strict Hierarchy Check: Only Admin and Auditor are authorized to provision official accounts
  if (!isOpen || (!isAdmin && !isAuditor)) return null;

  // Admin strictly onboards AUDITOR; Auditor strictly onboards OFFICER
  const targetRole: UserRole = isAdmin ? 'AUDITOR' : 'OFFICER';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customUid, setCustomUid] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initialize fresh form with appropriate UID format prefix (no hardcoded demo accounts)
  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setCustomUid(`${isAdmin ? 'AUD' : 'OFF'}-${Math.floor(1000 + Math.random() * 9000)}`);
      setDepartment(
        isAdmin
          ? 'Comptroller & Auditor General (CAG) Statutory Ledger Oversight'
          : 'Land Revenue & Statutory Deeds Validation Cell'
      );
      setPassword('');
      setBadgeNumber('');
      setErrorMsg('');
      setSuccessToast(false);
    }
  }, [isOpen, isAdmin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !customUid.trim() || !password.trim()) {
      setErrorMsg('Please enter all mandatory fields (Full Name, Official Email, UID, Password).');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newOfficer: UserProfile = {
        id: `user-${targetRole.toLowerCase()}-${Date.now()}`,
        uid: customUid.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: targetRole,
        password: password.trim(),
        did: `did:suraksha:0x${randomHex.substring(0, 32)}`,
        walletAddress: '0x' + randomHex,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid,
        assignedAuditorId: isAuditor ? currentUser.uid : undefined,
        status: 'ACTIVE',
        department: department.trim(),
        badgeNumber: badgeNumber.trim(),
      };

      // Record simulated email dispatch with credentials
      recordDispatchedEmail({
        senderRole: currentUser.role,
        senderEmail: currentUser.email,
        recipientEmail: newOfficer.email,
        recipientName: newOfficer.name,
        recipientRole: newOfficer.role,
        generatedUid: newOfficer.uid,
        generatedPassword: password.trim(),
        subject: `[OFFICIAL MeitY] ${targetRole === 'AUDITOR' ? 'CAG Statutory Auditor' : 'Verification Officer'} Credential Issuance - UID: ${newOfficer.uid}`,
        previewBody: `Greetings ${newOfficer.name},\n\nYour sovereign clearance credentials have been officially generated under the Government of India Statutory Clearance System.\n\nClearance Role: ${newOfficer.role} (${targetRole === 'AUDITOR' ? 'Level 3 - Statutory Auditor' : 'Level 2 - Verification Officer'})\nAuthorized Custom UID: ${newOfficer.uid}\nHSM Security Key / Password: ${password.trim()}\nAssigned Department: ${newOfficer.department}\nBadge Identifier: ${newOfficer.badgeNumber || 'N/A'}\nAuthorized by: ${currentUser.name} (${currentUser.role})\n\nYou can now log in at the Official Officer Portal: https://surakshasathi.gov.in/officer-login`,
      });

      onOfficerOnboarded(newOfficer);
      setIsSubmitting(false);
      setSuccessToast(true);

      setTimeout(() => {
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isAdmin
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAdmin
                  ? 'Onboard CAG Statutory Auditor (Level 3)'
                  : 'Onboard Verification Officer (Level 2)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Admin authorizes CAG Auditor & dispatches credentials to their email'
                  : 'Auditor authorizes Verification Officer & dispatches credentials to their email'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hierarchy Rule Information Banner */}
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <Shield className="w-3.5 h-3.5 text-amber-700" />
            <span>Strict Statutory RBAC Hierarchy Mandate:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            {isAdmin ? (
              <span>
                • <strong>Admin Rule:</strong> Sovereign Admin only provisions CAG Statutory
                Auditors. The Auditor will subsequently create Verification Officers.
              </span>
            ) : (
              <span>
                • <strong>Auditor Rule:</strong> As CAG Statutory Auditor, you provision Verification
                Officers to inspect deed integrity and validate property records.
              </span>
            )}
          </p>
        </div>

        {successToast ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-sm text-emerald-900">
              Credentials Created & Dispatched!
            </h4>
            <p className="text-xs text-emerald-700">
              UID <strong>{customUid}</strong> and password have been stored in the database and
              sent to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Clearance
                </label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{targetRole === 'AUDITOR' ? 'CAG Auditor (Level 3)' : 'Verification Officer (Level 2)'}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      targetRole === 'AUDITOR'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    Enforced
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Official UID
                </label>
                <input
                  type="text"
                  value={customUid}
                  onChange={(e) => setCustomUid(e.target.value)}
                  required
                  placeholder={isAdmin ? 'AUD-9021' : 'OFF-4052'}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isAdmin ? 'e.g. Dr. Sunita Sharma' : 'e.g. Insp. Rajesh Kumar'}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Government Email (Recipient)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? 'cag.auditor@suraksha.gov.in' : 'officer.rajesh@suraksha.gov.in'}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department / Cell
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Temporary Password / Key
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password@123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
              <Mail className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold">Automated Email Dispatch Delivery:</div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Upon creation, credentials (UID & Password) will be stored in the database and
                  dispatched to <strong>{email || "the officer's email"}</strong>. They can immediately log in via the Officer Portal.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-lg text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors ${
                  isAdmin
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-[#1e3a8a] hover:bg-[#172554]'
                }`}
              >
                {isSubmitting ? (
                  <span>Saving & Dispatching Email...</span>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>
                      {isAdmin ? 'Issue Auditor Credentials' : 'Issue Officer Credentials'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
