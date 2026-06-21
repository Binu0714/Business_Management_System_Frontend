import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, Edit2, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';
import type { InventoryItem } from '../types/InventoryItem';

const InventoryManage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]); 
  const [activeAdjustId, setActiveAdjustId] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);
  
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false, msg: '', type: 'success'
  });

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setInventory(res.data);
    } catch {
      setAlert({ show: true, msg: "Failed to load inventory.", type: 'error' });
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (id: string, isAdd: boolean) => {
    if (adjustmentValue <= 0) return;
    const adjustmentQty = isAdd ? adjustmentValue : -adjustmentValue;

    try {
      await api.put(`/inventory/adjust/${id}`, { adjustmentQty });
      setAlert({ show: true, msg: "Inventory updated successfully!", type: 'success' });
      setActiveAdjustId(null);
      setAdjustmentValue(0);
      fetchInventory();
    } catch {
      setAlert({ show: true, msg: "Adjustment failed.", type: 'error' });
    }
  };

  const isExpiringSoon = (expiryDateString: string) => {
    if (!expiryDateString || expiryDateString === '—') return false;
    
    const today = new Date();
    const expiryDate = new Date(expiryDateString);
    
    // Calculate difference in milliseconds
    const differenceInTime = expiryDate.getTime() - today.getTime();
    
    // Convert to days
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    
    // Returns true if expiring within 60 days
    return differenceInDays <= 60;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {alert.show && (
        <CustomAlert type={alert.type} message={alert.msg} onClose={() => setAlert({ ...alert, show: false })} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <Package className="text-[#ff5722]" /> Inventory Management
        </h1>
        <p className="text-slate-500">View your active stock levels, track expiries, and adjust quantities.</p>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
            <tr>
              <th className="p-6">Item ID</th>
              <th className="p-6">Batch No</th>
              <th className="p-6">Expiry Date</th>
              <th className="p-6">Item Name</th>
              <th className="p-6">Bought Qty</th>
              <th className="p-6">Available Qty on Hand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inventory.map((item) => {
              const isAdjusting = activeAdjustId === item.id;

              const name = item.productName || (item as any).itemName || '—';
              const currentStock = item.stockQty !== undefined ? item.stockQty : (item as any).qty || 0;
              const originalQty = item.originalQty !== undefined ? item.originalQty : currentStock;
              
              // Check if expiring within 2 months
              const expiringSoon = isExpiringSoon(item.expDate);

              return (
                <tr 
                  key={item.id} 
                  // FIX: If expiring soon, apply a soft red background with warning state
                  className={`transition-colors ${
                    expiringSoon 
                      ? 'bg-red-50/70 hover:bg-red-50 text-red-900' 
                      : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className={`p-6 text-xs font-bold ${expiringSoon ? 'text-red-700' : 'text-[#ff5722]'}`}>
                    {item.itemId}
                  </td>
                  <td className="p-6 text-xs font-medium">{item.batchNo}</td>
                  <td className="p-6 text-xs">
                    <div className="flex items-center gap-2">
                      {item.expDate}
                      {expiringSoon && <AlertTriangle size={14} className="text-red-600 animate-pulse" />}
                    </div>
                  </td>
                  <td className="p-6 font-bold">{name}</td>
                  <td className="p-6 text-sm font-bold text-slate-400">{originalQty}</td>
                  
                  {/* Available Qty */}
                  <td className="p-6">
                    {isAdjusting ? (
                      <div className="flex items-center gap-2 animate-in fade-in duration-300">
                        <input 
                          type="number" 
                          placeholder="Qty"
                          className="w-20 p-2 bg-gray-50 border-none rounded-xl text-xs text-center font-bold"
                          onChange={e => setAdjustmentValue(parseInt(e.target.value) || 0)}
                          required
                        />
                        <button 
                          onClick={() => handleAdjustStock(item.id, true)} 
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg"
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => handleAdjustStock(item.id, false)} 
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                        >
                          <Minus size={14} />
                        </button>
                        <button 
                          onClick={() => setActiveAdjustId(null)} 
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                          expiringSoon || currentStock <= 10 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {currentStock} Qty
                        </span>
                        
                        <button 
                          onClick={() => { setActiveAdjustId(item.id); setAdjustmentValue(0); }}
                          className={`p-2 rounded-lg transition-colors ${
                            expiringSoon 
                              ? 'text-red-500 hover:bg-red-100' 
                              : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'
                          }`}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManage;