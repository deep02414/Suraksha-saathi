import React, { useState, useEffect } from 'react';
import { Search, X, Layers, Users, FileCheck, ArrowRight, Activity } from 'lucide-react';
import { VaultAsset, UserProfile, SystemAuditLog } from '../types';

interface SearchRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: VaultAsset[];
  users: UserProfile[];
  auditLogs: SystemAuditLog[];
  onSelectAsset?: (asset: VaultAsset) => void;
  onNavigate?: (view: string) => void;
}

export const SearchRegistryModal: React.FC<SearchRegistryModalProps> = ({
  isOpen,
  onClose,
  assets,
  users,
  auditLogs,
  onSelectAsset,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const term = searchTerm.trim().toLowerCase();

  const filteredAssets = term
    ? assets.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.documentHash.toLowerCase().includes(term) ||
          a.nftTokenId.includes(term) ||
          a.ownerDid.toLowerCase().includes(term)
      )
    : assets.slice(0, 3);

  const filteredOfficers = term
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.uid.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.did.toLowerCase().includes(term)
      )
    : users.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search assets, token IDs, officer UIDs, DIDs, or transaction hashes..."
            className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {/* Registered Assets */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Registered Assets & Deeds ({filteredAssets.length})
            </div>
            <div className="space-y-1.5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (onSelectAsset) onSelectAsset(asset);
                    if (onNavigate) onNavigate('VERIFY_ASSET');
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-[#1e3a8a]">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{asset.title}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        NFT #{asset.nftTokenId} • {asset.documentHash.substring(0, 18)}...
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Officers & Clearances */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Officers & Citizens Directory ({filteredOfficers.length})
            </div>
            <div className="space-y-1.5">
              {filteredOfficers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    if (onNavigate) onNavigate('RBAC');
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{user.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                          {user.role}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">
                        UID: {user.uid} • {user.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or arrow keys</span>
          <span className="font-mono">Polygon Amoy Registry (Chain 80002)</span>
        </div>
      </div>
    </div>
  );
};
