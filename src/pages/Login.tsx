import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { lang } = useOutletContext<{ lang: 'en' | 'si' }>();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  });

  useEffect(() => {
    if (location.state?.successMsg) {
      setAlert({ show: true, msg: location.state.successMsg, type: 'success' });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (error: any) {
      setAlert({ 
        show: true, 
        msg: error.response?.data?.message || (lang === 'en' ? "Login failed" : "ඇතුළු වීම අසාර්ථකයි"), 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {alert.show && (
        <CustomAlert type={alert.type} message={alert.msg} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      <div className="bg-white/90 backdrop-blur-sm p-12 rounded-[50px] shadow-[0_25px_70px_rgba(0,0,0,0.06)] border border-white w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-[#ff5722] tracking-tight mb-2">
            {lang === 'en' ? 'Welcome Back' : 'නැවතත් සාදරයෙන් පිළිගනිමු'}
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            {lang === 'en' ? 'Please enter your details to login' : 'ඇතුළු වීමට කරුණාකර ඔබගේ විස්තර ලබා දෙන්න'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
              {lang === 'en' ? 'Email Address' : 'ඊමේල් ලිපිනය'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff5722] transition-colors" size={18} />
              <input 
                type="email" required
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="admin@binuproducts.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 ml-1">
              {lang === 'en' ? 'Password' : 'මුරපදය'}
            </label>
            <div className="relative group">
              {/* Clickable Lock Icon to Toggle Visibility */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-5 top-1/2 -translate-y-1/2 z-10 hover:scale-110 active:scale-95 transition-all"
              >
                <Lock className={`transition-colors ${showPassword ? 'text-[#ff5722]' : 'text-gray-300'}`} size={18} />
              </button>
              
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full pl-14 pr-12 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-[#ff5722]/5 focus:border-[#ff5722] outline-none transition-all placeholder:text-gray-300 shadow-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />

              {/* Eye Icon on right for extra clarity */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-orange-200 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 
              <>{lang === 'en' ? 'Login to Dashboard' : 'ඩෑෂ්බෝඩ් එකට ඇතුළු වන්න'} <ArrowRight size={20} /></>
            }
          </button>
        </form>
        
        <p className="mt-10 text-center text-gray-400 text-sm font-medium">
          {lang === 'en' ? "Don't have an account?" : 'ගිණුමක් නොමැතිද?'} 
          <button onClick={() => navigate('/signup')} className="ml-2 text-[#ff5722] font-bold hover:underline transition-all">
            {lang === 'en' ? 'Request Access' : 'ප්‍රවේශය ඉල්ලන්න'}
          </button>
        </p>
      </div>
    </>
  );
};

export default Login;