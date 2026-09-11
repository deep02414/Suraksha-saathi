export type UserRole = 'ADMIN' | 'AUDITOR' | 'OFFICER' | 'USER';

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  recipientUid: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserUploadedDocument {
  id: string;
  title: string;
  assetType: AssetType;
  documentHash: string;
  uploadedAt: string;
  verified: boolean;
  fileSize: string;
  previewUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'FLAGGED';
  fileName?: string;
  issuerName?: string;
}

export interface UserProfile {
  id: string;
  uid: string; // e.g. Deep123, AUD-9021, OFF-4052, USR-8192
  email: string;
  name: string;
  role: UserRole;
  password?: string;
  did: string;
  walletAddress: string;
  createdAt: string;
  createdBy?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isBlocked?: boolean;
  city?: string;
  department?: string;
  badgeNumber?: string;
  assignedAuditorId?: string;
  directMessages?: DirectMessage[];
  uploadedDocuments?: UserUploadedDocument[];
  registeredWallets?: string[];
}

export type AssetType = 'FD_BOND' | 'CERTIFICATE' | 'CRYPTO_WALLET' | 'IDENTITY_DOC' | 'LAND_TITLE';

export interface VaultAsset {
  id: string;
  title: string;
  assetType: AssetType;
  nftTokenId: string;
  contractAddress: string;
  tokenStandard: 'ERC-721' | 'ERC-1155';
  ownerDid: string;
  ownerWallet: string;
  issuerDid: string;
  issuerName: string;
  documentHash: string;
  blockNumber: number;
  txHash: string;
  dateIssued: string;
  status: 'VERIFIED' | 'FLAGGED' | 'REVOKED';
  metadata: {
    nominalValue?: string;
    interestRate?: string;
    maturityDate?: string;
    institution?: string;
    identifierNumber?: string;
    encryptionAlgorithm?: string;
    ipfsCid?: string;
    city?: string;
  };
}

export interface TamperIssue {
  id: string;
  category: 'FONT_MISMATCH' | 'PIXEL_ELA' | 'METADATA_ANOMALY' | 'HASH_DISCREPANCY';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  zone?: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
  };
}

export interface TamperAnalysisResult {
  documentId: string;
  documentName: string;
  fileSize: string;
  mimeType: string;
  documentHash: string;
  analyzedAt: string;
  tamperPercentage: number;
  riskLevel: 'AUTHENTIC' | 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK_TAMPERED';
  summary: string;
  fontConsistencyScore: number;
  pixelElaScore: number;
  metadataIntegrityScore: number;
  blockchainAnchorVerified: boolean;
  issues: TamperIssue[];
  visualHighlights: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    note: string;
    color: string;
  }[];
  previewUrl: string;
  originalDocumentUrl?: string;
  originalAssetId?: string;
}

export type EscalationStatus =
  | 'PENDING_OFFICER_REVIEW'
  | 'ESCALATED_TO_AUDITOR'
  | 'FORWARDED_TO_ADMIN'
  | 'RESOLVED_APPROVED'
  | 'RESOLVED_REJECTED';

export interface EscalationTicket {
  id: string;
  ticketNumber: string;
  userDid: string;
  userEmail: string;
  userName: string;
  userCity?: string;
  documentName: string;
  documentHash: string;
  tamperPercentage: number;
  riskLevel: string;
  status: EscalationStatus;
  officerId?: string;
  officerName?: string;
  officerComments?: string;
  auditorId?: string;
  auditorName?: string;
  auditorComments?: string;
  adminSanction?: string;
  createdAt: string;
  updatedAt: string;
  analysisSummary: string;
  previewUrl: string;
  originalDocumentUrl?: string;
  resolvedDocumentUrl?: string;
  sentToAuditor?: boolean;
  officerResolvedAt?: string;
  auditorInspectedAt?: string;
  auditorDecision?: 'APPROVED_BY_AUDITOR' | 'FLAGGED_FOR_LEGAL_ACTION';
}

export interface DispatchedEmail {
  id: string;
  timestamp: string;
  senderRole: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: UserRole;
  recipientCity?: string;
  generatedUid: string;
  generatedPassword: string;
  subject: string;
  previewBody: string;
  status: 'DELIVERED';
}

export type DispatchedEmailRecord = DispatchedEmail;

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  targetId: string;
  txHash: string;
  blockNumber: number;
  ipAddress: string;
}
