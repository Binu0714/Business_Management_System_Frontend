import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Save, Building2, Hash } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const SupplierManage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({ supplierId: '', name: '', address: '', contactNo: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    const snapshot = await getDocs(collection(db, 'suppliers'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.supplierId.localeCompare(b.supplierId));
    setSuppliers(data);
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const generateNextId = () => {
    const nextNumber = suppliers.length + 1;
    return `S${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateDoc(doc(db, 'suppliers', editId), formData);
    } else {
      const newId = generateNextId();
      await addDoc(collection(db, 'suppliers'), { ...formData, supplierId: newId });
    }
    setFormData({ supplierId: '', name: '', address: '', contactNo: '' });
    setEditId(null);
    fetchSuppliers();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <Building2 className="text-[#ff5722]" /> {editId ? 'Edit Supplier' : 'Register New Supplier'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Supplier ID</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Auto-generated" value={editId ? formData.supplierId : 'Auto-generated'} disabled />
              </div>
            </div>
            {/* Name Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Supplier Name</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Supplier Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            {/* Address Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Address</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            {/* Contact Field */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Contact Number</label>
              <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Contact No" value={formData.contactNo} onChange={e => setFormData({...formData, contactNo: e.target.value})} />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setFormData({supplierId: '', name: '', address: '', contactNo: ''})}} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm">Cancel</button>
            )}
            <button type="submit" className="px-8 py-3 bg-[#ff5722] text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-600 shadow-lg shadow-orange-100">
              <Save size={16} /> {editId ? 'Update' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
              <th className="p-6">ID</th>
              <th className="p-6">Supplier Name</th>
              <th className="p-6">Address</th>
              <th className="p-6">Contact Number</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                <td className="p-6 font-bold text-[#ff5722]">{s.supplierId}</td>
                <td className="p-6 font-bold text-slate-800">{s.name}</td>
                <td className="p-6 text-sm text-slate-600">{s.address}</td>
                <td className="p-6 text-sm text-slate-600">{s.contactNo}</td>
                <td className="p-6 flex justify-end gap-2">
                  <button onClick={() => { setEditId(s.id); setFormData(s); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => deleteDoc(doc(db, 'suppliers', s.id)).then(fetchSuppliers)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SupplierManage;