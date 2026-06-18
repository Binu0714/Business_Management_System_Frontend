import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, UserCircle, Plus, ChevronDown } from 'lucide-react';

const MainLayout = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [lang, setLang] = useState<'en' | 'si'>('en');

  return (
    // 1. Parent container is h-screen and overflow-hidden to lock it to the window
    <div className="h-screen bg-[#f8faff] flex font-inter overflow-hidden">
      <Sidebar />

      {/* 2. Right side container (Flex column) */}
      <div className="flex-1 flex flex-col ml-80 overflow-hidden"> 
        
        {/* 3. Header - Fixed at top (shrink-0 prevents it from squishing) */}
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
                <button 
                    onClick={() => setLang('en')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                        lang === 'en' ? 'bg-white text-[#ff5722] shadow-md' : 'text-white hover:bg-white/10'
                    }`}
                    >
                    English
                </button>
                <button 
                    onClick={() => setLang('si')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                        lang === 'si' ? 'bg-white text-[#ff5722] shadow-md' : 'text-white hover:bg-white/10'
                    }`}
                    >
                    සිංහල
                </button>
            </div>
            
            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

            {/* Profile Section */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-black text-slate-800 leading-none">{user.fullName || 'Admin'}</p>
                <p className="text-[10px] text-[#ff5722] font-bold uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-[#ff5722] border-2 border-orange-200 group-hover:border-[#ff5722] transition-colors">
                <UserCircle size={28} />
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* 4. Scrollable Main Area */}
        {/* flex-1 lets it fill the space, overflow-y-auto enables internal scroll */}
        <main className="flex-1 overflow-y-auto p-10 animate-in fade-in duration-500">
          <Outlet context={{ lang }} /> 
        </main>
      </div>
    </div>
  );
};

export default MainLayout;