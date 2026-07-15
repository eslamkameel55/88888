/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  FileSpreadsheet, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Percent, 
  Download, 
  Wrench, 
  Zap, 
  HelpCircle,
  PiggyBank,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Invoice, 
  MaintenanceTicket, 
  RechargeLog, 
  WalletTransferLog,
  Expense, 
  CashLog, 
  InstaPayLog, 
  Product, 
  Customer, 
  Supplier 
} from '../types';
import { exportAllToExcel } from '../utils/excelExport';

interface ReportsProps {
  invoices: Invoice[];
  maintenance: MaintenanceTicket[];
  recharges: RechargeLog[];
  expenses: Expense[];
  cashLogs: CashLog[];
  instaPayLogs: InstaPayLog[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  walletTransfers?: WalletTransferLog[];
}

export default function Reports({
  invoices,
  maintenance,
  recharges,
  expenses,
  cashLogs,
  instaPayLogs,
  products,
  customers,
  suppliers,
  walletTransfers = []
}: ReportsProps) {
  // Date filtering state
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | 'month' | 'all'>('all');

  // Today ISO date string helper
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  // Last 7 days helper
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  // First day of current month helper
  const firstDayOfMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  // Filter records based on time range selection
  const filterByDate = <T extends { date: string }>(list: T[]): T[] => {
    return list.filter(item => {
      if (timeFilter === 'today') return item.date === todayStr;
      if (timeFilter === '7days') return item.date >= sevenDaysAgoStr;
      if (timeFilter === 'month') return item.date >= firstDayOfMonthStr;
      return true; // all
    });
  };

  const filteredInvoices = useMemo(() => filterByDate(invoices), [invoices, timeFilter, todayStr, sevenDaysAgoStr, firstDayOfMonthStr]);
  const filteredMaintenance = useMemo(() => filterByDate(maintenance), [maintenance, timeFilter, todayStr, sevenDaysAgoStr, firstDayOfMonthStr]);
  const filteredRecharges = useMemo(() => filterByDate(recharges), [recharges, timeFilter, todayStr, sevenDaysAgoStr, firstDayOfMonthStr]);
  const filteredExpenses = useMemo(() => filterByDate(expenses), [expenses, timeFilter, todayStr, sevenDaysAgoStr, firstDayOfMonthStr]);
  const filteredTransfers = useMemo(() => filterByDate(walletTransfers), [walletTransfers, timeFilter, todayStr, sevenDaysAgoStr, firstDayOfMonthStr]);

  // Financial engine calculations
  const finances = useMemo(() => {
    // 1. Sales metrics
    const totalSalesRev = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    // Cost of goods sold (COGS)
    let totalCogs = 0;
    filteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        totalCogs += (item.buyPrice * item.quantity);
      });
    });
    const grossGoodsProfit = Math.max(0, totalSalesRev - totalCogs);

    // 2. Maintenance metrics
    const totalMntRev = filteredMaintenance.reduce((sum, ticket) => sum + ticket.totalCost, 0);
    const totalPartsCost = filteredMaintenance.reduce((sum, ticket) => sum + ticket.sparePartsCost, 0);
    const netMntLaborProfit = Math.max(0, totalMntRev - totalPartsCost);

    // 3. Recharge profits
    const netRechargeProfit = filteredRecharges.reduce((sum, r) => sum + r.commission, 0);

    // 3b. Wallet Transfer profits
    const netTransferProfit = filteredTransfers.reduce((sum, t) => sum + t.commission, 0);

    // 4. Overhead Expenses
    const totalExpensesOut = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // 5. Grand Net profit of store
    const totalProfitBreakdown = grossGoodsProfit + netMntLaborProfit + netRechargeProfit + netTransferProfit;
    const shopNetProfit = totalProfitBreakdown - totalExpensesOut;

    return {
      totalSalesRev,
      totalCogs,
      grossGoodsProfit,
      totalMntRev,
      totalPartsCost,
      netMntLaborProfit,
      netRechargeProfit,
      netTransferProfit,
      totalExpensesOut,
      shopNetProfit
    };
  }, [filteredInvoices, filteredMaintenance, filteredRecharges, filteredExpenses, filteredTransfers]);

  // Chart Data preparation
  const barChartData = useMemo(() => {
    return [
      {
        name: 'المبيعات',
        'الإيراد الكلي': finances.totalSalesRev,
        'التكلفة والرأس مال': finances.totalCogs,
        'الربح الصافي': finances.grossGoodsProfit,
      },
      {
        name: 'الصيانة والورشة',
        'الإيراد الكلي': finances.totalMntRev,
        'التكلفة والرأس مال': finances.totalPartsCost,
        'الربح الصافي': finances.netMntLaborProfit,
      },
      {
        name: 'شحن الرصيد',
        'الإيراد الكلي': finances.netRechargeProfit,
        'التكلفة والرأس مال': 0,
        'الربح الصافي': finances.netRechargeProfit,
      },
      {
        name: 'تحويلات الكاش',
        'الإيراد الكلي': finances.netTransferProfit,
        'التكلفة والرأس مال': 0,
        'الربح الصافي': finances.netTransferProfit,
      }
    ];
  }, [finances]);

  // Expenses categories share for pie chart
  const pieChartData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredExpenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      value: categories[cat]
    }));
  }, [filteredExpenses]);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#a855f7', '#64748b'];

  // Trigger professional Excel Exporter
  const handleExcelExport = () => {
    try {
      exportAllToExcel({
        products,
        customers,
        suppliers,
        invoices,
        maintenance,
        recharges,
        expenses,
        cashLogs,
        instaPayLogs
      });
      alert('تم تصدير الدفاتر الحسابية والمخازن إلى ملف Excel بنجاح!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تصدير ملف الإكسل. يرجى مراجعة مخرجات الكونسول.');
    }
  };

  return (
    <div className="space-y-6" id="reports-dashboard-panel">
      
      {/* 1. Dashboard Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 text-white rounded-lg">
            <BarChart3 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800">الحسابات والتقارير المالية التحليلية</h1>
            <p className="text-xs text-slate-500">مراقبة الأرباح التشغيلية والمصروفات الإدارية وإيرادات الكاش والتحويلات</p>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50 text-xs">
          {[
            { value: 'today', label: 'اليوم' },
            { value: '7days', label: 'آخر 7 أيام' },
            { value: 'month', label: 'الشهر الحالي' },
            { value: 'all', label: 'كل الفترات' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setTimeFilter(item.value as any)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                timeFilter === item.value 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Comprehensive Shop-wide Profit Equation KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="reports-kpi-grid">
        {/* Sales Gross Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">إجمالي ربح المبيعات والبضائع</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 block font-mono">
            {finances.grossGoodsProfit.toLocaleString('ar-EG')} ج.م.
          </span>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>الإيراد: {finances.totalSalesRev.toLocaleString('ar-EG')}</span>
            <span>التكلفة: -{finances.totalCogs.toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* Workshop Labor Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">أرباح مصنعية الصيانة والورشة</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 block font-mono">
            {finances.netMntLaborProfit.toLocaleString('ar-EG')} ج.م.
          </span>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>الإيراد: {finances.totalMntRev.toLocaleString('ar-EG')}</span>
            <span>قطع الغيار: -{finances.totalPartsCost.toLocaleString('ar-EG')}</span>
          </div>
        </div>

        {/* Recharge Commissions */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">أرباح وعمولات شحن الرصيد</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-emerald-600 block font-mono">
            {finances.netRechargeProfit.toLocaleString('ar-EG')} ج.م.
          </span>
          <div className="text-[10px] text-slate-400">
            <span>صافي عمولات فوري وأمان والتحصيلات</span>
          </div>
        </div>

        {/* Operational Overhead Expenses */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold">المصروفات التشغيلية والإدارية</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xl font-extrabold text-rose-600 block font-mono">
            -{finances.totalExpensesOut.toLocaleString('ar-EG')} ج.م.
          </span>
          <div className="text-[10px] text-slate-400">
            <span>إيجار، كهرباء، رواتب بوفيه وصيانة</span>
          </div>
        </div>
      </div>

      {/* Grand Net Profit highlighting banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md" id="grand-net-profit-banner">
        <div className="space-y-1 flex-1">
          <span className="text-xs text-blue-200 font-bold tracking-wide block">صافي أرباح المحل النهائية الاستثمارية Net Profit</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {finances.shopNetProfit.toLocaleString('ar-EG')} ج.م.
            </span>
            <span className="text-xs text-blue-100 font-semibold">(بعد خصم مصروفات التشغيل والكهرباء والرواتب)</span>
          </div>
          <p className="text-[11px] text-blue-300 leading-relaxed max-w-xl">
            يتم حساب صافي الربح من خلال جمع (أرباح مبيعات البضائع + أرباح مصنعية صيانة الهواتف + أرباح الشحن وعمولاته) ثم طرح (إجمالي المصروفات العمومية والإدارية).
          </p>
        </div>

        {/* Big professional Excel Exporter trigger */}
        <button 
          onClick={handleExcelExport}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-900 font-extrabold px-6 py-4.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg whitespace-nowrap"
          id="reports-export-excel-btn"
        >
          <FileSpreadsheet className="w-5 h-5 stroke-2 text-slate-950" />
          تصدير التقرير المحاسبي المتكامل Excel
        </button>
      </div>

      {/* 3. Recharts Graphics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-visuals-grid">
        
        {/* Bar Chart: Revenues vs Costs vs Profits (Span 7) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4" id="reports-bar-chart-card">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Activity className="w-4.5 h-4.5 text-blue-500" />
            هيكل الإيرادات والمصاريف والأرباح حسب القسم
          </h3>

          <div className="h-72 text-xs" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} />
                <YAxis stroke="#64748b" tickLine={false} />
                <Tooltip 
                  contentStyle={{ textAlign: 'right', direction: 'rtl', borderRadius: '8px' }} 
                  formatter={(value) => [`${value} ج.م.`, '']}
                />
                <Legend />
                <Bar dataKey="الإيراد الكلي" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="التكلفة والرأس مال" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الربح الصافي" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Expenses Distribution (Span 5) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-4" id="reports-pie-chart-card">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <ArrowDownLeft className="w-4.5 h-4.5 text-rose-500" />
            تحليل وتوزيع المصروفات العمومية
          </h3>

          <div className="h-64 text-xs relative flex items-center justify-center" style={{ direction: 'ltr' }}>
            {pieChartData.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 italic">
                <span>لا توجد مصروفات مسجلة لعرض مخطط التوزيع.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ textAlign: 'right', direction: 'rtl', borderRadius: '8px' }} 
                    formatter={(value) => [`${value} ج.م.`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
