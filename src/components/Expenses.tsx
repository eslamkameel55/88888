/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Clock, 
  User, 
  DollarSign, 
  FileText,
  Search,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Expense } from '../types';

interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
}

export default function Expenses({
  expenses,
  onAddExpense
}: ExpensesProps) {
  // Expense fields
  const [category, setCategory] = useState('بوفيه');
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [employee, setEmployee] = useState('عمر');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Categories
  const expenseCategories = ['بوفيه', 'إيجار', 'كهرباء', 'رواتب', 'إنترنت واتصالات', 'مطبوعات وأوراق', 'صيانة عامة للمحل', 'دعاية وتسويق', 'أخرى'];

  // Handle Submit Expense
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !reason) {
      alert('خطأ: الرجاء تحديد قيمة المصروف والسبب بالتفصيل!');
      return;
    }

    const nextId = `EXP-${Date.now()}`;
    const log: Expense = {
      id: nextId,
      date: new Date().toISOString().slice(0, 10),
      category,
      amount: Number(amount),
      reason,
      employee
    };

    onAddExpense(log);

    // Reset fields
    setAmount('');
    setReason('');
    alert('تم تسجيل مصروفات التشغيل بنجاح وخصمها من خزينة الكاش تلقائياً!');
  };

  // Calculations
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const count = expenses.length;

    // Category summaries
    const categoryTotals: { [key: string]: number } = {};
    expenseCategories.forEach(cat => { categoryTotals[cat] = 0; });
    expenses.forEach(e => {
      const cat = categoryTotals[e.category] !== undefined ? e.category : 'أخرى';
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += e.amount;
    });

    return { totalAmount, count, categoryTotals };
  }, [expenses]);

  // Filter list
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employee.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="expenses-layout">
      
      {/* 1. Left Column: Record new expense (Span 4) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs h-fit" id="expense-form-panel">
        <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base pb-3 border-b border-slate-100">
          <TrendingDown className="text-rose-500 w-5 h-5" />
          تسجيل مصروفات تشغيل جديدة
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Category selection */}
          <div className="space-y-1">
            <label htmlFor="expense-category-select" className="text-xs font-bold text-slate-500 block">فئة وتصنيف المصروف *</label>
            <select 
              id="expense-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
            >
              {expenseCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label htmlFor="expense-amount-input" className="text-xs font-bold text-slate-500 block">القيمة المالية المصروفة *</label>
            <div className="relative">
              <input 
                id="expense-amount-input"
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
            <label htmlFor="expense-reason-input" className="text-xs font-bold text-slate-500 block">البيان والسبب بالتفصيل *</label>
            <textarea 
              id="expense-reason-input"
              rows={3}
              required
              placeholder="مثال: فاتورة كهرباء المحل لشهر يونيو، أو مستلزمات بوفيه شاي وسكر..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
            />
          </div>

          {/* Employee selection */}
          <div className="space-y-1">
            <label htmlFor="expense-employee-select" className="text-xs font-bold text-slate-500 block">الموظف المصرف للعهدة</label>
            <select 
              id="expense-employee-select"
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
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold p-3 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            id="save-expense-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            حفظ وتسجيل المصروف النقدي
          </button>
        </form>
      </div>

      {/* 2. Right Column: Expenses summaries & logs tables (Span 8) */}
      <div className="lg:col-span-8 space-y-6" id="expenses-history-panel">
        
        {/* Summary metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="expenses-stats-grid">
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">إجمالي فواتير ومصروفات المحل</span>
            <span className="text-xl font-bold text-rose-600 block mt-2 font-mono">-{stats.totalAmount.toLocaleString('ar-EG')} ج.م.</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <span className="text-xs text-slate-400 block font-semibold">عدد البنود المصروفة</span>
            <span className="text-xl font-bold text-slate-700 block mt-2 font-mono">{stats.count} مصروفات</span>
          </div>
        </div>

        {/* Categories breakdown list */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">توزيع المصروفات حسب الفئة التشغيلية</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(stats.categoryTotals).map((cat, idx) => {
              const val = stats.categoryTotals[cat];
              if (val === 0) return null; // Only show spent categories
              return (
                <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                  <span className="text-slate-400 font-semibold block">{cat}</span>
                  <span className="text-sm font-extrabold text-slate-700 block font-mono mt-1">{val.toLocaleString('ar-EG')} ج.م.</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Logs Table */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-slate-400" />
              سجل تفصيل المصروفات العمومية والإدارية
            </h3>
            
            {/* Table Search */}
            <div className="relative">
              <Search className="absolute right-2.5 top-1.5 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="البحث بالسبب أو التصنيف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-[10px] pr-7 pl-2 py-1 border border-slate-200 rounded bg-slate-50"
              />
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200/60 rounded-lg text-xs" id="expenses-main-table-container">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-right divide-y divide-slate-100" id="expenses-main-table">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th scope="col" className="p-3">المعرف</th>
                    <th scope="col" className="p-3">تاريخ المصروف</th>
                    <th scope="col" className="p-3">الفئة والتصنيف</th>
                    <th scope="col" className="p-3">البيان المفصل Statement</th>
                    <th scope="col" className="p-3 text-left">المبلغ المنصرف</th>
                    <th scope="col" className="p-3">المسؤول</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">لا توجد حركات مصروفات عمومية مسجلة.</td>
                    </tr>
                  ) : (
                    [...filteredExpenses].reverse().map((exp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-400">{exp.id}</td>
                        <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-600 max-w-[250px] truncate" title={exp.reason}>
                          {exp.reason}
                        </td>
                        <td className="p-3 text-left font-mono font-bold text-rose-600">
                          -{exp.amount.toLocaleString('ar-EG')} ج.م.
                        </td>
                        <td className="p-3 text-slate-500 font-semibold">{exp.employee}</td>
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
