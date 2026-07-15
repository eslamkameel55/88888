/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Truck, 
  Wrench, 
  Smartphone, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  PiggyBank,
  Zap,
  RefreshCw,
  Calculator
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Product, Invoice, Customer, Supplier, MaintenanceTicket, RechargeLog, WalletTransferLog, CashLog, InstaPayLog, Expense } from '../types';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  maintenance: MaintenanceTicket[];
  recharges: RechargeLog[];
  expenses: Expense[];
  cashLogs: CashLog[];
  instaPayLogs: InstaPayLog[];
  walletTransfers?: WalletTransferLog[];
  onNavigate: (page: string) => void;
}

export default function Dashboard({
  products,
  invoices,
  customers,
  suppliers,
  maintenance,
  recharges,
  expenses,
  cashLogs,
  instaPayLogs,
  walletTransfers = [],
  onNavigate
}: DashboardProps) {
  // Cash Reconciliation state (حساب العجز والزيادة)
  const [actualPhysicalCash, setActualPhysicalCash] = useState<string>('');
  const [showReconciliation, setShowReconciliation] = useState(false);

  // Current Date logic
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []); // YYYY-MM
  const currentYearStr = useMemo(() => new Date().toISOString().slice(0, 4), []); // YYYY

  // 1. Calculations
  const todaySales = useMemo(() => {
    return invoices
      .filter(inv => inv.date === todayStr)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, todayStr]);

  const monthSales = useMemo(() => {
    return invoices
      .filter(inv => inv.date.startsWith(currentMonthStr))
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, currentMonthStr]);

  const yearSales = useMemo(() => {
    return invoices
      .filter(inv => inv.date.startsWith(currentYearStr))
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [invoices, currentYearStr]);

  // Current Cash Balance: Sum of (douveau cash) - (sortie cash)
  const currentCashBalance = useMemo(() => {
    const cashIn = cashLogs
      .filter(l => l.type === 'دخول كاش')
      .reduce((sum, l) => sum + l.amount, 0);
    const cashOut = cashLogs
      .filter(l => l.type === 'خروج كاش')
      .reduce((sum, l) => sum + l.amount, 0);
    return cashIn - cashOut;
  }, [cashLogs]);

  // Current InstaPay Balance: Sum of (in) - (out)
  const currentInstaPayBalance = useMemo(() => {
    const inVal = instaPayLogs
      .filter(l => l.type === 'دخول')
      .reduce((sum, l) => sum + l.amount, 0);
    const outVal = instaPayLogs
      .filter(l => l.type === 'خروج')
      .reduce((sum, l) => sum + l.amount, 0);
    return inVal - outVal;
  }, [instaPayLogs]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const rechargeTotals = useMemo(() => {
    const totalAmount = recharges.reduce((sum, r) => sum + r.amount, 0);
    const totalProfit = recharges.reduce((sum, r) => sum + r.commission, 0);
    return { amount: totalAmount, profit: totalProfit };
  }, [recharges]);

  // Calculations for total profits
  // Profits = Sum of item profits (sellPrice - buyPrice - discount) * quantity 
  // + recharge commissions + maintenance service fees (laborCost) for completed repairs
  // + wallet transfers commission
  const totalProfits = useMemo(() => {
    // 1. Sales profit
    const salesProfit = invoices.reduce((sum, inv) => {
      const invoiceItemsProfit = inv.items.reduce((itemSum, item) => {
        const cost = item.buyPrice * item.quantity;
        const netRevenue = item.total;
        return itemSum + (netRevenue - cost);
      }, 0);
      return sum + (invoiceItemsProfit - inv.discount);
    }, 0);

    // 2. Recharge profit (commission)
    const rechargeProfit = recharges.reduce((sum, r) => sum + r.commission, 0);

    // 3. Maintenance profit (laborCost) for delivered or ready devices
    const maintenanceProfit = maintenance
      .filter(m => m.status === 'تم التسليم' || m.status === 'جاهز')
      .reduce((sum, m) => sum + m.laborCost, 0);

    // 4. Wallet Transfers profit (commission)
    const transfersProfit = walletTransfers.reduce((sum, t) => sum + t.commission, 0);

    return salesProfit + rechargeProfit + maintenanceProfit + transfersProfit;
  }, [invoices, recharges, maintenance, walletTransfers]);

  const salesCount = invoices.length;
  const activeMaintenanceCount = maintenance.filter(m => m.status !== 'تم التسليم').length;
  const deliveredMaintenanceCount = maintenance.filter(m => m.status === 'تم التسليم').length;
  const totalCustomers = customers.length;
  const totalSuppliers = suppliers.length;

  // Actual physical cash discrepancy
  const cashDiscrepancy = useMemo(() => {
    if (!actualPhysicalCash || isNaN(Number(actualPhysicalCash))) return null;
    const diff = Number(actualPhysicalCash) - currentCashBalance;
    return diff;
  }, [actualPhysicalCash, currentCashBalance]);

  // 2. Alerts (التنبيهات التلقائية)
  const alerts = useMemo(() => {
    const list = [];

    // Low stock / Out of stock
    const outOfStock = products.filter(p => p.quantity === 0);
    const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock);
    if (outOfStock.length > 0) {
      list.push({
        type: 'danger',
        message: `نفدت كمية عدد (${outOfStock.length}) من المنتجات!`,
        actionLabel: 'عرض المخزون',
        actionPage: 'products'
      });
    }
    if (lowStock.length > 0) {
      list.push({
        type: 'warning',
        message: `عدد (${lowStock.length}) منتجات وصلت للحد الأدنى للمخزون!`,
        actionLabel: 'طلب بضاعة',
        actionPage: 'products'
      });
    }

    // Delayed maintenance (موعد تسليمها قد فات وحالتها ليست تم التسليم)
    const today = new Date();
    const delayedMnt = maintenance.filter(m => {
      if (m.status === 'تم التسليم') return false;
      const delivery = new Date(m.deliveryDate);
      return delivery < today;
    });
    if (delayedMnt.length > 0) {
      list.push({
        type: 'danger',
        message: `تنبيه: يوجد (${delayedMnt.length}) أجهزة صيانة متأخرة عن موعد التسليم المتوقع!`,
        actionLabel: 'متابعة الصيانة',
        actionPage: 'maintenance'
      });
    }

    // Customers with unpaid balance (له متبقي مستحق)
    const debtorCustomers = customers.filter(c => c.totalRemaining > 0);
    if (debtorCustomers.length > 0) {
      list.push({
        type: 'info',
        message: `يوجد (${debtorCustomers.length}) عملاء لديهم مبالغ متبقية مستحقة بإجمالي ${debtorCustomers.reduce((s, c) => s + c.totalRemaining, 0)} ج.م.`,
        actionLabel: 'كشف مديونيات العملاء',
        actionPage: 'customers'
      });
    }

    // Cash negative balance
    if (currentCashBalance < 0) {
      list.push({
        type: 'danger',
        message: `تنبيه: يوجد عجز بالخزينة! رصيد الكاش الحالي سالب (${currentCashBalance} ج.م.)`,
        actionLabel: 'مراجعة حركة الخزينة',
        actionPage: 'cash'
      });
    }

    return list;
  }, [products, maintenance, customers, currentCashBalance]);

  // 3. Chart Data
  // Sales timeline data (last 7 days)
  const salesTimelineData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      
      const dayInvoices = invoices.filter(inv => inv.date === dStr);
      const daySalesTotal = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
      const dayMntTotal = maintenance
        .filter(m => m.date === dStr)
        .reduce((sum, m) => sum + m.totalCost, 0);
      
      days.push({
        name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        'المبيعات': daySalesTotal,
        'الصيانة': dayMntTotal,
        'الإجمالي': daySalesTotal + dayMntTotal,
      });
    }
    return days;
  }, [invoices, maintenance]);

  // Profits breakdown by category
  const profitCategoryData = useMemo(() => {
    const cats: { [key: string]: number } = {
      'موبايلات': 0,
      'إكسسوارات': 0,
      'قطع غيار': 0,
      'أخرى': 0
    };

    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const profit = (item.sellPrice - item.buyPrice - item.discount) * item.quantity;
        const category = cats[item.category] !== undefined ? item.category : 'أخرى';
        cats[category] += profit;
      });
    });

    return Object.keys(cats).map(cat => ({
      name: cat,
      value: cats[cat]
    })).filter(c => c.value > 0);
  }, [invoices]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* 1. Header with Stats Refresh */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">لوحة التحكم والأداء</h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            متابعة حية للمبيعات والمخزون والصيانة والصندوق لشهر {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setActualPhysicalCash('');
              setShowReconciliation(prev => !prev);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            id="reconcile-cash-btn"
          >
            <Calculator className="w-4 h-4" />
            مطابقة النقدية بالدرج
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            id="refresh-stats-btn"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* 2. Automated Active Alerts Panel */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-3" id="dashboard-alerts">
          {alerts.map((alert, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-4 rounded-xl border text-xs transition-all animate-pulse duration-2000 ${
                alert.type === 'danger' 
                  ? 'bg-rose-50 border-rose-100 text-rose-700 animate-pulse' 
                  : alert.type === 'warning' 
                    ? 'bg-amber-50 border-amber-100 text-amber-700' 
                    : 'bg-blue-50 border-blue-100 text-blue-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.type === 'danger' ? 'text-rose-500' : alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                <span className="font-bold">{alert.message}</span>
              </div>
              <button 
                onClick={() => onNavigate(alert.actionPage)}
                className="text-xs font-bold underline hover:no-underline hover:opacity-80 transition-opacity cursor-pointer"
              >
                {alert.actionLabel} &larr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Cash Reconciliation Modal/Drawer Section */}
      {showReconciliation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl space-y-4 shadow-sm" id="reconciliation-panel">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <PiggyBank className="text-blue-600 w-5 h-5" />
              مطابقة جرد الخزينة (العجز والزيادة الفعلي)
            </h3>
            <button 
              onClick={() => setShowReconciliation(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-xs text-slate-500 block font-bold">رصيد الكاش بالسيستم (الافتراضي)</span>
              <span className="text-xl font-black text-slate-800 block font-mono mt-1">{currentCashBalance.toLocaleString('ar-EG')} ج.م.</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <label htmlFor="physical-cash-input" className="text-xs text-slate-500 block mb-1 font-bold">الرصيد الفعلي الموجود بالدرج حالياً</label>
              <div className="relative">
                <input 
                  id="physical-cash-input"
                  type="number" 
                  value={actualPhysicalCash}
                  onChange={(e) => setActualPhysicalCash(e.target.value)}
                  placeholder="أدخل مبلغ جرد الدرج..."
                  className="w-full text-sm font-bold p-2.5 pl-12 border border-slate-200 rounded-lg text-slate-800 font-mono text-left bg-slate-50"
                />
                <span className="absolute left-3 top-3 text-xs text-slate-400 font-black">ج.م.</span>
              </div>
            </div>
            <div className="h-full flex items-center">
              {cashDiscrepancy !== null ? (
                <div className={`w-full p-4 rounded-xl text-center font-bold text-sm ${
                  cashDiscrepancy === 0 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : cashDiscrepancy > 0 
                      ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {cashDiscrepancy === 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>الخزينة مطابقة تماماً! لا يوجد عجز أو زيادة.</span>
                    </div>
                  )}
                  {cashDiscrepancy > 0 && (
                    <div>
                      <span>يوجد زيادة في النقدية: </span>
                      <span className="font-mono underline font-bold">+{cashDiscrepancy.toLocaleString('ar-EG')} ج.م.</span>
                    </div>
                  )}
                  {cashDiscrepancy < 0 && (
                    <div>
                      <span>يوجد عجز في النقدية: </span>
                      <span className="font-mono underline font-bold">{cashDiscrepancy.toLocaleString('ar-EG')} ج.م.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-xs italic flex items-center gap-1.5 p-3 font-semibold">
                  <HelpCircle className="w-4 h-4" />
                  <span>الرجاء كتابة المبلغ الفعلي لحساب الفارق تلقائياً.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="kpi-grid">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">مبيعات اليوم</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{todaySales.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. مبيعات اليوم الحالي</span>
          </div>
        </div>

        {/* Card 2: Monthly Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">مبيعات الشهر</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{monthSales.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. لشهر {new Date().toLocaleDateString('ar-EG', { month: 'short' })}</span>
          </div>
        </div>

        {/* Card 3: Annual Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full uppercase tracking-wider">مبيعات السنة</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{yearSales.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. لعام {currentYearStr}</span>
          </div>
        </div>

        {/* Card 4: Net Profits */}
        <div className="bg-white p-5 rounded-2xl border-emerald-100 border bg-gradient-to-b from-white to-emerald-50/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">صافي الأرباح</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-emerald-600 block font-mono">{totalProfits.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">أرباح المبيعات + الصيانة + الشحن</span>
          </div>
        </div>

        {/* Card 5: Current Cash Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">الخزينة (نقدي)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-2xl font-black block font-mono ${currentCashBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>{currentCashBalance.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. كاش فعلي بالدرج</span>
          </div>
        </div>

        {/* Card 6: InstaPay Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full uppercase tracking-wider">محفظة إنستا باي</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{currentInstaPayBalance.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. رصيد الحساب الرقمي</span>
          </div>
        </div>

        {/* Card 7: Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">إجمالي المصروفات</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{totalExpenses.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. إيجار، كهرباء، أخرى</span>
          </div>
        </div>

        {/* Card 8: Recharge profits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">أرباح الشحن</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-800 block font-mono">{rechargeTotals.profit.toLocaleString('ar-EG')}</span>
            <span className="text-[10px] text-slate-400 mt-1 block font-bold">ج.م. عمولات من شحن بقيمة {rechargeTotals.amount}</span>
          </div>
        </div>
      </div>

      {/* 5. Second Row Metrics (Maintenance & CRM counts) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" id="counts-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-xs text-slate-400 block font-bold">عمليات البيع</span>
          <span className="text-2xl font-black text-slate-700 block mt-2 font-mono">{salesCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigate('maintenance')}>
          <span className="text-xs text-slate-400 block font-bold">أجهزة صيانة نشطة</span>
          <span className="text-2xl font-black text-blue-600 block mt-2 font-mono">{activeMaintenanceCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-xs text-slate-400 block font-bold">صيانة تم تسليمها</span>
          <span className="text-2xl font-black text-emerald-600 block mt-2 font-mono">{deliveredMaintenanceCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigate('customers')}>
          <span className="text-xs text-slate-400 block font-bold">عدد العملاء المسجلين</span>
          <span className="text-2xl font-black text-indigo-600 block mt-2 font-mono">{totalCustomers}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigate('suppliers')}>
          <span className="text-xs text-slate-400 block font-bold">عدد الموردين المسجلين</span>
          <span className="text-2xl font-black text-purple-600 block mt-2 font-mono">{totalSuppliers}</span>
        </div>
      </div>

      {/* 6. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
        {/* Main Timeline Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-sm">مؤشر الإيرادات اليومية (المبيعات والصيانة)</h3>
            <span className="text-xs text-slate-400 font-bold">آخر ٧ أيام</span>
          </div>
          <div className="h-64" id="timeline-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="المبيعات" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="الصيانة" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorMnt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profits by Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm">توزيع الأرباح حسب الفئة</h3>
          {profitCategoryData.length > 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="h-44 w-full" id="pie-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={profitCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {profitCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} ج.م.`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs w-full">
                {profitCategoryData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 justify-center">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span className="text-slate-500 font-bold">{entry.name}</span>
                    <span className="font-mono font-black text-slate-800">({entry.value} ج.م.)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm italic py-10">
              <Layers className="w-12 h-12 text-slate-300 stroke-1 mb-2" />
              <span>لا توجد مبيعات مسجلة لحساب أرباح الفئات بعد.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
