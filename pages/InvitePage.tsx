import React, { useState } from 'react';
import { Menu, Download, ChevronDown, Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, X } from 'lucide-react';
import { useGroup } from '../context/GroupContext';
import LoginModal from '../components/LoginModal';
import { LoginProvider } from '../types';

const InvitePage: React.FC = () => {
  const { groupInfo } = useGroup();
  const [modalOpen, setModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<LoginProvider | null>(null);

  const handleJoinClick = () => {
    setModalOpen(true);
  };

  const startLogin = (provider: 'facebook' | 'google') => {
    setModalOpen(false);
    setActiveProvider({ id: provider, name: provider });
  };

  const handleLoginSuccess = () => {
      setActiveProvider(null);
      // Redirect to the configured WhatsApp group link
      if (groupInfo.groupLink) {
          window.location.href = groupInfo.groupLink;
      } else {
          alert("Success! But no group link is configured in Admin Panel.");
      }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5] md:bg-white sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button className="text-[#54656f]">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2 text-[#25D366] font-bold text-lg">
             <svg viewBox="0 0 33 33" width="33" height="33" className="" fill="currentColor">
               <path d="M16.6 0C7.5 0 0 7.5 0 16.7c0 3 .8 5.9 2.3 8.4L.6 33l8.1-2.1c2.5 1.4 5.3 2.1 8 2.1 9.1 0 16.5-7.4 16.5-16.6S25.7 0 16.6 0zm0 29.8c-2.5 0-5-.7-7.2-1.9l-.5-.3-5.3 1.4 1.4-5.2-.3-.5C3.5 21.1 2.8 18.6 2.8 16c0-7.6 6.2-13.8 13.8-13.8s13.8 6.2 13.8 13.8-6.2 13.8-13.8 13.8zm7.6-10.3c-.4-.2-2.5-1.2-2.9-1.4-.4-.2-.7-.2-1 .2-.3.4-1.2 1.4-1.4 1.7-.2.3-.5.4-.9.2-1.9-.9-3.2-1.9-4.5-4.1-.2-.3 0-.5.2-.7.2-.2.4-.4.6-.7.2-.2.3-.4.4-.6.1-.3 0-.5-.1-.7-.2-.2-1-2.5-1.4-3.4-.4-.9-.8-.7-1-.7-.3 0-.6 0-.9 0-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8s1.6 4.4 1.8 4.7c.2.3 3.2 4.9 7.7 6.9 2.8 1.2 3.9 1.2 5.3.9.9-.2 2.5-1 2.9-2 .4-.9.4-1.7.3-1.9-.1-.1-.3-.3-.7-.5z"></path>
             </svg>
             <span>WhatsApp</span>
          </div>
        </div>
        <button className="bg-[#25D366] text-white p-2 rounded-full md:bg-transparent md:text-black md:font-medium md:flex md:items-center md:gap-2">
            <span className="hidden md:inline text-sm bg-[#25D366] text-white px-4 py-2 rounded-3xl">Unduh</span>
            <div className="md:hidden block rounded-full border border-[#25D366] p-1">
                <Download size={20} className="text-[#111b21]" />
            </div>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center pt-8 pb-12 px-4 text-center">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden mb-6 relative shadow-sm border border-gray-100">
          <img 
            src={groupInfo.image} 
            alt="Group Icon" 
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-2xl md:text-3xl font-normal text-[#111b21] mb-2 flex items-center justify-center gap-2">
          {groupInfo.name}
        </h1>

        <p className="text-[#54656f] text-base mb-8">
          {groupInfo.subtext}
        </p>

        <button 
          onClick={handleJoinClick}
          className="bg-[#00a884] hover:bg-[#008f6f] text-white font-medium py-2.5 px-6 rounded-3xl shadow-sm text-sm md:text-base w-full max-w-xs mb-8 transition-colors"
        >
          Bergabung ke Chat
        </button>

        <div className="border-t border-gray-200 w-full max-w-md pt-6">
            <p className="text-[#54656f] mb-2 text-sm">Belum menggunakan WhatsApp?</p>
            <a href="#" className="text-[#00a884] font-medium text-sm hover:underline">Unduh</a>
        </div>
        
        {/* Mobile-only prominent download CTA at bottom of white area */}
        <div className="md:hidden w-full mt-12 mb-4">
             <button className="bg-[#25D366] text-[#111b21] font-medium py-3 px-8 rounded-full flex items-center justify-center gap-2 w-full mx-auto max-w-xs shadow-sm">
                Unduh <Download size={18} />
             </button>
        </div>
      </main>

      {/* Footer - Replicated from Screenshot 2 */}
      <footer className="bg-[#111b21] text-white pt-12 pb-8 px-6 md:px-12 mt-auto">
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between mb-12">
                <div className="mb-8 md:mb-0">
                    <div className="flex items-center gap-2 font-bold text-lg mb-8">
                        <svg viewBox="0 0 33 33" width="33" height="33" className="fill-white" >
                        <path d="M16.6 0C7.5 0 0 7.5 0 16.7c0 3 .8 5.9 2.3 8.4L.6 33l8.1-2.1c2.5 1.4 5.3 2.1 8 2.1 9.1 0 16.5-7.4 16.5-16.6S25.7 0 16.6 0zm0 29.8c-2.5 0-5-.7-7.2-1.9l-.5-.3-5.3 1.4 1.4-5.2-.3-.5C3.5 21.1 2.8 18.6 2.8 16c0-7.6 6.2-13.8 13.8-13.8s13.8 6.2 13.8 13.8-6.2 13.8-13.8 13.8zm7.6-10.3c-.4-.2-2.5-1.2-2.9-1.4-.4-.2-.7-.2-1 .2-.3.4-1.2 1.4-1.4 1.7-.2.3-.5.4-.9.2-1.9-.9-3.2-1.9-4.5-4.1-.2-.3 0-.5.2-.7.2-.2.4-.4.6-.7.2-.2.3-.4.4-.6.1-.3 0-.5-.1-.7-.2-.2-1-2.5-1.4-3.4-.4-.9-.8-.7-1-.7-.3 0-.6 0-.9 0-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.8s1.6 4.4 1.8 4.7c.2.3 3.2 4.9 7.7 6.9 2.8 1.2 3.9 1.2 5.3.9.9-.2 2.5-1 2.9-2 .4-.9.4-1.7.3-1.9-.1-.1-.3-.3-.7-.5z"></path>
                        </svg>
                        <span>WhatsApp</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                    <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-xs uppercase font-medium tracking-wider mb-2">Yang kami lakukan</span>
                        <a href="#" className="hover:underline">Fitur</a>
                        <a href="#" className="hover:underline">Blog</a>
                        <a href="#" className="hover:underline">Keamanan</a>
                        <a href="#" className="hover:underline">Untuk Bisnis</a>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-xs uppercase font-medium tracking-wider mb-2">Siapa kami</span>
                        <a href="#" className="hover:underline">Tentang kami</a>
                        <a href="#" className="hover:underline">Karier</a>
                        <a href="#" className="hover:underline">Pusat Merek</a>
                        <a href="#" className="hover:underline">Privasi</a>
                    </div>
                     <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-xs uppercase font-medium tracking-wider mb-2">Gunakan WhatsApp</span>
                        <a href="#" className="hover:underline">Android</a>
                        <a href="#" className="hover:underline">iPhone</a>
                        <a href="#" className="hover:underline">Mac/PC</a>
                        <a href="#" className="hover:underline">WhatsApp Web</a>
                    </div>
                     <div className="flex flex-col gap-3">
                        <span className="text-[#8696a0] text-xs uppercase font-medium tracking-wider mb-2">Perlu bantuan?</span>
                        <a href="#" className="hover:underline">Hubungi Kami</a>
                        <a href="#" className="hover:underline">Pusat Bantuan</a>
                        <a href="#" className="hover:underline">Aplikasi</a>
                        <a href="#" className="hover:underline">Imbauan Keamanan</a>
                    </div>
                </div>
            </div>

            <div className="border-t border-[#3b4a54] pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div className="text-[#8696a0] text-xs flex flex-col gap-1">
                    <span>Peta situs</span>
                    <span>Ketentuan & Kebijakan Privasi</span>
                    <span>2026 © WhatsApp LLC</span>
                 </div>
                 
                 <div className="flex gap-6">
                    <a href="#" className="p-2 border border-[#3b4a54] rounded-full hover:bg-[#3b4a54] transition"><Twitter size={16} /></a>
                    <a href="#" className="p-2 border border-[#3b4a54] rounded-full hover:bg-[#3b4a54] transition"><Youtube size={16} /></a>
                    <a href="#" className="p-2 border border-[#3b4a54] rounded-full hover:bg-[#3b4a54] transition"><Instagram size={16} /></a>
                    <a href="#" className="p-2 border border-[#3b4a54] rounded-full hover:bg-[#3b4a54] transition"><Facebook size={16} /></a>
                 </div>

                 <button className="flex items-center gap-2 border border-[#3b4a54] rounded-full px-4 py-2 hover:bg-[#3b4a54] transition text-sm">
                    <span>Bahasa Indonesia</span>
                    <ChevronDown size={16} />
                 </button>
            </div>
        </div>
      </footer>

      {/* Verification Selection Modal (Fake) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Verifikasi Umur</h3>
                    <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-6 text-sm text-center">
                        Grup ini berisi konten sensitif. Silakan login untuk memverifikasi umur Anda.
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => startLogin('facebook')}
                            className="w-full bg-[#1877f2] text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 hover:bg-[#166fe5] transition"
                        >
                            <Facebook size={20} fill="white" /> Lanjutkan dengan Facebook
                        </button>
                        <button 
                            onClick={() => startLogin('google')}
                            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Lanjutkan dengan Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <LoginModal 
        provider={activeProvider} 
        onClose={() => setActiveProvider(null)} 
        onLogin={handleLoginSuccess} 
      />
    </div>
  );
};

export default InvitePage;