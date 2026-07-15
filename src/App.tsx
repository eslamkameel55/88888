/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Wrench, 
  Users, 
  Truck, 
  Zap, 
  PiggyBank, 
  TrendingDown, 
  BarChart3, 
  ShoppingBag, 
  LayoutDashboard, 
  Settings as SettingsIcon,
  Printer, 
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Key Entity Interfaces
import { 
  Product, 
  Invoice, 
  Customer, 
  Supplier, 
  MaintenanceTicket, 
  RechargeLog, 
  WalletTransferLog,
  CashLog, 
  InstaPayLog, 
  Expense, 
  StoreSettings, 
  SaleItem 
} from './types';

// Mock Initial Datasets
import { 
  INITIAL_PRODUCTS, 
  INITIAL_INVOICES, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_MAINTENANCE, 
  INITIAL_RECHARGE, 
  INITIAL_CASH_LOGS, 
  INITIAL_INSTAPAY_LOGS, 
  INITIAL_EXPENSES, 
  INITIAL_WALLET_TRANSFERS,
  DEFAULT_SETTINGS 
} from './data/mockData';

// Module Components
import Dashboard from './components/Dashboard';
import CashierSales from './components/CashierSales';
import Products from './components/Products';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Maintenance from './components/Maintenance';
import Recharge from './components/Recharge';
import WalletTransfers from './components/WalletTransfers';
import CashLogs from './components/CashLogs';
import InstaPayLogs from './components/InstaPayLogs';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import InvoiceModal from './components/InvoiceModal';

