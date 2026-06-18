import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  PackageSearch, 
  Users, 
  BarChart3, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Suppliers', icon: <Truck size={20} />, path: '/suppliers' },
    { name: 'Inventory', icon: <PackageSearch size={20} />, path: '/inventory' },
    { name: 'Sales Reps', icon: <Users size={20} />, path: '/sales-reps' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="w-80 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-40">
      {/* Brand Logo */}
      <div className="p-8">
        <h1 className="text-2xl font-black italic tracking-tighter text-orange-500">
          BINU <span className="text-white">ERP</span>
        </h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Management System</p>
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
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`}>
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
          className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;