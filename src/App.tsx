import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  VaultAsset,
  EscalationTicket,
  SystemAuditLog,
  DispatchedEmail,
  TamperAnalysisResult,
} from './types';
import {
  loadUsers,
  loadUsersAsync, // Async backend API fetcher import kiya
  saveUsers,
  loadAssets,
  saveAssets,
  loadTickets,
  saveTickets,
  loadAuditLogs,
  saveAuditLogs,
  getCurrentUser,
  setCurrentUserStore,
} from './services/store';
import { getDispatchedEmails } from './services/emailService';

// Government Layout Components
import { GovernmentTopBar } from './components/GovernmentTopBar';
import { HeaderNavbar } from './components/HeaderNavbar';
import { FooterView } from './components/FooterView';

// Primary Views
import { HomePageView } from './components/HomePageView';
import { CitizenLoginView } from './components/CitizenLoginView';
import { OfficerLoginView } from './components/OfficerLoginView';
import { RBACCommandPortal } from './components/RBACCommandPortal';
import { CitizenPortalView } from './components/CitizenPortalView';
import { AITamperDetectorView } from './components/AITamperDetectorView';
import { PublicAssetVerifierView } from './components/PublicAssetVerifierView';
import { BlockchainExplorerView } from './components/BlockchainExplorerView';

