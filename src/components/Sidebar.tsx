import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  PackageSearch,
  ShoppingCart,
  Users, 
  BarChart3, 
  LogOut,
  TrendingDown,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Supplier Management', icon: <Truck size={20} />, path: '/suppliers' },
    { name: 'Purchase Management', icon: <ShoppingCart size={20} />, path: '/purchases' },
    { name: 'Inventory Management', icon: <PackageSearch size={20} />, path: '/inventory' },
    { name: 'Sales Management', icon: <TrendingUp size={20} />, path: '/sales' },
    { name: 'Expense Management', icon: <TrendingDown size={20} />, path: '/expenses' },
    { name: 'Sales Reps Management', icon: <Users size={20} />, path: '/sales-reps' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    // 1. Changed background to a rich Slate/Black instead of full Orange
    <div className="w-80 h-screen bg-[#0f172a] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-gray-800">
      
      {/* Brand Logo */}
      <div className="p-8 flex flex-col items-center text-center">
        
        <h1 className="text-xl font-black italic tracking-tighter text-white uppercase mt-2">
          Binu <span className="text-[#ff5722]">Products</span>
        </h1>
        <p className="text-[9px] bg-[#ff5722]/20 px-3 py-1 rounded-full text-orange-200 uppercase tracking-[0.2em] font-bold mt-2 border border-[#ff5722]/30">
          Management System
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-[#ff5722] text-white shadow-lg shadow-[#ff5722]/20' // Active = Orange
                : 'text-gray-400 hover:bg-slate-800 hover:text-white' // Inactive = Gray text, subtle hover
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-wide">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;