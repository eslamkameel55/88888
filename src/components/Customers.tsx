/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  DollarSign, 
  FileText, 
  Phone, 
  MapPin, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Notebook
} from 'lucide-react';
import { Customer, Invoice, MaintenanceTicket, CashLog } from '../types';

interface CustomersProps {
  customers: Customer[];
  invoices: Invoice[];
  maintenance: MaintenanceTicket[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onRecordCustomerPayment: (customerId: string, amount: number, notes: string) => void;
}

export default function Customers({
  customers,
  invoices,
  maintenance,
  onAddCustomer,
  onUpdateCustomer,
  onRecordCustomerPayment
}: CustomersProps) {
  // CRM States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Payment State
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Selected Customer detail
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Combined Account Ledger for Selected Customer
  // Shows Invoices, Maintenance cases, and custom manual payment transactions
  const customerLedger = useMemo(() => {
    if (!selectedCustomer) return [];

    const ledger: any[] = [];

    // 1. Invoices
    invoices
      .filter(inv => inv.customerName === selectedCustomer.name || (selectedCustomer.phone && inv.customerPhone === selectedCustomer.phone))
      .forEach(inv => {
        ledger.push({
          id: inv.id,
          date: inv.date,
          type: 'فاتورة مبيعات',
          amount: inv.grandTotal,
          paid: inv.grandTotal, // Invoiced items are usually paid on cashier POS
          remaining: 0,
          description: `شراء أصناف: ${inv.items.map(i => i.name).join('، ')}`
        });
      });

    // 2. Maintenance Tickets
    maintenance
      .filter(m => m.customerName === selectedCustomer.name || (selectedCustomer.phone && m.customerPhone === selectedCustomer.phone))
      .forEach(m => {
        ledger.push({
          id: m.id,
          date: m.date,
          type: 'صيانة جهاز',
          amount: m.totalCost,
          paid: m.paid,
          remaining: m.remaining,
          description: `إصلاح جهاز ${m.deviceType} ${m.deviceModel} - عطل (${m.issue})`
        });
      });

    // Sort by Date descending
    return ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCustomer, invoices, maintenance]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  // Handle Save New Customer
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    // Check if phone duplicate
    if (newPhone && customers.some(c => c.phone === newPhone)) {
      alert('تنبيه: يوجد عميل مسجل بالفعل بهذا الرقم!');
      return;
    }

    const nextCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newName,
      phone: newPhone,
      address: newAddress,
      notes: newNotes,
      totalPurchases: 0,
      totalPaid: 0,
      totalRemaining: 0
    };

    onAddCustomer(nextCust);
    setShowAddModal(false);
    
    // Clear inputs
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');
  };

