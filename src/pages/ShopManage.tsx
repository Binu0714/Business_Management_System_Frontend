import React, { useState, useEffect } from 'react';
import { Store, Phone, Calendar, ChevronRight, Search } from 'lucide-react';
import api from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

const ShopManage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // 1. Added Search State
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [selectedShopSales, setSelectedShopSales] = useState<any[]>([]);
  
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

  // 2. FILTER LOGIC: Filter shops dynamically as user types
  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShopClick = (shop: any) => {
    const filtered = sales.filter(s => s.shopName.toLowerCase().trim() === shop.name.toLowerCase().trim());
    setSelectedShop(shop);
    setSelectedShopSales(filtered);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {alert.show && <CustomAlert type={alert.type} message={alert.msg} onClose={() => setAlert({ ...alert, show: false })} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SHOP DIRECTORY (Takes 1/3 space) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
              <Store className="text-[#ff5722]" /> Shop Directory
            </h2>
            <p className="text-xs text-gray-400 font-medium mb-6">List of all active retail accounts.</p>

            {/* 3. THE AUTOCOMPLETE SEARCH INPUT */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search shops (e.g. 'A')..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-[#ff5722] transition-all"
              />
            </div>

            {/* Render filtered shops list */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
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
        </div>

        {/* RIGHT COLUMN: SALES HISTORY FOR SELECTED SHOP (Takes 2/3 space) */}
        <div className="lg:col-span-2">
          {selectedShop ? (
            <div className="bg-white p-8 rounded-[42px] border border-gray-100 shadow-sm space-y-6 animate-in fade-in duration-300">
              
              <div className="flex justify-between items-center border-b border-gray-50 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedShop.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Phone size={12} /> Contact: {selectedShop.phone}</p>
                </div>
                <span className="bg-orange-50 text-[#ff5722] text-xs font-bold px-4 py-2 rounded-full">
                  {selectedShopSales.length} Total Sales
                </span>
              </div>

              {/* Loop through each sales record of this shop */}
              <div className="space-y-6 max-h-[550px] overflow-y-auto pr-2">
                {selectedShopSales.map((sale) => (
                  <div key={sale.id} className="bg-gray-50/30 p-6 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                      <div className="flex items-center gap-2"><Calendar size={14}/> {sale.date}</div>
                      <div className={`px-3 py-1 rounded-full uppercase text-[10px] ${sale.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{sale.status}</div>
                    </div>

                    {/* Nested Items List */}
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
    </div>
  );
};

export default ShopManage;