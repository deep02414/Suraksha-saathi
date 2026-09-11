import React, { useState } from 'react';
import { Code, Copy, Check, Shield, FileCode, CheckCircle, X } from 'lucide-react';

interface SmartContractViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartContractViewer: React.FC<SmartContractViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'SOLIDITY' | 'RBAC_MATRIX' | 'EXPRESS_MIDDLEWARE'>('SOLIDITY');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const SOLIDITY_SOURCE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SurakshaSathiRBAC & Decentralized Asset Vault
 * @notice Role-Based Access Control and NFT Asset Management for "सुरक्षा साथी"
 * @dev Enforces 4-Level RBAC:
 *      1. DEFAULT_ADMIN_ROLE (Bootstrap Admin: Deep123 / deepsingh02414@gmail.com)
 *      2. AUDITOR_ROLE (Oversees Verification Officers, manages escalations)
 *      3. VERIFICATION_OFFICER_ROLE (Reviews AI tamper flags, approves/rejects)
 *      4. USER_ROLE (Citizens / Viewers, personal vault, AI tamper scan)
 */

contract SurakshaSathiRBAC {
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant VERIFICATION_OFFICER_ROLE = keccak256("VERIFICATION_OFFICER_ROLE");
    bytes32 public constant USER_ROLE = keccak256("USER_ROLE");

    string public constant SYSTEM_NAME = unicode"सुरक्षा साथी (Suraksha Sathi)";
    string public constant VERSION = "2.4.0";

    mapping(bytes32 => mapping(address => bool)) private _roles;
    mapping(string => address) public didToWallet;
    mapping(address => string) public walletToDid;

    struct VaultAssetRecord {
        uint256 tokenId;
        string didOwner;
        string assetType;     // "FD_BOND", "CERTIFICATE", "CRYPTO_WALLET", "IDENTITY_DOC"
        bytes32 documentHash; // SHA-256 of encrypted doc
        string metadataURI;
        uint256 mintedAt;
        bool isRevoked;
    }

    uint256 private _nextTokenId = 1001;
    mapping(uint256 => VaultAssetRecord) public vaultAssets;
    mapping(bytes32 => uint256) public docHashToTokenId;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event AssetNFTMinted(uint256 indexed tokenId, string didOwner, bytes32 docHash, string assetType);
    event TamperVerdictAnchored(bytes32 indexed docHash, uint8 tamperIndex, bool isApproved, address officer);

    modifier onlyAdmin() {
        require(_roles[DEFAULT_ADMIN_ROLE][msg.sender], "SurakshaSathi: Restricted to Administrator");
        _;
    }

    modifier onlyAuditorOrAdmin() {
        require(
            _roles[AUDITOR_ROLE][msg.sender] || _roles[DEFAULT_ADMIN_ROLE][msg.sender],
            "SurakshaSathi: Restricted to Auditor or Admin"
        );
        _;
    }

    modifier onlyOfficer() {
        require(_roles[VERIFICATION_OFFICER_ROLE][msg.sender], "SurakshaSathi: Restricted to Officer");
        _;
    }

    constructor(address initialAdmin, string memory adminDid) {
        _roles[DEFAULT_ADMIN_ROLE][initialAdmin] = true;
        if (bytes(adminDid).length > 0) {
            didToWallet[adminDid] = initialAdmin;
            walletToDid[initialAdmin] = adminDid;
        }
    }

    function grantAuditorRole(address auditorAccount, string memory auditorDid) external onlyAdmin {
        require(auditorAccount != address(0), "Invalid auditor address");
        _roles[AUDITOR_ROLE][auditorAccount] = true;
        emit RoleGranted(AUDITOR_ROLE, auditorAccount, msg.sender);
    }

    function grantOfficerRole(address officerAccount, string memory officerDid) external onlyAuditorOrAdmin {
        require(officerAccount != address(0), "Invalid officer address");
        _roles[VERIFICATION_OFFICER_ROLE][officerAccount] = true;
        emit RoleGranted(VERIFICATION_OFFICER_ROLE, officerAccount, msg.sender);
    }

    function registerPublicUser(string memory userDid) external {
        require(!_roles[DEFAULT_ADMIN_ROLE][msg.sender], "Admin cannot register as plain user");
        _roles[USER_ROLE][msg.sender] = true;
        didToWallet[userDid] = msg.sender;
        walletToDid[msg.sender] = userDid;
    }

    function mintAssetNFT(
        string memory didOwner,
        string memory assetType,
        bytes32 docHash,
        string memory metadataURI
    ) external returns (uint256) {
        require(docHashToTokenId[docHash] == 0, "Document already anchored to token");
        uint256 tokenId = _nextTokenId++;
        vaultAssets[tokenId] = VaultAssetRecord(tokenId, didOwner, assetType, docHash, metadataURI, block.timestamp, false);
        docHashToTokenId[docHash] = tokenId;
        emit AssetNFTMinted(tokenId, didOwner, docHash, assetType);
        return tokenId;
    }

    function anchorTamperVerdict(
        bytes32 docHash,
        uint8 tamperIndex,
        bool isApproved,
        string memory notes
    ) external onlyOfficer {
        emit TamperVerdictAnchored(docHash, tamperIndex, isApproved, msg.sender);
    }
}`;

  const EXPRESS_MIDDLEWARE_SOURCE = `// middleware/rbacMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export type UserRole = 'ADMIN' | 'AUDITOR' | 'OFFICER' | 'USER';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
    did: string;
  };
}

