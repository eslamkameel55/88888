/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Smartphone, 
  User, 
  DollarSign, 
  Activity,
  UserCheck
} from 'lucide-react';
import { MaintenanceTicket, MaintenanceStatus } from '../types';

interface MaintenanceProps {
  maintenance: MaintenanceTicket[];
  onAddTicket: (ticket: MaintenanceTicket) => void;
  onUpdateTicket: (ticket: MaintenanceTicket) => void;
  onPrintIntakeReceipt: (ticket: MaintenanceTicket) => void;
  onPrintDeliveryReceipt: (ticket: MaintenanceTicket) => void;
}

export default function Maintenance({
  maintenance,
  onAddTicket,
  onUpdateTicket,
  onPrintIntakeReceipt,
  onPrintDeliveryReceipt
}: MaintenanceProps) {
  // Workshop UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');

  // Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceType, setDeviceType] = useState('سامسونج');
  const [deviceModel, setDeviceModel] = useState('');
  const [imei, setImei] = useState('');
  const [issue, setIssue] = useState('');
  const [technician, setTechnician] = useState('م/ أحمد صبري');
  const [sparePartsCost, setSparePartsCost] = useState<number | ''>('');
  const [laborCost, setLaborCost] = useState<number | ''>('');
  const [paid, setPaid] = useState<number | ''>('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Status Styles mapping
  const statusColors: { [key in MaintenanceStatus]: string } = {
    'جديد': 'bg-blue-50 text-blue-700 border-blue-100',
    'جاري الإصلاح': 'bg-amber-50 text-amber-700 border-amber-100',
    'جاهز': 'bg-violet-50 text-violet-700 border-violet-100',
    'تم التسليم': 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };

  // Delayed devices list helper (موعد تسليمها مضى وما زالت غير مسلمة)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  
  const delayedTicketsCount = useMemo(() => {
    return maintenance.filter(m => {
      if (m.status === 'تم التسليم') return false;
      return m.deliveryDate < todayStr;
    }).length;
  }, [maintenance, todayStr]);

  // Filtered maintenance list
  const filteredTickets = useMemo(() => {
    return maintenance.filter(m => {
      const matchQuery = m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.customerPhone.includes(searchQuery) ||
                         m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (m.imei && m.imei.includes(searchQuery));
      
      const matchStatus = statusFilter === 'الكل' || m.status === statusFilter;
      const matchDelayed = statusFilter === 'متأخر' ? (m.status !== 'تم التسليم' && m.deliveryDate < todayStr) : true;

      return matchQuery && matchStatus && matchDelayed;
    });
  }, [maintenance, searchQuery, statusFilter, todayStr]);

  // Save new repair ticket
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !deviceModel || !issue) {
      alert('خطأ: الرجاء إدخال اسم العميل وموديل الجهاز ووصف العطل!');
      return;
    }

    const nextId = `MNT-${1001 + maintenance.length}`;
    const partsVal = Number(sparePartsCost) || 0;
    const laborVal = Number(laborCost) || 0;
    const totalVal = partsVal + laborVal;
    const paidVal = Number(paid) || 0;
    const remainingVal = Math.max(0, totalVal - paidVal);

    const newTicket: MaintenanceTicket = {
      id: nextId,
      date: new Date().toISOString().slice(0, 10),
      customerName,
      customerPhone,
      deviceType,
      deviceModel,
      imei,
      issue,
      technician,
      sparePartsCost: partsVal,
      laborCost: laborVal,
      totalCost: totalVal,
      paid: paidVal,
      remaining: remainingVal,
      deliveryDate: deliveryDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Default 24h
      status: 'جديد',
      notes
    };

    onAddTicket(newTicket);
    setShowAddModal(false);

    // Reset fields
    setCustomerName('');
    setCustomerPhone('');
    setDeviceType('سامسونج');
    setDeviceModel('');
    setImei('');
    setIssue('');
    setSparePartsCost('');
    setLaborCost('');
    setPaid('');
    setDeliveryDate('');
    setNotes('');

    alert(`تم تسجيل جهاز صيانة بنجاح تحت رقم: ${nextId}. يمكنك الآن طباعة إيصال الاستلام.`);
  };

  // Status transitions
  const handleStatusChange = (ticket: MaintenanceTicket, newStatus: MaintenanceStatus) => {
    let updatedPaid = ticket.paid;
    let updatedRemaining = ticket.remaining;

    // If device is being delivered, settle outstanding payment automatically
    if (newStatus === 'تم التسليم' && ticket.remaining > 0) {
      const settle = window.confirm(`هذا الجهاز عليه مبلغ متبقي قيمته ${ticket.remaining} ج.م.\nهل تم تحصيل المبلغ المتبقي بالكامل من العميل لتسليم الجهاز؟`);
      if (settle) {
        updatedPaid = ticket.totalCost;
        updatedRemaining = 0;
      }
    }

    const updated: MaintenanceTicket = {
      ...ticket,
      status: newStatus,
      paid: updatedPaid,
      remaining: updatedRemaining
    };

    onUpdateTicket(updated);
  };

  return (
    <div className="space-y-6" id="maintenance-view">
      
      {/* 1. Header & Quick Status Alerts banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">قسم الصيانة والأعطال</h1>
            <p className="text-xs text-slate-500 mt-0.5">استلام الأجهزة، توزيع المهام، ومتابعة حالات الإصلاح والتسليمات للعملاء</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {delayedTicketsCount > 0 && (
            <div className="bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>يوجد ({delayedTicketsCount}) أجهزة صيانة متأخرة!</span>
            </div>
          )}
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs cursor-pointer transition-all shadow-xs"
            id="open-repair-ticket-btn"
          >
            <Plus className="w-4 h-4" />
            استلام جهاز صيانة جديد
          </button>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search & Fast Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          {/* Main search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-2.5 text-slate-400 w-4.5 h-4.5" />
            <input 
              type="text" 
              placeholder="البحث برقم الاستلام، اسم العميل، الهاتف، موديل الهاتف، أو الرقم التسلسلي IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-lg"
              id="maintenance-search-input"
            />
          </div>

          {/* Technicians select filter (optional filter, simple input) */}
          <select 
            aria-label="الفني المسؤول"
            className="text-xs p-2 border border-slate-200 bg-white rounded-lg text-slate-600 font-medium w-full md:w-48"
          >
            <option value="الكل">كل الفنيين</option>
            <option value="م/ أحمد صبري">م/ أحمد صبري</option>
            <option value="م/ خالد حسن">م/ خالد حسن</option>
          </select>
        </div>

        {/* Horizontal Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-50 pt-2" id="maintenance-filters-row">
          {[
            { value: 'الكل', label: '📱 جميع الحالات الجارية' },
            { value: 'جديد', label: '🔵 أجهزة جديدة' },
            { value: 'جاري الإصلاح', label: '🟡 جاري العمل عليها' },
            { value: 'جاهز', label: '🟣 جاهزة للاستلام' },
            { value: 'تم التسليم', label: '🟢 تم تسليمها وإغلاقها' },
            { value: 'متأخر', label: '🔴 أجهزة متأخرة تجاوزت الموعد' }
          ].map((tab, i) => (
            <button
              key={i}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value 
                  ? 'bg-slate-800 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Maintenance Cases Grid Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden" id="maintenance-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right divide-y divide-slate-100" id="maintenance-main-table">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
              <tr>
                <th scope="col" className="p-3">رقم التذكرة والجهاز</th>
                <th scope="col" className="p-3">العميل والتليفون</th>
                <th scope="col" className="p-3">الفني المسؤول</th>
                <th scope="col" className="p-3">العطل المشخص</th>
                <th scope="col" className="p-3 text-left">التكلفة (المتبقي)</th>
                <th scope="col" className="p-3 text-center">التسليم المتوقع</th>
                <th scope="col" className="p-3 text-center">تحديث حالة الإصلاح</th>
                <th scope="col" className="p-3 text-center">إيصالات الطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 italic">لا توجد حالات صيانة مسجلة تطابق فلترة البحث الحالية.</td>
                </tr>
              ) : (
                filteredTickets.map((ticket, idx) => {
                  const isLate = ticket.status !== 'تم التسليم' && ticket.deliveryDate < todayStr;
                  
                  return (
                    <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isLate ? 'bg-rose-50/20' : ''}`}>
                      {/* Ticket # / Device details */}
                      <td className="p-3">
                        <div className="font-mono font-extrabold text-blue-600 text-sm">{ticket.id}</div>
                        <div className="flex items-center gap-1 font-bold text-slate-800 mt-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ticket.deviceType} {ticket.deviceModel}</span>
                        </div>
                        {ticket.imei && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">IMEI: {ticket.imei}</div>
                        )}
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{ticket.customerName}</div>
                        <div className="font-mono text-slate-500 text-xs mt-1">{ticket.customerPhone || '-'}</div>
                      </td>

                      {/* Technician */}
                      <td className="p-3 text-xs font-semibold text-slate-600 flex items-center gap-1 mt-3">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.technician}
                      </td>

                      {/* Issue description */}
                      <td className="p-3 max-w-[200px]">
                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-semibold">{ticket.issue}</p>
                      </td>

                      {/* Costs / Unpaid Balance */}
                      <td className="p-3 text-left">
                        <div className="font-mono font-bold text-slate-800">{ticket.totalCost} ج.م.</div>
                        {ticket.remaining > 0 ? (
                          <div className="text-[10px] text-rose-500 font-bold mt-1">المتبقي: -{ticket.remaining} ج.م.</div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-medium mt-1">مسدد بالكامل</div>
                        )}
                      </td>

                      {/* Expected Pickup Date */}
                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-xs font-mono font-bold ${isLate ? 'text-rose-600 underline' : 'text-slate-700'}`}>
                            {ticket.deliveryDate}
                          </span>
                          {isLate && (
                            <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1 py-0.5 rounded mt-1 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              متأخر!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status timeline select progression */}
                      <td className="p-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          {/* Colored state pill */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[ticket.status]}`}>
                            {ticket.status}
                          </span>

                          {/* Quick Shift actions */}
                          {ticket.status !== 'تم التسليم' && (
                            <div className="flex items-center gap-1">
                              {ticket.status === 'جديد' && (
                                <button 
                                  onClick={() => handleStatusChange(ticket, 'جاري الإصلاح')}
                                  className="text-[9px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  بدء العمل
                                </button>
                              )}
                              {ticket.status === 'جاري الإصلاح' && (
                                <button 
                                  onClick={() => handleStatusChange(ticket, 'جاهز')}
                                  className="text-[9px] bg-violet-600 hover:bg-violet-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  جاهز للتسليم
                                </button>
                              )}
                              {ticket.status === 'جاهز' && (
                                <button 
                                  onClick={() => handleStatusChange(ticket, 'تم التسليم')}
                                  className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  تسليم للعميل
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Print Intakes & Deliveries Receipt buttons */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => onPrintIntakeReceipt(ticket)}
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 p-1.5 rounded text-xs font-bold transition-all flex items-center gap-0.5 border border-slate-200/50 cursor-pointer"
                            title="طباعة إيصال استلام جهاز"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            استلام
                          </button>
                          <button 
                            onClick={() => onPrintDeliveryReceipt(ticket)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 p-1.5 rounded text-xs font-bold transition-all flex items-center gap-0.5 border border-blue-100/50 cursor-pointer"
                            title="طباعة إيصال تسليم وضمان"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            تسليم
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Intake Repair Ticket Receipt Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="intake-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">استلام جهاز صيانة جديد للورشة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddTicket} className="p-5 space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              
              {/* Customer Info Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="customer-name-input" className="text-xs font-bold text-slate-500 block">اسم العميل *</label>
                  <input 
                    id="customer-name-input"
                    type="text" 
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="محمد السيد علي"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="customer-phone-input" className="text-xs font-bold text-slate-500 block">رقم هاتف العميل للتواصل *</label>
                  <input 
                    id="customer-phone-input"
                    type="text" 
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01011223344"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Device Details Section */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="device-type-select" className="text-xs font-bold text-slate-500 block">العلامة التجارية</label>
                  <select 
                    id="device-type-select"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
                  >
                    <option value="سامسونج">سامسونج</option>
                    <option value="آيفون">آيفون</option>
                    <option value="شاومي">شاومي</option>
                    <option value="أوبو">أوبو</option>
                    <option value="ريلمي">ريلمي</option>
                    <option value="إنفينكس">إنفينكس</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="device-model-input" className="text-xs font-bold text-slate-500 block">الموديل بدقة *</label>
                  <input 
                    id="device-model-input"
                    type="text" 
                    required
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="مثال: Galaxy A52"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="imei-input" className="text-xs font-bold text-slate-500 block">الرقم التسلسلي / IMEI</label>
                  <input 
                    id="imei-input"
                    type="text" 
                    value={imei}
                    onChange={(e) => setImei(e.target.value)}
                    placeholder="15 رقم"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              {/* Technical Diagnoses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="issue-input" className="text-xs font-bold text-slate-500 block">وصف العطل المشخص بدقة *</label>
                  <input 
                    id="issue-input"
                    type="text" 
                    required
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    placeholder="مثال: تغيير شاشة مكسورة وسوكت شحن"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="technician-select" className="text-xs font-bold text-slate-500 block">الفني الموزع له العطل</label>
                  <select 
                    id="technician-select"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-white rounded-lg font-medium text-slate-700"
                  >
                    <option value="م/ أحمد صبري">م/ أحمد صبري (مستوى متقدم هاردوير)</option>
                    <option value="م/ خالد حسن">م/ خالد حسن (سوفت وير وشاشات)</option>
                    <option value="مساعد ورشة">مساعد ورشة (صيانة خفيفة)</option>
                  </select>
                </div>
              </div>

              {/* Estimation of Financials */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="parts-cost-input" className="text-xs font-bold text-slate-500 block">تكلفة قطع الغيار</label>
                  <input 
                    id="parts-cost-input"
                    type="number" 
                    value={sparePartsCost}
                    onChange={(e) => setSparePartsCost(Number(e.target.value) || '')}
                    placeholder="0"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="labor-cost-input" className="text-xs font-bold text-slate-500 block">تكلفة الصيانة (المصنعية)</label>
                  <input 
                    id="labor-cost-input"
                    type="number" 
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value) || '')}
                    placeholder="0"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="downpayment-input" className="text-xs font-bold text-slate-500 block">المدفوع مقدماً (عربون)</label>
                  <input 
                    id="downpayment-input"
                    type="number" 
                    value={paid}
                    onChange={(e) => setPaid(Number(e.target.value) || '')}
                    placeholder="0"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              {/* Delivery Date & Technical Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="delivery-date-input" className="text-xs font-bold text-slate-500 block">موعد التسليم المتوقع *</label>
                  <input 
                    id="delivery-date-input"
                    type="date" 
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg font-mono text-left"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="technical-notes-input" className="text-xs font-bold text-slate-500 block">ملاحظات فنية أو حالة الجهاز الخارجية</label>
                  <input 
                    id="technical-notes-input"
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مثال: يوجد خدوش خفيفة بالظهر مع كسر حماية الشاشة"
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50/50 rounded-lg"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all">إدراج حالة الصيانة وطباعة إيصال استلام</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