  // Record direct manual installment payment from debtor
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentAmount || Number(paymentAmount) <= 0) return;

    const payVal = Number(paymentAmount);
    if (payVal > selectedCustomer.totalRemaining) {
      if (!window.confirm('ملاحظة: المبلغ المدفوع يتجاوز المديونية المتبقية للعميل! هل تريد المتابعة؟')) return;
    }

    onRecordCustomerPayment(selectedCustomer.id, payVal, paymentNotes || 'دفعة نقدية مسددة من الحساب');
    setPaymentAmount('');
    setPaymentNotes('');
    alert('تم تسجيل الدفعة بنجاح وتحديث خزانة الكاش!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="customers-layout-section">
      
      {/* 1. Left Grid panel: Customer list (Span 7) */}
      <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-4" id="customers-list-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
            <Users className="text-blue-500 w-5 h-5" />
            سجل العملاء وإدارة المديونيات
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
            id="register-new-customer-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            تسجيل عميل جديد
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute right-3 top-2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-lg"
            id="crm-search-bar"
          />
        </div>

        {/* Customers Table */}
        <div className="border border-slate-200/60 rounded-xl overflow-hidden text-xs" id="customers-grid-table">
          <div className="overflow-x-auto">
            <table className="w-full text-right divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-bold">
                <tr>
                  <th scope="col" className="p-3">اسم العميل</th>
                  <th scope="col" className="p-3">الهاتف</th>
                  <th scope="col" className="p-3 text-left">إجمالي المبيعات</th>
                  <th scope="col" className="p-3 text-left">المدفوع</th>
                  <th scope="col" className="p-3 text-left">المتبقي (دين)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">لا يوجد عملاء مطابقين للبحث.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((c, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedCustomerId === c.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="p-3 font-bold text-slate-800">{c.name}</td>
                      <td className="p-3 font-mono text-slate-500">{c.phone || '-'}</td>
                      <td className="p-3 text-left font-mono font-semibold">{c.totalPurchases.toLocaleString('ar-EG')} ج.م.</td>
                      <td className="p-3 text-left font-mono text-emerald-600">{c.totalPaid.toLocaleString('ar-EG')} ج.m.</td>
                      <td className="p-3 text-left">
                        <span className={`font-mono font-bold ${c.totalRemaining > 0 ? 'text-rose-600 underline' : 'text-slate-500'}`}>
                          {c.totalRemaining.toLocaleString('ar-EG')} ج.م.
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Right Detail panel: Customer account details & kashf hisab (Span 5) */}
      <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-100 shadow-xs" id="customer-drilldown-panel">
        {selectedCustomer ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Customer identity card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 relative overflow-hidden">
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">{selectedCustomer.name}</h3>
              
              <div className="space-y-1.5 text-xs text-slate-600">
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                )}
                {selectedCustomer.notes && (
                  <div className="flex items-center gap-1.5">
                    <Notebook className="w-3.5 h-3.5 text-slate-400" />
                    <span className="italic">ملاحظة: {selectedCustomer.notes}</span>
                  </div>
                )}
              </div>

              {/* Debt highlight banner */}
              {selectedCustomer.totalRemaining > 0 && (
                <div className="mt-4 bg-rose-50 border border-rose-100 p-2.5 rounded-lg flex items-center gap-2 text-rose-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span>تنبيه: العميل مدين بمبلغ </span>
                    <span className="font-bold underline font-mono">{selectedCustomer.totalRemaining} ج.م.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick action: Record installment payment form */}
            {selectedCustomer.totalRemaining > 0 && (
              <form onSubmit={handlePaymentSubmit} className="bg-gradient-to-r from-emerald-50 to-teal-50/50 p-3.5 rounded-xl border border-emerald-100/60 space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  تسجيل سداد دفعة نقدية من الحساب
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      placeholder="قيمة المبلغ المسدد..."
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value) || '')}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="ملاحظة السداد..."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  حفظ الدفعة وتغذية خزينة النقدية
                </button>
              </form>
            )}

            {/* Account Ledger Statement (كشف الحساب) */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <FileText className="w-4 h-4 text-slate-400" />
                كشف حساب العمليات والصيانة الأخير
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white text-xs max-h-64 overflow-y-auto no-scrollbar">
                {customerLedger.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 italic">لا توجد عمليات بيع أو صيانة سابقة مسجلة.</div>
                ) : (
                  customerLedger.map((item, i) => (
                    <div key={i} className="p-3 space-y-2 hover:bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className="font-semibold text-slate-500 text-[10px]">{item.type}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[10px]">{item.date}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-medium leading-relaxed">{item.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50/70 p-1.5 rounded font-mono">
                        <div>
                          <span className="text-slate-400 block">الإجمالي</span>
                          <span className="font-bold text-slate-700">{item.amount} ج.م.</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">المسدد</span>
                          <span className="font-bold text-emerald-600">{item.paid} ج.م.</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">المتبقي</span>
                          <span className={`font-bold ${item.remaining > 0 ? 'text-rose-600 underline' : 'text-slate-500'}`}>{item.remaining} ج.م.</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-24 italic">
            <Users className="w-14 h-14 text-slate-200 stroke-1 mb-2 animate-bounce" />
            <span>الرجاء تحديد عميل من الجدول لفتح الملف التعريفي وكشف الحساب والمديونية.</span>
          </div>
        )}
      </div>

      {/* 3. Add Customer Modal Panel */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-customer-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">تسجيل عميل جديد بالسيستم</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-5 space-y-4">
              <div className="space-y-1">
                <label htmlFor="customer-name-input" className="text-xs font-bold text-slate-500 block">الاسم الثلاثي للعميل *</label>
                <input 
                  id="customer-name-input"
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: محمد أحمد متولي"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="customer-phone-input" className="text-xs font-bold text-slate-500 block">رقم الهاتف (المحمول)</label>
                <input 
                  id="customer-phone-input"
                  type="text" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="مثال: 01012345678"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="customer-address-input" className="text-xs font-bold text-slate-500 block">العنوان بالتفصيل</label>
                <input 
                  id="customer-address-input"
                  type="text" 
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="مثال: شارع الجلاء - المنصورة"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="customer-notes-input" className="text-xs font-bold text-slate-500 block">ملاحظات على العميل</label>
                <textarea 
                  id="customer-notes-input"
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="أي تفاصيل أخرى مثل تفضيلات الشراء..."
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all">حفظ العميل</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
