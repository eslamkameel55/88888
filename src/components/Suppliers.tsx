/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  DollarSign, 
  FileText, 
  Phone, 
  MapPin, 
  CreditCard,
  Briefcase
} from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onRecordSupplierPayment: (supplierId: string, amount: number, notes: string) => void;
}

export default function Suppliers({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onRecordSupplierPayment
}: SuppliersProps) {
  // Supplier States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Payment Form States
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.phone.includes(searchQuery)
    );
  }, [suppliers, searchQuery]);

  // Save Supplier
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newSupp: Supplier = {
      id: `supp-${Date.now()}`,
      name: newName,
      phone: newPhone,
      address: newAddress,
      totalBalance: 0,
      totalPaid: 0,
      totalRemaining: 0
    };

    onAddSupplier(newSupp);
    setShowAddModal(false);

    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  // Record manual payout to Supplier
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentAmount || Number(paymentAmount) <= 0) return;

    const payVal = Number(paymentAmount);
    if (payVal > selectedSupplier.totalRemaining) {
      if (!window.confirm('ملاحظة: المبلغ المدفوع يتجاوز الرصيد المستحق للمورد! هل تريد المتابعة؟')) return;
    }

    onRecordSupplierPayment(selectedSupplier.id, payVal, paymentNotes || 'سداد دفعة نقدية من الحساب الجاري');
    setPaymentAmount('');
    setPaymentNotes('');
    alert('تم تسجيل عملية سداد الدفعة بنجاح وخصمها من خزينة الكاش!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="suppliers-layout-section">
      
      {/* 1. Left Grid panel: Suppliers list (Span 7) */}
      <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col gap-4" id="suppliers-list-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
            <Truck className="text-blue-500 w-5 h-5" />
            سجل الموردين والحسابات الدائنة
          </h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all"
            id="register-new-supplier-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة مورد جديد
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute right-3 top-2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="البحث باسم المورد أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-lg"
            id="suppliers-search-bar"
          />
        </div>

        {/* Suppliers Table */}
        <div className="border border-slate-200/60 rounded-xl overflow-hidden text-xs" id="suppliers-grid-table">
          <div className="overflow-x-auto">
            <table className="w-full text-right divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 font-bold">
                <tr>
                  <th scope="col" className="p-3">اسم المورد Wholesaler</th>
                  <th scope="col" className="p-3">رقم الهاتف</th>
                  <th scope="col" className="p-3 text-left">إجمالي المشتريات منه</th>
                  <th scope="col" className="p-3 text-left">إجمالي المدفوع له</th>
                  <th scope="col" className="p-3 text-left">المستحق له (متبقي)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">لا يوجد موردين مطابقين للبحث.</td>
                  </tr>
                ) : (
                  filteredSuppliers.map((s, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedSupplierId(s.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedSupplierId === s.id ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="p-3 font-bold text-slate-800">{s.name}</td>
                      <td className="p-3 font-mono text-slate-500">{s.phone || '-'}</td>
                      <td className="p-3 text-left font-mono font-semibold">{s.totalBalance.toLocaleString('ar-EG')} ج.م.</td>
                      <td className="p-3 text-left font-mono text-emerald-600">{s.totalPaid.toLocaleString('ar-EG')} ج.م.</td>
                      <td className="p-3 text-left">
                        <span className={`font-mono font-bold ${s.totalRemaining > 0 ? 'text-amber-600 underline' : 'text-slate-500'}`}>
                          {s.totalRemaining.toLocaleString('ar-EG')} ج.م.
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

      {/* 2. Right Detail panel: Supplier detailed ledger (Span 5) */}
      <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-100 shadow-xs" id="supplier-drilldown-panel">
        {selectedSupplier ? (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Supplier Identity Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/40 relative">
              <h3 className="font-extrabold text-slate-800 text-lg mb-2">{selectedSupplier.name}</h3>
              
              <div className="space-y-1.5 text-xs text-slate-600">
                {selectedSupplier.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedSupplier.phone}</span>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedSupplier.address}</span>
                  </div>
                )}
              </div>

              {/* Outstanding debt highlighting */}
              {selectedSupplier.totalRemaining > 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-amber-800 text-xs">
                  <span>مستحق للمورد بذمتنا: </span>
                  <span className="font-bold underline font-mono">{selectedSupplier.totalRemaining} ج.م.</span>
                </div>
              )}
            </div>

            {/* Quick manual payout form */}
            {selectedSupplier.totalRemaining > 0 && (
              <form onSubmit={handlePaymentSubmit} className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-3.5 rounded-xl border border-blue-100/60 space-y-3">
                <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  تسجيل سداد دفعة مالية للمورد (صرف نقدي)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      placeholder="قيمة الدفعة المصروفة..."
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value) || '')}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="بيان وملاحظة الصرف..."
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  حفظ الدفعة وتسجيل خروج الكاش من الدرج
                </button>
              </form>
            )}

            {/* Supplier statement status */}
            <div className="bg-slate-50 p-4 rounded-xl text-center space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">الحالة الحسابية الإجمالية للمورد</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">الفواتير</span>
                  <span className="font-bold text-slate-800">{selectedSupplier.totalBalance} ج.م.</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">المسدد</span>
                  <span className="font-bold text-emerald-600">{selectedSupplier.totalPaid} ج.م.</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">المديونية</span>
                  <span className="font-bold text-rose-600">{selectedSupplier.totalRemaining} ج.م.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-24 italic">
            <Truck className="w-14 h-14 text-slate-200 stroke-1 mb-2 animate-pulse" />
            <span>الرجاء اختيار مورد من القائمة لعرض كشف حسابه وتسجيل دفعات السداد النقدية له.</span>
          </div>
        )}
      </div>

      {/* 3. Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-supplier-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">تسجيل مورد بضاعة جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-5 space-y-4">
              <div className="space-y-1">
                <label htmlFor="supplier-name-input" className="text-xs font-bold text-slate-500 block">اسم المورد / الشركة *</label>
                <input 
                  id="supplier-name-input"
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: الشروق لتجارة وتوزيع المحمول"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="supplier-phone-input" className="text-xs font-bold text-slate-500 block">رقم الهاتف للتواصل</label>
                <input 
                  id="supplier-phone-input"
                  type="text" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="مثال: 01100998877"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="supplier-address-input" className="text-xs font-bold text-slate-500 block">العنوان والمقر الرئيسي</label>
                <input 
                  id="supplier-address-input"
                  type="text" 
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="مثال: شارع عبد العزيز - القاهرة"
                  className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all">حفظ المورد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
