import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in...", formData);
  };

  return (
    <AuthLayout title="" subtitle="">
      {/* Enhanced Card with Glassmorphism Border */}
      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[50px] shadow-[0_25px_70px_rgba(0,0,0,0.06)] border border-white w-full">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#ff5722] tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-medium">Please enter your details to login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="email" 
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="admin@binuproducts.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="password" 
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-2">
            <label className="flex items-center gap-2 text-gray-500 font-bold cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-200 accent-[#ff5722]" />
              Remember me
            </label>
            <a href="#" className="text-[#ff5722] font-bold hover:underline">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200"
          >
            Login to Dashboard <ArrowRight size={20} />
          </button>
        </form>
        
        <p className="mt-10 text-center text-gray-400 text-sm font-medium">
          Don't have an account? <a href="/signup" className="text-[#ff5722] font-bold hover:underline">Request Access</a>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;