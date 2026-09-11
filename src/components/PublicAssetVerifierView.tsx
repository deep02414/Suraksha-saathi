import React, { useState } from 'react';
import { ShieldCheck, Search, FileCheck, CheckCircle2, XCircle, ExternalLink, Hash, Lock } from 'lucide-react';
import { VaultAsset } from '../types';

interface PublicAssetVerifierViewProps {
  assets: VaultAsset[];
}

export const PublicAssetVerifierView: React.FC<PublicAssetVerifierViewProps> = ({ assets }) => {
  const [query, setQuery] = useState(
    '0x3c71ea4019a82fbc789b52110c49ad0e6b18d7f2a89c09ef01a87b32c5ef2941'
  );
  const [searchResult, setSearchResult] = useState<VaultAsset | null>(assets[0] || null);
  const [searched, setSearched] = useState(true);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const found = assets.find(
      (a) =>
        a.documentHash.toLowerCase() === q ||
        a.nftTokenId === q ||
        a.ownerDid.toLowerCase() === q ||
        a.txHash.toLowerCase() === q
    );
    setSearchResult(found || null);
    setSearched(true);
  };

  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-140px)] p-4 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a8a]">
          <ShieldCheck className="w-4 h-4 text-[#1e3a8a]" />
          <span className="uppercase tracking-wider">PUBLIC CRYPTOGRAPHIC VERIFIER</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Verify Document Authenticity on Polygon Amoy Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Statutory public verification portal. Paste a document SHA-256 hash, NFT Token ID, or
          W3C DID to verify cryptographic validity and provenance without exposing underlying
          personal documents.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Enter Cryptographic SHA-256 Hash or NFT Token ID:
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 0x3c71ea4019a82fbc789b52110c49ad0e6b18d7f2a89c09ef01a87b32c5ef2941"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#1e3a8a] focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Verify On-Chain</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Quick Samples:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('0x3c71ea4019a82fbc789b52110c49ad0e6b18d7f2a89c09ef01a87b32c5ef2941');
                setSearchResult(assets[0]);
              }}
              className="font-mono text-[#1e3a8a] hover:underline"
            >
              SBI Bond Hash
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setQuery('0x4b7f0029ad14c990218ef83a62174c8b02194a72d3e198bca40291f83c670a1e');
                setSearchResult(assets[1]);
              }}
              className="font-mono text-[#1e3a8a] hover:underline"
            >
              IIT Degree Hash
            </button>
          </div>
        </form>
      </div>

      {/* Result Card */}
      {searched && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          {searchResult ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{searchResult.title}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Issuer: {searchResult.issuerName}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">Issued: {searchResult.dateIssued}</span>
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 border border-emerald-300 text-emerald-800">
                  STATUTORY VERIFIED
                </span>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-slate-500 font-medium">NFT Token ID & Standard</div>
                  <div className="font-mono font-bold text-slate-900">
                    Token #{searchResult.nftTokenId} ({searchResult.tokenStandard})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-slate-500 font-medium">Smart Contract Address</div>
                  <div className="font-mono font-bold text-slate-900 truncate">
                    {searchResult.contractAddress}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-slate-500 font-medium">Owner W3C DID</div>
                  <div className="font-mono font-bold text-slate-900 truncate">
                    {searchResult.ownerDid}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="text-slate-500 font-medium">Blockchain Block Number</div>
                  <div className="font-mono font-bold text-slate-900">
                    Block #{searchResult.blockNumber} (Polygon Amoy)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs space-y-1 overflow-x-auto">
                <div>Document Merkle Hash: {searchResult.documentHash}</div>
                <div>Polygon Transaction: {searchResult.txHash}</div>
                <div>Status: ANCHORED_ON_CHAIN_IMMUTABLE</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No On-Chain Anchor Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The query &ldquo;{query}&rdquo; does not match any registered sovereign asset deed
                or certificate in the Suraksha Saathi registry.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
