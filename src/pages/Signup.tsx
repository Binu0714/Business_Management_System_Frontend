import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      
      navigate('/login', { 
        state: { successMsg: "Admin Account Registered Successfully!" } 
      });

    } catch (error: any) {
      setAlert({ 
        show: true, 
        msg: error.response?.data?.message || "Signup failed", 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alert.show && (
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({ ...alert, show: false })} 
        />
      )}

      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[50px] shadow-[0_25px_70px_rgba(0,0,0,0.06)] border border-white w-full max-w-[480px] mx-auto animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#ff5722] tracking-tight mb-2">Register User</h2>
          <p className="text-gray-400 text-sm font-medium">Create an account for a new Admin or Sales Ref</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="text" 
                required
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="email" 
                required
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="email@binu.com"
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
                required
                minLength={6}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={20} /></>}
          </button>
        </form>
        
        <p className="mt-10 text-center text-gray-400 text-sm font-medium">
          Already have an account? <button onClick={() => navigate('/login')} className="text-[#ff5722] font-bold hover:underline transition-all">Login here</button>
        </p>
      </div>
    </>
  );
};

export default Signup;