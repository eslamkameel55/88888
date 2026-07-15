/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  CheckCircle2, 
  Smartphone,
  TrendingUp,
  DollarSign,
  Clock,
  User,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { WalletTransferLog } from '../types';

interface WalletTransfersProps {
  transfers: WalletTransferLog[];
  onAddTransfer: (log: WalletTransferLog) => void;
}

export default function WalletTransfers({
  transfers,
  onAddTransfer
}: WalletTransfersProps) {
  // Form states
  const [type, setType] = useState<'إيداع' | 'سحب'>('إيداع');
  const [walletType, setWalletType] = useState<'فودافون كاش' | 'اتصالات كاش' | 'أورنج كاش' | 'وي باي' | 'محفظة أخرى'>('فودافون كاش');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [fee, setFee] = useState<number | ''>('');
  const [commission, setCommission] = useState<number | ''>('');
  const [employee, setEmployee] = useState('عمر');
  const [notes, setNotes] = useState('');

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterWallet, setFilterWallet] = useState<string>('all');

  // Network brand color configurations
  const walletBadgeStyles = {
    'فودافون كاش': 'bg-rose-50 text-rose-700 border-rose-100',
    'أورنج كاش': 'bg-amber-50 text-amber-700 border-amber-100',
    'اتصالات كاش': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'وي باي': 'bg-purple-50 text-purple-700 border-purple-100',
    'محفظة أخرى': 'bg-slate-50 text-slate-700 border-slate-100'
  };

  const walletButtonStyles = {
    'فودافون كاش': 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/10',
    'أورنج كاش': 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/10',
    'اتصالات كاش': 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/10',
    'وي باي': 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/10',
    'محفظة أخرى': 'bg-slate-700 text-white hover:bg-slate-800 shadow-md shadow-slate-500/10'
  };

  // Auto calculate recommended service fee and profit (commission)
  const handleAmountChange = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) {
      setAmount('');
      setFee('');
      setCommission('');
      return;
    }
    setAmount(num);

    if (type === 'إيداع') {
      // Deposits: Usually charge 5 EGP or 1% of the amount as service fee
      const calculatedFee = num > 0 ? Math.max(5, Math.ceil(num * 0.01)) : '';
      setFee(calculatedFee);
      // Shop profit is usually 80% of the charged service fee
      setCommission(calculatedFee !== '' ? Math.ceil(Number(calculatedFee) * 0.8) : '');
    } else {
      // Withdrawals: Customer transfers to us, system deducts standard withdrawal fee.
      // We charge 1% fee or flat 10 EGP
      const calculatedFee = num > 0 ? Math.max(10, Math.ceil(num * 0.015)) : '';
      setFee(calculatedFee);
      setCommission(calculatedFee !== '' ? Math.ceil(Number(calculatedFee) * 0.7) : '');
    }
  };

  // Handle Type Change and recalculate
  const handleTypeChange = (newType: 'إيداع' | 'سحب') => {
    setType(newType);
    if (amount) {
      const num = Number(amount);
      if (newType === 'إيداع') {
        const calculatedFee = Math.max(5, Math.ceil(num * 0.01));
        setFee(calculatedFee);
        setCommission(Math.ceil(calculatedFee * 0.8));
      } else {
        const calculatedFee = Math.max(10, Math.ceil(num * 0.015));
        setFee(calculatedFee);
        setCommission(Math.ceil(calculatedFee * 0.7));
      }
    }
  };

  // Submit new transfer log
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount || fee === '' || commission === '') {
      alert('خطأ: الرجاء إدخال رقم الهاتف، مبلغ التحويل، رسوم الخدمة وقيمة الربح!');
      return;
    }

    if (phone.length < 11) {
      if (!window.confirm('رقم الهاتف المدخل أقل من 11 رقماً (أرقام الهواتف المصرية). هل تريد الاستمرار وحفظ المعاملة؟')) return;
    }

    const nextId = `TRF-${Date.now()}`;
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const formattedTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });

    const log: WalletTransferLog = {
      id: nextId,
      date: formattedDate,
      time: formattedTime,
      type,
      walletType,
      phone,
      amount: Number(amount),
      fee: Number(fee),
      commission: Number(commission),
      employee,
      notes: notes || (type === 'إيداع' ? `إيداع بمحفظة العميل` : `سحب من محفظة العميل`)
    };

    onAddTransfer(log);

    // Reset fields
    setPhone('');
    setAmount('');
    setFee('');
    setCommission('');
    setNotes('');
    alert(`تم تسجيل حركة التحويل للـ (${walletType}) بنجاح وتحديث صندوق الخزينة!`);
  };

  // Analytics & Summary statistics
  const metrics = useMemo(() => {
    const depositsList = transfers.filter(t => t.type === 'إيداع');
    const withdrawalsList = transfers.filter(t => t.type === 'سحب');

    const totalDepositsVolume = depositsList.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawalsVolume = withdrawalsList.reduce((sum, t) => sum + t.amount, 0);

    const totalFees = transfers.reduce((sum, t) => sum + t.fee, 0);
    const totalNetProfit = transfers.reduce((sum, t) => sum + t.commission, 0);

    // Net Cash Flow effect in drawer
    // Deposit: customer gives cash (amount + fee) -> cash drawer goes UP
    // Withdrawal: customer gets cash (amount - fee) -> cash drawer goes DOWN
    // So net drawer change = (deposits_volume + deposits_fees) - (withdrawals_volume - withdrawals_fees)
    const netDrawerCashChange = transfers.reduce((sum, t) => {
      if (t.type === 'إيداع') {
        return sum + (t.amount + t.fee);
      } else {
        // Shop pays back cash: amount - fee is given to customer (or they pay fee in cash)
        return sum - (t.amount - t.fee);
      }
    }, 0);

    return {
      depositsCount: depositsList.length,
      withdrawalsCount: withdrawalsList.length,
      totalDepositsVolume,
      totalWithdrawalsVolume,
      totalFees,
      totalNetProfit,
      netDrawerCashChange
    };
  }, [transfers]);

  // Filtered transfer logs
  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      const matchesSearch = 
        t.phone.includes(searchQuery) || 
        t.notes.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesWallet = filterWallet === 'all' || t.walletType === filterWallet;

      return matchesSearch && matchesType && matchesWallet;
    });
  }, [transfers, searchQuery, filterType, filterWallet]);

  return (
    <div className="space-y-6" id="wallet-transfers-root">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">كشف تحويلات كاش المحافظ</h1>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              إدارة حركة الإيداع والسحب لشبكات (فودافون كاش، اتصالات، أورنج، وي) وتسجيل العمولات وصافي أرباح الخدمات
            </p>
          </div>
        </div>
      </div>

      {/* Main Core Layout: Form vs History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="wallet-main-layout">
        
        {/* Left Column: Form to add transfer (Span 4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit" id="transfer-intake-panel">
          <h2 className="font-extrabold text-slate-800 flex items-center gap-2 text-base pb-3 border-b border-slate-100">
            <Sparkles className="text-rose-500 w-5 h-5 animate-pulse" />
            تسجيل حركة تحويل كاش جديدة
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            {/* Transaction type switcher */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 block">نوع العملية المالية *</span>
              <div className="grid grid-cols-2 gap-2" id="wallet-type-grid">
                <button
                  type="button"
                  onClick={() => handleTypeChange('إيداع')}
                  className={`p-3 rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    type === 'إيداع' 
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/10' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  إيداع للمحفظة (شحن)
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('سحب')}
                  className={`p-3 rounded-xl text-xs font-extrabold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    type === 'سحب' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  سحب من المحفظة (صرف كاش)
                </button>
              </div>
            </div>

            {/* Provider selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">شبكة المحفظة المزودة *</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-1.5" id="wallet-provider-grid">
                {(['فودافون كاش', 'اتصالات كاش', 'أورنج كاش', 'وي باي', 'محفظة أخرى'] as const).map((wt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setWalletType(wt)}
                    className={`py-2 px-1.5 rounded-lg text-[11px] font-extrabold text-center transition-all cursor-pointer border ${
                      walletType === wt 
                        ? walletButtonStyles[wt] + ' border-transparent' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {wt}
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet phone number */}
            <div className="space-y-1">
              <label htmlFor="wallet-phone" className="text-xs font-bold text-slate-500 block">رقم المحفظة (العميل) *</label>
              <div className="relative">
                <input 
                  id="wallet-phone"
                  type="text" 
                  required
                  placeholder="مثال: 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Transfer amount */}
            <div className="space-y-1">
              <label htmlFor="wallet-amount" className="text-xs font-bold text-slate-500 block">مبلغ التحويل الأصلي *</label>
              <div className="relative">
                <input 
                  id="wallet-amount"
                  type="number" 
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-xl font-mono text-left"
                />
                <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
              </div>
            </div>

            {/* Customer Fee */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="wallet-fee" className="text-xs font-bold text-slate-500">رسوم الخدمة (المحصلة من العميل) *</label>
                <span className="text-[9px] text-slate-400 font-bold">يحتسب تلقائياً</span>
              </div>
              <div className="relative">
                <input 
                  id="wallet-fee"
                  type="number" 
                  required
                  placeholder="0"
                  value={fee}
                  onChange={(e) => {
                    const val = Number(e.target.value) || '';
                    setFee(val);
                    if (val !== '') {
                      // Recommend 80% as net profit if they modify fee
                      setCommission(Math.ceil(Number(val) * 0.8));
                    }
                  }}
                  className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-xl font-mono text-left"
                />
                <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
              </div>
            </div>

            {/* Net Profit commission */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="wallet-commission" className="text-xs font-bold text-slate-500">صافي ربح المحل من العملية *</label>
                <span className="text-[9px] text-emerald-600 font-bold">الربح الصافي من الرسوم</span>
              </div>
              <div className="relative">
                <input 
                  id="wallet-commission"
                  type="number" 
                  required
                  placeholder="0"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value) || '')}
                  className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-xl font-mono text-left"
                />
                <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
              </div>
            </div>

            {/* Employee selection */}
            <div className="space-y-1">
              <label htmlFor="wallet-employee" className="text-xs font-bold text-slate-500 block">الموظف القائم بالعملية</label>
              <select 
                id="wallet-employee"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-xl font-bold text-slate-700"
              >
                <option value="عمر">عمر (الكاشير)</option>
                <option value="خالد">خالد (فني صيانة)</option>
                <option value="أحمد محمد">أحمد محمد (المدير)</option>
              </select>
            </div>

            {/* Notes / Transaction reference */}
            <div className="space-y-1">
              <label htmlFor="wallet-notes" className="text-xs font-bold text-slate-500 block">الملاحظات / رقم العملية المعرّف (اختياري)</label>
              <input 
                id="wallet-notes"
                type="text" 
                placeholder="مثال: رقم التحويل، اسم العميل، إلخ"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-xl"
              />
            </div>

            {/* Submit button */}
            <button 
              type="submit"
              className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white font-bold p-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20"
              id="submit-wallet-transfer-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              حفظ حركة التحويل وإدراج بالخزينة
            </button>
          </form>
        </div>

        {/* Right Column: Summaries & Transfer Logs Table (Span 8) */}
        <div className="lg:col-span-8 space-y-6" id="wallet-history-panel">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="wallet-metrics-grid">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الإيداعات</span>
              <span className="text-lg font-black text-rose-500 block mt-1 font-mono">
                {metrics.totalDepositsVolume.toLocaleString('ar-EG')} ج.م.
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">({metrics.depositsCount} عمليات)</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي السحوبات</span>
              <span className="text-lg font-black text-emerald-500 block mt-1 font-mono">
                {metrics.totalWithdrawalsVolume.toLocaleString('ar-EG')} ج.م.
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">({metrics.withdrawalsCount} عمليات)</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-bold">إجمالي الرسوم</span>
              <span className="text-lg font-black text-slate-700 block mt-1 font-mono">
                {metrics.totalFees.toLocaleString('ar-EG')} ج.م.
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">رسوم تشغيل محصلة</span>
            </div>

            <div className="bg-white p-4 border border-emerald-100 bg-emerald-50/10 rounded-2xl shadow-sm">
              <span className="text-[10px] text-emerald-700 block font-bold">الربح الصافي للمحل</span>
              <span className="text-xl font-black text-emerald-600 block mt-1 font-mono">
                +{metrics.totalNetProfit.toLocaleString('ar-EG')} ج.م.
              </span>
              <span className="text-[9px] text-emerald-500 block mt-0.5 font-bold">صافي عمولات الكاش</span>
            </div>

          </div>

          {/* Operational Box Note */}
          <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-extrabold text-blue-900">الأثر المالي المباشر على الخزينة ودرج الكاش:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed pr-3">
                <li>عند <strong className="text-rose-600">الإيداع للعميل</strong>: تستلم نقدية باليد، فيتم تسجيل <strong>دخول كاش</strong> للدرج بمبلغ <code className="bg-slate-100 px-1 py-0.5 rounded font-bold font-mono">المبلغ + الرسوم</code>.</li>
                <li>عند <strong className="text-emerald-600">السحب من العميل</strong>: تدفع له نقدية باليد، فيتم تسجيل <strong>خروج كاش</strong> من الدرج بمبلغ <code className="bg-slate-100 px-1 py-0.5 rounded font-bold font-mono">المبلغ - الرسوم</code>.</li>
              </ul>
            </div>
          </div>

          {/* Transfer statements ledger table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">كشف قيود تحويلات المحافظ</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">عرض وتصفية حركات المحافظ الإلكترونية المسجلة</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute right-2.5 top-2 text-slate-400 w-3.5 h-3.5" />
                  <input 
                    type="text" 
                    placeholder="البحث بالرقم أو البيان..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-[11px] font-bold pr-8 pl-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white w-40"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-[11px] font-bold p-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                >
                  <option value="all">كل العمليات</option>
                  <option value="إيداع">إيداع (شحن)</option>
                  <option value="سحب">سحب (صرف)</option>
                </select>

                {/* Wallet Filter */}
                <select
                  value={filterWallet}
                  onChange={(e) => setFilterWallet(e.target.value)}
                  className="text-[11px] font-bold p-1.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700"
                >
                  <option value="all">كل المحافظ</option>
                  <option value="فودافون كاش">فودافون كاش</option>
                  <option value="اتصالات كاش">اتصالات كاش</option>
                  <option value="أورنج كاش">أورنج كاش</option>
                  <option value="وي باي">وي باي</option>
                  <option value="محفظة أخرى">أخرى</option>
                </select>

              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden border border-slate-100 rounded-xl text-xs" id="transfers-table-wrapper">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-right divide-y divide-slate-100" id="wallet-transfers-table">
                  <thead className="bg-slate-50 text-slate-500 font-bold">
                    <tr>
                      <th scope="col" className="p-3">رقم العملية</th>
                      <th scope="col" className="p-3">التاريخ والوقت</th>
                      <th scope="col" className="p-3 text-center">النوع</th>
                      <th scope="col" className="p-3">شبكة المحفظة</th>
                      <th scope="col" className="p-3">رقم محفظة العميل</th>
                      <th scope="col" className="p-3 text-left">قيمة العملية</th>
                      <th scope="col" className="p-3 text-left">الرسوم</th>
                      <th scope="col" className="p-3 text-left">ربحنا الصافي</th>
                      <th scope="col" className="p-3">البيان والملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredTransfers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400 italic font-bold">
                          لا توجد عمليات تحويل مطابقة لشروط البحث والتصفية.
                        </td>
                      </tr>
                    ) : (
                      [...filteredTransfers].reverse().map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-400">{t.id}</td>
                          <td className="p-3">
                            <div className="font-mono">{t.date}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{t.time}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              t.type === 'إيداع' 
                                ? 'bg-rose-100 text-rose-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {t.type === 'إيداع' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                              {t.type === 'إيداع' ? 'إيداع (شحن)' : 'سحب (صرف)'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${walletBadgeStyles[t.walletType] || walletBadgeStyles['محفظة أخرى']}`}>
                              {t.walletType}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">{t.phone}</td>
                          <td className="p-3 text-left font-mono font-black text-slate-900">{t.amount.toLocaleString('ar-EG')} ج.م.</td>
                          <td className="p-3 text-left font-mono font-semibold text-slate-500">{t.fee.toLocaleString('ar-EG')} ج.م.</td>
                          <td className="p-3 text-left font-mono font-black text-emerald-600">+{t.commission.toLocaleString('ar-EG')} ج.م.</td>
                          <td className="p-3 text-slate-500 text-[11px] max-w-[200px] truncate" title={t.notes}>
                            <div className="font-medium text-slate-700">{t.notes}</div>
                            <div className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-0.5">
                              <User className="w-2.5 h-2.5" />
                              <span>المسؤول: {t.employee}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
