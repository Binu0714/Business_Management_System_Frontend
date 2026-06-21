import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Package, AlertTriangle, IndianRupee, 
  Store, Truck, Clock, DollarSign, Wallet
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  // Database States
  const [sales, setSales] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]); 

  const loadDashboardData = async () => {
    try {
      const [salesRes, invRes, expRes, purchaseRes] = await Promise.all([
        api.get('/sales'),
        api.get('/inventory'),
        api.get('/expenses'),
        api.get('/purchases')
      ]);
      setSales(salesRes.data);
      setInventory(invRes.data);
      setExpenses(expRes.data);
      setPurchases(purchaseRes.data); 
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getRecentSalesChartData = () => {
    const dateMap: { [key: string]: { revenue: number; collected: number } } = {};

    // Group sales strictly by their active dates
    sales.forEach(sale => {
      if (!sale.date) return;
      const dateStr = sale.date; // e.g. "2026-06-19"

      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { revenue: 0, collected: 0 };
      }

      dateMap[dateStr].revenue += parseFloat(sale.grandTotal || 0);
      dateMap[dateStr].collected += parseFloat(sale.amountPaid || 0);
    });

    // Convert map to sorted array
    const sortedData = Object.keys(dateMap)
      .map(date => {
        // Format date cleanly (e.g. "2026-06-19" -> "Jun 19")
        const parsedDate = new Date(date);
        const formattedDate = parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        return {
          rawDate: date,
          name: formattedDate, // Used as X-Axis Label
          revenue: dateMap[date].revenue,
          collected: dateMap[date].collected
        };
      })
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate)); // Chronological order

    // Take the last 10 active selling days
    return sortedData.slice(-10);
  };

  const activeChartData = getRecentSalesChartData();

  // --- 2. STATS CALCULATIONS ---
  const expectedRevenue = purchases.reduce((grandSum, purchase) => {
    const purchaseValue = (purchase.items || []).reduce((itemSum: number, item: any) => {
      const sellingPrice = parseFloat(item.sellingPrice?.toString() || '0');
      const qty = parseInt(item.qty?.toString() || '0');
      return itemSum + (sellingPrice * qty);
    }, 0);
    return grandSum + purchaseValue;
  }, 0);

  const currentRevenue = sales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
  const outstandingAmount = sales.reduce((sum, s) => sum + (s.outstanding || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.price || 0), 0);
  const netProfit = currentRevenue - totalExpenses;

  const stockAlertCount = inventory.filter(item => {
    const qty = item.stockQty !== undefined ? item.stockQty : item.qty || 0;
    return qty <= 10;
  }).length;

  const stats = [
    { title: 'Expected Revenue', value: `LKR ${expectedRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Current Revenue', value: `LKR ${currentRevenue.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Outstanding Credit', value: `LKR ${outstandingAmount.toLocaleString()}`, icon: <Clock size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Total Expenses', value: `LKR ${totalExpenses.toLocaleString()}`, icon: <Wallet size={20} />, color: 'text-slate-600', bg: 'bg-slate-50' },
    { title: 'Net Profit', value: `LKR ${netProfit.toLocaleString()}`, icon: <DollarSign size={20} />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center p-20">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>{stat.icon}</div>
              {stat.title === 'Stock Alert' && stockAlertCount > 0 && (
                <span className="text-[9px] font-bold bg-red-100 px-2 py-1 rounded-md text-red-600 animate-pulse">Critical</span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Alert Banner */}
      {stockAlertCount > 0 && (
        <div className="bg-red-50/70 border-l-4 border-red-500 p-6 rounded-3xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><AlertTriangle size={24} /></div>
            <div>
              <h4 className="font-extrabold text-red-950 text-sm">Low Stock Alert</h4>
              <p className="text-red-700 text-xs mt-1">There are currently <span className="font-bold">{stockAlertCount} items</span> in your warehouse with a stock level of 10 or below.</p>
            </div>
          </div>
          <button onClick={() => navigate('/inventory')} className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-200">
            View Warehouse
          </button>
        </div>
      )}

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Recent 10 Selling Days Activity</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData}>

              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5722" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                </linearGradient>

                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" /> 
              <YAxis />
              <Tooltip />
              <Legend />
              
              <Area name="Expected Sales Revenue (LKR)" type="monotone" dataKey="revenue" stroke="#ff5722" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area name="Cash Collected (LKR)" type="monotone" dataKey="collected" stroke="#2e7d32" fillOpacity={1} fill="url(#colorCollected)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate('/sales')} className="bg-slate-900 text-white p-8 rounded-[32px] flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform">
            <div>
                <h4 className="font-bold">Add New Dispatch</h4>
                <p className="text-slate-400 text-xs mt-1">Record a sale or credit dispatch</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl"><Truck size={24}/></div>
        </div>
        <div onClick={() => navigate('/expenses')} className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-sm">
            <div>
                <h4 className="font-bold text-slate-800">Add New Expense</h4>
                <p className="text-slate-400 text-xs mt-1">Register utility bills or payments</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Store size={24}/></div>
        </div>
        <div onClick={() => navigate('/inventory')} className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform shadow-sm">
            <div>
                <h4 className="font-bold text-slate-800">Check Inventory</h4>
                <p className="text-slate-400 text-xs mt-1">Review active warehouse stocks</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24}/></div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;