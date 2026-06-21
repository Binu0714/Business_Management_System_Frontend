import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, UserCircle, X, Save, Key, User, Loader2, Lock } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

const MainLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [lang, setLang] = useState<'en' | 'si'>('en');
  
  // Modal & Edit States
  const [isModalOpen, setIsFormOpen] = useState(false);
  
  // Updated State: Includes currentPassword and newPassword separately
  const [formData, setFormData] = useState({ 
    fullName: user.fullName || '', 
    currentPassword: '', 
    newPassword: '',
    email: user.email // Required for backend REST verification
  });
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/auth/profile/${user.uid}`, formData);
      
      // Update local storage so header updates instantly
      const updatedUser = { ...user, fullName: formData.fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setAlert({ show: true, msg: "Profile updated successfully!", type: 'success' });
      setIsFormOpen(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' })); // Reset password fields
    } catch (err: any) {
      setAlert({ show: true, msg: err.response?.data?.message || "Update failed", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#f8faff] flex font-inter overflow-hidden">
      <Sidebar />

      {/* Custom Alert */}
      {alert.show && createPortal(
        <CustomAlert type={alert.type} message={alert.msg} onClose={() => setAlert({ ...alert, show: false })} />,
        document.body
      )}

      {/* --- FULL SCREEN BLURRED PROFILE MODAL --- */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-gray-100 relative animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <UserCircle className="text-[#ff5722]" /> Profile Settings
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-semibold text-slate-800" 
                    value={formData.fullName} 
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Enter current password..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm" 
                    value={formData.currentPassword} 
                    onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                    required={formData.newPassword.length > 0} // Only required if changing password
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    placeholder="Enter new password..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm" 
                    value={formData.newPassword} 
                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Right side container */}
      <div className="flex-1 flex flex-col ml-80 overflow-hidden"> 
        
        {/* Header - Fixed at top */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 shrink-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff5722] transition-colors" size={18} />
            <input 
              placeholder={"Search snacks, factories..."} 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" 
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Language Toggle */}
            <div className="bg-[#ff5722] p-1 rounded-full flex items-center shadow-lg border border-orange-400/20">
                <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'en' ? 'bg-white text-[#ff5722] shadow-md' : 'text-white hover:bg-white/10'}`}>English</button>
                <button onClick={() => setLang('si')} className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${lang === 'si' ? 'bg-white text-[#ff5722] shadow-md' : 'text-white hover:bg-white/10'}`}>සිංහල</button>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

            {/* Profile Section (Trigger Modal on Click) */}
            <div onClick={() => setIsFormOpen(true)} className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none">{user.fullName || 'Admin'}</p>
                <p className="text-[10px] text-[#ff5722] font-bold uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-[#ff5722] border-2 border-orange-200 group-hover:border-[#ff5722] transition-colors shadow-inner">
                <UserCircle size={28} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-10 animate-in fade-in duration-500">
          <Outlet context={{ lang }} /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;