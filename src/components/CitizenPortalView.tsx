import React, { useState } from 'react';
import {
  LayoutDashboard,
  Cpu,
  Fingerprint,
  Layers,
  PlusCircle,
  FileCheck2,
  History,
  Activity,
  Settings,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  X,
  Upload,
  Wallet,
  AlertTriangle,
  Download,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { UserProfile, VaultAsset, EscalationTicket, UserUploadedDocument } from '../types';
import { SurakshaLogo, DigitalIndiaBadge } from './SurakshaLogo';
import { addDocumentToUserProfile } from '../services/store';

interface CitizenPortalViewProps {
  currentUser: UserProfile;
  assets: VaultAsset[];
  escalationTickets?: EscalationTicket[];
  onOpenRegisterAsset: () => void;
  onOpenVerify: () => void;
  onOpenAiDetector: () => void;
  onOpenLedger: () => void;
  onUpdateCurrentUser?: (user: UserProfile) => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  currentUser,
  assets,
  escalationTickets = [],
  onOpenRegisterAsset,
  onOpenVerify,
  onOpenAiDetector,
  onOpenLedger,
  onUpdateCurrentUser,
}) => {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'MY_ASSETS' | 'UPLOAD_DOCS' | 'RESTORED_DISPUTES' | 'WALLETS'
  >('DASHBOARD');
  const [copiedDid, setCopiedDid] = useState(false);
  const [showToast, setShowToast] = useState(true);

  // Document Upload State
  const [uploadDocTitle, setUploadDocTitle] = useState('');
  const [uploadDocType, setUploadDocType] = useState('Land Title Deed');
  const [uploadIssuer, setUploadIssuer] = useState('Govt of India');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Wallet State
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');

  const citizenAssets = assets.filter(
    (a) => a.ownerDid === currentUser.did || a.ownerWallet === currentUser.walletAddress
  );

  const userTickets = escalationTickets.filter(
    (t) => t.userEmail === currentUser.email || t.userDid === currentUser.did
  );

  const userUploadedDocs = currentUser.uploadedDocuments || [];
  const userWallets = currentUser.registeredWallets || [currentUser.walletAddress];

  const handleCopyDid = () => {
    navigator.clipboard.writeText(currentUser.did);
    setCopiedDid(true);
    setTimeout(() => setCopiedDid(false), 2000);
  };

  // Handle Citizen Document Upload
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocTitle.trim()) return;

    const randomHash =
      '0x' +
      Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    let mappedAssetType: 'FD_BOND' | 'CERTIFICATE' | 'CRYPTO_WALLET' | 'IDENTITY_DOC' | 'LAND_TITLE' = 'LAND_TITLE';
    if (uploadDocType.includes('Degree')) mappedAssetType = 'CERTIFICATE';
    else if (uploadDocType.includes('Bond')) mappedAssetType = 'FD_BOND';
    else if (uploadDocType.includes('Identity')) mappedAssetType = 'IDENTITY_DOC';

    const newDoc: UserUploadedDocument = {
      id: `doc-${Date.now()}`,
      title: uploadDocTitle.trim(),
      assetType: mappedAssetType,
      fileName: uploadFileName || `${uploadDocTitle.replace(/\s+/g, '_')}.pdf`,
      fileSize: '1.4 MB',
      documentHash: randomHash,
      previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=800',
      verified: true,
      uploadedAt: new Date().toISOString(),
      issuerName: uploadIssuer.trim(),
      status: 'VERIFIED',
    };

    const updated = addDocumentToUserProfile(currentUser.uid, newDoc);
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        uploadedDocuments: [...userUploadedDocs, newDoc],
      });
    }

    setUploadSuccess(`"${newDoc.title}" successfully uploaded and anchored into your secure vault!`);
    setUploadDocTitle('');
    setUploadFileName('');

    setTimeout(() => {
      setUploadSuccess('');
    }, 3000);
  };

  // Handle Add Crypto Wallet
  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const addr = newWalletAddress.trim();
    if (!addr.startsWith('0x') || addr.length < 10) {
      alert('Please enter a valid Ethereum/Polygon wallet address starting with 0x.');
      return;
    }

    const updatedWallets = Array.from(new Set([...userWallets, addr]));
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser({
        ...currentUser,
        registeredWallets: updatedWallets,
      });
    }

    setWalletSuccess(`Wallet ${addr.substring(0, 10)}... registered to your Decentralized Identifier.`);
    setNewWalletAddress('');
    setTimeout(() => setWalletSuccess(''), 3000);
  };

  // Preset blockchain activity
  const blockchainActivity = [
    {
      action: 'Ownership Anchor',
      block: 'Block #1234567',
      txHash: '0x8af92e3415c8973d09a27b8849c301e7d23a1f94b3419082ca09182390148bca',
      timestamp: '2026-02-18T14:30:00.000Z',
    },
    {
      action: 'NFT Certificate Mint',
      block: 'Block #1234598',
      txHash: '0x3c91a0827f8a7e5894101e8c71b6582a8847d100c8419201948bca1829340192',
      timestamp: '2025-11-10T08:30:00.000Z',
    },
    {
      action: 'Tamper Verification Proof',
      block: 'Block #1234650',
      txHash: '0x71e9f83a54b6c7d8e9f01a2b3c4d5e6f7a8b9c0d1234567890abcdef12345678',
      timestamp: '2026-01-05T12:00:00.000Z',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-140px)] bg-[#f8fafc] font-sans">
      {/* LEFT SIDEBAR: Clean Pure White / Light Slate */}
      <aside className="w-full lg:w-64 bg-white text-slate-800 p-5 flex flex-col justify-between shrink-0 border-r border-slate-200">
        <div className="space-y-6">
          {/* Logo */}
          <div className="pt-1">
            <SurakshaLogo variant="light" size="sm" />
          </div>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-orange-600 uppercase">
                CITIZEN VAULT
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</div>
            <div className="font-mono text-[10px] text-slate-500 break-all truncate">
              {currentUser.did}
            </div>
          </div>

          {/* Section: CITIZEN SERVICES */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1.5">
              CITIZEN SERVICES
            </div>

            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'DASHBOARD'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Citizen Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('UPLOAD_DOCS')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'UPLOAD_DOCS'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-4 h-4 text-orange-600" />
              <span>Upload Important Docs</span>
            </button>

            <button
              onClick={() => setActiveTab('RESTORED_DISPUTES')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'RESTORED_DISPUTES'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Restored Documents</span>
              </div>
              {userTickets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                  {userTickets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onOpenAiDetector();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>AI Forensics Scanner</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
                AI
              </span>
            </button>

            <button
              onClick={handleCopyDid}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-amber-600" />
              <span>{copiedDid ? 'DID Copied to Clipboard!' : 'Copy Identity (DID)'}</span>
            </button>

            <button
              onClick={onOpenRegisterAsset}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-orange-600" />
              <span>Register NFT Asset</span>
            </button>

            <button
              onClick={onOpenVerify}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Public Verification</span>
            </button>

            <button
              onClick={onOpenLedger}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Activity className="w-4 h-4 text-orange-600" />
              <span>Blockchain Explorer</span>
            </button>
          </div>
        </div>

        {/* Bottom Digital India Badge in Sidebar */}
        <div className="pt-6 border-t border-slate-200">
          <DigitalIndiaBadge size="sm" />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-5 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">सुरक्षा साथी • Suraksha Saathi</span>
              <span>|</span>
              <DigitalIndiaBadge size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Verified Citizen Identity</span>
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Citizen Self-Service Vault • Permanent Zero-Knowledge Storage • Tamper Dispute Support
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('UPLOAD_DOCS')}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Important Document</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* 5 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Digital Identity */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Digital Identity</span>
                  <Fingerprint className="w-4 h-4 text-orange-600" />
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 truncate">
                  {currentUser.did}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyDid}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedDid ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDid ? 'Copied' : 'Copy DID'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Registered Assets */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">NFT Assets</span>
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{citizenAssets.length}</div>
                <div className="text-[10px] text-slate-500">Bonds, degrees & certificates</div>
              </div>

              {/* Card 3: Uploaded Documents */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Uploaded Docs</span>
                  <Upload className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{userUploadedDocs.length}</div>
                <div className="text-[10px] text-slate-500">Stored in sovereign vault</div>
              </div>

              {/* Card 4: Dispute Tickets */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Disputes / Restored</span>
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{userTickets.length}</div>
                <div className="text-[10px] text-slate-500">Officer verified resolutions</div>
              </div>

              {/* Card 5: Ledger Status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Ledger Status</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-bold text-slate-900">Connected</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Polygon Amoy / EVM</div>
              </div>
            </div>

            {/* 3 Step Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('UPLOAD_DOCS')}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-orange-400 space-y-2 cursor-pointer shadow-2xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider text-orange-600 uppercase">
                    STEP 1: Upload Important Document
                  </span>
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-xs text-slate-600">
                  Securely store Land Deed, FD Bond, or Degree with zero-knowledge hashing.
                </p>
              </div>

              <div
                onClick={onOpenAiDetector}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 space-y-2 cursor-pointer shadow-2xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider text-emerald-700 uppercase">
                    STEP 2: Scan for AI Tampering
                  </span>
                  <Cpu className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">
                  Verify font kerning, pixel anomalies, and escalate issues to Verification Officers.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('RESTORED_DISPUTES')}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-400 space-y-2 cursor-pointer shadow-2xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wider text-slate-700 uppercase">
                    STEP 3: Officer Dispute Resolutions
                  </span>
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-600">
                  View authentic documents verified and sent back by official Verification Officers.
                </p>
              </div>
            </div>

            {/* Two-Column Grid: My Registered Digital Assets vs Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Left: My Registered Digital Assets */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">My Registered Vault Assets</h3>
                  <button
                    onClick={onOpenRegisterAsset}
                    className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    + Add New →
                  </button>
                </div>

                {citizenAssets.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      No NFT assets registered yet. You can upload important documents or mint NFT bonds.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citizenAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {asset.title}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {asset.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono truncate">
                          <span>NFT #{asset.nftTokenId}</span>
                          <span>•</span>
                          <span className="truncate">Hash: {asset.documentHash.substring(0, 16)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Recent Blockchain Activity */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Recent Blockchain Activity</h3>
                  <button
                    onClick={onOpenLedger}
                    className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    Explorer →
                  </button>
                </div>

                <div className="space-y-3">
                  {blockchainActivity.map((event, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{event.action}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                            {event.block}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{event.timestamp.split('T')[0]}</span>
                        </div>
                      </div>

                      <div className="font-mono text-[10px] text-slate-500 break-all truncate">
                        {event.txHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD IMPORTANT DOCUMENTS */}
        {activeTab === 'UPLOAD_DOCS' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">
                  Upload Important Documents to Sovereign Vault
                </h2>
                <p className="text-xs text-slate-600">
                  Safely upload Land Title Deeds, University Degrees, Fixed Deposit Bonds, or Identification
                  Cards. Each document is anchored permanently with SHA-256 zero-knowledge proofs.
                </p>
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadDocument} className="space-y-4 max-w-xl">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadDocTitle}
                    onChange={(e) => setUploadDocTitle(e.target.value)}
                    placeholder="e.g. Haryana State Land Title Deed 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-orange-500 text-xs text-slate-900 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Asset Type
                    </label>
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none"
                    >
                      <option value="Land Title Deed">Land Title Deed</option>
                      <option value="Degree Certificate">Degree Certificate</option>
                      <option value="Fixed Deposit Bond">Fixed Deposit Bond</option>
                      <option value="Identity Card">Identity Card / Passport</option>
                      <option value="Vehicle RC">Vehicle Registration</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Issuing Authority
                    </label>
                    <input
                      type="text"
                      value={uploadIssuer}
                      onChange={(e) => setUploadIssuer(e.target.value)}
                      placeholder="e.g. Revenue Dept, State Bank of India"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none"
                    >
                    </input>
                  </div>
                </div>

                {/* File picker simulation */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Select Document File (PDF, PNG, JPG)
                  </label>
                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-6 h-6 text-orange-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {uploadFileName || 'Click to select file from your device'}
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadFileName(e.target.files[0].name);
                          if (!uploadDocTitle) {
                            setUploadDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                          }
                        }
                      }}
                      className="text-xs text-slate-500 cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload & Anchor to Sovereign Vault</span>
                </button>
              </form>
            </div>

            {/* List of uploaded documents */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Uploaded Documents ({userUploadedDocs.length})
              </h3>
              {userUploadedDocs.length === 0 ? (
                <div className="text-xs text-slate-500 p-6 rounded-xl bg-slate-50 text-center">
                  You have not uploaded any documents yet. Use the form above to add documents.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userUploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{doc.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        Type: {doc.assetType} • Issuer: {doc.issuerName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">
                        Hash: {doc.documentHash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RESTORED DOCUMENTS & DISPUTE TICKETS */}
        {activeTab === 'RESTORED_DISPUTES' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900">
                My Verification Requests & Restored Authentic Documents
              </h2>
              <p className="text-xs text-slate-600">
                If your document was detected as altered or tampered, you can request the Verification
                Officer to review the case. When the officer resolves the issue, your verified original
                document will be sent back and displayed here.
              </p>
            </div>

            {userTickets.length === 0 ? (
              <div className="bg-slate-50 p-10 rounded-2xl border border-slate-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">No Active Disputes</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  All your vault documents are in good standing. You can run the AI Tamper Scanner anytime
                  to verify forensic integrity.
                </p>
                <button
                  onClick={onOpenAiDetector}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Open AI Tamper Scanner</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {ticket.ticketNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{ticket.documentName}</h4>
                        <div className="text-xs text-slate-500">
                          Reported: {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          ticket.status === 'RESOLVED_APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {ticket.status === 'RESOLVED_APPROVED' ? 'RESTORED BY OFFICER' : ticket.status}
                      </span>
                    </div>

                    {/* If restored by officer */}
                    {ticket.resolvedDocumentUrl ? (
                      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Authentic Original Document Restored & Sent Back by Officer:</span>
                        </div>

                        <div className="text-xs text-emerald-800 italic bg-white/60 p-2.5 rounded-lg border border-emerald-200">
                          "{ticket.officerComments || 'Officer verified authentic record and restored original document.'}"
                        </div>

                        <div className="flex items-center gap-3">
                          <a
                            href={ticket.resolvedDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Authentic Original Document</span>
                          </a>
                          <span className="text-[11px] text-emerald-700 font-mono">
                            Officer ID: {ticket.officerName || ticket.officerId || 'VO-Official'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        Under forensic review by assigned Verification Officer. The original verified document
                        will appear here once resolution is signed off.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Floating Toast in Bottom Right */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-slate-200 shadow-xl rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-slate-900">Authenticated</div>
            <div className="text-slate-500">Welcome back, {currentUser.name}</div>
            <div className="text-[10px] text-slate-400">Just now</div>
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
