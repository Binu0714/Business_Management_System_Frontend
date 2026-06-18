import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, UserCircle } from 'lucide-react';

const MainLayout = () => {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-[#f8faff] flex font-inter">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Side */}
      <div className="flex-1 flex flex-col ml-80"> {/* ml-64 matches Sidebar width */}
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-orange-500 transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-10 w-[1px] bg-gray-100 mx-2"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-800 leading-none">{user.fullName || 'Admin'}</p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-inner">
                <UserCircle size={28} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Slot */}
        <main className="p-10 animate-in fade-in duration-500">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;