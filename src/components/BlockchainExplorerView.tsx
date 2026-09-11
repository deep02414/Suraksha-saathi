import React from 'react';
import { Activity, Layers, Hash, CheckCircle2, ExternalLink, ShieldCheck, Box } from 'lucide-react';
import { VaultAsset, SystemAuditLog } from '../types';

interface BlockchainExplorerViewProps {
  assets: VaultAsset[];
  auditLogs: SystemAuditLog[];
}

export const BlockchainExplorerView: React.FC<BlockchainExplorerViewProps> = ({
  assets,
  auditLogs,
}) => {
  return (
    <div className="bg-[#f8fafc] min-h-[calc(100vh-140px)] p-4 sm:p-7 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-pink-700">
          <Activity className="w-4 h-4 text-pink-600" />
          <span className="uppercase tracking-wider">POLYGON AMOY (CHAIN 80002) LEDGER EXPLORER</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Public Sovereign Audit Trail & Blockchain Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Statutory transparency console. Every minting action, credential issuance, and document
          hash anchor is sealed into Polygon Amoy smart contracts with proof-of-stake consensus.
        </p>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Network State
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold text-slate-900">Synchronized</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">ChainID: 80002 (Amoy)</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Anchored Documents
          </span>
          <div className="text-2xl font-black text-slate-900">{assets.length}</div>
          <div className="text-[10px] text-slate-500">ERC-721 Soulbound Deeds</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Smart Contract
          </span>
          <div className="text-xs font-mono font-bold text-blue-700 truncate pt-1">
            0x49B35A02e0717281D52309C13e20A914f6bA4011
          </div>
          <div className="text-[10px] text-slate-500">SurakshaSathiRBAC.sol</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Consensus Engine
          </span>
          <div className="text-base font-bold text-purple-700 pt-1">Proof-of-Stake</div>
          <div className="text-[10px] text-slate-500">Zero-Knowledge Attested</div>
        </div>
      </div>

      {/* Two Column Section: Live Blocks vs Confirmed Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Transactions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Confirmed Document Hash Anchors</h3>
            <span className="text-xs font-mono text-slate-400">Total: {assets.length}</span>
          </div>

          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{asset.title}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Block #{asset.blockNumber}
                  </span>
                </div>

                <div className="space-y-0.5 font-mono text-[10px] text-slate-500">
                  <div className="truncate">Tx: {asset.txHash}</div>
                  <div className="truncate">Hash: {asset.documentHash}</div>
                  <div className="truncate">Owner: {asset.ownerDid}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privilege Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Immutable Privilege Audit Log</h3>
            <span className="text-xs font-mono text-slate-400">Total: {auditLogs.length}</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{log.action}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800">
                      {log.actorRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{log.details}</p>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  Tx: {log.txHash} • IP: {log.ipAddress}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
