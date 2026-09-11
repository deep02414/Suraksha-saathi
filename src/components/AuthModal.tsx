import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Shield, Lock, User, Wallet, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  usersList: UserProfile[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  usersList,
}) => {
  // Tab: 'CITIZEN' (has Create Account) vs 'OFFICIAL' (Strictly direct login, NO signup)
  const [activePortal, setActivePortal] = useState<'CITIZEN' | 'OFFICIAL'>('OFFICIAL');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // only allowed in CITIZEN mode

  // Form states
  const [identifier, setIdentifier] = useState('Deep123'); // email or UID
  const [password, setPassword] = useState('Deep@2414');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePortalSwitch = (portal: 'CITIZEN' | 'OFFICIAL') => {
    setActivePortal(portal);
    setIsRegisterMode(false);
    setErrorMsg('');
    setSuccessMsg('');
    if (portal === 'OFFICIAL') {
      setIdentifier('Deep123');
      setPassword('Deep@2414');
    } else {
      setIdentifier('vikram.mehta@vault.in');
      setPassword('User@2026');
    }
  };

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Check pre-provisioned credentials in usersList
    const cleanId = identifier.trim().toLowerCase();
    const matched = usersList.find(
      (u) =>
        u.role !== 'USER' &&
        (u.uid.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId)
    );

    if (!matched) {
      setErrorMsg(
        'Authentication Failed: Unauthorized UID or Email. Access is strictly restricted to pre-provisioned official credentials.'
      );
      return;
    }

    // Verify password simulation
    if (
      (matched.uid === 'Deep123' && password === 'Deep@2414') ||
      (matched.uid === 'AUD-9021' && (password === 'Auditor@2026' || password.length >= 6)) ||
      (matched.uid === 'OFF-4052' && (password === 'Officer@2026' || password.length >= 6)) ||
      (password.length >= 6) // newly provisioned credentials
    ) {
      setSuccessMsg(`Welcome, ${matched.name}. Initializing authenticated session...`);
      setTimeout(() => {
        onLoginSuccess(matched);
        onClose();
      }, 700);
    } else {
      setErrorMsg('Invalid password. Please enter your authorized security key.');
    }
  };

  const handleCitizenAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      // Citizen Registration: Strictly creates USER role
      if (!name.trim() || !email.trim()) {
        setErrorMsg('Please enter your full legal name and email address.');
        return;
      }
      const newUid = 'USR-' + Math.floor(1000 + Math.random() * 9000);
      const randomHex = Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        uid: newUid,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        role: 'USER',
        did: `did:suraksha:in:usr-${newUid.toLowerCase()}-${randomHex.slice(0, 8)}`,
        walletAddress: '0x' + randomHex,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        department: 'Public Citizen Vault',
      };

      setSuccessMsg(`Account created successfully! Assigned UID: ${newUid}`);
      setTimeout(() => {
        onLoginSuccess(newUser);
        onClose();
      }, 800);
    } else {
      // Citizen Login
      const cleanId = identifier.trim().toLowerCase();
      const matched = usersList.find(
        (u) =>
          u.role === 'USER' &&
          (u.uid.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId)
      );

      if (matched) {
        setSuccessMsg(`Welcome back, ${matched.name}. Unlocking digital vault...`);
        setTimeout(() => {
          onLoginSuccess(matched);
          onClose();
        }, 700);
      } else {
        // Allow public demo access with entered email
        const newUid = 'USR-' + Math.floor(1000 + Math.random() * 9000);
        const randomHex = Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        const demoUser: UserProfile = {
          id: `user-${Date.now()}`,
          uid: newUid,
          email: identifier.includes('@') ? identifier : `${identifier}@vault.in`,
          name: identifier.split('@')[0],
          role: 'USER',
          did: `did:suraksha:in:usr-${randomHex.slice(0, 8)}`,
          walletAddress: '0x' + randomHex,
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          department: 'Public Citizen Vault',
        };
        onLoginSuccess(demoUser);
        onClose();
      }
    }
  };

  const handleConnectWeb3 = () => {
    setWalletConnected(true);
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newUid = 'USR-' + Math.floor(1000 + Math.random() * 9000);
    const web3User: UserProfile = {
      id: `user-web3-${Date.now()}`,
      uid: newUid,
      email: `0x${randomHex.slice(0, 6)}...@web3.vault`,
      name: `Web3 Signer (${randomHex.slice(0, 6)})`,
      role: 'USER', // Strictly USER role
      did: `did:suraksha:in:0x${randomHex.slice(0, 10)}`,
      walletAddress: '0x' + randomHex,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      department: 'Decentralized Identity Signer',
    };
    setSuccessMsg('Web3 Wallet Connected & DID Verified!');
    setTimeout(() => {
      onLoginSuccess(web3User);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#060e1a] border-2 border-[#00BFFF] rounded-xl shadow-[0_0_30px_rgba(0,191,255,0.25)] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0b172a] border-b border-[#00BFFF]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-[#00BFFF]" />
            <div>
              <h2 className="text-lg font-bold text-[#FFFFFF]">सुरक्षा साथी Authentication</h2>
              <p className="text-xs text-[#87CEEB]">Role-Based Access Control Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#87CEEB] hover:text-[#FFFFFF] hover:bg-[#87CEEB]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Type Tabs */}
        <div className="grid grid-cols-2 border-b border-[#00BFFF]/30 bg-[#071326]">
          <button
            onClick={() => handlePortalSwitch('OFFICIAL')}
            className={`py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activePortal === 'OFFICIAL'
                ? 'bg-[#0b172a] text-[#FFA500] border-b-2 border-[#FFA500]'
                : 'text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Officer & Admin Portal</span>
          </button>

          <button
            onClick={() => handlePortalSwitch('CITIZEN')}
            className={`py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activePortal === 'CITIZEN'
                ? 'bg-[#0b172a] text-[#00BFFF] border-b-2 border-[#00BFFF]'
                : 'text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Citizen / Public Vault</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg border border-[#FFA500] bg-[#FFA500]/10 text-xs text-[#FFA500] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg border border-[#2E8B57] bg-[#2E8B57]/20 text-xs text-[#00FF00] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* OFFICIAL PORTAL FORM */}
          {activePortal === 'OFFICIAL' && (
            <div>
              <div className="mb-4 p-3 rounded-lg border border-[#00BFFF]/30 bg-[#00BFFF]/5 text-xs text-[#87CEEB]">
                <p className="font-bold text-[#FFFFFF] mb-1">STRICT ACCESS SECURITY POLICY:</p>
                <p>
                  No public sign-up or registration exists for Officers, Auditors, or Admins.
                  Access is strictly authorized via direct login using pre-provisioned credentials.
                </p>
              </div>

              {/* Quick Bootstrap Fill Buttons */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-[11px] text-[#87CEEB] w-full font-bold">Quick Provisioned Credentials:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('Deep123');
                    setPassword('Deep@2414');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded border border-[#FFA500] text-[#FFA500] bg-[#FFA500]/10 hover:bg-[#FFA500]/20"
                >
                  Admin (Deep123 / Deep@2414)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('AUD-9021');
                    setPassword('Auditor@2026');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded border border-[#00BFFF] text-[#00BFFF] bg-[#00BFFF]/10 hover:bg-[#00BFFF]/20"
                >
                  Auditor (AUD-9021)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('OFF-4052');
                    setPassword('Officer@2026');
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold rounded border border-[#2E8B57] text-[#00FF00] bg-[#2E8B57]/20 hover:bg-[#2E8B57]/30"
                >
                  Officer (OFF-4052)
                </button>
              </div>

              <form onSubmit={handleOfficialLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    OFFICER UID OR AUTHORIZED EMAIL
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. Deep123 or deepsingh02414@gmail.com"
                    required
                    className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFA500] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    ACCESS PASSWORD / SECURITY KEY
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    required
                    className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-sm text-[#FFFFFF] focus:outline-none focus:border-[#FFA500] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#FFA500] text-[#060e1a] font-bold rounded-lg hover:bg-[#FFA500]/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter Secure Portal</span>
                </button>
              </form>
            </div>
          )}

          {/* CITIZEN PORTAL FORM */}
          {activePortal === 'CITIZEN' && (
            <div>
              {/* Toggle Login vs Create Account */}
              <div className="flex items-center justify-between mb-4 border-b border-[#87CEEB]/20 pb-3">
                <span className="text-xs text-[#87CEEB]">
                  {isRegisterMode ? 'Already registered?' : 'New citizen user?'}
                </span>
                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-bold text-[#00BFFF] hover:underline"
                >
                  {isRegisterMode ? 'Sign In to Vault' : 'Create Public Account'}
                </button>
              </div>

              {/* Web3 Connect Option */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleConnectWeb3}
                  className="w-full py-2 px-4 rounded-lg border border-[#00BFFF] bg-[#00BFFF]/10 text-[#00BFFF] hover:bg-[#00BFFF]/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-[#00BFFF]" />
                  <span>Connect Web3 Wallet / Decentralized ID (DID)</span>
                </button>
                <div className="relative my-3 text-center">
                  <span className="bg-[#060e1a] px-2 text-[10px] text-[#87CEEB] uppercase">
                    or standard citizen login
                  </span>
                </div>
              </div>

              <form onSubmit={handleCitizenAuth} className="space-y-3">
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                      FULL LEGAL NAME
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Mehta"
                      required
                      className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-sm text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    {isRegisterMode ? 'EMAIL ADDRESS' : 'EMAIL ID OR CITIZEN UID'}
                  </label>
                  <input
                    type={isRegisterMode ? 'email' : 'text'}
                    value={isRegisterMode ? email : identifier}
                    onChange={(e) =>
                      isRegisterMode ? setEmail(e.target.value) : setIdentifier(e.target.value)
                    }
                    placeholder="vikram.mehta@vault.in"
                    required
                    className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-sm text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                    {isRegisterMode ? 'CREATE VAULT PASSWORD' : 'PASSWORD'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-sm text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#00BFFF] text-[#060e1a] font-bold rounded-lg hover:bg-[#87CEEB] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>{isRegisterMode ? 'Register Citizen Vault' : 'Access Digital Vault'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