function App() {
  // Master Central React States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE);
  const [recharges, setRecharges] = useState<RechargeLog[]>(INITIAL_RECHARGE);
  const [walletTransfers, setWalletTransfers] = useState<WalletTransferLog[]>(INITIAL_WALLET_TRANSFERS);
  const [cashLogs, setCashLogs] = useState<CashLog[]>(INITIAL_CASH_LOGS);
  const [instaPayLogs, setInstaPayLogs] = useState<InstaPayLog[]>(INITIAL_INSTAPAY_LOGS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Active module navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Receipt Modal printing triggers
  const [activePrintModal, setActivePrintModal] = useState<{
    type: 'sale' | 'mnt-intake' | 'mnt-delivery';
    invoiceData?: Invoice;
    ticketData?: MaintenanceTicket;
  } | null>(null);

  // Dynamic calculations for sidebar quick stats
  const cashBalance = useMemo(() => {
    const totalIn = cashLogs.filter(l => l.type === 'دخول كاش').reduce((sum, l) => sum + l.amount, 0);
    const totalOut = cashLogs.filter(l => l.type === 'خروج كاش').reduce((sum, l) => sum + l.amount, 0);
    return totalIn - totalOut;
  }, [cashLogs]);

  const instaPayBalance = useMemo(() => {
    const totalIn = instaPayLogs.filter(l => l.type === 'دخول').reduce((sum, l) => sum + l.amount, 0);
    const totalOut = instaPayLogs.filter(l => l.type === 'خروج').reduce((sum, l) => sum + l.amount, 0);
    return totalIn - totalOut;
  }, [instaPayLogs]);

  const lowStockCount = useMemo(() => {
    return products.filter(p => p.quantity <= p.minStock).length;
  }, [products]);

  const pendingRepairCount = useMemo(() => {
    return maintenance.filter(m => m.status !== 'تم التسليم').length;
  }, [maintenance]);

  // ==========================================
  // SYNC STATE ACTION HANDLERS
  // ==========================================

  // 1. POS Sale Settlement
  const handleSaveInvoice = (invoice: Invoice) => {
    // Save invoice
    setInvoices(prev => [...prev, invoice]);

    // Handle financials logs
    const todayStr = invoice.date;
    const timeStr = invoice.time;

    if (invoice.paymentMethod === 'نقدي') {
      const lastLog = cashLogs[cashLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const newLog: CashLog = {
        id: `CSH-${Date.now()}`,
        type: 'دخول كاش',
        reason: `تحصيل فاتورة مبيعات رقمية نقداً ${invoice.id}`,
        amount: invoice.grandTotal,
        date: todayStr,
        time: timeStr,
        balanceAfter: prevBal + invoice.grandTotal
      };
      setCashLogs(prev => [...prev, newLog]);
    } else {
      const lastLog = instaPayLogs[instaPayLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const newLog: InstaPayLog = {
        id: `INS-${Date.now()}`,
        type: 'دخول',
        reason: `تحصيل فاتورة مبيعات إلكترونية ${invoice.id}`,
        amount: invoice.grandTotal,
        date: todayStr,
        time: timeStr,
        balanceAfter: prevBal + invoice.grandTotal
      };
      setInstaPayLogs(prev => [...prev, newLog]);
    }

    // Sync Customer balance or auto-create customer ledger entry
    const existingCustIndex = customers.findIndex(c => c.phone === invoice.customerPhone);
    if (existingCustIndex !== -1) {
      setCustomers(prev => prev.map((c, i) => {
        if (i === existingCustIndex) {
          const totalPurchases = c.totalPurchases + invoice.grandTotal;
          const totalPaid = c.totalPaid + invoice.grandTotal;
          return {
            ...c,
            totalPurchases,
            totalPaid
          };
        }
        return c;
      }));
    } else {
      // Auto-create new customer ledger
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: invoice.customerName,
        phone: invoice.customerPhone || 'زبون عام',
        address: '',
        notes: 'تم تسجيل العميل تلقائياً أثناء عملية الشراء من الكاشير.',
        totalPurchases: invoice.grandTotal,
        totalPaid: invoice.grandTotal,
        totalRemaining: 0
      };
      setCustomers(prev => [...prev, newCust]);
    }
  };

  // 2. Adjust Product quantities upon checkout
  const handleUpdateProductsQuantity = (items: SaleItem[], isRefund: boolean) => {
    setProducts(prev => prev.map(p => {
      const cartItem = items.find(item => item.productId === p.id);
      if (cartItem) {
        const factor = isRefund ? 1 : -1;
        const newQty = Math.max(0, p.quantity + (cartItem.quantity * factor));
        return {
          ...p,
          quantity: newQty
        };
      }
      return p;
    }));
  };

  // 3. Delete / Rollback Sales invoice
  const handleDeleteInvoice = (invoiceId: string) => {
    const targetInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!targetInvoice) return;

    if (!window.confirm('هل تريد بالتأكيد إلغاء هذه الفاتورة؟ سيتم استرجاع كميات المنتجات المباعة وإلغاء المعاملات الصندوقية.')) return;

    // Rollback product stock
    handleUpdateProductsQuantity(targetInvoice.items, true);

    // Rollback cash/insta logs
    if (targetInvoice.paymentMethod === 'نقدي') {
      const lastLog = cashLogs[cashLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const rollLog: CashLog = {
        id: `CSH-ROLL-${Date.now()}`,
        type: 'خروج كاش',
        reason: `إلغاء ومرتجع فاتورة المبيعات ${invoiceId}`,
        amount: targetInvoice.grandTotal,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
        balanceAfter: prevBal - targetInvoice.grandTotal
      };
      setCashLogs(prev => [...prev, rollLog]);
    } else {
      const lastLog = instaPayLogs[instaPayLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const rollLog: InstaPayLog = {
        id: `INS-ROLL-${Date.now()}`,
        type: 'خروج',
        reason: `إلغاء ومرتجع فاتورة المبيعات ${invoiceId}`,
        amount: targetInvoice.grandTotal,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
        balanceAfter: prevBal - targetInvoice.grandTotal
      };
      setInstaPayLogs(prev => [...prev, rollLog]);
    }

    // Delete invoice
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    alert('تم إلغاء الفاتورة بالكامل وإعادة تصفير كميات السلع بنجاح!');
  };

  // 4. Products Master edits
  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleUpdateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('هل تريد بالتأكيد حذف هذا المنتج نهائياً من قاعدة بيانات المحل؟')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // 5. Customer debt collection payout
  const handleRecordCustomerPayment = (customerId: string, amount: number, notes: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const totalPaid = c.totalPaid + amount;
        const totalRemaining = Math.max(0, c.totalPurchases - totalPaid);
        return {
          ...c,
          totalPaid,
          totalRemaining
        };
      }
      return c;
    }));

    // Record cash inflow
    const lastLog = cashLogs[cashLogs.length - 1];
    const prevBal = lastLog ? lastLog.balanceAfter : 0;
    const targetCust = customers.find(c => c.id === customerId);
    const csh: CashLog = {
      id: `CSH-${Date.now()}`,
      type: 'دخول كاش',
      reason: `تحصيل نقدية من العميل: ${targetCust?.name} - بيان: ${notes}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      balanceAfter: prevBal + amount
    };
    setCashLogs(prev => [...prev, csh]);
  };

  // 6. Wholesaler payment payout
  const handleRecordSupplierPayment = (supplierId: string, amount: number, notes: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const totalPaid = s.totalPaid + amount;
        const totalRemaining = Math.max(0, s.totalBalance - totalPaid);
        return {
          ...s,
          totalPaid,
          totalRemaining
        };
      }
      return s;
    }));

    // Record cash outflow from drawer
    const lastLog = cashLogs[cashLogs.length - 1];
    const prevBal = lastLog ? lastLog.balanceAfter : 0;
    const targetSupp = suppliers.find(sup => sup.id === supplierId);
    const csh: CashLog = {
      id: `CSH-${Date.now()}`,
      type: 'خروج كاش',
      reason: `تسديد دفعة مالية للمورد: ${targetSupp?.name} - ملاحظة: ${notes}`,
      amount,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      balanceAfter: prevBal - amount
    };
    setCashLogs(prev => [...prev, csh]);
  };

  // 7. Repair intake registration
  const handleAddMaintenanceTicket = (ticket: MaintenanceTicket) => {
    setMaintenance(prev => [...prev, ticket]);

    // Record down-payment as cash inflow
    if (ticket.paid > 0) {
      const lastLog = cashLogs[cashLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const csh: CashLog = {
        id: `CSH-${Date.now()}`,
        type: 'دخول كاش',
        reason: `عربون صيانة مقدم للجهاز ${ticket.deviceType} ${ticket.deviceModel} - تذكرة ${ticket.id}`,
        amount: ticket.paid,
        date: ticket.date,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
        balanceAfter: prevBal + ticket.paid
      };
      setCashLogs(prev => [...prev, csh]);
    }

    // Connect Customer or register Customer record
    const existingCust = customers.find(c => c.phone === ticket.customerPhone);
    if (!existingCust) {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: ticket.customerName,
        phone: ticket.customerPhone,
        address: '',
        notes: `عميل صيانة هاتف ${ticket.deviceType} ${ticket.deviceModel}`,
        totalPurchases: ticket.totalCost,
        totalPaid: ticket.paid,
        totalRemaining: ticket.remaining
      };
      setCustomers(prev => [...prev, newCust]);
    } else {
      setCustomers(prev => prev.map(c => {
        if (c.phone === ticket.customerPhone) {
          const totalPurchases = c.totalPurchases + ticket.totalCost;
          const totalPaid = c.totalPaid + ticket.paid;
          const totalRemaining = Math.max(0, totalPurchases - totalPaid);
          return {
            ...c,
            totalPurchases,
            totalPaid,
            totalRemaining
          };
        }
        return c;
      }));
    }
  };

  // 8. Repair status update / cash settle
  const handleUpdateMaintenanceTicket = (ticket: MaintenanceTicket) => {
    const prevTicket = maintenance.find(m => m.id === ticket.id);
    setMaintenance(prev => prev.map(m => m.id === ticket.id ? ticket : m));

    // Settle cash drawer if additional payments were made
    if (prevTicket && ticket.paid > prevTicket.paid) {
      const delta = ticket.paid - prevTicket.paid;
      const lastLog = cashLogs[cashLogs.length - 1];
      const prevBal = lastLog ? lastLog.balanceAfter : 0;
      const csh: CashLog = {
        id: `CSH-${Date.now()}`,
        type: 'دخول كاش',
        reason: `تحصيل متبقي صيانة وتسليم الجهاز ${ticket.deviceType} ${ticket.deviceModel} - تذكرة ${ticket.id}`,
        amount: delta,
        date: new Date().toISOString().slice(0, 10),
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
        balanceAfter: prevBal + delta
      };
      setCashLogs(prev => [...prev, csh]);

      // Sync customer ledger
      setCustomers(prev => prev.map(c => {
        if (c.phone === ticket.customerPhone) {
          const totalPaid = c.totalPaid + delta;
          const totalRemaining = Math.max(0, c.totalPurchases - totalPaid);
          return {
            ...c,
            totalPaid,
            totalRemaining
          };
        }
        return c;
      }));
    }
  };

  // 9. Mobile topup registration
  const handleAddRecharge = (log: RechargeLog) => {
    setRecharges(prev => [...prev, log]);

    // Financial double entry:
    // Inward: Customer pays face-value + commission
    const lastLog = cashLogs[cashLogs.length - 1];
    const prevBal = lastLog ? lastLog.balanceAfter : 0;
    const grossCashIn = log.amount + log.commission;

    const inLog: CashLog = {
      id: `CSH-${Date.now()}-IN`,
      type: 'دخول كاش',
      reason: `تحصيل شحن رصيد نقدي ${log.network} للرقم ${log.phone}`,
      amount: grossCashIn,
      date: log.date,
      time: log.time,
      balanceAfter: prevBal + grossCashIn
    };

    // Outward: Fawry/Aman retailer drawer drops by face-value
    const outLog: CashLog = {
      id: `CSH-${Date.now()}-OUT`,
      type: 'خروج كاش',
      reason: `سحب رصيد شحن مسيل لشركة الاتصالات ${log.network} للرقم ${log.phone}`,
      amount: log.amount,
      date: log.date,
      time: log.time,
      balanceAfter: prevBal + log.commission // (prevBal + grossCashIn - log.amount)
    };

    setCashLogs(prev => [...prev, inLog, outLog]);
  };

  // 9b. Mobile Wallet Transfer registration
  const handleAddWalletTransfer = (log: WalletTransferLog) => {
    setWalletTransfers(prev => [...prev, log]);

    const lastLog = cashLogs[cashLogs.length - 1];
    const prevBal = lastLog ? lastLog.balanceAfter : 0;

    if (log.type === 'إيداع') {
      const grossIn = log.amount + log.fee;
      const csh: CashLog = {
        id: `CSH-TRF-${Date.now()}`,
        type: 'دخول كاش',
        reason: `إيداع كاش بمحفظة (${log.walletType}) رقم: ${log.phone} (المبلغ: ${log.amount} + رسوم: ${log.fee})`,
        amount: grossIn,
        date: log.date,
        time: log.time,
        balanceAfter: prevBal + grossIn
      };
      setCashLogs(prev => [...prev, csh]);
    } else {
      const grossOut = log.amount - log.fee;
      const csh: CashLog = {
        id: `CSH-TRF-${Date.now()}`,
        type: 'خروج كاش',
        reason: `سحب كاش من محفظة (${log.walletType}) رقم: ${log.phone} (المبلغ: ${log.amount} - رسوم مخصومة: ${log.fee})`,
        amount: grossOut,
        date: log.date,
        time: log.time,
        balanceAfter: prevBal - grossOut
      };
      setCashLogs(prev => [...prev, csh]);
    }
  };

  // 10. Operational Expenses registration
  const handleAddExpense = (expense: Expense) => {
    setExpenses(prev => [...prev, expense]);

    // Operational expenses represent automatic cash outflow from drawer
    const lastLog = cashLogs[cashLogs.length - 1];
    const prevBal = lastLog ? lastLog.balanceAfter : 0;
    const csh: CashLog = {
      id: `CSH-${Date.now()}`,
      type: 'خروج كاش',
      reason: `صرف مصروفات تشغيل: [${expense.category}] - ${expense.reason}`,
      amount: expense.amount,
      date: expense.date,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      balanceAfter: prevBal - expense.amount
    };
    setCashLogs(prev => [...prev, csh]);
  };

  // Sidebar items listing (Full Arabic translation with custom indicators)
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', icon: LayoutDashboard },
    { id: 'pos', label: 'شاشة كاشير المبيعات POS', icon: ShoppingBag },
    { id: 'products', label: 'مستودع السلع والمخزن', icon: Smartphone, alert: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'maintenance', label: 'صيانة الهواتف والورشة', icon: Wrench, alert: pendingRepairCount > 0 ? pendingRepairCount : undefined },
    { id: 'customers', label: 'حسابات العملاء والديون', icon: Users },
    { id: 'suppliers', label: 'حسابات الموردين والدائنين', icon: Truck },
    { id: 'recharge', label: 'شحن الرصيد والعمولات', icon: Zap },
    { id: 'wallet-transfers', label: 'تحويلات كاش المحافظ', icon: Smartphone },
    { id: 'cash', label: 'حركة خزينة كاش الدرج', icon: PiggyBank },
    { id: 'instapay', label: 'كشف تحويلات إنستا باي', icon: Zap },
    { id: 'expenses', label: 'مصروفات التشغيل الإدارية', icon: TrendingDown },
    { id: 'reports', label: 'التقارير المالية التحليلية', icon: BarChart3 },
    { id: 'settings', label: 'إعدادات المحل والفواتير', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans" style={{ direction: 'rtl', fontFamily: '"Cairo", sans-serif' }}>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside 
        className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 transition-all duration-300 flex flex-col justify-between shadow-2xl z-10 border-l border-slate-800/60 no-print ${
          sidebarOpen ? 'mr-0' : '-mr-64 lg:-mr-64'
        }`}
        id="applet-sidebar-panel"
      >
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
          {/* Logo Brand Header */}
          <div className="p-6 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                ر
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">رينج فون الذكي</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider block mt-0.5">Mobile Shop POS</span>
              </div>
            </div>
            
            {/* Close drawer mobile button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Real-Time Operational Cash boxes */}
          <div className="p-4 mx-4 my-4 bg-slate-800/40 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
                خزينة الدرج (كاش)
              </span>
              <span className="font-mono font-bold text-emerald-400">{cashBalance.toLocaleString('ar-EG')} ج.م.</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                محفظة إنستا باي
              </span>
              <span className="font-mono font-bold text-sky-400">{instaPayBalance.toLocaleString('ar-EG')} ج.م.</span>
            </div>
          </div>

          {/* Core Navigation menu list */}
          <nav className="px-4 py-2 space-y-1" id="applet-navigation-nav">
            {menuItems.map((item, i) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                      : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.alert !== undefined && (
                    <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.alert}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-4 mx-2 border-t border-slate-800">
          <div className="p-3 bg-slate-800/60 rounded-xl">
            <p className="text-[10px] text-slate-500 font-bold mb-1">المستخدم الحالي</p>
            <p className="text-xs text-white font-medium">أحمد محمد (مدير الفرع)</p>
          </div>
        </div>

        {/* Footer Credit panel */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-600">
          <span>رينج فون لخدمات المحمول © 2026</span>
        </div>
      </aside>

      {/* CORE FRAME LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-x-hidden">
        
        {/* Top Header navbar with slide triggers */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between no-print shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-slate-800 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              id="sidebar-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <h2 className="text-sm font-black text-slate-800">
                {settings.storeName}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold">لوحة الإدارة والمحاسبة الذكية</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-left hidden md:block">
              <p className="text-[10px] text-slate-400 font-bold">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">التوقيت: {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <button 
              onClick={() => setActiveTab('pos')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm shadow-emerald-500/10 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ فاتورة مبيعات POS</span>
            </button>
          </div>
        </header>

        {/* ACTIVE MODULE CONTAINER VIEWPORT */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto" id="applet-viewport-section">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              
              {activeTab === 'dashboard' && (
                <Dashboard 
                  products={products}
                  invoices={invoices}
                  customers={customers}
                  suppliers={suppliers}
                  maintenance={maintenance}
                  recharges={recharges}
                  expenses={expenses}
                  cashLogs={cashLogs}
                  instaPayLogs={instaPayLogs}
                  walletTransfers={walletTransfers}
                  onNavigate={(page) => setActiveTab(page)}
                />
              )}

              {activeTab === 'pos' && (
                <CashierSales 
                  products={products}
                  invoices={invoices}
                  customers={customers}
                  onSaveInvoice={handleSaveInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onPrintInvoice={(inv) => setActivePrintModal({ type: 'sale', invoiceData: inv })}
                  onUpdateProductsQuantity={handleUpdateProductsQuantity}
                />
              )}

              {activeTab === 'products' && (
                <Products 
                  products={products}
                  suppliers={suppliers}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === 'customers' && (
                <Customers 
                  customers={customers}
                  invoices={invoices}
                  maintenance={maintenance}
                  onAddCustomer={(c) => setCustomers(prev => [...prev, c])}
                  onUpdateCustomer={(c) => setCustomers(prev => prev.map(old => old.id === c.id ? c : old))}
                  onRecordCustomerPayment={handleRecordCustomerPayment}
                />
              )}

              {activeTab === 'suppliers' && (
                <Suppliers 
                  suppliers={suppliers}
                  onAddSupplier={(s) => setSuppliers(prev => [...prev, s])}
                  onUpdateSupplier={(s) => setSuppliers(prev => prev.map(old => old.id === s.id ? s : old))}
                  onRecordSupplierPayment={handleRecordSupplierPayment}
                />
              )}

              {activeTab === 'maintenance' && (
                <Maintenance 
                  maintenance={maintenance}
                  onAddTicket={handleAddMaintenanceTicket}
                  onUpdateTicket={handleUpdateMaintenanceTicket}
                  onPrintIntakeReceipt={(ticket) => setActivePrintModal({ type: 'mnt-intake', ticketData: ticket })}
                  onPrintDeliveryReceipt={(ticket) => setActivePrintModal({ type: 'mnt-delivery', ticketData: ticket })}
                />
              )}

              {activeTab === 'recharge' && (
                <Recharge 
                  recharges={recharges}
                  onAddRecharge={handleAddRecharge}
                />
              )}

              {activeTab === 'wallet-transfers' && (
                <WalletTransfers 
                  transfers={walletTransfers}
                  onAddTransfer={handleAddWalletTransfer}
                />
              )}

              {activeTab === 'cash' && (
                <CashLogs 
                  cashLogs={cashLogs}
                  onAddCashLog={(log) => setCashLogs(prev => [...prev, log])}
                />
              )}

              {activeTab === 'instapay' && (
                <InstaPayLogs 
                  instaPayLogs={instaPayLogs}
                  onAddInstaPayLog={(log) => setInstaPayLogs(prev => [...prev, log])}
                />
              )}

              {activeTab === 'expenses' && (
                <Expenses 
                  expenses={expenses}
                  onAddExpense={handleAddExpense}
                />
              )}

              {activeTab === 'reports' && (
                <Reports 
                  invoices={invoices}
                  maintenance={maintenance}
                  recharges={recharges}
                  expenses={expenses}
                  cashLogs={cashLogs}
                  instaPayLogs={instaPayLogs}
                  products={products}
                  customers={customers}
                  suppliers={suppliers}
                  walletTransfers={walletTransfers}
                />
              )}

              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs max-w-2xl mx-auto space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="font-extrabold text-slate-800 text-lg">إعدادات المتجر ومعلومات الفواتير المطبوعة</h2>
                    <p className="text-xs text-slate-500 mt-0.5">تعديل الترويسة التجارية وبيانات فروع المحل لتنعكس مباشرة على الفواتير المطبوعة بالكاشير</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); alert('تم حفظ الإعدادات بنجاح!'); }} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="settings-store-name" className="text-xs font-bold text-slate-500 block">اسم المحل التجاري *</label>
                        <input 
                          id="settings-store-name"
                          type="text" 
                          required
                          value={settings.storeName}
                          onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="settings-phone" className="text-xs font-bold text-slate-500 block">رقم الهاتف للتواصل *</label>
                        <input 
                          id="settings-phone"
                          type="text" 
                          required
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="settings-address" className="text-xs font-bold text-slate-500 block">العنوان الجغرافي التفصيلي *</label>
                      <input 
                        id="settings-address"
                        type="text" 
                        required
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="settings-tax-number" className="text-xs font-bold text-slate-500 block">الرقم الضريبي أو السجل التجاري</label>
                        <input 
                          id="settings-tax-number"
                          type="text" 
                          value={settings.taxNumber}
                          onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                          className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="settings-receipt-footer" className="text-xs font-bold text-slate-500 block">تذييل وشروط الفاتورة الافتراضية *</label>
                      <textarea 
                        id="settings-receipt-footer"
                        rows={4}
                        required
                        value={settings.receiptFooter}
                        onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                        className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg leading-relaxed"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      حفظ التغييرات
                    </button>
                  </form>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* RENDER MODAL PRINT OVERLAY */}
      {activePrintModal && (
        <InvoiceModal 
          type={activePrintModal.type}
          invoiceData={activePrintModal.invoiceData}
          ticketData={activePrintModal.ticketData}
          settings={settings}
          onClose={() => setActivePrintModal(null)}
        />
      )}

    </div>
  );
}

export default App;
