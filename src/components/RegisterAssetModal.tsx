import React, { useState } from 'react';
import { X, Upload, CheckCircle2, Shield, PlusCircle, Sparkles } from 'lucide-react';
import { VaultAsset, UserProfile, AssetType } from '../types';

interface RegisterAssetModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onAssetRegistered: (newAsset: VaultAsset) => void;
}

export const RegisterAssetModal: React.FC<RegisterAssetModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onAssetRegistered,
}) => {
  const [title, setTitle] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('CERTIFICATE');
  const [institution, setInstitution] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [nominalValue, setNominalValue] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMinting(true);

    // Simulate SHA-256 calculation & Polygon Amoy smart contract execution
    setTimeout(() => {
      const randomHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const txHex = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      const newAsset: VaultAsset = {
        id: `asset-${Date.now()}`,
        title: title.trim() || 'Statutory Asset Deed',
        assetType,
        nftTokenId: Math.floor(1000 + Math.random() * 9000).toString(),
        contractAddress: '0x49B35A02e0717281D52309C13e20A914f6bA4011',
        tokenStandard: 'ERC-721',
        ownerDid: currentUser.did,
        ownerWallet: currentUser.walletAddress,
        issuerDid: 'did:suraksha:in:gov-registrar-general',
        issuerName: institution.trim() || 'Government of India Sovereign Registrar',
        documentHash: '0x' + randomHex,
        blockNumber: 1849500 + Math.floor(Math.random() * 500),
        txHash: '0x' + txHex,
        dateIssued: new Date().toISOString().split('T')[0],
        status: 'VERIFIED',
        metadata: {
          nominalValue: nominalValue.trim() || undefined,
          institution: institution.trim() || undefined,
          encryptionAlgorithm: 'SHA-256 + Zero-Knowledge Proof (zk-SNARK)',
        },
      };

      onAssetRegistered(newAsset);
      setIsMinting(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-[#1e3a8a]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Asset Deed / Bond</h3>
              <p className="text-xs text-slate-500">
                Cryptographically anchors document hash to Polygon Amoy
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset Title / Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Haryana State Land Title Deed - Plot 412"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asset Category</label>
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value as AssetType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
              >
                <option value="CERTIFICATE">Academic / Legal Certificate</option>
                <option value="FD_BOND">Fixed Deposit / Treasury Bond</option>
                <option value="IDENTITY_DOC">Identity / Passport Document</option>
                <option value="CRYPTO_WALLET">Cold Storage Vault Registry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Issuing Authority / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Land Revenue Directorate"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Value / Worth (Optional)
            </label>
            <input
              type="text"
              value={nominalValue}
              onChange={(e) => setNominalValue(e.target.value)}
              placeholder="e.g. ₹50,00,000 INR"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#1e3a8a]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Attach Original PDF / Certificate Document
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-center">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-700">
                {docFile ? docFile.name : 'Select or Drop Document'}
              </span>
              <span className="text-[10px] text-slate-400">
                Document is hashed locally with zero PII exposure
              </span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
            <Shield className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span>
              The raw document never touches the public chain. Only its SHA-256 cryptographic digest
              is anchored into the ERC-721 soulbound token.
            </span>
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
              disabled={isMinting}
              className="px-5 py-2 rounded-lg bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              {isMinting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Anchoring to Polygon...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Anchor & Mint NFT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
