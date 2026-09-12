import { DispatchedEmail, UserRole } from '../types';

const EMAIL_STORAGE_KEY = 'suraksha_sathi_dispatched_emails_v2';

// Dynamic API and Portal URL Resolution
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://suraksha-saathi-01.onrender.com';
const PORTAL_URL = window.location.origin || 'https://surakshasathi.gov.in';

export const createMailtoUrl = (email: string, subject: string, body: string): string => {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const generateSecureUID = (role: UserRole): string => {
  const prefix = role === 'AUDITOR' ? 'AUD' : role === 'OFFICER' ? 'OFF' : 'USR';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};

export const generateTemporaryPassword = (): string => {
  const words = ['Secure', 'Shield', 'Vault', 'Suraksha', 'Crypto', 'Kavach'];
  const symbols = ['@', '#', '$', '!'];
  const word = words[Math.floor(Math.random() * words.length)];
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${word}${symbol}${num}`;
};

export const getDispatchedEmails = (): DispatchedEmail[] => {
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse dispatched emails', e);
  }
  return [];
};

export const saveDispatchedEmails = (emails: DispatchedEmail[]) => {
  localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(emails));
};

export const recordDispatchedEmail = (
  emailData: Omit<DispatchedEmail, 'id' | 'timestamp' | 'status'> & { status?: string }
): DispatchedEmail => {
  const newEmail: DispatchedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    status: (emailData.status as any) || 'DELIVERED',
    ...emailData,
  };
  const existing = getDispatchedEmails();
  saveDispatchedEmails([newEmail, ...existing]);
  return newEmail;
};

// Connected to Render Backend & MongoDB
export const sendOnboardingEmailMock = async (params: {
  senderRole: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName: string;
  recipientRole: UserRole;
  recipientCity?: string;
  generatedUid: string;
  generatedPassword: string;
  extraDetails?: string;
}): Promise<DispatchedEmail> => {
  const roleTitle = params.recipientRole === 'AUDITOR' ? 'Statutory Auditor' : 'Verification Officer';
  const subject = `सुरक्षा साथी (Suraksha Sathi): Official Credentials for ${roleTitle}`;

  const previewBody = `Dear ${params.recipientName},

Your authorized credentials for the "सुरक्षा साथी" (Suraksha Sathi) Sovereign Blockchain Platform have been generated and provisioned.

==================================================
CREDENTIAL DETAILS (STRICTLY CONFIDENTIAL)
==================================================
Assigned Role: ${params.recipientRole}
Official Login ID / UID: ${params.generatedUid}
Security Password: ${params.generatedPassword}
Official Email: ${params.recipientEmail}
${params.recipientCity ? `Designated City / Station: ${params.recipientCity}\n` : ''}${params.extraDetails ? `Department: ${params.extraDetails}\n` : ''}
Portal URL: ${PORTAL_URL}/officer-login
Authorized By: ${params.senderRole} (${params.senderEmail})

INSTRUCTIONS FOR FIRST LOGIN:
1. Navigate to the Officer Login Portal.
2. Enter your assigned Login ID or Official Email and the Security Password provided above.
3. Your role-specific dashboard will load automatically.
4. Do not share your credentials under Section 65B of the IT Act.

Regards,
Security Operations Center (SOC)
सुरक्षा साथी (Suraksha Sathi) Sovereign System`;

  const payload = {
    senderRole: params.senderRole,
    senderEmail: params.senderEmail,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    recipientRole: params.recipientRole,
    recipientCity: params.recipientCity,
    generatedUid: params.generatedUid,
    generatedPassword: params.generatedPassword,
    subject,
    previewBody,
    status: 'DELIVERED',
  };

  // 1. Render Live Backend Ko Hit Karein
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      const serverData = json.data;
      const dispatched: DispatchedEmail = {
        id: serverData._id || `email-${Date.now()}`,
        timestamp: serverData.timestamp || new Date().toISOString(),
        ...payload,
      };
      // Backup to localStorage for sync UI
      const existing = getDispatchedEmails();
      saveDispatchedEmails([dispatched, ...existing]);
      return dispatched;
    }
  } catch (err) {
    console.warn('Backend server unavailable, falling back to client store', err);
  }

  // Fallback local save agar server unavailable ho
  const newEmail: DispatchedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    ...payload,
  };
  const existing = getDispatchedEmails();
  saveDispatchedEmails([newEmail, ...existing]);
  return newEmail;
};
