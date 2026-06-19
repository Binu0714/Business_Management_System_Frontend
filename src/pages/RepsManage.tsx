import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, Users, Hash } from 'lucide-react';
import api from '../services/api'; 
import { CustomAlert } from '../components/CustomAlert';
import type { SalesRep } from '../types/Rep';

const RepsManage = () => {
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [formData, setFormData] = useState({ repId: '', name: '', address: '', contactNo: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'confirm'; id?: string }>({
    show: false, msg: '', type: 'success'
  });

  const fetchReps = async () => {
    try {
      // BACKEND CALL
      const res = await api.get('/reps');
      setReps(res.data.sort((a: SalesRep, b: SalesRep) => a.repId.localeCompare(b.repId)));
    } catch (err) {
      setAlert({ show: true, msg: "Failed to fetch Sales Reps", type: 'error' });
    }
  };

  useEffect(() => { fetchReps(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        // BACKEND UPDATE CALL
        await api.put(`/reps/${editId}`, formData);
        setAlert({ show: true, msg: "Rep updated successfully!", type: 'success' });
      } else {
        // BACKEND CREATE CALL
        await api.post('/reps', formData);
        setAlert({ show: true, msg: "New Rep registered!", type: 'success' });
      }
      setFormData({ repId: '', name: '', address: '', contactNo: '' });
      setEditId(null);
      fetchReps();
    } catch (err: any) {
      setAlert({ show: true, msg: err.response?.data?.message || "Action failed", type: 'error' });
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      // BACKEND DELETE CALL
      await api.delete(`/reps/${id}`);
      setAlert({ show: true, msg: "Sales Rep deleted!", type: 'success' });
      fetchReps();
    } catch {
      setAlert({ show: true, msg: "Delete failed", type: 'error' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {alert.show && (
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({...alert, show: false})}
          onConfirm={alert.type === 'confirm' && alert.id ? () => confirmDelete(alert.id!) : undefined}
        />
      )}
      
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Users className="text-[#ff5722]" /> {editId ? 'Edit Sales Rep' : 'Register New Sales Rep'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Rep ID</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Auto-generated" value={editId ? formData.repId : 'Auto-generated'} disabled />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Rep Name</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Address</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Contact Number</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Contact No" value={formData.contactNo} onChange={e => setFormData({...formData, contactNo: e.target.value})} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setFormData({repId: '', name: '', address: '', contactNo: ''})}} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm">Cancel</button>
            )}
            <button type="submit" className="px-8 py-3 bg-[#ff5722] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100">
              <Save size={16} /> {editId ? 'Update' : 'Save Rep'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
              <th className="p-6">Rep ID</th>
              <th className="p-6">Name</th>
              <th className="p-6">Address</th>
              <th className="p-6">Contact Number</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reps.map(s => (
              <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 font-bold text-[#ff5722]">{s.repId}</td>
                <td className="p-6 font-bold text-slate-800">{s.name}</td>
                <td className="p-6 text-sm text-slate-600">{s.address}</td>
                <td className="p-6 text-sm text-slate-600">{s.contactNo}</td>
                <td className="p-6 flex justify-end gap-2">
                  <button onClick={() => { setEditId(s.id); setFormData(s); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => setAlert({ show: true, msg: "Are you sure you want to delete this Sales Rep?", type: 'confirm', id: s.id })} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepsManage;