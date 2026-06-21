import React, { useState } from 'react';
import { FileText, Download, Loader2, Package, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [loading, setLoading] = useState<string | null>(null);

  // Helper to draw Letterhead on the PDF
  const drawHeader = (doc: jsPDF, title: string) => {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 87, 34); // Binu Orange
    doc.text("BINU PRODUCTS", 14, 20);
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Quality Bites & Mixtures - ERP Report System", 14, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(50);
    doc.text(title, 14, 35);
    
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    
    // Draw a divider line
    doc.setDrawColor(230);
    doc.line(14, 43, 196, 43);
  };

  // 1. GENERATE INVENTORY REPORT
  const generateInventoryReport = async () => {
    setLoading('inventory');
    try {
      const res = await api.get('/inventory');
      const doc = new jsPDF();
      drawHeader(doc, "Warehouse Inventory Report");

      const tableRows = res.data.map((item: any) => [
        item.itemId,
        item.productName || item.itemName || '—',
        item.batchNo || '—',
        item.expDate || '—',
        item.originalQty || item.stockQty || 0,
        `${item.stockQty} Qty`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Item ID', 'Item Name', 'Batch No', 'Expiry Date', 'Original Qty', 'Available Qty']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 87, 34] }, // Orange Header
      });

      doc.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert("Failed to generate inventory report.");
    } finally {
      setLoading(null);
    }
  };

  // 2. GENERATE PURCHASES REPORT
  const generatePurchasesReport = async () => {
    setLoading('purchases');
    try {
      const res = await api.get('/purchases');
      const doc = new jsPDF();
      drawHeader(doc, "Factory Purchases Report");

      const tableRows = res.data.map((order: any) => [
        order.date,
        order.supplierName,
        order.batchNo || '—',
        order.items?.length || 0,
        `LKR ${parseFloat(order.grandTotal).toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Date', 'Supplier', 'Batch No', 'Total Items', 'Grand Total']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }, // Slate Header
      });

      doc.save(`Purchases_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert("Failed to generate purchases report.");
    } finally {
      setLoading(null);
    }
  };

  // 3. GENERATE SALES REPORT (PER DAY)
  const generateSalesReport = async () => {
    setLoading('sales');
    try {
      const res = await api.get('/sales');
      const doc = new jsPDF();
      drawHeader(doc, "Daily Sales Registry");

      // Group sales by date
      const salesMap: { [key: string]: { total: number, collected: number, outstanding: number } } = {};
      res.data.forEach((s: any) => {
        if (!salesMap[s.date]) salesMap[s.date] = { total: 0, collected: 0, outstanding: 0 };
        salesMap[s.date].total += s.grandTotal;
        salesMap[s.date].collected += s.amountPaid;
        salesMap[s.date].outstanding += s.outstanding;
      });

      const tableRows = Object.keys(salesMap).map(date => [
        date,
        `LKR ${salesMap[date].total.toLocaleString()}`,
        `LKR ${salesMap[date].collected.toLocaleString()}`,
        `LKR ${salesMap[date].outstanding.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Date', 'Total Sales Billing', 'Cash Collected', 'Outstanding Credit']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [46, 125, 50] }, // Green Header
      });

      doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert("Failed to generate sales report.");
    } finally {
      setLoading(null);
    }
  };

  // 4. GENERATE EXPENSES REPORT
  const generateExpensesReport = async () => {
    setLoading('expenses');
    try {
      const res = await api.get('/expenses');
      const doc = new jsPDF();
      drawHeader(doc, "Company Expenses Audit");

      const tableRows = res.data.map((exp: any) => [
        exp.date,
        exp.description,
        `LKR ${exp.price.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Date', 'Description', 'Price']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [55, 65, 81] }, // Dark Gray Header
      });

      doc.save(`Expenses_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert("Failed to generate expenses report.");
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    { title: 'Inventory Stock Report', desc: 'Current warehouse quantities, items, and near-expiry statuses.', action: generateInventoryReport, type: 'inventory', icon: <Package size={24}/>, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Purchases Audit', desc: 'Historical records of all raw goods bought from factory suppliers.', action: generatePurchasesReport, type: 'purchases', icon: <ShoppingCart size={24}/>, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'Daily Sales & Credit', desc: 'Expected revenue vs actual cash collected on hand per day.', action: generateSalesReport, type: 'sales', icon: <TrendingUp size={24}/>, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Expenses Audit', desc: 'Itemized list of utility bills, rent, and operational costs.', action: generateExpensesReport, type: 'expenses', icon: <Wallet size={24}/>, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <FileText className="text-[#ff5722]" /> Company Reports
        </h1>
        <p className="text-slate-500">Generate and download official PDF audits for your business operations.</p>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep) => (
          <div key={rep.title} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all">
            <div className="flex gap-5 items-start">
              <div className={`p-4 ${rep.bg} ${rep.color} rounded-2xl`}>{rep.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{rep.title}</h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{rep.desc}</p>
              </div>
            </div>

            <button
              onClick={rep.action}
              disabled={loading !== null}
              className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {loading === rep.type ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <><Download size={16} /> Download PDF</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;