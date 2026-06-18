import { CheckCircle2, X, AlertCircle } from 'lucide-react';

interface CustomAlertProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const CustomAlert = ({ message, type, onClose }: CustomAlertProps) => {
  const isSuccess = type === 'success';

  return (
    // 1. FULL SCREEN OVERLAY (Dims the background)
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* 2. CENTERED ALERT BOX */}
      <div className={`bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] rounded-[32px] p-8 flex flex-col items-center text-center gap-4 min-w-[380px] max-w-md border border-gray-100 animate-in zoom-in-95 duration-300`}>
        
        {/* 3. LARGE ICON AT TOP */}
        <div className={`${isSuccess ? 'bg-orange-50' : 'bg-red-50'} p-4 rounded-full mb-2`}>
          {isSuccess ? (
            <CheckCircle2 className="text-orange-600" size={48} />
          ) : (
            <AlertCircle className="text-red-600" size={48} />
          )}
        </div>

        {/* 4. TEXT CONTENT */}
        <div className="space-y-2">
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSuccess ? 'Success!' : 'Oops!'}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* 5. BIG ACTION BUTTON */}
        <button 
          onClick={onClose} 
          className={`mt-4 w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg ${
            isSuccess ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'
          }`}
        >
          {isSuccess ? 'OK' : 'OK'}
        </button>

        {/* Optional: Small close X at the top right */}
        <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};