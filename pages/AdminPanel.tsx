import React, { useState } from 'react';
import { useGroup } from '../context/GroupContext';
import { Save, ArrowLeft, Upload, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { groupInfo, updateGroupInfo } = useGroup();
  
  // Local state for form inputs
  const [name, setName] = useState(groupInfo.name);
  const [subtext, setSubtext] = useState(groupInfo.subtext);
  const [image, setImage] = useState(groupInfo.image);
  const [groupLink, setGroupLink] = useState(groupInfo.groupLink);

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

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#00a884] p-6 text-white flex items-center gap-4">
            <Link to="/" className="hover:bg-white/20 p-2 rounded-full transition">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
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