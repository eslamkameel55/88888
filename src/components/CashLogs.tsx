/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Clock, 
  FileText,
  Search,
  CheckCircle2
} from 'lucide-react';
import { CashLog } from '../types';

interface CashLogsProps {
  cashLogs: CashLog[];
  onAddCashLog: (log: CashLog) => void;
}

export default function CashLogs({
  cashLogs,
  onAddCashLog
}: CashLogsProps) {
  // Manual transaction states
  const [type, setType] = useState<'دخول كاش' | 'خروج كاش'>('دخول كاش');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  // Table search
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const summary = useMemo(() => {
    const totalIn = cashLogs
      .filter(l => l.type === 'دخول كاش')
      .reduce((sum, l) => sum + l.amount, 0);

    const totalOut = cashLogs
      .filter(l => l.type === 'خروج كاش')
      .reduce((sum, l) => sum + l.amount, 0);

    const netBalance = totalIn - totalOut;

    return { totalIn, totalOut, netBalance };
  }, [cashLogs]);

  // Filter logs list
  const filteredLogs = useMemo(() => {
    return cashLogs.filter(l => 
      l.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [cashLogs, searchQuery]);

  // Handle Manual Log Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) {
      alert('خطأ: الرجاء تحديد المبلغ والسبب بالتفصيل!');
      return;
    }

    const nextId = `CSH-${Date.now()}`;
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const timeStr = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
    const amountVal = Number(amount);

    const newBalance = type === 'دخول كاش' 
      ? summary.netBalance + amountVal 
      : summary.netBalance - amountVal;

    const log: CashLog = {
      id: nextId,
      type,
      reason,
      amount: amountVal,
      date: dateStr,
      time: timeStr,
      balanceAfter: newBalance
    };

    onAddCashLog(log);

    // Reset fields
    setAmount('');
    setReason('');
    alert('تم تسجيل حركة النقدية بنجاح وتحديث الرصيد التراكمي للدرج!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cash-ledger-layout">
      
      {/* 1. Left Column: Add cash log manually (Span 4) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs h-fit" id="cash-entry-panel">
        <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base pb-3 border-b border-slate-100">
          <PiggyBank className="text-amber-500 w-5 h-5" />
          حركة إيداع / صرف نقدي يدوي
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Action type */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 block">نوع الحركة الصندوقية *</span>
            <div className="grid grid-cols-2 gap-2" id="cash-type-switch">
              <button
                type="button"
                onClick={() => setType('دخول كاش')}
                className={`p-2.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  type === 'دخول كاش' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                وارد (إيداع كاش)
              </button>
              <button
                type="button"
                onClick={() => setType('خروج كاش')}
                className={`p-2.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  type === 'خروج كاش' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                صادر (سحب كاش)
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label htmlFor="cash-amount-input" className="text-xs font-bold text-slate-500 block">مبلغ الحركة النقدية *</label>
            <div className="relative">
              <input 
                id="cash-amount-input"
                type="number" 
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || '')}
                className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
              />
              <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
            </div>
          </div>

          {/* Reason input */}
          <div className="space-y-1">
            <label htmlFor="cash-reason-input" className="text-xs font-bold text-slate-500 block">سبب المعاملة بالتفصيل *</label>
            <textarea 
              id="cash-reason-input"
              rows={3}
              required
              placeholder="مثال: رصيد افتتاحي للدرج اليومي، أو إيداع رأس مال، أو سداد متبقي فاتورة..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-950 text-white font-bold p-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            id="save-cash-log-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            حفظ حركة الخزينة وتحديث الدرج
          </button>
        </form>
      </div>

      {/* 2. Right Column: Ledger tables & KPI metrics (Span 8) */}
      <div className="lg:col-span-8 space-y-6" id="cash-history-panel">
        
        {/* KPI Summary statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="cash-stats-grid">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">إجمالي الوارد والتحصيلات</span>
            <span className="text-xl font-bold text-emerald-600 block mt-2 font-mono">+{summary.totalIn.toLocaleString('ar-EG')} ج.م.</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">إجمالي الصادر والمصروفات</span>
            <span className="text-xl font-bold text-rose-600 block mt-2 font-mono">-{summary.totalOut.toLocaleString('ar-EG')} ج.م.</span>
          </div>
          <div className="bg-white p-4 border border-blue-100 bg-blue-50/10 rounded-xl">
            <span className="text-xs text-blue-600 block font-bold">الرصيد الفعلي الحالي بالدرج</span>
            <span className={`text-xl font-extrabold block mt-2 font-mono ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {summary.netBalance.toLocaleString('ar-EG')} ج.م.
            </span>
          </div>
        </div>

        {/* List ledger table */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm">كشف حركة النقدية التفصيلي للدرج</h3>
            
            {/* Table Search */}
            <div className="relative">
              <Search className="absolute right-2.5 top-1.5 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="البحث بالسبب أو المعرف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-[10px] pr-7 pl-2 py-1 border border-slate-200 rounded bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200/60 rounded-lg text-xs" id="cash-main-table-container">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-right divide-y divide-slate-100" id="cash-main-table">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th scope="col" className="p-3">رقم الحركة</th>
                    <th scope="col" className="p-3">التاريخ والوقت</th>
                    <th scope="col" className="p-3">نوع الحركة</th>
                    <th scope="col" className="p-3">السبب بالتفصيل Statement</th>
                    <th scope="col" className="p-3 text-left">المبلغ</th>
                    <th scope="col" className="p-3 text-left">الرصيد بعدها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">لا توجد حركات نقدية مطابقة للبحث.</td>
                    </tr>
                  ) : (
                    [...filteredLogs].reverse().map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400">{log.id}</td>
                        <td className="p-3">
                          <div className="font-mono">{log.date}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{log.time}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded ${
                            log.type === 'دخول كاش' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {log.type === 'دخول كاش' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600 max-w-[250px] truncate" title={log.reason}>
                          {log.reason}
                        </td>
                        <td className={`p-3 text-left font-mono font-bold ${log.type === 'دخول كاش' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {log.type === 'دخول كاش' ? '+' : '-'}{log.amount.toLocaleString('ar-EG')} ج.م.
                        </td>
                        <td className="p-3 text-left font-mono font-semibold text-slate-700">
                          {log.balanceAfter.toLocaleString('ar-EG')} ج.م.
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
  );
}
