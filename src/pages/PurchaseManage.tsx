import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Trash2, ShoppingCart, Edit2, History as HistoryIcon, ChevronDown, ChevronUp, X, Tag } from 'lucide-react';
import type { PurchaseOrder, PurchaseItem } from '../types/Purchase'; 
import { CustomAlert } from '../components/CustomAlert';
import api from '../services/api'; 

const PurchaseManage = () => {
  const { lang } = useOutletContext<{ lang: 'en' | 'si' }>();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [formData, setFormData] = useState({ supplierId: '', date: '', batchNo: '', expDate: '', remarks: '' });
  const [currentItem, setCurrentItem] = useState({ 
    itemName: '', price: 0, sellingPrice: 0, qty: 0 
  });
  
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseOrder[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'confirm'; id?: string }>({
    show: false, msg: '', type: 'success'
  });

  const fetchPurchaseHistory = async () => {
    try {
      const res = await api.get('/purchases');
      setPurchaseHistory(res.data);
    } catch (err) {
      // Silently fail
    }
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/suppliers');
        setSuppliers(res.data);
      } catch (err) {
        setAlert({ show: true, msg: "Failed to fetch suppliers", type: 'error' });
      }
    };
    fetchSuppliers();
    fetchPurchaseHistory();
  }, []);

  const generateNextBatchId = () => {
    const nextNumber = purchaseHistory.length + 1;
    return `B${nextNumber.toString().padStart(3, '0')}`;
  };

  const addItem = () => {
    if (!formData.expDate) {
      setAlert({ show: true, msg: "Please select an Expiry Date at the top first!", type: 'error' });
      return;
    }
    if (!currentItem.itemName || currentItem.price <= 0 || currentItem.qty <= 0) {
      setAlert({ show: true, msg: "Please fill all required fields!", type: 'error' });
      return;
    }

    const newItem: PurchaseItem = {
      itemId: `I${(items.length + 1).toString().padStart(3, '0')}`,
      itemName: currentItem.itemName,
      price: currentItem.price,
      sellingPrice: currentItem.sellingPrice,
      qty: currentItem.qty,
      total: currentItem.price * currentItem.qty
    };
    
    if (editIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editIndex] = newItem;
      setItems(updatedItems);
      setEditIndex(null);
    } else {
      setItems([...items, newItem]);
    }
    
    setCurrentItem({ itemName: '', price: 0, sellingPrice: 0, qty: 0 });
  };

  const startEdit = (index: number) => {
    setCurrentItem({
      itemName: items[index].itemName,
      price: items[index].price,
      sellingPrice: items[index].sellingPrice,
      qty: items[index].qty
    });
    setEditIndex(index);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setAlert({ show: true, msg: "Item removed from order.", type: 'success' });
  };

  const handleSavePurchase = async () => {
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    
    if (!formData.supplierId || !formData.date || !formData.expDate || items.length === 0) {
      setAlert({ show: true, msg: "Please fill supplier, date, expiry date, and add items!", type: 'error' });
      return;
    }

    const nextBatch = activeOrderId ? formData.batchNo : generateNextBatchId();

    const newPurchase: PurchaseOrder = {
      supplierId: formData.supplierId,
      supplierName: supplier ? supplier.name : "Unknown",
      date: formData.date,
      batchNo: nextBatch,
      expDate: formData.expDate,
      remarks: formData.remarks,
      items: items,
      grandTotal: items.reduce((sum, item) => sum + item.total, 0),
      createdAt: new Date().toISOString()
    };

    try {
      if (activeOrderId) {
        await api.put(`/purchases/${activeOrderId}`, newPurchase);
        setAlert({ show: true, msg: "Purchase Order Updated Successfully!", type: 'success' });
        setActiveOrderId(null);
      } else {
        await api.post('/purchases/confirm', newPurchase);
        setAlert({ show: true, msg: "Purchase Order Confirmed!", type: 'success' });
      }

      setItems([]);
      setFormData({ supplierId: '', date: '', batchNo: '', expDate: '', remarks: '' });
      fetchPurchaseHistory();
    } catch (error: any) {
      setAlert({ show: true, msg: "Failed to save order.", type: 'error' });
    }
  };

  // Helper to safely get Batch No from any order version
  const getBatchNo = (order: any) => {
    if (order.batchNo) return order.batchNo;
    if (order.items && order.items.length > 0) {
      return order.items[0].batchNo || '—';
    }
    return '—';
  };

  // Helper to safely get Expiry Date from any order version
  const getExpDate = (order: any) => {
    if (order.expDate) return order.expDate;
    if (order.items && order.items.length > 0) {
      return order.items[0].expDate || '';
    }
    return '';
  };

  const handleUpdateOrder = (order: PurchaseOrder) => {
    const loadedBatch = getBatchNo(order);
    const loadedExp = getExpDate(order);

    setFormData({
      supplierId: order.supplierId,
      date: order.date,
      batchNo: loadedBatch === '—' ? '' : loadedBatch,
      expDate: loadedExp, // FIX: This will now load the expiry date correctly into the input
      remarks: order.remarks || ''
    });
    setItems(order.items);
    setActiveOrderId(order.id || null);
    setAlert({ show: true, msg: "Loaded for editing. Modify items and confirm to save.", type: 'success' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteOrder = async (orderId: string) => {
    try {
      await api.delete(`/purchases/${orderId}`);
      setAlert({ show: true, msg: "Purchase order deleted.", type: 'success' });
      fetchPurchaseHistory();
    } catch (error: any) {
      setAlert({ show: true, msg: "Failed to delete order.", type: 'error' });
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {alert.show && (
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({...alert, show: false})} 
          onConfirm={alert.type === 'confirm' && alert.id ? () => confirmDeleteOrder(alert.id!) : undefined}
        />
      )}

      {/* 1. Header Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-[#ff5722]" /> 
            {activeOrderId
              ? ('Edit Purchase Order')
              : ('New Purchase Order')}
          </h2>
          {activeOrderId && (
            <button 
              onClick={() => { setActiveOrderId(null); setItems([]); setFormData({ supplierId: '', date: '', batchNo: '', expDate: '', remarks: '' }); }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold"
            >
              <X size={14}/> {'Cancel Edit'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {'Supplier'}
            </label>
            <select
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm"
              value={formData.supplierId}
              onChange={e => setFormData({...formData, supplierId: e.target.value})}
              required
            >
              <option value="">{'Select Supplier'}</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {'Date'}
            </label>
            <input
              type="date"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              required
              disabled={items.length > 0}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {'Expiry Date'}
            </label>
            <input
              type="date"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm"
              value={formData.expDate}
              onChange={e => setFormData({...formData, expDate: e.target.value})}
              required
              disabled={items.length > 0}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {'Batch No'}
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm text-gray-400 font-bold" 
                value={activeOrderId ? formData.batchNo : generateNextBatchId()} 
                disabled 
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              {'Remarks'}
            </label>
            <input
              className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm"
              placeholder="Notes..."
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* 2. Add Items Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="font-bold text-slate-700 mb-6">{'Add Items'}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {'Item Name'}
              </label>
              <input
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm"
                placeholder="Name"
                value={currentItem.itemName}
                onChange={e => setCurrentItem({...currentItem, itemName: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {'Bought Price'}
              </label>
              <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="0.00" value={currentItem.price === 0 ? '' : currentItem.price} onChange={e => setCurrentItem({...currentItem, price: Number(e.target.value)})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {'Selling Price'}
              </label>
              <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="0.00" value={currentItem.sellingPrice === 0 ? '' : currentItem.sellingPrice} onChange={e => setCurrentItem({...currentItem, sellingPrice: Number(e.target.value)})} required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {'Quantity'}
              </label>
              <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Qty" value={currentItem.qty === 0 ? '' : currentItem.qty} onChange={e => setCurrentItem({...currentItem, qty: parseInt(e.target.value)})} required />
            </div>
          </div>
        </div>

        <button onClick={addItem} className="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-md">
          <Plus size={18}/>
          {editIndex !== null
            ? ('Update Item')
            : ('Add Item to Order')}
        </button>
      </div>

      {/* 3. Items List Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
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
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-4 text-xs font-bold text-[#ff5722]">{item.itemId}</td>
                <td className="p-4 text-xs font-bold text-slate-800">{item.itemName}</td>
                <td className="p-4 text-xs text-slate-600">LKR {item.sellingPrice}</td>
                <td className="p-4 text-xs text-slate-600">LKR {item.price}</td>
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

      <button
        onClick={handleSavePurchase}
        disabled={items.length === 0}
        className="w-full bg-[#ff5722] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {activeOrderId
          ? ('Update Purchase Order')
          : ('Confirm Purchase Order')}
      </button>

      {/* 4. Purchase History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 pt-2">
          <HistoryIcon className="text-[#ff5722]" />
          {'Purchase History'}      
        </h2>

        {purchaseHistory.length === 0 ? (
          <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 text-center text-gray-400 text-sm font-medium">
            {'No purchase orders found.'}
          </div>
        ) : (
          purchaseHistory.map((order, orderIdx) => {
            const isExpanded = expandedOrders.has(orderIdx);

            return (
              <div key={orderIdx} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    
                    {/* ✅ FIX: reads order.batchNo and order.expDate directly (order-level fields) */}
                    <div className="flex flex-wrap gap-15">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {'Supplier'}
                        </p>
                        <p className="text-sm font-black text-slate-800">{order.supplierName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {'Date'}
                        </p>
                        <p className="text-sm font-bold text-slate-700">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {'Batch No'}
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {order.batchNo || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {'Exp Date'}
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {order.expDate || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {'Grand Total'}
                        </p>
                        <p className="text-sm font-black text-[#ff5722]">LKR {order.grandTotal}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
                      >
                        <Edit2 size={13} /> {'Update'}
                      </button>
                      <button
                        onClick={() => setAlert({ show: true, msg:"Are you sure you want to delete this Purchase Order?", type: 'confirm', id: order.id })}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-all"
                      >
                        <Trash2 size={13} /> {'Delete'}
                      </button>
                      <button
                        onClick={() => toggleExpand(orderIdx)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
                      >
                        {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        {isExpanded
                          ? ('Hide')
                          : ('View')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Items Table */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[12px] uppercase text-gray-400 font-black">
                        <tr>
                          <th className="p-4">{'Item ID'}</th>
                          <th className="p-4">{'Item Name'}</th>
                          <th className="p-4">{'Selling Price'}</th>
                          <th className="p-4">{'Bought Price'}</th>
                          <th className="p-4">{'Qty'}</th>
                          <th className="p-4">{'Total'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, itemIdx) => (
                          <tr key={itemIdx} className="border-t hover:bg-gray-50 transition-colors">
                            <td className="p-4 text-xs font-bold text-[#ff5722]">{item.itemId}</td>
                            <td className="p-4 font-bold text-sm">{item.itemName}</td>
                            <td className="p-4 text-xs text-slate-600">LKR {item.sellingPrice}</td>
                            <td className="p-4 text-xs text-slate-600">LKR {item.price}</td>
                            <td className="p-4 text-xs text-slate-600">{item.qty}</td>
                            <td className="p-4 text-xs font-bold text-slate-800">LKR {item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

export default PurchaseManage;