// Modals
import { RegisterAssetModal } from './components/RegisterAssetModal';
import { OnboardOfficerModal } from './components/OnboardOfficerModal';
import { SearchRegistryModal } from './components/SearchRegistryModal';
import { EmailOutboxModal } from './components/EmailOutboxModal';
import { SmartContractViewer } from './components/SmartContractViewer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>([]);
  const [escalationTickets, setEscalationTickets] = useState<EscalationTicket[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>([]);

  // Navigation State
  const [activeView, setActiveView] = useState<string>('OVERVIEW');

  // Modals State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRegisterAssetOpen, setIsRegisterAssetOpen] = useState(false);
  const [isOnboardOfficerOpen, setIsOnboardOfficerOpen] = useState(false);
  const [isEmailsOpen, setIsEmailsOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);

  // Load initial data (MongoDB Backend Fetch Included)
  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. First fetch live users from MongoDB backend API
      let loadedUsers: UserProfile[] = [];
      try {
        loadedUsers = await loadUsersAsync();
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local storage:', err);
        loadedUsers = loadUsers();
      }

      // 2. Load other local state datasets
      const loadedAssets = loadAssets();
      const loadedTickets = loadTickets();
      const loadedAuditLogs = loadAuditLogs();
      const loadedEmails = getDispatchedEmails();
      const activeUser = getCurrentUser();

      setUsersList(loadedUsers);
      setVaultAssets(loadedAssets);
      setEscalationTickets(loadedTickets);
      setAuditLogs(loadedAuditLogs);
      setDispatchedEmails(loadedEmails);
      setCurrentUser(activeUser);

      // Route based on active session
      if (activeUser?.role === 'USER') {
        setActiveView('CITIZEN');
      } else if (
        activeUser?.role === 'ADMIN' ||
        activeUser?.role === 'OFFICER' ||
        activeUser?.role === 'AUDITOR'
      ) {
        setActiveView('RBAC');
      } else {
        setActiveView('OVERVIEW');
      }
    };

    fetchInitialData();
  }, []);

  // Keyboard shortcut: ⌘K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleUpdateUsers = (newUsers: UserProfile[]) => {
    setUsersList(newUsers);
    saveUsers(newUsers);
  };

  const handleUpdateAssets = (newAssets: VaultAsset[]) => {
    setVaultAssets(newAssets);
    saveAssets(newAssets);
  };

  const handleUpdateTickets = (newTickets: EscalationTicket[]) => {
    setEscalationTickets(newTickets);
    saveTickets(newTickets);
  };

  const handleAddAuditLog = (newLog: SystemAuditLog) => {
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveAuditLogs(updated);
  };

  const handleSwitchRole = (role: UserRole) => {
    const matched = usersList.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      setCurrentUserStore(matched);
      if (role === 'USER') {
        setActiveView('CITIZEN');
      } else {
        setActiveView('RBAC');
      }
    }
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentUserStore(user);
    const updatedUsers = loadUsers();
    setUsersList(updatedUsers);

    if (user.role === 'USER') {
      setActiveView('CITIZEN');
    } else {
      setActiveView('RBAC');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserStore(null);
    setActiveView('OVERVIEW');
  };

  const handleAssetRegistered = (newAsset: VaultAsset) => {
    const updated = [newAsset, ...vaultAssets];
    handleUpdateAssets(updated);

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUid: currentUser?.uid || 'GUEST',
      actorEmail: currentUser?.email || 'guest@vault.in',
      actorRole: currentUser?.role || 'USER',
      action: 'MINT_SOVEREIGN_NFT_ASSET',
      details: `Minted NFT #${newAsset.nftTokenId} for "${newAsset.title}". Anchored SHA-256 to Polygon Amoy.`,
      targetId: newAsset.id,
      txHash: newAsset.txHash,
      blockNumber: newAsset.blockNumber,
      ipAddress: '10.240.3.88',
    };
    handleAddAuditLog(log);
  };

  const handleOfficerOnboarded = (newOfficer: UserProfile) => {
    const updated = [newOfficer, ...usersList];
    handleUpdateUsers(updated);

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUid: currentUser?.uid || 'ADM-DEL-01',
      actorEmail: currentUser?.email || 'officer@suraksha.gov.in',
      actorRole: currentUser?.role || 'ADMIN',
      action: 'ONBOARD_DESIGNATED_OFFICER',
      details: `Provisioned Officer ${newOfficer.name} (UID: ${newOfficer.uid}, Role: ${newOfficer.role}). Dispatched NodeMailer credentials.`,
      targetId: newOfficer.uid,
      txHash:
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 1849600,
      ipAddress: '10.240.0.12',
    };
    handleAddAuditLog(log);
    setDispatchedEmails(getDispatchedEmails());
  };

  const handleAddDispatchedEmail = (email: DispatchedEmail) => {
    setDispatchedEmails((prev) => [email, ...prev]);
  };

  const handleEscalateTamperResult = (result: TamperAnalysisResult) => {
    const ticket: EscalationTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `ESC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userDid: currentUser?.did || 'did:suraksha:0xa172f883019bca721048bca901238491029e84bc',
      userEmail: currentUser?.email || 'citizen@domain.in',
      userName: currentUser?.name || 'HHFG',
      documentName: result.documentName,
      documentHash: result.documentHash,
      tamperPercentage: result.tamperPercentage,
      riskLevel: result.riskLevel,
      status: 'PENDING_OFFICER_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysisSummary: result.summary,
      previewUrl: result.previewUrl,
    };

    handleUpdateTickets([ticket, ...escalationTickets]);

    const log: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorUid: currentUser?.uid || 'USR-HHFG',
      actorEmail: currentUser?.email || 'citizen@domain.in',
      actorRole: currentUser?.role || 'USER',
      action: 'AI_TAMPER_DISPATCH',
      details: `AI Scan flagged ${result.tamperPercentage}% Tampering on "${result.documentName}". Forwarded to Verification Officer queue (${ticket.ticketNumber}).`,
      targetId: ticket.ticketNumber,
      txHash:
        '0x' +
        Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      blockNumber: 1849700,
      ipAddress: '49.36.128.91',
    };
    handleAddAuditLog(log);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#00BFFF] selection:text-slate-950">
      <GovernmentTopBar
        currentUser={currentUser}
        onNavigate={(view) => setActiveView(view)}
      />

      <HeaderNavbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenEmailsModal={() => setIsEmailsOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      <div className="flex-1 w-full">
        {activeView === 'OVERVIEW' && (
          <HomePageView
            currentUser={currentUser}
            onNavigateToCitizenLogin={() => setActiveView('CITIZEN_LOGIN')}
            onNavigateToOfficerLogin={() => setActiveView('OFFICER_LOGIN')}
            onNavigateView={(view) => setActiveView(view)}
            onOpenEmailsModal={() => setIsEmailsOpen(true)}
            usersList={usersList}
          />
        )}

        {activeView === 'CITIZEN_LOGIN' && (
          <CitizenLoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setActiveView('OVERVIEW')}
            onNavigateOfficerLogin={() => setActiveView('OFFICER_LOGIN')}
            onRegisterCitizen={(newUser) => {
              handleUpdateUsers([...usersList, newUser]);
            }}
            usersList={usersList}
          />
        )}

        {activeView === 'OFFICER_LOGIN' && (
          <OfficerLoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setActiveView('OVERVIEW')}
            onNavigateCitizenLogin={() => setActiveView('CITIZEN_LOGIN')}
            onOpenEmailsModal={() => setIsEmailsOpen(true)}
            usersList={usersList}
          />
        )}

        {activeView === 'CITIZEN' && (
          <CitizenPortalView
            currentUser={
              currentUser || {
                id: 'user-citizen-hhfg',
                uid: 'USR-HHFG',
                email: 'citizen@domain.in',
                name: 'HHFG',
                role: 'USER',
                did: 'did:suraksha:0xa172f883019bca721048bca901238491029e84bc',
                walletAddress: '0xa172f883019bca721048bca901238491029e84bc',
                createdAt: new Date().toISOString(),
                status: 'ACTIVE',
                department: 'Citizen Self-Service Registry',
              }
            }
            assets={vaultAssets}
            escalationTickets={escalationTickets}
            onOpenRegisterAsset={() => setIsRegisterAssetOpen(true)}
            onOpenVerify={() => setActiveView('VERIFY_ASSET')}
            onOpenAiDetector={() => setActiveView('TAMPER_DETECTION')}
            onOpenLedger={() => setActiveView('PUBLIC_LEDGER')}
            onUpdateCurrentUser={(updatedUser) => {
              setCurrentUser(updatedUser);
              setCurrentUserStore(updatedUser);
              const updatedList = usersList.map((u) =>
                u.uid === updatedUser.uid ? updatedUser : u
              );
              handleUpdateUsers(updatedList);
            }}
          />
        )}

        {activeView === 'RBAC' && (
          <RBACCommandPortal
            currentUser={
              currentUser || {
                id: 'user-admin-ias',
                uid: 'ADM-DEL-01',
                email: 'deepsingh02414@gmail.com',
                name: 'Deep Singh (Sovereign Admin)',
                role: 'ADMIN',
                did: 'did:suraksha:0x9f2a8104bca78210e9014bca89104bca7201948b',
                walletAddress: '0x9f2a8104bca78210e9014bca89104bca7201948b',
                createdAt: new Date().toISOString(),
                status: 'ACTIVE',
                department: 'Ministry of Electronics & IT (MeitY)',
                badgeNumber: 'SOV-ADM-01',
              }
            }
            allUsers={usersList}
            onUpdateUsers={handleUpdateUsers}
            auditLogs={auditLogs}
            onAddAuditLog={handleAddAuditLog}
            escalationTickets={escalationTickets}
            onUpdateTickets={handleUpdateTickets}
            vaultAssets={vaultAssets}
            onUpdateAssets={handleUpdateAssets}
            onOpenOnboardOfficer={() => setIsOnboardOfficerOpen(true)}
            onOpenSmartContract={() => setIsContractOpen(true)}
            onOpenEmails={() => setIsEmailsOpen(true)}
            onAddDispatchedEmail={handleAddDispatchedEmail}
          />
        )}

        {activeView === 'TAMPER_DETECTION' && (
          <AITamperDetectorView
            currentUser={currentUser}
            onEscalate={handleEscalateTamperResult}
          />
        )}

        {activeView === 'VERIFY_ASSET' && (
          <PublicAssetVerifierView assets={vaultAssets} />
        )}

        {activeView === 'PUBLIC_LEDGER' && (
          <BlockchainExplorerView
            assets={vaultAssets}
            auditLogs={auditLogs}
          />
        )}
      </div>

      <FooterView
        currentUser={currentUser}
        onNavigate={(view) => setActiveView(view)}
        onOpenSmartContractModal={() => setIsContractOpen(true)}
      />

      <RegisterAssetModal
        currentUser={
          currentUser || {
            id: 'user-citizen-hhfg',
            uid: 'USR-HHFG',
            email: 'citizen@domain.in',
            name: 'HHFG',
            role: 'USER',
            did: 'did:suraksha:0xa172f883019bca721048bca901238491029e84bc',
            walletAddress: '0xa172f883019bca721048bca901238491029e84bc',
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
          }
        }
        isOpen={isRegisterAssetOpen}
        onClose={() => setIsRegisterAssetOpen(false)}
        onAssetRegistered={handleAssetRegistered}
      />

      {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR') && (
        <OnboardOfficerModal
          currentUser={currentUser}
          isOpen={isOnboardOfficerOpen}
          onClose={() => setIsOnboardOfficerOpen(false)}
          onOfficerOnboarded={handleOfficerOnboarded}
        />
      )}

      <SearchRegistryModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={vaultAssets}
        users={usersList}
        auditLogs={auditLogs}
        onNavigate={(view) => setActiveView(view)}
      />

      <EmailOutboxModal
        isOpen={isEmailsOpen}
        onClose={() => setIsEmailsOpen(false)}
        emails={dispatchedEmails}
      />

      <SmartContractViewer
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
      />
    </div>
  );
}
