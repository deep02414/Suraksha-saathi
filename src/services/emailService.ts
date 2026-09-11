import { DispatchedEmail, UserRole } from '../types';

const EMAIL_STORAGE_KEY = 'suraksha_sathi_dispatched_emails_v2';

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
  // Simulate network dispatch delay for NodeMailer
  await new Promise((resolve) => setTimeout(resolve, 600));

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
Portal URL: https://surakshasathi.gov.in/officer-login
Authorized By: ${params.senderRole} (${params.senderEmail})

INSTRUCTIONS FOR FIRST LOGIN:
1. Navigate to the Officer Login Portal.
2. Enter your assigned Login ID or Official Email and the Security Password provided above.
3. Your role-specific dashboard will load automatically.
4. Do not share your credentials under Section 65B of the IT Act.

Regards,
Security Operations Center (SOC)
सुरक्षा साथी (Suraksha Sathi) Sovereign System`;

  const newEmail: DispatchedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
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

  const existing = getDispatchedEmails();
  const updated = [newEmail, ...existing];
  saveDispatchedEmails(updated);

  return newEmail;
};

/**
 * Creates a mailto: link for the dispatched email so the sender can send it
 * directly through their device's default email client (Gmail, Outlook, etc.)
 */
export const createMailtoUrl = (email: DispatchedEmail): string => {
  const subject = encodeURIComponent(email.subject);
  const body = encodeURIComponent(email.previewBody);
  return `mailto:${email.recipientEmail}?subject=${subject}&body=${body}`;
};