/**
 * Strict RBAC Access Guard:
 * Blocks unauthorized access and prevents public registration of Officer, Auditor, or Admin
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'AUTH_REQUIRED',
        message: 'Security Notice: Authentication required for Suraksha Sathi platform.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: \`RBAC Invariant: Role '\${req.user.role}' is not authorized for this operation.\`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
};

/**
 * Guard preventing public self-registration of Administrative & Officer roles
 */
export const enforcePublicRegistrationConstraints = (req: Request, res: Response, next: NextFunction) => {
  const requestedRole = req.body?.role;
  if (requestedRole && requestedRole !== 'USER') {
    return res.status(403).json({
      status: 'error',
      code: 'REGISTRATION_ROLE_FORBIDDEN',
      message: 'CRITICAL SECURITY VIOLATION: Officers, Auditors, and Admins cannot self-register.',
      policy: 'Access must be provisioned by authorized superiors and sent via official email.',
    });
  }
  next();
};`;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#060e1a] border-2 border-[#00BFFF] rounded-xl shadow-[0_0_40px_rgba(0,191,255,0.3)] overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b172a] border-b border-[#00BFFF]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-[#00FF00]" />
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">
                सुरक्षा साथी Smart Contract & RBAC Architecture
              </h3>
              <p className="text-xs text-[#87CEEB]">
                Ethereum / EVM Solidity Contract (`SurakshaSathiRBAC.sol`) & Express Middleware
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

        {/* Tabs */}
        <div className="flex border-b border-[#00BFFF]/30 bg-[#071326] px-6 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('SOLIDITY')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'SOLIDITY'
                ? 'border-[#00BFFF] text-[#00BFFF]'
                : 'border-transparent text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Solidity Contract (`.sol`)</span>
          </button>
          <button
            onClick={() => setActiveTab('RBAC_MATRIX')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'RBAC_MATRIX'
                ? 'border-[#FFA500] text-[#FFA500]'
                : 'border-transparent text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>4-Level RBAC Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('EXPRESS_MIDDLEWARE')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'EXPRESS_MIDDLEWARE'
                ? 'border-[#00FF00] text-[#00FF00]'
                : 'border-transparent text-[#87CEEB] hover:text-[#FFFFFF]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Node.js Express Middleware</span>
          </button>
        </div>

        {/* Code View Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'SOLIDITY' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#87CEEB]">
                  Contracts/SurakshaSathiRBAC.sol • EVM Compiler v0.8.20+
                </span>
                <button
                  onClick={() => copyCode(SOLIDITY_SOURCE)}
                  className="px-3 py-1 rounded bg-[#0b172a] border border-[#00BFFF] text-[#00BFFF] text-xs font-bold hover:bg-[#00BFFF]/10 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Solidity Code'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#071326] border border-[#87CEEB]/20 text-xs font-mono text-[#87CEEB] overflow-x-auto leading-relaxed">
                <code>{SOLIDITY_SOURCE}</code>
              </pre>
            </div>
          )}

          {activeTab === 'RBAC_MATRIX' && (
            <div className="space-y-4">
              <div className="text-xs text-[#87CEEB]">
                Cryptographic Role Separation Hierarchy anchored on Suraksha-Chain:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#FFA500] bg-[#071326] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFA500]/20 text-[#FFA500]">
                      LEVEL 1: ADMIN
                    </span>
                    <span className="font-mono text-[11px] text-[#87CEEB]">0x00</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">DEFAULT_ADMIN_ROLE</h4>
                  <ul className="text-xs text-[#87CEEB] space-y-1 list-disc list-inside">
                    <li>Grant / Revoke AUDITOR_ROLE</li>
                    <li>Global user registry deletion & suspension</li>
                    <li>System parameters & smart contract upgrades</li>
                    <li>Review escalated legal sanctions</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-[#00BFFF] bg-[#071326] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00BFFF]/20 text-[#00BFFF]">
                      LEVEL 2: AUDITOR
                    </span>
                    <span className="font-mono text-[10px] text-[#87CEEB]">keccak256("AUDITOR_ROLE")</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">AUDITOR_ROLE</h4>
                  <ul className="text-xs text-[#87CEEB] space-y-1 list-disc list-inside">
                    <li>Grant / Provision VERIFICATION_OFFICER_ROLE</li>
                    <li>Supervise officer response times & actions</li>
                    <li>Audit document access & verification trail</li>
                    <li>Forward critical unresolved cases to Admin</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-[#2E8B57] bg-[#071326] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2E8B57]/30 text-[#00FF00]">
                      LEVEL 3: VERIFICATION OFFICER
                    </span>
                    <span className="font-mono text-[10px] text-[#87CEEB]">keccak256("VERIFICATION_OFFICER_ROLE")</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">VERIFICATION_OFFICER_ROLE</h4>
                  <ul className="text-xs text-[#87CEEB] space-y-1 list-disc list-inside">
                    <li>Receive flagged documents from Citizens</li>
                    <li>Inspect AI pixel ELA & spectral font kerning</li>
                    <li>Issue cryptographic approvals or tamper rejections</li>
                    <li>Escalate complex syndicates to Auditor</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-[#87CEEB] bg-[#071326] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#87CEEB]/20 text-[#87CEEB]">
                      LEVEL 4: USER / CITIZEN
                    </span>
                    <span className="font-mono text-[10px] text-[#87CEEB]">keccak256("USER_ROLE")</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#FFFFFF]">USER_ROLE</h4>
                  <ul className="text-xs text-[#87CEEB] space-y-1 list-disc list-inside">
                    <li>Store & manage NFT digital assets in private vault</li>
                    <li>Run AI document tampering forensic scans</li>
                    <li>One-Click escalation of suspect files to Officers</li>
                    <li>Web3 Wallet & DID integration</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EXPRESS_MIDDLEWARE' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#87CEEB]">
                  server/middleware/rbacMiddleware.ts
                </span>
                <button
                  onClick={() => copyCode(EXPRESS_MIDDLEWARE_SOURCE)}
                  className="px-3 py-1 rounded bg-[#0b172a] border border-[#00FF00] text-[#00FF00] text-xs font-bold hover:bg-[#00FF00]/10 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Middleware</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#071326] border border-[#87CEEB]/20 text-xs font-mono text-[#87CEEB] overflow-x-auto leading-relaxed">
                <code>{EXPRESS_MIDDLEWARE_SOURCE}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
