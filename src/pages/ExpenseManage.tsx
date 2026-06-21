import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, Receipt, Calendar, DollarSign, FileText } from 'lucide-react'; // Added Edit2
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';
import type { ExpenseItem } from '../types/expense';

const ExpenseManage = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [formData, setFormData] = useState({ date: '', description: '', price: '' });
  const [editId, setEditId] = useState<string | null>(null); // Track active editing ID
  
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'confirm'; id?: string }>({
    show: false, msg: '', type: 'success'
  });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch {
      setAlert({ show: true, msg: "Failed to load expenses.", type: 'error' });
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        // BACKEND PUT CALL
        await api.put(`/expenses/${editId}`, formData);
        setAlert({ show: true, msg: "Expense updated successfully!", type: 'success' });
        setEditId(null);
      } else {
        // BACKEND POST CALL
        await api.post('/expenses', formData);
        setAlert({ show: true, msg: "Expense saved successfully!", type: 'success' });
      }
      setFormData({ date: '', description: '', price: '' });
      fetchExpenses();
    } catch {
      setAlert({ show: true, msg: "Failed to save expense.", type: 'error' });
    }
  };

  const startEdit = (expense: ExpenseItem) => {
    setFormData({
      date: expense.date,
      description: expense.description,
      price: expense.price.toString()
    });
    setEditId(expense.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to the form
  };

  const confirmDeleteExpense = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setAlert({ show: true, msg: "Expense deleted successfully!", type: 'success' });
      fetchExpenses();
    } catch {
      setAlert({ show: true, msg: "Failed to delete expense.", type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {alert.show && (
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({ ...alert, show: false })} 
          onConfirm={alert.type === 'confirm' && alert.id ? () => confirmDeleteExpense(alert.id!) : undefined}
        />
      )}

      {/* 1. TOP SECTION: FORM */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Receipt className="text-[#ff5722]" /> {editId ? 'Edit Expense Details' : 'Add New Expense'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="date" 
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" 
                  placeholder="e.g., Office Electricity" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Price (LKR)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" 
                  placeholder="0.00" 
                  value={formData.price === '' ? '' : formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            {editId && (
              <button 
                type="button" 
                onClick={() => { setEditId(null); setFormData({ date: '', description: '', price: '' }); }}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="px-8 py-3 bg-[#ff5722] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100">
              <Save size={16} /> {editId ? 'Update Expense' : 'Save Expense'}
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
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 text-sm text-slate-600">{e.date}</td>
                <td className="p-6 font-bold text-slate-800">{e.description}</td>
                <td className="p-6 font-bold text-[#ff5722]">LKR {e.price.toLocaleString()}</td>
                <td className="p-6 flex justify-end gap-2">
                  {/* Edit Button */}
                  <button 
                    onClick={() => startEdit(e)} 
                    className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  {/* Delete Button */}
                  <button 
                    onClick={() => setAlert({ show: true, msg: "Are you sure you want to delete this expense record?", type: 'confirm', id: e.id })}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseManage;