import {
  UserProfile,
  VaultAsset,
  EscalationTicket,
  SystemAuditLog,
  UserRole,
  DirectMessage,
  UserUploadedDocument,
} from '../types';

const USERS_STORAGE_KEY = 'suraksha_sathi_users_v3';
const ASSETS_STORAGE_KEY = 'suraksha_sathi_assets_v2';
const TICKETS_STORAGE_KEY = 'suraksha_sathi_tickets_v2';
const AUDIT_STORAGE_KEY = 'suraksha_sathi_audit_logs_v2';
const CURRENT_USER_KEY = 'suraksha_sathi_current_user_v3';

// Exclusive Master Sovereign Admin credential as specified
export const MASTER_ADMIN: UserProfile = {
  id: 'admin-master-deep123',
  uid: 'Deep123',
  email: 'deepsingh02414@gmail.com',
  name: 'Deep Singh',
  role: 'ADMIN',
  password: 'Deep@2414',
  did: 'did:suraksha:in:deep123-master-root',
  walletAddress: '0xDEEP02414777a829102938401928340192834019',
  createdAt: '2026-01-01T00:00:00Z',
  status: 'ACTIVE',
  isBlocked: false,
  city: 'New Delhi',
  department: 'MeitY Sovereign Blockchain Operations & Root Authority',
  badgeNumber: 'SOV-ROOT-01',
  directMessages: [],
};

// Initial pre-configured user list contains ONLY the Sovereign Admin.
// All other RBAC roles (Auditor, Verification Officer) and Citizens register themselves or are onboarded dynamically.
export const INITIAL_USERS: UserProfile[] = [MASTER_ADMIN];

// Initial vault assets
export const INITIAL_ASSETS: VaultAsset[] = [
  {
    id: 'asset-sbi-1',
    title: 'SBI Sovereign Fixed Deposit Bond (7.85% APY)',
    assetType: 'FD_BOND',
    nftTokenId: '4092',
    contractAddress: '0x49B35A02e0717281D52309C13e20A914f6bA4011',
    tokenStandard: 'ERC-721',
    ownerDid: 'did:suraksha:in:citizen-reg-771',
    ownerWallet: '0x71C3b784918ef901239841029384102938401923',
    issuerDid: 'did:suraksha:in:bank-sbi-corp',
    issuerName: 'State Bank of India (SBI Corp Treasury)',
    documentHash: '0x3c71ea4019a82fbc789b52110c49ad0e6b18d7f2a89c09ef01a87b32c5ef2941',
    blockNumber: 1849204,
    txHash: '0x918f4a21e6490ba820149c8120e8b209148cba0194821e901a8904e28914b109',
    dateIssued: '2026-01-15',
    status: 'VERIFIED',
    metadata: {
      nominalValue: '₹10,00,000 INR',
      interestRate: '7.85% p.a.',
      maturityDate: '2029-01-15',
      institution: 'State Bank of India',
      identifierNumber: 'FD-SBI-2026-984210',
      encryptionAlgorithm: 'AES-GCM-256 + DID-Signature',
      city: 'Mumbai',
      ipfsCid: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    },
  },
  {
    id: 'asset-iitd-2',
    title: 'IIT Delhi - B.Tech Degree & Honors Certificate',
    assetType: 'CERTIFICATE',
    nftTokenId: '1184',
    contractAddress: '0x49B35A02e0717281D52309C13e20A914f6bA4011',
    tokenStandard: 'ERC-721',
    ownerDid: 'did:suraksha:in:citizen-reg-771',
    ownerWallet: '0x71C3b784918ef901239841029384102938401923',
    issuerDid: 'did:suraksha:in:univ-iitd-academic',
    issuerName: 'Indian Institute of Technology Delhi (Registrar)',
    documentHash: '0x4b7f0029ad14c990218ef83a62174c8b02194a72d3e198bca40291f83c670a1e',
    blockNumber: 1948210,
    txHash: '0x32194ab872019e04891bca72901238491029e84bca09182390148bca18293401',
    dateIssued: '2025-07-28',
    status: 'VERIFIED',
    metadata: {
      institution: 'IIT Delhi',
      identifierNumber: 'IITD-2021-EE-049',
      encryptionAlgorithm: 'SHA256-Merkle-Root-NFT',
      city: 'New Delhi',
      ipfsCid: 'ipfs://bafybeih4j39m4k2091m302918301293841029384102938401923840192',
    },
  },
];

export const INITIAL_TICKETS: EscalationTicket[] = [];

export const INITIAL_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log-root-1',
    timestamp: new Date().toISOString(),
    actorUid: 'Deep123',
    actorEmail: 'deepsingh02414@gmail.com',
    actorRole: 'ADMIN',
    action: 'SOVEREIGN_SYSTEM_INITIALIZED',
    details: 'Master Admin Deep123 initialized with hardware-bound biometric authentication and zero-trust RBAC.',
    targetId: '0xDEEP02414777a829102938401928340192834019',
    txHash: '0x9948210293840192834019283401928340192834019283401928340192834019',
    blockNumber: 1850100,
    ipAddress: '10.240.0.1 (Master Terminal)',
  },
];

// LocalStorage helpers
export const loadUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      let parsed: UserProfile[] = JSON.parse(raw);
      // Ensure master admin is always present and updated to exact specifications
      const adminIdx = parsed.findIndex(
        (u) => u.uid === 'Deep123' || u.email === 'deepsingh02414@gmail.com'
      );
      if (adminIdx >= 0) {
        parsed[adminIdx] = {
          ...parsed[adminIdx],
          ...MASTER_ADMIN,
        };
      } else {
        parsed = [MASTER_ADMIN, ...parsed];
      }

      // Filter out any stale mock demo accounts from previous versions
      const cleaned = parsed.filter(
        (u) =>
          u.uid !== 'ADM-DEL-01' &&
          u.name !== 'Rajesh Sharma, IAS (Joint Secretary)' &&
          u.name !== 'Vikram Mehta (Citizen / Investor)' &&
          u.name !== 'HHFG'
      );

      return cleaned;
    }
  } catch (e) {
    console.error('Error loading users', e);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const saveUsers = (users: UserProfile[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const loadAssets = (): VaultAsset[] => {
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(INITIAL_ASSETS));
  return INITIAL_ASSETS;
};

export const saveAssets = (assets: VaultAsset[]) => {
  localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(assets));
};

export const loadTickets = (): EscalationTicket[] => {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

export const saveTickets = (tickets: EscalationTicket[]) => {
  localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
};

export const loadAuditLogs = (): SystemAuditLog[] => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
};

export const saveAuditLogs = (logs: SystemAuditLog[]) => {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
};

export const recordAuditLog = (params: {
  actorUid: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  details: string;
  targetId: string;
}) => {
  const current = loadAuditLogs();
  const randomHex = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    actorUid: params.actorUid,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    action: params.action,
    details: params.details,
    targetId: params.targetId,
    txHash: '0x' + randomHex,
    blockNumber: 1850200 + Math.floor(Math.random() * 200),
    ipAddress: '10.240.4.' + Math.floor(10 + Math.random() * 80),
  };

  const updated = [newLog, ...current];
  saveAuditLogs(updated);
  return newLog;
};

export const getCurrentUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const setCurrentUserStore = (user: UserProfile | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

/**
 * Administrative action: Toggle block/unblock status for any user
 */
export const toggleBlockUserInStore = (uid: string, block: boolean): UserProfile[] => {
  const users = loadUsers();
  const updated = users.map((u) => {
    if (u.uid === uid) {
      return {
        ...u,
        isBlocked: block,
        status: (block ? 'SUSPENDED' : 'ACTIVE') as 'ACTIVE' | 'SUSPENDED',
      };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

/**
 * Administrative action: Delete user account
 */
export const deleteUserFromStore = (uid: string): UserProfile[] => {
  const users = loadUsers();
  const filtered = users.filter((u) => u.uid !== uid);
  saveUsers(filtered);
  return filtered;
};

/**
 * Administrative action: Update user profile (e.g. set password, status, details)
 */
export const updateUserInStore = (uid: string, updates: Partial<UserProfile>): UserProfile[] => {
  const users = loadUsers();
  const updated = users.map((u) => {
    if (u.uid === uid) {
      return { ...u, ...updates };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

/**
 * Send direct administrative message to an officer/auditor/user
 */
export const sendDirectMessage = (
  recipientUid: string,
  message: DirectMessage
): UserProfile[] => {
  const users = loadUsers();
  const updated = users.map((u) => {
    if (u.uid === recipientUid) {
      return {
        ...u,
        directMessages: [...(u.directMessages || []), message],
      };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

/**
 * Add an uploaded document to user profile
 */
export const addDocumentToUserProfile = (
  userUid: string,
  doc: UserUploadedDocument
): UserProfile[] => {
  const users = loadUsers();
  const updated = users.map((u) => {
    if (u.uid === userUid) {
      return {
        ...u,
        uploadedDocuments: [doc, ...(u.uploadedDocuments || [])],
      };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

/**
 * Add a registered crypto wallet to user profile
 */
export const addWalletToUserProfile = (
  userUid: string,
  walletAddress: string
): UserProfile[] => {
  const users = loadUsers();
  const updated = users.map((u) => {
    if (u.uid === userUid) {
      const existing = u.registeredWallets || [];
      if (!existing.includes(walletAddress)) {
        return {
          ...u,
          walletAddress: walletAddress,
          registeredWallets: [...existing, walletAddress],
        };
      }
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};
