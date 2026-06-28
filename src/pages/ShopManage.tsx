import React, { useState, useEffect } from 'react';
import { Store, Phone, Calendar, ChevronRight, Search, X, FileText } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';
import { createPortal } from 'react-dom';

const ShopManage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [selectedShopSales, setSelectedShopSales] = useState<any[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [alert, setAlert] = useState({ show: false, msg: '', type: 'success' as 'success' | 'error' });

  const loadData = async () => {
    try {
      const res = await api.get('/sales');
      setSales(res.data);
      
      const shopMap: { [key: string]: { name: string; phone: string; totalBills: number } } = {};
      res.data.forEach((sale: any) => {
        if (!sale.shopName) return;
        const key = sale.shopName.toLowerCase().trim();
        if (!shopMap[key]) {
          shopMap[key] = {
            name: sale.shopName,
            phone: sale.shopPhone || '—',
            totalBills: 0
          };
        }
        shopMap[key].totalBills += 1;
      });

      setShops(Object.values(shopMap));
    } catch {
      setAlert({ show: true, msg: "Failed to load shop records.", type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShopClick = (shop: any) => {
    const filtered = sales.filter(s => s.shopName.toLowerCase().trim() === shop.name.toLowerCase().trim());
    setSelectedShop(shop);
    setSelectedShopSales(filtered);
  };

  return (
    // FIX: Set outer container to calculate remaining screen height
    <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)] flex gap-8 animate-in fade-in duration-500 overflow-hidden">
      {alert.show && <CustomAlert type={alert.type} message={alert.msg} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* --- INVOICE VIEW POPUP MODAL PORTAL --- */}
      {activeInvoice && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-gray-100 relative animate-in zoom-in-95 duration-300">
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
                  {activeInvoice.items?.map((item: any, i: number) => (
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

      {/* --- LEFT COLUMN: SHOP DIRECTORY (Takes 1/3 space and stretches to full height) --- */}
      <div className="w-1/3 h-full bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2 shrink-0">
          <Store className="text-[#ff5722]" /> Shop Directory
        </h2>
        <p className="text-xs text-gray-400 font-medium mb-6 shrink-0">List of all active retail accounts.</p>

        {/* The Autocomplete Search Input */}
        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search shops by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#ff5722] transition-all"
          />
        </div>

        {/* Scrollable shops list - takes remaining vertical space inside card */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <div 
                key={shop.name}
                onClick={() => handleShopClick(shop)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex justify-between items-center ${
                  selectedShop?.name === shop.name 
                    ? 'bg-[#ff5722] border-[#ff5722] text-white shadow-lg shadow-orange-500/10' 
                    : 'bg-gray-50/50 hover:bg-gray-50 border-gray-100 text-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm">{shop.name}</h4>
                  <p className={`text-[10px] mt-1 flex items-center gap-1 ${selectedShop?.name === shop.name ? 'text-orange-100' : 'text-gray-400'}`}>
                    <Phone size={10} /> {shop.phone}
                  </p>
                </div>
                <ChevronRight size={16} className={selectedShop?.name === shop.name ? 'text-white' : 'text-gray-400'} />
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-gray-400 font-bold">No shops found matching "{searchQuery}"</div>
          )}
        </div>
      </div>

      {/* --- RIGHT COLUMN: SALES HISTORY FOR SELECTED SHOP (Takes 2/3 space and stretches to full height) --- */}
      <div className="flex-1 h-full">
        {selectedShop ? (
          <div className="h-full bg-white p-8 rounded-[42px] border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-300">
            
            <div className="flex justify-between items-center border-b border-gray-50 pb-6 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{selectedShop.name}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={12} /> Contact: {selectedShop.phone}</p>
              </div>
              <span className="bg-orange-50 text-[#ff5722] text-xs font-bold px-4 py-2 rounded-full">
                {selectedShopSales.length} Total Sales
              </span>
            </div>

            {/* Loop through each sales record of this shop (Flex-1 and overflow-y-auto makes only the list scroll) */}
            <div className="flex-1 overflow-y-auto pr-2 mt-6 space-y-6">
              {selectedShopSales.map((sale) => (
                <div key={sale.id} className="bg-gray-50/30 p-6 rounded-3xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-2"><Calendar size={14}/> {sale.date}</div>
                    <div className={`px-3 py-1 rounded-full uppercase text-[10px] ${sale.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{sale.status}</div>
                  </div>

                  {/* Nested Items Table */}
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full text-left text-xs bg-white">
                      <thead className="bg-gray-50">
                        <tr><th className="p-3 text-gray-400">Snack</th><th className="p-3">Price</th><th className="p-3">Qty</th><th className="p-3 text-right">Total</th></tr>
                      </thead>
                      <tbody>
                        {sale.items?.map((item: any, i: number) => (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="p-3 font-bold text-slate-700">{item.itemName}</td>
                            <td className="p-3">LKR {item.sellingPrice}</td>
                            <td className="p-3 font-bold">{item.qty}</td>
                            <td className="p-3 text-right font-black">LKR {item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-xs text-gray-400 font-bold">Collected: LKR {sale.amountPaid}</span>
                    <span className="font-black text-slate-800">Total Bill: LKR {sale.grandTotal}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="h-full bg-white rounded-[42px] border border-dashed border-gray-200 flex flex-col items-center justify-center p-20 text-center">
            <Store size={48} className="text-gray-300 mb-4" />
            <h3 className="font-bold text-slate-700 text-lg">No Shop Selected</h3>
            <p className="text-xs text-gray-400 mt-2 max-w-xs">Select a shop from the directory on the left to inspect their past sales invoices.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ShopManage;