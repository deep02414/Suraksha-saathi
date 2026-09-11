import React, { useState } from 'react';
import {
  UserProfile,
  VaultAsset,
  EscalationTicket,
  SystemAuditLog,
  TamperAnalysisResult,
  AssetType,
} from '../types';
import {
  SAMPLE_DOCUMENTS,
  analyzeDocumentTampering,
  computeSHA256,
} from '../services/tamperDetectionService';
import { recordAuditLog } from '../services/store';
import {
  Shield,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  Send,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  Lock,
  Layers,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserProfile;
  vaultAssets: VaultAsset[];
  onUpdateAssets: (assets: VaultAsset[]) => void;
  escalationTickets: EscalationTicket[];
  onUpdateTickets: (tickets: EscalationTicket[]) => void;
  onAddAuditLog: (log: SystemAuditLog) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  vaultAssets,
  onUpdateAssets,
  escalationTickets,
  onUpdateTickets,
  onAddAuditLog,
}) => {
  // Tabs: 'VAULT' vs 'TAMPER_DETECTION'
  const [activeTab, setActiveTab] = useState<'VAULT' | 'TAMPER_DETECTION'>('TAMPER_DETECTION');

  // AI Tamper Detection State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TamperAnalysisResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<any | null>(null);
  const [isEscalating, setIsEscalating] = useState(false);
  const [escalateSuccessMsg, setEscalateSuccessMsg] = useState('');

  // Mint Asset Modal state
  const [showMintModal, setShowMintModal] = useState(false);
  const [assetTitle, setAssetTitle] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('FD_BOND');
  const [nominalValue, setNominalValue] = useState('');
  const [institution, setInstitution] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const myTickets = escalationTickets.filter(
    (t) => t.userDid === currentUser.did || t.userEmail === currentUser.email
  );

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Run AI analysis on sample or custom file
  const handleSelectSample = async (sampleId: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSelectedHighlight(null);
    setEscalateSuccessMsg('');

    try {
      const result = await analyzeDocumentTampering(sampleId);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSelectedHighlight(null);
    setEscalateSuccessMsg('');

    try {
      const result = await analyzeDocumentTampering(file);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // One-Click Escalation directly to Verification Officers
  const handleEscalateToOfficer = async () => {
    if (!analysisResult) return;
    setIsEscalating(true);

    const ticketNumber = `ESC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: EscalationTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      userDid: currentUser.did,
      userEmail: currentUser.email,
      userName: currentUser.name,
      documentName: analysisResult.documentName,
      documentHash: analysisResult.documentHash,
      tamperPercentage: analysisResult.tamperPercentage,
      riskLevel: analysisResult.riskLevel,
      status: 'PENDING_OFFICER_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisSummary: analysisResult.summary,
      previewUrl: analysisResult.previewUrl,
    };

    // Save ticket
    const updated = [newTicket, ...escalationTickets];
    onUpdateTickets(updated);

    // Record audit trail
    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'ONE_CLICK_ESCALATE_TO_OFFICER',
      details: `User ${currentUser.name} escalated tampered document (${analysisResult.tamperPercentage}% Tamper Index) to Verification Officer Desk`,
      targetId: ticketNumber,
    });
    onAddAuditLog(log);

    setIsEscalating(false);
    setEscalateSuccessMsg(
      `Case ${ticketNumber} transmitted to Verification Officer Desk! An officer has been assigned for review.`
    );
  };

  // Mint new asset NFT linked to user's DID
  const handleMintAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetTitle.trim()) return;

    const randomTokenId = Math.floor(5000 + Math.random() * 5000).toString();
    const randomHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const txHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newAsset: VaultAsset = {
      id: `asset-${Date.now()}`,
      title: assetTitle.trim(),
      assetType,
      nftTokenId: randomTokenId,
      contractAddress: '0x49B35A02e0717281D52309C13e20A914f6bA4011',
      tokenStandard: assetType === 'CRYPTO_WALLET' ? 'ERC-1155' : 'ERC-721',
      ownerDid: currentUser.did,
      ownerWallet: currentUser.walletAddress,
      issuerDid: 'did:suraksha:in:institution-official',
      issuerName: institution || 'Suraksha Certified Issuer',
      documentHash: '0x' + randomHex,
      blockNumber: 1849420,
      txHash: '0x' + txHex,
      dateIssued: new Date().toISOString().split('T')[0],
      status: 'VERIFIED',
      metadata: {
        nominalValue: nominalValue || undefined,
        institution: institution || undefined,
        encryptionAlgorithm: 'AES-GCM-256 + SmartContract-Anchor',
      },
    };

    onUpdateAssets([newAsset, ...vaultAssets]);

    const log = recordAuditLog({
      actorUid: currentUser.uid,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      action: 'MINT_ASSET_NFT',
      details: `Minted ${newAsset.tokenStandard} NFT #${randomTokenId} linked to DID ${currentUser.did}`,
      targetId: randomTokenId,
    });
    onAddAuditLog(log);

    setShowMintModal(false);
    setAssetTitle('');
    setNominalValue('');
    setInstitution('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-xl border-2 border-[#87CEEB] bg-[#0b172a] shadow-[0_0_20px_rgba(135,206,235,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#87CEEB] text-[#060e1a]">
              LEVEL 4: CITIZEN VAULT & VERIFIER
            </span>
            <span className="font-mono text-xs text-[#87CEEB]">UID: {currentUser.uid}</span>
          </div>
          <h2 className="text-2xl font-bold text-[#FFFFFF]" style={{ fontFamily: 'Arial, sans-serif' }}>
            सुरक्षा साथी Decentralized Vault & AI Tamper Engine
          </h2>
          <p className="text-xs text-[#87CEEB] mt-1 max-w-2xl">
            Store and manage your blockchain-anchored NFT assets (FD Bonds, Certificates, Wallets),
            run multi-layer AI tampering forensics, and escalate suspicious documents to Verification Officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('TAMPER_DETECTION')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TAMPER_DETECTION'
                ? 'bg-[#FFA500] text-[#060e1a]'
                : 'border border-[#87CEEB]/40 text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            AI Tamper Detection
          </button>
          <button
            onClick={() => setActiveTab('VAULT')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VAULT'
                ? 'bg-[#00BFFF] text-[#060e1a]'
                : 'border border-[#87CEEB]/40 text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            Digital Vault ({vaultAssets.length} Assets)
          </button>
        </div>
      </div>

      {/* TAB 1: AI DOCUMENT TAMPERING DETECTION MODULE */}
      {activeTab === 'TAMPER_DETECTION' && (
        <div className="space-y-8">
          {/* Preset Sample Selector */}
          <div className="p-6 rounded-xl border border-[#00BFFF]/30 bg-[#0b172a]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#FFFFFF]">Select Test Document or Upload PDF/Image</h3>
                <p className="text-xs text-[#87CEEB]">
                  Inspect spectral font kerning, JPEG error level analysis (ELA), and cryptographic hash mismatches
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#FFA500] border border-[#FFA500]/30 px-2 py-0.5 rounded">
                AI Engine: Online & Ready
              </span>
            </div>

            {/* Quick Sample Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {SAMPLE_DOCUMENTS.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample.id)}
                  className="p-4 rounded-xl border border-[#87CEEB]/30 bg-[#071326] hover:border-[#FFA500] cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#87CEEB]/10 text-[#87CEEB] border border-[#87CEEB]/30">
                        {sample.type}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          sample.expectedTamperRate === 0
                            ? 'text-[#00FF00]'
                            : sample.expectedTamperRate > 50
                            ? 'text-[#FFA500]'
                            : 'text-[#FFA500]'
                        }`}
                      >
                        {sample.expectedTamperRate === 0
                          ? 'Authentic (0%)'
                          : `${sample.expectedTamperRate}% Tampered`}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#FFFFFF]">{sample.name}</div>
                    <p className="text-xs text-[#87CEEB] line-clamp-2">{sample.description}</p>
                  </div>

                  <button
                    type="button"
                    className="mt-4 w-full py-1.5 rounded bg-[#0b172a] border border-[#87CEEB]/40 text-xs font-bold text-[#87CEEB] hover:text-[#FFFFFF] hover:border-[#00BFFF]"
                  >
                    Run Forensic Scan →
                  </button>
                </div>
              ))}
            </div>

            {/* Drag & Drop File Upload */}
            <div className="p-6 border-2 border-dashed border-[#87CEEB]/40 rounded-xl bg-[#071326] text-center hover:border-[#00BFFF] transition-colors">
              <Upload className="w-8 h-8 text-[#00BFFF] mx-auto mb-2" />
              <div className="text-sm font-bold text-[#FFFFFF] mb-1">
                Upload Custom Document (PDF, PNG, JPG)
              </div>
              <p className="text-xs text-[#87CEEB] mb-3">
                Scans for pixel quantization discrepancies, altered dates, and font baseline manipulation
              </p>
              <label className="inline-block px-4 py-2 rounded-lg bg-[#00BFFF] text-[#060e1a] text-xs font-bold cursor-pointer hover:bg-[#87CEEB] transition-colors">
                Browse File
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="p-12 rounded-xl border border-[#00BFFF]/30 bg-[#0b172a] text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00BFFF] animate-spin mx-auto" />
              <div className="text-base font-bold text-[#FFFFFF]">Running AI Forensic Engine...</div>
              <p className="text-xs text-[#87CEEB] max-w-md mx-auto">
                Deconstructing spectral font kerning, computing Error Level Analysis (ELA) matrices, and
                validating Merkle hashes against Suraksha-Chain contracts.
              </p>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysisResult && !isAnalyzing && (
            <div className="p-6 rounded-xl border-2 border-[#00BFFF] bg-[#0b172a] shadow-[0_0_30px_rgba(0,191,255,0.2)] space-y-6">
              {/* Result Header & Tamper Percentage Index */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#87CEEB]/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                        analysisResult.tamperPercentage === 0
                          ? 'border-[#00FF00] text-[#00FF00] bg-[#2E8B57]/20'
                          : 'border-[#FFA500] text-[#FFA500] bg-[#FFA500]/10'
                      }`}
                    >
                      {analysisResult.riskLevel.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#87CEEB]">
                      Scanned at {new Date(analysisResult.analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#FFFFFF]">{analysisResult.documentName}</h3>
                  <div className="font-mono text-xs text-[#87CEEB] mt-1 break-all">
                    SHA-256 Hash: {analysisResult.documentHash}
                  </div>
                </div>

                {/* Tamper Gauge Box */}
                <div className="p-4 rounded-xl border border-[#87CEEB]/30 bg-[#071326] text-center shrink-0 min-w-[170px]">
                  <div className="text-[10px] font-bold text-[#87CEEB] uppercase mb-1">
                    Tamper Percentage Index
                  </div>
                  <div
                    className={`text-4xl font-black ${
                      analysisResult.tamperPercentage === 0
                        ? 'text-[#00FF00]'
                        : analysisResult.tamperPercentage > 50
                        ? 'text-[#FFA500]'
                        : 'text-[#FFA500]'
                    }`}
                  >
                    {analysisResult.tamperPercentage}%
                  </div>
                  <div className="text-[11px] text-[#87CEEB] mt-1">
                    {analysisResult.tamperPercentage === 0 ? 'Fully Authentic' : 'Tampered / Suspicious'}
                  </div>
                </div>
              </div>

              {/* Forensic Metric Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-[#071326] border border-[#87CEEB]/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#87CEEB]">Font Consistency:</span>
                    <span className="font-bold text-[#FFFFFF]">{analysisResult.fontConsistencyScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#060e1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00BFFF]"
                      style={{ width: `${analysisResult.fontConsistencyScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#071326] border border-[#87CEEB]/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#87CEEB]">Pixel ELA Homogeneity:</span>
                    <span className="font-bold text-[#FFFFFF]">{analysisResult.pixelElaScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#060e1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2E8B57]"
                      style={{ width: `${analysisResult.pixelElaScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#071326] border border-[#87CEEB]/20">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#87CEEB]">Metadata Chain Integrity:</span>
                    <span className="font-bold text-[#FFFFFF]">{analysisResult.metadataIntegrityScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#060e1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFA500]"
                      style={{ width: `${analysisResult.metadataIntegrityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Highlighting Overlay Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#FFFFFF]">
                      VISUAL TAMPER HIGHLIGHTING OVERLAY:
                    </span>
                    <span className="text-xs text-[#FFA500] font-mono">
                      {analysisResult.visualHighlights.length} Suspect Zones
                    </span>
                  </div>

                  <div className="relative rounded-lg border-2 border-[#00BFFF]/40 overflow-hidden bg-black flex items-center justify-center min-h-[300px]">
                    <img
                      src={analysisResult.previewUrl}
                      alt="Document preview"
                      className="w-full h-auto object-cover max-h-[380px]"
                    />

                    {/* Interactive highlight boxes */}
                    {analysisResult.visualHighlights.map((hl) => (
                      <div
                        key={hl.id}
                        onClick={() => setSelectedHighlight(hl)}
                        className="absolute border-2 border-[#FFA500] bg-[#FFA500]/30 rounded cursor-pointer hover:bg-[#FFA500]/50 transition-colors animate-pulse"
                        style={{
                          top: `${hl.y}%`,
                          left: `${hl.x}%`,
                          width: `${hl.w}%`,
                          height: `${hl.h}%`,
                        }}
                      >
                        <span className="absolute -top-6 left-0 bg-[#FFA500] text-[#060e1a] text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                          {hl.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {selectedHighlight && (
                    <div className="mt-3 p-3 rounded-lg border border-[#FFA500] bg-[#FFA500]/10 text-xs text-[#FFA500]">
                      <div className="font-bold">{selectedHighlight.title}</div>
                      <p className="text-[#FFFFFF] mt-0.5">{selectedHighlight.note}</p>
                    </div>
                  )}
                </div>

                {/* Issues Breakdown List */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#FFFFFF] uppercase">
                    Forensic Issues Breakdown ({analysisResult.issues.length}):
                  </div>

                  {analysisResult.issues.length === 0 ? (
                    <div className="p-4 rounded-lg border border-[#2E8B57] bg-[#2E8B57]/20 text-[#00FF00] text-xs flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span>Zero tampering detected. Cryptographic proof valid and anchored on blockchain.</span>
                    </div>
                  ) : (
                    analysisResult.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className="p-3 rounded-lg border border-[#FFA500]/40 bg-[#071326] space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#FFA500]">{issue.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold border border-[#FFA500] text-[#FFA500]">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-[#FFFFFF]">{issue.description}</p>
                      </div>
                    ))
                  )}

                  {/* Summary & One-Click Escalation Button */}
                  <div className="p-4 rounded-lg border border-[#00BFFF]/30 bg-[#071326] space-y-3 pt-4">
                    <div className="text-xs text-[#87CEEB]">
                      <span className="font-bold text-[#FFFFFF]">Forensic Verdict: </span>
                      {analysisResult.summary}
                    </div>

                    {escalateSuccessMsg ? (
                      <div className="p-3 rounded-lg border border-[#2E8B57] bg-[#2E8B57]/20 text-[#00FF00] text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{escalateSuccessMsg}</span>
                      </div>
                    ) : (
                      analysisResult.tamperPercentage > 0 && (
                        <button
                          type="button"
                          onClick={handleEscalateToOfficer}
                          disabled={isEscalating}
                          className="w-full py-3 px-4 rounded-lg bg-[#FFA500] text-[#060e1a] font-bold text-xs hover:bg-[#FFA500]/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,165,0,0.25)]"
                        >
                          <Send className="w-4 h-4" />
                          <span>
                            {isEscalating
                              ? 'Escalating to Verification Officer...'
                              : 'One-Click Escalation to Verification Officers'}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User's Escalated Tickets History */}
          {myTickets.length > 0 && (
            <div className="p-6 rounded-xl border border-[#00BFFF]/30 bg-[#0b172a]">
              <h3 className="text-lg font-bold text-[#FFFFFF] mb-3">
                My Escalated Verification Tickets ({myTickets.length})
              </h3>
              <div className="space-y-3">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-3 rounded-lg border border-[#87CEEB]/20 bg-[#071326] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#FFFFFF]">
                          {ticket.ticketNumber}
                        </span>
                        <span className="font-bold text-[#87CEEB]">• {ticket.documentName}</span>
                      </div>
                      <div className="text-[#87CEEB] text-[11px] mt-0.5">
                        Tamper Index: {ticket.tamperPercentage}% • {ticket.riskLevel}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          ticket.status === 'RESOLVED_APPROVED'
                            ? 'border-[#00FF00] text-[#00FF00] bg-[#2E8B57]/20'
                            : ticket.status === 'RESOLVED_REJECTED'
                            ? 'border-[#FFA500] text-[#FFA500] bg-[#FFA500]/20'
                            : 'border-[#FFA500] text-[#FFA500] bg-[#FFA500]/10'
                        }`}
                      >
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-[#87CEEB]">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENCRYPTED DIGITAL VAULT & NFT ASSETS */}
      {activeTab === 'VAULT' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-[#00BFFF]/30 bg-[#0b172a]">
            <div>
              <h3 className="text-lg font-bold text-[#FFFFFF]">Personal Encrypted NFT Vault</h3>
              <p className="text-xs text-[#87CEEB]">
                Assets registered as ERC-721 / ERC-1155 tokens on Suraksha-Chain linked to your DID
              </p>
            </div>

            <button
              onClick={() => setShowMintModal(true)}
              className="px-4 py-2 rounded-lg bg-[#00BFFF] text-[#060e1a] font-bold text-xs hover:bg-[#87CEEB] transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mint / Anchor Digital Asset</span>
            </button>
          </div>

          {/* Vault Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaultAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-5 rounded-xl border border-[#87CEEB]/30 bg-[#071326] hover:border-[#00BFFF] transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00BFFF]/10 text-[#00BFFF] border border-[#00BFFF]/30">
                      {asset.tokenStandard} NFT #{asset.nftTokenId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        asset.status === 'VERIFIED'
                          ? 'border-[#00FF00] text-[#00FF00] bg-[#2E8B57]/20'
                          : 'border-[#FFA500] text-[#FFA500] bg-[#FFA500]/10'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#87CEEB] font-mono">Block #{asset.blockNumber}</span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-[#FFFFFF]">{asset.title}</h4>
                  <p className="text-xs text-[#87CEEB] mt-0.5">Issuer: {asset.issuerName}</p>
                </div>

                {/* Asset Metadata Box */}
                <div className="p-3 rounded-lg bg-[#060e1a] border border-[#87CEEB]/20 space-y-1.5 text-xs">
                  {asset.metadata.nominalValue && (
                    <div className="flex justify-between">
                      <span className="text-[#87CEEB]">Nominal Value:</span>
                      <span className="font-bold text-[#00FF00]">{asset.metadata.nominalValue}</span>
                    </div>
                  )}
                  {asset.metadata.interestRate && (
                    <div className="flex justify-between">
                      <span className="text-[#87CEEB]">Interest Rate:</span>
                      <span className="font-bold text-[#FFFFFF]">{asset.metadata.interestRate}</span>
                    </div>
                  )}
                  {asset.metadata.maturityDate && (
                    <div className="flex justify-between">
                      <span className="text-[#87CEEB]">Maturity Date:</span>
                      <span className="text-[#FFFFFF]">{asset.metadata.maturityDate}</span>
                    </div>
                  )}
                  {asset.metadata.identifierNumber && (
                    <div className="flex justify-between font-mono">
                      <span className="text-[#87CEEB]">Certificate ID:</span>
                      <span className="text-[#87CEEB]">{asset.metadata.identifierNumber}</span>
                    </div>
                  )}
                </div>

                {/* Cryptographic Proof Details */}
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-[#87CEEB]">
                    <span>Contract:</span>
                    <span title={asset.contractAddress}>
                      {asset.contractAddress.substring(0, 16)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#87CEEB]">
                    <span>Doc Hash:</span>
                    <button
                      onClick={() => copyText(asset.documentHash)}
                      className="hover:text-[#FFFFFF] flex items-center gap-1"
                      title="Copy Document Hash"
                    >
                      <span>{asset.documentHash.substring(0, 18)}...</span>
                      {copiedHash === asset.documentHash ? (
                        <Check className="w-3 h-3 text-[#00FF00]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#87CEEB]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mint Asset Modal */}
      {showMintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#060e1a] border-2 border-[#00BFFF] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#00BFFF]/30 pb-3">
              <h3 className="font-bold text-[#FFFFFF] text-base">Mint / Anchor Digital Vault Asset</h3>
              <button onClick={() => setShowMintModal(false)} className="text-[#87CEEB] hover:text-[#FFFFFF]">
                ✕
              </button>
            </div>

            <form onSubmit={handleMintAsset} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">ASSET TITLE</label>
                <input
                  type="text"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder="e.g. HDFC Fixed Deposit Digital Bond"
                  required
                  className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">ASSET TYPE</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as AssetType)}
                  className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                >
                  <option value="FD_BOND">Fixed Deposit (FD) Bond (ERC-721)</option>
                  <option value="CERTIFICATE">Academic / Land Certificate (ERC-721)</option>
                  <option value="CRYPTO_WALLET">Crypto Multisig Wallet (ERC-1155)</option>
                  <option value="IDENTITY_DOC">Identity Passport (ERC-721)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  ISSUING AUTHORITY / INSTITUTION
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. HDFC Bank Treasury / State Registrar"
                  className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  NOMINAL VALUE / IDENTIFIER
                </label>
                <input
                  type="text"
                  value={nominalValue}
                  onChange={(e) => setNominalValue(e.target.value)}
                  placeholder="e.g. ₹5,00,000 INR or FD-2026-991"
                  className="w-full px-3 py-2 bg-[#0b172a] border border-[#87CEEB]/40 rounded-lg text-xs text-[#FFFFFF] focus:outline-none focus:border-[#00BFFF]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMintModal(false)}
                  className="px-3 py-1.5 border border-[#87CEEB]/40 rounded-lg text-xs font-bold text-[#87CEEB] hover:text-[#FFFFFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#00BFFF] text-[#060e1a] text-xs font-bold hover:bg-[#87CEEB]"
                >
                  Mint NFT Asset & Anchor on Chain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
