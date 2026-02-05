import React, { useState } from 'react';
import { useGroup } from '../context/GroupContext';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { groupInfo, updateGroupInfo } = useGroup();
  
  // Local state for form inputs
  const [name, setName] = useState(groupInfo.name);
  const [subtext, setSubtext] = useState(groupInfo.subtext);
  const [image, setImage] = useState(groupInfo.image);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateGroupInfo({ name, subtext, image });
    alert('Settings Saved!');
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
            <img src={image} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
            <div>
                <h3 className="font-bold text-[#111b21]">{name}</h3>
                <p className="text-sm text-gray-500">{subtext}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtext (Invite Line)</label>
            <input 
              type="text" 
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input 
              type="text" 
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Use a direct image link (e.g., https://picsum.photos/200)</p>
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
