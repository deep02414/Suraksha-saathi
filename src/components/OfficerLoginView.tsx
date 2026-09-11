import React, { useState } from 'react';
import {
  Key,
  Shield,
  FileCheck,
  Building,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  UserCheck,
  Laptop,
  Lock,
  Info,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';
import {
  verifyMasterDeviceAccess,
  getClientDeviceIdentifier,
  setSimulateExternalDevice,
  isSimulatingExternalDevice,
} from '../services/deviceSecurity';

interface OfficerLoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateHome: () => void;
  onNavigateCitizenLogin: () => void;
  onOpenEmailsModal: () => void;
  usersList: UserProfile[];
  onRegisterOfficer?: (user: UserProfile) => void;
}

export const OfficerLoginView: React.FC<OfficerLoginViewProps> = ({
  onLoginSuccess,
  onNavigateHome,
  onNavigateCitizenLogin,
  onOpenEmailsModal,
  usersList,
}) => {
  // Manual credential input state - strictly empty by default (NO autofill)
  const [officerEmailOrUid, setOfficerEmailOrUid] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [officerError, setOfficerError] = useState('');
  const [deviceLockError, setDeviceLockError] = useState<string | null>(null);

  // Device simulation state for testing/demonstrating device lock
  const [simulatedExternal, setSimulatedExternal] = useState(isSimulatingExternalDevice());

  const handleToggleSimulation = () => {
    const nextState = !simulatedExternal;
    setSimulatedExternal(nextState);
    setSimulateExternalDevice(nextState);
    setDeviceLockError(null);
    setOfficerError('');
  };

  // Submit RBAC Official Portal Manual Login
  const handleOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOfficerError('');
    setDeviceLockError(null);

    const input = officerEmailOrUid.trim();
    const inputLower = input.toLowerCase();
    const enteredPassword = officerPassword;

    if (!input) {
      setOfficerError('Please enter your Official Login ID or Registered Email.');
      return;
    }
    if (!enteredPassword) {
      setOfficerError('Please enter your Security Password.');
      return;
    }

    // 1. Check Sovereign Admin Login (Deep123 / deepsingh02414@gmail.com)
    const isAdminAttempt =
      input === 'Deep123' ||
      inputLower === 'deepsingh02414@gmail.com' ||
      inputLower === 'deep123';

    if (isAdminAttempt) {
      // Validate Admin Password
      if (enteredPassword !== 'Deep@2414') {
        setOfficerError('Authentication Failed: Invalid Security Password for Sovereign Admin Deep123.');
        return;
      }

      // Check Hard Device Fingerprint & Storage Binding
      const deviceCheck = verifyMasterDeviceAccess();
      if (!deviceCheck.isAuthorized) {
        setDeviceLockError(
          deviceCheck.errorMessage ||
            'Access Denied: Sovereign Admin login is locked exclusively to the designated master device.'
        );
        return;
      }

      // Successful Admin Authentication
      const adminUser = usersList.find((u) => u.uid === 'Deep123') || {
        id: 'admin-master-deep123',
        uid: 'Deep123',
        email: 'deepsingh02414@gmail.com',
        name: 'Deep Singh',
        role: 'ADMIN' as UserRole,
        password: 'Deep@2414',
        did: 'did:suraksha:in:deep123-master-root',
        walletAddress: '0xDEEP02414777a829102938401928340192834019',
        createdAt: '2026-01-01T00:00:00Z',
        status: 'ACTIVE' as const,
        isBlocked: false,
        city: 'New Delhi',
        department: 'MeitY Sovereign Blockchain Operations & Root Authority',
      };

      onLoginSuccess(adminUser);
      return;
    }

    // 2. Validate against stored database records for Auditor / Verification Officer
    const found = usersList.find(
      (u) =>
        u.role !== 'USER' &&
        (u.email.toLowerCase() === inputLower || u.uid.toLowerCase() === inputLower)
    );

    if (!found) {
      setOfficerError(
        'Authentication Failed: No registered official account found with this UID / Email. Official RBAC clearance credentials are provisioned strictly through the administrative hierarchy (Admin creates Auditors, Auditors create Verification Officers). Self-registration is disabled.'
      );
      return;
    }

    // Check if account has been blocked/suspended by Sovereign Admin
    if (found.isBlocked || found.status === 'SUSPENDED') {
      setOfficerError(
        `Access Denied: Your account (${found.uid}) has been suspended by the Sovereign Administrator (Deep123). Please contact MeitY Root SOC.`
      );
      return;
    }

    // Validate Password
    if (found.password && enteredPassword !== found.password) {
      setOfficerError('Authentication Failed: Incorrect Security Password. Please re-enter.');
      return;
    }

    // Successful Login
    onLoginSuccess(found);
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
              onClick={onNavigateCitizenLogin}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen Portal Login →</span>
            </button>
          </div>

          {/* Logos */}
          <div className="space-y-3">
            <SurakshaLogo variant="light" size="lg" />
            <div className="flex items-center gap-2">
              <DigitalIndiaBadge size="sm" />
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                Official RBAC Clearance Center
              </span>
            </div>
          </div>

          {/* Context Overview */}
          <div className="space-y-4 pt-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Sovereign Role-Based Access Control (RBAC) Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Authorized government verification personnel, statutory auditors, and sovereign
              administrators must manually authenticate using designated credentials and hardware
              device tokens.
            </p>

            {/* Official roles breakdown */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-700 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">Sovereign Administrator (Deep123)</div>
                  <div className="text-slate-600">
                    Master root control, auditor account provisioning, global privilege oversight,
                    and device hardware binding.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">CAG Statutory Auditor</div>
                  <div className="text-slate-600">
                    Statutory oversight, verification officer account creation, inspection of case
                    verdicts, and forensic audit signing.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">Document Verification Officer</div>
                  <div className="text-slate-600">
                    Direct citizen dispute resolution, verifying tampered documents against authentic
                    records, and forwarding reports to Auditors.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="pt-8 border-t border-slate-200 flex flex-col gap-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-[11px]">Device: {getClientDeviceIdentifier().substring(0, 16)}...</span>
            </div>
            <button
              type="button"
              onClick={onOpenEmailsModal}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Official Outbox Dispatches</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Protected under IT Act 2000 § 65B & FIPS 140-2 Level 3 cryptographic hardware isolation.
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication & Manual Login Form */}
      <div className="w-full lg:w-[56%] p-6 sm:p-10 lg:p-14 flex flex-col justify-center bg-white">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Form Title & Hierarchy Notice */}
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                <Key className="w-3 h-3 text-orange-600" />
                <span>Manual Credential Authentication</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Official Portal Sign In
              </h2>
              <p className="text-xs text-slate-600">
                Enter your assigned Official Login ID / Registered Email and security passcode.
              </p>
            </div>

            {/* Statutory Hierarchy Notice Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Shield className="w-3.5 h-3.5 text-orange-600" />
                <span>Statutory RBAC Hierarchy Mandate:</span>
              </div>
              <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                <p>
                  • <strong>Sovereign Administrator:</strong> Provisions and authorizes CAG Statutory Auditors.
                </p>
                <p>
                  • <strong>CAG Statutory Auditors:</strong> Provision and assign Verification Officers.
                </p>
                <p className="text-slate-500 font-medium">
                  Public self-registration for official clearance roles is strictly disabled.
                </p>
              </div>
            </div>
          </div>

          {/* Hardware Device Lock Warning Modal / Banner if triggered */}
          {deviceLockError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>DEVICE HARDWARE VIOLATION</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed font-semibold">
                {deviceLockError}
              </p>
              <div className="text-[11px] text-red-600 bg-white/80 p-2.5 rounded-lg border border-red-200">
                The Sovereign Administrator account (Deep123) is cryptographically locked to the
                designated physical hardware workstation. External access attempts from this browser
                have been terminated.
              </div>
            </div>
          )}

          {/* General Login Error */}
          {officerError && !deviceLockError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{officerError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleOfficerSubmit} className="space-y-4">
            {/* Official UID / Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Login ID / Registered Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={officerEmailOrUid}
                  onChange={(e) => setOfficerEmailOrUid(e.target.value)}
                  placeholder="e.g. Deep123, AUD-DEL-102, or officer email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Security Password / HSM Passcode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={officerPassword}
                  onChange={(e) => setOfficerPassword(e.target.value)}
                  placeholder="Enter security password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs text-slate-900 font-medium transition-all outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Authenticate & Enter RBAC Portal</span>
            </button>
          </form>

          {/* Security Testing Helper for Device Locking */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="font-semibold flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-orange-600" />
                Device Lock Simulation Test:
              </span>
              <button
                type="button"
                onClick={handleToggleSimulation}
                className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  simulatedExternal
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {simulatedExternal ? 'Simulating: Unauthorized Device' : 'Simulating: Authorized Device'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Click toggle above to test device-locking logic. When set to "Unauthorized Device",
              attempts to log into Deep123 will be rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
