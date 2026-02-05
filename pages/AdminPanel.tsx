import React, { useState, useEffect } from 'react';
import { useGroup } from '../context/GroupContext';
import { Save, ArrowLeft, Upload, Link as LinkIcon, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { groupInfo, updateGroupInfo } = useGroup();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Form State
  const [name, setName] = useState(groupInfo.name);
  const [subtext, setSubtext] = useState(groupInfo.subtext);
  const [image, setImage] = useState(groupInfo.image);
  const [groupLink, setGroupLink] = useState(groupInfo.groupLink);

  // Check session storage on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_auth');
    if (sessionAuth === 'true') {
        setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingAuth(true);
    setAuthError('');

    try {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: passwordInput })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
        } else {
            setAuthError('Password salah!');
        }
    } catch (err) {
        setAuthError('Terjadi kesalahan koneksi.');
    } finally {
        setIsCheckingAuth(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupInfo({ name, subtext, image, groupLink });
    alert('Settings Saved!');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <div className="flex justify-center mb-6 text-[#00a884]">
                    <div className="bg-[#dcf8c6] p-4 rounded-full">
                        <Lock size={48} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Admin Access</h2>
                <p className="text-center text-gray-500 mb-6 text-sm">Halaman ini dilindungi password.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Admin</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound size={18} className="text-gray-400" />
                            </div>
                            <input 
                                type="password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
                                placeholder="Masukkan password..."
                                autoFocus
                            />
                        </div>
                    </div>

                    {authError && (
                        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded">
                            <AlertCircle size={16} />
                            {authError}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isCheckingAuth}
                        className="w-full bg-[#00a884] text-white font-bold py-3 rounded-lg hover:bg-[#008f6f] transition disabled:opacity-70 flex justify-center"
                    >
                        {isCheckingAuth ? 'Memeriksa...' : 'Login'}
                    </button>
                    
                    <div className="text-center mt-4">
                        <Link to="/" className="text-sm text-gray-500 hover:text-[#00a884] flex items-center justify-center gap-1">
                            <ArrowLeft size={14} /> Kembali ke Beranda
                        </Link>
                    </div>
                </form>
            </div>
        </div>
      );
  }

  // RENDER ADMIN PANEL IF AUTHENTICATED
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#00a884] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/" className="hover:bg-white/20 p-2 rounded-full transition">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
            <button 
                onClick={() => {
                    setIsAuthenticated(false);
                    sessionStorage.removeItem('admin_auth');
                }}
                className="text-white/80 hover:text-white text-sm font-medium"
            >
                Logout
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Live Preview Snippet */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex items-center gap-4">
            <img src={image} alt="Preview" className="w-16 h-16 rounded-full object-cover shadow-sm" />
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#111b21] truncate">{name}</h3>
                <p className="text-sm text-gray-500 truncate">{subtext}</p>
                <p className="text-xs text-blue-500 truncate mt-1">{groupLink}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
              placeholder="e.g. Family Group"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtext (Invite Line)</label>
            <input 
              type="text" 
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
              placeholder="e.g. WhatsApp Group Invite"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <LinkIcon size={16} /> Destination Link (WhatsApp URL)
            </label>
            <input 
              type="text" 
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
              placeholder="https://chat.whatsapp.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">Users will be redirected here after 'logging in'.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Icon</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                    </div>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#00a884] text-white font-bold py-3 rounded-lg hover:bg-[#008f6f] transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;