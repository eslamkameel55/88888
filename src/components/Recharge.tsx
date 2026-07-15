/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Plus, 
  Smartphone, 
  DollarSign, 
  Clock, 
  User, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { RechargeLog } from '../types';

interface RechargeProps {
  recharges: RechargeLog[];
  onAddRecharge: (recharge: RechargeLog) => void;
}

export default function Recharge({
  recharges,
  onAddRecharge
}: RechargeProps) {
  // Recharge form states
  const [network, setNetwork] = useState<'فودافون' | 'أورنج' | 'اتصالات' | 'وي'>('فودافون');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [commission, setCommission] = useState<number | ''>('');
  const [employee, setEmployee] = useState('عمر');

  // Network brand badges styles
  const networkStyles = {
    'فودافون': 'bg-red-500 text-white',
    'أورنج': 'bg-orange-500 text-white',
    'اتصالات': 'bg-emerald-600 text-white',
    'وي': 'bg-purple-600 text-white'
  };

  // Auto recommend commission when amount changes (e.g. 5%)
  const handleAmountChange = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) {
      setAmount('');
      setCommission('');
      return;
    }
    setAmount(num);
    // Standard margin is usually 5% to 7% or rounded
    const recommended = Math.round(num * 0.05 * 10) / 10; // 5% rounded
    setCommission(recommended || '');
  };

  // Submit Recharge Log
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount || commission === '') {
      alert('خطأ: الرجاء إدخال رقم الهاتف وقيمة الشحن والعمولة!');
      return;
    }

    if (phone.length < 11) {
      if (!window.confirm('ملاحظة: رقم الهاتف غير مطابق لصيغة الأرقام المصرية (11 رقم). هل تريد حفظه على أي حال؟')) return;
    }

    const nextId = `REC-${Date.now()}`;
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const formattedTime = today.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });

    const log: RechargeLog = {
      id: nextId,
      date: formattedDate,
      time: formattedTime,
      network,
      phone,
      amount: Number(amount),
      commission: Number(commission),
      employee
    };

    onAddRecharge(log);

    // Reset inputs
    setPhone('');
    setAmount('');
    setCommission('');
  };

  // Summary statistics
  const summary = useMemo(() => {
    const totalVolume = recharges.reduce((sum, r) => sum + r.amount, 0);
    const totalCommissions = recharges.reduce((sum, r) => sum + r.commission, 0);
    const transactionsCount = recharges.length;

    // Last 3 networks breakdown
    const networkCounts: { [key: string]: number } = { 'فودافون': 0, 'أورنج': 0, 'اتصالات': 0, 'وي': 0 };
    recharges.forEach(r => { networkCounts[r.network] += r.amount; });

    return { totalVolume, totalCommissions, transactionsCount, networkCounts };
  }, [recharges]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="recharge-layout">
      
      {/* 1. Left Column: New Recharge Log intake Form (Span 4) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs flex flex-col justify-between h-fit" id="recharge-form-panel">
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base pb-2 border-b border-slate-100">
            <Zap className="text-amber-500 w-5 h-5" />
            تسجيل حركة شحن رصيد فورية
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Network grid selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 block">اختر شبكة المحمول *</span>
              <div className="grid grid-cols-4 gap-2" id="recharge-network-grid">
                {(['فودافون', 'أورنج', 'اتصالات', 'وي'] as const).map((net, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNetwork(net)}
                    className={`p-2 rounded-lg text-xs font-extrabold text-center transition-all cursor-pointer ${
                      network === net 
                        ? networkStyles[net] + ' ring-2 ring-offset-2 ring-slate-800' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-1">
              <label htmlFor="recharge-phone-input" className="text-xs font-bold text-slate-500 block">رقم الهاتف المراد شحنه له *</label>
              <div className="relative">
                <input 
                  id="recharge-phone-input"
                  type="text" 
                  required
                  placeholder="مثال: 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label htmlFor="recharge-amount-input" className="text-xs font-bold text-slate-500 block">قيمة الشحن (رصيد مسحوب) *</label>
              <div className="relative">
                <input 
                  id="recharge-amount-input"
                  type="number" 
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                />
                <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
              </div>
            </div>

            {/* Commission input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="recharge-commission-input" className="text-xs font-bold text-slate-500">العمولة الصافية (ربح الشحن) *</label>
                <span className="text-[9px] text-emerald-600 font-bold">يقترح السيستم 5%</span>
              </div>
              <div className="relative">
                <input 
                  id="recharge-commission-input"
                  type="number" 
                  step="0.1"
                  required
                  placeholder="0"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value) || '')}
                  className="w-full text-xs p-2.5 pl-10 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                />
                <span className="absolute left-3 top-3 text-[10px] text-slate-400 font-bold">ج.م.</span>
              </div>
            </div>

            {/* Employee select */}
            <div className="space-y-1">
              <label htmlFor="recharge-employee-select" className="text-xs font-bold text-slate-500 block">الموظف القائم بالشحن</label>
              <select 
                id="recharge-employee-select"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
              >
                <option value="عمر">عمر (الكاشير)</option>
                <option value="خالد">خالد (فني صيانة)</option>
                <option value="المدير">المدير المسؤول</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full mt-2 bg-slate-800 hover:bg-slate-950 text-white font-bold p-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              id="submit-recharge-btn"
            >
              <CheckCircle className="w-4 h-4" />
              حفظ حركة الشحن وخصم الرصيد
            </button>
          </form>
        </div>
      </div>

      {/* 2. Right Column: Recharge summaries & Logs table (Span 8) */}
      <div className="lg:col-span-8 space-y-6" id="recharge-logs-panel">
        
        {/* Quick summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="recharge-stats-grid">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">إجمالي عدد الحركات اليوم</span>
            <span className="text-xl font-bold text-slate-700 block mt-2 font-mono">{summary.transactionsCount} حركات</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">حجم الشحن المتداول</span>
            <span className="text-xl font-bold text-blue-600 block mt-2 font-mono">{summary.totalVolume.toLocaleString('ar-EG')} ج.م.</span>
          </div>
          <div className="bg-white p-4 border border-emerald-100 bg-emerald-50/10 rounded-xl">
            <span className="text-xs text-emerald-600 block font-bold">أرباح الشحن الصافية</span>
            <span className="text-xl font-extrabold text-emerald-600 block mt-2 font-mono">{summary.totalCommissions.toLocaleString('ar-EG')} ج.م.</span>
          </div>
        </div>

        {/* Brand volume distribution visualization (progress bars) */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800">حجم الشحنات المتداولة لكل شبكة</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(summary.networkCounts).map((net, idx) => {
              const val = summary.networkCounts[net];
              const max = Math.max(...(Object.values(summary.networkCounts) as number[])) || 1;
              const percent = Math.min(100, (val / max) * 100);

              let barCol = 'bg-red-500';
              if (net === 'أورنج') barCol = 'bg-orange-500';
              if (net === 'اتصالات') barCol = 'bg-emerald-500';
              if (net === 'وي') barCol = 'bg-purple-500';

              return (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{net}</span>
                    <span className="font-mono">{val} ج.م.</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className={`${barCol} h-full rounded-full transition-all`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden" id="recharges-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right divide-y divide-slate-100" id="recharges-logs-table">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                <tr>
                  <th scope="col" className="p-3">التاريخ والوقت</th>
                  <th scope="col" className="p-3">الشبكة المحمول</th>
                  <th scope="col" className="p-3">الرقم المشحون له</th>
                  <th scope="col" className="p-3 text-left">قيمة الشحنة</th>
                  <th scope="col" className="p-3 text-left">عمولتنا (ربح)</th>
                  <th scope="col" className="p-3">الموظف المسؤول</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {recharges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">لا توجد عمليات شحن رصيد مسجلة اليوم بعد.</td>
                  </tr>
                ) : (
                  [...recharges].reverse().map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3">
                        <div className="font-mono">{r.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.time}</div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${networkStyles[r.network]}`}>
                          {r.network}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{r.phone}</td>
                      <td className="p-3 text-left font-mono font-semibold">{r.amount} ج.م.</td>
                      <td className="p-3 text-left font-mono font-bold text-emerald-600">{r.commission} ج.م.</td>
                      <td className="p-3 text-slate-500 font-medium">{r.employee}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
