import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. State
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success'
  });

  // 2. Check for success message from Signup page
  useEffect(() => {
    if (location.state?.successMsg) {
      setAlert({
        show: true,
        msg: location.state.successMsg,
        type: 'success'
      });
      // Clear the state so the alert doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 3. Login Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Talking to your Node.js Backend
      const response = await api.post('/auth/login', formData);
      
      // Store JWT Token & User Info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');
    } catch (error: any) {
      setAlert({
        show: true,
        msg: error.response?.data?.message || "Invalid email or password",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Custom Alert Popup */}
      {alert.show && (
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({ ...alert, show: false })} 
        />
      )}

      {/* Login Card (Animated) */}
      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[50px] shadow-[0_25px_70px_rgba(0,0,0,0.06)] border border-white w-full animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#ff5722] tracking-tight mb-2 ">Welcome Back</h2>
          <p className="text-gray-400 text-sm font-medium">Please enter your details to login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="email" 
                required
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
                required
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
            disabled={loading}
            className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Login to Dashboard <ArrowRight size={20} /></>}
          </button>
        </form>
        
        <p className="mt-10 text-center text-gray-400 text-sm font-medium">
          Don't have an account? <button onClick={() => navigate('/signup')} className="text-[#ff5722] font-bold hover:underline transition-all">Request Access</button>
        </p>
      </div>
    </>
  );
};

export default Login;