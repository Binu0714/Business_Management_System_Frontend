import React, { useState, useEffect } from 'react';
import { Trash2, Save, Receipt, Calendar, DollarSign, FileText } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ExpenseManage = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [formData, setFormData] = useState({ date: '', description: '', price: '' });

  const fetchExpenses = async () => {
    const snapshot = await getDocs(collection(db, 'expenses'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExpenses(data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'expenses'), {
      ...formData,
      price: parseFloat(formData.price),
      createdAt: new Date().toISOString()
    });
    setFormData({ date: '', description: '', price: '' });
    fetchExpenses();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. TOP SECTION: FORM */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Receipt className="text-[#ff5722]" /> Add New Expense
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" placeholder="e.g., Office Electricity" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Price (LKR)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="number" className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-8 py-3 bg-[#ff5722] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100">
              <Save size={16} /> Save Expense
            </button>
          </div>
        </form>
      </div>

      {/* 2. BOTTOM SECTION: TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
              <th className="p-6">Date</th>
              <th className="p-6">Description</th>
              <th className="p-6">Price</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 text-sm text-slate-600">{e.date}</td>
                <td className="p-6 font-bold text-slate-800">{e.description}</td>
                <td className="p-6 font-bold text-[#ff5722]">LKR {e.price.toLocaleString()}</td>
                <td className="p-6 flex justify-end gap-2">
                  <button onClick={() => deleteDoc(doc(db, 'expenses', e.id)).then(fetchExpenses)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExpenseManage;