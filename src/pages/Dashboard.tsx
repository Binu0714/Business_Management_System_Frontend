import React from 'react';
import { 
  TrendingUp, Package, AlertTriangle, IndianRupee, 
  ArrowUpRight, Users, Store, Truck 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for the Chart
const data = [
  { name: 'Mon', revenue: 4000, profit: 2400 },
  { name: 'Tue', revenue: 3000, profit: 1398 },
  { name: 'Wed', revenue: 2000, profit: 9800 },
  { name: 'Thu', revenue: 2780, profit: 3908 },
  { name: 'Fri', revenue: 1890, profit: 4800 },
];

const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: 'LKR 84,200', change: '+12%', icon: <IndianRupee size={24} />, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Net Profit', value: 'LKR 12,500', change: '+5%', icon: <TrendingUp size={24} />, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Stock Alerts', value: '08 Items', change: 'Low Stock', icon: <AlertTriangle size={24} />, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Active Reps', value: '06', change: 'On Field', icon: <Users size={24} />, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="flex justify-between items-start">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>{stat.icon}</div>
              <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Weekly Profit Trends</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="profit" stroke="#ff5722" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[32px] flex items-center justify-between">
            <div>
                <h4 className="font-bold">Add New Dispatch</h4>
                <p className="text-slate-400 text-xs mt-1">Assign stock to Sales Reps</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl"><Truck size={24}/></div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center justify-between">
            <div>
                <h4 className="font-bold text-slate-800">Add New Shop</h4>
                <p className="text-slate-400 text-xs mt-1">Register new retail outlets</p>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Store size={24}/></div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center justify-between">
            <div>
                <h4 className="font-bold text-slate-800">Check Inventory</h4>
                <p className="text-slate-400 text-xs mt-1">Review stock & expiry dates</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Package size={24}/></div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;