import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface CustomAlertProps {
  message: string;
  type: 'success' | 'error' | 'confirm';
  onClose: () => void;
  onConfirm?: () => void; // New prop for Yes action
}

export const CustomAlert = ({ message, type, onClose, onConfirm }: CustomAlertProps) => {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.2)] rounded-[32px] p-8 flex flex-col items-center text-center gap-4 min-w-[380px] max-w-md border border-gray-100 animate-in zoom-in-95 duration-300">
        
        {/* Icon Logic */}
        <div className={`${isSuccess ? 'bg-orange-50' : isError ? 'bg-red-50' : 'bg-blue-50'} p-4 rounded-full mb-2`}>
          {isSuccess ? <CheckCircle2 className="text-orange-600" size={48} /> : 
           isError ? <AlertCircle className="text-red-600" size={48} /> : 
           <HelpCircle className="text-blue-600" size={48} />}
        </div>

        <div className="space-y-2">
          <h4 className="text-2xl font-black text-slate-800 tracking-tight">
            {isSuccess ? 'Success!' : isError ? 'Oops!' : 'Are you sure?'}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 mt-4">
          {isConfirm ? (
            <>
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200">No</button>
              <button onClick={() => { onConfirm?.(); onClose(); }} className="flex-1 py-4 rounded-2xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg">Yes</button>
            </>
          ) : (
            <button onClick={onClose} className="w-full py-4 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg">OK</button>
          )}
        </div>
      </div>
    </div>
  );
};