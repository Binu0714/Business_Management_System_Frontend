import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Edit2 } from 'lucide-react';
import { db } from '../lib/Firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const PurchaseManage = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ supplierId: '', date: '', remarks: '' });
  const [currentItem, setCurrentItem] = useState({ 
    itemName: '', batchNo: '', expDate: '', price: 0, sellingPrice: 0, qty: 0 
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const snap = await getDocs(collection(db, 'suppliers'));
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchSuppliers();
  }, []);

  const addItem = () => {
    if (!currentItem.itemName || !currentItem.expDate || currentItem.price <= 0 || currentItem.qty <= 0) {
      alert("Please fill all required fields before adding!");
      return;
    }

    const newItemId = `I${(items.length + 1).toString().padStart(3, '0')}`;
    const newBatchNo = `B${(items.length + 1).toString().padStart(3, '0')}`;

    const formattedPrice = parseFloat(currentItem.price.toString()).toFixed(2);
    const formattedSellingPrice = parseFloat(currentItem.sellingPrice.toString()).toFixed(2);
    
    if (editIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editIndex] = { 
        ...currentItem, 
        itemId: items[editIndex].itemId, 
        batchNo: items[editIndex].batchNo, 
        price: formattedPrice, 
        sellingPrice: formattedSellingPrice,
        total: (parseFloat(formattedPrice) * currentItem.qty).toFixed(2) 
      };
      setItems(updatedItems);
      setEditIndex(null);
    } else {
      setItems([...items, { 
        ...currentItem, 
        itemId: newItemId, 
        batchNo: newBatchNo, 
        price: formattedPrice, 
        sellingPrice: formattedSellingPrice,
        total: (parseFloat(formattedPrice) * currentItem.qty).toFixed(2) 
      }]);
    }
    
    setCurrentItem({ itemName: '', batchNo: '', expDate: '', price: 0, sellingPrice: 0, qty: 0 });
  };

  const startEdit = (index: number) => {
    setCurrentItem(items[index]);
    setEditIndex(index);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSavePurchase = async () => {
    const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.total), 0);
    await addDoc(collection(db, 'purchases'), {
      ...formData,
      items,
      grandTotal: grandTotal.toFixed(2),
      createdAt: new Date().toISOString()
    });
    setItems([]);
    alert("Purchase Saved!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <ShoppingCart className="text-[#ff5722]" /> New Purchase Order
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Supplier</label>
            <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" onChange={e => setFormData({...formData, supplierId: e.target.value})} required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date</label>
            <input type="date" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" onChange={e => setFormData({...formData, date: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Remarks</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Notes..." onChange={e => setFormData({...formData, remarks: e.target.value})} />
          </div>
        </div>
      </div>

      {/* 2. Add Items Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="font-bold text-slate-700 mb-6">Add Items</h3>
        
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Item Name</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Name" value={currentItem.itemName} onChange={e => setCurrentItem({...currentItem, itemName: e.target.value})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Batch No</label>
              <input 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" 
                placeholder="Auto-generated" 
                value="Auto-generated"
                disabled 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Expiry Date</label>
              <input type="date" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" value={currentItem.expDate} onChange={e => setCurrentItem({...currentItem, expDate: e.target.value})} required />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Bought Price</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="0.00" value={currentItem.price === 0 ? '' : currentItem.price} onChange={e => setCurrentItem({...currentItem, price: Number(e.target.value)})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Selling Price</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="0.00" value={currentItem.sellingPrice === 0 ? '' : currentItem.sellingPrice} onChange={e => setCurrentItem({...currentItem, sellingPrice: Number(e.target.value)})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Quantity</label>
              <input type="number" className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Qty" value={currentItem.qty === 0 ? '' : currentItem.qty} onChange={e => setCurrentItem({...currentItem, qty: Number(e.target.value)})} required />
            </div>
          </div>
        </div>

        <button onClick={addItem} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md">
          <Plus size={18}/> {editIndex !== null ? 'Update Item' : 'Add Item to Order'}
        </button>
      </div>

      {/* 3. Items List Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black">
            <tr>
              <th className="p-4">Item ID</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Selling Price</th>
              <th className="p-4">Bought Price</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-xs font-bold text-[#ff5722]">{item.itemId}</td>
                <td className="p-4 text-xs font-bold text-slate-800">{item.itemName}</td>
                <td className="p-4 text-xs text-slate-600">{item.sellingPrice}</td>
                <td className="p-4 text-xs text-slate-600">{item.price}</td>
                <td className="p-4 text-xs text-slate-600">{item.qty}</td>
                <td className="p-4 text-xs font-bold text-slate-800">LKR {item.total}</td>
                 <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => startEdit(idx)} className="text-orange-500"><Edit2 size={16}/></button>
                    <button onClick={() => removeItem(idx)} className="text-red-500"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSavePurchase} disabled={items.length === 0} className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
        Confirm Purchase Order
      </button>
    </div>
  );
}

export default PurchaseManage;