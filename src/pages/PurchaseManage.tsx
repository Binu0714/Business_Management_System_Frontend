import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ShoppingCart, Hash, Calendar } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const PurchaseManage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ supplierId: '', date: '', remarks: '' });
  const [currentItem, setCurrentItem] = useState({ itemName: '', itemId: '', batchNo: '', expDate: '', price: 0, qty: 0 });

  useEffect(() => {
    const fetchSuppliers = async () => {
      const snap = await getDocs(collection(db, 'suppliers'));
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSuppliers();
  }, []);

  const addItem = () => {
    setItems([...items, { ...currentItem, total: currentItem.price * currentItem.qty }]);
    setCurrentItem({ itemName: '', itemId: '', batchNo: '', expDate: '', price: 0, qty: 0 });
  };

  const handleSavePurchase = async () => {
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
    await addDoc(collection(db, 'purchases'), {
      ...formData,
      items,
      grandTotal,
      createdAt: new Date().toISOString()
    });
    setItems([]);
    alert("Purchase Saved!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 1. Header Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingCart className="text-[#ff5722]" /> New Purchase Order
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Supplier</label>
            <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" onChange={e => setFormData({...formData, supplierId: e.target.value})}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Date</label>
            <input type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Remarks</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Remarks" onChange={e => setFormData({...formData, remarks: e.target.value})} />
          </div>
        </div>
      </div>

      {/* 2. Add Items Section */}
      
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
    <h3 className="font-bold text-slate-700 mb-6">Add Items</h3>
    
    {/* Changed grid-cols-2 lg:grid-cols-6 to grid-cols-1 md:grid-cols-3 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Item Name</label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Item Name" value={currentItem.itemName} onChange={e => setCurrentItem({...currentItem, itemName: e.target.value})} />
        </div>

        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Item ID</label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Item ID" value={currentItem.itemId} onChange={e => setCurrentItem({...currentItem, itemId: e.target.value})} />
        </div>

        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Batch No</label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Batch No" value={currentItem.batchNo} onChange={e => setCurrentItem({...currentItem, batchNo: e.target.value})} />
        </div>

        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Expiry Date</label>
        <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" value={currentItem.expDate} onChange={e => setCurrentItem({...currentItem, expDate: e.target.value})} />
        </div>

        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Bought Price</label>
        <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Price" value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: Number(e.target.value)})} />
        </div>

        <div>
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1">Bought Amount</label>
        <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Qty" value={currentItem.qty} onChange={e => setCurrentItem({...currentItem, qty: Number(e.target.value)})} />
        </div>

    </div>

    <button 
        onClick={addItem} 
        className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md"
    >
        <Plus size={18}/> Add Item to Order
    </button>
    </div>

      {/* 3. Items List Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Batch</th>
              <th className="p-4">Price</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-4 font-bold text-sm">{item.itemName}</td>
                <td className="p-4 text-sm">{item.batchNo}</td>
                <td className="p-4 text-sm">LKR {item.price}</td>
                <td className="p-4 text-sm">{item.qty}</td>
                <td className="p-4 text-sm font-bold text-[#ff5722]">LKR {item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSavePurchase} className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600">
        Confirm Purchase Order
      </button>
    </div>
  );
}

export default PurchaseManage;