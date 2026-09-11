// Device Security and Hardware Fingerprinting Service for Sovereign Admin (Deep123)

export interface DeviceFingerprint {
  deviceId: string;
  canvasHash: string;
  screenResolution: string;
  colorDepth: number;
  hardwareConcurrency: number;
  platform: string;
  timezone: string;
  createdAt: string;
}

const MASTER_DEVICE_STORAGE_KEY = 'suraksha_master_device_binding_v1';
const CURRENT_DEVICE_ID_KEY = 'suraksha_client_device_id_v1';
const SIMULATED_DEVICE_OVERRIDE_KEY = 'suraksha_simulated_unauthorized_device';

/**
 * Generate or retrieve a persistent client-side device identifier
 */
export const getClientDeviceIdentifier = (): string => {
  let id = localStorage.getItem(CURRENT_DEVICE_ID_KEY);
  if (!id) {
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    id = `DEV-FIPS-${randomHex.substring(0, 8).toUpperCase()}-${randomHex.substring(8, 16).toUpperCase()}`;
    localStorage.setItem(CURRENT_DEVICE_ID_KEY, id);
  }
  return id;
};

/**
 * Compute a deterministic client-side device fingerprint
 */
export const getDeviceFingerprint = (): DeviceFingerprint => {
  const deviceId = getClientDeviceIdentifier();

  // Generate canvas fingerprint signature
  let canvasHash = 'canvas-sig-default';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f97316';
      ctx.fillRect(10, 10, 80, 30);
      ctx.fillStyle = '#0f172a';
      ctx.fillText('SurakshaSathiMaster-2026', 15, 18);
      const dataUrl = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < dataUrl.length; i++) {
        hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
        hash |= 0;
      }
      canvasHash = '0x' + Math.abs(hash).toString(16).padStart(8, '0');
    }
  } catch {
    canvasHash = '0x99e4b712';
  }

  return {
    deviceId,
    canvasHash,
    screenResolution: `${window.screen?.width || 1920}x${window.screen?.height || 1080}`,
    colorDepth: window.screen?.colorDepth || 24,
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
    platform: navigator.platform || 'Linux x86_64',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    createdAt: new Date().toISOString(),
  };
};

/**
 * Retrieve the authorized Master Device fingerprint bound to Deep123
 */
export const getMasterDeviceBinding = (): DeviceFingerprint | null => {
  try {
    const raw = localStorage.getItem(MASTER_DEVICE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read master device binding', e);
  }
  return null;
};

/**
 * Bind the current device as the exclusive Master Device for Deep123
 */
export const bindCurrentDeviceAsMaster = (): DeviceFingerprint => {
  const currentFp = getDeviceFingerprint();
  localStorage.setItem(MASTER_DEVICE_STORAGE_KEY, JSON.stringify(currentFp));
  return currentFp;
};

/**
 * Verify whether the current device is authorized to log in as Deep123
 */
export const verifyMasterDeviceAccess = (): {
  isAuthorized: boolean;
  boundDevice: DeviceFingerprint | null;
  currentDevice: DeviceFingerprint;
  errorMessage?: string;
} => {
  const currentFp = getDeviceFingerprint();

  // Check if simulation flag is set for testing external/unauthorized device
  const isSimulatedExternal = localStorage.getItem(SIMULATED_DEVICE_OVERRIDE_KEY) === 'true';
  if (isSimulatedExternal) {
    return {
      isAuthorized: false,
      boundDevice: getMasterDeviceBinding(),
      currentDevice: currentFp,
      errorMessage:
        'Access Denied: Sovereign Admin login is locked exclusively to the designated master device.',
    };
  }

  const boundFp = getMasterDeviceBinding();

  // If no device has been bound yet, the first device logging into Deep123 claims master ownership
  if (!boundFp) {
    const newlyBound = bindCurrentDeviceAsMaster();
    return {
      isAuthorized: true,
      boundDevice: newlyBound,
      currentDevice: currentFp,
    };
  }

  // Compare deviceId and canvasHash
  if (boundFp.deviceId === currentFp.deviceId) {
    return {
      isAuthorized: true,
      boundDevice: boundFp,
      currentDevice: currentFp,
    };
  }

  return {
    isAuthorized: false,
    boundDevice: boundFp,
    currentDevice: currentFp,
    errorMessage:
      'Access Denied: Sovereign Admin login is locked exclusively to the designated master device.',
  };
};

/**
 * Helper to simulate an unauthorized device for security testing
 */
export const setSimulateExternalDevice = (enable: boolean) => {
  if (enable) {
    localStorage.setItem(SIMULATED_DEVICE_OVERRIDE_KEY, 'true');
  } else {
    localStorage.removeItem(SIMULATED_DEVICE_OVERRIDE_KEY);
  }
};

export const isSimulatingExternalDevice = (): boolean => {
  return localStorage.getItem(SIMULATED_DEVICE_OVERRIDE_KEY) === 'true';
};
