import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; 
import { useOutletContext } from 'react-router-dom';
import { ShoppingBag, Plus, Trash2, Edit2, Eye, DollarSign, Clock, TrendingUp, Search, X, FileText } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';
import type { SaleRecord } from '../types/sales';

const SalesManage = () => {
  const { lang } = useOutletContext<{ lang: 'en' | 'si' }>();

  const [inventory, setInventory] = useState<any[]>([]); 
  const [sales, setSales] = useState<SaleRecord[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false); 

  // Active Workspace State
  const [items, setItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ shopName: '', shopPhone: '', date: '', remarks: '', amountPaid: '', status: 'paid' });
  const [currentItem, setCurrentItem] = useState({ productId: '', productName: '', sellingPrice: 0, itemId: '', qty: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<SaleRecord | null>(null);
  const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' | 'confirm'; id?: string }>({
    show: false, msg: '', type: 'success'
  });

  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historyDateFilter, setHistoryDateFilter] = useState(''); 

   const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.shopName.toLowerCase().includes(historySearch.toLowerCase());
    const matchesFilter = historyFilter === 'all' || sale.status === historyFilter;
    
    const matchesDate = !historyDateFilter || sale.date === historyDateFilter; 
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const loadData = async () => {
    try {
      const [invRes, salesRes] = await Promise.all([
        api.get('/inventory'), 
        api.get('/sales')     
      ]);
      setInventory(invRes.data);
      
      const sortedSales = salesRes.data.sort((a: any, b: any) => 
        b.date.localeCompare(a.date)
      );
      
      setSales(sortedSales);
    } catch {
      setAlert({ show: true, msg: "Failed to load database records.", type: 'error' });
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredProducts = inventory.filter(item => {
    const name = item.productName || item.itemName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Extract unique past shops with their most recent phone numbers from sales history
  const uniqueShopsList = () => {
    const shopMap: { [key: string]: { name: string; phone: string } } = {};
    sales.forEach(sale => {
      if (!sale.shopName) return;
      const key = sale.shopName.toLowerCase().trim();
      if (!shopMap[key]) {
        shopMap[key] = {
          name: sale.shopName,
          phone: sale.shopPhone && sale.shopPhone !== '—' ? sale.shopPhone : ''
        };
      }
    });
    return Object.values(shopMap);
  };

  // Filter suggested shops based on what is currently typed
  const filteredShops = uniqueShopsList().filter(shop => 
    shop.name.toLowerCase().includes(formData.shopName.toLowerCase())
  );

  const selectProduct = (item: any) => {
    const name = item.productName || item.itemName;
    setCurrentItem({
      ...currentItem,
      productId: item.id,
      productName: name,
      sellingPrice: parseFloat(item.sellingPrice || 0),
      itemId: item.itemId
    });
    setSearchQuery(name);
    setIsDropdownOpen(false);
  };

  const addItem = () => {
    if (!currentItem.productId || currentItem.qty <= 0) {
      setAlert({ show: true, msg: "Please select a snack and enter quantity!", type: 'error' });
      return;
    }

    const total = currentItem.sellingPrice * currentItem.qty;
    setItems([...items, {
      itemId: currentItem.itemId,
      itemName: currentItem.productName,
      sellingPrice: currentItem.sellingPrice,
      qty: currentItem.qty,
      total
    }]);

    setCurrentItem({ productId: '', productName: '', sellingPrice: 0, itemId: '', qty: 0 });
    setSearchQuery('');
  };

  const handleSaveSale = async () => {
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);
    const paid = formData.status === 'paid' ? grandTotal : parseFloat(formData.amountPaid || '0');
    const outstanding = grandTotal - paid;

    const payload: SaleRecord = {
      repId: 'DIRECT_ADMIN', 
      repName: 'Admin',
      shopId: 'MANUAL_ENTRY', 
      shopName: formData.shopName, 
      date: formData.date,
      items,
      grandTotal,
      amountPaid: paid,
      outstanding,
      status: outstanding === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      remarks: formData.remarks,
      shopPhone: formData.shopPhone || "—" 
    };

    try {
      if (editId) {
        await api.put(`/sales/${editId}`, payload);
        setAlert({ show: true, msg: "Sales record updated successfully!", type: 'success' });
        setEditId(null);
      } else {
        const response = await api.post('/sales/confirm', payload);
        setAlert({ show: true, msg: response.data.message, type: 'success' });
      }
      setItems([]);
      setFormData({ shopName: '', shopPhone: '', date: '', remarks: '', amountPaid: '', status: 'paid' });
      loadData(); 
    } catch (error: any) {
      const errMsg = error.response?.data?.message || "Failed to process sale.";
      setAlert({ show: true, msg: errMsg, type: 'error' });
    }
  };

  const handleUpdateClick = (sale: SaleRecord) => {
    setFormData({
      shopName: sale.shopName,
      shopPhone: sale.shopPhone || '',
      date: sale.date,
      remarks: sale.remarks || '',
      amountPaid: sale.amountPaid.toString(),
      status: sale.status
    });
    setItems(sale.items);
    setEditId(sale.id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDeleteSale = async (id: string) => {
    try {
      await api.delete(`/sales/${id}`);
      setAlert({ show: true, msg: "Sales record permanently deleted.", type: 'success' });
      loadData();
    } catch {
      setAlert({ show: true, msg: "Failed to delete sales record.", type: 'error' });
    }
  };

  const expectedRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const receivedRevenue = sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const outstandingRevenue = sales.reduce((sum, s) => sum + s.outstanding, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Alert System Portal */}
      {alert.show && createPortal(
        <CustomAlert 
          type={alert.type} 
          message={alert.msg} 
          onClose={() => setAlert({...alert, show: false})} 
          onConfirm={alert.type === 'confirm' && alert.id ? () => confirmDeleteSale(alert.id!) : undefined}
        />,
        document.body
      )}

      {/* --- INVOICE VIEW POPUP MODAL PORTAL --- */}
      {activeInvoice && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-gray-100 relative animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-orange-600 font-black italic text-xl">
                  <FileText size={24} /> BINU PRODUCTS
                </div>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Official Sales Invoice</p>
              </div>
              <button onClick={() => setActiveInvoice(null)} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-slate-700 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Shop & Date Metadata */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Bill To</p>
                <p className="font-extrabold text-slate-800 text-base">{activeInvoice.shopName}</p>
                <p className="text-gray-500 text-xs mt-1">Phone: {activeInvoice.shopPhone || '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Invoice Details</p>
                <p className="font-bold text-slate-700">Date: {activeInvoice.date}</p>
                <p className="text-gray-400 text-xs mt-1">Status: <span className={`font-bold uppercase ${activeInvoice.status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>{activeInvoice.status}</span></p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[9px] tracking-wider">
                  <tr>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeInvoice.items.map((item, i) => (
                    <tr key={i} className="text-slate-700">
                      <td className="p-4 font-bold">{item.itemName}</td>
                      <td className="p-4">LKR {item.sellingPrice}</td>
                      <td className="p-4 font-bold">{item.qty}</td>
                      <td className="p-4 text-right font-black">LKR {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary Box */}
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col gap-3 text-sm">
              <div className="flex justify-between font-bold text-slate-600"><span>Subtotal:</span><span>LKR {activeInvoice.grandTotal.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-green-600"><span>Amount Paid:</span><span>LKR {activeInvoice.amountPaid.toLocaleString()}</span></div>
              <div className="flex justify-between font-black text-lg border-t border-gray-200/50 pt-3 text-slate-800">
                <span>Outstanding Balance:</span>
                <span className={activeInvoice.outstanding > 0 ? 'text-red-600' : 'text-slate-800'}>
                  LKR {activeInvoice.outstanding.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-orange-50 text-[#ff5722] rounded-2xl"><TrendingUp size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expected Revenue</p>
            <h3 className="text-xl font-black text-slate-800">LKR {expectedRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Paid Cash</p>
            <h3 className="text-xl font-black text-slate-800">LKR {receivedRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><Clock size={24}/></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Outstanding Credit</p>
            <h3 className="text-xl font-black text-slate-800">LKR {outstandingRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* 2. SALES ENTRY FORM */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-[#ff5722]" /> 
            {editId ? 'Edit Sales Dispatch' : 'New Sales Dispatch'}
          </h2>
          {editId && (
            <button 
              onClick={() => { setEditId(null); setItems([]); setFormData({ shopName: '', shopPhone: '', date: '', remarks: '', amountPaid: '', status: 'paid' }); }}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold"
            >
              <X size={14}/> Cancel Edit
            </button>
          )}
        </div>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Shop Name Input (With dynamic dropdown suggestions) */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Shop Name *</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff5722]/20" 
                placeholder="Type Shop Name..." 
                value={formData.shopName} 
                onFocus={() => setIsShopDropdownOpen(true)}
                onChange={e => {
                  setFormData({...formData, shopName: e.target.value});
                  setIsShopDropdownOpen(true);
                }}
                required
              />

              {/* Shop Suggestion Dropdown */}
              {isShopDropdownOpen && formData.shopName && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-40 overflow-y-auto z-50">
                  {filteredShops.length > 0 ? (
                    filteredShops.map(shop => (
                      <button
                        key={shop.name}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            shopName: shop.name,
                            shopPhone: shop.phone !== '—' ? shop.phone : ''
                          });
                          setIsShopDropdownOpen(false);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-orange-50 text-xs font-bold text-slate-700 transition-colors"
                      >
                        {shop.name}
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 font-bold">New Shop (No past records)</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Shop Contact No (Optional)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" 
                placeholder="e.g., +94 xx xxx xxxx" 
                value={formData.shopPhone} 
                onChange={e => setFormData({...formData, shopPhone: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Date *</label>
              <input type="date" required className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 relative">
            <div className="relative">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Search & Select Snack *</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text"
                  className="w-full p-4 pl-12 bg-gray-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#ff5722]/20"
                  placeholder="Type to search (e.g. 'P')..."
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                />
              </div>

              {isDropdownOpen && searchQuery && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-48 overflow-y-auto z-50">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(item => {
                      const name = item.productName || item.itemName;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectProduct(item)}
                          className="w-full text-left px-5 py-3 hover:bg-orange-50 text-xs font-bold text-slate-700 transition-colors flex justify-between items-center"
                        >
                          <span>{name}</span>
                          <span className="text-[10px] bg-orange-100 text-[#ff5722] px-2 py-0.5 rounded-full">LKR {item.sellingPrice}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-400 font-bold">No matching snacks found.</div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Quantity *</label>
              <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="Qty" value={currentItem.qty || ''} onChange={e => setCurrentItem({...currentItem, qty: parseInt(e.target.value) || 0})} />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={addItem} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"><Plus size={18}/> Add Item</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Payment Method</label>
              <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="paid">Fully Paid (Cash)</option>
                <option value="unpaid">Credit (Unpaid)</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>
            {formData.status === 'partial' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Amount Paid on Hand</label>
                <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm" placeholder="LKR 0.00" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* 3. WORKING WORKSPACE TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black">
            <tr><th className="p-4">Item ID</th><th className="p-4">Item Name</th><th className="p-4">Selling Price</th><th className="p-4">Qty</th><th className="p-4">Total</th><th className="p-4 text-right">Action</th></tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-4 text-xs font-bold text-[#ff5722]">{item.itemId}</td>
                <td className="p-4 font-bold text-slate-800 text-sm">{item.itemName}</td>
                <td className="p-4 text-sm">LKR {item.sellingPrice}</td>
                <td className="p-4 text-sm">{item.qty}</td>
                <td className="p-4 text-sm font-bold text-[#ff5722]">LKR {item.total}</td>
                <td className="p-4 text-right"><button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSaveSale} disabled={items.length === 0} className="w-full bg-[#ff5722] text-[#fff] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 disabled:opacity-50">
        {editId ? 'Update Sale Record' : 'Confirm Sale'}
      </button>

      {/* 4. HISTORICAL SALES TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Interactive Header */}
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><FileText className="text-[#ff5722]" size={22} /> Sales Registry</h3>          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search shops..." 
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#ff5722]/20"
              />
            </div>

            {/* Date Picker (With Clear Option) */}
            <div className="relative w-full sm:w-auto">
              <input 
                type="date" 
                value={historyDateFilter}
                onChange={e => setHistoryDateFilter(e.target.value)}
                className="w-full sm:w-auto p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#ff5722]/20 cursor-pointer"
              />
              {historyDateFilter && (
                <button 
                  type="button"
                  onClick={() => setHistoryDateFilter('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <select 
              value={historyFilter}
              onChange={e => setHistoryFilter(e.target.value)}
              className="w-full sm:w-auto p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#ff5722]/20 cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="paid">Fully Paid (Cash)</option>
              <option value="unpaid">Credit (Unpaid)</option>
              <option value="partial">Partial Payment</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
            <tr>
              <th className="p-6">Date</th>
              <th className="p-6">Shop</th>
              <th className="p-6">Total Bill</th>
              <th className="p-6">Collected</th>
              <th className="p-6">Outstanding</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* FIX: Map over filteredSales instead of sales */}
            {filteredSales.map((sale) => {
              const isUnpaid = sale.status === 'unpaid';
              const isPartial = sale.status === 'partial';
              return (
                <tr 
                  key={sale.id} 
                  className={`transition-colors ${
                    isUnpaid ? 'bg-red-50/70 hover:bg-red-100/90 text-red-950 border-l-8 border-red-600 font-bold' :
                    isPartial ? 'bg-orange-50/50 hover:bg-orange-50 text-orange-950' : 
                    'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="p-6 text-sm">{sale.date}</td>
                  <td className="p-6 font-bold">{sale.shopName}</td>
                  <td className="p-6 font-bold">LKR {sale.grandTotal.toLocaleString()}</td>
                  <td className="p-6 text-sm text-slate-500">LKR {sale.amountPaid.toLocaleString()}</td>
                  <td className={`p-6 font-black ${isUnpaid ? 'text-red-600' : 'text-slate-600'}`}>
                    LKR {sale.outstanding.toLocaleString()}
                  </td>
                  <td className="p-6 text-right flex justify-end gap-2">
                    <button onClick={() => setActiveInvoice(sale)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye size={16} /></button>
                    <button onClick={() => handleUpdateClick(sale)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => setAlert({ show: true, msg: "Are you sure you want to delete this sales record?", type: 'confirm', id: sale.id })} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              );
            })}
            
            {/* Fallback empty state */}
            {filteredSales.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-xs text-gray-400 font-bold">
                  No sales found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesManage;